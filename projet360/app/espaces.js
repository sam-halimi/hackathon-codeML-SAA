/* Espaces 1, 3, 4 et 5 (partie documents) de l'application NOVA. */
(function () {
  'use strict';
  const A = window.NOVA_APP;
  const { etat, BASE, C, $, esc, fmtDate, fmtDateHeure, fmtMontant, joursEntre, badge, badgeEtat, badgeNature, badgeAutorite, badgeValidite, boutonPreuve, listePreuves } = A;

  const SUJETS = {
    date: 'Date', gouvernance: 'Gouvernance', hebergement: 'Hébergement', securite: 'Sécurité', accessibilite: 'Accessibilité',
    exploitation: 'Exploitation', integration: 'Intégration', donnees: 'Données', performance: 'Performance', finances: 'Finances',
    portee: 'Portée', communication: 'Communication',
  };
  const DOSSIERS = {
    '01_Courriels': 'Courriels', '02_Reunions': 'Réunions (comptes rendus et transcriptions)', '03_Tickets': 'Tickets et captures',
    '04_Documents_projet': 'Documents du projet', '05_Contrats_et_finances': 'Contrats et finances', '06_Architecture_et_decisions': 'Architecture et décisions',
    '07_Conversations_Teams': 'Conversations Teams', '08_Archives_et_documents_connexes': 'Archives et documents connexes (souvent hors sujet)',
  };

  const actionParId = (e, id) => e.actions.find((a) => a.id === id);
  const estModifie = (o) => etat.courant !== BASE && o && ((o._modifie_par || []).length || o._ajoute_par);
  const marqueMaj = (o) => (estModifie(o) ? ' ' + badge('ambre', o._ajoute_par ? 'Nouveau' : 'Mis à jour', '◆') : '');
  const dateReference = (e) => (e !== BASE && e.meta.date_situation_maj) || BASE.meta.date_situation;

  function badgeResponsable(statut) {
    return statut === 'confirme' ? badge('vert', 'Confirmé', '✓') : badge('bleu', 'Proposé par l\'équipe', '?');
  }
  function badgeType(type) {
    return type === 'engagement' ? badge('violet', 'Engagement documenté') : badge('bleu', 'Recommandation de l\'équipe');
  }
  function texteEcheance(a) {
    if (a.echeance) return `<strong>${fmtDate(a.echeance)}</strong>`;
    return `${badge('ambre', a.echeance_texte || 'À confirmer', '?')}`;
  }

  // ===================================================================
  // Brief de reprise (une page) — écran et impression
  // ===================================================================

  function briefHtml(e) {
    const s = e.synthese;
    const d = s.date_mep;
    const f = s.finances;
    const versionTxt = e !== BASE && e.meta.date_situation_maj ? ` · Version actualisée au ${fmtDateHeure(e.meta.date_situation_maj)}` : ' · Version initiale';
    const condLignes = s.conditions.map((c) => {
      const acts = (c.actions || []).map((id) => actionParId(e, id)).filter(Boolean);
      return `<tr><td>${esc(c.id)}. ${esc(c.titre)}</td><td>${badgeEtat(c.etat)}</td>
        <td>${acts.map((a) => `${esc(a.id)} ${esc(a.responsable)} (${a.responsable_statut === 'confirme' ? 'confirmé' : 'proposé'})`).join('<br>')}</td>
        <td>${acts.map((a) => (a.echeance ? fmtDate(a.echeance) : esc(a.echeance_texte || 'À confirmer'))).join('<br>')}</td></tr>`;
    }).join('');
    const props = (s.propositions || []).map((p) => `<li><strong>Proposition en attente (non approuvée) :</strong> ${esc(p.texte)} · ${esc(p.propose_par || '')}${p.motif ? ', ' + esc(p.motif) : ''}.</li>`).join('');
    const prio = s.priorites.map((p) => {
      const acts = (p.actions || []).map((id) => actionParId(e, id)).filter(Boolean);
      const cond = p.condition && s.conditions.find((c) => c.id === p.condition);
      const fait = cond && C.ETATS_FERMES.includes(cond.etat);
      return `<li>${fait ? '<s>' : ''}<strong>${esc(p.titre)}</strong>${fait ? '</s> ✓' : ''} · ${acts.map((a) => `${esc(a.responsable)}, ${a.echeance ? fmtDate(a.echeance) : 'échéance à confirmer'}`).join(' ; ')}</li>`;
    }).join('');
    const ajouts = e.actions.filter((a) => a._ajoute_par && !C.ETATS_FERMES.includes(a.etat))
      .map((a) => `<li><strong>${esc(a.titre)}</strong> · ${esc(a.responsable)} (${a.responsable_statut === 'confirme' ? 'confirmé' : 'proposé'}), ${a.echeance ? fmtDate(a.echeance) : 'échéance à confirmer'}</li>`).join('');
    const notesSynth = ['responsable', 'date_mep', 'portee', 'finances'].flatMap((k) => (s[k].notes_maj || []).map((n) => `<li>${esc(n.texte)}</li>`)).join('');
    // Sources tirées des preuves : elles suivent les mises à jour.
    const src = (preuves, extra) => `<span class="src">[${esc([...new Set([...(preuves || []).map((p) => p.source), ...(extra || [])])].join(', '))}]</span>`;
    const decisionInitiale = d.date_decision === BASE.synthese.date_mep.date_decision && d.approuvee === BASE.synthese.date_mep.approuvee;
    const autoriteTxt = d.autorite.charAt(0).toLowerCase() + d.autorite.slice(1);
    return `<div class="imp">
      <h1>Brief de reprise · Projet NOVA</h1>
      <p class="imp-sous">Situation au ${esc(BASE.meta.date_situation_texte)}${versionTxt}. Préparé par l'équipe (analyse humaine assistée par Claude, vérifiée dans le corpus).</p>
      <h2>1. Responsable</h2>
      <p><strong>${esc(s.responsable.nom)}</strong>, ${esc(s.responsable.role.toLowerCase())} depuis le ${fmtDate(s.responsable.depuis, true)}. Avant : ${esc(s.responsable.avant)}. ${src(s.responsable.preuves)}</p>
      <h2>2. Date approuvée et conditions</h2>
      <p><strong>${esc(d.texte)}</strong>, approuvée par le ${esc(autoriteTxt)} le ${fmtDate(d.date_decision, true)}${decisionInitiale ? ' (proposée par Boréal le 8 septembre), sous conditions' : ''}. ${decisionInitiale ? esc(d.reserve) : 'Vérifier si les conditions de go-live restent valables.'} ${src(d.preuves, decisionInitiale ? ['M06', 'E09'] : [])}</p>
      ${props ? `<ul>${props}</ul>` : ''}
      <table><thead><tr><th>Condition de go-live</th><th>État</th><th>Action et responsable</th><th>Échéance</th></tr></thead><tbody>${condLignes}</tbody></table>
      <h2>3. Portée</h2>
      <p>Phase 1 : SSO, création et suivi de demandes, pièces jointes, workflow, tableau de suivi, rapports standards, plus rapports avancés et export (CR-01, approuvée le 14 août). <strong>Hors portée :</strong> optimisations mobiles avancées (CR-04, 18 000 $), reportées à la phase 2 le 24 septembre ; aucune dépense sans nouvelle approbation. ${src(s.portee.preuves, ['E10'])}</p>
      <h2>4. Budget et factures (CAD, hors taxes)</h2>
      <p><strong>Autorisé : ${fmtMontant(f.autorise)}</strong> (${esc(f.calcul)}). <strong>Facturé : ${fmtMontant(f.facture)}</strong> ; payé : ${fmtMontant(f.paye)} (INV-001, INV-002) ; en validation : ${fmtMontant(f.en_validation)} (INV-003). <strong>INV-003 :</strong> libérer au plus le jalon 3 (36 000 $) et bloquer la ligne CR-04 de ${fmtMontant(f.a_contester)}, non approuvée (facture corrigée ou note de crédit). INV-778 (projet ORION) est exclue. ${src(f.preuves, ['INV-001', 'INV-002', 'E07'])}</p>
      ${notesSynth ? `<p><strong>Mises à jour :</strong></p><ul>${notesSynth}</ul>` : ''}
      <h2>5. Priorités</h2>
      <ol>${prio}</ol>
      ${ajouts ? `<p><strong>Nouvelles actions (mises à jour) :</strong></p><ul>${ajouts}</ul>` : ''}
      <h2>6. À ne pas utiliser</h2>
      <p>Le 15 octobre (plans v2/v3, charte) ; la sécurité et l'accessibilité « VERT » (rapport du 21 sept., brouillon d'Alex) ; le risque R-01 « ouvert » (INT-101 fermé le 17 sept.) ; East US (remplacé par Canada Central) ; INV-778 (autre projet).</p>
      <p class="imp-pied">Échéances : aucune date n'est documentée pour les actions restantes (« à confirmer ») ; la seule limite connue est le go visé le 22 octobre. Pour chaque fait, les preuves (fichier et repère) se trouvent dans l'application, espaces « Questions et preuves » et « Historique et décisions ». Données : NOVA_OPERATIONS.json, ${esc(BASE.meta.version_donnees)}.</p>
    </div>`;
  }

  function imprimerBrief() {
    $('#zone-impression').innerHTML = briefHtml(etat.courant);
    A.typographier($('#zone-impression'));
    window.print();
  }

  function briefTexte(e) {
    const div = document.createElement('div');
    div.innerHTML = briefHtml(e);
    div.querySelectorAll('h1').forEach((h) => { h.textContent = '# ' + h.textContent + '\n'; });
    div.querySelectorAll('h2').forEach((h) => { h.textContent = '\n## ' + h.textContent + '\n'; });
    div.querySelectorAll('li').forEach((li) => { li.textContent = '- ' + li.textContent + '\n'; });
    div.querySelectorAll('tr').forEach((tr) => { tr.textContent = '| ' + [...tr.children].map((c) => c.textContent.trim()).join(' | ') + ' |\n'; });
    div.querySelectorAll('p').forEach((p) => { p.textContent = p.textContent + '\n'; });
    return div.textContent.replace(/\n{3,}/g, '\n\n').trim() + '\n';
  }

  // ===================================================================
  // Espace 1 — Vue d'ensemble
  // ===================================================================

  function rendreVue() {
    const e = etat.courant;
    const s = e.synthese;
    const d = s.date_mep;
    const remplies = s.conditions.filter((c) => C.ETATS_FERMES.includes(c.etat)).length;
    const jours = joursEntre(dateReference(e), d.approuvee);
    const f = s.finances;
    const props = s.propositions || [];
    const restantes = s.conditions.length - remplies;
    const sousTitre = restantes === s.conditions.length ? 'sous trois conditions.' : restantes > 0 ? `${restantes} condition${restantes > 1 ? 's' : ''} encore ouverte${restantes > 1 ? 's' : ''}.` : 'conditions remplies.';
    const ouvertes = e.actions.filter((a) => !C.ETATS_FERMES.includes(a.etat));
    const ton = (code) => (C.ETATS[code] || {}).ton || 'gris';
    // Le moment fort de la page : la date approuvée et sa réserve, en pleine largeur.
    let html = `<section class="hero-date" aria-labelledby="titre-date">
        <div class="eyebrow">Espace 01 · Mise en production approuvée ${marqueMaj(d)}</div>
        <p class="affiche" id="titre-date">${esc(d.texte)},<br><em>${esc(sousTitre)}</em></p>
        <div class="hero-ligne">
          <span>Approuvée par le <strong>${esc(d.autorite.charAt(0).toLowerCase() + d.autorite.slice(1))}</strong> le ${fmtDate(d.date_decision, true)}.</span>
          ${jours >= 0 ? `<span class="jalon">J−${jours} · au ${fmtDate(dateReference(e))}</span>` : ''}
          ${boutonPreuve(d.preuves[0], { compact: true })}
          <button type="button" class="bouton" data-action="imprimer-brief">Imprimer le brief (1 page)</button>
        </div>
        <div class="conditions-mini">${s.conditions.map((c) => `<a class="cond" href="#vue/conditions" style="color:inherit;text-decoration:none"><span class="point ${ton(c.etat)}" aria-hidden="true"></span><span class="cond-id">${esc(c.id)}</span>${esc(c.titre.split(' (')[0])} · <strong>${esc((C.ETATS[c.etat] || {}).libelle || c.etat)}</strong></a>`).join('')}
          ${props.map((p) => `<span class="cond"><span class="point gris" aria-hidden="true"></span><span class="cond-id">PROPOSITION</span>${esc(p.texte)} · <strong>non approuvée</strong></span>`).join('')}</div>
      </section>
      <div class="grille grille-4">
        <div class="carte"><div class="etiquette">Responsable</div><div class="chiffre">${esc(s.responsable.nom)}</div>
          <p>${esc(s.responsable.role)} depuis le <strong>${fmtDate(s.responsable.depuis, true)}</strong>.</p>
          <p class="petit doux">Avant : ${esc(s.responsable.avant)}.</p>${boutonPreuve(s.responsable.preuves[0], { compact: true })}${marqueMaj(s.responsable)}</div>
        <div class="carte"><div class="etiquette">Conditions de go-live</div><div class="chiffre">${remplies} / ${s.conditions.length} remplies</div>
          <ul class="petit" style="list-style:none;padding:0;margin:0 0 12px">${s.conditions.map((c) => `<li>${esc(c.id)} ${badgeEtat(c.etat)}</li>`).join('')}</ul>
          <a class="petit" href="#vue/conditions">Détail des conditions</a></div>
        <div class="carte"><div class="etiquette">Finances (CAD, HT)</div><div class="chiffre">${fmtMontant(f.autorise)}</div>
          <p class="petit">autorisés (180 000 $ + CR-01).<br>Facturé : <strong>${fmtMontant(f.facture)}</strong> · Payé : <strong>${fmtMontant(f.paye)}</strong></p>
          <p class="petit">${badge('rouge', fmtMontant(f.a_contester) + ' à contester (INV-003)', '!')}</p>${boutonPreuve(f.preuves[0], { compact: true })}</div>
        <div class="carte"><div class="etiquette">Actions ouvertes</div><div class="chiffre">${ouvertes.length}</div>
          <p class="petit">dont ${ouvertes.filter((a) => a.condition).length} liées aux conditions de go-live.<br>Échéances documentées : <strong>${ouvertes.filter((a) => a.echeance).length}</strong> (les autres sont « À confirmer »).</p>
          <a class="petit" href="#actions">Voir les actions</a></div>
      </div>`;

    // Conditions de go-live
    html += `<div class="section" id="conditions"><h2>Conditions de go-live</h2></div>
      <p class="intro">Fixées par le comité de direction du 26 septembre. Le 22 octobre n'est pas un go automatique : les trois doivent être remplies.</p>
      <div class="table-wrap"><table><thead><tr><th>Condition</th><th>État</th><th>Responsable</th><th>Actions</th><th>Preuve</th></tr></thead><tbody>
      ${s.conditions.map((c) => `<tr><td><strong>${esc(c.id)}. ${esc(c.titre)}</strong>${marqueMaj(c)}<br><span class="petit doux">${esc(c.detail)}</span>
          ${(c.notes_maj || []).map((n) => `<div class="maj-note petit">${esc(n.texte)}</div>`).join('')}</td>
        <td>${badgeEtat(c.etat)}</td><td>${esc(c.responsable)}</td>
        <td>${(c.actions || []).map((id) => `<a href="#actions/action-${esc(id)}">${esc(id)}</a>`).join(', ')}</td>
        <td>${(c.preuves || []).slice(-2).map((p) => boutonPreuve(p, { compact: true })).join(' ')}</td></tr>`).join('')}
      </tbody></table></div>`;

    if (props.length) {
      html += `<div class="section"><h2>Propositions en attente de décision</h2></div>
        <p class="intro">Une proposition n'est pas une décision : la date approuvée ne change pas tant que l'autorité compétente n'a pas approuvé.</p>
        <div class="table-wrap"><table><thead><tr><th>Proposition</th><th>Par</th><th>Motif</th><th>Statut</th><th>Preuve</th></tr></thead><tbody>
        ${props.map((p) => `<tr><td><strong>${esc(p.texte)}</strong></td><td>${esc(p.propose_par || '')}</td><td>${esc(p.motif || '')}</td><td>${badge('bleu', p.statut || 'En attente de décision', '?')}</td><td>${(p.preuves || []).map((x) => boutonPreuve(x, { compact: true })).join(' ')}</td></tr>`).join('')}
        </tbody></table></div>`;
    }

    // Priorités
    html += `<div class="section"><h2>Priorités</h2></div><ol>
      ${s.priorites.map((p) => {
        const acts = (p.actions || []).map((id) => actionParId(e, id)).filter(Boolean);
        const cond = p.condition && s.conditions.find((c) => c.id === p.condition);
        return `<li class="carte" style="margin-left:.4rem"><strong>${esc(p.titre)}</strong> ${cond ? badgeEtat(cond.etat) : ''}<br>${esc(p.texte)}<br>
          <span class="petit">Actions : ${acts.map((a) => `<a href="#actions/action-${esc(a.id)}">${esc(a.id)}</a> (${esc(a.responsable)}, ${a.echeance ? fmtDate(a.echeance) : 'échéance à confirmer'})`).join(' · ')}</span></li>`;
      }).join('')}</ol>`;

    // Portée et finances
    html += `<div class="grille grille-2" style="margin-top:1rem">
      <section class="carte"><h3>Portée</h3><p>${esc(s.portee.texte)}</p>
        <h4>Inclus</h4><ul>${s.portee.incluse.map((x) => `<li>${esc(x)}</li>`).join('')}</ul>
        <h4>Hors portée</h4><ul>${s.portee.hors_portee.map((x) => `<li>${esc(x)}</li>`).join('')}</ul>
        ${(s.portee.notes_maj || []).map((n) => `<div class="maj-note">${esc(n.texte)}</div>`).join('')}
        <details><summary>Preuves</summary>${listePreuves(s.portee.preuves)}</details></section>
      <section class="carte"><h3>Finances</h3>
        <p><strong>Autorisé : ${fmtMontant(f.autorise)}</strong> = ${esc(f.calcul)}.</p>
        <div class="table-wrap"><table><thead><tr><th>Facture</th><th>Date</th><th>Montant</th><th>Statut</th></tr></thead><tbody>
          ${f.factures.map((x) => `<tr><td><strong>${esc(x.id)}</strong><br><span class="petit doux">${esc(x.detail)}</span></td><td class="nowrap">${fmtDate(x.date)}</td><td class="nowrap">${fmtMontant(x.montant)}</td>
            <td>${x.statut === 'Payée' ? badge('vert', 'Payée', '✓') : badge('ambre', x.statut, '◐')}${x.alerte ? ' ' + badge('rouge', '18 000 $ non approuvés', '!') : ''}</td></tr>`).join('')}
          <tr><td><strong>Total</strong></td><td></td><td class="nowrap"><strong>${fmtMontant(f.facture)}</strong></td><td>Payé : ${fmtMontant(f.paye)}</td></tr>
        </tbody></table></div>
        <p class="petit" style="margin-top:.5rem">Si la ligne CR-04 est retirée : ${fmtMontant(f.facture - f.a_contester)} facturés, soit ${fmtMontant(f.solde_si_inv003_corrigee)} encore disponibles. Exclue : ${f.exclues.map((x) => `${esc(x.id)} (${fmtMontant(x.montant)}, ${esc(x.raison)})`).join(', ')}.</p>
        <p class="petit doux">${esc(f.remarque)}</p>
        ${(f.notes_maj || []).map((n) => `<div class="maj-note">${esc(n.texte)}</div>`).join('')}
        <details><summary>Preuves</summary>${listePreuves(f.preuves)}</details></section></div>`;

    // Informations périmées
    html += `<div class="section"><h2>Informations à ne pas utiliser</h2></div>
      <p class="intro">Ces informations circulent encore dans le corpus, mais elles sont périmées, inexactes ou hors projet.</p>
      <div class="table-wrap"><table><thead><tr><th>Information</th><th>Où on la trouve</th><th>Pourquoi l'écarter</th></tr></thead><tbody>
      ${s.a_ne_pas_utiliser.map((x) => `<tr><td><strong>${esc(x.texte)}</strong></td><td>${x.sources.map((id) => `<button type="button" class="bouton petit" data-ouvrir-source-page="${esc(id)}">${esc(id)}</button>`).join(' ')}</td><td>${esc(x.raison)}</td></tr>`).join('')}
      </tbody></table></div>`;

    // Brief
    html += `<div class="section" id="brief"><h2>Brief de reprise (une page)</h2>
      <div class="groupe-boutons"><button type="button" class="bouton primaire" data-action="imprimer-brief">Imprimer le brief (1 page)</button>
      <button type="button" class="bouton" data-action="exporter-brief">Exporter le brief (texte)</button></div></div>
      <div class="carte brief">${briefHtml(e)}</div>`;
    return html;
  }

  // ===================================================================
  // Espace 3 — Historique et décisions
  // ===================================================================

  function rendreHistorique() {
    const e = etat.courant;
    const filtres = etat.filtres;
    const sujetsPresents = [...new Set(e.chronologie.flatMap((t) => t.sujets || []))].filter((s) => SUJETS[s]);
    const items = e.chronologie.filter((t) => {
      if (filtres.sujets.size && !(t.sujets || []).some((s) => filtres.sujets.has(s))) return false;
      if (filtres.masquerHistorique && ['historique', 'remplacee'].includes(t.validite)) return false;
      if (filtres.nature && t.nature !== filtres.nature) return false;
      return true;
    });
    let html = `<header class="tete-page"><div class="eyebrow">Espace 03 · ${e.chronologie.length} événements, ${e.contradictions.length} contradictions</div><h2>Historique et décisions</h2>
      <p class="intro">Ce qui a été proposé, décidé, livré et validé, et pourquoi certaines informations ne font plus foi.</p></header>
      <nav class="sous-nav" aria-label="Sections"><a href="#historique/h-chrono">Chronologie</a><a href="#historique/h-cycles">Proposition → décision → validation</a><a href="#historique/h-decisions">Registre des décisions</a><a href="#historique/h-contradictions">Contradictions expliquées</a></nav>
      <h3 id="h-chrono">Chronologie (${items.length} sur ${e.chronologie.length})</h3>
      <div class="filtres" role="group" aria-label="Filtrer par sujet">
        ${sujetsPresents.map((s) => `<button type="button" class="puce" data-filtre-sujet="${s}" aria-pressed="${filtres.sujets.has(s)}">${esc(SUJETS[s])}</button>`).join('')}
        <label class="petit"><input type="checkbox" data-filtre="historique" ${filtres.masquerHistorique ? 'checked' : ''}> Masquer l'historique remplacé</label>
        <label class="petit">Nature : <select data-filtre="nature"><option value="">Toutes</option>${Object.entries(C.NATURES).map(([k, n]) => `<option value="${k}" ${filtres.nature === k ? 'selected' : ''}>${esc(n.libelle)}</option>`).join('')}</select></label>
      </div>
      <ol class="chrono">
      ${items.map((t) => `<li class="${t._ajoute_par ? 'ajout' : ''}"><div class="date">${t.date_texte ? esc(t.date_texte) : fmtDate(t.date, true)}${t.heure ? ', ' + esc(t.heure.replace(':', ' h ')) : ''}</div>
          <div class="preuve-ligne">${badgeNature(t.nature)} ${badgeValidite(t.validite)} ${t._ajoute_par ? badge('ambre', 'Mise à jour', '◆') : ''} <span class="titre">${esc(t.titre)}</span></div>
          ${t.resume ? `<p class="petit">${esc(t.resume)}</p>` : ''}
          <div class="groupe-boutons petit" style="margin-top:.25rem">${t.preuve ? boutonPreuve(t.preuve, { compact: true }) : ''}
            ${(t.sources || []).filter((id) => !t.preuve || id !== t.preuve.source).map((id) => `<button type="button" class="bouton petit" data-ouvrir-source-page="${esc(id)}">${esc(id)}</button>`).join(' ')}</div></li>`).join('')}
      </ol>`;

    html += `<div class="section" id="h-cycles"><h2>Proposition, décision, livraison, validation</h2></div>
      <p class="intro">Pour chaque sujet, ce qui a été proposé, décidé, livré et validé, avec les dates et les sources. Une étape rouge n'est pas faite.</p>
      ${e.cycles.map((c) => `<section class="carte"><h3>${esc(c.sujet)}</h3><div class="cycle">
        ${c.etapes.map((t) => `<div class="etape ${t.statut === 'fait' ? 'fait' : 'manquant'}"><div class="etape-nom">${t.statut === 'fait' ? '✓' : '✗'} ${esc(t.etape)}</div>
          <div>${t.date ? `<strong>${fmtDate(t.date)}</strong> · ` : '<strong>Pas encore</strong> · '}${esc(t.texte)}</div>
          ${t.preuve ? `<div style="margin-top:.3rem">${boutonPreuve(t.preuve, { compact: true })}</div>` : ''}</div>`).join('')}
      </div></section>`).join('')}`;

    html += `<div class="section" id="h-decisions"><h2>Registre des décisions</h2></div>
      <div class="table-wrap"><table><thead><tr><th>Date</th><th>Décision</th><th>Autorité</th><th>Statut</th><th>Preuve</th></tr></thead><tbody>
      ${e.decisions.map((x) => `<tr><td class="nowrap">${fmtDate(x.date)}</td><td><strong>${esc(x.titre)}</strong>${x.remarque ? `<br><span class="petit doux">${esc(x.remarque)}</span>` : ''}</td><td>${esc(x.autorite)}</td>
        <td>${/^En vigueur/.test(x.statut) ? badge('vert', x.statut, '✓') : badge('gris', x.statut)}</td><td>${boutonPreuve(x.preuve, { compact: true })}</td></tr>`).join('')}
      </tbody></table></div>`;

    html += `<div class="section" id="h-contradictions"><h2>Contradictions expliquées</h2></div>
      <p class="intro">Chaque contradiction est tranchée par l'autorité de la source ou la date des faits, pas par la date du fichier.</p>
      ${e.contradictions.map((k) => `<section class="carte"><div class="preuve-ligne"><h3 style="margin:0">${esc(k.id)} · ${esc(k.sujet)}</h3>${badge('gris', k.type)}</div>
        <div class="versus" style="margin-top:.6rem">
          <div class="perime"><div class="etiquette">✗ Périmé ou inexact</div><p><strong>${esc(k.version_perimee.texte)}</strong></p><p class="petit">Sources : ${k.version_perimee.sources.map(esc).join(', ')}</p>${boutonPreuve(k.version_perimee.preuve, { compact: true })}</div>
          <div class="valide"><div class="etiquette">✓ Fait foi</div><p><strong>${esc(k.version_valide.texte)}</strong></p><p class="petit">Sources : ${k.version_valide.sources.map(esc).join(', ')}</p>${boutonPreuve(k.version_valide.preuve, { compact: true })}</div>
        </div>
        <p style="margin-top:.6rem"><strong>Pourquoi :</strong> ${esc(k.explication)}</p>${k.preuve_explication ? boutonPreuve(k.preuve_explication, { compact: true }) : ''}</section>`).join('')}`;
    return html;
  }

  // ===================================================================
  // Espace 4 — Actions
  // ===================================================================

  const FILTRES_ACTIONS = {
    toutes: ['Toutes', () => true],
    conditions: ['Conditions de go-live', (a) => !!a.condition],
    ouvertes: ['Ouvertes', (a) => !C.ETATS_FERMES.includes(a.etat)],
    engagements: ['Engagements documentés', (a) => a.type === 'engagement'],
    recommandations: ["Recommandations de l'équipe", (a) => a.type === 'recommandation'],
  };

  function rendreActions() {
    const e = etat.courant;
    const filtre = FILTRES_ACTIONS[etat.filtres.actions] || FILTRES_ACTIONS.toutes;
    const liste = e.actions.filter(filtre[1]);
    const ouvertes = e.actions.filter((a) => !C.ETATS_FERMES.includes(a.etat));
    const sansDate = ouvertes.filter((a) => !a.echeance).length;
    return `<header class="tete-page"><div class="eyebrow">Espace 04 · Responsables et échéances</div>
      <div class="section" style="margin:0"><h2>Actions</h2><div class="groupe-boutons"><button type="button" class="bouton" data-action="exporter-actions">Exporter les actions (CSV)</button></div></div></header>
      <p class="intro"><strong>${ouvertes.length} actions ouvertes</strong>, dont ${ouvertes.filter((a) => a.condition).length} liées aux conditions de go-live. ${sansDate} n'ont aucune échéance documentée : elles sont marquées « À confirmer ». Aucune date n'a été inventée.</p>
      <div class="encadre ton-gris petit"><strong>Lecture :</strong> ${badge('vert', 'Confirmé', '✓')} le responsable est désigné dans une source ; ${badge('bleu', "Proposé par l'équipe", '?')} c'est notre suggestion.
        ${badge('violet', 'Engagement documenté')} promis dans une source ; ${badge('bleu', "Recommandation de l'équipe")} proposée par notre équipe, sans engagement écrit.</div>
      <div class="filtres" role="group" aria-label="Filtrer les actions">
        ${Object.entries(FILTRES_ACTIONS).map(([k, [lib]]) => `<button type="button" class="puce" data-filtre-actions="${k}" aria-pressed="${etat.filtres.actions === k}">${esc(lib)}</button>`).join('')}
      </div>
      <div class="table-wrap"><table class="table-actions"><thead><tr><th style="width:42%">Action</th><th>Responsable</th><th>Échéance</th><th>État</th></tr></thead><tbody>
      ${liste.map((a) => `<tr id="action-${esc(a.id)}">
        <td><strong>${esc(a.id)}</strong> · ${esc(a.titre)}${marqueMaj(a)}
          <div class="preuve-ligne" style="margin-top:.3rem">${a.condition ? `<a class="badge ton-gris" href="#vue/conditions">Condition ${esc(a.condition)}</a>` : ''} ${badgeType(a.type)}</div>
          ${(a.notes_maj || []).map((n) => `<div class="maj-note petit">${esc(n.texte)}</div>`).join('')}
          <div class="groupe-boutons" style="margin-top:.35rem">${(a.preuves || []).map((p) => boutonPreuve(p, { compact: true })).join('')}</div></td>
        <td>${esc(a.responsable)}<br>${badgeResponsable(a.responsable_statut)}</td>
        <td>${texteEcheance(a)}${a.echeance_note ? `<br><span class="petit doux">${esc(a.echeance_note)}</span>` : ''}</td>
        <td>${badgeEtat(a.etat)}</td></tr>`).join('')}
      </tbody></table></div>`;
  }

  function actionsCsv(e) {
    const cellule = (v) => '"' + String(v == null ? '' : v).replace(/"/g, '""') + '"';
    const lignes = [['ID', 'Action', 'Condition', 'Responsable', 'Statut responsable', 'Échéance', 'Note échéance', 'État', 'Type', 'Preuves'].map(cellule).join(';')];
    for (const a of e.actions) {
      lignes.push([a.id, a.titre, a.condition || '', a.responsable, a.responsable_statut === 'confirme' ? 'Confirmé' : 'Proposé', a.echeance || a.echeance_texte || 'À confirmer', a.echeance_note || '',
        (C.ETATS[a.etat] || {}).libelle || a.etat, a.type === 'engagement' ? 'Engagement documenté' : "Recommandation de l'équipe",
        (a.preuves || []).map((p) => `${p.source} (${p.repere || p.cellules || ''})`).join(' | ')].map(cellule).join(';'));
    }
    return '﻿' + lignes.join('\r\n');
  }

  // ===================================================================
  // Espace 5 — Documents (recherche et liste) ; les mises à jour sont
  // ajoutées par mises_a_jour.js.
  // ===================================================================

  function rendreDocuments() {
    const req = etat.rechercheDocs || '';
    const resultats = req ? A.rechercherDocuments(req, 25) : [];
    const groupes = {};
    for (const s of Object.values(A.SOURCES)) {
      if (s._apercu) continue; // source d'un aperçu non enregistré
      const dossier = s._evenement ? 'Nouvelles sources (mises à jour)' : DOSSIERS[(s.chemin || '').split('/')[0]] || 'Consignes du défi';
      (groupes[dossier] = groupes[dossier] || []).push(s);
    }
    let html = `<header class="tete-page"><div class="eyebrow">Espace 05 · ${Object.keys(A.SOURCES).length} sources</div><h2>Documents et mises à jour</h2>
      <p class="intro">Retrouver un passage dans les sources, ajouter une nouvelle information et comparer avant et après.</p></header>
      <nav class="sous-nav" aria-label="Sections"><a href="#documents/d-recherche">Rechercher</a><a href="#documents/d-liste">Tous les documents</a><a href="#documents/d-ajout">Ajouter une mise à jour</a><a href="#documents/d-avant-apres">Avant / après</a><a href="#documents/d-export">Exporter</a></nav>
      <section class="carte" id="d-recherche"><h3>Rechercher dans les sources</h3>
        <form id="form-recherche-docs" class="groupe-boutons" role="search">
          <label for="champ-recherche-docs" class="visuellement-cache">Mots à chercher</label>
          <input id="champ-recherche-docs" type="search" style="flex:1 1 300px" value="${esc(req)}" placeholder="ex. : rollback, Canada Central, 18 000, ACC-303">
          <button class="bouton primaire" type="submit">Rechercher</button></form>
        <p class="petit doux" style="margin:.4rem 0">Recherche dans le texte de tous les courriels, comptes rendus, tickets, PDF et cellules Excel, sans tenir compte des accents. Les captures sont décrites par leurs tickets.</p>
        ${req ? `<p><strong>${resultats.length} document(s)</strong> pour « ${esc(req)} »</p>${A.htmlResultatsDocuments(resultats, req)}` : ''}
      </section>
      <section id="d-liste"><div class="section"><h2>Tous les documents (${Object.keys(A.SOURCES).length})</h2></div>
        <p class="intro">Chaque source porte son niveau d'autorité. Une copie ou une pièce jointe identique ne compte jamais comme une confirmation indépendante.</p>
        ${Object.entries(groupes).map(([g, liste]) => `<details class="carte" ${g.startsWith('Nouvelles') ? 'open' : ''}><summary>${esc(g)} (${liste.length})</summary>
          <div class="table-wrap" style="margin-top:.5rem"><table><thead><tr><th>ID</th><th>Document</th><th>Date</th><th>Autorité</th><th>Note</th><th></th></tr></thead><tbody>
          ${liste.map((s) => {
            const doc = A.DOCS[s.id] || {};
            const pj = (doc.pieces || []).filter((p) => p.identique_a).map((p) => `Pièce jointe = ${p.identique_a.join(', ')}`).join(' ; ');
            return `<tr><td class="nowrap"><strong>${esc(s.id)}</strong></td><td>${esc(s.titre)}<br><span class="petit doux">${esc(s.chemin || '(texte collé)')}</span></td>
              <td class="nowrap">${fmtDate(s.date)}</td><td>${badgeAutorite(s.autorite)}</td><td class="petit">${esc(s.remarque || '')}${pj ? `<br>${esc(pj)}` : ''}</td>
              <td><button type="button" class="bouton petit" data-ouvrir-source-page="${esc(s.id)}">Ouvrir</button></td></tr>`;
          }).join('')}</tbody></table></div></details>`).join('')}
      </section>`;
    if (window.NOVA_MAJ) html += window.NOVA_MAJ.rendreSections();
    return html;
  }

  // ===================================================================
  // Événements propres à ces espaces
  // ===================================================================

  function telecharger(nom, contenu, type) {
    const url = URL.createObjectURL(new Blob([contenu], { type: type || 'text/plain;charset=utf-8' }));
    const a = document.createElement('a');
    a.href = url; a.download = nom;
    document.body.appendChild(a); a.click(); a.remove();
    setTimeout(() => URL.revokeObjectURL(url), 2000);
  }

  document.addEventListener('click', (ev) => {
    const b = ev.target.closest('[data-action], [data-filtre-sujet], [data-filtre-actions]');
    if (!b) return;
    if (b.dataset.filtreSujet) {
      const s = b.dataset.filtreSujet;
      etat.filtres.sujets.has(s) ? etat.filtres.sujets.delete(s) : etat.filtres.sujets.add(s);
      A.rendre({ ancre: 'h-chrono' });
    } else if (b.dataset.filtreActions) {
      etat.filtres.actions = b.dataset.filtreActions;
      A.rendre();
    } else if (b.dataset.action === 'imprimer-brief') imprimerBrief();
    else if (b.dataset.action === 'exporter-brief') telecharger('NOVA_brief_de_reprise.md', briefTexte(etat.courant), 'text/markdown;charset=utf-8');
    else if (b.dataset.action === 'exporter-actions') telecharger('NOVA_actions.csv', actionsCsv(etat.courant), 'text/csv;charset=utf-8');
  });
  document.addEventListener('change', (ev) => {
    const f = ev.target.dataset && ev.target.dataset.filtre;
    if (f === 'historique') { etat.filtres.masquerHistorique = ev.target.checked; A.rendre({ ancre: 'h-chrono' }); }
    if (f === 'nature') { etat.filtres.nature = ev.target.value; A.rendre({ ancre: 'h-chrono' }); }
  });
  document.addEventListener('submit', (ev) => {
    if (ev.target.id === 'form-recherche-docs') {
      ev.preventDefault();
      etat.rechercheDocs = $('#champ-recherche-docs').value.trim();
      A.rendre({ ancre: 'd-recherche' });
      A.annoncer('Résultats de recherche affichés.');
    }
  });
  // Ctrl+P imprime toujours le brief de la version affichée.
  window.addEventListener('beforeprint', () => { $('#zone-impression').innerHTML = briefHtml(etat.courant); A.typographier($('#zone-impression')); });

  Object.assign(A.RENDUS, { vue: rendreVue, historique: rendreHistorique, actions: rendreActions, documents: rendreDocuments });
  Object.assign(A, { briefHtml, briefTexte, actionsCsv, telecharger, imprimerBrief });
})();
