// Journal de chaîne de conservation : ajout seul, chaque entrée scellée par
// SHA-256(hash précédent + contenu). Toute modification casse la chaîne.
export type Entry = {
  index: number
  timestamp: string
  actor: string
  action: string
  details: string
  prevHash: string
  hash: string
}

const GENESIS = '0'.repeat(64)

async function sha256(s: string): Promise<string> {
  const buf = await crypto.subtle.digest('SHA-256', new TextEncoder().encode(s))
  return [...new Uint8Array(buf)].map((b) => b.toString(16).padStart(2, '0')).join('')
}

const payload = (e: Omit<Entry, 'hash'>) =>
  JSON.stringify([e.index, e.timestamp, e.actor, e.action, e.details, e.prevHash])

export async function appendEntry(log: Entry[], actor: string, action: string, details: string): Promise<Entry[]> {
  const prevHash = log.length ? log[log.length - 1].hash : GENESIS
  const base = { index: log.length, timestamp: new Date().toISOString(), actor, action, details, prevHash }
  return [...log, { ...base, hash: await sha256(payload(base)) }]
}

export async function verifyLog(log: Entry[]): Promise<{ ok: boolean; brokenAt: number | null }> {
  let prev = GENESIS
  for (const e of log) {
    if (e.prevHash !== prev || (await sha256(payload(e))) !== e.hash) return { ok: false, brokenAt: e.index }
    prev = e.hash
  }
  return { ok: true, brokenAt: null }
}
