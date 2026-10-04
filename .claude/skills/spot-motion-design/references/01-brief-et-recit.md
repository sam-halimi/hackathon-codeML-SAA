# 01 · Brief et récit

## Sommaire
1. Trouver l'histoire
2. L'arc en quatre actes (minutage type)
3. Écrire la voix off
4. Direction artistique
5. Vérification des faits
6. Gabarit de `brief/PROMPT.md`

---

## 1. Trouver l'histoire

Une bonne vidéo de présentation ne liste pas des fonctionnalités : elle montre quelqu'un qui souffre, puis quelqu'un qui est soulagé. Avant d'écrire une ligne, réponds à ces cinq questions en lisant le produit lui-même : l'application, ses données, sa documentation, son guide d'accueil s'il existe.

| Question | NOVA (exemple) |
|---|---|
| Qui décide ? | Un dirigeant qui ne suit pas le projet au quotidien |
| Quel moment précis ? | Mercredi 30 septembre 2026, 9 h ; lancement dans 22 jours |
| Quels pièges, et leurs sources ? | 64 documents ; rapport « tout vert » faux (rapport du 21 sept.) ; plan « 15 octobre » contre comité « 22 octobre » ; facture INV-003 avec 18 000 $ non approuvés |
| Quelle fonctionnalité répond à chaque piège ? | Réponse sur un écran ; preuve au passage exact ; contradictions tranchées ; actions avec responsable ; assistant IA qui prépare la mise à jour et respecte les règles |
| La promesse en une phrase ? | « Reprenez n'importe quel projet… en cinq minutes. » |

Règles :
- Les pièges doivent être **vrais et montrables** : un document réel, une ligne réelle. Le spectateur doit pouvoir les voir à l'écran.
- **Trois pièges, pas six.** Au-delà, la douleur devient une liste.
- Associe chaque fonctionnalité à un écran capturable (étape 5). Une fonctionnalité sans écran ne passe pas à l'image.
- Si le produit a une IA, garde-la pour la fin de la démonstration : c'est le sommet. Montre aussi sa **limite rassurante**, par exemple « elle attend votre accord » ou « une proposition reste une proposition ». La confiance se gagne sur ce point.

## 2. L'arc en quatre actes (minutage type pour 60 à 65 s)

| Acte | Part | Rôle | Plans NOVA |
|---|---|---|---|
| 1. Douleur | ≈ 45 % (0 à 29 s) | Faire ressentir : moment précis → enjeu daté → volume → 2 ou 3 pièges vrais → question pivot | Horloge « Mercredi, 9 h » ; J-30 → J-22 « Go ou pas go ? » ; avalanche 1 → 64 documents ; « Sécurité : VERT » qui grésille vers NON VALIDÉ ; « 15 octobre ≠ 22 octobre » ; facture « CR-04 · 18 000 $ » ; « Qui croire ? » (tout tremble, s'éteint) |
| 2. Bascule | ≈ 8 % | Promesse, puis révélation du produit, avec un passage du fond sombre au fond clair | « Et si vous aviez la réponse en cinq minutes ? » → « 5 minutes. » → étoile, « NOVA · Mémoire de projet » |
| 3. Démonstration | ≈ 40 % | Une phrase = une fonctionnalité = une vraie capture ; caméra sur l'élément exact ; clic sur le mot | Accueil (date, conditions) ; Question → Preuve → document surligné ; Contradictions puis actions ; Assistant : courriel collé → proposition → « Garde-fous vérifiés » → Appliquer ; garde-fou « Le fournisseur ne peut pas fermer une condition » |
| 4. Signature | ≈ 7 % + 2 s | Logo, promesse, adresse ; carton de fin animé | « Nova. Reprenez n'importe quel projet… en cinq minutes. » ; carton « réalisé par / l'équipe Projet 360 » |

Principes de rythme :
- **Acte 1 de plus en plus serré** (plans de 2 à 4 s), avec une coupure nette, quasi silencieuse, sur la question pivot. Le silence avant la bascule fait l'effet.
- **Acte 3 plus posé** (plans de 4 à 6 s) : on doit pouvoir lire l'écran.
- **Changement de matière à la bascule** : nuit indigo et grain fort pour la douleur, papier clair et grain léger pour la solution. Le spectateur sent le soulagement avant de le comprendre.
- **Le carton de fin dure 2 s**, musique seule.

## 3. Écrire la voix off

Fichier `audio/texte_voix.txt` : **une ligne = une phrase = un plan**. Les scripts de calage s'appuient sur cette correspondance.

Règles d'écriture pour une voix de synthèse naturelle :
- **Phrases courtes**, sujet-verbe-complément, à la deuxième personne (« C'est à vous de trancher »).
- **Débit visé : 2,6 à 2,9 mots par seconde.** 60 s de voix font donc 150 à 170 mots.
- **Nombres en toutes lettres** (« soixante-quatre », « dix-huit mille dollars »). Le texte affiché à l'écran garde les chiffres.
- **La marque écrite pour être prononcée** : « Nova » et non « NOVA », sinon elle est épelée. Même logique pour les sigles : écris-les comme ils se disent.
- **Respirations par la ponctuation** : « … » avant la chute (« Reprenez n'importe quel projet… en cinq minutes »). Pour une vraie pause entre deux idées, sépare-les en deux lignes.
- **Termine chaque phrase sur le mot que l'image frappe** (« au vert », « vingt-deux », « personne », « accord »). Ce mot devient un mot-clé de calage (étape 4).
- **Question pivot isolée sur sa propre ligne** (« Qui croire ? »), suivie de la promesse sur la ligne suivante.
- Aucun jargon interne. Vocabulaire du spectateur.

Texte complet de NOVA : `assets/modele-nova/audio/texte_voix.txt`, à imiter pour le ton et la longueur.

## 4. Direction artistique

Tire-la du produit, pas d'un goût personnel : couleurs, polices et icônes de l'application (fichier CSS, jetons de design).
- **Deux matières** : sombre (couleur de marque très foncée, dégradé radial, grille qui dérive, vignette) pour la douleur ; claire (papier, grille légère) pour la solution.
- **Un seul accent**, plus les couleurs d'état du produit (rouge problème, vert validé, ambre en attente).
- **Polices de la marque intégrées** avec `@remotion/fonts`, depuis `public/fonts`, sous licence libre (OFL). Titres en serif expressive, italique pour l'émotion (« Mercredi, », « Qui croire ? »), chasse fixe pour les repères (« SEC-210 », « INV-003 »).
- **Texte cinétique** pour les phrases clés : mots qui montent un par un (`Mots` dans `ui.tsx`).
- **Lueur réservée** au logo et à l'accent. Pas de néon, pas de lueur partout.
- **Flou de mouvement** sur les déplacements rapides (caméra) et **grain** pellicule (texture `public/texture/grain.png`).
- **Vraies interfaces dans un cadre de navigateur** (`Fenetre`), avec l'adresse réelle du produit.

## 5. Vérification des faits

Section obligatoire du brief : une phrase par affirmation, avec sa source. Contrôle aussi le calendrier : le jour de la semaine correspond-il à la date ? « Trois semaines » vaut-il bien 22 jours ?

Exemple NOVA :
> le 30 septembre 2026 est un mercredi ; le lancement approuvé est le 22 octobre (22 jours) ; 64 documents ; le rapport de statut du 21 septembre (brouillon) met la sécurité au vert alors que SEC-210 n'est pas accepté ; le plan v3 dit encore le 15 octobre ; la facture INV-003 contient la ligne CR-04 de 18 000 $, non approuvée.

Les éléments mis en scène (un courriel d'exemple, par exemple) sont étiquetés comme dans le produit (« EXEMPLE »).

## 6. Gabarit de `brief/PROMPT.md`

```markdown
# <Produit> · Spot de présentation

## 1. Concept
« <titre-concept> ». <2-3 phrases : qui, quel moment, quelle douleur, quel soulagement>
- Public : … · Promesse : … · Ton : sobre et humain (tension), puis clair et rassurant (soulagement)
- Formats : 16:9 (1920×1080) et 9:16 (1080×1920), 60 images par seconde.

## 2. Direction artistique
<couleurs (hex), polices, motif, règles de lueur, flou, grain, vraies interfaces>

## 3. Découpage (minutage indicatif, recalé ensuite sur la voix)
| # | Temps | Image | Voix | Son |
|---|---|---|---|---|
| 1 | 0:00 | … | « … » | … |

## 4. Texte de la voix
> une phrase par ligne…

Vérification des faits : …
Écriture pour la synthèse vocale : nombres en lettres, marque écrite « … », ponctuation des respirations.

## 5. Voix · 6. Musique · 7. Bruitages · 8. Mixage et livraison
## 9. Adaptations (si gabarit) : | Gabarit | Ici | Raison |
```
