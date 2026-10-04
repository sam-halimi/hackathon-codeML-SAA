#!/usr/bin/env python3
"""Cale l'image sur la voix : produit src/nova/minutage.json à partir de l'analyse de la prise retenue.

- Début et fin de chaque phrase (horodatage Whisper), corrigés par la détection de silence de ffmpeg
  (Whisper colle parfois un mot au précédent : on reprend la fin du silence qui précède).
- Instants de quelques mots-clés, pour synchroniser les gestes (clic, coup, apparition) au mot près.
- Décalage de départ (pré-roll) et durées de la fin (tenue du logo, carton de fin).

Usage : python3 audio/caler.py audio/voix/prise1.mp3"""
import json
import re
import subprocess
import sys
import unicodedata
from pathlib import Path

ICI = Path(__file__).resolve().parent
RACINE = ICI.parent
PRE_ROLL = 0.75      # secondes avant le premier mot (l'horloge s'installe)
TENUE_LOGO = 1.3     # secondes de logo après le dernier mot
CARTON = 2.0         # carton de fin animé
FPS = 60

# Mots-clés : (nom, numéro de phrase, mot à trouver dans la phrase, occurrence)
MOTS_CLES = [
    ("mercredi", 0, "mercredi", 1), ("neuf", 0, "9h", 1),
    ("trois_semaines", 1, "semaines", 1), ("trancher", 1, "trancher", 1),
    ("documents", 2, "documents", 1), ("courriels", 2, "courriels", 1), ("comptes_rendus", 2, "compte", 1),
    ("factures", 2, "factures", 1), ("tableaux", 2, "tableaux", 1),
    ("rapport", 3, "rapport", 1), ("vert", 3, "vert", 1),
    ("plan", 4, "plan", 1), ("quinze", 4, "15", 1), ("comite", 4, "comité", 1), ("vingt_deux", 4, "22", 1),
    ("facture", 5, "facture", 1), ("dix_huit", 5, "18", 1), ("personne", 5, "personne", 1),
    ("qui_croire", 6, "qui", 1), ("cinq_minutes", 7, "5", 1),
    ("nova", 8, "nova", 1), ("memoire", 8, "mémoire", 1),
    ("la_date", 9, "date", 1), ("conditions", 9, "conditions", 1), ("bloque", 9, "bloque", 1), ("un_seul_ecran", 9, "seul", 1),
    ("preuve", 10, "preuve", 1), ("clic", 11, "clic", 1), ("passage", 11, "passage", 1),
    ("contradictions", 12, "contradictions", 1), ("responsable", 13, "responsable", 1),
    ("nouvelle", 14, "nouvelle", 1), ("collez", 14, "collez", 1), ("assistant", 14, "assistant", 1),
    ("prepare", 15, "prépare", 1), ("regles", 15, "règles", 1), ("accord", 15, "accord", 1),
    ("proposition", 16, "proposition", 1), ("reste", 16, "reste", 1),
    ("fournisseur", 17, "fournisseur", 1), ("jamais", 17, "jamais", 1),
    ("nova_fin", 18, "nova", 1), ("reprenez", 18, "reprenez", 1), ("cinq_minutes_fin", 18, "5", 1),
]


def norm(s):
    s = unicodedata.normalize("NFD", s.lower())
    s = "".join(c for c in s if unicodedata.category(c) != "Mn")
    return re.sub(r"[^a-z0-9]", "", s.split("'")[-1])  # « l'assistant » → « assistant »


def silences(fichier):
    sortie = subprocess.run(["ffmpeg", "-hide_banner", "-i", str(fichier), "-af", "silencedetect=noise=-40dB:d=0.18", "-f", "null", "-"],
                            capture_output=True, text=True).stderr
    debuts = [float(x) for x in re.findall(r"silence_start: ([\d.]+)", sortie)]
    fins = [float(x) for x in re.findall(r"silence_end: ([\d.]+)", sortie)]
    return list(zip(debuts, fins))


def main(fichier):
    analyse = json.loads(Path(fichier).with_suffix(".json").read_text(encoding="utf-8"))
    sil = silences(fichier)
    mots = analyse["mots"]
    phrases = []
    for i, p in enumerate(analyse["phrases"]):
        debut, fin = p["debut"], p["fin"]
        # Début corrigé : fin d'un silence proche (Whisper peut coller le premier mot au précédent).
        proches = [f for (d, f) in sil if debut - 0.25 <= f <= debut + 1.2]
        if proches and i > 0:
            debut = max(debut, proches[0]) if proches[0] - debut < 1.2 else debut
        phrases.append({"texte": p["texte"], "debut": round(debut + PRE_ROLL, 3), "fin": round(fin + PRE_ROLL, 3)})
    # Mots-clés : recherche dans la fenêtre temporelle de la phrase.
    cles = {}
    for nom, k, mot, occ in MOTS_CLES:
        a = analyse["phrases"][k]["debut"] - 0.3
        b = analyse["phrases"][k]["fin"] + 0.3
        trouves = [w for w in mots if a <= w["debut"] <= b and norm(w["mot"]).startswith(norm(mot))]
        if len(trouves) >= occ:
            w = trouves[occ - 1]
            debut = w["debut"]
            if k > 0 and phrases[k]["debut"] - PRE_ROLL > debut:  # mot collé au silence précédent
                debut = phrases[k]["debut"] - PRE_ROLL
            cles[nom] = round(debut + PRE_ROLL, 3)
        else:
            cles[nom] = phrases[k]["debut"]
            print(f"  ⚠ mot-clé « {mot} » introuvable dans la phrase {k + 1} : début de phrase utilisé")
    duree_voix = analyse["duree"]
    fin_voix = phrases[-1]["fin"]
    debut_carton = round(fin_voix + TENUE_LOGO, 3)
    total = round(debut_carton + CARTON, 3)
    res = {
        "fps": FPS, "pre_roll": PRE_ROLL, "voix": Path(fichier).name, "duree_voix": duree_voix,
        "debut_carton": debut_carton, "duree_totale": total, "images": int(round(total * FPS)),
        "phrases": phrases, "cles": cles,
    }
    sortie = RACINE / "src" / "nova" / "minutage.json"
    sortie.parent.mkdir(parents=True, exist_ok=True)
    sortie.write_text(json.dumps(res, ensure_ascii=False, indent=1), encoding="utf-8")
    print(f"✓ {sortie.relative_to(RACINE)} : {len(phrases)} phrases, {len(cles)} mots-clés, durée totale {total} s ({res['images']} images à {FPS} i/s)")
    for p in phrases:
        print(f"  {p['debut']:6.2f} → {p['fin']:6.2f}  {p['texte']}")


if __name__ == "__main__":
    main(sys.argv[1] if len(sys.argv) > 1 else str(ICI / "voix" / "prise1.mp3"))
