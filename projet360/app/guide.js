/* Tutoriel d'accueil : NOVA vu par un dirigeant pressé.
   Chaque étape part d'un piège réel du dossier, puis montre la réponse de NOVA.
   Le texte vient de donnees/guide.json ; les chiffres viennent de l'état courant.
   Règle : la fenêtre ne défile jamais. Si l'écran est petit, la taille du texte est réduite pas à pas. */
(function () {
  'use strict';
  const A = window.NOVA_APP;
  const G = A.BASE.guide;
  if (!G) return;
  const { $, esc, icone, tuile, fmtMontant } = A;
  const CLE_VU = 'nova360.guide.vu';
  const dialogue = $('#guide');
  const cadre = $('#guide-cadre');
  const etoile = '<svg class="hero-etoile" aria-hidden="true" focusable="false"><use href="#i-nova"/></svg>';
  const total = G.etapes.length + 2; // accueil + étapes + fin
  const TAILLE_MAX = 18, TAILLE_MIN = 12;
  let index = 0;

  const lireVu = () => { try { return localStorage.getItem(CLE_VU) === '1'; } catch { return false; } };
  const ecrireVu = () => { try { localStorage.setItem(CLE_VU, '1'); } catch { /* navigation privée : sans effet */ } };

  // Jours entre la date de situation (fixe) et la date approuvée : jamais la date de l'ordinateur.
  function joursRestants(s) {
    const debut = Date.parse(A.BASE.meta.date_situation.slice(0, 10));
    const fin = Date.parse(s.date_mep.approuvee);
    return Number.isFinite(debut) && Number.isFinite(fin) ? Math.round((fin - debut) / 86400000) : '?';
  }

  // Remplace {date}, {jours}, {remplies}, {autorise}, {conteste} par les valeurs de l'état affiché.
  function remplir(texte) {
    const s = A.etat.courant.synthese;
    const valeurs = {
      date: s.date_mep.texte,
      jours: String(joursRestants(s)),
      remplies: String(s.conditions.filter((c) => A.C.ETATS_FERMES.includes(c.etat)).length),
      autorise: fmtMontant(s.finances.autorise),
      conteste: fmtMontant(s.finances.a_contester),
    };
    return esc(texte).replace(/\{(\w+)\}/g, (m, k) => (k in valeurs ? `<strong>${esc(valeurs[k])}</strong>` : m));
  }

  function haut(titre, sousTitre, ecran) {
    const barres = Array.from({ length: total }, (_, i) => `<span class="${i <= index ? 'fait' : ''}"></span>`).join('');
    return `<div class="guide-haut" data-ecran="${ecran}">${etoile}
      <span class="guide-persona">${icone('briefcase-business')}<span class="qui">Dans la peau du ${esc(G.persona.nom.replace(/^Le /, ''))}</span>${sousTitre ? `<span class="ou"><span class="sep"> · </span>${esc(sousTitre)}</span>` : ''}</span>
      <h2 id="guide-titre">${titre}</h2>
      <div class="guide-progression" aria-hidden="true">${barres}</div>
    </div>
    <button type="button" class="guide-fermer" data-guide="fermer" aria-label="Fermer le guide">${icone('x')}</button>`;
  }

  function bas(options) {
    const o = options || {};
    const gauche = index > 0
      ? `<button type="button" class="bouton" data-guide="precedent">${icone('arrow-left')}Précédent</button>`
      : `<button type="button" class="bouton" data-guide="fermer">Passer</button>`;
    return `<div class="guide-bas">
      <div class="gauche">${gauche}</div>
      <span class="guide-compteur" aria-live="polite">Étape ${index + 1} sur ${total}</span>
      <div class="droite">
        ${o.suivant ? `<button type="button" class="bouton primaire" data-guide="suivant">${esc(o.suivant)}${icone('arrow-right')}</button>` : ''}
        ${o.fin || ''}
      </div>
    </div>`;
  }

  function rendre() {
    let html;
    if (index === 0) {
      html = haut(remplir(G.persona.accroche), 'Le contexte', 'accueil') +
        `<div class="guide-corps">
          <ul class="guide-fiche">${G.persona.fiche.map((f) => `<li>${tuile(f.icone)}<b>${esc(f.libelle)}</b><span>${remplir(f.texte)}</span></li>`).join('')}</ul>
          <p class="guide-promesse">${icone('triangle-alert')}${esc(G.persona.promesse)}</p>
          <ol class="guide-pieges">${G.etapes.map((e, i) => `<li><span class="guide-num" aria-hidden="true">${i + 1}</span>${icone(e.icone)}<span>${esc(e.court || e.douleur_titre)}</span></li>`).join('')}</ol>
        </div>` + bas({ suivant: 'Commencer la visite' });
    } else if (index <= G.etapes.length) {
      const e = G.etapes[index - 1];
      html = haut(esc(e.douleur_titre), `Piège ${index} sur ${G.etapes.length}`, 'etape') +
        `<div class="guide-corps" data-etape="${index}">
          <div class="guide-duo">
            <div class="guide-bloc douleur">
              <div class="etiquette">${tuile(e.icone, 'ton-rouge')}Le problème</div>
              <p>${remplir(e.douleur)}</p>
              ${e.risque ? `<p class="guide-risque">${icone('triangle-alert')}<span><strong>Le risque :</strong> ${remplir(e.risque)}</span></p>` : ''}
            </div>
            <div class="guide-fleche" aria-hidden="true">${icone('arrow-right')}</div>
            <div class="guide-bloc solution">
              <div class="etiquette">${tuile('circle-check', 'ton-vert')}Avec NOVA</div>
              <h3>${esc(e.solution_titre)}</h3>
              <p>${remplir(e.solution)}</p>
              <button type="button" class="bouton guide-aller" data-guide="aller">${icone('eye')}${esc(e.bouton)}</button>
            </div>
          </div>
        </div>` + bas({ suivant: index === G.etapes.length ? 'Terminer' : 'Piège suivant' });
    } else {
      html = haut(esc(G.fin.titre), 'Fin de la visite', 'fin') +
        `<div class="guide-corps"><div class="guide-fin">${tuile('flag', 'ton-vert')}<p>${esc(G.fin.texte)}</p></div></div>` +
        bas({ fin: `<button type="button" class="bouton" data-guide="imprimer">${icone('printer')}Imprimer le brief</button>
          <button type="button" class="bouton primaire" data-guide="fermer">${icone('layout-dashboard')}Commencer</button>` });
    }
    cadre.innerHTML = html;
    A.typographier(cadre);
    ajuster();
    // Le focus reste dans le guide : bouton principal de l'étape (navigation au clavier sans souris).
    if (dialogue.open) { const b = cadre.querySelector('.guide-bas .primaire') || cadre.querySelector('.guide-bas [data-guide]'); if (b) b.focus({ preventScroll: true }); }
  }

  // Aucune barre de défilement : on réduit la taille de base (tout le guide est en em) jusqu'à ce que tout tienne.
  function ajuster() {
    if (!dialogue.open) return;
    let taille = TAILLE_MAX;
    dialogue.style.fontSize = taille + 'px';
    // Seule la hauteur compte : l'animation de glissement élargit brièvement la zone, sans débordement réel.
    while (taille > TAILLE_MIN && dialogue.scrollHeight > dialogue.clientHeight + 1) {
      taille -= 0.5;
      dialogue.style.fontSize = taille + 'px';
    }
    dialogue.scrollTop = 0;
  }

  function ouvrir(depuis) {
    index = depuis || 0;
    if (!dialogue.open) dialogue.showModal();
    rendre();
  }

  function fermer() {
    ecrireVu();
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
  document.addEventListener('keydown', (ev) => {
    if (!dialogue.open || (ev.target.closest && ev.target.closest('input, textarea, select'))) return;
    if (ev.key === 'ArrowRight' && index < total - 1) { index++; rendre(); }
    if (ev.key === 'ArrowLeft' && index > 0) { index--; rendre(); }
  });
  dialogue.addEventListener('close', ecrireVu);
  dialogue.addEventListener('click', (ev) => { if (ev.target === dialogue) fermer(); });
  window.addEventListener('resize', ajuster);
  if (document.fonts && document.fonts.ready) document.fonts.ready.then(ajuster);
  document.getElementById('ouvrir-guide').addEventListener('click', () => ouvrir(0));

  // Première visite : le guide s'ouvre tout seul (sauf lien direct vers une preuve). Une fois fermé, il ne revient plus.
  document.addEventListener('DOMContentLoaded', () => {
    if (!lireVu() && !location.hash.startsWith('#source/')) setTimeout(() => ouvrir(0), 350);
  });

  window.NOVA_GUIDE = { ouvrir, fermer };
})();
