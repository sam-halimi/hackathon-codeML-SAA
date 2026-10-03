const pptxgen = require('pptxgenjs');
const path = require('path');
const pres = new pptxgen();
pres.layout = 'LAYOUT_WIDE'; // 13.33 x 7.5
pres.title = 'Boussole — pitch';
pres.theme = { headFontFace: 'Calibri', bodyFontFace: 'Calibri' };
const NAVY = '0F1B2D', NAVY2 = '1B2B44', CREAM = 'F6F1EA', AMBER = 'E8A33D', RED = 'C8553D', MUTED = 'A9B1BD';
const A = (p) => path.join(__dirname, '..', 'assets', p);
const URL = process.env.SITE_URL || 'sam-halimi.github.io/hackathon-codeML-SAA';

function logo(s) {
  s.addShape(pres.shapes.OVAL, { x: 0.5, y: 0.4, w: 0.42, h: 0.42, line: { color: AMBER, width: 2 }, fill: { type: 'none' } });
  s.addShape(pres.shapes.DIAMOND, { x: 0.635, y: 0.43, w: 0.15, h: 0.36, fill: { color: AMBER }, line: { color: AMBER } });
  s.addText('Boussole', { x: 1.0, y: 0.38, w: 3, h: 0.46, fontSize: 22, bold: true, color: CREAM, margin: 0, isTextBox: true });
}
function fictif(s) {
  s.addText('DONNÉES FICTIVES · PROTOTYPE', { x: 9.8, y: 7.02, w: 3.1, h: 0.3, fontSize: 10, bold: true, color: RED, align: 'right', margin: 0, isTextBox: true });
}

// ---------- Diapo 1 : Léa + 4 fuites ----------
{
  const s = pres.addSlide(); s.background = { color: NAVY }; logo(s);
  s.addText('3:00', { x: 8.6, y: 0.2, w: 4.3, h: 1.5, fontSize: 96, bold: true, color: NAVY2, align: 'right', margin: 0, isTextBox: true });
  s.addText([
    { text: 'La preuve a une date ', options: { color: CREAM } },
    { text: "d'expiration", options: { color: RED } },
  ], { x: 0.5, y: 1.25, w: 12.3, h: 0.9, fontSize: 40, bold: true, margin: 0, isTextBox: true });
  s.addText('Le dossier fuit à 4 endroits', { x: 0.5, y: 2.1, w: 12, h: 0.5, fontSize: 20, color: MUTED, margin: 0, isTextBox: true });
  const leaks = [
    ['1 · Où aller ?', '3', 'hôpitaux avant d\'obtenir une trousse (Montréal, 2020)'],
    ['2 · La première nuit', '24 h', 'après, le sang ne révèle plus la plupart des drogues'],
    ['3 · La police', '6 %', 'des agressions signalées · 640 / 1 000 sans accusation'],
    ['4 · Le tribunal', '1 / 3', 'des causes dépassent les délais Jordan (2022-23)'],
  ];
  const w = 2.9, gap = 0.233, y = 2.95;
  leaks.forEach(([lab, big, cap], i) => {
    const x = 0.5 + i * (w + gap);
    const hi = i === 1;
    s.addShape(pres.shapes.ROUNDED_RECTANGLE, { x, y, w, h: 3.1, rectRadius: 0.12, fill: { color: NAVY2 }, line: { color: hi ? AMBER : NAVY2, width: hi ? 2.5 : 0.5 } });
    s.addText(lab, { x: x + 0.25, y: y + 0.25, w: w - 0.5, h: 0.4, fontSize: 16, bold: true, color: hi ? AMBER : CREAM, margin: 0, isTextBox: true });
    s.addText(big, { x: x + 0.25, y: y + 0.8, w: w - 0.5, h: 1.1, fontSize: 60, bold: true, color: RED, margin: 0, isTextBox: true });
    s.addText(cap, { x: x + 0.25, y: y + 2.0, w: w - 0.5, h: 0.9, fontSize: 14, color: CREAM, margin: 0, valign: 'top', isTextBox: true });
  });
  s.addText("Le problème n'est pas la parole des victimes. C'est le dossier qui se construit mal, trop tard, au mauvais endroit.", { x: 0.5, y: 6.25, w: 12.3, h: 0.5, fontSize: 18, italic: true, color: CREAM, margin: 0, isTextBox: true });
  s.addText('Léa : personnage fictif. Sources : StatCan (ESG 2019 ; 2015-19), ANSI/ASB 121, Noovo 2020, Ombudsman fédéral des victimes 2022-23, INSPQ 2018.', { x: 0.5, y: 6.95, w: 9.2, h: 0.35, fontSize: 10, color: MUTED, margin: 0, isTextBox: true });
  s.addNotes(`PERSONNE 1 (0:00–0:50)
Imaginez Léa. Elle est fictive, mais tout ce qui lui arrive est documenté. Léa a 22 ans. Il est 3 h du matin. Elle se réveille chez quelqu'un qu'elle connaît à peine, avec un trou de près de trois heures dans sa soirée. À l'urgence, elle raconte son histoire quatre fois. Chaque fois, on lui demande l'heure exacte. Elle ne s'en souvient pas. Et elle ne sait pas encore si elle veut porter plainte. [PAUSE]
Le dossier de Léa va fuir à quatre endroits. Un : où aller ? En 2020, une victime a fait trois hôpitaux de Montréal avant d'obtenir une trousse. Deux : la première nuit. La preuve expire : après 24 heures, le sang ne révèle plus la plupart des drogues. Trois : la police. Seulement 6 % des agressions sont signalées ; sur mille, 640 finissent sans accusation. Quatre : le tribunal. Près d'une cause sur trois dépasse les délais Jordan.
Le problème n'est pas la parole des victimes. C'est le dossier qui se construit mal, trop tard, au mauvais endroit.

PERSONNE 2 (0:50–1:05)
[SEULEMENT SI VRAI : une phrase personnelle, sinon la supprimer.]
Au Québec, une femme sur quatre. Statistiquement, chacun de nous connaît quelqu'un qui l'a vécu, souvent sans le savoir. On est trois étudiants, et on a décidé de travailler sur la sécurité qui compte le plus : celle d'une personne, et de sa preuve.`);
}

// ---------- Diapo 2 : solution + clip ----------
function slide2(withVideo) {
  const s = pres.addSlide(); s.background = { color: NAVY }; logo(s); fictif(s);
  if (!withVideo) s.hidden = true;
  s.addText('La première nuit, sans perdre la preuve', { x: 0.5, y: 1.0, w: 12.3, h: 0.7, fontSize: 36, bold: true, color: CREAM, margin: 0, isTextBox: true });
  if (withVideo) {
    s.addShape(pres.shapes.ROUNDED_RECTANGLE, { x: 0.45, y: 1.95, w: 7.7, h: 4.36, rectRadius: 0.08, fill: { color: AMBER } });
    if (process.env.NOVIDEO) s.addImage({ path: A('screens/04-checklist.png'), x: 0.5, y: 2.0, w: 7.6, h: 4.26 }); else s.addMedia({ type: 'video', path: A('video/boussole-demo-light.mp4'), cover: 'data:image/png;base64,' + require('fs').readFileSync(A('screens/04-checklist.png')).toString('base64'), x: 0.5, y: 2.0, w: 7.6, h: 4.26 });
  } else {
    const shots = [['04-checklist.png', 'Règles : les délais, sans IA'], ['07-validation.png', 'IA : cite ses sources, ne juge pas'], ['09-alteration.png', 'Humain : valide ; journal prouvé']];
    shots.forEach(([f, cap], i) => {
      const x = 0.5 + i * 2.6;
      s.addImage({ path: A('screens/' + f), x, y: 2.3, w: 2.45, h: 1.38 });
      s.addText(cap, { x, y: 3.75, w: 2.45, h: 0.7, fontSize: 13, color: CREAM, margin: 0, valign: 'top', isTextBox: true });
    });
  }
  const layers = [['RÈGLES', 'Délais et priorités · pas d\'IA', NAVY2, CREAM], ['IA', 'Chronologie, sources, trous · secrétaire, jamais juge', AMBER, NAVY], ['HUMAIN', 'Valide chaque ligne · la victime consent', CREAM, NAVY]];
  layers.forEach(([t, d, bg, fg], i) => {
    const y = 1.95 + i * 0.95;
    s.addShape(pres.shapes.ROUNDED_RECTANGLE, { x: 8.5, y, w: 4.35, h: 0.82, rectRadius: 0.08, fill: { color: bg }, line: { color: bg } });
    s.addText(t, { x: 8.7, y, w: 1.3, h: 0.82, fontSize: 16, bold: true, color: fg, valign: 'middle', margin: 0, isTextBox: true });
    s.addText(d, { x: 9.95, y, w: 2.8, h: 0.82, fontSize: 13, color: fg, valign: 'middle', margin: 0, isTextBox: true });
  });
  s.addText([
    { text: 'Pseudonymisation visible : Léa → [PATIENTE]', options: { bullet: true, breakLine: true } },
    { text: 'Consentement par étape, révocable', options: { bullet: true, breakLine: true } },
    { text: 'Rien vers la police sans son accord', options: { bullet: true, breakLine: true } },
    { text: 'Journal SHA-256 : retouche détectée', options: { bullet: true } },
  ], { x: 8.5, y: 4.85, w: 4.35, h: 1.5, fontSize: 14, color: CREAM, paraSpaceAfter: 4, margin: 0, isTextBox: true });
  s.addText('En production : hébergement au Canada, chiffrement, EFVP (Loi 25), aucun entraînement sur les données', { x: 0.5, y: 6.55, w: 12.3, h: 0.35, fontSize: 12, color: MUTED, margin: 0, isTextBox: true });
  s.addNotes(`PERSONNE 3 (1:05–2:05)
Avant le clip : On ne répare pas les tribunaux. On répare la première nuit, celle où tout commence et où la preuve se perd. Voici Boussole. [CLIC : lancer le clip]
0–3 s : Retour à 3 h du matin.
3–8 s : Léa consent étape par étape. Elle peut refuser un prélèvement, et décider plus tard pour la plainte.
8–16 s : Trente heures depuis les faits, substance soupçonnée. Un moteur de règles, pas l'IA, réordonne tout : peau, encore 18 heures ; VIH, 42 heures ; le sang, c'est trop tard.
16–26 s : Claude, d'Anthropic, range les notes en chronologie où chaque ligne cite sa phrase source. Le trou de près de trois heures est signalé comme normal après une substance. Et l'IA ne voit jamais son nom.
26–29 s : L'IA est une secrétaire, jamais un juge. L'humain valide chaque ligne.
29–35 s : À l'export, chaque entrée est chaînée par SHA-256. Une retouche, et ça se voit.
35–40 s : (silence, laisser lire)
Après le clip : Pas de score de crédibilité, pas de coupable désigné, pas de reconnaissance faciale. En production : hébergé au Canada, chiffré, évaluation Loi 25, aucun entraînement sur les données. Et rien ne part vers la police sans l'accord de Léa.
${withVideo ? '' : 'PLAN B (diapo cachée) : même texte en 3 temps, en pointant les 3 captures.'}`);
}
slide2(true);
slide2(false); // 2-bis, cachée

// ---------- Diapo 3 : marché + demande + QR ----------
{
  const s = pres.addSlide(); s.background = { color: NAVY }; logo(s);
  s.addText('On vend au soin. Pas à la police.', { x: 0.5, y: 1.0, w: 12.3, h: 0.7, fontSize: 36, bold: true, color: CREAM, margin: 0, isTextBox: true });
  const cards = [['PAIE', 'Établissements de santé (CISSS / CIUSSS) · centres désignés', 'Licence SaaS / centre / an (hypothèse)'], ['UTILISE', 'Infirmières, médecins, intervenantes', 'Moins de temps administratif'], ['BÉNÉFICIE', 'Victimes', 'Gratuit, toujours']];
  cards.forEach(([t, a, b], i) => {
    const x = 0.5 + i * 2.95;
    s.addShape(pres.shapes.ROUNDED_RECTANGLE, { x, y: 1.95, w: 2.75, h: 2.05, rectRadius: 0.1, fill: { color: CREAM }, line: { color: CREAM } });
    s.addText(t, { x: x + 0.2, y: 2.1, w: 2.35, h: 0.35, fontSize: 14, bold: true, color: AMBER, margin: 0, isTextBox: true });
    s.addText(a, { x: x + 0.2, y: 2.5, w: 2.35, h: 0.9, fontSize: 15, bold: true, color: NAVY, margin: 0, valign: 'top', isTextBox: true });
    s.addText(b, { x: x + 0.2, y: 3.45, w: 2.35, h: 0.45, fontSize: 13, color: NAVY, margin: 0, isTextBox: true });
  });
  s.addText('Police et DPCP reçoivent le dossier (avec accord), sans l\'acheter · Partenaires : CAVAC, CALACS, LSJML', { x: 0.5, y: 4.15, w: 8.6, h: 0.4, fontSize: 13, color: MUTED, margin: 0, isTextBox: true });
  s.addText([
    { text: 'Track-Kit (7 États US) suit la boîte.', options: { color: CREAM, breakLine: true } },
    { text: 'Boussole accompagne la personne.', options: { color: AMBER, bold: true } },
  ], { x: 0.5, y: 4.7, w: 8.6, h: 0.8, fontSize: 18, margin: 0, isTextBox: true });
  s.addText([
    { text: 'On cherche 1 centre désigné', options: { breakLine: true } },
    { text: 'pour un pilote de 3 mois' },
  ], { x: 0.5, y: 5.6, w: 8.6, h: 0.95, fontSize: 26, bold: true, color: AMBER, margin: 0, isTextBox: true });
  s.addShape(pres.shapes.ROUNDED_RECTANGLE, { x: 9.55, y: 1.95, w: 3.3, h: 3.75, rectRadius: 0.12, fill: { color: CREAM }, line: { color: CREAM } });
  s.addImage({ path: A('qr-boussole.png'), x: 9.75, y: 2.1, w: 2.9, h: 2.9 });
  s.addText('Scannez pour essayer', { x: 9.55, y: 5.0, w: 3.3, h: 0.35, fontSize: 15, bold: true, color: NAVY, align: 'center', margin: 0, isTextBox: true });
  s.addText(URL, { x: 9.55, y: 5.3, w: 3.3, h: 0.3, fontSize: 10, color: NAVY, align: 'center', margin: 0, isTextBox: true });
  s.addText("« On ne remplace pas l'humain auprès de Léa. On lui rend le temps de l'être. »", { x: 0.5, y: 6.75, w: 12.3, h: 0.45, fontSize: 18, italic: true, color: CREAM, margin: 0, isTextBox: true });
  s.addNotes(`PERSONNE 1 (2:05–2:40)
Qui paie ? Les établissements de santé, CISSS et CIUSSS, qui hébergent les centres désignés dans les 17 régions. Un cofinancement est possible par les fonds d'aide aux victimes. Notre hypothèse : une licence SaaS par centre et par an, plus la formation et des modules de règles par juridiction.
La police et le DPCP reçoivent le dossier, mais ne l'achètent pas : c'est un choix de confiance. [PAUSE] Pour les victimes, c'est gratuit, toujours.
Track-Kit suit la boîte de la trousse jusqu'au labo. Nous, on accompagne la personne et son dossier, pendant la première nuit. Et c'est le moment : 190 recommandations dans Rebâtir la confiance, un tribunal spécialisé voté à l'unanimité.

PERSONNE 2 (2:40–3:00)
Le prototype est en ligne : scannez le code. Données fictives, réponse d'IA préenregistrée dans la démo publique. Ce qu'on cherche : un centre désigné pour un pilote de trois mois. On mesurera les récits répétés, les prélèvements dans les délais et le temps administratif. [PAUSE] On ne remplace pas l'humain auprès de Léa. On lui rend le temps de l'être. (2 s de silence)`);
}

pres.writeFile({ fileName: process.env.OUT || path.join(__dirname, 'Boussole-pitch.pptx') }).then((f) => console.log('wrote', f));
