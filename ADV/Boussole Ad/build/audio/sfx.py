"""Effets sonores TEMPORAIRES, synthétisés en code, placés sur les repères de build/schedule.json.
La bibliothèque « FOUR Editors Sound Effects » (SSD) n'est pas accessible depuis la session cloud :
chaque effet garde son nom de catégorie pour être remplacé fichier par fichier par la bibliothèque.
Partie problème (avant la bascule) : retenue (moins de couches, passe-bas, stéréo étroite).
Partie produit : plus riche (stéréo large, couches, brillance).
Sorties : sfx/stems/<catégorie>.wav + sfx/cues.csv (liste des placements)."""
import json, os, csv
import numpy as np, soundfile as sf
from scipy.signal import butter, sosfilt

ROOT = os.path.abspath(os.path.join(os.path.dirname(__file__), "..", ".."))
S = json.load(open(f"{ROOT}/build/schedule.json"))
C = S["cue"]; SC = S["scenes"]; L = {l["id"]: l for l in S["lines"]}
SR = 48000; N = int((S["total"] + 0.2) * SR)
TB = S["music"]["bascule"]
rng = np.random.default_rng(11)
os.makedirs(f"{ROOT}/sfx/stems", exist_ok=True)

def sos(kind, f, order=2): return butter(order, f, kind, fs=SR, output="sos")
def filt(x, kind, f, order=2): return sosfilt(sos(kind, f, order), x)
def tt(d): return np.arange(int(d * SR)) / SR
def db(x): return 10 ** (x / 20)

# ---------- générateurs ----------
def whoosh(d=0.5, lo=300, hi=3500, peak=0.65, bright=1.0):
    """Bruit filtré dont le centre balaie lo -> hi -> lo (bancs de filtres croisés, sans artefacts de blocs)."""
    n = int(d * SR); x = rng.standard_normal(n); t_ = tt(d)
    fc = lo + (hi - lo) * np.sin(np.pi * np.clip(t_ / d, 0, 1)) ** 2 * bright
    centers = np.geomspace(150, 9000, 10)
    bands = [filt(x, "band", [c / 1.5, min(c * 1.5, SR / 2 - 100)]) for c in centers]
    wsum = np.zeros(n); out = np.zeros(n)
    for c, b in zip(centers, bands):
        wk = np.exp(-((np.log(c) - np.log(fc)) / 0.45) ** 2); out += b * wk; wsum += wk
    out /= wsum + 1e-9
    e = np.where(t_ < peak * d, (t_ / (peak * d)) ** 2.2, np.exp(-(t_ - peak * d) / (0.18 * d)))
    return out * e

def hit(f0=70, d=0.9, click=0.3, body=1.0):
    t_ = tt(d); f = f0 * (1 + 1.5 * np.exp(-t_ * 30))
    s = np.sin(2 * np.pi * np.cumsum(f) / SR) * np.exp(-t_ * 5.5) * body
    s += filt(rng.standard_normal(len(t_)), "low", 3000) * np.exp(-t_ * 60) * click
    return filt(s, "low", 4000)

def tick(f=3200, d=0.06, lvl=1.0):
    t_ = tt(d); s = filt(rng.standard_normal(len(t_)), "band", [1800, 7000]) * np.exp(-t_ * 220)
    s += np.sin(2 * np.pi * f * t_) * np.exp(-t_ * 90) * 0.5
    return s * lvl

def ui_click(f=1400, d=0.07, low=False):
    t_ = tt(d); s = np.sin(2 * np.pi * (f * (0.6 if low else 1)) * t_) * np.exp(-t_ * 140)
    s += filt(rng.standard_normal(len(t_)), "band", [900, 6000]) * np.exp(-t_ * 400) * 0.6
    s += np.sin(2 * np.pi * 180 * t_) * np.exp(-t_ * 60) * 0.25
    return s

def pop(f0=700, f1=1150, d=0.09):
    t_ = tt(d); f = np.linspace(f0, f1, len(t_))
    return np.sin(2 * np.pi * np.cumsum(f) / SR) * np.sin(np.pi * t_ / d) ** 1.5

def stop_mech(d=0.5):
    t_ = tt(d); s = hit(58, d, 0.6)
    for fk, dk in [(1730, 40), (2610, 55), (4120, 70)]:
        s += np.sin(2 * np.pi * fk * t_) * np.exp(-t_ * dk) * 0.12
    return s

def shimmer(d=2.4):  # signature logo : accordée en fa (fa, la, do, sol)
    t_ = tt(d); s = np.zeros(len(t_))
    for k, f in enumerate([1396.9, 1760.0, 2093.0, 2349.3, 2793.8]):
        s += np.sin(2 * np.pi * f * (1 + 0.003 * np.sin(2 * np.pi * 5.5 * t_ + k)) * t_ + k) * np.exp(-t_ * (1.6 + 0.4 * k)) * np.minimum(1, t_ / (0.03 + 0.03 * k))
    return s / 3

def seal(d=0.45):  # loquet métallique + bruit sourd
    t_ = tt(d); s = hit(90, d, 0.2, 0.7)
    s += filt(rng.standard_normal(len(t_)), "band", [2500, 9000]) * np.exp(-t_ * 160) * 0.6
    for fk in (3180, 4470): s += np.sin(2 * np.pi * fk * t_) * np.exp(-t_ * 45) * 0.08
    return s

def thud(d=0.4): return hit(48, d, 0.15, 1.0)

def typing(d=1.0, rate=14):
    out = np.zeros(int(d * SR)); tcur = 0.0
    while tcur < d - 0.05:
        c = ui_click(rng.uniform(1800, 2600), 0.03) * rng.uniform(0.3, 0.7)
        i = int(tcur * SR); out[i:i + len(c)] += c[: len(out) - i]
        tcur += rng.exponential(1 / rate) + 0.02
    return filt(out, "low", 6000)

def reverse_swell(d=1.0):
    x = filt(rng.standard_normal(int(d * SR)), "band", [400, 5000]); t_ = tt(d)
    return (x * np.exp(-t_ * 4.5))[::-1]

# ---------- placement ----------
stems = {k: np.zeros((N, 2)) for k in ["whoosh", "hits", "ui", "logo", "ticks"]}
log = []

def put(cat, name, sig, at, gain_db, pan=0.0, width=0.0, problem=None):
    """pan -1..1 ; width : décorrélation légère ; partie problème = passe-bas 8 kHz et stéréo étroite."""
    if problem is None: problem = at < TB - 0.05
    s = sig.copy()
    if problem:
        s = filt(s, "low", 8000); width *= 0.3; pan *= 0.4
    g = db(gain_db)
    l = s * g * np.sqrt(0.5 * (1 - pan)); r = s * g * np.sqrt(0.5 * (1 + pan))
    if width > 0:
        k = int(width * 0.012 * SR); r = np.concatenate([np.zeros(k), r])[: len(r)]
    i = int(at * SR)
    if i < 0: l, r, i = l[-i:], r[-i:], 0
    n = min(len(l), N - i)
    stems[cat][i:i + n, 0] += l[:n]; stems[cat][i:i + n, 1] += r[:n]
    log.append((cat, name, round(at, 3), gain_db))

def whoosh_into(at, d, gain, **kw):  # le pic du whoosh tombe sur `at`
    put("whoosh", f"whoosh {d:.2f}s", whoosh(d, **{k: v for k, v in kw.items() if k in ('lo', 'hi', 'bright')}), at - 0.65 * d, gain,
        pan=kw.get("pan", 0), width=kw.get("width", 0.6), problem=kw.get("problem"))

w = lambda lid, i: L[lid]["words"][i]

# A : titre — retenu
whoosh_into(C["a_title_in"] + 0.12, 0.55, -20, hi=2500)
for i in range(6): put("ticks", "tic mot", tick(2800 + 120 * i, lvl=0.6), w("s1", i)["t0"], -32)
put("hits", "hit feutré (expiration)", hit(62, 1.0, 0.15), w("s1", 5)["t0"] + 0.25, -18)
put("whoosh", "trait de la règle", whoosh(0.4, 1500, 6000, 0.3), C["a_rule"], -30, pan=0.3)
# B : compte à rebours — tics qui accélèrent (sous la voix)
whoosh_into(C["b_counter_in"] + 0.1, 0.5, -21)
ta, tb_ = C["b_counter_in"] + 0.2, C["b_lock"]
x = 0.0
while True:
    k = x  # 0..1
    if k >= 1: break
    at = ta + (tb_ - ta) * (1 - (1 - k) ** 0.55)
    if at >= tb_ - 0.03: break
    put("ticks", "tic horloge", tick(3000 + 2200 * k, 0.05, 0.8), at, -30 + 4 * k)
    x += 0.035 + 0.06 * (1 - k)
put("hits", "arrêt mécanique (00:00:00)", stop_mech(), C["b_lock"], -15)
put("whoosh", "swell inversé vers la bascule", reverse_swell(1.0), C["c_collapse"] - 0.9, -22, width=0.5)
# C : bascule + logo (moment le plus fort de la section)
whoosh_into(C["c_collapse"] + 0.08, 0.8, -15, lo=200, hi=4500, width=1.0, problem=False)
put("logo", "signature logo : impact", hit(55, 1.4, 0.25, 1.1), C["c_settle"] - 0.05, -10, problem=False)
put("logo", "signature logo : scintillement (fa)", shimmer(2.6), C["c_settle"] - 0.04, -20, width=1.0, problem=False)
for i in range(5):
    if i == 4: put("hits", "hit léger (nuit)", hit(80, 0.6, 0.2, 0.6), w("s3", 4)["t0"] + 0.1, -22)
    else: put("ticks", "tic lettrage", tick(2400, 0.04, 0.5), w("s3", i)["t0"], -34)
# D : règles
whoosh_into(C["d_panel_in"] + 0.25, 0.6, -16, width=1.0, pan=-0.2)
whoosh_into(C["d_text"] + 0.1, 0.35, -20, lo=800, hi=6000, pan=0.3)
put("hits", "hit (texte règles)", hit(75, 0.6, 0.35, 0.7), C["d_text"] + 0.1, -19)
put("ui", "pop loupe 18 h", pop(), C["d_loupe_18h"], -18, pan=0.35)
put("ui", "clic case prélèvement", ui_click(), C["d_click_cutane"], -14, pan=-0.3)
put("ui", "tic grave loupe sang", ui_click(900, low=True), C["d_loupe_sang"], -16, pan=0.3)
put("hits", "hit étiquette RÈGLES", hit(68, 0.7, 0.3, 0.8), C["d_loupe_sang"] + 0.25, -18)
# E : chronologie IA
whoosh_into(C["e_aiview"] + 0.18, 0.6, -16, width=1.0, pan=0.2)
for k in range(4): put("ui", "tic masque", tick(2600 + 300 * k, 0.04, 0.7), C["e_masks"] + k * 0.11, -24, pan=-0.4 + 0.2 * k)
put("ui", "clic Générer", ui_click(1200), C["e_click_generate"], -14, pan=-0.2)
whoosh_into(C["e_timeline"] + 0.05, 0.45, -17, pan=0.4, width=0.8)
put("ui", "texture données (frappe)", typing(0.9), C["e_timeline"], -24, pan=0.3, width=0.8)
put("whoosh", "swish filet source", whoosh(0.35, 2000, 8000, 0.4), C["e_source"] + 0.05, -22, pan=-0.3)
put("ui", "tic connexion source", tick(3600, 0.05), C["e_source"] + 0.42, -18, pan=-0.3)
whoosh_into(C["e_never"] + 0.12, 0.4, -19)
for k in range(3): put("ui", "tic ligne « Aucun… »", tick(2200, 0.05, 0.8), C["e_never"] + 0.18 + k * 0.22, -20, pan=-0.2 + 0.2 * k)
put("hits", "hit (ne juge personne)", hit(66, 0.8, 0.25, 0.8), w("s5", 11)["t0"] + 0.15, -17)
# F : validation
whoosh_into(C["f_in"] + 0.15, 0.45, -18, width=0.8, pan=-0.2)
for k, at in enumerate(C["f_clicks"]):
    low = (k == 4)  # 5e clic = « Rejeter »
    put("ui", "clic Rejeter" if low else "clic Valider", ui_click(1500 if not low else 1000, low=low), at, -13 if low else -15, pan=0.2 if k % 2 else -0.2)
put("hits", "hit (tout)", hit(70, 0.8, 0.35, 0.9), C["f_land"] + 0.1, -15)
# G : journal, scellé, altération
whoosh_into(C["g_in"] + 0.15, 0.5, -17, width=1.0, pan=0.25)
for k in range(3): put("ui", "micro-clic maillon", tick(4200, 0.03, 0.6), C["g_links"] + k * 0.13, -22, pan=0.3)
put("hits", "scellé (loquet) + hit", seal(), C["g_seal"] + 0.05, -12)
put("ui", "clic simuler modification", ui_click(1100), C["g_tamper_click"], -15, pan=-0.3)
put("hits", "choc sec (altération détectée)", thud(), C["g_tamper_result"], -14)
# Cartes
whoosh_into(C["card1_in"] + 0.2, 0.9, -15, lo=200, hi=4000, width=1.0)
put("logo", "signature logo (reprise courte) : impact", hit(55, 1.2, 0.2, 1.0), C["card1_land"] - 0.1, -12)
put("logo", "signature logo (reprise courte) : scintillement", shimmer(2.0), C["card1_land"] - 0.08, -23, width=1.0)
whoosh_into(C["card2_in"] + 0.15, 0.6, -22, width=0.8)

for k, v in stems.items():
    sf.write(f"{ROOT}/sfx/stems/{k}.wav", v.astype(np.float32), SR, subtype="PCM_24")
with open(f"{ROOT}/sfx/cues.csv", "w", newline="") as f:
    cw = csv.writer(f); cw.writerow(["categorie", "effet", "temps_s", "gain_dB"]); cw.writerows(sorted(log, key=lambda r: r[2]))
print(len(log), "effets placés")
