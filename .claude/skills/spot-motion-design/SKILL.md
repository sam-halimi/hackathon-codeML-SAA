---
name: spot-motion-design
description: "Fabrique de bout en bout, au niveau « version finale » dès la première passe, une vidéo de présentation en motion design pour un produit, une application ou un projet de hackathon. Récit douleur → mise en contexte → bascule → démonstration des vraies interfaces, fonctionnalité par fonctionnalité → assistant IA → signature et carton de fin. voix off naturelle (ElevenLabs via Higgsfield), image calée mot à mot sur la voix (Whisper), animation Remotion sur des captures réelles, musique et bruitages originaux générés par le code, master −14 LUFS / −1 dBTP, rendus 16:9 et 9:16 à 60 i/s, copies web, pistes séparées, planches contact et contrôle qualité. Utilise ce skill dès qu'on demande une vidéo de présentation, un spot, une vidéo motion design, une vidéo pitch ou démo pour un jury, un trailer produit ou une vidéo avec voix off pour une app ou un site, même sans nommer Remotion ni ElevenLabs. En anglais aussi, promo video, product explainer, pitch video, launch video, demo video with voiceover."
---

# Spot motion design : de l'idée au master

Ce skill reproduit la méthode du spot NOVA (Projet 360, hackathon CodeML 2026). Ce spot a été validé tel quel par l'équipe, à la première version. On ne fait donc pas un « premier jet » : on vise directement le master, en passant par des contrôles à chaque étape.

L'implémentation complète de référence est dans `assets/modele-nova/` : brief, texte de la voix, scripts audio, captures, scènes Remotion, finalisation. Copie-la, puis adapte-la au nouveau produit. Elle encode des dizaines de petites décisions de rythme, de son et de mise en page qui font la qualité finale. Repartir d'une page blanche les perd.

## Le niveau attendu

Ce que l'utilisateur a jugé « exceptionnel », et qu'il faut retrouver :

- **Un vrai récit.** On fait d'abord ressentir la douleur : un moment précis (« Mercredi, neuf heures »), un enjeu daté, l'avalanche de documents, deux ou trois pièges concrets et vrais, puis la question pivot (« Qui croire ? »). Ensuite seulement, le soulagement : le produit, une fonctionnalité par phrase, l'IA, la promesse.
- **Une voix off qui ne fait pas robot.** La voix est choisie par mesure parmi plusieurs, avec deux prises, et le texte est écrit pour l'oral. Les respirations sont placées par la ponctuation.
- **L'image suit la voix au mot près.** Chaque plan démarre sur sa phrase. Chaque geste (clic, coup, apparition) tombe sur le mot qui le nomme.
- **Les vraies interfaces.** On utilise des captures HD de l'application réelle et les vrais chiffres. Jamais de faux tableau de bord.
- **Un son de film.** Musique originale en deux actes (tension en mineur, puis solution en majeur), bruitages denses calés image par image, musique au moins 15 LU sous la voix, aucun compresseur sur la voix, master −14 LUFS / −1 dBTP.
- **Deux formats à partir d'une seule source.** 16:9 (1920×1080) et 9:16 (1080×1920), à 60 i/s, avec un cadrage propre à chaque format.
- **Une fin signée.** Le logo et la promesse, l'adresse, puis un carton animé de 2 s (« réalisé par / l'équipe … »).
- **Une livraison complète.** Les masters, les copies web (MP4 et WebM), les pistes séparées, les planches contact et un README de livraison.

## Règles de conduite

Chaque règle est là parce qu'une erreur réelle l'a imposée.

1. **Rien d'inventé à l'écran ni dans la voix.** Les dates, montants, noms et extraits viennent des données du produit ou du dossier. Le brief contient une section « Vérification des faits » qui relie chaque affirmation à sa source. Un jury repère un chiffre faux, et toute la vidéo perd sa crédibilité. Lors du premier passage, des lignes de plan « crédibles » mais inventées s'étaient glissées dans le spot NOVA : elles ont été remplacées par les vraies.
2. **Les crédits se dépensent avec accord.** Estime le coût de la voix (`get_cost: true`) et annonce-le. Attends le « go », sauf si l'utilisateur a demandé une mission autonome (« ne me demande rien »).
3. **Ne jamais filmer ni capturer l'écran de l'utilisateur.** Les captures viennent d'un navigateur automatique (Playwright) qui ouvre l'application. C'est plus net, et cela respecte la vie privée.
4. **La voix commande le montage.** On écrit le texte, on génère la voix, on la transcrit mot à mot, puis on cale l'image. Jamais l'inverse : une voix étirée pour coller à l'image sonne faux.
5. **Données confidentielles hors de git.** Les captures, les rendus et les pistes sont régénérables : ils vont dans `.gitignore`. Vérifie les règles du dépôt (README) avant de committer des extraits de documents.
6. **Contrôler avant de rendre.** Un rendu complet prend 10 à 15 min par format. Vérifie d'abord par des images fixes aux instants clés (`apercus.mjs`).

## Le pipeline en 9 étapes

Suis les étapes dans l'ordre. Chacune se termine par un critère de sortie : ne passe à la suivante que s'il est rempli. Le détail de chaque étape est dans le fichier de référence indiqué.

### 0. Environnement

- Node 18+, Python 3 avec `numpy`, `scipy`, `pyloudnorm` et `faster-whisper`, ffmpeg, Playwright.
- Projet Remotion : soit le projet existant (dossier `video/`), soit `npx create-video@latest`, puis copie de `assets/modele-nova/`.
- Remotion 4.x, `@remotion/fonts`, `@remotion/renderer` pour les images fixes.
- Dans un conteneur sans Chrome compatible, pointe Remotion vers le `headless_shell` de Playwright (voir `remotion.config.ts` du modèle). Le Chromium système a échoué : l'ancien mode sans tête a été retiré.
- Critère : `npx remotion compositions` liste les compositions, et `python3 -c "import faster_whisper, pyloudnorm"` passe.

### 1. Comprendre le produit et trouver la douleur

Ouvre l'application, lis ses données et sa documentation. Trouve :

- le personnage qui décide ;
- le moment où il souffre ;
- les 3 ou 4 pièges vrais et sourcés ;
- les 4 ou 5 fonctionnalités qui répondent à ces pièges ;
- la promesse en une phrase.

→ `references/01-brief-et-recit.md`, partie « Trouver l'histoire ».

Critère : une liste de pièges avec leur source, et une liste de fonctionnalités avec l'écran qui les montre.

### 2. Écrire le brief `brief/PROMPT.md`

Le brief contient :

- le concept ;
- la direction artistique, tirée des couleurs et polices du produit ;
- le découpage en table (plan, temps, image, voix, son) ;
- le texte de la voix, une phrase par plan ;
- la vérification des faits ;
- la voix, la musique, les bruitages, le mixage et la livraison ;
- un tableau des adaptations, s'il y a un gabarit.

→ `references/01-brief-et-recit.md`. Exemple complet : `assets/modele-nova/brief/PROMPT.md`.

Critère : 55 à 70 s, 14 à 19 phrases, environ 150 à 170 mots, chaque chiffre sourcé.

### 3. Voix off

1. Fais passer une phrase test à 4 à 6 voix (Higgsfield `text2speech_v2`, variante `elevenlabs`).
2. Mesure-les avec Whisper : langue, exactitude, débit, pauses.
3. Estime le coût du texte complet.
4. Génère deux prises en un seul appel, et garde la meilleure.

→ `references/02-voix.md`.

Critère : exactitude Whisper ≥ 0,95, aucune phrase mal couverte, mots pivots bien prononcés.

### 4. Calage

- `python3 audio/analyser_voix.py audio/voix/prise1.mp3 audio/voix/prise2.mp3` : transcription mot à mot et choix de la prise.
- `python3 audio/caler.py audio/voix/prise1.mp3` : écrit `src/<projet>/minutage.json` (débuts de phrases et instants des mots-clés).

→ `references/03-calage.md`.

Critère : aucun avertissement « mot-clé introuvable », et des débuts de phrases cohérents à l'écoute.

### 5. Captures de l'application réelle

`node outils/capturer.mjs` produit les captures HD à l'échelle 2 dans `public/captures/`. Il écrit aussi les positions des éléments clés dans `src/<projet>/boites.json`, pour y placer curseur, anneaux et zooms.

→ `references/04-captures.md`.

Critère : chaque fonctionnalité du découpage a sa capture. Pas d'en-tête collant par-dessus, pas d'animation figée à mi-course, polices chargées.

### 6. Animation Remotion

- Une scène par plan, en fonction pure du temps global `t`.
- Les fenêtres des scènes sont dérivées du minutage (`temps.ts`).
- Les primitives réutilisables sont dans `ui.tsx` : fonds, grain, texte cinétique, curseur, anneau, fenêtre de navigateur, caméra avec flou de mouvement.
- Le cadrage 9:16 a ses propres clés de caméra.
- Vérifie avec des images fixes aux instants clés.

→ `references/05-remotion.md`.

Critère : les images fixes aux mots-clés montrent le bon état, dans les deux formats, et `npx tsc` passe.

### 7. Son

`python3 audio/composer.py` produit :

- la musique en deux actes ;
- les bruitages calés sur les mêmes repères ;
- le mixage (voix à −20 LUFS, musique compressée par la voix jusqu'à −9 dB et 16 LU dessous, bruitages à −27 LUFS) ;
- le master (gain fixe, puis limiteur suréchantillonné ×4, ajusté jusqu'à −14 ±0,1 LUFS et ≤ −1 dBTP) ;
- `mesures.json`.

→ `references/06-son.md`.

Critère : écart voix/musique ≥ 15 LU pendant la parole, master à −14 LUFS et ≤ −1 dBTP.

### 8. Rendu

```
npx remotion render <Comp>16x9 out/<nom>_16x9_image.mp4 --muted --concurrency=4 --crf=16 --jpeg-quality=95
npx remotion render <Comp>9x16 out/<nom>_9x16_image.mp4 --muted --concurrency=4 --crf=16 --jpeg-quality=95
```

L'image se rend sans le son. Le son masterisé est assemblé à l'étape 9. Lance les rendus en arrière-plan et attends la fin avec une boucle (`until … ; do sleep 5; done`), pas avec `sleep` au premier plan.

### 9. Finalisation, contrôle qualité, livraison

`node outils/finaliser.mjs` produit :

- l'assemblage image + son (AAC 320 kb/s, faststart) ;
- les planches contact (24 images horodatées) ;
- les copies web (H.264 CRF 23 et WebM VP9) ;
- les pistes WAV ;
- le README de livraison.

Passe ensuite la liste de contrôle, puis livre.

→ `references/07-controle-qualite.md` et `references/08-livraison.md`.

Critère : liste de contrôle entièrement cochée.

## Structure du projet vidéo

```
video/
├── brief/PROMPT.md            brief de production (étape 2)
├── audio/
│   ├── texte_voix.txt         une ligne = une phrase = un plan
│   ├── voix/prise1.mp3 …      prises + transcriptions .json
│   ├── analyser_voix.py       Whisper mot à mot, exactitude, débit
│   ├── caler.py               → src/<projet>/minutage.json
│   ├── composer.py            musique, bruitages, mixage, master
│   └── rendu/                 pistes + mesures (non versionné)
├── outils/
│   ├── capturer.mjs           captures HD de l'app + boites.json
│   ├── apercus.mjs            images fixes de contrôle
│   └── finaliser.mjs          assemblage, copies web, pistes, planches, README
├── public/                    polices de la marque (OFL), grain ; captures/ (non versionné)
├── src/<projet>/
│   ├── minutage.json, boites.json
│   ├── temps.ts               P(n), K(mot), SCENES, courbes, caméra
│   ├── theme.ts               couleurs, polices, icônes
│   ├── ui.tsx                 primitives partagées
│   ├── <Projet>Spot.tsx       assemblage des scènes
│   └── scenes/                Douleur, Solution, Assistant, Fin
└── out/                       masters, web/, pistes/, planches, README (non versionné)
```

## Temps et budget (référence NOVA)

| Poste | Valeur |
|---|---|
| Voix | 0,45 crédit Higgsfield pour 120 caractères, environ 2,85 crédits par prise du texte complet (≈ 1 000 caractères), auditions comprises : moins de 10 crédits en tout |
| Rendu | 3 815 images par format, 10 à 15 min avec `--concurrency=4` |
| Son | 1 à 2 min de synthèse |
| Poids | master 16:9 ≈ 66 Mo, 9:16 ≈ 58 Mo ; copies web ≈ 15 Mo (MP4) et 16 à 20 Mo (WebM) |

## Pièges déjà rencontrés

| Symptôme | Cause | Remède |
|---|---|---|
| Le rendu Remotion ne démarre pas | Chromium système sans l'ancien mode sans tête | `Config.setBrowserExecutable` vers le `headless_shell` de Playwright |
| Un mot-clé arrive trop tôt | Whisper colle un mot au précédent | `caler.py` corrige par `silencedetect` et normalise « l'… » |
| « 9h », « 18 000 $ » mal alignés | Chiffres dans le texte, mots dans la transcription | Table `NOMBRES` et normalisation dans `analyser_voix.py` |
| La marque est épelée (« N-O-V-A ») | Sigle en capitales | L'écrire « Nova » dans le texte de la voix |
| Master sans relief (LRA écrasé) | `loudnorm` en mode dynamique | Gain fixe puis `alimiter` suréchantillonné ×4, ajusté en boucle |
| Preuves fermées dans une capture | Accordéon replié | Lien profond ou clic avant la capture |
| Capture prise en plein défilement | `scroll-behavior: smooth` | CSS injecté `scroll-behavior:auto!important` |
| En-tête collant sur les captures d'éléments | `position: sticky` | Classe `capture-element` qui le rend statique |
| La scène coupe au milieu d'un état | Fenêtre de scène trop courte | Images fixes aux bornes des scènes, puis recalage |
| Tout est minuscule en 9:16 | Mise en page pensée en 16:9 | Clés de caméra et zooms propres au vertical (`useFormat().vertical`) |
| TS2783 (`transform` défini deux fois) | Deux styles fusionnés | Imbriquer un `AbsoluteFill` |
| Le navigateur de test ne lit pas le MP4 | Chromium de Playwright sans H.264 | Fournir aussi un WebM VP9 + Opus |
| Fichier non livré (> 30 Mo) | Limite d'envoi | Masters hébergés ; pistes en FLAC (identiques bit à bit) |
| Lien vidéo refusé sur Devpost | Seuls YouTube, Vimeo et Youku s'intègrent | YouTube « non répertoriée » |

## Livrer à l'utilisateur

- Envoie la copie web 16:9 et sa planche contact dès qu'elles existent, pour un retour rapide. Envoie ensuite la 9:16.
- Masters : par hébergement (ils dépassent souvent la limite d'envoi de 30 Mo).
- Pistes : FLAC 24 bits zippées, avec le README.
- Rapport final :
  - durée, formats, voix retenue et pourquoi ;
  - mesures (LUFS, dBTP, écart voix/musique) ;
  - écarts avec la demande et pourquoi (par exemple bruitages synthétisés faute de bibliothèque) ;
  - ce qui n'a pas pu être vérifié.
