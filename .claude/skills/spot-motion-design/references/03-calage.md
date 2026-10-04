# 03 · Calage de l'image sur la voix

Le montage se déduit de la voix, jamais l'inverse.

## 1. `audio/analyser_voix.py` (faster-whisper, modèle `small`, sur le processeur, en `int8`)

- Transcrit avec `word_timestamps=True`, `language="fr"`, `beam_size=5`.
- Aligne le texte attendu (`texte_voix.txt`, une phrase par ligne) sur les mots reconnus (`difflib.SequenceMatcher` sur des mots normalisés).
- Écrit un JSON à côté de chaque prise : durée, exactitude, mots par seconde, confiance, pauses longues, puis pour chaque phrase son début, sa fin et sa couverture, et pour chaque mot ses horodatages.
- **À adapter** : la table `NOMBRES` (chiffres du texte vers mots prononcés). La normalisation gère déjà « 9h » → « neuf heures », « 18 000 » → « dix-huit mille » et « $ » → « dollars ».

## 2. `audio/caler.py` → `src/<projet>/minutage.json`

Paramètres en tête de fichier :

| Constante | NOVA | Rôle |
|---|---|---|
| `PRE_ROLL` | 0,75 s | Image avant le premier mot (l'horloge s'installe) |
| `TENUE_LOGO` | 1,3 s | Logo tenu après le dernier mot |
| `CARTON` | 2,0 s | Carton de fin animé |
| `FPS` | 60 | Images par seconde |
| `MOTS_CLES` | 47 entrées | `(nom, n° de phrase, mot, occurrence)` : instants des gestes |

Corrections automatiques :
- **Début de phrase corrigé par `silencedetect`** (−40 dB, 0,18 s). Whisper colle parfois le premier mot au silence précédent : on reprend la fin du silence.
- **Mots-clés cherchés dans la fenêtre de leur phrase.** La normalisation enlève les accents et le préfixe « l' » (« l'assistant » devient « assistant »). Un mot-clé introuvable prend le début de la phrase, avec un avertissement : corrige le mot ou l'occurrence.

Format produit :
```json
{"fps": 60, "pre_roll": 0.75, "voix": "prise1.mp3", "duree_voix": 60.8,
 "debut_carton": 61.59, "duree_totale": 63.59, "images": 3815,
 "phrases": [{"texte": "…", "debut": 0.75, "fin": 2.1}, …],
 "cles": {"mercredi": 0.78, "vingt_deux": 17.2, …}}
```

## 3. Utiliser le minutage

`src/<projet>/temps.ts` lit `minutage.json` :
- `P(n)` : début de la phrase n ; `PF(n)` : sa fin ; `K("mot")` : instant d'un mot-clé.
- `SCENES` : fenêtre de chaque scène, dérivée des débuts de phrases avec de petits décalages (une scène commence 0,05 à 0,45 s avant sa phrase pour que l'image arrive avec la voix). NOVA : `vert: [P(3) - 0.25, P(4) - 0.08]`.
- **Les mêmes formules sont recopiées dans `audio/composer.py`** (dictionnaire `SCENES`) pour caler les sons. Si tu modifies une fenêtre d'un côté, fais-le aussi de l'autre.
- Gestes au mot près : clic du curseur à `K("clic")`, coup de tampon à `K("vingt_deux")`, apparition du badge à `K("jamais")`.

## 4. Vérifier

Après le premier rendu d'images fixes (ou du film), extrais les images aux mots-clés et regarde-les :
```
ffmpeg -ss <K("vingt_deux")> -i out/<nom>_16x9.mp4 -frames:v 1 /tmp/k_vingt_deux.png
```
NOVA, vérifié à 17,20 s (le signe ≠ frappe), 25,98 s (révélation de NOVA), 35,86 s (onde du clic sur Preuve) et 50,16 s (clic sur Appliquer).

Si la voix change (nouveau texte ou nouvelle prise), relance l'analyse, le calage, le son et le rendu : les scènes se recalent seules.
