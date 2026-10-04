/* Assistant NOVA : il répond avec les preuves et met le dossier à jour, comme un connecteur
   qu'on piloterait en langage naturel. Vue fractionnée : un tiers de la largeur, à droite.

   Deux moteurs :
   - local (par défaut) : compréhension par règles, sans connexion ni clé, déterministe ;
   - Claude (facultatif) : l'utilisateur fournit sa clé API ; Claude propose des mises à jour
     structurées par un outil. Appel HTTP direct : l'application est un fichier HTML autonome,
     sans dépendance ni outil d'assemblage, le SDK ne peut donc pas y être chargé.

   Règle commune : rien n'est appliqué sans confirmation, et chaque mise à jour passe par les
   mêmes garde-fous que le formulaire (une proposition n'est pas une décision, un correctif
   livré n'est pas une validation, un fournisseur ne ferme jamais une condition). */
(function () {
  'use strict';
  const A = window.NOVA_APP;
  const { etat, BASE, C, MODE, $, esc, fmtDate, fmtDateHeure, fmtMontant, badge, badgeEtat, badgeNature, icone, tuile } = A;
  const DEMO = MODE === 'demo';
  const panneau = $('#assistant');
  const fil = $('#assistant-fil');
  const champ = $('#assistant-champ');
  const zoneSuggestions = $('#assistant-suggestions');
  const N = (s) => C.sansAccents(String(s || '').toLowerCase()).replace(/[’‘`´]/g, "'");
  const pad = (n) => String(n).padStart(2, '0');

  // ===================================================================
  // Conversation
  // ===================================================================

  const conv = {
    messages: [],        // { de: 'moi' | 'ia', html, id }
    propositions: {},    // id -> { ev, statut, exemple }
    attente: null,       // question de précision en cours
    exempleSuivant: false,
    preuves: [],         // preuves citées dans le fil (indices stables)
    occupe: false,
    // Connecteur Claude : historique en ajout seul, état déjà transmis, résultats d'outils en attente (id → texte).
    claude: { historique: [], etatEnvoye: null, outils: {}, etatDansUser: false },
  };
  let compteur = 0;
  const nouvelId = () => 'm' + (++compteur);

  function preuveIA(p, libelle) {
    if (!p || !p.source) return '';
    const i = conv.preuves.push(p) - 1;
    return `<button type="button" class="bouton petit bouton-preuve-ia" data-preuve-ia="${i}" title="Ouvrir la preuve">${icone(A.iconeDoc(p.source))}${esc(libelle || 'Preuve')} <span class="code">${esc(p.source)}</span></button>`;
  }
  const preuvesIA = (liste, max) => (liste || []).filter((p) => p && p.source).slice(-(max || 3)).map((p) => preuveIA(p)).join('');

  function ajouter(de, html, extra) {
    const m = Object.assign({ de, html, id: nouvelId() }, extra || {});
    conv.messages.push(m);
    rendreFil();
    return m;
  }
  const dire = (html, extra) => ajouter('ia', html, extra);

  function rendreFil() {
    fil.innerHTML = conv.messages.map((m) => {
      if (m.de === 'moi') return `<div class="bulle moi"><div class="bulle-texte">${esc(m.texte).replace(/\n/g, '<br>')}</div></div>`;
      if (m.attente) return `<div class="bulle ia"><span class="avatar-ia" aria-hidden="true">${icone('sparkles')}</span><div class="bulle-texte frappe" aria-label="L'assistant écrit"><span></span><span></span><span></span></div></div>`;
      const html = m.proposition ? carteProposition(m.proposition) : m.html;
      return `<div class="bulle ia"><span class="avatar-ia" aria-hidden="true">${icone('sparkles')}</span><div class="bulle-texte">${html}</div></div>`;
    }).join('');
    A.typographier(fil);
    fil.scrollTop = fil.scrollHeight;
  }

  // ===================================================================
  // Outils de lecture du texte (français)
  // ===================================================================

  const MOIS = { janvier: 1, fevrier: 2, mars: 3, avril: 4, mai: 5, juin: 6, juillet: 7, aout: 8, septembre: 9, octobre: 10, novembre: 11, decembre: 12 };
  function anneePourMois(mois) {
    if (DEMO) return 2026; // la démo vit en 2026 (situation au 30 septembre)
    const auj = new Date();
    return mois < auj.getMonth() + 1 - 2 ? auj.getFullYear() + 1 : auj.getFullYear();
  }
  function extraireDates(texte) {
    const t = N(texte);
    const res = [];
    for (const m of t.matchAll(/\b(1er|\d{1,2})\s+(janvier|fevrier|mars|avril|mai|juin|juillet|aout|septembre|octobre|novembre|decembre)(?:\s+(20\d{2}))?/g)) {
      const j = m[1] === '1er' ? 1 : +m[1];
      const mo = MOIS[m[2]];
      if (j < 1 || j > 31) continue;
      res.push({ iso: `${m[3] ? +m[3] : anneePourMois(mo)}-${pad(mo)}-${pad(j)}`, index: m.index, brut: m[0] });
    }
    for (const m of t.matchAll(/\b(20\d{2})-(\d{2})-(\d{2})\b/g)) res.push({ iso: m[0], index: m.index, brut: m[0] });
    for (const m of t.matchAll(/\b(\d{1,2})\/(\d{1,2})(?:\/(\d{2,4}))?\b/g)) {
      const j = +m[1], mo = +m[2];
      if (j > 31 || mo > 12 || !j || !mo) continue;
      const an = m[3] ? (m[3].length === 2 ? 2000 + +m[3] : +m[3]) : anneePourMois(mo);
      res.push({ iso: `${an}-${pad(mo)}-${pad(j)}`, index: m.index, brut: m[0] });
    }
    return res.sort((a, b) => a.index - b.index);
  }
  function extraireHeure(texte) {
    const m = N(texte).match(/\b([01]?\d|2[0-3])\s*(?:h|:)\s*([0-5]\d)?\b/);
    return m ? `${pad(+m[1])}:${m[2] || '00'}` : null;
  }
  function extraireMontant(texte) {
    const m = String(texte).match(/(\d{1,3}(?:[\s  .]\d{3})+|\d+(?:[.,]\d+)?)\s*(k|m|millions?|milliers?)?\s*(?:\$|€|dollars?|euros?)/i);
    if (!m) return null;
    let n = parseFloat(m[1].replace(/[\s  .]/g, '').replace(',', '.'));
    const u = (m[2] || '').toLowerCase();
    if (u === 'k' || u.startsWith('millier')) n *= 1000;
    if (u === 'm' || u.startsWith('million')) n *= 1000000;
    return Number.isFinite(n) ? Math.round(n) : null;
  }
  // Découpe en phrases en gardant le texte d'origine (le passage cité doit se retrouver tel quel).
  function phrases(texte) {
    return String(texte).split(/(?<=[.!?…])\s+|\n+/).map((x) => x.trim()).filter((x) => x.length > 1);
  }
  const MOTS_NON_NOMS = new Set('Le La Les Un Une Des De Du Nouvelle Nouveau Condition Courriel Message Compte Rendu Objet Bonjour Merci Projet Comité Équipe Notre Nous Vous Je Il Elle Action Budget Date Lancement Mise Re Re-test Le comité Ce Cette Suite Selon Après Avant Pour Par Sur Dans Validation Correctif'.split(' '));
  function nomsPropres(texte) {
    const res = [];
    for (const m of String(texte).matchAll(/\b(\p{Lu}[\p{Ll}'’-]+(?:[ -]\p{Lu}[\p{Ll}'’-]+){1,2})\b/gu)) {
      const premier = m[1].split(/[ -]/)[0];
      if (MOTS_NON_NOMS.has(premier)) continue;
      res.push({ nom: m[1], index: m.index });
    }
    return res;
  }

  // Personnes connues : annuaire de la démo, plus les noms déjà présents dans le dossier.
  function annuaire() {
    const e = etat.actualise;
    const liste = (BASE.personnes || []).map((p) => ({ nom: p.nom, role: p.role || '' }));
    const ajouterNom = (nom, role) => {
      const propre = String(nom || '').split(/[(,;]/)[0].trim();
      if (propre && /\p{Lu}/u.test(propre) && !liste.some((p) => N(p.nom) === N(propre))) liste.push({ nom: propre, role: role || '' });
    };
    ajouterNom(e.synthese.responsable && e.synthese.responsable.nom, 'Responsable du projet');
    (e.synthese.conditions || []).forEach((c) => ajouterNom(c.responsable, 'Valide la condition ' + c.id));
    e.actions.forEach((a) => ajouterNom(a.responsable, ''));
    return liste;
  }
  function personneDans(texte) {
    const t = N(texte);
    const liste = annuaire();
    let meilleur = null;
    for (const p of liste) {
      const complet = N(p.nom);
      let i = t.indexOf(complet);
      if (i < 0) {
        const prenom = complet.split(' ')[0];
        if (prenom.length > 2) { const m = new RegExp('\\b' + prenom + '\\b').exec(t); if (m) i = m.index + 0.5; }
      }
      if (i >= 0 && (!meilleur || i < meilleur.i)) meilleur = { p, i };
    }
    return meilleur ? meilleur.p : null;
  }
  const estFournisseur = (t, p) => /\b(boreal|fournisseur|prestataire|editeur|integrateur|agence)\b/.test(t) || !!(p && /boreal|fournisseur|prestataire/.test(N(p.role)));
  function autoriteSource(t, p) {
    if (estFournisseur(t, p) && !/\bcomite\b/.test(t)) return 'fournisseur';
    if (/\b(comite|codir|conseil d'administration|direction generale)\b/.test(t) && /(approuv|decid|enterin|valid|arret|acte|fix)/.test(t)) return 'decision';
    if (p && /financ|comptab/.test(N(p.role))) return 'finance';
    if (p && /\b[a-z]{2,5}-\d{2,4}\b/.test(t)) return 'ticket';
    if (p) return 'officielle';
    return 'non_officielle';
  }

  // Conditions : mots qui les désignent (identifiant, tickets, vocabulaire du domaine).
  const SYNONYMES = {
    securite: ['securite', 'audit', 'journal', 'pentest', 'vulnerabilite', 'faille'],
    accessibilite: ['accessibilite', 'clavier', 'focus', 'modale', 'wcag', 'lecteur d\'ecran', 'enregistrer'],
    exploitation: ['runbook', 'rollback', 'retour arriere', 'exploitation', 'go exploitation', 'procedure'],
    performance: ['performance', 'charge', 'lenteur', 'temps de reponse'],
    donnees: ['migration', 'doublon', 'reprise de donnees'],
    formation: ['formation', 'former'],
  };
  function motsCondition(c) {
    const base = N([c.id, c.titre, c.detail, (c.tickets || []).join(' ')].join(' '));
    const mots = [{ m: N(c.id), poids: 4 }];
    (c.tickets || []).forEach((tk) => mots.push({ m: N(tk), poids: 4 }));
    (base.match(/\b[a-z]{2,6}-\d{2,4}\b/g) || []).forEach((tk) => mots.push({ m: tk, poids: 4 }));
    for (const syn of Object.values(SYNONYMES)) if (syn.some((x) => base.includes(x))) syn.forEach((x) => mots.push({ m: x, poids: 1 }));
    N(c.titre).split(/[^a-z0-9-]+/).filter((w) => w.length >= 6).forEach((w) => mots.push({ m: w, poids: 1 }));
    return mots;
  }
  function conditionsDans(texte) {
    const t = N(texte);
    return (etat.actualise.synthese.conditions || []).map((c) => {
      let score = 0;
      for (const { m, poids } of motsCondition(c)) if (new RegExp('(^|[^a-z0-9])' + m.replace(/[.*+?^${}()|[\]\\]/g, '\\$&') + '($|[^a-z0-9])').test(t)) score += poids;
      return { c, score };
    }).filter((x) => x.score >= 2).sort((a, b) => b.score - a.score);
  }

  // État annoncé pour une condition, lu dans la phrase qui la mentionne.
  function etatLu(t) {
    const nonValide = /(pas (encore |toujours )?(valide|accepte|ferme|approuve)|non (valide|accepte)|en attente de (validation|re-?test)|reste ouvert|a re-?tester|a valider)/.test(t);
    if (/(echou|echec|\bko\b|toujours (pas|bloqu|ouvert|present)|regression|rouvert|reouvert|n'est (toujours )?pas corrige|ne fonctionne (toujours )?pas|bloque encore|persiste)/.test(t)) return 'rouvert';
    if (!nonValide && /(re-?test\s*(ok|concluant|reussi|valide)|\bvalide(e|s|es)?\b|\bvalidons\b|\baccepte(e|s|es)?\b|\bj'accepte\b|\bapprouve(e|s|es)?\b|\bferme(e|s|es)?\b|go exploitation|feu vert|condition (remplie|levee))/.test(t)) return 'valide';
    if (/(\blivre(e|s|es)?\b|deploye|\bcorrige(e|s|es)?\b|correctif (est )?(disponible|en ligne|pousse|installe)|fix (livre|deploye)|nouvelle build|mis en (validation|recette))/.test(t)) return 'correctif_livre';
    if (/(annonce|prevu|prochaine build|sera (livre|corrige|pret)|en preparation)/.test(t)) return 'correctif_annonce';
    return null;
  }
  const NATURE_ETAT = { valide: 'validation_obtenue', correctif_livre: 'correctif_livre', rouvert: 'probleme', ouvert: 'probleme', correctif_annonce: 'information' };

  // ===================================================================
  // Moteur local : comprendre une nouvelle information → plan de mise à jour
  // ===================================================================

  function prochainId(prefixe, liste) {
    let n = liste.length + 1;
    const pris = new Set(liste.map((x) => x.id));
    while (pris.has(prefixe + pad(n))) n++;
    return prefixe + pad(n);
  }

  function analyserInformation(texte, forcer) {
    const f = forcer || {};
    const t = N(texte);
    const segs = phrases(texte);
    const segAvec = (re) => segs.find((p) => re.test(N(p))) || segs[0] || texte;
    const personne = f.personne || personneDans(texte);
    const autorite = f.autorite || autoriteSource(t, personne);
    const e = etat.actualise;
    const ops = [];
    const remarques = [];

    // Nom du projet
    const mNom = texte.match(/projet s'appelle\s+([^.,;\n]+)/i) || texte.match(/\b(?:nom du projet|projet)\s*:\s*([^.,;\n]+)/i);
    if (mNom) ops.push({ operation: 'nom_projet', texte: mNom[1].trim(), nature: 'information', passage: segAvec(/projet/) });

    // Responsable du projet
    const roleRe = '(chef|cheffe|charge|chargee|responsable|directeur|directrice|pilote)\\s+(?:de |du )?projet';
    const tN = N(texte);
    let mResp = new RegExp('([a-z\'-]+(?: [a-z\'-]+){1,2}) (?:est|devient|sera|a ete nommee?|est nommee?) (?:desormais |maintenant )?(?:le |la |l\')?(?:nouvelle? )?' + roleRe).exec(tN)
      || new RegExp('(?:nouveau|nouvelle) ' + roleRe + '\\s*(?::|est|sera)\\s*([a-z\'-]+(?: [a-z\'-]+){1,2})').exec(tN)
      || /([a-z'-]+ [a-z'-]+) (?:reprend|prend) (?:officiellement )?(?:le projet|la charge du projet|le pilotage)/.exec(tN);
    if (mResp) {
      const brut = mResp[0].match(/^(?:nouveau|nouvelle)/) ? mResp[mResp.length - 1] : mResp[1];
      const propre = nomsPropres(texte).find((x) => N(x.nom) === brut.trim() || N(x.nom).endsWith(brut.trim()) || brut.trim().endsWith(N(x.nom)));
      const nom = propre ? propre.nom : brut.replace(/\b\p{L}/gu, (c) => c.toUpperCase());
      if (!/^(le|la|un|une|notre|nous)\b/.test(N(nom))) {
        // La phrase qui nomme le responsable (pas la première phrase qui parle du projet).
        const seg = segs.find((p) => new RegExp(roleRe).test(N(p)) && N(p).includes(N(nom).split(' ')[0])) || segs.find((p) => new RegExp(roleRe).test(N(p))) || segAvec(/reprend|pilot/);
        const dDepuis = extraireDates(seg).find((d) => /(depuis|a compter|a partir|des le|le )\s*$/.test(N(seg).slice(Math.max(0, d.index - 14), d.index))) || extraireDates(seg)[0];
        const role = /(cheffe|chargee|directrice)/.test(t) ? (/(directrice)/.test(t) ? 'Directrice de projet' : /chargee/.test(t) ? 'Chargée de projet' : 'Cheffe de projet') : /directeur/.test(t) ? 'Directeur de projet' : /charge de projet/.test(t) ? 'Chargé de projet' : /responsable/.test(t) ? 'Responsable du projet' : 'Chef de projet';
        ops.push({ operation: 'responsable_projet', texte: nom, role, date: dDepuis ? dDepuis.iso : null, nature: /(nomm|design|officiel)/.test(t) ? 'decision_approuvee' : 'information', passage: seg });
      }
    }

    // Nouvelle condition de lancement
    const mCond = texte.match(/condition (?:de (?:lancement|go-?live|mise en production)|à remplir)?\s*:\s*([^\n]+)/i);
    if (mCond) {
      let titre = mCond[1].trim().replace(/\.$/, '');
      let resp = null;
      const mR = titre.match(/^(.*?)(?:,?\s*(?:doit être |à faire |sera )?(?:validée?|approuvée?|signée?|confirmée?)\s+par\s+|,?\s*responsable\s*:?\s*)(.+)$/i);
      if (mR) { titre = mR[1].trim(); resp = mR[2].trim().replace(/^(l'|le |la )/i, ''); }
      titre = titre.replace(/^(le |la |l'|les )/i, (x) => x).replace(/\s+doit être$/i, '');
      ops.push({ operation: 'nouvelle_condition', texte: titre.charAt(0).toUpperCase() + titre.slice(1), responsable: resp, nature: 'decision_approuvee', passage: segAvec(/condition/) });
    }

    // Conditions existantes : livraison, validation, échec
    if (!mCond) {
      for (const { c } of conditionsDans(texte)) {
        const seg = segs.filter((p) => conditionsDans(p).some((x) => x.c.id === c.id)).join(' ') || texte;
        const lu = etatLu(N(seg));
        if (!lu) continue;
        if (lu === 'valide') {
          const valideurOk = f.valideur === 'responsable' || (personne && c.responsable && N(c.responsable).includes(N(personne.nom).split(' ')[0]) && N(c.responsable).includes(N(personne.nom).split(' ').slice(-1)[0]))
            || (/equipe (securite|accessibilite|exploitation|qa|infra|infrastructure)/.test(N(seg)) && !estFournisseur(N(seg), null));
          if (autorite === 'fournisseur' || f.valideur === 'fournisseur') {
            if (c.etat !== 'correctif_livre') ops.push({ operation: 'etat_condition', cible: c.id, etat: 'correctif_livre', nature: 'correctif_livre', passage: seg.length > 300 ? segAvec(new RegExp(N(c.id) + '|' + (c.tickets || []).map(N).join('|'))) : seg, texte: 'Déclaré corrigé par le fournisseur ; validation de l\'équipe responsable attendue.' });
            else ops.push({ operation: 'note_condition', cible: c.id, nature: 'correctif_livre', passage: seg, texte: 'Le fournisseur affirme que c\'est validé de son côté : la condition reste ouverte tant que ' + (c.responsable || 'l\'équipe responsable') + ' ne l\'a pas validée.' });
            remarques.push(`${badge('ambre', 'Garde-fou', 'shield-alert')} Le fournisseur ne peut pas fermer ${esc(c.id)} : j'enregistre un <strong>correctif livré</strong>, pas une validation. Seul${/a$/.test(N(c.responsable || '')) ? 'e' : ''} <strong>${esc(c.responsable || 'l\'équipe responsable')}</strong> peut valider.`);
          } else if (valideurOk) {
            ops.push({ operation: 'etat_condition', cible: c.id, etat: 'valide', nature: 'validation_obtenue', passage: seg });
          } else if (f.valideur === 'aucun') {
            ops.push({ operation: 'note_condition', cible: c.id, nature: 'information', passage: seg, texte: 'Validation annoncée sans validateur identifié : à confirmer auprès de ' + (c.responsable || 'l\'équipe responsable') + '.' });
          } else {
            return { besoin: 'valideur', condition: c, texte };
          }
        } else if (c.etat !== lu) {
          ops.push({ operation: 'etat_condition', cible: c.id, etat: lu === 'rouvert' && !C.ETATS_FERMES.includes(c.etat) ? 'ouvert' : lu, nature: NATURE_ETAT[lu], passage: seg });
        }
      }
    }

    // Dates : proposition ou décision
    const dates = extraireDates(texte);
    const sujetDate = /(date|lancement|mise en production|\bmep\b|go-?live|lancer|livraison finale|demarrage|mise en service|decal|report|repouss|avanc)/;
    const segDate = segs.find((p) => extraireDates(p).length && sujetDate.test(N(p)) && /(propos|suggere|recommand|demand|souhait|envisag|decal|report|repouss|approuv|decid|enterin|arret|confirm|officialis|acte|valid|fix|maintenu)/.test(N(p)));
    if (segDate && !ops.some((o) => o.operation === 'responsable_projet' && o.passage === segDate)) {
      const ns = N(segDate);
      const d = extraireDates(segDate).slice(-1)[0];
      const decision = /(approuv|decid|enterin|arret|officialis|acte|fix[eé]e? (au|le)|valide la date|confirme la date)/.test(ns) && !/(propos|suggere|recommand|souhait|envisag)/.test(ns);
      if (/maintenu|reste fixe|inchange/.test(ns) && !decision) {
        remarques.push('La date approuvée reste inchangée : j\'enregistre l\'information sans rien modifier.');
      } else if (!decision) {
        const motif = (segDate.match(/(?:pour|car|parce que|parce qu'|en raison d[eu]s?|afin de|faute de|à cause d[eu]s?)\s+([^.;]+)/i) || [])[1];
        const par = personne ? `${personne.nom}${estFournisseur(t, personne) ? ' (fournisseur)' : ''}` : estFournisseur(t, null) ? 'Le fournisseur' : 'Non précisé';
        ops.push({ operation: 'proposition_date', date: d.iso, texte: motif ? motif.trim() : '', responsable: par, nature: 'proposition', passage: segDate });
      } else {
        const aut = f.autoriteDate || (/(comite|codir|conseil|direction)/.test(ns) ? (/(conseil d'administration)/.test(ns) ? 'Conseil d\'administration' : DEMO ? 'Comité de direction NOVA' : 'Comité de direction') : null);
        if (aut === 'proposition') ops.push({ operation: 'proposition_date', date: d.iso, texte: '', responsable: personne ? personne.nom : 'Non précisé', nature: 'proposition', passage: segDate });
        else if (aut) ops.push({ operation: 'decision_date', date: d.iso, autorite: aut, nature: 'decision_approuvee', passage: segDate });
        else return { besoin: 'autorite_date', date: d, texte };
      }
    }

    // Actions : nouvelle action
    const mAct = texte.match(/(?:nouvelle action|ajoute(?:r|z)? (?:une |l')?action|action à (?:faire|mener)|à faire|todo)\s*:?\s*(.+)/i);
    if (mAct) {
      const brut = mAct[1].trim();
      const mResp2 = brut.match(/(?:,\s*|\s+)(?:responsable|confiée? à|assignée? à|portée? par|pilotée? par|par)\s*:?\s*(\p{Lu}[\p{Ll}'’-]+(?:\s\p{Lu}[\p{Ll}'’-]+)?)/u);
      const mEch = brut.match(/(?:pour le|avant le|d'ici le|au plus tard le|échéance\s*:?|le)\s+((?:1er|\d{1,2})\s+\p{L}+(?:\s+20\d{2})?|\d{4}-\d{2}-\d{2}|\d{1,2}\/\d{1,2}(?:\/\d{2,4})?)/u);
      let titre = brut.split(/,\s*(?:responsable|confiée?|assignée?|portée?|pilotée?|pour le|avant le|d'ici)|\s+(?:pour le|avant le|d'ici le|au plus tard le)\s/i)[0].replace(/[.;]\s*$/, '').trim();
      if (mResp2) titre = titre.replace(new RegExp('\\s*(?:par|responsable)\\s*:?\\s*' + mResp2[1] + '.*$'), '').trim();
      const dEch = mEch ? extraireDates(mEch[1])[0] : null;
      const lie = conditionsDans(titre)[0];
      ops.push({ operation: 'nouvelle_action', texte: titre.charAt(0).toUpperCase() + titre.slice(1), responsable: mResp2 ? mResp2[1] : null, date: dEch ? dEch.iso : null, cible: lie ? lie.c.id : null, nature: 'information', passage: segAvec(/action|a faire|todo/) });
    }

    // Actions existantes : état, responsable, échéance
    for (const m of texte.matchAll(/\b(A-?\d{2,3}[\w-]*)\b/g)) {
      const id = m[1];
      const a = e.actions.find((x) => N(x.id) === N(id));
      if (!a || ops.some((o) => o.cible === a.id)) continue;
      const seg = segs.find((p) => p.includes(id)) || texte;
      const ns = N(seg);
      const op = { operation: 'etat_action', cible: a.id, nature: 'information', passage: seg };
      if (/(termine|\bfait\b|\bfaite\b|clos|realise|acheve|boucle|livre)/.test(ns)) op.etat = 'fait';
      else if (/(en cours|demarre|commence|lance)/.test(ns)) op.etat = 'en_cours';
      else if (/(bloque|en attente)/.test(ns)) op.etat = 'en_attente';
      else if (/(annule|abandonne)/.test(ns)) op.etat = 'annule';
      const mR = seg.match(/(?:responsable|rédacteur|rédactrice|confiée? à|assignée? à|pilotée? par|porté(?:e)? par)\s*(?:est|sera|:)?\s*(\p{Lu}[\p{Ll}'’-]+(?:\s\p{Lu}[\p{Ll}'’-]+)?)/u);
      if (mR) op.responsable = mR[1];
      const dE = extraireDates(seg).find((d) => /(pour|avant|d'ici|echeance|au plus tard)/.test(ns));
      if (dE) op.date = dE.iso;
      if (op.etat || op.responsable || op.date) ops.push(op);
    }

    // Finances
    const montant = extraireMontant(texte);
    if (/(budget|enveloppe|montant autorise|autorise un montant)/.test(t) && montant != null) {
      const seg = segAvec(/(budget|enveloppe|autoris)/);
      if (/(approuv|valid|autoris|vote|accord)/.test(N(seg)) && !/(propos|demande|souhait)/.test(N(seg))) ops.push({ operation: 'budget_autorise', montant, nature: 'decision_approuvee', passage: seg, texte: '' });
      else ops.push({ operation: 'note_synthese', cible: 'finances', texte: `Budget évoqué : ${fmtMontant(montant)} (non approuvé à ce stade).`, nature: 'proposition', passage: seg });
    } else if (/(note de credit|avoir|facture corrigee|credit de|facture|paye|payee|reglee|virement|inv-\d+)/.test(t) && !ops.some((o) => o.operation === 'etat_action')) {
      const seg = segAvec(/(credit|avoir|facture|paye|regle|virement|inv-)/);
      ops.push({ operation: 'note_synthese', cible: 'finances', texte: seg.replace(/\s+/g, ' ').slice(0, 260), nature: 'finance', passage: seg });
    }

    // Portée
    const mPortee = texte.match(/(?:la )?(?:portée|périmètre)(?: de la phase \d+)?\s*:\s*([^\n]+)/i);
    if (mPortee) ops.push({ operation: 'portee', texte: mPortee[1].trim(), nature: 'decision_approuvee', passage: segAvec(/portee|perimetre/) });

    return { ops, remarques, personne, autorite };
  }

  // ===================================================================
  // Du plan à l'événement (même format que les fichiers de mise à jour)
  // ===================================================================

  const ORDRE_NATURE = ['decision_approuvee', 'validation_obtenue', 'correctif_livre', 'proposition', 'probleme', 'finance', 'information'];
  const SUJET_CONDITION = { C1: 'securite', C2: 'accessibilite', C3: 'exploitation' };

  function dateDuFait(texte) {
    // Une date en tête (« Courriel de Sophie, 2 octobre : … ») est la date du fait.
    const debut = String(texte).slice(0, 90);
    const d = extraireDates(debut).find((x) => /[:,–-]/.test(N(debut).slice(x.index + x.brut.length, x.index + x.brut.length + 4)) || x.index < 30);
    const h = extraireHeure(debut);
    if (d) return `${d.iso}T${h || '09:00'}:00-04:00`;
    if (DEMO) {
      // Juste après la situation de référence ou la dernière mise à jour.
      const derniere = etat.evenements.map((x) => Date.parse(x.date)).filter(Number.isFinite).sort((a, b) => b - a)[0];
      const base = Math.max(Date.parse(BASE.meta.date_situation), derniere || 0) + 3600000;
      const loc = new Date(base - 4 * 3600000);
      return `${loc.toISOString().slice(0, 16)}:00-04:00`;
    }
    const maintenant = new Date();
    const decal = -maintenant.getTimezoneOffset();
    const loc = new Date(maintenant.getTime() + decal * 60000).toISOString().slice(0, 19);
    return `${loc}${decal >= 0 ? '+' : '-'}${pad(Math.floor(Math.abs(decal) / 60))}:${pad(Math.abs(decal) % 60)}`;
  }

  function identifiants(date) {
    const d = date.replace(/[^0-9]/g, '').slice(0, 12);
    const existants = new Set([...etat.evenements.map((x) => x.id), ...Object.values(conv.propositions).map((p) => p.ev.id)]);
    let id = 'MAJ-' + d, n = 1;
    while (existants.has(n > 1 ? id + '-' + n : id)) n++;
    id = n > 1 ? id + '-' + n : id;
    return { id, source: 'NS-' + id.slice(4) };
  }

  function impactsDepuisOps(ops, ev) {
    const e = etat.actualise;
    const impacts = [];
    const sujets = new Set();
    const questionExiste = (q) => e.questions.some((x) => x.id === q);
    const actionsAjoutees = [];
    const conditionsAjoutees = [];
    for (const op of ops) {
      const commun = { nature: op.nature || 'information', passage: op.passage, repere: 'Message transmis à l\'assistant' };
      if (op.operation === 'etat_condition') {
        const c = e.synthese.conditions.find((x) => x.id === op.cible);
        if (!c || !C.ETATS[op.etat]) continue;
        impacts.push(Object.assign({ cible: 'conditions/' + c.id, modifs: { etat: op.etat }, note: op.texte || undefined }, commun));
        (c.questions || []).filter(questionExiste).forEach((q) => impacts.push(Object.assign({ cible: 'questions/' + q, note: `${c.id} (${c.titre}) : ${(C.ETATS[op.etat] || {}).libelle}.${op.texte ? ' ' + op.texte : ''}` }, commun)));
        if (SUJET_CONDITION[c.id]) sujets.add(SUJET_CONDITION[c.id]);
      } else if (op.operation === 'note_condition') {
        if (!e.synthese.conditions.some((x) => x.id === op.cible)) continue;
        impacts.push(Object.assign({ cible: 'conditions/' + op.cible, note: op.texte }, commun));
      } else if (op.operation === 'proposition_date') {
        if (!op.date) continue;
        const texte = fmtDate(op.date, true);
        impacts.push(Object.assign({ ajouter: 'propositions', objet: { id: 'P-' + ev.id.slice(4), date_proposee: op.date, texte, propose_par: op.responsable || 'Non précisé', motif: op.texte || '', statut: 'En attente de décision' } }, commun, { nature: 'proposition' }));
        const decideur = DEMO ? 'Nicolas Perron (comité de direction)' : (e.synthese.responsable.nom || 'Responsable du projet');
        const idAction = prochainId('A', [...e.actions, ...actionsAjoutees]);
        actionsAjoutees.push({ id: idAction });
        impacts.push(Object.assign({ ajouter: 'actions', objet: { id: idAction, titre: `Faire trancher la proposition du ${texte} par l'autorité compétente${DEMO ? ' (comité de direction)' : ''}`, condition: null, responsable: decideur, responsable_statut: 'propose', echeance: null, echeance_texte: 'À confirmer', etat: 'a_faire', type: 'recommandation' } }, commun, { nature: 'proposition' }));
        if (questionExiste('Q01')) impacts.push(Object.assign({ cible: 'questions/Q01', note: `Nouvelle proposition (non approuvée) : ${texte}${op.responsable ? ', par ' + op.responsable : ''}. La date approuvée reste ${e.synthese.date_mep.texte} tant qu'aucune décision n'est prise.` }, commun, { nature: 'proposition' }));
        sujets.add('date');
      } else if (op.operation === 'decision_date') {
        if (!op.date || !op.autorite) continue;
        const texte = fmtDate(op.date, true);
        impacts.push(Object.assign({ cible: 'synthese/date_mep', modifs: { approuvee: op.date, texte, autorite: op.autorite, date_decision: ev.date.slice(0, 10), statut: 'Approuvée' }, note: `Date approuvée : ${texte} (${op.autorite}).` }, commun, { nature: 'decision_approuvee' }));
        impacts.push(Object.assign({ ajouter: 'decisions', objet: { id: 'D-' + ev.id.slice(4), date: ev.date.slice(0, 10), titre: `Mise en production fixée au ${texte}`, autorite: op.autorite, statut: 'En vigueur' } }, commun, { nature: 'decision_approuvee' }));
        if (questionExiste('Q01')) impacts.push(Object.assign({ cible: 'questions/Q01', note: `Nouvelle date approuvée : ${texte} par ${op.autorite}. Vérifiez si les conditions de go-live restent valables.` }, commun, { nature: 'decision_approuvee' }));
        if (questionExiste('Q03')) impacts.push(Object.assign({ cible: 'questions/Q03', note: `Nouvelle approbation : ${op.autorite}, le ${fmtDate(ev.date)}.` }, commun, { nature: 'decision_approuvee' }));
        sujets.add('date');
      } else if (op.operation === 'etat_action') {
        const a = e.actions.find((x) => x.id === op.cible);
        if (!a) continue;
        const modifs = {};
        if (op.etat && C.ETATS[op.etat]) modifs.etat = op.etat;
        if (op.responsable) Object.assign(modifs, { responsable: op.responsable, responsable_statut: 'confirme' });
        if (op.date) Object.assign(modifs, { echeance: op.date, echeance_texte: fmtDate(op.date) });
        if (!Object.keys(modifs).length && !op.texte) continue;
        impacts.push(Object.assign({ cible: 'actions/' + a.id, modifs: Object.keys(modifs).length ? modifs : undefined, note: op.texte || undefined }, commun));
      } else if (op.operation === 'nouvelle_action') {
        if (!op.texte) continue;
        const idAction = prochainId('A', [...e.actions, ...actionsAjoutees]);
        actionsAjoutees.push({ id: idAction });
        impacts.push(Object.assign({ ajouter: 'actions', objet: { id: idAction, titre: op.texte, condition: op.cible || null, responsable: op.responsable || 'À confirmer', responsable_statut: op.responsable ? 'confirme' : 'propose', echeance: op.date || null, echeance_texte: op.date ? fmtDate(op.date) : 'À confirmer', etat: 'a_faire', type: op.responsable && (ev.source.autorite !== 'non_officielle' || !DEMO) ? 'engagement' : 'recommandation' } }, commun));
        if (op.cible) {
          const c = e.synthese.conditions.find((x) => x.id === op.cible);
          if (c) impacts.push(Object.assign({ cible: 'conditions/' + c.id, modifs: { actions: [...(c.actions || []), idAction] } }, commun));
        }
      } else if (op.operation === 'note_synthese') {
        if (!['finances', 'portee', 'responsable', 'date_mep'].includes(op.cible) || !op.texte) continue;
        impacts.push(Object.assign({ cible: 'synthese/' + op.cible, note: op.texte }, commun));
        if (op.cible === 'finances') sujets.add('finances');
      } else if (op.operation === 'responsable_projet') {
        if (!op.texte) continue;
        const ancien = e.synthese.responsable.nom;
        const modifs = { nom: op.texte, role: op.role || e.synthese.responsable.role || 'Responsable du projet' };
        if (op.date) modifs.depuis = op.date;
        if (ancien && N(ancien) !== N(op.texte)) modifs.avant = ancien;
        impacts.push(Object.assign({ cible: 'synthese/responsable', modifs, note: `Responsable : ${op.texte}${op.date ? ' depuis le ' + fmtDate(op.date, true) : ''}.` }, commun));
        sujets.add('gouvernance');
      } else if (op.operation === 'nom_projet') {
        if (!op.texte || !e.synthese.projet) continue;
        impacts.push(Object.assign({ cible: 'synthese/projet', modifs: { nom: op.texte } }, commun));
      } else if (op.operation === 'budget_autorise') {
        if (op.montant == null) continue;
        impacts.push(Object.assign({ cible: 'synthese/finances', modifs: { autorise: op.montant }, note: `Budget autorisé : ${fmtMontant(op.montant)}.` }, commun));
        sujets.add('finances');
      } else if (op.operation === 'portee') {
        if (!op.texte) continue;
        impacts.push(Object.assign({ cible: 'synthese/portee', modifs: { texte: op.texte } }, commun));
        sujets.add('portee');
      } else if (op.operation === 'nouvelle_condition') {
        if (!op.texte) continue;
        const id = prochainId('C', [...e.synthese.conditions, ...conditionsAjoutees]).replace(/^C0/, 'C');
        conditionsAjoutees.push({ id });
        impacts.push(Object.assign({ ajouter: 'conditions', objet: { id, titre: op.texte, etat: 'ouvert', responsable: op.responsable || 'À confirmer', detail: op.responsable ? `Validée par ${op.responsable}.` : 'Validateur à confirmer.', actions: [], questions: [] } }, commun));
      }
    }
    return { impacts, sujets };
  }

  function construireEvenement(plan, texteSource, options) {
    const o = options || {};
    const date = plan.date || dateDuFait(texteSource);
    const { id, source } = identifiants(date);
    const personne = plan.personne;
    const ev = {
      id, titre: plan.titre || titreAuto(texteSource), date, nature: 'information', resume: plan.resume || '',
      sujets: [],
      methode: o.claude ? 'Assistant NOVA (Claude, Anthropic) · vérifié et appliqué par l\'utilisateur' : 'Assistant NOVA (moteur local, règles) · vérifié et appliqué par l\'utilisateur',
      source: { id: source, titre: (o.exemple ? 'EXEMPLE D\'ESSAI · ' : '') + (plan.titre || titreAuto(texteSource)), type: 'Message transmis à l\'assistant', auteur: plan.auteur || (personne ? personne.nom : 'Non précisé'), date: date.slice(0, 10), autorite: plan.autorite || 'non_officielle', texte: texteSource },
      impacts: [],
      inchange: [],
      cree_le: new Date().toISOString(),
    };
    if (o.exemple) ev.exemple = true;
    const { impacts, sujets } = impactsDepuisOps(plan.ops, ev);
    ev.impacts = impacts;
    ev.sujets = [...sujets].filter(Boolean);
    const natures = impacts.map((im) => im.nature);
    ev.nature = ORDRE_NATURE.find((x) => natures.includes(x)) || 'information';
    if (!ev.resume) ev.resume = resumeAuto(impacts, texteSource);
    ev.inchange = inchangeAuto(impacts);
    return ev;
  }
  function titreAuto(texte) {
    const p = phrases(texte)[0] || texte;
    return p.length > 72 ? p.slice(0, 69).replace(/\s+\S*$/, '') + '…' : p;
  }
  function resumeAuto(impacts, texte) {
    if (!impacts.length) return (phrases(texte)[0] || texte).slice(0, 200);
    const e = etat.actualise;
    return impacts.filter((im) => !/^questions\//.test(im.cible || '')).map((im) => {
      if (im.ajouter === 'propositions') return `Nouvelle proposition de date (non approuvée) : ${im.objet.texte}.`;
      if (im.ajouter === 'actions') return `Nouvelle action : ${im.objet.titre}.`;
      if (im.ajouter === 'conditions') return `Nouvelle condition de lancement : ${im.objet.titre}.`;
      if (im.ajouter === 'decisions') return '';
      if (/^conditions\//.test(im.cible) && im.modifs && im.modifs.etat) return `${im.cible.split('/')[1]} : ${(C.ETATS[im.modifs.etat] || {}).libelle}.`;
      if (im.cible === 'synthese/date_mep') return `Date approuvée : ${im.modifs.texte} (${im.modifs.autorite}).`;
      if (im.cible === 'synthese/responsable') return `Responsable : ${im.modifs.nom}.`;
      if (im.cible === 'synthese/projet') return `Nom du projet : ${im.modifs.nom}.`;
      if (im.cible === 'synthese/finances' && im.modifs) return `Budget autorisé : ${fmtMontant(im.modifs.autorise)}.`;
      if (/^actions\//.test(im.cible)) { const a = e.actions.find((x) => 'actions/' + x.id === im.cible); return `Action ${a ? a.id : ''} mise à jour.`; }
      return im.note || '';
    }).filter(Boolean).join(' ');
  }
  function inchangeAuto(impacts) {
    const e = etat.actualise;
    const touchees = new Set(impacts.filter((im) => /^conditions\//.test(im.cible || '') && im.modifs && im.modifs.etat).map((im) => im.cible.split('/')[1]));
    const lignes = [];
    if (!impacts.some((im) => im.cible === 'synthese/date_mep' && im.modifs)) lignes.push(e.synthese.date_mep.texte ? `La date approuvée reste le ${e.synthese.date_mep.texte}.` : 'Aucune date approuvée : la date reste à définir.');
    (e.synthese.conditions || []).filter((c) => !touchees.has(c.id)).forEach((c) => lignes.push(`${c.id} (${c.titre}) reste : ${(C.ETATS[c.etat] || {}).libelle}.`));
    return lignes;
  }

  // ===================================================================
  // Carte de proposition : aperçu, garde-fous, application, annulation
  // ===================================================================

  function apercu(ev) {
    const evs = [...etat.evenements.filter((x) => x.id !== ev.id), ev].sort((a, b) => String(a.date).localeCompare(String(b.date)));
    const r = C.appliquerEvenements(BASE, evs);
    return { entree: r.journal.find((j) => j.evenement === ev.id), etat: r.etat };
  }

  function carteProposition(id) {
    const p = conv.propositions[id];
    if (!p) return '';
    const ev = p.ev;
    const { entree, etat: apres } = p.statut === 'appliquee' ? { entree: (etat.journal.find((j) => j.evenement === ev.id) || p.entree), etat: etat.actualise } : apercu(ev);
    p.entree = entree;
    const M = window.NOVA_MAJ;
    const aut = (BASE.autorites[ev.source.autorite] || {}).libelle || ev.source.autorite;
    const lignes = (entree ? entree.impacts : []).filter((im) => !(im.type === 'modification' && /^questions\//.test(im.cible))).map((im) => {
      if (im.type === 'ajout') {
        const nom = { actions: 'Nouvelle action', propositions: 'Nouvelle proposition', conditions: 'Nouvelle condition', decisions: 'Nouvelle décision', chronologie: 'Nouvel événement', risques: 'Nouveau risque' }[im.collection] || 'Ajout';
        return `<li><span class="maj-cible">${esc(nom)}${im.id && im.collection !== 'propositions' && im.collection !== 'decisions' ? ' ' + esc(im.id) : ''}</span><span class="maj-valeur">${esc(im.titre || '')}</span>${badgeNature(im.nature)}</li>`;
      }
      const champs = Object.keys(im.apres || {}).filter((ch) => ch !== 'actions' && ch !== 'responsable_statut' && ch !== 'echeance_texte' && ch !== 'statut' && ch !== 'date_decision');
      const diff = champs.map((ch) => `<span class="maj-diff"><span class="diff-avant">${M.valeurAffichee(ch, im.avant[ch])}</span>${icone('arrow-right')}<span class="diff-apres">${M.valeurAffichee(ch, im.apres[ch])}</span></span>`).join('');
      return `<li><span class="maj-cible">${esc(M.libelleCible(im.cible, apres))}</span>${diff || `<span class="maj-valeur doux">${esc(im.note ? 'Note ajoutée : ' + im.note : 'Lien mis à jour')}</span>`}${badgeNature(im.nature)}</li>`;
    }).join('');
    const notesQ = (entree ? entree.impacts : []).filter((im) => im.type === 'modification' && /^questions\//.test(im.cible)).map((im) => im.cible.split('/')[1]);
    const refuses = entree ? entree.refuses : [];
    const passages = [...new Set(ev.impacts.map((im) => im.passage).filter(Boolean))];
    const etatsBadge = { en_attente: '', appliquee: badge('vert', 'Appliquée', '✓'), ignoree: badge('gris', 'Ignorée'), annulee: badge('gris', 'Annulée', '↺') };
    const vide = !ev.impacts.length;
    return `<div class="carte-maj${p.statut !== 'en_attente' ? ' traitee' : ''}">
      <div class="carte-maj-tete">${tuile(vide ? 'history' : 'wand-sparkles', vide ? '' : 'ton-bleu')}<div><strong>${vide ? 'Information à enregistrer' : 'Mise à jour proposée'}</strong>
        <span>Source : ${esc(ev.source.auteur)} · ${esc(aut)} · ${fmtDateHeure(ev.date)}</span></div>${etatsBadge[p.statut] || ''}${p.exemple ? badge('rouge', 'EXEMPLE', '!') : ''}</div>
      ${vide ? `<p class="petit">Rien ne change dans le dossier : l'information entre seulement dans l'historique, avec sa source.</p>` : `<ul class="carte-maj-liste">${lignes}</ul>`}
      ${notesQ.length ? `<p class="petit doux">+ note ajoutée aux réponses ${notesQ.map(esc).join(', ')}.</p>` : ''}
      ${refuses.length ? `<div class="encadre ton-rouge petit">${icone('shield-alert')} <strong>Refusé par les garde-fous :</strong> ${refuses.map((r) => esc(r.erreurs.join(' '))).join(' ')}</div>` : ''}
      ${passages.length ? `<blockquote class="carte-maj-passage">${icone('quote')}<span>« ${esc(passages[0].length > 240 ? passages[0].slice(0, 237) + '…' : passages[0])} »</span></blockquote>` : ''}
      ${ev.inchange.length ? `<details class="carte-maj-inchange"><summary>Ce qui ne change pas (${ev.inchange.length})</summary><ul>${ev.inchange.map((x) => `<li>${esc(x)}</li>`).join('')}</ul></details>` : ''}
      <div class="groupe-boutons carte-maj-actions">
        ${p.statut === 'en_attente' ? `<button type="button" class="bouton primaire" data-ia-appliquer="${id}">${icone('check')}${vide ? 'Enregistrer' : 'Appliquer'}</button><button type="button" class="bouton" data-ia-ignorer="${id}">Ignorer</button>` : ''}
        ${p.statut === 'appliquee' ? `<button type="button" class="bouton petit" data-ia-annuler="${id}">${icone('undo-2')}Annuler cette mise à jour</button>` : ''}
      </div></div>`;
  }

  // Résultat d'un appel d'outil de Claude, envoyé avec le prochain message (seulement s'il est encore attendu).
  function resultatOutil(p, texte) {
    if (p && p.outil && p.outil in conv.claude.outils) conv.claude.outils[p.outil] = texte;
  }

  function proposer(ev, options) {
    const id = 'p' + (++compteur);
    conv.propositions[id] = { ev, statut: 'en_attente', exemple: !!ev.exemple, outil: options && options.outil };
    dire('', { proposition: id });
    return id;
  }

  function appliquer(id) {
    const p = conv.propositions[id];
    if (!p || p.statut !== 'en_attente') return;
    const erreurs = p.ev.impacts.flatMap((im) => C.controlerImpact(im, p.ev));
    if (erreurs.length) { dire(`${icone('shield-alert')} Je ne peux pas appliquer cette mise à jour : ${esc(erreurs.join(' '))}`); return; }
    etat.evenementsLocaux.push(p.ev);
    A.ecrireLocaux();
    etat.version = 'actualisee';
    A.recalculer();
    p.statut = 'appliquee';
    resultatOutil(p, 'L\'utilisateur a appliqué cette mise à jour. ' + (etat.erreursMaj.length ? 'Garde-fous : ' + etat.erreursMaj.join(' ') : 'Aucun impact refusé.'));
    A.rendre();
    rendreFil();
    A.annoncer('Mise à jour appliquée.');
    dire(apresApplication(p.ev));
  }
  function ignorer(id) {
    const p = conv.propositions[id];
    if (!p || p.statut !== 'en_attente') return;
    p.statut = 'ignoree';
    resultatOutil(p, 'L\'utilisateur a ignoré cette proposition : rien n\'a été modifié.');
    rendreFil();
    dire('Entendu : rien n\'a été modifié.');
  }
  function annuler(id) {
    const p = conv.propositions[id];
    if (!p || p.statut !== 'appliquee') return;
    const i = etat.evenementsLocaux.findIndex((x) => x.id === p.ev.id);
    if (i >= 0) etat.evenementsLocaux.splice(i, 1);
    A.ecrireLocaux();
    A.recalculer();
    p.statut = 'annulee';
    resultatOutil(p, 'L\'utilisateur a appliqué puis annulé cette mise à jour : le dossier est revenu à l\'état précédent.');
    A.rendre();
    rendreFil();
    dire(`${icone('undo-2')} Mise à jour annulée : le dossier est revenu à l'état précédent.`);
  }

  function apresApplication(ev) {
    const e = etat.actualise;
    const conds = e.synthese.conditions || [];
    const remplies = conds.filter((c) => C.ETATS_FERMES.includes(c.etat)).length;
    const liens = [];
    if (ev.impacts.some((im) => /^conditions\/|synthese\//.test(im.cible || '') || im.ajouter === 'propositions' || im.ajouter === 'conditions')) liens.push('<a href="#vue">Voir l\'accueil</a>');
    if (ev.impacts.some((im) => im.ajouter === 'actions' || /^actions\//.test(im.cible || ''))) liens.push('<a href="#actions">Voir les actions</a>');
    liens.push('<a href="#historique">Voir l\'historique</a>');
    const etatTxt = conds.length ? ` Conditions de lancement : <strong>${remplies} / ${conds.length} remplie${remplies > 1 ? 's' : ''}</strong>.` : '';
    const dateTxt = e.synthese.date_mep.texte ? ` Date approuvée : <strong>${esc(e.synthese.date_mep.texte)}</strong>.` : '';
    return `C'est fait.${dateTxt}${etatTxt} La source est conservée${DEMO ? ' et la version initiale reste consultable' : ''}.<div class="liens-ia">${liens.join('')}</div>`;
  }

  // ===================================================================
  // Moteur local : répondre aux questions, avec les preuves
  // ===================================================================

  function reponsePreparee(q, autres) {
    const notes = (q.notes_maj || []).map((n) => `<div class="maj-note petit"><strong>Mise à jour :</strong> ${esc(n.texte)}</div>`).join('');
    const preuves = (q.preuves || []).slice(0, 3);
    return `<div class="reponse-ia"><div class="reponse-ia-tete"><span class="question-num">${esc(q.id)}</span><span>${esc(q.question)}</span></div>
      <p>${esc(q.reponse_courte)}</p>${notes}
      <div class="groupe-boutons">${preuves.map((p) => preuveIA(p)).join('')}</div>
      <div class="liens-ia"><a href="#questions/${esc(q.id)}" data-ia-question="${esc(q.id)}">Voir la réponse complète et ses ${(q.preuves || []).length} preuves</a>
      ${(autres || []).length ? autres.map((r) => `<a href="#questions/${esc(r.e.id)}" data-ia-question="${esc(r.e.id)}">${esc(r.e.id)} · ${esc(r.e.question.slice(0, 60))}${r.e.question.length > 60 ? '…' : ''}</a>`).join('') : ''}</div></div>`;
  }

  function reponseResume(e) {
    const s = e.synthese;
    const d = s.date_mep;
    const conds = s.conditions || [];
    const remplies = conds.filter((c) => C.ETATS_FERMES.includes(c.etat));
    const ouvertes = e.actions.filter((a) => !C.ETATS_FERMES.includes(a.etat));
    const props = s.propositions || [];
    if (!DEMO && !etat.evenements.length) return 'Le dossier est encore vide. Donnez-moi ce que vous savez du projet (qui le pilote, ce qui est décidé, ce qui reste à faire) : je le range et je garde la source de chaque fait.';
    const parties = [];
    parties.push(d.approuvee ? `<strong>Mise en production approuvée : ${esc(d.texte)}</strong>${d.autorite ? ` (${esc(d.autorite)})` : ''}.` : '<strong>Aucune date de mise en production approuvée.</strong>');
    if (conds.length) parties.push(`Conditions de lancement : <strong>${remplies.length} / ${conds.length} remplies</strong>${conds.length - remplies.length ? ` ; il reste ${conds.filter((c) => !C.ETATS_FERMES.includes(c.etat)).map((c) => `${esc(c.id)} (${esc((C.ETATS[c.etat] || {}).libelle.toLowerCase())})`).join(', ')}` : ''}.`);
    if (props.length) parties.push(`Proposition en attente, non approuvée : ${props.map((p) => esc(p.texte)).join(', ')}.`);
    if (s.responsable.nom) parties.push(`Responsable : ${esc(s.responsable.nom)}${s.responsable.depuis ? ` depuis le ${fmtDate(s.responsable.depuis, true)}` : ''}.`);
    if (s.finances.autorise != null) parties.push(`Budget autorisé : ${fmtMontant(s.finances.autorise)}${s.finances.a_contester ? `, dont ${fmtMontant(s.finances.a_contester)} facturés à contester` : ''}.`);
    parties.push(`${ouvertes.length} action${ouvertes.length > 1 ? 's' : ''} ouverte${ouvertes.length > 1 ? 's' : ''}.`);
    return `<p>${parties.join(' ')}</p><div class="groupe-boutons">${preuvesIA((d.preuves || []).slice(0, 1))}${conds.length ? preuvesIA(conds.map((c) => (c.preuves || []).slice(-1)[0]).filter(Boolean), 2) : ''}</div>
      <div class="liens-ia"><a href="#vue">Voir l'accueil</a><a href="#actions">Voir les actions</a></div>`;
  }

  const THEMES = [
    { re: /(qui (pilote|gere|dirige|est (le |la )?responsable)|responsable du projet|charge de projet|cheffe? de projet)/, fn: (e) => {
      const r = e.synthese.responsable;
      if (!r.nom) return 'Aucun responsable n\'est encore enregistré. Dites-moi qui pilote le projet, et depuis quand.';
      return `<p><strong>${esc(r.nom)}</strong>, ${esc((r.role || 'responsable').toLowerCase())}${r.depuis ? ` depuis le ${fmtDate(r.depuis, true)}` : ''}.${r.avant ? ` Avant : ${esc(r.avant)}.` : ''}</p><div class="groupe-boutons">${preuvesIA(r.preuves, 1)}</div>`;
    } },
    { re: /(reste|manque|bloque|bloquant|condition|pret pour|empeche|risque de ne pas)/, fn: (e) => {
      const conds = e.synthese.conditions || [];
      if (!conds.length) return 'Aucune condition de lancement n\'est enregistrée. Vous pouvez m\'en donner une, avec l\'équipe qui la validera.';
      const ouvertes = conds.filter((c) => !C.ETATS_FERMES.includes(c.etat));
      const lignes = conds.map((c) => {
        const acts = (c.actions || []).map((id) => e.actions.find((a) => a.id === id)).filter(Boolean).filter((a) => !C.ETATS_FERMES.includes(a.etat));
        return `<li><strong>${esc(c.id)}</strong> ${esc(c.titre)} : ${badgeEtat(c.etat)}${acts.length ? `<br><span class="petit">À faire : ${acts.map((a) => `${esc(a.titre)} (${esc(a.responsable)}, ${a.echeance ? fmtDate(a.echeance) : 'échéance à confirmer'})`).join(' ; ')}</span>` : ''}</li>`;
      }).join('');
      return `<p>${ouvertes.length ? `Il reste <strong>${ouvertes.length} condition${ouvertes.length > 1 ? 's' : ''} sur ${conds.length}</strong> avant le lancement${e.synthese.date_mep.texte ? ` du ${esc(e.synthese.date_mep.texte)}` : ''} :` : 'Toutes les conditions de lancement sont remplies.'}</p><ul class="liste-ia">${lignes}</ul>
        <div class="groupe-boutons">${preuvesIA(conds.map((c) => (c.preuves || []).slice(-1)[0]).filter(Boolean), 3)}</div><div class="liens-ia"><a href="#vue/conditions">Voir les conditions</a></div>`;
    } },
    { re: /(budget|montant|cout|combien|factur|paye|argent|depense|inv-\d)/, fn: (e) => {
      const f = e.synthese.finances;
      if (f.autorise == null && !(f.factures || []).length) return 'Aucune information financière n\'est enregistrée pour l\'instant.';
      return `<p>${f.autorise != null ? `<strong>Autorisé : ${fmtMontant(f.autorise)}</strong>. ` : ''}${f.facture != null ? `Facturé : ${fmtMontant(f.facture)}. ` : ''}${f.paye != null ? `Payé (documenté) : ${fmtMontant(f.paye)}. ` : ''}${f.a_contester ? `À contester : <strong>${fmtMontant(f.a_contester)}</strong>${DEMO ? ' (ligne CR-04 de la facture INV-003, non approuvée)' : ''}.` : ''}</p>
        ${(f.notes_maj || []).map((n) => `<div class="maj-note petit">${esc(n.texte)}</div>`).join('')}<div class="groupe-boutons">${preuvesIA(f.preuves, 2)}</div><div class="liens-ia"><a href="#vue/finances">Voir les finances</a></div>`;
    } },
    { re: /(action|qui fait quoi|a faire|prochaines? etapes?|echeance|todo|taches?)/, fn: (e) => {
      const ouvertes = e.actions.filter((a) => !C.ETATS_FERMES.includes(a.etat));
      if (!ouvertes.length) return 'Aucune action ouverte. Dites-moi qui doit faire quoi, et pour quand.';
      const top = ouvertes.slice(0, 6).map((a) => `<li><strong>${esc(a.id)}</strong> ${esc(a.titre)} · ${esc(a.responsable)} · ${a.echeance ? fmtDate(a.echeance) : 'à confirmer'}</li>`).join('');
      return `<p><strong>${ouvertes.length} action${ouvertes.length > 1 ? 's' : ''} ouverte${ouvertes.length > 1 ? 's' : ''}</strong>${ouvertes.filter((a) => !a.echeance).length ? `, dont ${ouvertes.filter((a) => !a.echeance).length} sans échéance écrite (« À confirmer ») : aucune date n'est inventée` : ''}.</p><ul class="liste-ia">${top}</ul>${ouvertes.length > 6 ? `<p class="petit doux">… et ${ouvertes.length - 6} autres.</p>` : ''}<div class="liens-ia"><a href="#actions">Voir toutes les actions</a></div>`;
    } },
    { re: /(date|quand|lancement|mise en production|\bmep\b|go-?live|lancer|livr)/, fn: (e) => {
      const d = e.synthese.date_mep;
      const props = e.synthese.propositions || [];
      if (!d.approuvee) return `Aucune date de mise en production n'est approuvée.${props.length ? ` Proposition en attente : ${props.map((p) => esc(p.texte)).join(', ')} (non approuvée).` : ''}`;
      const conds = e.synthese.conditions || [];
      const ouvertes = conds.filter((c) => !C.ETATS_FERMES.includes(c.etat)).length;
      return `<p><strong>${esc(d.texte)}</strong>, approuvée par ${esc(d.autorite || 'une autorité non précisée')}${d.date_decision ? ` le ${fmtDate(d.date_decision, true)}` : ''}.${conds.length ? ` Ce n'est pas un go automatique : ${ouvertes} condition${ouvertes > 1 ? 's' : ''} sur ${conds.length} reste${ouvertes > 1 ? 'nt' : ''} à remplir.` : ''}${props.length ? ` Une proposition non approuvée est en attente : ${props.map((p) => esc(p.texte)).join(', ')}.` : ''}</p><div class="groupe-boutons">${preuvesIA(d.preuves, 2)}</div>`;
    } },
  ];

  function repondre(texte) {
    const t = N(texte);
    const e = etat.courant;
    if (/(ou en est|resume|resumer|fais le point|faire le point|situation|etat du (projet|dossier)|synthese|on en est ou|point sur le projet|ca donne quoi)/.test(t)) return reponseResume(e);
    const prep = DEMO ? A.repondre(texte) : [];
    const theme = THEMES.find((th) => th.re.test(t));
    if (prep.length && prep[0].score >= 6 && (!theme || prep[0].score >= 8)) return reponsePreparee(prep[0].e, prep.slice(1, 3));
    if (theme) {
      const html = theme.fn(e, texte);
      return html + (prep.length && prep[0].score >= 3 ? `<div class="liens-ia"><a href="#questions/${esc(prep[0].e.id)}" data-ia-question="${esc(prep[0].e.id)}">Réponse détaillée : ${esc(prep[0].e.id)}</a></div>` : '');
    }
    if (prep.length) return reponsePreparee(prep[0].e, prep.slice(1, 3));
    const docs = A.rechercherDocuments(texte, 3);
    if (docs.length) {
      return `<p>Je n'ai pas de réponse toute faite. Voici les passages des documents qui en parlent : vérifiez-les avant de conclure.</p>
        <ul class="liste-ia">${docs.map((r) => `<li><strong>${esc(r.id)}</strong> ${esc((A.SOURCES[r.id] || {}).titre || '')}<br><span class="petit">« ${esc((r.ligne || '').slice(0, 160))} »</span><br>${preuveIA(r.cellule ? { source: r.id, repere: 'Cellule ' + r.cellule, cellules: r.cellule, feuille: r.feuille } : { source: r.id, repere: 'Résultat de recherche', page: r.page, passage: r.ligne || undefined }, 'Ouvrir au passage')}</li>`).join('')}</ul>`;
    }
    return `Je ne trouve pas cette information dans le dossier. Si vous l'avez, donnez-la-moi : je l'enregistrerai avec sa source.`;
  }

  // ===================================================================
  // Aiguillage : question, mise à jour, aide, navigation
  // ===================================================================

  function classer(texte) {
    const t = N(texte).trim();
    if (/^(aide|help|\?|que (sais|peux)-tu faire|comment (ca|ça) marche|tu sers a quoi)/.test(t)) return 'aide';
    if (texte.length < 60 && /^(ouvre|affiche|montre|va |aller |voir )/.test(t) && /(actions?|historique|documents?|accueil|questions?|brief|chronologie|contradictions?|finances?)/.test(t)) return 'navigation';
    const interrogatif = /\?\s*$/.test(texte.trim()) || /^(qui|que|qu'|quoi|quel|quelle|quels|quelles|quand|comment|pourquoi|combien|ou |est-ce|y a-t-il|peux-tu|pourrais-tu|dis-moi|explique|montre|resume|fais le point|ou en est|on en est)/.test(t);
    const imperatifMaj = /^(note|notez|ajoute|ajoutez|enregistre|enregistrez|mets? a jour|mettez a jour|marque|passe|change|remplace|nouvelle action|condition)/.test(t);
    if (interrogatif && !imperatifMaj) return 'question';
    const signal = /(valid|accept|approuv|ferm|livr|deploy|corrig|propos|suggere|decal|report|repouss|annul|nouvelle action|ajoute|enregistre|note que|nomm|reprend|charge de projet|cheffe? de projet|responsable (est|sera|du projet)|budget|condition|facture|avoir|note de credit|paye|regle|echou|rouvert|\bko\b|s'appelle|portee|perimetre|termine|en cours|bloque|re-?test|\bfixe|\barrete|\bdecide|prevue? (au|le|pour)|planifie|programme)/.test(t);
    if (imperatifMaj || signal || texte.length > 160) return 'mise_a_jour';
    return 'question';
  }

  function aide() {
    return `<p>Je fais deux choses :</p><ul class="liste-ia">
      <li><strong>Répondre</strong> aux questions sur le dossier, avec les preuves (le document s'ouvre au bon passage).</li>
      <li><strong>Mettre à jour</strong> le dossier quand vous me donnez une nouvelle information : collez un courriel, un compte rendu, ou dites simplement ce qui a changé. Je vous montre l'aperçu ; rien n'est modifié sans votre accord.</li></ul>
      <p class="petit doux">Je respecte les règles du dossier : une proposition n'est pas une décision, un correctif livré n'est pas une validation, et un fournisseur ne ferme jamais une condition.</p>`;
  }

  function naviguer(texte) {
    const t = N(texte);
    const cibles = [[/action/, '#actions', 'Actions'], [/historique|chronologie/, '#historique', 'Historique'], [/contradiction/, '#historique/h-contradictions', 'Contradictions'], [/document/, '#documents/d-liste', 'Documents'], [/question/, '#questions', 'Questions'], [/finance/, '#vue/finances', 'Finances'], [/brief/, '#vue/brief', 'Brief'], [/accueil/, '#vue', 'Accueil']];
    const c = cibles.find(([re]) => re.test(t));
    if (!c) return false;
    location.hash = c[1];
    return `J'ouvre <strong>${esc(c[2])}</strong>.`;
  }

  function traiterLocal(texte) {
    // Réponse à une question de précision en cours ?
    if (conv.attente) {
      const att = conv.attente;
      conv.attente = null;
      const t = N(texte);
      if (att.besoin === 'valideur') {
        const c = att.condition;
        const forcer = /fournisseur|boreal|prestataire/.test(t) ? { valideur: 'fournisseur', autorite: 'fournisseur' }
          : /(personne|ne sais pas|aucun|inconnu)/.test(t) ? { valideur: 'aucun' }
          : (c.responsable && N(c.responsable).split(' ').some((m) => m.length > 2 && t.includes(m))) || /(equipe|responsable|oui)/.test(t) ? { valideur: 'responsable', personne: { nom: c.responsable, role: 'Valide ' + c.id }, autorite: 'officielle' } : null;
        if (forcer) return traiterInformation(att.texte, forcer, att.exemple);
      } else if (att.besoin === 'autorite_date') {
        const forcer = /(proposition|propose|pas encore|rien de decide)/.test(t) ? { autoriteDate: 'proposition' }
          : /(comite|direction|codir)/.test(t) ? { autoriteDate: DEMO ? 'Comité de direction NOVA' : 'Comité de direction', autorite: 'decision' }
          : /(responsable|chef|cheffe|charge)/.test(t) ? { autoriteDate: (etat.actualise.synthese.responsable.nom ? etat.actualise.synthese.responsable.nom + ' (responsable du projet)' : 'Responsable du projet'), autorite: 'decision' }
          : texte.trim().length > 2 && texte.trim().length < 80 ? { autoriteDate: texte.trim().replace(/\.$/, ''), autorite: 'decision' } : null;
        if (forcer) return traiterInformation(att.texte, forcer, att.exemple);
      }
    }
    const type = classer(texte);
    if (type === 'aide') return dire(aide());
    if (type === 'navigation') { const r = naviguer(texte); if (r) return dire(r); }
    if (type === 'question') return dire(repondre(texte));
    return traiterInformation(texte, null, conv.exempleSuivant);
  }

  function traiterInformation(texte, forcer, exemple) {
    const r = analyserInformation(texte, forcer);
    if (r.besoin === 'valideur') {
      const c = r.condition;
      conv.attente = { besoin: 'valideur', condition: c, texte, exemple };
      return dire(`Qui a validé <strong>${esc(c.id)}</strong> (${esc(c.titre)}) ? Pour fermer une condition, il faut la validation de l'équipe responsable${c.responsable ? ` (${esc(c.responsable)})` : ''}, pas seulement un correctif livré.
        <div class="choix-rapides">${[c.responsable ? `${c.responsable} (équipe responsable)` : 'L\'équipe responsable', 'Le fournisseur', 'Personne pour l\'instant'].map((x) => `<button type="button" class="puce" data-ia-repondre="${esc(x)}">${esc(x)}</button>`).join('')}</div>`);
    }
    if (r.besoin === 'autorite_date') {
      conv.attente = { besoin: 'autorite_date', texte, exemple };
      return dire(`Qui a approuvé le <strong>${esc(fmtDate(r.date.iso, true))}</strong> ? Une date ne devient « approuvée » que par une décision de l'autorité compétente ; sinon, je l'enregistre comme proposition.
        <div class="choix-rapides">${['Le comité de direction', 'Le responsable du projet', 'Ce n\'est qu\'une proposition'].map((x) => `<button type="button" class="puce" data-ia-repondre="${esc(x)}">${esc(x)}</button>`).join('')}</div>`);
    }
    if (!r.ops.length && texte.length < 60) return dire(repondre(texte));
    const plan = { ops: r.ops, personne: r.personne, autorite: r.autorite };
    const ev = construireEvenement(plan, texte, { exemple });
    if (r.remarques.length) dire(r.remarques.map((x) => `<p>${x}</p>`).join(''));
    else if (!r.ops.length) dire('Je n\'ai repéré aucun changement précis (date, condition, action, responsable, budget). Je peux tout de même l\'enregistrer dans l\'historique, avec sa source :');
    else dire(`Voici ce que je comprends${r.personne ? ` du message de <strong>${esc(r.personne.nom)}</strong>` : ''}. Vérifiez avant d'appliquer :`);
    proposer(ev);
  }

  // ===================================================================
  // Connecteur Claude (facultatif) : votre clé, votre compte Anthropic
  // ===================================================================

  const CLE_CLAUDE = 'nova360.claude.cle';
  const CLE_MODELE = 'nova360.claude.modele';
  const CLE_MOTEUR = 'nova360.assistant.moteur';
  const MODELE_DEFAUT = 'claude-opus-5-5';
  const lireSession = (k) => { try { return sessionStorage.getItem(k); } catch { return null; } };
  const ecrireSession = (k, v) => { try { if (v == null || v === '') sessionStorage.removeItem(k); else sessionStorage.setItem(k, v); } catch { /* navigation privée */ } };
  const moteur = () => (lireSession(CLE_MOTEUR) === 'claude' && lireSession(CLE_CLAUDE) ? 'claude' : 'local');

  const OPERATIONS = ['etat_condition', 'note_condition', 'proposition_date', 'decision_date', 'etat_action', 'nouvelle_action', 'note_synthese', 'responsable_projet', 'nom_projet', 'budget_autorise', 'portee', 'nouvelle_condition'];
  const OUTIL_CLAUDE = {
    name: 'proposer_mise_a_jour',
    description: 'Propose une mise à jour structurée du dossier à partir d\'une information nouvelle donnée par l\'utilisateur. L\'application vérifie les garde-fous, montre un aperçu et l\'utilisateur confirme avant toute application. N\'appelle cet outil que si le message apporte une information nouvelle ou demande une modification.',
    input_schema: {
      type: 'object',
      properties: {
        titre: { type: 'string', description: 'Titre court de la nouvelle information.' },
        resume: { type: 'string', description: 'Ce qui vient de changer, en une ou deux phrases.' },
        date: { type: 'string', description: 'Date et heure du fait, ISO 8601 avec fuseau (ex. 2026-10-02T09:00:00-04:00). Chaîne vide si inconnue.' },
        auteur: { type: 'string', description: 'Qui donne l\'information (personne ou organisation).' },
        autorite: { type: 'string', enum: Object.keys(BASE.autorites), description: 'Autorité de la source : decision (comité), officielle, ticket, fournisseur, finance, brouillon, non_officielle.' },
        impacts: {
          type: 'array',
          items: {
            type: 'object',
            properties: {
              operation: { type: 'string', enum: OPERATIONS },
              cible: { type: 'string', description: 'Identifiant visé : C1, A04, ou pour note_synthese : finances, portee, responsable, date_mep.' },
              etat: { type: 'string', enum: Object.keys(C.ETATS) },
              date: { type: 'string', description: 'AAAA-MM-JJ (date proposée, approuvée, échéance ou prise de poste).' },
              texte: { type: 'string', description: 'Titre d\'action ou de condition, note, nom, motif, portée.' },
              responsable: { type: 'string', description: 'Personne responsable ou auteur de la proposition.' },
              autorite: { type: 'string', description: 'Pour decision_date : qui a approuvé.' },
              montant: { type: 'number' },
              nature: { type: 'string', enum: Object.keys(C.NATURES) },
              passage: { type: 'string', description: 'Phrase du message de l\'utilisateur qui justifie l\'impact, copiée mot pour mot.' },
            },
            required: ['operation', 'nature', 'passage'],
          },
        },
      },
      required: ['titre', 'resume', 'auteur', 'autorite', 'impacts'],
    },
  };
  const INSTRUCTIONS_CLAUDE = `Tu es l'assistant de NOVA, une mémoire de projet. Tu aides un dirigeant ou un chef de projet à comprendre l'état d'un projet et à le tenir à jour, comme un connecteur qu'on pilote en langage naturel.
Règles :
- Réponds en français, en 2 à 6 phrases claires. N'utilise que l'état du dossier fourni et les messages de l'utilisateur ; si une information manque, dis-le. N'invente ni décision, ni échéance, ni approbation, ni source.
- Cite les éléments entre crochets avec leurs identifiants : questions [Q03], sources [M04], actions [A04], conditions [C1].
- Une proposition n'est pas une décision. Un correctif livré n'est pas une validation. Une déclaration du fournisseur ne ferme jamais une condition : seule l'équipe responsable valide. La date approuvée ne change que par une décision de l'autorité compétente.
- Quand l'utilisateur apporte une information nouvelle ou demande une modification, appelle l'outil proposer_mise_a_jour (une seule fois par message). L'application montre un aperçu et l'utilisateur confirme : n'affirme jamais qu'une mise à jour est faite avant le résultat de l'outil.
- Pour chaque impact, copie dans « passage » la phrase exacte du message de l'utilisateur qui le justifie.
- S'il manque une information essentielle (qui a validé, qui a approuvé), pose la question au lieu de deviner.`;

  function etatPourClaude() {
    const e = etat.actualise;
    const s = e.synthese;
    const res = {
      version: DEMO ? 'démo (dossier NOVA)' : 'dossier vierge',
      situation: BASE.meta.date_situation_texte,
      projet: (s.projet && s.projet.nom) || BASE.meta.projet,
      responsable: { nom: s.responsable.nom, role: s.responsable.role, depuis: s.responsable.depuis },
      date_mep: { approuvee: s.date_mep.approuvee, texte: s.date_mep.texte, autorite: s.date_mep.autorite, statut: s.date_mep.statut },
      propositions: (s.propositions || []).map((p) => ({ texte: p.texte, par: p.propose_par, statut: p.statut })),
      conditions: (s.conditions || []).map((c) => ({ id: c.id, titre: c.titre, etat: c.etat, responsable: c.responsable, actions: c.actions })),
      finances: { autorise: s.finances.autorise, facture: s.finances.facture, paye: s.finances.paye, a_contester: s.finances.a_contester },
      actions: e.actions.map((a) => ({ id: a.id, titre: a.titre, responsable: a.responsable, statut_responsable: a.responsable_statut, echeance: a.echeance || a.echeance_texte, etat: a.etat, condition: a.condition })),
      personnes: annuaire(),
    };
    if (DEMO) {
      res.questions = e.questions.map((q) => ({ id: q.id, question: q.question, reponse: q.reponse_courte }));
      res.sources = Object.values(A.SOURCES).filter((x) => !x._apercu).map((x) => ({ id: x.id, titre: x.titre, date: x.date, autorite: x.autorite }));
    }
    return JSON.stringify(res);
  }

  // Texte de Claude → HTML sûr : échappement, gras, listes, références cliquables.
  function versHtml(texte) {
    let h = esc(texte);
    h = h.replace(/\*\*([^*]+)\*\*/g, '<strong>$1</strong>');
    h = h.replace(/\[([A-Z][A-Z0-9-]{1,24})\]/g, (m, id) => {
      if (/^Q\d{2}$|^X\d{2}$/.test(id)) return `<a href="#questions/${id}" data-ia-question="${id}">${id}</a>`;
      if (/^A[-\d]/.test(id)) return `<a href="#actions/action-${id}">${id}</a>`;
      if (/^C\d+$/.test(id)) return `<a href="#vue/conditions">${id}</a>`;
      if (A.SOURCES[id]) return preuveIA({ source: id, repere: 'Document cité par l\'assistant' }, 'Ouvrir');
      return m;
    });
    const lignes = h.split('\n');
    let html = '', liste = false;
    for (const l of lignes) {
      if (/^\s*[-•]\s+/.test(l)) { if (!liste) { html += '<ul class="liste-ia">'; liste = true; } html += `<li>${l.replace(/^\s*[-•]\s+/, '')}</li>`; continue; }
      if (liste) { html += '</ul>'; liste = false; }
      if (l.trim()) html += `<p>${l}</p>`;
    }
    if (liste) html += '</ul>';
    return html;
  }

  function planDepuisOutil(entree) {
    const ops = (Array.isArray(entree.impacts) ? entree.impacts : []).filter((im) => im && OPERATIONS.includes(im.operation) && typeof im.passage === 'string')
      .map((im) => ({ operation: im.operation, cible: im.cible || null, etat: im.etat || null, date: /^\d{4}-\d{2}-\d{2}$/.test(im.date || '') ? im.date : null, texte: im.texte || '', responsable: im.responsable || null, autorite: im.autorite || null, montant: typeof im.montant === 'number' ? im.montant : null, nature: C.NATURES[im.nature] ? im.nature : 'information', passage: im.passage, role: null }));
    return {
      ops, titre: String(entree.titre || '').slice(0, 120), resume: String(entree.resume || ''), auteur: String(entree.auteur || 'Non précisé'),
      autorite: BASE.autorites[entree.autorite] ? entree.autorite : 'non_officielle',
      date: /^\d{4}-\d{2}-\d{2}T\d{2}:\d{2}(:\d{2})?([+-]\d{2}:\d{2}|Z)$/.test(entree.date || '') ? entree.date : null,
    };
  }

  async function traiterClaude(texte) {
    const cle = lireSession(CLE_CLAUDE);
    const modele = lireSession(CLE_MODELE) || MODELE_DEFAUT;
    // Tour de l'utilisateur : d'abord les résultats des outils encore attendus, puis son message.
    const contenu = Object.entries(conv.claude.outils).map(([id, resultat]) => ({ type: 'tool_result', tool_use_id: id, content: resultat }));
    const etatTexte = etatPourClaude();
    const nouvelEtat = etatTexte !== conv.claude.etatEnvoye;
    const entete = 'État actuel du dossier (il fait foi et remplace les états précédents) :\n';
    if (nouvelEtat && conv.claude.etatDansUser) contenu.push({ type: 'text', text: `<etat_dossier>\n${entete}${etatTexte}\n</etat_dossier>` });
    contenu.push({ type: 'text', text: texte });
    const tour = [{ role: 'user', content: contenu }];
    // L'état du dossier part dans un message système placé après le tour de l'utilisateur :
    // les instructions (system) restent identiques d'un appel à l'autre, l'historique n'est jamais réécrit.
    if (nouvelEtat && !conv.claude.etatDansUser) tour.push({ role: 'system', content: entete + etatTexte });
    const corps = {
      model: modele,
      max_tokens: 16000,
      system: [{ type: 'text', text: INSTRUCTIONS_CLAUDE, cache_control: { type: 'ephemeral' } }],
      tools: [OUTIL_CLAUDE],
      tool_choice: { type: 'auto' },
      output_config: { effort: 'medium' },
      fallbacks: 'default',
      messages: conv.claude.historique.concat(tour),
    };
    const reponse = await fetch('https://api.anthropic.com/v1/messages', {
      method: 'POST',
      headers: {
        'content-type': 'application/json',
        'x-api-key': cle,
        'anthropic-version': '2023-06-01',
        'anthropic-dangerous-direct-browser-access': 'true',
        'anthropic-beta': 'server-side-fallback-2026-07-01',
      },
      body: JSON.stringify(corps),
    });
    if (!reponse.ok) {
      let detail = '';
      try { const j = await reponse.json(); detail = (j.error && j.error.message) || ''; } catch { /* corps illisible */ }
      // Modèle sans messages système en cours de conversation : l'état passe dans le tour de l'utilisateur.
      if (reponse.status === 400 && /role 'system'|system.*not supported/i.test(detail) && !conv.claude.etatDansUser && !conv.claude.historique.length) {
        conv.claude.etatDansUser = true;
        return traiterClaude(texte);
      }
      throw new Error(`${reponse.status}${detail ? ' · ' + detail : ''}`);
    }
    const message = await reponse.json();
    // Historique en ajout seul : le tour envoyé et la réponse complète (blocs de réflexion compris).
    conv.claude.historique.push(...tour, { role: 'assistant', content: message.content });
    if (nouvelEtat) conv.claude.etatEnvoye = etatTexte;
    conv.claude.outils = {};
    const blocs = message.content || [];
    const appels = blocs.filter((b) => b.type === 'tool_use');
    if (message.stop_reason === 'refusal') {
      appels.forEach((b) => { conv.claude.outils[b.id] = 'Non traité.'; });
      return dire('Claude a refusé de traiter cette demande. Le moteur local reste disponible (réglages de l\'assistant).');
    }
    const textes = blocs.filter((b) => b.type === 'text').map((b) => b.text).join('\n').trim();
    if (textes) dire(versHtml(textes));
    for (const bloc of appels) {
      if (bloc.name !== 'proposer_mise_a_jour' || message.stop_reason === 'max_tokens') { conv.claude.outils[bloc.id] = 'Appel non traité (outil inconnu ou réponse tronquée).'; continue; }
      const plan = planDepuisOutil(bloc.input || {});
      if (!plan.ops.length) { conv.claude.outils[bloc.id] = 'Aucun impact exploitable : vérifie les opérations et les passages.'; continue; }
      const ev = construireEvenement(plan, texte, { claude: true, exemple: conv.exempleSuivant });
      conv.claude.outils[bloc.id] = 'Aperçu affiché à l\'utilisateur, en attente de sa confirmation.';
      proposer(ev, { outil: bloc.id });
    }
    if (message.stop_reason === 'max_tokens') dire('La réponse de Claude a été coupée (longueur maximale). Reformulez plus court, ou utilisez le moteur local.');
    else if (!textes && !appels.length) dire('Claude n\'a rien répondu. Reformulez, ou passez au moteur local dans les réglages.');
  }

  // ===================================================================
  // Envoi d'un message
  // ===================================================================

  async function envoyer(texteBrut) {
    const texte = String(texteBrut || '').trim();
    if (!texte || conv.occupe) return;
    ajouter('moi', '', { texte });
    champ.value = '';
    rendreSuggestions(true);
    conv.occupe = true;
    const attente = ajouter('ia', '', { attente: true });
    try {
      if (moteur() === 'claude') {
        await traiterClaude(texte).finally(() => { conv.messages = conv.messages.filter((m) => m !== attente); });
      } else {
        await new Promise((ok) => setTimeout(ok, 320)); // le temps de lire sa propre question
        conv.messages = conv.messages.filter((m) => m !== attente);
        traiterLocal(texte);
      }
    } catch (err) {
      conv.messages = conv.messages.filter((m) => m !== attente);
      dire(`${icone('triangle-alert')} Connexion à Claude impossible (${esc(err.message)}). <button type="button" class="bouton petit" data-ia-local="${esc(texte)}">Répondre avec le moteur local</button>`);
    } finally {
      conv.occupe = false;
      conv.exempleSuivant = false;
      // Les suggestions d'abord : elles réduisent la hauteur du fil, qui défile ensuite jusqu'au dernier message.
      rendreSuggestions();
      rendreFil();
    }
  }

  // ===================================================================
  // Accueil, suggestions, réglages, ouverture du panneau
  // ===================================================================

  const EXEMPLES_DEMO = [
    { libelle: 'Sophie valide SEC-210', texte: 'Courriel de Sophie Lambert (sécurité), 2 octobre : Re-test de SEC-210 concluant. Le journal d\'audit contient maintenant l\'identifiant du dossier et le résultat. J\'accepte le correctif : SEC-210 est validé et fermé.' },
    { libelle: 'Boréal propose le 29 octobre', texte: 'Courriel de Julien Moreau (Boréal), 1er octobre : le runbook ne sera pas prêt à temps. Nous proposons de décaler la mise en production au 29 octobre pour finaliser le rollback.' },
    { libelle: 'Boréal dit ACC-303 validé', texte: 'Message de Julien Moreau (Boréal) : ACC-303 est corrigé et validé de notre côté, vous pouvez fermer le ticket.' },
  ];
  const EXEMPLES_VIERGE = [
    { libelle: 'Nom et responsable', texte: 'Le projet s\'appelle Atlas. Marie Dupont est la cheffe de projet depuis le 1er octobre.' },
    // Sans autorité nommée : l'assistant demande qui a approuvé (une date n'est jamais « approuvée » par défaut).
    { libelle: 'Une date', texte: 'La mise en production est fixée au 15 novembre.' },
    { libelle: 'Une condition', texte: 'Condition de lancement : le test de charge doit être validé par Karim Benali.' },
    { libelle: 'Une action', texte: 'Nouvelle action : former les équipes support, responsable Paul Martin, pour le 5 novembre.' },
  ];

  function rendreSuggestions(masquer) {
    if (masquer || conv.occupe) { zoneSuggestions.innerHTML = ''; return; }
    const questions = DEMO ? ['Où en est le projet ?', 'Qui a approuvé le report ?', 'Que reste-t-il avant le lancement ?', 'Combien a-t-on payé ?'] : ['Où en est le projet ?', 'Que reste-t-il à faire ?'];
    const exemples = DEMO ? EXEMPLES_DEMO : EXEMPLES_VIERGE;
    zoneSuggestions.innerHTML = `<div class="suggestions-ligne">${questions.map((q) => `<button type="button" class="puce" data-ia-envoyer="${esc(q)}">${esc(q)}</button>`).join('')}</div>
      <div class="suggestions-ligne">${exemples.map((x, i) => `<button type="button" class="puce puce-essai" data-ia-exemple="${i}" title="${esc(x.texte)}">${icone('wand-sparkles')}${DEMO ? 'Essai : ' : ''}${esc(x.libelle)}</button>`).join('')}</div>`;
  }

  function accueil() {
    if (DEMO) {
      dire(`<p><strong>Bonjour !</strong> Je connais le dossier NOVA par cœur : 64 documents, la décision du 22 octobre, ses conditions.</p>
        <p>Posez-moi une question : je réponds avec les preuves. Collez une nouvelle information (un courriel, un compte rendu, une décision) : je prépare la mise à jour, je vérifie les garde-fous, et vous validez.</p>
        <p class="petit doux">Les boutons « Essai » préparent des messages fictifs pour voir l'assistant au travail. Ils sont marqués EXEMPLE partout.</p>`);
    } else {
      dire(`<p><strong>Bonjour !</strong> Ce dossier est vierge. Parlez-moi de votre projet comme à un collègue : qui le pilote, ce qui est décidé, ce qui reste à faire.</p>
        <p>Je range chaque information au bon endroit (responsable, date, conditions, actions) et je garde le message d'origine comme source. Rien n'est modifié sans votre accord.</p>`);
    }
    rendreSuggestions();
  }

  function rendreReglages() {
    const zone = $('#assistant-panneau-reglages');
    const actif = moteur();
    zone.innerHTML = `<p class="reglages-titre">${icone('plug')}Moteur de l'assistant</p>
      <label class="reglage-choix"><input type="radio" name="moteur-ia" value="local" ${actif === 'local' ? 'checked' : ''}> <span><strong>Local</strong> · sans connexion, par règles. Recommandé pour la démonstration.</span></label>
      <label class="reglage-choix"><input type="radio" name="moteur-ia" value="claude" ${actif === 'claude' ? 'checked' : ''}> <span><strong>Claude</strong> (Anthropic) · avec votre propre clé API, compréhension libre.</span></label>
      <div class="champ"><label for="cle-claude">${icone('key-round')}Clé API Anthropic</label><input id="cle-claude" type="password" autocomplete="off" placeholder="sk-ant-…" value="${lireSession(CLE_CLAUDE) ? '••••••••••••' : ''}"></div>
      <div class="champ"><label for="modele-claude">Modèle</label><input id="modele-claude" type="text" value="${esc(lireSession(CLE_MODELE) || MODELE_DEFAUT)}"></div>
      <p class="petit doux">La clé reste dans cet onglet (stockage de session) : elle n'est ni exportée ni écrite dans le fichier. Les messages et un résumé du dossier sont envoyés à l'API d'Anthropic. Les mises à jour proposées par Claude passent par les mêmes garde-fous et attendent votre accord.</p>
      <div class="groupe-boutons"><button type="button" class="bouton primaire petit" data-ia-reglages="enregistrer">${icone('save')}Enregistrer</button>
        <button type="button" class="bouton petit" data-ia-reglages="oublier">${icone('trash-2')}Oublier la clé</button></div>`;
  }
  function majMoteur() {
    $('#assistant-moteur').textContent = moteur() === 'claude' ? `Claude · ${lireSession(CLE_MODELE) || MODELE_DEFAUT}` : 'Moteur local · sans connexion';
  }

  function ouvrir(options) {
    const o = options || {};
    document.body.classList.add('assistant-ouvert');
    panneau.setAttribute('aria-hidden', 'false');
    panneau.inert = false;
    if (!conv.messages.length) accueil();
    if (o.brouillon) { champ.value = o.brouillon; conv.exempleSuivant = false; }
    if (o.exemple != null) {
      // Message d'essai prêt à envoyer (guide, boutons « Essai ») : marqué EXEMPLE en démo.
      const x = (DEMO ? EXEMPLES_DEMO : EXEMPLES_VIERGE)[o.exemple];
      if (x) { champ.value = x.texte; conv.exempleSuivant = DEMO; }
    }
    if (o.envoyer) envoyer(o.envoyer);
    setTimeout(() => champ.focus({ preventScroll: true }), 60);
  }
  function fermer() {
    document.body.classList.remove('assistant-ouvert');
    panneau.setAttribute('aria-hidden', 'true');
    panneau.inert = true;
    const b = $('#form-question button');
    if (b) b.focus({ preventScroll: true });
  }
  function nouvelleConversation() {
    conv.messages = [];
    conv.attente = null;
    conv.claude = { historique: [], etatEnvoye: null, outils: {}, etatDansUser: false };
    accueil();
  }

  // ===================================================================
  // Événements
  // ===================================================================

  panneau.inert = true;
  $('#assistant-form').addEventListener('submit', (ev) => { ev.preventDefault(); envoyer(champ.value); });
  champ.addEventListener('keydown', (ev) => {
    if (ev.key === 'Enter' && !ev.shiftKey) { ev.preventDefault(); envoyer(champ.value); }
    if (ev.key === 'Escape') fermer();
  });
  champ.addEventListener('input', () => { if (!champ.value.trim()) conv.exempleSuivant = false; });
  $('#assistant-fermer').addEventListener('click', fermer);
  $('#assistant-nouveau').addEventListener('click', nouvelleConversation);
  $('#assistant-reglages').addEventListener('click', () => {
    const zone = $('#assistant-panneau-reglages');
    zone.hidden = !zone.hidden;
    $('#assistant-reglages').setAttribute('aria-expanded', String(!zone.hidden));
    if (!zone.hidden) rendreReglages();
  });
  panneau.addEventListener('click', (ev) => {
    const b = ev.target.closest('[data-preuve-ia], [data-ia-appliquer], [data-ia-ignorer], [data-ia-annuler], [data-ia-envoyer], [data-ia-exemple], [data-ia-repondre], [data-ia-reglages], [data-ia-local], [data-ia-question]');
    if (!b) return;
    if (b.dataset.preuveIa !== undefined) A.ouvrirPreuve(conv.preuves[+b.dataset.preuveIa]);
    else if (b.dataset.iaAppliquer) appliquer(b.dataset.iaAppliquer);
    else if (b.dataset.iaIgnorer) ignorer(b.dataset.iaIgnorer);
    else if (b.dataset.iaAnnuler) annuler(b.dataset.iaAnnuler);
    else if (b.dataset.iaEnvoyer) envoyer(b.dataset.iaEnvoyer);
    else if (b.dataset.iaRepondre) envoyer(b.dataset.iaRepondre);
    else if (b.dataset.iaExemple !== undefined) {
      const x = (DEMO ? EXEMPLES_DEMO : EXEMPLES_VIERGE)[+b.dataset.iaExemple];
      champ.value = x.texte;
      conv.exempleSuivant = DEMO; // en démo, les essais sont des messages fictifs, marqués EXEMPLE
      champ.focus();
    } else if (b.dataset.iaLocal) {
      const t = b.dataset.iaLocal;
      traiterLocal(t);
    } else if (b.dataset.iaQuestion) {
      etat.questionSurlignee = b.dataset.iaQuestion;
    } else if (b.dataset.iaReglages === 'enregistrer') {
      const choix = (panneau.querySelector('input[name="moteur-ia"]:checked') || {}).value || 'local';
      const cle = $('#cle-claude').value.trim();
      if (cle && !/^•+$/.test(cle)) ecrireSession(CLE_CLAUDE, cle);
      ecrireSession(CLE_MODELE, $('#modele-claude').value.trim() || MODELE_DEFAUT);
      if (choix === 'claude' && !lireSession(CLE_CLAUDE)) { dire('Indiquez votre clé API Anthropic pour utiliser Claude. Le moteur local reste actif.'); ecrireSession(CLE_MOTEUR, 'local'); }
      else ecrireSession(CLE_MOTEUR, choix);
      $('#assistant-panneau-reglages').hidden = true;
      $('#assistant-reglages').setAttribute('aria-expanded', 'false');
      majMoteur();
      conv.claude = { historique: [], etatEnvoye: null, outils: {}, etatDansUser: false };
      dire(moteur() === 'claude' ? `Connecteur Claude activé (${esc(lireSession(CLE_MODELE) || MODELE_DEFAUT)}). Les propositions passeront par les mêmes garde-fous.` : 'Moteur local activé : tout reste dans ce navigateur, sans connexion.');
    } else if (b.dataset.iaReglages === 'oublier') {
      ecrireSession(CLE_CLAUDE, null);
      ecrireSession(CLE_MOTEUR, 'local');
      rendreReglages();
      majMoteur();
    }
  });
  document.addEventListener('keydown', (ev) => {
    if (ev.key === 'Escape' && document.body.classList.contains('assistant-ouvert') && panneau.contains(document.activeElement)) fermer();
  });
  majMoteur();

  window.NOVA_ASSISTANT = {
    ouvrir, fermer, envoyer, conv,
    // Exposés pour les tests automatiques (moteur local, sans interface).
    _analyser: analyserInformation, _classer: classer, _construire: construireEvenement, _extraireDates: extraireDates,
  };
})();
