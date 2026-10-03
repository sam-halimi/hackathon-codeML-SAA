import { DEMO_IDENTITY } from './demoCase'

// Remplace les identifiants AVANT tout envoi au modèle d'IA.
// En production : NER + listes de l'établissement ; ici, identifiants connus + motifs.
export function pseudonymize(text: string, id = DEMO_IDENTITY): { text: string; count: number } {
  let count = 0
  const rep = (s: string, re: RegExp, tag: string) =>
    s.replace(re, () => {
      count++
      return tag
    })
  const esc = (s: string) => s.replace(/[.*+?^${}()|[\]\\]/g, '\\$&')
  let out = text
  out = rep(out, new RegExp(esc(id.address), 'g'), '[LIEU]')
  out = rep(out, new RegExp(esc(id.name), 'g'), '[PATIENTE]')
  out = rep(out, new RegExp(`\\b${esc(id.firstName)}\\b`, 'g'), '[PATIENTE]')
  out = rep(out, new RegExp(`\\b${esc(id.lastName)}\\b`, 'g'), '[PATIENTE]')
  out = rep(out, /née? le \d{2}\/\d{2}\/\d{4}/g, 'née le [DATE]')
  out = rep(out, /\b\d{3}-\d{3}-\d{4}\b/g, '[TÉLÉPHONE]')
  return { text: out, count }
}
