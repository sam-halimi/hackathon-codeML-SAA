# Pitch : Boussole (nom provisoire)

> **« L'IA guide, l'humain décide. »**
> Un copilote pour les soignants qui accueillent une victime d'agression sexuelle. Il structure le dossier, rappelle les délais de prélèvement et protège la preuve, sans jamais juger la victime.

Défi : Propolys, *Startup Challenge : Sécurité & IA* (Polytechnique Montréal). Livrable : pitch oral de 3 min, 3 diapositives au plus. Critères : idée claire et originale, lien avec la sécurité, potentiel entrepreneurial, qualité du pitch.

Fichiers liés : `docs/SLIDES.md` (3 diapos), `docs/VIDEO.md` (clip muet de 40 s), site : https://sam-halimi.github.io/hackathon-codeML-SAA/ (accueil `/`, logiciel `/demo`).

---

## 0. Déroulé en un coup d'œil

| Temps | Bloc | Qui parle | Diapo à l'écran |
|---|---|---|---|
| 0:00–0:25 | 1. L'histoire : Léa (fictive) | Personne 1 | Diapo 1 (titre seul, entonnoir masqué) |
| 0:25–0:50 | 2. Les chiffres : les 4 fuites du dossier | Personne 1 | Diapo 1 (entonnoir révélé) |
| 0:50–1:05 | 3. Nous et le sujet | Personne 2 | Diapo 1 |
| 1:05–2:05 | 4. La technologie + clip démo (40 s, muet) | Personne 3 | Diapo 2 |
| 2:05–2:40 | 5. À qui on vend | Personne 1 | Diapo 3 |
| 2:40–3:00 | 6. Site, QR, demande, clôture | Personne 2 | Diapo 3 (QR) |

Cible : **~440 mots** au total, débit posé (~150 mots/min). Chaque bloc indique son nombre de mots.

---

## 1. Script oral mot à mot

Légende : `[CLIC]` = diapo ou animation suivante. `[PAUSE]` = une seconde de silence. Les chiffres en **gras** se disent lentement.

### Bloc 1 : L'histoire (0:00–0:25) · Personne 1 · ~60 mots

> Imaginez Léa. Elle est fictive, mais tout ce qui lui arrive est documenté.
> Léa a 22 ans. Il est **3 h du matin**. Elle se réveille chez quelqu'un qu'elle connaît à peine, avec **un trou de deux heures** dans sa soirée.
> À l'urgence, elle raconte son histoire **quatre fois**. Chaque fois, on lui demande l'heure exacte. Elle ne s'en souvient pas.
> Et elle ne sait pas encore si elle veut porter plainte. [PAUSE]

*Direction : debout, sans regarder l'écran. Pas de musique, pas d'effet.*

### Bloc 2 : Les 4 fuites du dossier (0:25–0:50) · Personne 1 · ~70 mots

> [CLIC : l'entonnoir apparaît] Le dossier de Léa va fuir à quatre endroits.
> [CLIC] **Un : où aller ?** En 2020, une victime a fait **trois hôpitaux** de Montréal avant d'obtenir une trousse.
> [CLIC] **Deux : la première nuit.** La preuve expire. Après **24 heures**, le sang ne révèle plus la plupart des drogues.
> [CLIC] **Trois : la police.** Seulement **6 %** des agressions sont signalées. Sur mille, **640** finissent sans accusation.
> [CLIC] **Quatre : le tribunal.** Près d'**une cause sur trois** dépasse les délais Jordan.
> Le problème n'est pas la parole des victimes. C'est le dossier qui se construit mal, trop tard, au mauvais endroit.

*Direction : un clic par fuite. Le mot « fuite » doit s'allumer en rouge sur la diapo à chaque étape.*

### Bloc 3 : Nous (0:50–1:05) · Personne 2 · ~40 mots

> **[SEULEMENT SI VRAI, une seule phrase, sinon supprimer]** « Mes parents sont chirurgiens : j'ai grandi avec les nuits d'urgence et les dossiers incomplets. » / « [Prénom] a été bénévole en [organisme]. » / « [Prénom] étudie en [domaine], en sécurité des données. »
>
> Au Québec, **une femme sur quatre**. Statistiquement, chacun de nous connaît quelqu'un qui l'a vécu, souvent sans le savoir.
> On est trois étudiants en [génie / informatique], et on a décidé de travailler sur la sécurité qui compte le plus : celle d'une personne, et de sa preuve.

*Règle absolue : aucun témoignage inventé, aucune « amie qui a vécu ça » si ce n'est pas vrai. Le jury le détecte. Si la phrase personnelle est utilisée, garder le reste tel quel (le bloc passe à ~18 s, on rattrape au bloc 5).*

### Bloc 4 : La technologie + démo (1:05–2:05) · Personne 3 · ~150 mots

**Avant le clip (1:05–1:12)**
> [CLIC : diapo 2] On ne répare pas les tribunaux. On répare **la première nuit**, celle où tout commence et où la preuve se perd. Voici Boussole.

**Pendant le clip (1:12–1:52)** · `[CLIC : lancer le clip muet de 40 s]` · parler par-dessus, caler sur les plans :

| Clip | Ce qu'on voit | Ce que dit Personne 3 |
|---|---|---|
| 0–3 s | Carte « 3 h du matin » | « Retour à 3 h du matin. » |
| 3–8 s | Consentement par étape | « Léa consent étape par étape. Elle peut refuser un prélèvement, et décider plus tard pour la plainte. » |
| 8–16 s | Dossier → checklist qui se réordonne | « Trente heures depuis les faits, substance soupçonnée. Un **moteur de règles, pas l'IA**, réordonne tout : peau, encore 18 heures ; VIH, 42 heures ; le sang, c'est trop tard. » |
| 16–26 s | Chronologie IA + « Ce que l'IA voit » | « L'infirmière colle ses notes. Claude, d'Anthropic, en fait une chronologie où chaque ligne cite sa phrase source. Le trou de deux heures est signalé, comme normal après une substance. Et l'IA ne voit jamais son nom. » |
| 26–30 s | Validation humaine | « L'IA est une **secrétaire, jamais un juge**. L'humain valide chaque ligne. » |
| 30–35 s | Export + « Intégrité vérifiée » | « À l'export, chaque entrée est chaînée par SHA-256. Une retouche, et ça se voit. » |
| 35–40 s | Carte de fin | *(silence, laisser lire « L'IA guide, l'humain décide. »)* |

**Après le clip (1:52–2:05)**
> Pas de score de crédibilité, pas de coupable désigné, pas de reconnaissance faciale. Consentement par finalité, révocable. En production : hébergé au Canada, chiffré, évaluation Loi 25, aucun entraînement sur les données. Et **rien ne part vers la police sans la signature de Léa**.

### Bloc 5 : À qui on vend (2:05–2:40) · Personne 1 · ~85 mots

> [CLIC : diapo 3] Qui paie ? Les **établissements de santé**, CISSS et CIUSSS, qui hébergent les centres désignés : **77 centres dans 17 régions**. Un cofinancement est possible par les fonds d'aide aux victimes.
> Notre hypothèse : une licence SaaS par centre et par an, plus la formation et des modules de règles par juridiction.
> La police et le DPCP **reçoivent** le dossier, mais ne l'achètent pas : c'est un choix de confiance. Pour les victimes, c'est **gratuit, toujours**.
> Track-Kit suit la **boîte** de la trousse jusqu'au labo. Nous, on accompagne **la personne et son dossier**, pendant la première nuit.
> Et c'est le moment : 190 recommandations dans *Rebâtir la confiance*, un tribunal spécialisé voté à l'unanimité.

### Bloc 6 : Site, QR, demande (2:40–3:00) · Personne 2 · ~50 mots

> Le prototype est en ligne : scannez le code. [geste vers le QR] Données fictives, réponse d'IA préenregistrée dans la démo publique.
> Ce qu'on cherche : **un centre désigné pour un pilote de trois mois.** On mesurera les récits répétés, les prélèvements dans les délais et le temps administratif.
> [PAUSE] On ne remplace pas l'humain auprès de Léa. **On lui rend le temps de l'être.**

*Direction : dernière phrase lente, regard sur le jury, ne pas dire « merci » tout de suite (2 s de silence).*

### Plan B (si le clip ne démarre pas en 3 s)

Personne 3 passe à la version **3 captures** de la diapo 2 (voir `docs/SLIDES.md`) et dit le même texte en 3 temps : « Consentement et règles » → « Chronologie IA et ce que l'IA voit » → « Export et intégrité vérifiée ». Ne jamais déboguer devant le jury.

---

## 2. Matière de fond (pour les questions et la diapo 3)

### Ce qui change pour Léa

| Aujourd'hui | Avec Boussole |
|---|---|
| Elle raconte son histoire 4 fois | **Un seul entretien guidé**, partagé par l'équipe, avec son accord |
| On lui demande « l'heure exacte » | Les trous de mémoire sont notés **sans jugement** : « information non disponible, fréquent après un traumatisme ou une substance » |
| Elle signe un formulaire global | **Consentement par étape** : examen, chaque prélèvement, conservation, transmission. Elle peut refuser une étape sans tout refuser |
| Elle ne sait pas si elle veut porter plainte | **Elle peut décider plus tard.** Le dossier et la chaîne de conservation sont prêts. Rien n'est transmis sans son accord signé |
| Elle sent que le système doute d'elle | Aucun score de crédibilité. L'IA parle du **dossier** (preuves, délais, documents), jamais de **sa parole** |
| Elle est seule | Rappel des ressources : intervenante du centre désigné, CAVAC, CALACS. Le soignant regarde la victime au lieu du formulaire |

### Le soignant, minute par minute

1. **Arrivée (0-5 min)** : consentement granulaire, chaque choix horodaté dans le journal.
2. **Dossier guidé (5-15 min)** : délai depuis les faits, symptômes, substance soupçonnée, douche ou vêtements changés, interprète.
3. **Checklist (immédiate)** : moteur de règles sans IA, comptes à rebours, mention « délais prototype, à valider par sources médicales ».
4. **Chronologie (IA)** : notes libres → événements avec phrase source, trous et incohérences **du dossier** (ex. prélèvement à 4 h 05, arrivée à 4 h 20). Validation ligne par ligne.
5. **Export** : résumé + journal de chaîne de conservation en ajout seul, chaîné SHA-256, badge d'intégrité.

### Les trois couches (Règles / IA / Humain)

| Couche | Fait quoi | Pourquoi c'est défendable |
|---|---|---|
| **Règles** (déterministe) | Délais, priorités, comptes à rebours | Une décision médicale doit être traçable. Règles écrites et validées par des médecins, versionnées |
| **IA** (Claude, Anthropic) | Structure les notes libres en chronologie, signale trous et incohérences du dossier | Sortie JSON contrainte par schéma ; chaque événement pointe vers sa phrase source, sinon rejeté. Données pseudonymisées avant envoi (nom → [VICTIME], date de naissance → [DATE], adresse → [LIEU]), visibles dans le panneau « Ce que l'IA voit » |
| **Humain** | Valide ou rejette chaque ligne, signe chaque transmission | L'IA est une secrétaire, jamais un juge |
| **Preuve** | Journal en ajout seul chaîné par SHA-256 | Même principe que git, sans blockchain. Une modification casse la chaîne et le badge passe au rouge |
| **Données** | Minimisation, consentement par finalité révocable, pas d'entraînement | Conçu pour la Loi 25 : EFVP, hébergement au Canada et chiffrement en production (à réaliser) |

**Le prototype fait** : consentement, dossier guidé, checklist par règles, chronologie par Claude avec trous et incohérences, pseudonymisation visible, export avec journal chaîné. **Il ne fait pas encore** : intégration au dossier médical de l'hôpital, signature électronique qualifiée, validation clinique.

### Marché et modèle

| | Qui | Rôle |
|---|---|---|
| **Payeur** | Établissements de santé (CISSS/CIUSSS) hébergeant les centres désignés (77 centres, 17 régions selon une étude de 2011) | Licence SaaS annuelle par centre |
| **Cofinanceur possible** | Ministère de la Justice, fonds d'aide aux victimes (FAVAC) | Subvention de pilote, déploiement |
| **Utilisateurs** | Infirmières, médecins, intervenantes | Moins de paperasse, moins de délais ratés |
| **Bénéficiaires** | Victimes | Gratuit, toujours |
| **Destinataires (non payeurs)** | Police, DPCP | Reçoivent un dossier propre, uniquement avec l'accord de la victime |
| **Partenaires** | CAVAC, CALACS, LSJML | Validation, distribution, crédibilité |

**Revenus (hypothèses, à présenter comme telles)** : licence par centre par an ; frais de mise en place et formation ; module de règles par juridiction.

**Mise en marché** : pilote de 3 mois dans 1 ou 2 centres désignés, financé par subvention (Mitacs, Propolys, fonds d'aide aux victimes). Indicateurs (à mesurer, pas à promettre) : récits répétés par victime, prélèvements dans les délais, dossiers incomplets, temps administratif du soignant.

**Expansion** : reste du Canada (programmes SANE), campus universitaires, France (unités médico-judiciaires, UMJ).

**Concurrence** : Track-Kit (STACS DNA, 7 États américains) suit la **boîte** de la trousse jusqu'au laboratoire. Boussole accompagne **la personne et le dossier** pendant la première nuit. Complémentaires, pas concurrents directs.

**Pourquoi maintenant** : rapport *Rebâtir la confiance* (2020, 190 recommandations) ; loi créant le tribunal spécialisé en violence sexuelle et conjugale, adoptée à l'unanimité en 2021.

---

## 3. Questions difficiles du jury

| Question | Réponse |
|---|---|
| « Et si l'IA hallucine ? » | Elle ne produit aucun fait : chaque ligne cite sa phrase source, sinon elle est rejetée, et le soignant valide chaque ligne. Les délais ne viennent pas de l'IA mais de règles écrites |
| « Signaler des incohérences, ça ne risque pas de nuire à la victime devant un tribunal ? » | **C'est le vrai risque, donc on le traite à part.** L'IA signale les incohérences *du dossier* (horaires de prélèvement, signatures manquantes), jamais celles de *la mémoire de la victime*. Les trous de mémoire sont présentés comme normaux après un traumatisme ou une substance. Aucun score de crédibilité, jamais |
| « Données ultra-sensibles, pourquoi le cloud ? » | Pseudonymisation avant l'appel au modèle (visible à l'écran), minimisation, consentement par finalité, journal infalsifiable. En production : hébergement au Canada, chiffrement, EFVP Loi 25, aucun entraînement. Le prototype n'utilise que des données fictives |
| « Pourquoi pas un simple formulaire ? » | Un formulaire ne lit pas les notes libres de 4 intervenants, ne repère pas une plage vide de deux heures et ne recalcule pas les délais en direct. Le formulaire existe déjà ; c'est le temps et l'attention qui manquent |
| « Qui est responsable si un délai est faux ? » | Le protocole de l'établissement. Nos règles sont paramétrées et validées par son comité médical, versionnées, et l'outil affiche la version utilisée. Aujourd'hui : délais prototype, affichés comme tels |
| « Pourquoi ne pas vendre à la police ? » | Parce que la victime doit faire confiance à l'outil. Si la police le contrôle, les victimes ne viendront pas, et 94 % ne signalent déjà pas l'agression |
| « Votre démo appelle-t-elle vraiment l'IA ? » | En local, oui (Claude). La démo publique utilise une réponse préenregistrée, clairement étiquetée, pour ne jamais envoyer de données à un modèle depuis un site public |
| « Combien ça coûte ? » | Hypothèse : licence annuelle par centre, plus mise en place. On fixera le prix avec le pilote ; on ne l'invente pas aujourd'hui |
| « Vous réparez la justice ? » | Non. On ne répare pas les tribunaux. On répare la première nuit, là où la preuve se perd |

---

## Sources

- Statistique Canada, [La victimisation criminelle au Canada, 2019](https://www150.statcan.gc.ca/pub/85-002-x/2021001/article/00014-fra.htm) (6 % signalées vs 36 % voies de fait)
- Statistique Canada, [Affaires d'agression sexuelle au Canada : de la police aux tribunaux](https://www150.statcan.gc.ca/n1/pub/11-627-m/11-627-m2024051-fra.htm) (2015-2019 ; sur 1 000 : 640 sans accusation, 52 avec prison ; voies de fait : 499 sans accusation)
- The Globe and Mail, enquête *Unfounded* (2017) : 19 % des plaintes classées « non fondées », environ deux fois plus que pour les voies de fait (9 %)
- Bureau de l'ombudsman fédéral des victimes d'actes criminels, causes d'agression sexuelle et arrêt *R. c. Jordan* : dépassement des plafonds 15,1 % (2016-17) → 30,4 % (2022-23) ; 1 sur 7 arrêtée ou retirée pour délais en 2022-23
- INSPQ, [Ampleur de la violence sexuelle vécue à l'âge adulte](https://www.inspq.qc.ca/violence-sexuelle/statistiques/adultes) (1 femme sur 4 depuis 15 ans, hors partenaire intime, 2018)
- Dworkin et al., *PTSD in the Year Following Sexual Assault*, Trauma, Violence & Abuse, 2021 ([résumé](https://newsroom.uw.edu/news/75-sexual-assault-survivors-have-ptsd-one-month-later)) (75 % à 1 mois, 41 % à 1 an)
- ANSI/ASB Standard 121 ([PDF](https://www.aafs.org/sites/default/files/media/documents/121_Std_e1.pdf)) et [SOFT DFSA Fact Sheet](https://www.soft-tox.org/assets/docs/DFSA_Fact_Sheet.pdf) (sang < 24 h, urine ≤ 120 h)
- CISSS du Bas-Saint-Laurent, formation trousse médicolégale ([2025](https://en.cisssbsl.com/sites/default/files/fichier/formation_trousse_nov_2025_sans_photos_vf.pdf)) (trousse ≤ 5 jours, révision vers 7 ; cutané ≤ 2 jours)
- MSSS, [Protocole d'intervention médicosociale](https://publications.msss.gouv.qc.ca/msss/fichiers/2011/11-850-01_protocole.pdf)
- Noovo, [Pourquoi une femme francophone s'est vu refuser une trousse médicolégale](https://www.noovo.info/nouvelle/pourquoi-une-femme-francophone-sest-vu-refuser-une-trousse-medicolegale.html) (3 hôpitaux, 2020)
- Gouvernement du Québec, [Rebâtir la confiance et tribunal spécialisé](https://www.quebec.ca/justice-et-etat-civil/systeme-judiciaire/processus-judiciaire/tribunal-specialise-violence-sexuelle-violence-conjugale/a-propos)
- STACS DNA, Track-Kit (suivi des trousses, 7 États américains)
- Eugene Weekly, [A wait too long](https://eugeneweekly.com/2020/02/06/a-wait-too-long/) (attentes et retraumatisation, contexte américain)

## À vérifier avant le pitch

- [ ] **77 centres désignés, 17 régions** : chiffre d'une étude de 2011. Dire « selon une étude de 2011 » si la question vient, ou confirmer le chiffre actuel auprès du MSSS.
- [ ] **Délais Jordan** : « près d'une sur trois » = 30,4 % (2022-23). Garder le lien exact vers le rapport de l'ombudsman fédéral.
- [ ] **Globe and Mail 19 %** : données 2010-2014, pratique policière modifiée depuis. Ne pas le dire à l'oral ; garder pour les questions.
- [ ] **PPE VIH < 72 h, contraception d'urgence ≤ 120 h** : standards cliniques à confirmer avec un médecin (affichés « prototype » dans l'app).
- [ ] **Durée de conservation d'une trousse sans plainte** (une source évoque 14 jours pour décider) : non confirmé, ne pas citer.
- [ ] **Track-Kit, 7 États** : vérifier le nombre à jour sur le site de STACS DNA.
- [ ] **Phrase personnelle du bloc 3** : chaque membre valide que sa phrase est vraie, sinon on la supprime.
- [ ] **Narration du clip** : les comptes à rebours dits à l'oral (peau 18 h, VIH 42 h, sang dépassé) doivent correspondre exactement à l'écran enregistré.
- [ ] **QR code** (`docs/assets/qr-boussole.png`) : scanner avec 2 téléphones depuis le fond de la salle.
- [ ] **Chronomètre** : 3 répétitions complètes, viser 2:50.
