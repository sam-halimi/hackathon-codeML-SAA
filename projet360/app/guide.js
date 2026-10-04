/* Tutoriel d'accueil : NOVA vu par un dirigeant pressé.
   Chaque étape part d'une douleur réelle du dossier, puis montre la réponse de NOVA.
   Le texte vient de donnees/guide.json ; les chiffres viennent de l'état courant. */
(function () {
  'use strict';
  const A = window.NOVA_APP;
  const G = A.BASE.guide;
  if (!G) return;
  const { $, esc, icone, fmtMontant } = A;
  const CLE_VU = 'nova360.guide.vu';
  const dialogue = $('#guide');
  const cadre = $('#guide-cadre');
  const etoile = '<svg class="hero-etoile" aria-hidden="true" focusable="false"><use href="#i-nova"/></svg>';
  const total = G.etapes.length + 2; // accueil + étapes + fin
  let index = 0;
  let nePlus = true;

  const lireVu = () => { try { return localStorage.getItem(CLE_VU) === '1'; } catch { return false; } };
  const ecrireVu = () => { try { localStorage.setItem(CLE_VU, '1'); } catch { /* navigation privée : sans effet */ } };

  // Remplace {date}, {remplies}, {autorise}, {conteste} par les valeurs de l'état affiché.
  function remplir(texte) {
    const s = A.etat.courant.synthese;
    const valeurs = {
      date: s.date_mep.texte,
      remplies: String(s.conditions.filter((c) => A.C.ETATS_FERMES.includes(c.etat)).length),
      autorise: fmtMontant(s.finances.autorise),
      conteste: fmtMontant(s.finances.a_contester),
    };
    return esc(texte).replace(/\{(\w+)\}/g, (m, k) => (k in valeurs ? `<strong>${esc(valeurs[k])}</strong>` : m));
  }

  function haut(titre, texte) {
    const barres = Array.from({ length: total }, (_, i) => `<span class="${i <= index ? 'fait' : ''}"></span>`).join('');
    return `<div class="guide-haut">${etoile}
      <span class="guide-persona">${icone('briefcase-business')}Dans la peau du ${esc(G.persona.nom.replace(/^Le /, ''))}</span>
      <h2 id="guide-titre">${titre}</h2>
      ${texte ? `<p>${texte}</p>` : ''}
      <div class="guide-progression" aria-hidden="true">${barres}</div>
    </div>
    <button type="button" class="guide-fermer" data-guide="fermer" aria-label="Fermer le guide">${icone('x')}</button>`;
  }

  function bas(options) {
    const o = options || {};
    const gauche = index > 0
      ? `<button type="button" class="bouton" data-guide="precedent">${icone('arrow-left')}Précédent</button>`
      : `<button type="button" class="bouton" data-guide="fermer">Passer le guide</button>`;
    return `<div class="guide-bas">
      <div class="gauche">${gauche}</div>
      <span class="guide-compteur" aria-live="polite">Étape ${index + 1} sur ${total}</span>
      <div class="droite">
        ${o.suivant ? `<button type="button" class="bouton primaire" data-guide="suivant">${esc(o.suivant)}${icone('arrow-right')}</button>` : ''}
        ${o.fin ? o.fin : ''}
      </div>
    </div>
    <div class="guide-pied"><label class="guide-ne-plus"><input type="checkbox" id="guide-ne-plus" ${nePlus ? 'checked' : ''}> Ne plus afficher ce guide à l'ouverture</label></div>`;
  }

  function rendre() {
    let html;
    if (index === 0) {
      html = haut(esc(G.persona.accroche), esc(G.persona.texte)) +
        `<div class="guide-corps guide-etape">
          <p class="guide-promesse">${esc(G.persona.promesse)}</p>
          <ol class="guide-promesses">${G.etapes.map((e, i) => `<li><span class="guide-num" aria-hidden="true">${i + 1}</span>${icone(e.icone)}<span>${esc(e.douleur_titre)}</span></li>`).join('')}</ol>
        </div>` + bas({ suivant: 'Commencer la visite' });
    } else if (index <= G.etapes.length) {
      const e = G.etapes[index - 1];
      html = haut(esc(e.douleur_titre), '') +
        `<div class="guide-corps guide-etape" data-etape="${index}">
          <div class="guide-bloc douleur"><span class="tuile ton-rouge" aria-hidden="true">${icone(e.icone)}</span>
            <div><div class="etiquette">${icone('circle-alert')}Le problème</div><p>${remplir(e.douleur)}</p>
            ${e.risque ? `<p class="guide-risque">${icone('triangle-alert')}<span><strong>Le risque :</strong> ${remplir(e.risque)}</span></p>` : ''}</div></div>
          <div class="guide-fleche" aria-hidden="true">${icone('chevron-down')}</div>
          <div class="guide-bloc solution"><span class="tuile ton-vert" aria-hidden="true">${icone('circle-check')}</span>
            <div><div class="etiquette">${icone('check')}Avec NOVA</div><h3>${esc(e.solution_titre)}</h3><p>${remplir(e.solution)}</p>
            <button type="button" class="bouton petit guide-aller" data-guide="aller">${icone('eye')}${esc(e.bouton)}${icone('arrow-right')}</button></div></div>
        </div>` + bas({ suivant: index === G.etapes.length ? 'Terminer' : 'Étape suivante' });
    } else {
      html = haut(esc(G.fin.titre), '') +
        `<div class="guide-corps guide-etape">
          <div class="guide-bloc solution"><span class="tuile ton-vert" aria-hidden="true">${icone('flag')}</span>
            <div><p>${esc(G.fin.texte)}</p></div></div>
        </div>` + bas({ fin: `<button type="button" class="bouton" data-guide="imprimer">${icone('printer')}Imprimer le brief</button>
          <button type="button" class="bouton primaire" data-guide="fermer">${icone('layout-dashboard')}Commencer</button>` });
    }
    cadre.innerHTML = html;
    A.typographier(cadre);
    // Le focus reste dans le guide : bouton principal de l'étape (navigation au clavier sans souris).
    if (dialogue.open) { const b = cadre.querySelector('.guide-bas .primaire') || cadre.querySelector('.guide-bas [data-guide]'); if (b) b.focus({ preventScroll: true }); dialogue.scrollTop = 0; }
  }

  function ouvrir(depuis) {
    index = depuis || 0;
    nePlus = true;
    rendre();
    if (!dialogue.open) dialogue.showModal();
    requestAnimationFrame(() => { const b = cadre.querySelector('.guide-bas .primaire') || cadre.querySelector('[data-guide]'); if (b) b.focus({ preventScroll: true }); dialogue.scrollTop = 0; });
  }

  function fermer() {
    if (nePlus) ecrireVu();
    if (dialogue.open) dialogue.close();
  }

  function aller() {
    const e = G.etapes[index - 1];
    fermer();
    if (!e) return;
    const hash = '#' + e.onglet + (e.ancre ? '/' + e.ancre : '');
    if (location.hash === hash) A.allerA(e.onglet, e.ancre);
    else location.hash = hash;
  }

  cadre.addEventListener('click', (ev) => {
    const b = ev.target.closest('[data-guide]');
    if (!b) return;
    const quoi = b.dataset.guide;
    if (quoi === 'suivant') { index = Math.min(total - 1, index + 1); rendre(); }
    else if (quoi === 'precedent') { index = Math.max(0, index - 1); rendre(); }
    else if (quoi === 'fermer') fermer();
    else if (quoi === 'aller') aller();
    else if (quoi === 'imprimer') { fermer(); A.imprimerBrief(); }
  });
  cadre.addEventListener('change', (ev) => { if (ev.target.id === 'guide-ne-plus') nePlus = ev.target.checked; });
  document.addEventListener('keydown', (ev) => {
    if (!dialogue.open || (ev.target.closest && ev.target.closest('input, textarea, select'))) return;
    if (ev.key === 'ArrowRight' && index < total - 1) { index++; rendre(); }
    if (ev.key === 'ArrowLeft' && index > 0) { index--; rendre(); }
  });
  dialogue.addEventListener('cancel', () => { if (nePlus) ecrireVu(); });
  dialogue.addEventListener('click', (ev) => { if (ev.target === dialogue) fermer(); });
  document.getElementById('ouvrir-guide').addEventListener('click', () => ouvrir(0));

  // Première visite : le guide s'ouvre tout seul (sauf lien direct vers une preuve).
  document.addEventListener('DOMContentLoaded', () => {
    if (!lireVu() && !location.hash.startsWith('#source/')) setTimeout(() => ouvrir(0), 350);
  });

  window.NOVA_GUIDE = { ouvrir, fermer };
})();
