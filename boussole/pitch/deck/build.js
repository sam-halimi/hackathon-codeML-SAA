// Génère boussole/pitch/deck/Boussole-pitch.pptx (3 diapos). NODE_PATH doit contenir pptxgenjs.
const pptxgen = require('pptxgenjs');
const fs = require('fs');
const path = require('path');
const pres = new pptxgen();
pres.layout = 'LAYOUT_WIDE'; // 13.33 x 7.5 in
pres.title = 'Boussole — pitch';
pres.theme = { headFontFace: 'Calibri', bodyFontFace: 'Calibri' };
const NAVY = '0F1B2D', CARD = '18263C', CREAM = 'F6F1EA', AMBER = 'E8A33D', RED = 'E06A50', MUTED = '9AA6B8';
const A = (p) => path.join(__dirname, '..', 'assets', p);
const URL = process.env.SITE_URL || 'boussole-beta.vercel.app';
const T = (s, text, o) => s.addText(text, { margin: 0, isTextBox: true, ...o });

function frame(s, kicker, title) {
  s.background = { color: NAVY };
  s.addShape(pres.shapes.OVAL, { x: 0.6, y: 0.42, w: 0.34, h: 0.34, line: { color: AMBER, width: 1.75 }, fill: { type: 'none' } });
  s.addShape(pres.shapes.DIAMOND, { x: 0.715, y: 0.45, w: 0.11, h: 0.28, fill: { color: AMBER }, line: { color: AMBER } });
  T(s, 'Boussole', { x: 1.04, y: 0.4, w: 2.5, h: 0.38, fontSize: 18, bold: true, color: CREAM });
  T(s, kicker, { x: 8.73, y: 0.42, w: 4, h: 0.34, fontSize: 12, bold: true, color: AMBER, align: 'right', charSpacing: 3 });
  T(s, title, { x: 0.6, y: 0.95, w: 12.1, h: 0.85, fontSize: 38, bold: true, color: CREAM });
}

// ===== Diapo 1 : contexte et problème (histoire réelle, Noovo) =====
{
  const s = pres.addSlide();
  frame(s, '01 · LE PROBLÈME', [{ text: 'Sept étudiants. ' }, { text: 'Des dissertations.', options: { color: RED } }]);
  // Histoire réelle : grande carte gauche
  const lx = 0.6, ly = 2.0, lw = 7.2, ph = 3.0;
  s.addShape(pres.shapes.ROUNDED_RECTANGLE, { x: lx, y: ly, w: lw, h: 4.45, rectRadius: 0.1, fill: { color: CARD }, line: { color: CARD } });
  s.addImage({ path: A('articles/cornell.jpg'), x: lx, y: ly, w: lw, h: ph, sizing: { type: 'cover', w: lw, h: ph } });
  s.addShape(pres.shapes.RECTANGLE, { x: lx, y: ly + ph - 0.62, w: lw, h: 0.62, fill: { color: NAVY, transparency: 25 }, line: { color: NAVY, transparency: 100 } });
  T(s, '« Viol collectif présumé d\'une étudiante par 7 garçons : certains ont été punis avec… des dissertations »', { x: lx + 0.25, y: ly + ph - 0.58, w: lw - 0.5, h: 0.54, fontSize: 15, bold: true, italic: true, color: CREAM, valign: 'middle' });
  T(s, [
    { text: 'Université Cornell, octobre 2024. ', options: { bold: true, color: AMBER } },
    { text: "Une étudiante de 20 ans dit avoir été droguée puis violée par sept étudiants. Elle signale trois semaines plus tard, bien après toute fenêtre toxicologique. Interrogée par un agent non formé ; des preuves numériques jamais examinées. Sanction : deux expulsions… et des dissertations. Septembre 2026 : le procureur rouvre l'enquête." },
  ], { x: lx + 0.25, y: ly + ph + 0.12, w: lw - 0.5, h: 1.25, fontSize: 12.5, color: CREAM, valign: 'top' });
  // Trois fuites à droite
  const items = [
    { img: null, step: 'LA PREMIÈRE NUIT', big: '24 h', cap: 'après, le sang ne révèle plus la plupart des drogues', src: 'ANSI/ASB 121' },
    { img: 'articles/globe2.jpg', step: 'LA POLICE', big: '1 sur 5', cap: 'plaintes classées « non fondées »', src: 'The Globe and Mail' },
    { img: 'articles/cbc.jpg', step: 'LE TRIBUNAL', big: '1 sur 3', cap: 'causes au-delà des délais Jordan', src: 'CBC · Ombudsman fédéral' },
  ];
  const rx = 8.05, rw = 4.68, rh = 1.38;
  items.forEach((c, i) => {
    const y = ly + i * (rh + 0.155);
    s.addShape(pres.shapes.ROUNDED_RECTANGLE, { x: rx, y, w: rw, h: rh, rectRadius: 0.1, fill: { color: CARD }, line: { color: c.img ? CARD : AMBER, width: c.img ? 0.5 : 1.75 } });
    if (c.img) s.addImage({ path: A(c.img), x: rx, y, w: 1.45, h: rh, sizing: { type: 'cover', w: 1.45, h: rh } });
    else { s.addShape(pres.shapes.RECTANGLE, { x: rx + 0.02, y: y + 0.02, w: 1.43, h: rh - 0.04, fill: { color: AMBER }, line: { color: AMBER } }); T(s, '03:00', { x: rx, y, w: 1.45, h: rh, fontSize: 24, bold: true, color: NAVY, align: 'center', valign: 'middle' }); }
    T(s, c.step, { x: rx + 1.62, y: y + 0.12, w: 2.9, h: 0.24, fontSize: 10, bold: true, color: AMBER, charSpacing: 2 });
    T(s, c.big, { x: rx + 1.62, y: y + 0.36, w: 2.9, h: 0.48, fontSize: 26, bold: true, color: RED });
    T(s, c.cap, { x: rx + 1.62, y: y + 0.84, w: 2.95, h: 0.32, fontSize: 11, color: CREAM });
    T(s, c.src, { x: rx + 1.62, y: y + 1.12, w: 2.9, h: 0.2, fontSize: 8.5, color: MUTED });
  });
  T(s, [{ text: 'Et seulement ' }, { text: '6 %', options: { bold: true, color: AMBER } }, { text: " des agressions sexuelles sont signalées. Le problème n'est pas la parole des victimes : c'est le dossier qui se construit mal, trop tard, au mauvais endroit." }],
    { x: 0.6, y: 6.6, w: 12.1, h: 0.4, fontSize: 15, italic: true, color: CREAM });
  T(s, 'Sources : L\'Avenir (28 sept. 2026) et Radio-Canada, faits allégués, procédure en cours ; StatCan (ESG 2019 ; affaires 2015-19) ; The Globe and Mail ; CBC News ; Ombudsman fédéral des victimes (2022-23) ; ANSI/ASB 121.', { x: 0.6, y: 7.05, w: 12.1, h: 0.22, fontSize: 9, color: MUTED });
  s.addNotes(`PERSONNE 1 (0:00–0:50) · L'histoire vraie + le problème
Octobre 2024, université Cornell. Une étudiante de 20 ans dit avoir été droguée, puis violée par sept étudiants. Elle met trois semaines à oser le signaler : bien trop tard pour retrouver une drogue dans son sang. Elle est interrogée par un agent qui n'est pas formé pour ça. Des preuves numériques ne sont jamais examinées. Et la sanction de l'université ? Deux expulsions… et, pour certains, des dissertations. [PAUSE] Il a fallu une poursuite civile, ce mois-ci, pour que le procureur rouvre l'enquête.
Ce n'est pas qu'aux États-Unis. Ici, seulement 6 % des agressions sexuelles sont signalées. Et le dossier fuit partout : la première nuit, après 24 heures, le sang ne révèle plus la plupart des drogues. À la police, une plainte sur cinq est classée « non fondée ». Au tribunal, près d'une cause sur trois dépasse les délais Jordan.
Le problème n'est pas la parole des victimes. C'est le dossier qui se construit mal, trop tard, au mauvais endroit.

PERSONNE 2 (0:50–1:05) · Nous
[SEULEMENT SI VRAI : une phrase personnelle.] Au Québec, une femme sur quatre. Statistiquement, chacun de nous connaît quelqu'un qui l'a vécu. On a choisi la sécurité qui compte le plus : celle d'une personne, et de sa preuve.`);
}

// ===== Diapo 2 : la solution =====
{
  const s = pres.addSlide();
  frame(s, '02 · NOTRE SOLUTION', [{ text: "L'IA guide. " }, { text: "L'humain décide.", options: { color: AMBER } }]);
  T(s, "Le copilote des soignants pour la première nuit : un seul récit, des consentements respectés, des délais tenus, une preuve intacte.", { x: 0.6, y: 1.8, w: 12.1, h: 0.45, fontSize: 17, color: MUTED });
  const vx = 0.6, vy = 2.45, vw = 7.4, vh = vw * 9 / 16;
  s.addShape(pres.shapes.ROUNDED_RECTANGLE, { x: vx - 0.06, y: vy - 0.06, w: vw + 0.12, h: vh + 0.12, rectRadius: 0.08, fill: { color: AMBER }, line: { color: AMBER } });
  const cover = 'data:image/png;base64,' + fs.readFileSync(A('screens/04-checklist.png')).toString('base64');
  if (process.env.NOVIDEO) s.addImage({ path: A('screens/04-checklist.png'), x: vx, y: vy, w: vw, h: vh });
  else s.addMedia({ type: 'video', path: A('video/boussole-demo-light.mp4'), cover, x: vx, y: vy, w: vw, h: vh });
  T(s, 'Démo réelle du prototype · données 100 % fictives · cliquer pour lancer', { x: vx, y: vy + vh + 0.12, w: vw, h: 0.25, fontSize: 10, color: MUTED });
  const pillars = [
    ['1', 'Règles', "Délais et prélèvements prioritaires calculés par des règles écrites, validées. Pas d'IA."],
    ['2', 'IA (Claude)', 'Range les notes en chronologie, cite chaque source, signale les trous. Secrétaire, jamais juge.'],
    ['3', 'Humain', 'Le soignant valide chaque ligne. La victime consent à chaque étape.'],
  ];
  pillars.forEach(([n, t, d], i) => {
    const y = 2.45 + i * 1.02;
    s.addShape(pres.shapes.OVAL, { x: 8.4, y: y + 0.05, w: 0.55, h: 0.55, fill: { color: i === 1 ? AMBER : CARD }, line: { color: AMBER, width: 1.5 } });
    T(s, n, { x: 8.4, y: y + 0.05, w: 0.55, h: 0.55, fontSize: 18, bold: true, color: i === 1 ? NAVY : AMBER, align: 'center', valign: 'middle' });
    T(s, t, { x: 9.15, y, w: 3.6, h: 0.32, fontSize: 17, bold: true, color: CREAM });
    T(s, d, { x: 9.15, y: y + 0.33, w: 3.6, h: 0.62, fontSize: 12, color: MUTED, valign: 'top' });
  });
  T(s, 'VIE PRIVÉE, CONCRÈTEMENT', { x: 8.4, y: 5.55, w: 4.3, h: 0.25, fontSize: 11, bold: true, color: AMBER, charSpacing: 2 });
  const chips = ['Nom masqué avant l\'IA', 'Consentement révocable', 'Rien vers la police sans accord', 'Journal SHA-256 infalsifiable'];
  chips.forEach((c, i) => {
    const x = 8.4 + (i % 2) * 2.2, y = 5.88 + Math.floor(i / 2) * 0.48;
    s.addShape(pres.shapes.ROUNDED_RECTANGLE, { x, y, w: 2.1, h: 0.38, rectRadius: 0.19, fill: { color: CARD }, line: { color: '2E4262', width: 0.75 } });
    T(s, c, { x, y, w: 2.1, h: 0.38, fontSize: 10.5, color: CREAM, align: 'center', valign: 'middle' });
  });
  T(s, 'Pas de score de crédibilité · pas de coupable désigné · pas de reconnaissance faciale · en production : hébergement au Canada, chiffrement, EFVP Loi 25', { x: 0.6, y: 7.0, w: 12.1, h: 0.25, fontSize: 9, color: MUTED });
  s.addNotes(`PERSONNE 3 (1:05–2:05) · Solution + démo
Avant le clip : On ne répare pas les tribunaux. On répare la première nuit, celle où tout commence et où la preuve se perd. Voici Boussole. [CLIC sur la vidéo]
0–3 s : Retour à 3 h du matin.
3–8 s : Dans notre démo, un cas fictif : elle consent étape par étape. Elle peut refuser un prélèvement, et décider plus tard pour la plainte.
8–16 s : Trente heures depuis les faits, substance soupçonnée. Un moteur de règles, pas l'IA, réordonne tout : peau, 18 heures ; VIH, 42 heures ; le sang, c'est trop tard.
16–26 s : Claude range les notes en chronologie ; chaque ligne cite sa source. Le trou de près de trois heures est signalé comme normal après une substance. Et l'IA ne voit jamais son nom.
26–29 s : L'IA est une secrétaire, jamais un juge. L'humain valide chaque ligne.
29–35 s : À l'export, chaque entrée est chaînée par SHA-256. Une retouche, et ça se voit.
Après : Pas de score de crédibilité, pas de coupable, pas de reconnaissance faciale. Hébergé au Canada, chiffré, conforme Loi 25. Rien ne part vers la police sans l'accord de la victime.`);
}

// ===== Diapo 3 : plan de vente =====
{
  const s = pres.addSlide();
  frame(s, '03 · PLAN DE VENTE', [{ text: 'On vend au soin. ' }, { text: 'Pas à la police.', options: { color: AMBER } }]);
  T(s, "Client : les établissements de santé (CISSS / CIUSSS) qui hébergent les centres désignés. Gratuit pour les victimes, toujours.", { x: 0.6, y: 1.8, w: 12.1, h: 0.45, fontSize: 17, color: MUTED });
  const phases = [
    ['0–3 MOIS', 'Pilote', "1 centre désigné. Financé par subvention (fonds d'aide aux victimes, Mitacs). On mesure l'impact."],
    ['6–12 MOIS', 'Région', 'Licence SaaS annuelle par centre + mise en place et formation des équipes.'],
    ['12–24 MOIS', 'Québec → Canada', 'Appels d\'offres régionaux, puis un module de règles par province.'],
  ];
  const pw = 2.75, py = 2.5;
  phases.forEach(([when, t, d], i) => {
    const x = 0.6 + i * (pw + 0.35);
    s.addShape(pres.shapes.ROUNDED_RECTANGLE, { x, y: py, w: pw, h: 2.2, rectRadius: 0.1, fill: { color: i === 0 ? AMBER : CARD }, line: { color: i === 0 ? AMBER : '2E4262', width: 0.75 } });
    const fg = i === 0 ? NAVY : CREAM;
    T(s, when, { x: x + 0.2, y: py + 0.18, w: pw - 0.4, h: 0.28, fontSize: 11, bold: true, color: i === 0 ? NAVY : AMBER, charSpacing: 2 });
    T(s, t, { x: x + 0.2, y: py + 0.5, w: pw - 0.4, h: 0.45, fontSize: 22, bold: true, color: fg });
    T(s, d, { x: x + 0.2, y: py + 1.0, w: pw - 0.4, h: 1.1, fontSize: 12.5, color: fg, valign: 'top' });
    if (i < 2) s.addShape(pres.shapes.RIGHT_TRIANGLE, { x: x + pw + 0.1, y: py + 0.95, w: 0.16, h: 0.3, rotate: 0, fill: { color: AMBER }, line: { color: AMBER }, flipH: false });
  });
  const rows = [
    ['Paie', 'CISSS / CIUSSS · cofinancement fonds d\'aide aux victimes'],
    ['Utilise', 'Infirmières, médecins, intervenantes'],
    ['Reçoit', 'Police et DPCP : le dossier, avec accord, sans l\'acheter'],
    ['Concurrence', 'Track-Kit (7 États US) suit la boîte. Nous, la personne.'],
  ];
  rows.forEach(([k, v], i) => {
    const y = 4.95 + i * 0.36;
    T(s, k, { x: 0.6, y, w: 1.5, h: 0.32, fontSize: 13, bold: true, color: AMBER });
    T(s, v, { x: 2.1, y, w: 7.2, h: 0.32, fontSize: 13, color: CREAM });
  });
  s.addShape(pres.shapes.ROUNDED_RECTANGLE, { x: 9.95, y: 2.5, w: 2.8, h: 3.75, rectRadius: 0.12, fill: { color: CREAM }, line: { color: CREAM } });
  s.addImage({ path: A('qr-boussole.png'), x: 10.15, y: 2.65, w: 2.4, h: 2.4 });
  T(s, 'Essayez le prototype', { x: 9.95, y: 5.12, w: 2.8, h: 0.32, fontSize: 15, bold: true, color: NAVY, align: 'center' });
  T(s, URL, { x: 10.05, y: 5.45, w: 2.6, h: 0.5, fontSize: 9, color: NAVY, align: 'center', valign: 'top' });
  T(s, [{ text: 'On cherche : ', options: { color: CREAM } }, { text: '1 centre désigné pour un pilote de 3 mois', options: { color: AMBER, bold: true } }], { x: 0.6, y: 6.45, w: 12.1, h: 0.4, fontSize: 20 });
  T(s, "« On ne remplace pas l'humain auprès de la victime. On lui rend le temps de l'être. »", { x: 0.6, y: 6.95, w: 12.1, h: 0.3, fontSize: 13, italic: true, color: MUTED });
  s.addNotes(`PERSONNE 1 (2:05–2:40) · Plan de vente
On vend au soin, pas à la police. Nos clients : les CISSS et CIUSSS qui hébergent les centres désignés, dans les 17 régions. Étape 1, un pilote de trois mois dans un centre, financé par subvention. Étape 2, une licence annuelle par centre, avec la formation. Étape 3, le Québec puis le Canada, avec un module de règles par province. La police et le DPCP reçoivent le dossier, mais ne l'achètent pas : c'est un choix de confiance. [PAUSE] Pour les victimes, c'est gratuit, toujours. Track-Kit suit la boîte de la trousse. Nous, on accompagne la personne.

PERSONNE 2 (2:40–3:00) · Appel à l'action
Le prototype est en ligne : scannez le code. Ce qu'on cherche : un centre désigné pour un pilote de trois mois. [PAUSE] On ne remplace pas l'humain auprès de la victime. On lui rend le temps de l'être.`);
}

pres.writeFile({ fileName: process.env.OUT || path.join(__dirname, 'Boussole-pitch.pptx') }).then((f) => console.log('wrote', f));
