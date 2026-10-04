"""Montage de la VO : prise A de Soraya, phrase 4 retirée (coupe de secours du brief),
silences resserrés, tempo x1.04 (rubberband, hauteur conservée).
Sorties : voice/vo_edit.wav (48 kHz mono) + build/timing.json (phrases et mots)."""
import json, subprocess, numpy as np, soundfile as sf, os, re

ROOT = os.path.abspath(os.path.join(os.path.dirname(__file__), "..", ".."))
SRC = f"{ROOT}/voice/takes/soraya_2takes.wav"
TEMPO = 1.04
SR = 48000

# (id, début, fin dans la prise brute, texte affiché, sous-segments bruts)
LINES = [
    ("s1", 0.00, 2.24, "La preuve a une date d'expiration.", [(0.00, 2.24)]),
    ("s2", 2.63, 6.61, "Après vingt-quatre heures, le sang ne révèle plus la plupart des drogues.", [(2.63, 6.61)]),
    ("s3", 6.99, 8.93, "On répare la première nuit.", [(6.99, 8.93)]),
    ("s5", 12.13, 17.31, "L'IA, Claude, range les notes, cite ses sources, et ne juge personne.",
     [(12.13, 12.61), (12.86, 14.53), (14.73, 15.81), (16.11, 17.31)]),
    ("s6", 17.89, 19.81, "Le soignant valide tout.", [(17.89, 19.81)]),
    ("s7", 20.28, 21.69, "Chaque geste est scellé.", [(20.28, 21.69)]),
    ("c1", 22.46, 23.18, "Boussole.", [(22.46, 23.18)]),
    ("c2", 23.97, 26.30, "L'IA guide, l'humain décide.", [(23.97, 24.91), (25.22, 26.30)]),
]
# silence avant chaque ligne (s, temps final)
GAPS = {"s1": 0.25, "s2": 0.33, "s3": 0.40, "s5": 1.90, "s6": 0.33, "s7": 0.30, "c1": 1.10, "c2": 0.40}
PRE, POST = 0.04, 0.10
CHUNKS = {"s5": ["L'IA,", "Claude, range les notes,", "cite ses sources,", "et ne juge personne."]}

x, sr = sf.read(SRC)
assert sr == SR

def stretch(seg):
    tmp_in, tmp_out = "/tmp/_vo_in.wav", "/tmp/_vo_out.wav"
    sf.write(tmp_in, seg, SR, subtype="FLOAT")
    subprocess.run(["ffmpeg", "-v", "error", "-y", "-i", tmp_in, "-af",
                    f"rubberband=tempo={TEMPO}:pitch=1:formant=preserved:pitchq=quality:transients=smooth",
                    "-ar", str(SR), tmp_out], check=True)
    y, _ = sf.read(tmp_out)
    return y

def fade(y, n=int(0.012 * SR)):
    y = y.copy(); r = np.linspace(0, 1, n)
    y[:n] *= r; y[-n:] *= r[::-1]; return y

def syllables(w):
    return max(1, len(re.findall(r"[aeiouyàâéèêëîïôûùü]+", w.lower())))

out = []; t = 0.0; timing = {"tempo": TEMPO, "lines": []}
for lid, a, b, text, subs in LINES:
    t += GAPS[lid]
    a0 = max(0, a - PRE); b0 = b + POST
    y = fade(stretch(x[int(a0 * SR):int(b0 * SR)]))
    start = t
    out.append((start, y))
    # sous-segments en temps final
    segs = [(start + (sa - a0) / TEMPO, start + (sb - a0) / TEMPO) for sa, sb in subs]
    # mots : répartis par syllabes dans chaque sous-segment (approximation, sans alignement fourni)
    words = text.split()
    chunks = CHUNKS.get(lid) or (re.split(r"(?<=,)\s+", text) if len(segs) > 1 else [text])
    if len(chunks) != len(segs):
        chunks = [text]; segs = [(segs[0][0], segs[-1][1])]
    wl = []
    for (ss, se), ch in zip(segs, chunks):
        ws = ch.split(); syl = [syllables(w) for w in ws]; tot = sum(syl); cur = ss
        for w, s in zip(ws, syl):
            d = (se - ss) * s / tot
            wl.append({"w": w, "t0": round(cur, 3), "t1": round(cur + d, 3)}); cur += d
    timing["lines"].append({"id": lid, "text": text, "t0": round(segs[0][0], 3), "t1": round(segs[-1][1], 3),
                            "segs": [[round(s, 3), round(e, 3)] for s, e in segs], "words": wl})
    t = start + len(y) / SR - POST / TEMPO

total = t + 4.0
buf = np.zeros(int((total + 1) * SR))
for s, y in out:
    i = int(s * SR); buf[i:i + len(y)] += y
buf = buf[:int(total * SR)]
sf.write(f"{ROOT}/voice/vo_edit.wav", buf, SR, subtype="PCM_24")
timing["vo_end"] = round(t, 3)
json.dump(timing, open(f"{ROOT}/build/timing.json", "w"), ensure_ascii=False, indent=1)
for l in timing["lines"]:
    print(f'{l["id"]}  {l["t0"]:6.2f} - {l["t1"]:6.2f}  {l["text"]}')
