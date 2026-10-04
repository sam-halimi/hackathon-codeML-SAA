# Clip démo : Boussole (40 s, muet)

**Usage** : lu sur la diapo 2 pendant le pitch, Personne 3 parle par-dessus (texte calé dans `docs/PITCH.md`, bloc 4). Aussi publiable seul (site, réseaux).

**Spécifications** : 1920×1080, 30 fps, **1 200 images (40 s)**, muet (aucune piste audio), MP4 H.264. Projet Remotion dans `video/`, rendu vers `video/out/boussole-demo.mp4`.

**Règle d'or : on n'invente aucune interface.** Tous les plans d'interface viennent de l'enregistrement réel de `/demo` (capture Playwright). Le motion design se limite à : cartes de titre, zooms/recadrages, surlignages, flèches, sous-titres. Si une fonction n'existe pas encore dans l'app, on coupe le plan, on ne la dessine pas.

**Charte** : fond bleu nuit `#0F1B2D`, texte blanc cassé `#F6F1EA`, accent ambre `#E8A33D`, alerte rouge `#C8553D`. Sous-titres : blanc cassé, 44 px, bas centre, fond bleu nuit 80 %. Bandeau « DONNÉES FICTIVES » visible en permanence sur les plans d'interface (il est dans l'app ; ne pas le recadrer hors champ).

---

## 1. Découpage plan par plan

| # | Timecode | Durée (images) | Plan | Contenu à l'écran | Animation | Texte affiché (sous-titre / carte) | Source |
|---|---|---|---|---|---|---|---|
| 1 | 0:00–0:03 | 3 s (0–90) | Carte d'accroche | Fond bleu nuit, horloge minimaliste « 3:00 » en ambre | Apparition des chiffres de l'horloge (fondu 10 images), puis texte ligne par ligne ; le mot « expiration » passe en rouge | **3 h du matin.** / **La preuve a une date d'expiration.** | Motion graphics |
| 2 | 0:03–0:08 | 5 s (90–240) | Consentement | Écran consentement granulaire : examen ✓, prélèvements ✓, conservation ✓, **transmission à la police : non cochée (peut décider plus tard)** | Zoom lent 100 → 110 % sur la liste ; les cases se cochent une à une, la transmission police reste décochée | « Elle consent étape par étape. Elle peut refuser. Et décider plus tard. » | Enregistrement app |
| 3a | 0:08–0:12 | 4 s (240–360) | Dossier guidé | Formulaire : délai 30 h, substance soupçonnée = oui, douche = non, vêtements = conservés, interprète = non | Accéléré ×2 de la saisie ; recadrage sur le champ « 30 h » | « 30 h depuis les faits. Substance soupçonnée. » | Enregistrement app |
| 3b | 0:12–0:16 | 4 s (360–480) | Checklist par règles | La checklist se réordonne : cutané 18 h, PPE VIH 42 h, urine 90 h, trousse 90 h, contraception 90 h ; **sang : fenêtre dépassée** (rouge). Mention « délais prototype, à valider » visible | Vitesse réelle sur le réordonnancement (c'est le moment fort) ; pastille « RÈGLES · PAS D'IA » ambre en haut à droite | « Moteur de règles, pas d'IA. Les délais se recalculent. » | Enregistrement app + pastille motion |
| 4a | 0:16–0:21 | 5 s (480–630) | Chronologie IA | Notes libres collées → chronologie ; chaque ligne avec sa citation source ; bloc **« Information non disponible : 22 h 45 → 1 h 30 »** ; incohérence **« prélèvement noté à 4 h 05, arrivée à 4 h 20 »** | Défilement doux ; surlignage ambre du trou, rouge de l'incohérence ; trait reliant une ligne à sa phrase source | « Chaque ligne cite sa source. Le trou est signalé : fréquent après une substance. » | Enregistrement app |
| 4b | 0:21–0:26 | 5 s (630–780) | « Ce que l'IA voit » | Panneau pseudonymisation : `Léa Tremblay → [PATIENTE]`, `12/03/2004 → [DATE]`, `123, rue des Érables → [LIEU]`, téléphone → `[TÉLÉPHONE]` ; étiquette « Réponse IA préenregistrée (démo publique) » | Zoom 120 % sur le panneau ; chaque remplacement clignote une fois en ambre | « Ce que l'IA voit : jamais son nom. » | Enregistrement app |
| 5 | 0:26–0:30 | 4 s (780–900) | Validation humaine | Le soignant valide 6 lignes, en rejette 1, et marque l'incohérence « Corrigé » | Curseur visible ; léger ralenti sur le clic « Rejeter » | « L'IA est une secrétaire, jamais un juge. L'humain valide. » | Enregistrement app |
| 6 | 0:30–0:35 | 5 s (900–1050) | Export + intégrité | Aperçu de l'export : résumé + journal de chaîne de conservation (horodatage, auteur, action, hash court `a3f9…`) ; badge **« Intégrité vérifiée »** vert/ambre | Défilement du journal ; zoom sur 2 hash consécutifs avec flèche « chaîné » ; badge apparaît en dernier | « Journal chaîné SHA-256. Toute retouche se voit. » | Enregistrement app + flèche motion |
| 7 | 0:35–0:40 | 5 s (1050–1200) | Carte de fin | Logo Boussole (aiguille ambre), tagline, **QR code** (`docs/assets/qr-boussole.png`, ≥ 360 px), URL | Aiguille qui pivote et se fige au nord (20 images) ; tagline en fondu ; QR fixe dès 0:36 pour laisser scanner | **Boussole** / *L'IA guide, l'humain décide.* / `boussole-beta.vercel.app` / petit : « Prototype · données fictives » | Motion graphics |

**Transitions** : coupes franches entre plans d'interface ; fondu au noir bleu nuit (8 images) seulement entre 1→2 et 6→7. Pas de musique (le clip est muet par conception).

**Option « falsification »** (si l'app la propose) : remplacer les 2 dernières secondes du plan 6 par la modification d'une entrée → badge rouge « Chaîne rompue ». Uniquement si c'est réellement dans l'app.

---

## 2. Scénario de démo (identique à l'application, `app/src/lib/demoCase.ts` et `timelineFixture.ts`)

Cas **100 % fictif**, déjà préchargé dans `/demo` : rien à taper, l'enregistrement est reproductible.

**Horloge du cas**
- Arrivée à la fête : **2 oct. ~22 h 00** ; verre offert **~22 h 45** ; étourdissement peu après
- Information non disponible : **2 oct. ~22 h 45 → 3 oct. ~1 h 30** (environ 2 h 45)
- Réveil dans un appartement inconnu **~1 h 30** ; retour en taxi **~2 h 15**, pas de douche
- Arrivée à l'urgence : **4 oct. 4 h 20** ; consentement à l'examen : **4 h 40**
- Curseur du dossier guidé : **30 h depuis les faits**

**Identité fictive masquée dans « Ce que l'IA voit »** : `Léa Tremblay` → `[PATIENTE]`, `12/03/2004` → `[DATE]`, `123, rue des Érables, Montréal` → `[LIEU]`, `514-555-0147` → `[TÉLÉPHONE]` (4 identifiants masqués).

**Consentement** : examen ✓, prélèvements ✓, conservation ✓, **transmission à la police : non (peut décider plus tard)**.

**Checklist attendue à 30 h** (délais prototype)
| Élément | Fenêtre | Affichage |
|---|---|---|
| Prélèvements cutanés | ≤ 48 h | **URGENT · 18 h** (en tête) |
| PPE VIH | < 72 h | **URGENT · 42 h** |
| Toxicologie urine | ≤ 120 h | Possible · 90 h |
| Trousse médicolégale | ≤ 5 j | Possible · 90 h |
| Contraception d'urgence | ≤ 120 h | Possible · 90 h |
| Dépistage ITSS | — | Dès que possible |
| Toxicologie sang | < 24 h | **Délai dépassé (6 h)**, grisé |

**Chronologie (réponse IA pré-enregistrée, étiquetée)** : 7 événements avec citation source ; bloc pointillé « Information non disponible : 2 oct. ~22 h 45 → 3 oct. ~1 h 30 — fréquent après un traumatisme ou une substance, pas un indicateur de fiabilité » ; bloc rouge « **Incohérence du dossier (pas du récit)** : prélèvement urinaire horodaté à 4 h 05, avant l'arrivée (4 h 20) et le consentement (4 h 40) ».

**Validation humaine** : 6 lignes validées, 1 rejetée (démontre que l'humain peut refuser), incohérence marquée « Corrigé ».

**Export** : badge vert « Intégrité du journal vérifiée — 15 entrées chaînées par SHA-256 », puis bouton « Simuler une modification après coup » → « ✗ Altération détectée à l'entrée #1 » (le plan « chaîne rompue » est donc disponible).

**Enregistrement brut déjà produit** : `video/public/rec/demo.webm` (1600×900) + captures `docs/assets/screens/*.png` (plan B).

**Capture Playwright** : viewport 1920×1080, `deviceScaleFactor: 1`, `slowMo` ≈ 60 ms, vidéo activée (`recordVideo`), curseur visible. Saisir le texte avec `type()` à délai 20 ms (lisible une fois accéléré ×2). Exporter les segments bruts dans `video/public/rec/` (un fichier par plan : `02-consent.webm`, `03-intake.webm`, …) et prendre en même temps les 3 captures PNG du plan B (checklist, chronologie + panneau IA, export + badge).

---

## 3. Version courte (15 s, 450 images)

Pour le site, les réseaux, ou si le pitch prend du retard.

| # | Timecode | Durée | Plan (repris du 40 s) | Texte affiché |
|---|---|---|---|---|
| 1 | 0:00–0:02 | 2 s | Carte d'accroche (plan 1, raccourci) | La preuve a une date d'expiration. |
| 2 | 0:02–0:06 | 4 s | Checklist qui se réordonne (plan 3b) | Règles, pas d'IA : les délais en direct. |
| 3 | 0:06–0:10 | 4 s | Chronologie + trou signalé (plan 4a), 1 s du panneau « Ce que l'IA voit » (4b) | L'IA cite ses sources. Jamais son nom. |
| 4 | 0:10–0:12,5 | 2,5 s | Badge « Intégrité vérifiée » (fin du plan 6) | Journal infalsifiable. |
| 5 | 0:12,5–0:15 | 2,5 s | Carte de fin (plan 7) avec QR | Boussole · L'IA guide, l'humain décide. |

Le consentement est retiré de la version courte : à dire à l'oral si elle est utilisée en pitch.

---

## 4. Liste de contrôle du rendu

- [ ] Aucun plan d'interface dessiné à la main : tout vient de `video/public/rec/`
- [ ] « DONNÉES FICTIVES » lisible sur chaque plan d'interface
- [ ] Étiquette « Réponse IA préenregistrée » visible sur le plan 4b
- [ ] Les chiffres à l'écran = ceux dits à l'oral (18 h, 42 h, sang dépassé)
- [ ] QR scannable sur la carte de fin, testé sur l'écran de projection
- [ ] Deux rendus : `boussole-demo.mp4` (40 s) et `boussole-demo-15s.mp4`


---

## Implémentation (faite)

- Compositions Remotion : `video/src/Boussole.tsx` → `BoussoleDemo` (40 s) et `BoussoleShort` (15 s).
- Source vidéo : `video/public/rec/demo.webm` (enregistrement Playwright réel de `/demo`).
- Rendu : `cd video && npx remotion render BoussoleDemo out/boussole-demo.mp4` (et `BoussoleShort out/boussole-15s.mp4`).
- Prévisualiser / ajuster les plans : `npx remotion studio` (tableau `SHOTS` en haut du fichier : début, durée, seconde source, sous-titre, zoom).
