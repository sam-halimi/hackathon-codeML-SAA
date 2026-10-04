# 06 · Musique, bruitages, mixage, master

Tout est fabriqué par `audio/composer.py` (numpy, scipy, pyloudnorm, ffmpeg), sans aucun échantillon externe : pas de droits à gérer, et chaque son tombe à l'image près. Si une bibliothèque de bruitages est disponible et autorisée, elle peut remplacer les sons synthétisés, en gardant le même plan de placement.

## 1. Repères

`composer.py` lit `src/<projet>/minutage.json` et recopie les fenêtres `SCENES` de `temps.ts`. Les fonctions `P(n)` et `K(nom)` donnent les mêmes instants qu'à l'image. Change toujours les deux fichiers ensemble.

## 2. Musique en deux actes

| Moment | Contenu (NOVA) |
|---|---|
| Acte 1 : douleur | Nappe grave en ré mineur, battement d'horloge, notes de piano dissonantes et rares, souffles filtrés, pulsation en croches à 120 bpm qui grandit de la facture jusqu'à « Qui croire ? » |
| Pivot | **Silence net** sur « Qui croire ? », puis nappe aiguë de l'espoir (« Et si… ») et montée vers le logo |
| Acte 2 : solution | Ré majeur à 100 bpm, progression ré, la, si mineur, sol ; nappe chaude, arpèges pincés, basse, pied doux, charleston ; montée d'énergie sur l'assistant |
| Fin | Résolution sur l'accord de ré majeur, cloche, fondu ; carton : queue de réverbération |

Outils de synthèse fournis : enveloppe ADSR, synthèse additive, scie, filtres passe-bas, passe-haut, passe-bande et balayage, réverbération par réponse impulsionnelle stéréo, panoramique, et `poser(piste, son, t, gain)` pour placer un son à un instant.

## 3. Bruitages denses, calés image par image

Bibliothèque synthétique : `sfx_souffle` (whoosh, avec panoramique), `sfx_impact`, `sfx_clic`, `sfx_tic`, `sfx_bulle`, `sfx_carillon`, `sfx_scintille`, `sfx_papier`, `sfx_glitch`, `sfx_buzz`, `sfx_montee`, `sfx_cymbale_inverse`, `sfx_verrou`, `sfx_frappe` (clavier), `sfx_signature` (logo).

Plan type, un bloc par scène dans `bruitages()` :

| Scène | Sons |
|---|---|
| Horloge | tic-tac régulier |
| Compte à rebours | tic à chaque jour, souffle, impact sur J−22 |
| Avalanche | papiers en rafale (un par carte), clics rapides, souffles |
| Faux vert | glitch + buzz d'erreur sur « vert » |
| Dates | souffle, impact sur le ≠ |
| Facture | coup sourd sur le montant |
| Qui croire ? | cymbale inversée qui aspire, puis silence |
| Logo | montée, signature |
| Interfaces | souffles doux aux mouvements de caméra, clic à chaque clic du curseur, bulle et carillon quand une preuve s'ouvre |
| Assistant | notification, frappe au clavier, bulle, clic « Appliquer », carillon de succès |
| Garde-fou | verrou, impact feutré |
| Final | grande signature |

Densité : au moins un événement sonore par geste visible. Un mouvement sans son paraît vide, mais aucun son ne doit masquer un mot.

## 4. Mixage (ordre et niveaux)

1. **Voix** : prise retenue, décalée du `pre_roll`, passe-haut à 80 Hz, **aucun compresseur ni limiteur**. Normalisée à −20 LUFS avant le master.
2. **Compression par la voix** : enveloppe de la voix (attaque 20 ms, relâche 350 ms), réduction de la musique jusqu'à −9 dB quand la voix parle.
3. **Musique** : réglée pour être **16 LU sous la voix pendant la parole** (exigence ≥ 15), mesuré sur les seuls passages parlés.
4. **Bruitages** : à −27 LUFS intégrés, en pointes sous la voix.
5. Mesure et affiche l'écart voix/musique. Écris `voix.wav`, `musique.wav`, `bruitages.wav` (pistes séparées, avant master) et `mix_pre_master.wav`.

## 5. Master (−14 LUFS intégrés, ≤ −1 dBTP)

```
volume={gain}dB,aresample=192000,alimiter=limit={plafond}:attack=0.6:release=45:asc=1:level=false,aresample=48000
```
- Gain fixe = cible − loudness mesurée, puis limiteur de crête **suréchantillonné ×4** (192 kHz) pour attraper les crêtes vraies.
- La boucle (6 essais au maximum) ajuste le gain jusqu'à −14 ±0,1 LUFS et baisse le plafond si la crête vraie dépasse −1 dBTP. Mesure avec `ebur128=peak=true`.
- **N'utilise pas `loudnorm` en mode dynamique** : il a écrasé la plage de loudness et rendu le mix plat.
- Résultat NOVA : −14,10 LUFS, −1,30 dBTP, LRA 3,2 LU, gain +5,8 dB, écart voix/musique 16 LU.

Sortie : `audio/rendu/mix_master.wav` (WAV 24 bits, 48 kHz) et `mesures.json`, que lit `finaliser.mjs`.
