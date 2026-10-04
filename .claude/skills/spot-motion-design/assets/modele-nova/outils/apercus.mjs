#!/usr/bin/env node
// Images fixes de contrôle (une par moment clé), rendues depuis le bundle : node outils/apercus.mjs <composition> <fichier-instants>
import fs from 'node:fs';
import path from 'node:path';
import { renderStill, selectComposition, openBrowser } from '@remotion/renderer';

const [composition = 'NovaSpot16x9', fichier] = process.argv.slice(2);
const serveUrl = path.resolve('build');
const SHELL = '/opt/pw-browsers/chromium_headless_shell-1194/chrome-linux/headless_shell';
const browserExecutable = fs.existsSync(SHELL) ? SHELL : null;
const instants = fs.readFileSync(fichier, 'utf8').trim().split('\n').map((l) => l.trim().split(/\s+/)).map(([nom, f]) => ({ nom, frame: +f }));
const navigateur = await openBrowser('chrome', { browserExecutable });
const comp = await selectComposition({ serveUrl, id: composition, puppeteerInstance: navigateur, browserExecutable });
const dossier = path.resolve('out', 'apercu', composition);
fs.mkdirSync(dossier, { recursive: true });
for (const { nom, frame } of instants) {
  await renderStill({ composition: comp, serveUrl, output: path.join(dossier, nom + '.png'), frame, puppeteerInstance: navigateur, browserExecutable, imageFormat: 'png', scale: 0.5 });
  process.stdout.write(nom + ' ');
}
await navigateur.close({ silent: true });
console.log('\n✓', instants.length, 'images dans', path.relative(process.cwd(), dossier));
