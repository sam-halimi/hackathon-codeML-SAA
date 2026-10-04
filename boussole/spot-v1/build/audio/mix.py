"""Mixage et master.
- VO : passe-haut 80 Hz, de-esser, compression douce 2:1. Aucun limiteur.
- Musique : atténuation pilotée par les mots, garantie >= 15 LU sous la VO (sonie momentanée 400 ms) pendant la parole,
  creux permanent 1,5-4 kHz, remonte entre les phrases.
- Effets : creux 2-5 kHz et plafond relatif pendant les mots (on place et on égalise, on ne retire rien).
- Bus M&E (musique + effets) : limiteur true-peak, seul limiteur du mix.
- Master : gain linéaire jusqu'à -14 LUFS ; pics de voix > -1 dBTP corrigés par gain de clip local, jamais par limiteur.
Sorties : stems/*.wav, stems/mix.wav, build/audio/report.json"""
import json, os, glob
import numpy as np, soundfile as sf, pyloudnorm as pyln
from scipy.signal import butter, sosfilt, lfilter, resample_poly
from scipy.ndimage import maximum_filter1d, minimum_filter1d, uniform_filter1d

ROOT = os.path.abspath(os.path.join(os.path.dirname(__file__), "..", ".."))
S = json.load(open(f"{ROOT}/build/schedule.json"))
SR = 48000; N = int(S["total"] * SR)
os.makedirs(f"{ROOT}/stems", exist_ok=True)

def load(p, stereo=True):
    x, sr = sf.read(p, always_2d=True); assert sr == SR
    if stereo and x.shape[1] == 1: x = np.repeat(x, 2, 1)
    x = x[:N]
    return np.pad(x, ((0, N - len(x)), (0, 0)))

def sos(kind, f, order=2): return butter(order, f, kind, fs=SR, output="sos")
def db(x): return 10 ** (x / 20)
def todb(x): return 20 * np.log10(np.maximum(x, 1e-9))

def kweight(x):
    b1, a1 = [1.53512485958697, -2.69169618940638, 1.19839281085285], [1, -1.69065929318241, 0.73248077421585]
    b2, a2 = [1.0, -2.0, 1.0], [1, -1.99004745483398, 0.99007225036621]
    return lfilter(b2, a2, lfilter(b1, a1, x, axis=0), axis=0)

def momentary(x):  # sonie momentanée (fenêtre 400 ms), échantillonnée tous les 10 ms
    z = (kweight(x) ** 2).sum(1)
    m = uniform_filter1d(z, int(0.4 * SR), mode="constant")
    return -0.691 + 10 * np.log10(np.maximum(m[::480], 1e-12))

def true_peak(x):
    return todb(np.abs(resample_poly(x, 4, 1, axis=0)).max())

def smooth_gain(g_db, att=0.06, rel=0.25, hop=480):
    """g_db échantillonné tous les `hop` ; attaque rapide vers le bas, relâchement lent vers le haut."""
    out = np.empty_like(g_db); cur = g_db[0]
    ka = 1 - np.exp(-hop / SR / att); kr = 1 - np.exp(-hop / SR / rel)
    for i, v in enumerate(g_db):
        cur += (v - cur) * (ka if v < cur else kr); out[i] = cur
    return out

def upsample_gain(g, hop=480):
    return np.interp(np.arange(N), np.arange(len(g)) * hop, g)

# ---------- masque de parole (mots) ----------
speech = np.zeros(N, bool)
for l in S["lines"]:
    for a, b in l["segs"]:
        speech[int((a - 0.03) * SR):int((b + 0.08) * SR)] = True
hop = 480; sp_h = speech[::hop][: N // hop + 1]

# ---------- VO ----------
vo = load(f"{ROOT}/voice/vo_edit.wav")
vo = sosfilt(sos("high", 80), vo, axis=0)
# de-esser : réduit la bande 5-9 kHz quand elle dépasse le seuil
band = sosfilt(sos("band", [5000, 9000]), vo, axis=0)
benv = uniform_filter1d(np.abs(band).max(1), 240)
red = np.clip(todb(benv) - (todb(np.percentile(benv[speech], 90)) - 1), 0, 6)
vo = vo - band * (1 - db(-red))[:, None]
# compression 2:1, détecteur RMS (attaque 10 ms, relâchement 120 ms)
lvl = todb(np.sqrt(np.maximum(uniform_filter1d((vo ** 2).mean(1), 480), 0)))
thr = np.percentile(lvl[speech], 75) - 2
gr = -np.clip(lvl - thr, 0, None) * 0.5
vo *= db(upsample_gain(smooth_gain(gr[::hop], 0.01, 0.12)))[:, None]

# ---------- musique : creux 1,5-4 kHz + atténuation sous la voix ----------
mus = load(f"{ROOT}/music/music.wav")
mid = sosfilt(sos("band", [1500, 4000]), mus, axis=0); mus = mus - mid * (1 - db(-4))
MUSIC_BASE = -6.0  # niveau de base de la musique (dB) avant atténuation
mus *= db(MUSIC_BASE)

def duck_music(mus, vo):
    mv, mm = momentary(vo), momentary(mus)
    n = min(len(mv), len(mm), len(sp_h)); mv, mm, act = mv[:n], mm[:n], sp_h[:n]
    need = np.where(act, np.minimum(0, (mv - 17.0) - mm), 0.0)   # 17 dB visés, 15 garantis
    # remonte entre les phrases : au plus +5 dB au-dessus de l'atténuation voisine
    near = minimum_filter1d(np.where(act, need, 0.0), 60)          # ±300 ms
    g = np.where(act, need, np.minimum(0, near + 5))
    g = minimum_filter1d(g, 9)                                     # anticipation ~40 ms
    g = smooth_gain(np.concatenate([g, [g[-1]]]), 0.04, 0.25)
    return mus * db(upsample_gain(g))[:, None]

mus_d = duck_music(mus, vo)
# correction itérative : là où l'écart mesuré reste < 16 LU pendant un mot, on abaisse encore la musique
extra = np.zeros(N // hop + 2)
for it in range(8):
    mv, mm = momentary(vo), momentary(mus_d)
    n = min(len(mv), len(mm), len(sp_h)); act = sp_h[:n] & (mv[:n] > -45)
    short = np.where(act, np.clip(16.5 - (mv[:n] - mm[:n]), 0, None), 0)
    if short.max() < 0.05: break
    short = maximum_filter1d(short, 41)  # la sonie momentanée regarde 400 ms en arrière
    extra[:n] -= short
    g = smooth_gain(np.concatenate([extra, [extra[-1]]])[: len(extra)], 0.03, 0.25)
    mus_d = duck_music(mus, vo) * db(upsample_gain(g))[:, None]

# ---------- effets ----------
sfx = {os.path.basename(p)[:-4]: load(p) for p in sorted(glob.glob(f"{ROOT}/sfx/stems/*.wav"))}
vo_env = maximum_filter1d(np.abs(vo).max(1), 2400)
sp_s = uniform_filter1d(speech.astype(float), 2400)  # masque adouci (50 ms)
for k, x in sfx.items():
    b = sosfilt(sos("band", [2000, 5000]), x, axis=0)
    x = x - b * (1 - db(-6)) * sp_s[:, None]
    env = maximum_filter1d(np.abs(x).max(1), 2400)
    ceil = vo_env * db(-10)
    g = np.where(sp_s > 0.5, np.clip(ceil / np.maximum(env, 1e-9), db(-8), 1), 1)
    sfx[k] = x * uniform_filter1d(g, 960)[:, None]
sfx_sum = sum(sfx.values())

# ---------- bus M&E + limiteur true-peak (seul limiteur du mix) ----------
def tp_limit(x, ceil_db, look=0.005, rel=0.08):
    up = resample_poly(x, 4, 1, axis=0); pk = np.abs(up).max(1).reshape(-1, 4).max(1)[: len(x)]
    pk = np.pad(pk, (0, len(x) - len(pk)), constant_values=pk[-1] if len(pk) else 0)
    need = np.minimum(1, db(ceil_db) / np.maximum(pk, 1e-9))
    need = minimum_filter1d(need, int(look * SR) * 2 + 1)
    g = np.empty_like(need); cur = 1.0; kr = 1 - np.exp(-1 / SR / rel)
    for i, v in enumerate(need):
        cur = v if v < cur else cur + (v - cur) * kr; g[i] = cur
    return x * uniform_filter1d(g, int(look * SR))[:, None]

meter = pyln.Meter(SR)
G = 0.0; me_ceiling = None
for it in range(4):
    me = mus_d + sfx_sum
    if me_ceiling is not None: me = tp_limit(me, me_ceiling)
    mix = vo + me
    G = -14.0 - meter.integrated_loudness(mix)
    me_ceiling = -1.5 - G
mixg = (vo + me) * db(G)

# ---------- pics : gain de clip local sur la VO (pas de limiteur) ----------
vo_clip = np.ones(N)
for it in range(6):
    tp = true_peak(mixg)
    if tp <= -1.0: break
    up = np.abs(resample_poly(mixg, 4, 1, axis=0)).max(1).reshape(-1, 4).max(1)[:N]
    up = np.pad(up, (0, N - len(up)))
    over = np.clip(todb(up) - (-1.1), 0, None)
    red = maximum_filter1d(over, int(0.03 * SR))
    vo_clip *= db(-uniform_filter1d(red, int(0.01 * SR)))
    mixg = (vo * vo_clip[:, None] + me) * db(G)
    G2 = -14.0 - meter.integrated_loudness(mixg); mixg *= db(G2); G += G2

vo_f = vo * vo_clip[:, None] * db(G); mus_f = mus_d * db(G); me_f = me * db(G)
sfx_f = {k: v * db(G) for k, v in sfx.items()}

# ---------- mesures ----------
mv, mm = momentary(vo_f), momentary(mus_f)
n = min(len(mv), len(mm), len(sp_h)); act = sp_h[:n] & (mv[:n] > -45)
diff = (mv[:n] - mm[:n])[act]
rep = {
    "integrated_LUFS": round(meter.integrated_loudness(mixg), 2),
    "true_peak_dBTP": round(true_peak(mixg), 2),
    "LRA": round(float(np.percentile(momentary(mixg), 95) - np.percentile(momentary(mixg)[momentary(mixg) > -70], 10)), 1),
    "vo_minus_music_LU_during_words": {"min": round(float(diff.min()), 1), "p5": round(float(np.percentile(diff, 5)), 1),
                                       "median": round(float(np.median(diff)), 1), "share_ge_15": round(float((diff >= 15).mean()), 4)},
    "master_gain_dB": round(G, 2), "me_limiter_ceiling_dBTP_post_gain": -1.5,
    "vo_clip_gain_max_reduction_dB": round(float(-todb(vo_clip.min())), 2),
    "limiter_on_voice": False,
}
for k, v in {"vo": vo_f, "music": mus_f, "me": me_f, "mix": mixg, **{f"sfx_{k}": v for k, v in sfx_f.items()}}.items():
    sf.write(f"{ROOT}/stems/{k}.wav", v.astype(np.float32), SR, subtype="PCM_24")
json.dump(rep, open(f"{ROOT}/build/audio/report.json", "w"), indent=1)
print(json.dumps(rep, indent=1))
