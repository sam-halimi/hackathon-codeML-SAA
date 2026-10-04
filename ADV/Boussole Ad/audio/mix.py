#!/usr/bin/env python3
"""Mix et master de la pub Boussole « Pas à pas ».

    python3 mix.py ../timeline/timeline_vo.json [--sfx sfx.json] [--out out/]

- Voix : passe-haut 80 Hz, ni compresseur ni limiteur.
- Musique : ducking calculé (pas de sidechain, donc pas de pompage). Pendant les mots, la musique reste
  au moins 15 dB sous la voix (sonie momentanée, 400 ms). Remontée douce entre les phrases
  (attaque 250 ms avec anticipation, relâche 600 ms), et creux de 3 dB entre 1 et 4 kHz quand la voix parle.
- Effets : placés depuis sfx.json, égalisés, −6 dB pendant les mots sauf les clics synchrones.
- Master : −14 LUFS intégrés au gain, plafond −1 dBTP par un limiteur true-peak transparent
  (réduction ≤ 1 dB, vérifiée et notée dans le rapport).

Sorties : master.wav (48 kHz / 24 bits), stems/voix.wav, stems/musique.wav, stems/effets.wav
(gain de master appliqué, ils s'additionnent pour donner le master avant plafond), rapport.md.
"""
import argparse
import json
import os
import subprocess

import numpy as np
from scipy import signal
from scipy.ndimage import minimum_filter1d
from scipy.io import wavfile

SR = 48000
HERE = os.path.dirname(os.path.abspath(__file__))
ROOT = os.path.join(HERE, '..')
TARGET_LUFS, CEILING_DBTP, UNDER_DB = -14.0, -1.0, 15.0


def load(path, mono=False):
    tmp = os.path.join(HERE, '.tmp.wav')
    subprocess.run(['ffmpeg', '-v', 'error', '-y', '-i', path, '-ar', str(SR), '-ac', '1' if mono else '2', '-c:a', 'pcm_f32le', tmp], check=True)
    _, x = wavfile.read(tmp)
    os.remove(tmp)
    return x.astype(np.float64)


def save(path, x):
    tmp = path + '.f32.wav'
    wavfile.write(tmp, SR, x.astype(np.float32))
    subprocess.run(['ffmpeg', '-v', 'error', '-y', '-i', tmp, '-c:a', 'pcm_s24le', path], check=True)
    os.remove(tmp)


# ───────── Sonie (UIT-R BS.1770) ─────────

K1 = ([1.53512485958697, -2.69169618940638, 1.19839281085285], [1.0, -1.69065929318241, 0.73248077421585])
K2 = ([1.0, -2.0, 1.0], [1.0, -1.99004745483398, 0.99007225036621])


def kweight(x):
    return signal.lfilter(*K2, signal.lfilter(*K1, x, axis=0), axis=0)


def momentary(x, hop=0.01):
    """Sonie momentanée (fenêtre 400 ms) en LUFS, une valeur toutes les 10 ms."""
    ms = (kweight(x) ** 2).sum(axis=1)
    win, h = int(0.4 * SR), int(hop * SR)
    c = np.concatenate([[0], np.cumsum(ms)])
    idx = np.arange(0, len(ms), h)
    a = np.clip(idx - win // 2, 0, len(ms))
    b = np.clip(idx + win // 2, 0, len(ms))
    mean = (c[b] - c[a]) / np.maximum(b - a, 1)
    return idx / SR, -0.691 + 10 * np.log10(mean + 1e-12)


def integrated(x):
    ms = (kweight(x) ** 2).sum(axis=1)
    win, h = int(0.4 * SR), int(0.1 * SR)
    blocks = np.array([ms[i:i + win].mean() for i in range(0, len(ms) - win, h)])
    lk = -0.691 + 10 * np.log10(blocks + 1e-12)
    g = blocks[lk > -70]
    rel = -0.691 + 10 * np.log10(g.mean()) - 10
    g = blocks[(lk > -70) & (lk > rel)]
    return -0.691 + 10 * np.log10(g.mean())


def true_peak(x):
    return 20 * np.log10(np.abs(signal.resample_poly(x, 4, 1, axis=0)).max() + 1e-12)


# ───────── Traitements ─────────


def smooth_gain(db, attack=0.2, release=0.6, lookahead=0.3, hop=0.01):
    """Lisse une courbe de gain (dB) : descend en anticipant, remonte lentement."""
    n_la = int(lookahead / hop)
    want = np.lib.stride_tricks.sliding_window_view(np.pad(db, (0, n_la), mode='edge'), n_la + 1).min(axis=1)
    out = np.empty_like(want)
    g = 0.0
    a_c, r_c = np.exp(-hop / attack), np.exp(-hop / release)
    for i, w in enumerate(want):
        c = a_c if w < g else r_c
        g = w + (g - w) * c
        out[i] = g
    return out


def power_lufs(x, a, b):
    seg = kweight(x[int(a * SR):int(b * SR)])
    return -0.691 + 10 * np.log10((seg ** 2).sum(axis=1).mean() + 1e-12)


def duck_music(music, voice, speech):
    """Chaque phrase fixe son propre niveau de musique : 16 dB sous la sonie de la phrase, stable d'un mot à l'autre."""
    t, vo = momentary(voice)
    _, mu = momentary(music)
    levels = [power_lufs(voice, a, b) for a, b in speech]
    quiet = np.ones(len(music), dtype=bool)
    for a, b in speech:
        quiet[int(a * SR):int(b * SR)] = False
    music_ref = -0.691 + 10 * np.log10((kweight(music[quiet]) ** 2).sum(axis=1).mean() + 1e-12)
    base = (np.median(levels) - 9.0) - music_ref                # entre les phrases : 9 dB sous la voix, gain constant
    line_lvl = np.full_like(t, np.nan)
    for (a, b), lvl in zip(speech, levels):
        m = (t >= a - 0.2) & (t <= b + 0.1)
        line_lvl[m] = lvl
    talking = ~np.isnan(line_lvl)
    inside = np.zeros_like(t, dtype=bool)                        # strictement entre le premier et le dernier mot d'une phrase
    for a, b in speech:
        inside |= (t >= a) & (t <= b)
    need = np.where(talking, np.minimum(base, (np.nan_to_num(line_lvl) - UNDER_DB - 1.0) - mu), base)
    # Creux de 3 dB entre 1 et 4 kHz quand la voix parle (phase nulle, pas de coloration ailleurs)
    band = signal.sosfiltfilt(signal.butter(2, [1000, 4000], 'band', fs=SR, output='sos'), music, axis=0)
    w = np.interp(np.arange(len(music)) / SR, t, smooth_gain(np.where(talking, -1.0, 0.0), 0.15, 0.4))
    shaped = music - ((1 - 10 ** (-3 / 20)) * np.clip(-w, 0, 1))[:, None] * band
    active = inside & (vo >= np.nan_to_num(line_lvl, nan=99) - 6)   # instants où un mot est vraiment prononcé
    curve = smooth_gain(need)
    for _ in range(20):                                          # vérifie la règle après lissage, corrige si besoin
        g = np.interp(np.arange(len(music)) / SR, t, curve)
        _, mu2 = momentary(shaped * 10 ** (g / 20)[:, None])
        over = np.where(active, mu2 - (vo - UNDER_DB), -99)
        if over.max() <= 0:
            break
        curve = smooth_gain(np.minimum(curve, curve - np.maximum(over, 0) - 1.0))
    gain = 10 ** (np.interp(np.arange(len(music)) / SR, t, curve) / 20)
    return shaped * gain[:, None], active, vo


def place_sfx(L, sfx_list, speech, base_dir):
    bus = np.zeros((L, 2))
    for s in sfx_list:
        x = load(os.path.join(base_dir, s['file']))
        hp, lp = s.get('hp', 200), s.get('lp', 12000)
        x = signal.sosfilt(signal.butter(2, hp, 'high', fs=SR, output='sos'), x, axis=0)
        x = signal.sosfilt(signal.butter(2, lp, 'low', fs=SR, output='sos'), x, axis=0)
        if s.get('semitones'):
            x = signal.resample(x, int(len(x) / 2 ** (s['semitones'] / 12)))  # carillons accordés sur la gamme
        g = 10 ** (s.get('gain_db', -24) / 20)
        t = s['t']
        if not s.get('sync') and any(a <= t <= b for a, b in speech):
            g *= 10 ** (-6 / 20)
        i = int(t * SR)
        n = min(len(x), L - i)
        if n > 0:
            bus[i:i + n] += x[:n] * g
    return bus


def tp_limiter(x, ceiling_db, lookahead=0.0015, release=0.08):
    """Plafond true-peak transparent : n'agit que sur les crêtes qui dépassent."""
    up = np.abs(signal.resample_poly(x, 4, 1, axis=0)).max(axis=1).reshape(-1, 4).max(axis=1)[:len(x)]
    lim = 10 ** (ceiling_db / 20)
    need = np.minimum(1.0, lim / np.maximum(up, 1e-12))
    la = max(1, int(lookahead * SR))
    need = minimum_filter1d(need, size=la, origin=-(la // 2), mode='nearest')   # anticipe la crête
    g = np.empty_like(need)
    cur, rc = 1.0, np.exp(-1 / (release * SR))
    for i, n in enumerate(need):
        cur = n if n < cur else n + (cur - n) * rc
        g[i] = cur
    spots = []
    for i in np.argsort(g):                                      # les endroits où le plafond a le plus travaillé
        if g[i] > 10 ** (-0.5 / 20) or len(spots) >= 6:
            break
        if all(abs(i / SR - s) > 0.3 for s, _ in spots):
            spots.append((i / SR, 20 * np.log10(g[i])))
    return x * g[:, None], 20 * np.log10(g.min()), spots


def main():
    ap = argparse.ArgumentParser()
    ap.add_argument('timeline')
    ap.add_argument('--music', default=os.path.join(ROOT, 'music', 'out', 'music_mix.wav'))
    ap.add_argument('--sfx')
    ap.add_argument('--out', default=os.path.join(HERE, 'out'))
    args = ap.parse_args()
    with open(args.timeline, encoding='utf-8') as f:
        tl = json.load(f)
    L = int(tl['duration'] * SR)

    vo = load(os.path.join(ROOT, tl['vo']['file']), mono=True)
    vo = signal.sosfilt(signal.butter(2, 80, 'high', fs=SR, output='sos'), vo)
    voice = np.zeros((L, 2))
    i = int(round(tl['vo']['offset'] * SR))
    n = min(len(vo), L - i)
    voice[i:i + n] = vo[:n, None] * np.sqrt(0.5)                 # au centre

    music = load(args.music)[:L]
    music = np.pad(music, ((0, L - len(music)), (0, 0)))
    music_d, active, vo_m = duck_music(music, voice, tl['speech'])

    sfx = np.zeros((L, 2))
    if args.sfx:
        with open(args.sfx, encoding='utf-8') as f:
            sfx = place_sfx(L, json.load(f), tl['speech'], os.path.dirname(os.path.abspath(args.sfx)))

    pre = voice + music_d + sfx
    gain_db = TARGET_LUFS - integrated(pre)
    g = 10 ** (gain_db / 20)
    master, gr, spots = tp_limiter(pre * g, CEILING_DBTP - 0.1)

    os.makedirs(os.path.join(args.out, 'stems'), exist_ok=True)
    save(os.path.join(args.out, 'master.wav'), master)
    save(os.path.join(args.out, 'stems', 'voix.wav'), voice * g)
    save(os.path.join(args.out, 'stems', 'musique.wav'), music_d * g)
    save(os.path.join(args.out, 'stems', 'effets.wav'), sfx * g)

    _, mu_after = momentary(music_d)
    margin = (vo_m - mu_after)[active]
    per_line = [power_lufs(voice, a, b) - power_lufs(music_d, a, b) for a, b in tl['speech']]
    report = {
        'integrated_lufs': round(integrated(master), 2),
        'true_peak_dbtp': round(true_peak(master), 2),
        'master_gain_db': round(gain_db, 2),
        'limiter_max_reduction_db': round(-gr, 2),
        'music_under_voice_min_db': round(float(margin.min()), 1) if len(margin) else None,
        'music_under_voice_median_db': round(float(np.median(margin)), 1) if len(margin) else None,
        'music_under_voice_per_line_db': [round(float(v), 1) for v in per_line],
    }
    lines = ['# Rapport de mix', ''] + [f'- {k} : {v}' for k, v in report.items()]
    if report['limiter_max_reduction_db'] > 1.0:
        lines.append('- ⚠️ Le plafond a dû réduire de plus de 1 dB. Corriger au gain (clip gain) les syllabes concernées plutôt que d\'écraser la voix :')
        lines += [f'  - {t:.2f} s : {d:.1f} dB' for t, d in spots]
    if report['music_under_voice_min_db'] is not None and report['music_under_voice_min_db'] < UNDER_DB:
        lines.append('- ⚠️ La musique remonte à moins de 15 dB sous la voix par endroits.')
    with open(os.path.join(args.out, 'rapport.md'), 'w', encoding='utf-8') as f:
        f.write('\n'.join(lines) + '\n')
    print('\n'.join(lines))


if __name__ == '__main__':
    main()
