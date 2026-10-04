import { useEffect, useMemo, useRef, useState } from 'react'
import {
  ArrowLeft, ArrowRight, Check, ClipboardList, Clock, Download, Eye, EyeOff, FileText, Fingerprint,
  Link2, Lock, Printer, ShieldAlert, ShieldCheck, Sparkles, Stethoscope, X,
} from 'lucide-react'
import { appendEntry, verifyLog, type Entry } from '../lib/custody'
import { computeChecklist, RULES_VERSION, type Intake, type Status } from '../lib/rules'
import { DEMO_NOTES } from '../lib/demoCase'
import { pseudonymize } from '../lib/pseudonymize'
import { TIMELINE_FIXTURE, type TimelineResult } from '../lib/timelineFixture'
import { Wordmark } from './Logo'

const STEPS = [
  { label: 'Consentement', icon: ShieldCheck },
  { label: 'Dossier guidé', icon: Stethoscope },
  { label: 'Prélèvements', icon: Clock },
  { label: 'Chronologie', icon: Sparkles },
  { label: 'Export', icon: FileText },
] as const
const ACTOR = 'Inf. M. Roy (fictif)'

type Consent = { examen: boolean; prelevements: boolean; conservation: boolean; transmission: boolean }
const CONSENT_LABELS: Record<keyof Consent, [string, string]> = {
  examen: ['Examen médical', 'Soins et évaluation médicale.'],
  prelevements: ['Prélèvements médicolégaux', 'Chaque prélèvement peut être refusé individuellement.'],
  conservation: ['Conservation de la trousse', 'Les preuves sont conservées ; la décision de porter plainte peut venir plus tard.'],
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
  useEffect(() => {
    window.scrollTo({ top: 0, behavior: 'smooth' })
  }, [step])

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
      await new Promise((res) => setTimeout(res, 1400))
      setTimeline(TIMELINE_FIXTURE)
      setSource('fixture')
    }
    setDecisions({})
    setLoading(false)
  }

  const decide = async (key: string, label: string, d: Decision) => {
    setDecisions((prev) => ({ ...prev, [key]: d }))
    await log_(d === 'ok' ? 'Suggestion IA validée' : 'Suggestion IA rejetée', label)
  }

  const canProceed = consent.examen
  const next = (label: string, onClick?: () => void | Promise<void>, disabled?: boolean) => (
    <div className="mt-10 flex items-center justify-between border-t border-rule pt-6">
      <button
        onClick={() => setStep(Math.max(0, step - 1))}
        className={`press inline-flex items-center gap-2 text-sm text-ink-2 hover:text-ink ${step === 0 ? 'invisible' : ''}`}
      >
        <ArrowLeft size={16} strokeWidth={1.75} /> Retour
      </button>
      <button
        id="next"
        disabled={disabled}
        onClick={async () => {
          await onClick?.()
          setStep(step + 1)
        }}
        className="press group inline-flex items-center gap-3 rounded-md bg-ink px-5 py-3 text-[15px] font-medium text-paper hover:bg-north disabled:cursor-not-allowed disabled:opacity-30"
      >
        {label}
        <ArrowRight size={16} strokeWidth={1.75} className="transition-transform duration-500 ease-[var(--ease-out-soft)] group-hover:translate-x-1" />
      </button>
    </div>
  )

  return (
    <div className="min-h-screen">
      <div className="no-print border-b border-alert/20 bg-alert-soft py-1.5 text-center text-alert">
        <span className="eyebrow">Données 100 % fictives · prototype de démonstration · ne pas utiliser en soins réels</span>
      </div>

      <header className="no-print sticky top-0 z-20 border-b border-rule bg-paper/90 backdrop-blur">
        <div className="mx-auto flex max-w-6xl items-stretch">
          <a href="#/" className="press flex items-center border-r border-rule px-5 py-3">
            <Wordmark />
          </a>
          <div className="hidden flex-1 items-center px-5 text-sm text-ink-2 md:flex">
            Dossier <span className="mx-1.5 font-mono text-ink">#DEMO-0042</span> · cas fictif « Léa » · centre désigné (fictif)
          </div>
          <div className="flex items-center gap-2 border-l border-rule px-5">
            <span className="hidden items-center gap-1.5 rounded border border-rule px-2 py-1 text-xs text-ink-2 sm:inline-flex">
              <Sparkles size={13} strokeWidth={1.75} className="text-north" /> L'IA suggère, l'humain valide
            </span>
            <span
              id="integrity-chip"
              className={`inline-flex items-center gap-1.5 rounded border px-2 py-1 font-mono text-[11px] transition-colors duration-500 ${integrity.ok ? 'border-north/30 bg-north-soft text-north' : 'border-alert/40 bg-alert-soft text-alert'}`}
            >
              <Link2 size={13} strokeWidth={1.75} />
              {log.length} · {integrity.ok ? 'intègre' : `altéré #${integrity.brokenAt}`}
            </span>
          </div>
        </div>
        <nav className="mx-auto grid max-w-6xl grid-cols-5 border-t border-rule">
          {STEPS.map(({ label, icon: Icon }, i) => {
            const active = step === i
            const reached = i < step
            return (
              <button
                key={label}
                id={`tab-${i}`}
                disabled={i > 0 && !canProceed}
                onClick={() => setStep(i)}
                className={`press relative flex items-center gap-2 border-r border-rule px-3 py-3 text-left text-sm last:border-r-0 disabled:cursor-not-allowed disabled:opacity-35 sm:px-4 ${active ? 'text-ink' : 'text-ink-3 hover:bg-panel hover:text-ink'}`}
              >
                <span className={`grid h-6 w-6 shrink-0 place-items-center rounded-full border font-mono text-[11px] transition-colors duration-500 ${active ? 'border-ink bg-ink text-paper' : reached ? 'border-north bg-north text-paper' : 'border-rule'}`}>
                  {reached ? <Check size={12} strokeWidth={2.5} /> : i + 1}
                </span>
                <span className="hidden truncate md:inline">{label}</span>
                <Icon size={15} strokeWidth={1.75} className="ml-auto hidden text-ink-3 lg:block" />
                <span className={`absolute inset-x-0 -bottom-px h-0.5 origin-left bg-north transition-transform duration-700 ease-[var(--ease-out-soft)] ${active ? 'scale-x-100' : 'scale-x-0'}`} />
              </button>
            )
          })}
        </nav>
      </header>

      <main key={step} className="mx-auto max-w-6xl px-5 py-12 sm:py-16">
        {step === 0 && (
          <Section n="01" title="Consentement, étape par étape" lead="La personne garde le contrôle. Chaque choix est horodaté dans le journal de conservation.">
            <div className="grid gap-px overflow-hidden rounded-lg border border-rule bg-rule sm:grid-cols-2">
              {(Object.keys(CONSENT_LABELS) as (keyof Consent)[]).map((k, i) => (
                <label
                  key={k}
                  id={`consent-${k}`}
                  className={`rise rise-${i + 1} press group flex cursor-pointer gap-4 p-6 ${consent[k] ? 'bg-north-soft' : 'bg-paper hover:bg-panel'}`}
                >
                  <input type="checkbox" className="peer sr-only" checked={consent[k]} onChange={() => toggleConsent(k)} />
                  <span className={`mt-0.5 grid h-6 w-6 shrink-0 place-items-center rounded border transition-all duration-500 ease-[var(--ease-out-soft)] ${consent[k] ? 'border-north bg-north text-paper' : 'border-ink-3/50 bg-paper group-hover:border-ink'}`}>
                    <Check size={14} strokeWidth={2.5} className={`transition-all duration-500 ${consent[k] ? 'scale-100 opacity-100' : 'scale-50 opacity-0'}`} />
                  </span>
                  <span>
                    <span className="block text-[17px] font-medium">{CONSENT_LABELS[k][0]}</span>
                    <span className="mt-1 block text-[15px] leading-relaxed text-ink-2">{CONSENT_LABELS[k][1]}</span>
                  </span>
                </label>
              ))}
            </div>
            <p className="mt-6 flex items-start gap-2 text-[15px] text-ink-2">
              <ShieldCheck size={18} strokeWidth={1.75} className="mt-0.5 shrink-0 text-north" />
              Rappel au soignant : proposer l'intervenante psychosociale du centre désigné, le CAVAC et le CALACS. Aucune décision n'est requise ce soir.
            </p>
            {next(canProceed ? 'Continuer' : "Consentement à l'examen requis", undefined, !canProceed)}
          </Section>
        )}

        {step === 1 && (
          <Section n="02" title="Dossier guidé" lead="Les questions s'adaptent aux réponses. « Je ne sais pas » est une réponse valide.">
            <div className="rise rounded-lg border border-rule p-6">
              <div className="eyebrow text-ink-3">Temps écoulé depuis les faits</div>
              <div className="mt-3 flex flex-wrap items-end gap-6">
                <span className="display text-6xl tabular-nums sm:text-7xl">{intake.hoursSince}<span className="ml-1 text-3xl text-ink-3">h</span></span>
                <input
                  id="hours"
                  type="range"
                  min={1}
                  max={168}
                  value={intake.hoursSince}
                  onChange={(e) => setIntake({ ...intake, hoursSince: +e.target.value })}
                  className="mb-3 h-1 w-full max-w-md cursor-pointer accent-[#0F7A64]"
                />
              </div>
            </div>
            <div className="mt-6 divide-y divide-rule rounded-lg border border-rule">
              <YesNo id="q-substance" q="Une substance est-elle soupçonnée (drogue, médicament, alcool à son insu) ?" v={intake.substance} set={(v) => setIntake({ ...intake, substance: v })} />
              <div className={`grid transition-all duration-700 ease-[var(--ease-out-soft)] ${intake.substance ? 'grid-rows-[1fr] opacity-100' : 'grid-rows-[0fr] opacity-0'}`}>
                <div className="overflow-hidden">
                  <div className="flex items-start gap-3 bg-north-soft px-6 py-4 text-[15px] text-ink-2">
                    <Sparkles size={16} strokeWidth={1.75} className="mt-0.5 shrink-0 text-north" />
                    Question ajoutée : symptômes observés (étourdissement, amnésie, somnolence), à noter sans interpréter. Les deux prélèvements toxicologiques entrent dans la checklist.
                  </div>
                </div>
              </div>
              <YesNo id="q-exposure" q="Exposition possible à des liquides biologiques ?" v={intake.exposure} set={(v) => setIntake({ ...intake, exposure: v })} />
              <YesNo id="q-pregnancy" q="Risque de grossesse ?" v={intake.pregnancyRisk} set={(v) => setIntake({ ...intake, pregnancyRisk: v })} />
              <YesNo id="q-showered" q="Douche ou bain depuis les faits ?" v={intake.showered} set={(v) => setIntake({ ...intake, showered: v })} />
              <YesNo id="q-injuries" q="Lésions visibles ?" v={intake.injuries} set={(v) => setIntake({ ...intake, injuries: v })} />
            </div>
            {next('Voir les prélèvements prioritaires', () => log_('Dossier guidé complété', `${intake.hoursSince} h depuis les faits · substance : ${intake.substance ? 'oui' : 'non'}`))}
          </Section>
        )}

        {step === 2 && (
          <Section n="03" title={`Prélèvements prioritaires, ${intake.hoursSince} h après les faits`} lead="Calculé par un moteur de règles, sans IA. Trié par urgence.">
            <div className="mb-5 flex items-start gap-2 rounded-md border border-warn/30 bg-warn-soft px-4 py-3 text-sm text-warn">
              <ClipboardList size={16} strokeWidth={1.75} className="mt-0.5 shrink-0" />
              <span>
                Délais prototype, à valider par sources médicales et par le protocole de l'établissement. <span className="font-mono text-xs opacity-80">{RULES_VERSION}</span>
              </span>
            </div>
            {!consent.prelevements && (
              <div className="mb-5 flex items-center gap-2 rounded-md border border-alert/30 bg-alert-soft px-4 py-3 text-sm text-alert">
                <Lock size={16} strokeWidth={1.75} /> Consentement aux prélèvements non accordé : liste informative, rien ne peut être coché.
              </div>
            )}
            <ul className="divide-y divide-rule overflow-hidden rounded-lg border border-rule" id="checklist">
              {checklist.map((c, i) => {
                const disabled = !consent.prelevements || c.status === 'depasse'
                return (
                  <li key={c.id} className={`rise flex items-center gap-4 px-5 py-4 transition-colors duration-500 ${done[c.id] ? 'bg-north-soft' : 'bg-paper'} ${c.status === 'depasse' ? 'opacity-55' : ''}`} style={{ animationDelay: `${i * 70}ms` }}>
                    <button
                      disabled={disabled}
                      aria-pressed={!!done[c.id]}
                      aria-label={`Marquer ${c.label}`}
                      onClick={async () => {
                        setDone((d) => ({ ...d, [c.id]: !d[c.id] }))
                        await log_(done[c.id] ? 'Prélèvement décoché' : 'Prélèvement effectué et scellé', c.label)
                      }}
                      className={`press grid h-6 w-6 shrink-0 place-items-center rounded border disabled:cursor-not-allowed ${done[c.id] ? 'border-north bg-north text-paper' : 'border-ink-3/50 hover:border-ink'}`}
                    >
                      <Check size={14} strokeWidth={2.5} className={`transition-all duration-500 ${done[c.id] ? 'scale-100 opacity-100' : 'scale-50 opacity-0'}`} />
                    </button>
                    <div className="min-w-0 flex-1">
                      <div className="text-[16px] font-medium">{c.label}</div>
                      <div className="text-sm text-ink-3">{c.why}</div>
                    </div>
                    <Badge status={c.status} remaining={c.remainingH} />
                  </li>
                )
              })}
            </ul>
            {next('Construire la chronologie')}
          </Section>
        )}

        {step === 3 && (
          <Section n="04" title="Chronologie assistée par IA" lead="L'IA range les notes. Elle ne juge pas, ne désigne personne. Chaque ligne cite sa source et attend votre validation.">
            <div className="grid gap-6 lg:grid-cols-[1fr_1.1fr]">
              <div>
                <div className="mb-2 flex items-center justify-between">
                  <span className="eyebrow text-ink-3">Notes libres</span>
                  <button id="ai-view" onClick={() => setShowAiView(!showAiView)} className="press inline-flex items-center gap-1.5 rounded border border-rule px-2.5 py-1 text-xs text-ink-2 hover:border-north hover:text-north">
                    {showAiView ? <EyeOff size={13} strokeWidth={1.75} /> : <Eye size={13} strokeWidth={1.75} />}
                    {showAiView ? 'Notes originales' : 'Ce que l’IA voit'}
                  </button>
                </div>
                {showAiView ? (
                  <div className="rise h-80 overflow-auto rounded-lg border border-north/40 bg-north-soft p-4 text-[15px] leading-relaxed whitespace-pre-wrap" id="ai-view-panel">
                    <div className="mb-3 flex items-center gap-1.5 text-xs font-medium text-north">
                      <Fingerprint size={14} strokeWidth={1.75} /> Texte réellement envoyé au modèle · {pseudo.count} identifiants masqués
                    </div>
                    {pseudo.text.split(/(\[[A-ZÉ]+\])/g).map((part, i) =>
                      /^\[[A-ZÉ]+\]$/.test(part) ? (
                        <mark key={i} className="rounded bg-north px-1 font-mono text-[12px] text-paper">{part}</mark>
                      ) : (
                        <span key={i}>{part}</span>
                      ),
                    )}
                  </div>
                ) : (
                  <textarea value={notes} onChange={(e) => setNotes(e.target.value)} className="h-80 w-full resize-none rounded-lg border border-rule bg-paper p-4 text-[15px] leading-relaxed outline-none transition-colors duration-500 focus:border-ink" />
                )}
                <button id="generate" onClick={generate} disabled={loading} className="press mt-4 inline-flex w-full items-center justify-center gap-2 rounded-md bg-ink py-3.5 text-[15px] font-medium text-paper hover:bg-north disabled:opacity-60">
                  <Sparkles size={16} strokeWidth={1.75} className={loading ? 'animate-pulse' : ''} />
                  {loading ? 'Structuration en cours…' : 'Générer la chronologie'}
                </button>
              </div>
              <div id="timeline">
                {!timeline && !loading && (
                  <div className="grid h-full min-h-80 place-items-center rounded-lg border border-dashed border-rule p-6 text-center text-sm text-ink-3">
                    La chronologie proposée apparaîtra ici,<br />ligne par ligne, avec ses sources.
                  </div>
                )}
                {loading && (
                  <div className="space-y-3">
                    {[0, 1, 2, 3, 4].map((i) => <div key={i} className="skeleton h-14 rounded-md" />)}
                  </div>
                )}
                {timeline && !loading && (
                  <div className="space-y-4">
                    <div className={`inline-flex items-center gap-1.5 rounded border px-2 py-1 text-xs ${source === 'live' ? 'border-north/30 bg-north-soft text-north' : 'border-rule bg-panel text-ink-2'}`}>
                      <Sparkles size={13} strokeWidth={1.75} />
                      {source === 'live' ? 'Réponse IA en direct (Claude)' : 'Réponse IA pré-enregistrée (démo hors ligne), même format que la réponse en direct'}
                    </div>
                    <ol className="relative ml-2 space-y-2 border-l border-rule">
                      {timeline.events.map((ev, i) => {
                        const key = `ev-${i}`
                        const d = decisions[key] ?? 'pending'
                        return (
                          <li key={key} className="rise relative ml-5" style={{ animationDelay: `${i * 80}ms` }}>
                            <span className={`absolute -left-[26px] top-4 h-2.5 w-2.5 rounded-full border-2 border-paper transition-colors duration-500 ${d === 'ok' ? 'bg-north' : d === 'rejected' ? 'bg-alert' : 'bg-ink-3'}`} />
                            <div className={`flex justify-between gap-3 rounded-md border px-4 py-3 transition-all duration-500 ${d === 'ok' ? 'border-north/40 bg-north-soft' : d === 'rejected' ? 'border-alert/30 bg-alert-soft opacity-60' : 'border-rule bg-paper'}`}>
                              <div className="min-w-0">
                                <div className="font-mono text-[11px] text-ink-3">{ev.time}</div>
                                <div className={`text-[15px] font-medium ${d === 'rejected' ? 'line-through' : ''}`}>{ev.description}</div>
                                <div className="mt-0.5 text-[13px] italic text-ink-3">« {ev.source} » · {ev.origin}</div>
                              </div>
                              <Validate d={d} onOk={() => decide(key, ev.description, 'ok')} onNo={() => decide(key, ev.description, 'rejected')} />
                            </div>
                          </li>
                        )
                      })}
                    </ol>
                    {timeline.gaps.map((g, i) => (
                      <div key={`gap-${i}`} id={`gap-${i}`} className="rise rounded-md border border-dashed border-ink-3/50 bg-panel px-4 py-3 text-[14px]">
                        <div className="flex items-center gap-1.5 font-medium"><Clock size={15} strokeWidth={1.75} /> Information non disponible : {g.from} → {g.to}</div>
                        <div className="mt-1 text-ink-2">{g.note}</div>
                      </div>
                    ))}
                    {timeline.inconsistencies.map((c, i) => {
                      const key = `inc-${i}`
                      const d = decisions[key] ?? 'pending'
                      return (
                        <div key={key} id={`inc-${i}`} className={`rise rounded-md border px-4 py-3 text-[14px] transition-colors duration-500 ${d === 'ok' ? 'border-north/40 bg-north-soft' : 'border-warn/40 bg-warn-soft'}`}>
                          <div className="flex justify-between gap-3">
                            <span className="flex items-center gap-1.5 font-medium text-warn"><ShieldAlert size={15} strokeWidth={1.75} /> Incohérence du dossier (pas du récit)</span>
                            <Validate d={d} okLabel="Corrigé" onOk={() => decide(key, c.description, 'ok')} onNo={() => decide(key, c.description, 'rejected')} />
                          </div>
                          <div className="mt-1">{c.description}</div>
                          <div className="mt-1 text-ink-2">→ {c.suggestion}</div>
                        </div>
                      )
                    })}
                  </div>
                )}
              </div>
            </div>
            {next("Préparer l'export")}
          </Section>
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
    <Section n="05" title="Export du dossier" lead="Résumé pour l'équipe et journal de chaîne de conservation. Rien n'est transmis à la police sans consentement explicite.">
      <div id="integrity-badge" className={`rise flex items-center gap-3 rounded-lg border px-5 py-4 ${integrity.ok ? 'border-north/40 bg-north-soft text-north' : 'border-alert/40 bg-alert-soft text-alert'}`}>
        {integrity.ok ? <ShieldCheck size={22} strokeWidth={1.75} /> : <ShieldAlert size={22} strokeWidth={1.75} />}
        <span className="text-[17px] font-medium">
          {integrity.ok ? `Intégrité du journal vérifiée : ${log.length} entrées chaînées par SHA-256` : `Journal altéré à l'entrée ${integrity.brokenAt}`}
        </span>
      </div>
      <div className="mt-6 grid gap-px overflow-hidden rounded-lg border border-rule bg-rule md:grid-cols-2">
        <div className="bg-paper p-6">
          <div className="eyebrow text-ink-3">Résumé</div>
          <dl className="mt-4 space-y-3 text-[15px]">
            <Row k="Délai depuis les faits" v={`${intake.hoursSince} h`} />
            <Row k="Consentements" v={Object.entries(consent).map(([k, v]) => `${CONSENT_LABELS[k as keyof Consent][0]} ${v ? '✓' : '✗'}`).join(' · ')} />
            <Row k="Prélèvements effectués" v={checklist.filter((c) => done[c.id]).map((c) => c.label).join(', ') || 'aucun'} />
            <Row k="Événements validés" v={`${validated.length} / ${timeline?.events.length ?? 0}`} />
          </dl>
          <div className={`mt-5 flex items-start gap-2 rounded-md px-3 py-2.5 text-sm ${consent.transmission ? 'bg-north-soft text-north' : 'bg-alert-soft text-alert'}`}>
            <Lock size={15} strokeWidth={1.75} className="mt-0.5 shrink-0" />
            {consent.transmission ? 'Transmission à la police autorisée par la personne.' : 'Transmission à la police non autorisée : le dossier reste au centre désigné.'}
          </div>
        </div>
        <div className="max-h-96 overflow-auto bg-paper p-6">
          <div className="eyebrow text-ink-3">Journal de conservation</div>
          <ol className="mt-4 space-y-2.5 font-mono text-[11px]" id="custody-log">
            {log.map((e) => (
              <li key={e.index} className="border-l border-rule pl-3">
                <span className="text-ink-3">#{e.index} {e.timestamp.slice(11, 19)}</span> <span className="text-ink">{e.action}</span> · {e.details}
                <div className="text-ink-3">sha256 {e.hash.slice(0, 16)}… ← {e.prevHash.slice(0, 8)}…</div>
              </li>
            ))}
          </ol>
        </div>
      </div>
      <div className="no-print mt-6 flex flex-wrap gap-2">
        <button onClick={download} className="press inline-flex items-center gap-2 rounded-md bg-ink px-4 py-2.5 text-sm font-medium text-paper hover:bg-north">
          <Download size={15} strokeWidth={1.75} /> Exporter (JSON)
        </button>
        <button onClick={() => { props.onExport(); window.print() }} className="press inline-flex items-center gap-2 rounded-md border border-ink px-4 py-2.5 text-sm font-medium hover:bg-panel">
          <Printer size={15} strokeWidth={1.75} /> Imprimer / PDF
        </button>
        <button id="tamper" onClick={simulateTamper} className="press inline-flex items-center gap-2 rounded-md border border-alert/50 px-4 py-2.5 text-sm font-medium text-alert hover:bg-alert-soft">
          <ShieldAlert size={15} strokeWidth={1.75} /> Simuler une modification après coup
        </button>
      </div>
      {tamper && (
        <div id="tamper-result" className="rise mt-4 flex items-start gap-2 rounded-md border border-alert/40 bg-alert-soft px-4 py-3 text-sm text-alert">
          <ShieldAlert size={16} strokeWidth={1.75} className="mt-0.5 shrink-0" />
          {tamper.ok ? 'Aucune altération détectée.' : `Altération détectée à l'entrée #${tamper.brokenAt} : la chaîne d'empreintes ne correspond plus. Le dossier original reste intact.`}
        </div>
      )}
    </Section>
  )
}

function Section({ n, title, lead, children }: { n: string; title: string; lead: string; children: React.ReactNode }) {
  return (
    <section>
      <div className="rise eyebrow text-north">{n} / 05</div>
      <h1 className="rise rise-1 display mt-3 max-w-3xl text-4xl sm:text-5xl">{title}</h1>
      <p className="rise rise-2 mt-4 max-w-2xl text-[17px] leading-relaxed text-ink-2">{lead}</p>
      <div className="mt-10">{children}</div>
    </section>
  )
}

function Row({ k, v }: { k: string; v: string }) {
  return (
    <div className="grid grid-cols-[10rem_1fr] gap-3">
      <dt className="text-ink-3">{k}</dt>
      <dd>{v}</dd>
    </div>
  )
}

function YesNo({ id, q, v, set }: { id: string; q: string; v: boolean; set: (v: boolean) => void }) {
  return (
    <div id={id} className="flex flex-wrap items-center justify-between gap-4 px-6 py-4">
      <span className="text-[16px]">{q}</span>
      <div className="relative inline-grid grid-cols-3 rounded-md border border-rule bg-panel p-0.5 text-sm">
        <span className={`absolute inset-y-0.5 w-[calc(33.333%-2px)] rounded bg-ink transition-transform duration-500 ease-[var(--ease-out-soft)] ${v ? 'translate-x-0.5' : 'translate-x-[calc(100%+2px)]'}`} />
        {(['Oui', 'Non', 'Ne sait pas'] as const).map((l) => {
          const active = (l === 'Oui' && v) || (l === 'Non' && !v)
          return (
            <button key={l} onClick={() => set(l !== 'Non')} className={`press relative z-10 px-3 py-1.5 transition-colors duration-500 ${active ? 'text-paper' : 'text-ink-2 hover:text-ink'}`}>
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
    urgent: ['border-warn/40 bg-warn-soft text-warn', `Urgent · ${remaining} h`],
    possible: ['border-north/30 bg-north-soft text-north', `Possible · ${remaining} h`],
    depasse: ['border-rule bg-panel text-ink-3', `Dépassé de ${remaining !== null ? -remaining : 0} h`],
    'sans-delai': ['border-rule bg-paper text-ink-2', 'Dès que possible'],
  }
  return <span className={`inline-flex items-center gap-1 whitespace-nowrap rounded border px-2 py-1 font-mono text-[11px] ${map[status][0]}`}><Clock size={12} strokeWidth={1.75} />{map[status][1]}</span>
}

function Validate({ d, onOk, onNo, okLabel = 'Valider' }: { d: Decision; onOk: () => void; onNo: () => void; okLabel?: string }) {
  if (d !== 'pending')
    return (
      <span className={`rise inline-flex h-fit shrink-0 items-center gap-1 text-xs font-medium ${d === 'ok' ? 'text-north' : 'text-alert'}`}>
        {d === 'ok' ? <Check size={13} strokeWidth={2.25} /> : <X size={13} strokeWidth={2.25} />} {d === 'ok' ? 'validé' : 'rejeté'}
      </span>
    )
  return (
    <span className="flex h-fit shrink-0 gap-1">
      <button onClick={onOk} aria-label={okLabel} className="validate press inline-flex items-center gap-1 rounded border border-north/40 px-2 py-1 text-xs font-medium text-north hover:bg-north hover:text-paper">
        <Check size={13} strokeWidth={2.25} /> {okLabel}
      </button>
      <button onClick={onNo} aria-label="Rejeter" className="press inline-flex items-center rounded border border-rule px-1.5 py-1 text-xs text-ink-3 hover:border-alert hover:text-alert">
        <X size={13} strokeWidth={2.25} />
      </button>
    </span>
  )
}
