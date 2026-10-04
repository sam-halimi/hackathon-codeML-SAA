#!/usr/bin/env python3
"""Bande son du spot NOVA, entièrement fabriquée par le code (aucun échantillon externe).

- Musique originale : tension en ré mineur (nappe, horloge, piano dissonant, basse pulsée, montée),
  puis solution en ré majeur à 100 battements par minute (nappe chaude, arpèges, basse, pied, charleston),
  résolution finale avec cloche.
- Bruitages synthétisés et calés au mot près : tic-tac, souffles, impacts, papiers, glitch, buzz,
  clics, bulle, carillons, verrou, signatures du logo.
- Voix : la prise retenue, décalée du pré-roll, sans compression ni limiteur.
- Mixage : musique compressée par la voix (sidechain) et au moins 15 dB sous la voix ; mastering
  −14 LUFS intégrés / −1 dBTP avec ffmpeg loudnorm (deux passes, mode linéaire).

Usage : python3 audio/composer.py  →  audio/rendu/{voix,musique,bruitages,mix_master}.wav
Les repères viennent de src/nova/minutage.json (même formules que src/nova/temps.ts)."""
import json
import math
import subprocess
from pathlib import Path

import numpy as np
import pyloudnorm as pyln
from scipy import signal

ICI = Path(__file__).resolve().parent
RACINE = ICI.parent
SORTIE = ICI / "rendu"
SORTIE.mkdir(exist_ok=True)
SR = 48000
M = json.loads((RACINE / "src" / "nova" / "minutage.json").read_text(encoding="utf-8"))
DUREE = M["duree_totale"]
N = int(math.ceil(DUREE * SR))
RNG = np.random.default_rng(360)
P = lambda n: M["phrases"][n]["debut"]
K = lambda nom: M["cles"][nom]
SCENES = {
    "horloge": (0, P(1) - 0.05), "rebours": (P(1) - 0.05, P(2) - 0.2), "avalanche": (P(2) - 0.2, P(3) - 0.25),
    "vert": (P(3) - 0.25, P(4) - 0.08), "dates": (P(4) - 0.08, P(5) - 0.3), "facture": (P(5) - 0.3, P(6) - 0.15),
    "quiCroire": (P(6) - 0.15, P(7) - 0.25), "cinq": (P(7) - 0.25, P(8) - 0.45), "logo": (P(8) - 0.45, P(9) - 0.3),
    "ecran": (P(9) - 0.3, P(10) - 0.25), "preuve": (P(10) - 0.25, P(12) - 0.3), "contradictions": (P(12) - 0.3, P(14) - 0.3),
    "assistant": (P(14) - 0.3, P(16) - 0.35), "gardeFou": (P(16) - 0.35, P(18) - 0.3), "final": (P(18) - 0.3, M["debut_carton"]),
    "carton": (M["debut_carton"], M["duree_totale"]),
}


# ---------------------------------------------------------------------------
# Outils de synthèse
# ---------------------------------------------------------------------------
def tps(d):
    return np.arange(int(d * SR)) / SR


def env_adsr(n, a, d, s, r, sustain_level=0.7):
    """Enveloppe ADSR (secondes) sur n échantillons."""
    e = np.ones(n) * sustain_level
    ia, idd, ir = int(a * SR), int(d * SR), int(r * SR)
    ia = min(ia, n)
    e[:ia] = np.linspace(0, 1, ia, endpoint=False) if ia else e[:ia]
    fin_d = min(n, ia + idd)
    if fin_d > ia:
        e[ia:fin_d] = np.linspace(1, sustain_level, fin_d - ia)
    if ir > 0 and ir < n:
        e[n - ir:] *= np.linspace(1, 0, ir)
    return e


def decroissance(n, tau):
    return np.exp(-np.arange(n) / (tau * SR))


def bruit(n):
    return RNG.standard_normal(n)


def passe_bande(x, f_bas, f_haut, ordre=2):
    f_haut = min(f_haut, SR / 2 * 0.95)
    sos = signal.butter(ordre, [max(20, f_bas), f_haut], btype="band", fs=SR, output="sos")
    return signal.sosfilt(sos, x)


def passe_bas(x, fc, ordre=2):
    sos = signal.butter(ordre, min(fc, SR / 2 * 0.95), btype="low", fs=SR, output="sos")
    return signal.sosfilt(sos, x)


def passe_haut(x, fc, ordre=2):
    sos = signal.butter(ordre, fc, btype="high", fs=SR, output="sos")
    return signal.sosfilt(sos, x)


def balayage_filtre(x, f0, f1, q=1.4, bloc=256, courbe="exp"):
    """Filtre passe-bande dont la fréquence centrale glisse de f0 à f1 (souffles, montées)."""
    y = np.zeros_like(x)
    n = len(x)
    zi = None
    for i in range(0, n, bloc):
        p = i / max(1, n - 1)
        fc = f0 * (f1 / f0) ** p if courbe == "exp" else f0 + (f1 - f0) * p
        fc = min(max(fc, 40), SR / 2 * 0.9)
        b, a = signal.iirpeak(fc, q, fs=SR)
        if zi is None:
            zi = signal.lfilter_zi(b, a) * 0
        y[i:i + bloc], zi = signal.lfilter(b, a, x[i:i + bloc], zi=zi)
    return y


def note_hz(nom):
    noms = {"C": -9, "C#": -8, "Db": -8, "D": -7, "D#": -6, "Eb": -6, "E": -5, "F": -4, "F#": -3, "Gb": -3, "G": -2, "G#": -1, "Ab": -1, "A": 0, "A#": 1, "Bb": 1, "B": 2}
    lettre, octave = (nom[:-1], int(nom[-1]))
    return 440.0 * 2 ** ((noms[lettre] + (octave - 4) * 12) / 12)


def stereo(x, pan=0.0):
    """Panoramique à puissance constante (−1 gauche … +1 droite)."""
    a = (pan + 1) * math.pi / 4
    return np.stack([x * math.cos(a), x * math.sin(a)], axis=1)


def poser(piste, son, t, gain=1.0):
    """Ajoute un son (mono ou stéréo) dans une piste stéréo à l'instant t (secondes)."""
    if son.ndim == 1:
        son = stereo(son)
    i = int(round(t * SR))
    if i >= len(piste):
        return
    if i < 0:
        son = son[-i:]
        i = 0
    fin = min(len(piste), i + len(son))
    piste[i:fin] += son[: fin - i] * gain


def reverb_ir(duree=1.6, decroit=0.45, clair=6000, stereo_ecart=True):
    n = int(duree * SR)
    ir = np.zeros((n, 2))
    for c in range(2):
        b = bruit(n) * np.exp(-np.arange(n) / (decroit * SR))
        b = passe_bas(b, clair)
        ir[:, c] = b
    ir[0] += 0.0
    ir /= np.sqrt((ir ** 2).sum(axis=0, keepdims=True))
    return ir


IR_SALLE = reverb_ir(1.8, 0.5, 7000)
IR_COURTE = reverb_ir(0.6, 0.12, 9000)


def reverbe(st, ir, humide=0.25):
    sortie = np.zeros((len(st) + len(ir) - 1, 2))
    for c in range(2):
        sortie[:, c] = signal.fftconvolve(st[:, c], ir[:, c])
    sortie = sortie[: len(st)]
    return st * (1 - humide) + sortie * humide * 3.0


def additive(freq, n, partiels, desaccord=0.0, phase_alea=True):
    """Somme de partiels (rang, amplitude) ; desaccord en cents pour épaissir."""
    t = np.arange(n) / SR
    x = np.zeros(n)
    for rang, amp in partiels:
        f = freq * rang * (2 ** (desaccord / 1200))
        if f >= SR / 2:
            continue
        x += amp * np.sin(2 * np.pi * f * t + (RNG.uniform(0, 2 * np.pi) if phase_alea else 0))
    return x


def scie(freq, n, harmoniques=14, desaccord=0.0):
    return additive(freq, n, [(k, 1 / k) for k in range(1, harmoniques + 1)], desaccord)


def normaliser(x, crete=0.9):
    m = np.max(np.abs(x)) or 1
    return x / m * crete


# ---------------------------------------------------------------------------
# Bruitages (synthèse)
# ---------------------------------------------------------------------------
def sfx_souffle(d=0.55, f0=300, f1=4500, montee=0.6, pan0=-0.6, pan1=0.6):
    n = int(d * SR)
    x = balayage_filtre(bruit(n), f0, f1, q=1.1)
    e = np.minimum(np.linspace(0, 1, n) / montee, 1) ** 2 * np.linspace(1, 0, n) ** 1.2
    x = x * e
    pans = np.linspace(pan0, pan1, n)
    a = (pans + 1) * np.pi / 4
    return normaliser(np.stack([x * np.cos(a), x * np.sin(a)], axis=1), 0.8)


def sfx_impact(d=1.1, f_haut=130, f_bas=42, grain=0.35):
    n = int(d * SR)
    t = np.arange(n) / SR
    f = f_bas + (f_haut - f_bas) * np.exp(-t / 0.06)
    phase = 2 * np.pi * np.cumsum(f) / SR
    corps = np.sin(phase) * decroissance(n, 0.32)
    claque = passe_bas(bruit(n), 2500) * decroissance(n, 0.025) * grain
    x = np.tanh((corps + claque) * 1.6)
    return reverbe(stereo(normaliser(x, 0.95)), IR_SALLE, 0.18)


def sfx_clic(aigu=2600, d=0.05, force=1.0):
    n = int(d * SR)
    x = passe_haut(bruit(n), 1800) * decroissance(n, 0.004) * 0.7 + np.sin(2 * np.pi * aigu * np.arange(n) / SR) * decroissance(n, 0.008) * 0.5
    return normaliser(x, 0.8 * force)


def sfx_tic(aigu=True):
    n = int(0.09 * SR)
    f = 3200 if aigu else 2300
    x = np.sin(2 * np.pi * f * np.arange(n) / SR) * decroissance(n, 0.012)
    x += passe_bande(bruit(n), 1500, 6000) * decroissance(n, 0.006) * 0.8
    return reverbe(stereo(normaliser(x, 0.7)), IR_COURTE, 0.3)


def sfx_bulle(f0=420, f1=980, d=0.11):
    n = int(d * SR)
    t = np.arange(n) / SR
    f = f0 + (f1 - f0) * (1 - np.exp(-t / 0.025))
    x = np.sin(2 * np.pi * np.cumsum(f) / SR) * np.sin(np.pi * np.minimum(t / d, 1)) ** 1.5
    return normaliser(x, 0.7)


def sfx_carillon(notes=("D6", "A6"), ecart=0.09, d=1.4, brillance=1.0):
    total = int((d + ecart * len(notes)) * SR)
    x = np.zeros(total)
    for k, nm in enumerate(notes):
        n = int(d * SR)
        f = note_hz(nm)
        son = additive(f, n, [(1, 1), (2.0, 0.35 * brillance), (2.76, 0.25 * brillance), (5.4, 0.12 * brillance)], phase_alea=False)
        son *= decroissance(n, 0.35) * np.minimum(np.arange(n) / (0.003 * SR), 1)
        i = int(k * ecart * SR)
        x[i:i + n] += son
    return reverbe(stereo(normaliser(x, 0.6)), IR_SALLE, 0.3)


def sfx_scintille(d=0.6, nb=9, f_min=2200, f_max=7000):
    n = int(d * SR)
    x = np.zeros((n, 2))
    for _ in range(nb):
        f = RNG.uniform(f_min, f_max)
        m = int(0.18 * SR)
        son = np.sin(2 * np.pi * f * np.arange(m) / SR) * decroissance(m, 0.05) * RNG.uniform(0.3, 1)
        i = int(RNG.uniform(0, d - 0.18) * SR)
        x[i:i + m] += stereo(son, RNG.uniform(-0.8, 0.8))
    return reverbe(normaliser(x, 0.5), IR_SALLE, 0.35)


def sfx_papier(d=0.16):
    n = int(d * SR)
    x = passe_bande(bruit(n), RNG.uniform(900, 1600), RNG.uniform(5000, 9000)) * (np.minimum(np.arange(n) / (0.008 * SR), 1) * decroissance(n, RNG.uniform(0.03, 0.06)))
    return normaliser(x, 0.6)


def sfx_glitch(d=0.28):
    n = int(d * SR)
    x = np.zeros(n)
    i = 0
    while i < n:
        l = int(RNG.uniform(0.008, 0.04) * SR)
        if RNG.random() < 0.6:
            f = RNG.choice([180, 360, 720, 1440, 2880])
            seg = signal.square(2 * np.pi * f * np.arange(l) / SR) * 0.5
            seg = np.round(seg * 4) / 4
        else:
            seg = bruit(l) * 0.6
            seg = np.repeat(seg[::8], 8)[:l]
        x[i:i + l] = seg[: n - i]
        i += l
    return reverbe(stereo(normaliser(passe_bas(x, 7000), 0.6)), IR_COURTE, 0.2)


def sfx_buzz(d=0.42, f=118):
    n = int(d * SR)
    t = np.arange(n) / SR
    x = signal.square(2 * np.pi * f * t) * 0.5 + signal.square(2 * np.pi * f * 1.5 * t) * 0.25
    gate = ((t % 0.21) < 0.16).astype(float)
    x = passe_bas(x * gate, 1800) * env_adsr(n, 0.005, 0.05, 0.9, 0.04, 0.9)
    return normaliser(x, 0.55)


def sfx_montee(d=1.25, f0=180, f1=2400):
    n = int(d * SR)
    t = np.arange(n) / SR
    souffle = balayage_filtre(bruit(n), 400, 9000, q=0.9)
    f = f0 * (f1 / f0) ** (t / d)
    ton = np.sin(2 * np.pi * np.cumsum(f) / SR) * (0.4 + 0.6 * (0.5 + 0.5 * np.sin(2 * np.pi * (4 + 14 * t / d) * t)))
    e = (t / d) ** 2.2
    x = (souffle * 0.8 + ton * 0.35) * e
    return reverbe(stereo(normaliser(x, 0.75)), IR_SALLE, 0.25)


def sfx_cymbale_inverse(d=1.0):
    n = int(d * SR)
    x = passe_haut(bruit(n), 3500) * (np.arange(n) / n) ** 3
    return reverbe(stereo(normaliser(x, 0.55)), IR_SALLE, 0.2)


def sfx_verrou():
    a = sfx_clic(1800, 0.06, 1.0)
    b = sfx_clic(1300, 0.08, 0.9)
    n = int(0.25 * SR)
    x = np.zeros(n)
    x[: len(a)] += a
    i = int(0.07 * SR)
    x[i:i + len(b)] += b
    anneau = additive(2350, n, [(1, 1), (2.4, 0.4)], phase_alea=False) * decroissance(n, 0.05) * 0.25
    return normaliser(x + anneau, 0.7)


def sfx_frappe(d=0.45, nb=7):
    n = int(d * SR)
    x = np.zeros(n)
    for k in range(nb):
        c = sfx_clic(RNG.uniform(1800, 3200), 0.04, RNG.uniform(0.5, 1))
        i = int((k / nb * d + RNG.uniform(0, 0.02)) * SR)
        x[i:i + len(c)] += c[: n - i]
    return normaliser(x, 0.6)


def sfx_signature(grand=False):
    """Signature du logo : grave, scintillement, accord de cloche en ré majeur."""
    d = 3.2 if grand else 2.4
    n = int(d * SR)
    st = np.zeros((n, 2))
    boom = sfx_impact(1.6, 110, 38, 0.15)
    st[: len(boom)] += boom * (0.9 if grand else 0.7)
    cloche = sfx_carillon(("D5", "F#5", "A5", "D6") if grand else ("D6", "A6"), 0.06, 2.2, 1.2)
    st[: len(cloche)] += cloche[: n] * 0.9
    sc = sfx_scintille(1.4, 14 if grand else 9)
    i = int(0.05 * SR)
    st[i:i + len(sc)] += sc[: n - i]
    return st


# ---------------------------------------------------------------------------
# Courbe d'accélération identique à l'image (Easing.bezier de Remotion)
# ---------------------------------------------------------------------------
def bezier(x1, y1, x2, y2):
    def courbe(x):
        if x <= 0:
            return 0.0
        if x >= 1:
            return 1.0
        t = x
        for _ in range(12):
            bx = 3 * (1 - t) ** 2 * t * x1 + 3 * (1 - t) * t ** 2 * x2 + t ** 3 - x
            dx = 3 * (1 - t) ** 2 * x1 + 6 * (1 - t) * t * (x2 - x1) + 3 * t ** 2 * (1 - x2)
            if abs(dx) < 1e-6:
                break
            t -= bx / dx
            t = min(max(t, 0), 1)
        return 3 * (1 - t) ** 2 * t * y1 + 3 * (1 - t) * t ** 2 * y2 + t ** 3
    return courbe


SORTIE_EASE = bezier(0.16, 1, 0.3, 1)


# ---------------------------------------------------------------------------
# Plan des bruitages (mêmes repères que l'image)
# ---------------------------------------------------------------------------
def bruitages():
    piste = np.zeros((N, 2))
    # 1. Horloge
    for s in range(0, int(SCENES["horloge"][1]) + 1):
        poser(piste, sfx_tic(s % 2 == 0), s, 0.55)
    poser(piste, sfx_impact(1.4, 90, 34, 0.1), K("mercredi") - 0.04, 0.55)
    poser(piste, sfx_scintille(0.5, 5, 1500, 4000), K("neuf") - 0.05, 0.25)
    # 2. Compte à rebours
    poser(piste, sfx_souffle(0.45, 500, 6000), SCENES["rebours"][0] - 0.3, 0.55)
    debut, arrivee = SCENES["rebours"][0] + 0.1, K("trois_semaines") + 0.12
    precedent = 30
    for f in range(int(debut * 60), int(arrivee * 60) + 2):
        t = f / 60
        v = round(30 - 8 * SORTIE_EASE((t - debut) / (arrivee - debut)))
        if v != precedent:
            poser(piste, sfx_clic(2100, 0.05, 0.8), t, 0.45)
            precedent = v
    poser(piste, sfx_impact(1.2, 140, 45, 0.3), arrivee, 0.75)
    for k, d in enumerate((0, 0.08, 0.16)):
        poser(piste, sfx_bulle(380 + 60 * k, 900 + 80 * k), K("trancher") - 0.15 + d, 0.35)
    # 3. Avalanche de documents
    a0, a1 = SCENES["avalanche"]
    poser(piste, sfx_souffle(0.5, 300, 5000, 0.5, 0.7, -0.7), a0 - 0.25, 0.6)
    depart = a0 + 0.12
    duree = K("tableaux") + 0.3 - depart
    for i in range(24):
        arr = depart + (i / 23) ** 0.85 * (duree - 0.35)
        poser(piste, stereo(sfx_papier(), RNG.uniform(-0.7, 0.7)), arr + 0.1, 0.5)
        if i % 3 == 0:
            poser(piste, sfx_souffle(0.3, 800, 7000, 0.7, RNG.uniform(-1, 1), RNG.uniform(-1, 1)), arr - 0.15, 0.22)
    for cle in ("courriels", "comptes_rendus", "factures", "tableaux"):
        poser(piste, sfx_bulle(500, 1200, 0.09), K(cle) - 0.1, 0.4)
    poser(piste, sfx_souffle(0.35, 2000, 300, 0.2), a1 - 0.25, 0.7)
    # 4. Faux vert
    poser(piste, sfx_impact(1.0, 160, 50, 0.5), max(SCENES["vert"][0] + 0.05, K("rapport") - 0.12), 0.7)
    poser(piste, sfx_carillon(("E6", "B6"), 0.07, 0.9, 0.8), K("vert") - 0.05, 0.35)
    poser(piste, sfx_glitch(0.3), K("vert") + 0.2, 0.7)
    poser(piste, sfx_buzz(0.42), K("vert") + 0.32, 0.5)
    # 5. Dates qui se contredisent
    poser(piste, sfx_souffle(0.4, 400, 5000), SCENES["dates"][0] - 0.2, 0.55)
    poser(piste, sfx_souffle(0.45, 600, 3000, 0.5, -0.9, -0.2), K("plan") - 0.15, 0.45)
    poser(piste, sfx_impact(0.8, 180, 70, 0.2), K("quinze") - 0.1, 0.4)
    poser(piste, sfx_souffle(0.45, 600, 3000, 0.5, 0.9, 0.2), K("comite") - 0.15, 0.45)
    choc = sfx_impact(1.6, 120, 36, 0.6)
    poser(piste, choc, K("vingt_deux"), 0.95)
    poser(piste, sfx_glitch(0.18), K("vingt_deux") + 0.02, 0.35)
    # 6. Facture
    poser(piste, sfx_souffle(0.4, 400, 5000), SCENES["facture"][0] - 0.2, 0.5)
    poser(piste, sfx_papier(0.3), K("facture") - 0.12, 0.6)
    surligne = balayage_filtre(bruit(int(0.45 * SR)), 1200, 5000, q=2.0) * np.linspace(0.3, 1, int(0.45 * SR)) * np.linspace(1, 0, int(0.45 * SR)) ** 0.3
    poser(piste, stereo(normaliser(surligne, 0.5)), K("dix_huit") - 0.05, 0.6)
    poser(piste, sfx_impact(0.9, 90, 40, 0.2), K("personne") - 0.1, 0.55)
    # 7–8. Qui croire ? puis la bascule
    poser(piste, sfx_montee(1.25), P(6) - 1.3, 0.75)
    poser(piste, sfx_impact(2.0, 80, 30, 0.1), P(6) - 0.06, 0.8)
    poser(piste, sfx_scintille(0.8, 7, 3000, 8000), K("cinq_minutes"), 0.4)
    poser(piste, sfx_cymbale_inverse(1.0), SCENES["cinq"][1] - 0.9, 0.7)
    # 9. Logo
    poser(piste, sfx_signature(False), SCENES["logo"][0] + 0.08, 0.85)
    poser(piste, sfx_souffle(0.45, 800, 6000, 0.5, -0.2, 0.6), K("nova") - 0.15, 0.4)
    poser(piste, sfx_bulle(600, 1300, 0.08), K("memoire") - 0.1, 0.25)
    poser(piste, sfx_souffle(0.45, 4000, 500, 0.3, 0.2, -0.8), SCENES["logo"][1] - 0.45, 0.55)
    # 10. Un écran
    poser(piste, sfx_souffle(0.6, 250, 3000, 0.7, 0, 0), SCENES["ecran"][0], 0.5)
    poser(piste, sfx_carillon(("A6",), 0, 0.6, 0.7), K("la_date"), 0.3)
    for k in range(3):
        poser(piste, sfx_clic(2400 + 200 * k, 0.05, 0.7), K("conditions") + 0.2 * k, 0.4)
    poser(piste, sfx_impact(0.6, 70, 50, 0.05), K("bloque") - 0.05, 0.35)
    poser(piste, sfx_souffle(0.5, 3000, 400, 0.4, 0, 0), K("un_seul_ecran") - 0.2, 0.4)
    # 11. Preuve
    poser(piste, sfx_souffle(0.35, 500, 5000), SCENES["preuve"][0] - 0.15, 0.45)
    poser(piste, sfx_carillon(("D7",), 0, 0.5, 0.6), K("preuve") + 0.1, 0.25)
    poser(piste, sfx_clic(3000, 0.05, 1.0), K("clic"), 0.85)
    poser(piste, sfx_souffle(0.35, 600, 7000, 0.4, 0, 0), K("clic") + 0.03, 0.45)
    poser(piste, sfx_scintille(0.9, 10), K("passage") - 0.05, 0.4)
    # 12. Contradictions, actions
    poser(piste, sfx_souffle(0.4, 400, 6000, 0.5, 0.9, -0.4), SCENES["contradictions"][0] - 0.1, 0.55)
    trait = balayage_filtre(bruit(int(0.35 * SR)), 1500, 4500, q=2.2) * np.linspace(1, 0.4, int(0.35 * SR))
    poser(piste, stereo(normaliser(trait, 0.5)), K("contradictions") + 0.2, 0.55)
    poser(piste, sfx_carillon(("D6", "F#6", "A6"), 0.07, 1.0), K("contradictions") + 0.55, 0.4)
    poser(piste, sfx_souffle(0.45, 300, 5000, 0.5, 0, 0), P(13) - 0.35, 0.5)
    for k in range(3):
        poser(piste, sfx_clic(2600, 0.05, 0.7), K("responsable") - 0.15 + 0.16 * k, 0.4)
    # 13. Assistant
    poser(piste, sfx_souffle(0.4, 400, 6000), SCENES["assistant"][0] - 0.15, 0.5)
    poser(piste, sfx_carillon(("E6", "B6"), 0.11, 0.8, 0.9), K("nouvelle") - 0.12, 0.45)
    poser(piste, sfx_souffle(0.5, 500, 4000, 0.4, -0.4, 0.7), K("collez") - 0.05, 0.5)
    poser(piste, sfx_frappe(0.4, 6), K("collez") + 0.35, 0.45)
    poser(piste, sfx_bulle(450, 1100, 0.12), P(15) - 0.05, 0.55)
    poser(piste, sfx_clic(2200, 0.05, 0.6), K("prepare") + 0.25, 0.3)
    poser(piste, sfx_carillon(("A5", "E6"), 0.1, 1.0, 1.0), K("regles") - 0.05, 0.45)
    poser(piste, sfx_clic(3000, 0.05, 1.0), K("accord") + 0.02, 0.85)
    poser(piste, sfx_carillon(("D6", "A6", "D7"), 0.07, 1.2), K("accord") + 0.22, 0.5)
    # 14. Garde-fous
    poser(piste, sfx_souffle(0.4, 400, 5000), SCENES["gardeFou"][0] - 0.15, 0.5)
    poser(piste, sfx_verrou(), K("proposition") + 0.05, 0.75)
    poser(piste, sfx_carillon(("C#6",), 0, 0.6, 0.6), K("reste") - 0.05, 0.3)
    poser(piste, sfx_souffle(0.5, 400, 5000, 0.5, 0.9, 0.1), P(17) - 0.35, 0.5)
    poser(piste, sfx_impact(0.7, 90, 55, 0.1), K("fournisseur") - 0.1, 0.4)
    poser(piste, sfx_impact(1.1, 150, 60, 0.4), K("jamais") + 0.15, 0.6)
    poser(piste, sfx_carillon(("D5", "A5"), 0.02, 1.0, 1.4), K("jamais") + 0.16, 0.45)
    # 15. Final
    poser(piste, sfx_souffle(0.5, 3000, 300, 0.4, 0, 0), SCENES["final"][0] - 0.2, 0.45)
    poser(piste, sfx_signature(True), K("nova_fin") - 0.2, 0.95)
    poser(piste, sfx_scintille(1.0, 12), K("cinq_minutes_fin") - 0.3, 0.45)
    poser(piste, sfx_bulle(500, 1150, 0.1), K("cinq_minutes_fin") + 0.25, 0.4)
    # 16. Carton
    poser(piste, sfx_souffle(0.5, 4000, 600, 0.3, 0, 0), SCENES["carton"][0] - 0.2, 0.4)
    poser(piste, sfx_scintille(1.4, 14, 3000, 9000), SCENES["carton"][0] + 0.05, 0.5)
    return piste


# ---------------------------------------------------------------------------
# Musique originale
# ---------------------------------------------------------------------------
def musique():
    piste = np.zeros((N, 2))
    t_logo = SCENES["logo"][0] + 0.12
    t_qui = P(6) - 0.06
    # --- Acte 1 : tension en ré mineur ---------------------------------------------------
    d1 = t_qui + 0.2
    n1 = int(d1 * SR)
    t = np.arange(n1) / SR
    drone = (scie(note_hz("D2"), n1, 10, -6) + scie(note_hz("D2"), n1, 10, 7) + 0.6 * scie(note_hz("A2"), n1, 8, 3)) / 3
    cut = 260 + 900 * (t / d1) ** 1.6
    drone_f = np.zeros(n1)
    for i in range(0, n1, 2048):  # filtre qui s'ouvre lentement
        drone_f[i:i + 2048] = passe_bas(drone[max(0, i - 4096):i + 2048], cut[i])[-len(drone[i:i + 2048]):]
    drone_f *= (0.55 + 0.45 * np.sin(2 * np.pi * 0.12 * t)) * np.minimum(t / 1.5, 1)
    sub = np.sin(2 * np.pi * note_hz("D1") * t) * 0.35 * np.minimum(t / 3, 1)
    acte1 = stereo(drone_f * 0.5 + sub)
    # pulsation (croche à 120 bpm) qui grandit de la facture à « Qui croire ? »
    deb_pulse = SCENES["vert"][0]
    for k in range(int((t_qui - deb_pulse) / 0.25)):
        tt = deb_pulse + k * 0.25
        n = int(0.22 * SR)
        f = note_hz("D2") if (k // 8) % 2 == 0 else note_hz("Bb1")
        son = np.tanh(2.2 * scie(f, n, 8)) * decroissance(n, 0.09)
        son = passe_bas(son, 500 + 1600 * (tt - deb_pulse) / (t_qui - deb_pulse))
        poser(acte1, stereo(son * (0.25 + 0.5 * (tt - deb_pulse) / (t_qui - deb_pulse))), tt)
    # piano dissonant : notes rares
    for tt, notes in [(0.6, ("D4", "A4")), (2.6, ("F4", "Eb5")), (5.9, ("D4", "C#5")), (8.3, ("Bb3", "A4")), (11.4, ("G4", "Eb5")),
                      (14.0, ("D4", "C#5")), (16.2, ("A3", "Bb4")), (18.1, ("F4", "E5"))]:
        for k, nm in enumerate(notes):
            n = int(2.6 * SR)
            f = note_hz(nm)
            son = additive(f, n, [(r * (1 + 0.0004 * r * r), 1 / r ** 1.4) for r in range(1, 9)], phase_alea=False)
            son *= decroissance(n, 0.9) * np.minimum(np.arange(n) / (0.004 * SR), 1)
            poser(acte1, stereo(son * 0.22, -0.3 + 0.6 * k), tt + 0.03 * k)
    acte1 = reverbe(acte1, IR_SALLE, 0.35)
    # silence net sur « Qui croire ? »
    coupe = np.ones(n1)
    i_qui = int(t_qui * SR)
    coupe[i_qui:] = np.linspace(1, 0, n1 - i_qui) ** 6
    acte1 *= coupe[:, None]
    piste[:n1] += acte1
    # nappe aiguë de l'espoir (« Et si… »), puis montée vers le logo
    d_esp = t_logo - (P(7) - 0.3)
    n = int(d_esp * SR)
    t = np.arange(n) / SR
    espoir = sum(scie(note_hz(nm), n, 6, de) for nm, de in [("A4", -5), ("D5", 4), ("F#5", -3), ("A5", 6)]) / 4
    espoir = passe_bas(espoir, 2400) * (t / d_esp) ** 1.8
    poser(piste, reverbe(stereo(espoir * 0.3), IR_SALLE, 0.5), P(7) - 0.3)
    # --- Acte 2 : solution en ré majeur, 100 bpm -------------------------------------------
    BPM = 100
    temps = 60 / BPM
    mesure = 4 * temps
    fin_musique = M["duree_totale"]
    accords = [("D3", "F#3", "A3", "D4"), ("A2", "E3", "A3", "C#4"), ("B2", "F#3", "B3", "D4"), ("G2", "D3", "G3", "B3")]
    basses = ["D2", "A1", "B1", "G1"]
    arp = [0, 2, 1, 3, 2, 1, 3, 2]
    t_arp = SCENES["ecran"][0]
    t_batterie = SCENES["preuve"][0]
    t_energie = SCENES["assistant"][0]
    t_stop = K("cinq_minutes_fin") - 0.05
    nb_mesures = int(math.ceil((fin_musique - t_logo) / mesure))
    for m in range(nb_mesures):
        tm = t_logo + m * mesure
        if tm > t_stop:
            break
        ac = accords[m % 4]
        # nappe
        n = int((mesure + 0.6) * SR)
        nappe = sum(scie(note_hz(nm), n, 9, de) for nm in ac for de in (-7, 6)) / (len(ac) * 2)
        nappe = passe_bas(nappe, 1500) * env_adsr(n, 0.5, 0.3, 0.85, 0.6, 0.85)
        poser(piste, reverbe(stereo(nappe * 0.32), IR_SALLE, 0.3), tm)
        # basse
        for b in range(4):
            tb = tm + b * temps
            if tb >= t_stop:
                break
            n = int(temps * 0.95 * SR)
            f = note_hz(basses[m % 4])
            son = np.tanh(1.6 * additive(f, n, [(1, 1), (2, 0.3), (3, 0.12)])) * env_adsr(n, 0.008, 0.1, 0.7, 0.08, 0.7)
            poser(piste, stereo(son * (0.32 if tm >= t_arp else 0.16)), tb)
        # arpèges
        if tm >= t_arp - 0.01:
            for k in range(8):
                ta = tm + k * temps / 2
                if ta >= t_stop:
                    break
                nm = ac[arp[k]]
                f = note_hz(nm) * 2
                n = int(0.5 * SR)
                son = additive(f, n, [(1, 1), (2, 0.4), (3, 0.18), (4, 0.08)]) * decroissance(n, 0.16) * np.minimum(np.arange(n) / (0.002 * SR), 1)
                g = 0.13 if tm < t_energie else 0.17
                poser(piste, stereo(son * g, -0.35 if k % 2 else 0.35), ta)
                if tm >= t_energie and k % 2 == 0:  # octave supérieure : l'énergie de l'assistant
                    son2 = additive(f * 2, n, [(1, 1), (2, 0.3)]) * decroissance(n, 0.1)
                    poser(piste, stereo(son2 * 0.06, 0.5 if k % 4 else -0.5), ta + temps / 4)
        # batterie
        if tm >= t_batterie - 0.01:
            for b in range(4):
                tb = tm + b * temps
                if tb >= t_stop:
                    break
                if b in (0, 2):
                    n = int(0.35 * SR)
                    tt = np.arange(n) / SR
                    f = 48 + 110 * np.exp(-tt / 0.035)
                    pied = np.sin(2 * np.pi * np.cumsum(f) / SR) * decroissance(n, 0.12)
                    poser(piste, stereo(pied * 0.55), tb)
                if tm >= t_energie and b in (1, 3):
                    n = int(0.25 * SR)
                    clap = passe_bande(bruit(n), 900, 5000) * decroissance(n, 0.05)
                    poser(piste, reverbe(stereo(clap * 0.18), IR_COURTE, 0.3), tb)
                for h in range(2):
                    th = tb + h * temps / 2 + temps / 4
                    n = int(0.06 * SR)
                    hat = passe_haut(bruit(n), 7000) * decroissance(n, 0.015)
                    poser(piste, stereo(hat * 0.07, 0.4), th)
    # résolution : accord final et cloche
    n = int(4.0 * SR)
    final = sum(scie(note_hz(nm), n, 8, de) for nm in ("D3", "A3", "D4", "F#4", "A4") for de in (-5, 5)) / 10
    final = passe_bas(final, 1800) * env_adsr(n, 0.05, 0.4, 0.8, 2.2, 0.8)
    poser(piste, reverbe(stereo(final * 0.42), IR_SALLE, 0.4), t_stop)
    glock = sfx_carillon(("D6", "F#6", "A6", "D7"), 0.16, 1.8, 0.8)
    poser(piste, glock, t_stop + 0.1, 0.35)
    # fondu de fin
    i0 = int((M["duree_totale"] - 1.2) * SR)
    piste[i0:] *= np.linspace(1, 0, N - i0)[:, None] ** 1.5
    return piste


# ---------------------------------------------------------------------------
# Voix, mixage, mastering
# ---------------------------------------------------------------------------
def lire_audio(fichier):
    brut = subprocess.check_output(["ffmpeg", "-v", "error", "-i", str(fichier), "-ac", "1", "-ar", str(SR), "-f", "f32le", "-"])
    return np.frombuffer(brut, dtype=np.float32).astype(np.float64)


def ecrire_wav(fichier, st):
    st = np.clip(st, -1, 1)
    p = subprocess.run(["ffmpeg", "-v", "error", "-y", "-f", "f32le", "-ar", str(SR), "-ac", "2", "-i", "-", "-c:a", "pcm_s24le", str(fichier)], input=st.astype(np.float32).tobytes())
    assert p.returncode == 0


def enveloppe_voix(voix_mono):
    """Enveloppe de la voix (attaque 20 ms, relâche 350 ms) pour la compression latérale."""
    rms = np.sqrt(signal.sosfilt(signal.butter(2, 30, fs=SR, output="sos"), voix_mono ** 2).clip(0))
    acc = 0.0
    bloc = rms[::48]  # calcul à 1 kHz, puis interpolation
    sortie = np.zeros_like(bloc)
    a_att, a_rel = math.exp(-1 / (0.02 * 1000)), math.exp(-1 / (0.35 * 1000))
    for i, v in enumerate(bloc):
        acc = a_att * acc + (1 - a_att) * v if v > acc else a_rel * acc + (1 - a_rel) * v
        sortie[i] = acc
    e = np.interp(np.arange(len(rms)), np.arange(len(sortie)) * 48, sortie)
    return e


def main():
    mesure = pyln.Meter(SR)
    # Voix : prise retenue, décalée du pré-roll ; simple passe-haut à 80 Hz, aucune compression.
    v = lire_audio(ICI / "voix" / M["voix"])
    v = passe_haut(v, 80)
    voix = np.zeros(N)
    i0 = int(M["pre_roll"] * SR)
    voix[i0:i0 + len(v)] = v[: N - i0]
    voix_st = stereo(voix, 0) * math.sqrt(2)
    print("Synthèse des bruitages…")
    sfx = bruitages()
    print("Synthèse de la musique…")
    mus = musique()
    # Niveaux : voix à −20 LUFS avant mastering ; musique au moins 15 LU sous la voix (mesuré sur les passages parlés).
    lv = mesure.integrated_loudness(voix_st)
    voix_st *= 10 ** ((-20 - lv) / 20)
    env = enveloppe_voix(voix_st[:, 0])
    seuil = np.percentile(env[env > 1e-5], 20) if np.any(env > 1e-5) else 1e-3
    reduction_db = np.clip(20 * np.log10(np.maximum(env, 1e-9) / seuil), 0, 1) * 9.0  # jusqu'à −9 dB sous la voix
    gain_ducking = 10 ** (-reduction_db / 20)
    parle = env > seuil
    mus_parle = mus[parle] * gain_ducking[parle][:, None]
    lm = mesure.integrated_loudness(mus_parle) if len(mus_parle) > SR else -70
    lv2 = mesure.integrated_loudness(voix_st[parle])
    cible_musique = lv2 - 17.0  # marge : 17 LU sous la voix pendant la parole (exigence : ≥ 15)
    gain_m = 10 ** ((cible_musique - lm) / 20)
    mus = mus * gain_m * gain_ducking[:, None]
    # Bruitages : pointes sous la voix
    ls = mesure.integrated_loudness(sfx)
    sfx *= 10 ** ((-27 - ls) / 20)
    mix = voix_st + mus + sfx
    ecrire_wav(SORTIE / "voix.wav", voix_st)
    ecrire_wav(SORTIE / "musique.wav", mus)
    ecrire_wav(SORTIE / "bruitages.wav", sfx)
    ecrire_wav(SORTIE / "mix_pre_master.wav", mix / max(1.0, np.max(np.abs(mix)) / 0.98))
    ecart = mesure.integrated_loudness(voix_st[parle]) - mesure.integrated_loudness(mus[parle])
    print(f"Écart voix / musique pendant la parole : {ecart:.1f} LU (exigence ≥ 15)")
    # Mastering : gain fixe puis limiteur de crête suréchantillonné (×4) sur le bus master uniquement.
    # La piste voix n'a ni compresseur ni limiteur ; seules quelques crêtes du mélange sont écrêtées.
    res = master(SORTIE / "mix_pre_master.wav", SORTIE / "mix_master.wav")
    print(f"Master : {res['I']:.2f} LUFS intégrés, crête vraie {res['TP']:.2f} dBTP, LRA {res['LRA']:.1f} LU, gain {res['gain_db']:.2f} dB, plafond du limiteur {res['plafond']:.3f}")
    (SORTIE / "mesures.json").write_text(json.dumps({"ecart_voix_musique_LU": round(ecart, 1), "master": res}, indent=1), encoding="utf-8")


def mesurer(fichier):
    sortie = subprocess.run(["ffmpeg", "-hide_banner", "-nostats", "-i", str(fichier), "-af", "ebur128=peak=true", "-f", "null", "-"], capture_output=True, text=True).stderr
    resume = sortie[sortie.rindex("Summary:"):]
    import re
    I = float(re.search(r"I:\s+(-?[\d.]+) LUFS", resume).group(1))
    LRA = float(re.search(r"LRA:\s+(-?[\d.]+) LU", resume).group(1))
    TP = float(re.search(r"Peak:\s+(-?[\d.]+|-inf) dBFS", resume).group(1))
    return I, TP, LRA


def master(entree, sortie, cible=-14.0, plafond_tp=-1.0):
    I0, _, _ = mesurer(entree)
    gain = cible - I0
    plafond = 10 ** ((plafond_tp - 0.35) / 20)
    for _ in range(6):
        filtre = f"volume={gain:.3f}dB,aresample=192000,alimiter=limit={plafond:.4f}:attack=0.6:release=45:asc=1:level=false,aresample=48000"
        subprocess.run(["ffmpeg", "-v", "error", "-y", "-i", str(entree), "-af", filtre, "-c:a", "pcm_s24le", str(sortie)], check=True)
        I, TP, LRA = mesurer(sortie)
        if abs(I - cible) <= 0.1 and TP <= plafond_tp + 0.01:
            break
        gain += cible - I
        if TP > plafond_tp:
            plafond *= 10 ** ((plafond_tp - TP - 0.1) / 20)
    return {"I": I, "TP": TP, "LRA": LRA, "gain_db": round(gain, 2), "plafond": round(plafond, 4)}


if __name__ == "__main__":
    main()
