#!/usr/bin/env python3
"""Recale le film sur la prise de voix retenue (l'image suit la voix, jamais l'inverse).

    python3 vo_timeline.py takes/take1 [sortie.json]

Lit takes/take1.alignment.json (horodatage de chaque caractère, fourni par ElevenLabs) et écrit
../timeline/timeline_vo.json : début et fin de chaque ligne, chaque mot (pour la typo cinétique),
intervalles de parole (pour le ducking et le célesta), et les repères des scènes, calculés avec
les mêmes écarts que le déroulé du brief v2 (§3).
"""
import json
import os
import re
import sys

from eleven import LINES

HERE = os.path.dirname(os.path.abspath(__file__))
VO_START = 0.7          # la première ligne commence à 0,7 s dans le film (brief §3)


def main(prefix, dest=None):
    with open(os.path.join(HERE, prefix + '.alignment.json'), encoding='utf-8') as f:
        al = json.load(f)
    chars, starts, ends = al['characters'], al['start'], al['end']
    text = ''.join(chars)

    lines, cursor = [], 0
    for line in LINES:
        i = text.find(line, cursor)
        if i < 0:
            sys.exit(f'Ligne introuvable dans la prise : « {line} »')
        j = i + len(line)
        lines.append({'text': line.replace('Boussol', 'Boussole'), 'start': starts[i], 'end': ends[j - 1], 'i': i, 'j': j})
        cursor = j
    shift = VO_START - lines[0]['start']

    words = []
    for k, ln in enumerate(lines):
        for m in re.finditer(r"[^\s]+", text[ln['i']:ln['j']]):
            a, b = ln['i'] + m.start(), ln['i'] + m.end()
            word = m.group().replace('Boussol', 'Boussole')
            words.append({'line': k + 1, 'text': word, 'start': round(starts[a] + shift, 3), 'end': round(ends[b - 1] + shift, 3)})
    L = [{'n': k + 1, 'text': ln['text'], 'start': round(ln['start'] + shift, 3), 'end': round(ln['end'] + shift, 3)} for k, ln in enumerate(lines)]
    s = lambda n: L[n - 1]['start']
    e = lambda n: L[n - 1]['end']

    # Mêmes écarts que le déroulé du brief (version 34 s)
    fin = e(10) + 0.1
    logo = min(fin + 0.8, s(11) - 0.2)
    made_by = e(11) + 2.2
    sections = {
        'ouverture': 0.0,
        'arrivee': 0.6,
        'compte': s(2) - 0.1,
        'etapes': s(3) - 0.2,
        'accueil': e(3) + 1.0,
        'recit': s(4) + 0.6,
        'ou_aller': s(6) - 0.2,
        'dossier': s(8) - 0.2,
        'rappel': s(9) - 0.2,
        'reunis': s(10) - 0.2,
        'souffle': e(10) - 0.7,
        'fin': fin,
        'made_by': made_by,
    }
    out = {
        '_note': f'Généré par vo_timeline.py depuis {prefix}. La voix est posée à {shift:+.3f} s.',
        'vo': {'file': f'voice/{prefix}.wav', 'offset': round(shift, 3)},
        'duration': round(made_by + 3.2, 2),
        'bpm': 72,
        'logo': round(logo, 3),
        'sections': {k: round(v, 3) for k, v in sections.items()},
        'speech': [[ln['start'], ln['end']] for ln in L],
        'lines': L,
        'words': words,
    }
    dest = dest or os.path.join(HERE, '..', 'timeline', 'timeline_vo.json')
    os.makedirs(os.path.dirname(dest), exist_ok=True)
    with open(dest, 'w', encoding='utf-8') as f:
        json.dump(out, f, ensure_ascii=False, indent=1)
    body = sections['fin']
    print(f'{os.path.relpath(dest)} : corps {body:.1f} s, logo à {logo:.2f} s, film {made_by + 2.0:.1f} s')
    for ln in L:
        print(f"  L{ln['n']:<2} {ln['start']:6.2f} → {ln['end']:6.2f}  {ln['text']}")


if __name__ == '__main__':
    main(sys.argv[1] if len(sys.argv) > 1 else 'takes/take1', sys.argv[2] if len(sys.argv) > 2 else None)
