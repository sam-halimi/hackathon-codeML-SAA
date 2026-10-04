# Modèle : le spot NOVA (implémentation de référence)

Ce dossier est le code complet et fonctionnel du spot NOVA (63,6 s, 16:9 et 9:16, 60 i/s), tel qu'il a été livré. Copie-le dans le projet Remotion, puis adapte chaque fichier selon le tableau ci-dessous. Garde la structure, les outils de temps, les primitives, la chaîne audio et la finalisation : ce sont eux qui font la qualité.

| Fichier | Rôle | À adapter |
|---|---|---|
| `brief/PROMPT.md` | Brief de production complet | Tout le contenu (concept, DA, découpage, voix, faits) ; garder la structure |
| `audio/texte_voix.txt` | Une ligne = une phrase = un plan | Le texte du nouveau spot |
| `audio/analyser_voix.py` | Transcription Whisper mot à mot, exactitude, débit | Table `NOMBRES`, langue (`language="fr"`) |
| `audio/caler.py` | → `src/nova/minutage.json` | `MOTS_CLES`, `PRE_ROLL`, `TENUE_LOGO`, `CARTON`, chemin de sortie (`src/<projet>/`) |
| `audio/composer.py` | Musique, bruitages, mixage, master | Dictionnaire `SCENES` (identique à `temps.ts`), blocs de `bruitages()` par scène, harmonie et tempo de `musique()` si le ton change ; garder le mixage et le master |
| `outils/capturer.mjs` | Captures HD + `boites.json` | Chemin de l'application, état initial (`addInitScript`), liste des captures et des boîtes |
| `outils/apercus.mjs` | Images fixes de contrôle | Rien, sauf le nom de la composition |
| `outils/finaliser.mjs` | Assemblage, copies web, pistes, planches, README | Noms des fichiers, textes du README |
| `src/nova/temps.ts` | `P`, `PF`, `K`, `SCENES`, courbes, caméra | Fenêtres `SCENES` (une par plan) |
| `src/nova/theme.ts` | Couleurs, polices, icônes | Charte du produit, polices dans `public/fonts/` |
| `src/nova/ui.tsx` | Primitives partagées | `Fenetre` : adresse du produit ; le reste tel quel |
| `src/nova/NovaSpot.tsx` | Assemblage des scènes | Liste `RENDUS`, bascule sombre/papier |
| `src/nova/scenes/*.tsx` | Une scène par plan | À réécrire pour le nouveau récit, en suivant les mêmes recettes |
| `src/nova/minutage.json`, `boites.json` | Générés | Régénérer (`caler.py`, `capturer.mjs`) |
| `src/Root.tsx` | Compositions 16:9 et 9:16 | Identifiants et composant |
| `remotion.config.ts` | Navigateur sans tête de Playwright | Rien |
| `public/texture/grain.png` | Grain pellicule | Rien |
| `.gitignore` | Fichiers régénérables hors git | Ajouter les dossiers confidentiels du projet |

Les scènes contiennent des données du dossier NOVA (documents, montants). Elles servent d'exemple de mise en scène : ne réutilise jamais ces données pour un autre produit.
