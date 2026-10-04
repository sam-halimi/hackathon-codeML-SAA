/* Espaces 1, 3, 4 et 5 (partie documents) de l'application NOVA.
   Principe de simplicité : un espace montre une chose à la fois (sous-onglets),
   les détails se déplient à la demande (accordéons), rien n'est supprimé. */
(function () {
  'use strict';
  const A = window.NOVA_APP;
  const { etat, BASE, C, MODE, $, esc, fmtDate, fmtDateHeure, fmtMontant, joursEntre, badge, badgeEtat, badgeNature, badgeAutorite, badgeValidite, boutonPreuve, listePreuves, icone, tuile, iconeDoc } = A;
  const ICONE_CONDITION = { C1: 'shield-check', C2: 'accessibility', C3: 'server' };
  const etoile = '<svg class="hero-etoile" aria-hidden="true" focusable="false"><use href="#i-nova"/></svg>';
  const DEMO = MODE === 'demo';

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
  const NOMBRES = ['aucune', 'une', 'deux', 'trois', 'quatre', 'cinq', 'six', 'sept', 'huit', 'neuf', 'dix'];
  const enLettres = (n) => NOMBRES[n] || String(n);

  const actionParId = (e, id) => e.actions.find((a) => a.id === id);
  const estModifie = (o) => etat.courant !== BASE && o && ((o._modifie_par || []).length || o._ajoute_par);
  // Dossier vierge : tout vient des mises à jour, la mention « Mis à jour » n'apporterait rien.
  const marqueMaj = (o) => (DEMO && estModifie(o) ? ' ' + badge('ambre', o._ajoute_par ? 'Nouveau' : 'Mis à jour', '◆') : '');
  const dateReference = (e) => (e !== BASE && e.meta.date_situation_maj) || BASE.meta.date_situation;
  const fermee = (c) => C.ETATS_FERMES.includes(c.etat);
  const premiere = (liste) => (liste && liste.length ? liste[liste.length - 1] : null);

  function badgeResponsable(statut) {
    return statut === 'confirme' ? badge('vert', 'Confirmé', 'circle-check') : badge('bleu', 'Proposé par l\'équipe', 'pencil-line');
  }
  function badgeType(type) {
    return type === 'engagement' ? badge('violet', 'Engagement documenté', 'handshake') : badge('bleu', 'Recommandation de l\'équipe', 'lightbulb');
  }
  function texteEcheance(a) {
    if (a.echeance) return `<strong>${fmtDate(a.echeance)}</strong>`;
    return `${badge('ambre', a.echeance_texte || 'À confirmer', '?')}`;
  }

  // Composants de mise en page partagés.
  const accordeon = (id, ic, titre, resume, corps, ouvert) => `<details class="carte accordeon"${id ? ` id="${id}"` : ''}${ouvert ? ' open' : ''}>
      <summary><span class="accordeon-titre">${icone(ic)}${titre}</span>${resume ? `<span class="accordeon-resume">${resume}</span>` : ''}</summary>
      <div class="accordeon-corps">${corps}</div></details>`;
  function segmente(espace, items) {
    const actif = etat.sousOnglets[espace];
    return `<div class="segmente" role="tablist" aria-label="Sections">${items.map(([cle, lib, ic, n]) => `<button type="button" role="tab" aria-selected="${actif === cle}" data-sous-onglet="${espace}:${cle}">${icone(ic)}<span>${lib}</span>${n != null ? `<span class="compte">${n}</span>` : ''}</button>`).join('')}</div>`;
  }
  const vide = (ic, titre, texte, exemple) => `<div class="carte etat-vide">${tuile(ic)}<div><strong>${esc(titre)}</strong><p>${esc(texte)}</p>
      ${exemple != null ? `<button type="button" class="bouton petit" data-ouvrir-assistant="${esc(exemple)}">${icone('sparkles')}Le dire à l'assistant</button>` : ''}</div></div>`;

  // ===================================================================
  // Brief de reprise (une page) — écran et impression
  // ===================================================================

  function briefGenerique(e) {
    // Dossier vierge : le brief ne contient que ce que l'utilisateur a donné, avec ses sources.
    const s = e.synthese;
    const d = s.date_mep;
    const f = s.finances;
    const conds = s.conditions || [];
    const src = (preuves) => (preuves && preuves.length ? `<span class="src">[${esc([...new Set(preuves.map((p) => p.source))].join(', '))}]</span>` : '');
    const inconnu = '<em>non renseigné</em>';
    const ouvertes = e.actions.filter((a) => !C.ETATS_FERMES.includes(a.etat));
    return `<div class="imp">
      <h1>Brief de reprise · ${esc((s.projet && s.projet.nom) || 'Nouveau projet')}</h1>
      <p class="imp-sous">Situation au ${esc(BASE.meta.date_situation_texte)}. Construit à partir des informations saisies dans NOVA ; chaque fait renvoie à sa source.</p>
      <h2>1. Responsable</h2>
      <p>${s.responsable.nom ? `<strong>${esc(s.responsable.nom)}</strong>${s.responsable.role ? ', ' + esc(s.responsable.role.toLowerCase()) : ''}${s.responsable.depuis ? ' depuis le ' + fmtDate(s.responsable.depuis, true) : ''}.` : inconnu} ${src(s.responsable.preuves)}</p>
      <h2>2. Date approuvée et conditions</h2>
      <p>${d.approuvee ? `<strong>${esc(d.texte)}</strong>${d.autorite ? `, approuvée par ${esc(d.autorite)}` : ''}${d.date_decision ? ` le ${fmtDate(d.date_decision, true)}` : ''}.` : 'Aucune date approuvée.'} ${src(d.preuves)}</p>
      ${(s.propositions || []).length ? `<ul>${s.propositions.map((p) => `<li><strong>Proposition en attente (non approuvée) :</strong> ${esc(p.texte)}${p.propose_par ? ' · ' + esc(p.propose_par) : ''}.</li>`).join('')}</ul>` : ''}
      ${conds.length ? `<table><thead><tr><th>Condition</th><th>État</th><th>Responsable</th></tr></thead><tbody>${conds.map((c) => `<tr><td>${esc(c.id)}. ${esc(c.titre)}</td><td>${badgeEtat(c.etat)}</td><td>${esc(c.responsable || 'À confirmer')}</td></tr>`).join('')}</tbody></table>` : '<p>Aucune condition de lancement enregistrée.</p>'}
      <h2>3. Portée</h2>
      <p>${s.portee.texte ? esc(s.portee.texte) : inconnu} ${src(s.portee.preuves)}</p>
      <h2>4. Budget et factures</h2>
      <p>${f.autorise != null ? `<strong>Autorisé : ${fmtMontant(f.autorise)}</strong>.` : inconnu}${(f.notes_maj || []).length ? ' ' + f.notes_maj.map((n) => esc(n.texte)).join(' ') : ''} ${src(f.preuves)}</p>
      <h2>5. Priorités et actions</h2>
      ${ouvertes.length ? `<ol>${ouvertes.map((a) => `<li><strong>${esc(a.titre)}</strong> · ${esc(a.responsable || 'Responsable à confirmer')}, ${a.echeance ? fmtDate(a.echeance) : 'échéance à confirmer'}</li>`).join('')}</ol>` : '<p>Aucune action ouverte.</p>'}
      <p class="imp-pied">Échéances non écrites dans une source : « à confirmer ». Données : dossier vierge, ${etat.evenements.length} information(s) enregistrée(s) dans ce navigateur.</p>
    </div>`;
  }

  function briefHtml(e) {
    if (!DEMO) return briefGenerique(e);
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
      <p><strong>${esc(s.responsable.nom)}</strong>, ${esc(s.responsable.role.toLowerCase())} depuis le ${fmtDate(s.responsable.depuis, true)}. Avant : ${esc(s.responsable.avant)}.${s.fournisseur ? ` Fournisseur : ${esc(s.fournisseur)}.` : ''} ${src(s.responsable.preuves)}</p>
      <h2>2. Date approuvée et conditions</h2>
      <p><strong>${esc(d.texte)}</strong>, approuvée par le ${esc(autoriteTxt)} le ${fmtDate(d.date_decision, true)}${decisionInitiale ? ' (proposée par Boréal le 8 septembre), sous conditions' : ''}. ${decisionInitiale ? esc(d.reserve) + ' Le report venait du connecteur INT-101, fermé le 17 septembre : cette fermeture ne rétablit pas le 15 octobre.' : 'Vérifier si les conditions de go-live restent valables.'} ${src(d.preuves, decisionInitiale ? ['M06', 'E09', 'INT-101'] : [])}</p>
      ${props ? `<ul>${props}</ul>` : ''}
      <table><thead><tr><th>Condition de go-live</th><th>État</th><th>Action et responsable</th><th>Échéance</th></tr></thead><tbody>${condLignes}</tbody></table>
      <h2>3. Portée</h2>
      <p>Phase 1 : SSO, création et suivi de demandes, pièces jointes, workflow, tableau de suivi, rapports standards, plus rapports avancés et export (CR-01, approuvée le 14 août). <strong>Hors portée :</strong> optimisations mobiles avancées (CR-04, 18 000 $), reportées à la phase 2 le 24 septembre ; aucune dépense sans nouvelle approbation.${s.hebergement ? ` <strong>Hébergement :</strong> ${esc(s.hebergement)}` : ''} ${src(s.portee.preuves, ['E10', 'ADR-007', 'M03'])}</p>
      <h2>4. Budget et factures (CAD, hors taxes)</h2>
      <p><strong>Autorisé : ${fmtMontant(f.autorise)}</strong> (${esc(f.calcul)}). <strong>Facturé : ${fmtMontant(f.facture)}</strong>, dont ${fmtMontant(f.a_contester)} contestés ; payé documenté : ${fmtMontant(f.paye)} (INV-001, INV-002) ; en validation : ${fmtMontant(f.en_validation)} (INV-003). <strong>INV-003 :</strong> libérer au plus le jalon 3 (36 000 $) et bloquer la ligne CR-04 de ${fmtMontant(f.a_contester)}, non approuvée (facture corrigée ou note de crédit). INV-778 (projet ORION) est exclue. Ne pas confondre plafond disponible et autorisation de dépense. ${src(f.preuves, ['INV-001', 'INV-002', 'E07'])}</p>
      ${notesSynth ? `<p><strong>Mises à jour :</strong></p><ul>${notesSynth}</ul>` : ''}
      <h2>5. Priorités</h2>
      <ol>${prio}</ol>
      ${ajouts ? `<p><strong>Nouvelles actions (mises à jour) :</strong></p><ul>${ajouts}</ul>` : ''}
      <h2>6. À ne pas utiliser</h2>
      <p>Le 15 octobre (plans v2/v3, charte) ; la sécurité et l'accessibilité « VERT » (rapport du 21 sept., brouillon d'Alex) ; le risque R-01 « ouvert » (INT-101 fermé le 17 sept.) ; East US (remplacé par Canada Central) ; INV-778 (autre projet).</p>
      ${(s.incertitudes || []).length ? `<p><strong>Encore inconnu :</strong> ${s.incertitudes.map((x) => esc(x.replace(/\.$/, ''))).join(' ; ')}.</p>` : ''}
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
  // Espace 1 — Accueil (vue d'ensemble)
  // ===================================================================

  function hero(e) {
    const s = e.synthese;
    const d = s.date_mep;
    const conds = s.conditions || [];
    const props = s.propositions || [];
    const ton = (code) => (C.ETATS[code] || {}).ton || 'gris';
    const restantes = conds.filter((c) => !fermee(c)).length;
    if (!d.approuvee) {
      return `<section class="hero-date" aria-labelledby="titre-date">${etoile}
        <div class="eyebrow">${icone('calendar-days')}Mise en production</div>
        <p class="affiche" id="titre-date">Date à définir,<br><em>aucune décision enregistrée.</em></p>
        <div class="hero-ligne"><span>Dites à l'assistant qui a approuvé quelle date : il l'enregistre avec sa source. Une simple proposition reste une proposition.</span>
          <button type="button" class="bouton" data-ouvrir-assistant="Le comité de direction a approuvé la mise en production au 15 novembre.">${icone('sparkles')}Donner la date à l'assistant</button></div>
        ${props.length ? `<div class="conditions-mini">${props.map((p) => `<span class="cond">${icone('pencil-line')}<span class="point gris" aria-hidden="true"></span><span class="cond-id">PROPOSITION</span>${esc(p.texte)} · <strong>non approuvée</strong></span>`).join('')}</div>` : ''}
      </section>`;
    }
    const jours = joursEntre(dateReference(e), d.approuvee);
    const sousTitre = !conds.length ? 'sans condition enregistrée.' : restantes === conds.length ? `sous ${enLettres(conds.length)} condition${conds.length > 1 ? 's' : ''}.` : restantes > 0 ? `${restantes} condition${restantes > 1 ? 's' : ''} encore ouverte${restantes > 1 ? 's' : ''}.` : 'conditions remplies.';
    const autorite = d.autorite ? d.autorite.charAt(0).toLowerCase() + d.autorite.slice(1) : '';
    return `<section class="hero-date" aria-labelledby="titre-date">${etoile}
        <div class="eyebrow">${icone('calendar-days')}Mise en production approuvée ${marqueMaj(d)}</div>
        <p class="affiche" id="titre-date">${esc(d.texte)},<br><em>${esc(sousTitre)}</em></p>
        <div class="hero-ligne">
          ${autorite ? `<span>Approuvée par le <strong>${esc(autorite)}</strong>${d.date_decision ? ` le ${fmtDate(d.date_decision, true)}` : ''}.</span>` : ''}
          ${jours >= 0 ? `<span class="jalon">${icone('hourglass')}J−${jours} · au ${fmtDate(dateReference(e))}</span>` : ''}
          ${(d.preuves || [])[0] ? boutonPreuve(d.preuves[0], { compact: true }) : ''}
          <button type="button" class="bouton" data-action="imprimer-brief">${icone('printer')}Imprimer le brief (1 page)</button>
        </div>
        ${conds.length || props.length ? `<div class="conditions-mini">${conds.map((c) => `<a class="cond" href="#vue/conditions">${icone(ICONE_CONDITION[c.id] || 'flag')}<span class="point ${ton(c.etat)}" aria-hidden="true"></span><span class="cond-id">${esc(c.id)}</span>${esc(c.titre.split(' (')[0])} · <strong>${esc((C.ETATS[c.etat] || {}).libelle || c.etat)}</strong></a>`).join('')}
          ${props.map((p) => `<span class="cond">${icone('pencil-line')}<span class="point gris" aria-hidden="true"></span><span class="cond-id">PROPOSITION</span>${esc(p.texte)} · <strong>non approuvée</strong></span>`).join('')}</div>` : ''}
      </section>`;
  }

  function cartesKpi(e) {
    const s = e.synthese;
    const f = s.finances;
    const conds = s.conditions || [];
    const remplies = conds.filter(fermee).length;
    const ouvertes = e.actions.filter((a) => !C.ETATS_FERMES.includes(a.etat));
    const r = s.responsable;
    const carteResp = r.nom
      ? `<div class="chiffre">${esc(r.nom)}</div>
          ${r.depuis ? `<p>${esc(r.role || 'Responsable')} depuis le <strong>${fmtDate(r.depuis, true)}</strong>.</p>` : `<p>${esc(r.role || 'Responsable du projet')}.</p>`}
          ${r.avant ? `<p class="petit doux">Avant : ${esc(r.avant)}.</p>` : ''}${premiere(r.preuves) ? boutonPreuve(DEMO ? r.preuves[0] : premiere(r.preuves), { compact: true }) : ''}${marqueMaj(r)}`
      : `<div class="chiffre doux">À définir</div><p class="petit">Personne n'est encore désigné.</p>
          <button type="button" class="bouton petit" data-ouvrir-assistant="Marie Dupont est la cheffe de projet depuis le 1er octobre.">${icone('sparkles')}Le dire à l'assistant</button>`;
    const carteConds = conds.length
      ? `<div class="chiffre">${remplies} / ${conds.length} remplies</div>
          <ul class="liste-cond">${conds.map((c) => `<li><span class="code-cond">${esc(c.id)}</span>${badgeEtat(c.etat)}</li>`).join('')}</ul>
          <a class="petit" href="#vue/conditions">Détail des conditions</a>`
      : `<div class="chiffre doux">Aucune</div><p class="petit">Aucune condition de lancement enregistrée.</p>`;
    const carteFin = f.autorise != null
      ? `<div class="chiffre">${fmtMontant(f.autorise)}</div>
          <p class="petit">${DEMO ? 'autorisés (180 000 $ + CR-01).' : 'autorisés.'}${f.facture != null ? `<br>Facturé : <strong>${fmtMontant(f.facture)}</strong>` : ''}${f.paye != null ? ` · Payé : <strong>${fmtMontant(f.paye)}</strong>` : ''}</p>
          ${f.a_contester ? `<p class="petit">${badge('rouge', fmtMontant(f.a_contester) + ' à contester' + (DEMO ? ' (INV-003)' : ''), '!')}</p>` : ''}${premiere(f.preuves) ? boutonPreuve(DEMO ? f.preuves[0] : premiere(f.preuves), { compact: true }) : ''}`
      : `<div class="chiffre doux">Non renseigné</div><p class="petit">Aucun montant autorisé enregistré.</p>`;
    return `<div class="grille grille-4">
        <div class="carte kpi">${tuile('user-round')}<div class="etiquette">Responsable</div>${carteResp}</div>
        <div class="carte kpi">${tuile('flag', conds.length && remplies === conds.length ? 'ton-vert' : conds.length ? 'ton-rouge' : '')}<div class="etiquette">Conditions de go-live</div>${carteConds}</div>
        <div class="carte kpi">${tuile('banknote')}<div class="etiquette">Finances${f.devise ? ` (${esc(f.devise.replace('hors taxes', 'HT').replace(', ', ', '))})` : ''}</div>${carteFin}</div>
        <div class="carte kpi">${tuile('list-checks')}<div class="etiquette">Actions ouvertes</div><div class="chiffre">${ouvertes.length}</div>
          <p class="petit">${ouvertes.length ? `dont ${ouvertes.filter((a) => a.condition).length} liées aux conditions de go-live.<br>Échéances documentées : <strong>${ouvertes.filter((a) => a.echeance).length}</strong> (les autres sont « À confirmer »).` : 'Aucune action ouverte.'}</p>
          <a class="petit" href="#actions">Voir les actions</a></div>
      </div>`;
  }

  function rendreVue() {
    const e = etat.courant;
    const s = e.synthese;
    const f = s.finances;
    const conds = s.conditions || [];
    const props = s.propositions || [];
    let html = hero(e) + cartesKpi(e);

    // Ce que l'on ne sait pas encore (incertitudes relevées par l'équipe)
    if ((s.incertitudes || []).length) {
      html += `<section class="carte" aria-labelledby="titre-incertitudes" style="margin-top:var(--e5)">
        <div class="preuve-ligne">${tuile('circle-help', 'ton-ambre')}<div><h3 id="titre-incertitudes" style="margin:0">Ce que l'on ne sait pas encore</h3>
        <p class="doux" style="margin:0">Aucune de ces informations n'est écrite dans le corpus : NOVA les signale au lieu de les inventer.</p></div></div>
        <ul class="liste-inconnus">${s.incertitudes.map((x) => `<li>${icone('hourglass')}<span>${esc(x)}</span></li>`).join('')}</ul></section>`;
    }
    if (!DEMO && !etat.evenements.length) {
      html += `<div style="margin-top:var(--e5)">${A.appelAssistant('Votre dossier est vide : commencez par l\'assistant', 'Collez un courriel, un compte rendu ou dites simplement ce qui est décidé. NOVA range chaque fait (responsable, date, conditions, actions) et garde sa source.', 'Le projet s\'appelle Atlas. Marie Dupont en est la cheffe de projet depuis le 1er octobre.')}</div>`;
    }

    html += '<div class="section"><h2>' + icone('layers') + 'Le détail</h2></div><p class="intro">Chaque bloc se déplie d\'un clic.</p>';

    // Conditions de go-live
    const tableConds = conds.length
      ? `<p class="intro">${DEMO ? 'Fixées par le comité de direction du 26 septembre. Le 22 octobre n\'est pas un go automatique : les trois doivent être remplies.' : 'Une condition ne se ferme qu\'avec la validation de l\'équipe responsable.'}</p>
      <div class="table-wrap"><table><thead><tr><th>Condition</th><th>État</th><th>Responsable</th><th>Actions</th><th>Preuve</th></tr></thead><tbody>
      ${conds.map((c) => `<tr><td><strong>${esc(c.id)}. ${esc(c.titre)}</strong>${marqueMaj(c)}${c.detail ? `<br><span class="petit doux">${esc(c.detail)}</span>` : ''}
          ${(c.notes_maj || []).map((n) => `<div class="maj-note petit">${esc(n.texte)}</div>`).join('')}</td>
        <td>${badgeEtat(c.etat)}</td><td>${esc(c.responsable || 'À confirmer')}</td>
        <td>${(c.actions || []).map((id) => `<a href="#actions/action-${esc(id)}">${esc(id)}</a>`).join(', ')}</td>
        <td>${(c.preuves || []).slice(-2).map((p) => boutonPreuve(p, { compact: true })).join(' ')}</td></tr>`).join('')}
      </tbody></table></div>`
      : vide('flag', 'Aucune condition de lancement', 'Ajoutez-en une en la décrivant à l\'assistant, avec l\'équipe qui devra la valider.', 'Condition de lancement : le test de charge doit être validé par l\'équipe infrastructure.');
    html += accordeon('conditions', 'flag', 'Conditions de go-live', conds.length ? `${conds.filter(fermee).length} / ${conds.length} remplies` : 'aucune', tableConds, true);

    if (props.length) {
      html += accordeon('propositions', 'pencil-line', 'Propositions en attente de décision', `${props.length} en attente`,
        `<p class="intro">Une proposition n'est pas une décision : la date approuvée ne change pas tant que l'autorité compétente n'a pas approuvé.</p>
        <div class="table-wrap"><table><thead><tr><th>Proposition</th><th>Par</th><th>Motif</th><th>Statut</th><th>Preuve</th></tr></thead><tbody>
        ${props.map((p) => `<tr><td><strong>${esc(p.texte)}</strong></td><td>${esc(p.propose_par || '')}</td><td>${esc(p.motif || '')}</td><td>${badge('bleu', p.statut || 'En attente de décision', '?')}</td><td>${(p.preuves || []).map((x) => boutonPreuve(x, { compact: true })).join(' ')}</td></tr>`).join('')}
        </tbody></table></div>`, true);
    }

    // Priorités
    if ((s.priorites || []).length) {
      html += accordeon('priorites', 'target', 'Priorités', `${s.priorites.length} priorités`, `<ol class="liste-priorites">
        ${s.priorites.map((p) => {
          const acts = (p.actions || []).map((id) => actionParId(e, id)).filter(Boolean);
          const cond = p.condition && conds.find((c) => c.id === p.condition);
          return `<li class="carte"><strong class="ligne-ic">${icone('flag-triangle-right')}${esc(p.titre)}</strong> ${cond ? badgeEtat(cond.etat) : ''}<br>${esc(p.texte)}<br>
            <span class="petit">Actions : ${acts.map((a) => `<a href="#actions/action-${esc(a.id)}">${esc(a.id)}</a> (${esc(a.responsable)}, ${a.echeance ? fmtDate(a.echeance) : 'échéance à confirmer'})`).join(' · ')}</span></li>`;
        }).join('')}</ol>`);
    }

    // Portée et finances
    const portee = s.portee.texte || (s.portee.incluse || []).length
      ? `<section class="carte"><h3 class="ligne-ic">${icone('route')}Portée</h3><p>${esc(s.portee.texte || '')}</p>
        ${s.hebergement ? `<p class="ligne-ic petit">${icone('server')}<span><strong>Hébergement :</strong> ${esc(s.hebergement)}</span></p>` : ''}
        ${s.fournisseur ? `<p class="ligne-ic petit">${icone('handshake')}<span><strong>Fournisseur :</strong> ${esc(s.fournisseur)}</span></p>` : ''}
        ${(s.portee.incluse || []).length ? `<h4>Inclus</h4><ul>${s.portee.incluse.map((x) => `<li>${esc(x)}</li>`).join('')}</ul>` : ''}
        ${(s.portee.hors_portee || []).length ? `<h4>Hors portée</h4><ul>${s.portee.hors_portee.map((x) => `<li>${esc(x)}</li>`).join('')}</ul>` : ''}
        ${(s.portee.notes_maj || []).map((n) => `<div class="maj-note">${esc(n.texte)}</div>`).join('')}
        ${(s.portee.preuves || []).length ? `<details><summary>Preuves</summary>${listePreuves(s.portee.preuves)}</details>` : ''}</section>`
      : vide('route', 'Portée non renseignée', 'Décrivez à l\'assistant ce qui est inclus et ce qui ne l\'est pas.', 'La portée de la phase 1 : application mobile et portail client ; hors portée : la refonte du site.');
    const finances = f.autorise != null || (f.factures || []).length
      ? `<section class="carte"><h3 class="ligne-ic">${icone('banknote')}Finances</h3>
        ${f.autorise != null ? `<p><strong>Autorisé : ${fmtMontant(f.autorise)}</strong>${f.calcul ? ` = ${esc(f.calcul)}` : ''}.</p>` : ''}
        ${(f.factures || []).length ? `<div class="table-wrap"><table><thead><tr><th>Facture</th><th>Date</th><th>Montant</th><th>Statut</th></tr></thead><tbody>
          ${f.factures.map((x) => `<tr><td><strong>${esc(x.id)}</strong><br><span class="petit doux">${esc(x.detail)}</span></td><td class="nowrap">${fmtDate(x.date)}</td><td class="nowrap">${fmtMontant(x.montant)}</td>
            <td>${x.statut === 'Payée' ? badge('vert', 'Payée', '✓') : badge('ambre', x.statut, '◐')}${x.alerte ? ' ' + badge('rouge', '18 000 $ non approuvés', '!') : ''}</td></tr>`).join('')}
          <tr><td><strong>Total</strong></td><td></td><td class="nowrap"><strong>${fmtMontant(f.facture)}</strong></td><td>Payé : ${fmtMontant(f.paye)}</td></tr>
        </tbody></table></div>` : ''}
        ${DEMO ? `<p class="petit" style="margin-top:.5rem">Si la ligne CR-04 est retirée : ${fmtMontant(f.facture - f.a_contester)} facturés, soit ${fmtMontant(f.solde_si_inv003_corrigee)} encore disponibles. Exclue : ${f.exclues.map((x) => `${esc(x.id)} (${fmtMontant(x.montant)}, ${esc(x.raison)})`).join(', ')}.</p>` : ''}
        ${f.remarque ? `<p class="petit doux">${esc(f.remarque)}</p>` : ''}
        ${(f.notes_maj || []).map((n) => `<div class="maj-note">${esc(n.texte)}</div>`).join('')}
        ${(f.preuves || []).length ? `<details><summary>Preuves</summary>${listePreuves(f.preuves)}</details>` : ''}</section>`
      : vide('banknote', 'Finances non renseignées', 'Donnez à l\'assistant le budget autorisé et qui l\'a approuvé.', 'Le comité a approuvé un budget de 120 000 $ pour le projet.');
    html += accordeon('finances', 'banknote', 'Portée et finances', f.autorise != null ? `${fmtMontant(f.autorise)} autorisés` : 'non renseignées', `<div class="grille grille-2">${portee}${finances}</div>`);

    // Informations périmées
    if ((s.a_ne_pas_utiliser || []).length) {
      html += accordeon('a-ne-pas-utiliser', 'triangle-alert', 'Informations à ne pas utiliser', `${s.a_ne_pas_utiliser.length} pièges`,
        `<p class="intro">Ces informations circulent encore dans le corpus, mais elles sont périmées, inexactes ou hors projet.</p>
        <div class="table-wrap"><table><thead><tr><th>Information</th><th>Où on la trouve</th><th>Pourquoi l'écarter</th></tr></thead><tbody>
        ${s.a_ne_pas_utiliser.map((x) => `<tr><td><span class="ligne-ic rouge">${icone('ban')}<strong>${esc(x.texte)}</strong></span></td><td>${x.sources.map((id) => `<button type="button" class="bouton petit" data-ouvrir-source-page="${esc(id)}">${esc(id)}</button>`).join(' ')}</td><td>${esc(x.raison)}</td></tr>`).join('')}
        </tbody></table></div>`);
    }

    // Brief
    html += accordeon('brief', 'file-text', 'Brief de reprise (une page)', 'à imprimer', `<div class="groupe-boutons"><button type="button" class="bouton primaire" data-action="imprimer-brief">${icone('printer')}Imprimer le brief (1 page)</button>
      <button type="button" class="bouton" data-action="exporter-brief">${icone('download')}Exporter le brief (texte)</button></div>
      <div class="carte brief" style="margin-top:var(--e4)">${briefHtml(e)}</div>`);
    return html;
  }

  // ===================================================================
  // Espace 3 — Historique et décisions (un sous-onglet à la fois)
  // ===================================================================

  function rendreHistorique() {
    const e = etat.courant;
    const filtres = etat.filtres;
    const vue = etat.sousOnglets.historique;
    const tete = `<header class="tete-page"><div class="eyebrow">${icone('history')}Espace 03 · ${e.chronologie.length} événements${e.contradictions.length ? `, ${e.contradictions.length} contradictions` : ''}</div><h2>Historique et décisions</h2>
      <p class="intro">Ce qui a été proposé, décidé, livré et validé, et pourquoi certaines informations ne font plus foi.</p></header>
      ${segmente('historique', [['chrono', 'Chronologie', 'calendar-days', e.chronologie.length], ['cycles', 'Décision et validation', 'milestone', e.cycles.length], ['decisions', 'Registre des décisions', 'landmark', e.decisions.length], ['contradictions', 'Contradictions', 'split', e.contradictions.length]])}`;
    let html = tete;

    if (vue === 'chrono') {
      const sujetsPresents = [...new Set(e.chronologie.flatMap((t) => t.sujets || []))].filter((s) => SUJETS[s]);
      const items = e.chronologie.filter((t) => {
        if (filtres.sujets.size && !(t.sujets || []).some((s) => filtres.sujets.has(s))) return false;
        if (filtres.masquerHistorique && ['historique', 'remplacee'].includes(t.validite)) return false;
        if (filtres.nature && t.nature !== filtres.nature) return false;
        return true;
      });
      if (!e.chronologie.length) return html + `<div id="h-chrono">${vide('calendar-days', 'Aucun événement pour l\'instant', 'Chaque information donnée à l\'assistant entre ici, datée et sourcée.', 'Compte rendu du comité du 1er octobre : le lancement est approuvé au 15 novembre.')}</div>`;
      html += `<h3 id="h-chrono">Chronologie (${items.length} sur ${e.chronologie.length})</h3>
        ${sujetsPresents.length ? `<details class="filtres-repli"${filtres.sujets.size || filtres.masquerHistorique || filtres.nature ? ' open' : ''}><summary>${icone('target')}Filtrer${filtres.sujets.size ? ` (${filtres.sujets.size} sujet${filtres.sujets.size > 1 ? 's' : ''})` : ''}</summary>
        <div class="filtres" role="group" aria-label="Filtrer par sujet">
          <p class="filtres-titre">Par sujet (cliquez pour sélectionner, cliquez encore pour retirer)</p>
          ${sujetsPresents.map((s) => `<button type="button" class="puce" data-filtre-sujet="${s}" aria-pressed="${filtres.sujets.has(s)}">${esc(SUJETS[s])}</button>`).join('')}
        </div>
        <div class="filtres-options">
          <label><input type="checkbox" data-filtre="historique" ${filtres.masquerHistorique ? 'checked' : ''}> Masquer ce qui a été remplacé</label>
          <label>Type d'événement : <select data-filtre="nature"><option value="">Tous</option>${Object.entries(C.NATURES).map(([k, n]) => `<option value="${k}" ${filtres.nature === k ? 'selected' : ''}>${esc(n.libelle)}</option>`).join('')}</select></label>
        </div></details>` : ''}
        <ol class="chrono">
        ${items.map((t) => `<li class="${t._ajoute_par ? 'ajout' : ''}"><span class="jalon-ic ton-${(C.NATURES[t.nature] || {}).ton || 'gris'}" aria-hidden="true">${icone(A.ICONE_NATURE[t.nature] || 'info')}</span><div class="date">${t.date_texte ? esc(t.date_texte) : fmtDate(t.date, true)}${t.heure ? ', ' + esc(t.heure.replace(':', ' h ')) : ''}</div>
            <div class="preuve-ligne">${badgeNature(t.nature)} ${badgeValidite(t.validite)} ${t._ajoute_par ? badge('ambre', 'Mise à jour', '◆') : ''} <span class="titre">${esc(t.titre)}</span></div>
            ${t.resume ? `<p class="petit">${esc(t.resume)}</p>` : ''}
            <div class="groupe-boutons petit" style="margin-top:.25rem">${t.preuve ? boutonPreuve(t.preuve, { compact: true }) : ''}
              ${(t.sources || []).filter((id) => !t.preuve || id !== t.preuve.source).map((id) => `<button type="button" class="bouton petit" data-ouvrir-source-page="${esc(id)}">${esc(id)}</button>`).join(' ')}</div></li>`).join('')}
        </ol>`;
    } else if (vue === 'cycles') {
      html += `<h3 id="h-cycles" class="visuellement-cache">Proposition, décision, livraison, validation</h3>
        <p class="intro">Pour chaque sujet, ce qui a été proposé, décidé, livré et validé, avec les dates et les sources. Une étape rouge n'est pas faite.</p>
        ${e.cycles.length ? e.cycles.map((c) => `<section class="carte"><h3>${esc(c.sujet)}</h3><div class="cycle">
          ${c.etapes.map((t) => `<div class="etape ${t.statut === 'fait' ? 'fait' : 'manquant'}"><div class="etape-nom">${icone(t.statut === 'fait' ? 'circle-check' : 'circle-x')}${esc(t.etape)}</div>
            <div>${t.date ? `<strong>${fmtDate(t.date)}</strong> · ` : '<strong>Pas encore</strong> · '}${esc(t.texte)}</div>
            ${t.preuve ? `<div style="margin-top:.3rem">${boutonPreuve(t.preuve, { compact: true })}</div>` : ''}</div>`).join('')}
        </div></section>`).join('') : vide('milestone', 'Aucun cycle pour l\'instant', 'Les propositions, décisions et validations que vous enregistrez apparaissent dans la chronologie, avec leur nature.')}`;
    } else if (vue === 'decisions') {
      html += `<h3 id="h-decisions" class="visuellement-cache">Registre des décisions</h3>
        ${e.decisions.length ? `<div class="table-wrap"><table><thead><tr><th>Date</th><th>Décision</th><th>Autorité</th><th>Statut</th><th>Preuve</th></tr></thead><tbody>
        ${e.decisions.map((x) => `<tr><td class="nowrap">${fmtDate(x.date)}</td><td><strong>${esc(x.titre)}</strong>${x.remarque ? `<br><span class="petit doux">${esc(x.remarque)}</span>` : ''}</td><td>${esc(x.autorite)}</td>
          <td>${/^En vigueur/.test(x.statut) ? badge('vert', x.statut, '✓') : badge('gris', x.statut)}</td><td>${x.preuve ? boutonPreuve(x.preuve, { compact: true }) : (x.preuves || []).slice(-1).map((p) => boutonPreuve(p, { compact: true })).join('')}</td></tr>`).join('')}
        </tbody></table></div>` : vide('landmark', 'Aucune décision enregistrée', 'Dites à l\'assistant ce qui a été décidé, et par qui : la décision entre au registre avec sa source.', 'Le comité de direction a approuvé la mise en production au 15 novembre.')}`;
    } else {
      html += `<h3 id="h-contradictions" class="visuellement-cache">Contradictions expliquées</h3>
        <p class="intro">Chaque contradiction est tranchée par l'autorité de la source ou la date des faits, pas par la date du fichier.</p>
        ${e.contradictions.length ? e.contradictions.map((k) => `<section class="carte contradiction"><div class="preuve-ligne"><h3 style="margin:0">${esc(k.id)} · ${esc(k.sujet)}</h3>${badge('gris', k.type)}</div>
          <div class="versus" style="margin-top:.6rem">
            <div class="perime"><div class="etiquette">${icone('circle-x')}Périmé ou inexact</div><p><strong>${esc(k.version_perimee.texte)}</strong></p><p class="petit">Sources : ${k.version_perimee.sources.map(esc).join(', ')}</p>${boutonPreuve(k.version_perimee.preuve, { compact: true })}</div>
            <div class="valide"><div class="etiquette">${icone('circle-check')}Fait foi</div><p><strong>${esc(k.version_valide.texte)}</strong></p><p class="petit">Sources : ${k.version_valide.sources.map(esc).join(', ')}</p>${boutonPreuve(k.version_valide.preuve, { compact: true })}</div>
          </div>
          <p style="margin-top:.6rem"><strong>Pourquoi :</strong> ${esc(k.explication)}</p>${k.preuve_explication ? boutonPreuve(k.preuve_explication, { compact: true }) : ''}</section>`).join('') : vide('split', 'Aucune contradiction relevée', 'Quand deux sources disent des choses différentes, NOVA garde les deux et indique laquelle fait foi.')}`;
    }
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
    const tete = `<header class="tete-page"><div class="eyebrow">${icone('list-checks')}Espace 04 · Responsables et échéances</div>
      <div class="section" style="margin:0"><h2>Actions</h2><div class="groupe-boutons"><button type="button" class="bouton" data-action="exporter-actions">${icone('download')}Exporter les actions (CSV)</button></div></div></header>`;
    if (!e.actions.length) return tete + vide('list-checks', 'Aucune action pour l\'instant', 'Dites à l\'assistant qui doit faire quoi, et pour quand : sans date écrite, l\'échéance reste « À confirmer ».', 'Nouvelle action : rédiger le plan de formation, responsable Paul Martin, pour le 20 octobre.');
    const pl = (n, un, plusieurs) => (n > 1 ? plusieurs : un);
    const liees = ouvertes.filter((a) => a.condition).length;
    return tete + `<p class="intro"><strong>${ouvertes.length} ${pl(ouvertes.length, 'action ouverte', 'actions ouvertes')}</strong>, dont ${liees} ${pl(liees, 'liée', 'liées')} aux conditions de go-live. ${sansDate ? `${sansDate} ${pl(sansDate, 'n\'a', 'n\'ont')} aucune échéance documentée : ${pl(sansDate, 'elle est marquée', 'elles sont marquées')} « À confirmer ». ` : 'Toutes ont une échéance écrite dans une source. '}Aucune date n'a été inventée.</p>
      <details class="legende"><summary>${icone('info')}Comment lire ce tableau ?</summary><div class="encadre ton-gris petit">${badge('vert', 'Confirmé', '✓')} le responsable est désigné dans une source ; ${badge('bleu', "Proposé par l'équipe", '?')} c'est notre suggestion.
        ${badge('violet', 'Engagement documenté', 'handshake')} promis dans une source ; ${badge('bleu', "Recommandation de l'équipe", 'lightbulb')} proposée par notre équipe, sans engagement écrit.</div></details>
      <div class="filtres" role="group" aria-label="Filtrer les actions">
        ${Object.entries(FILTRES_ACTIONS).map(([k, [lib]]) => `<button type="button" class="puce" data-filtre-actions="${k}" aria-pressed="${etat.filtres.actions === k}">${esc(lib)}</button>`).join('')}
      </div>
      <div class="table-wrap"><table class="table-actions"><thead><tr><th style="width:42%">Action</th><th>Responsable</th><th>Échéance</th><th>État</th></tr></thead><tbody>
      ${liste.map((a) => `<tr id="action-${esc(a.id)}">
        <td><strong>${esc(a.id)}</strong> · ${esc(a.titre)}${marqueMaj(a)}
          <div class="preuve-ligne" style="margin-top:.3rem">${a.condition ? `<a class="badge ton-gris" href="#vue/conditions">Condition ${esc(a.condition)}</a>` : ''} ${badgeType(a.type)}</div>
          ${(a.notes_maj || []).map((n) => `<div class="maj-note petit">${esc(n.texte)}</div>`).join('')}
          <div class="groupe-boutons" style="margin-top:.35rem">${(a.preuves || []).map((p) => boutonPreuve(p, { compact: true })).join('')}</div></td>
        <td><span class="ligne-ic">${icone('user-round')}${esc(a.responsable || 'À confirmer')}</span><br>${badgeResponsable(a.responsable_statut)}</td>
        <td><span class="ligne-ic">${icone('calendar-clock')}${texteEcheance(a)}</span>${a.echeance_note ? `<br><span class="petit doux">${esc(a.echeance_note)}</span>` : ''}</td>
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
  // Espace 5 — Documents et mises à jour (un sous-onglet à la fois) ;
  // les sections « Mises à jour » et « Exporter » viennent de mises_a_jour.js.
  // ===================================================================

  function rendreDocuments() {
    const req = etat.rechercheDocs || '';
    const vue = etat.sousOnglets.documents;
    const sources = Object.values(A.SOURCES).filter((s) => !s._apercu);
    const nbMaj = etat.evenements.length;
    let html = `<header class="tete-page"><div class="eyebrow">${icone('folder-open')}Espace 05 · ${sources.length} sources</div><h2>Documents et mises à jour</h2>
      <p class="intro">Retrouver un passage dans les sources, ajouter une nouvelle information et comparer avant et après.</p></header>
      ${segmente('documents', [['recherche', 'Rechercher', 'search'], ['liste', 'Tous les documents', 'files', sources.length], ['maj', 'Mises à jour', 'bell-ring', nbMaj || null], ['export', 'Exporter', 'download']])}`;
    if (vue === 'recherche') {
      const resultats = req ? A.rechercherDocuments(req, 25) : [];
      html += `<section class="carte" id="d-recherche"><h3 class="ligne-ic">${icone('file-search')}Rechercher dans les sources</h3>
        <form id="form-recherche-docs" class="groupe-boutons" role="search">
          <label for="champ-recherche-docs" class="visuellement-cache">Mots à chercher</label>
          <input id="champ-recherche-docs" type="search" style="flex:1 1 300px" value="${esc(req)}" placeholder="${DEMO ? 'ex. : rollback, Canada Central, 18 000, ACC-303' : 'ex. : budget, comité, formation'}">
          <button class="bouton primaire" type="submit">${icone('search')}Rechercher</button></form>
        <p class="petit doux" style="margin:.4rem 0">Recherche dans le texte de tous les documents${DEMO ? ' (courriels, comptes rendus, tickets, PDF et cellules Excel)' : ''}, sans tenir compte des accents.${DEMO ? ' Les captures sont décrites par leurs tickets.' : ''}</p>
        ${req ? `<p><strong>${resultats.length} document(s)</strong> pour « ${esc(req)} »</p>${A.htmlResultatsDocuments(resultats, req)}` : ''}
      </section>`;
    } else if (vue === 'liste') {
      const groupes = {};
      for (const s of sources) {
        const dossier = s._evenement ? 'Nouvelles sources (mises à jour)' : DOSSIERS[(s.chemin || '').split('/')[0]] || 'Consignes du défi';
        (groupes[dossier] = groupes[dossier] || []).push(s);
      }
      html += `<section id="d-liste"><h3 class="visuellement-cache">Tous les documents (${sources.length})</h3>
        <p class="intro">Chaque source porte son niveau d'autorité. Une copie ou une pièce jointe identique ne compte jamais comme une confirmation indépendante.</p>
        ${!sources.length ? vide('files', 'Aucun document', 'Collez un courriel, un compte rendu ou un ticket dans l\'assistant : il devient une source consultable, et chaque fait renvoie à son passage.', '') : ''}
        ${Object.entries(groupes).map(([g, liste]) => `<details class="carte" ${g.startsWith('Nouvelles') || Object.keys(groupes).length === 1 ? 'open' : ''}><summary>${esc(g)} (${liste.length})</summary>
          <div class="table-wrap" style="margin-top:.5rem"><table><thead><tr><th>ID</th><th>Document</th><th>Date</th><th>Autorité</th><th>Note</th><th></th></tr></thead><tbody>
          ${liste.map((s) => {
            const doc = A.DOCS[s.id] || {};
            const pj = (doc.pieces || []).filter((p) => p.identique_a).map((p) => `Pièce jointe = ${p.identique_a.join(', ')}`).join(' ; ');
            return `<tr><td class="nowrap"><span class="ligne-ic">${icone(iconeDoc(s.id))}<strong>${esc(s.id)}</strong></span></td><td>${esc(s.titre)}<br><span class="petit doux">${esc(s.chemin || '(texte collé)')}</span></td>
              <td class="nowrap">${fmtDate(s.date)}</td><td>${badgeAutorite(s.autorite)}</td><td class="petit">${esc(s.remarque || '')}${pj ? `<br>${esc(pj)}` : ''}</td>
              <td><button type="button" class="bouton petit" data-ouvrir-source-page="${esc(s.id)}">${icone('eye')}Ouvrir</button></td></tr>`;
          }).join('')}</tbody></table></div></details>`).join('')}
      </section>`;
    } else if (window.NOVA_MAJ) {
      html += vue === 'export' ? window.NOVA_MAJ.rendreExport() : window.NOVA_MAJ.rendreMisesAJour();
    }
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
    else if (b.dataset.action === 'exporter-brief') telecharger(DEMO ? 'NOVA_brief_de_reprise.md' : 'brief_de_reprise.md', briefTexte(etat.courant), 'text/markdown;charset=utf-8');
    else if (b.dataset.action === 'exporter-actions') telecharger(DEMO ? 'NOVA_actions.csv' : 'actions.csv', actionsCsv(etat.courant), 'text/csv;charset=utf-8');
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
  Object.assign(A, { briefHtml, briefTexte, actionsCsv, telecharger, imprimerBrief, segmente, vide });
})();
