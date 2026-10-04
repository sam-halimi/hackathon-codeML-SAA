# 05 · Animation Remotion

## Sommaire
1. Installation à partir du modèle
2. Architecture : un temps global, des scènes pures
3. Outils de temps (`temps.ts`)
4. Primitives (`ui.tsx`)
5. Recettes de scènes, plan par plan
6. Principes de mouvement
7. Le format vertical 9:16
8. Contrôle par images fixes
9. Rendu

---

## 1. Installation à partir du modèle

1. Copie `assets/modele-nova/src/nova/` vers `src/<projet>/`, ainsi que `remotion.config.ts`, `tsconfig.json` (avec `resolveJsonModule: true`), `outils/` et `audio/`.
2. Ajoute `@remotion/fonts` (`npm i @remotion/fonts@<version de remotion>`). Ajoute `@remotion/renderer` si tu utilises `apercus.mjs`.
3. Place les polices de la marque (woff2, licence OFL) dans `public/fonts/` et les charge dans `theme.ts` avec `loadFont({ family, url: staticFile(...), weight, style })`. Reprends les couleurs du produit dans `C`, les polices dans `F` et les icônes du produit (SVG Lucide : chemins seuls) dans `ICONES`.
4. Déclare deux compositions dans `src/Root.tsx`, sur le même composant :
   ```tsx
   <Composition id="<Projet>Spot16x9" component={Spot} durationInFrames={DUREE_IMAGES} fps={FPS} width={1920} height={1080} />
   <Composition id="<Projet>Spot9x16" component={Spot} durationInFrames={DUREE_IMAGES} fps={FPS} width={1080} height={1920} />
   ```
5. `remotion.config.ts` : `setVideoImageFormat("jpeg")`, `setOverwriteOutput(true)`, et le `headless_shell` de Playwright s'il existe (`/opt/pw-browsers/chromium_headless_shell-*/chrome-linux/headless_shell`).

## 2. Architecture : un temps global, des scènes pures

- `useT()` renvoie le **temps global en secondes** (`frame / fps`). Chaque scène reçoit `t` et calcule tout à partir de lui, sans état, sans `Sequence`. La vidéo est ainsi déterministe et se recale entièrement si le minutage change.
- `<Projet>Spot.tsx` affiche le fond (sombre ou papier selon l'acte), chaque scène dont la fenêtre `SCENES[nom]` contient `t`, puis le grain par-dessus tout.
- Les scènes vivent dans `scenes/` par acte : `Douleur.tsx`, `Solution.tsx`, `Assistant.tsx`, `Fin.tsx`.
- Les fenêtres se chevauchent de quelques dixièmes de seconde quand une transition l'exige. Une scène gère sa propre entrée et sa propre sortie avec `env()`.

## 3. Outils de temps (`temps.ts`)

| Outil | Usage |
|---|---|
| `P(n)`, `PF(n)`, `K("mot")` | Début et fin de phrase, instant d'un mot-clé (depuis `minutage.json`) |
| `SCENES` | Fenêtres des scènes (mêmes formules dans `composer.py`) |
| `SORTIE`, `ENTREE`, `VA_ET_VIENT`, `RESSORT` | Courbes de Bézier : arrivée expo douce, départ qui accélère, trajet tenu, léger dépassement |
| `tw(t, a, b, de, vers, courbe)` | Interpolation bornée entre deux instants |
| `prog(t, a, b)` | Progression de 0 à 1 |
| `env(t, a, b, entree, sortie)` | Enveloppe d'entrée et de sortie (opacité d'une scène) |
| `camera(t, cles)` | Clés `{t, x, y, z}`, trajets en va-et-vient, **zoom interpolé en échelle logarithmique** (vitesse perçue constante) |
| `alea(n)` | Bruit déterministe : dispersion, tremblements |

## 4. Primitives (`ui.tsx`)

| Primitive | Ce qu'elle fait |
|---|---|
| `useFormat()` | `{W, H, vertical, u}`, où `u` = petit côté / 1080. Toutes les tailles sont exprimées en `u` |
| `FondSombre`, `FondPapier` | Dégradé radial, grille qui dérive lentement, vignette |
| `Grain` | Texture pellicule, opacité 0,09 en sombre et 0,05 en papier |
| `Etoile` | Motif du logo, lueur réglable (seul élément lumineux) |
| `Mots` | Texte cinétique : chaque mot monte avec un décalage (`ecart` 0,07 s, `duree` 0,55 s), style par mot possible |
| `Curseur` | Pointeur avec onde de clic à l'instant `clic` |
| `Anneau` | Encadré qui se dessine autour d'une boîte (surlignage) |
| `Fenetre` | Cadre de navigateur avec l'adresse réelle du produit |
| `Capture` + `boite()` | Image de `public/captures`, et boîte d'un élément (`boites.json`) mise à l'échelle |
| `Camera` | Cadre le « monde » sur un point avec un zoom. **Flou de mouvement proportionnel à la vitesse** (jusqu'à 7 px) |
| `Pastille` | Étiquette arrondie avec icône (états : rouge, vert, ambre, accent) |
| `apparition(t, debut)` | Apparition à ressort (échelle de 0,85 à 1, opacité) |
| `secousse(t, instant, force)` | Tremblement amorti (impacts, glitch, « Qui croire ? ») |

## 5. Recettes de scènes, plan par plan

Toutes s'appuient sur des données réelles.

- **Horloge** : cadran dessiné en SVG, trotteuse qui tourne, date en petites capitales espacées, « Mercredi, » en serif italique, puis « 9 h 00 » en chasse fixe, calé sur `K("neuf")`.
- **Compte à rebours** : grand « J−30 » qui défile jusqu'à « J−22 », puis la date en serif et les pastilles « GO » / « PAS DE GO » avec curseur hésitant.
- **Avalanche** : 24 cartes de vrais documents (icône du type, identifiant, titre) qui tombent en éventail (`alea`), compteur de 1 à 64, mots des catégories (« Courriels », « Comptes rendus »…) calés sur leurs mots-clés.
- **Faux vert** : vraies lignes du rapport avec pastilles « VERT », glitch (décalage RGB, tranches) sur `K("vert")`, bascule en « NON VALIDÉ » rouge, citation réelle du document en italique. Vérifie que l'état rouge est installé avant la fin de la fenêtre de la scène.
- **Dates** : deux cartes réelles (ligne du plan « 15 octobre », décision du comité « 22 octobre »), puis un grand « ≠ » rouge qui frappe sur `K("vingt_deux")` avec une secousse.
- **Facture** : vraies lignes de la facture, la ligne litigieuse se surligne en rouge et un trait se dessine dessous, sur `K("dix_huit")`.
- **Qui croire ?** : tout tremble puis s'éteint (fond à 35 %), question en grand serif italique. Silence musical.
- **Cinq minutes** : « 5 minutes. » sur fond qui s'éclaircit : la bascule vers le papier commence.
- **Logo** : passage au papier, l'étoile s'allume (lueur), « NOVA » en serif, « Mémoire de projet » en italique.
- **Un écran** : `Fenetre` + `Capture` de l'accueil ; `Camera` qui part large et zoome sur le bloc « date + conditions » ; `Anneau` sur chaque condition, au mot « conditions ».
- **Preuve** : question → curseur → clic sur « Preuve » à `K("clic")`, avec onde → la visionneuse s'ouvre (capture) → le passage surligné se met en valeur au mot « passage ».
- **Contradictions et actions** : la carte « périmé / fait foi » (barre sur la version périmée), puis un panoramique sur le tableau des actions jusqu'à la colonne des responsables au mot « responsable ».
- **Assistant** : vue fractionnée ; une carte de courriel marquée EXEMPLE glisse dans le champ (`K("collez")`) ; bulle « je prépare » ; carte « Mise à jour proposée » ; pastille « Garde-fous vérifiés » au mot « règles » ; clic du curseur sur « Appliquer » à `K("accord")` ; état appliqué. Version verticale séparée (`AssistantVertical`).
- **Garde-fou** : « 22 octobre » avec pastille cadenas (date approuvée inchangée), pastille « 29 octobre · proposition », panneau du garde-fou et badge « Le fournisseur ne peut pas fermer une condition », au mot « jamais ». L'image du héros est atténuée derrière.
- **Logo final** : étoile, « NOVA », promesse en deux lignes (la chute en italique accentué), pastille avec l'adresse.
- **Carton** : fond sombre, « réalisé par » en petites capitales, nom de l'équipe en serif, ligne du contexte (« Hackathon CodeML · Poly AI · 2026 »), petite étoile.

## 6. Principes de mouvement

- **Entrées en 0,3 à 0,6 s** avec `SORTIE` (rien de linéaire) ; sorties plus courtes (0,25 s) avec `ENTREE`.
- **Décalage entre éléments** de 0,05 à 0,1 s : jamais tout en même temps.
- **Un seul point d'attention à la fois** : la caméra amène l'œil, l'anneau confirme, le curseur agit.
- **Gestes sur le mot** : un clic tombe sur `K(...)`, pas « à peu près ».
- **Caméra** : clés espacées d'au moins 0,8 s, zoom de 1 à 2,5 maximum sur une capture à l'échelle 2 (au-delà, c'est flou).
- **Secousse et glitch** réservés à l'acte 1. L'acte 3 est stable et propre.
- Aucune animation qui boucle sans raison. Tout raconte quelque chose.

## 7. Le format vertical 9:16

- Même composant, même minutage. Chaque scène lit `useFormat().vertical` et adapte sa mise en page : éléments empilés plutôt que côte à côte, texte en `u`.
- **Clés de caméra propres au vertical.** En 9:16, une capture 16:9 entière est minuscule : zoome sur la partie utile et fais un panoramique d'un élément à l'autre (Preuve, Contradictions, Assistant).
- Pour des scènes très différentes, crée deux composants (`AssistantLarge` / `AssistantVertical`).
- Critère : le texte principal reste lisible sur un téléphone (corps ≥ 28 px en 1080×1920 pour les captures zoomées).

## 8. Contrôle par images fixes

```
npx remotion bundle src/index.ts build        # une fois par modification
node outils/apercus.mjs <Projet>Spot16x9 instants.txt
```
`instants.txt` contient une ligne « nom numéro_d'image » par instant (mots-clés × 60, bornes des scènes ± 0,1 s). Les images sortent dans `out/apercu/<composition>/` à l'échelle 0,5. Regarde-les toutes, dans les deux formats, avant tout rendu complet. Cherche les états à mi-course, les chevauchements, le texte coupé, un élément sorti du cadre et les données fausses.

## 9. Rendu

```
npx remotion render <Projet>Spot16x9 out/<nom>_16x9_image.mp4 --muted --concurrency=4 --crf=16 --jpeg-quality=95
npx remotion render <Projet>Spot9x16 out/<nom>_9x16_image.mp4 --muted --concurrency=4 --crf=16 --jpeg-quality=95
```
- Image seule (`--muted`) : le son masterisé est assemblé par `finaliser.mjs`, sans recompresser la vidéo.
- Lance en arrière-plan avec un journal (`… > out/rendu_16x9.log 2>&1; echo $? >> …`), puis attends avec une boucle `until`.
- `npx tsc` doit passer avant le rendu (`noUnusedLocals` est actif).
