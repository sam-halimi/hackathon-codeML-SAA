# Boussole · spec ad « Pas à pas » · brief v1

> **Étape 1 sur 6, en attente de ton OK.** Rien n'est construit, aucun crédit dépensé, rien n'est téléchargé.
> Sources produit : `boussole/app/` (branche `claude/sweet-dijkstra-828unj`, commit `6cfa7ce`). J'ai vérifié que le site en ligne boussole-beta.vercel.app affiche les mêmes textes (4 oct. 2026).

---

## 0. En bref

| | |
|---|---|
| Produit | Boussole (bêta), l'application qui accompagne pas à pas une personne après une agression sexuelle, à Montréal |
| Message | On n'est plus seule. Un guide calme montre, fonction par fonction, qu'on avance une étape à la fois, et que c'est elle qui décide. |
| Ce qu'on montre | L'outil, uniquement. On ne raconte jamais l'agression. |
| Formats | 16:9 (1920×1080) et 9:16 (1080×1920), 60 i/s |
| Durée | Corps ≈ 37 s (8 temps + « réunis »), carte de fin 5,4 s, « made by » 2 s, soit ≈ 45 s. Une version courte de ≈ 34 s est possible (§4) |
| Ton | Doux, lumineux, rassurant, jamais dramatique. Famille Spotify / Shopify / Huel, mais sur la palette chaude de l'app |
| Langue | Français québécois neutre |
| Appel à l'action | boussole-beta.vercel.app |

---

## 1. Trois concepts

### A. « Pas à pas » : le chemin ⭐ recommandé
Sur une scène crème, **huit petits points** dessinent un chemin, comme la frise numérotée de la fenêtre des étapes de l'app. Chaque point **éclot en carte arrondie** qui contient la vraie capture du temps correspondant. Le curseur fait le geste, puis la carte **se replie en point allumé** avec un petit carillon, et un **fil violet** mène au point suivant. La caméra suit le fil en un seul plan continu, sans coupe. À la fin, on recule : les huit écrans sont réunis. Puis les huit points se rassemblent et **deviennent le cercle du logo**.
- **Pourquoi** : la forme du film est la promesse. Huit temps, huit points : on *voit* qu'on avance, et on l'*entend*, puisque chaque carillon monte d'une note. Le produit est à l'écran du début à la fin, et la fin découle du concept.
- **Risque** : le même geste huit fois. Parade : chaque éclosion est différente (éclosion, dépliage, glissé, montée), le temps 4 sert de respiration et le temps 6 dure plus longtemps.

### B. « Les cinq promesses »
Les cinq diapos d'arrivée deviennent cinq promesses, posées comme des cartes de couleur à la Spotify. Chacune se retourne et révèle la fonction qui la tient (« Des soins près de chez vous » → la carte, « Un espace rien qu'à vous » → le récit chiffré…). Fin : les cartes s'empilent, cochées.
- **Force** : très graphique, très « marque », et la preuve est immédiate.
- **Limite** : l'ordre des promesses n'est pas celui du parcours, et le dossier comme le rappel n'ont pas de diapo. On casserait l'ordre réel demandé.

### C. « Du soir au matin »
Le parcours en temps réel, un soir : « Bonsoir Alex. » à 18 h 20, jusqu'au rappel fixé au lendemain, 10 h. Deux photos calmes servent de bornes (lumière du soir sur une fenêtre ; lumière du matin, une tasse de thé), et l'app est entre les deux.
- **Force** : l'arc vers l'espoir est naturel, la lumière revient.
- **Limite** : tout repose sur des photos (téléchargements à valider), et la nuit peut évoquer ce qu'on refuse de raconter.

**Ma reco : A**, avec un seul emprunt à C, sans photo : la lumière de la scène se réchauffe doucement du début à la fin (halos plus dorés sur la carte de fin).

---

## 2. Le concept A en détail

### Grammaire visuelle
- **Scène** : crème `#FFF9F3`, deux halos très flous (violet `#6A4CE0` vers 12 %, corail `#FF8A65` vers 10 %) qui dérivent lentement. Le halo prend la teinte du temps en cours, toujours une couleur de l'app : corail (arrivée, accueil), violet (compte, étapes, récit), ciel puis sauge (où aller), soleil (dossier), sauge (rappel).
- **Chemin** : 8 points de 14 px en zigzag doux. Un point allumé prend la teinte de son temps.
- **Cartes** : rayon 28 px, ombre de la classe `.card-soft` de l'app, bord blanc de 4 px comme la carte de l'onglet « Où aller ». Pas de barre de navigateur.
- **Fil** : trait violet de 3 px à bouts ronds, dessiné pendant les trajets. Léger flou de mouvement sur les déplacements de caméra.
- **Mise en page 16:9** : la carte et le texte changent de côté d'un temps à l'autre, puisque le chemin zigzague.
- **Typo cinétique** : Nunito 800. Uniquement des mots de la voix, au mot près, calés sur les horodatages ElevenLabs. Chaque mot monte de 14 px en se défloutant (8 → 0 px), avec la courbe de l'app `cubic-bezier(0.22, 1, 0.36, 1)`. Un mot-clé par phrase est teinté violet ou corail.
- **Curseur** : redessiné au montage à partir des coordonnées réelles enregistrées par Playwright. Flèche encre `#2D2440` à liseré blanc, trajectoires courbes et adoucies, léger flou de vitesse. Au clic, la flèche s'enfonce de 4 % et un anneau violet s'ouvre (0 → 36 px, 350 ms, opacité 35 % → 0). L'app joue en plus son propre effet d'appui (`.press`, échelle 0,975).
- **Illustrations vivantes** : à quatre moments seulement, un élément des illustrations de l'app se détache de la carte et flotte : le cœur de la porte (`Welcome`), les étincelles (`Choice`, `Care`), le cœur de « Parler à quelqu'un » (`Talk`), la coche du dossier (`Folder`).
- **Transitions** : jamais de coupe sèche. Quand on saute une partie d'écran, fondu enchaîné doux (≥ 12 images). Les saisies sont accélérées en douceur (speed ramps).

### Mouvements neufs
À l'opposé du clip démo Boussole (fond nuit, horloge, rouge, coupes franches, aiguille qui pivote) :
1. Éclosion point → carte (le cercle devient un rectangle arrondi), et repli carte → point allumé.
2. Fil qui se dessine, que la caméra suit.
3. Halo qui change de couleur à chaque temps.
4. Envol d'éléments d'illustration hors de l'écran.
5. Recul « constellation » : les huit écrans d'un coup.
6. Logo : les huit points convergent en spirale lente et fusionnent en cercle violet. L'aiguille **se déplie** depuis le centre, sans rotation, puis la pointe corail se remplit vers le nord.

---

## 3. Déroulé minuté (16:9, 60 i/s)

Ce sont des timings cibles : **l'image sera recalée sur la prise de voix retenue**, jamais l'inverse.

| TC | Temps | Voix | À l'écran (capture réelle) | Motion et son |
|---|---|---|---|---|
| 00:00,0–00:00,6 | Ouverture | — | — | Scène crème, les halos s'ouvrent, les 8 points apparaissent un à un. Nappe, puis motif de piano de 3 notes montantes. |
| 00:00,6–00:05,4 | **1 · Arrivée** | V1 (0,7–4,0) | Diapo 1 sur corail doux : la maison, « Étape 1 sur 5 », **« Vous êtes au bon endroit. »** Le titre arrive sur « au bon endroit ». Clic « Suivant » : les diapos 2 à 5 passent en vague de couleurs (≈ 0,35 s chacune) jusqu'à « Un espace rien qu'à vous. », puis clic « Créer mon espace ». | Le point 1 éclot. Le cœur de la porte se détache et flotte. Un souffle par diapo, clics doux, carillon 1 au repli. |
| 00:05,4–00:08,2 | **2 · Compte** | V2 (5,5–7,9) | « Créez votre compte » : on tape « Alex », « alex@example.com », puis le mot de passe. La jauge passe à 3 barres et affiche **« Fort »**. Confirmation accélérée, clic « Créer mon compte ». | Frappe feutrée, tintement minuscule sur « Fort », carillon 2. |
| 00:08,2–00:11,0 | **3 · Étapes** | V3 (8,4–10,0) | La fenêtre monte : **« Alex, voici les étapes, dans l'ordre »**, « Vous pouvez vous arrêter à tout moment. Rien n'est obligatoire. » La frise 1 → 8 s'allume au fil des « Suivant », et les titres défilent (de « Vous mettre en sécurité » à « Vos droits, à votre rythme »). Clic « C'est compris ». | Cadrage sur l'en-tête, la frise et le titre ; le corps des étapes reste hors champ (§8). Soulignement doux sous « Rien n'est obligatoire. » Tics de verre sur la frise, carillon 3. |
| 00:11,0–00:13,0 | **4 · Accueil** | V4 démarre (12,4) | **« Bonsoir Alex. »**, « Prenez le temps qu'il vous faut… », le bouton corail Info-aide (+1 888 933-9007), puis les 4 cartes illustrées qui montent. Clic sur **« Écrire mon récit · Une seule fois, à votre rythme. »** | Respiration : la musique porte. Les étincelles des illustrations flottent. Carillon 4. |
| 00:13,0–00:17,2 | **5 · Mon récit** | fin de V4, V5 (14,8–17,0) | **« À votre rythme. »** (le titre de l'app reprend les mots de la voix), « « Je ne sais pas » est une réponse. » On coche « Je ne sais pas exactement », on place le curseur dans « Ce dont je me souviens » (seul le texte indicatif est visible), puis fondu vers « Ce dont j'ai besoin maintenant » : « Parler à quelqu'un », « Un examen médical », « Un conseil juridique ». La barre avance, la pastille affiche **« Chiffré · 18:24 »**. | Petit battement du cadenas de la pastille. Carillon 5. |
| 00:17,2–00:25,6 | **6 · Où aller** | V6 (17,4–20,1) · V7 (20,4–23,0) · V8 (23,3–25,5) | Carte de Montréal. Filtre **« Examens médicaux »** : 5 points bleus numérotés. Clic sur la fiche 1, « Centre désigné de l'Île-de-Montréal (CDVASIM), Hôpital Notre-Dame » : le point grossit et son étiquette apparaît. Filtre **« Soutien psychologique »** : la fiche 1 est Info-aide (24 h/24) ; clic sur « CALACS Trêve pour Elles » (adresse confidentielle, donc pas de point), puis sur « CAVAC de Montréal » (point 3, la carte glisse). | Sur V7, surlignage doux de « trousse si vous le souhaitez » et de « sans plainte obligatoire » dans la fiche. Pops feutrés à l'apparition des points, souffle sur le glissé. Le cœur de `Talk` s'envole sur V8. Carillon 6. |
| 00:25,6–00:29,0 | **7 · Mon dossier** | V9 (25,8–28,7) | **« Vous décidez de ce qui part. »** On coupe l'interrupteur « Examens prioritaires » (le compteur passe à « 2 sections »). Aperçu en plan large, destinataire Rebâtir, deux cases de consentement cochées. « Envoyer à Rebâtir » → **« Confirmer l'envoi ? »** → « Oui, envoyer ». Les 4 étapes s'allument : Chiffrement sur votre appareil, Paquet scellé, **Transmission à Rebâtir (simulée)**, **Accusé de réception (simulé)**. | Bascules feutrées, whoosh montant et aérien sur « Oui, envoyer », 3 tics, puis carillon 7 sur l'accusé de réception. |
| 00:29,0–00:33,6 | **8 · Rappel** | V10 (29,2–33,4) | **« Quand souhaitez-vous être rappelée ? »** Clic « Demain », puis « 10 h 00 ». On tape « +1 514 555-0187 ». Sous « Ce qui vous mettrait à l'aise », « Pas de message vocal laissé » est déjà coché ; clic sur **« Une avocate (femme) si possible »** et « Un ou une interprète ». « Confirmer demain à 10 h 00 » → **« Rendez-vous confirmé (simulé) »**, mercredi 7 octobre, 10 h 00. | La coche de `Folder` flotte. Carillon 8, le plus chaud. |
| 00:33,6–00:37,6 | **Réunis** | V11 (33,8–37,5) | Les huit écrans, chacun figé sur son état final, le long du chemin. | Recul « constellation » sur le fil complet. La musique s'ouvre puis respire : un temps presque vide avant le logo, pour que la phrase sur l'État reste accrochée aux services, pas à Boussole. |
| 00:37,6–00:43,0 | **Carte de fin** | V12 (38,6–40,8) | Logo Boussole, **« Pas à pas, avec vous. »**, boussole-beta.vercel.app, puis en petit « Bêta · services publics gratuits ». | Points → cercle, aiguille qui se déplie, mot-symbole qui monte. Carillon d'accord et scintillement. L'URL arrive à 39,8, puis **immobile jusqu'à 43,0**. |
| 00:43,0–00:45,0 | made by | — | Carte animée « made by / riccardo bosso » (Spotify end card v2). | Le dernier accord résonne dessous. |

---

## 4. Script

Légende : `/` = petite pause, `//` = respiration, `///` = longue respiration.

### Version recommandée (corps ≈ 37 s)
1. Après ce que vous avez vécu, / vous êtes au bon endroit. //
2. Boussole vous guide, / une étape à la fois. /
3. Et c'est vous qui décidez. ///
4. Racontez une seule fois, / à votre rythme. /
5. Votre récit reste chiffré, / rien qu'à vous. //
6. On vous montre où aller, / tout près de chez vous. /
7. Plus tôt vous consultez, / plus vous gardez de choix. //
8. Quelqu'un pour vous écouter, / quand vous le voulez. //
9. Et quand vous êtes prête, / on prépare votre dossier. /
10. Une avocate ou un avocat vous rappelle, / au moment qui vous convient. //
11. Des services gratuits, / financés par l'État, / réunis au même endroit. ///
12. Boussole. // Pas à pas, / avec vous.

Le dernier mot répond au premier : « au bon endroit » → « au même endroit ».

### Ce que j'ai changé par rapport à ta base, et pourquoi
| Ta base | Proposé | Pourquoi |
|---|---|---|
| « Ici, vous êtes en sécurité. » | « Après ce que vous avez vécu, vous êtes au bon endroit. » | Une app ne peut pas promettre la sécurité physique ; sa propre étape 1 dit justement d'aller dans un endroit sûr ou d'appeler le 911. « Au bon endroit » est le titre exact de la diapo 1 : la voix et l'écran disent la même chose au même moment. « Après ce que vous avez vécu » dit pour qui c'est, une seule fois, sans mot cru. |
| « … y compris celui des prélèvements. » | retiré | 2 s de moins, et c'est le seul mot clinique. L'information reste à l'écran, surlignée : « trousse si vous le souhaitez ». |
| « Une avocate spécialisée vous rappelle » | « Une avocate ou un avocat vous rappelle » | L'app dit « un avocat ou une avocate » ; l'avocate n'est qu'une préférence « si possible ». Mettre « avocate » en premier garde ton intention sans promettre plus que l'app. |
| « Et quelqu'un pour vous écouter… » | sans « Et » | Évite deux « Et » de suite avec la phrase 9. |

### Variantes prêtes
- Ouverture d'origine : « Ici, vous êtes en sécurité. »
- Ligne 7 longue : « Plus tôt vous consultez, plus vous gardez de choix, y compris celui des prélèvements. » (+2 s)
- Ligne 11 avec seulement des mots de l'app : « Des services gratuits et confidentiels, réunis au même endroit. »
- **Version ≈ 34 s** : sans la ligne 7, avec la vague des diapos 2 à 5 plus courte.

---

## 5. Voix

**Profil recherché** : une femme, chaleureuse, posée, lente (≈ 4,5 syllabes/s, pauses respirées). Français québécois neutre, registre Radio-Canada, sans accent marqué ni anglicismes. Proche du micro, avec un léger sourire audible sur la fin. Jamais une « voix de pub », jamais chuchotée, jamais triste.

**Trois options** à te faire écouter à l'étape 3. Je les présélectionne dans la Voice Library ElevenLabs (filtres : français, accent canadien/québécois, femme, narration ou conversation) ; les extraits de la bibliothèque sont gratuits.
- **A · « La confidente »** (ma reco) : alto chaud, grain doux, très proche. Une amie à la table de cuisine.
- **B · « L'intervenante »** : médium clair, très articulée, posée. La plus intelligible sur un haut-parleur de téléphone.
- **C · « La grande sœur »** : plus jeune et plus lumineuse, souffle léger. Plus « Spotify », un peu moins d'assise sur la partie juridique.

Pour chacune, je génère la même phrase test (V1 + V12) et tu compares à l'oreille.

**Prononciation de « Boussole »** : [bu.sɔl], « bou-SSOL ». Deux syllabes : « ou » comme dans « doux », « ss » sourd comme dans « assez », « o » ouvert comme dans « sol », e final muet. Jamais « bou-ZOL », jamais à l'anglaise « BOO-sole ».
- Graphie envoyée à la synthèse : **« Boussol »**. La phrase test comporte aussi un essai avec « Boussole » ; on garde celle qui sonne juste.
- À surveiller aussi : « rythme » [ʁitm], « l'État » [le.ta], « chiffré » [ʃi.fʁe].

**Réglages de départ** : modèle Multilingual v2, le plus stable en français (v3 sera essayé sur la phrase test seulement). Stabilité 0,60, similarité 0,75, style 0,15, speaker boost activé, vitesse 0,90. Sortie PCM 48 kHz si ton offre le permet, sinon MP3 44,1 kHz à 192 kb/s. Appel « with timestamps » pour caler la typo au mot près.

**Deux prises en un seul appel** : le script est envoyé deux fois, séparé par un silence de 2 s, puis découpé.

**Crédits estimés** (1 crédit par caractère en Multilingual v2) :

| Poste | Crédits |
|---|---|
| Phrases test, 3 voix (≈ 85 caractères chacune) | ≈ 260 |
| 2 prises du script (≈ 580 caractères chacune) | ≈ 1 200 |
| **Total** | **≈ 1 460** |
| Plafond, si une ligne est à refaire | 1 800 |

Rien n'est dépensé avant ton « go ».

---

## 6. Musique (originale, écrite en code)

- **Caractère** : chaude, pleine d'espoir, intime. Piano feutré, nappes, pulsation légère. Pas de grosse caisse, pas de battement de cœur, pas de montée épique.
- **Tonalité et tempo** : ré♭ majeur, 72 BPM, ajustable entre 70 et 76 pour que le premier temps de la carte de fin tombe sur le logo.

| Section | TC | Harmonie | Arrangement |
|---|---|---|---|
| Ouverture, temps 1 | 0–5,4 s | Ré♭add9 | La nappe s'ouvre ; motif de piano de 3 notes montantes (la♭, ré♭, mi♭) |
| Temps 2–3 | 5,4–11 s | Sol♭maj7 → Ré♭/Fa | Accords de piano feutré, très doux |
| Temps 4–5 | 11–17,2 s | Si♭m9 → Sol♭maj9 | Pulsation légère en croches (pluck feutré, façon kalimba, très bas) |
| Temps 6 | 17,2–25,6 s | Ré♭ → La♭/Do → Si♭m7 → Sol♭ | Basse ronde ; contre-chant de célesta, seulement dans les silences de la voix |
| Temps 7–8 | 25,6–33,6 s | Mi♭m7 → La♭sus4 → La♭ | Légère montée : la nappe s'ouvre, la pulsation se rapproche |
| Réunis | 33,6–37,6 s | Sol♭maj7, large | Tout s'ouvre, puis une respiration presque vide avant le logo |
| Fin | 37,6–45 s | Ré♭add9 | Le motif revient, complété (4 notes, résolu) ; le dernier accord résonne librement sous « made by » |

- **Fabrication** : synthèse en Python (numpy). Piano par synthèse modale (partiels légèrement inharmoniques, marteau feutré, pédale), nappes à oscillateurs désaccordés avec filtre lent, réverbération algorithmique. Aucun échantillon, aucune boucle. Stems séparés : piano, nappes, pulsation, basse, en 48 kHz / 24 bits.
- **Voix et musique** : la courbe de ducking est calculée à partir des horodatages de la voix, pas par un compresseur en sidechain, donc sans pompage. Pendant les mots, la musique reste **au moins 15 dB sous la voix** (mesuré en LUFS court terme). Elle remonte doucement dans les silences (attaque 250 ms, relâche 600 ms), avec un creux de 3 dB entre 1 et 4 kHz quand la voix parle.
- **Voix** : passe-haut à 80 Hz, désessage léger si besoin. **Ni compresseur ni limiteur.**
- **Master** : −14 LUFS intégrés, ≤ −1 dBTP. Le niveau se règle au gain, pas au limiteur. Seul un plafond true-peak transparent est posé sur le bus final, avec une réduction ≤ 1 dB vérifiée et jointe au rendu. Écoute de contrôle en mono, bande 300 Hz–8 kHz, pour simuler un haut-parleur de téléphone.

---

## 7. Plan des effets sonores

Tous viennent de ta bibliothèque **FOUR Editors Sound Effects**, et les fichiers exacts seront choisis à l'étape 2. Chaque son est placé et égalisé, jamais supprimé : passe-haut entre 150 et 250 Hz, creux doux entre 3 et 6 kHz si ça pique. Jamais au-dessus de la voix, et −6 dB pendant les mots, sauf les clics synchrones.

| Moment | TC | Type | Traitement |
|---|---|---|---|
| Halos qui s'ouvrent | 0,0 | Souffle d'air inversé, très doux | Passe-bas 8 kHz, long fondu |
| Apparition des 8 points | 0,1–0,5 | Micro-tics de verre | Très bas |
| Éclosion de chaque carte (×8) | Début de chaque temps | Whoosh doux, d'air | Jamais deux fois le même de suite |
| Entrée des mots-clés | Sur chaque mot-clé | Souffle court | 8 dB sous les whooshes de carte |
| Chaque clic de curseur (≈ 30) | Synchro image | Clic doux, souris ou UI, 4 variantes en rotation | Passe-haut 300 Hz, coupe au-dessus de 10 kHz |
| Saisie (prénom, courriel, mot de passe, téléphone) | 5,6–7,4 · 30,4–31,2 | Frappe de clavier feutrée | Lit bas, synchro approximative |
| Jauge « Fort » | ≈ 7,0 | Tintement minuscule | — |
| Diapos 2 à 5 | 4,0–5,2 | 4 souffles très courts | — |
| Frise des étapes 1 → 8 | 8,4–10,4 | Tics de verre montants | — |
| Interrupteurs et cases | 26–27,5 | Bascule feutrée | — |
| Points de la carte | 18,2–18,8 · 24,6 | Pops feutrés | Très bas |
| Glissé de la carte | 19,4 · 24,6 | Souffle d'air | — |
| « Oui, envoyer » | ≈ 27,9 | Whoosh montant, aérien | — |
| 4 étapes d'envoi | 28,0–29,0 | 3 tics, puis carillon | — |
| **Fin de chaque temps (×8)** | Fin de temps | Carillon léger, accordé sur la musique, qui **monte d'une note à chaque temps** (ré♭, mi♭, fa, la♭, si♭, ré♭, mi♭, fa) : on entend qu'on avance | Transposé si besoin |
| Recul « constellation » | 33,6 | Nappe d'air, montée douce | — |
| Logo | 38,4 | Carillon d'accord (ré♭, fa, la♭) et scintillement | Le plus présent, toujours sous la voix |
| made by | 43,0 | Celui de ta carte v2 | — |

---

## 8. Éléments visuels

### Marque, tirée du code (rien à télécharger)
- **Logo** : `Mark` de `Logo.tsx`, repris en SVG à l'identique, jamais redessiné. Cercle `#6A4CE0`, aiguille crème `#FFF9F3`, pointe corail `#FF8A65`. Le mot-symbole « Boussole » est en Nunito 800, encre `#2D2440`.
- **Illustrations** : `Welcome`, `Choice`, `Care`, `Talk`, `Space`, `Folder` (`Illustrations.tsx`), en SVG, avec des éléments animables séparément.
- **Palette** (`index.css`) :

  | Rôle | Couleur | Version douce |
  |---|---|---|
  | Papier | `#FFF9F3` | — |
  | Panneau | `#F6EFE8` | — |
  | Encres | `#2D2440`, `#5E5670`, `#948BA3` | — |
  | Violet | `#6A4CE0` | `#EEE8FF` |
  | Corail | `#FF8A65` | `#FFE6DC` |
  | Sauge | `#2F9E78` | `#DDF3E8` |
  | Ciel | `#3D86D6` | `#E1EEFB` |
  | Soleil | `#E9A23B` | `#FFF1D6` |

  Le rouge d'alerte de l'app, `#D64545`, n'apparaît jamais.
- **Courbe d'animation** de l'app : `cubic-bezier(0.22, 1, 0.36, 1)`.

### Police
Nunito 400 à 800 (Google Fonts, licence SIL OFL). Le téléchargement est à valider à l'étape 2.

### Captures réelles (Playwright, site public, données fictives)
- **Cadres** :
  - 16:9 : fenêtre de 1280×800 à 2×. Le contenu de l'app remplit le cadre et reste net dans les recadrages.
  - 9:16 : 430×932 à 3×. C'est la vraie mise en page mobile, avec la barre d'onglets en bas.
- **Qualité** : capture image par image à 60 i/s. L'horloge de la page est figée puis avancée d'1/60 s par image, et les animations CSS sont pilotées. Résultat : ni saccade, ni compression.
- **Horloge** : fuseau America/Toronto, mardi 6 octobre 2026, 18 h 20. Ce réglage donne « Bonsoir », laisse des créneaux libres aujourd'hui comme demain, et place le rappel du mercredi 10 h dans les heures réelles de Rebâtir (lundi au vendredi, 8 h 30 à 16 h 30).
- **Données** :
  - prénom « Alex » ;
  - courriel alex@example.com (domaine réservé aux exemples) ;
  - mot de passe fictif de 14 caractères, masqué à l'écran ;
  - téléphone +1 514 555-0187 (la plage 555-01xx est réservée à la fiction) ;
  - **aucun texte de récit n'est jamais tapé**.
- **Curseur** : les coordonnées de chaque clic et de chaque frappe sont enregistrées ; le curseur est redessiné au montage.
- **Segments** :
  1. Diapos 1 → 5, puis « Créer mon espace ».
  2. Compte : 4 champs, puis « Créer mon compte ».
  3. Étapes : « Suivant » ×7, puis « C'est compris ».
  4. Accueil : arrivée des cartes, puis « Écrire mon récit ». Le bouton Info-aide n'est jamais cliqué (c'est un vrai lien d'appel).
  5. Récit : « Je ne sais pas exactement », focus sur « Ce dont je me souviens », 3 besoins, pastille « Chiffré ».
  6. Où aller : filtre Examens, fiche 1 ; filtre Soutien, CALACS Trêve pour Elles, puis CAVAC.
  7. Dossier : interrupteur, consentements, envoi, double confirmation, 4 phases. « Mon récit » y affiche « vide pour l'instant », puisqu'on ne tape aucun récit ; on cadre sur les interrupteurs et le compteur.
  8. Rappel : Demain, 10 h 00, téléphone, préférences, confirmation.

### Couche motion, fabriquée en code
Remotion est déjà dans le repo (`video/`). Éléments :
- la scène crème et ses halos ;
- le chemin de 8 points et son fil ;
- les cartes arrondies ;
- le curseur et son anneau de clic (point de toucher en 9:16) ;
- la typo cinétique ;
- les cœurs et étincelles tirés des illustrations ;
- le recul « constellation » ;
- la carte de fin.

### Carte de fin
- Fond crème, halos violet et corail plus dorés qu'au début.
- Logo centré, puis « Pas à pas, avec vous. » (Nunito 800), puis boussole-beta.vercel.app (Nunito 700, encre 2), et la petite ligne « Bêta · services publics gratuits » (encre 3).
- Immobile au moins 3 s après l'arrivée de l'URL.
- Ensuite, la carte animée « made by / riccardo bosso » (Spotify end card v2), ≈ 2 s. **J'ai besoin du fichier ou du projet** : il n'est pas dans le repo.

### Photos
Ma reco : **aucune dans la v1**, les illustrations de l'app portent déjà la chaleur. Si tu en veux une : de la lumière du matin à travers une fenêtre, très floue, derrière la carte de fin. Je te demande avant tout téléchargement, avec source et licence dans `assets_in/CREDITS.md`.

### Fond de carte
© contributeurs OpenStreetMap (ODbL). L'attribution reste visible dans le cadre de la carte et figure aussi dans `CREDITS.md`.

### Adaptation 9:16
- Même déroulé, mêmes timings, avec la capture mobile.
- L'écran occupe environ 80 % de la hauteur, le chemin passe en haut, et la typo reste dans les zones sûres (220 px dégagés en haut, 380 px en bas pour l'interface des réseaux).
- Un **point de toucher** remplace la flèche (point 8).
- Sous-titres incrustés recommandés, pour la lecture sans le son, et un fichier SRT pour les deux formats.

---

## 9. Garde-fous : comment on les tient

| Interdit | Comment on le tient |
|---|---|
| Douleur, urgence anxiogène, compte à rebours, « 24 h », « trop tard » | Rien de tout ça dans la voix ni dans la typo. Dans « Mon récit », on coche « Je ne sais pas exactement » à « Quand ? » : l'app n'affiche alors **aucun compteur d'heures**, ni « Il y a X h » sur l'Accueil, ni l'encadré des délais dans « Où aller », ni de délais dans le dossier. Dans la fenêtre des étapes, les encadrés de délais des étapes 4 à 6 restent hors champ. |
| Statistiques, preuve sociale | Aucune. |
| Mots crus | La voix dit au plus « après ce que vous avez vécu », une seule fois. On ne tape aucun récit. On ne cadre jamais les cartes « Symptômes », « Une substance est soupçonnée ? » ni « Personnes présentes ou témoins ». |
| Victime filmée, visage en détresse, silhouette menaçante, accusé | Personne n'est filmé. Les seuls personnages sont ceux des illustrations de l'app, sans visage, conçus pour ça. |
| Rouge alarme | Le rouge `#D64545` de l'app n'apparaît que sur les erreurs et sur « Tout effacer » : jamais déclenchés, jamais cadrés. Le corail `#FF8A65` (marque, bouton Info-aide) reste. |
| Dire que Boussole est subventionnée | La phrase sur l'État porte sur « des services ». Elle est posée sur les huit écrans, pas sur le logo, et une respiration la sépare de la carte de fin. Voir aussi le point 7. |
| Interface inventée | Toutes les interfaces viennent des captures. La couche motion n'ajoute que des formes de la marque, des mots de la voix et des surlignages. Les mentions « (simulé) » et « Bêta de test » de l'app restent visibles. |

---

## 10. Vérification des faits : chaque phrase renvoie au code

| Phrase | Source |
|---|---|
| au bon endroit | Diapo 1, `Espace.tsx` (`SLIDES`) |
| une étape à la fois | 8 étapes, `Etapes.tsx` et `careSteps.ts` |
| c'est vous qui décidez | Diapo 2 « Vous décidez de tout. » ; « Rien n'est obligatoire. » dans la fenêtre des étapes |
| Racontez une seule fois, à votre rythme | Carte d'accueil « Une seule fois, à votre rythme. » ; titre « À votre rythme. » |
| chiffré, rien qu'à vous | Diapo 5 ; `vault.ts` (AES-GCM, clé dérivée du mot de passe) |
| où aller, tout près de chez vous | Diapo 3 « Des soins près de chez vous. » ; onglet Où aller |
| Plus tôt vous consultez, plus vous gardez de choix | `careSteps.ts` : « Le plus tôt possible », la trousse reste possible quelques jours (jamais chiffré à l'oral) |
| Quelqu'un pour vous écouter, quand vous le voulez | Diapo 4 ; Info-aide 24 h/24 (fiche 1 du filtre Soutien) ; CALACS et CAVAC dans `resources.ts` |
| on prépare votre dossier | Onglet Mon dossier : « Boussole assemble votre dossier. » |
| Une avocate ou un avocat vous rappelle, au moment qui vous convient | `Rappel.tsx` : créneaux aujourd'hui ou demain, « un avocat ou une avocate spécialisée ». C'est simulé en bêta, d'où les mentions « (simulé) » à l'écran et « Bêta » en fin. |
| Des services gratuits | `resources.ts` : tous les services montrés sont gratuits. Juripop (« coût modique ») n'apparaît pas. |
| financés par l'État | **Absent de l'app** : c'est ta formulation (point 4) |

---

## 11. Points à valider

1. **Concept A** « Pas à pas » ?
2. **Ouverture** : « Après ce que vous avez vécu, vous êtes au bon endroit. » (reco) ou « Ici, vous êtes en sécurité. » ?
3. **Rappel** : « Une avocate ou un avocat vous rappelle » (fidèle à l'app) plutôt que « Une avocate spécialisée vous rappelle » ?
4. **« financés par l'État »** : tu confirmes ? À ma connaissance c'est exact pour le CDVASIM, le CVASM, les CALACS, le CAVAC, Rebâtir et Info-aide. Sinon, on prend la version avec les mots de l'app : « gratuits et confidentiels ».
5. **Ligne 7** courte (reco) ou avec « y compris celui des prélèvements » (+2 s) ?
6. **Textes réels de l'app**, visibles à l'écran mais jamais dits :
   - « gratuit, 24 h/24 » sur le bouton Info-aide (une disponibilité, pas un délai) ;
   - « après une agression sexuelle » dans le petit texte de la diapo 1 ;
   - « Préserver les preuves, si possible », le titre réel de l'étape 3 (pas « vêtements »).

   On les laisse tels quels ? Reco : oui, on ne retouche pas l'interface, et la diapo 1 est cadrée sur son titre. Sinon, on les sort du cadre.
7. **Ligne de fin « Bêta · services publics gratuits »** : sous le logo, on peut la lire comme « Boussole est un service public ». Proposition : « Bêta · vers des services publics gratuits ». On change ?
8. **9:16** : point de toucher au lieu de la flèche, puisque c'est la vraie mise en page mobile ?
9. **Durée** : ≈ 37 s + carte de fin + made by (≈ 45 s au total), ou la version ≈ 34 s ?
10. **Mouvements à éviter** : y a-t-il d'autres pubs récentes dont je dois m'écarter ? Je ne connais que le clip démo Boussole.

---

## 12. Production

- **Ordre de travail** :
  1. Brief (ce document).
  2. Liste des assets, à valider avant tout téléchargement.
  3. Options de voix : tu choisis.
  4. Preview v1 en 16:9 et planche contact, jusqu'à ton accord.
  5. Finaux 16:9 et 9:16, stems, README.
  6. Projet DaVinci Resolve, seulement si tu le demandes.
- **Outils** : Playwright (captures), Remotion (déjà dans `video/`), Python (musique), ffmpeg (mix et mesures EBU R128).
- **Livrables** :
  - MP4 H.264 à 60 i/s, en 16:9 et en 9:16 ;
  - stems WAV 48 kHz / 24 bits : voix, musique (4 pistes), effets rangés par catégorie ;
  - SRT ;
  - planche contact ;
  - README ;
  - `assets_in/CREDITS.md`.
- **Environnement** : ce brief a été écrit depuis une session cloud. Ce qui est sur ton Mac n'y est pas accessible : la bibliothèque d'effets sur le SSD Extreme Pro, la carte « made by », DaVinci Resolve, ton Bureau. Les étapes qui en ont besoin se feront dans une session Claude Code sur ton Mac, ou bien tu déposes les fichiers choisis dans le repo. Il n'y a pas non plus de clé ElevenLabs ici (`ELEVENLABS_API_KEY`).
