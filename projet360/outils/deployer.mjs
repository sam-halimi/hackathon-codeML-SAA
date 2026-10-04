#!/usr/bin/env node
// Héberge le rendu autonome sur Vercel (API REST, aucune dépendance).
// Le jeton n'est jamais enregistré : il est lu dans la variable VERCEL_TOKEN.
//
// Usage (depuis projet360/) :
//   VERCEL_TOKEN=xxxx node outils/deployer.mjs            (macOS / Linux)
//   $env:VERCEL_TOKEN="xxxx"; node outils/deployer.mjs   (Windows PowerShell)
// Option : VERCEL_PROJET=nom-du-projet (par défaut : nova-projet360)

import fs from 'node:fs';
import path from 'node:path';
import crypto from 'node:crypto';
import { execFileSync } from 'node:child_process';
import { RACINE } from './lib/charger.mjs';

const JETON = process.env.VERCEL_TOKEN;
const PROJET = process.env.VERCEL_PROJET || 'nova-projet360';
const API = 'https://api.vercel.com';
if (!JETON) { console.error('✗ Variable VERCEL_TOKEN absente. Voir l\'en-tête de ce fichier.'); process.exit(1); }

async function appel(methode, chemin, corps, entetes) {
  const rep = await fetch(API + chemin, {
    method: methode,
    headers: Object.assign({ Authorization: `Bearer ${JETON}` }, corps && !Buffer.isBuffer(corps) ? { 'Content-Type': 'application/json' } : {}, entetes || {}),
    body: corps ? (Buffer.isBuffer(corps) ? corps : JSON.stringify(corps)) : undefined,
  });
  const texte = await rep.text();
  let json = {};
  try { json = texte ? JSON.parse(texte) : {}; } catch { json = { brut: texte }; }
  if (!rep.ok) throw new Error(`${methode} ${chemin.split('?')[0]} → ${rep.status} : ${json.error?.message || texte.slice(0, 200)}`);
  return json;
}

try {
  console.log('1/4  Construction du rendu à jour…');
  execFileSync(process.execPath, [path.join(RACINE, 'outils', 'construire.mjs')], { stdio: 'inherit' });

  // Fichiers publiés : la page, le brief PDF s'il existe, et la configuration
  // (pas d'indexation par les moteurs de recherche).
  const fichiers = [
    { chemin: 'index.html', contenu: fs.readFileSync(path.join(RACINE, 'dist', 'NOVA_Projet360.html')) },
    { chemin: 'vercel.json', contenu: Buffer.from(JSON.stringify({ headers: [{ source: '/(.*)', headers: [{ key: 'X-Robots-Tag', value: 'noindex, nofollow' }] }] }, null, 2)) },
  ];
  const brief = path.join(RACINE, 'dist', 'NOVA_brief_de_reprise.pdf');
  if (fs.existsSync(brief)) fichiers.push({ chemin: 'NOVA_brief_de_reprise.pdf', contenu: fs.readFileSync(brief) });

  const { user } = await appel('GET', '/v2/user');
  const equipe = user.defaultTeamId ? `teamId=${user.defaultTeamId}` : '';
  console.log(`2/4  Envoi de ${fichiers.length} fichier(s) au compte ${user.username}…`);
  for (const f of fichiers) {
    f.sha = crypto.createHash('sha1').update(f.contenu).digest('hex');
    await appel('POST', `/v2/files?${equipe}`, f.contenu, { 'Content-Type': 'application/octet-stream', 'x-vercel-digest': f.sha, 'Content-Length': String(f.contenu.length) });
  }

  console.log('3/4  Création du déploiement de production…');
  let dep = await appel('POST', `/v13/deployments?${equipe}&skipAutoDetectionConfirmation=1`, {
    name: PROJET,
    target: 'production',
    files: fichiers.map((f) => ({ file: f.chemin, sha: f.sha, size: f.contenu.length })),
    projectSettings: { framework: null, buildCommand: null, installCommand: null, outputDirectory: null, devCommand: null },
  });

  process.stdout.write('4/4  Attente de la mise en ligne');
  for (let i = 0; i < 60 && !['READY', 'ERROR', 'CANCELED'].includes(dep.readyState); i++) {
    await new Promise((r) => setTimeout(r, 2000));
    process.stdout.write('.');
    dep = await appel('GET', `/v13/deployments/${dep.id}?${equipe}`);
  }
  console.log('');
  if (dep.readyState !== 'READY') throw new Error(`déploiement ${dep.readyState || 'inachevé'} (${dep.id})`);

  const adresses = [...new Set([...(dep.alias || []), dep.url])].filter(Boolean).map((a) => 'https://' + a);
  console.log('\n✓ En ligne :');
  adresses.forEach((a) => console.log('  ' + a));
  console.log('\n  La première adresse est l\'adresse de production, à donner au jury.');
} catch (e) {
  console.error('\n✗ ' + e.message);
  process.exit(1);
}
