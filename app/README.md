# Boussole — prototype (hackathon CodeML 2026)

**L'IA guide, l'humain décide.** Copilote pour les soignants qui accueillent une victime d'agression sexuelle. Données 100 % fictives.

- `/` : page de la startup · `#/demo` : le logiciel (consentement → dossier guidé → prélèvements par règles → chronologie IA → export avec journal SHA-256).
- Lancer : `npm install && npm run dev` → http://localhost:5173/#/demo
- IA en direct (local seulement) : `ANTHROPIC_API_KEY=... npm run dev`. La route `/api/timeline` (middleware Vite, `server/timelineApi.ts`) appelle Claude avec une sortie JSON contrainte, sur texte pseudonymisé. Sans clé, ou sur le site public, l'app utilise une réponse **pré-enregistrée, étiquetée comme telle**.
- Règles et délais : `src/lib/rules.ts` — **prototype, à valider par sources médicales**.
- Déploiement : GitHub Pages via `.github/workflows/pages.yml`.
