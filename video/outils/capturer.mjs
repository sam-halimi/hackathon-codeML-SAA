#!/usr/bin/env node
// Captures haute définition de l'application réelle (version démo), pour la vidéo.
// Prérequis : projet360/dist/NOVA_Projet360.html construit (node projet360/outils/construire.mjs) et Playwright.
// Usage (depuis video/) : node outils/capturer.mjs
// Sortie : public/captures/*.png (non versionnées : elles montrent des documents du corpus).
import fs from 'node:fs';
import path from 'node:path';
import { execSync } from 'node:child_process';
import { createRequire } from 'node:module';
import { fileURLToPath } from 'node:url';

const ICI = path.dirname(fileURLToPath(import.meta.url));
const RACINE = path.resolve(ICI, '..');
const APP = path.resolve(RACINE, '..', 'projet360', 'dist', 'NOVA_Projet360.html');
const SORTIE = path.join(RACINE, 'public', 'captures');
fs.mkdirSync(SORTIE, { recursive: true });
const require = createRequire(import.meta.url);
const pw = (() => { try { return require('playwright'); } catch { return require(path.join(execSync('npm root -g').toString().trim(), 'playwright')); } })();
const exe = fs.existsSync('/opt/pw-browsers') ? fs.readdirSync('/opt/pw-browsers').filter((d) => d.startsWith('chromium-')).map((d) => path.join('/opt/pw-browsers', d, 'chrome-linux', 'chrome')).find((p) => fs.existsSync(p)) : undefined;

const navigateur = await pw.chromium.launch(exe ? { executablePath: exe } : {});
const contexte = await navigateur.newContext({ viewport: { width: 1440, height: 900 }, deviceScaleFactor: 2, locale: 'fr-CA', timezoneId: 'America/Montreal' });
await contexte.addInitScript(() => { localStorage.setItem('nova360.mode', 'demo'); localStorage.setItem('nova360.guide.vu', '1'); localStorage.removeItem('nova360.evenements.v1'); });
const page = await contexte.newPage();
// Aucune animation pendant les captures : l'image est figée à son état final.
const sansAnimation = () => page.addStyleTag({ content: 'html{scroll-behavior:auto!important}.capture-element .entete{position:static!important}*,*::before,*::after{animation:none!important;transition:none!important;caret-color:transparent!important}' });
const pause = (ms) => page.waitForTimeout(ms);
const capture = async (nom, options) => { await pause(250); await page.screenshot(Object.assign({ path: path.join(SORTIE, nom + '.png') }, options || {})); console.log('  ✓', nom); };
const element = async (nom, sel) => {
  await page.evaluate(() => document.documentElement.classList.add('capture-element'));
  await pause(200);
  await page.locator(sel).first().screenshot({ path: path.join(SORTIE, nom + '.png') });
  await page.evaluate(() => document.documentElement.classList.remove('capture-element'));
  console.log('  ✓', nom, '(élément)');
};
// Positions des éléments clés dans chaque capture (en pixels de l'image, échelle 2) : la vidéo y place
// surlignages, curseur et zooms au bon endroit.
const BOITES = {};
async function boites(nomCapture, cles, origine) {
  const res = await page.evaluate(({ cles, origine }) => {
    const o = origine ? document.querySelector(origine).getBoundingClientRect() : { left: 0, top: 0 };
    const sortie = {};
    for (const [cle, sel, index] of cles) {
      const el = [...document.querySelectorAll(sel)][index || 0];
      if (!el) continue;
      const r = el.getBoundingClientRect();
      sortie[cle] = { x: (r.left - o.left) * 2, y: (r.top - o.top) * 2, w: r.width * 2, h: r.height * 2 };
    }
    return sortie;
  }, { cles, origine });
  BOITES[nomCapture] = Object.assign(BOITES[nomCapture] || {}, res);
}

await page.goto('file://' + APP);
await page.waitForSelector('main#contenu > *');
await sansAnimation();
await page.evaluate(() => document.fonts.ready);

// 1. Accueil : la réponse tient sur un écran.
await capture('accueil');
await boites('accueil', [['affiche', '.hero-date .affiche'], ['hero', '.hero-date'], ['c1', '.hero-date .cond', 0], ['c2', '.hero-date .cond', 1], ['c3', '.hero-date .cond', 2], ['kpi', '.grille-4'], ['kpi_conditions', '.grille-4 .carte', 1], ['jalon', '.hero-date .jalon'], ['entete', '.entete']]);
await boites('accueil_hero', [['affiche', '.hero-date .affiche'], ['c1', '.hero-date .cond', 0], ['c2', '.hero-date .cond', 1], ['c3', '.hero-date .cond', 2], ['jalon', '.hero-date .jalon']], '.hero-date');
await element('accueil_hero', '.hero-date');
await element('accueil_kpi', '.grille-4');
await capture('accueil_page', { fullPage: true });

// 2. Questions : Q08 et ses preuves, puis la preuve SEC-210 ouverte au passage.
await page.evaluate(() => { location.hash = '#questions/Q08'; });
await pause(500);
await sansAnimation();
await page.evaluate(() => { const r = document.getElementById('question-Q08').getBoundingClientRect(); window.scrollTo(0, window.scrollY + r.top - 175); });
await pause(300);
await capture('questions_q08');
await boites('questions_q08', [['carte', '#question-Q08'], ['preuve1', '#question-Q08 button.preuve', 0], ['reponse', '#question-Q08 .reponse-courte']]);
await element('carte_q08', '#question-Q08');
await page.locator('#question-Q08 button.preuve').first().click();
await page.waitForSelector('#visionneuse[open]');
await pause(400);
await capture('preuve_sec210');
await boites('preuve_sec210', [['fenetre', '#visionneuse'], ['repere', '#visionneuse-corps .repere'], ['passage', '#visionneuse-corps .doc-ligne.touchee', 0], ['passage_fin', '#visionneuse-corps .doc-ligne.touchee:last-of-type']]);
await page.evaluate(() => { const l = [...document.querySelectorAll('#visionneuse-corps .doc-ligne.touchee')]; window.__boitePassage = l; });
BOITES.preuve_sec210.lignes = await page.evaluate(() => { const l = [...document.querySelectorAll('#visionneuse-corps .doc-ligne.touchee')]; const a = l[0].getBoundingClientRect(), b = l[l.length - 1].getBoundingClientRect(); return { x: a.left * 2, y: a.top * 2, w: a.width * 2, h: (b.bottom - a.top) * 2 }; });
await element('preuve_sec210_fenetre', '#visionneuse');
await page.click('#visionneuse-fermer');

// 3. Historique : une contradiction tranchée.
await page.evaluate(() => { location.hash = '#historique/h-contradictions'; });
await pause(500);
await page.evaluate(() => window.scrollTo(0, 0));
await capture('historique_contradictions');
await boites('contradiction_k01', [['perime', 'section.carte.contradiction .perime', 0], ['valide', 'section.carte.contradiction .valide', 0]], 'section.carte.contradiction');
await element('contradiction_k01', 'section.carte.contradiction');

// 4. Actions : responsables et échéances.
await page.evaluate(() => { location.hash = '#actions'; });
await pause(500);
await capture('actions');
await boites('actions_tableau', [['tete', '.table-actions thead'], ['ligne1', '.table-actions tbody tr', 0], ['ligne2', '.table-actions tbody tr', 1], ['ligne3', '.table-actions tbody tr', 2], ['resp1', '.table-actions tbody tr td:nth-child(2)', 0], ['resp2', '.table-actions tbody tr td:nth-child(2)', 1], ['resp3', '.table-actions tbody tr td:nth-child(2)', 2], ['ech1', '.table-actions tbody tr td:nth-child(3)', 0]], '.table-actions');
await element('actions_tableau', '.table-actions');

// 5. Assistant : vue fractionnée, proposition de Boréal, aperçu, application.
await page.evaluate(() => { location.hash = '#vue'; });
await pause(400);
await page.click('#form-question button[type=submit]');
await pause(700);
await capture('assistant_accueil');
await boites('assistant_accueil', [['panneau', '#assistant'], ['saisie', '#assistant-form'], ['fil', '#assistant-fil']]);
await boites('assistant_panneau_accueil', [['saisie', '#assistant-form'], ['fil', '#assistant-fil'], ['essais', '#assistant-suggestions']], '#assistant');
await element('assistant_panneau_accueil', '#assistant');
await page.click('[data-ia-exemple="1"]');
await element('assistant_saisie_remplie', '#assistant-form');
await page.click('#assistant-form .bouton-envoyer');
await page.waitForFunction(() => !window.NOVA_ASSISTANT.conv.occupe);
await pause(500);
await capture('assistant_proposition');
await boites('assistant_proposition', [['panneau', '#assistant'], ['carte', '#assistant-fil .bulle:last-child .bulle-texte'], ['appliquer', '[data-ia-appliquer]'], ['liste', '#assistant-fil .bulle:last-child .carte-maj-liste'], ['passage', '#assistant-fil .bulle:last-child .carte-maj-passage'], ['inchange', '#assistant-fil .bulle:last-child .carte-maj-inchange'], ['affiche', '.hero-date .affiche']]);
await boites('assistant_panneau_proposition', [['carte', '#assistant-fil .bulle:last-child .bulle-texte'], ['appliquer', '[data-ia-appliquer]'], ['liste', '#assistant-fil .bulle:last-child .carte-maj-liste'], ['passage', '#assistant-fil .bulle:last-child .carte-maj-passage']], '#assistant');
await boites('carte_proposition', [['appliquer', '[data-ia-appliquer]'], ['liste', '#assistant-fil .bulle:last-child .carte-maj-liste'], ['passage', '#assistant-fil .bulle:last-child .carte-maj-passage'], ['inchange', '#assistant-fil .bulle:last-child .carte-maj-inchange']], '#assistant-fil .bulle:last-child');
await element('assistant_panneau_proposition', '#assistant');
await element('carte_proposition', '#assistant-fil .bulle:last-child');
await page.locator('[data-ia-appliquer]').last().click();
await page.waitForFunction(() => !window.NOVA_ASSISTANT.conv.occupe);
await pause(500);
await page.evaluate(() => window.scrollTo(0, 0));
await capture('assistant_applique');
await boites('assistant_applique', [['panneau', '#assistant'], ['affiche', '.hero-date .affiche'], ['proposition', '.hero-date .cond', 3], ['reponse', '#assistant-fil .bulle:last-child']]);
await boites('hero_apres_proposition', [['affiche', '.hero-date .affiche'], ['proposition', '.hero-date .cond', 3], ['c1', '.hero-date .cond', 0]], '.hero-date');
await element('assistant_panneau_applique', '#assistant');
await element('hero_apres_proposition', '.hero-date');
// Garde-fou : le fournisseur dit ACC-303 validé.
await page.click('[data-ia-exemple="2"]');
await page.click('#assistant-form .bouton-envoyer');
await page.waitForFunction(() => !window.NOVA_ASSISTANT.conv.occupe);
await pause(500);
await capture('assistant_gardefou');
await boites('assistant_panneau_gardefou', [['remarque', '#assistant-fil .bulle:nth-last-child(2) .bulle-texte'], ['carte', '#assistant-fil .bulle:last-child .bulle-texte'], ['liste', '#assistant-fil .bulle:last-child .carte-maj-liste']], '#assistant');
await element('assistant_panneau_gardefou', '#assistant');

// 6. Écran de choix (démo ou dossier vierge).
await page.evaluate(() => { localStorage.clear(); });
await contexte.clearCookies();
const page2 = await contexte.newPage();
await page2.addInitScript(() => { localStorage.clear(); });
await page2.goto('file://' + APP);
await page2.waitForSelector('#choix-mode[open]');
await page2.addStyleTag({ content: '*,*::before,*::after{animation:none!important;transition:none!important}' });
await page2.waitForTimeout(500);
await page2.locator('#choix-mode').screenshot({ path: path.join(SORTIE, 'choix_version.png') });
console.log('  ✓ choix_version (élément)');

await navigateur.close();
fs.writeFileSync(path.join(RACINE, 'src', 'nova', 'boites.json'), JSON.stringify(BOITES, null, 1));
console.log('  ✓ src/nova/boites.json (positions des éléments)');
console.log(`\n${fs.readdirSync(SORTIE).length} captures dans ${path.relative(process.cwd(), SORTIE) || SORTIE}`);
