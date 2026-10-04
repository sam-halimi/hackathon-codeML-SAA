#!/usr/bin/env python3
"""Musique originale de la pub Boussole « Pas à pas », écrite et synthétisée en code.

Ré♭ majeur, autour de 72 BPM. Piano feutré (synthèse modale), nappes, pulsation façon kalimba,
basse ronde et célesta. Aucun échantillon, aucune boucle. Rendu déterministe.

    python3 score.py timeline_brief34.json     maquette sur le timing du brief
    python3 score.py timeline_vo.json          version calée sur la prise de voix retenue

Le fichier de timing donne le début des sections, l'instant du logo (qui tombe sur un premier
temps) et les intervalles de parole : le célesta ne joue que dans les silences de la voix.

Sortie (out/) : un stem WAV 48 kHz / 24 bits par instrument, réverbération comprise
(les stems s'additionnent pour donner le mix), music_mix.wav et music_mix.mp3 (écoute).
"""
import json
import os
import subprocess
import sys

import numpy as np
from scipy import signal
from scipy.io import wavfile

SR = 48000
HERE = os.path.dirname(os.path.abspath(__file__))
rng = np.random.default_rng(7)

# ───────── Notes et accords ─────────

PC = {'C': 0, 'Db': 1, 'D': 2, 'Eb': 3, 'E': 4, 'F': 5, 'Gb': 6, 'G': 7, 'Ab': 8, 'A': 9, 'Bb': 10, 'B': 11}


def midi(name):
    return (int(name[-1]) + 1) * 12 + PC[name[:-1]]


def hz(m):
    return 440.0 * 2 ** ((m - 69) / 12)


CHORDS = {
    'Dbadd9': ['Db3', 'Ab3', 'Eb4', 'F4', 'Ab4'],
    'Gbmaj7': ['Gb2', 'Bb3', 'Db4', 'F4'],
    'Db/F': ['F2', 'Ab3', 'Db4', 'Eb4', 'F4'],
    'Bbm9': ['Bb2', 'Db4', 'F4', 'Ab4', 'C5'],
    'Gbmaj9': ['Gb2', 'Bb3', 'Db4', 'F4', 'Ab4'],
    'Db': ['Db3', 'Ab3', 'Db4', 'F4'],
    'Ab/C': ['C3', 'Ab3', 'C4', 'Eb4'],
    'Bbm7': ['Bb2', 'F3', 'Ab3', 'Db4'],
    'Gb': ['Gb2', 'Gb3', 'Bb3', 'Db4'],
    'Ebm7': ['Eb3', 'Gb3', 'Bb3', 'Db4'],
    'Absus4': ['Ab2', 'Db4', 'Eb4', 'Ab4'],
    'Ab': ['Ab2', 'C4', 'Eb4', 'Ab4'],
    'Gbmaj9w': ['Gb2', 'Db3', 'Bb3', 'F4', 'Ab4', 'Bb4'],
    'Dbfin': ['Db2', 'Ab2', 'Db3', 'Ab3', 'Eb4', 'F4', 'Ab4'],
}

# Accords par section : (section, part de la section où l'accord commence, accord)
PLAN = [
    ('ouverture', 0.0, 'Dbadd9'),
    ('compte', 0.0, 'Gbmaj7'), ('compte', 0.5, 'Db/F'),
    ('accueil', 0.0, 'Bbm9'), ('accueil', 0.5, 'Gbmaj9'),
    ('ou_aller', 0.0, 'Db'), ('ou_aller', 0.25, 'Ab/C'), ('ou_aller', 0.5, 'Bbm7'), ('ou_aller', 0.75, 'Gb'),
    ('dossier', 0.0, 'Ebm7'), ('dossier', 0.5, 'Absus4'), ('dossier', 0.75, 'Ab'),
    ('reunis', 0.0, 'Gbmaj9w'),
]
MOTIF = ['Ab4', 'Db5', 'Eb5']                     # ouverture : trois notes qui montent
MOTIF_FIN = ['Ab4', 'Db5', 'Eb5', 'F5']           # fin : le même, complété et résolu
CELESTA = [['Ab5', 'Bb5', 'Db6', 'Eb6'], ['F5', 'Ab5'], ['Eb5', 'F5', 'Ab5'], ['Db6', 'Bb5'], ['Ab5', 'Db6']]

# ───────── Instruments ─────────


def raised(n):
    return 0.5 - 0.5 * np.cos(np.linspace(0, np.pi, max(n, 1)))


def piano(m, vel, dur, pedal=False):
    """Piano feutré : partiels légèrement inharmoniques, deux cordes désaccordées, décroissance en deux temps."""
    f0 = hz(m)
    n = int((dur + (5.0 if pedal else 0.8)) * SR)
    t = np.arange(n) / SR
    inharm = 0.0003 * (1 + max(0, m - 60) / 30)
    bright = 650 + 2000 * vel                     # le feutre garde peu d'harmoniques aiguës
    low = np.clip((84 - m) / 48, 0, 1)            # les graves tiennent plus longtemps
    y = np.zeros(n)
    for k in range(1, 31):
        fk = k * f0 * np.sqrt(1 + inharm * k * k)
        if fk > 12000:
            break
        a = k ** -1.15 * np.exp(-fk / bright)
        if a < 2e-4:
            continue
        t1 = (1.2 + 3.5 * low) / (1 + fk / 2500)
        t0 = 0.25 / (1 + fk / 3000)
        env = 0.4 * np.exp(-t / t0) + 0.6 * np.exp(-t / t1)
        for cents in (-0.7, 0.7):
            y += 0.5 * a * env * np.sin(2 * np.pi * fk * 2 ** (cents / 1200) * t + rng.uniform(0, 2 * np.pi))
    att = int((0.004 + 0.012 * (1 - vel)) * SR)
    y[:att] *= raised(att)
    hn = int(0.03 * SR)
    hammer = rng.standard_normal(hn) * np.exp(-np.arange(hn) / SR / 0.008)
    y[:hn] += 0.02 * vel * signal.sosfilt(signal.butter(2, [200, 1800], 'band', fs=SR, output='sos'), hammer)
    if not pedal:
        r = int(dur * SR)
        y[r:] *= np.exp(-np.arange(n - r) / SR / 0.35)   # étouffoir doux
    return vel * y


def saw(f, n):
    dt = f / SR
    ph = (rng.uniform() + dt * np.arange(n)) % 1.0
    y = 2 * ph - 1
    a = ph < dt
    x = ph[a] / dt
    y[a] -= x + x - x * x - 1
    b = ph > 1 - dt
    x = (ph[b] - 1) / dt
    y[b] -= x * x + x + x + 1
    return y


def pad_voice(m, n):
    return sum(saw(hz(m) * 2 ** (c / 1200), n) for c in (-7, 0, 7)) / 3


def pluck(m, vel):
    """Pulsation : petite lame pincée, façon kalimba, très courte."""
    f0 = hz(m)
    n = int(0.9 * SR)
    t = np.arange(n) / SR
    y = (np.sin(2 * np.pi * f0 * t) * np.exp(-t / 0.16)
         + 0.18 * np.sin(2 * np.pi * 2 * f0 * t) * np.exp(-t / 0.06)
         + 0.06 * np.sin(2 * np.pi * 5.4 * f0 * t) * np.exp(-t / 0.02))
    att = int(0.003 * SR)
    y[:att] *= raised(att)
    return vel * y


def bass(m, dur, vel):
    f0 = hz(m)
    n = int((dur + 1.2) * SR)
    t = np.arange(n) / SR
    y = (np.sin(2 * np.pi * f0 * t) + 0.12 * np.sin(4 * np.pi * f0 * t)) * np.exp(-t / 8)
    att = int(0.12 * SR)
    y[:att] *= raised(att)
    r = int(dur * SR)
    y[r:] *= np.exp(-np.arange(n - r) / SR / 0.35)
    return vel * y


def celesta(m, vel):
    f0 = hz(m)
    n = int(2.6 * SR)
    t = np.arange(n) / SR
    y = sum(a * np.sin(2 * np.pi * f0 * r * t) * np.exp(-t / tau)
            for r, a, tau in ((1, 1, 1.3), (2, 0.22, 0.5), (3, 0.1, 0.3), (4.02, 0.2, 0.25), (6.8, 0.04, 0.08)))
    att = int(0.002 * SR)
    y[:att] *= raised(att)
    return vel * y

# ───────── Espace ─────────


def make_ir(t60=2.3, pre=0.02, length=3.0):
    n = int(length * SR)
    t = np.arange(n) / SR
    noise = rng.standard_normal((n, 2))
    dark = signal.sosfiltfilt(signal.butter(2, 2500, fs=SR, output='sos'), noise, axis=0)
    mix = np.clip(t / 1.2, 0, 1)[:, None]                  # la queue s'assombrit
    ir = (noise * (1 - mix) + dark * mix) * np.exp(-6.91 * t / t60)[:, None]
    ir = signal.sosfilt(signal.butter(1, 180, 'high', fs=SR, output='sos'), ir, axis=0)
    ir = np.concatenate([np.zeros((int(pre * SR), 2)), ir])
    return ir / np.sqrt((ir ** 2).sum(axis=0))


def tv_lowpass(x, points, block=512):
    """Passe-bas dont la fréquence suit une courbe (ouverture et fermeture des nappes)."""
    y = np.zeros_like(x)
    zi = None
    for i in range(0, len(x), block):
        fc = float(np.interp((i + block / 2) / SR, *zip(*points)))
        sos = signal.butter(2, fc, fs=SR, output='sos')
        if zi is None:
            zi = np.zeros((sos.shape[0], 2, x.shape[1]))
        y[i:i + block], zi = signal.sosfilt(sos, x[i:i + block], axis=0, zi=zi)
    return y

# ───────── Partition ─────────


def render(tl):
    D = tl['duration']
    L = int(D * SR)
    beat = 60 / tl['bpm']
    logo = tl['logo']
    phase = logo % (4 * beat)                              # le logo tombe sur un premier temps

    def snap(t):
        return phase + round((t - phase) / beat) * beat

    order = ['ouverture', 'compte', 'accueil', 'ou_aller', 'dossier', 'reunis', 'souffle', 'fin', 'made_by']
    sec = {k: tl['sections'][k] for k in order}          # le timing du film a aussi d'autres repères
    names = order
    S = {k: (0.0 if k == 'ouverture' else snap(v)) for k, v in sec.items()}
    end_of = {k: (S[names[i + 1]] if i + 1 < len(names) else D) for i, k in enumerate(names)}
    end_of['reunis'] = S['souffle']
    speech = tl['speech']

    def speaking(t, margin=0.08):
        return any(a - margin <= t <= b + margin for a, b in speech)

    stems = {k: np.zeros((L, 2)) for k in ('piano', 'celesta', 'nappes', 'pulsation', 'basse')}

    def place(stem, t, mono, pan=0.0, gain=1.0):
        i = int(round(t * SR))
        if i >= L:
            return
        seg = mono[:L - i] * gain
        stems[stem][i:i + len(seg), 0] += seg * np.cos((pan + 1) * np.pi / 4)
        stems[stem][i:i + len(seg), 1] += seg * np.sin((pan + 1) * np.pi / 4)

    pan_of = lambda m: float(np.clip((m - 62) / 40, -0.35, 0.35))

    # Accords datés : chaque section reçoit ses accords sur une grille de demi-mesures
    half = 2 * beat

    def snap_half(t):
        return phase + round((t - phase) / half) * half

    chords = []
    for name in dict.fromkeys(n for n, _, _ in PLAN):
        mine = [(f, ch) for n, f, ch in PLAN if n == name]
        if name == 'ouverture':
            chords.append((0.0, mine[0][1]))
            continue
        a, b = snap_half(S[name]), snap_half(end_of[name])
        slots = max(1, round((b - a) / half))
        used = set()
        for f, ch in mine:
            k = int(np.floor(f * slots + 0.5))
            if k < slots and k not in used:               # pas assez de place : l'accord suivant attend
                used.add(k)
                chords.append((a + k * half, ch))
    chords.append((logo, 'Dbfin'))
    chords.sort()
    spans = [(t, chords[i + 1][0] if i + 1 < len(chords) else D, ch) for i, (t, ch) in enumerate(chords)]

    # Piano : accords arpégés doucement (plus bas sous la voix), motif d'ouverture et de fin
    for t, t_end, ch in spans:
        notes = [midi(n) for n in CHORDS[ch]]
        fin = ch == 'Dbfin'
        roll = 0.06 if fin else 0.035
        vel = 0.42 if fin else (0.30 if speaking(t) else 0.38)
        for j, m in enumerate(notes):
            start = t + j * roll
            v = vel * (0.6 if m < 48 else 1.0)            # les graves du piano restent discrets
            place('piano', start, piano(m, v, max(0.4, t_end - start + 0.3), pedal=fin), pan_of(m))
    for j, n in enumerate(MOTIF):
        m = midi(n)
        place('piano', 0.06 + j * 0.2, piano(m, 0.34, 1.6), pan_of(m))   # juste avant le premier mot
    eighth = beat / 2
    for j, n in enumerate(MOTIF_FIN):
        m = midi(n)
        place('piano', logo - (3 - j) * eighth, piano(m, 0.36 if j < 3 else 0.42, 4.0 if j == 3 else 0.9, pedal=j == 3), pan_of(m))

    # Nappes : voix médianes de chaque accord, longues attaques, fondus croisés
    pad = np.zeros((L, 2))
    for t, t_end, ch in spans:
        voices = [midi(n) for n in CHORDS[ch] if 48 <= midi(n) <= 72]
        i0 = int(t * SR)
        n = int((min(D, t_end + 1.6) - t) * SR)
        if n <= 0:
            continue
        env = np.ones(n)
        a = min(int(1.0 * SR), n)
        env[:a] *= raised(a)
        hold = int((t_end - t) * SR)
        if hold < n:
            env[hold:] *= np.linspace(1, 0, n - hold)
        for k, m in enumerate(voices):
            v = pad_voice(m, n) * env * 0.08
            side = -0.3 if k % 2 else 0.3
            pad[i0:i0 + n, 0] += v[:L - i0] * np.cos((side + 1) * np.pi / 4)
            pad[i0:i0 + n, 1] += v[:L - i0] * np.sin((side + 1) * np.pi / 4)
    cut = [(0, 450), (3.0, 1100), (S['accueil'], 1200), (S['ou_aller'], 1350), (S['dossier'], 1350),
           (S['reunis'] - 0.3, 2000), (S['reunis'], 2600), (S['souffle'], 2600), (S['souffle'] + 0.8, 700),
           (logo, 1500), (D, 900)]
    pad = tv_lowpass(pad, cut)
    amp = [(0, 0), (1.6, 1.0), (S['dossier'], 1.0), (S['reunis'], 1.15), (S['souffle'], 1.15),
           (S['souffle'] + 0.6, 0.18), (logo - 0.05, 0.18), (logo + 0.35, 1.0), (S['made_by'], 0.95),
           (S['made_by'] + 3.0, 0.0), (D, 0.0)]
    pad *= np.interp(np.arange(L) / SR, *zip(*amp))[:, None]
    stems['nappes'] += pad

    # Pulsation : croches légères, de l'accueil jusqu'aux « Réunis »
    t = S['accueil']
    k = 0
    while t < S['reunis'] - 0.05:
        ch = next(c for a, b, c in spans if a <= t < b)
        top = sorted(midi(n) for n in CHORDS[ch])[-2:]
        top = [m + 12 if m < 66 else m for m in top]
        m = top[k % 2]
        vel = 0.16 if t < S['ou_aller'] else 0.18 if t < S['dossier'] else 0.22
        place('pulsation', t, pluck(m, vel), 0.25 if k % 2 else -0.25)
        t += eighth
        k += 1

    # Basse : fondamentales tenues, à partir de « Où aller »
    for t, t_end, ch in spans:
        if t < S['ou_aller'] - 0.01:
            continue
        root = min(midi(n) for n in CHORDS[ch])
        while root > 48:
            root -= 12
        while root < 37:
            root += 12
        length = (D - t - 1.5) if ch == 'Dbfin' else (min(t_end, S['souffle'] + 0.4) - t)
        if length > 0.2:
            place('basse', t, bass(root, length, 0.5))

    # Célesta : de courtes phrases, seulement dans les silences de la voix
    gaps = [(b, c) for (_, b), (c, _) in zip(speech, speech[1:])]
    p = 0
    for a, b in gaps:
        if a < S['accueil'] - 0.5 or b > S['reunis'] or b - a < 0.5:
            continue
        phrase = CELESTA[p % len(CELESTA)]
        p += 1
        t = snap(a + 0.08)
        if t < a + 0.05:
            t += eighth
        for n in phrase:
            if t > b - 0.25:
                break
            place('celesta', t, celesta(midi(n), 0.22), pan_of(midi(n)) + 0.1)
            t += eighth

    # Espace et niveaux
    ir = make_ir()
    sends = {'piano': 0.28, 'celesta': 0.45, 'nappes': 0.35, 'pulsation': 0.30, 'basse': 0.0}
    gains = {'piano': 1.0, 'celesta': 0.62, 'nappes': 1.15, 'pulsation': 0.62, 'basse': 0.42}
    for k, x in stems.items():
        if sends[k]:
            x = x + sends[k] * signal.fftconvolve(x, ir, axes=0)[:L]
        stems[k] = x * gains[k]
    fade = np.ones(L)
    f0 = int((S['made_by'] + 2.2) * SR)
    if f0 < L:
        fade[f0:] = np.linspace(1, 0, L - f0) ** 2
    for k in stems:
        stems[k] *= fade[:, None]
    hp = signal.butter(2, 45, 'high', fs=SR, output='sos')     # rien d'utile sous 45 Hz
    for k in stems:
        stems[k] = signal.sosfilt(hp, stems[k], axis=0)
    mix = sum(stems.values())
    norm = 10 ** (-3 / 20) / np.abs(mix).max()            # crête du mix à −3 dBFS
    return {k: v * norm for k, v in stems.items()}, mix * norm, {'beat': beat, 'phase': phase, 'chords': spans}


def write(path, x):
    tmp = path + '.f32.wav'
    wavfile.write(tmp, SR, x.astype(np.float32))
    subprocess.run(['ffmpeg', '-v', 'error', '-y', '-i', tmp, '-c:a', 'pcm_s24le', path], check=True)
    os.remove(tmp)


if __name__ == '__main__':
    tl_path = sys.argv[1] if len(sys.argv) > 1 else os.path.join(HERE, 'timeline_brief34.json')
    with open(tl_path, encoding='utf-8') as f:
        tl = json.load(f)
    stems, mix, info = render(tl)
    out = os.path.join(HERE, 'out')
    os.makedirs(os.path.join(out, 'stems'), exist_ok=True)
    for k, v in stems.items():
        write(os.path.join(out, 'stems', f'{k}.wav'), v)
    write(os.path.join(out, 'music_mix.wav'), mix)
    subprocess.run(['ffmpeg', '-v', 'error', '-y', '-i', os.path.join(out, 'music_mix.wav'), '-c:a', 'libmp3lame', '-b:a', '192k',
                    os.path.join(out, 'music_mix.mp3')], check=True)
    print(f"tempo {60 / info['beat']:.1f} BPM, premiers temps à {info['phase']:.3f} s + n × {4 * info['beat']:.3f} s")
    for t, e, ch in info['chords']:
        print(f'  {t:6.2f} → {e:6.2f}  {ch}')
