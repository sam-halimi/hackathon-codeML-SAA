# Boussole · application (bêta de test)

**On vous accompagne, pas à pas.** Application pour les personnes victimes d'agression sexuelle à Montréal, et outil pour les soignants des centres désignés. Données fictives uniquement.

En ligne : https://boussole-beta.vercel.app

## Parcours
- `#/` : arrivée directe en diapos colorées (5 étapes), puis création d'un espace chiffré (prénom facultatif + phrase secrète), puis les onglets :
  - **Accueil** : ligne d'écoute 24 h/24 et accès rapides illustrés ;
  - **Mon récit** : fiche guidée, enregistrée automatiquement et chiffrée sur l'appareil ;
  - **Où aller** : carte de Montréal (examens, soutien psychologique, juridique), organismes vérifiés ;
  - **Mon dossier** : assemblage, aperçu, export, envoi **simulé** à Rebâtir avec double confirmation ;
  - **Vie privée** : les promesses, concrètement.
- `#/demo` : outil soignant (consentement, checklist par règles, chronologie IA, journal SHA-256).

## Code
| Fichier | Rôle |
|---|---|
| `src/components/Espace.tsx` | parcours de la personne (diapos, compte, onglets) |
| `src/components/Illustrations.tsx` | illustrations SVG |
| `src/components/ResourceMap.tsx` | carte Leaflet / OpenStreetMap |
| `src/components/Demo.tsx` | outil soignant |
| `src/lib/vault.ts` | coffre local chiffré (PBKDF2 + AES-GCM) |
| `src/lib/resources.ts` | ressources montréalaises et sources |
| `src/lib/rules.ts` | délais de prélèvement (prototype, à valider) |
| `server/timelineApi.ts` | appel à Claude, en local seulement |

## Lancer
```bash
npm install
npm run dev        # http://localhost:5173
```
IA en direct pour l'outil soignant : `ANTHROPIC_API_KEY=... npm run dev`. Sans clé, une réponse pré-enregistrée et étiquetée est utilisée.

## Déployer
```bash
npm run build
npx vercel deploy dist --prod
```
