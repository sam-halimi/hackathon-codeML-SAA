# Boussole · spec ad « Pas à pas »

Pub de 34 s (+ carte de fin + « made by ») pour Boussole, l'application qui accompagne pas à pas une personne après une agression sexuelle à Montréal. Concept A « Pas à pas », brief validé.

## Où on en est

| Étape | Statut |
|---|---|
| 1. Brief | ✅ `brief/PROMPT.md` (v2, tes décisions intégrées) |
| 2. Liste des éléments | ⏳ `brief/ASSETS.md`, en attente de ton OK (Nunito, QR) |
| 3. Voix | Prête à lancer sur le Mac (`voice/`) |
| 4. Preview v1 | Captures faites (16:9 et 9:16, planches dans `capture/sheets/`), maquette musicale et mix testés ; montage Remotion après ton OK sur Nunito |
| 5. Finaux | — |
| 6. Projet Resolve | Seulement si tu le demandes |

## Dossiers

| Dossier | Contenu |
|---|---|
| `brief/` | Brief et liste des éléments |
| `assets_in/brand/` | Logo et illustrations, rendus depuis le code de l'app (SVG), palette |
| `assets_in/app_ref/` | Visuels du pitch (storyboard, plan B) et QR |
| `assets_in/CREDITS.md` | Sources et licences de tout ce qui entre dans le film |
| `capture/` | Capture image par image du site public (Playwright), journaux du curseur, planches contact |
| `voice/` | ElevenLabs : recherche de voix, phrases test, deux prises en un appel, recalage du film sur la voix |
| `music/` | Musique originale écrite en code (Python) |
| `audio/` | Mix et master : ducking, effets, −14 LUFS / −1 dBTP, rapport |
| `timeline/` | Timing du film recalé sur la voix (`timeline_vo.json`, généré) |

## À lancer depuis ton Mac, dans l'ordre

Prérequis : Node 20 ou plus, Python 3.10 ou plus avec `numpy` et `scipy`, ffmpeg.

### 1. Captures de l'app
Les images ne sont pas dans git (plusieurs Go). Elles se régénèrent à l'identique, puisque l'horloge est figée et les données fictives :

```bash
cd "ADV/Boussole Ad/capture"
npm install && npx playwright install chromium
node capture.mjs 16x9      # ≈ 10 min, 2560×1600, 60 i/s
node capture.mjs 9x16      # ≈ 15 min, 1290×2796, 60 i/s
```

### 2. Voix (étape 3)
La clé reste dans l'environnement, jamais dans le repo. Aucune commande payante ne part sans `--go`.

```bash
cd "ADV/Boussole Ad/voice"
export ELEVENLABS_API_KEY=...
python3 eleven.py credits                    # crédits restants et coût de chaque étape
python3 eleven.py search                     # voices.md + previews/ (extraits gratuits)
python3 eleven.py test ID_A ID_B ID_C --go   # phrase test par voix : tu choisis
python3 eleven.py takes ID_CHOISI --go       # deux prises en un appel, avec horodatages
python3 vo_timeline.py takes/take1           # recale le film sur la prise retenue → timeline/timeline_vo.json
```

### 3. Musique calée sur la voix
```bash
cd "ADV/Boussole Ad/music"
python3 score.py ../timeline/timeline_vo.json   # stems 48 kHz / 24 bits + music_mix.wav
```
La maquette actuelle (`python3 score.py`, sans argument) suit le timing du brief.

### 4. Effets
Copier les ≈ 30 effets choisis dans `assets_in/sfx/<catégorie>/` (liste des besoins dans `brief/ASSETS.md`). Leurs placements (`audio/sfx.json`) seront écrits au montage, à partir des clics réels des journaux de capture.

### 5. Mix et master
```bash
cd "ADV/Boussole Ad/audio"
python3 mix.py ../timeline/timeline_vo.json --sfx sfx.json
```
Le script produit `out/master.wav`, les stems voix, musique et effets, et `out/rapport.md`. Le rapport donne :
- la sonie et la true peak ;
- l'écart musique / voix, phrase par phrase et mot par mot ;
- les endroits où le plafond a travaillé, s'il y en a.

## Règles tenues par les scripts
- **Données** : uniquement fictives (Alex, alex@example.com, +1 514 555-0187) ; aucun texte de récit tapé ; aucun compteur d'heures affiché.
- **Voix** : passe-haut seulement, ni compresseur ni limiteur.
- **Musique** : au moins 15 dB sous la voix pendant les mots, 9 dB sous elle entre les phrases.
- **Master** : −14 LUFS intégrés au gain. Plafond −1 dBTP avec ≤ 1 dB de réduction, sinon le rapport demande de corriger les syllabes au gain plutôt que d'écraser la voix.
