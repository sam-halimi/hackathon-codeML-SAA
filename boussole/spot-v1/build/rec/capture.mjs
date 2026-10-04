// Capture des états réels de /demo (cas fictif #DEMO-0042), 1280x800 @2x.
// Aucune retouche de l'UI : seule la police déclarée par l'appli (Inter) est fournie au navigateur.
import { chromium } from 'playwright-core'
import fs from 'node:fs'
const FONT = (f) => fs.readFileSync(`node_modules/@fontsource-variable/inter/files/${f}`).toString('base64')
const fontCSS = `@font-face{font-family:'Inter';font-weight:100 900;font-display:block;src:url(data:font/woff2;base64,${FONT('inter-latin-wght-normal.woff2')}) format('woff2');unicode-range:U+0000-00FF,U+0131,U+0152-0153,U+02BB-02BC,U+02C6,U+02DA,U+02DC,U+0304,U+0308,U+0329,U+2000-206F,U+20AC,U+2122,U+2191,U+2193,U+2212,U+2215,U+FEFF,U+FFFD}
@font-face{font-family:'Inter';font-weight:100 900;font-display:block;src:url(data:font/woff2;base64,${FONT('inter-latin-ext-wght-normal.woff2')}) format('woff2');unicode-range:U+0100-02BA,U+02BD-02C5,U+02C7-02CC,U+02CE-02D7,U+02DD-02FF,U+1E00-1E9F,U+2020,U+20A0-20AB,U+20AD-20C0,U+2113,U+A720-A7FF}`
const OUT = '../../assets_in/rec/16x9'; fs.mkdirSync(OUT, { recursive: true })
const browser = await chromium.launch({ executablePath: '/opt/pw-browsers/chromium-1194/chrome-linux/chrome' })
const page = await browser.newPage({ viewport: { width: 1280, height: 800 }, deviceScaleFactor: 2 })
await page.goto('http://localhost:5173/#/demo'); await page.addStyleTag({ content: fontCSS })
await page.evaluate(() => document.fonts.ready); await page.waitForTimeout(400)
const boxes = {}
const box = async (sel) => page.$eval(sel, (e) => { const r = e.getBoundingClientRect(); return [r.x, r.y, r.width, r.height] })
const textBox = async (rootSel, needle) => page.$eval(rootSel, (root, needle) => {
  const w = document.createTreeWalker(root, NodeFilter.SHOW_TEXT); let n
  while ((n = w.nextNode())) { const i = n.data.indexOf(needle); if (i >= 0) { const r = document.createRange(); r.setStart(n, i); r.setEnd(n, i + needle.length); const rs = [...r.getClientRects()].map((q) => [q.x, q.y, q.width, q.height]); return rs } }
  return null }, needle)
const shot = async (name, extra = {}) => {
  await page.waitForTimeout(350) // laisse finir les transitions CSS de l'appli (150 ms)
  await page.screenshot({ path: `${OUT}/${name}.png` })
  boxes[name] = { banner: await box('#banner'), chip: await box('#integrity-chip'), ...extra }
  console.log('shot', name)
}
// 1. Consentement
await shot('c0_consent')
for (const k of ['examen', 'prelevements', 'conservation']) { await page.click(`#consent-${k}`); await shot(`c1_consent_${k}`, { item: await box(`#consent-${k}`) }) }
boxes.c1_consent_conservation.transmission = await box('#consent-transmission')
// 2. Dossier guidé
await page.click('#next'); await shot('d0_intake', { hours: await box('#hours') })
// 3. Prélèvements (moteur de règles)
await page.click('#next')
const rows = async () => page.$$eval('#checklist li', (ls) => ls.map((l) => { const r = l.getBoundingClientRect(); const b = l.querySelector('span.rounded').getBoundingClientRect(); return { label: l.querySelector('.font-semibold').textContent, row: [r.x, r.y, r.width, r.height], badge: [b.x, b.y, b.width, b.height] } }))
await shot('k0_checklist', { rows: await rows(), proto: await textBox('main', 'Délais PROTOTYPE') })
await page.click('#checklist li:first-child input'); await shot('k1_checklist_cutane', { rows: await rows() })
// 4. Chronologie
await page.click('#next'); await shot('t0_notes', { notes: await box('textarea'), ai: await box('#ai-view') })
await page.click('#ai-view'); await shot('t1_aiview', { panel: await box('#ai-view-panel'), masks: await page.$$eval('#ai-view-panel mark', (ms) => ms.map((m) => { const r = m.getBoundingClientRect(); return [r.x, r.y, r.width, r.height, m.textContent] })) })
await page.click('#generate'); await page.waitForTimeout(120); await page.screenshot({ path: `${OUT}/t2_loading.png` }); boxes.t2_loading = { generate: await box('#generate') }; console.log('shot t2_loading')
await page.waitForSelector('#timeline ol'); 
const evs = async () => page.$$eval('#timeline ol > li', (ls) => ls.map((l) => { const r = l.getBoundingClientRect(); const q = l.querySelector('.italic').getBoundingClientRect(); const v = l.querySelector('button.validate'); const vb = v ? v.getBoundingClientRect() : null; const rj = l.querySelectorAll('button')[1]; const rb = rj ? rj.getBoundingClientRect() : null; return { row: [r.x, r.y, r.width, r.height], quote: [q.x, q.y, q.width, q.height], ok: vb && [vb.x, vb.y, vb.width, vb.height], no: rb && [rb.x, rb.y, rb.width, rb.height] } }))
await shot('t3_timeline', { events: await evs(), label: await textBox('#timeline', 'Réponse IA pré-enregistrée'), src0: await textBox('#ai-view-panel', 'arrivée à une fête le 2 octobre vers 22 h 00'), src1: await textBox('#ai-view-panel', 'A accepté un verre offert vers 22 h 45.') })
// Validation humaine : 6 validées, 1 rejetée (la 5e)
const order = [[0, 'ok'], [1, 'ok'], [2, 'ok'], [3, 'ok'], [4, 'no'], [5, 'ok'], [6, 'ok']]
let i = 0
for (const [ev, d] of order) {
  const e = (await evs())[ev]; const b = d === 'ok' ? e.ok : e.no
  await page.mouse.click(b[0] + b[2] / 2, b[1] + b[3] / 2)
  await shot(`v${++i}_${d}_${ev}`, { click: b, events: await evs() })
}
// 5. Export et intégrité
await page.click('#next')
const logs = async () => page.$$eval('#custody-log li', (ls) => ls.map((l) => { const r = l.getBoundingClientRect(); const h = l.querySelector('div').getBoundingClientRect(); return { row: [r.x, r.y, r.width, r.height], hash: [h.x, h.y, h.width, h.height], text: l.querySelector('div').textContent } }))
await shot('x0_export', { badge: await box('#integrity-badge'), log: await box('#custody-log'), logs: await logs(), tamper: await box('#tamper') })
await page.click('#tamper'); await shot('x1_tamper', { badge: await box('#integrity-badge'), result: await box('#tamper-result'), tamper: await box('#tamper') })
fs.writeFileSync(`${OUT}/boxes.json`, JSON.stringify(boxes, null, 1))
await browser.close()
