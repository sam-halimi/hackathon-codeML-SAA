# 07 · Contrôle qualité (avant de livrer)

Coche tout. Une case qui ne passe pas renvoie à l'étape concernée.

## Contenu
- [ ] Chaque chiffre, date, nom et extrait visible ou dit a sa source dans la « Vérification des faits » du brief.
- [ ] Les éléments mis en scène (courriel d'exemple…) sont étiquetés comme dans le produit (« EXEMPLE »).
- [ ] Aucune faute dans les textes à l'écran, et la typographie de la langue est respectée (en français : espace avant « : ? ! », guillemets « »).
- [ ] Le récit suit l'arc douleur → bascule → démonstration → signature, et l'IA arrive en dernier avec sa limite rassurante.

## Synchronisation
- [ ] Images extraites à chaque mot-clé important (`ffmpeg -ss <K> -i out/…mp4 -frames:v 1`) : le geste est à l'écran au bon moment.
- [ ] Images aux bornes des scènes (± 0,1 s) : pas d'état à mi-course, pas de coupure dans une animation.
- [ ] Transcription Whisper du **master** : exactitude ≥ 0,95. La voix reste intelligible par-dessus la musique.

## Image
- [ ] La planche contact de chaque format (24 images) relue entièrement : rythme visuel, alternance des matières, pas d'image vide ou noire.
- [ ] 9:16 : texte des captures lisible sur un téléphone, rien de coupé sur les bords.
- [ ] 60 i/s, nombre d'images = `minutage.images` (vérifier avec ffprobe).
- [ ] Le carton de fin dure 2 s et la dernière image n'est pas noire.

## Son
- [ ] `mesures.json` : écart voix/musique ≥ 15 LU, master à −14 ±0,1 LUFS, crête vraie ≤ −1 dBTP.
- [ ] Silence musical sur la question pivot ; signature au logo ; cloche ou résolution à la fin.
- [ ] Aucun claquement en début ou fin de piste, aucun son ne masque un mot.

## Fichiers
- [ ] Masters (H.264 + AAC 320 kb/s, faststart), copies web (MP4 et WebM), pistes, planches et README présents dans `out/`.
- [ ] Les fichiers régénérables et confidentiels sont dans `.gitignore`.

Résultats NOVA : 63,58 s, 3 815 images à 60 i/s ; 16:9 en 1920×1080 H.264 8,3 Mb/s ; −14,1 LUFS ; −1,3 dBTP ; synchronisation vérifiée à 17,20 s, 25,98 s, 35,86 s et 50,16 s.
