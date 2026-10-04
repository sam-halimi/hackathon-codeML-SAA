# Utiliser NOVA_OPERATIONS.json dans l’application

Le schéma est volontairement simple. Garder le contenu métier dans les données et les afficher à partir d’un état partagé. Les phrases du fichier sont des analyses de notre équipe ; les preuves sont les documents du corpus.

## Sections

| Clé | Utilisation |
|---|---|
| `metadata` | Projet, date d’observation, devise, méthode et origine de l’analyse |
| `project_state` | Responsable, calendrier, portée, hébergement, conditions et incertitudes |
| `financials` | Montants distincts autorisé/facturé/payé, factures et calculs |
| `questions` | Les dix questions officielles, réponses, nuances et preuves |
| `actions` | Actions, nature, responsables, niveau de confirmation, échéances et preuves |
| `timeline` | Événements historiques avec type et source |
| `contradictions` | Affirmations divergentes et explication de leur résolution |
| `deduplication_notes` | Copies et pièces jointes à ne pas compter comme preuves indépendantes |
| `event_workflow` | Processus proposé pour intégrer le nouvel événement |

## Preuve

Chaque objet `evidence` contient :

- `file` : chemin relatif à `Projet360_NOVA_ETUDIANTS/` ; conserver l’original.
- `locator` : page, cellule, commentaire, moment de réunion ou zone d’image permettant de retrouver la preuve.
- `supports` : résumé de ce que la source étaye. Ce résumé n’est pas une citation verbatim.

Construire le panneau de preuve à partir des originaux et afficher un extrait vérifié. Si le repère est textuel, il est possible de créer des ancres lors de l’extraction. Pour XLSX, conserver le nom d’onglet, les adresses de cellules et les valeurs. Pour les captures, afficher l’image et le repère descriptif. Ne pas remplacer une image indispensable par son nom de fichier.

Les locators ont été contrôlés par lecture des sources. Leur navigation réelle dans l’application doit être testée.

## Finances

Montants en CAD hors taxes. Le champ `invoiced_total_nova` inclut la ligne litigieuse de 18 000 CAD ; ne pas le renommer « dépenses approuvées ». Les factures INV-001 et INV-002 indiquent un statut payé. INV-003 indique en validation. La part contractuelle de 36 000 CAD n’est pas une preuve d’approbation de paiement. L’estimation CR-04 ne fait pas partie du montant contractuel autorisé.

## Données nouvelles et versions

Conserver une copie initiale identifiée par le cutoff du 30 septembre 2026 à 09:00 UTC−04:00. Chaque version suivante doit comporter un identifiant, sa date d’analyse, les sources nouvelles, une note de changement et l’état résultant. Distinguer la date de fait de la date d’import.

Un éditeur simple ou un import JSON peut mettre à jour ces données. Après une modification, mettre à jour ensemble les réponses, le brief, les conditions et les actions affectés : un journal qui affiche un événement sans modifier la situation courante ne suffit pas.

La nouvelle information du jury n’est pas connue. Ne pas préremplir une issue supposée. Une saisie validée par l’équipe est un acte de traitement documentaire, pas une approbation de gouvernance.

L’export doit contenir l’état et les nouvelles preuves nécessaires pour le rouvrir sur un autre ordinateur. Un stockage temporaire dans le navigateur ne remplace pas un export. Documenter les étapes manuelles et les formats effectivement supportés.
