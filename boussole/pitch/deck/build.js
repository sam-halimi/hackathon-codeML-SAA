// Génère boussole/pitch/deck/Boussole-pitch.pptx (3 diapos). NODE_PATH doit contenir pptxgenjs.
// DA alignée sur l'application : crème chaud, prune, violet doux, corail, sauge, ciel, soleil.
const pptxgen = require('pptxgenjs')
const path = require('path')
const pres = new pptxgen()
pres.layout = 'LAYOUT_WIDE' // 13.33 x 7.5 in
pres.title = 'Boussole · pitch'
pres.theme = { headFontFace: 'Calibri', bodyFontFace: 'Calibri' }

const C = {
  cream: 'FFF9F3', ink: '2D2440', ink2: '5E5670', ink3: '948BA3', white: 'FFFFFF',
  violet: '6A4CE0', violetSoft: 'EEE8FF', coral: 'FF8A65', coralSoft: 'FFE6DC',
  sage: '2F9E78', sageSoft: 'DDF3E8', sky: '3D86D6', skySoft: 'E1EEFB', sun: 'E9A23B', sunSoft: 'FFF1D6',
}
const A = (p) => path.join(__dirname, '..', 'assets', p)
const URL = 'boussole-beta.vercel.app'
const T = (s, text, o) => s.addText(text, { margin: 0, isTextBox: true, fontFace: 'Calibri', ...o })
const card = (s, x, y, w, h, fill, extra = {}) =>
  s.addShape(pres.shapes.ROUNDED_RECTANGLE, { x, y, w, h, rectRadius: 0.22, fill: { color: fill }, line: { color: fill }, ...extra })

function logo(s, dark = false) {
  s.addShape(pres.shapes.OVAL, { x: 0.6, y: 0.42, w: 0.42, h: 0.42, fill: { color: C.violet }, line: { color: C.violet } })
  s.addShape(pres.shapes.DIAMOND, { x: 0.735, y: 0.47, w: 0.15, h: 0.32, fill: { color: C.cream }, line: { color: C.cream } })
  s.addShape(pres.shapes.ISOSCELES_TRIANGLE, { x: 0.735, y: 0.47, w: 0.15, h: 0.16, fill: { color: C.coral }, line: { color: C.coral } })
  T(s, 'Boussole', { x: 1.12, y: 0.42, w: 3, h: 0.42, fontSize: 20, bold: true, color: dark ? C.cream : C.ink, valign: 'middle' })
}
function kicker(s, text, color, dark = false) {
  T(s, text, { x: 8.2, y: 0.46, w: 4.55, h: 0.34, fontSize: 13, bold: true, color: dark ? C.coral : color, align: 'right' })
}

// ═════ Diapo 1 · Le problème (le prospect : l'État) ═════
{
  const s = pres.addSlide()
  s.background = { color: C.ink }
  logo(s, true); kicker(s, '01 · LE PROBLÈME', C.coral, true)
  T(s, [{ text: 'Sept étudiants. ' }, { text: 'Des dissertations.', options: { color: C.coral } }],
    { x: 0.6, y: 1.05, w: 12.1, h: 0.85, fontSize: 40, bold: true, color: C.cream })
  T(s, 'Le système d’aide existe, il est public et gratuit. Mais les victimes s’y perdent, et les dossiers se construisent trop tard.',
    { x: 0.6, y: 1.9, w: 12.1, h: 0.45, fontSize: 17, color: 'C9C2D6' })

  // Article (capture recomposée à partir de l'article réel)
  const ax = 0.6, ay = 2.65, aw = 6.9, ah = 4.15
  card(s, ax, ay, aw, ah, C.white)
  s.addImage({ path: A('articles/cornell-ap.jpg'), x: ax + 0.25, y: ay + 0.25, w: aw - 0.5, h: 2.05, sizing: { type: 'cover', w: aw - 0.5, h: 2.05 } })
  T(s, 'CTV NEWS · THE ASSOCIATED PRESS · 28 SEPT. 2026', { x: ax + 0.3, y: ay + 2.45, w: aw - 0.6, h: 0.25, fontSize: 10, bold: true, color: C.coral, charSpacing: 1 })
  T(s, 'New York prosecutors reopen investigation after student files lawsuit over alleged gang rape at Cornell University',
    { x: ax + 0.3, y: ay + 2.72, w: aw - 0.6, h: 0.72, fontSize: 14.5, bold: true, color: C.ink, valign: 'top' })
  T(s, 'Selon la poursuite, sept étudiants ont été suspendus temporairement et ont pu « atténuer leur sanction » en rédigeant des dissertations. L’université conteste. Faits allégués, procédure en cours.',
    { x: ax + 0.3, y: ay + 3.5, w: aw - 0.6, h: 0.6, fontSize: 10.5, color: C.ink2, valign: 'top' })

  // Chiffres clés (Canada)
  const stats = [
    ['6 %', 'des agressions sexuelles sont signalées à la police', 'Statistique Canada, 2019', C.coral],
    ['640 / 1 000', 'plaintes pour agression sexuelle n’aboutissent à aucune accusation', 'Statistique Canada, 2015-2019', C.sun],
    ['1 sur 3', 'causes d’agression sexuelle dépasse les délais de l’arrêt Jordan', 'Ombudsman fédéral des victimes, 2022-2023', C.violetSoft],
  ]
  stats.forEach(([big, lab, src, col], i) => {
    const y = ay + i * 1.43
    card(s, 7.8, y, 4.93, 1.27, '3A3052')
    T(s, big, { x: 8.05, y: y + 0.08, w: 4.5, h: 0.52, fontSize: 28, bold: true, color: col })
    T(s, lab, { x: 8.05, y: y + 0.6, w: 4.6, h: 0.42, fontSize: 11, color: C.cream, valign: 'top' })
    T(s, src, { x: 8.05, y: y + 1.03, w: 4.5, h: 0.2, fontSize: 8.5, color: C.ink3 })
  })
  T(s, 'Sources : CTV News / Associated Press (28 sept. 2026), Statistique Canada, Bureau de l’ombudsman fédéral des victimes d’actes criminels.',
    { x: 0.6, y: 7.0, w: 12.1, h: 0.25, fontSize: 9, color: C.ink3 })
  s.addNotes(`PERSONNE 1 (0:00–0:50) · Le problème
Octobre 2024, université Cornell. Une étudiante dit avoir été droguée puis violée par sept étudiants. Selon sa poursuite, certains ont pu « atténuer leur sanction » en écrivant des dissertations. L’université conteste. Il a fallu une poursuite civile, ce mois-ci, pour que le procureur rouvre l’enquête. [PAUSE]
Ce n’est pas qu’aux États-Unis. Au Canada, seulement 6 % des agressions sexuelles sont signalées à la police. Sur mille plaintes, 640 n’aboutissent à aucune accusation. Et près d’une cause sur trois dépasse les délais Jordan.
Pourtant, au Québec, le système d’aide existe, il est public et gratuit : centres désignés, Info-aide, CAVAC, Rebâtir, IVAC. Le problème, c’est que les victimes s’y perdent, seules, au pire moment, et que le dossier se construit trop tard.
(Faits allégués : toujours dire « dit avoir été », « selon la poursuite ». Ne nommer personne.)

PERSONNE 2 (0:50–1:05) · Nous
[SEULEMENT SI VRAI : une phrase personnelle.] On a voulu construire l’outil qu’on aimerait voir dans les mains de quelqu’un qu’on aime.`)
}

// ═════ Diapo 2 · La solution ═════
{
  const s = pres.addSlide()
  s.background = { color: C.cream }
  logo(s); kicker(s, '02 · NOTRE SOLUTION', C.violet)
  T(s, [{ text: 'Un seul endroit. ' }, { text: 'Pas à pas.', options: { color: C.violet } }],
    { x: 0.6, y: 1.1, w: 6.45, h: 0.75, fontSize: 30, bold: true, color: C.ink })
  T(s, 'Boussole guide la personne de la première nuit jusqu’à l’avocat, dans l’ordre, à son rythme.',
    { x: 0.6, y: 1.9, w: 6.3, h: 0.5, fontSize: 16, color: C.ink2 })

  const feats = [
    ['1', 'Un compte en 30 secondes', 'Prénom, courriel, mot de passe. Tout est chiffré sur l’appareil.', C.violet, C.violetSoft],
    ['2', 'Les étapes, dans le bon ordre', 'Sécurité, Info-aide 24 h/24, soins, choix de la trousse, soutien, droits.', C.coral, C.coralSoft],
    ['3', 'Son récit, une seule fois', 'Une fiche guidée, sans jugement, partagée seulement si elle le décide.', C.sun, C.sunSoft],
    ['4', 'Où aller à Montréal', 'Examens médicaux au plus tôt, soutien psychologique : 24 organismes vérifiés sur une carte.', C.sky, C.skySoft],
    ['5', 'Un dossier prêt pour la justice', 'Assemblé, aperçu, envoyé avec double confirmation.', C.sage, C.sageSoft],
    ['6', 'Rappel d’un avocat spécialisé', 'Aujourd’hui ou demain, au créneau choisi, avec ses préférences.', C.violet, C.violetSoft],
  ]
  feats.forEach(([n, t, d, col, soft], i) => {
    const y = 2.6 + i * 0.73
    s.addShape(pres.shapes.OVAL, { x: 0.6, y: y + 0.04, w: 0.5, h: 0.5, fill: { color: soft }, line: { color: soft } })
    T(s, n, { x: 0.6, y: y + 0.04, w: 0.5, h: 0.5, fontSize: 16, bold: true, color: col, align: 'center', valign: 'middle' })
    T(s, t, { x: 1.28, y: y, w: 5.55, h: 0.3, fontSize: 14.5, bold: true, color: C.ink })
    T(s, d, { x: 1.28, y: y + 0.3, w: 5.55, h: 0.38, fontSize: 10.5, color: C.ink2, valign: 'top' })
  })

  // Écrans réels de l'application
  card(s, 7.15, 1.05, 5.75, 3.85, C.white, { shadow: { type: 'outer', color: '2D2440', opacity: 0.18, blur: 18, offset: 6, angle: 90 } })
  s.addImage({ path: A('app/accueil.jpg'), x: 7.3, y: 1.2, w: 5.45, h: 3.41 })
  card(s, 7.0, 4.75, 3.05, 2.42, C.white, { shadow: { type: 'outer', color: '2D2440', opacity: 0.22, blur: 18, offset: 6, angle: 90 } })
  s.addImage({ path: A('app/etapes.jpg'), x: 7.1, y: 4.85, w: 2.85, h: 2.14 })
  card(s, 10.25, 4.75, 2.65, 2.45, C.white, { shadow: { type: 'outer', color: '2D2440', opacity: 0.22, blur: 18, offset: 6, angle: 90 } })
  s.addImage({ path: A('app/rappel.jpg'), x: 10.35, y: 4.85, w: 2.45, h: 2.25, sizing: { type: 'cover', w: 2.45, h: 2.25 } })
  T(s, 'Captures réelles · bêta en ligne · données fictives', { x: 7.0, y: 7.2, w: 5.9, h: 0.22, fontSize: 9, color: C.ink3, align: 'right' })
  s.addNotes(`PERSONNE 3 (1:05–2:05) · La solution
Voici Boussole. On arrive sur une page douce, qui dit simplement : vous êtes au bon endroit. On crée son compte en trente secondes : prénom, courriel, mot de passe, et tout est chiffré sur l’appareil.
Tout de suite, Boussole montre les étapes, dans le bon ordre : se mettre en sécurité, appeler Info-aide 24 h/24, aller vers les soins, choisir ou non la trousse, être soutenue, connaître ses droits.
La personne raconte son histoire une seule fois, à son rythme. Une carte de Montréal lui montre où aller : les examens médicaux au plus tôt, pour garder toutes les options ouvertes, et le soutien psychologique près de chez elle.
Et quand elle est prête, Boussole assemble son dossier et l’envoie à un service juridique spécialisé. Elle choisit un créneau, aujourd’hui ou demain, et une avocate ou un avocat la rappelle.
Rien ne part sans son accord. Pas de score de crédibilité, pas de coupable désigné : on guide, elle décide.`)
}

// ═════ Diapo 3 · L'éthique et le financement ═════
{
  const s = pres.addSlide()
  s.background = { color: C.cream }
  logo(s); kicker(s, '03 · NOTRE MODÈLE', C.sage)
  T(s, [{ text: 'Gratuit pour la victime. ' }, { text: 'Toujours.', options: { color: C.sage } }],
    { x: 0.6, y: 1.05, w: 12.1, h: 0.85, fontSize: 40, bold: true, color: C.ink })
  T(s, 'Une victime ne devrait jamais avoir à payer pour faire valoir ses droits.', { x: 0.6, y: 1.9, w: 12.1, h: 0.45, fontSize: 17, color: C.ink2 })

  const cols = [
    ['Elle ne paie pas', C.coral, C.coralSoft,
      ['Elle ne doit pas risquer son argent sur un dossier qui, tristement, finit souvent sans suite : 640 plaintes sur 1\u00a0000 sans accusation.', 'Son droit à se défendre ne dépend pas de ses moyens.', 'Aucune pub, aucune revente de données, aucun abonnement.']],
    ['L’État finance', C.violet, C.violetSoft,
      ['Comme les centres désignés, Rebâtir ou l’IVAC, déjà publics et gratuits.', 'Boussole relie ces services en un seul parcours.', 'Modèle visé : subvention publique ou licence par région (ministères de la Santé et de la Justice).']],
    ['Tout est facilité', C.sage, C.sageSoft,
      ['Un compte, un récit, un dossier : elle ne se répète pas.', 'Les bons services au bon moment, sur une carte.', 'Un avocat la rappelle quand elle est prête.']],
  ]
  cols.forEach(([t, col, soft, items], i) => {
    const x = 0.6 + i * 4.1
    card(s, x, 2.55, 3.85, 3.0, soft)
    T(s, t, { x: x + 0.3, y: 2.75, w: 3.3, h: 0.4, fontSize: 18, bold: true, color: col })
    T(s, items.map((it, k) => ({ text: it, options: { bullet: { indent: 14 }, breakLine: k < items.length - 1 } })),
      { x: x + 0.3, y: 3.22, w: 3.3, h: 2.25, fontSize: 11.5, color: C.ink, paraSpaceAfter: 6, valign: 'top' })
  })

  card(s, 0.6, 5.8, 8.9, 1.4, C.ink)
  T(s, [{ text: 'Ce qu’on demande : ', options: { color: C.cream } }, { text: 'un pilote de 3 mois financé par l’État, avec un centre désigné de Montréal.', options: { color: C.coral, bold: true } }],
    { x: 0.9, y: 5.92, w: 8.4, h: 0.75, fontSize: 15, valign: 'middle' })
  T(s, '« On ne remplace pas l’humain auprès de la victime. On lui rend le temps de l’être. »', { x: 0.9, y: 6.7, w: 8.4, h: 0.38, fontSize: 11.5, italic: true, color: 'C9C2D6' })
  card(s, 9.75, 5.8, 2.98, 1.4, C.white)
  s.addImage({ path: A('qr-boussole.png'), x: 9.85, y: 5.87, w: 1.26, h: 1.26 })
  T(s, 'Essayez la bêta', { x: 11.15, y: 6.05, w: 1.5, h: 0.5, fontSize: 13, bold: true, color: C.ink, valign: 'top' })
  T(s, URL, { x: 11.15, y: 6.6, w: 1.55, h: 0.45, fontSize: 8.5, color: C.ink2, valign: 'top' })
  s.addNotes(`PERSONNE 1 (2:05–2:40) · L’éthique et le financement
Notre règle : la victime ne paie jamais. Elle ne doit pas risquer son argent sur un dossier qui, tristement, finit souvent sans suite : sur mille plaintes, 640 n’aboutissent à aucune accusation. Son droit à se défendre ne doit pas dépendre de ses moyens.
Donc c’est l’État qui finance, comme il finance déjà les centres désignés, Rebâtir ou l’IVAC. Boussole ne remplace aucun de ces services : il les relie en un seul parcours, simple, au bon moment. Pas de publicité, pas de revente de données.

PERSONNE 2 (2:40–3:00) · La demande
Ce qu’on demande : un pilote de trois mois, financé par l’État, avec un centre désigné de Montréal. La bêta est en ligne : scannez le code. [PAUSE]
On ne remplace pas l’humain auprès de la victime. On lui rend le temps de l’être.`)
}

pres.writeFile({ fileName: process.env.OUT || path.join(__dirname, 'Boussole-pitch.pptx') }).then((f) => console.log('wrote', f))
