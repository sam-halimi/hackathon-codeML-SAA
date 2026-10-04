# Diapositives : Boussole (3 au maximum)

Format 16:9, 1920×1080. Texte minimal : le jury écoute, la diapo appuie.

**Palette**
| Rôle | Couleur |
|---|---|
| Fond principal | bleu nuit `#0F1B2D` |
| Texte / cartes claires | blanc cassé chaud `#F6F1EA` |
| Accent (Boussole, IA guide, chiffres positifs) | ambre `#E8A33D` |
| Alerte (fuites, délais dépassés) | rouge `#C8553D` |

**Typo** : un sans-serif (Inter, Manrope ou IBM Plex Sans). Titres 64-80 pt, gros chiffres 120-160 pt, corps ≥ 28 pt. Jamais plus de ~25 mots par diapo hors schéma.

**Constante sur les 3 diapos** : logo « Boussole » (aiguille de boussole stylisée en ambre) en haut à gauche ; petit bandeau « DONNÉES FICTIVES » en bas à droite sur la diapo 2.

---

## Diapo 1 : Boussole + les 4 fuites du dossier (0:00–1:05)

**Titre (haut)** : `Boussole` en ambre, sous-titre blanc cassé : *L'IA guide, l'humain décide.*

**Corps : entonnoir horizontal en 4 segments** (de gauche à droite, chaque segment plus étroit, gouttes rouges qui « fuient » sous chaque segment) :

| # | Étiquette | Gros chiffre | Légende (1 ligne) |
|---|---|---|---|
| 1 | Où aller ? | **3** hôpitaux | avant d'obtenir une trousse (2020) |
| 2 | La première nuit | **24 h** | et le sang ne révèle plus la plupart des drogues |
| 3 | La police | **6 %** signalées | 640 / 1 000 sans accusation |
| 4 | Le tribunal | **1 / 3** | des causes dépassent les délais Jordan |

**Bas de diapo** (petit, blanc cassé 60 %) : `Personnage de Léa : fictif. Sources : StatCan 2019 et 2015-19, ANSI/ASB 121, Noovo 2020, Ombudsman fédéral des victimes 2022-23.`

**Mise en page** : fond bleu nuit. Au démarrage, seul le titre est visible (bloc Léa). Puis 4 clics : chaque segment apparaît, sa goutte rouge tombe, le chiffre s'allume en ambre. Le segment 2 (« La première nuit ») est entouré d'un halo ambre à la fin : c'est là qu'on agit.

**Visuel suggéré** : pas de photo de victime, pas de visage, pas de mains sur un bras. Seulement l'entonnoir géométrique. Optionnel : une horloge minimaliste « 3:00 » en filigrane derrière le titre pendant le bloc Léa.

**Notes de présentation**
- Personne 1 : Léa sans regarder l'écran. Dire « Imaginez » et « fictive » d'entrée.
- 4 clics = 4 fuites. Une phrase par clic, pas plus.
- Terminer sur « …au mauvais endroit. » puis céder la parole à Personne 2 (bloc Nous, même diapo).
- Personne 2 : « une femme sur quatre » dit lentement. Phrase personnelle seulement si vraie.

---

## Diapo 2 : La solution (1:05–2:05)

**Titre** : `La première nuit, sans perdre la preuve.`

**Mise en page (2 colonnes)**
- **Gauche (60 %)** : zone vidéo 16:9 qui lit le clip muet de 40 s (`video/out/boussole-demo.mp4`). Cadre fin ambre, coins arrondis.
- **Droite (40 %)** : schéma vertical à 3 bandes, de haut en bas :

```
┌──────────────────────────────┐
│ RÈGLES   délais, priorités   │  ← blanc cassé, icône sablier
│          (pas d'IA)          │
├──────────────────────────────┤
│ IA       chronologie, trous  │  ← ambre, icône document
│          « secrétaire,       │
│           jamais juge »      │
├──────────────────────────────┤
│ HUMAIN   valide, signe       │  ← blanc cassé épais, icône main ✓
└──────────────────────────────┘
```

- **Sous le schéma : 4 puces vie privée** (icône cadenas, 1 ligne chacune) :
  - Pseudonymisation visible : `Léa → [VICTIME]`
  - Consentement par étape, révocable
  - Rien vers la police sans signature
  - Journal SHA-256 : falsification détectée

**Bas de diapo** (petit) : `Hébergement Canada + chiffrement + EFVP Loi 25 en production · aucun entraînement sur les données · DONNÉES FICTIVES`

**Notes de présentation**
- Personne 3 dit la phrase « On ne répare pas les tribunaux… » **avant** de lancer le clip.
- Lancer le clip au clic (lecture automatique désactivée, pour éviter qu'il parte trop tôt).
- Parler par-dessus selon le tableau du bloc 4 de `docs/PITCH.md`. Si en retard, sauter la phrase sur le consentement (elle est sur la diapo).
- Après le clip, montrer du doigt les 4 puces vie privée en les disant.

### Plan B si la vidéo échoue (décision en 3 s)

Diapo 2-bis préparée à l'avance (cachée, juste après la diapo 2) : la zone vidéo est remplacée par **3 captures** côte à côte, issues du même enregistrement réel de `/demo` :

| Capture | Contenu | Légende sous la capture |
|---|---|---|
| A | Checklist réordonnée avec comptes à rebours (peau 18 h, VIH 42 h, sang en rouge « fenêtre dépassée ») | Règles : les délais, sans IA |
| B | Chronologie avec ligne « trou 23 h 10 – 1 h 10 » + panneau « Ce que l'IA voit » | IA : cite ses sources, ne juge pas |
| C | Export avec badge « Intégrité vérifiée » et extrait du journal haché | Humain : valide, signe, prouve |

Personne 3 dit le même texte, en 3 temps, en pointant A, B, C. Garder aussi le clip en fichier local sur une clé USB et le lien du site ouvert dans un onglet.

---

## Diapo 3 : Qui paie, qui utilise, et la demande (2:05–3:00)

**Titre** : `On vend au soin. Pas à la police.`

**Mise en page**
- **Haut : 3 cartes blanc cassé** sur fond bleu nuit (texte bleu nuit) :

| Paie | Utilise | Bénéficie |
|---|---|---|
| CISSS / CIUSSS · **77 centres désignés** · cofinancement : fonds d'aide aux victimes | Infirmières, médecins, intervenantes | Victimes · **gratuit, toujours** |

- Sous les cartes, une ligne fine : `Reçoivent le dossier (sans payer, avec accord) : police · DPCP     Partenaires : CAVAC · CALACS · LSJML`
- **Milieu gauche : « Concurrence »** en 2 lignes :
  - `Track-Kit : suit la boîte.`
  - `Boussole : accompagne la personne.` (en ambre)
- **Milieu droit : modèle (petit)** : `Licence SaaS / centre / an · mise en place · modules par juridiction (hypothèses)`
- **Bas gauche : la demande, en gros, ambre** :
  `Cherche : 1 centre désigné`
  `Pilote de 3 mois`
  puis en petit : `Mesures : récits répétés · prélèvements dans les délais · temps administratif`
- **Bas droit : QR code** `docs/assets/qr-boussole.png`, **au moins 300×300 px**, sur carré blanc cassé, avec l'URL en dessous : `sam-halimi.github.io/hackathon-codeML-SAA`
- **Pied** : *On ne remplace pas l'humain auprès de Léa. On lui rend le temps de l'être.* (italique, blanc cassé)

**Notes de présentation**
- Personne 1 : « reçoivent, mais n'achètent pas » est la phrase à marquer : pause après.
- Ne pas lire les cartes ; dire les chiffres clés (77, gratuit, 3 mois).
- Personne 2 : laisser le QR à l'écran jusqu'à la fin des questions. Ne pas revenir à une diapo précédente.
- Si une question porte sur le prix : « hypothèse, fixée avec le pilote ».

---

## Liste de contrôle avant de monter sur scène

- [ ] Clip exporté en MP4 H.264, lu une fois sur l'ordinateur de la salle
- [ ] Diapo 2-bis (3 captures) présente et cachée
- [ ] QR testé depuis le fond de la salle
- [ ] Police intégrée au fichier (ou export PDF de secours)
- [ ] Mode présentateur avec ce document en notes
