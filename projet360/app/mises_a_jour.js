/* Espace 5 (suite) : ajouter un événement, comparer avant / après, exporter.
   Une mise à jour ne modifie jamais la version initiale : elle s'applique par-dessus. */
(function () {
  'use strict';
  const A = window.NOVA_APP;
  const { etat, BASE, C, MODE, $, $$, esc, fmtDate, fmtDateHeure, fmtMontant, badge, badgeEtat, badgeNature, boutonPreuve, icone, tuile } = A;
  const DEMO = MODE === 'demo';
  const questionExiste = (id) => A.etat.actualise.questions.some((q) => q.id === id);

  // ===================================================================
  // Brouillon du formulaire (conservé entre deux affichages)
  // ===================================================================

  const dateParDefaut = () => {
    if (DEMO) return '2026-09-30T10:00';
    const d = new Date(Date.now() - new Date().getTimezoneOffset() * 60000);
    return d.toISOString().slice(0, 16);
  };
  const nouveauBrouillon = () => ({
    titre: '', date: dateParDefaut(), type: 'Courriel', auteur: '', autorite: 'officielle', texte: '', fichier: null,
    methode: 'assistee', resume: '', impacts: [], inchange: '', message: '', erreurs: [], apercu: null,
  });
  let brouillon = nouveauBrouillon();

  const TYPES_IMPACT = {
    condition: "Changer l'état d'une condition de go-live",
    proposition_date: 'Nouvelle proposition de date (non approuvée)',
    decision_date: 'Décision approuvée de date',
    reponse: 'Ajouter une mise à jour à une réponse (Q01 à Q10)',
    action_etat: "Changer l'état ou le responsable d'une action",
    action_nouvelle: 'Ajouter une action',
    synthese: 'Note sur le responsable, la portée ou les finances',
  };
  const AUTORITES_FORM = ['decision', 'officielle', 'ticket', 'fournisseur', 'finance', 'brouillon', 'non_officielle'];
  const ETATS_CONDITION = ['ouvert', 'correctif_annonce', 'correctif_livre', 'valide', 'rouvert'];
  const ETATS_ACTION = ['a_faire', 'en_cours', 'en_attente', 'partiel', 'fait', 'non_fait', 'annule'];
  const NATURES_FORM = ['information', 'proposition', 'decision_approuvee', 'correctif_livre', 'validation_obtenue', 'probleme'];
  const SUJET_CONDITION = { C1: 'securite', C2: 'accessibilite', C3: 'exploitation' };

  function impactParDefaut(type) {
    const base = { type, passage: '', nature: 'information', note: '' };
    if (type === 'condition') return Object.assign(base, { condition: 'C1', etat: 'correctif_livre', nature: 'correctif_livre' });
    if (type === 'proposition_date') return Object.assign(base, { date: '', propose_par: '', motif: '', nature: 'proposition' });
    if (type === 'decision_date') return Object.assign(base, { date: '', autorite: '', nature: 'decision_approuvee' });
    if (type === 'reponse') return Object.assign(base, { question: 'Q01', remplacer: false, reponse_courte: '' });
    if (type === 'action_etat') return Object.assign(base, { action: 'A01', etat: 'en_cours', responsable: '', echeance: '' });
    if (type === 'action_nouvelle') return Object.assign(base, { titre: '', responsable: '', responsable_statut: 'propose', echeance: '', type_action: 'recommandation', condition: '' });
    if (type === 'synthese') return Object.assign(base, { champ: 'finances' });
    return base;
  }

  // ===================================================================
  // Indices tirés du texte de la nouvelle source (aide, jamais une décision)
  // ===================================================================

  function analyserTexte(texte) {
    const t = C.sansAccents(texte || '').toLowerCase();
    const indices = [];
    if (!t.trim()) return indices;
    if (/sec-?210|securite|audit|journalisation/.test(t)) indices.push({ type: 'condition', condition: 'C1', libelle: 'Condition C1 (SEC-210, sécurité)' });
    if (/acc-?303|accessibilite|clavier|focus|modale/.test(t)) indices.push({ type: 'condition', condition: 'C2', libelle: 'Condition C2 (ACC-303, accessibilité)' });
    if (/ops-?601|runbook|rollback|retour arriere|exploitation/.test(t)) indices.push({ type: 'condition', condition: 'C3', libelle: 'Condition C3 (runbook)' });
    const dates = [...t.matchAll(/(\d{1,2})(?:er)?\s+(octobre|novembre|decembre)/g)].map((m) => m[0]);
    if (dates.length && /(propos|recommand|suggere|demand|deplac|report)/.test(t)) indices.push({ type: 'proposition_date', libelle: `Proposition de date (${[...new Set(dates)].join(', ')})` });
    if (dates.length && /(approuv|decid|entérin|enterin|valide la date|officiel)/.test(t)) indices.push({ type: 'decision_date', libelle: 'Décision de date possible : vérifiez qui approuve (comité ?)' });
    if (/inv-?\d+|facture|cr-?0\d|montant|\$/.test(t)) indices.push({ type: 'synthese', champ: 'finances', libelle: 'Finances (facture, CR, montant)' });
    if (/charge de projet|responsable du projet|reprend/.test(t)) indices.push({ type: 'synthese', champ: 'responsable', libelle: 'Responsable du projet' });
    const natures = [];
    if (/(propos|recommand|suggere)/.test(t)) natures.push('proposition');
    if (/(approuv|decid|entérin|enterin)/.test(t)) natures.push('decision_approuvee');
    if (/(livre|deploy|corrige|pousse)/.test(t)) natures.push('correctif_livre');
    if (/(valide|accepte|re-?test ok|ferme)/.test(t)) natures.push('validation_obtenue');
    return { indices, natures };
  }

  // ===================================================================
  // Conversion du formulaire en événement (même format que les fichiers JSON)
  // ===================================================================

  const ORDRE_NATURE = ['decision_approuvee', 'validation_obtenue', 'correctif_livre', 'proposition', 'probleme', 'information'];

  function identifiants() {
    const d = (brouillon.date || '2026-09-30T10:00').replace(/[^0-9]/g, '').slice(0, 12);
    let id = 'MAJ-' + d;
    let n = 1;
    const existants = new Set(etat.evenements.map((e) => e.id));
    while (existants.has(n > 1 ? id + '-' + n : id)) n++;
    id = n > 1 ? id + '-' + n : id;
    return { id, source: 'NS-' + id.slice(4) };
  }

  function construireEvenement() {
    const b = brouillon;
    const { id, source } = identifiants();
    const erreurs = [];
    if (!b.titre.trim()) erreurs.push('Donnez un titre à la nouvelle information.');
    if (!b.date) erreurs.push('Indiquez la date et l\'heure de la nouvelle information.');
    if (!b.texte.trim() && !b.fichier) erreurs.push('Collez le texte de la source ou joignez le fichier.');
    if (!b.resume.trim()) erreurs.push('Résumez « ce qui vient de changer ».');
    if (!b.impacts.length) erreurs.push('Ajoutez au moins un impact (ce que la nouvelle information modifie).');
    const date = b.date.length === 16 ? b.date + ':00-04:00' : b.date;
    const impacts = [];
    const sujets = new Set();
    b.impacts.forEach((im, i) => {
      const n = `Impact ${i + 1}`;
      if (!im.passage.trim()) erreurs.push(`${n} : copiez le passage de la source qui le justifie.`);
      const commun = { nature: im.nature, passage: im.passage.trim(), repere: 'Nouvelle source' };
      if (im.type === 'condition') {
        const c = A.etat.actualise.synthese.conditions.find((x) => x.id === im.condition);
        impacts.push(Object.assign({ cible: 'conditions/' + im.condition, modifs: { etat: im.etat }, note: im.note || undefined }, commun));
        sujets.add(SUJET_CONDITION[im.condition]);
        // Les réponses liées reçoivent une note visible.
        (c ? c.questions || [] : []).filter(questionExiste).forEach((q) => impacts.push(Object.assign({ cible: 'questions/' + q, note: `${im.condition} (${c.titre}) : ${(C.ETATS[im.etat] || {}).libelle || im.etat}.${im.note ? ' ' + im.note : ''}` }, commun)));
      } else if (im.type === 'proposition_date') {
        if (!im.date) erreurs.push(`${n} : indiquez la date proposée.`);
        const texte = fmtDate(im.date, true);
        impacts.push(Object.assign({ ajouter: 'propositions', objet: { id: 'P-' + id.slice(4), date_proposee: im.date, texte, propose_par: im.propose_par, motif: im.motif, statut: 'En attente de décision' } }, commun, { nature: 'proposition' }));
        const decideur = DEMO ? 'Nicolas Perron (comité de direction)' : (A.etat.actualise.synthese.responsable.nom || 'Responsable du projet');
        impacts.push(Object.assign({ ajouter: 'actions', objet: { id: 'A-' + id.slice(4), titre: `Faire trancher la proposition du ${texte} par l'autorité compétente${DEMO ? ' (comité de direction)' : ''}`, condition: null, responsable: decideur, responsable_statut: 'propose', echeance: null, echeance_texte: 'À confirmer', etat: 'a_faire', type: 'recommandation' } }, commun, { nature: 'proposition' }));
        if (questionExiste('Q01')) impacts.push(Object.assign({ cible: 'questions/Q01', note: `Nouvelle proposition (non approuvée) : ${texte}${im.propose_par ? ', par ' + im.propose_par : ''}. La date approuvée reste ${A.etat.actualise.synthese.date_mep.texte || 'non définie'} tant qu'aucune décision n'est prise.` }, commun, { nature: 'proposition' }));
        sujets.add('date');
      } else if (im.type === 'decision_date') {
        if (!im.date) erreurs.push(`${n} : indiquez la nouvelle date approuvée.`);
        if (!im.autorite.trim()) erreurs.push(`${n} : indiquez qui a approuvé (ex. : comité de direction).`);
        const texte = fmtDate(im.date, true);
        impacts.push(Object.assign({ cible: 'synthese/date_mep', modifs: { approuvee: im.date, texte, autorite: im.autorite, date_decision: date.slice(0, 10), statut: 'Approuvée' }, note: im.note || `Nouvelle date approuvée : ${texte} (${im.autorite}).` }, commun, { nature: 'decision_approuvee' }));
        if (questionExiste('Q01')) impacts.push(Object.assign({ cible: 'questions/Q01', note: `Nouvelle date approuvée : ${texte} par ${im.autorite}. Vérifiez si les conditions de go-live restent valables.` }, commun, { nature: 'decision_approuvee' }));
        if (questionExiste('Q03')) impacts.push(Object.assign({ cible: 'questions/Q03', note: `Nouvelle approbation : ${im.autorite}, le ${fmtDate(date)}.` }, commun, { nature: 'decision_approuvee' }));
        sujets.add('date');
      } else if (im.type === 'reponse') {
        const modifs = im.remplacer && im.reponse_courte.trim() ? { reponse_courte: im.reponse_courte.trim() } : undefined;
        if (!im.note.trim() && !modifs) erreurs.push(`${n} : écrivez le texte de mise à jour de la réponse.`);
        impacts.push(Object.assign({ cible: 'questions/' + im.question, note: im.note.trim() || undefined, modifs }, commun));
      } else if (im.type === 'action_etat') {
        const modifs = { etat: im.etat };
        if (im.responsable.trim()) Object.assign(modifs, { responsable: im.responsable.trim() });
        if (im.echeance) Object.assign(modifs, { echeance: im.echeance, echeance_texte: fmtDate(im.echeance) });
        impacts.push(Object.assign({ cible: 'actions/' + im.action, modifs, note: im.note || undefined }, commun));
      } else if (im.type === 'action_nouvelle') {
        if (!im.titre.trim() || !im.responsable.trim()) erreurs.push(`${n} : indiquez le titre et le responsable de l'action.`);
        const nb = A.etat.actualise.actions.length + impacts.filter((x) => x.ajouter === 'actions').length + 1;
        impacts.push(Object.assign({ ajouter: 'actions', objet: { id: 'A' + String(nb).padStart(2, '0'), titre: im.titre.trim(), condition: im.condition || null, responsable: im.responsable.trim(), responsable_statut: im.responsable_statut, echeance: im.echeance || null, echeance_texte: im.echeance ? fmtDate(im.echeance) : 'À confirmer', etat: 'a_faire', type: im.type_action } }, commun));
      } else if (im.type === 'synthese') {
        if (!im.note.trim()) erreurs.push(`${n} : écrivez la note.`);
        impacts.push(Object.assign({ cible: 'synthese/' + im.champ, note: im.note.trim() }, commun));
        if (im.champ === 'finances') sujets.add('finances');
        if (im.champ === 'portee') sujets.add('portee');
        if (im.champ === 'responsable') sujets.add('gouvernance');
      }
    });
    const natures = b.impacts.map((im) => im.nature);
    const nature = ORDRE_NATURE.find((x) => natures.includes(x)) || 'information';
    const ev = {
      id, titre: b.titre.trim(), date, nature, resume: b.resume.trim(), sujets: [...sujets].filter(Boolean),
      methode: b.methode === 'assistee' ? 'Analyse humaine assistée par Claude (déclarée)' : 'Analyse humaine',
      source: { id: source, titre: b.titre.trim(), type: b.type, auteur: b.auteur.trim(), date: date.slice(0, 10), autorite: b.autorite, texte: b.texte, fichier: b.fichier || undefined },
      impacts,
      inchange: b.inchange.split('\n').map((x) => x.trim()).filter(Boolean),
      cree_le: new Date().toISOString(),
    };
    // Garde-fous (mêmes règles que l'outil de vérification).
    impacts.forEach((im) => C.controlerImpact(im, ev).forEach((e) => erreurs.push(e)));
    return { ev, erreurs: [...new Set(erreurs)] };
  }

  // Ce qui ne change pas : calculé, puis modifiable.
  function suggestionsInchange() {
    const s = A.etat.actualise.synthese;
    const touchees = new Set(brouillon.impacts.filter((i) => i.type === 'condition').map((i) => i.condition));
    const lignes = [];
    if (!brouillon.impacts.some((i) => i.type === 'decision_date')) lignes.push(s.date_mep.texte ? `La date approuvée reste le ${s.date_mep.texte} : aucune nouvelle décision d'approbation.` : 'Aucune date approuvée : la date reste à définir.');
    s.conditions.filter((c) => !touchees.has(c.id)).forEach((c) => lignes.push(`${c.id} (${c.titre}) reste : ${(C.ETATS[c.etat] || {}).libelle}.`));
    return lignes.join('\n');
  }

  // ===================================================================
  // Affichage : formulaire
  // ===================================================================

  const options = (liste, valeur, libelle) => liste.map((v) => `<option value="${esc(v)}" ${v === valeur ? 'selected' : ''}>${esc(libelle ? libelle(v) : v)}</option>`).join('');

  function champsImpact(im, i) {
    const e = A.etat.actualise;
    const champ = (nom, label, html, aide) => `<div class="champ"><label for="im-${i}-${nom}">${label}</label>${html}${aide ? `<span class="aide">${aide}</span>` : ''}</div>`;
    const sel = (nom, liste, lib) => `<select id="im-${i}-${nom}" data-impact="${i}" data-champ="${nom}">${options(liste, im[nom], lib)}</select>`;
    const txt = (nom, ph, type) => `<input id="im-${i}-${nom}" type="${type || 'text'}" data-impact="${i}" data-champ="${nom}" value="${esc(im[nom] || '')}" placeholder="${esc(ph || '')}">`;
    const zone = (nom, ph) => `<textarea id="im-${i}-${nom}" data-impact="${i}" data-champ="${nom}" rows="2" placeholder="${esc(ph || '')}">${esc(im[nom] || '')}</textarea>`;
    const natureSel = champ('nature', 'Nature de cette information', sel('nature', NATURES_FORM, (v) => C.NATURES[v].libelle), esc((C.NATURES[im.nature] || {}).aide || ''));
    let html = '';
    if (im.type === 'condition') {
      const c = e.synthese.conditions.find((x) => x.id === im.condition);
      html += `<div class="ligne-champs">${champ('condition', 'Condition', sel('condition', e.synthese.conditions.map((x) => x.id), (v) => v + ' · ' + e.synthese.conditions.find((x) => x.id === v).titre))}
        ${champ('etat', 'Nouvel état', sel('etat', ETATS_CONDITION, (v) => C.ETATS[v].libelle), c ? 'État actuel : ' + esc(C.ETATS[c.etat].libelle) : '')}${natureSel}</div>
        ${im.etat === 'valide' ? `<p class="indice">Fermer une condition exige une <strong>validation obtenue</strong> de l'équipe responsable (${esc(c ? c.responsable : '')}). Un correctif livré ou une déclaration du fournisseur ne suffit pas : le passage cité doit montrer cette validation.</p>` : ''}
        ${champ('note', 'Précision (facultatif)', txt('note', 'ex. : correctif livré dans la build du 1er octobre, re-test à planifier'))}`;
    } else if (im.type === 'proposition_date') {
      html += `<div class="ligne-champs">${champ('date', 'Date proposée', txt('date', '', 'date'))}${champ('propose_par', 'Proposée par', txt('propose_par', 'ex. : Boréal (Julien Moreau)'))}${champ('motif', 'Motif', txt('motif', 'ex. : runbook non prêt'))}</div>
        <p class="indice">La date approuvée ne change pas : la proposition s'affiche « en attente », et une action de décision est ajoutée automatiquement.</p>`;
    } else if (im.type === 'decision_date') {
      html += `<div class="ligne-champs">${champ('date', 'Nouvelle date approuvée', txt('date', '', 'date'))}${champ('autorite', 'Qui a approuvé ?', txt('autorite', 'ex. : Comité de direction NOVA'), 'Obligatoire. Sans approbation explicite, utilisez « Nouvelle proposition ».')}</div>
        ${champ('note', 'Précision (facultatif)', txt('note', 'ex. : conditions de go-live maintenues'))}`;
    } else if (im.type === 'reponse') {
      html += `<div class="ligne-champs">${champ('question', 'Réponse concernée', sel('question', e.questions.map((q) => q.id), (v) => v + ' · ' + e.questions.find((q) => q.id === v).question.slice(0, 60) + '…'))}${natureSel}</div>
        ${champ('note', 'Texte de mise à jour (affiché au-dessus de la réponse)', zone('note', 'ex. : Boréal propose le 29 octobre ; la date approuvée reste le 22 octobre.'))}
        <label class="petit"><input type="checkbox" data-impact="${i}" data-champ="remplacer" ${im.remplacer ? 'checked' : ''}> Remplacer aussi la réponse courte</label>
        ${im.remplacer ? champ('reponse_courte', 'Nouvelle réponse courte', zone('reponse_courte', '')) : ''}`;
    } else if (im.type === 'action_etat') {
      const a = e.actions.find((x) => x.id === im.action);
      html += `<div class="ligne-champs">${champ('action', 'Action', sel('action', e.actions.map((x) => x.id), (v) => v + ' · ' + e.actions.find((x) => x.id === v).titre.slice(0, 55) + '…'))}
        ${champ('etat', 'Nouvel état', sel('etat', ETATS_ACTION, (v) => C.ETATS[v].libelle), a ? 'Actuel : ' + esc(C.ETATS[a.etat].libelle) : '')}${natureSel}</div>
        <div class="ligne-champs">${champ('responsable', 'Nouveau responsable (facultatif)', txt('responsable', a ? a.responsable : ''))}${champ('echeance', 'Échéance (si la source la donne)', txt('echeance', '', 'date'), 'Laissez vide si aucune date n\'est écrite : « À confirmer ».')}</div>
        ${champ('note', 'Précision (facultatif)', txt('note', ''))}`;
    } else if (im.type === 'action_nouvelle') {
      html += `${champ('titre', 'Action', txt('titre', 'ex. : Re-tester ACC-303 sur la build du 1er octobre'))}
        <div class="ligne-champs">${champ('responsable', 'Responsable', txt('responsable', 'ex. : Mélissa Gagnon'))}
        ${champ('responsable_statut', 'Responsable', sel('responsable_statut', ['confirme', 'propose'], (v) => (v === 'confirme' ? 'Confirmé par la source' : 'Proposé par l\'équipe')))}
        ${champ('echeance', 'Échéance', txt('echeance', '', 'date'), 'Vide = « À confirmer ».')}</div>
        <div class="ligne-champs">${champ('type_action', 'Type', sel('type_action', ['engagement', 'recommandation'], (v) => (v === 'engagement' ? 'Engagement documenté' : "Recommandation de l'équipe")))}
        ${champ('condition', 'Condition liée', sel('condition', ['', 'C1', 'C2', 'C3'], (v) => v || 'Aucune'))}${natureSel}</div>`;
    } else if (im.type === 'synthese') {
      html += `<div class="ligne-champs">${champ('champ', 'Élément', sel('champ', ['responsable', 'portee', 'finances'], (v) => ({ responsable: 'Responsable', portee: 'Portée', finances: 'Finances' }[v])))}${natureSel}</div>
        ${champ('note', 'Note', zone('note', 'ex. : Boréal émet une note de crédit de 18 000 $ pour INV-003.'))}`;
    }
    html += champ('passage', 'Passage de la source qui justifie cet impact', zone('passage', 'Copiez-collez la phrase exacte de la nouvelle source'), 'Il sera surligné comme preuve.');
    return html;
  }

  function rendreFormulaire() {
    const b = brouillon;
    const analyse = analyserTexte(b.texte);
    const indices = (analyse.indices || []).map((x, k) => `<li>${esc(x.libelle)} <button type="button" class="bouton petit" data-ajouter-indice="${k}">Ajouter cet impact</button></li>`).join('');
    const nat = (analyse.natures || []).map((n) => C.NATURES[n].libelle).join(', ');
    const typesDisponibles = Object.entries(TYPES_IMPACT).filter(([k]) => (k !== 'condition' || A.etat.actualise.synthese.conditions.length) && (k !== 'reponse' || A.etat.actualise.questions.length) && (k !== 'action_etat' || A.etat.actualise.actions.length));
    return `<div class="formulaire-expert">
      <p class="intro">Saisissez la nouvelle source puis ce qu'elle change, champ par champ. ${DEMO ? 'La version initiale est conservée : vous pourrez toujours comparer. ' : ''}Pour une mise à jour permanente, exportez-la en JSON${DEMO ? ' et placez le fichier dans <code>donnees/evenements/</code>' : ''}.</p>
      <div class="ligne-champs">
        <div class="champ"><label for="f-titre">Titre</label><input id="f-titre" type="text" data-brouillon="titre" value="${esc(b.titre)}" placeholder="ex. : Courriel de Boréal · ACC-303 livré"></div>
        <div class="champ"><label for="f-date">Date et heure (heure de Montréal)</label><input id="f-date" type="datetime-local" data-brouillon="date" value="${esc(b.date)}"></div>
      </div>
      <div class="ligne-champs">
        <div class="champ"><label for="f-type">Type de source</label><select id="f-type" data-brouillon="type">${options(['Courriel', 'Compte rendu ou transcription', 'Ticket', 'Message Teams', 'Document', 'Facture', 'Autre'], b.type)}</select></div>
        <div class="champ"><label for="f-auteur">Auteur</label><input id="f-auteur" type="text" data-brouillon="auteur" value="${esc(b.auteur)}" placeholder="ex. : Julien Moreau (Boréal)"></div>
        <div class="champ"><label for="f-autorite">Autorité de la source</label><select id="f-autorite" data-brouillon="autorite">${options(AUTORITES_FORM, b.autorite, (v) => BASE.autorites[v].libelle)}</select></div>
      </div>
      <div class="champ"><label for="f-texte">Texte intégral de la source</label><textarea id="f-texte" data-brouillon="texte" rows="7" placeholder="Collez ici le courriel, le compte rendu ou le ticket">${esc(b.texte)}</textarea></div>
      <div class="champ"><label for="f-fichier">… ou joindre le fichier (texte, .eml, image ou PDF)</label><input id="f-fichier" type="file" accept=".txt,.eml,.md,.csv,image/*,application/pdf">
        ${b.fichier ? `<span class="aide">Fichier joint : ${esc(b.fichier.nom)} <button type="button" class="bouton petit" data-retirer-fichier>Retirer</button></span>` : ''}</div>
      ${indices || nat ? `<div class="indice"><strong>Indices repérés dans le texte</strong> (aide automatique par mots-clés : vérifiez vous-même, rien n'est décidé)<ul>${indices}</ul>${nat ? `<p class="petit" style="margin:0">Vocabulaire repéré : ${esc(nat)}. Attention : « proposer » n'est pas « approuver », et « livré » n'est pas « validé ».</p>` : ''}</div>` : ''}
      <div class="champ"><span class="etiquette">Méthode d'analyse (à déclarer)</span>
        <label><input type="radio" name="methode" data-brouillon="methode" value="humaine" ${b.methode === 'humaine' ? 'checked' : ''}> Analyse humaine</label>
        <label><input type="radio" name="methode" data-brouillon="methode" value="assistee" ${b.methode === 'assistee' ? 'checked' : ''}> Analyse humaine assistée par Claude</label></div>
      <div class="champ"><label for="f-resume">Qu'est-ce qui vient de changer ? (résumé)</label><textarea id="f-resume" data-brouillon="resume" rows="2">${esc(b.resume)}</textarea></div>
      <h4>Impacts : ce que la nouvelle information modifie</h4>
      ${b.impacts.map((im, i) => `<div class="impact"><div class="groupe-boutons" style="justify-content:space-between"><strong>Impact ${i + 1} · ${esc(TYPES_IMPACT[im.type])}</strong>
        <button type="button" class="bouton petit danger" data-retirer-impact="${i}">Retirer</button></div>${champsImpact(im, i)}</div>`).join('')}
      <div class="groupe-boutons"><label for="f-nouvel-impact" class="visuellement-cache">Type d'impact</label>
        <select id="f-nouvel-impact">${typesDisponibles.map(([k, v]) => `<option value="${k}">${esc(v)}</option>`).join('')}</select>
        <button type="button" class="bouton" data-ajouter-impact>${icone('plus')}Ajouter un impact</button></div>
      <div class="champ" style="margin-top:1rem"><label for="f-inchange">Ce qui ne change pas (une ligne par point)</label>
        <textarea id="f-inchange" data-brouillon="inchange" rows="3">${esc(b.inchange)}</textarea>
        <span class="aide"><button type="button" class="bouton petit" data-suggerer-inchange>Proposer automatiquement</button> Rappel : une mise à jour ne ferme pas les autres conditions.</span></div>
      ${b.erreurs.length ? `<div class="encadre ton-rouge" role="alert"><strong>À corriger avant d'enregistrer :</strong><ul>${b.erreurs.map((e) => `<li>${esc(e)}</li>`).join('')}</ul></div>` : ''}
      ${b.message ? `<div class="encadre ton-vert" role="status">${esc(b.message)}</div>` : ''}
      <div class="groupe-boutons" style="margin-top:.6rem">
        <button type="button" class="bouton" data-maj="apercu">${icone('eye')}Prévisualiser l'avant / après</button>
        <button type="button" class="bouton primaire" data-maj="enregistrer">${icone('save')}Enregistrer la mise à jour</button>
        <button type="button" class="bouton" data-maj="vider">${icone('x')}Vider le formulaire</button></div>
      ${b.apercu ? `<div style="margin-top:1rem"><h4>Aperçu (non enregistré)</h4>${carteJournal(b.apercu.entree, b.apercu.ev, b.apercu.etat)}</div>` : ''}
    </div>`;
  }

  // Onglet « Mises à jour » : l'assistant d'abord, les outils ensuite, le formulaire complet en mode expert.
  function rendreMisesAJour() {
    return `<section class="carte appel-assistant" id="d-assistant">${tuile('bell-ring')}<div><strong>Une nouvelle information ?</strong>
        <p>Collez-la dans l'assistant (courriel, compte rendu, décision) : il propose la mise à jour, vérifie les garde-fous, et vous validez.${DEMO ? ' La version initiale est conservée.' : ''}</p></div>
        <button type="button" class="bouton primaire" data-ouvrir-assistant="">${icone('sparkles')}Ouvrir l'assistant</button></section>
      <div class="groupe-boutons outils-maj"><label class="bouton" for="f-import">${icone('upload')}Importer une mise à jour (.json)</label><input id="f-import" type="file" accept=".json,application/json" class="visuellement-cache">
        ${DEMO ? (etat.exempleActif ? '<button type="button" class="bouton danger" data-maj="exemple-off">Retirer l\'exemple fictif</button>' : (A.BRUT.exemples.length ? '<button type="button" class="bouton" data-maj="exemple-on">S\'entraîner avec l\'exemple fictif</button>' : '')) : ''}</div>
      ${DEMO ? '<p class="petit doux" style="margin:.4rem 0 0">L\'exemple fictif sert seulement à répéter la démonstration : il ne fait pas partie du corpus et il est signalé partout.</p>' : ''}
      ${!etat.expertOuvert && brouillon.message ? `<div class="encadre ton-vert" role="status" style="margin-top:var(--e3)">${esc(brouillon.message)}</div>` : ''}
      ${!etat.expertOuvert && brouillon.erreurs.length ? `<div class="encadre ton-rouge" role="alert" style="margin-top:var(--e3)"><ul>${brouillon.erreurs.map((e) => `<li>${esc(e)}</li>`).join('')}</ul></div>` : ''}
      ${etat.evenementsLocaux.length ? `<section class="carte" style="margin-top:var(--e4)"><h3 class="ligne-ic">${icone('save')}Mises à jour enregistrées dans ce navigateur</h3><ul class="liste-maj">${etat.evenementsLocaux.map((ev, k) => `<li><strong>${esc(ev.id)}</strong> · ${esc(ev.titre)} (${fmtDateHeure(ev.date)})${ev.exemple ? ' ' + badge('rouge', 'EXEMPLE', '!') : ''} <button type="button" class="bouton petit danger" data-supprimer-local="${k}">${icone('trash-2')}Supprimer</button></li>`).join('')}</ul></section>` : ''}
      ${rendreAvantApres()}
      <details class="carte accordeon" id="d-ajout"${etat.expertOuvert ? ' open' : ''}><summary><span class="accordeon-titre">${icone('pencil-line')}Formulaire expert</span><span class="accordeon-resume">saisir une mise à jour champ par champ</span></summary>
        <div class="accordeon-corps">${rendreFormulaire()}</div></details>`;
  }

  // ===================================================================
  // Affichage : avant / après
  // ===================================================================

  const CHAMPS_LIBELLES = { nom: 'Nom', role: 'Rôle', depuis: 'Depuis', autorise: 'Montant autorisé', etat: 'État', reponse_courte: 'Réponse courte', approuvee: 'Date approuvée', texte: 'Texte', autorite: 'Autorité', statut: 'Statut', responsable: 'Responsable', echeance: 'Échéance', echeance_texte: 'Échéance', date_decision: 'Date de décision', detail: 'Détail', echeance_note: "Note d'échéance" };

  function libelleCible(cible, e) {
    const [coll, id] = cible.split('/');
    const o = C.resoudreCible(e, cible) || {};
    if (coll === 'questions') return `${id} · ${o.question || ''}`;
    if (coll === 'conditions') return `Condition ${id} · ${o.titre || ''}`;
    if (coll === 'actions') return `Action ${id} · ${o.titre || ''}`;
    if (coll === 'synthese') return { date_mep: 'Date de mise en production', responsable: 'Responsable', portee: 'Portée', finances: 'Finances', projet: 'Nom du projet' }[id] || id;
    return cible;
  }
  const valeurAffichee = (champ, v) => (champ === 'etat' ? badgeEtat(v) : ['approuvee', 'echeance', 'date_decision', 'depuis'].includes(champ) ? (v ? fmtDate(v, true) : 'Non renseigné') : champ === 'autorise' ? (v == null ? 'Non renseigné' : fmtMontant(v)) : esc(v == null || v === '' ? 'Non renseigné' : String(v).slice(0, 200)));

  // Date d'ajout dans NOVA (horodatage réel de l'import), distincte de la date du fait.
  function ajouteLe(ev) {
    if (!ev.cree_le || isNaN(Date.parse(ev.cree_le))) return '';
    const f = new Intl.DateTimeFormat('fr-CA', { day: 'numeric', month: 'long', year: 'numeric', hour: '2-digit', minute: '2-digit', timeZone: 'America/Toronto' });
    return ` · Ajoutée dans NOVA le ${esc(f.format(new Date(ev.cree_le)))} (heure de Montréal)`;
  }

  function carteJournal(entree, ev, etatApres) {
    const src = ev.source || {};
    const modifs = entree.impacts.filter((x) => x.type === 'modification');
    const ajouts = entree.impacts.filter((x) => x.type === 'ajout');
    const conditionsTouchees = modifs.filter((m) => /^conditions\//.test(m.cible) && m.apres.etat);
    const actionsLiees = conditionsTouchees.flatMap((m) => (C.resoudreCible(etatApres, m.cible) || {}).actions || []).map((id) => etatApres.actions.find((a) => a.id === id)).filter(Boolean);
    const nouvellesActions = ajouts.filter((a) => a.collection === 'actions').map((a) => etatApres.actions.find((x) => x.id === a.id)).filter(Boolean);
    const actionsModifiees = modifs.filter((m) => /^actions\//.test(m.cible)).map((m) => C.resoudreCible(etatApres, m.cible)).filter(Boolean);
    const touchees = new Set(conditionsTouchees.map((m) => m.cible.split('/')[1]));
    const inchangeAuto = [];
    if (!modifs.some((m) => m.cible === 'synthese/date_mep' && m.apres.approuvee)) inchangeAuto.push(etatApres.synthese.date_mep.texte ? `Date approuvée inchangée : ${etatApres.synthese.date_mep.texte}.` : 'Aucune date approuvée.');
    etatApres.synthese.conditions.filter((c) => !touchees.has(c.id)).forEach((c) => inchangeAuto.push(`${c.id} inchangée : ${(C.ETATS[c.etat] || {}).libelle}.`));
    const preuveSource = src.id ? boutonPreuve({ source: src.id, repere: 'Nouvelle source (texte intégral)' }, { compact: true }) : '';
    const lignesModifs = modifs.map((m) => {
      const champs = Object.keys(m.apres || {});
      const cellules = champs.length
        ? champs.map((ch) => `<div><span class="petit doux">${esc(CHAMPS_LIBELLES[ch] || ch)} :</span> <span class="diff-avant">${valeurAffichee(ch, m.avant[ch])}</span> → <span class="diff-apres">${valeurAffichee(ch, m.apres[ch])}</span></div>`).join('')
        : `<span class="doux">${m.note ? 'Note de mise à jour ajoutée :' : 'Contenu inchangé'}</span>`;
      return `<tr><td><strong>${esc(libelleCible(m.cible, etatApres))}</strong></td><td>${cellules}${m.note ? `<div class="maj-note petit">${esc(m.note)}</div>` : ''}</td><td>${badgeNature(m.nature)}</td></tr>`;
    }).join('');
    const lignesAjouts = ajouts.map((a) => `<tr><td><strong>Nouveau : ${esc({ actions: 'action', propositions: 'proposition', chronologie: 'événement', risques: 'risque', conditions: 'condition', decisions: 'décision' }[a.collection] || a.collection)} ${esc(a.id || '')}</strong></td><td>${esc(a.titre || '')}</td><td>${badgeNature(a.nature)}</td></tr>`).join('');
    const ligneAction = (a) => `<li><strong>${esc(a.id)}</strong> ${esc(a.titre)} · ${esc(a.responsable)} ${a.responsable_statut === 'confirme' ? badge('vert', 'Confirmé', '✓') : badge('bleu', 'Proposé', '?')} · ${a.echeance ? fmtDate(a.echeance) : badge('ambre', a.echeance_texte || 'À confirmer', '?')} · ${badgeEtat(a.etat)}</li>`;
    return `<article class="carte">
      <div class="preuve-ligne"><h3 style="margin:0">${esc(ev.titre)}</h3>${badgeNature(ev.nature)} ${ev.exemple || String(ev.id).startsWith('EXEMPLE') ? badge('rouge', 'EXEMPLE FICTIF', '!') : ''}</div>
      <p class="petit doux">${esc(ev.id)} · Date du fait : ${fmtDateHeure(ev.date)}${ajouteLe(ev)} · Source : ${esc(src.titre || '')}${src.auteur ? ' (' + esc(src.auteur) + ')' : ''} · ${esc(ev.methode || '')} ${preuveSource}</p>
      <h4>1. Qu'est-ce qui vient de changer ?</h4><p>${esc(ev.resume || '')}</p>
      <h4>2. Quelles informations précédentes sont affectées ?</h4>
      <div class="table-wrap"><table><thead><tr><th>Élément</th><th>Avant → après</th><th>Nature</th></tr></thead><tbody>${lignesModifs}${lignesAjouts}</tbody></table></div>
      <h4 style="margin-top:.8rem">3. Quelles actions devraient être prises ?</h4>
      ${nouvellesActions.length || actionsModifiees.length || actionsLiees.length
        ? `<ul>${nouvellesActions.map(ligneAction).join('')}${actionsModifiees.filter((a) => !nouvellesActions.includes(a)).map(ligneAction).join('')}${actionsLiees.filter((a) => !actionsModifiees.includes(a) && !nouvellesActions.includes(a)).map(ligneAction).join('')}</ul>`
        : '<p class="doux">Aucune action touchée.</p>'}
      <h4>Ce qui ne change pas</h4><ul>${[...new Set([...(ev.inchange || []), ...inchangeAuto])].map((x) => `<li>${esc(x)}</li>`).join('')}</ul>
      ${entree.refuses.length ? `<div class="encadre ton-rouge"><strong>Impacts refusés par les garde-fous :</strong><ul>${entree.refuses.map((r) => `<li>${esc(r.impact.cible || r.impact.ajouter)} : ${esc(r.erreurs.join(' '))}</li>`).join('')}</ul></div>` : ''}
    </article>`;
  }

  function tableauComparaison() {
    const av = BASE.synthese, ap = A.etat.actualise.synthese;
    const ouvertes = (e) => e.actions.filter((a) => !C.ETATS_FERMES.includes(a.etat)).length;
    const ligne = (lib, a, b) => `<tr><td><strong>${esc(lib)}</strong></td><td>${a}</td><td>${b}</td><td>${a === b ? badge('gris', 'Inchangé') : badge('ambre', 'Modifié', '◆')}</td></tr>`;
    return `<div class="table-wrap"><table><thead><tr><th>Élément</th><th>Initiale (30 sept., 09 h)</th><th>Actualisée</th><th></th></tr></thead><tbody>
      ${ligne('Date approuvée', esc(av.date_mep.texte + ' · ' + av.date_mep.statut), esc(ap.date_mep.texte + ' · ' + ap.date_mep.statut))}
      ${ligne('Propositions en attente', esc((av.propositions || []).map((p) => p.texte).join(', ') || 'Aucune'), esc((ap.propositions || []).map((p) => p.texte + ' (non approuvée)').join(', ') || 'Aucune'))}
      ${av.conditions.map((c, k) => ligne(`Condition ${c.id} · ${c.titre}`, badgeEtat(c.etat), badgeEtat(ap.conditions[k].etat))).join('')}
      ${ligne('Conditions remplies', `${av.conditions.filter((c) => C.ETATS_FERMES.includes(c.etat)).length} / 3`, `${ap.conditions.filter((c) => C.ETATS_FERMES.includes(c.etat)).length} / 3`)}
      ${ligne('Actions ouvertes', String(ouvertes(BASE)), String(ouvertes(A.etat.actualise)))}
      ${ligne('Responsable', esc(av.responsable.nom), esc(ap.responsable.nom))}
      ${ligne('Montant autorisé', fmtMontant(av.finances.autorise), fmtMontant(ap.finances.autorise))}
    </tbody></table></div>`;
  }

  function rendreAvantApres() {
    if (!DEMO) {
      if (!etat.evenements.length) return '';
      const parIdV = Object.fromEntries(etat.evenements.map((e) => [e.id, e]));
      return `<section id="d-avant-apres"><div class="section"><h2>${icone('git-compare')}Ce que chaque information a changé</h2></div>
        ${etat.journal.slice().reverse().map((j) => carteJournal(j, parIdV[j.evenement], A.etat.actualise)).join('')}</section>`;
    }
    if (!etat.evenements.length) {
      return `<section id="d-avant-apres"><div class="section"><h2>${icone('git-compare')}Avant / après</h2></div>
        <div class="carte"><p style="margin:0">Aucune mise à jour pour l'instant : l'application affiche la situation initiale du 30 septembre 2026 à 09 h.</p></div></section>`;
    }
    const parId = Object.fromEntries(etat.evenements.map((e) => [e.id, e]));
    return `<section id="d-avant-apres"><div class="section"><h2>${icone('git-compare')}Avant / après</h2></div>
      <p class="intro">Comparaison entre la version initiale (conservée) et la version actualisée. ${etat.erreursMaj.length ? `<strong>${etat.erreursMaj.length} impact(s) refusé(s) par les garde-fous.</strong>` : ''}</p>
      ${tableauComparaison()}
      <h3 style="margin-top:1rem">Détail par mise à jour</h3>
      ${etat.journal.map((j) => carteJournal(j, parId[j.evenement], A.etat.actualise)).join('')}</section>`;
  }

  function rendreExport() {
    return `<section class="carte" id="d-export"><h3 class="ligne-ic">${icone('download')}Exporter</h3>
      <div class="groupe-boutons">
        <button type="button" class="bouton" data-export="evenements" ${etat.evenementsLocaux.length ? '' : 'disabled'}>${icone('file-json')}Mises à jour de ce navigateur (JSON)</button>
        <button type="button" class="bouton" data-export="etat">${icone('file-json')}État actualisé complet (JSON)</button>
        <button type="button" class="bouton" data-export="reponses">${icone('file-text')}Réponses et preuves (texte)</button>
        <button type="button" class="bouton" data-action="exporter-brief">${icone('file-down')}Brief de reprise (texte)</button>
        <button type="button" class="bouton" data-action="exporter-actions">${icone('sheet')}Actions (CSV)</button>
        <button type="button" class="bouton primaire" data-action="imprimer-brief">${icone('printer')}Imprimer le brief (1 page)</button></div>
      <p class="petit doux" style="margin-top:.5rem">Pour rendre une mise à jour permanente : exportez-la, placez le fichier dans <code>donnees/evenements/</code>, puis relancez <code>node outils/construire.mjs</code>.</p></section>`;
  }

  function reponsesTexte(e) {
    const lignes = [`# NOVA · Réponses et preuves`, `Situation au ${BASE.meta.date_situation_texte}${e !== BASE ? ' (version actualisée)' : ''}`, ''];
    for (const q of e.questions) {
      lignes.push(`## ${q.id}. ${q.question}`, '', q.reponse_courte, '');
      (q.notes_maj || []).forEach((n) => lignes.push(`> Mise à jour (${n.evenement}) : ${n.texte}`));
      (q.details || []).forEach((d) => lignes.push(`- ${d}`));
      lignes.push('', 'Preuves :');
      (q.preuves || []).forEach((p) => {
        const s = A.SOURCES[p.source] || {};
        lignes.push(`- ${p.source} · ${s.chemin || ''} · ${p.repere || ''}${p.cellules ? ' (cellules ' + p.cellules + ')' : ''}${p.passage ? ' : « ' + p.passage + (p.jusqua ? ' … ' + p.jusqua : '') + ' »' : ''}${p.lecture ? ' : ' + p.lecture : ''}`);
      });
      lignes.push('');
    }
    return lignes.join('\n');
  }

  // ===================================================================
  // Interactions
  // ===================================================================

  // Redessine l'onglet sans faire sauter la page (sauf si une ancre est demandée).
  function rerendre(ancre) {
    if (ancre) return A.rendre({ ancre });
    const y = window.scrollY;
    A.rendre();
    window.scrollTo(0, y);
  }

  function enregistrer(ev) {
    etat.evenementsLocaux.push(ev);
    const ok = A.ecrireLocaux();
    etat.version = 'actualisee';
    A.recalculer();
    return ok;
  }

  function lireFichier(fichier) {
    return new Promise((resolve, reject) => {
      const r = new FileReader();
      r.onload = () => resolve(r.result);
      r.onerror = () => reject(r.error);
      if (/^(image\/|application\/pdf)/.test(fichier.type)) r.readAsDataURL(fichier);
      else r.readAsText(fichier, 'utf-8');
    });
  }

  // Le mode expert reste ouvert d'un affichage à l'autre (chaque changement de champ redessine l'onglet).
  document.addEventListener('toggle', (e) => { if (e.target && e.target.id === 'd-ajout') etat.expertOuvert = e.target.open; }, true);

  document.addEventListener('input', (e) => {
    const t = e.target;
    if (t.dataset.brouillon && t.type !== 'radio') { brouillon[t.dataset.brouillon] = t.value; }
    else if (t.dataset.impact !== undefined && t.type !== 'checkbox' && t.tagName !== 'SELECT') { brouillon.impacts[+t.dataset.impact][t.dataset.champ] = t.value; }
  });
  document.addEventListener('change', async (e) => {
    const t = e.target;
    if (t.dataset.brouillon) {
      brouillon[t.dataset.brouillon] = t.value;
      if (t.dataset.brouillon === 'texte') rerendre();
    } else if (t.dataset.impact !== undefined) {
      const im = brouillon.impacts[+t.dataset.impact];
      im[t.dataset.champ] = t.type === 'checkbox' ? t.checked : t.value;
      if (t.dataset.champ === 'etat' && im.type === 'condition') im.nature = im.etat === 'valide' ? 'validation_obtenue' : im.etat === 'correctif_livre' ? 'correctif_livre' : im.etat === 'rouvert' ? 'probleme' : 'information';
      if (t.tagName === 'SELECT' || t.type === 'checkbox') rerendre();
    } else if (t.id === 'f-fichier' && t.files[0]) {
      const f = t.files[0];
      if (f.size > 4 * 1024 * 1024) { brouillon.erreurs = ['Fichier trop gros pour le navigateur (plus de 4 Mo) : placez-le plutôt dans corpus/ et reconstruisez.']; return rerendre(); }
      const contenu = await lireFichier(f);
      if (/^data:/.test(contenu)) brouillon.fichier = { nom: f.name, type: f.type, dataUrl: contenu };
      else { brouillon.texte = contenu; brouillon.fichier = null; }
      if (!brouillon.titre) brouillon.titre = f.name.replace(/\.[^.]+$/, '');
      rerendre();
    } else if (t.id === 'f-import' && t.files[0]) {
      try {
        const contenu = JSON.parse(await lireFichier(t.files[0]));
        const liste = Array.isArray(contenu) ? contenu : [contenu];
        const erreurs = [];
        for (const ev of liste) {
          if (!ev.id || !ev.date || !Array.isArray(ev.impacts)) { erreurs.push('Fichier non reconnu : il faut un objet avec id, date et impacts.'); continue; }
          if (etat.evenements.some((x) => x.id === ev.id)) { erreurs.push(`${ev.id} est déjà chargé.`); continue; }
          ev.impacts.forEach((im) => C.controlerImpact(im, ev).forEach((m) => erreurs.push(`${ev.id} : ${m}`)));
          etat.evenementsLocaux.push(ev);
        }
        A.ecrireLocaux();
        etat.version = 'actualisee';
        A.recalculer();
        brouillon.erreurs = erreurs;
        brouillon.message = `${liste.length - erreurs.filter((x) => /déjà|non reconnu/.test(x)).length} mise(s) à jour importée(s).${erreurs.length ? ' Les impacts refusés par les garde-fous sont listés.' : ''}`;
        rerendre('d-avant-apres');
      } catch (err) {
        brouillon.erreurs = ['Import impossible : ' + err.message];
        rerendre();
      }
    }
  });

  document.addEventListener('click', (e) => {
    const b = e.target.closest('[data-maj], [data-ajouter-impact], [data-retirer-impact], [data-ajouter-indice], [data-suggerer-inchange], [data-retirer-fichier], [data-supprimer-local], [data-export]');
    if (!b) return;
    if (b.hasAttribute('data-ajouter-impact')) {
      brouillon.impacts.push(impactParDefaut($('#f-nouvel-impact').value));
      rerendre();
    } else if (b.dataset.retirerImpact !== undefined) {
      brouillon.impacts.splice(+b.dataset.retirerImpact, 1);
      rerendre();
    } else if (b.dataset.ajouterIndice !== undefined) {
      const ind = analyserTexte(brouillon.texte).indices[+b.dataset.ajouterIndice];
      const im = impactParDefaut(ind.type);
      if (ind.condition) im.condition = ind.condition;
      if (ind.champ) im.champ = ind.champ;
      brouillon.impacts.push(im);
      rerendre();
    } else if (b.hasAttribute('data-suggerer-inchange')) {
      brouillon.inchange = suggestionsInchange();
      rerendre();
    } else if (b.hasAttribute('data-retirer-fichier')) {
      brouillon.fichier = null;
      rerendre();
    } else if (b.dataset.supprimerLocal !== undefined) {
      const ev = etat.evenementsLocaux[+b.dataset.supprimerLocal];
      if (ev && window.confirm(`Supprimer la mise à jour ${ev.id} de ce navigateur ? La version initiale n'est pas touchée.`)) {
        etat.evenementsLocaux.splice(+b.dataset.supprimerLocal, 1);
        A.ecrireLocaux();
        A.recalculer();
        rerendre();
      }
    } else if (b.dataset.maj === 'apercu' || b.dataset.maj === 'enregistrer') {
      if (!brouillon.inchange.trim()) brouillon.inchange = suggestionsInchange();
      const { ev, erreurs } = construireEvenement();
      brouillon.erreurs = erreurs;
      brouillon.message = '';
      if (erreurs.length) { brouillon.apercu = null; return rerendre(); }
      if (b.dataset.maj === 'apercu') {
        const r = C.appliquerEvenements(BASE, [...etat.evenements, ev].sort((x, y) => String(x.date).localeCompare(String(y.date))));
        const entree = r.journal.find((j) => j.evenement === ev.id);
        A.SOURCES[ev.source.id] = Object.assign({ _evenement: ev.id, _apercu: true }, ev.source);
        A.DOCS[ev.source.id] = { genre: 'texte', texte: ev.source.texte || '', chemin: '(aperçu non enregistré)', _apercu: true };
        brouillon.apercu = { entree, ev, etat: r.etat };
        return rerendre();
      }
      enregistrer(ev);
      brouillon = nouveauBrouillon();
      brouillon.message = `Mise à jour ${ev.id} enregistrée. La version actualisée est affichée ; la version initiale reste disponible (bouton en haut de page).`;
      rerendre('d-avant-apres');
      A.annoncer('Mise à jour enregistrée.');
    } else if (b.dataset.maj === 'vider') {
      brouillon = nouveauBrouillon();
      rerendre();
    } else if (b.dataset.maj === 'exemple-on') {
      etat.exempleActif = true;
      etat.version = 'actualisee';
      A.recalculer();
      rerendre('d-avant-apres');
      A.annoncer('Exemple fictif chargé.');
    } else if (b.dataset.maj === 'exemple-off') {
      etat.exempleActif = false;
      A.recalculer();
      rerendre();
    } else if (b.dataset.export === 'evenements') {
      A.telecharger('NOVA_mises_a_jour.json', JSON.stringify(etat.evenementsLocaux, null, 2), 'application/json');
    } else if (b.dataset.export === 'etat') {
      const sortie = Object.assign({}, A.etat.actualise, { _export: { version: etat.evenements.length ? 'actualisée' : 'initiale', evenements: etat.evenements.map((e) => e.id) } });
      A.telecharger('NOVA_etat_actualise.json', JSON.stringify(sortie, null, 2), 'application/json');
    } else if (b.dataset.export === 'reponses') {
      A.telecharger('NOVA_reponses_et_preuves.md', reponsesTexte(etat.courant), 'text/markdown;charset=utf-8');
    }
  });

  window.NOVA_MAJ = {
    rendreMisesAJour, rendreExport,
    construireEvenement, analyserTexte, carteJournal, libelleCible, valeurAffichee, CHAMPS_LIBELLES,
    enregistrer,
    _brouillon: () => brouillon,
  };
})();
