# Boussole : spec ad · PREVIEW v1 (16:9)

**Fichier** : `renders/preview/Boussole_Ad_16x9_60fps_PREVIEW_v1.mp4`, 1920×1080, 60 i/s (1 611 images, aucune en double), 26,86 s, H.264 + AAC 320 kb/s.
**Planche contact** : `renders/preview/contact_sheet_v1.png` (une image par seconde).
**Idée** : 1, « Compte à rebours ». **Voix** : C, « Proche » (Soraya).

## Déroulé réel (calé sur la voix)

| Temps | Plan | VO |
|---|---|---|
| 0,00–2,65 | A · titre mot à mot, règle de date | « La preuve a une date d'expiration. » |
| 2,65–6,82 | B · compteur 24:00:00 → 00:00:00 (bloqué sur « drogues ») | « Après vingt-quatre heures, le sang ne révèle plus la plupart des drogues. » |
| 6,82–9,02 | C · le compteur s'écrase → aiguille → boussole | « On répare la première nuit. » |
| 9,02–10,78 | D · UI réelle : checklist par règles, loupes 18 h / sang dépassé | *(à l'écran : « Des règles calculent chaque délai. » · RÈGLES · PAS D'IA)* |
| 10,78–16,07 | E · UI réelle : ce que l'IA voit → Générer → chronologie, filet vers la source ; puis les trois « Aucun… » | « L'IA, Claude, range les notes, cite ses sources, et ne juge personne. » |
| 16,07–18,23 | F · UI réelle : 6 validations, 1 rejet (7 vrais clics) | « Le soignant valide tout. » |
| 18,23–20,75 | G · UI réelle : journal chaîné SHA-256, badge d'intégrité, altération détectée | « Chaque geste est scellé. » |
| 20,75–24,85 | Carte 1 · logo, slogan, QR, URL (immobile ≥ 3,6 s) | « Boussole. L'IA guide, l'humain décide. » |
| 24,85–26,86 | Carte 2 · made by / riccardo bosso, dernier accord qui résonne | — |

## Écarts par rapport au brief (à valider)

- **Durée : 20,75 s de film au lieu de ~18 s.** La voix Soraya lit plus lentement que prévu (prise A brute : 21,7 s avant la carte). Pour réduire l'écart : coupe de secours du brief (phrase 4 à l'écran seulement), silences resserrés, tempo ×1,04 (rubberband, hauteur conservée).
- **Effets sonores TEMPORAIRES, synthétisés en code.** La bibliothèque « FOUR Editors Sound Effects » est sur le SSD, inaccessible depuis la session cloud. Les 79 placements sont listés dans `sfx/cues.csv` avec leur catégorie, pour un remplacement fichier par fichier.
- **Pas de photos dans la v1.** Le brief prévoyait une enveloppe scellée et une horloge murale. Tes règles demandent ton accord avant tout téléchargement : les plans A et B sont donc 100 % typographiques sur la scène bleu nuit.
- **Police : Inter** (licence OFL, la police déclarée par l'appli), axe `opsz` pour le rendu « display ». SF Pro Display n'est pas disponible ici. Pour changer : `FONT` dans `video/src/ad/kit.tsx`.
- **Carte 2 : remplaçant.** « Spotify end card v2 » n'est pas dans le repo ; c'est une version sobre au même texte.
- **Voix générée via Higgsfield, moteur ElevenLabs** (pas de clé ElevenLabs dans l'environnement) : 2,1 crédits Higgsfield, 2 prises en un appel. Prononciations à vérifier à l'oreille : « Klôde » (Claude), « l'i-a », « Boussol ».
- Le journal de l'export affiche **13 entrées** (et non 15, chiffre de l'ancien enregistrement) : c'est le nombre réel d'actions de cette capture.

## Son (mesuré sur le MP4 final)

- −14,0 LUFS intégré · −1,1 dBTP.
- Musique ≥ 16,5 LU sous la voix sur chaque mot (100 % des fenêtres de 400 ms ; médiane 19,3 LU).
- **Aucun limiteur sur la voix.** Le limiteur true-peak agit sur le bus musique + effets seulement ; un gain de clip local de 0,57 dB au maximum est appliqué sur un pic de voix.
- Détails : `build/audio/report.json`.
- Musique originale générée en code (`build/audio/music.py`) : ré mineur tendu, bascule sur Si♭maj9 au mot « On répare », fa majeur sur la carte, 70 BPM. La bascule et la carte tombent sur un premier temps.

## Refaire le film

```bash
# 1. VO : montage de la prise (voice/takes/soraya_2takes.mp3)
ffmpeg -i voice/takes/soraya_2takes.mp3 -ar 48000 -ac 1 voice/takes/soraya_2takes.wav
python3 build/audio/vo_edit.py
# 2. minutage unique (image + son)
python3 build/schedule.py
# 3. son
python3 build/audio/music.py && python3 build/audio/sfx.py && python3 build/audio/mix.py
cp stems/mix.wav ../../video/public/ad/mix.wav && cp build/schedule.json ../../video/src/ad/data/
# 4. captures réelles de /demo (appli lancée sur :5173)
cd build/rec && npm i && node capture.mjs && cp ../../assets_in/rec/16x9/*.png ../../../../video/public/ad/rec/ && cp ../../assets_in/rec/16x9/boxes.json ../../../../video/src/ad/data/
# 5. image
cd ../../../../video && npx remotion render BoussoleAd16x9 out/ad.mp4 --codec=h264 --crf=16 --audio-bitrate=320k
```

Changer de prise ou de voix recale automatiquement l'image et le son : tout lit `build/schedule.json`, dérivé de la VO.

## Fichiers

- `brief/PROMPT.md` : le brief.
- `voice/` : prise brute (2 prises en 1 appel) et montage.
- `music/`, `sfx/`, `stems/` : stems du mix. Les WAV sont régénérés par les scripts et ne sont pas versionnés, sauf le mix utilisé par Remotion (`video/public/ad/mix.wav`).
- `assets_in/rec/16x9/` : les 20 captures réelles de `/demo` et la position de chaque élément (`boxes.json`).
- `assets_in/CREDITS.md` : sources et licences.
- Code de l'image : `video/src/ad/` (`BoussoleAd.tsx`, `kit.tsx`).
