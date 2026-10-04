# Boussole : spec ad · Brief (étape 1)

> **Statut : brouillon, en attente de ton OK.** Rien n'est construit, aucun crédit dépensé, rien n'est téléchargé.
> Copie de travail dans le repo (`ADV/Boussole Ad/brief/PROMPT.md`, branche `claude/sharp-gates-8boqyh`). À placer dans `~/Desktop/ADV/Boussole Ad/brief/` sur ton Mac (voir §13).
> Sources lues : `app/src/components/Demo.tsx`, `app/src/lib/*.ts`, `docs/PITCH.md`, `docs/SLIDES.md`, `docs/VIDEO.md`, `video/src/Boussole.tsx`, `video/public/rec/demo.webm` (tout sur la branche de la PR Boussole, `claude/sweet-dijkstra-828unj`).

---

## 0. En bref

| | |
|---|---|
| Produit | Boussole, copilote web des soignants des centres désignés qui accueillent une victime d'agression sexuelle |
| Slogan | « L'IA guide, l'humain décide. » |
| Diffusion | Diapo 2 du pitch Propolys (3 min), puis le site |
| Durée | ~18 s de film + carte 1 (QR, 3,5 s) + carte 2 (made by, 2 s) ≈ **24 s** |
| Formats | 60 i/s · 16:9 (1920×1080) et 9:16 (1080×1920) |
| Ton | Famille Huel / Shopify / Spotify (grosse typo, aplats, motion net), mais **sobre et grave** : courbes lentes, aucun rebond, rien de « fun » |
| Deux phrases piliers (dans les 3 idées) | **« La preuve a une date d'expiration. »** et **« On répare la première nuit. »** |
| Ma recommandation | **Idée 1 : « Compte à rebours »** |

---

## 1. Garde-fous

**Contenu**
- Aucune victime, aucun visage en détresse, aucune silhouette menaçante, aucune photo d'accusé, aucun nom réel. Les photos d'articles du pitch (`docs/assets/articles/`) ne sont **pas** utilisées.
- Le cas montré est le cas fictif de l'appli (dossier `#DEMO-0042`). Le prénom fictif « Léa » n'est pas dit dans la VO.
- Chiffres : uniquement les 4 faits autorisés, dits tels quels, avec la source en petit à l'écran.

| Fait | Formulation VO | Source affichée |
|---|---|---|
| 6 % | « Six pour cent des agressions sexuelles sont signalées à la police. » | Statistique Canada, ESG 2019 |
| 24 h | « Après vingt-quatre heures, le sang ne révèle plus la plupart des drogues. » | ANSI/ASB Standard 121 |
| 1 sur 5 | « Une plainte sur cinq est classée non fondée. » | The Globe and Mail, *Unfounded*, 2017 |
| ~1 sur 3 | « Près d'une cause sur trois dépasse les délais Jordan. » | Ombudsman fédéral des victimes, 2022-2023 |

> ⚠ **1 sur 5** : ces données datent de 2010-2014, et `docs/PITCH.md` conseille de ne pas le dire à l'oral. Je ne l'utilise dans **aucune** VO par défaut.

- **Affaire Cornell : pas utilisée.** Le pitch l'a déjà racontée 60 s plus tôt (diapo 1). La procédure est en cours. Même sans nom, l'affaire reste identifiable. Et sur 18 s, elle prendrait un tiers du temps. Si tu la veux quand même, la seule formulation que j'accepterais (ouverture de l'idée 3) : « En 2024, une étudiante américaine dit avoir été droguée. Elle a mis trois semaines à le signaler. »

**Interface**
- Uniquement de vraies images de `/demo`. Source principale : un nouvel enregistrement (§8). Secours : `video/public/rec/demo.webm`.
- Sur chaque plan d'interface, ces trois éléments restent lisibles : le bandeau « DONNÉES 100 % FICTIVES », l'étiquette « Réponse IA pré-enregistrée » (plans de chronologie) et la mention « Délais PROTOTYPE » (checklist). Si un détail demande un cadrage plus serré, on **réenregistre avec un viewport plus petit** au lieu de zoomer et de sortir le bandeau du cadre.
- Pas de faux curseur. Un anneau ambre (couche motion, clairement graphique) marque l'endroit des vrais clics.
- Les badges de l'appli sont **statiques** (« URGENT · 18 h restantes ») : on ne les fait pas défiler, ce serait inventer un comportement. Le seul compte à rebours animé est typographique (plan 2) et ne ressemble pas à l'UI.

**Look**
- Bleu nuit `#0F1B2D`, crème `#F6F1EA`, ambre `#E8A33D`. **Aucun rouge ajouté.** Le seul rouge vient de l'UI réelle (`#C8553D`, brique : bandeau « données fictives », « Altération détectée »), qu'on ne retouche pas.
- Pas d'esthétique « faits divers » : pas de ruban de police, de gyrophare, de coupure de presse, de flash, de glitch ni de grain sale.
- Pas d'iPhone, ni aucun appareil. L'interface flotte seule sur la scène bleu nuit.

---

## 2. Les 3 idées

### Idée 1 : « Compte à rebours » (recommandée)
Chaque preuve a son horloge. On voit celle du sang tomber à zéro. Ce compteur s'écrase ensuite en une ligne ambre qui devient l'aiguille de la boussole : **le temps qui menace devient le temps qui guide**. Le produit montre alors ses vrais délais, calculés par des règles, puis l'IA qui range sans juger, l'humain qui valide, le journal qui scelle.

*Pourquoi je la recommande :* un seul chiffre et une seule métaphore qui traverse tout le film (compteur → aiguille → délais de l'appli). C'est l'idée la plus lisible au téléphone et dans une salle bruyante. Et le chiffre choisi est exactement celui que le produit corrige.

### Idée 2 : « Porter plainte peut attendre »
Deux lignes de temps. La décision de porter plainte n'a pas d'échéance : une ligne pointillée crème qui sort du cadre. La preuve en a une : une ligne ambre qui s'arrête net. Boussole réconcilie les deux : la preuve est préservée cette nuit, la plainte peut venir plus tard. Plan héros : la vraie case « Transmission à la police : peut être accordée plus tard », laissée décochée.

*Pour :* la plus humaine, et elle met en avant le consentement, central pour un jury « Sécurité & IA ». *Contre :* on montre moins le produit (pas de journal en VO).

### Idée 3 : « Pas les tribunaux »
Reprend la phrase du pitch. En aval, le système fuit (6 %, près d'une cause sur trois). On ne le répare pas : on répare l'amont, la première nuit. Typographie de ratios (barres qui se vident), couloir vide, puis le produit en trois battements.

*Contre :* deux chiffres en 5 s, c'est difficile à suivre au téléphone. Elle répète aussi la diapo 1 et la phrase que la personne 3 dit juste avant le clip. C'est la plus longue (~19,5 s).

---

## 3. Script (français)

Phrases complètes, courtes, une idée par phrase. Durées estimées à ~4,2 syllabes/s avec les silences (lecture posée). Elles seront remplacées par les durées réelles de la prise choisie.

### Idée 1 : « Compte à rebours » · ~18,4 s + carte · 330 caractères
1. La preuve a une date d'expiration.
2. Après vingt-quatre heures, le sang ne révèle plus la plupart des drogues.
3. On répare la première nuit.
4. Des règles calculent chaque délai.
5. L'IA, Claude, range les notes, cite ses sources, et ne juge personne.
6. Le soignant valide tout.
7. Chaque geste est scellé.

*Carte 1 :* Boussole. L'IA guide, l'humain décide.

> Rallonge possible (+1,2 s) si la prise est rapide : « Chaque geste est scellé : toute retouche se voit. »
> Coupe de secours si la prise dépasse 19 s : la phrase 4 passe à l'écran seulement (l'étiquette « RÈGLES · PAS D'IA » la porte).

### Idée 2 : « Porter plainte peut attendre » · ~18 s + carte · 314 caractères
1. Six pour cent des agressions sexuelles sont signalées à la police.
2. Porter plainte peut attendre.
3. La preuve, elle, a une date d'expiration.
4. On répare la première nuit.
5. Chaque étape demande son accord.
6. L'IA, Claude, range les notes et cite ses sources.
7. Le soignant valide tout.

*Carte 1 :* Boussole. L'IA guide, l'humain décide.
*(À l'écran seulement : « RÈGLES · PAS D'IA », « JOURNAL CHAÎNÉ · SHA-256 », et les trois « jamais » de l'IA.)*

### Idée 3 : « Pas les tribunaux » · ~19,5 s + carte · 348 caractères
1. Six pour cent des agressions sexuelles sont signalées à la police.
2. Près d'une cause sur trois dépasse les délais Jordan.
3. On ne répare pas les tribunaux.
4. On répare la première nuit, parce que la preuve a une date d'expiration.
5. Des règles calculent les délais, et l'IA range les notes.
6. Le soignant valide tout.

*Carte 1 :* Boussole. L'IA guide, l'humain décide.

---

## 4. Déroulé détaillé : idée 1 (timings provisoires)

On recale l'image sur la voix : ces temps seront remplacés par l'alignement mot à mot de la prise choisie (§5).

| # | Temps (s) | Images @60 | VO | Image | Mouvement | Texte à l'écran |
|---|---|---|---|---|---|---|
| 1 | 0,00–2,75 | 0–165 | « La preuve a une date d'expiration. » (0,30–2,40) | **Photo A** : enveloppe de preuve scellée, macro, ruban d'inviolabilité. Étalonnage bleu nuit, une seule lumière ambre rasante | La mise au point glisse (flou → net), poussée lente 1,00 → 1,05. Les mots montent à travers une fente horizontale avec un flou de mouvement vertical, calés mot à mot sur la VO. Une règle ambre se trace sous « expiration », comme la ligne d'une date sur une étiquette | La preuve a une date d'expiration. (« expiration » en ambre) |
| 2 | 2,75–7,10 | 165–426 | « Après vingt-quatre heures, le sang ne révèle plus la plupart des drogues. » (2,75–6,70) | **Photo B** en fond, très floue : horloge murale, couloir d'hôpital vide, la nuit | Compteur `24:00:00` en chiffres à rouleaux (odomètre), flou vertical. Il accélère puis se bloque net sur `00:00:00` au mot « drogues ». L'étiquette « SANG » passe au gris, en écho au gris « Délai dépassé » de l'appli | `24:00:00` → `00:00:00` · « Après 24 h, le sang ne révèle plus la plupart des drogues. » · *ANSI/ASB 121* |
| 3 | 7,10–9,30 | 426–558 | « On répare la première nuit. » (7,10–8,80) | Scène bleu nuit, la lueur ambre s'ouvre | Les zéros s'écrasent horizontalement en une barre ambre (flou de mouvement). La barre pivote et devient l'aiguille du logo, puis l'anneau se trace autour et le mot-symbole « Boussole » se pose. La phrase se resserre (interlettrage large → normal, avec flou) | Logo + Boussole · On répare la première nuit. (« première nuit » en ambre) |
| 4 | 9,30–11,40 | 558–684 | « Des règles calculent chaque délai. » (9,30–11,10) | **UI réelle**. Dossier guidé : le curseur se pose sur « 30 h ». Puis « Prélèvements prioritaires — 30 h depuis les faits » : liste triée, « URGENT · 18 h restantes », « URGENT · 42 h restantes », sang « Délai dépassé (6 h) » | Le panneau flotte en 3D (perspective, léger pivot qui se redresse), avec un arrière-plan flou. Un anneau ambre se pose sur « 18 h », puis sur la ligne sang (rime avec le plan 2). Une étiquette est reliée au panneau par un filet | RÈGLES · PAS D'IA |
| 5 | 11,40–15,40 | 684–924 | « L'IA, Claude, range les notes, cite ses sources, et ne juge personne. » (11,40–15,10) | **UI réelle**. « Chronologie assistée par IA » : clic sur « Générer », puis les lignes apparaissent avec leur citation (étiquette « pré-enregistrée » visible) | Travelling latéral, sans zoom. Un filet ambre relie une ligne à sa phrase source dans les notes. Sur « ne juge personne », l'UI se floute et trois lignes s'empilent | CHAQUE LIGNE CITE SA SOURCE · puis : Aucun coupable désigné. / Aucune note de crédibilité. / Aucune reconnaissance faciale. |
| 6 | 15,40–17,05 | 924–1023 | « Le soignant valide tout. » (15,40–16,80) | **UI réelle** : 6 « Valider », 1 « Rejeter », incohérence « Corrigé » | Un anneau ambre à chaque vrai clic, puis la cascade des « ✓ validé ». Accélération ×1,5 de l'enregistrement si besoin, jamais de plan inventé | LE SOIGNANT VALIDE |
| 7 | 17,05–18,70 | 1023–1122 | « Chaque geste est scellé. » (17,05–18,20) | **UI réelle**. Export : badge « ✓ Intégrité du journal vérifiée — 15 entrées chaînées par SHA-256 ». Puis « Simuler une modification après coup » → « ✗ Altération détectée à l'entrée #1 » | Les vraies empreintes du journal se lient par des maillons ambre (un filet se trace d'une entrée à la suivante). Coupe sèche sur l'altération détectée | JOURNAL CHAÎNÉ · SHA-256 |
| C1 | 18,70–22,20 | 1122–1332 | « Boussole. L'IA guide, l'humain décide. » (18,85–21,20) | **Carte 1** | Tout se pose en 0,5 s (fondu et flou → net, en décalé), puis **reste immobile 3,0 s**. QR, logo et texte ne bougent plus ; seule la lueur du fond dérive, très lentement | Logo + Boussole · L'IA guide, l'humain décide. · QR · `sam-halimi.github.io/hackathon-codeML-SAA` · Prototype · données fictives |
| C2 | 22,20–24,20 | 1332–1452 | — | **Carte 2** : « made by / riccardo bosso » (Spotify end card v2) | Telle quelle, ~2 s | — |

**Total ≈ 24,2 s (1 452 images).** Partie problème = plans 1-2 (sobre). Bascule = plan 3. Partie produit = plans 4-7 (plus riche).

### Déroulé court : idée 2
| Temps | VO | Image |
|---|---|---|
| 0–3,8 | Six pour cent… à la police. | Photo C (couloir vide la nuit), ratio typographique : 100 points, 6 restent allumés en crème |
| 3,8–5,6 | Porter plainte peut attendre. | Ligne pointillée crème qui file et sort du cadre (pas d'échéance) |
| 5,6–8,0 | La preuve, elle, a une date d'expiration. | Ligne ambre parallèle qui s'arrête net. Photo A en fond |
| 8,0–10,0 | On répare la première nuit. | Les deux lignes se croisent et forment l'aiguille → logo |
| 10,0–12,4 | Chaque étape demande son accord. | **UI réelle** : consentement, 3 cases cochées, « Transmission à la police » laissée décochée (plan héros) |
| 12,4–15,6 | L'IA, Claude, range les notes et cite ses sources. | **UI réelle** : chronologie + filet vers la source. Puis 0,8 s de checklist avec l'étiquette « RÈGLES · PAS D'IA » |
| 15,6–18,0 | Le soignant valide tout. | **UI réelle** : validations, puis 0,6 s de badge « Intégrité vérifiée » |
| 18,0 → | cartes 1 et 2 | |

### Déroulé court : idée 3
| Temps | VO | Image |
|---|---|---|
| 0–3,8 | Six pour cent… à la police. | Ratio en barres : 100 barres, 94 se vident |
| 3,8–6,8 | Près d'une cause sur trois dépasse les délais Jordan. | 3 barres, une glisse hors du cadre (flou) · *Ombudsman fédéral* |
| 6,8–8,8 | On ne répare pas les tribunaux. | Photo C, couloir vide. Silence presque total |
| 8,8–12,6 | On répare la première nuit, parce que la preuve a une date d'expiration. | Logo, puis le compteur de l'idée 1 en version courte |
| 12,6–16,4 | Des règles calculent les délais, et l'IA range les notes. | **UI réelle** : checklist, puis chronologie |
| 16,4–19,5 | Le soignant valide tout. | **UI réelle** : validations, puis badge d'intégrité |
| 19,5 → | cartes 1 et 2 | |

---

## 5. Voix (ElevenLabs)

### Options de casting
Voix féminine posée, français québécois neutre (registre « Radio-Canada », ni joual ni accent de France).

| Option | Profil | Lecture | Réglages de départ | Pour / contre |
|---|---|---|---|---|
| **A : « Infirmière-chef »** (recommandée) | 35-45 ans, médium, chaleureuse et ferme | Posée, fins de phrase vers le bas, pas de sourire dans la voix | vitesse 0,92 · stabilité 0,60 · similarité 0,80 · style 0,10 · speaker boost | Crédible face à un jury du milieu de la santé ; peut sonner « institutionnel » si trop lisse |
| **B : « Documentaire »** | 40-55 ans, plus grave, léger grain | Lente, silences longs | vitesse 0,88 · stabilité 0,65 · style 0,05 | Gravité maximale ; risque de dépasser 19 s |
| **C : « Proche »** | 28-35 ans, intime, près du micro | Douce, presque confidentielle | vitesse 0,95 · stabilité 0,50 · style 0,20 | Plus moderne (Spotify) ; moins d'autorité, moins intelligible dans le bruit |

**Recherche (étape 3)** : dans la Voice Library, filtres langue français, accent canadien/québécois, voix féminine, usage narration. Je retiens 4 voix (une par direction, plus une surprise) et je les fais lire sur la même ligne d'essai :
> « La preuve a une date d'expiration. On répare la première nuit. Boussole. L'IA guide, l'humain décide. » (101 caractères)

**Modèle** : Multilingual v2 par défaut (stable en français, accepte les balises `<break>`). v3 en option si la voix A manque de nuance : plus expressif, mais moins contrôlable. À confirmer sur le compte à l'étape 3.

### Prononciation
Ces graphies ne servent que pour le texte envoyé à ElevenLabs. Les sous-titres et le texte à l'écran gardent la vraie orthographe.

| Mot | Texte envoyé | Pourquoi |
|---|---|---|
| Boussole | « Boussol » (secours : « Bou-sol ») | Évite un « e » final appuyé ou une lecture à l'anglaise |
| Claude | « Klôde » | Évite le « Clawd » anglais ; on veut /klod/ |
| IA | « l'i-a » | Évite « ya » ou le « A-I » anglais |
| 24 h, 6 % | « vingt-quatre heures », « six pour cent » | Jamais de chiffres ni de symboles dans le texte envoyé |
| Jordan (idée 3) | « Jordan » contre « Jordane » | Prononciation juridique québécoise, à trancher à l'oreille |

### Deux prises en un appel
Le texte envoyé contient la prise A, puis `<break time="1.5s" />`, puis la prise B (ponctuation légèrement différente pour varier la lecture). L'appel passe par le point d'accès « with timestamps », qui renvoie l'alignement caractère par caractère. Cet alignement sert à : (1) découper les deux prises, (2) recaler l'image sur chaque mot, (3) piloter l'atténuation de la musique.

### Estimation des crédits
Base : ~1 crédit/caractère en Multilingual v2, à confirmer sur ton compte avant de lancer.

| Étape | Calcul | Crédits |
|---|---|---|
| Auditions | 4 voix × 101 car. × 2 prises | ≈ 810 |
| VO finale (idée 1) | 330 car. × 2 prises, en 1 appel | ≈ 660 |
| Réserve (1 correction complète) | idem | ≈ 660 |
| **Maximum** | | **≈ 2 130** |

---

## 6. Musique (originale, générée en code)

- **Outil** : Python (numpy/scipy), synthèse soustractive et additive. Rendu 48 kHz / 24 bits, une piste par stem (sub, pad, pulsation, arpège, swells).
- **Tempo** : fixé **après** la VO, entre 76 et 84 BPM, pour que la bascule (« On répare… ») et la carte 1 tombent sur un premier temps.
- **Tonalité** : ré mineur, puis fa majeur (la relative) à la bascule.

| Partie | Temps (idée 1) | Harmonie | Instruments | Intention |
|---|---|---|---|---|
| Tension | 0–7,1 s | Pédale de ré (sub 37 Hz + 73 Hz). Cluster aigu la/si♭ qui bat lentement | Drone, bruit filtré très bas, pulsation sourde (battement ou horloge) qui entre à 2,75 s | Tendu, retenu, presque silencieux sous la voix |
| Bascule | 7,1 s | Swell inversé → Si♭maj9 | Pad chaud qui s'ouvre (filtre), le sub glisse de ré à si♭ | Le soulagement, pas le triomphe |
| Espoir | 9,3–18,7 s | Si♭maj7 – Fa/La – Solm9 – Do sus4 → Do | Arpège en croches (piano feutré de synthèse), pad, pulsation douce | Avancer, confiance ; monte un peu à chaque battement produit |
| Résolution | 18,7–22,2 s | Fa add9 tenu | Pad + une note de piano | Stable sous la carte QR |
| Queue | 22,2–24,2 s | Fa add9 qui résonne (réverbe longue) | — | Le dernier accord sonne sous la carte made by |

**Arrangée autour de la voix**
- Pendant chaque mot, la musique reste **au moins 15 dB sous la VO**. Mesure : sonie momentanée sur 400 ms, VO − musique ≥ 15 LU, vérifiée sur toute la durée.
- Atténuation automatique pilotée par l'alignement des mots (attaque 60 ms, relâchement 250 ms). Creux d'EQ permanent de −4 dB entre 1,5 et 4 kHz dans la musique.
- Entre les phrases, la musique remonte de 4 à 6 dB (rampes de 120 ms).
- **Aucun limiteur sur la voix.**

**Master** : −14 LUFS intégré, −1 dBTP.
- VO : passe-haut 80 Hz, de-esser, compression douce (2:1, ~3 dB de réduction), aucun limiteur.
- Bus musique + effets : atténuation, EQ, compression de colle, limiteur true-peak sur **ce bus seulement**.
- Somme à gain linéaire jusqu'à −14 LUFS. Si un pic de voix dépasse −1 dBTP, on baisse le gain du clip concerné, sans limiteur.
- Les mesures (intégré, LRA, true peak, écart VO/musique) sont reportées dans le README.

---

## 7. Plan des effets sonores (idée 1)

Tous les sons viennent de ta bibliothèque **FOUR Editors Sound Effects**. Je choisis les fichiers exacts à l'étape 2, une fois le dossier listé, et je les copie dans `assets_in/sfx/` sous leur nom d'origine.

**Règles**
- **Partie problème (0–7,1 s), retenue** : peu de couches, passe-bas ~8 kHz, stéréo étroite, niveaux bas.
- **Partie produit (7,1 s →), plus riche** : stéréo large, couches (whoosh + hit + son d'UI), plus de brillance.
- Pendant un mot, chaque effet prend un creux de −4 à −8 dB entre 2 et 5 kHz et reste au moins 10 dB sous les crêtes de la voix. On place et on égalise, **on ne retire rien**.

| t (s) | Événement | Catégorie | Niveau | Traitement |
|---|---|---|---|---|
| 0,20 | Entrée de « La preuve… » | Whoosh d'air court | Discret | Passe-haut 200 Hz, passe-bas 8 kHz |
| 1,05 | « date » | Tic d'horloge sec | Discret | Mono |
| 2,05 | « expiration » se pose, la règle se trace | Hit grave feutré | Moyen | Passe-bas 2 kHz |
| 2,60 | Entrée du compteur | Whoosh court | Discret | — |
| 2,8–6,5 | Le compteur défile | Tics d'horloge qui accélèrent (hauteur 0 → +5 demi-tons) | Discret | Sous la voix, creux 2-4 kHz −6 dB |
| 6,55 | `00:00:00` se bloque | Arrêt mécanique + hit sec | Moyen | — |
| 6,8 | Queue | Swell inversé vers la bascule | Discret → moyen | — |
| 7,05 | Entrée de « On répare… » | Whoosh long, large | Moyen | Stéréo large |
| 7,6 | L'aiguille se fixe au nord | **Signature logo** : impact doux + scintillement tonal, accordé en fa | **Fort** (sommet de la bascule) | — |
| 8,7 | « nuit » se pose | Hit léger | Discret | — |
| 9,25 | Le panneau d'UI entre | Whoosh moyen | Moyen | — |
| 9,5 | Le curseur se pose sur 30 h | Clic d'UI | Moyen | Panoramique selon la position |
| 10,0 | Arrivée de la liste triée | Whoosh mini + 3 tics d'UI | Moyen | Panoramique gauche → droite |
| 10,4 | Anneau sur « 18 h » | Pop doux | Moyen | — |
| 10,8 | Anneau sur la ligne sang | Tic grave | Moyen | — |
| 11,0 | Étiquette « RÈGLES · PAS D'IA » | Whoosh mini + hit | Moyen | — |
| 11,35 | Entrée de la chronologie | Whoosh moyen | Moyen | — |
| 11,6 | Clic sur « Générer » | Clic d'UI | Moyen | — |
| 12,0–13,2 | Les lignes apparaissent | Texture de clavier | Discret | Passe-bas 6 kHz |
| 13,4 | Le filet relie la ligne à sa source | Swish fin + tic | Moyen | — |
| 14,2–14,9 | Les 3 lignes « Aucun… » | 3 tics | Discret | — |
| 15,4–16,6 | 6 × Valider, 1 × Rejeter | 6 clics d'UI + 1 clic plus grave | Moyen | Alterné gauche/droite ±20 |
| 16,8 | « tout » se pose | Hit | Moyen | — |
| 17,0 | Entrée de l'export | Whoosh | Moyen | — |
| 17,3 | Badge « Intégrité vérifiée » | Scellé (ruban ou loquet métallique) + hit | Fort | — |
| 17,6–17,9 | Les maillons SHA-256 se lient | 3 micro-clics de chaîne | Discret | — |
| 18,3 | « Altération détectée » | Choc sec, **pas d'alarme** | Moyen | — |
| 18,6 | Transition vers la carte 1 | Whoosh long | Moyen | — |
| 18,9 | Le logo et la carte se posent | Signature logo (reprise courte) + hit | Fort | — |
| 22,1 | Transition vers la carte 2 | Whoosh doux | Discret | — |
| 22,2–24,2 | Carte made by | Son propre de la carte v2, s'il y en a un | — | — |

---

## 8. Éléments visuels

| # | Élément | Source | Statut |
|---|---|---|---|
| V1 | Logo (anneau + aiguille) | `app/src/components/Demo.tsx` → `Logo`, recréé en vecteur à l'identique : viewBox 32, cercle r=14 trait 2, aiguille `M16 5 L20 16 L16 27 L12 16 Z`, ambre `#E8A33D` | Dans le repo |
| V2 | Mot-symbole « Boussole » | SF Pro Display Bold | Police à fournir (§13) |
| V3 | QR code | `docs/assets/qr-boussole.png`, 1024×1024. **Vérifié** : il renvoie à `https://sam-halimi.github.io/hackathon-codeML-SAA/` | OK |
| V4 | URL | `sam-halimi.github.io/hackathon-codeML-SAA` | OK |
| V5 | UI : nouvel enregistrement de `/demo` | Navigateur sans affichage (Playwright), cas fictif `#DEMO-0042`. Ce n'est pas ton écran | À tourner (étape 4) |
| V6 | Photo A : enveloppe ou sac de preuve scellé, macro | Unsplash/Pexels | À valider à l'étape 2 |
| V7 | Photo B : horloge murale, couloir d'hôpital la nuit | Unsplash/Pexels | À valider à l'étape 2 |
| V8 | Photo C : couloir d'hôpital vide, la nuit (idées 2 et 3, fond de carte possible) | Unsplash/Pexels | À valider à l'étape 2 |
| V9 | Photo D (optionnelle) : mains qui tapent sur un clavier, manche de blouse, sans visage (transition vers les notes) | Unsplash/Pexels | À valider à l'étape 2 |
| V10 | Carte 2 « made by / riccardo bosso » (Spotify end card v2) | Ta source | **À fournir** (§13) |
| V11 | Couche motion (lueur, grain, filets, compteur, maillons) | Code (Remotion) | À faire |

**Critères des photos** : photoréalistes, contexte neutre, aucune personne identifiable, aucun patient, aucune marque lisible. On les étalonne vers le bleu nuit, avec une seule source ambre. Je te soumets 2-3 candidates par photo (lien, auteur, licence) avant tout téléchargement. Tout est consigné dans `assets_in/CREDITS.md`.

**Prises d'UI pour le nouvel enregistrement**

| Prise | Étape de `/demo` | Action filmée | Idée 1 | Idée 2 | Idée 3 |
|---|---|---|---|---|---|
| U1 | 1. Consentement | Cocher examen, prélèvements, conservation ; laisser « Transmission à la police » décochée | — | **plan héros** | — |
| U2 | 2. Dossier guidé | Curseur à 30 h, substance « Oui » → la question ajoutée apparaît | plan 4 | — | option |
| U3 | 3. Prélèvements | Arrivée sur la liste triée ; cocher « Prélèvements cutanés » | plan 4 | flash | plan produit |
| U4 | 4. Chronologie | « Ce que l'IA voit » (4 identifiants masqués) | option | option | — |
| U5 | 4. Chronologie | « Générer » → lignes, citations, trou, incohérence | plan 5 | oui | oui |
| U6 | 4. Chronologie | 6 × Valider, 1 × Rejeter, « Corrigé » | plan 6 | oui | oui |
| U7 | 5. Export | Badge d'intégrité + journal (empreintes) | plan 7 | flash | flash |
| U8 | 5. Export | « Simuler une modification » → altération détectée | plan 7 | — | — |

**Spécifications de capture**
- **16:9** : viewport 1280×720 px CSS, `deviceScaleFactor` 3, soit 3840×2160. Le texte est assez gros pour cadrer serré sans perdre le bandeau.
- **9:16** : viewport 432×768, facteur 2,5, soit 1080×1920. C'est la vraie mise en page mobile de l'appli (elle est responsive), sans cadre de téléphone.
- Capture image par image à 60 i/s avec une horloge virtuelle : déterministe, en PNG sans perte, sans interpolation.
- `demo.webm` actuel (1600×900, 25 i/s, VP8) : trop doux pour des recadrages et pour le 60 i/s. Il reste en secours, plans larges seulement.

---

## 9. Animations : nouvelles, rien de recyclé

**Déjà utilisé dans `boussole-demo.mp4`, donc interdit ici** : horloge « 3:00 » en fondu ; mot qui vire au rouge ; sous-titres en boîte en bas ; zoom d'échelle sur l'enregistrement plein cadre ; pastille qui rebondit en haut à droite ; aiguille qui pivote en ressort depuis −140° ; carte de fin avec le QR à droite, en fondu.

**Nouveau pour ce film**
1. Mots qui montent à travers une fente (masque), avec un flou de mouvement vertical, calés mot à mot sur la VO.
2. Règle de date qui se trace sous un mot.
3. Compteur à rouleaux (odomètre) avec flou vertical, accélération non linéaire et blocage sec.
4. Raccord graphique : le compteur s'écrase en barre, la barre devient l'aiguille, l'anneau se trace.
5. Interlettrage qui se resserre, avec flou.
6. Panneau d'UI qui flotte en 3D avec profondeur de champ (perspective, arrière-plan flou) ; la caméra se redresse.
7. Travelling latéral sur l'UI au lieu des zooms.
8. Filet ambre qui relie une ligne de chronologie à sa phrase source (tracé avec une tête lumineuse).
9. Anneau de focus ambre aux vrais clics (une seule onde, pas de curseur).
10. Étiquettes reliées au panneau par un filet, au lieu de pastilles.
11. Maillons ambre qui se tracent entre les empreintes SHA-256.
12. Mise au point qui glisse sur les photos et balayage lumineux.
13. Couche continue : lueur ambre qui dérive lentement (bruit de Perlin) et grain fin et propre.

**Règles de mouvement** : flou de mouvement fort sur chaque déplacement (obturateur 180-270°, 8-12 échantillons). Courbes lentes et précises (type expo-out), **aucun rebond, aucun ressort**.

**Typographie**
- SF Pro Display : Bold pour les titres (interlettrage −2 %), Semibold pour les mots de la VO, chiffres tabulaires pour le compteur.
- SF Pro Text pour les sources.
- Tailles en 16:9 : titres ≥ 88 px ; étiquettes 34 px en capitales, interlettrage +12 % ; sources 26 px à 60 % d'opacité.

---

## 10. Version 9:16

- Même son, mêmes timings.
- Mise en page : texte dans le tiers supérieur, UI issue de la capture portrait au centre, contenu essentiel entre y = 250 et y = 1670 (marges des interfaces du site et des réseaux).
- Titres 84-96 px. Sources 30 px.
- Carte 1 : logo et slogan en haut, QR d'au moins 600 px de large au centre, URL dessous.

---

## 11. Intégration au pitch (diapo 2)

- Le film remplace le clip muet de 40 s. **Le lire en plein écran** : dans la colonne de 60 % prévue par `docs/SLIDES.md`, la typo serait trop petite pour le fond de la salle.
- Personne 3 dit seulement « On ne répare pas les tribunaux. », puis [CLIC]. Le film enchaîne et sa VO dit « On répare la première nuit. ». La personne 3 se tait pendant le film : la VO et elle ne se superposent jamais.
- Le bloc 4 passe de ~60 s à ~40 s (une phrase, le film de ~24 s, puis les ~13 s actuelles d'après-clip), ce qui libère ~20 s (marge, ou questions). `docs/PITCH.md` sera à ajuster en conséquence (tableau « pendant le clip »).
- **Son** : tester la sortie audio de la salle (HDMI). Plan B : version muette sous-titrée (livrée), et la personne 3 lit la VO.
- **Site** : la lecture automatique y est muette, donc on met la version sous-titrée ou le fichier SRT.

---

## 12. Production, livrables, contrôle

**Ordre de travail** (tes règles)
1. Ce brief, puis ton OK.
2. Liste des éléments (photos candidates avec leurs licences, fichiers SFX choisis), puis ton OK avant tout téléchargement.
3. Options de voix, puis ton choix.
4. PREVIEW v1 en 16:9 avec planche contact, puis tes retours, en boucle jusqu'à ton accord.
5. Finals 16:9 et 9:16, stems, README.
6. Projet DaVinci Resolve complet, seulement si tu le demandes.

**Outils** : Remotion (projet `video/`, nouvelles compositions à 60 i/s, `@remotion/motion-blur`) ; Playwright pour la capture ; Python pour la musique, le mixage et la mesure de sonie ; ffmpeg pour les contrôles.

**Dossier**
```
ADV/Boussole Ad/
  brief/PROMPT.md
  assets_in/   photos/ sfx/ fonts/ endcard/ rec/   + CREDITS.md
  voice/       auditions/ takes/
  music/
  build/       compositions et scripts
  renders/     preview/ final/
  stems/
  README.md
```

**Livrables (étape 5)**
- `Boussole_Ad_16x9_60fps.mp4` (1920×1080) et `Boussole_Ad_9x16_60fps.mp4` (1080×1920) : H.264, 60 i/s, AAC 48 kHz 320 kb/s.
- Variantes sous-titrées (16:9 et 9:16) et `Boussole_Ad_FR.srt`.
- Stems WAV 48 kHz / 24 bits : VO, musique, effets par catégorie (whoosh, hits, UI, logo, ambiance), M&E, mix complet.
- README : sources, réglages de voix, mesures de sonie, crédits.

**Contrôle avant chaque envoi**
- [ ] Bandeau « DONNÉES 100 % FICTIVES » lisible sur chaque plan d'interface ; « pré-enregistrée » et « PROTOTYPE » visibles là où il faut
- [ ] Aucune UI inventée, aucun faux curseur, aucun badge qui défile
- [ ] Chiffres à l'écran = chiffres dits = chiffres de l'appli (18 h, 42 h, sang dépassé de 6 h, 15 entrées)
- [ ] Aucun visage, aucun nom réel, aucun rouge ajouté
- [ ] QR testé avec 2 téléphones sur l'export final, à taille de projection
- [ ] −14 LUFS / −1 dBTP mesurés ; VO − musique ≥ 15 LU pendant chaque mot ; aucun limiteur sur la voix
- [ ] 60 i/s réels (pas de doublons d'images), 16:9 et 9:16

---

## 13. Ce qu'il me faut, et tes décisions

1. **Ton OK sur ce brief**, avec : l'idée (1, 2 ou 3), la direction de voix (A, B ou C), et la confirmation qu'on laisse Cornell de côté.
2. **Environnement.** Ce brief a été écrit dans une session cloud (conteneur Linux). Ton Bureau, le SSD « Extreme Pro » et DaVinci Resolve n'y sont pas accessibles. Deux options :
   - **(a)** poursuivre les étapes 2 à 6 dans Claude Code sur ton Mac : le plus simple pour les SFX, le dossier `~/Desktop/ADV` et Resolve ;
   - **(b)** rester ici, en me fournissant :
     - la clé ElevenLabs, en variable d'environnement `ELEVENLABS_API_KEY` dans les réglages de l'environnement ;
     - les fichiers SF Pro Display et SF Pro Text ;
     - la source de la carte « Spotify end card v2 » ;
     - les SFX : le dossier, ou au moins les catégories whoosh / hits / UI / horloge / logo, par téléversement ou Google Drive.
3. **Police.** La licence d'Apple limite SF Pro aux maquettes d'interfaces pour les plateformes Apple. Pour une pub publique, Inter Display (licence libre, même famille que l'appli) est l'équivalent sans risque. Je suis ta règle (SF Pro) sauf si tu changes.
4. **Nouvel enregistrement de `/demo`** (navigateur sans affichage, données fictives, pas ton écran) : OK pour toi ?
