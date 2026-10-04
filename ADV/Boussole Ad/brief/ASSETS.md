# Boussole · spec ad « Pas à pas » · liste des éléments (étape 2)

> **En attente de ton OK** pour ce qui est marqué ⬇️ (téléchargement) et pour les deux décisions en bas de page.
> Tout le reste est déjà dans le repo, se capture sur le site public avec des données fictives, ou se fabrique en code.
> Chaque source et chaque licence va dans `assets_in/CREDITS.md`.

Légende : ✅ prêt dans le repo · 🎥 à capturer (Playwright, site public, données fictives) · 🛠 fabriqué en code · ⬇️ à télécharger, ton OK requis · 💻 sur ton Mac

---

## A. Marque ✅ (tirée du code de l'app, rien à télécharger)

Extraits par rendu direct des composants React de l'app (branche produit, commit `40b81a5`), sans rien redessiner.

| Élément | Fichier | Usage |
|---|---|---|
| Logo (cercle `#6A4CE0`, aiguille `#FFF9F3`, pointe `#FF8A65`) | `assets_in/brand/logo-mark.svg` | Carte de fin ; les 8 points fusionnent dans ce cercle |
| Mot-symbole « Boussole » | Aucun fichier : texte en direct, Nunito 800, encre `#2D2440`, approche −0,01 em, comme `Wordmark` dans `Logo.tsx` | Carte de fin |
| Illustration `Welcome` (la maison au cœur) | `assets_in/brand/illustrations/welcome.svg` | Temps 1 : le cœur s'envole |
| Illustration `Choice` (les interrupteurs) | `…/choice.svg` | Temps 4 : étincelle |
| Illustration `Care` (le centre de soins) | `…/care.svg` | Temps 4 : points flottants |
| Illustration `Talk` (deux personnes, un cœur) | `…/talk.svg` | Temps 6 : le cœur s'envole |
| Illustration `Space` (le téléphone au cadenas) | `…/space.svg` | Réserve |
| Illustration `Folder` (le dossier coché) | `…/folder.svg` | Temps 8 : la coche flotte |
| Palette et courbe d'animation | `assets_in/brand/palette.json` | Tout le film. Le rouge d'alerte y est rangé sous `_never`. |

Les éléments marqués `class="float"` dans les SVG sont ceux que l'app fait déjà flotter : ce sont eux qu'on anime.

## B. Police ⬇️

| Élément | Source | Licence | Pourquoi |
|---|---|---|---|
| **Nunito Variable** (400 à 800) | Paquet npm `@fontsource-variable/nunito` 5.3.0, le même que l'app utilise depuis le commit `40b81a5` | SIL Open Font License 1.1 | Typo cinétique et carte de fin. Pour les captures, rien à télécharger : le site sert sa propre police. |

## C. Visuels prêts du pitch ✅ (`assets_in/app_ref/`)

Copiés depuis `boussole/pitch/assets/`.

| Fichier | Taille | Ce qu'il montre | Usage dans la pub |
|---|---|---|---|
| `arrivee.jpg` | 1280×800 | Diapo 1 « Vous êtes au bon endroit. » | Storyboard, plan B |
| `accueil.jpg` | 1600×1000 | « Bonsoir Alex. », Info-aide, 4 cartes | Storyboard seulement. La pastille affiche « Chiffré à 02 h 45 » : une heure de nuit qu'on ne veut pas à l'image. La capture sera faite à 18 h 20. |
| `etapes.jpg` | 1020×765 | Étape 1 : « gravement blessée », bouton 911 | Storyboard seulement : c'est justement la zone qu'on garde hors champ |
| `rappel.jpg` | 760×942 | Créneaux, 18 h 00 choisi | Storyboard, plan B |
| `qr-boussole.png` | 1024×1024 | QR vers boussole-beta.vercel.app | **Option** pour la carte de fin (décision 2) |

Ces images sont en 1×, trop justes pour les recadrages en 2× : les plans du film viennent des captures (D).

## D. Captures de l'app 🎥

- **Où** : https://boussole-beta.vercel.app, version en ligne.
- **Cadres** :
  - 16:9 : fenêtre de 1280×800 à 2×, soit des images de 2560×1600.
  - 9:16 : 430×932 à 3×, soit des images de 1290×2796, avec la vraie mise en page mobile.
- **Qualité** : image par image à 60 i/s. L'horloge de la page est figée puis avancée d'1/60 s par image, et les animations de l'app sont pilotées : ni saccade, ni compression.
- **Horloge** : fuseau America/Toronto, **mardi 6 octobre 2026, 18 h 20**. Ce réglage donne « Bonsoir », laisse des créneaux libres aujourd'hui et demain, et place le rappel du mercredi 10 h 00 dans les heures réelles de Rebâtir.
- **Données fictives** :
  - prénom « Alex » ;
  - courriel `alex@example.com` (domaine réservé aux exemples) ;
  - mot de passe fictif de 14 caractères, masqué ;
  - téléphone `+1 514 555-0187` (plage 555-01xx réservée à la fiction) ;
  - **aucun texte de récit**.
- **Curseur** : chaque clic et chaque frappe est enregistré (position, image) dans un fichier JSON, et le curseur est redessiné au montage.
- **Stockage** : les séquences d'images sont trop lourdes pour git ; elles se régénèrent en une commande. Le repo garde le script, les journaux du curseur et une planche contact.

| # | Segment | Actions filmées |
|---|---|---|
| 1 | Arrivée | Diapo 1 (tenue), « Suivant » ×4, « Créer mon espace » |
| 2 | Compte | « Alex », courriel, mot de passe (jauge jusqu'à « Fort »), confirmation, « Créer mon compte » |
| 3 | Étapes | La fenêtre s'ouvre seule, « Suivant » ×7 (frise 1 → 8), « C'est compris » |
| 4 | Accueil | Arrivée de « Bonsoir Alex. » et des cartes, clic « Écrire mon récit ». Le bouton Info-aide n'est jamais cliqué. |
| 5 | Mon récit | « Je ne sais pas exactement », focus sur « Ce dont je me souviens », 3 besoins, pastille « Chiffré » |
| 6 | Où aller | Filtre « Examens médicaux », fiche 1 (CDVASIM) ; filtre « Soutien psychologique », CALACS Trêve pour Elles, puis CAVAC de Montréal |
| 7 | Mon dossier | Interrupteur « Examens prioritaires », 2 consentements, « Envoyer à Rebâtir », « Oui, envoyer », 4 étapes d'envoi |
| 8 | Rappel | « Demain », « 10 h 00 », téléphone, « Une avocate (femme) si possible », « Un ou une interprète », confirmation |

## E. Couche motion 🛠 (Remotion, déjà dans `video/`)

- La scène crème et ses halos qui changent de teinte.
- Le chemin de 8 points et le fil violet.
- Les cartes arrondies, avec éclosion et repli.
- Le curseur (16:9) et le point de toucher (9:16), avec l'anneau de clic.
- La typo cinétique : mots de la voix seulement, calés sur les horodatages.
- Les envols d'éléments d'illustration.
- Les surlignages doux, sur les vrais textes de l'app seulement.
- Le recul « constellation » et la carte de fin, avec le logo qui se forme et l'aiguille qui se déplie.
- Les sous-titres incrustés en 9:16.

## F. Carte « made by / riccardo bosso » 💻

| Élément | Où | Ce qu'il me faut |
|---|---|---|
| Spotify end card v2, animée, ≈ 2 s | Sur ton Mac | Le fichier vidéo (idéalement avec alpha, ou sur fond crème) ou son projet. À déposer dans `assets_in/endcard/`. |

## G. Audio

| Élément | Statut | Détail |
|---|---|---|
| Voix | 💻 ElevenLabs, étape 3 | 3 voix en test, puis 2 prises. ≈ 1 320 crédits, plafond 1 700. |
| Musique | 🛠 | Composée et synthétisée en Python. Aucun échantillon. |
| Effets sonores | 💻 FOUR Editors Sound Effects | Liste des besoins ci-dessous, à copier dans `assets_in/sfx/<catégorie>/` |

### Liste des besoins pour les effets (≈ 30 fichiers)

| Catégorie | Pour | Variantes | Caractère |
|---|---|---|---|
| Whoosh doux, d'air | Éclosions de cartes ×8, diapos | 6 | 0,3 à 0,8 s, aérien, sans grave |
| Souffle court, swish | Mots-clés | 4 | 0,15 à 0,3 s, très doux |
| Souffle inversé, montée | Ouverture, constellation | 2 | 1 à 2 s |
| Clic doux UI ou souris | ≈ 30 clics | 4 | Feutré, sans claquement |
| Frappe de clavier | 2 saisies | 1 boucle de 3 à 4 s | Clavier de portable, feutré |
| Bascule | Interrupteurs, cases | 2 | Court, mat |
| Pop feutré, bulle | Points de la carte | 3 | Très court |
| Tic de verre, tap | Frise, surlignages, étapes d'envoi | 4 | Cristallin mais doux |
| Carillon léger | Fin de temps ×8 (transposé en gamme) | 2 ou 3 | Clair, court, sans métal agressif |
| Carillon d'accord et scintillement | Logo | 1 ou 2 | Le plus « signature » |
| Whoosh montant | « Oui, envoyer » | 1 | Aérien |

## H. Photos

Aucune (reco du brief). Les illustrations de l'app portent la chaleur.

## I. Fond de carte

Tuiles © contributeurs OpenStreetMap (ODbL), chargées par l'app elle-même pendant la capture. L'attribution reste visible dans le cadre de la carte et figure dans `CREDITS.md`.

## J. Outils (pour transparence, pas des éléments du film)

- **Déjà installés**, dans un dossier temporaire hors du repo : `react`, `react-dom`, `esbuild`, `playwright-core` 1.56.1. Ils ont servi à extraire la marque et serviront aux captures. Chromium 141 était déjà sur la machine.
- **Prévus** : `numpy` et `scipy` (pip) pour la musique ; les dépendances Remotion de `video/` (npm).

---

## Ce qu'il me faut de toi

1. **OK pour télécharger Nunito Variable** (npm `@fontsource-variable/nunito`, OFL) ?
2. **QR code sur la carte de fin ?** Reco : oui en 16:9, petit, en bas à droite (utile si la vidéo est projetée pendant le pitch) ; non en 9:16 (on ne scanne pas son propre téléphone).
3. **Plus tard, depuis ton Mac** : la carte « made by » et les ≈ 30 effets ci-dessus dans `assets_in/`.
