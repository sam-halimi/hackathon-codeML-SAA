"""Musique originale, entièrement synthétisée (aucun échantillon).
Ré mineur tendu jusqu'à la bascule (« On répare la première nuit »), puis fa majeur qui s'ouvre.
La grille (tempo, origine) vient de build/schedule.json : bascule et carte 1 sur des premiers temps.
Sorties : music/stems/*.wav et music/music.wav (48 kHz, 24 bits, stéréo)."""
import json, os
import numpy as np, soundfile as sf
from scipy.signal import butter, sosfilt, fftconvolve

ROOT = os.path.abspath(os.path.join(os.path.dirname(__file__), "..", ".."))
S = json.load(open(f"{ROOT}/build/schedule.json"))
SR = 48000
DUR = S["total"] + 0.2
N = int(DUR * SR)
t = np.arange(N) / SR
M = S["music"]; BAR = M["bar"]; BEAT = BAR / 4; O = M["origin"]
TB, TC = M["bascule"], M["card"]
CARD2 = S["scenes"]["CARD2"][0]
rng = np.random.default_rng(7)
os.makedirs(f"{ROOT}/music/stems", exist_ok=True)

def hz(n):  # nom de note -> fréquence (A4 = 440)
    names = {"C": -9, "Db": -8, "D": -7, "Eb": -6, "E": -5, "F": -4, "Gb": -3, "G": -2, "Ab": -1, "A": 0, "Bb": 1, "B": 2}
    p, o = n[:-1], int(n[-1])
    return 440 * 2 ** ((names[p] + 12 * (o - 4)) / 12)

def lp(x, fc, order=2):
    return sosfilt(butter(order, fc, "low", fs=SR, output="sos"), x, axis=0)

def hp(x, fc, order=2):
    return sosfilt(butter(order, fc, "high", fs=SR, output="sos"), x, axis=0)

def bp(x, lo, hi, order=2):
    return sosfilt(butter(order, [lo, hi], "band", fs=SR, output="sos"), x, axis=0)

def env(points):  # enveloppe linéaire par points (temps, gain)
    ts, gs = zip(*points)
    return np.interp(t, ts, gs)

def stereo(m, width=0.0):
    return np.stack([m, m], 1) if width == 0 else m

def place(buf, sig, at):
    i = int(at * SR)
    if i >= len(buf): return
    n = min(len(sig), len(buf) - i)
    buf[i:i + n] += sig[:n]

def reverb(x, rt60=2.8, wet=0.3, pre=0.02, damp=5000):
    n = int(rt60 * SR)
    tt = np.arange(n) / SR
    decay = np.exp(-6.9 * tt / rt60)
    ir = np.stack([rng.standard_normal(n) * decay, rng.standard_normal(n) * decay], 1)
    ir = lp(ir, damp)
    ir[:int(0.004 * SR)] *= np.linspace(0, 1, int(0.004 * SR))[:, None]
    ir = np.concatenate([np.zeros((int(pre * SR), 2)), ir])
    ir /= np.sqrt((ir ** 2).sum(0, keepdims=True))
    y = np.stack([fftconvolve(x[:, c], ir[:, c])[:len(x)] for c in range(2)], 1)
    return x * (1 - wet) + y * wet * 1.6

# ---------- 1. Drone (sub ré) : tension ----------
lfo = 1 + 0.12 * np.sin(2 * np.pi * 0.11 * t)
drone = (np.sin(2 * np.pi * hz("D1") * t) * 0.9 + np.sin(2 * np.pi * hz("D2") * t + 0.6) * 0.45
         + np.sin(2 * np.pi * hz("A2") * t) * 0.12) * lfo
drone *= env([(0, 0), (0.4, 0), (2.4, 0.55), (5.5, 0.75), (TB - 0.1, 0.8), (TB + 0.5, 0.0), (DUR, 0)])
drone = stereo(drone)

# ---------- 2. Tension : grappe aiguë la/si bémol + souffle filtré ----------
cl = np.zeros(N)
for f, ph in [(hz("A4"), 0), (hz("Bb4"), 1.3), (hz("A5"), 2.1)]:
    vib = 1 + 0.002 * np.sin(2 * np.pi * 4.7 * t + ph)
    cl += np.sin(2 * np.pi * f * vib * t + ph)
cl *= env([(0, 0), (2.6, 0), (4.6, 0.10), (TB - 0.4, 0.16), (TB, 0.0), (DUR, 0)])
pink = np.cumsum(rng.standard_normal(N)); pink = hp(pink, 20); pink /= np.abs(pink).max()
air = lp(pink, 380) * env([(0, 0), (0.3, 0.25), (TB - 1.2, 0.35), (TB - 0.05, 0.6), (TB + 0.6, 0.12), (TC, 0.1), (DUR, 0.05)])
tension = np.stack([cl * 0.9 + air, cl * 0.9 * 0.97 + np.roll(air, 900)], 1)
# montée de bruit filtré vers la bascule
rise = bp(rng.standard_normal(N), 300, 2500) * env([(0, 0), (TB - 1.6, 0), (TB - 0.05, 0.10), (TB + 0.02, 0), (DUR, 0)])
tension += stereo(rise)

# ---------- 3. Pulsation : battement sourd ----------
def thump(level=1.0, f0=62, dur=0.35):
    n = int(dur * SR); tt = np.arange(n) / SR
    f = f0 * (1 + 1.2 * np.exp(-tt * 40))
    s = np.sin(2 * np.pi * np.cumsum(f) / SR) * np.exp(-tt * 11)
    s += lp(rng.standard_normal(n), 900) * np.exp(-tt * 70) * 0.25
    return s * level

pulse = np.zeros(N)
beat_times = [O + i * BEAT for i in range(int((DUR - O) / BEAT) + 1)]
for bt in beat_times:
    if S["scenes"]["B"][0] - 0.05 <= bt < TB - 0.01:  # tension : chaque temps, en crescendo
        k = (bt - S["scenes"]["B"][0]) / (TB - S["scenes"]["B"][0])
        place(pulse, thump(0.35 + 0.35 * k), bt)
    elif TB <= bt < TC - 0.01:  # espoir : temps 1 et 3, plus doux
        idx = round((bt - O) / BEAT) % 4
        if idx in (0, 2): place(pulse, thump(0.42 if idx == 0 else 0.3, 55), bt)
pulse = stereo(lp(pulse, 1800))

# ---------- 4. Nappe (pad) : accords de l'espoir ----------
def saw_note(f, start, end, det=0.0, ph=0.0):
    i0, i1 = int(start * SR), int(end * SR)
    tt = np.arange(i1 - i0) / SR
    s = np.zeros(i1 - i0)
    ff = f * (1 + det)
    for k in range(1, int(7000 / ff) + 1):
        s += np.sin(2 * np.pi * ff * k * tt + ph * k) / k
    return i0, s

def chord_pad(notes, start, end, att=0.6, rel=1.2, lvl=1.0):
    out = np.zeros((N, 2))
    for j, n in enumerate(notes):
        f = hz(n)
        for c, d in enumerate([-0.0035, 0.0035]):
            i0, s = saw_note(f, start, min(end + rel, DUR), d, ph=rng.uniform(0, 6))
            n_ = len(s); tt = np.arange(n_) / SR
            e = np.minimum(1, tt / att) * np.where(tt > (end - start), np.exp(-(tt - (end - start)) / (rel / 3)), 1)
            out[i0:i0 + n_, c] += s * e * lvl / len(notes)
    return out

BARS = [O + i * BAR for i in range(12)]
b3 = 2  # index de la mesure de la bascule
prog = [
    (["Bb2", "F3", "A3", "C4", "D4"], BARS[b3], BARS[b3 + 1]),
    (["A2", "F3", "A3", "C4", "E4"], BARS[b3 + 1], BARS[b3 + 2]),
    (["G2", "D3", "F3", "A3", "Bb3"], BARS[b3 + 2], BARS[b3 + 3]),
    (["C3", "F3", "G3", "C4", "D4"], BARS[b3 + 3], BARS[b3 + 3] + 2 * BEAT),
    (["C3", "E3", "G3", "C4", "D4"], BARS[b3 + 3] + 2 * BEAT, BARS[b3 + 4]),
    (["F2", "C3", "G3", "A3", "C4"], BARS[b3 + 4], DUR - 0.3),
]
pad = np.zeros((N, 2))
for notes, a, b in prog:
    pad += chord_pad(notes, a, b, att=0.5 if a > TB + 0.1 else 0.9, rel=0.9)
bright = env([(0, 0), (TB, 0.0), (TC, 1.0), (DUR, 0.6)])[:, None]
pad = lp(pad, 900) * (1 - bright) + lp(pad, 2600) * bright
pad *= env([(0, 0), (TB - 0.3, 0), (TB + 0.6, 0.85), (TC, 1.0), (CARD2, 0.9), (DUR, 0.7)])[:, None]
# swell inversé qui arrive sur la bascule
sw = chord_pad(["Bb2", "F3", "A3", "C4", "D4"], 0, 1.4, att=0.05, rel=0.3)[:int(1.6 * SR)]
sw = reverb(sw, 2.2, 0.8)[::-1]
swell = np.zeros((N, 2)); i = int((TB - len(sw) / SR) * SR); swell[i:i + len(sw)] = sw[: N - i] * 0.9

# basse (sinus) sous les accords
bass = np.zeros(N)
for root, a, b in [("Bb1", BARS[b3], BARS[b3 + 1]), ("A1", BARS[b3 + 1], BARS[b3 + 2]), ("G1", BARS[b3 + 2], BARS[b3 + 3]),
                   ("C2", BARS[b3 + 3], BARS[b3 + 4]), ("F1", BARS[b3 + 4], DUR - 0.2)]:
    i0, i1 = int(a * SR), int(b * SR); tt = np.arange(i1 - i0) / SR
    bass[i0:i1] += np.sin(2 * np.pi * hz(root) * tt) * np.minimum(1, tt / 0.08) * np.minimum(1, (len(tt) / SR - tt) / 0.08)
bass = stereo(lp(bass, 200) * 0.7)

# ---------- 5. Piano feutré (synthèse) : arpège ----------
def piano(f, vel=0.6, dur=2.6):
    n = int(dur * SR); tt = np.arange(n) / SR
    s = np.zeros(n); B = 0.0004
    for k in range(1, 14):
        fk = f * k * np.sqrt(1 + B * k * k)
        if fk > 9000: break
        s += np.sin(2 * np.pi * fk * tt) * np.exp(-tt * (1.6 + 0.9 * k) * (0.7 + vel * 0.3)) / k ** 1.25
    s *= np.minimum(1, tt / 0.004)
    s += lp(rng.standard_normal(n), 2500) * np.exp(-tt * 120) * 0.04  # marteau feutré
    return lp(s, 1500 + 3000 * vel) * vel

arp = np.zeros((N, 2))
pat = {0: ["F4", "A4", "C5", "D5", "F5", "D5", "C5", "A4"],
       1: ["F4", "A4", "C5", "E5", "F5", "E5", "C5", "A4"],
       2: ["D4", "F4", "A4", "Bb4", "D5", "Bb4", "A4", "F4"],
       3: ["F4", "G4", "C5", "D5", "E5", "D5", "C5", "G4"]}
for bi in range(4):
    a = BARS[b3 + bi]
    for k, n in enumerate(pat[bi]):
        tt0 = a + k * BEAT / 2
        if bi == 0 and k not in (0, 4):  # 1re mesure : seulement deux notes, l'arpège s'installe ensuite
            continue
        vel = (0.42 if k % 2 == 0 else 0.3) * (0.85 + 0.1 * bi) * rng.uniform(0.92, 1.05)
        p = piano(hz(n), vel)
        pan = 0.5 + 0.18 * np.sin(k * 1.3 + bi)
        tmp = np.zeros((N, 2)); place(tmp[:, 0], p * (1 - pan) * 1.2, tt0 + rng.uniform(0, 0.008)); place(tmp[:, 1], p * pan * 1.2, tt0)
        arp += tmp
# accord final arpégé lentement sur la carte 1, et une note sur la carte 2
for k, n in enumerate(["F3", "C4", "G4", "A4", "C5"]):
    tmp = piano(hz(n), 0.4, 4.5); place(arp[:, 0], tmp * 0.6, TC + k * 0.06); place(arp[:, 1], tmp * 0.6, TC + k * 0.06 + 0.004)
for ch in (0, 1):
    place(arp[:, ch], piano(hz("F5"), 0.3, 3.5) * 0.7, CARD2 + 0.05)
arp = reverb(arp, 2.6, 0.35)

# ---------- Somme, queue de réverbe, sortie ----------
stems = {"drone": drone * 0.5, "tension": tension * 0.35, "pulse": pulse * 0.55, "pad": reverb(pad, 3.0, 0.4) * 0.55 + swell * 0.5,
         "bass": bass * 0.5, "arp": arp * 0.8}
fade = env([(0, 1), (DUR - 0.5, 1), (DUR, 0)])[:, None]
mix = sum(stems.values()) * fade
peak = np.abs(mix).max(); g = 0.5 / peak
for k, v in stems.items():
    sf.write(f"{ROOT}/music/stems/{k}.wav", (v * fade * g).astype(np.float32), SR, subtype="PCM_24")
sf.write(f"{ROOT}/music/music.wav", (mix * g).astype(np.float32), SR, subtype="PCM_24")
print("music", round(DUR, 2), "s · bpm", round(M["bpm"], 2), "· bascule", round(TB, 2), "· carte", round(TC, 2))
