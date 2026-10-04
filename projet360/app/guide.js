/* Versions et tutoriel d'accueil.
   1. Versions : au premier lancement, la vidéo de présentation s'ouvre (paysage sur ordinateur, portrait sur téléphone),
      puis on choisit la démo (dossier NOVA, dans la peau d'un dirigeant) ou un dossier vierge (son propre projet).
      Le menu « Démo · NOVA / Dossier vierge » permet d'en changer.
   2. Tutoriel : chaque étape part d'un piège réel, puis montre la réponse de NOVA.
      Le texte vient de donnees/guide.json (clé « vierge » pour le dossier vierge) ; les chiffres viennent de l'état courant.
      Règle : la fenêtre ne défile jamais. Si l'écran est petit, la taille du texte est réduite pas à pas. */
(function () {
  'use strict';
  const A = window.NOVA_APP;
  const { $, esc, icone, tuile, fmtMontant, MODE, CLE_MODE } = A;
  const DEMO = MODE === 'demo';
  const lire = (k) => { try { return localStorage.getItem(k); } catch { return null; } };
  const ecrire = (k, v) => { try { if (v == null) localStorage.removeItem(k); else localStorage.setItem(k, v); } catch { /* navigation privée : sans effet */ } };
  const lienDirect = () => location.hash.startsWith('#source/');

  // ===================================================================
  // 1. Versions : démo ou dossier vierge
  // ===================================================================

  const CLE_EVENEMENTS = { demo: 'nova360.evenements.v1', vierge: 'nova360.vierge.evenements.v1' };
  const dialogueChoix = $('#choix-mode');
  const boutonMode = $('#bouton-mode');
  const menuMode = $('#menu-mode');
  const cadreChoix = $('#choix-cadre');

  // -------------------------------------------------------------------
  // Vidéo de présentation : première étape de l'écran d'accueil. À la fin, ou sur « Passer la vidéo »,
  // le choix entre la démo et le dossier vierge apparaît. Les fichiers sont décrits dans donnees/guide.json
  // (clé « video ») ; sans fichier lisible (fichier HTML seul, hors connexion), l'accueil s'ouvre sur le choix.
  // -------------------------------------------------------------------
  const VIDEO = (A.BRUT.operations.guide || {}).video || null;
  const intro = $('#intro');
  const video = $('#intro-video');
  const ecranVideo = $('#intro-ecran');
  const barreVideo = $('#intro-barre');
  const boutonSon = $('#intro-son');
  const boutonRevoir = $('#choix-revoir');
  const portrait = window.matchMedia('(orientation: portrait)');
  const autreFormat = (f) => (f === 'portrait' ? 'paysage' : 'portrait');
  const formatVoulu = () => (portrait.matches ? 'portrait' : 'paysage');
  // Premier fichier que ce navigateur sait lire (MP4 H.264, sinon WebM).
  const sourceVideo = (format) => ((VIDEO && VIDEO[format]) || []).find((s) => s && s.src && video.canPlayType(s.type || '') !== '') || null;
  let videoLisible = !!(VIDEO && (sourceVideo('paysage') || sourceVideo('portrait')));
  let delaiChargement = 0;
  const etapeAccueil = () => dialogueChoix.dataset.etape;

  function montrerEtape(etape) {
    dialogueChoix.dataset.etape = etape;
    intro.hidden = etape !== 'video';
    cadreChoix.hidden = etape !== 'choix';
    dialogueChoix.setAttribute('aria-labelledby', etape === 'video' ? 'intro-titre' : 'choix-mode-titre');
    boutonRevoir.hidden = !videoLisible;
  }

  // Le choix ne défile jamais : sur un très petit écran, l'ensemble est réduit pas à pas (jusqu'à 80 %).
  function ajusterChoix() {
    if (!dialogueChoix.open || etapeAccueil() !== 'choix') return;
    cadreChoix.style.zoom = '';
    for (let z = 0.95; z >= 0.8 && dialogueChoix.scrollHeight > dialogueChoix.clientHeight + 1; z -= 0.05) cadreChoix.style.zoom = z.toFixed(2);
  }

  function majSon() {
    ecranVideo.classList.toggle('muet', video.muted);
    boutonSon.setAttribute('aria-label', video.muted ? 'Activer le son' : 'Couper le son');
    boutonSon.querySelector('use').setAttribute('href', video.muted ? '#i-volume-x' : '#i-volume-2');
  }

  // Charge le fichier du format voulu (ou de l'autre format s'il est seul lisible), à partir de « depuis » secondes.
  function chargerVideo(format, depuis) {
    const f = sourceVideo(format) ? format : autreFormat(format);
    const s = sourceVideo(f);
    if (!s) return false;
    dialogueChoix.dataset.format = f;
    if (video.getAttribute('src') !== s.src) {
      ecranVideo.classList.add('charge');
      video.src = s.src;
      if (depuis > 0) video.addEventListener('loadedmetadata', () => { video.currentTime = depuis; }, { once: true });
    } else {
      try { video.currentTime = depuis || 0; } catch { /* métadonnées pas encore chargées */ }
    }
    return true;
  }

  // Le son d'abord ; si le navigateur refuse le son sans geste de l'utilisateur, la vidéo démarre muette
  // avec un grand bouton « Activer le son ».
  function lancerVideo() {
    video.muted = false;
    majSon();
    const essai = video.play();
    if (essai && essai.catch) {
      essai.catch((e) => {
        if (!e || e.name !== 'NotAllowedError' || etapeAccueil() !== 'video') return;
        video.muted = true;
        majSon();
        video.play().catch(() => ecranVideo.classList.add('en-pause'));
      });
    }
    clearTimeout(delaiChargement);
    // Réseau trop lent : l'écran ne reste pas bloqué, on passe au choix (la vidéo reste à revoir).
    delaiChargement = setTimeout(() => { if (etapeAccueil() === 'video' && video.readyState < 2) passerVideo(); }, 15000);
  }

  function activerSon() {
    video.muted = false;
    // Le récit commence dès la première seconde : si l'on vient d'arriver, on repart du début pour tout entendre.
    if (video.currentTime < 12) { try { video.currentTime = 0; } catch { /* sans effet */ } }
    if (video.paused) video.play().catch(() => {});
    majSon();
  }

  function demarrerVideo() {
    if (!videoLisible || !chargerVideo(formatVoulu(), 0)) return false;
    montrerEtape('video');
    if (dialogueChoix.open) intro.focus({ preventScroll: true });
    lancerVideo();
    return true;
  }

  function passerVideo() {
    clearTimeout(delaiChargement);
    video.pause();
    montrerEtape('choix');
    ajusterChoix();
    dialogueChoix.classList.remove('transition');
    void dialogueChoix.offsetWidth; // relance l'animation d'ouverture
    dialogueChoix.classList.add('transition');
    const carte = cadreChoix.querySelector('[data-choisir-mode]');
    if (carte && dialogueChoix.open) carte.focus({ preventScroll: true });
  }

  // Écran d'accueil : la vidéo puis le choix, ou directement le choix.
  function ouvrirAccueil(avecVideo) {
    montrerEtape('choix');
    if (!dialogueChoix.open) dialogueChoix.showModal();
    if (!avecVideo || !demarrerVideo()) {
      ajusterChoix();
      const carte = cadreChoix.querySelector('[data-choisir-mode]');
      if (carte) carte.focus({ preventScroll: true });
    }
  }

  // Fenêtre fermée : la vidéo s'arrête et ne se télécharge plus.
  function libererVideo() {
    clearTimeout(delaiChargement);
    video.pause();
    if (video.getAttribute('src')) { video.removeAttribute('src'); video.load(); }
  }

  video.addEventListener('ended', passerVideo);
  video.addEventListener('error', () => {
    if (!video.getAttribute('src')) return;
    videoLisible = false;
    boutonRevoir.hidden = true;
    if (etapeAccueil() === 'video') passerVideo();
  });
  video.addEventListener('timeupdate', () => { barreVideo.style.transform = `scaleX(${video.duration ? Math.min(1, video.currentTime / video.duration) : 0})`; });
  video.addEventListener('play', () => ecranVideo.classList.remove('en-pause'));
  video.addEventListener('pause', () => { if (!video.ended) ecranVideo.classList.add('en-pause'); });
  video.addEventListener('waiting', () => ecranVideo.classList.add('charge'));
  ['playing', 'canplay'].forEach((t) => video.addEventListener(t, () => ecranVideo.classList.remove('charge')));
  video.addEventListener('volumechange', majSon);
  // Un clic sur l'image : active le son s'il est coupé, sinon met en pause ou relance.
  ecranVideo.addEventListener('click', () => {
    if (video.muted) activerSon();
    else if (video.paused) video.play().catch(() => {});
    else video.pause();
  });
  boutonSon.addEventListener('click', () => { if (video.muted) activerSon(); else video.muted = true; });
  $('#intro-passer').addEventListener('click', passerVideo);
  boutonRevoir.addEventListener('click', demarrerVideo);
  intro.addEventListener('keydown', (ev) => {
    if (ev.target !== intro || (ev.key !== ' ' && ev.key !== 'k')) return;
    ev.preventDefault();
    if (video.paused) video.play().catch(() => {}); else video.pause();
  });
  // Téléphone tourné pendant la vidéo : on passe à l'autre format, au même instant.
  const auChangementDeFormat = () => {
    if (!dialogueChoix.open || etapeAccueil() !== 'video') return;
    const f = formatVoulu();
    if (dialogueChoix.dataset.format === f || !sourceVideo(f)) return;
    const instant = video.currentTime, enLecture = !video.paused, muet = video.muted;
    chargerVideo(f, instant);
    video.muted = muet;
    if (enLecture) video.play().catch(() => {});
  };
  if (portrait.addEventListener) portrait.addEventListener('change', auChangementDeFormat);
  else if (portrait.addListener) portrait.addListener(auChangementDeFormat);
  if (VIDEO && VIDEO.titre) $('#intro-titre').lastChild.nodeValue = VIDEO.titre;
  dialogueChoix.addEventListener('close', libererVideo);
  window.addEventListener('resize', ajusterChoix);

  function changerDeVersion(mode) {
    ecrire(CLE_MODE, mode);
    if (mode === MODE) return false;
    // Rechargement : chaque version a ses propres données et son propre historique local.
    history.replaceState(null, '', location.pathname + location.search);
    location.reload();
    return true;
  }

  function choisir(mode) {
    if (changerDeVersion(mode)) return;
    if (dialogueChoix.open) dialogueChoix.close();
    if (G && !lireVu()) setTimeout(() => ouvrir(0), 250);
  }

  function nbLocaux(mode) {
    try { return JSON.parse(lire(CLE_EVENEMENTS[mode]) || '[]').length; } catch { return 0; }
  }

  function rendreMenu() {
    const item = (action, ic, titre, texte, options) => {
      const o = options || {};
      return `<button type="button" class="menu-mode-item${o.danger ? ' danger' : ''}" role="menuitem" data-version-action="${action}"${o.actuel ? ' aria-current="true"' : ''}>
        ${tuile(ic, o.danger ? 'ton-rouge' : o.actuel ? '' : 'ton-gris')}<strong>${esc(titre)}${o.actuel ? ' ' + A.badge('vert', 'Affichée', '✓') : ''}</strong><span>${esc(texte)}</span></button>`;
    };
    const locauxVierge = nbLocaux('vierge');
    const locauxDemo = nbLocaux('demo');
    let html = item('demo', 'presentation', 'Démo · dossier NOVA', 'Dans la peau du dirigeant : 64 documents, une décision à prendre, situation au 30 septembre 2026.', { actuel: DEMO })
      + item('vierge', 'folder-plus', 'Dossier vierge', locauxVierge ? `Votre projet : ${locauxVierge} information${locauxVierge > 1 ? 's' : ''} enregistrée${locauxVierge > 1 ? 's' : ''} dans ce navigateur.` : 'Votre projet, rempli en parlant à l\'assistant.', { actuel: !DEMO });
    html += '<div class="menu-mode-sep" role="separator"></div>';
    html += item('accueil', 'circle-play', 'Revoir l\'écran d\'accueil', videoLisible ? 'La vidéo de présentation, puis le choix entre la démo et un dossier vierge.' : 'Le choix entre la démo et un dossier vierge.');
    if (DEMO && locauxDemo) html += item('reinitialiser-demo', 'rotate-ccw', 'Réinitialiser la démo', `Retire vos ${locauxDemo} mise${locauxDemo > 1 ? 's' : ''} à jour locale${locauxDemo > 1 ? 's' : ''} ; le dossier d'origine ne change jamais.`, { danger: true });
    if (!DEMO && locauxVierge) html += item('effacer-vierge', 'trash-2', 'Effacer le dossier vierge', 'Supprime les informations saisies dans ce navigateur.', { danger: true });
    menuMode.innerHTML = html;
    A.typographier(menuMode);
  }

  function ouvrirMenu() {
    rendreMenu();
    menuMode.hidden = false;
    boutonMode.setAttribute('aria-expanded', 'true');
    const premier = menuMode.querySelector('.menu-mode-item');
    if (premier) premier.focus({ preventScroll: true });
  }
  function fermerMenu(rendreFocus) {
    if (menuMode.hidden) return;
    menuMode.hidden = true;
    boutonMode.setAttribute('aria-expanded', 'false');
    if (rendreFocus) boutonMode.focus({ preventScroll: true });
  }

  menuMode.setAttribute('role', 'menu');
  boutonMode.addEventListener('click', () => (menuMode.hidden ? ouvrirMenu() : fermerMenu()));
  menuMode.addEventListener('click', (ev) => {
    const b = ev.target.closest('[data-version-action]');
    if (!b) return;
    const action = b.dataset.versionAction;
    fermerMenu();
    if (action === 'demo' || action === 'vierge') {
      if (action === MODE) { A.annoncer('Cette version est déjà affichée.'); return; }
      changerDeVersion(action);
    } else if (action === 'accueil') {
      ouvrirAccueil(true);
    } else if (action === 'reinitialiser-demo') {
      if (!window.confirm('Retirer vos mises à jour locales de la démo ? Le dossier d\'origine reste intact.')) return;
      ecrire(CLE_EVENEMENTS.demo, null);
      location.reload();
    } else if (action === 'effacer-vierge') {
      if (!window.confirm('Effacer toutes les informations du dossier vierge enregistrées dans ce navigateur ?')) return;
      ecrire(CLE_EVENEMENTS.vierge, null);
      location.reload();
    }
  });
  document.addEventListener('click', (ev) => { if (!menuMode.hidden && !ev.target.closest('.menu-mode')) fermerMenu(); });
  document.addEventListener('keydown', (ev) => {
    if (menuMode.hidden) return;
    if (ev.key === 'Escape') { ev.preventDefault(); fermerMenu(true); return; }
    if (ev.key === 'ArrowDown' || ev.key === 'ArrowUp') {
      const items = [...menuMode.querySelectorAll('.menu-mode-item')];
      const i = items.indexOf(document.activeElement);
      const suivant = items[(i + (ev.key === 'ArrowDown' ? 1 : -1) + items.length) % items.length];
      if (suivant) { ev.preventDefault(); suivant.focus(); }
    }
  });

  dialogueChoix.addEventListener('click', (ev) => {
    const b = ev.target.closest('[data-choisir-mode]');
    if (b) choisir(b.dataset.choisirMode);
  });
  // Échap sur l'écran d'accueil : pendant la vidéo, on passe au choix ; sur le choix, on garde la version affichée
  // (la démo au premier lancement).
  dialogueChoix.addEventListener('cancel', (ev) => {
    ev.preventDefault();
    if (etapeAccueil() === 'video') passerVideo();
    else choisir(MODE);
  });

  // ===================================================================
  // 2. Tutoriel d'accueil
  // ===================================================================

  const G = A.BASE.guide;
  const CLE_VU = DEMO ? 'nova360.guide.vu' : 'nova360.guide.vierge.vu';
  const lireVu = () => lire(CLE_VU) === '1';
  const ecrireVu = () => ecrire(CLE_VU, '1');
  const dialogue = $('#guide');
  const cadre = $('#guide-cadre');
  const boutonGuide = document.getElementById('ouvrir-guide');
  let index = 0;
  let ouvrir = () => {};

  if (G) {
    const etoile = '<svg class="hero-etoile" aria-hidden="true" focusable="false"><use href="#i-nova"/></svg>';
    const total = G.etapes.length + 2; // accueil + étapes + fin
    const TAILLE_MAX = 18, TAILLE_MIN = 12;

    // Jours entre la date de situation (fixe en démo) et la date approuvée : jamais la date de l'ordinateur.
    const joursRestants = (s) => {
      const debut = Date.parse(String(A.BASE.meta.date_situation || '').slice(0, 10));
      const fin = Date.parse(s.date_mep.approuvee);
      return Number.isFinite(debut) && Number.isFinite(fin) ? Math.round((fin - debut) / 86400000) : '?';
    };

    // Remplace {date}, {jours}, {remplies}, {autorise}, {conteste} par les valeurs de l'état affiché.
    const remplir = (texte) => {
      const s = A.etat.courant.synthese;
      const valeurs = {
        date: s.date_mep.texte || 'à définir',
        jours: String(joursRestants(s)),
        remplies: String((s.conditions || []).filter((c) => A.C.ETATS_FERMES.includes(c.etat)).length),
        autorise: fmtMontant(s.finances.autorise),
        conteste: fmtMontant(s.finances.a_contester),
      };
      return esc(texte).replace(/\{(\w+)\}/g, (m, k) => (k in valeurs ? `<strong>${esc(valeurs[k])}</strong>` : m));
    };

    const haut = (titre, sousTitre, ecran) => {
      const barres = Array.from({ length: total }, (_, i) => `<span class="${i <= index ? 'fait' : ''}"></span>`).join('');
      return `<div class="guide-haut" data-ecran="${ecran}">${etoile}
        <span class="guide-persona">${icone(G.persona.icone || 'briefcase-business')}<span class="qui">Dans la peau du ${esc(G.persona.nom.replace(/^Le /, ''))}</span>${sousTitre ? `<span class="ou"><span class="sep"> · </span>${esc(sousTitre)}</span>` : ''}</span>
        <h2 id="guide-titre">${titre}</h2>
        <div class="guide-progression" aria-hidden="true">${barres}</div>
      </div>
      <button type="button" class="guide-fermer" data-guide="fermer" aria-label="Fermer le guide">${icone('x')}</button>`;
    };

    const bas = (options) => {
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
    };

    const rendre = () => {
      let html;
      if (index === 0) {
        html = haut(remplir(G.persona.accroche), 'Le contexte', 'accueil') +
          `<div class="guide-corps">
            <ul class="guide-fiche">${G.persona.fiche.map((f) => `<li>${tuile(f.icone)}<b>${esc(f.libelle)}</b><span>${remplir(f.texte)}</span></li>`).join('')}</ul>
            <p class="guide-promesse">${icone(G.persona.icone_promesse || 'triangle-alert')}${esc(G.persona.promesse)}</p>
            <ol class="guide-pieges">${G.etapes.map((e, i) => `<li><span class="guide-num" aria-hidden="true">${i + 1}</span>${icone(e.icone)}<span>${esc(e.court || e.douleur_titre)}</span></li>`).join('')}</ol>
          </div>` + bas({ suivant: 'Commencer la visite' });
      } else if (index <= G.etapes.length) {
        const e = G.etapes[index - 1];
        html = haut(esc(e.douleur_titre), `${G.libelle_etape || 'Piège'} ${index} sur ${G.etapes.length}`, 'etape') +
          `<div class="guide-corps" data-etape="${index}">
            <div class="guide-duo">
              <div class="guide-bloc douleur">
                <div class="etiquette">${tuile(e.icone, 'ton-rouge')}Le problème</div>
                <p>${remplir(e.douleur)}</p>
                ${e.risque ? `<p class="guide-risque">${icone('triangle-alert')}<span><strong>Le risque :</strong> ${remplir(e.risque)}</span></p>` : ''}
              </div>
              <div class="guide-fleche" aria-hidden="true">${icone('arrow-right')}</div>
              <div class="guide-bloc solution">
                <div class="etiquette">${tuile(e.icone_solution || 'circle-check', 'ton-vert')}Avec NOVA</div>
                <h3>${esc(e.solution_titre)}</h3>
                <p>${remplir(e.solution)}</p>
                <button type="button" class="bouton guide-aller" data-guide="aller">${icone(e.assistant != null || e.assistant_exemple != null ? 'sparkles' : 'eye')}${esc(e.bouton)}</button>
              </div>
            </div>
          </div>` + bas({ suivant: index === G.etapes.length ? 'Terminer' : (G.libelle_suivant || 'Piège suivant') });
      } else {
        html = haut(esc(G.fin.titre), 'Fin de la visite', 'fin') +
          `<div class="guide-corps"><div class="guide-fin">${tuile('flag', 'ton-vert')}<p>${esc(G.fin.texte)}</p></div></div>` +
          bas({ fin: `${DEMO ? `<button type="button" class="bouton" data-guide="imprimer">${icone('printer')}Imprimer le brief</button>` : ''}
            <button type="button" class="bouton primaire" data-guide="${DEMO ? 'fermer' : 'assistant'}">${icone(DEMO ? 'layout-dashboard' : 'sparkles')}${DEMO ? 'Commencer' : 'Ouvrir l\'assistant'}</button>` });
      }
      cadre.innerHTML = html;
      A.typographier(cadre);
      ajuster();
      // Le focus reste dans le guide : bouton principal de l'étape (navigation au clavier sans souris).
      if (dialogue.open) { const b = cadre.querySelector('.guide-bas .primaire') || cadre.querySelector('.guide-bas [data-guide]'); if (b) b.focus({ preventScroll: true }); }
    };

    // Aucune barre de défilement : on réduit la taille de base (tout le guide est en em) jusqu'à ce que tout tienne.
    const ajuster = () => {
      if (!dialogue.open) return;
      let taille = TAILLE_MAX;
      dialogue.style.fontSize = taille + 'px';
      // Seule la hauteur compte : l'animation de glissement élargit brièvement la zone, sans débordement réel.
      while (taille > TAILLE_MIN && dialogue.scrollHeight > dialogue.clientHeight + 1) {
        taille -= 0.5;
        dialogue.style.fontSize = taille + 'px';
      }
      dialogue.scrollTop = 0;
    };

    ouvrir = (depuis) => {
      index = depuis || 0;
      if (!dialogue.open) dialogue.showModal();
      rendre();
    };

    const fermer = () => {
      ecrireVu();
      if (dialogue.open) dialogue.close();
    };

    const aller = () => {
      const e = G.etapes[index - 1];
      fermer();
      if (!e) return;
      // Étape « assistant » : le panneau s'ouvre avec un message prêt à envoyer.
      if (e.assistant_exemple != null || e.assistant != null) {
        if (window.NOVA_ASSISTANT) window.NOVA_ASSISTANT.ouvrir(e.assistant_exemple != null ? { exemple: e.assistant_exemple } : { brouillon: e.assistant });
        return;
      }
      const hash = '#' + e.onglet + (e.ancre ? '/' + e.ancre : '');
      if (location.hash === hash) A.allerA(e.onglet, e.ancre);
      else location.hash = hash;
    };

    cadre.addEventListener('click', (ev) => {
      const b = ev.target.closest('[data-guide]');
      if (!b) return;
      const quoi = b.dataset.guide;
      if (quoi === 'suivant') { index = Math.min(total - 1, index + 1); rendre(); }
      else if (quoi === 'precedent') { index = Math.max(0, index - 1); rendre(); }
      else if (quoi === 'fermer') fermer();
      else if (quoi === 'aller') aller();
      else if (quoi === 'imprimer') { fermer(); A.imprimerBrief(); }
      else if (quoi === 'assistant') { fermer(); if (window.NOVA_ASSISTANT) window.NOVA_ASSISTANT.ouvrir({}); }
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
    boutonGuide.addEventListener('click', () => ouvrir(0));
    window.NOVA_GUIDE = { ouvrir, fermer };
  } else {
    boutonGuide.hidden = true;
  }

  // Premier lancement : la vidéo, puis le choix de la version. Ensuite, le guide s'ouvre une fois
  // (sauf lien direct vers une preuve).
  document.addEventListener('DOMContentLoaded', () => {
    if (lienDirect()) return;
    if (!lire(CLE_MODE)) setTimeout(() => { if (!dialogueChoix.open) ouvrirAccueil(true); }, 200);
    else if (G && !lireVu()) setTimeout(() => ouvrir(0), 350);
  });

  window.NOVA_VERSIONS = { choisir, changerDeVersion, ouvrirMenu, fermerMenu, ouvrirAccueil, passerVideo };
})();
