// Capture image par image de la bêta Boussole, pour la pub « Pas à pas ».
// Données fictives uniquement. L'horloge de la page est figée puis avancée d'1/60 s par image,
// et les animations CSS sont pilotées : rendu à 60 i/s sans saccade, quelle que soit la machine.
//
//   node capture.mjs 16x9                  tous les segments, format 16:9
//   node capture.mjs 9x16 5-recit,6-ou-aller   seulement ces segments (les autres sont joués sans être filmés)
//   PREVIEW=6 node capture.mjs 16x9         brouillon rapide : 1 image sur 6, en 1×
//
// Sortie : out/<format>/<segment>/000000.jpg  (hors git, régénérable)
//          logs/<format>/<segment>.json      (curseur image par image, clics, frappes, repères)

import { chromium } from 'playwright'
import fs from 'node:fs/promises'
import path from 'node:path'
import { fileURLToPath } from 'node:url'

const HERE = path.dirname(fileURLToPath(import.meta.url))
const FORMAT = process.argv[2] ?? '16x9'
const ONLY = process.argv[3]?.split(',')
const URL = process.env.BOUSSOLE_URL ?? 'https://boussole-beta.vercel.app/'
const PREVIEW = Number(process.env.PREVIEW ?? 0) // 0 = rendu final
const FPS = 60
// Mardi 6 octobre 2026, 18 h 20 à Montréal : « Bonsoir », des créneaux aujourd'hui et demain,
// et un rappel le mercredi à 10 h, dans les heures réelles de Rebâtir.
const T0 = new Date('2026-10-06T18:20:00-04:00')
const DATA = { prenom: 'Alex', email: 'alex@example.com', pass: 'Pas-a-pas-2026', phone: '514 555-0187' }

const FORMATS = {
  '16x9': { viewport: { width: 1280, height: 800 }, deviceScaleFactor: 2, isMobile: false, hasTouch: false, tab: 'tab', top: 130, bottom: 40 },
  '9x16': { viewport: { width: 430, height: 932 }, deviceScaleFactor: 3, isMobile: true, hasTouch: true, tab: 'mtab', top: 80, bottom: 120 },
}
const F = FORMATS[FORMAT]
if (!F) throw new Error(`Format inconnu : ${FORMAT}`)
const touch = F.hasTouch
const tab = (id) => `#${F.tab}-${id}`

let page
let tick = 0 // images écoulées depuis le début (horloge virtuelle)
let seg = null // segment en cours de capture
const mouse = { x: F.viewport.width * 0.62, y: F.viewport.height * 0.72, down: false }
const sleep = (ms) => new Promise((r) => setTimeout(r, ms))
const ease = (t) => (t < 0.5 ? 4 * t * t * t : 1 - Math.pow(-2 * t + 2, 3) / 2)

// ───────── Horloge et animations ─────────

// Dans la page : chaque animation CSS (ou transition) est mise en pause dès qu'on la voit,
// puis positionnée sur l'horloge virtuelle.
function syncAnimations(vt) {
  for (const a of document.getAnimations()) {
    if (a.__vt0 === undefined) a.__vt0 = vt
    if (a.playState === 'running') a.pause()
    const t = vt - a.__vt0
    if (a.currentTime !== t) a.currentTime = t
  }
}

// Curseur de saisie : Chrome le fait clignoter en temps réel, donc au hasard d'une image à l'autre.
// « caret-animation: manual » coupe ce clignotement ; on le rejoue sur l'horloge virtuelle :
// fixe pendant la frappe, puis clignotement régulier (530 ms). Rien d'autre ne change à l'écran.
function syncCaret(show) {
  let st = document.getElementById('__cap_caret')
  if (!st) { st = document.createElement('style'); st.id = '__cap_caret'; document.head.append(st) }
  st.textContent = show ? '*{caret-animation:manual!important}' : '*{caret-animation:manual!important;caret-color:transparent!important}'
}
let lastInput = -1e9 // dernier clic ou dernière frappe, en ms d'horloge virtuelle
const caretOn = (vt) => { const d = vt - lastInput; return d < 500 || Math.floor((d - 500) / 530) % 2 === 1 }

// Laisse React appliquer ses mises à jour (son ordonnanceur passe par MessageChannel, non simulé).
const flush = () => page.evaluate(() => new Promise((r) => {
  let n = 0
  const ch = new MessageChannel()
  ch.port1.onmessage = () => (++n < 3 ? ch.port2.postMessage(0) : r())
  ch.port2.postMessage(0)
}))

// Attend un état de la page en faisant avancer l'horloge image par image (React, la carte et le
// chiffrement ont besoin que le temps passe). Les images de l'attente sont filmées comme les autres.
async function until(fn, maxFrames = 600) {
  for (let i = 0; i < maxFrames; i++) {
    if (await page.evaluate(fn)) return
    await step()
    await sleep(15)
  }
  throw new Error(`Délai dépassé : ${fn}`)
}

// Tuiles de la carte : on attend (en temps réel) qu'elles soient chargées avant chaque image.
async function waitTiles() {
  const t = Date.now()
  while (Date.now() - t < 6000) {
    const pending = await page.evaluate(() => [...document.querySelectorAll('img.leaflet-tile')].some((i) => !i.complete))
    if (!pending) return
    await sleep(40)
  }
}

async function step(n = 1) {
  for (let i = 0; i < n; i++) {
    const dt = Math.round(((tick + 1) * 1000) / FPS) - Math.round((tick * 1000) / FPS)
    tick++
    await page.clock.runFor(dt)
    await flush()
    const vt = Math.round((tick * 1000) / FPS)
    await page.evaluate(syncAnimations, vt)
    await waitTiles()
    await page.evaluate(syncCaret, caretOn(vt))
    if (seg) await shoot()
  }
}

async function shoot() {
  const keep = !PREVIEW || seg.n % PREVIEW === 0
  if (keep) {
    const file = path.join(seg.dir, `${String(seg.n).padStart(6, '0')}.jpg`)
    await page.screenshot({ path: file, type: 'jpeg', quality: PREVIEW ? 80 : 95, caret: 'initial', scale: PREVIEW ? 'css' : 'device' })
  }
  seg.frames.push([seg.n, +mouse.x.toFixed(1), +mouse.y.toFixed(1), mouse.down ? 1 : 0])
  seg.n++
}

// ───────── Gestes ─────────

const loc = (target) => (typeof target === 'string' ? page.locator(target).first() : target.first())
const mark = (type, label) => seg?.events.push({ f: seg.n, type, label, x: +mouse.x.toFixed(1), y: +mouse.y.toFixed(1) })

async function point(target, { fx = 0.5, fy = 0.5 } = {}) {
  const box = await loc(target).boundingBox()
  if (!box) throw new Error(`Introuvable : ${target}`)
  return { x: box.x + box.width * fx, y: box.y + box.height * fy, box }
}

async function scrollWindow(toY, frames = 40) {
  const y0 = await page.evaluate(() => scrollY)
  const max = await page.evaluate(() => document.documentElement.scrollHeight - innerHeight)
  const y1 = Math.max(0, Math.min(max, toY))
  if (Math.abs(y1 - y0) < 2) return
  mark('scroll', `${Math.round(y0)}→${Math.round(y1)}`)
  for (let i = 1; i <= frames; i++) {
    await page.evaluate((y) => scrollTo(0, y), y0 + (y1 - y0) * ease(i / frames))
    await step()
  }
}

async function scrollInside(container, child, frames = 30) {
  const delta = await page.evaluate(([c, k]) => {
    const box = document.querySelector(c), el = document.querySelector(k)
    const b = box.getBoundingClientRect(), e = el.getBoundingClientRect()
    if (e.top >= b.top + 8 && e.bottom <= b.bottom - 8) return 0
    return e.top - b.top - 12
  }, [container, child])
  if (!delta) return
  const s0 = await page.evaluate((c) => document.querySelector(c).scrollTop, container)
  mark('scroll-list', String(Math.round(delta)))
  for (let i = 1; i <= frames; i++) {
    await page.evaluate(([c, s]) => { document.querySelector(c).scrollTop = s }, [container, s0 + delta * ease(i / frames)])
    await step()
  }
}

// Rangée qui défile horizontalement (filtres de la carte en mobile) : on amène le bouton à l'écran.
async function revealX(target, frames = 30) {
  const handle = await loc(target).elementHandle()
  const plan = await handle.evaluate((el) => {
    let row = el.parentElement
    while (row && getComputedStyle(row).overflowX !== 'auto') row = row.parentElement
    if (!row) return null
    const r = row.getBoundingClientRect(), e = el.getBoundingClientRect()
    if (e.left >= r.left + 8 && e.right <= r.right - 8) return null
    row.dataset.capRow = '1'
    return { from: row.scrollLeft, by: e.left - r.left - 16 }
  })
  if (!plan) return
  mark('scroll-x', String(Math.round(plan.by)))
  for (let i = 1; i <= frames; i++) {
    await page.evaluate((x) => { document.querySelector('[data-cap-row]').scrollLeft = x }, plan.from + plan.by * ease(i / frames))
    await step()
  }
}

// Amène la cible dans la zone visible (sous l'en-tête collant, au-dessus de la barre mobile).
async function reveal(target, at = null, frames = 40) {
  const { box } = await point(target)
  const vh = F.viewport.height
  const inView = box.y >= F.top && box.y + box.height <= vh - F.bottom
  if (inView && at === null) return
  const y = await page.evaluate(() => scrollY)
  const want = at === null ? F.top + 24 : vh * at
  await scrollWindow(y + box.y - want, frames)
}

async function moveTo(target, frames = 30, opts = {}) {
  const { x, y } = await point(target, opts)
  const x0 = mouse.x, y0 = mouse.y
  const dx = x - x0, dy = y - y0, len = Math.hypot(dx, dy) || 1
  const bend = Math.min(70, len * 0.16) // trajectoire légèrement courbe, comme une main
  const cx = (x0 + x) / 2 - (dy / len) * bend, cy = (y0 + y) / 2 + (dx / len) * bend
  for (let i = 1; i <= frames; i++) {
    const t = ease(i / frames)
    mouse.x = (1 - t) * (1 - t) * x0 + 2 * (1 - t) * t * cx + t * t * x
    mouse.y = (1 - t) * (1 - t) * y0 + 2 * (1 - t) * t * cy + t * t * y
    if (!touch) await page.mouse.move(mouse.x, mouse.y)
    await step()
  }
}

async function click(target, { frames = 28, label, hold = 6, fx, fy, noReveal = false } = {}) {
  if (!noReveal) await reveal(target)
  await moveTo(target, frames, { fx, fy })
  mark('click', label)
  lastInput = Math.round((tick * 1000) / FPS)
  if (touch) {
    await page.touchscreen.tap(mouse.x, mouse.y)
    await step(hold)
  } else {
    await page.mouse.down(); mouse.down = true
    await step(hold)
    await page.mouse.up(); mouse.down = false
  }
}

async function type(text, perChar = 3, label) {
  mark('type-start', label)
  for (const ch of text) {
    await page.keyboard.type(ch)
    lastInput = Math.round((tick * 1000) / FPS)
    mark('key')
    await step(perChar)
  }
  mark('type-end', label)
}


async function segment(name, fn) {
  const film = !ONLY || ONLY.includes(name)
  if (film) {
    const dir = path.join(HERE, 'out', FORMAT, name)
    await fs.rm(dir, { recursive: true, force: true })
    await fs.mkdir(dir, { recursive: true })
    seg = { name, dir, n: 0, frames: [], events: [] }
  }
  const t = Date.now()
  await fn()
  if (film) {
    const log = {
      segment: name, format: FORMAT, fps: FPS, viewport: F.viewport, deviceScaleFactor: F.deviceScaleFactor,
      url: URL, clock: T0.toISOString(), timezone: 'America/Toronto', preview: PREVIEW || undefined,
      frameCount: seg.n, frames: '[image, x, y, appui] en px CSS de la fenêtre', cursor: seg.frames, events: seg.events,
    }
    await fs.mkdir(path.join(HERE, 'logs', FORMAT), { recursive: true })
    await fs.writeFile(path.join(HERE, 'logs', FORMAT, `${name}.json`), JSON.stringify(log))
    console.log(`${name.padEnd(12)} ${String(seg.n).padStart(4)} images (${(seg.n / FPS).toFixed(1)} s)  en ${((Date.now() - t) / 1000).toFixed(0)} s`)
    seg = null
  }
}

// ───────── Lancement ─────────

const browser = await chromium.launch()
const context = await browser.newContext({
  viewport: F.viewport, deviceScaleFactor: PREVIEW ? 1 : F.deviceScaleFactor, isMobile: F.isMobile, hasTouch: F.hasTouch,
  locale: 'fr-CA', timezoneId: 'America/Toronto', colorScheme: 'light', reducedMotion: 'no-preference',
})
// Défilements instantanés : c'est la capture qui les anime, image par image.
await context.addInitScript(() => {
  const force = () => document.documentElement?.style.setProperty('scroll-behavior', 'auto', 'important')
  force(); document.addEventListener('DOMContentLoaded', force)
  const ws = window.scrollTo.bind(window)
  window.scrollTo = (a, b) => (a && typeof a === 'object' ? ws({ ...a, behavior: 'instant' }) : ws(a, b))
  const siv = Element.prototype.scrollIntoView
  Element.prototype.scrollIntoView = function (o) { return siv.call(this, o && typeof o === 'object' ? { ...o, behavior: 'instant' } : o) }
})
page = await context.newPage()
await page.clock.install({ time: T0 })
for (let attempt = 1; ; attempt++) { // le site doit être chargé avant de figer l'horloge ; on réessaie si le réseau flanche
  try {
    await page.goto(URL, { waitUntil: 'networkidle', timeout: 60000 })
    await page.waitForSelector('#intro-next', { timeout: 20000 })
    break
  } catch (err) {
    if (attempt >= 3) throw err
    console.log(`chargement raté (essai ${attempt}), on réessaie`)
  }
}
await page.evaluate(() => document.fonts.ready)
await page.clock.pauseAt(new Date(T0.getTime() + 60_000))
if (!touch) await page.mouse.move(mouse.x, mouse.y)

// 1 · Arrivée : les cinq diapos
await segment('1-arrivee', async () => {
  mark('marker', 'diapo-1')
  await step(150)
  for (let i = 2; i <= 5; i++) {
    await click('#intro-next', { frames: i === 2 ? 34 : 8, label: `suivant-${i}` })
    mark('marker', `diapo-${i}`)
    await step(30)
  }
  await click('#intro-next', { frames: 8, label: 'creer-mon-espace' })
  await step(24)
})

// 2 · Création du compte
await segment('2-compte', async () => {
  await step(36)
  await click('#prenom', { frames: 34, label: 'prenom' }); await type(DATA.prenom, 4, 'prenom')
  await click('#email', { frames: 22, label: 'email' }); await type(DATA.email, 2, 'email')
  await click('#pass1', { frames: 20, label: 'mot-de-passe' }); await type(DATA.pass, 3, 'mot-de-passe')
  mark('marker', 'fort')
  await step(16)
  await click('#pass2', { frames: 16, label: 'confirmation' }); await type(DATA.pass, 1, 'confirmation')
  await click('#create', { frames: 26, label: 'creer-mon-compte' })
  await until(() => !!document.querySelector('#etapes')) // chiffrement réel (PBKDF2), puis la fenêtre s'ouvre
  await step(6)
})

// 3 · La fenêtre des étapes, dans l'ordre
await segment('3-etapes', async () => {
  await step(54)
  for (let i = 2; i <= 8; i++) {
    await click('#etape-next', { frames: i === 2 ? 30 : 6, label: `etape-${i}`, noReveal: true })
    mark('marker', `etape-${i}`)
    await step(14)
  }
  await step(16)
  await click('#etape-next', { frames: 8, label: 'c-est-compris', noReveal: true })
  await step(30)
})

// Invisible : l'accueil a joué son arrivée derrière la fenêtre des étapes ; on rejoue ses propres animations.
await page.evaluate(() => document.querySelectorAll('main *').forEach((el) => el.getAnimations().forEach((a) => { delete a.__vt0 })))

// 4 · Accueil
await segment('4-accueil', async () => {
  await step(84)
  await click(page.getByRole('button', { name: /Écrire mon récit/ }), { frames: 36, label: 'ecrire-mon-recit', fx: 0.3 })
  await step(8)
})

// 5 · Mon récit (aucun texte de récit n'est tapé)
await segment('5-recit', async () => {
  await step(54)
  await click(page.getByText('Je ne sais pas exactement'), { frames: 30, label: 'je-ne-sais-pas', fx: 0.1 })
  await step(18)
  await click('textarea', { frames: 26, label: 'ce-dont-je-me-souviens', fx: 0.3, fy: 0.3 })
  await step(40)
  await reveal(page.getByText('Ce dont j’ai besoin maintenant'), 0.3, 44)
  for (const b of ['Parler à quelqu’un', 'Un examen médical', 'Un conseil juridique']) {
    await click(page.getByRole('button', { name: b, exact: true }), { frames: 18, label: b })
    await step(6)
  }
  await step(60) // enregistrement chiffré automatique (600 ms), la pastille se met à jour
  mark('marker', 'chiffre')
  await step(20)
  await click(page.getByRole('button', { name: /Où aller maintenant/ }), { frames: 30, label: 'ou-aller-maintenant' })
  await step(4)
})

// 6 · Où aller : un centre désigné, puis du soutien
await segment('6-ou-aller', async () => {
  await until(() => !!document.querySelector('.leaflet-container'), 1500) // chargement différé de la carte
  await step(50)
  const filters = page.getByRole('button', { name: 'Examens médicaux', exact: true })
  await reveal(filters, touch ? 0.12 : 0.2, 44)
  await click(filters, { frames: 30, label: 'filtre-examens', noReveal: true })
  await step(66)
  await click('#res-cdvasim', { frames: 30, label: 'cdvasim', fy: 0.18 })
  await step(70)
  if (touch) await reveal('#map', 0.1, 40)
  await step(touch ? 40 : 0)
  const soutien = page.getByRole('button', { name: 'Soutien psychologique', exact: true })
  if (touch) { await reveal(soutien, 0.12, 40); await revealX(soutien) }
  await click(soutien, { frames: 30, label: 'filtre-soutien' })
  await step(54)
  if (!touch) await scrollInside('ul.space-y-3', '#res-treve')
  await click('#res-treve', { frames: 30, label: 'calacs-treve', fy: 0.18 })
  await step(40)
  if (!touch) await scrollInside('ul.space-y-3', '#res-cavac')
  await click('#res-cavac', { frames: 24, label: 'cavac', fy: 0.18 })
  await step(touch ? 30 : 74)
  if (touch) { await reveal('#map', 0.1, 40); await step(40) }
  mark('marker', 'fin-carte')
  await click(tab('dossier'), { frames: 34, label: 'mon-dossier', noReveal: true })
  await step(4)
})

// 7 · Mon dossier : sections, consentement, double confirmation, envoi simulé
await segment('7-dossier', async () => {
  await step(50)
  await click(page.getByRole('button', { name: /Examens prioritaires/ }), { frames: 30, label: 'interrupteur-examens', fx: 0.92 })
  await step(16)
  await click('#consent-send', { frames: 26, label: 'consentement-1', fx: 0.04, fy: 0.3 })
  await step(8)
  await click('#consent-beta', { frames: 14, label: 'consentement-2', fx: 0.04, fy: 0.3 })
  await step(12)
  await click('#send', { frames: 26, label: 'envoyer-a-rebatir' })
  await step(32)
  await click('#confirm-send', { frames: 22, label: 'oui-envoyer', noReveal: true })
  await until(() => !!document.querySelector('#send-progress'))
  await step(40)
  await reveal('#send-progress', touch ? 0.12 : 0.18, 36)
  await step(170) // 4 étapes (0,9 + 0,9 + 1,1 s), accusé de réception, puis le rappel apparaît
})

// 8 · Choix du créneau de rappel
await segment('8-rappel', async () => {
  await reveal('#rappel', 0.16, 44)
  await step(24)
  await click(page.getByRole('button', { name: 'Demain', exact: true }), { frames: 30, label: 'demain' })
  await step(18)
  await click(page.getByRole('option', { name: '10 h 00' }), { frames: 24, label: '10-h-00' })
  await step(12)
  await click('#rappel-phone', { frames: 24, label: 'telephone', fx: 0.6 })
  await page.keyboard.press('End')
  await type(DATA.phone, 2, 'telephone')
  await step(8)
  await click(page.getByRole('button', { name: 'Une avocate (femme) si possible' }), { frames: 26, label: 'avocate' })
  await step(10)
  await click(page.getByRole('button', { name: 'Un ou une interprète' }), { frames: 20, label: 'interprete' })
  await step(14)
  await click('#rappel-confirm', { frames: 26, label: 'confirmer' })
  await until(() => !!document.querySelector('#rappel-ok'))
  await step(30)
  await reveal('#rappel-ok', touch ? 0.2 : 0.3, 30)
  await step(90)
})

await browser.close()
