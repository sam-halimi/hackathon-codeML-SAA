import type { Plugin } from 'vite'
import Anthropic from '@anthropic-ai/sdk'

// Route locale /api/timeline (serveur de dev seulement) : la clé API reste côté serveur.
// Le site public (statique) n'a pas cette route et utilise la réponse pré-enregistrée.

const SYSTEM = `Tu es un assistant de structuration documentaire pour une équipe soignante qui accueille une personne victime d'agression sexuelle.
Ta seule tâche : transformer des notes libres (déjà pseudonymisées) en chronologie factuelle.
Règles absolues :
- Ne désigne jamais de coupable, ne qualifie jamais juridiquement les faits, ne pose aucun diagnostic.
- N'évalue jamais la crédibilité de la personne. Ne signale JAMAIS une contradiction ou un oubli dans le récit de la personne comme un problème.
- Les trous de mémoire du récit sont des "informations non disponibles", décrits de façon neutre (fréquents après un traumatisme ou une substance).
- Les "incohérences" ne concernent que le DOSSIER (horodatages de soins, prélèvements, documents, signatures) — jamais la parole de la personne.
- Chaque événement doit citer mot pour mot la phrase source ; n'invente aucun fait.
- Tout est une suggestion soumise à validation humaine.
Réponds en français.`

const SCHEMA = {
  type: 'object',
  additionalProperties: false,
  required: ['events', 'gaps', 'inconsistencies'],
  properties: {
    events: {
      type: 'array',
      items: {
        type: 'object',
        additionalProperties: false,
        required: ['time', 'description', 'source', 'origin'],
        properties: {
          time: { type: 'string', description: 'Heure ou moment, ex. "J 22 h 45"' },
          description: { type: 'string' },
          source: { type: 'string', description: 'Citation exacte de la phrase source' },
          origin: { type: 'string', description: 'Récit de la personne, note de triage, note infirmière…' },
        },
      },
    },
    gaps: {
      type: 'array',
      items: {
        type: 'object',
        additionalProperties: false,
        required: ['from', 'to', 'note'],
        properties: { from: { type: 'string' }, to: { type: 'string' }, note: { type: 'string' } },
      },
    },
    inconsistencies: {
      type: 'array',
      items: {
        type: 'object',
        additionalProperties: false,
        required: ['description', 'sources', 'suggestion'],
        properties: {
          description: { type: 'string' },
          sources: { type: 'array', items: { type: 'string' } },
          suggestion: { type: 'string' },
        },
      },
    },
  },
} as const

export function timelineApi(): Plugin {
  return {
    name: 'timeline-api',
    configureServer(server) {
      server.middlewares.use('/api/timeline', async (req, res) => {
        if (req.method !== 'POST') { res.statusCode = 405; res.end(); return }
        let body = ''
        for await (const chunk of req) body += chunk
        try {
          const { notes } = JSON.parse(body) as { notes: string }
          if (!process.env.ANTHROPIC_API_KEY) throw new Error('no-key')
          const client = new Anthropic()
          const response = await client.messages.create({
            model: 'claude-sonnet-5-5',
            max_tokens: 16000,
            system: SYSTEM,
            output_config: { effort: 'low', format: { type: 'json_schema', schema: SCHEMA } },
            messages: [{ role: 'user', content: `Notes (pseudonymisées) :\n\n${notes}` }],
          })
          if (response.stop_reason === 'refusal') throw new Error('refusal')
          const text = response.content.find((b) => b.type === 'text')
          if (!text || text.type !== 'text') throw new Error('empty')
          res.setHeader('Content-Type', 'application/json')
          res.end(JSON.stringify({ live: true, model: response.model, result: JSON.parse(text.text) }))
        } catch (e) {
          res.statusCode = 503
          res.setHeader('Content-Type', 'application/json')
          res.end(JSON.stringify({ live: false, error: e instanceof Error ? e.message : 'error' }))
        }
      })
    },
  }
}
