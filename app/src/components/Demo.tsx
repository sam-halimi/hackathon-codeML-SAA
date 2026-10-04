import { useEffect, useMemo, useRef, useState } from 'react'
import { appendEntry, verifyLog, type Entry } from '../lib/custody'
import { computeChecklist, RULES_VERSION, type Intake, type Status } from '../lib/rules'
import { DEMO_NOTES } from '../lib/demoCase'
import { pseudonymize } from '../lib/pseudonymize'
import { TIMELINE_FIXTURE, type TimelineResult } from '../lib/timelineFixture'

const STEPS = ['Consentement', 'Dossier guidé', 'Prélèvements', 'Chronologie', 'Export'] as const
const ACTOR = 'Inf. M. Roy (fictif)'

type Consent = { examen: boolean; prelevements: boolean; conservation: boolean; transmission: boolean }
const CONSENT_LABELS: Record<keyof Consent, [string, string]> = {
  examen: ['Examen médical', 'Soins et évaluation médicale.'],
  prelevements: ['Prélèvements médicolégaux', 'Chaque prélèvement peut être refusé individuellement.'],
  conservation: ['Conservation de la trousse', 'Les preuves sont conservées ; la décision de porter plainte peut venir plus tard.'],
  transmission: ['Transmission à la police', 'Seulement si la personne le décide. Peut être accordée plus tard.'],
}

type Decision = 'pending' | 'ok' | 'rejected'

export default function Demo() {
  const [step, setStep] = useState(0)
  const [log, setLog] = useState<Entry[]>([])
  const [integrity, setIntegrity] = useState<{ ok: boolean; brokenAt: number | null }>({ ok: true, brokenAt: null })
  const [consent, setConsent] = useState<Consent>({ examen: false, prelevements: false, conservation: false, transmission: false })
  const [intake, setIntake] = useState<Intake>({ hoursSince: 30, substance: true, exposure: true, pregnancyRisk: true, injuries: false, showered: false })
  const [done, setDone] = useState<Record<string, boolean>>({})
  const [notes, setNotes] = useState(DEMO_NOTES)
  const [showAiView, setShowAiView] = useState(false)
  const [timeline, setTimeline] = useState<TimelineResult | null>(null)
  const [source, setSource] = useState<'live' | 'fixture' | null>(null)
  const [loading, setLoading] = useState(false)
  const [decisions, setDecisions] = useState<Record<string, Decision>>({})

  // File d'attente : chaque entrée est chaînée à la précédente, même si les clics s'enchaînent.
  const queue = useRef<Promise<Entry[]>>(Promise.resolve([]))
  const log_ = (action: string, details: string) => {
    queue.current = queue.current.then((prev) => appendEntry(prev, ACTOR, action, details))
    return queue.current.then(setLog)
  }
  useEffect(() => {
    verifyLog(log).then(setIntegrity)
  }, [log])

  const checklist = useMemo(() => computeChecklist(intake), [intake])
  const pseudo = useMemo(() => pseudonymize(notes), [notes])

  const toggleConsent = async (k: keyof Consent) => {
    const v = !consent[k]
    setConsent({ ...consent, [k]: v })
    await log_(v ? 'Consentement accordé' : 'Consentement retiré', CONSENT_LABELS[k][0])
  }

  const generate = async () => {
    setLoading(true)
    await log_('Chronologie demandée à l’IA', `Texte pseudonymisé (${pseudo.count} identifiants masqués)`)
    try {
      const r = await fetch('/api/timeline', { method: 'POST', headers: { 'Content-Type': 'application/json' }, body: JSON.stringify({ notes: pseudo.text }) })
      const j = await r.json()
      if (!j.live) throw new Error(j.error)
      setTimeline(j.result)
      setSource('live')
    } catch {
      await new Promise((res) => setTimeout(res, 1200))
      setTimeline(TIMELINE_FIXTURE)
      setSource('fixture')
    }
    setDecisions({})
    setLoading(false)
  }

  const decide = async (key: string, label: string, d: Decision) => {
    setDecisions({ ...decisions, [key]: d })
    await log_(d === 'ok' ? 'Suggestion IA validée' : 'Suggestion IA rejetée', label)
  }

  const canProceed = consent.examen

  return (
    <div className="min-h-screen">
      <div className="bg-alert text-white text-center text-sm font-semibold py-1.5 tracking-wide no-print" id="banner">
        DONNÉES 100 % FICTIVES · PROTOTYPE DE DÉMONSTRATION · NE PAS UTILISER EN SOINS RÉELS
      </div>
      <header className="bg-navy text-cream no-print">
        <div className="max-w-6xl mx-auto px-4 py-3 flex items-center justify-between gap-4 flex-wrap">
          <a href="#/" className="flex items-center gap-2 font-bold text-lg">
            <Logo /> Boussole
          </a>
          <div className="flex items-center gap-3 text-xs">
            <span className="px-2 py-1 rounded bg-amber/20 text-amber border border-amber/40">L'IA suggère · l'humain valide</span>
            <span className={`px-2 py-1 rounded border ${integrity.ok ? 'border-ok/60 text-[#8fd3ad]' : 'border-alert text-alert'}`} id="integrity-chip">
              Journal : {log.length} entrées · {integrity.ok ? 'intègre ✓' : `ALTÉRÉ à l'entrée ${integrity.brokenAt}`}
            </span>
          </div>
        </div>
        <nav className="max-w-6xl mx-auto px-4 flex gap-1 overflow-x-auto">
          {STEPS.map((s, i) => (
            <button
              key={s}
              id={`tab-${i}`}
              disabled={i > 0 && !canProceed}
              onClick={() => setStep(i)}
              className={`px-4 py-2 text-sm rounded-t-md whitespace-nowrap ${step === i ? 'bg-cream text-navy font-semibold' : 'text-cream/70 hover:text-cream disabled:opacity-30'}`}
            >
              {i + 1}. {s}
            </button>
          ))}
        </nav>
      </header>

      <main className="max-w-6xl mx-auto px-4 py-6">
        <div className="mb-4 text-sm text-navy/70">
          Dossier <b>#DEMO-0042</b> · Patiente : <b>[cas fictif « Léa »]</b> · Centre désigné (fictif)
        </div>

        {step === 0 && (
          <Card title="Consentement, étape par étape" subtitle="La personne garde le contrôle. Chaque choix est horodaté dans le journal.">
            <div className="grid sm:grid-cols-2 gap-3">
              {(Object.keys(CONSENT_LABELS) as (keyof Consent)[]).map((k) => (
                <label key={k} id={`consent-${k}`} className={`flex gap-3 p-4 rounded-lg border cursor-pointer transition ${consent[k] ? 'border-ok bg-ok/10' : 'border-navy/15 bg-white'}`}>
                  <input type="checkbox" className="mt-1 accent-[#3E8E63] w-5 h-5" checked={consent[k]} onChange={() => toggleConsent(k)} />
                  <span>
                    <span className="font-semibold block">{CONSENT_LABELS[k][0]}</span>
                    <span className="text-sm text-navy/70">{CONSENT_LABELS[k][1]}</span>
                  </span>
                </label>
              ))}
            </div>
            <p className="mt-4 text-sm text-navy/70">
              💬 Rappel au soignant : proposer l'intervenante psychosociale du centre désigné, le CAVAC et le CALACS. Aucune décision n'est requise ce soir.
            </p>
            <div className="mt-4 flex justify-end">
              <Next disabled={!canProceed} onClick={() => setStep(1)} label={canProceed ? 'Continuer' : "Consentement à l'examen requis"} />
            </div>
          </Card>
        )}

        {step === 1 && (
          <Card title="Dossier guidé" subtitle="Les questions s'adaptent aux réponses. Les trous de mémoire sont acceptés sans jugement.">
            <div className="space-y-5">
              <div>
                <label className="font-semibold block mb-1">Combien de temps s'est écoulé depuis les faits ?</label>
                <div className="flex items-center gap-3">
                  <input id="hours" type="range" min={1} max={168} value={intake.hoursSince} onChange={(e) => setIntake({ ...intake, hoursSince: +e.target.value })} className="w-64 accent-[#E8A33D]" />
                  <span className="text-2xl font-bold tabular-nums">{intake.hoursSince} h</span>
                  <span className="text-sm text-navy/60">(estimation acceptée : « je ne sais pas exactement » est une réponse valide)</span>
                </div>
              </div>
              <YesNo id="q-substance" q="Une substance (drogue, médicament, alcool à son insu) est-elle soupçonnée ?" v={intake.substance} set={(v) => setIntake({ ...intake, substance: v })} />
              {intake.substance && (
                <div className="ml-4 pl-4 border-l-2 border-amber text-sm text-navy/80">
                  ↳ Question ajoutée : <b>Symptômes observés</b> (étourdissement, amnésie, somnolence) — noter sans interpréter. Les deux prélèvements toxicologiques sont ajoutés à la checklist.
                </div>
              )}
              <YesNo id="q-exposure" q="Exposition possible à des liquides biologiques ?" v={intake.exposure} set={(v) => setIntake({ ...intake, exposure: v })} />
              <YesNo id="q-pregnancy" q="Risque de grossesse ?" v={intake.pregnancyRisk} set={(v) => setIntake({ ...intake, pregnancyRisk: v })} />
              <YesNo id="q-showered" q="Douche ou bain depuis les faits ?" v={intake.showered} set={(v) => setIntake({ ...intake, showered: v })} />
              <YesNo id="q-injuries" q="Lésions visibles ?" v={intake.injuries} set={(v) => setIntake({ ...intake, injuries: v })} />
            </div>
            <div className="mt-6 flex justify-end">
              <Next
                onClick={async () => {
                  await log_('Dossier guidé complété', `${intake.hoursSince} h depuis les faits · substance : ${intake.substance ? 'oui' : 'non'}`)
                  setStep(2)
                }}
                label="Voir les prélèvements prioritaires"
              />
            </div>
          </Card>
        )}

        {step === 2 && (
          <Card
            title={`Prélèvements prioritaires — ${intake.hoursSince} h depuis les faits`}
            subtitle="Calculé par un moteur de règles (pas d'IA). Triés par urgence."
          >
            <div className="mb-4 text-xs font-semibold px-3 py-2 rounded bg-amber/15 border border-amber/50">
              ⚠ Délais PROTOTYPE, à valider par sources médicales et par le protocole de l'établissement · {RULES_VERSION}
            </div>
            {!consent.prelevements && (
              <div className="mb-4 text-sm px-3 py-2 rounded bg-alert/10 border border-alert/40">
                Consentement aux prélèvements non accordé : la liste est informative, aucun prélèvement ne peut être coché.
              </div>
            )}
            <ul className="space-y-2" id="checklist">
              {checklist.map((c) => (
                <li key={c.id} className={`flex items-center gap-4 p-3 rounded-lg border bg-white ${c.status === 'depasse' ? 'opacity-60' : ''}`}>
                  <input
                    type="checkbox"
                    className="w-5 h-5 accent-[#3E8E63]"
                    disabled={!consent.prelevements || c.status === 'depasse'}
                    checked={!!done[c.id]}
                    onChange={async () => {
                      setDone({ ...done, [c.id]: !done[c.id] })
                      await log_(done[c.id] ? 'Prélèvement décoché' : 'Prélèvement effectué et scellé', c.label)
                    }}
                  />
                  <div className="flex-1">
                    <div className="font-semibold">{c.label}</div>
                    <div className="text-xs text-navy/60">{c.why}</div>
                  </div>
                  <Badge status={c.status} remaining={c.remainingH} />
                </li>
              ))}
            </ul>
            <div className="mt-6 flex justify-end">
              <Next onClick={() => setStep(3)} label="Construire la chronologie" />
            </div>
          </Card>
        )}

        {step === 3 && (
          <Card title="Chronologie assistée par IA" subtitle="L'IA range les notes ; elle ne juge pas, ne désigne personne. Chaque ligne cite sa source et attend votre validation.">
            <div className="grid lg:grid-cols-2 gap-4">
              <div>
                <div className="flex items-center justify-between mb-1">
                  <label className="font-semibold text-sm">Notes libres (récit, triage, notes infirmières)</label>
                  <button id="ai-view" onClick={() => setShowAiView(!showAiView)} className="text-xs underline text-navy/70">
                    {showAiView ? 'Voir les notes originales' : '🔒 Ce que l’IA voit'}
                  </button>
                </div>
                {showAiView ? (
                  <div className="h-72 overflow-auto p-3 rounded-lg border-2 border-ok bg-ok/5 text-sm whitespace-pre-wrap" id="ai-view-panel">
                    <div className="text-xs font-semibold text-ok mb-2">
                      Texte réellement envoyé au modèle · {pseudo.count} identifiants masqués avant envoi
                    </div>
                    {pseudo.text.split(/(\[[A-ZÉ]+\])/g).map((part, i) =>
                      /^\[[A-ZÉ]+\]$/.test(part) ? (
                        <mark key={i} className="bg-ok text-white rounded px-1">{part}</mark>
                      ) : (
                        <span key={i}>{part}</span>
                      ),
                    )}
                  </div>
                ) : (
                  <textarea value={notes} onChange={(e) => setNotes(e.target.value)} className="w-full h-72 p-3 rounded-lg border border-navy/20 bg-white text-sm" />
                )}
                <button id="generate" onClick={generate} disabled={loading} className="mt-3 w-full py-3 rounded-lg bg-navy text-cream font-semibold hover:bg-navy-2 disabled:opacity-60">
                  {loading ? 'Structuration en cours…' : '✦ Générer la chronologie'}
                </button>
              </div>
              <div id="timeline">
                {!timeline && <div className="h-full grid place-items-center text-navy/40 text-sm border border-dashed border-navy/20 rounded-lg p-6">La chronologie proposée apparaîtra ici.</div>}
                {timeline && (
                  <div className="space-y-3">
                    <div className={`text-xs px-2 py-1 rounded inline-block ${source === 'live' ? 'bg-ok/15 text-ok' : 'bg-amber/20 text-navy'}`}>
                      {source === 'live' ? 'Réponse IA en direct (Claude)' : 'Réponse IA pré-enregistrée (démo hors ligne) — même format que la réponse en direct'}
                    </div>
                    <ol className="relative border-l-2 border-navy/20 ml-2 space-y-2">
                      {timeline.events.map((ev, i) => {
                        const key = `ev-${i}`
                        const d = decisions[key] ?? 'pending'
                        return (
                          <li key={key} className={`ml-4 p-2 rounded-md bg-white border ${d === 'ok' ? 'border-ok' : d === 'rejected' ? 'border-alert opacity-50 line-through' : 'border-navy/10'}`}>
                            <span className="absolute -left-[7px] mt-1.5 w-3 h-3 rounded-full bg-navy" />
                            <div className="flex justify-between gap-2">
                              <div>
                                <span className="text-xs font-mono text-navy/60">{ev.time}</span> <b className="text-sm">{ev.description}</b>
                                <div className="text-xs text-navy/60 italic">« {ev.source} » — {ev.origin}</div>
                              </div>
                              <Validate d={d} onOk={() => decide(key, ev.description, 'ok')} onNo={() => decide(key, ev.description, 'rejected')} />
                            </div>
                          </li>
                        )
                      })}
                    </ol>
                    {timeline.gaps.map((g, i) => (
                      <div key={`gap-${i}`} className="p-3 rounded-md border border-dashed border-navy/40 bg-navy/5 text-sm" id={`gap-${i}`}>
                        <b>◌ Information non disponible : {g.from} → {g.to}</b>
                        <div className="text-navy/70">{g.note}</div>
                      </div>
                    ))}
                    {timeline.inconsistencies.map((c, i) => {
                      const key = `inc-${i}`
                      const d = decisions[key] ?? 'pending'
                      return (
                        <div key={key} className="p-3 rounded-md border-2 border-alert/70 bg-alert/5 text-sm" id={`inc-${i}`}>
                          <div className="flex justify-between gap-2">
                            <b>⚠ Incohérence du dossier (pas du récit)</b>
                            <Validate d={d} okLabel="Corrigé" onOk={() => decide(key, c.description, 'ok')} onNo={() => decide(key, c.description, 'rejected')} />
                          </div>
                          <div>{c.description}</div>
                          <div className="text-navy/70 mt-1">→ {c.suggestion}</div>
                        </div>
                      )
                    })}
                  </div>
                )}
              </div>
            </div>
            <div className="mt-6 flex justify-end">
              <Next onClick={() => setStep(4)} label="Préparer l'export" />
            </div>
          </Card>
        )}

        {step === 4 && (
          <ExportView
            log={log}
            integrity={integrity}
            consent={consent}
            intake={intake}
            done={done}
            timeline={timeline}
            decisions={decisions}
            onExport={() => log_('Export du dossier', 'Résumé + journal')}
          />
        )}
      </main>
    </div>
  )
}

function ExportView(props: {
  log: Entry[]
  integrity: { ok: boolean; brokenAt: number | null }
  consent: Consent
  intake: Intake
  done: Record<string, boolean>
  timeline: TimelineResult | null
  decisions: Record<string, Decision>
  onExport: () => void
}) {
  const { log, integrity, consent, intake, done, timeline, decisions } = props
  const [tamper, setTamper] = useState<{ ok: boolean; brokenAt: number | null } | null>(null)
  const validated = timeline?.events.filter((_, i) => decisions[`ev-${i}`] === 'ok') ?? []
  const checklist = computeChecklist(intake)

  const download = () => {
    props.onExport()
    const blob = new Blob([JSON.stringify({ avertissement: 'DONNÉES FICTIVES', consent, intake, checklist, chronologieValidee: validated, journal: log }, null, 2)], { type: 'application/json' })
    const a = document.createElement('a')
    a.href = URL.createObjectURL(blob)
    a.download = 'dossier-DEMO-0042.json'
    a.click()
  }
  const simulateTamper = async () => {
    if (log.length < 2) return
    const copy = log.map((e) => ({ ...e }))
    copy[1].details = copy[1].details + ' (modifié après coup)'
    setTamper(await verifyLog(copy))
  }

  return (
    <Card title="Export du dossier" subtitle="Résumé pour l'équipe et journal de chaîne de conservation. Rien n'est transmis à la police sans consentement explicite.">
      <div className={`p-4 rounded-lg mb-4 text-white font-semibold ${integrity.ok ? 'bg-ok' : 'bg-alert'}`} id="integrity-badge">
        {integrity.ok ? `✓ Intégrité du journal vérifiée — ${log.length} entrées chaînées par SHA-256` : `✗ Journal altéré à l'entrée ${integrity.brokenAt}`}
      </div>
      <div className="grid md:grid-cols-2 gap-4 text-sm">
        <div className="bg-white rounded-lg border p-4">
          <h3 className="font-bold mb-2">Résumé</h3>
          <ul className="space-y-1">
            <li>Délai depuis les faits : <b>{intake.hoursSince} h</b></li>
            <li>Consentements : {Object.entries(consent).map(([k, v]) => `${CONSENT_LABELS[k as keyof Consent][0]} ${v ? '✓' : '✗'}`).join(' · ')}</li>
            <li>Prélèvements effectués : {checklist.filter((c) => done[c.id]).map((c) => c.label).join(', ') || '—'}</li>
            <li>Événements validés par le soignant : <b>{validated.length}</b> / {timeline?.events.length ?? 0}</li>
            <li className={consent.transmission ? '' : 'text-alert font-semibold'}>
              Transmission à la police : {consent.transmission ? 'autorisée par la personne' : 'NON autorisée — le dossier reste au centre désigné'}
            </li>
          </ul>
        </div>
        <div className="bg-white rounded-lg border p-4 max-h-72 overflow-auto">
          <h3 className="font-bold mb-2">Journal de conservation</h3>
          <ol className="space-y-1 font-mono text-[11px]" id="custody-log">
            {log.map((e) => (
              <li key={e.index}>
                <span className="text-navy/50">#{e.index} {e.timestamp.slice(11, 19)}</span> {e.action} — {e.details}
                <div className="text-navy/40">sha256 {e.hash.slice(0, 16)}… ← {e.prevHash.slice(0, 8)}…</div>
              </li>
            ))}
          </ol>
        </div>
      </div>
      <div className="mt-4 flex flex-wrap gap-2 no-print">
        <button onClick={download} className="px-4 py-2 rounded-lg bg-navy text-cream font-semibold">⬇ Exporter (JSON)</button>
        <button onClick={() => { props.onExport(); window.print() }} className="px-4 py-2 rounded-lg border border-navy font-semibold">🖨 Imprimer / PDF</button>
        <button id="tamper" onClick={simulateTamper} className="px-4 py-2 rounded-lg border border-alert text-alert font-semibold">Simuler une modification après coup</button>
      </div>
      {tamper && (
        <div className="mt-3 p-3 rounded-lg bg-alert/10 border border-alert text-sm" id="tamper-result">
          {tamper.ok ? 'Aucune altération détectée.' : `✗ Altération détectée à l'entrée #${tamper.brokenAt} : la chaîne d'empreintes ne correspond plus. Le dossier original reste intact.`}
        </div>
      )}
    </Card>
  )
}

function Card({ title, subtitle, children }: { title: string; subtitle?: string; children: React.ReactNode }) {
  return (
    <section className="bg-cream rounded-xl">
      <h2 className="text-2xl font-bold">{title}</h2>
      {subtitle && <p className="text-navy/70 mb-4">{subtitle}</p>}
      {children}
    </section>
  )
}

function Next({ onClick, label, disabled }: { onClick: () => void; label: string; disabled?: boolean }) {
  return (
    <button id="next" onClick={onClick} disabled={disabled} className="px-5 py-2.5 rounded-lg bg-amber text-navy font-bold hover:brightness-105 disabled:opacity-40">
      {label} →
    </button>
  )
}

function YesNo({ id, q, v, set }: { id: string; q: string; v: boolean; set: (v: boolean) => void }) {
  return (
    <div id={id} className="flex items-center justify-between gap-4 flex-wrap">
      <span className="font-semibold">{q}</span>
      <div className="flex gap-1">
        {(['Oui', 'Non', 'Ne sait pas'] as const).map((l) => {
          const active = (l === 'Oui' && v) || (l === 'Non' && !v)
          return (
            <button key={l} onClick={() => set(l !== 'Non')} className={`px-3 py-1 rounded-md text-sm border ${active ? 'bg-navy text-cream border-navy' : 'bg-white border-navy/20'}`}>
              {l}
            </button>
          )
        })}
      </div>
    </div>
  )
}

function Badge({ status, remaining }: { status: Status; remaining: number | null }) {
  const map: Record<Status, [string, string]> = {
    urgent: ['bg-amber text-navy', `URGENT · ${remaining} h restantes`],
    possible: ['bg-ok text-white', `Possible · ${remaining} h restantes`],
    depasse: ['bg-navy/20 text-navy', `Délai dépassé (${remaining !== null ? -remaining : 0} h)`],
    'sans-delai': ['bg-white border text-navy', 'Dès que possible'],
  }
  return <span className={`text-xs font-bold px-2 py-1 rounded whitespace-nowrap ${map[status][0]}`}>{map[status][1]}</span>
}

function Validate({ d, onOk, onNo, okLabel = 'Valider' }: { d: Decision; onOk: () => void; onNo: () => void; okLabel?: string }) {
  if (d !== 'pending') return <span className={`text-xs font-bold ${d === 'ok' ? 'text-ok' : 'text-alert'}`}>{d === 'ok' ? '✓ validé' : '✗ rejeté'}</span>
  return (
    <span className="flex gap-1 shrink-0">
      <button onClick={onOk} className="validate text-xs px-2 py-0.5 rounded bg-ok text-white">{okLabel}</button>
      <button onClick={onNo} className="text-xs px-2 py-0.5 rounded border border-alert text-alert">Rejeter</button>
    </span>
  )
}

export function Logo() {
  return (
    <svg width="24" height="24" viewBox="0 0 32 32" aria-hidden>
      <circle cx="16" cy="16" r="14" fill="none" stroke="#E8A33D" strokeWidth="2" />
      <path d="M16 5 L20 16 L16 27 L12 16 Z" fill="#E8A33D" />
    </svg>
  )
}
