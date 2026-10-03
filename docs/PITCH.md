# Pitch : Boussole (nom provisoire)

> **« L'IA guide, l'humain décide. »**
> Un copilote pour les soignants qui accueillent une victime d'agression sexuelle. Il structure le dossier, rappelle les délais de prélèvement et protège la preuve, sans jamais juger la victime.

Défi : Propolys, *Startup Challenge : Sécurité & IA*. Livrable : pitch de 3 min avec au plus 3 diapositives. Critères : idée claire et originale, lien avec la sécurité, potentiel entrepreneurial, qualité du pitch.

---

## 1. La douleur : ce que vit la victime aujourd'hui

**Le personnage ci-dessous est fictif. Il faut le présenter comme tel dans le pitch.** Il illustre des faits documentés, référencés plus bas.

> Léa, 22 ans. Il est 3 h du matin. Elle s'est réveillée chez quelqu'un qu'elle connaît à peine, avec un trou de deux heures dans sa soirée. Elle arrive seule à l'urgence.
> On lui demande de ne pas boire, de ne pas aller aux toilettes, d'attendre. Elle raconte son histoire une première fois au triage, une deuxième fois à l'infirmière, une troisième au médecin, une quatrième à l'intervenante. À chaque fois, on lui demande l'heure exacte. Elle ne s'en souvient pas, et elle a peur qu'on ne la croie pas.
> Elle ne sait pas encore si elle veut porter plainte. Personne ne lui a dit que l'analyse de sang ne détecte plus la plupart des drogues après 24 h, alors que l'urine garde une trace jusqu'à 5 jours.

**Ce que disent les faits :**
- **Seulement 6 % des agressions sexuelles sont signalées à la police au Canada**, contre 36 % des voies de fait (StatCan, ESG 2019).
- **Sur 1 000 agressions sexuelles déclarées à la police, 640 n'aboutissent à aucune accusation et seulement 52 se terminent par une peine de prison**. Pour les voies de fait, il y a 499 cas sans accusation sur 1 000 (StatCan, 2015-2019).
- Au Québec, **1 femme sur 4** déclare avoir subi au moins une agression sexuelle depuis l'âge de 15 ans, par une personne autre qu'un partenaire intime (INSPQ, enquête 2018).
- **75 % des victimes présentent un trouble de stress post-traumatique un mois après l'agression, et 41 % encore après un an** (Dworkin et al., méta-analyse 2021).
- **Les fenêtres de preuve sont courtes et strictes :**
  - trousse médicolégale : ≤ 5 jours au Québec (révision en cours pour aller jusqu'à 7 jours) ;
  - prélèvements cutanés : ≤ 2 jours ;
  - toxicologie : sang < 24 h, urine ≤ 120 h (norme ANSI/ASB 121).
  Une heure perdue peut effacer une preuve.
- **Le parcours est fragile.** En 2020, une victime francophone a dû passer par **trois hôpitaux de Montréal** avant d'obtenir une trousse, à cause d'un protocole d'orientation linguistique qui datait des années 1970.
- **Les victimes décrivent l'urgence comme un lieu de retraumatisation.** Elles attendent parfois des heures, sans manger ni boire, et doivent répéter leur récit. Certaines parlent d'un « second viol » (littérature sur les infirmières SANE).

**Le problème en une phrase :** au moment le plus critique, le soignant doit à la fois **soutenir** une personne en détresse, **respecter des délais médico-légaux stricts** et **produire un dossier irréprochable pour un tribunal**. Il fait tout cela de mémoire, sur papier, souvent de nuit.

---

## 2. Notre lien avec la santé et le sujet

À dire **seulement si c'est vrai** (voir `docs/PROJETS.md`, section « À vérifier ») :
- « Mes deux parents sont chirurgiens. J'ai grandi en entendant parler de l'urgence la nuit, des dossiers incomplets et des minutes qui comptent. »
- Pourquoi ce sujet : la sécurité, ce n'est pas seulement les réseaux. C'est aussi **la sécurité d'une personne, et celle de la preuve qui lui permettra d'être entendue**.

**Interdits :** inventer un témoignage, prétendre connaître une victime ou exagérer. Un jury qui connaît le milieu le détecte immédiatement.

---

## 3. Se mettre dans la peau de la victime : ce qui change pour Léa

| Aujourd'hui | Avec Boussole |
|---|---|
| Elle raconte son histoire 4 fois | **Un seul entretien guidé**, partagé par l'équipe, avec son accord |
| On lui demande « l'heure exacte » | Les trous de mémoire sont notés **sans jugement** : « information non disponible, fréquent après un traumatisme ou une substance » |
| Elle signe un formulaire global | **Consentement étape par étape** : examen, chaque prélèvement, conservation, transmission. Elle peut dire non à une étape sans tout refuser |
| Elle ne sait pas si elle veut porter plainte | **Elle peut décider plus tard.** Le dossier et la chaîne de conservation sont prêts si elle le souhaite. Rien n'est transmis à la police sans son accord explicite |
| Elle sent que le système doute d'elle | L'outil **ne note jamais sa crédibilité**. L'IA ne parle que du *dossier* (preuves, délais, documents), jamais de *sa parole* |
| Elle est seule avec sa détresse | Chaque écran rappelle au soignant les ressources : intervenante psychosociale du centre désigné, CAVAC, CALACS. Le soignant, libéré de la paperasse, **regarde la victime au lieu de son formulaire** |

**Phrase clé du pitch :** « On ne remplace pas l'humain auprès de Léa. On lui rend le temps de l'être. »

---

## 4. Utilisation concrète (le soignant, minute par minute)

1. **Arrivée (0-5 min).** Un bandeau de consentement s'affiche. L'infirmière explique chaque étape. La victime accepte ou refuse chaque élément séparément, et le journal horodate chaque choix.
2. **Questions guidées (5-15 min).** L'outil demande d'abord combien de temps s'est écoulé depuis les faits, puis adapte les questions : symptômes, substance soupçonnée, douche ou vêtements changés, besoin d'un interprète.
3. **Checklist priorisée (immédiate).** C'est un **moteur de règles, sans IA**. Exemple : « 30 h écoulées : toxicologie sanguine probablement inutile, **urine urgente, encore 90 h**. Prophylaxie VIH : **42 h restantes**. Contraception d'urgence : 90 h. » Les délais sont un prototype, à valider par un comité médical.
4. **Chronologie (IA).** Le soignant colle ses notes libres : récit de la victime, note de l'ambulancier, triage. L'IA en tire une chronologie où **chaque événement cite la phrase source**. Elle signale :
   - **les trous** (« 23 h 10 – 1 h 30 : aucune information ») ;
   - **les incohérences du dossier** (« prélèvement noté à 4 h 05, mais arrivée à 4 h 20 »).

   Le soignant **valide ou rejette chaque ligne**.
5. **Export.** Le dossier sort en PDF avec un **journal de chaîne de conservation infalsifiable** : qui a fait quoi, quand, avec quel consentement. Toute modification ultérieure est détectable.

---

## 5. La technologie (et pourquoi elle est solide)

| Brique | Choix | Pourquoi c'est défendable |
|---|---|---|
| Délais et checklist | **Moteur de règles déterministe**, sans IA | Une décision médicale doit être traçable et vérifiable. Les règles sont écrites et validées par des médecins, puis versionnées |
| Chronologie et signalements | **Grand modèle de langage (Claude, Anthropic)**, sortie JSON contrainte par un schéma | L'IA *structure* du texte libre ; elle ne crée aucun fait. Chaque événement pointe vers sa phrase source, sinon il est rejeté |
| Garde-fous IA | Prompt système restrictif et validation humaine obligatoire | L'IA ne désigne aucun coupable, ne juge pas la crédibilité, ne fait aucune reconnaissance faciale et ne pose aucun diagnostic |
| Chaîne de conservation | **Journal en ajout seul, chaque entrée chaînée par SHA-256** à la précédente | Même principe que git ou une blockchain, sans la blockchain. Une seule modification casse la chaîne, et c'est visible |
| Données | Minimisation, consentement granulaire, chiffrement, aucun entraînement sur les données | Conçu pour la Loi 25 (Québec). En production : hébergement au Canada et dé-identification avant l'appel au modèle, **à valider** |

**Ce que fait le prototype aujourd'hui** (démo de 60 s, données 100 % fictives) : dossier guidé, checklist par règles, chronologie par Claude avec trous et incohérences, export avec journal chaîné. **Ce qu'il ne fait pas encore** : intégration au dossier médical de l'hôpital, signature électronique qualifiée, validation clinique.

---

## 6. À qui on vend

**On ne vend pas à la police.** C'est un choix de confiance : l'outil appartient au soin, et c'est la victime qui décide de la transmission. La police et le DPCP *reçoivent* un dossier propre ; ils ne pilotent pas l'outil.

| | Qui | Rôle |
|---|---|---|
| **Payeur** | Établissements de santé (CISSS et CIUSSS) qui hébergent les **centres désignés** pour victimes d'agression sexuelle (réseau 24 h/24 dans toutes les régions du Québec). Financement possible par le MSSS | Licence SaaS annuelle par centre, plus formation |
| **Utilisateurs** | Infirmières, médecins et intervenantes psychosociales des équipes médicosociales | Gagnent du temps, se sentent plus sûrs, moins de dossiers rejetés |
| **Bénéficiaires** | Victimes | Gratuit pour elles, toujours |
| **Partenaires** | CAVAC, CALACS, Laboratoire de sciences judiciaires et de médecine légale (LSJML) | Validation, distribution, crédibilité |
| **Expansion** | Reste du Canada (centres hospitaliers spécialisés, programmes d'infirmières SANE), campus universitaires, puis la francophonie (unités médico-judiciaires en France) | Même problème, protocoles locaux = nouveaux jeux de règles |

**Modèle de revenus (hypothèses à valider, à présenter comme telles) :**
- licence par centre et par an, d'ordre de grandeur quelques milliers de dollars ;
- frais de mise en place et de formation ;
- module de règles par juridiction (chaque province ou pays a son protocole).

**Mise en marché :** un pilote dans 1 ou 2 centres désignés, financé par une subvention (fonds d'aide aux victimes, Mitacs, Propolys). On mesure le temps de prise en charge, la complétude des dossiers et la satisfaction des victimes. Ensuite, appel d'offres régional.

**Pourquoi maintenant :**
- le rapport *Rebâtir la confiance* (2020, **190 recommandations**) ;
- la loi créant le **tribunal spécialisé en violence sexuelle et conjugale**, adoptée à l'unanimité en 2021.

Le Québec investit dans l'accompagnement des victimes, et la qualité du dossier en amont du tribunal devient un enjeu explicite.

---

## 7. Projection : à quoi ressemble le succès

- **Pour la victime :** un seul récit, des choix respectés, la possibilité de décider plus tard, et la conviction qu'on l'a crue.
- **Pour le soignant :** il ne rate plus un délai, il ne lutte plus avec un formulaire à 4 h du matin, et ses dossiers tiennent devant un juge.
- **Pour la justice :** moins de preuves perdues ou contestées sur la forme, des dossiers comparables d'un hôpital à l'autre.
- **Indicateurs de pilote** (à mesurer, pas à promettre) :
  - nombre de récits répétés par victime ;
  - prélèvements faits dans les délais ;
  - dossiers incomplets ;
  - temps administratif du soignant.

---

## 8. Questions difficiles du jury et réponses

| Question | Réponse |
|---|---|
| « Et si l'IA hallucine ? » | Elle ne produit aucun fait : chaque ligne cite sa source, et le soignant valide chaque ligne. Les délais ne viennent pas de l'IA mais de règles écrites |
| « Signaler des incohérences, ça ne risque pas de nuire à la victime devant un tribunal ? » | **Oui, c'est le vrai risque, et c'est pour ça qu'on le traite à part.** L'IA signale les incohérences *du dossier* (horaires de prélèvement, signatures manquantes), jamais celles de *la mémoire de la victime*. Les trous de mémoire sont présentés comme normaux après un traumatisme. Aucun score de crédibilité, jamais |
| « Données ultra-sensibles, pourquoi le cloud ? » | Minimisation, consentement par étape, chiffrement et journal infalsifiable. En production : hébergement au Canada et dé-identification avant l'appel au modèle. Le prototype n'utilise que des données fictives |
| « Pourquoi pas un simple formulaire ? » | Un formulaire ne lit pas les notes libres de 4 intervenants, ne repère pas une plage vide de deux heures et ne recalcule pas les délais en direct. Le formulaire existe déjà ; c'est le temps et l'attention qui manquent |
| « Qui est responsable si un délai est faux ? » | Le protocole de l'établissement. Nos règles sont paramétrées et validées par son comité médical, puis versionnées, et l'outil affiche la version utilisée |
| « Pourquoi ne pas vendre à la police, c'est plus d'argent ? » | Parce que la victime doit pouvoir faire confiance à l'outil. Si la police le contrôle, les victimes ne viendront pas, et 94 % ne signalent déjà pas l'agression |

---

## 9. Pitch de 3 min : déroulé et diapositives

| Temps | Contenu | Diapositive |
|---|---|---|
| 0:00-0:30 | **Accroche** : Léa (personnage fictif) à 3 h du matin, puis « 6 % ». Notre lien avec le milieu de la santé, s'il est vrai | **1. Problème** : « 6 % signalent. Sur 1 000 plaintes, 52 condamnations avec prison. Les preuves ont une date d'expiration. » |
| 0:30-1:30 | **Démo de 60 s** : consentement, questions guidées, checklist qui se réordonne, chronologie IA avec un trou signalé et validé par l'humain, export avec journal vérifié | **2. Solution** : capture de l'application et « L'IA guide, l'humain décide » |
| 1:30-2:30 | **Marché et modèle** : centres désignés, licence SaaS, pilote, expansion. « On ne vend pas à la police. » | **3. Modèle et garde-fous** : qui paie, qui utilise, qui bénéficie, puis 4 garde-fous (consentement, validation humaine, aucune crédibilité notée, journal infalsifiable) |
| 2:30-3:00 | **Clôture** : « On ne remplace pas l'humain auprès de Léa. On lui rend le temps de l'être. » | (retour sur la diapositive 2) |

---

## Sources

- Statistique Canada, [La victimisation criminelle au Canada, 2019](https://www150.statcan.gc.ca/pub/85-002-x/2021001/article/00014-fra.htm)
- Statistique Canada, [Affaires d'agression sexuelle au Canada : de la police aux tribunaux](https://www150.statcan.gc.ca/n1/pub/11-627-m/11-627-m2024051-fra.htm) (2015-2019 ; 6 % signalées ; 640 / 1 000 sans accusation ; 52 / 1 000 avec prison)
- INSPQ, [Ampleur de la violence sexuelle vécue à l'âge adulte](https://www.inspq.qc.ca/violence-sexuelle/statistiques/adultes)
- Dworkin et al., *PTSD in the Year Following Sexual Assault*, Trauma, Violence & Abuse, 2021 ([résumé](https://newsroom.uw.edu/news/75-sexual-assault-survivors-have-ptsd-one-month-later))
- ANSI/ASB Standard 121 (toxicologie DFSA) ([PDF](https://www.aafs.org/sites/default/files/media/documents/121_Std_e1.pdf)) et [SOFT DFSA Fact Sheet](https://www.soft-tox.org/assets/docs/DFSA_Fact_Sheet.pdf)
- CISSS du Bas-Saint-Laurent, formation sur la trousse médicolégale ([2025](https://en.cisssbsl.com/sites/default/files/fichier/formation_trousse_nov_2025_sans_photos_vf.pdf)) : trousse ≤ 5 jours (révision vers 7), prélèvements cutanés ≤ 2 jours
- MSSS, [Orientations / protocole d'intervention médicosociale](https://publications.msss.gouv.qc.ca/msss/fichiers/2011/11-850-01_protocole.pdf)
- Noovo, [Pourquoi une femme francophone s'est vu refuser une trousse médicolégale](https://www.noovo.info/nouvelle/pourquoi-une-femme-francophone-sest-vu-refuser-une-trousse-medicolegale.html)
- Gouvernement du Québec, [Rebâtir la confiance et tribunal spécialisé](https://www.quebec.ca/justice-et-etat-civil/systeme-judiciaire/processus-judiciaire/tribunal-specialise-violence-sexuelle-violence-conjugale/a-propos)
- Eugene Weekly, [A wait too long](https://eugeneweekly.com/2020/02/06/a-wait-too-long/) (attentes et retraumatisation, contexte américain)

**À vérifier avant de citer :**
- le nombre exact de centres désignés au Québec (non trouvé ; demander au MSSS) ;
- la durée de conservation d'une trousse sans plainte (une source évoque 14 jours pour décider, non confirmée) ;
- les fenêtres de prophylaxie VIH (< 72 h) et de contraception d'urgence (≤ 120 h), standards cliniques à confirmer avec un médecin.
