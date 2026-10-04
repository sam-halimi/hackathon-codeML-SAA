# 08 · Finalisation et livraison

## 1. `node outils/finaliser.mjs`

Pour chaque format présent :
- **Assemblage** : image copiée telle quelle (`-c:v copy`) + `mix_master.wav` en AAC 320 kb/s, 48 kHz, `-shortest`, `-movflags +faststart`.
- **Planche contact** : 24 images régulières horodatées (`fps=1/pas, scale, drawtext, tile`), en 6×4 pour le 16:9 et 8×3 pour le 9:16.
- **Copies web** (`out/web/`) :
  - H.264, `-preset slow -crf 23 -maxrate 3.5M -bufsize 7M`, AAC 192 kb/s, faststart ;
  - WebM VP9 + Opus (`-crf 34 -b:v 0 -row-mt 1 -cpu-used 4`), pour les navigateurs sans H.264.
- **Pistes séparées** (`out/pistes/`) : voix, musique, bruitages, mix_master (WAV 24 bits, 48 kHz).
- **README de livraison** : tableau des fichiers (durée, image, son, poids), section son avec les mesures lues dans `mesures.json`, section image, commandes pour refaire le rendu.

À adapter : noms des fichiers, textes du README, crédits.

## 2. Envoyer à l'utilisateur

- **Pendant le travail** : la copie web 16:9 et sa planche contact dès qu'elles existent, pour un retour rapide. La 9:16 ensuite.
- **Limite d'envoi de fichiers : 30 Mo.** Les masters la dépassent : héberge-les (page `/video/` du site du projet, avec « Télécharger » et « Master pleine qualité »).
- **Pistes** : convertis-les en FLAC 24 bits (identiques bit à bit aux WAV ; vérifie par MD5 du PCM décodé) et zippe-les avec le README. Environ 25 Mo au lieu de 70.
- **Plateformes de concours** (Devpost) : le lien vidéo n'est intégré que s'il vient de YouTube, Vimeo ou Youku. Conseille une mise en ligne YouTube « non répertoriée » à partir du master 16:9. Pour la galerie d'images (3:2, 5 Mo maximum), fournis une couverture tirée de la vidéo (image du logo final, recadrée en 3:2) et des captures de l'application.

## 3. Option : la vidéo dans le produit

Si le produit a un écran d'accueil, la vidéo peut l'ouvrir : paysage sur ordinateur, portrait sur téléphone (`matchMedia('(orientation: portrait)')`), MP4 sinon WebM selon `canPlayType`. Prévois :
- le son d'abord, sinon une lecture muette avec un grand bouton « Activer le son » ;
- « Passer la vidéo », la touche Échap, et le passage automatique à la suite à la fin ;
- un repli direct si le fichier manque ;
- aucun défilement, quelle que soit la taille d'écran.

## 4. Rapport final à l'utilisateur

Durée et formats, adresse en ligne, voix retenue (et pourquoi), mesures (LUFS, dBTP, écart voix/musique), écarts avec la demande et leur raison, ce qui n'a pas pu être vérifié. Pas d'autosatisfaction : des faits.
