# Contrôle de l'équipe

Liste de vérification avant la remise et avant la démonstration. Elle suit le barème du `README.txt` du kit.

> Le fichier `CONTROLE_EQUIPE.md` prévu dans le kit ne nous a pas été transmis. Cette liste a été reconstruite à partir du barème. Si vous retrouvez l'original, comparez-le avec celle-ci.

## 1. Contrôles automatiques (à relancer après chaque modification)

| Commande | Ce qu'elle vérifie |
|---|---|
| `node outils/verifier.mjs` | Chaque preuve (passage, page, cellules, zone) existe dans le corpus ; les 10 questions ont réponse et preuves ; chaque action a un responsable confirmé ou proposé, une échéance datée ou « À confirmer », un état et une preuve ; 3 conditions de go-live ; les copies sont déclarées ; les garde-fous des événements sont respectés |
| `node outils/construire.mjs` | Refait la vérification et produit `dist/NOVA_Projet360.html` |
| `node outils/tester_navigateur.mjs` | Dans Chromium, **hors connexion**, avec un fuseau horaire différent (Paris) : ouverture, date fixe du 30 sept., ouverture au bon endroit des 53 preuves des Q01–Q10, PDF, Excel et capture, copies signalées, questions libres, 5 espaces, brief sur **une page** (Lettre et A4), filtres, recherche, exemple fictif, garde-fous, enregistrement, persistance, import JSON, décision de date approuvée (la version initiale garde le 22 oct.), aucune erreur JavaScript, aucune requête réseau |

**Dernière exécution (3 octobre 2026)** : `verifier.mjs` → 0 erreur (229 preuves contrôlées : 221 dans les données + 8 passages de l'exemple fictif) ; `tester_navigateur.mjs` → 58/58 vérifications réussies.

## 2. Barème → où le montrer

| Critère (points) | Constat attendu | Dans l'application | Statut |
|---|---|---|---|
| Dix réponses (50) | Exactes et nuancées | Espace 2, Q01–Q10 | ☐ relues par le 3e membre (section 3) |
| Preuves et navigation (10) | ≥ 3 réponses avec fichier et repère retrouvables | Les 10 réponses ont 4 à 7 preuves cliquables | ✓ testé |
| | ≥ 2 réponses qui croisent des sources distinctes | Chaque carte affiche le nombre de sources indépendantes (3 à 6, copies exclues) | ✓ calculé |
| Chronologie (10) | Proposition, décision et validation, avec dates et sources | Espace 3, section « Proposition, décision, livraison, validation » (8 sujets) | ✓ |
| | ≥ 2 contradictions expliquées, dont une dans un plan ou un registre | K01 (plan v3 : 15 oct.), K02 (registre : R-01), + 6 autres | ✓ |
| Brief et actions (10) | Cinq thèmes sur une page | Vue d'ensemble → « Imprimer le brief (1 page) » | ✓ testé (Lettre) |
| | Les 3 conditions reliées à des actions, responsables et échéances | Tableau des conditions + Actions A01–A05 | ✓ |
| Utilisation (10) | Le jury ouvre le rendu et retrouve une preuve | Double-clic, aucun compte | ✓ testé hors connexion |
| | Limites explicitées | `MODE_EMPLOI.md` section 6 | ☐ à présenter à l'oral |
| Mise à jour (10) | Distinguer statut du problème, décision antérieure et nouvelle proposition | Formulaire guidé + garde-fous | ✓ testé |
| | Baseline conservé, impacts et actions sourcés, aucune approbation inventée, aucune autre condition fermée | Bouton Initiale / Actualisée ; avant/après en 3 questions + « Ce qui ne change pas » | ✓ testé (exemple fictif) |

## 3. Relecture humaine des dix réponses (3e membre)

Pour chaque réponse : ouvrez chaque preuve dans l'application, comparez-la au fichier original, puis cochez.

| Q | Point clé à confirmer | Où vérifier | OK |
|---|---|---|---|
| Q01 | 22 oct. approuvé le 10 sept. ; pas de go automatique ; 3 conditions | M04 15:22–15:27 ; M06 10:09–10:15 ; E09 | ☐ |
| Q02 | Cause : connecteur (INT-101, 401, jeton expiré) ; fermé le 17 sept. ; R-01 périmé | E05 ; INT-101 ; E12 ; M05 ; registre A2:H2 | ☐ |
| Q03 | Proposition Boréal le 8 sept. 11 h 16 ; approbation par le comité le 10 sept. vers 15 h 25 | E05 ; M04 15:02 et 15:22–15:25 | ☐ |
| Q04 | Nicolas Perron depuis le 16 sept. ; avant, Élodie Caron depuis le 7 juillet | E06 ; note de transition ; Teams 16 sept. ; M01 | ☐ |
| Q05 | 204 000 $ = 180 000 $ + 24 000 $ (CR-01) ; CR-04 exclu | CONTRAT p. 1 ; CR-01 p. 1 ; CR-04 p. 1 | ☐ |
| Q06 | INV-003 : ligne CR-04 de 18 000 $ non approuvée ; bloquer, libérer au plus 36 000 $ | INV-003 p. 1 ; E07 ; E10 ; M06 10:25 | ☐ |
| Q07 | Canada Central (ADR-007) ; migration du 26 août (Boréal) vérifiée le 27 août (architecture) | ADR-007 ; M02 ; E03 ; M03 | ☐ |
| Q08 | SEC-210 livré le 19 sept., **pas accepté** (en validation) | SEC-210 ; M06 10:02 ; Teams 19 sept. ; capture | ☐ |
| Q09 | ACC-301/302 validés ; **ACC-303 ouvert** (Tab n'atteint pas Enregistrer) | ACC-303 + capture ; M06 10:05 ; ACC-301 ; ACC-302 | ☐ |
| Q10 | 3 conditions ; runbook : étape 4 rollback (TODO), étape 5 validation post-déploiement (À compléter) | M06 10:09 ; capture OPS-601 ; OPS-601 | ☐ |

## 4. Points de jugement à faire valider par le responsable opérationnel

Ces points ne sont pas tranchés mot pour mot par le corpus. Ce sont des choix d'interprétation de notre équipe.

1. **204 000 $** : nous ajoutons CR-01 au montant initial, car le contrat prévoit qu'un changement est autorisé par une demande écrite approuvée. Le corpus ne contient pas d'avenant.
2. **Traitement d'INV-003** : la note de crédit ou la facture corrigée est une **recommandation** ; seul le refus de facturer CR-04 est documenté (E10, M06).
3. **Ordre des priorités** : sécurité, puis runbook, puis ACC-303. Les trois sont des conditions de go-live de même poids ; l'ordre reflète l'urgence perçue (pas de date de re-test, aucune version finale du runbook reçue).
4. **Responsables proposés** (A06, A08 à A11) : ce sont des suggestions de l'équipe.
5. **Impact de R-04** : le registre l'évalue « Moyen », nous le jugeons sous-estimé, car Mélissa Gagnon considère ACC-303 comme bloquant.
6. **Plan v3** : il nomme déjà Nicolas Perron pour P-06 (fichier daté du 12 sept.). Nous le signalons sans en tirer de conclusion.

## 5. Divergences avec la première analyse (JSON) de l'équipe

Le fichier `NOVA_OPERATIONS.json` préparé par l'équipe ne nous a pas été transmis : cette comparaison n'a pas pu être faite. Envoyez-le pour une comparaison champ par champ. Notre version est dans `donnees/NOVA_OPERATIONS.json`.

## 6. Le jour J : nouvel événement (environ 10 minutes)

1. Ouvrez `dist/NOVA_Projet360.html` → onglet **5** → « Ajouter une mise à jour ».
2. Collez la source et renseignez sa date, son auteur et son **autorité** (fournisseur, comité, ticket…).
3. Pour chaque fait nouveau, demandez-vous : est-ce une **proposition**, une **décision approuvée** (par qui ?), un **correctif livré** ou une **validation obtenue** (par l'équipe responsable) ?
4. Ajoutez les impacts avec le passage exact, puis « Prévisualiser ».
5. Vérifiez dans l'aperçu : la date approuvée ne change que s'il y a une décision ; les autres conditions restent ouvertes ; les actions ont un responsable et une échéance ou « À confirmer ».
6. Enregistrez → montrez **Avant / après**, puis la bascule **Initiale / Actualisée**, puis le brief réimprimé.
7. Si vous avez utilisé Claude pour analyser la source, dites-le (méthode « assistée par Claude »).
