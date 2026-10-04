// Tests des espaces 1, 3, 4 et 5, de l'assistant et des deux versions (appelé par tester_navigateur.mjs).
import fs from 'node:fs';
import path from 'node:path';

export default async function ({ page, ok, RACINE, captures, dossierCaptures }) {
  const texte = async (sel) => (await page.textContent(sel)) || '';

  // ---------- Vue d'ensemble ----------
  await page.click('[data-onglet="vue"]');
  const vue = await texte('main');
  ok('Vue : date approuvée 22 octobre 2026', /22 octobre 2026/.test(vue));
  ok('Vue : 0 / 3 conditions remplies', /0 \/ 3 remplies/.test(vue));
  ok('Vue : montant autorisé 204 000 $', /204\s000\s\$/.test(vue));
  ok('Vue : responsable Nicolas Perron depuis le 16 septembre', /Nicolas Perron/.test(vue) && /16 septembre 2026/.test(vue));
  ok('Vue : compte à rebours depuis la date de situation (J−22)', /J−22/.test(vue));

  // ---------- Direction artistique : aucun tiret cadratin visible hors des citations du corpus ----------
  const tirets = [];
  for (const o of ['vue', 'questions', 'historique', 'actions', 'documents']) {
    await page.click(`[data-onglet="${o}"]`);
    const n = await page.evaluate(() => {
      const w = document.createTreeWalker(document.body, NodeFilter.SHOW_TEXT, { acceptNode: (t) => (t.parentElement.closest('script, style, textarea, .doc-texte, .preuve-citation, .extrait, #visionneuse') ? 2 : 1) });
      let c = 0; while (w.nextNode()) if (w.currentNode.nodeValue.includes('\u2014')) c++;
      return c;
    });
    if (n) tirets.push(`${o} : ${n}`);
  }
  ok('Aucun tiret cadratin visible hors des citations (règle da-moderne)', tirets.length === 0, tirets.join(' | '));
  ok('Polices Fraunces et Source Sans 3 chargées depuis le fichier (hors connexion)', await page.evaluate(async () => { await document.fonts.ready; const charge = (n) => [...document.fonts].some((f) => f.family.replace(/"/g, '') === n && f.status === 'loaded'); return document.fonts.check('600 20px "Fraunces"') && document.fonts.check('400 18px "Source Sans 3"') && charge('Fraunces') && charge('Source Sans 3'); }));
  await page.click('[data-onglet="vue"]');

  // ---------- Brief sur une page ----------
  await page.evaluate(() => { document.getElementById('zone-impression').innerHTML = window.NOVA_APP.briefHtml(window.NOVA_APP.etat.courant); });
  const pdf = await page.pdf({ format: 'Letter', printBackground: true });
  const nbPages = (pdf.toString('latin1').match(/\/Type\s*\/Page[^s]/g) || []).length;
  if (captures) fs.writeFileSync(path.join(dossierCaptures, 'brief.pdf'), pdf);
  ok('Brief imprimé sur une seule page (Letter)', nbPages === 1, `${nbPages} page(s)`);
  const pdfA4 = await page.pdf({ format: 'A4', printBackground: true });
  const nbA4 = (pdfA4.toString('latin1').match(/\/Type\s*\/Page[^s]/g) || []).length;
  ok('Brief imprimé sur une seule page (A4)', nbA4 === 1, `${nbA4} page(s)`);
  const brief = await page.evaluate(() => document.getElementById('zone-impression').textContent);
  ok('Brief : cinq thèmes (responsable, date et conditions, portée, budget et factures, priorités)', ['Responsable', 'Date approuvée et conditions', 'Portée', 'Budget et factures', 'Priorités'].every((t) => brief.includes(t)));

  // ---------- Historique : un sous-onglet à la fois ----------
  await page.click('[data-onglet="historique"]');
  ok('Historique : quatre sous-onglets (chronologie, décision et validation, registre, contradictions)', (await page.locator('.segmente [data-sous-onglet^="historique:"]').count()) === 4);
  ok('Historique : chronologie complète', (await page.locator('ol.chrono > li').count()) >= 40);
  await page.click('.filtres-repli > summary');
  await page.click('[data-filtre-sujet="securite"]');
  const nbSecu = await page.locator('ol.chrono > li').count();
  ok('Historique : filtre par sujet (Sécurité), replié par défaut', nbSecu > 0 && nbSecu < 15, `${nbSecu} événements`);
  await page.click('[data-filtre-sujet="securite"]');
  await page.click('[data-sous-onglet="historique:cycles"]');
  ok('Historique : cycles proposition → décision → validation', (await page.locator('.cycle').count()) >= 8);
  await page.click('[data-sous-onglet="historique:decisions"]');
  ok('Historique : registre des décisions', (await page.locator('main table tbody tr').count()) >= 5);
  await page.click('[data-sous-onglet="historique:contradictions"]');
  ok('Historique : 8 contradictions expliquées', (await page.locator('section.carte.contradiction').count()) === 8);
  await page.click('[data-sous-onglet="historique:chrono"]');

  // ---------- Actions ----------
  await page.click('[data-onglet="actions"]');
  ok('Actions : 11 actions', (await page.locator('tbody tr[id^="action-"]').count()) === 11);
  ok('Actions : échéances « À confirmer » (aucune date inventée)', (await texte('main')).includes('À confirmer'));
  await page.click('[data-filtre-actions="conditions"]');
  ok('Actions : filtre conditions de go-live (5 actions)', (await page.locator('tbody tr[id^="action-"]').count()) === 5);
  await page.click('[data-filtre-actions="toutes"]');

  // ---------- Documents : recherche ----------
  await page.click('[data-onglet="documents"]');
  await page.fill('#champ-recherche-docs', 'retour arrière');
  await page.click('#form-recherche-docs button[type=submit]');
  const nbRes = await page.locator('#d-recherche .resultat').count();
  ok('Documents : recherche plein texte sans accents', nbRes >= 1, `${nbRes} résultat(s)`);
  await page.locator('#d-recherche .resultat button').first().click();
  await page.waitForSelector('#visionneuse[open]');
  ok('Documents : un résultat ouvre le passage surligné', (await page.locator('#visionneuse-corps mark').count()) >= 1);
  await page.click('#visionneuse-fermer');
  await page.click('[data-sous-onglet="documents:liste"]');
  ok('Documents : 64 sources listées', /Tous les documents \(64\)/.test(await texte('#d-liste')));

  // ---------- Exemple fictif ----------
  await page.click('[data-sous-onglet="documents:maj"]');
  await page.click('[data-maj="exemple-on"]');
  await page.waitForSelector('#bandeau-version:not([hidden])');
  ok('Exemple : bandeau « EXEMPLE FICTIF » visible', /EXEMPLE FICTIF/.test(await texte('#bandeau-version')));
  const avantApres = await texte('#d-avant-apres');
  ok('Exemple : avant/après répond aux trois questions', ['vient de changer', 'informations précédentes sont affectées', 'actions devraient être prises', 'Ce qui ne change pas'].every((t) => avantApres.includes(t)));
  await page.click('[data-onglet="vue"]');
  const vueMaj = await texte('main');
  ok('Exemple : la date approuvée reste le 22 octobre', /22 octobre 2026/.test(vueMaj) && /Propositions en attente de décision/.test(vueMaj));
  ok('Exemple : C2 passe à « Correctif livré », non validée (0 / 3)', /Correctif livré, validation en attente/.test(vueMaj) && /0 \/ 3 remplies/.test(vueMaj));
  await page.click('[data-onglet="questions"]');
  ok('Exemple : Q01 porte la note de mise à jour', /Boréal propose le 29 octobre/.test(await texte('#question-Q01')));
  await page.click('[data-version="initiale"]');
  await page.click('[data-onglet="vue"]');
  ok('Exemple : la version initiale est conservée', !/Propositions en attente de décision/.test(await texte('main')));
  await page.click('[data-version="actualisee"]');
  if (captures) { await page.click('[data-onglet="documents"]'); await page.locator('#d-avant-apres').screenshot({ path: path.join(dossierCaptures, 'avant_apres.png') }); }
  await page.click('[data-onglet="documents"]');
  await page.click('[data-maj="exemple-off"]');

  // ---------- Formulaire expert (replié par défaut) : garde-fous ----------
  await page.click('[data-onglet="documents"]');
  ok('Mises à jour : le formulaire expert est replié, l\'assistant est la porte d\'entrée', (await page.locator('#d-ajout:not([open])').count()) === 1 && (await page.locator('#d-assistant [data-ouvrir-assistant]').count()) >= 1);
  await page.click('#d-ajout > summary');
  await page.fill('#f-titre', 'Test — courriel fournisseur');
  await page.fill('#f-texte', 'Le correctif SEC-210 est corrigé de notre côté. Nous proposons le 29 octobre.');
  await page.locator('#f-texte').blur();
  await page.selectOption('#f-autorite', 'fournisseur');
  await page.fill('#f-resume', 'Boréal dit SEC-210 corrigé.');
  await page.selectOption('#f-nouvel-impact', 'condition');
  await page.click('[data-ajouter-impact]');
  await page.selectOption('#im-0-etat', 'valide');
  await page.fill('#im-0-passage', 'Le correctif SEC-210 est corrigé de notre côté.');
  await page.click('[data-maj="enregistrer"]');
  const alerte = await texte('#d-ajout [role="alert"]');
  ok('Garde-fou : un fournisseur ne peut pas fermer une condition', /fournisseur ne peut pas fermer/.test(alerte));

  // Décision de date sans autorité : refusée.
  await page.click('[data-retirer-impact="0"]');
  await page.selectOption('#f-nouvel-impact', 'decision_date');
  await page.click('[data-ajouter-impact]');
  await page.fill('#im-0-date', '2026-10-29');
  await page.fill('#im-0-passage', 'Nous proposons le 29 octobre.');
  await page.click('[data-maj="enregistrer"]');
  ok('Garde-fou : une décision de date exige une autorité', /qui a approuvé/.test(await texte('#d-ajout [role="alert"]')));

  // Proposition de date valide : enregistrée, la date approuvée ne bouge pas.
  await page.click('[data-retirer-impact="0"]');
  await page.selectOption('#f-nouvel-impact', 'proposition_date');
  await page.click('[data-ajouter-impact]');
  await page.fill('#im-0-date', '2026-10-29');
  await page.fill('#im-0-propose_par', 'Boréal');
  await page.fill('#im-0-passage', 'Nous proposons le 29 octobre.');
  await page.click('[data-maj="enregistrer"]');
  const msg = await texte('#d-ajout');
  ok('Formulaire : proposition enregistrée', /enregistrée/.test(msg));
  await page.click('[data-onglet="vue"]');
  const v2 = await texte('main');
  ok('Formulaire : date approuvée inchangée + proposition en attente', /22 octobre 2026/.test(v2) && /29 octobre 2026/.test(v2));
  await page.click('[data-onglet="actions"]');
  ok('Formulaire : action de décision ajoutée automatiquement', /Faire trancher la proposition du 29 octobre 2026/.test(await texte('main')));

  // Persistance après rechargement.
  await page.reload();
  await page.waitForSelector('main#contenu > *');
  ok('Persistance : la mise à jour survit au rechargement', /1 mise à jour/.test(await texte('#bandeau-version')));

  // Import d'un fichier JSON.
  const fichierImport = path.join(RACINE, 'dist', 'test_import.json');
  fs.writeFileSync(fichierImport, JSON.stringify({ id: 'TEST-IMPORT', titre: 'Test import', date: '2026-10-02T09:00:00-04:00', nature: 'validation_obtenue', resume: 'Sophie valide SEC-210.',
    source: { id: 'TEST-SRC', titre: 'Test', autorite: 'ticket', texte: '02 oct - Sophie : Re-test OK. SEC-210 accepté. Fermé.' },
    impacts: [{ cible: 'conditions/C1', nature: 'validation_obtenue', modifs: { etat: 'valide' }, passage: 'Re-test OK. SEC-210 accepté.' }] }));
  await page.click('[data-onglet="documents"]');
  await page.click('[data-sous-onglet="documents:maj"]');
  await page.setInputFiles('#f-import', fichierImport);
  await page.waitForTimeout(300);
  await page.click('[data-onglet="vue"]');
  ok('Import JSON : validation de C1 appliquée (1 / 3), les autres conditions restent ouvertes', /1 \/ 3 remplies/.test(await texte('main')));
  fs.unlinkSync(fichierImport);

  // Décision approuvée de date (avec autorité) : la date change, l'ancienne reste dans la version initiale.
  fs.writeFileSync(fichierImport, JSON.stringify({ id: 'TEST-DECISION', titre: 'Test décision', date: '2026-10-03T15:30:00-04:00', nature: 'decision_approuvee', resume: 'Le comité approuve le 29 octobre.',
    source: { id: 'TEST-SRC-2', titre: 'Compte rendu test', autorite: 'decision', texte: '15:30 Nicolas : Le comité approuve le 29 octobre comme nouvelle date. Les trois conditions restent.' },
    impacts: [{ cible: 'synthese/date_mep', nature: 'decision_approuvee', modifs: { approuvee: '2026-10-29', texte: '29 octobre 2026', autorite: 'Comité de direction NOVA', date_decision: '2026-10-03', statut: 'Approuvée' }, passage: 'Le comité approuve le 29 octobre comme nouvelle date.' }] }));
  await page.click('[data-onglet="documents"]');
  await page.click('[data-sous-onglet="documents:maj"]');
  await page.setInputFiles('#f-import', fichierImport);
  await page.waitForTimeout(300);
  fs.unlinkSync(fichierImport);
  await page.click('[data-onglet="vue"]');
  const vueDecision = await texte('main');
  const briefDecision = await page.evaluate(() => window.NOVA_APP.briefHtml(window.NOVA_APP.etat.courant));
  ok('Décision de date : la nouvelle date approuvée s\'affiche', /29 octobre 2026/.test(vueDecision) && /Approuvée/.test(vueDecision));
  ok('Décision de date : le brief cite la nouvelle décision, pas l\'ancienne proposition', /3 octobre 2026/.test(briefDecision) && !/proposée par Boréal le 8 septembre/.test(briefDecision) && /TEST-SRC-2/.test(briefDecision));
  await page.click('[data-version="initiale"]');
  await page.click('[data-onglet="vue"]');
  ok('Décision de date : la version initiale garde le 22 octobre', /22 octobre 2026/.test(await texte('main .hero-date')));
  await page.click('[data-version="actualisee"]');

  if (captures) {
    await page.click('[data-onglet="vue"]');
    await page.screenshot({ path: path.join(dossierCaptures, 'vue_apres_maj.png'), fullPage: false });
  }
  // ---------- Tutoriel d'accueil (première visite) ----------
  await page.evaluate(() => { localStorage.clear(); sessionStorage.setItem('tester-guide', '1'); });
  await page.reload();
  await page.waitForSelector('#guide[open]', { timeout: 5000 });
  const accueil = await texte('#guide');
  ok('Tutoriel : s\'ouvre à la première visite, dans la peau du PDG, au mercredi 30 septembre', /PDG/.test(accueil) && /Mercredi 30\s*septembre/.test(accueil) && /22\s*jours/.test(accueil));
  ok('Tutoriel : fiche du dirigeant (4 éléments) et six pièges', (await page.locator('#guide .guide-fiche li').count()) === 4 && (await page.locator('#guide .guide-pieges li').count()) === 6);
  await page.click('#guide [data-guide="suivant"]');
  const etape1 = await texte('#guide');
  ok('Tutoriel : chaque étape oppose le problème et la réponse de NOVA', /Le problème/.test(etape1) && /Avec NOVA/.test(etape1));
  ok('Tutoriel : les chiffres viennent de l\'état réel (22 octobre, 0 sur 3)', /22 octobre 2026/.test(etape1) && /0\s*sur 3/.test(etape1));
  ok('Tutoriel : chaque douleur nomme le risque concret', /Le risque/.test(etape1) && (await page.locator('#guide .guide-risque').count()) === 1);
  for (let i = 0; i < 6; i++) await page.keyboard.press('ArrowRight');
  ok('Tutoriel : navigation au clavier jusqu\'à la fin (8 étapes)', /Étape 8 sur 8/.test(await texte('#guide')));
  if (captures) await page.screenshot({ path: path.join(dossierCaptures, 'guide_fin.png') });
  await page.click('#guide .guide-bas [data-guide="fermer"]');
  ok('Tutoriel : se ferme avec « Commencer »', (await page.locator('#guide[open]').count()) === 0);
  await page.reload();
  await page.waitForSelector('main#contenu > *');
  await page.waitForTimeout(600);
  ok('Tutoriel : ne revient pas après avoir été vu', (await page.locator('#guide[open]').count()) === 0);
  await page.click('#ouvrir-guide');
  await page.waitForSelector('#guide[open]');
  await page.click('#guide [data-guide="suivant"]');
  await page.click('#guide [data-guide="aller"]');
  await page.waitForTimeout(400);
  ok('Tutoriel : le bouton « Guide » le rouvre et « Voir l\'accueil » mène à la page', (await page.locator('#guide[open]').count()) === 0 && (await page.locator('main .hero-date').count()) === 1);
  await page.click('#ouvrir-guide');
  await page.waitForSelector('#guide[open]');
  for (let i = 0; i < 6; i++) await page.keyboard.press('ArrowRight');
  await page.click('#guide [data-guide="aller"]');
  await page.waitForTimeout(400);
  ok('Tutoriel : le piège 6 ouvre l\'assistant avec un message d\'essai prêt (marqué EXEMPLE)', (await page.locator('body.assistant-ouvert').count()) === 1 && /29 octobre/.test(await page.inputValue('#assistant-champ')) && (await page.evaluate(() => window.NOVA_ASSISTANT.conv.exempleSuivant)) === true);
  await page.click('#assistant-fermer');
  if (captures) {
    await page.evaluate(() => { localStorage.removeItem('nova360.guide.vu'); });
    await page.click('#ouvrir-guide'); await page.waitForSelector('#guide[open]');
    await page.screenshot({ path: path.join(dossierCaptures, 'guide_accueil.png') });
    await page.click('#guide [data-guide="suivant"]'); await page.waitForTimeout(600);
    await page.screenshot({ path: path.join(dossierCaptures, 'guide_etape.png') });
    await page.keyboard.press('Escape');
  }

  // ---------- Icônes : chaque icône affichée existe et se dessine ----------
  {
    const manquantes = new Set();
    for (const onglet of ['vue', 'questions', 'historique', 'actions', 'documents']) {
      await page.evaluate((o) => { location.hash = '#' + o; }, onglet);
      await page.waitForTimeout(500);
      (await page.evaluate(() => [...document.querySelectorAll('use')].map((u) => u.getAttribute('href')).filter((h) => {
        const s = document.querySelector(h);
        return !s || !s.querySelector('path, rect, circle, line, polyline, polygon, ellipse') || s.querySelector('svg');
      }))).forEach((h) => manquantes.add(h));
    }
    ok(`Icônes : toutes celles affichées existent et se dessinent${manquantes.size ? ' (manquantes : ' + [...manquantes].join(', ') + ')' : ''}`, manquantes.size === 0);
  }

  // ---------- Tutoriel : aucun défilement, quelle que soit la taille d'écran ----------
  {
    const tailles = [[1920, 1080], [1440, 900], [1366, 768], [1280, 720], [768, 1024], [390, 844], [375, 667], [360, 640]];
    const defauts = [];
    for (const [w, h] of tailles) {
      await page.setViewportSize({ width: w, height: h });
      await page.evaluate(() => window.NOVA_GUIDE.ouvrir(0));
      for (let i = 0; i < 8; i++) {
        await page.waitForTimeout(60);
        const m = await page.evaluate(() => { const d = document.getElementById('guide'); return { sh: d.scrollHeight, ch: d.clientHeight, sw: d.scrollWidth, cw: d.clientWidth, h: d.getBoundingClientRect().height, vh: window.innerHeight, t: parseFloat(d.style.fontSize) }; });
        if (m.sh > m.ch + 1 || m.h > m.vh) defauts.push(`${w}×${h} écran ${i + 1} (${m.sh}/${m.ch})`);
        if (m.t < 13) defauts.push(`${w}×${h} écran ${i + 1} : texte trop petit (${m.t} px)`);
        if (i < 7) await page.keyboard.press('ArrowRight');
      }
      await page.evaluate(() => window.NOVA_GUIDE.fermer());
    }
    ok(`Tutoriel : aucun défilement ni texte trop petit, 8 écrans × ${tailles.length} tailles${defauts.length ? ' : ' + defauts.slice(0, 4).join(', ') : ''}`, defauts.length === 0);
    await page.setViewportSize({ width: 1366, height: 900 });
  }

  // ---------- Téléphone : rien ne déborde, la recherche et l'aide restent visibles ----------
  await page.setViewportSize({ width: 390, height: 844 });
  await page.evaluate(() => { location.hash = '#vue'; });
  await page.waitForTimeout(700);
  const debord = await page.evaluate(() => ['#champ-question', '#form-question button', '#bouton-mode', '#ouvrir-guide', '.hero-date', '#lanceur-assistant'].map((s) => document.querySelector(s).getBoundingClientRect()).every((r) => r.left >= 0 && r.right <= window.innerWidth + 1));
  ok('Téléphone (390 px) : en-tête, carte principale et bouton Assistant tiennent dans l\'écran', debord && (await page.evaluate(() => window.scrollX)) === 0);
  await page.click('#lanceur-assistant');
  await page.waitForTimeout(650);
  const plein = await page.evaluate(() => { const r = document.getElementById('assistant').getBoundingClientRect(); return Math.round(r.left) === 0 && Math.round(r.width) === window.innerWidth; });
  ok('Téléphone : l\'assistant passe en plein écran', plein);
  await page.click('#assistant-fermer');
  await page.setViewportSize({ width: 1366, height: 900 });

  // ===================================================================
  // Assistant : vue fractionnée, réponses sourcées, mises à jour confirmées
  // ===================================================================
  await page.evaluate(() => { localStorage.clear(); localStorage.setItem('nova360.mode', 'demo'); localStorage.setItem('nova360.guide.vu', '1'); sessionStorage.clear(); location.hash = '#vue'; });
  await page.reload();
  await page.waitForSelector('main#contenu > *');
  const attendreAssistant = () => page.waitForFunction(() => !window.NOVA_ASSISTANT.conv.occupe);
  const dernierMessage = () => page.evaluate(() => { const b = [...document.querySelectorAll('#assistant-fil .bulle')]; return b.length ? b[b.length - 1].textContent.replace(/\s+/g, ' ') : ''; });
  async function envoyer(texte, exemple) {
    if (exemple != null) await page.click(`[data-ia-exemple="${exemple}"]`);
    else await page.fill('#assistant-champ', texte);
    await page.click('#assistant-form .bouton-envoyer');
    await attendreAssistant();
  }
  await page.click('#form-question button[type=submit]'); // champ vide : ouvre simplement l'assistant
  await page.waitForTimeout(650);
  {
    const m = await page.evaluate(() => { const a = document.getElementById('assistant').getBoundingClientRect(); const p = document.getElementById('page').getBoundingClientRect(); return { ratio: a.width / window.innerWidth, droite: a.right, vw: window.innerWidth, finPage: p.right, debutAssistant: a.left }; });
    ok('Assistant : vue fractionnée, un tiers de la largeur à droite, la page se resserre', m.ratio > 0.32 && m.ratio < 0.345 && Math.abs(m.droite - m.vw) < 2 && m.finPage <= m.debutAssistant + 1, `${(m.ratio * 100).toFixed(1)} % de la largeur`);
  }
  ok('Assistant : message d\'accueil, suggestions et essais', /Bonjour/.test(await texte('#assistant-fil')) && (await page.locator('[data-ia-envoyer]').count()) >= 3 && (await page.locator('[data-ia-exemple]').count()) === 3);
  await envoyer('Où en est le projet ?');
  ok('Assistant : « Où en est le projet ? » → synthèse (date, 0 / 3, actions)', /22 octobre 2026/.test(await dernierMessage()) && /0 \/ 3 remplies/.test(await dernierMessage()));
  await envoyer('Combien a-t-on payé ?');
  ok('Assistant : question de finances → montants et preuve', /204\s000\s\$/.test(await dernierMessage()) && (await page.locator('#assistant-fil .bulle.ia').last().locator('[data-preuve-ia]').count()) >= 1);

  // Mise à jour : Sophie valide SEC-210 → aperçu → appliquer → 1 / 3 → annuler.
  await envoyer(null, 0);
  ok('Assistant : un courriel collé devient une mise à jour proposée (rien n\'est appliqué avant accord)', (await page.locator('.carte-maj [data-ia-appliquer]').count()) === 1 && /0 \/ 3 remplies/.test(await texte('main')));
  const carte = await texte('#assistant-fil .carte-maj');
  ok('Assistant : l\'aperçu montre le changement, la source citée, ce qui ne change pas, et le badge EXEMPLE', /Validé \/ fermé/.test(carte) && /Validation obtenue/.test(carte) && /Re-test de SEC-210 concluant/.test(carte) && /Ce qui ne change pas/.test(carte) && /EXEMPLE/.test(carte));
  await page.click('[data-ia-appliquer]');
  await attendreAssistant();
  ok('Assistant : « Appliquer » met tout le dossier à jour (1 / 3 remplies)', /1 \/ 3 remplies/.test(await texte('main')) && /1 \/ 3 remplie/.test(await dernierMessage()));
  await page.click('[data-onglet="historique"]');
  ok('Assistant : la mise à jour entre dans l\'historique avec sa source', /Re-test de SEC-210 concluant|Sophie Lambert/.test(await texte('main ol.chrono')));
  await page.click('[data-onglet="vue"]');
  await page.click('[data-ia-annuler]');
  await attendreAssistant();
  ok('Assistant : « Annuler cette mise à jour » rétablit l\'état précédent (0 / 3)', /0 \/ 3 remplies/.test(await texte('main')));

  // Garde-fou : le fournisseur dit ACC-303 « validé » → correctif livré, jamais une validation.
  await envoyer(null, 2);
  const garde = await texte('#assistant-fil');
  ok('Assistant : garde-fou fournisseur (correctif livré, la condition reste ouverte)', /Garde-fou/.test(garde) && /ne peut pas fermer C2/.test(garde) && /Correctif livré, validation en attente/.test(await page.locator('#assistant-fil .carte-maj').last().textContent()));
  await page.locator('[data-ia-appliquer]').last().click();
  await attendreAssistant();
  ok('Assistant : après application, C2 est « correctif livré » et rien n\'est fermé (0 / 3)', /0 \/ 3 remplies/.test(await texte('main')) && (await page.evaluate(() => window.NOVA_APP.etat.actualise.synthese.conditions.find((c) => c.id === 'C2').etat)) === 'correctif_livre');
  await page.locator('[data-ia-annuler]').last().click();
  await attendreAssistant();

  // Proposition : Boréal propose le 29 octobre → proposition en attente, la date approuvée ne bouge pas.
  await envoyer(null, 1);
  await page.locator('[data-ia-appliquer]').last().click();
  await attendreAssistant();
  const vueProp = await texte('main');
  ok('Assistant : une proposition reste une proposition (22 octobre inchangé, 29 octobre en attente)', /22 octobre 2026/.test(await texte('main .hero-date')) && /29 octobre 2026/.test(vueProp) && /non approuvée/.test(vueProp));
  await page.locator('[data-ia-annuler]').last().click();
  await attendreAssistant();

  // Question de précision : une validation sans validateur → l'assistant demande qui a validé.
  await envoyer('Le re-test de SEC-210 est concluant, c\'est validé.');
  ok('Assistant : demande qui a validé avant de fermer une condition', /Qui a validé/.test(await dernierMessage()) && (await page.locator('[data-ia-repondre]').count()) >= 3);
  await page.locator('[data-ia-repondre]').filter({ hasText: 'fournisseur' }).click();
  await attendreAssistant();
  ok('Assistant : réponse « le fournisseur » → correctif livré proposé, pas de fermeture', /Correctif livré/.test(await dernierMessage()) && !/Validé \/ fermé/.test(await dernierMessage()));
  await page.locator('[data-ia-ignorer]').last().click();
  await attendreAssistant();
  ok('Assistant : « Ignorer » ne modifie rien', /rien n'a été modifié/.test(await dernierMessage()) && /0 \/ 3 remplies/.test(await texte('main')));

  // Connecteur Claude (facultatif) : requête simulée, sans réseau. Mêmes garde-fous qu'en local.
  {
    const requetes = [];
    let reponses = [];
    await page.route('https://api.anthropic.com/**', async (route) => {
      const req = route.request();
      requetes.push({ entetes: req.headers(), corps: JSON.parse(req.postData() || '{}') });
      await route.fulfill({ status: 200, contentType: 'application/json', body: JSON.stringify(reponses.shift()) });
    });
    const outil = (input) => ({ id: 'msg_test', type: 'message', role: 'assistant', model: 'claude-opus-5-5', stop_reason: 'tool_use', content: [{ type: 'text', text: 'Je prépare la mise à jour pour [C1], voir [Q08].' }, { type: 'tool_use', id: 'toolu_' + requetes.length, name: 'proposer_mise_a_jour', input }] });
    await page.click('#assistant-reglages');
    await page.check('input[name="moteur-ia"][value="claude"]');
    await page.fill('#cle-claude', 'sk-ant-test-factice');
    await page.click('[data-ia-reglages="enregistrer"]');
    ok('Connecteur Claude : activé avec une clé gardée dans l\'onglet (sessionStorage, jamais localStorage)', /Claude/.test(await texte('#assistant-moteur')) && (await page.evaluate(() => sessionStorage.getItem('nova360.claude.cle'))) === 'sk-ant-test-factice' && !(await page.evaluate(() => JSON.stringify(localStorage))).includes('sk-ant'));
    reponses.push(outil({ titre: 'Sophie valide SEC-210', resume: 'Validation de C1.', date: '2026-10-02T09:00:00-04:00', auteur: 'Sophie Lambert', autorite: 'ticket', impacts: [{ operation: 'etat_condition', cible: 'C1', etat: 'valide', nature: 'validation_obtenue', passage: 'Re-test de SEC-210 concluant.' }] }));
    await envoyer('Sophie Lambert : Re-test de SEC-210 concluant. Je valide.');
    const r = requetes[0] || { entetes: {}, corps: {} };
    ok('Connecteur Claude : requête conforme (modèle claude-opus-5-5, version d\'API, outil, accès navigateur explicite)', r.entetes['x-api-key'] === 'sk-ant-test-factice' && r.entetes['anthropic-version'] === '2023-06-01' && r.entetes['anthropic-dangerous-direct-browser-access'] === 'true' && r.corps.model === 'claude-opus-5-5' && r.corps.tools && r.corps.tools[0].name === 'proposer_mise_a_jour' && r.corps.tool_choice && r.corps.tool_choice.type === 'auto' && !('thinking' in r.corps));
    ok('Connecteur Claude : l\'état du dossier est transmis (conditions, actions)', (r.corps.messages || []).some((m) => m.role === 'system' && /C1/.test(m.content) && /A0/.test(m.content)));
    ok('Connecteur Claude : la proposition de Claude passe par l\'aperçu (rien n\'est appliqué seul)', (await page.locator('.carte-maj [data-ia-appliquer]').count()) === 1 && /0 \/ 3 remplies/.test(await texte('main')));
    await page.locator('[data-ia-appliquer]').last().click();
    await attendreAssistant();
    ok('Connecteur Claude : appliquée après accord (1 / 3)', /1 \/ 3 remplies/.test(await texte('main')));
    await page.locator('[data-ia-annuler]').last().click();
    await attendreAssistant();
    // Claude tente de faire fermer une condition par le fournisseur : refusé par les mêmes garde-fous.
    reponses.push(outil({ titre: 'Boréal ferme ACC-303', resume: 'Fermeture de C2.', date: '2026-10-02T10:00:00-04:00', auteur: 'Julien Moreau (Boréal)', autorite: 'fournisseur', impacts: [{ operation: 'etat_condition', cible: 'C2', etat: 'valide', nature: 'validation_obtenue', passage: 'ACC-303 est validé de notre côté.' }] }));
    await envoyer('Boréal : ACC-303 est validé de notre côté.');
    ok('Connecteur Claude : la suite de la conversation renvoie le résultat de l\'outil (historique en ajout seul)', (requetes[1] ? requetes[1].corps.messages : []).some((m) => Array.isArray(m.content) && m.content.some((c) => c.type === 'tool_result')));
    ok('Connecteur Claude : une fermeture par le fournisseur est refusée par les garde-fous', /Refusé par les garde-fous/.test(await texte('#assistant-fil .bulle:last-child')));
    await page.locator('[data-ia-appliquer]').last().click();
    await attendreAssistant();
    ok('Connecteur Claude : C2 reste ouverte (0 / 3)', /0 \/ 3 remplies/.test(await texte('main')));
    // Erreur réseau : retour possible au moteur local.
    await page.unroute('https://api.anthropic.com/**');
    await page.route('https://api.anthropic.com/**', (route) => route.fulfill({ status: 401, contentType: 'application/json', body: JSON.stringify({ type: 'error', error: { type: 'authentication_error', message: 'invalid x-api-key' } }) }));
    await envoyer('Où en est le projet ?');
    ok('Connecteur Claude : clé refusée → message clair et repli sur le moteur local', /401/.test(await dernierMessage()) && (await page.locator('[data-ia-local]').count()) >= 1);
    await page.locator('[data-ia-local]').last().click();
    await page.waitForTimeout(200);
    ok('Connecteur Claude : le moteur local répond à la place', /22 octobre 2026/.test(await dernierMessage()));
    await page.unroute('https://api.anthropic.com/**');
    await page.click('#assistant-reglages');
    await page.click('[data-ia-reglages="oublier"]');
    ok('Connecteur Claude : « Oublier la clé » revient au moteur local', /Moteur local/.test(await texte('#assistant-moteur')) && !(await page.evaluate(() => sessionStorage.getItem('nova360.claude.cle'))));
    await page.click('#assistant-reglages');
  }
  if (captures) await page.screenshot({ path: path.join(dossierCaptures, 'assistant.png') });
  await page.keyboard.press('Escape');
  await page.click('#assistant-champ').catch(() => {});
  await page.keyboard.press('Escape');
  await page.waitForTimeout(600);
  ok('Assistant : Échap ferme le panneau, la page reprend toute la largeur', (await page.locator('body.assistant-ouvert').count()) === 0);

  // ===================================================================
  // Deux versions : écran de choix, démo, dossier vierge
  // ===================================================================
  await page.evaluate(() => { localStorage.clear(); sessionStorage.clear(); sessionStorage.setItem('tester-choix', '1'); sessionStorage.setItem('tester-guide', '1'); location.hash = ''; });
  await page.reload();
  await page.waitForSelector('#choix-mode[open]', { timeout: 5000 });
  // Étape 1 : la vidéo de présentation (paysage sur ordinateur, portrait sur téléphone), puis le choix.
  const etatAccueil = () => page.evaluate(() => {
    const d = document.getElementById('choix-mode'), v = document.getElementById('intro-video'), r = d.getBoundingClientRect();
    return { etape: d.dataset.etape, format: d.dataset.format, src: v.getAttribute('src') || '', t: v.currentTime, enPause: v.paused, muet: v.muted,
      activerSon: getComputedStyle(document.getElementById('intro-activer-son')).display !== 'none', choixCache: document.getElementById('choix-cadre').hidden,
      revoir: !document.getElementById('choix-revoir').hidden, ouvert: d.open, defile: d.scrollHeight > d.clientHeight + 1,
      dedans: r.top >= 0 && r.left >= 0 && r.bottom <= innerHeight + 0.5 && r.right <= innerWidth + 0.5 };
  });
  let a = await etatAccueil();
  ok('Accueil : le pop-up s\'ouvre sur la vidéo de présentation, en paysage sur ordinateur (le choix vient après)', a.etape === 'video' && a.format === 'paysage' && /16x9/.test(a.src) && a.choixCache, `${a.etape} · ${a.format} · ${a.src}`);
  await page.waitForFunction(() => document.getElementById('intro-video').currentTime > 0.5, null, { timeout: 20000 }).catch(() => {});
  a = await etatAccueil();
  ok('Accueil : la vidéo démarre seule, avec le son ou muette avec un grand bouton « Activer le son »', a.t > 0.5 && !a.enPause && (!a.muet || a.activerSon), `${a.t.toFixed(1)} s, ${a.muet ? 'muette' : 'avec le son'}`);
  if (captures) await page.screenshot({ path: path.join(dossierCaptures, 'accueil_video.png') });
  {
    const defauts = [];
    for (const [w, h, f] of [[1920, 1080, 'paysage'], [1366, 768, 'paysage'], [390, 844, 'portrait'], [360, 640, 'portrait']]) {
      await page.setViewportSize({ width: w, height: h });
      await page.waitForTimeout(400);
      a = await etatAccueil();
      if (a.format !== f || !(f === 'portrait' ? /9x16/ : /16x9/).test(a.src)) defauts.push(`${w}×${h} : ${a.format}`);
      if (a.defile || !a.dedans) defauts.push(`${w}×${h} : déborde`);
      if (captures && w === 390) await page.screenshot({ path: path.join(dossierCaptures, 'accueil_video_mobile.png') });
    }
    await page.setViewportSize({ width: 1366, height: 900 });
    await page.waitForTimeout(400);
    ok(`Accueil : vidéo en portrait sur téléphone, en paysage sur ordinateur, sans défilement (4 tailles)${defauts.length ? ' : ' + defauts.join(', ') : ''}`, defauts.length === 0);
  }
  await page.waitForFunction(() => document.getElementById('intro-video').readyState >= 1, null, { timeout: 20000 }).catch(() => {});
  await page.evaluate(() => { const v = document.getElementById('intro-video'); v.currentTime = Math.max(0, v.duration - 0.5); v.play().catch(() => {}); });
  await page.waitForFunction(() => document.getElementById('choix-mode').dataset.etape === 'choix', null, { timeout: 10000 }).catch(() => {});
  a = await etatAccueil();
  ok('Accueil : à la fin de la vidéo, le choix démo / dossier vierge apparaît (avec « Revoir la vidéo »)', a.etape === 'choix' && a.ouvert && !a.choixCache && a.revoir && (await page.locator('#choix-mode [data-choisir-mode]:visible').count()) === 2);
  await page.click('#choix-revoir');
  const revue = await etatAccueil();
  await page.click('#intro-passer');
  a = await etatAccueil();
  ok('Accueil : « Revoir la vidéo » la relance, « Passer la vidéo » mène au choix', revue.etape === 'video' && a.etape === 'choix' && a.enPause && a.ouvert);
  await page.click('#choix-revoir');
  await page.keyboard.press('Escape');
  a = await etatAccueil();
  ok('Accueil : Échap pendant la vidéo passe au choix, sans fermer l\'écran d\'accueil', a.etape === 'choix' && a.ouvert);
  await page.click('#choix-revoir');
  await page.evaluate(() => document.getElementById('intro-video').dispatchEvent(new Event('error')));
  a = await etatAccueil();
  ok('Accueil : vidéo illisible ou absente → le choix s\'affiche directement, sans bouton « Revoir »', a.etape === 'choix' && a.ouvert && !a.revoir);
  ok('Versions : l\'écran de choix propose la démo ou un dossier vierge', (await page.locator('#choix-mode [data-choisir-mode]:visible').count()) === 2);
  {
    const defauts = [];
    for (const [w, h] of [[1920, 1080], [1366, 768], [390, 844], [360, 640]]) {
      await page.setViewportSize({ width: w, height: h });
      await page.waitForTimeout(300);
      a = await etatAccueil();
      if (a.defile || !a.dedans) defauts.push(`${w}×${h}`);
    }
    await page.setViewportSize({ width: 1366, height: 900 });
    ok(`Versions : l'écran de choix tient sans défilement (4 tailles)${defauts.length ? ' : déborde en ' + defauts.join(', ') : ''}`, defauts.length === 0);
  }
  if (captures) await page.screenshot({ path: path.join(dossierCaptures, 'choix_version.png') });
  await Promise.all([page.waitForEvent('load'), page.click('[data-choisir-mode="vierge"]')]);
  await page.waitForSelector('main#contenu > *');
  ok('Versions : dossier vierge choisi (mémorisé, rechargé)', (await page.evaluate(() => window.NOVA_APP.MODE)) === 'vierge' && (await page.evaluate(() => localStorage.getItem('nova360.mode'))) === 'vierge');
  await page.waitForSelector('#guide[open]', { timeout: 5000 });
  ok('Versions : le dossier vierge a son propre guide (4 pièges du démarrage)', /dirigeant qui lance un projet/.test(await texte('#guide')) && (await page.locator('#guide .guide-pieges li').count()) === 4);
  await page.click('#guide [data-guide="fermer"]');
  await page.evaluate(() => localStorage.setItem('nova360.guide.vu', '1')); // le guide de la démo est testé plus haut
  const vueVide = await texte('main');
  ok('Dossier vierge : aucune donnée de la démo, états vides avec une prochaine étape', /Date à définir/.test(vueVide) && !/22 octobre/.test(vueVide) && !/Nicolas Perron/.test(vueVide) && (await page.locator('main [data-ouvrir-assistant]').count()) >= 2);
  const espacesVides = [];
  for (const [o, sel] of [['questions', '.appel-assistant'], ['historique', '.etat-vide'], ['actions', '.etat-vide'], ['documents', '#d-recherche']]) {
    await page.click(`[data-onglet="${o}"]`);
    if (!(await page.locator(`main ${sel}`).count()) || (await page.locator('main h2:has-text("En construction")').count())) espacesVides.push(o);
  }
  await page.click('[data-sous-onglet="documents:liste"]');
  if (!(await page.locator('main .etat-vide').count())) espacesVides.push('documents (liste)');
  ok('Dossier vierge : les cinq espaces s\'affichent, chacun avec une prochaine étape claire', espacesVides.length === 0, espacesVides.join(', '));
  await page.click('[data-onglet="vue"]');
  await page.click('#form-question button[type=submit]');
  await page.waitForTimeout(500);
  ok('Dossier vierge : l\'assistant propose des essais adaptés (4)', (await page.locator('[data-ia-exemple]').count()) === 4 && /dossier est vierge/.test(await texte('#assistant-fil')));
  const appliquerDernier = async () => { await page.locator('[data-ia-appliquer]').last().click(); await attendreAssistant(); };
  await envoyer(null, 0); await appliquerDernier();
  await envoyer(null, 1);
  ok('Dossier vierge : une date sans autorité → l\'assistant demande qui l\'a approuvée', /Qui a approuvé/.test(await dernierMessage()));
  await page.locator('[data-ia-repondre]').filter({ hasText: 'comité' }).click();
  await attendreAssistant();
  await appliquerDernier();
  await envoyer(null, 2); await appliquerDernier();
  await envoyer(null, 3); await appliquerDernier();
  const vueRemplie = await texte('main');
  ok('Dossier vierge : l\'assistant remplit tout (nom, responsable, date approuvée, condition, action)', /Atlas/.test(await texte('.entete')) && /Marie Dupont/.test(vueRemplie) && /15 novembre 2026/.test(vueRemplie) && /0 \/ 1 remplies/.test(vueRemplie) && (await page.evaluate(() => window.NOVA_APP.etat.actualise.actions.length)) === 1);
  ok('Dossier vierge : chaque fait garde sa source (message d\'origine consultable)', (await page.evaluate(() => Object.values(window.NOVA_APP.SOURCES).filter((s) => /^NS-/.test(s.id)).length)) === 4);
  await page.click('[data-onglet="questions"]');
  await envoyer('Qui pilote le projet ?');
  ok('Dossier vierge : l\'assistant répond à partir de ce qu\'on lui a confié', /Marie Dupont/.test(await dernierMessage()) && /1 octobre 2026|1er octobre/.test(await dernierMessage()));
  await page.click('#assistant-fermer');
  await page.evaluate(() => { location.hash = '#vue'; });
  await page.reload();
  await page.waitForSelector('main#contenu > *');
  ok('Dossier vierge : persistance après rechargement', /Atlas/.test(await texte('.entete')) && /15 novembre 2026/.test(await texte('main')));
  // Retour à la démo : les deux dossiers ne se mélangent pas.
  await page.click('#bouton-mode');
  ok('Versions : le menu propose démo, dossier vierge, écran d\'accueil et effacement', (await page.locator('#menu-mode .menu-mode-item').count()) === 4);
  if (captures) await page.screenshot({ path: path.join(dossierCaptures, 'menu_versions.png') });
  await Promise.all([page.waitForEvent('load'), page.click('[data-version-action="demo"]')]);
  await page.waitForSelector('main#contenu > *');
  const vueDemo = await texte('main');
  ok('Versions : retour à la démo intacte (22 octobre, 0 / 3), sans les données du dossier vierge', /22 octobre 2026/.test(vueDemo) && /0 \/ 3 remplies/.test(vueDemo) && !/Atlas/.test(await texte('.entete')));
  await page.click('#bouton-mode');
  await Promise.all([page.waitForEvent('load'), page.click('[data-version-action="vierge"]')]);
  await page.waitForSelector('main#contenu > *');
  page.once('dialog', (d) => d.accept());
  await page.click('#bouton-mode');
  await Promise.all([page.waitForEvent('load'), page.click('[data-version-action="effacer-vierge"]')]);
  await page.waitForSelector('main#contenu > *');
  ok('Versions : « Effacer le dossier vierge » repart de zéro', /Date à définir/.test(await texte('main')) && !/Atlas/.test(await texte('.entete')));
  {
    const defauts = [];
    for (const [w, h] of [[1920, 1080], [1366, 768], [390, 844], [360, 640]]) {
      await page.setViewportSize({ width: w, height: h });
      await page.evaluate(() => window.NOVA_GUIDE.ouvrir(0));
      for (let i = 0; i < 6; i++) {
        await page.waitForTimeout(60);
        const m = await page.evaluate(() => { const d = document.getElementById('guide'); return { sh: d.scrollHeight, ch: d.clientHeight, t: parseFloat(d.style.fontSize) }; });
        if (m.sh > m.ch + 1) defauts.push(`${w}×${h} écran ${i + 1}`);
        if (m.t < 13) defauts.push(`${w}×${h} écran ${i + 1} : ${m.t} px`);
        if (i < 5) await page.keyboard.press('ArrowRight');
      }
      await page.evaluate(() => window.NOVA_GUIDE.fermer());
    }
    ok(`Dossier vierge : guide sans défilement, 6 écrans × 4 tailles${defauts.length ? ' : ' + defauts.slice(0, 3).join(', ') : ''}`, defauts.length === 0);
    await page.setViewportSize({ width: 1366, height: 900 });
  }

  // Nettoyage du stockage local.
  await page.evaluate(() => { localStorage.clear(); sessionStorage.clear(); });
}
