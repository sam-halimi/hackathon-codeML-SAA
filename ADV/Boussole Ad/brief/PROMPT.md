# Boussole · spec ad « Pas à pas » · brief v2

> **Brief validé, tes décisions sont intégrées.** On est à l'étape 2 : la liste des éléments est dans `ASSETS.md`.
> Aucun crédit dépensé, aucun élément téléchargé.
> Sources produit : `boussole/app/` (branche `claude/sweet-dijkstra-828unj`, commit `40b81a5`). Depuis la v1, seule la police a changé dans l'app (Nunito est désormais hébergée par l'app) ; le parcours est identique.
> Récit aligné sur le pitch (`boussole/pitch/deck/build.js`, notes de la diapo 2), raconté côté victime (§10).

### Ce qui change depuis la v1
- Version de 34 s : la ligne 7 est retirée, et les diapos 2 à 5 passent plus vite.
- Ouverture « Après ce que vous avez vécu, vous êtes au bon endroit. » et rappel « Une avocate ou un avocat vous rappelle » : validés.
- « Financés par l'État » ne qualifie que les services. À l'image, cette phrase tombe sur leurs vrais noms (§3, « Réunis »).
- Ligne de fin : « Bêta · vers des services publics gratuits ».
- Les textes réels de l'app restent tels quels à l'écran ; ils ne sont jamais dits.

---

## 0. En bref

| | |
|---|---|
| Produit | Boussole (bêta), l'application qui accompagne pas à pas une personne après une agression sexuelle, à Montréal |
| Message | On n'est plus seule. Un guide calme montre, fonction par fonction, qu'on avance une étape à la fois, et que c'est elle qui décide. |
| Ce qu'on montre | L'outil, uniquement. On ne raconte jamais l'agression. |
| Concept | A, « Pas à pas » (validé) |
| Formats | 16:9 (1920×1080) et 9:16 (1080×1920), 60 i/s |
| Durée | **Corps 34,4 s**, carte de fin 5,4 s, « made by » 2 s, soit **41,8 s** |
| Ton | Doux, lumineux, rassurant, jamais dramatique. Famille Spotify / Shopify / Huel, sur la palette chaude de l'app |
| Langue | Français québécois neutre |
| Appel à l'action | boussole-beta.vercel.app |

---

## 1. Le concept : « Pas à pas »

Sur une scène crème, **huit petits points** dessinent un chemin, comme la frise numérotée de la fenêtre des étapes de l'app. Chaque point **éclot en carte arrondie** qui contient la vraie capture du temps correspondant. Le curseur fait le geste, puis la carte **se replie en point allumé** avec un petit carillon, et un **fil violet** mène au point suivant. La caméra suit le fil en un seul plan continu, sans coupe.

À la fin, on recule : les huit écrans sont réunis. Puis les huit points se rassemblent et **deviennent le cercle du logo**.

Chaque carillon monte d'une note : on entend qu'on avance. La lumière de la scène se réchauffe doucement du début à la fin.

### Grammaire visuelle
- **Scène** : crème `#FFF9F3`, avec deux halos très flous (violet `#6A4CE0` vers 12 %, corail `#FF8A65` vers 10 %) qui dérivent lentement. Le halo prend la teinte du temps en cours :

  | Temps | Teinte |
  |---|---|
  | Arrivée, accueil | Corail |
  | Compte, étapes, récit | Violet |
  | Où aller | Ciel, puis sauge |
  | Dossier | Soleil |
  | Rappel | Sauge |

- **Chemin** : 8 points de 14 px en zigzag doux. Un point allumé prend la teinte de son temps.
- **Cartes** : rayon 28 px, ombre `.card-soft` de l'app, bord blanc de 4 px. Pas de barre de navigateur.
- **Fil** : trait violet de 3 px à bouts ronds, dessiné pendant les trajets. Léger flou de mouvement sur les déplacements de caméra.
- **Mise en page 16:9** : carte et texte changent de côté à chaque temps.
- **Typo cinétique** : Nunito 800. Uniquement des mots de la voix, au mot près, calés sur les horodatages ElevenLabs.
  - Chaque mot monte de 14 px en se défloutant (8 → 0 px), avec la courbe de l'app `cubic-bezier(0.22, 1, 0.36, 1)`.
  - Un mot-clé par phrase est teinté violet ou corail.
- **Curseur** : redessiné au montage à partir des coordonnées réelles enregistrées par Playwright.
  - Flèche encre `#2D2440` à liseré blanc, trajectoires courbes et adoucies, léger flou de vitesse.
  - Au clic, la flèche s'enfonce de 4 % et un anneau violet s'ouvre (0 → 36 px, 350 ms, opacité 35 % → 0). L'app joue en plus son propre appui (échelle 0,975).
- **Illustrations vivantes** : à quatre moments seulement, un élément des illustrations de l'app se détache de la carte et flotte :
  - le cœur de la porte (`Welcome`) ;
  - les étincelles (`Choice`, `Care`) ;
  - le cœur de « Parler à quelqu'un » (`Talk`) ;
  - la coche du dossier (`Folder`).
- **Transitions** : jamais de coupe sèche. Fondus enchaînés doux (≥ 12 images) quand on saute une partie d'écran, et accélérations douces dans les saisies.

### Mouvements neufs
À l'opposé du clip démo Boussole (fond nuit, horloge, rouge, coupes franches, aiguille qui pivote) :
1. Éclosion point → carte, puis repli carte → point allumé.
2. Fil qui se dessine, que la caméra suit.
3. Halo qui change de couleur à chaque temps.
4. Envol d'éléments d'illustration.
5. Recul « constellation » : les huit écrans d'un coup.
6. Logo : les points convergent en spirale lente et fusionnent en cercle. L'aiguille **se déplie** depuis le centre, sans rotation, puis la pointe corail se remplit vers le nord.

---

## 2. Script (verrouillé)

Légende : `/` = petite pause, `//` = respiration, `///` = longue respiration.

1. Après ce que vous avez vécu, / vous êtes au bon endroit. //
2. Boussole vous guide, / une étape à la fois. /
3. Et c'est vous qui décidez. ///
4. Racontez une seule fois, / à votre rythme. /
5. Votre récit reste chiffré, / rien qu'à vous. //
6. On vous montre où aller, / tout près de chez vous. //
7. Quelqu'un pour vous écouter, / quand vous le voulez. //
8. Et quand vous êtes prête, / on prépare votre dossier. /
9. Une avocate ou un avocat vous rappelle, / au moment qui vous convient. //
10. Des services gratuits, / financés par l'État, / réunis au même endroit. ///
11. Boussole. // Pas à pas, / avec vous.

Environ 530 caractères et 93 mots. « au bon endroit » au début répond à « au même endroit » à la fin.

> **À noter :** le pitch dit « les examens médicaux au plus tôt, pour garder toutes les options ouvertes ». La version 34 s retire cette idée (c'était l'ancienne ligne 7). Pour la garder, « Plus tôt vous consultez, plus vous gardez de choix. » s'insère après la ligne 6, pour +2,6 s (≈ 37 s).

---

## 3. Déroulé minuté (16:9, 60 i/s)

Ce sont des timings cibles : **l'image sera recalée sur la prise de voix retenue**, jamais l'inverse.

| TC | Temps | Voix | À l'écran (capture réelle) | Motion et son |
|---|---|---|---|---|
| 00:00,0–00:00,6 | Ouverture | — | — | Scène crème, halos qui s'ouvrent, les 8 points apparaissent un à un. Nappe, puis motif de piano de 3 notes montantes. |
| 00:00,6–00:05,0 | **1 · Arrivée** | L1 (0,7–3,9) | Diapo 1 sur corail doux : la maison, « Étape 1 sur 5 », **« Vous êtes au bon endroit. »**, qui arrive sur « au bon endroit ». Clic « Suivant » : les diapos 2 à 5 passent en vague de couleurs (3,9–4,8, ≈ 0,22 s chacune). Clic « Créer mon espace » (4,8). | Éclosion du point 1. Le cœur de la porte se détache et flotte. Un souffle par diapo, clics doux, carillon 1. |
| 00:05,0–00:07,8 | **2 · Compte** | L2 (5,1–7,5) | « Créez votre compte » : on tape « Alex », « alex@example.com » et le mot de passe. La jauge passe à 3 barres et affiche **« Fort »** (6,6). Confirmation accélérée, clic « Créer mon compte » (7,2). | Frappe feutrée, tintement minuscule sur « Fort », carillon 2. |
| 00:07,8–00:10,6 | **3 · Étapes** | L3 (8,0–9,6) | La fenêtre monte : **« Alex, voici les étapes, dans l'ordre »**, puis « Vous pouvez vous arrêter à tout moment. Rien n'est obligatoire. » La frise 1 → 8 s'allume au fil des « Suivant » (8,0–10,0). Clic « C'est compris » (10,2). | Cadrage sur l'en-tête, la frise et le titre ; le corps des étapes reste hors champ. Soulignement doux sous « Rien n'est obligatoire. » Tics de verre, carillon 3. |
| 00:10,6–00:12,6 | **4 · Accueil** | L4 démarre (12,0) | **« Bonsoir Alex. »**, « Prenez le temps qu'il vous faut… », le bouton corail Info-aide, puis les 4 cartes illustrées. Clic sur **« Écrire mon récit · Une seule fois, à votre rythme. »** (12,2). | Respiration : la musique porte. Étincelles des illustrations. Carillon 4. |
| 00:12,6–00:16,8 | **5 · Mon récit** | fin de L4 (→ 14,2), L5 (14,4–16,6) | **« À votre rythme. »**, « « Je ne sais pas » est une réponse. » On coche « Je ne sais pas exactement », on place le curseur dans « Ce dont je me souviens » (seul le texte indicatif est visible), puis fondu vers « Ce dont j'ai besoin maintenant » : « Parler à quelqu'un », « Un examen médical », « Un conseil juridique ». La barre avance, la pastille affiche **« Chiffré · 18:24 »**. | Battement du cadenas, carillon 5. |
| 00:16,8–00:22,4 | **6 · Où aller** | L6 (17,0–19,7) · L7 (20,0–22,2) | Carte de Montréal. Filtre **« Examens médicaux »** (17,3) : 5 points bleus numérotés (17,6–18,2). Clic sur la fiche 1, « Centre désigné de l'Île-de-Montréal (CDVASIM), Hôpital Notre-Dame » (18,8) : le point grossit, l'étiquette apparaît. Filtre **« Soutien psychologique »** (20,0), dont la fiche 1 est Info-aide (24 h/24) ; clic sur « CALACS Trêve pour Elles » (20,6, adresse confidentielle, pas de point), puis « CAVAC de Montréal » (21,4, point 3, la carte glisse). | Pops feutrés à l'apparition des points, souffle sur les glissés. Le cœur de `Talk` s'envole sur L7. Carillon 6. |
| 00:22,4–00:25,8 | **7 · Mon dossier** | L8 (22,6–25,5) | **« Vous décidez de ce qui part. »** On coupe l'interrupteur « Examens prioritaires » (22,8), ce qui affiche « 2 sections ». Aperçu en plan large, destinataire Rebâtir, deux consentements cochés (23,2 et 23,5). « Envoyer à Rebâtir » (23,9) → **« Confirmer l'envoi ? »** → « Oui, envoyer » (24,3). Les 4 étapes s'allument (24,4–25,4) jusqu'à **« Accusé de réception (simulé) »**. | Bascules feutrées, whoosh aérien sur « Oui, envoyer », 3 tics puis carillon 7. |
| 00:25,8–00:30,4 | **8 · Rappel** | L9 (26,0–30,2) | **« Quand souhaitez-vous être rappelée ? »** Clic « Demain » (26,2), puis « 10 h 00 » (26,6). On tape « +1 514 555-0187 » (27,0–27,8). « Pas de message vocal laissé » est déjà coché ; clic sur **« Une avocate (femme) si possible »** (28,2) et « Un ou une interprète » (28,6). « Confirmer demain à 10 h 00 » (29,2) → **« Rendez-vous confirmé (simulé) »** (29,6). | La coche de `Folder` flotte. Carillon 8, le plus chaud. |
| 00:30,4–00:34,4 | **Réunis** | L10 (30,6–34,3) | Les huit écrans, figés sur leur état final, le long du chemin. Le temps 6 est figé sur CAVAC. | Sur « Des services gratuits, financés par l'État », surlignages doux et successifs des **vrais noms des services** dans les cartes : « Info-aide violence sexuelle », « Centre désigné de l'Île-de-Montréal », « CAVAC de Montréal », « Rebâtir ». Sur « réunis au même endroit », recul sur le chemin complet. Puis une respiration presque vide avant le logo. |
| 00:34,4–00:39,8 | **Carte de fin** | L11 (35,4–37,6) | Logo Boussole, **« Pas à pas, avec vous. »**, boussole-beta.vercel.app, puis en petit « Bêta · vers des services publics gratuits ». | Les points convergent (34,4–35,4), l'aiguille se déplie (35,2–35,8), le mot-symbole monte. Carillon d'accord et scintillement. L'URL arrive à 36,6, puis **tout est immobile jusqu'à 39,8**. |
| 00:39,8–00:41,8 | made by | — | Carte animée « made by / riccardo bosso » (Spotify end card v2). | Le dernier accord résonne dessous. |

### Adaptation 9:16
- Même déroulé, mêmes timings, avec la capture mobile (vraie mise en page de l'app, barre d'onglets en bas).
- Un **point de toucher** remplace la flèche.
- L'écran occupe environ 80 % de la hauteur, le chemin passe en haut, et la typo reste dans les zones sûres (220 px dégagés en haut, 380 px en bas).
- Sous-titres incrustés recommandés, et un fichier SRT pour les deux formats.

---

## 4. Voix

**Profil recherché** : une femme, chaleureuse, posée, lente (≈ 4,5 syllabes/s, pauses respirées). Français québécois neutre, registre Radio-Canada. Proche du micro, avec un léger sourire audible sur la fin. Jamais une « voix de pub », jamais chuchotée, jamais triste.

**Trois options** à te faire écouter à l'étape 3 :
- **A · « La confidente »** (reco) : alto chaud, très proche.
- **B · « L'intervenante »** : médium clair, très articulée ; la plus intelligible sur haut-parleur de téléphone.
- **C · « La grande sœur »** : plus jeune et plus lumineuse.

Pour chacune, la même phrase test (L1 + L11).

**Prononciation de « Boussole »** : [bu.sɔl], « bou-SSOL ». Deux syllabes : « ou » comme dans « doux », « ss » sourd comme dans « assez », « o » ouvert comme dans « sol », e final muet. Jamais « bou-ZOL », jamais « BOO-sole ».
- Graphie envoyée à la synthèse : **« Boussol »**, avec un essai témoin en « Boussole ».
- À surveiller aussi : « rythme » [ʁitm], « l'État » [le.ta], « chiffré » [ʃi.fʁe].

**Réglages de départ** : Multilingual v2 (v3 seulement en essai). Stabilité 0,60, similarité 0,75, style 0,15, speaker boost, vitesse 0,90. Sortie PCM 48 kHz si l'offre le permet. Appel « with timestamps ». **Deux prises en un appel**, séparées par 2 s de silence.

**Crédits estimés** :

| Poste | Crédits |
|---|---|
| Phrases test, 3 voix | ≈ 260 |
| 2 prises du script (≈ 530 caractères chacune) | ≈ 1 060 |
| **Total** | **≈ 1 320** |
| Plafond | 1 700 |

---

## 5. Musique (originale, écrite en code)

- **Caractère** : chaude, pleine d'espoir, intime. Piano feutré, nappes, pulsation légère. Pas de grosse caisse, pas de battement de cœur, pas de montée épique.
- **Tonalité et tempo** : ré♭ majeur, 72 BPM, ajustable entre 70 et 76 pour que le premier temps de la carte de fin tombe sur le logo.

| Section | TC | Harmonie | Arrangement |
|---|---|---|---|
| Ouverture, temps 1 | 0–5,0 s | Ré♭add9 | La nappe s'ouvre ; motif de piano de 3 notes montantes (la♭, ré♭, mi♭) |
| Temps 2–3 | 5,0–10,6 s | Sol♭maj7 → Ré♭/Fa | Piano feutré, très doux |
| Temps 4–5 | 10,6–16,8 s | Si♭m9 → Sol♭maj9 | Pulsation légère en croches, très basse |
| Temps 6 | 16,8–22,4 s | Ré♭ → La♭/Do → Si♭m7 → Sol♭ | Basse ronde ; célesta seulement dans les silences de la voix |
| Temps 7–8 | 22,4–30,4 s | Mi♭m7 → La♭sus4 → La♭ | Légère montée |
| Réunis | 30,4–34,4 s | Sol♭maj7, large | Tout s'ouvre, puis respiration |
| Fin | 34,4–41,8 s | Ré♭add9 | Le motif revient, complété ; le dernier accord résonne sous « made by » |

- **Fabrication** : synthèse en Python (numpy). Piano modal, nappes désaccordées, réverbération algorithmique. Aucun échantillon. Stems : piano, nappes, pulsation, basse, en 48 kHz / 24 bits.
- **Voix et musique** : ducking calculé à partir des horodatages de la voix, donc sans pompage. **Au moins 15 dB sous la voix** pendant les mots ; remontée douce dans les silences (attaque 250 ms, relâche 600 ms) ; creux de 3 dB entre 1 et 4 kHz quand la voix parle.
- **Voix** : passe-haut à 80 Hz, désessage léger si besoin. **Ni compresseur ni limiteur.**
- **Master** : −14 LUFS intégrés, ≤ −1 dBTP. Le niveau se règle au gain ; seul un plafond true-peak transparent sur le bus final, avec une réduction ≤ 1 dB vérifiée. Contrôle en mono, bande 300 Hz–8 kHz.

---

## 6. Plan des effets sonores

Tous viennent de **FOUR Editors Sound Effects** et sont choisis sur ton Mac. La liste des besoins est dans `ASSETS.md`. Chaque son est placé et égalisé (passe-haut entre 150 et 250 Hz, creux doux entre 3 et 6 kHz si ça pique). Jamais au-dessus de la voix, et −6 dB pendant les mots, sauf les clics synchrones.

| Moment | TC | Type |
|---|---|---|
| Halos qui s'ouvrent | 0,0 | Souffle d'air inversé, très doux |
| Apparition des 8 points | 0,1–0,5 | Micro-tics de verre |
| Éclosion de chaque carte (×8) | Début de chaque temps | Whoosh doux, d'air, jamais deux fois le même de suite |
| Entrée des mots-clés | Sur chaque mot-clé | Souffle court, 8 dB sous les whooshes |
| Chaque clic de curseur (≈ 30) | Synchro image | Clic doux, 4 variantes en rotation |
| Diapos 2 à 5 | 3,9–4,8 | 4 souffles très courts |
| Saisie | 5,2–6,9 · 27,0–27,8 | Frappe de clavier feutrée |
| Jauge « Fort » | 6,6 | Tintement minuscule |
| Frise des étapes 1 → 8 | 8,0–10,0 | Tics de verre montants |
| Interrupteurs et cases | 22,8–23,5 | Bascule feutrée |
| Points de la carte | 17,6–18,2 · 21,4 | Pops feutrés, très bas |
| Glissés de la carte | 18,8 · 21,4 | Souffle d'air |
| « Oui, envoyer » | 24,3 | Whoosh montant, aérien |
| 4 étapes d'envoi | 24,4–25,4 | 3 tics, puis carillon |
| **Fin de chaque temps (×8)** | Fin de temps | Carillon léger, accordé, qui **monte d'une note à chaque temps** (ré♭, mi♭, fa, la♭, si♭, ré♭, mi♭, fa) |
| Surlignage des noms de services | 30,6–32,4 | 4 micro-tics très doux |
| Recul « constellation » | 32,6 | Nappe d'air, montée douce |
| Logo | 35,2 | Carillon d'accord (ré♭, fa, la♭) et scintillement |
| made by | 39,8 | Celui de ta carte v2 |

---

## 7. Éléments visuels

Voir **`ASSETS.md`** : la liste complète, avec ce qui est prêt, à capturer, à fabriquer, à télécharger (ton OK) et ce qui est sur ton Mac.

Carte de fin :
- Fond crème, avec des halos violet et corail plus dorés qu'au début.
- Logo centré, puis « Pas à pas, avec vous. » (Nunito 800), boussole-beta.vercel.app (Nunito 700), et la petite ligne « Bêta · vers des services publics gratuits ».
- Immobile au moins 3 s après l'arrivée de l'URL.
- Ensuite, la carte « made by / riccardo bosso » (Spotify end card v2), ≈ 2 s.

---

## 8. Garde-fous : comment on les tient

| Interdit | Comment on le tient |
|---|---|
| Douleur, urgence anxiogène, compte à rebours, « 24 h », « trop tard » | Rien de tout ça dans la voix ni dans la typo. Dans « Mon récit », on coche « Je ne sais pas exactement » : l'app n'affiche alors **aucun compteur d'heures**, nulle part. Dans la fenêtre des étapes, les encadrés de délais (étapes 4 à 6) restent hors champ. |
| Statistiques, preuve sociale | Aucune. Le pitch en contient ; la pub, non. |
| Mots crus | La voix dit au plus « après ce que vous avez vécu », une seule fois. On ne tape aucun récit. On ne cadre jamais « Symptômes », « Une substance est soupçonnée ? » ni « Personnes présentes ou témoins ». Les textes réels de l'app restent tels quels (validé). |
| Victime filmée, visage, silhouette menaçante, accusé | Personne n'est filmé. Les seuls personnages sont ceux des illustrations de l'app, sans visage. |
| Rouge alarme | Le rouge `#D64545` de l'app n'apparaît que sur les erreurs et « Tout effacer » : jamais déclenchés, jamais cadrés. |
| Dire que Boussole est subventionnée | « Financés par l'État » ne vise que les services : centres désignés, Info-aide, CAVAC, Rebâtir, IVAC. À l'image, la phrase tombe sur leurs noms réels, une respiration la sépare du logo, et la ligne de fin dit « vers des services publics gratuits ». |
| Interface inventée | Toutes les interfaces viennent des captures. La couche motion n'ajoute que des formes de la marque, des mots de la voix et des surlignages. Les mentions « (simulé) » et « Bêta de test » restent visibles. |

---

## 9. Vérification des faits

| Phrase | Source |
|---|---|
| au bon endroit | Diapo 1, `Espace.tsx` |
| une étape à la fois | 8 étapes, `Etapes.tsx` et `careSteps.ts` |
| c'est vous qui décidez | Diapo 2 « Vous décidez de tout. » ; « Rien n'est obligatoire. » |
| Racontez une seule fois, à votre rythme | Carte d'accueil « Une seule fois, à votre rythme. » ; titre « À votre rythme. » |
| chiffré, rien qu'à vous | Diapo 5 ; `vault.ts` (AES-GCM) |
| où aller, tout près de chez vous | Diapo 3 ; onglet Où aller |
| Quelqu'un pour vous écouter, quand vous le voulez | Diapo 4 ; Info-aide 24 h/24 ; CALACS et CAVAC (`resources.ts`) |
| on prépare votre dossier | « Boussole assemble votre dossier. » |
| Une avocate ou un avocat vous rappelle, au moment qui vous convient | `Rappel.tsx`. C'est simulé en bêta, d'où « (simulé) » à l'écran et « Bêta » en fin. |
| Des services gratuits | `resources.ts` : tout ce qui est montré est gratuit |
| financés par l'État | Ta confirmation (centres désignés, Info-aide, CAVAC, Rebâtir, IVAC), et les notes du pitch (diapo 3) |

---

## 10. Alignement avec le pitch, côté victime

| Notes du pitch (diapo 2) | Dans la pub |
|---|---|
| « On arrive sur une page douce, qui dit simplement : vous êtes au bon endroit. » | Temps 1, ligne 1 |
| « On crée son compte en trente secondes… tout est chiffré » | Temps 2, puis ligne 5 |
| « Boussole montre les étapes, dans le bon ordre » | Temps 3, lignes 2 et 3 |
| « La personne raconte son histoire une seule fois, à son rythme. » | Temps 4 et 5, ligne 4 |
| « Une carte de Montréal lui montre où aller : les examens médicaux au plus tôt, pour garder toutes les options ouvertes, et le soutien psychologique » | Temps 6, lignes 6 et 7. L'idée « au plus tôt » est retirée dans la version 34 s (voir §2). |
| « Quand elle est prête, Boussole assemble son dossier et l'envoie à un service juridique » | Temps 7, ligne 8 |
| « Elle choisit un créneau, aujourd'hui ou demain, et une avocate ou un avocat la rappelle. » | Temps 8, ligne 9 |
| « Rien ne part sans son accord… on guide, elle décide. » | Double confirmation du temps 7, ligne 3 |
| Diapo 3 : « l'État finance… les centres désignés, Rebâtir ou l'IVAC » | Ligne 10, sur les services seulement |

---

## 11. Production

- **Ordre de travail** :
  1. ✅ Brief.
  2. ⏳ Liste des éléments (`ASSETS.md`), en attente de ton OK.
  3. Options de voix, sur ton Mac.
  4. Preview v1 en 16:9 et planche contact.
  5. Finaux 16:9 et 9:16, stems, README.
  6. Projet DaVinci Resolve, seulement si tu le demandes.
- **Outils** : Playwright 1.56 avec Chromium 141, Remotion 4 (déjà dans `video/`), Python (musique), ffmpeg.
- **Livrables** :
  - MP4 H.264 à 60 i/s, en 16:9 et en 9:16 ;
  - stems WAV 48 kHz / 24 bits ;
  - SRT ;
  - planche contact ;
  - README ;
  - `assets_in/CREDITS.md`.
- **Ce qui se fera sur ton Mac** : la voix ElevenLabs, les effets du SSD, la carte « made by », et Resolve si tu le demandes.
