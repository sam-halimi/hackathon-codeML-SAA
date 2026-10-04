// Comptes locaux chiffrés (bêta) : l'email identifie le compte, le mot de passe dérive la clé.
// PBKDF2 (SHA-256, 310 000 itérations) puis AES-GCM 256 bits. Rien n'est envoyé à un serveur.
const PREFIX = 'boussole.compte.v2:'
const enc = new TextEncoder()
const dec = new TextDecoder()
const b64 = (u: Uint8Array) => btoa(String.fromCharCode(...u))
const unb64 = (s: string) => Uint8Array.from(atob(s), (c) => c.charCodeAt(0))

type Sealed = { v: 2; salt: string; iv: string; ct: string; updatedAt: string }
export type VaultSession = { key: CryptoKey; salt: Uint8Array; storageKey: string }

async function sha256hex(s: string) {
  const d = new Uint8Array(await crypto.subtle.digest('SHA-256', enc.encode(s)))
  return [...d].map((b) => b.toString(16).padStart(2, '0')).join('')
}
const normEmail = (e: string) => e.trim().toLowerCase()
async function storageKeyFor(email: string) {
  return PREFIX + (await sha256hex('boussole:' + normEmail(email)))
}
async function derive(pass: string, salt: Uint8Array) {
  const base = await crypto.subtle.importKey('raw', enc.encode(pass), 'PBKDF2', false, ['deriveKey'])
  return crypto.subtle.deriveKey({ name: 'PBKDF2', salt: salt as BufferSource, iterations: 310_000, hash: 'SHA-256' }, base, { name: 'AES-GCM', length: 256 }, false, ['encrypt', 'decrypt'])
}

export function anyAccount() {
  try {
    for (let i = 0; i < localStorage.length; i++) if (localStorage.key(i)?.startsWith(PREFIX)) return true
  } catch { /* stockage indisponible */ }
  return false
}

export const isEmail = (e: string) => /^[^\s@]+@[^\s@]+\.[^\s@]{2,}$/.test(e.trim())

export async function createAccount(email: string, pass: string, data: unknown): Promise<VaultSession> {
  const storageKey = await storageKeyFor(email)
  if (localStorage.getItem(storageKey)) throw new Error('existe')
  const salt = crypto.getRandomValues(new Uint8Array(16))
  const session = { key: await derive(pass, salt), salt, storageKey }
  await saveVault(session, data)
  return session
}

export async function login<T>(email: string, pass: string): Promise<{ session: VaultSession; data: T; updatedAt: string }> {
  const storageKey = await storageKeyFor(email)
  const sealed = JSON.parse(localStorage.getItem(storageKey) || 'null') as Sealed | null
  if (!sealed) throw new Error('inconnu')
  const salt = unb64(sealed.salt)
  const key = await derive(pass, salt)
  const plain = await crypto.subtle.decrypt({ name: 'AES-GCM', iv: unb64(sealed.iv) as BufferSource }, key, unb64(sealed.ct) as BufferSource)
  return { session: { key, salt, storageKey }, data: JSON.parse(dec.decode(plain)) as T, updatedAt: sealed.updatedAt }
}

export async function saveVault(session: VaultSession, data: unknown) {
  const iv = crypto.getRandomValues(new Uint8Array(12))
  const ct = new Uint8Array(await crypto.subtle.encrypt({ name: 'AES-GCM', iv: iv as BufferSource }, session.key, enc.encode(JSON.stringify(data))))
  const sealed: Sealed = { v: 2, salt: b64(session.salt), iv: b64(iv), ct: b64(ct), updatedAt: new Date().toISOString() }
  localStorage.setItem(session.storageKey, JSON.stringify(sealed))
  return sealed
}

export function deleteAccount(session: VaultSession) {
  try { localStorage.removeItem(session.storageKey) } catch { /* rien */ }
}

export async function sealForTransfer(data: unknown) {
  // Paquet de transmission : clé aléatoire à usage unique, remise hors bande en production.
  const key = await crypto.subtle.generateKey({ name: 'AES-GCM', length: 256 }, true, ['encrypt'])
  const iv = crypto.getRandomValues(new Uint8Array(12))
  const ct = new Uint8Array(await crypto.subtle.encrypt({ name: 'AES-GCM', iv: iv as BufferSource }, key, enc.encode(JSON.stringify(data))))
  return { size: ct.byteLength, fingerprint: await sha256hex(b64(ct)) }
}

// Solidité du mot de passe : longueur + variété (minuscules, majuscules, chiffres, symboles).
export function passwordStrength(p: string): { score: 0 | 1 | 2 | 3; label: string } {
  if (!p) return { score: 0, label: '' }
  const classes = [/[a-z]/, /[A-Z]/, /\d/, /[^A-Za-z0-9]/].filter((r) => r.test(p)).length
  if (p.length < 8) return { score: 1, label: 'Trop court (8 caractères minimum)' }
  if (p.length >= 14 || (p.length >= 10 && classes >= 2) || (p.length >= 8 && classes >= 3)) return { score: 3, label: 'Fort' }
  return { score: 2, label: 'Moyen : ajoutez un chiffre ou une majuscule' }
}
