#!/usr/bin/env python3
"""Analyse des prises de voix : transcription mot à mot (faster-whisper, en local),
exactitude par rapport au texte, débit, pauses, puis horodatage de chaque phrase du texte.

Usage : python3 audio/analyser_voix.py audio/voix/prise1.mp3 [audio/voix/prise2.mp3 ...]
Sortie : un fichier JSON par prise (même nom, extension .json) et un résumé à l'écran.
La prise retenue sert ensuite à caler l'image : src/nova/minutage.json (voir caler.py)."""
import difflib
import json
import re
import subprocess
import sys
import unicodedata
from pathlib import Path

from faster_whisper import WhisperModel

ICI = Path(__file__).resolve().parent
TEXTE = (ICI / "texte_voix.txt").read_text(encoding="utf-8")
# Une ligne du fichier = une phrase (un plan).
PHRASES = [l.strip() for l in TEXTE.splitlines() if l.strip()]

NOMBRES = {"9": "neuf", "3": "trois", "64": "soixante-quatre", "15": "quinze", "22": "vingt-deux", "18": "dix-huit", "5": "cinq", "18000": "dix-huit mille"}


def mots(s):
    s = unicodedata.normalize("NFC", s.lower())
    s = re.sub(r"\b(\d+)\s*h\b", lambda m: NOMBRES.get(m.group(1), m.group(1)) + " heures", s)
    s = re.sub(r"(\d+)\s*000", lambda m: NOMBRES.get(m.group(1), m.group(1)) + " mille", s)
    s = re.sub(r"\d+", lambda m: NOMBRES.get(m.group(0), m.group(0)), s)
    s = s.replace("’", "'").replace("$", " dollars")
    s = re.sub(r"[^a-zàâçéèêëîïôûùüÿœ'\- ]", " ", s)
    return [w for w in re.split(r"[\s\-]+", s) if w]


def duree(f):
    return float(subprocess.check_output(["ffprobe", "-v", "error", "-show_entries", "format=duration", "-of", "csv=p=0", str(f)]).decode())


def analyser(modele, fichier):
    segs, info = modele.transcribe(str(fichier), language="fr", beam_size=5, word_timestamps=True, vad_filter=False)
    segs = list(segs)
    liste = [{"mot": w.word.strip(), "debut": round(w.start, 3), "fin": round(w.end, 3), "p": round(w.probability, 3)} for s in segs for w in s.words]
    # Alignement texte attendu ↔ mots reconnus (mots normalisés, un mot reconnu peut en valoir plusieurs : « 9h »).
    attendu = [(i, m) for i, p in enumerate(PHRASES) for m in mots(p)]
    reconnu = []
    for k, w in enumerate(liste):
        for m in mots(w["mot"]):
            reconnu.append((k, m))
    sm = difflib.SequenceMatcher(None, [m for _, m in attendu], [m for _, m in reconnu], autojunk=False)
    correspondance = {}
    for a, b, n in sm.get_matching_blocks():
        for j in range(n):
            correspondance[a + j] = reconnu[b + j][0]
    phrases = []
    for i, p in enumerate(PHRASES):
        idx = [correspondance[k] for k, (ph, _) in enumerate(attendu) if ph == i and k in correspondance]
        total = sum(1 for ph, _ in attendu if ph == i)
        phrases.append({
            "texte": p,
            "debut": liste[min(idx)]["debut"] if idx else None,
            "fin": liste[max(idx)]["fin"] if idx else None,
            "couverture": round(len(idx) / total, 2) if total else 0,
        })
    exactitude = sm.ratio()
    d = duree(fichier)
    nb = len(attendu)
    pauses = [round(liste[k + 1]["debut"] - liste[k]["fin"], 2) for k in range(len(liste) - 1) if liste[k + 1]["debut"] - liste[k]["fin"] > 0.35]
    res = {
        "fichier": str(fichier), "duree": round(d, 2), "langue": info.language, "exactitude": round(exactitude, 3),
        "mots_par_seconde": round(nb / d, 2), "confiance_moyenne": round(sum(w["p"] for w in liste) / max(1, len(liste)), 3),
        "pauses_longues": pauses, "transcription": " ".join(w["mot"] for w in liste), "phrases": phrases, "mots": liste,
    }
    Path(fichier).with_suffix(".json").write_text(json.dumps(res, ensure_ascii=False, indent=1), encoding="utf-8")
    return res


if __name__ == "__main__":
    modele = WhisperModel("small", device="cpu", compute_type="int8")
    for f in sys.argv[1:]:
        r = analyser(modele, f)
        manquantes = [p["texte"][:40] for p in r["phrases"] if p["couverture"] < 0.6]
        print(f"{Path(f).name}: durée {r['duree']} s, exactitude {r['exactitude']}, confiance {r['confiance_moyenne']}, "
              f"{r['mots_par_seconde']} mots/s, pauses > 0,35 s : {len(r['pauses_longues'])} (max {max(r['pauses_longues'] or [0])} s), "
              f"phrases mal couvertes : {manquantes or 'aucune'}")
        print("   transcription :", r["transcription"])
