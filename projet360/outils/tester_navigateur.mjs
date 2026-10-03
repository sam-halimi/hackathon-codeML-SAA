#!/usr/bin/env node
// Test automatique du rendu autonome dans un vrai navigateur (Chromium), HORS CONNEXION.
// Facultatif : nécessite Playwright (npm install -g playwright).
//
// Usage : node outils/tester_navigateur.mjs [--captures]

import fs from 'node:fs';
import path from 'node:path';
import { execSync } from 'node:child_process';
import { createRequire } from 'node:module';
import { RACINE } from './lib/charger.mjs';

const require = createRequire(import.meta.url);
function chargerPlaywright() {
  try { return require('playwright'); } catch { /* essai global */ }
  try { return require(path.join(execSync('npm root -g').toString().trim(), 'playwright')); } catch { return null; }
}
const pw = chargerPlaywright();
if (!pw) { console.log('Playwright absent : test navigateur ignoré (npm install -g playwright).'); process.exit(0); }

const fichier = path.join(RACINE, 'dist', 'NOVA_Projet360.html');
if (!fs.existsSync(fichier)) { console.error('Construisez d\'abord : node outils/construire.mjs'); process.exit(1); }
const captures = process.argv.includes('--captures');
const dossierCaptures = path.join(RACINE, 'dist', 'captures');
if (captures) fs.mkdirSync(dossierCaptures, { recursive: true });

const resultats = [];
const ok = (nom, cond, detail) => { resultats.push({ nom, ok: !!cond, detail }); console.log(`${cond ? '  ✓' : '  ✗'} ${nom}${detail ? ' — ' + detail : ''}`); };

const options = {};
if (fs.existsSync('/opt/pw-browsers/chromium')) {
  const exe = fs.readdirSync('/opt/pw-browsers').filter((d) => d.startsWith('chromium-')).map((d) => path.join('/opt/pw-browsers', d, 'chrome-linux', 'chrome')).find((p) => fs.existsSync(p));
  if (exe) options.executablePath = exe;
}
const navigateur = await pw.chromium.launch(options);
const contexte = await navigateur.newContext({ viewport: { width: 1366, height: 900 }, locale: 'fr-CA', timezoneId: 'Europe/Paris' });
await contexte.setOffline(true);
const requetesReseau = [];
await contexte.route('**/*', (route) => {
  const url = route.request().url();
  if (url.startsWith('file:') || url.startsWith('data:') || url.startsWith('blob:')) return route.continue();
  requetesReseau.push(url);
  return route.abort();
});
const page = await contexte.newPage();
const erreursJs = [];
page.on('pageerror', (e) => erreursJs.push(e.message));
page.on('console', (m) => { if (m.type() === 'error') erreursJs.push(m.text()); });

console.log('\nTEST NAVIGATEUR — hors connexion, fuseau Europe/Paris (pour vérifier que la date de situation ne dépend pas de l\'ordinateur)\n');
await page.goto('file://' + fichier);
await page.waitForSelector('main#contenu > *');

ok('La page s\'ouvre hors connexion', true);
const situation = await page.textContent('#situation');
ok('Date de situation fixe (30 septembre 2026, 09 h 00)', /30 septembre 2026, 09 h 00/.test(situation), situation.trim());

// --- Questions et preuves ---
await page.click('[data-onglet="questions"]');
for (let i = 1; i <= 10; i++) {
  const id = 'Q' + String(i).padStart(2, '0');
  const carte = page.locator(`#question-${id}`);
  const n = await carte.count();
  if (!n) { ok(`${id} affichée`, false); continue; }
  await carte.locator('details:has(.liste-preuves) > summary').click();
  const boutons = carte.locator('button.preuve');
  const nb = await boutons.count();
  let reussis = 0;
  const echecs = [];
  for (let k = 0; k < nb; k++) {
    await boutons.nth(k).click();
    await page.waitForSelector('#visionneuse[open]');
    const cible = await page.locator('#visionneuse-corps mark, #visionneuse-corps td.cible, #visionneuse-corps .zone-surlignee').count();
    const erreur = await page.locator('#visionneuse-corps .erreur').count();
    if (cible > 0 && erreur === 0) reussis++;
    else echecs.push(await page.textContent('#visionneuse-sur'));
    if (captures && k === 0) await page.screenshot({ path: path.join(dossierCaptures, `preuve_${id}.png`) });
    await page.click('#visionneuse-fermer');
  }
  ok(`${id} : ${nb} preuves ouvertes au bon endroit`, reussis === nb && nb > 0, echecs.length ? 'échecs : ' + echecs.join(' | ') : `${reussis}/${nb}`);
}

// Types de preuves : passage, page PDF, cellules, zone d'image.
async function ouvrirSource(type, selecteur) {
  const b = page.locator(`button.preuve:has-text("${type}")`).first();
  await b.click();
  await page.waitForSelector('#visionneuse[open]');
  const n = await page.locator(selecteur).count();
  await page.click('#visionneuse-fermer');
  return n;
}
ok('Preuve PDF : page rendue + passage surligné', (await ouvrirSource('INV-003', '#visionneuse-corps .pdf-page img, #visionneuse-corps mark')) >= 2);
ok('Preuve Excel : cellules surlignées', (await ouvrirSource('PLAN-V3', '#visionneuse-corps td.cible')) >= 1);
ok('Preuve capture : zone encadrée', (await ouvrirSource('OPS-601-CAP', '#visionneuse-corps .zone-surlignee')) === 1);

// Copie non comptée deux fois (pièce jointe identique).
await page.locator('button.preuve:has-text("E07")').first().click();
await page.waitForSelector('#visionneuse[open]');
const txtPj = await page.textContent('#visionneuse-corps');
ok('Pièce jointe identique signalée (E07 = INV-003)', /Fichier identique/.test(txtPj) && /INV-003/.test(txtPj));
await page.click('#visionneuse-fermer');

// Recherche en langage naturel.
await page.fill('#champ-question', 'Qui a approuvé le report de la date ?');
await page.click('#form-question button[type=submit]');
await page.waitForSelector('#titre-resultats');
const meilleure = await page.textContent('#titre-resultats + p');
ok('Question libre → réponse Q03', /Q03/.test(meilleure), meilleure.trim().slice(0, 90));
await page.fill('#champ-question', 'rollback runbook');
await page.click('#form-question button[type=submit]');
await page.waitForSelector('#titre-resultats');
ok('Question libre → réponse Q10', /Q10/.test(await page.textContent('#titre-resultats + p')));

if (captures) await page.screenshot({ path: path.join(dossierCaptures, 'questions.png'), fullPage: false });

// Espaces supplémentaires (s'ils existent).
const onglets = ['vue', 'historique', 'actions', 'documents'];
for (const o of onglets) {
  await page.click(`[data-onglet="${o}"]`);
  const enConstruction = await page.locator('main h2:has-text("En construction")').count();
  ok(`Espace « ${o} » affiché`, enConstruction === 0, enConstruction ? 'en construction' : '');
  if (captures && !enConstruction) await page.screenshot({ path: path.join(dossierCaptures, `espace_${o}.png`), fullPage: true });
}

if (globalThis.TESTS_SUPPLEMENTAIRES) await globalThis.TESTS_SUPPLEMENTAIRES(page, ok);
const supp = path.join(RACINE, 'outils', 'tests_supplementaires.mjs');
if (fs.existsSync(supp)) {
  const mod = await import('file://' + supp);
  await mod.default({ page, contexte, ok, RACINE, captures, dossierCaptures });
}

ok('Aucune erreur JavaScript', erreursJs.length === 0, erreursJs.slice(0, 3).join(' | '));
ok('Aucune requête réseau externe', requetesReseau.length === 0, requetesReseau.slice(0, 3).join(' | '));

await navigateur.close();
const echecs = resultats.filter((r) => !r.ok);
console.log(`\n${echecs.length ? '✗' : '✓'} ${resultats.length - echecs.length}/${resultats.length} vérifications réussies.`);
process.exit(echecs.length ? 1 : 0);
