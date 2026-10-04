// Coffre local chiffré : PBKDF2 (SHA-256, 310 000 itérations) puis AES-GCM 256 bits.
// La phrase secrète ne quitte jamais l'appareil ; rien n'est envoyé à un serveur.
const KEY = 'boussole.vault.v1'
const enc = new TextEncoder()
const dec = new TextDecoder()
const b64 = (u: Uint8Array) => btoa(String.fromCharCode(...u))
const unb64 = (s: string) => Uint8Array.from(atob(s), (c) => c.charCodeAt(0))

type Sealed = { v: 1; salt: string; iv: string; ct: string; updatedAt: string }

async function derive(pass: string, salt: Uint8Array) {
  const base = await crypto.subtle.importKey('raw', enc.encode(pass), 'PBKDF2', false, ['deriveKey'])
  return crypto.subtle.deriveKey({ name: 'PBKDF2', salt: salt as BufferSource, iterations: 310_000, hash: 'SHA-256' }, base, { name: 'AES-GCM', length: 256 }, false, ['encrypt', 'decrypt'])
}

export type VaultSession = { key: CryptoKey; salt: Uint8Array }

export function vaultExists() {
  try { return !!localStorage.getItem(KEY) } catch { return false }
}

export function vaultInfo(): { updatedAt: string } | null {
  try { const raw = localStorage.getItem(KEY); return raw ? { updatedAt: (JSON.parse(raw) as Sealed).updatedAt } : null } catch { return null }
}

export async function createVault(pass: string): Promise<VaultSession> {
  const salt = crypto.getRandomValues(new Uint8Array(16))
  return { key: await derive(pass, salt), salt }
}

export async function openVault<T>(pass: string): Promise<{ session: VaultSession; data: T }> {
  const sealed = JSON.parse(localStorage.getItem(KEY) || 'null') as Sealed | null
  if (!sealed) throw new Error('absent')
  const salt = unb64(sealed.salt)
  const key = await derive(pass, salt)
  const plain = await crypto.subtle.decrypt({ name: 'AES-GCM', iv: unb64(sealed.iv) as BufferSource }, key, unb64(sealed.ct) as BufferSource)
  return { session: { key, salt }, data: JSON.parse(dec.decode(plain)) as T }
}

export async function saveVault(session: VaultSession, data: unknown) {
  const iv = crypto.getRandomValues(new Uint8Array(12))
  const ct = new Uint8Array(await crypto.subtle.encrypt({ name: 'AES-GCM', iv: iv as BufferSource }, session.key, enc.encode(JSON.stringify(data))))
  const sealed: Sealed = { v: 1, salt: b64(session.salt), iv: b64(iv), ct: b64(ct), updatedAt: new Date().toISOString() }
  localStorage.setItem(KEY, JSON.stringify(sealed))
  return sealed
}

export async function sealForTransfer(data: unknown) {
  // Paquet de transmission : clé aléatoire à usage unique, transmise hors bande en production.
  const key = await crypto.subtle.generateKey({ name: 'AES-GCM', length: 256 }, true, ['encrypt'])
  const iv = crypto.getRandomValues(new Uint8Array(12))
  const bytes = enc.encode(JSON.stringify(data))
  const ct = new Uint8Array(await crypto.subtle.encrypt({ name: 'AES-GCM', iv: iv as BufferSource }, key, bytes))
  const digest = new Uint8Array(await crypto.subtle.digest('SHA-256', ct))
  return { size: ct.byteLength, fingerprint: [...digest].map((b) => b.toString(16).padStart(2, '0')).join('') }
}

export function wipeVault() {
  try { localStorage.removeItem(KEY) } catch { /* rien */ }
}
