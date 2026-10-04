# Hackathon CodeML (Poly AI) — équipe de 3

## Où trouver quoi

| Branche | Projet | Contenu |
|---|---|---|
| **`main`** (par défaut) | **Projet 360 — NOVA** | L'application (`projet360/`) et son spot vidéo (`video/`) |
| `boussole-app` | Boussole | L'application Boussole et son pitch deck |
| `boussole-video-v1` | Boussole | Spot vidéo, premier aperçu |
| `boussole-video-v2` | Boussole | Spot vidéo, captures finales |

## Projet 360 — NOVA (cette branche)

- `projet360/` : mémoire opérationnelle du projet (application HTML autonome, sans dépendance).
  - En ligne : https://nova-projet360.vercel.app · spot vidéo : https://nova-projet360.vercel.app/video/
  - Mode d'emploi : `projet360/MODE_EMPLOI.md`
  - Construire : `cd projet360 && node outils/construire.mjs` → `dist/NOVA_Projet360.html` (corpus à placer dans `projet360/corpus/`, hors git)
- `video/` : projet Remotion (motion design), dont le spot NOVA, et les skills Claude Code (motion-graphics, cinematic-camera, terminal-inserts, article-highlights, remotion-*).
  - Lancer : `cd video && npm install && npx remotion studio`
  - Spot NOVA : brief dans `video/brief/PROMPT.md`, commandes dans `video/README.md`
- La méthode de fabrication du spot est un skill Claude séparé, dans le dépôt privé `sam-halimi/skill-video-motion-design`.

Les données confidentielles des défis (JADCO, Loto-Québec, plans d'atelier) ne doivent **jamais** être committées ici.
