/* NOVA — Mémoire de projet. Application autonome (aucun serveur, aucune clé API).
   Les données viennent de donnees/NOVA_OPERATIONS.json, intégrées au moment de la construction. */
(function () {
  'use strict';

  const C = window.NOVA_COMMUN;
  const BRUT = JSON.parse(document.getElementById('nova-donnees').textContent);
  // Deux versions dans le même fichier : la démo (dossier NOVA, situation figée au 30 septembre 2026)
  // et un dossier vierge (nouveau projet, rempli par l'assistant ou le formulaire).
  const CLE_MODE = 'nova360.mode';
  const MODE_CHOISI = (() => { try { return localStorage.getItem(CLE_MODE); } catch { return null; } })();
  const MODE = MODE_CHOISI === 'vierge' && BRUT.vierge ? 'vierge' : 'demo';
  const BASE = MODE === 'vierge' ? BRUT.vierge : BRUT.operations;
  const DOCS = MODE === 'vierge' ? {} : BRUT.documents;
  const CLE_STOCKAGE = MODE === 'vierge' ? 'nova360.vierge.evenements.v1' : 'nova360.evenements.v1';
  if (MODE === 'vierge') {
    // Un vrai nouveau projet vit au présent : sa situation est la date du jour.
    const maintenant = new Date();
    BASE.meta.date_situation = maintenant.toISOString();
    BASE.meta.date_situation_texte = new Intl.DateTimeFormat('fr-CA', { day: 'numeric', month: 'long', year: 'numeric', hour: '2-digit', minute: '2-digit' }).format(maintenant).replace(/ h /, ' h ');
    BASE.guide = BASE.guide || (BRUT.operations.guide && BRUT.operations.guide.vierge) || null;
  }
  const $ = (sel, racine) => (racine || document).querySelector(sel);
  const $$ = (sel, racine) => [...(racine || document).querySelectorAll(sel)];

  // ===================================================================
  // État de l'application
  // ===================================================================

  const etat = {
    onglet: 'vue',
    version: 'actualisee',
    exempleActif: false,
    evenementsLocaux: lireLocaux(),
    courant: BASE,
    actualise: BASE,
    journal: [],
    erreursMaj: [],
    evenements: [],
    requete: '',
    filtres: { sujets: new Set(), masquerHistorique: false, actions: 'toutes' },
    // Un espace = une vue à la fois : les grandes sections deviennent des sous-onglets.
    sousOnglets: { historique: 'chrono', documents: 'recherche' },
    expertOuvert: false,
  };

  function lireLocaux() {
    try { return JSON.parse(localStorage.getItem(CLE_STOCKAGE) || '[]'); } catch { return []; }
  }
  function ecrireLocaux() {
    try { localStorage.setItem(CLE_STOCKAGE, JSON.stringify(etat.evenementsLocaux)); return true; }
    catch { annoncer("Impossible d'enregistrer dans ce navigateur : exportez la mise à jour en JSON."); return false; }
  }

  // Sources (corpus + sources ajoutées par les mises à jour).
  const SOURCES = {};
  BASE.sources.forEach((s) => { SOURCES[s.id] = s; });

  function enregistrerSourceEvenement(ev) {
    const s = ev.source;
    if (!s || !s.id) return;
    if (!SOURCES[s.id] || SOURCES[s.id]._apercu) {
      SOURCES[s.id] = Object.assign({ autorite: 'officielle', titre: s.titre || ev.titre, date: (ev.date || '').slice(0, 10), _evenement: ev.id }, s);
    }
    if (!DOCS[s.id] || DOCS[s.id]._apercu) {
      // Un fichier joint n'est accepté que s'il s'agit d'une vraie URL de données (pas de HTML injecté).
      const f = s.fichier && /^data:[\w.+\/-]+;base64,[A-Za-z0-9+/=]+$/.test(s.fichier.dataUrl || '') ? s.fichier : null;
      if (f && /^image\//.test(f.type)) DOCS[s.id] = { genre: 'image', original: f.dataUrl, chemin: f.nom, texteJoint: s.texte };
      else if (f && f.type === 'application/pdf') DOCS[s.id] = { genre: 'pdf', original: f.dataUrl, pages: s.texte ? [{ texte: s.texte }] : [], chemin: f.nom };
      else DOCS[s.id] = { genre: 'texte', texte: s.texte || '(aucun texte fourni)', chemin: (f && f.nom) || '(texte collé dans la mise à jour)' };
    }
  }

  function recalculer() {
    const integres = MODE === 'demo' ? BRUT.evenements : [];
    const exemples = MODE === 'demo' && etat.exempleActif ? BRUT.exemples : [];
    const evs = [...integres, ...exemples, ...etat.evenementsLocaux]
      .slice().sort((a, b) => String(a.date).localeCompare(String(b.date)));
    evs.forEach(enregistrerSourceEvenement);
    const r = C.appliquerEvenements(BASE, evs);
    etat.evenements = evs;
    etat.actualise = r.etat;
    etat.journal = r.journal;
    etat.erreursMaj = r.erreurs;
    etat.courant = etat.version === 'initiale' || !evs.length ? BASE : r.etat;
  }

  // ===================================================================
  // Petits outils d'affichage
  // ===================================================================

  const esc = (s) => String(s == null ? '' : s).replace(/[&<>"']/g, (c) => ({ '&': '&amp;', '<': '&lt;', '>': '&gt;', '"': '&quot;', "'": '&#39;' }[c]));
  const MOIS = ['janv.', 'févr.', 'mars', 'avr.', 'mai', 'juin', 'juil.', 'août', 'sept.', 'oct.', 'nov.', 'déc.'];
  const MOIS_LONGS = ['janvier', 'février', 'mars', 'avril', 'mai', 'juin', 'juillet', 'août', 'septembre', 'octobre', 'novembre', 'décembre'];
  function fmtDate(iso, long) {
    if (!iso) return '';
    const m = /^(\d{4})-(\d{2})-(\d{2})/.exec(iso);
    if (!m) return esc(iso);
    return `${+m[3]} ${(long ? MOIS_LONGS : MOIS)[+m[2] - 1]} ${m[1]}`;
  }
  function fmtDateHeure(iso) {
    const h = /T(\d{2}):(\d{2})/.exec(iso || '');
    return fmtDate(iso) + (h ? `, ${h[1]} h ${h[2]}` : '');
  }
  // Montant : espaces insécables (le « $ » ne passe jamais seul à la ligne).
  const fmtMontant = (n) => (n == null ? 'Non renseigné' : Number(n).toLocaleString('fr-CA').replace(/\s/g, '\u00a0') + '\u00a0$');
  function joursEntre(debutIso, finIso) {
    const d = new Date(debutIso), f = new Date(finIso + 'T00:00:00-04:00');
    return Math.ceil((f - d) / 86400000);
  }

  // Icônes (planche Lucide intégrée au fichier) : toujours à côté d'un mot.
  const icone = (nom, classe) => `<svg class="ic${classe ? ' ' + classe : ''}" aria-hidden="true" focusable="false"><use href="#i-${nom}"/></svg>`;
  const ICONE_SIGNE = { '✓': 'circle-check', '!': 'triangle-alert', '?': 'circle-help', '◆': 'refresh-cw', '◐': 'clock', '●': 'circle-alert', '⌛': 'history', '↺': 'undo-2', '✗': 'circle-x', '○': 'circle-dashed', '–': 'x' };
  const ICONE_TON = { rouge: 'circle-alert', ambre: 'clock', vert: 'circle-check', bleu: 'info', violet: 'landmark', gris: 'circle-dashed' };
  const ICONE_NATURE = { proposition: 'pencil-line', decision_approuvee: 'landmark', correctif_livre: 'upload', validation_obtenue: 'circle-check', information: 'info', probleme: 'triangle-alert', document: 'file-text', finance: 'banknote' };
  const ICONE_GENRE = { courriel: 'mail', pdf: 'file', tableur: 'file-spreadsheet', image: 'image', texte: 'file-text' };
  const iconeDoc = (id) => ICONE_GENRE[(DOCS[id] || {}).genre] || 'file-text';
  const tuile = (nom, ton) => `<span class="tuile${ton ? ' ' + ton : ''}" aria-hidden="true">${icone(nom)}</span>`;
  function badge(ton, texte, signe) {
    const nom = signe ? ICONE_SIGNE[signe] || (/^[a-z-]+$/.test(signe) ? signe : null) : null;
    return `<span class="badge ton-${esc(ton)}">${nom ? icone(nom) : ''}${esc(texte)}</span>`;
  }
  function badgeEtat(code) {
    const e = C.ETATS[code] || { libelle: code || 'Inconnu', ton: 'gris' };
    return badge(e.ton, e.libelle, ICONE_TON[e.ton]);
  }
  function badgeNature(code) {
    const n = C.NATURES[code] || { libelle: code || 'Inconnue', ton: 'gris' };
    return badge(n.ton, n.libelle, ICONE_NATURE[code]);
  }
  function badgeAutorite(code) {
    const a = BASE.autorites[code] || { libelle: code || 'Source', ton: 'gris' };
    return `<span title="${esc(a.aide || '')}">${badge(a.ton, a.libelle)}</span>`;
  }
  const VALIDITES = {
    actuelle: ['vert', 'Information actuelle', '✓'],
    historique: ['gris', 'Historique', '⌛'],
    remplacee: ['gris', 'Remplacée', '↺'],
    perimee: ['ambre', 'Périmée', '!'],
    inexacte: ['rouge', 'Inexacte', '✗'],
  };
  const badgeValidite = (v) => (VALIDITES[v] ? badge(...VALIDITES[v]) : '');

  function annoncer(texte) {
    const zone = $('#annonce');
    zone.textContent = '';
    setTimeout(() => { zone.textContent = texte; }, 30);
  }

  // Registre des preuves affichées (les boutons portent un numéro).
  let PREUVES = [];
  function boutonPreuve(p, options) {
    const opts = options || {};
    if (!p || !p.source) return '';
    const i = PREUVES.push(p) - 1;
    const s = SOURCES[p.source] || {};
    const citation = p.lecture || p.passage || (p.cellules ? `Cellules ${p.cellules}` : '');
    if (opts.compact) {
      return `<button type="button" class="bouton petit" data-preuve="${i}" title="Voir la preuve : ${esc(s.titre || p.source)}">${icone(iconeDoc(p.source))}Preuve <span class="code">${esc(p.source)}</span></button>`;
    }
    return `<button type="button" class="preuve" data-preuve="${i}">
      ${tuile(iconeDoc(p.source))}
      <span class="preuve-corps">
        <span class="preuve-ligne"><span class="preuve-src">${esc(p.source)}</span>
          <span>${esc(p.repere || s.titre || '')}</span>
          ${p.role ? badge('gris', p.role) : ''}
          ${s.copie_de ? badge('gris', 'Copie de ' + s.copie_de, 'copy') : ''}</span>
        ${citation ? `<span class="preuve-citation">« ${esc(citation.length > 220 ? citation.slice(0, 217) + '…' : citation)}${p.jusqua ? ' … ' + esc(p.jusqua) : ''} »</span>` : ''}
        <span class="preuve-ouvrir">${esc(s.chemin || '')} · Voir la preuve</span>
      </span>
      ${icone('arrow-right', 'preuve-fleche')}
    </button>`;
  }
  const listePreuves = (preuves) => (preuves && preuves.length ? `<ul class="liste-preuves">${preuves.map((p) => `<li>${boutonPreuve(p)}</li>`).join('')}</ul>` : '<p class="doux">Aucune preuve.</p>');

  function sourcesIndependantes(preuves) {
    return C.groupesIndependants((preuves || []).map((p) => p.source), SOURCES).length;
  }

  // ===================================================================
  // Visionneuse de preuves : ouvre le bon passage, la bonne page,
  // les bonnes cellules ou la bonne zone d'image.
  // ===================================================================

  const dialogue = $('#visionneuse');
  let urlsTemporaires = [];

  function dataUrlVersBlob(dataUrl) {
    const [entete, b64] = dataUrl.split(',');
    const type = (entete.match(/data:([^;]+)/) || [])[1] || 'application/octet-stream';
    const bin = atob(b64);
    const octets = new Uint8Array(bin.length);
    for (let i = 0; i < bin.length; i++) octets[i] = bin.charCodeAt(i);
    return URL.createObjectURL(new Blob([octets], { type }));
  }

  function lignesSurlignees(texte, plage) {
    const lignes = texte.split('\n');
    let pos = 0;
    return lignes.map((l, n) => {
      const debut = pos, fin = pos + l.length;
      pos = fin + 1;
      let html;
      let touchee = false;
      if (plage && plage.debut < fin + 1 && plage.fin > debut) {
        touchee = true;
        const a = Math.max(plage.debut, debut) - debut;
        const b = Math.min(plage.fin, fin) - debut;
        html = esc(l.slice(0, a)) + `<mark>${esc(l.slice(a, b)) || ' '}</mark>` + esc(l.slice(b));
      } else html = esc(l);
      return `<div class="doc-ligne${touchee ? ' touchee' : ''}"><span class="doc-num">${n + 1}</span><span class="doc-contenu">${html || ' '}</span></div>`;
    }).join('');
  }

  function rendreTexte(texte, p) {
    const plage = p && p.passage ? C.trouverPassage(texte, p.passage, p.jusqua) : null;
    const alerte = p && p.passage && !plage ? '<p class="erreur">Passage non retrouvé automatiquement dans ce document : vérifiez la citation ci-dessus.</p>' : '';
    return { html: alerte + `<div class="doc-texte">${lignesSurlignees(texte, plage)}</div>`, trouve: !!plage };
  }

  function rendreCourriel(doc, p) {
    const e = doc.entetes;
    let corps = rendreTexte(doc.texte, p);
    let entetesHtml = [['De', e.de], ['À', e.a], ['Cc', e.cc], ['Date', e.date], ['Objet', e.objet], ['Message-ID', e.messageId]]
      .filter(([, v]) => v).map(([k, v]) => `<tr><th scope="row">${k}</th><td>${esc(v)}</td></tr>`).join('');
    if (p && p.passage && !corps.trouve) {
      // Le passage peut se trouver dans les en-têtes (objet, date…).
      const entetes = [e.de, e.a, e.cc, e.date, e.objet].join('\n');
      if (C.trouverPassage(entetes, p.passage)) corps = rendreTexte(doc.texte, null);
    }
    const pieces = (doc.pieces || []).map((pj) => {
      const ids = pj.identique_a || [];
      const lien = ids.length
        ? ids.map((id) => `<button type="button" class="bouton petit" data-ouvrir-source="${esc(id)}">Ouvrir ${esc(id)}</button>`).join(' ')
        : '';
      return `<li><strong>${esc(pj.nom)}</strong> <span class="doux">(${esc(pj.type)}, ${Math.round(pj.taille / 1024)} ko)</span>
        ${ids.length ? `<br><span class="petit">Fichier identique (même empreinte SHA-256) : ${esc(ids.join(', '))}. Il ne compte qu'une fois comme preuve.</span> ${lien}` : ''}</li>`;
    }).join('');
    return `<table class="courriel-entetes">${entetesHtml}</table>${corps.html}
      ${pieces ? `<h3 style="margin-top:1rem">Pièces jointes</h3><ul>${pieces}</ul>` : ''}`;
  }

  function rendrePdf(doc, p) {
    const n = (p && p.page) || 1;
    const page = doc.pages && doc.pages[n - 1];
    const boutons = doc.original
      ? `<div class="groupe-boutons" style="margin-bottom:.6rem">
          <button type="button" class="bouton" data-ouvrir-pdf="${n}">${icone('external-link')}Ouvrir le PDF original à la page ${n}</button>
          <span class="petit doux">Le PDF compte ${doc.pages ? doc.pages.length || '?' : '?'} page(s).</span></div>`
      : '';
    if (!page) return boutons + '<p class="doux">Texte de la page non disponible : ouvrez le PDF original.</p>';
    const texte = rendreTexte(page.texte, p);
    return `${boutons}<div class="pdf-page">
      <div>${page.image ? `<img src="${page.image}" alt="Rendu de la page ${n} du PDF ${esc(doc.chemin)}">` : '<p class="doux">Aperçu image non disponible.</p>'}</div>
      <div><h3 class="petit">Texte de la page ${n} (passage surligné)</h3>${texte.html}</div></div>`;
  }

  function rendreTableur(doc, p) {
    const f = (p && p.feuille && doc.feuilles.find((x) => x.nom === p.feuille)) || doc.feuilles[0];
    if (!f) return '<p>Feuille vide.</p>';
    const cibles = new Set(p && p.cellules ? C.cellulesDePlage(p.cellules) : []);
    let html = `<p class="petit">Feuille : <strong>${esc(f.nom)}</strong>${p && p.cellules ? ` · cellules surlignées : <strong>${esc(p.cellules)}</strong>` : ''}</p>`;
    html += '<div class="feuille"><table><thead><tr><th class="entete-col"></th>';
    for (let c = 1; c <= f.maxCol; c++) html += `<th class="entete-col" scope="col">${C.lettreColonne(c)}</th>`;
    html += '</tr></thead><tbody>';
    for (let l = 1; l <= f.maxLigne; l++) {
      html += `<tr><th class="entete-lig" scope="row">${l}</th>`;
      for (let c = 1; c <= f.maxCol; c++) {
        const ref = C.lettreColonne(c) + l;
        const cell = f.cellules[ref] || { v: '' };
        const style = [cell.fond ? `background-color:${cell.fond}` : '', cell.couleur ? `color:${cell.couleur}` : '', cell.gras ? 'font-weight:700' : ''].filter(Boolean).join(';');
        const cible = cibles.has(ref);
        html += `<td${cible ? ' class="cible" aria-label="Cellule citée ' + ref + '"' : ''}${style ? ` style="${style}"` : ''} title="${ref}">${esc(cell.v)}</td>`;
      }
      html += '</tr>';
    }
    html += '</tbody></table></div>';
    if (doc.original) html += `<p style="margin-top:.6rem"><button type="button" class="bouton" data-telecharger="original">${icone('download')}Télécharger le fichier Excel original</button></p>`;
    return html;
  }

  function rendreImage(doc, p) {
    const z = p && p.zone;
    let zoneHtml = '';
    if (z && doc.largeur) {
      const pct = (v, t) => ((v / t) * 100).toFixed(3) + '%';
      zoneHtml = `<div class="zone-surlignee" style="left:${pct(z.x, doc.largeur)};top:${pct(z.y, doc.hauteur)};width:${pct(z.w, doc.largeur)};height:${pct(z.h, doc.hauteur)}"></div>`;
    }
    return `<div class="image-zone"><img src="${doc.original}" alt="Capture ${esc(doc.chemin)}">${zoneHtml}</div>
      ${p && p.lecture ? `<p class="lecture-zone"><strong>Lecture de la zone encadrée :</strong> ${esc(p.lecture)}</p>` : ''}
      ${doc.texteJoint ? `<h3 class="petit">Texte joint</h3>${rendreTexte(doc.texteJoint, p).html}` : ''}`;
  }

  let docOuvert = null;
  function ouvrirPreuve(p) {
    const s = SOURCES[p.source];
    const doc = DOCS[p.source];
    urlsTemporaires.forEach((u) => URL.revokeObjectURL(u));
    urlsTemporaires = [];
    docOuvert = doc;
    $('#visionneuse-sur').textContent = `${p.source} · ${s ? s.chemin || '' : ''}`;
    $('#visionneuse-tuile').innerHTML = tuile(iconeDoc(p.source));
    $('#visionneuse-titre').textContent = s ? s.titre : p.source;
    let corps = '';
    if (s) {
      corps += `<div class="meta-source">${badgeAutorite(s.autorite)}
        ${s.date ? `<span>Date : <strong>${fmtDate(s.date, true)}</strong></span>` : ''}
        ${s.auteur ? `<span>Auteur : ${esc(s.auteur)}</span>` : ''}
        ${s.copie_de ? `<span>${badge('gris', 'Copie de ' + s.copie_de)} ne compte pas comme confirmation indépendante</span>` : ''}
        ${s._evenement ? badge('ambre', 'Nouvelle source (' + s._evenement + ')') : ''}</div>
        ${s.remarque ? `<p class="petit"><strong>Note de l'équipe :</strong> ${esc(s.remarque)}</p>` : ''}`;
    }
    if (p.repere || p.role || p.passage || p.cellules || p.zone) {
      corps += `<div class="repere">${icone('target')}<div><strong>Repère :</strong> ${esc(p.repere || '')}
        ${p.page ? ` · page ${p.page}` : ''}${p.cellules ? ` · cellules ${esc(p.cellules)}` : ''}${p.role ? ' · ' + badge('gris', p.role) : ''}
        ${p.passage ? `<br><span class="preuve-citation">« ${esc(p.passage)}${p.jusqua ? ' … ' + esc(p.jusqua) : ''} »</span>` : ''}</div></div>`;
    }
    if (!doc) corps += '<p class="erreur">Document non disponible dans ce rendu.</p>';
    else if (doc.genre === 'courriel') corps += rendreCourriel(doc, p);
    else if (doc.genre === 'pdf') corps += rendrePdf(doc, p);
    else if (doc.genre === 'tableur') corps += rendreTableur(doc, p);
    else if (doc.genre === 'image') corps += rendreImage(doc, p);
    else if (doc.genre === 'texte') corps += rendreTexte(doc.texte, p).html;
    else corps += '<p>Format non affichable.</p>';
    corps += `<div class="groupe-boutons" style="margin-top:1rem">
      <button type="button" class="bouton" data-copier-ref="${esc(p.source)}">${icone('copy')}Copier la référence</button>
      ${doc && doc.original ? `<button type="button" class="bouton" data-telecharger="original">${icone('download')}Télécharger le fichier original</button>` : ''}</div>`;
    $('#visionneuse-corps').innerHTML = corps;
    $('#visionneuse-corps').dataset.reference = `${p.source} · ${s ? s.chemin : ''} · ${p.repere || ''}${p.cellules ? ' (cellules ' + p.cellules + ')' : ''}${p.page ? ' (page ' + p.page + ')' : ''}`;
    if (!dialogue.open) dialogue.showModal();
    typographier($('.visionneuse-entete'));
    typographier($('#visionneuse-corps'));
    requestAnimationFrame(() => {
      const cible = $('#visionneuse-corps mark, #visionneuse-corps td.cible, #visionneuse-corps .zone-surlignee');
      if (cible) cible.scrollIntoView({ block: 'center' });
      $('#visionneuse-fermer').focus();
    });
  }

  $('#visionneuse-fermer').addEventListener('click', () => dialogue.close());
  dialogue.addEventListener('click', (e) => { if (e.target === dialogue) dialogue.close(); });
  dialogue.addEventListener('close', () => { if (location.hash.startsWith('#source/')) history.replaceState(null, '', '#' + etat.onglet); });
  $('#visionneuse-corps').addEventListener('click', (e) => {
    const b = e.target.closest('button');
    if (!b) return;
    if (b.dataset.ouvrirPdf && docOuvert && docOuvert.original) {
      const url = dataUrlVersBlob(docOuvert.original);
      urlsTemporaires.push(url);
      window.open(url + '#page=' + b.dataset.ouvrirPdf, '_blank', 'noopener');
    } else if (b.dataset.telecharger && docOuvert && docOuvert.original) {
      const url = dataUrlVersBlob(docOuvert.original);
      urlsTemporaires.push(url);
      const a = document.createElement('a');
      a.href = url; a.download = (docOuvert.chemin || 'document').split('/').pop();
      document.body.appendChild(a); a.click(); a.remove();
    } else if (b.dataset.ouvrirSource) {
      ouvrirPreuve({ source: b.dataset.ouvrirSource, repere: 'Document complet' });
    } else if (b.dataset.copierRef) {
      const ref = $('#visionneuse-corps').dataset.reference;
      (navigator.clipboard ? navigator.clipboard.writeText(ref) : Promise.reject()).then(
        () => annoncer('Référence copiée.'),
        () => { window.prompt('Référence à copier :', ref); },
      );
    }
  });

  // ===================================================================
  // Interroger le projet : recherche locale (mots-clés), sans IA en ligne.
  // ===================================================================

  const MOTS_VIDES = new Set('le la les l de du des d un une et est a au aux en que qu ce cet cette ces se sa son ses sur pour par avec dans ne pas plus ou y il elle ils on nous vous je tu me te t s c j n quel quelle quels quelles est-ce actuellement actuelle actuel'.split(' '));
  const normaliser = (s) => C.sansAccents(String(s || '').toLowerCase());
  function jetons(s) {
    return normaliser(s).split(/[^a-z0-9\-]+/).map((t) => t.replace(/^-+|-+$/g, '')).filter((t) => t.length > 1 && !MOTS_VIDES.has(t));
  }
  function racine(t) { return t.length > 5 ? t.slice(0, 5) : t.replace(/s$/, ''); }

  function repondre(question) {
    const q = normaliser(question);
    const jq = jetons(question);
    const entrees = [...etat.courant.questions, ...(etat.courant.questions_complementaires || [])];
    const scores = entrees.map((e) => {
      let score = 0;
      const motsCles = (e.mots_cles || []).map(normaliser);
      for (const mc of motsCles) if (mc.includes(' ') && q.includes(mc)) score += 4;
      const jc = new Set(motsCles.flatMap((m) => jetons(m)));
      const jQuestion = new Set(jetons(e.question));
      for (const t of jq) {
        if (jc.has(t)) score += 3;
        else if ([...jc].some((k) => racine(k) === racine(t))) score += 2;
        if (jQuestion.has(t)) score += 1;
      }
      return { e, score };
    }).filter((x) => x.score > 0).sort((a, b) => b.score - a.score);
    return scores.slice(0, 3);
  }

  // Index plein texte des documents.
  let INDEX = null;
  function construireIndex() {
    INDEX = [];
    for (const [id, d] of Object.entries(DOCS)) {
      const s = SOURCES[id] || {};
      const ajouter = (texte, extra) => { if (texte) INDEX.push(Object.assign({ id, texte, norm: normaliser(texte), titre: s.titre || id }, extra)); };
      if (d.genre === 'texte') ajouter(d.texte, {});
      else if (d.genre === 'courriel') ajouter([d.entetes.objet, d.texte].join('\n'), { corps: d.texte });
      else if (d.genre === 'pdf') (d.pages || []).forEach((pg, i) => ajouter(pg.texte, { page: i + 1 }));
      else if (d.genre === 'tableur') d.feuilles.forEach((f) => Object.entries(f.cellules).forEach(([ref, c]) => ajouter(c.v, { cellule: ref, feuille: f.nom })));
      else if (d.genre === 'image' && d.texteJoint) ajouter(d.texteJoint, {});
    }
  }
  function rechercherDocuments(requete, max) {
    if (!INDEX) construireIndex();
    const jq = jetons(requete);
    const phrase = normaliser(requete).trim();
    if (!jq.length && !phrase) return [];
    const parDoc = {};
    for (const entree of INDEX) {
      let score = 0;
      if (phrase.length > 3 && entree.norm.includes(phrase)) score += 10;
      for (const t of jq) if (entree.norm.includes(t)) score += 2 + (t.length > 5 ? 1 : 0);
      if (!score) continue;
      // Ligne à afficher et à surligner.
      const lignes = entree.texte.split('\n');
      let meilleure = '', mScore = 0;
      for (const l of lignes) {
        const nl = normaliser(l);
        let sc = phrase.length > 3 && nl.includes(phrase) ? 10 : 0;
        for (const t of jq) if (nl.includes(t)) sc += 2;
        if (sc > mScore) { mScore = sc; meilleure = l.trim(); }
      }
      const cle = entree.id + (entree.page ? '#' + entree.page : '') + (entree.cellule ? '!' + entree.cellule : '');
      const r = { id: entree.id, titre: entree.titre, score, ligne: meilleure, page: entree.page, cellule: entree.cellule, feuille: entree.feuille };
      const autorite = (SOURCES[entree.id] || {}).autorite;
      if (['hors_projet', 'consigne', 'copie'].includes(autorite)) r.score -= 3;
      if (!parDoc[entree.id] || parDoc[entree.id].score < r.score) parDoc[entree.id] = r;
      void cle;
    }
    return Object.values(parDoc).sort((a, b) => b.score - a.score).slice(0, max || 12);
  }
  function surlignerExtrait(texte, requete) {
    let html = esc(texte);
    const termes = jetons(requete).sort((a, b) => b.length - a.length);
    for (const t of termes) {
      const motif = new RegExp('(' + t.replace(/[.*+?^${}()|[\]\\]/g, '\\$&').split('').map((ch) => {
        const variantes = { a: '[aàâä]', e: '[eéèêë]', i: '[iîï]', o: '[oôö]', u: '[uùûü]', c: '[cç]' };
        return variantes[ch] || ch;
      }).join('') + ')', 'gi');
      html = html.replace(motif, '<mark>$1</mark>');
    }
    return html;
  }
  function preuveDepuisResultat(r) {
    if (r.cellule) return { source: r.id, repere: `Cellule ${r.cellule} (résultat de recherche)`, cellules: r.cellule, feuille: r.feuille };
    return { source: r.id, repere: 'Résultat de recherche' + (r.page ? ` · page ${r.page}` : ''), page: r.page, passage: r.ligne || undefined };
  }
  function htmlResultatsDocuments(resultats, requete) {
    if (!resultats.length) return '<p class="doux">Aucun passage trouvé dans les documents.</p>';
    return resultats.map((r) => {
      const s = SOURCES[r.id] || {};
      return `<div class="resultat">
        <div class="preuve-ligne"><strong>${esc(r.id)}</strong> ${esc(s.titre || '')} ${badgeAutorite(s.autorite)}${r.page ? ` <span class="petit doux">page ${r.page}</span>` : ''}${r.cellule ? ` <span class="petit doux">cellule ${esc(r.cellule)}</span>` : ''}</div>
        <p class="extrait">${surlignerExtrait(r.ligne || '', requete)}</p>
        ${boutonPreuve(preuveDepuisResultat(r), { compact: true }).replace('Preuve : ' + esc(r.id), 'Ouvrir au passage')}
      </div>`;
    }).join('');
  }

  // ===================================================================
  // Espace 2 — Questions et preuves
  // ===================================================================

  function conditionsModifiees(ids) {
    const res = [];
    for (const id of ids || []) {
      const avant = BASE.synthese.conditions.find((c) => c.id === id);
      const apres = etat.courant.synthese.conditions.find((c) => c.id === id);
      if (avant && apres && avant.etat !== apres.etat) res.push({ id, titre: apres.titre, avant: avant.etat, apres: apres.etat, par: (apres._modifie_par || []).join(', ') });
    }
    return res;
  }

  // Une icône par thème de question (présentation seulement ; les questions restent dans les données).
  const ICONE_QUESTION = { Q01: 'calendar-check', Q02: 'route', Q03: 'gavel', Q04: 'user-check', Q05: 'wallet', Q06: 'receipt', Q07: 'server', Q08: 'shield-check', Q09: 'accessibility', Q10: 'list-checks' };

  function carteQuestion(q, surlignee) {
    const liens = (q.liens && q.liens.conditions) || [];
    const touchees = etat.courant === BASE ? [] : conditionsModifiees(liens);
    const notes = (q.notes_maj || []).map((n) => `<div class="maj-note"><strong>Mise à jour (${esc(n.evenement)}, ${fmtDateHeure(n.date)}) · ${esc((C.NATURES[n.nature] || {}).libelle || '')} :</strong> ${esc(n.texte)}</div>`).join('');
    const bandeauTouchee = touchees.map((t) => `<div class="maj-note"><strong>Touchée par une mise à jour (${esc(t.par)}) :</strong> condition ${esc(t.id)} « ${esc(t.titre)} » : ${badgeEtat(t.avant)} → ${badgeEtat(t.apres)}</div>`).join('');
    const nbIndep = sourcesIndependantes(q.preuves);
    return `<article class="carte${surlignee ? ' surlignee' : ''}" id="question-${esc(q.id)}">
      <div class="question-tete">${tuile(ICONE_QUESTION[q.id] || 'circle-help')}<span class="question-num">${esc(q.id)}</span><h3 class="question-texte">${esc(q.question)}</h3>
        ${(q._modifie_par || []).length ? badge('ambre', 'Mis à jour', '◆') : ''}</div>
      ${bandeauTouchee}${notes}
      <p class="reponse-courte">${esc(q.reponse_courte)}</p>
      ${q.details && q.details.length ? `<details${surlignee ? ' open' : ''}><summary>${icone('info')}Nuances et points d'attention</summary><ul>${q.details.map((d) => `<li>${esc(d)}</li>`).join('')}</ul></details>` : ''}
      <details ${surlignee ? 'open' : ''}><summary>${icone('file-search')}Preuves (${(q.preuves || []).length}) · ${nbIndep} source${nbIndep > 1 ? 's' : ''} indépendante${nbIndep > 1 ? 's' : ''}</summary>${listePreuves(q.preuves)}</details>
    </article>`;
  }

  // Bandeau d'appel : une question hors liste se pose à l'assistant (une seule porte d'entrée).
  function appelAssistant(titre, texte, exemple) {
    return `<div class="carte appel-assistant">${tuile('sparkles')}<div><strong>${esc(titre)}</strong><p>${esc(texte)}</p></div>
      <button type="button" class="bouton primaire" data-ouvrir-assistant="${esc(exemple || '')}">${icone('sparkles')}Demander à l'assistant</button></div>`;
  }

  function rendreQuestions() {
    const e = etat.courant;
    const tete = `<header class="tete-page"><div class="eyebrow">${icone('message-circle-question')}${MODE === 'demo' ? `Espace 02 · ${e.questions.length} questions officielles` : 'Espace 02 · Questions'}</div><h2>Questions et preuves</h2>
      <p class="intro">${MODE === 'demo' ? 'Une réponse courte pour chaque question, ses nuances, puis les preuves : chaque preuve ouvre le document au bon endroit.' : 'Les réponses viennent des informations et des sources que vous avez données à NOVA.'}</p></header>`;
    if (!e.questions.length) {
      return tete + appelAssistant('Aucune question préparée dans ce dossier', 'Posez vos questions à l\'assistant : il répond à partir de ce que vous lui avez confié, et cite la source de chaque fait.', 'Où en est le projet ?');
    }
    const surlignee = etat.questionSurlignee || null;
    let html = tete + appelAssistant('Une question qui n\'est pas dans la liste ?', 'Demandez à l\'assistant, avec vos mots : il répond avec les preuves, sans connexion.', 'Qui a approuvé le report ?');
    html += e.questions.map((q) => carteQuestion(q, q.id === surlignee)).join('');
    if (e.questions_complementaires && e.questions_complementaires.length) {
      html += `<details class="carte accordeon" id="questions-complementaires"${(e.questions_complementaires || []).some((q) => q.id === surlignee) ? ' open' : ''}><summary>${icone('list-checks')}Questions complémentaires (${e.questions_complementaires.length}) · exemples tirés des consignes</summary>
        <div class="accordeon-corps">${e.questions_complementaires.map((q) => carteQuestion(q, q.id === surlignee)).join('')}</div></details>`;
    }
    return html;
  }

  // ===================================================================
  // Navigation, en-tête et rendu
  // ===================================================================

  const RENDUS = {
    questions: rendreQuestions,
  };

  function rendreEntete() {
    const e = etat.courant;
    const maj = e !== BASE && e.meta.date_situation_maj;
    if (MODE === 'vierge') {
      const nom = (e.synthese.projet && e.synthese.projet.nom) || 'Nouveau projet';
      $('.titre-fin').textContent = nom;
      document.title = `NOVA · ${nom}`;
      $('#situation').innerHTML = `Dossier vierge · <strong>${etat.evenements.length} information${etat.evenements.length > 1 ? 's' : ''} enregistrée${etat.evenements.length > 1 ? 's' : ''}</strong> · aujourd'hui, ${esc(BASE.meta.date_situation_texte)}`;
    } else {
      $('#situation').innerHTML = `Situation au <strong>${esc(BASE.meta.date_situation_texte)}</strong>${maj ? ` · mise à jour jusqu'au <strong>${fmtDateHeure(e.meta.date_situation_maj)}</strong>` : ''}`;
    }
    const boutonMode = $('#bouton-mode-libelle');
    if (boutonMode) boutonMode.textContent = MODE === 'vierge' ? 'Dossier vierge' : 'Démo · NOVA';
    const bandeau = $('#bandeau-version');
    if (etat.evenements.length && MODE === 'demo') {
      bandeau.hidden = false;
      bandeau.innerHTML = `<span><strong>Version affichée :</strong></span>
        <span class="groupe-boutons" role="group" aria-label="Version affichée">
          <button type="button" class="bouton petit${etat.version === 'initiale' ? ' primaire' : ''}" data-version="initiale" aria-pressed="${etat.version === 'initiale'}">Initiale (30 sept., 09 h)</button>
          <button type="button" class="bouton petit${etat.version === 'actualisee' ? ' primaire' : ''}" data-version="actualisee" aria-pressed="${etat.version === 'actualisee'}">Actualisée (${etat.evenements.length} mise${etat.evenements.length > 1 ? 's' : ''} à jour)</button>
        </span>
        ${etat.version === 'actualisee' ? badge('ambre', 'Les éléments modifiés portent la mention « Mis à jour »', '◆') : badge('gris', 'Baseline du 30 septembre, sans les mises à jour')}
        ${etat.exempleActif ? badge('rouge', 'EXEMPLE FICTIF chargé (entraînement)', '!') : ''}`;
    } else bandeau.hidden = true;
    $$('.onglets button').forEach((b) => b.setAttribute('aria-current', b.dataset.onglet === etat.onglet ? 'page' : 'false'));
    $('#pied-texte').innerHTML = `${esc(BASE.meta.methode)} Rendu construit le ${esc(BRUT.construit_le || '')} · ${Object.keys(SOURCES).length} documents, données ${esc(BASE.meta.version_donnees)}.`;
  }

  // Typographie française à l'affichage : espaces insécables avant « : ; ! ? » et dans les guillemets.
  // Les documents du corpus (visionneuse) et les champs de saisie ne sont jamais modifiés.
  const EXCLUS_TYPO = 'textarea, input, select, option, code, pre, script, style, .doc-texte, .feuille, .courriel-entetes';
  // En-têtes de tableaux : une petite icône devant chaque libellé connu (repère visuel, le texte reste).
  const ICONE_ENTETE = [
    [/^Condition/, 'flag'], [/^(État|Statut)$/, 'circle-dashed'], [/^Responsable/, 'user-round'], [/^Échéance/, 'calendar-clock'],
    [/^Actions?( et responsable)?$/, 'list-todo'], [/^Preuve/, 'file-search'], [/^Proposition$/, 'lightbulb'], [/^Par$/, 'user-round'],
    [/^Motif$/, 'message-square-quote'], [/^Facture$/, 'receipt'], [/^Date$/, 'calendar-days'], [/^Montant/, 'coins'],
    [/^Information$/, 'info'], [/^Où on la trouve$/, 'map-pin'], [/^Pourquoi l'écarter$/, 'ban'], [/^Décision$/, 'gavel'],
    [/^Autorité$/, 'landmark'], [/^ID$/, 'tag'], [/^Document$/, 'file-text'], [/^Note$/, 'bookmark'], [/^Élément$/, 'layers'],
    [/^Nature$/, 'tag'], [/^Avant → après$/, 'git-compare'], [/^Initiale/, 'history'], [/^Actualisée$/, 'refresh-cw'],
  ];
  function decorerEntetes(racine) {
    racine.querySelectorAll('th:not([data-ic])').forEach((th) => {
      if (th.closest('.feuille, .courriel-entetes, .brief')) return;
      const t = th.textContent.trim();
      const m = ICONE_ENTETE.find(([re]) => re.test(t));
      th.dataset.ic = '1';
      if (m) th.insertAdjacentHTML('afterbegin', icone(m[1]));
    });
  }

  function typographier(racine) {
    if (!racine) return;
    decorerEntetes(racine);
    const parcours = document.createTreeWalker(racine, NodeFilter.SHOW_TEXT, {
      acceptNode: (n) => (n.parentElement && n.parentElement.closest(EXCLUS_TYPO) ? NodeFilter.FILTER_REJECT : NodeFilter.FILTER_ACCEPT),
    });
    const noeuds = [];
    while (parcours.nextNode()) noeuds.push(parcours.currentNode);
    for (const n of noeuds) {
      const t = n.nodeValue;
      if (!/[:;!?«»]/.test(t)) continue;
      const u = t.replace(/ ([;!?»])/g, '\u202f$1').replace(/ :/g, '\u00a0:').replace(/« /g, '«\u00a0');
      if (u !== t) n.nodeValue = u;
    }
  }

  // Ancres profondes (liens, guide, assistant) → bon sous-onglet de l'espace.
  const ANCRES_SOUS_ONGLETS = {
    'h-chrono': ['historique', 'chrono'], 'h-cycles': ['historique', 'cycles'], 'h-decisions': ['historique', 'decisions'], 'h-contradictions': ['historique', 'contradictions'],
    'd-recherche': ['documents', 'recherche'], 'd-liste': ['documents', 'liste'], 'd-ajout': ['documents', 'maj'], 'd-avant-apres': ['documents', 'maj'], 'd-export': ['documents', 'export'],
  };

  function rendre(options) {
    PREUVES = [];
    rendreEntete();
    const fn = RENDUS[etat.onglet];
    const main = $('#contenu');
    main.innerHTML = fn ? fn() : `<div class="carte"><h2>En construction</h2><p>Cet espace arrive dans la prochaine version.</p></div>`;
    typographier(main);
    typographier($('.entete'));
    // Une seule animation d'entrée, au changement d'espace (jamais sur un simple filtre).
    main.classList.remove('anime');
    if (options && options.animer) { void main.offsetWidth; main.classList.add('anime'); }
    if (options && options.ancre) {
      const cible = document.getElementById(options.ancre);
      if (cible) {
        // Une section repliée s'ouvre quand on y mène.
        for (let d = cible.closest('details'); d; d = d.parentElement && d.parentElement.closest('details')) d.open = true;
        if (cible.tagName === 'DETAILS') cible.open = true;
        cible.scrollIntoView({ block: 'start' });
      }
    }
  }

  function allerA(onglet, ancre) {
    etat.onglet = RENDUS[onglet] || ['vue', 'historique', 'actions', 'documents'].includes(onglet) ? onglet : 'vue';
    const sous = ANCRES_SOUS_ONGLETS[ancre];
    if (sous && sous[0] === etat.onglet) etat.sousOnglets[sous[0]] = sous[1];
    rendre({ ancre, animer: !ancre }); // pas d'animation sur un lien profond : le contenu visé s'affiche aussitôt
    if (!ancre) window.scrollTo(0, 0);
  }

  function lireAncre() {
    const h = decodeURIComponent(location.hash.slice(1));
    if (!h) return allerA(RENDUS.vue ? 'vue' : 'questions');
    const [onglet, cible] = h.split('/');
    if (onglet === 'source' && cible) {
      if (!$('#contenu').innerHTML) allerA(etat.onglet);
      return ouvrirPreuve({ source: cible, repere: 'Document complet' });
    }
    allerA(onglet, cible ? (onglet === 'questions' ? 'question-' + cible : cible) : null);
  }

  // Délégation des clics.
  document.addEventListener('click', (e) => {
    const b = e.target.closest('[data-preuve], [data-onglet], [data-version], [data-ouvrir-source-page], [data-sous-onglet], [data-ouvrir-assistant]');
    if (!b) return;
    if (b.dataset.sousOnglet) {
      const [espace, vue] = b.dataset.sousOnglet.split(':');
      etat.sousOnglets[espace] = vue;
      history.replaceState(null, '', '#' + espace);
      rendre();
      return;
    }
    if (b.dataset.ouvrirAssistant !== undefined) {
      if (window.NOVA_ASSISTANT) window.NOVA_ASSISTANT.ouvrir({ brouillon: b.dataset.ouvrirAssistant || '' });
      return;
    }
    if (b.dataset.preuve !== undefined) ouvrirPreuve(PREUVES[+b.dataset.preuve]);
    else if (b.dataset.onglet) { history.pushState(null, '', '#' + b.dataset.onglet); allerA(b.dataset.onglet); $('#contenu').focus({ preventScroll: true }); }
    else if (b.dataset.version) { etat.version = b.dataset.version; recalculer(); rendre(); annoncer('Version ' + (etat.version === 'initiale' ? 'initiale' : 'actualisée') + ' affichée.'); }
    else if (b.dataset.ouvrirSourcePage) ouvrirPreuve({ source: b.dataset.ouvrirSourcePage, repere: 'Document complet' });
  });
  // Le champ de l'en-tête est la porte d'entrée de l'assistant : poser une question ou donner une information.
  document.addEventListener('submit', (e) => {
    if (e.target.id === 'form-question') {
      e.preventDefault();
      const champ = $('#champ-question');
      const texte = champ.value.trim();
      champ.value = '';
      if (window.NOVA_ASSISTANT) window.NOVA_ASSISTANT.ouvrir({ envoyer: texte });
    }
  });
  window.addEventListener('hashchange', lireAncre);

  // Exposé pour les autres parties de l'application.
  window.NOVA_APP = { etat, BASE, BRUT, DOCS, SOURCES, C, MODE, CLE_MODE, $, $$, esc, fmtDate, fmtDateHeure, fmtMontant, joursEntre, badge, badgeEtat, badgeNature, badgeAutorite, badgeValidite, boutonPreuve, listePreuves, sourcesIndependantes, ouvrirPreuve, rechercherDocuments, htmlResultatsDocuments, repondre, jetons, normaliser, recalculer, rendre, allerA, annoncer, ecrireLocaux, enregistrerSourceEvenement, RENDUS, conditionsModifiees, typographier, icone, tuile, iconeDoc, ICONE_NATURE, appelAssistant };

  // Premier affichage une fois tous les scripts chargés (espaces.js, mises_a_jour.js).
  document.addEventListener('DOMContentLoaded', () => {
    recalculer();
    lireAncre();
  });
})();
