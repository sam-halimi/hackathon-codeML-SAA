# Contrat de données · `donnees/NOVA_OPERATIONS.json`

Toutes les informations du projet sont dans ce fichier, séparé du code : pour corriger un fait, on modifie le JSON, puis on relance `node outils/verifier.mjs` et `node outils/construire.mjs`.

## Règles

- Chaque fait affiché a au moins une **preuve** (objet `preuve`, voir plus bas).
- Une date inconnue s'écrit `null`, avec un texte « À confirmer ». On n'invente jamais une date.
- `meta.date_situation` reste `2026-09-30T09:00:00-04:00`.
- Les identifiants de sources (`E05`, `M04`, `PLAN-V3`…) sont stables : ne les renommez pas.

## L'objet `preuve` (utilisé partout)

| Champ | Obligatoire | Rôle |
|---|---|---|
| `source` | oui | Identifiant d'une source de la liste `sources` |
| `repere` | conseillé | Repère lisible : « Transcription, 15:22 », « Page 1, tableau Facturation » |
| `passage` | texte, courriel, PDF | Citation **exacte** (espaces, apostrophes et `**` sont tolérés) |
| `jusqua` | non | Fin du passage, pour surligner un bloc de plusieurs lignes |
| `page` | PDF | Numéro de page (1 = première) |
| `cellules` | Excel | Plage, ex. `A7:G7` ou `D7` |
| `feuille` | non | Nom de la feuille Excel (par défaut la première) |
| `zone` | capture | `{ "x", "y", "w", "h" }` en pixels de l'image d'origine |
| `lecture` | capture | Ce qu'on lit dans la zone encadrée |
| `role` | non | « Décision », « Proposition », « Contradiction »… |

## Sections du fichier

| Section | Contenu |
|---|---|
| `meta` | Projet, date de situation, méthode, règles de lecture |
| `autorites` | Niveaux d'autorité des sources (libellé, couleur, aide) |
| `personnes` | Qui est qui, avec preuve |
| `synthese` | `responsable`, `date_mep` (date approuvée, réserve, historique), `propositions` (en attente), `conditions` (C1 à C3), `portee`, `finances`, `priorites`, `a_ne_pas_utiliser` |
| `questions` | Q01 à Q10 : `question`, `reponse_courte`, `details`, `liens` (conditions et actions), `mots_cles` (pour la recherche), `preuves` |
| `questions_complementaires` | X01 à X07 : exemples tirés des consignes |
| `decisions` | Registre : date, titre, autorité, statut, preuve |
| `cycles` | Par sujet : étapes Proposition / Décision / Livraison / Validation (`statut` : `fait` ou `manquant`) |
| `chronologie` | Événements datés : `nature`, `validite` (`actuelle`, `historique`, `remplacee`, `perimee`, `inexacte`), `sujets`, `sources`, `preuve` |
| `contradictions` | `version_perimee`, `version_valide`, `explication` (autorité ou date des faits), preuves |
| `actions` | Voir ci-dessous |
| `risques` | Lecture du registre et analyse de l'équipe |
| `sources` | Les 64 fichiers : `id`, `chemin`, `titre`, `date`, `auteur`, `autorite`, `remarque`, `copie_de` |

## Une action

```json
{
  "id": "A01",
  "titre": "Faire le re-test sécurité de SEC-210…",
  "condition": "C1",
  "responsable": "Sophie Lambert",
  "responsable_statut": "confirme",
  "echeance": null,
  "echeance_texte": "À confirmer",
  "echeance_note": "Re-test « planifié » le 26 sept., sans date.",
  "etat": "en_cours",
  "type": "engagement",
  "preuves": [ { "source": "SEC-210", "passage": "…" } ]
}
```

- `responsable_statut` : `confirme` (désigné dans une source) ou `propose` (suggestion de l'équipe).
- `type` : `engagement` (promis dans une source) ou `recommandation` (proposé par l'équipe).
- `etat` : `ouvert`, `correctif_annonce`, `correctif_livre`, `en_cours`, `en_attente`, `a_faire`, `non_fait`, `partiel`, `valide`, `fait`, `rouvert`, `annule`.

## Natures d'information

`proposition` · `decision_approuvee` · `correctif_livre` · `validation_obtenue` · `information` · `probleme` · `document` · `finance`.

## Événements (mises à jour) · `donnees/evenements/*.json`

Un fichier par événement (ou un tableau d'événements). Modèle : `donnees/modeles/MODELE_EVENEMENT.json`.

- `source` : la nouvelle source, avec son texte intégral (`texte`) ou un `chemin` vers un fichier placé dans `corpus/`.
- `impacts` : liste de changements.
  - `{ "cible": "conditions/C2", "modifs": { "etat": "…" } }` modifie un élément existant. Cibles possibles : `questions/Qxx`, `actions/Axx`, `conditions/Cx`, `synthese/date_mep`, `synthese/finances`, `synthese/portee`, `synthese/responsable`.
  - `{ "ajouter": "actions" | "propositions" | "risques" | "chronologie", "objet": { … } }` ajoute un élément.
  - Chaque impact porte une `nature`, un `passage` (preuve) et, au besoin, une `note`.
- `inchange` : ce que l'événement ne change pas.
- `date` : la **date du fait** (quand la source a été émise). `cree_le` : la **date d'ajout dans NOVA** (horodatage réel, renseigné automatiquement par le formulaire). Les deux sont affichées séparément ; la date de situation du 30 septembre, elle, ne change jamais.

Garde-fous (appliqués par l'application et par `verifier.mjs`) :

- `synthese/date_mep.approuvee` ne change qu'avec la nature `decision_approuvee` et une `autorite` ;
- une condition ne passe à `valide` qu'avec la nature `validation_obtenue`, et jamais par une source `fournisseur` ;
- une `proposition` ne ferme rien ;
- chaque impact doit avoir un `passage`.

La version initiale n'est jamais modifiée : les événements s'appliquent sur une copie.

`donnees/evenements/exemples/` contient un exemple **fictif**, chargé seulement à la demande (bouton « S'entraîner »).

## Guide d'accueil · `donnees/guide.json`

Texte du tutoriel affiché à la première ouverture (modifiable sans toucher au code, puis `node outils/construire.mjs`).

- `persona` : `nom`, `accroche` (titre du premier écran), `texte`, `promesse`.
- `etapes` (6) : `icone` (nom d'une icône de `app/icones.svg`, sans `i-`), `douleur_titre`, `douleur`, `risque`, `solution_titre`, `solution`, `onglet` (`vue`, `questions`, `historique`, `actions`, `documents`), `ancre` (facultatif), `bouton`.
- `fin` : `titre`, `texte`.
- Jetons remplacés par l'état affiché : `{date}`, `{remplies}`, `{autorise}`, `{conteste}`. Dans les étapes, les valeurs qui décrivent l'état courant passent par ces jetons, pour suivre les mises à jour.

