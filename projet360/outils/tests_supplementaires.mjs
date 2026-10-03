// Tests des espaces 1, 3, 4 et 5 (appelé par tester_navigateur.mjs).
import fs from 'node:fs';
import path from 'node:path';

export default async function ({ page, ok, RACINE, captures, dossierCaptures }) {
  const texte = async (sel) => (await page.textContent(sel)) || '';

  // ---------- Vue d'ensemble ----------
  await page.click('[data-onglet="vue"]');
  const vue = await texte('main');
  ok('Vue : date approuvée 22 octobre 2026', /22 octobre 2026/.test(vue));
  ok('Vue : 0 / 3 conditions remplies', /0 \/ 3 remplies/.test(vue));
  ok('Vue : montant autorisé 204 000 $', /204 000 \$/.test(vue));
  ok('Vue : responsable Nicolas Perron depuis le 16 septembre', /Nicolas Perron/.test(vue) && /16 septembre 2026/.test(vue));
  ok('Vue : compte à rebours depuis la date de situation (J−22)', /J−22/.test(vue));

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

  // ---------- Historique ----------
  await page.click('[data-onglet="historique"]');
  ok('Historique : 8 contradictions expliquées', (await page.locator('#h-contradictions ~ section.carte').count()) === 8);
  ok('Historique : chronologie complète', (await page.locator('ol.chrono > li').count()) >= 40);
  await page.click('[data-filtre-sujet="securite"]');
  const nbSecu = await page.locator('ol.chrono > li').count();
  ok('Historique : filtre par sujet (Sécurité)', nbSecu > 0 && nbSecu < 15, `${nbSecu} événements`);
  await page.click('[data-filtre-sujet="securite"]');
  ok('Historique : cycles proposition → décision → validation', (await page.locator('.cycle').count()) >= 8);

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
  ok('Documents : 64 sources listées', /Tous les documents \(64\)/.test(await texte('#d-liste')));

  // ---------- Exemple fictif ----------
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

  // ---------- Formulaire : garde-fous ----------
  await page.click('[data-onglet="documents"]');
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
  ok('Décision de date : la version initiale garde le 22 octobre', /22 octobre 2026/.test(await texte('main .grille')));
  await page.click('[data-version="actualisee"]');

  if (captures) {
    await page.click('[data-onglet="vue"]');
    await page.screenshot({ path: path.join(dossierCaptures, 'vue_apres_maj.png'), fullPage: false });
  }
  // Nettoyage du stockage local.
  await page.evaluate(() => localStorage.clear());
}
