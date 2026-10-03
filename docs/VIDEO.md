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
| 2 | 0:03–0:08 | 5 s (90–240) | Consentement | Écran consentement granulaire : examen ✓, trousse ✓, toxicologie ✓, **photos ✗ (refusé)**, transmission police : **« Décider plus tard »** | Zoom lent 100 → 110 % sur la liste ; surlignage ambre sur « Refusé » puis sur « Décider plus tard » | « Elle consent étape par étape. Elle peut refuser. Et décider plus tard. » | Enregistrement app |
| 3a | 0:08–0:12 | 4 s (240–360) | Dossier guidé | Formulaire : délai 30 h, substance soupçonnée = oui, douche = non, vêtements = conservés, interprète = non | Accéléré ×2 de la saisie ; recadrage sur le champ « 30 h » | « 30 h depuis les faits. Substance soupçonnée. » | Enregistrement app |
| 3b | 0:12–0:16 | 4 s (360–480) | Checklist par règles | La checklist se réordonne : cutané 18 h, PPE VIH 42 h, urine 90 h, trousse 90 h, contraception 90 h ; **sang : fenêtre dépassée** (rouge). Mention « délais prototype, à valider » visible | Vitesse réelle sur le réordonnancement (c'est le moment fort) ; pastille « RÈGLES · PAS D'IA » ambre en haut à droite | « Moteur de règles, pas d'IA. Les délais se recalculent. » | Enregistrement app + pastille motion |
| 4a | 0:16–0:21 | 5 s (480–630) | Chronologie IA | Notes libres collées → chronologie ; chaque ligne avec sa citation source ; ligne **« 21 h 30 – 23 h 30 : aucune information »** ; incohérence **« prélèvement noté à 2 h 25, arrivée à 2 h 40 »** | Défilement doux ; surlignage ambre du trou, rouge de l'incohérence ; trait reliant une ligne à sa phrase source | « Chaque ligne cite sa source. Le trou est signalé : fréquent après une substance. » | Enregistrement app |
| 4b | 0:21–0:26 | 5 s (630–780) | « Ce que l'IA voit » | Panneau pseudonymisation : `Léa Tremblay → [VICTIME]`, `14 mars 2003 → [DATE]`, `4520, rue Fictive → [LIEU]` ; étiquette « Réponse IA préenregistrée (démo publique) » | Zoom 120 % sur le panneau ; chaque remplacement clignote une fois en ambre | « Ce que l'IA voit : jamais son nom. » | Enregistrement app |
| 5 | 0:26–0:30 | 4 s (780–900) | Validation humaine | Le soignant clique « Valider » sur 2 lignes et « Rejeter » sur 1 ; compteur « 7/8 validées » | Curseur visible ; léger ralenti sur le clic « Rejeter » | « L'IA est une secrétaire, jamais un juge. L'humain valide. » | Enregistrement app |
| 6 | 0:30–0:35 | 5 s (900–1050) | Export + intégrité | Aperçu de l'export : résumé + journal de chaîne de conservation (horodatage, auteur, action, hash court `a3f9…`) ; badge **« Intégrité vérifiée »** vert/ambre | Défilement du journal ; zoom sur 2 hash consécutifs avec flèche « chaîné » ; badge apparaît en dernier | « Journal chaîné SHA-256. Toute retouche se voit. » | Enregistrement app + flèche motion |
| 7 | 0:35–0:40 | 5 s (1050–1200) | Carte de fin | Logo Boussole (aiguille ambre), tagline, **QR code** (`docs/assets/qr-boussole.png`, ≥ 360 px), URL | Aiguille qui pivote et se fige au nord (20 images) ; tagline en fondu ; QR fixe dès 0:36 pour laisser scanner | **Boussole** / *L'IA guide, l'humain décide.* / `sam-halimi.github.io/hackathon-codeML-SAA` / petit : « Prototype · données fictives » | Motion graphics |

**Transitions** : coupes franches entre plans d'interface ; fondu au noir bleu nuit (8 images) seulement entre 1→2 et 6→7. Pas de musique (le clip est muet par conception).

**Option « falsification »** (si l'app la propose) : remplacer les 2 dernières secondes du plan 6 par la modification d'une entrée → badge rouge « Chaîne rompue ». Uniquement si c'est réellement dans l'app.

---

## 2. Scénario de démo à saisir (reproductible)

Cas **100 % fictif**. Toujours le même, pour que l'enregistrement, la narration et les captures de secours concordent.

**Horloge du cas**
- Faits / dernier souvenir net : **vendredi 21 h 00** (un verre offert)
- Trou de mémoire : **21 h 30 – 23 h 30**
- Réveil chez une connaissance : **23 h 30**
- Arrivée à l'urgence (triage) : **dimanche 2 h 40**
- Ouverture du dossier : **dimanche 3 h 00** → **30 h depuis les faits**

**Identité (sert au panneau « Ce que l'IA voit »)**
- Nom : `Léa Tremblay` → `[VICTIME]`
- Date de naissance : `14 mars 2003` → `[DATE]`
- Adresse : `4520, rue Fictive, Montréal` → `[LIEU]`

**Consentement**
| Étape | Choix |
|---|---|
| Examen médical | Accepté |
| Trousse médicolégale | Accepté |
| Toxicologie (urine) | Accepté |
| Photographies | **Refusé** |
| Conservation | Accepté |
| Transmission à la police | **Décider plus tard** |

**Dossier guidé**
| Champ | Valeur |
|---|---|
| Délai depuis les faits | 30 h |
| Symptômes | Somnolence au réveil, nausées, douleur pelvienne |
| Substance soupçonnée | Oui (verre offert, perte de mémoire) |
| Douche depuis les faits | Non |
| Vêtements | Conservés, apportés dans un sac |
| Interprète | Non |

**Résultat attendu de la checklist** (délais prototype)
| Élément | Fenêtre | Restant à 30 h |
|---|---|---|
| Prélèvements cutanés | ≤ 48 h | **18 h** (en tête) |
| PPE VIH | < 72 h | **42 h** |
| Toxicologie urine | ≤ 120 h | 90 h |
| Trousse médicolégale | ≤ 5 j | 90 h |
| Contraception d'urgence | ≤ 120 h | 90 h |
| Toxicologie sang | < 24 h | **Fenêtre dépassée** (rouge) |

**Notes libres à coller** (texte exact)

```
Triage 2 h 40 : patiente arrivée seule, calme mais tremblante. Dit avoir été agressée vendredi soir.
Récit (infirmière) : elle était à une fête chez une connaissance vers 21 h. Quelqu'un lui a offert un verre vers 21 h. Elle se souvient de s'être sentie étourdie vers 21 h 30. Elle ne se souvient de rien ensuite. Elle s'est réveillée vers 23 h 30 dans une chambre, vêtements défaits.
Elle est rentrée chez elle samedi et n'a pas pris de douche. Elle a hésité à venir.
Prélèvement urinaire noté à 2 h 25.
Médecin 3 h 15 : examen accepté, photographies refusées. Ne sait pas encore si elle portera plainte.
```

**Chronologie attendue** (réponse préenregistrée, étiquetée comme telle sur la démo publique)
- 21 h 00 : arrivée à la fête ; verre offert. *Source : « Quelqu'un lui a offert un verre vers 21 h. »*
- 21 h 30 : sensation d'étourdissement. *Source : « …étourdie vers 21 h 30. »*
- **21 h 30 – 23 h 30 : aucune information.** Fréquent après un traumatisme ou une substance. *(trou)*
- 23 h 30 : réveil dans une chambre. *Source : « …réveillée vers 23 h 30… »*
- Samedi : retour à domicile, pas de douche.
- Dim. 2 h 40 : triage.
- **Incohérence du dossier** : prélèvement urinaire noté à 2 h 25, avant l'arrivée à 2 h 40. Vérifier l'horodatage.
- Dim. 3 h 15 : examen médical ; photographies refusées.

À valider dans le plan 5 : 2 lignes validées, la ligne « Samedi : retour à domicile » **rejetée** (pas d'heure source), le reste validé.

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
