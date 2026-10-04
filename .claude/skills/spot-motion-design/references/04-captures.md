# 04 · Captures de l'application réelle

Le produit doit apparaître tel qu'il est : on capture l'application réelle, dans un navigateur automatique, à l'échelle 2 pour pouvoir zoomer sans flou. Jamais l'écran de l'utilisateur.

## 1. Réglages qui comptent (voir `assets/modele-nova/outils/capturer.mjs`)

- Contexte Playwright : `viewport 1440×900`, `deviceScaleFactor: 2`, la langue et le fuseau du produit.
- **État contrôlé** par un `addInitScript` : version démo, guide déjà vu, aucune donnée locale résiduelle. Chaque capture est ainsi reproductible.
- **Aucune animation**, avec un CSS injecté :
  ```css
  html{scroll-behavior:auto!important}
  .capture-element .entete{position:static!important}
  *,*::before,*::after{animation:none!important;transition:none!important;caret-color:transparent!important}
  ```
  Sans `scroll-behavior:auto`, on capture en plein défilement. Sans la classe `capture-element`, l'en-tête collant recouvre les captures d'éléments.
- `await page.evaluate(() => document.fonts.ready)` avant la première capture.
- Courte pause (200 à 250 ms) avant chaque capture.
- **Captures d'éléments** (`locator.screenshot`) pour les cartes et panneaux ; captures pleine page pour les vues d'ensemble.
- Ouvre les **accordéons** et les panneaux par un clic ou un lien profond avant de capturer. Une preuve repliée ne prouve rien à l'écran.

## 2. `boites.json` : où sont les éléments

Pour chaque capture, enregistre la boîte (x, y, w, h en pixels de l'image, échelle 2) des éléments que la vidéo va désigner : bouton cliqué, ligne surlignée, champ de saisie. Fonction `boites(nomCapture, [[cle, selecteur, index]], origine?)`. L'origine est l'élément de référence pour une capture d'élément.

Côté Remotion, `boite(capture, cle, s)` convertit ces boîtes à l'échelle d'affichage `s`. Curseur, anneaux et zooms tombent ainsi pile sur l'élément, même si la mise en page de l'application change : il suffit de relancer les captures.

## 3. Liste type (NOVA : 24 captures)

| Fonctionnalité | Captures |
|---|---|
| Vue d'ensemble | page d'accueil, bloc « date + conditions », cartes de synthèse |
| Preuve | carte question avec preuves ouvertes, visionneuse avec passage surligné |
| Contradictions | carte « périmé / fait foi » |
| Actions | tableau des actions et responsables |
| Assistant | panneau vide, message collé, carte « Mise à jour proposée », état appliqué, refus d'un garde-fou |
| Fin | (le logo est dessiné dans Remotion) |

## 4. Confidentialité

`public/captures/` va dans `.gitignore` : les captures montrent des documents. Elles se régénèrent avec `node outils/capturer.mjs`, qui suppose l'application construite.
