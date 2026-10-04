# Les 7 défis : tableau de décision

Concurrence, « vendeur » et risque sont des **estimations de jugement**, pas des données : à valider avec ce que les autres équipes disent.

| Défi | Résumé | Livrable clé / barème | Données & contraintes | Difficulté 24h | Concurrence (est.) | Vendeur en motion design | Histoire perso possible |
|---|---|---|---|---|---|---|---|
| **OptiFrame** (SN-SF) | Photo d'un verre recyclé → mesure au mm → monture STL imprimable en 3D (web app mobile) | 30 pts précision (≤1 mm), 15 IA, 15 web app, 10 monture, 10 démo | Aucune donnée fournie, 2 verres du jury. Hébergement HTTPS + QR code. Aucune contrainte de confidentialité | Moyenne-élevée (paliers 1+3 suffisent pour une bonne note) | **Faible** (matériel + vision + 3D) | **Très élevé** : démo en direct sur téléphone, QR code, aperçu 3D, impression | Santé : parents chirurgiens. Suite réelle : INOVA oct. 2026, SN-SF nov. 2026 |
| **DayOne** | Agent WhatsApp hors ligne : photo d'un registre maternel papier → dossier structuré vérifié par la sage-femme | 30 pts extraction (FR/AR/EN), 20 incertitude, 20 flux, 15 hors ligne, 10 liaison | Données synthétiques (129 images + CSV). Aucune donnée réelle vers un tiers | Élevée | **Faible** (gros périmètre) | **Très élevé** : chat WhatsApp animé, champs qui passent de « À_RÉVISER » à « VALIDÉ » | Santé : parents chirurgiens, milieu hospitalier |
| **JADCO – Clés en main** | Estimer la hausse de loyer 2026 (effet de mix, unité constante, concessions, backtest) | Notebook `estimate_2026()` + `backtest()`, présentation au jury | CRM confidentiel : pas de GitHub, pas dans les livrables. IA autorisée si citée | Moyenne | Moyenne | Élevé : graphiques animés (« la hausse de 10,8 % en 2023 n'a pas eu lieu ») | **Immo : la maison en ruine en Bretagne de ta mère** |
| **ÉquiAlgo** | Diagnostiquer et corriger le biais d'un modèle de bourses (région) | 35 pts auto (équité 20, utilité 15), 25 diagnostic, 25 gouvernance, 15 pitch | Synthétique, aucune contrainte. `predictions.csv` + `presentation.pdf` obligatoires. Taux d'octroi 36-44 % | Faible | **Élevée** (sujet populaire et accessible) | Moyen-élevé : front de Pareto animé, avant/après de l'écart 48,4 % vs 27,3 % | Étudiants eux-mêmes concernés par le financement |
| **Projet 360** | Mémoire de projet fiable à partir d'emails, comptes rendus, factures ; questions en langage naturel avec sources ; **événement surprise en direct** | Critère : compréhension du problème et solution utile (pas la techno) | Libre | Moyenne | **Élevée** (technologie libre, RAG familier) | Moyen : timeline et graphe de décisions, mais démo avant tout en direct | Équipe qui reprend un projet en cours (à inventer sans mentir) |
| **CorroborIA** (Loto-Québec) | Comparer RH et Temps, distinguer écart justifié et vraie erreur, expliquer | 35 exactitude, 25 pertinence de l'IA, 20 explicabilité, 20 qualité | Données confidentielles : pas d'IA externe, modèle local seulement | Moyenne | Moyenne | Moyen : tableau de verdicts avec règle ou IA, surtout du texte | Peu d'angle perso |
| **Plans/dessins d'atelier** | Comparer plans d'armature et dessins d'atelier, rapport PDF par feuillet | Rapport PDF, JSON conforme au schéma | Confidentiel : **aucun cloud ni API d'IA externe**, données à supprimer | Très élevée | **Très faible** | Moyen (plans, annotations) | Aucun |

## Recommandation

1. **OptiFrame** : peu de concurrence, démo la plus spectaculaire, suite réelle après le hackathon. Viser les paliers 1 et 3, puis l'IA (palier 2) si le temps le permet.
2. **JADCO** : l'histoire immo est directement crédible, et les graphiques se prêtent bien à l'animation.
3. **ÉquiAlgo** : filet de sécurité. Faisable en quelques heures par une personne, avec 35 pts notés automatiquement.

Alternative à OptiFrame : **DayOne** si quelqu'un est à l'aise avec la vision et l'écriture manuscrite. C'est le meilleur fit avec « parents chirurgiens », mais le plus gros périmètre.
À laisser de côté : plans/dessins d'atelier, CorroborIA, Projet 360 (sauf si tu veux un 4e projet léger).

## Structure de chaque vidéo : Trust + Results

**Trust (≈ 25 %, 20-30 s)** : *qui nous sommes, notre why.*
- Une photo ancienne, traitée en grain/sépia, qui s'anime (léger zoom, parallaxe) puis « se fond » dans l'interface moderne : le passé devient le produit.
- Une phrase : « Mes deux parents sont chirurgiens, j'ai grandi dans ce milieu. »

**Results (≈ 75 %)** : *fonctionnalités détaillées avec exemples chiffrés.*
- Chaque fonction montre un vrai chiffre ou un vrai écran, jamais d'interface inventée (règle du skill `motion-graphics`).
- Un clip de 4 à 8 s par fonction, qui finit sur un plan fixe.

| Projet | Trust (photo + histoire) | Results (exemples à montrer) |
|---|---|---|
| OptiFrame | Photo d'enfance en hôpital ou avec les parents, puis fondu vers un téléphone qui scanne un verre | Le QR code, la photo du verre redressée, le contour en mm vs le pied à coulisse (erreur), la monture 3D qui tourne, le fichier STL |
| DayOne | Photo ancienne des parents en salle ou en blouse, puis fondu vers un registre papier | Une page photographiée → champs extraits avec statut et confiance → la sage-femme confirme → hors ligne puis synchronisation |
| JADCO | Photo de la ruine bretonne avant, puis la maison rénovée | La médiane annuelle qui « ment » vs la croissance à unité constante, les concessions, le backtest 2023-2025, l'estimation 2026 |
| ÉquiAlgo | Équipe et rapport personnel au financement étudiant, **seulement si c'est vrai** | L'écart 48,4 % vs 27,3 %, les proxys, le front de Pareto, le taux d'octroi dans la plage |

## À vérifier

- **Photos de famille** : accord des personnes, et rien d'identifiable sur un patient ou un dossier.
- **Les histoires doivent rester vraies et ne pas être exagérées**, surtout pour des jurys qui connaissent le milieu.
- **Ne jamais dire ni afficher de données confidentielles** de JADCO, Loto-Québec ou des plans dans la vidéo.
