#!/usr/bin/env node
// Héberge le rendu autonome sur Vercel (API REST, aucune dépendance).
// Le jeton n'est jamais enregistré : il est lu dans la variable VERCEL_TOKEN.
//
// Usage (depuis projet360/) :
//   VERCEL_TOKEN=xxxx node outils/deployer.mjs            (macOS / Linux)
//   $env:VERCEL_TOKEN="xxxx"; node outils/deployer.mjs   (Windows PowerShell)
// Options : VERCEL_PROJET=nom-du-projet (par défaut : nova-projet360) ;
//           VERCEL_SANS_MASTERS=1 pour ne publier que les copies web du spot, sans les masters.

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

// Page de lecture du spot : sobre, aux couleurs de NOVA, sans dépendance.
// masters : { nom de la vidéo → poids en Mo } des versions pleine qualité publiées dans video/master/.
function pageVideo(videos, masters = {}) {
  const master = (n) => (masters[n] ? ` · <a href="master/${n}" download>Master pleine qualité (${masters[n]} Mo)</a>` : '');
  const lecteur = (n) => `<figure class="${n.includes('9x16') ? 'v' : 'h'}"><video src="${n}" controls playsinline preload="metadata"></video>
    <figcaption>${n.includes('9x16') ? 'Format vertical 9:16' : 'Format 16:9'} · <a href="${n}" download>Télécharger</a>${master(n)}</figcaption></figure>`;
  return `<!doctype html><html lang="fr"><head><meta charset="utf-8"><meta name="viewport" content="width=device-width, initial-scale=1">
<title>NOVA · Spot</title><meta name="robots" content="noindex">
<style>
:root{--fond:#16132F;--encre:#F6F3EC;--doux:#A9A4D0;--accent:#8B7CFF}
*{box-sizing:border-box}body{margin:0;background:var(--fond);color:var(--encre);font:17px/1.6 system-ui,-apple-system,"Segoe UI",sans-serif}
main{max-width:1180px;margin:0 auto;padding:40px 16px 64px}
h1{font:600 clamp(30px,5vw,48px)/1.1 Georgia,serif;margin:0 0 8px;letter-spacing:-.02em}
p{color:var(--doux);margin:0 0 28px;max-width:62ch}
.grille{display:grid;grid-template-columns:minmax(0,3fr) minmax(0,1fr);gap:24px;align-items:start}
figure{margin:0}video{width:100%;border-radius:18px;background:#000;box-shadow:0 30px 70px -30px #000}
figcaption{font-size:14px;color:var(--doux);margin-top:8px}a{color:var(--accent)}
@media (max-width:760px){.grille{grid-template-columns:1fr}.v{max-width:360px}}
</style></head><body><main>
<h1>NOVA · Reprenez n'importe quel projet en cinq minutes.</h1>
<p>Spot de présentation du défi Projet 360 : la douleur, puis NOVA, ses vraies interfaces et son assistant. Musique et bruitages originaux, voix ElevenLabs. <a href="/">Ouvrir l'application</a></p>
<div class="grille">${videos.map(lecteur).join('')}</div>
</main></body></html>`;
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
  // Spot vidéo (facultatif) : copies web produites par video/outils/finaliser.mjs, lues sur /video/.
  const dossierVideo = path.resolve(RACINE, '..', 'video', 'out', 'web');
  const videos = ['NOVA_spot_16x9.mp4', 'NOVA_spot_9x16.mp4'].filter((n) => fs.existsSync(path.join(dossierVideo, n)));
  for (const n of videos) fichiers.push({ chemin: 'video/' + n, contenu: fs.readFileSync(path.join(dossierVideo, n)) });
  // Masters pleine qualité (facultatifs, video/out/) : proposés en téléchargement sur /video/.
  // VERCEL_SANS_MASTERS=1 les laisse de côté (déploiement plus léger).
  const masters = {};
  if (!process.env.VERCEL_SANS_MASTERS) {
    for (const n of videos) {
      const src = path.resolve(dossierVideo, '..', n);
      if (!fs.existsSync(src)) continue;
      const contenu = fs.readFileSync(src);
      fichiers.push({ chemin: 'video/master/' + n, contenu });
      masters[n] = Math.round(contenu.length / 1048576);
    }
  }
  if (videos.length) fichiers.push({ chemin: 'video/index.html', contenu: Buffer.from(pageVideo(videos, masters)) });

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
