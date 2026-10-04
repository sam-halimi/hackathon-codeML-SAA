# Contrôle de l'équipe

Liste de vérification avant la remise et avant la démonstration. Elle suit le barème du `README.txt` du kit.

> La grille du responsable qualité de l'équipe (copie dans `equipe/CONTROLE_EQUIPE_equipe.md`) a été passée ligne par ligne : voir la section 5. Cette liste-ci reprend le barème du kit et ajoute les commandes de contrôle.

## 1. Contrôles automatiques (à relancer après chaque modification)

| Commande | Ce qu'elle vérifie |
|---|---|
| `node outils/verifier.mjs` | Chaque preuve (passage, page, cellules, zone) existe dans le corpus ; les 10 questions ont réponse et preuves ; chaque action a un responsable confirmé ou proposé, une échéance datée ou « À confirmer », un état et une preuve ; 3 conditions de go-live ; les copies sont déclarées ; les garde-fous des événements sont respectés |
| `node outils/construire.mjs` | Refait la vérification et produit `dist/NOVA_Projet360.html` |
| `node outils/tester_navigateur.mjs` | Dans Chromium, **hors connexion**, avec un fuseau horaire différent (Paris) : ouverture, date fixe du 30 sept., ouverture au bon endroit des 53 preuves des Q01–Q10, PDF, Excel et capture, copies signalées, 5 espaces, brief sur **une page** (Lettre et A4), sous-onglets et filtres, recherche, exemple fictif, formulaire expert et garde-fous, enregistrement, persistance, import JSON, décision de date approuvée (la version initiale garde le 22 oct.), tutoriel d'accueil (mercredi 30 sept., fiche du dirigeant, 6 pièges, chiffres réels, clavier, **aucun défilement sur 8 tailles d'écran**), affichage téléphone (390 px). **Assistant** : vue fractionnée à un tiers de la largeur, réponses Q03 et Q10 avec preuve ouverte au passage, synthèse, finances, courriel → aperçu → appliquer → 1 / 3 → annuler, garde-fou fournisseur (correctif livré, rien de fermé), proposition sans changement de date, question « qui a validé ? », ignorer. **Connecteur Claude** (réponse d'API simulée, sans réseau) : clé en stockage de session, requête conforme (`claude-opus-5-5`, version d'API, outil), état transmis, aperçu obligatoire, résultat d'outil renvoyé, fermeture par le fournisseur refusée, clé refusée → repli local. **Versions** : écran de choix, dossier vierge (guide propre, états vides, l'assistant remplit nom, responsable, date approuvée après question, condition et action ; sources ; persistance), retour à la démo intacte, effacement. Plus : chaque icône existe et se dessine, aucun tiret cadratin visible, polices chargées sans réseau, aucune erreur JavaScript, aucune requête réseau |
| `node outils/comparer_equipe.mjs` | Vérifie l'analyse JSON de l'équipe (`equipe/`) dans le corpus original (empreintes, fichiers cités, heures, cellules, pages) et la compare aux faits clés de l'application |

**Dernière exécution (4 octobre 2026)** : `verifier.mjs` → 0 erreur (229 preuves contrôlées : 221 dans les données + 8 passages de l'exemple fictif) ; `tester_navigateur.mjs` → 119/119 vérifications réussies hors connexion, et 119/119 sur la version en ligne https://nova-projet360.vercel.app ; `comparer_equipe.mjs` → 64/64 fichiers identiques, 106 preuves de l'équipe et 80 repères contrôlés, aucun écart sur les faits clés.

## 2. Barème → où le montrer

| Critère (points) | Constat attendu | Dans l'application | Statut |
|---|---|---|---|
| Dix réponses (50) | Exactes et nuancées | Espace 2, Q01–Q10 | ☐ relues par le 3e membre (section 3) |
| Preuves et navigation (10) | ≥ 3 réponses avec fichier et repère retrouvables | Les 10 réponses ont 4 à 7 preuves cliquables | ✓ testé |
| | ≥ 2 réponses qui croisent des sources distinctes | Chaque carte affiche le nombre de sources indépendantes (3 à 6, copies exclues) | ✓ calculé |
| Chronologie (10) | Proposition, décision et validation, avec dates et sources | Espace 3, section « Proposition, décision, livraison, validation » (8 sujets) | ✓ |
| | ≥ 2 contradictions expliquées, dont une dans un plan ou un registre | K01 (plan v3 : 15 oct.), K02 (registre : R-01), + 6 autres | ✓ |
| Brief et actions (10) | Cinq thèmes sur une page | Accueil → « Imprimer le brief (1 page) » | ✓ testé (Lettre et A4) |
| | Les 3 conditions reliées à des actions, responsables et échéances | Tableau des conditions + Actions A01–A05 | ✓ |
| Utilisation (10) | Le jury ouvre le rendu et retrouve une preuve | Double-clic, aucun compte | ✓ testé hors connexion |
| | Limites explicitées | `MODE_EMPLOI.md` section 8 | ☐ à présenter à l'oral |
| Mise à jour (10) | Distinguer statut du problème, décision antérieure et nouvelle proposition | Assistant (aperçu, questions de précision) + formulaire expert + mêmes garde-fous | ✓ testé |
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

## 5. Analyse de l'équipe : vérification et divergences

Fichiers reçus le 4 octobre : `NOVA_OPERATIONS.json`, `INVENTAIRE_SOURCES.json`, `BRIEF_REPRISE.md`, `CONTRAT_DONNEES.md`, `CONTROLE_EQUIPE.md` (copies dans `equipe/`, suffixe `_equipe` quand le nom existait déjà).

**Vérification dans les originaux** (`node outils/comparer_equipe.mjs`) :

- inventaire : 64/64 fichiers identiques au corpus (SHA-256) ;
- 106 preuves citées, tous les fichiers existent ; 80 repères vérifiables (heures, cellules, pages) retrouvés ;
- faits clés identiques : 22 octobre 2026, Nicolas Perron depuis le 16 septembre, 204 000 / 186 000 / 132 000 / 54 000 / 18 000 $, questions Q01 à Q10.

**Grille du responsable qualité** : chaque ligne attendue (date de référence, Q01 à Q10, preuves croisées, pièces jointes, ORION exclu, plan v3, registre R-01, historique, actions, brief, consultation, actualisation, export) est couverte par l'application et par les tests automatiques. Deux points ont été ajoutés après lecture du contrat de l'équipe : la **date du fait** et la **date d'ajout dans NOVA** sont maintenant affichées séparément sur chaque mise à jour, et l'export JSON des mises à jour se rouvre sur un autre ordinateur avec « Importer une mise à jour ».

| Sujet | Analyse de l'équipe | Application | Décision |
|---|---|---|---|
| Rédacteur du runbook (A04, C3) | « équipe ops de Boréal proposée », nom à confirmer | Équipe ops de Boréal, statut « confirmé » | **Adopté** : statut « proposé », rédacteur exact à confirmer |
| Facture INV-003 (A06) | Amélie Fortin avec Nicolas Perron | Nicolas Perron en tête, avec Amélie Fortin | **Adopté** : Amélie Fortin (Finances) en tête, avec Nicolas Perron |
| Mise à jour du plan (A07) | Fondue avec la communication, « recommandation, proposé » | « Engagement, confirmé » pour Nicolas Perron | **Conservé**, à valider par le responsable opérationnel : la note de transition lui remet explicitement « faire mettre à jour la date dans tous les plans » ; la communication de statut reste une recommandation séparée (A09) |
| Brief | Fournisseur, hébergement, factures contestées, plafond disponible ≠ autorisation de dépense, nuance INT-101, inconnues | Absents ou moins précis | **Adoptés** dans le brief et dans la Vue d'ensemble (« Ce que l'on ne sait pas encore ») |
| Granularité | 6 actions, 6 contradictions | 11 actions, 8 contradictions (dont K08 sur le budget) | Conservé : mêmes sujets, découpage plus fin (re-test et correctif séparés, go/no-go, confirmation écrite de Boréal sur CR-04) |
| Démonstration | Version courte de 5 minutes | Script de 8 minutes | **Adopté** : script de 5 minutes ci-dessous (section 7) |

## 6. Le jour J : nouvel événement (environ 10 minutes)

1. Ouvrez `dist/NOVA_Projet360.html` (version **démo**), cliquez sur **Assistant** et collez la source (courriel, compte rendu, ticket), si possible précédée de sa date et de son auteur (« Courriel de …, 2 octobre : … »).
2. Lisez la carte d'aperçu : pour chaque fait nouveau, l'assistant indique s'il s'agit d'une **proposition**, d'une **décision approuvée** (par qui ?), d'un **correctif livré** ou d'une **validation obtenue** (par l'équipe responsable). S'il pose une question (« Qui a validé ? », « Qui a approuvé ? »), répondez avec les boutons.
3. Vérifiez : la date approuvée ne change que s'il y a une décision ; les autres conditions restent ouvertes (« Ce qui ne change pas ») ; les actions ont un responsable et une échéance ou « À confirmer ».
4. « Appliquer » → montrez l'Accueil mis à jour, **Avant / après** (Documents → Mises à jour), la bascule **Initiale / Actualisée**, puis le brief réimprimé.
5. Si l'assistant ne comprend pas la source, utilisez le **formulaire expert** (Documents → Mises à jour) : mêmes garde-fous, saisie champ par champ.
6. Si vous avez utilisé Claude (connecteur ou analyse à part), dites-le (méthode « assistée par Claude »).

## 7. Démonstration en 5 minutes (version de l'équipe, adaptée)

Confirmez d'abord la durée officielle. Gardez une vidéo de secours, clairement présentée comme un enregistrement.

| Temps | Geste | Ce qu'on dit |
|---|---|---|
| 0:00 | Ouvrir le fichier : choisir « Découvrir la démo », puis « Passer » le guide | « Aucune connexion, aucun compte. Situation figée au 30 septembre, 9 h, Montréal. » |
| 0:20 | Accueil : responsable, 22 octobre, 0 condition sur 3 | « Nicolas Perron reprend ; le 22 n'est pas un go automatique. » |
| 1:00 | Questions → Q08 → Preuve SEC-210 | « Livré n'est pas accepté : la preuve s'ouvre au passage exact. » |
| 1:45 | Historique → Contradictions → K01 (plan v3, cellules E7:F7) | « Le plan dit encore 15 octobre ; la décision du 10 septembre fait foi. » |
| 2:30 | Questions → Q10 → capture du runbook | « Deux travaux manquent : retour arrière et validation après déploiement. » |
| 3:15 | Assistant → « Essai : Boréal propose le 29 octobre » → aperçu → Appliquer → Initiale / Actualisée | « Une proposition ne devient jamais une décision ; la version initiale reste là. » |
| 3:50 | Assistant → « Essai : Boréal dit ACC-303 validé » | « Le fournisseur ne peut pas fermer une condition : c'est un correctif livré. » |
| 4:15 | Méthode | « Lecture et extraction assistées par Claude, choix d'interprétation faits par l'équipe, chaque preuve vérifiée par un script ; limites dans le mode d'emploi. » |

Prévoyez en plus le temps du véritable événement du jury (section 6).

