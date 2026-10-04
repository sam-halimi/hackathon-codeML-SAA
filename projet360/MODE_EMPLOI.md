# NOVA · Mode d'emploi

Mémoire opérationnelle du projet NOVA (défi Projet 360). Situation de référence : **30 septembre 2026, 09 h 00, heure de Montréal**. L'application n'utilise jamais la date de l'ordinateur.

## 1. Ouvrir le rendu (jury et équipe)

Ouvrez `dist/NOVA_Projet360.html` par double-clic dans Chrome, Edge ou Firefox.

- C'est un seul fichier autonome : il contient l'application, nos données et les 64 documents du corpus.
- Il fonctionne sans Internet, sans compte, sans abonnement et sans clé API.

**Version en ligne** : https://nova-projet360.vercel.app (même fichier, hébergé sur Vercel ; le brief est aussi à `/NOVA_brief_de_reprise.pdf`). L'adresse est publique, mais elle est exclue des moteurs de recherche (`noindex`).

## 2. Naviguer

| Espace | Ce qu'on y trouve |
|---|---|
| **1. Vue d'ensemble** | Responsable, date approuvée et ses conditions, portée, finances, priorités, informations à ne pas utiliser, **brief imprimable sur une page** |
| **2. Questions et preuves** | Les 10 questions officielles, des réponses nuancées, les preuves cliquables, une recherche en langage naturel et les questions complémentaires des consignes |
| **3. Historique et décisions** | Chronologie filtrable, cycle proposition → décision → livraison → validation, registre des décisions, 8 contradictions expliquées |
| **4. Actions** | Responsable (confirmé ou proposé), échéance (connue ou « À confirmer »), état, type (engagement documenté ou recommandation de l'équipe), preuves |
| **5. Documents et mises à jour** | Recherche dans les sources, liste des documents avec leur autorité, ajout d'un événement, comparaison avant/après, exports |

**Guide d'accueil** : à la première ouverture, un guide en 8 écrans vous met dans la peau d'un PDG pressé. Le premier écran pose le contexte : « Mercredi 30 septembre, 9 h. Lance-t-on NOVA le 22 octobre 2026 ? », puis une fiche en quatre points (qui vous êtes, le lancement dans 22 jours sous trois conditions, le nouveau chargé de projet, vos cinq minutes face à 64 documents). Les six écrans suivants partent chacun d'un piège réel du dossier : le problème (en rouge), le risque concret, puis la réponse de NOVA (en vert) avec un bouton qui y mène. Les chiffres (date, jours restants, conditions remplies, montants) viennent de l'état courant. La fenêtre ne défile jamais : si l'écran est petit, la taille du texte est réduite pas à pas (testé sur 8 tailles, du téléphone 360×640 à l'écran 1920×1080). Le bouton « Comment ça marche ? » le rouvre ; les flèches du clavier le parcourent. Son texte est dans `donnees/guide.json` et se modifie sans toucher au code.

**Une preuve** s'ouvre au bon endroit :

- un **passage surligné** dans un texte ou un courriel ;
- la **page** d'un PDF (image de la page + texte surligné + bouton « Ouvrir le PDF original ») ;
- les **cellules** d'un fichier Excel, encadrées dans une grille fidèle à l'original ;
- une **zone encadrée** sur une capture d'écran.

Les copies sont signalées et ne comptent jamais comme deux confirmations indépendantes : 5 pièces jointes sont identiques à des PDF séparés, et `Courriel_archive_17sept.eml` est une copie de E12.

**Imprimer le brief** : bouton « Imprimer le brief (1 page) » dans la Vue d'ensemble. Le brief tient sur une page (format Lettre, testé).

## 3. Reconstruire après une correction des données (équipe)

Prérequis : [Node.js](https://nodejs.org) 18 ou plus récent. Aucun `npm install` n'est nécessaire.

1. Placez le kit dans `corpus/` : soit le dossier `Projet360_NOVA_ETUDIANTS`, soit l'archive `NOVA_ETUDIANTS.zip` (l'outil l'extrait tout seul).
2. Corrigez les faits dans `donnees/NOVA_OPERATIONS.json` (le format est décrit dans `CONTRAT_DONNEES.md`).
3. Dans un terminal, depuis le dossier `projet360` :

```
node outils/verifier.mjs              # contrôle chaque preuve dans le corpus
node outils/construire.mjs            # recrée dist/NOVA_Projet360.html
node outils/tester_navigateur.mjs     # facultatif : test complet hors connexion (Playwright)
node outils/comparer_equipe.mjs       # facultatif : vérifie l'analyse JSON de l'équipe (dossier equipe/)
```

Si `verifier.mjs` signale « passage introuvable », c'est que la citation ne correspond pas exactement au document : recopiez-la depuis la source.

Le texte des PDF est extrait avec `pdftotext` (poppler, déjà présent sur Linux et Mac via Homebrew). Pour les PDF déjà traités, les extractions sont gardées en cache dans `corpus/.cache_extraction/`.

## 4. Nouvel événement pendant la présentation

Trois façons de faire, sans toucher au code.

**A. Dans l'application (le plus rapide, en direct)** : allez dans l'onglet 5, section « Ajouter une mise à jour ».

1. Collez le texte de la source, ou joignez le fichier.
2. Lisez les indices repérés automatiquement. Ce sont des mots-clés : rien n'est décidé à votre place.
3. Ajoutez les impacts : état d'une condition, proposition de date, décision de date, note sur une réponse, état d'une action, nouvelle action. Pour chacun, collez le passage qui le justifie.
4. Cliquez sur « Prévisualiser », puis sur « Enregistrer ». L'avant/après répond à trois questions : *Qu'est-ce qui vient de changer ? Quelles informations précédentes sont affectées ? Quelles actions devraient être prises ?* Il liste aussi ce qui ne change pas.
5. Le bouton en haut de page bascule entre la version **initiale** (conservée) et la version **actualisée**.

**Garde-fous intégrés** (refus avec message) :

- une proposition ne change jamais la date approuvée ; elle s'affiche « en attente » et une action de décision est ajoutée ;
- une décision de date exige le nom de l'autorité qui approuve ;
- une condition de go-live ne se ferme qu'avec une « validation obtenue », jamais par une déclaration du fournisseur ;
- chaque impact doit citer un passage de la source.

**B. Avec l'aide de Claude (à déclarer)** : donnez à Claude la nouvelle source, `donnees/NOVA_OPERATIONS.json` et `donnees/modeles/MODELE_EVENEMENT.json`. Demandez-lui de produire un fichier d'événement au même format, sans inventer d'approbation, d'échéance ni de source. Importez ensuite ce fichier avec « Importer une mise à jour (.json) » : les garde-fous s'appliquent aussi aux fichiers importés. Relisez l'avant/après avant de le présenter.

**C. Permanent** : exportez la mise à jour (« Mises à jour de ce navigateur (JSON) »), placez le fichier dans `donnees/evenements/`, puis relancez `node outils/construire.mjs`. Si la source est un fichier, mettez-le dans `corpus/nouvelles_sources/` et indiquez `"chemin": "nouvelles_sources/…"` dans la source de l'événement.

Pour répéter avant le jour J, utilisez le bouton « S'entraîner avec l'exemple fictif » (onglet 5). Cet exemple est marqué **EXEMPLE FICTIF** partout et ne fait pas partie du corpus.

## 5. Outils utilisés et traitements manuels

- **Claude (Claude Code)** : lecture du corpus, rédaction de l'analyse et du code. L'analyse a été vérifiée passage par passage par `outils/verifier.mjs`. L'application elle-même n'appelle aucune IA.
- **Traitements manuels** :
  - choix des réponses et de leurs nuances ;
  - niveau d'autorité de chaque source ;
  - zones encadrées sur les captures (coordonnées en pixels lues à l'œil) ;
  - classement en « engagement documenté » ou « recommandation de l'équipe ».
- **Direction artistique** : skill `da-moderne` (dépôt catalyst-skills), palette « Papier & indigo » choisie par l'équipe parmi trois propositions : fond papier chaud #F6F3EC, encre indigo-noir #1D1A36, un seul accent indigo #4F46E5 réservé aux preuves et aux actions. Polices Fraunces (titres), Source Sans 3 (texte) et Source Code Pro (repères), intégrées au fichier (licence SIL OFL, `app/polices/OFL.txt`). Angles très arrondis, boutons larges, texte de base en 18 px, animations douces désactivées si le système le demande. Icônes Lucide intégrées au fichier (licence ISC, `app/icones-LICENCE.txt`) ; chaque couleur d'état garde une icône **et** un libellé. Toutes les couleurs sont des variables en tête de `app/styles.css` : changer de palette ne touche qu'à ce bloc.
- **Automatique** : extraction du texte (courriels, PDF, Excel), détection des copies (empreinte SHA-256 et Message-ID), contrôle des citations, des cellules et des zones, recherche plein texte.

## 6. Limites et informations incertaines

- **Recherche en langage naturel** : c'est une recherche par mots-clés, locale. Elle retrouve la réponse préparée la plus proche et les passages des documents, mais elle ne « comprend » pas une question formulée très différemment.
- **Échéances** : aucune date n'est documentée pour les actions restantes. Elles sont toutes « À confirmer » ; la seule limite connue est le go visé le 22 octobre.
- **Paiements** : le statut « Payée » vient des factures elles-mêmes ; le corpus ne contient aucune preuve de paiement distincte.
- **Canada Central** : la vérification par l'équipe architecture est rapportée dans le compte rendu du 27 août ; il n'y a pas de rapport technique détaillé.
- **Plan v3** : il nomme déjà Nicolas Perron avant la passation du 16 septembre ; la date réelle de modification de la cellule est inconnue.
- **Plan préliminaire** : il est daté « juin » sans jour ; il est placé au 15 juin pour le tri de la chronologie.
- **CR-01** : elle a été approuvée par le « comité de projet ». Le corpus ne contient pas d'avenant au contrat ; nous la considérons comme l'approbation écrite prévue au contrat.
- **PDF** : le surlignage se fait dans le texte extrait de la page, pas directement sur l'image de la page.
- **Mises à jour saisies dans le navigateur** : elles restent dans ce navigateur (stockage local), y compris sur la version en ligne : les autres visiteurs ne les voient pas. Pour les publier, rendez-les permanentes (section 4C) puis redéployez (section 8).
- **Testé** : Chromium, hors connexion et sur la version en ligne, sur grand écran (1366 px) et en largeur téléphone (390 px) ; le guide d'accueil sur 8 tailles d'écran. **Non testé** : Firefox, Safari, Edge réel, vrai téléphone, lecteurs d'écran, impression sur papier.

## 7. Données et git

La règle du dépôt interdit de committer les données des défis Loto-Québec. Par prudence, `corpus/` (documents bruts) et `dist/` (rendu, qui embarque le corpus) sont exclus de git (`.gitignore`). Le code, nos données (`donnees/`) et la documentation sont versionnés. Le README du kit indique que toutes les données NOVA sont fictives. Si l'équipe confirme que ce défi n'est pas visé par la règle, il suffit de retirer ces deux lignes du `.gitignore`.

## 8. Mettre en ligne (Vercel)

Depuis le dossier `projet360`, avec un jeton Vercel (Vercel → Account Settings → Tokens) :

```
VERCEL_TOKEN=votre_jeton node outils/deployer.mjs                 # macOS / Linux
$env:VERCEL_TOKEN="votre_jeton"; node outils/deployer.mjs         # Windows PowerShell
```

Le script reconstruit le rendu, l'envoie et affiche l'adresse ; l'adresse de production reste https://nova-projet360.vercel.app. Le jeton n'est jamais enregistré : ne l'écrivez dans aucun fichier du dépôt.

Pour tester la version en ligne dans un navigateur : `node outils/tester_navigateur.mjs --url https://nova-projet360.vercel.app/`.
