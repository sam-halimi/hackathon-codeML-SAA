# Vidéo (Remotion)

Projet Remotion de l'équipe (motion design). Il contient le **spot de présentation NOVA** (défi Projet 360).

## Spot NOVA

Environ 64 secondes, en 16:9 (1920 × 1080) et 9:16 (1080 × 1920), à 60 images par seconde. La douleur d'abord (mercredi 9 h, 64 documents qui se contredisent), puis NOVA, ses vraies interfaces et son assistant. Brief, découpage et texte de la voix : [`brief/PROMPT.md`](brief/PROMPT.md).

| Dossier | Contenu |
| --- | --- |
| `src/nova/` | Composition (`NovaSpot.tsx`), scènes (`scenes/`), charte (`theme.ts`), minutage calé sur la voix (`minutage.json`), positions des éléments dans les captures (`boites.json`) |
| `audio/` | Texte de la voix, analyse des prises (`analyser_voix.py`, Whisper en local), calage (`caler.py`), musique, bruitages et mastering (`composer.py`) |
| `audio/voix/` | Prise retenue (`prise1.mp3`, ElevenLabs « Julian ») et sa transcription mot à mot |
| `outils/` | Captures de l'application (`capturer.mjs`), images de contrôle (`apercus.mjs`), assemblage final (`finaliser.mjs`) |
| `public/` | Polices de la marque (licence SIL OFL), texture de grain ; `public/captures/` est régénéré (non versionné) |
| `out/` | Vidéos finales, pistes séparées, planches contact, README de livraison (non versionné) |

Prérequis : Node 18+, Python 3 avec `numpy`, `scipy`, `pyloudnorm`, `faster-whisper`, et ffmpeg. Les captures demandent le rendu de l'application construit avec le corpus (`projet360/dist/NOVA_Projet360.html`).

```
npm i --loglevel=error
python3 audio/analyser_voix.py audio/voix/prise1.mp3   # transcription mot à mot de la prise
python3 audio/caler.py audio/voix/prise1.mp3           # minutage → src/nova/minutage.json
node outils/capturer.mjs                               # captures haute définition de l'application
python3 audio/composer.py                              # musique, bruitages, mixage, master −14 LUFS / −1 dBTP
npx remotion render NovaSpot16x9 out/NOVA_spot_16x9_image.mp4 --muted --concurrency=4 --crf=16 --jpeg-quality=95
npx remotion render NovaSpot9x16 out/NOVA_spot_9x16_image.mp4 --muted --concurrency=4 --crf=16 --jpeg-quality=95
node outils/finaliser.mjs                              # image + son, pistes, planches contact, README de livraison
```

Aperçu interactif : `npm run dev`, puis les compositions `NovaSpot16x9` et `NovaSpot9x16`.

Changer le texte de la voix : modifier `audio/texte_voix.txt` (une ligne par plan) et `brief/PROMPT.md`, générer une nouvelle prise, puis relancer l'analyse, le calage, le son et le rendu. Les scènes se recalent seules sur les nouveaux horodatages.

## Commandes Remotion

- Installer : `npm i --loglevel=error`
- Aperçu : `npm run dev`
- Rendu : `npx remotion render`
- Mise à jour : `npx remotion upgrade`

Documentation : [the fundamentals](https://www.remotion.dev/docs/the-fundamentals). Certaines entités ont besoin d'une licence d'entreprise Remotion : [conditions](https://github.com/remotion-dev/remotion/blob/main/LICENSE.md).
