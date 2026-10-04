# NOVA · Mode d'emploi

Mémoire opérationnelle du projet NOVA (défi Projet 360). Dans la démo, la situation de référence est fixée au **30 septembre 2026, 09 h 00, heure de Montréal** : l'application n'utilise jamais la date de l'ordinateur pour ce dossier.

## 1. Ouvrir le rendu (jury et équipe)

Ouvrez `dist/NOVA_Projet360.html` par double-clic dans Chrome, Edge ou Firefox.

- C'est un seul fichier autonome : il contient l'application, nos données et les 64 documents du corpus.
- Il fonctionne sans Internet, sans compte, sans abonnement et sans clé API.

**Version en ligne** : https://nova-projet360.vercel.app (même fichier, hébergé sur Vercel ; le brief est aussi à `/NOVA_brief_de_reprise.pdf`). L'adresse est publique, mais elle est exclue des moteurs de recherche (`noindex`).

## 2. Deux versions : la démo et un dossier vierge

Au premier lancement, un écran propose :

| Version | Pour quoi faire |
|---|---|
| **Découvrir la démo** | Le dossier NOVA : 64 documents, une décision à prendre. Vous êtes le dirigeant qui doit trancher. Situation figée au 30 septembre 2026. |
| **Commencer un dossier vierge** | Votre propre projet : aucune donnée au départ. Vous parlez à l'assistant, il range chaque information (responsable, date, conditions, actions) avec sa source. La situation est la date du jour. |

Le menu en haut à droite (« Démo · NOVA » ou « Dossier vierge ») permet de changer de version à tout moment, de revoir l'écran d'accueil, de réinitialiser la démo ou d'effacer le dossier vierge. Les deux dossiers ne se mélangent jamais : chacun a son propre historique local et son propre guide.

## 3. Naviguer : une chose à la fois

| Espace | Ce qu'on y trouve |
|---|---|
| **1. Accueil** | La date approuvée et ses conditions (grand panneau), quatre chiffres clés (responsable, conditions, finances, actions), ce que l'on ne sait pas encore, puis « Le détail » en blocs dépliables : conditions, propositions en attente, priorités, portée et finances, informations à ne pas utiliser, **brief imprimable sur une page** |
| **2. Questions** | Les 10 questions officielles, une réponse courte, les nuances et les preuves cliquables ; les questions complémentaires des consignes dans un bloc dépliable ; toute autre question se pose à l'assistant |
| **3. Historique** | Quatre sous-onglets : chronologie (filtres repliés), décision et validation (cycle proposition → décision → livraison → validation), registre des décisions, 8 contradictions expliquées |
| **4. Actions** | Responsable (confirmé ou proposé), échéance (connue ou « À confirmer »), état, type (engagement documenté ou recommandation de l'équipe), preuves ; la légende est repliée |
| **5. Documents** | Quatre sous-onglets : rechercher dans les sources, tous les documents avec leur autorité, mises à jour (assistant, import, avant/après, formulaire expert replié), exports |

Principe de simplicité : chaque espace montre une seule vue à la fois (sous-onglets), le détail se déplie à la demande, et chaque écran vide propose une prochaine étape claire. Aucune fonction n'a été retirée.

**Guide d'accueil** : à la première ouverture de la démo, un guide en 8 écrans vous met dans la peau d'un PDG pressé. Le premier écran pose le contexte : « Mercredi 30 septembre, 9 h. Lance-t-on NOVA le 22 octobre 2026 ? », puis une fiche en quatre points (qui vous êtes, le lancement dans 22 jours sous trois conditions, le nouveau chargé de projet, vos cinq minutes face à 64 documents). Les six écrans suivants partent chacun d'un piège réel du dossier : le problème (en rouge), le risque concret, puis la réponse de NOVA (en vert) avec un bouton qui y mène ; le sixième ouvre l'assistant avec un courriel d'essai prêt à envoyer. Le dossier vierge a son propre guide (« le dirigeant qui lance un projet », quatre pièges du démarrage). Les chiffres viennent de l'état courant. La fenêtre ne défile jamais : si l'écran est petit, la taille du texte est réduite pas à pas (testé sur 8 tailles, du téléphone 360×640 à l'écran 1920×1080). Le bouton « Guide » le rouvre ; les flèches du clavier le parcourent. Son texte est dans `donnees/guide.json` (clé `vierge` pour le dossier vierge) et se modifie sans toucher au code.

**Une preuve** s'ouvre au bon endroit :

- un **passage surligné** dans un texte ou un courriel ;
- la **page** d'un PDF (image de la page + texte surligné + bouton « Ouvrir le PDF original ») ;
- les **cellules** d'un fichier Excel, encadrées dans une grille fidèle à l'original ;
- une **zone encadrée** sur une capture d'écran.

Les copies sont signalées et ne comptent jamais comme deux confirmations indépendantes : 5 pièces jointes sont identiques à des PDF séparés, et `Courriel_archive_17sept.eml` est une copie de E12.

**Imprimer le brief** : bouton « Imprimer le brief (1 page) » dans l'Accueil. Le brief tient sur une page (formats Lettre et A4, testés).

## 4. L'assistant : répondre et tout mettre à jour

Le champ en haut de page (« Demandez à l'assistant… ») et le bouton **Assistant** ouvrent l'assistant en **vue fractionnée** : il occupe un tiers de la largeur, à droite, et la page reste utilisable à côté (plein écran sur téléphone). On lui parle comme à un collègue, ou comme on demanderait à un assistant de mettre à jour un CRM par un connecteur.

**Il répond** aux questions sur le dossier avec les preuves : « Où en est le projet ? », « Qui a approuvé le report ? », « Que reste-t-il avant le lancement ? », « Combien a-t-on payé ? ». Chaque preuve citée s'ouvre au bon passage. Les questions officielles renvoient à leur réponse complète.

**Il met tout à jour** quand on lui donne une nouvelle information (courriel collé, compte rendu, décision, ou une simple phrase) :

1. Il comprend ce qui change : état d'une condition, proposition ou décision de date, nouvelle action, état d'une action, responsable, budget, portée, nom du projet, nouvelle condition.
2. Il montre une **carte d'aperçu** : chaque changement (avant → après, avec sa nature), la phrase citée comme source, ce qui ne change pas.
3. **Rien n'est appliqué sans votre accord** : « Appliquer », « Ignorer », puis « Annuler cette mise à jour » si besoin. Une mise à jour appliquée met à jour tous les espaces, entre dans l'historique, et le message d'origine devient une source consultable.
4. S'il manque une information essentielle, il **pose la question** au lieu de deviner : « Qui a validé SEC-210 ? », « Qui a approuvé le 15 novembre ? » (boutons de réponse rapide).

Les boutons **« Essai »** préparent des messages fictifs pour voir l'assistant au travail (Sophie valide SEC-210 ; Boréal propose le 29 octobre ; Boréal dit ACC-303 validé). En démo, ils sont marqués **EXEMPLE** partout.

**Garde-fous** (les mêmes pour l'assistant, le formulaire et les fichiers importés) :

- une proposition ne change jamais la date approuvée ; elle s'affiche « en attente » et une action de décision est ajoutée ;
- une décision de date exige le nom de l'autorité qui approuve ;
- une condition ne se ferme qu'avec une « validation obtenue », jamais par une déclaration du fournisseur : « validé de notre côté » devient un **correctif livré** ;
- chaque impact doit citer un passage de la source.

**Deux moteurs** (bouton ⚙ de l'assistant) :

- **Local** (par défaut) : compréhension par règles, sans connexion ni clé, déterministe. C'est le moteur testé et recommandé pour la démonstration. Il couvre les formulations courantes en français ; une phrase très inhabituelle peut ne pas être comprise : il le dit et propose d'enregistrer l'information telle quelle.
- **Claude** (facultatif) : avec votre propre clé API Anthropic, compréhension libre. Modèle par défaut : `claude-opus-5-5` (modifiable). La clé reste dans l'onglet (stockage de session) : elle n'est ni exportée ni écrite dans le fichier. Les messages et un résumé du dossier sont envoyés à l'API d'Anthropic. Claude propose ses mises à jour par un outil structuré ; elles passent par la même carte d'aperçu et les mêmes garde-fous, et attendent votre accord. En cas d'erreur (clé refusée, pas de réseau), un bouton répond avec le moteur local.

## 5. Reconstruire après une correction des données (équipe)

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

## 6. Nouvel événement pendant la présentation

Quatre façons de faire, sans toucher au code.

**A. L'assistant (le plus rapide, en direct)** : collez le courriel ou dites ce qui a changé (section 4). Vérifiez la carte d'aperçu, puis « Appliquer ». Le bouton en haut de page bascule entre la version **initiale** (conservée) et la version **actualisée**.

**B. Le formulaire expert** (onglet Documents → Mises à jour → « Formulaire expert ») : pour saisir une mise à jour champ par champ.

1. Collez le texte de la source, ou joignez le fichier.
2. Lisez les indices repérés automatiquement. Ce sont des mots-clés : rien n'est décidé à votre place.
3. Ajoutez les impacts : état d'une condition, proposition de date, décision de date, note sur une réponse, état d'une action, nouvelle action. Pour chacun, collez le passage qui le justifie.
4. Cliquez sur « Prévisualiser », puis sur « Enregistrer ». L'avant/après répond à trois questions : *Qu'est-ce qui vient de changer ? Quelles informations précédentes sont affectées ? Quelles actions devraient être prises ?* Il liste aussi ce qui ne change pas.

**C. Avec Claude hors de l'application (à déclarer)** : donnez à Claude la nouvelle source, `donnees/NOVA_OPERATIONS.json` et `donnees/modeles/MODELE_EVENEMENT.json`. Demandez-lui de produire un fichier d'événement au même format, sans inventer d'approbation, d'échéance ni de source. Importez ensuite ce fichier avec « Importer une mise à jour (.json) » : les garde-fous s'appliquent aussi aux fichiers importés. Relisez l'avant/après avant de le présenter.

**D. Permanent** : exportez la mise à jour (onglet Documents → Exporter → « Mises à jour de ce navigateur (JSON) »), placez le fichier dans `donnees/evenements/`, puis relancez `node outils/construire.mjs`. Si la source est un fichier, mettez-le dans `corpus/nouvelles_sources/` et indiquez `"chemin": "nouvelles_sources/…"` dans la source de l'événement.

Pour répéter avant le jour J : les boutons « Essai » de l'assistant, ou « S'entraîner avec l'exemple fictif » (onglet Documents → Mises à jour). Ces exemples sont marqués **EXEMPLE** partout et ne font pas partie du corpus. « Réinitialiser la démo » (menu des versions) retire toutes les mises à jour locales.

## 7. Outils utilisés et traitements manuels

- **Claude (Claude Code)** : lecture du corpus, rédaction de l'analyse et du code. L'analyse a été vérifiée passage par passage par `outils/verifier.mjs`. Par défaut, l'application n'appelle aucune IA en ligne : l'assistant fonctionne par règles, dans le navigateur. Le connecteur Claude n'est utilisé que si l'utilisateur le choisit, avec sa propre clé.
- **Traitements manuels** :
  - choix des réponses et de leurs nuances ;
  - niveau d'autorité de chaque source ;
  - zones encadrées sur les captures (coordonnées en pixels lues à l'œil) ;
  - classement en « engagement documenté » ou « recommandation de l'équipe ».
- **Direction artistique** : skill `da-moderne` (dépôt catalyst-skills), palette « Papier & indigo » choisie par l'équipe parmi trois propositions : fond papier chaud #F6F3EC, encre indigo-noir #1D1A36, un seul accent indigo #4F46E5 réservé aux preuves et aux actions. Polices Fraunces (titres), Source Sans 3 (texte) et Source Code Pro (repères), intégrées au fichier (licence SIL OFL, `app/polices/OFL.txt`). Angles très arrondis, boutons larges, texte de base en 18 px, animations douces désactivées si le système le demande. Icônes Lucide intégrées au fichier (licence ISC, `app/icones-LICENCE.txt`) ; chaque couleur d'état garde une icône **et** un libellé. Toutes les couleurs sont des variables en tête de `app/styles.css` : changer de palette ne touche qu'à ce bloc.
- **Automatique** : extraction du texte (courriels, PDF, Excel), détection des copies (empreinte SHA-256 et Message-ID), contrôle des citations, des cellules et des zones, recherche plein texte.

## 8. Limites et informations incertaines

- **Assistant local** : il comprend par règles (dates en français, noms, identifiants de conditions et de tickets, verbes de décision, de proposition, de livraison et de validation). Il ne « comprend » pas une phrase formulée très différemment ; il le dit, pose une question, ou propose d'enregistrer l'information sans rien modifier. Il ne lit pas les pièces jointes : collez le texte.
- **Connecteur Claude** : non testé avec une vraie clé dans notre environnement (aucune clé disponible) ; la requête, la réponse et les garde-fous sont testés avec une réponse simulée de l'API. Le modèle par défaut est `claude-opus-5-5`.
- **Échéances** : aucune date n'est documentée pour les actions restantes. Elles sont toutes « À confirmer » ; la seule limite connue est le go visé le 22 octobre.
- **Paiements** : le statut « Payée » vient des factures elles-mêmes ; le corpus ne contient aucune preuve de paiement distincte.
- **Canada Central** : la vérification par l'équipe architecture est rapportée dans le compte rendu du 27 août ; il n'y a pas de rapport technique détaillé.
- **Plan v3** : il nomme déjà Nicolas Perron avant la passation du 16 septembre ; la date réelle de modification de la cellule est inconnue.
- **Plan préliminaire** : il est daté « juin » sans jour ; il est placé au 15 juin pour le tri de la chronologie.
- **CR-01** : elle a été approuvée par le « comité de projet ». Le corpus ne contient pas d'avenant au contrat ; nous la considérons comme l'approbation écrite prévue au contrat.
- **PDF** : le surlignage se fait dans le texte extrait de la page, pas directement sur l'image de la page.
- **Mises à jour saisies dans le navigateur** (démo et dossier vierge) : elles restent dans ce navigateur (stockage local), y compris sur la version en ligne : les autres visiteurs ne les voient pas. Pour les publier, rendez-les permanentes (section 6D) puis redéployez (section 10).
- **Testé** : Chromium, hors connexion et sur la version en ligne, sur grand écran (1366 et 1440 px) et en largeur téléphone (390 px) ; le guide d'accueil sur 8 tailles d'écran. **Non testé** : Firefox, Safari, Edge réel, vrai téléphone, lecteurs d'écran, impression sur papier.

## 9. Données et git

La règle du dépôt interdit de committer les données des défis Loto-Québec. Par prudence, `corpus/` (documents bruts) et `dist/` (rendu, qui embarque le corpus) sont exclus de git (`.gitignore`). Le code, nos données (`donnees/`) et la documentation sont versionnés. Le README du kit indique que toutes les données NOVA sont fictives. Si l'équipe confirme que ce défi n'est pas visé par la règle, il suffit de retirer ces deux lignes du `.gitignore`.

## 10. Mettre en ligne (Vercel)

Depuis le dossier `projet360`, avec un jeton Vercel (Vercel → Account Settings → Tokens) :

```
VERCEL_TOKEN=votre_jeton node outils/deployer.mjs                 # macOS / Linux
$env:VERCEL_TOKEN="votre_jeton"; node outils/deployer.mjs         # Windows PowerShell
```

Le script reconstruit le rendu, l'envoie et affiche l'adresse ; l'adresse de production reste https://nova-projet360.vercel.app. Le jeton n'est jamais enregistré : ne l'écrivez dans aucun fichier du dépôt.

Pour tester la version en ligne dans un navigateur : `node outils/tester_navigateur.mjs --url https://nova-projet360.vercel.app/`.

## 11. Vidéo de présentation

Le spot en motion design (environ 64 s : la douleur, puis NOVA, ses interfaces et l'assistant) est fabriqué par le code du dossier `video/` à la racine du dépôt (le projet Remotion de l'équipe) : brief et texte de la voix dans `video/brief/PROMPT.md`, commandes dans `video/README.md`. Formats 16:9 et 9:16, 60 images par seconde, son masterisé à −14 LUFS. Les vidéos rendues, les pistes audio et les captures ne sont pas versionnées.
