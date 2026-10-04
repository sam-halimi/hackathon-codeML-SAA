#!/usr/bin/env node
// Finalisation du spot NOVA : assemble l'image (rendu Remotion, sans son) et le mixage masterisé,
// copie les pistes séparées, fabrique les planches contact et le README de livraison.
// Usage (depuis video/) : node outils/finaliser.mjs
import fs from 'node:fs';
import path from 'node:path';
import { execFileSync } from 'node:child_process';

const OUT = path.resolve('out');
const AUDIO = path.resolve('audio', 'rendu');
const M = JSON.parse(fs.readFileSync('src/nova/minutage.json', 'utf8'));
const mesures = JSON.parse(fs.readFileSync(path.join(AUDIO, 'mesures.json'), 'utf8'));
const ff = (args) => execFileSync('ffmpeg', ['-hide_banner', '-v', 'error', '-y', ...args], { stdio: 'inherit' });
const sonde = (f) => JSON.parse(execFileSync('ffprobe', ['-v', 'error', '-show_entries', 'format=duration,size:stream=codec_name,width,height,r_frame_rate,sample_rate,channels,bit_rate', '-of', 'json', f]).toString());

const formats = [
  { id: '16x9', image: 'NOVA_spot_16x9_image.mp4', final: 'NOVA_spot_16x9.mp4', largeur: 1920, hauteur: 1080 },
  { id: '9x16', image: 'NOVA_spot_9x16_image.mp4', final: 'NOVA_spot_9x16.mp4', largeur: 1080, hauteur: 1920 },
];
const resume = [];
for (const f of formats) {
  const src = path.join(OUT, f.image);
  if (!fs.existsSync(src)) { console.log(`  ⚠ ${f.image} absent : format ${f.id} ignoré`); continue; }
  const dest = path.join(OUT, f.final);
  // Image copiée telle quelle (H.264), son AAC 320 kb/s, lecture rapide sur le web (faststart).
  ff(['-i', src, '-i', path.join(AUDIO, 'mix_master.wav'), '-map', '0:v:0', '-map', '1:a:0', '-c:v', 'copy', '-c:a', 'aac', '-b:a', '320k', '-ar', '48000', '-shortest', '-movflags', '+faststart', dest]);
  // Planche contact : 24 images régulières, horodatées.
  const duree = parseFloat(sonde(dest).format.duration);
  const pas = duree / 24;
  const largeurVignette = f.id === '16x9' ? 480 : 270;
  ff(['-i', dest, '-vf', `fps=1/${pas.toFixed(4)},scale=${largeurVignette}:-1,drawtext=fontfile=/usr/share/fonts/truetype/dejavu/DejaVuSansMono.ttf:text='%{pts\\:hms}':x=8:y=8:fontsize=${f.id === '16x9' ? 18 : 14}:fontcolor=white:box=1:boxcolor=black@0.55:boxborderw=4,tile=${f.id === '16x9' ? '6x4' : '8x3'}:padding=8:margin=8:color=white`, '-frames:v', '1', path.join(OUT, `planche_contact_${f.id}.jpg`)]);
  const s = sonde(dest);
  const v = s.streams.find((x) => x.codec_name === 'h264');
  const a = s.streams.find((x) => x.codec_name === 'aac');
  resume.push({ format: f.id, fichier: f.final, duree: duree.toFixed(2), taille_mo: (parseInt(s.format.size, 10) / 1048576).toFixed(1), video: `${v.width}×${v.height}, ${v.r_frame_rate.split('/')[0]} i/s, H.264`, audio: `AAC ${Math.round(parseInt(a.bit_rate || '320000', 10) / 1000)} kb/s, ${a.sample_rate} Hz, stéréo` });
  console.log(`  ✓ ${f.final} (${duree.toFixed(2)} s) et planche_contact_${f.id}.jpg`);
}
// Pistes séparées (WAV 24 bits, 48 kHz).
fs.mkdirSync(path.join(OUT, 'pistes'), { recursive: true });
for (const p of ['voix', 'musique', 'bruitages', 'mix_master']) fs.copyFileSync(path.join(AUDIO, p + '.wav'), path.join(OUT, 'pistes', p + '.wav'));
console.log('  ✓ pistes/ (voix, musique, bruitages, mix_master)');

const lignes = resume.map((r) => `| ${r.format.replace('x', ':')} | \`${r.fichier}\` | ${r.duree} s | ${r.video} | ${r.audio} | ${r.taille_mo} Mo |`).join('\n');
const m = mesures.master;
fs.writeFileSync(path.join(OUT, 'README.md'), `# NOVA · Spot de présentation (livraison)

Spot en motion design : la douleur (mercredi 9 h, 64 documents qui se contredisent), puis NOVA (une réponse sur un écran, une preuve par phrase, des contradictions tranchées) et son assistant (il prépare la mise à jour, vérifie les règles, attend l'accord). Brief complet : \`video/brief/PROMPT.md\`.

## Fichiers

| Format | Fichier | Durée | Image | Son | Poids |
| --- | --- | --- | --- | --- | --- |
${lignes}

- \`planche_contact_16x9.jpg\`, \`planche_contact_9x16.jpg\` : 24 images régulières, horodatées.
- \`pistes/\` : \`voix.wav\`, \`musique.wav\`, \`bruitages.wav\` (pistes séparées, avant mastering) et \`mix_master.wav\` (WAV 24 bits, 48 kHz).

## Son

- Voix : ElevenLabs (multilingue), voix « Julian », via l'API Higgsfield ; prise 1 sur 2 retenue (« Qui croire ? » bien prononcé, respirations naturelles). Aucun compresseur ni limiteur sur la piste voix.
- Musique originale et bruitages : synthétisés par le code (\`video/audio/composer.py\`), aucun échantillon externe. La bibliothèque de bruitages prévue par le gabarit n'était pas disponible dans cet environnement.
- Musique sous la voix : ${mesures.ecart_voix_musique_LU} LU d'écart pendant la parole (exigence : au moins 15).
- Master : ${m.I.toFixed(1)} LUFS intégrés, crête vraie ${m.TP.toFixed(1)} dBTP (cible −14 LUFS / −1 dBTP), plage de loudness ${m.LRA.toFixed(1)} LU. Gain fixe de ${m.gain_db} dB puis limiteur de crête suréchantillonné ×4 sur le bus master.

## Image

- Remotion (React), 60 images par seconde, minutage calé mot à mot sur la voix (Whisper en local) : \`video/src/nova/minutage.json\`.
- Interfaces : captures haute définition de l'application réelle (version démo, \`video/outils/capturer.mjs\`), documents et chiffres du corpus (64 documents, 22 octobre, 18 000 $, plan v3 du 15 octobre). Le courriel de Boréal est le message d'essai de l'application, marqué EXEMPLE comme dans l'application.
- Polices de la marque (Fraunces, Source Sans 3, Source Code Pro, licence SIL OFL) ; icônes Lucide (licence ISC).
- Durée : ${M.duree_totale} s, dont le carton de fin animé de 2 s (« réalisé par / l'équipe Projet 360 »).

## Refaire le rendu

\`\`\`
cd video
python3 audio/analyser_voix.py audio/voix/prise1.mp3   # transcription mot à mot
python3 audio/caler.py audio/voix/prise1.mp3           # minutage → src/nova/minutage.json
node outils/capturer.mjs                               # captures de l'application (corpus requis)
python3 audio/composer.py                              # musique, bruitages, mixage, master
npx remotion render NovaSpot16x9 out/NOVA_spot_16x9_image.mp4 --muted --concurrency=4 --crf=16 --jpeg-quality=95
npx remotion render NovaSpot9x16 out/NOVA_spot_9x16_image.mp4 --muted --concurrency=4 --crf=16 --jpeg-quality=95
node outils/finaliser.mjs                              # assemblage, pistes, planches, ce README
\`\`\`
`);
console.log('  ✓ README.md');
