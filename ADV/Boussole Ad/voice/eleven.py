#!/usr/bin/env python3
"""Voix de la pub Boussole « Pas à pas » avec ElevenLabs (à lancer sur le Mac).

Rien ne coûte de crédits sans --go : chaque commande payante affiche d'abord son estimation.
Clé lue dans la variable d'environnement ELEVENLABS_API_KEY (jamais écrite dans le repo).

    python3 eleven.py credits                       crédits restants et coût de chaque étape
    python3 eleven.py search                        voix françaises (Canada), femme : liste et extraits gratuits
    python3 eleven.py test VOICE_ID [VOICE_ID ...]  phrase test (L1 + L11) par voix         [--go]
    python3 eleven.py takes VOICE_ID                deux prises du script, en un seul appel  [--go]

Sorties : previews/ (extraits gratuits), tests/<voix>.wav, takes/take1.wav, takes/take2.wav,
          takes/take{1,2}.alignment.json (horodatage de chaque caractère).
"""
import base64
import json
import os
import subprocess
import sys
import urllib.parse
import urllib.request

HERE = os.path.dirname(os.path.abspath(__file__))
API = 'https://api.elevenlabs.io/v1'
MODEL = 'eleven_multilingual_v2'
SETTINGS = {'stability': 0.60, 'similarity_boost': 0.75, 'style': 0.15, 'use_speaker_boost': True, 'speed': 0.90}
OUTPUT = os.environ.get('ELEVEN_OUTPUT', 'pcm_48000')   # mp3_44100_192 si l'offre ne permet pas le PCM 48 kHz

# Script verrouillé (brief v2, §2). « Boussole » est écrit « Boussol » pour la prononciation [bu.sɔl].
LINES = [
    "Après ce que vous avez vécu, vous êtes au bon endroit.",
    "Boussol vous guide, une étape à la fois.",
    "Et c'est vous qui décidez.",
    "Racontez une seule fois, à votre rythme.",
    "Votre récit reste chiffré, rien qu'à vous.",
    "On vous montre où aller, tout près de chez vous.",
    "Quelqu'un pour vous écouter, quand vous le voulez.",
    "Et quand vous êtes prête, on prépare votre dossier.",
    "Une avocate ou un avocat vous rappelle, au moment qui vous convient.",
    "Des services gratuits, financés par l'État, réunis au même endroit.",
    "Boussol. Pas à pas, avec vous.",
]
# Respirations du brief : / petite pause, // respiration, /// longue respiration (entre les lignes)
PAUSES = [0.7, 0.4, 1.0, 0.3, 0.6, 0.5, 0.6, 0.4, 0.6, 1.0]
TEST = "Après ce que vous avez vécu, vous êtes au bon endroit. <break time=\"0.8s\" /> Boussol. Pas à pas, avec vous. <break time=\"0.8s\" /> Boussole."
TAKE_GAP = 2.0


def script():
    parts = []
    for i, line in enumerate(LINES):
        parts.append(line)
        if i < len(PAUSES):
            parts.append(f'<break time="{PAUSES[i]:.1f}s" />')
    return ' '.join(parts)


def two_takes():
    s = script()
    return f'{s} <break time="{TAKE_GAP:.1f}s" /> {s}'


def billable(text):
    # Les balises de pause ne sont pas lues ; on les compte quand même, par prudence.
    return len(text)


def key():
    k = os.environ.get('ELEVENLABS_API_KEY')
    if not k:
        sys.exit('ELEVENLABS_API_KEY manquante (variable d\'environnement).')
    return k


def call(path, body=None, query=None):
    url = f'{API}{path}' + (f'?{urllib.parse.urlencode(query)}' if query else '')
    req = urllib.request.Request(url, data=json.dumps(body).encode() if body is not None else None,
                                 headers={'xi-api-key': key(), 'Content-Type': 'application/json'})
    with urllib.request.urlopen(req, timeout=180) as r:
        return json.loads(r.read())


def to_wav(audio_b64, path):
    raw = base64.b64decode(audio_b64)
    os.makedirs(os.path.dirname(path), exist_ok=True)
    if OUTPUT.startswith('pcm_'):
        rate = OUTPUT.split('_')[1]
        cmd = ['ffmpeg', '-v', 'error', '-y', '-f', 's16le', '-ar', rate, '-ac', '1', '-i', 'pipe:0', '-c:a', 'pcm_s24le', path]
    else:
        cmd = ['ffmpeg', '-v', 'error', '-y', '-i', 'pipe:0', '-ar', '48000', '-c:a', 'pcm_s24le', path]
    subprocess.run(cmd, input=raw, check=True)


def tts(voice, text):
    return call(f'/text-to-speech/{voice}/with-timestamps', {'text': text, 'model_id': MODEL, 'voice_settings': SETTINGS},
                {'output_format': OUTPUT})


def need_go(cost):
    if '--go' not in sys.argv:
        sys.exit(f'Estimation : {cost} crédits. Rien n\'a été dépensé. Relancer avec --go pour générer.')


def cmd_credits():
    sub = call('/user/subscription')
    left = sub['character_limit'] - sub['character_count']
    print(f"Crédits restants : {left} / {sub['character_limit']} (offre {sub.get('tier')})")
    print(f'  phrase test, par voix : {billable(TEST)}')
    print(f'  deux prises du script : {billable(two_takes())}')
    print(f'  total prévu (3 voix + 2 prises) : {3 * billable(TEST) + billable(two_takes())}')


def cmd_search():
    res = call('/shared-voices', query={'language': 'fr', 'gender': 'female', 'page_size': 100})
    voices = res.get('voices', [])
    ca = [v for v in voices if 'canad' in (v.get('accent') or '').lower() or 'qu' in (v.get('accent') or '').lower()]
    picks = ca or voices
    os.makedirs(os.path.join(HERE, 'previews'), exist_ok=True)
    rows = ['| Voix | voice_id | Accent | Âge | Usage | Description | Extrait |', '|---|---|---|---|---|---|---|']
    for v in picks[:40]:
        prev = v.get('preview_url')
        if prev:
            name = f"previews/{v['voice_id']}.mp3"
            try:
                urllib.request.urlretrieve(prev, os.path.join(HERE, name))
            except Exception:
                name = prev
        rows.append(f"| {v.get('name')} | `{v['voice_id']}` | {v.get('accent')} | {v.get('age')} | {v.get('use_case')} | "
                    f"{(v.get('description') or '').replace('|', '/')[:90]} | {name if prev else '—'} |")
    with open(os.path.join(HERE, 'voices.md'), 'w', encoding='utf-8') as f:
        f.write('# Voix candidates (bibliothèque ElevenLabs, extraits gratuits)\n\n' + '\n'.join(rows) + '\n')
    print(f'{len(picks)} voix ({"accent canadien" if ca else "français, tous accents"}) → voices.md et previews/')


def cmd_test(voices):
    need_go(billable(TEST) * len(voices))
    for v in voices:
        r = tts(v, TEST)
        to_wav(r['audio_base64'], os.path.join(HERE, 'tests', f'{v}.wav'))
        print('ok', v)


def cmd_takes(voice):
    text = two_takes()
    need_go(billable(text))
    r = tts(voice, text)
    os.makedirs(os.path.join(HERE, 'takes'), exist_ok=True)
    full = os.path.join(HERE, 'takes', 'both.wav')
    to_wav(r['audio_base64'], full)
    al = r.get('normalized_alignment') or r['alignment']
    chars, starts, ends = al['characters'], al['character_start_times_seconds'], al['character_end_times_seconds']
    spoken = ''.join(chars)
    first = spoken.find(LINES[0])
    second = spoken.find(LINES[0], first + len(LINES[0]))
    if second < 0:
        sys.exit('Impossible de séparer les deux prises : vérifier takes/both.wav à l\'oreille.')
    cut = (ends[second - 1] + starts[second]) / 2 if second > 0 else starts[second]
    last_end = max(e for c, e in zip(chars, ends) if c.strip())
    for n, (a, b, i0, i1) in enumerate(((0.0, cut, 0, second), (cut, last_end + 0.6, second, len(chars))), 1):
        subprocess.run(['ffmpeg', '-v', 'error', '-y', '-i', full, '-ss', f'{a:.3f}', '-to', f'{b:.3f}', '-c:a', 'pcm_s24le',
                        os.path.join(HERE, 'takes', f'take{n}.wav')], check=True)
        sub = {'offset': a, 'characters': chars[i0:i1],
               'start': [round(s - a, 3) for s in starts[i0:i1]], 'end': [round(e - a, 3) for e in ends[i0:i1]]}
        with open(os.path.join(HERE, 'takes', f'take{n}.alignment.json'), 'w', encoding='utf-8') as f:
            json.dump(sub, f, ensure_ascii=False)
    print('takes/take1.wav et takes/take2.wav, avec leurs horodatages. Écoute-les, puis : python3 vo_timeline.py takes/take1')


if __name__ == '__main__':
    args = [a for a in sys.argv[1:] if a != '--go']
    if not args:
        sys.exit(__doc__)
    {'credits': lambda: cmd_credits(), 'search': lambda: cmd_search(),
     'test': lambda: cmd_test(args[1:]), 'takes': lambda: cmd_takes(args[1])}[args[0]]()
