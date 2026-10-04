import { lazy, Suspense, useEffect, useMemo, useRef, useState } from 'react'
import {
  AlertTriangle, ArrowRight, Check, CheckCircle2, ClipboardList, Clock, Download, ExternalLink, EyeOff, FileLock2,
  Fingerprint, HeartHandshake, KeyRound, Lock, LockOpen, MapPin, Navigation, PenLine, Phone, Printer, Route, Scale,
  Eye, Send, ServerOff, ShieldCheck, Stethoscope, Trash2, X,
} from 'lucide-react'
import { Wordmark } from './Logo'
import Parcours, { shouldShowParcours } from './Parcours'
import { RESOURCES, type Resource } from '../lib/resources'
import { computeChecklist } from '../lib/rules'
import { createVault, openVault, saveVault, sealForTransfer, vaultExists, vaultInfo, wipeVault, type VaultSession } from '../lib/vault'

const ResourceMap = lazy(() => import('./ResourceMap'))
const NB = ' '

type Tri = 'oui' | 'non' | 'nsp' | ''
type Fiche = {
  quand: string; quandInconnu: boolean; ou: string; souvenirs: string; oublis: string
  symptomes: string[]; substance: Tri; douche: Tri; vetements: string; temoins: string; besoins: string[]
  journal: { at: string; action: string }[]
}
const EMPTY: Fiche = { quand: '', quandInconnu: false, ou: '', souvenirs: '', oublis: '', symptomes: [], substance: '', douche: '', vetements: '', temoins: '', besoins: [], journal: [] }
const SYMPTOMES = ['Étourdissements', 'Trous de mémoire', 'Somnolence inhabituelle', 'Nausées', 'Douleurs', 'Blessures visibles', 'Aucun']
const BESOINS = ['Parler à quelqu’un', 'Un examen médical', 'Un conseil juridique', 'Rien pour l’instant']

const TABS = [
  { id: 'recit', label: 'Mon récit', icon: PenLine },
  { id: 'aller', label: 'Où aller', icon: MapPin },
  { id: 'dossier', label: 'Mon dossier', icon: FileLock2 },
  { id: 'vie-privee', label: 'Vie privée', icon: ShieldCheck },
] as const
type Tab = (typeof TABS)[number]['id']

export default function Espace() {
  const [tab, setTab] = useState<Tab>('recit')
  const [parcours, setParcours] = useState(false)
  const [session, setSession] = useState<VaultSession | null>(null)
  const [fiche, setFiche] = useState<Fiche>(EMPTY)
  const [savedAt, setSavedAt] = useState<string | null>(null)
  const timer = useRef<number | undefined>(undefined)

  useEffect(() => { if (shouldShowParcours()) setParcours(true) }, [])
  useEffect(() => { window.scrollTo({ top: 0, behavior: 'smooth' }) }, [tab])

  // Enregistrement automatique, chiffré, 600 ms après la dernière frappe
  const update = (patch: Partial<Fiche> | ((f: Fiche) => Partial<Fiche>)) => {
    setFiche((f) => {
      const next = { ...f, ...(typeof patch === 'function' ? patch(f) : patch) }
      if (session) {
        window.clearTimeout(timer.current)
        timer.current = window.setTimeout(async () => {
          const s = await saveVault(session, next)
          setSavedAt(s.updatedAt)
        }, 600)
      }
      return next
    })
  }
  const addJournal = (action: string) => update((f) => ({ journal: [...f.journal, { at: new Date().toISOString(), action }] }))

  const hoursSince = useMemo(() => {
    if (!fiche.quand || fiche.quandInconnu) return null
    const h = Math.round((Date.now() - new Date(fiche.quand).getTime()) / 3_600_000)
    return h >= 0 ? h : null
  }, [fiche.quand, fiche.quandInconnu])

  const lock = () => { setSession(null); setFiche(EMPTY); setSavedAt(null) }

  return (
    <div className="min-h-screen">
      <div className="border-b border-warn/25 bg-warn-soft py-1.5 text-center text-warn">
        <span className="eyebrow">Bêta de test · n’entrez pas de vraies données · aucun envoi réel</span>
      </div>
      <header className="sticky top-0 z-30 border-b border-rule bg-paper/90 backdrop-blur">
        <div className="mx-auto flex max-w-6xl items-center gap-3 px-5 py-3">
          <a href="#/" className="press rounded-xl"><Wordmark /></a>
          <div className="ml-auto flex items-center gap-2">
            <button onClick={() => setParcours(true)} className="press inline-flex items-center gap-1.5 rounded-full border border-rule px-3.5 py-2 text-sm text-ink-2 hover:border-ink hover:text-ink">
              <Route size={15} strokeWidth={1.75} /> <span className="hidden sm:inline">Les étapes</span>
            </button>
            {session ? (
              <button onClick={lock} className="press inline-flex items-center gap-1.5 rounded-full bg-north-soft px-3.5 py-2 text-sm text-north hover:bg-north hover:text-paper">
                <Lock size={15} strokeWidth={1.75} /> <span className="hidden sm:inline">Verrouiller</span>
              </button>
            ) : (
              <span className="inline-flex items-center gap-1.5 rounded-full bg-panel px-3.5 py-2 text-sm text-ink-3"><Lock size={15} strokeWidth={1.75} /> <span className="hidden sm:inline">Verrouillé</span></span>
            )}
          </div>
        </div>
        <nav className="mx-auto flex max-w-6xl gap-1 overflow-x-auto px-4 pb-3">
          {TABS.map(({ id, label, icon: Icon }) => (
            <button
              key={id}
              id={`tab-${id}`}
              onClick={() => setTab(id)}
              className={`press inline-flex shrink-0 items-center gap-2 rounded-full px-4 py-2 text-sm transition-colors duration-500 ${tab === id ? 'bg-ink text-paper' : 'text-ink-2 hover:bg-panel hover:text-ink'}`}
            >
              <Icon size={16} strokeWidth={1.75} /> {label}
            </button>
          ))}
        </nav>
      </header>

      <main key={tab} className="mx-auto max-w-6xl px-5 py-10 sm:py-14">
        {tab === 'recit' && (session ? (
          <Recit fiche={fiche} update={update} savedAt={savedAt} hoursSince={hoursSince} onWipe={() => { wipeVault(); lock() }} onNext={() => setTab('aller')} />
        ) : (
          <UnlockScreen onOpen={(s, data) => { setSession(s); setFiche({ ...EMPTY, ...(data as Partial<Fiche>) }); setSavedAt(vaultInfo()?.updatedAt ?? null) }} />
        ))}
        {tab === 'aller' && <Aller hoursSince={hoursSince} substance={fiche.substance === 'oui'} />}
        {tab === 'dossier' && (session ? <Dossier fiche={fiche} hoursSince={hoursSince} onJournal={addJournal} /> : (
          <Gate onGo={() => setTab('recit')} />
        ))}
        {tab === 'vie-privee' && <ViePrivee />}
      </main>

      <Parcours open={parcours} onClose={() => setParcours(false)} onStart={() => setTab('recit')} />
    </div>
  )
}

/* ───────────── Déverrouillage du coffre ───────────── */

function UnlockScreen({ onOpen }: { onOpen: (s: VaultSession, data: unknown) => void }) {
  const exists = vaultExists()
  const [pass, setPass] = useState('')
  const [confirm, setConfirm] = useState('')
  const [error, setError] = useState('')
  const [busy, setBusy] = useState(false)
  const [show, setShow] = useState(false)

  const submit = async (e: React.FormEvent) => {
    e.preventDefault()
    setError('')
    if (!exists) {
      if (pass.length < 8) return setError('Au moins 8 caractères.')
      if (pass !== confirm) return setError('Les deux phrases ne correspondent pas.')
    }
    setBusy(true)
    try {
      if (exists) {
        const { session, data } = await openVault(pass)
        onOpen(session, data)
      } else {
        const s = await createVault(pass)
        await saveVault(s, EMPTY)
        onOpen(s, EMPTY)
      }
    } catch {
      setError('Phrase secrète incorrecte.')
    }
    setBusy(false)
  }

  return (
    <div className="mx-auto max-w-lg">
      <div className="rise grid h-16 w-16 place-items-center rounded-2xl bg-north-soft text-north"><KeyRound size={28} strokeWidth={1.6} /></div>
      <h1 className="rise rise-1 display mt-6 text-4xl sm:text-5xl">{exists ? 'Rouvrir mon récit' : 'Votre récit reste chez vous'}</h1>
      <p className="rise rise-2 mt-4 text-[17px] leading-relaxed text-ink-2">
        {exists
          ? 'Entrez votre phrase secrète pour déchiffrer votre fiche sur cet appareil.'
          : `Choisissez une phrase secrète. Votre fiche sera chiffrée sur cet appareil${NB}: personne, pas même Boussole, ne peut la lire sans elle.`}
      </p>
      <form onSubmit={submit} className="rise rise-3 mt-8 space-y-3">
        <Field label="Phrase secrète">
          <div className="relative">
            <input autoFocus type={show ? 'text' : 'password'} value={pass} onChange={(e) => setPass(e.target.value)} className="input pr-12" placeholder="ex. trois mots que vous retiendrez" autoComplete={exists ? 'current-password' : 'new-password'} />
            <button type="button" onClick={() => setShow(!show)} aria-label="Afficher la phrase" className="press absolute right-2 top-1/2 grid h-9 w-9 -translate-y-1/2 place-items-center rounded-full text-ink-3 hover:bg-panel">
              {show ? <EyeOff size={17} strokeWidth={1.75} /> : <Eye size={17} strokeWidth={1.75} />}
            </button>
          </div>
        </Field>
        {!exists && (
          <Field label="Confirmer">
            <input type={show ? 'text' : 'password'} value={confirm} onChange={(e) => setConfirm(e.target.value)} className="input" autoComplete="new-password" />
          </Field>
        )}
        {error && <p className="fade-in flex items-center gap-1.5 text-sm text-alert"><AlertTriangle size={15} strokeWidth={1.75} /> {error}</p>}
        <button disabled={busy} className="press mt-2 inline-flex w-full items-center justify-center gap-2 rounded-2xl bg-ink py-4 text-[16px] font-medium text-paper hover:bg-north disabled:opacity-60">
          {busy ? 'Chiffrement…' : exists ? <><LockOpen size={18} strokeWidth={1.75} /> Ouvrir</> : <><Lock size={18} strokeWidth={1.75} /> Créer mon espace chiffré</>}
        </button>
      </form>
      <ul className="rise rise-4 mt-8 space-y-2 text-sm text-ink-2">
        <li className="flex gap-2"><ServerOff size={16} strokeWidth={1.75} className="mt-0.5 shrink-0 text-north" /> Rien n’est envoyé à un serveur.</li>
        <li className="flex gap-2"><Fingerprint size={16} strokeWidth={1.75} className="mt-0.5 shrink-0 text-north" /> Chiffrement AES-256 dérivé de votre phrase (PBKDF2, 310 000 itérations).</li>
        <li className="flex gap-2"><AlertTriangle size={16} strokeWidth={1.75} className="mt-0.5 shrink-0 text-warn" /> Phrase oubliée = fiche illisible. C’est voulu.</li>
      </ul>
    </div>
  )
}

/* ───────────── Fiche « Mon récit » ───────────── */

function Recit({ fiche, update, savedAt, hoursSince, onWipe, onNext }: {
  fiche: Fiche; update: (p: Partial<Fiche>) => void; savedAt: string | null; hoursSince: number | null; onWipe: () => void; onNext: () => void
}) {
  const [confirmWipe, setConfirmWipe] = useState(false)
  const toggle = (k: 'symptomes' | 'besoins', v: string) => update({ [k]: fiche[k].includes(v) ? fiche[k].filter((x) => x !== v) : [...fiche[k], v] })
  const filled = [fiche.quand || fiche.quandInconnu, fiche.ou, fiche.souvenirs, fiche.symptomes.length, fiche.substance, fiche.douche, fiche.besoins.length].filter(Boolean).length

  return (
    <div>
      <div className="flex flex-wrap items-end justify-between gap-4">
        <div>
          <div className="rise eyebrow text-north">Mon récit</div>
          <h1 className="rise rise-1 display mt-3 text-4xl sm:text-5xl">À votre rythme.</h1>
          <p className="rise rise-2 mt-3 max-w-xl text-[17px] leading-relaxed text-ink-2">Remplissez ce que vous pouvez, quand vous voulez. « Je ne sais pas » est une réponse. Tout est enregistré et chiffré automatiquement.</p>
        </div>
        <div className="rise rise-2 flex items-center gap-2 rounded-full bg-north-soft px-3.5 py-2 text-sm text-north" id="saved">
          <Lock size={14} strokeWidth={1.75} /> {savedAt ? `Chiffré · ${new Date(savedAt).toLocaleTimeString('fr-CA', { hour: '2-digit', minute: '2-digit' })}` : 'Chiffré'}
        </div>
      </div>
      <div className="mt-6 h-1.5 overflow-hidden rounded-full bg-panel"><div className="h-full rounded-full bg-north transition-all duration-700 ease-[var(--ease-out-soft)]" style={{ width: `${(filled / 7) * 100}%` }} /></div>

      <div className="mt-8 grid gap-4 lg:grid-cols-2">
        <Card icon={Clock} title="Quand ?">
          <input type="datetime-local" value={fiche.quand} disabled={fiche.quandInconnu} onChange={(e) => update({ quand: e.target.value })} className="input disabled:opacity-40" />
          <Check2 label="Je ne sais pas exactement" checked={fiche.quandInconnu} onChange={(v) => update({ quandInconnu: v })} />
          {hoursSince !== null && <p className="fade-in mt-3 text-sm text-ink-2">Il y a environ <b className="text-ink">{hoursSince}{NB}h</b>.</p>}
        </Card>
        <Card icon={MapPin} title="Où ?">
          <input value={fiche.ou} onChange={(e) => update({ ou: e.target.value })} className="input" placeholder="Un lieu, un quartier, ou rien" />
        </Card>
        <Card icon={PenLine} title="Ce dont je me souviens" wide>
          <textarea value={fiche.souvenirs} onChange={(e) => update({ souvenirs: e.target.value })} rows={5} className="input resize-y" placeholder="Avec vos mots. Il n’y a pas de bonne façon de raconter." />
        </Card>
        <Card icon={EyeOff} title="Ce dont je ne me souviens pas" wide>
          <textarea value={fiche.oublis} onChange={(e) => update({ oublis: e.target.value })} rows={3} className="input resize-y" placeholder="Des moments flous ou absents. C’est fréquent, ce n’est pas un problème de fiabilité." />
        </Card>
        <Card icon={Stethoscope} title="Symptômes">
          <Chips options={SYMPTOMES} value={fiche.symptomes} onToggle={(v) => toggle('symptomes', v)} />
        </Card>
        <Card icon={AlertTriangle} title="Une substance est soupçonnée ?">
          <TriSelect value={fiche.substance} onChange={(v) => update({ substance: v })} />
          <div className="mt-4 text-sm font-medium">Douche ou bain depuis ?</div>
          <div className="mt-2"><TriSelect value={fiche.douche} onChange={(v) => update({ douche: v })} /></div>
        </Card>
        <Card icon={ClipboardList} title="Vêtements">
          <Chips options={['Gardés tels quels', 'Lavés', 'Je ne sais pas']} value={fiche.vetements ? [fiche.vetements] : []} onToggle={(v) => update({ vetements: fiche.vetements === v ? '' : v })} />
          <p className="mt-3 text-sm text-ink-3">Si possible, gardez-les dans un sac en papier.</p>
        </Card>
        <Card icon={HeartHandshake} title="Ce dont j’ai besoin maintenant">
          <Chips options={BESOINS} value={fiche.besoins} onToggle={(v) => toggle('besoins', v)} />
        </Card>
        <Card icon={PenLine} title="Personnes présentes ou témoins (facultatif)" wide>
          <textarea value={fiche.temoins} onChange={(e) => update({ temoins: e.target.value })} rows={2} className="input resize-y" placeholder="Prénoms, rôles, ou rien" />
        </Card>
      </div>

      <div className="mt-10 flex flex-wrap items-center justify-between gap-3 border-t border-rule pt-6">
        {confirmWipe ? (
          <div className="fade-in flex flex-wrap items-center gap-2 text-sm">
            <span className="text-alert">Tout effacer définitivement de cet appareil ?</span>
            <button onClick={onWipe} className="press rounded-full bg-alert px-4 py-2 font-medium text-paper">Effacer</button>
            <button onClick={() => setConfirmWipe(false)} className="press rounded-full border border-rule px-4 py-2">Annuler</button>
          </div>
        ) : (
          <button onClick={() => setConfirmWipe(true)} className="press inline-flex items-center gap-2 rounded-full px-3 py-2 text-sm text-ink-3 hover:bg-alert-soft hover:text-alert">
            <Trash2 size={16} strokeWidth={1.75} /> Tout effacer
          </button>
        )}
        <button onClick={onNext} className="press group inline-flex items-center gap-2 rounded-full bg-ink px-6 py-3 font-medium text-paper hover:bg-north">
          Où aller maintenant <ArrowRight size={17} strokeWidth={1.75} className="transition-transform duration-500 group-hover:translate-x-1" />
        </button>
      </div>
    </div>
  )
}

/* ───────────── Où aller (carte) ───────────── */

const FILTERS = [
  { id: 'all', label: 'Tout', icon: MapPin },
  { id: 'exam', label: 'Examens', icon: Stethoscope },
  { id: 'support', label: 'Soutien psy', icon: HeartHandshake },
  { id: 'legal', label: 'Juridique', icon: Scale },
] as const

function Aller({ hoursSince, substance }: { hoursSince: number | null; substance: boolean }) {
  const [filter, setFilter] = useState<(typeof FILTERS)[number]['id']>('all')
  const [active, setActive] = useState<string | undefined>()
  const items = RESOURCES.filter((r) => filter === 'all' || r.kind === filter)
  const urgent = hoursSince !== null ? computeChecklist({ hoursSince, substance, exposure: true, pregnancyRisk: true, injuries: false, showered: false }).filter((c) => c.status === 'urgent' || c.status === 'possible') : []

  useEffect(() => {
    if (active) document.getElementById(`res-${active}`)?.scrollIntoView({ behavior: 'smooth', block: 'nearest' })
  }, [active])

  return (
    <div>
      <div className="rise eyebrow text-north">Où aller à Montréal</div>
      <h1 className="rise rise-1 display mt-3 text-4xl sm:text-5xl">Des personnes formées vous attendent.</h1>
      <p className="rise rise-2 mt-3 max-w-2xl text-[17px] leading-relaxed text-ink-2">En cas de doute, appelez d’abord la Ligne-ressource (24{NB}h/24){NB}: elle vous oriente vers le bon centre.</p>

      {hoursSince !== null && urgent.length > 0 && (
        <div className="fade-in mt-6 rounded-2xl border border-warn/30 bg-warn-soft p-5">
          <div className="flex items-center gap-2 font-medium text-warn"><Clock size={18} strokeWidth={1.75} /> Il y a {hoursSince}{NB}h : des examens sont encore possibles</div>
          <div className="mt-3 flex flex-wrap gap-2">
            {urgent.slice(0, 4).map((c) => (
              <span key={c.id} className="rounded-full bg-paper px-3 py-1.5 text-sm">{c.label} · <b>{c.remainingH}{NB}h</b></span>
            ))}
          </div>
          <p className="mt-3 text-xs text-warn/80">Délais indicatifs du prototype, à valider par sources médicales.</p>
        </div>
      )}

      <a href="tel:18889339007" className="press mt-6 flex items-center gap-4 rounded-2xl bg-ink p-5 text-paper hover:bg-north" id="call-ligne">
        <span className="grid h-12 w-12 shrink-0 place-items-center rounded-full bg-paper/10"><Phone size={22} strokeWidth={1.75} /></span>
        <span className="min-w-0">
          <span className="block text-sm text-paper/70">Ligne-ressource · gratuit · confidentiel · 24 h/24</span>
          <span className="display block text-2xl sm:text-3xl">1 888 933-9007</span>
        </span>
        <ArrowRight size={20} strokeWidth={1.75} className="ml-auto" />
      </a>

      <div className="mt-8 flex gap-2 overflow-x-auto">
        {FILTERS.map(({ id, label, icon: Icon }) => (
          <button key={id} onClick={() => setFilter(id)} className={`press inline-flex shrink-0 items-center gap-2 rounded-full border px-4 py-2 text-sm transition-colors duration-500 ${filter === id ? 'border-north bg-north text-paper' : 'border-rule text-ink-2 hover:border-ink'}`}>
            <Icon size={15} strokeWidth={1.75} /> {label}
          </button>
        ))}
      </div>

      <div className="mt-5 grid gap-5 lg:grid-cols-[1fr_1.1fr]">
        <ul className="order-2 space-y-3 lg:order-1 lg:max-h-[640px] lg:overflow-auto lg:pr-1">
          {items.map((r, n) => <ResourceCard key={r.id} r={r} n={n + 1} active={r.id === active} onSelect={() => setActive(r.id)} />)}
        </ul>
        <div className="order-1 h-[340px] overflow-hidden rounded-3xl border border-rule lg:sticky lg:top-36 lg:order-2 lg:h-[640px]" id="map">
          <Suspense fallback={<div className="skeleton h-full w-full" />}>
            <ResourceMap items={items} active={active} onSelect={setActive} />
          </Suspense>
        </div>
      </div>
      <p className="mt-4 text-xs text-ink-3">Fond de carte OpenStreetMap. Sources : CIUSSS du Centre-Sud-de-l’Île-de-Montréal, 211 Québec, rebatir.ca. Vérifiez les horaires par téléphone.</p>
    </div>
  )
}

function ResourceCard({ r, n, active, onSelect }: { r: Resource; n: number; active: boolean; onSelect: () => void }) {
  const kind = { exam: ['Examens', 'bg-ink text-paper'], support: ['Soutien', 'bg-north text-paper'], legal: ['Juridique', 'bg-warn text-paper'] }[r.kind]
  return (
    <li id={`res-${r.id}`} onClick={onSelect} className={`rise cursor-pointer rounded-2xl border p-5 transition-all duration-500 ease-[var(--ease-out-soft)] ${active ? 'border-north bg-north-soft shadow-[0_12px_30px_-18px_rgba(15,122,100,0.6)]' : 'border-rule bg-paper hover:border-ink-3'}`}>
      <div className="flex items-start gap-3">
        <span className={`grid h-7 w-7 shrink-0 place-items-center rounded-full font-mono text-xs ${kind[1]}`}>{n}</span>
        <div className="min-w-0 flex-1">
          <div className="text-[16px] font-medium leading-snug">{r.name}</div>
          <p className="mt-1.5 text-[14px] leading-relaxed text-ink-2">{r.what}</p>
          <div className="mt-3 space-y-1 text-[13px] text-ink-3">
            {r.address && <div className="flex gap-1.5"><MapPin size={14} strokeWidth={1.75} className="mt-0.5 shrink-0" /> {r.address}</div>}
            <div className="flex gap-1.5"><Clock size={14} strokeWidth={1.75} className="mt-0.5 shrink-0" /> {r.hours}</div>
            {r.note && <div className="flex gap-1.5 text-warn"><AlertTriangle size={14} strokeWidth={1.75} className="mt-0.5 shrink-0" /> {r.note}</div>}
          </div>
          <div className="mt-4 flex flex-wrap gap-2" onClick={(e) => e.stopPropagation()}>
            {r.phone && <a href={`tel:${r.phone}`} className="press inline-flex items-center gap-1.5 rounded-full bg-ink px-3.5 py-2 text-[13px] text-paper hover:bg-north"><Phone size={14} strokeWidth={1.75} /> {r.phoneLabel}</a>}
            {r.lat && <a href={`https://www.openstreetmap.org/directions?to=${r.lat}%2C${r.lng}`} target="_blank" rel="noreferrer" className="press inline-flex items-center gap-1.5 rounded-full border border-rule px-3.5 py-2 text-[13px] hover:border-ink"><Navigation size={14} strokeWidth={1.75} /> Itinéraire</a>}
            {r.url && <a href={r.url} target="_blank" rel="noreferrer" className="press inline-flex items-center gap-1.5 rounded-full border border-rule px-3.5 py-2 text-[13px] hover:border-ink"><ExternalLink size={14} strokeWidth={1.75} /> Site</a>}
          </div>
        </div>
        <span className={`hidden shrink-0 rounded-full px-2.5 py-1 text-[11px] sm:inline ${r.kind === 'exam' ? 'bg-panel' : r.kind === 'support' ? 'bg-north-soft text-north' : 'bg-warn-soft text-warn'}`}>{kind[0]}</span>
      </div>
    </li>
  )
}

/* ───────────── Mon dossier ───────────── */

const REBATIR = RESOURCES.find((r) => r.id === 'rebatir')!

function Dossier({ fiche, hoursSince, onJournal }: { fiche: Fiche; hoursSince: number | null; onJournal: (a: string) => void }) {
  const [include, setInclude] = useState({ recit: true, examens: true, besoins: true })
  const [consent, setConsent] = useState({ transmettre: false, beta: false })
  const [confirmOpen, setConfirmOpen] = useState(false)
  const [phase, setPhase] = useState(-1)
  const [packet, setPacket] = useState<{ size: number; fingerprint: string; ref: string } | null>(null)
  const checklist = hoursSince !== null ? computeChecklist({ hoursSince, substance: fiche.substance === 'oui', exposure: true, pregnancyRisk: true, injuries: fiche.symptomes.includes('Blessures visibles'), showered: fiche.douche === 'oui' }) : []

  const dossier = {
    avertissement: 'BÊTA DE TEST · DONNÉES NON RÉELLES',
    genereLe: new Date().toISOString(),
    ...(include.recit && { recit: { quand: fiche.quandInconnu ? 'inconnu' : fiche.quand, ou: fiche.ou, souvenirs: fiche.souvenirs, oublis: fiche.oublis, symptomes: fiche.symptomes, substance: fiche.substance, douche: fiche.douche, vetements: fiche.vetements, temoins: fiche.temoins } }),
    ...(include.examens && { examens: checklist.map((c) => ({ examen: c.label, statut: c.status, heuresRestantes: c.remainingH })) }),
    ...(include.besoins && { besoins: fiche.besoins }),
    journal: fiche.journal,
  }
  const sections = [include.recit, include.examens, include.besoins].filter(Boolean).length
  const ready = consent.transmettre && consent.beta && sections > 0

  const send = async () => {
    setConfirmOpen(false)
    setPhase(0)
    const sealed = await sealForTransfer(dossier)
    await wait(900); setPhase(1)
    await wait(900); setPhase(2)
    await wait(1100); setPhase(3)
    const ref = `RB-SIM-${sealed.fingerprint.slice(0, 6).toUpperCase()}`
    setPacket({ ...sealed, ref })
    onJournal(`Envoi simulé à Rebâtir (${ref})`)
  }
  const download = () => {
    const blob = new Blob([JSON.stringify(dossier, null, 2)], { type: 'application/json' })
    const a = document.createElement('a'); a.href = URL.createObjectURL(blob); a.download = 'mon-dossier-boussole-BETA.json'; a.click()
    onJournal('Dossier exporté (JSON)')
  }

  const PHASES = [
    { icon: Lock, label: 'Chiffrement sur votre appareil' },
    { icon: FileLock2, label: 'Paquet scellé, empreinte calculée' },
    { icon: Send, label: 'Transmission à Rebâtir (simulée)' },
    { icon: CheckCircle2, label: 'Accusé de réception (simulé)' },
  ]

  return (
    <div>
      <div className="rise eyebrow text-north">Mon dossier</div>
      <h1 className="rise rise-1 display mt-3 text-4xl sm:text-5xl">Vous décidez de ce qui part.</h1>
      <p className="rise rise-2 mt-3 max-w-2xl text-[17px] leading-relaxed text-ink-2">Boussole assemble votre dossier. Rien ne part sans votre double confirmation. Vous pouvez aussi simplement le garder.</p>

      <div className="mt-8 grid gap-5 lg:grid-cols-[1fr_1fr]">
        <div className="space-y-4">
          <Card icon={ClipboardList} title="Ce que contient le dossier">
            <Toggle label="Mon récit" hint={fiche.souvenirs ? `${fiche.souvenirs.length} caractères` : 'vide pour l’instant'} on={include.recit} set={(v) => setInclude({ ...include, recit: v })} />
            <Toggle label="Examens prioritaires" hint={hoursSince !== null ? `calculés à ${hoursSince}${NB}h` : 'date inconnue'} on={include.examens} set={(v) => setInclude({ ...include, examens: v })} />
            <Toggle label="Mes besoins" hint={fiche.besoins.join(', ') || 'aucun choisi'} on={include.besoins} set={(v) => setInclude({ ...include, besoins: v })} />
          </Card>
          <Card icon={Scale} title="Destinataire">
            <div className="flex items-start gap-3">
              <span className="grid h-11 w-11 shrink-0 place-items-center rounded-2xl bg-warn-soft text-warn"><Scale size={20} strokeWidth={1.75} /></span>
              <div>
                <div className="font-medium">{REBATIR.name}</div>
                <p className="mt-1 text-sm leading-relaxed text-ink-2">{REBATIR.what}</p>
                <a href={`tel:${REBATIR.phone}`} className="mt-2 inline-flex items-center gap-1.5 text-sm text-north hover:underline"><Phone size={14} strokeWidth={1.75} /> {REBATIR.phoneLabel}</a>
              </div>
            </div>
          </Card>
          <Card icon={ShieldCheck} title="Consentement">
            <Check2 id="consent-send" label="Je consens à transmettre ce dossier à Rebâtir." checked={consent.transmettre} onChange={(v) => setConsent({ ...consent, transmettre: v })} />
            <Check2 id="consent-beta" label="Je comprends que c’est une bêta : l’envoi est simulé, rien ne part réellement." checked={consent.beta} onChange={(v) => setConsent({ ...consent, beta: v })} />
          </Card>
        </div>

        <div className="space-y-4">
          <div className="rounded-3xl border border-rule bg-panel p-6">
            <div className="flex items-center justify-between">
              <span className="eyebrow text-ink-3">Aperçu</span>
              <span className="rounded-full bg-paper px-3 py-1 font-mono text-xs">{sections} section{sections > 1 ? 's' : ''}</span>
            </div>
            <pre className="mt-4 max-h-72 overflow-auto rounded-2xl bg-paper p-4 font-mono text-[11px] leading-relaxed text-ink-2">{JSON.stringify(dossier, null, 2)}</pre>
            <div className="mt-4 flex flex-wrap gap-2">
              <button onClick={download} className="press inline-flex items-center gap-1.5 rounded-full border border-rule bg-paper px-4 py-2 text-sm hover:border-ink"><Download size={15} strokeWidth={1.75} /> Garder une copie</button>
              <button onClick={() => { onJournal('Dossier imprimé'); window.print() }} className="press inline-flex items-center gap-1.5 rounded-full border border-rule bg-paper px-4 py-2 text-sm hover:border-ink"><Printer size={15} strokeWidth={1.75} /> Imprimer / PDF</button>
            </div>
          </div>

          {phase < 0 ? (
            <button id="send" disabled={!ready} onClick={() => setConfirmOpen(true)} className="press group inline-flex w-full items-center justify-center gap-2 rounded-2xl bg-ink py-4 text-[16px] font-medium text-paper hover:bg-north disabled:cursor-not-allowed disabled:opacity-30">
              <Send size={18} strokeWidth={1.75} /> Envoyer à Rebâtir
            </button>
          ) : (
            <div className="fade-in rounded-3xl border border-rule p-6" id="send-progress">
              <ol className="space-y-4">
                {PHASES.map(({ icon: Icon, label }, n) => (
                  <li key={label} className={`flex items-center gap-3 transition-opacity duration-500 ${n <= phase ? 'opacity-100' : 'opacity-35'}`}>
                    <span className={`grid h-9 w-9 place-items-center rounded-full transition-colors duration-500 ${n < phase || (n === 3 && phase === 3) ? 'bg-north text-paper' : n === phase ? 'bg-ink text-paper' : 'bg-panel text-ink-3'}`}>
                      {n < phase || (n === 3 && phase === 3) ? <Check size={16} strokeWidth={2.25} /> : <Icon size={16} strokeWidth={1.75} className={n === phase ? 'animate-pulse' : ''} />}
                    </span>
                    {label}
                  </li>
                ))}
              </ol>
              {packet && (
                <div className="fade-in mt-5 rounded-2xl bg-north-soft p-4 text-sm text-north">
                  <div className="font-medium">Référence simulée : <span className="font-mono">{packet.ref}</span></div>
                  <div className="mt-1 font-mono text-[11px] break-all text-north/80">{packet.size} octets chiffrés · sha256 {packet.fingerprint.slice(0, 32)}…</div>
                  <div className="mt-2 text-ink-2">En production : transmission chiffrée de bout en bout, clé remise séparément, accusé signé.</div>
                </div>
              )}
            </div>
          )}
        </div>
      </div>

      {confirmOpen && (
        <div className="fixed inset-0 z-50 flex items-end justify-center sm:items-center">
          <div className="fade-in absolute inset-0 bg-ink/40 backdrop-blur-sm" onClick={() => setConfirmOpen(false)} />
          <div role="dialog" aria-modal="true" className="sheet-in relative w-full max-w-md rounded-t-3xl border border-rule bg-paper p-6 sm:rounded-3xl">
            <div className="grid h-12 w-12 place-items-center rounded-2xl bg-warn-soft text-warn"><Send size={22} strokeWidth={1.75} /></div>
            <h2 className="display mt-5 text-3xl">Confirmer l’envoi ?</h2>
            <p className="mt-3 text-[15px] leading-relaxed text-ink-2">{sections} section{sections > 1 ? 's' : ''} vers <b>Rebâtir</b>. En bêta, l’envoi est simulé : aucune donnée ne quitte votre appareil.</p>
            <div className="mt-6 flex gap-2">
              <button onClick={() => setConfirmOpen(false)} className="press flex-1 rounded-full border border-rule py-3 hover:border-ink">Annuler</button>
              <button id="confirm-send" onClick={send} className="press flex-1 rounded-full bg-ink py-3 font-medium text-paper hover:bg-north">Oui, envoyer</button>
            </div>
          </div>
        </div>
      )}
    </div>
  )
}

function Gate({ onGo }: { onGo: () => void }) {
  return (
    <div className="mx-auto max-w-lg text-center">
      <div className="mx-auto grid h-16 w-16 place-items-center rounded-2xl bg-panel text-ink-2"><Lock size={26} strokeWidth={1.6} /></div>
      <h1 className="display mt-6 text-4xl">Votre dossier est verrouillé</h1>
      <p className="mt-3 text-ink-2">Ouvrez d’abord votre espace chiffré dans « Mon récit ».</p>
      <button onClick={onGo} className="press mt-6 inline-flex items-center gap-2 rounded-full bg-ink px-6 py-3 font-medium text-paper hover:bg-north"><LockOpen size={17} strokeWidth={1.75} /> Ouvrir mon espace</button>
    </div>
  )
}

/* ───────────── Vie privée ───────────── */

function ViePrivee() {
  const promises = [
    { icon: ServerOff, t: 'Vos données restent sur votre appareil', d: 'En bêta, la fiche est stockée uniquement dans votre navigateur. Aucun serveur Boussole ne la reçoit.' },
    { icon: Fingerprint, t: 'Chiffrement avec votre phrase secrète', d: 'AES-256-GCM, clé dérivée par PBKDF2 (310 000 itérations). Sans votre phrase, la fiche est illisible, y compris pour nous.' },
    { icon: ShieldCheck, t: 'Rien ne part sans vous', d: 'Chaque transmission demande un consentement explicite et une double confirmation. Vous choisissez les sections.' },
    { icon: EyeOff, t: 'Votre nom n’est jamais montré à l’IA', d: 'Côté soignant, les identifiants sont masqués avant tout traitement par l’IA, et c’est visible à l’écran.' },
    { icon: Trash2, t: 'Effacement en un clic', d: '« Tout effacer » supprime la fiche de l’appareil immédiatement et définitivement.' },
    { icon: X, t: 'Aucun pistage', d: 'Pas de cookie publicitaire, pas d’outil d’analyse, pas de revente. Le fond de carte OpenStreetMap est le seul appel externe.' },
  ]
  return (
    <div>
      <div className="rise eyebrow text-north">Vie privée</div>
      <h1 className="rise rise-1 display mt-3 max-w-3xl text-4xl sm:text-5xl">Des données parmi les plus sensibles qui soient. On les traite comme telles.</h1>
      <div className="mt-10 grid gap-4 sm:grid-cols-2 lg:grid-cols-3">
        {promises.map(({ icon: Icon, t, d }, n) => (
          <div key={t} className="rise rounded-3xl border border-rule p-6" style={{ animationDelay: `${n * 70}ms` }}>
            <span className="grid h-11 w-11 place-items-center rounded-2xl bg-north-soft text-north"><Icon size={20} strokeWidth={1.75} /></span>
            <div className="mt-5 text-[17px] font-medium">{t}</div>
            <p className="mt-2 text-[15px] leading-relaxed text-ink-2">{d}</p>
          </div>
        ))}
      </div>
      <div className="mt-8 rounded-3xl border border-warn/30 bg-warn-soft p-6 text-warn">
        <div className="flex items-center gap-2 font-medium"><AlertTriangle size={18} strokeWidth={1.75} /> Bêta de test</div>
        <p className="mt-2 text-[15px] leading-relaxed">Cette version sert à tester le parcours. N’y entrez pas de vraies données. En production : hébergement au Canada, évaluation des facteurs relatifs à la vie privée (Loi 25), audit de sécurité indépendant, transmission chiffrée de bout en bout.</p>
      </div>
    </div>
  )
}

/* ───────────── Petits composants ───────────── */

function Card({ icon: Icon, title, children, wide }: { icon: typeof Lock; title: string; children: React.ReactNode; wide?: boolean }) {
  return (
    <section className={`rise rounded-3xl border border-rule bg-paper p-6 transition-colors duration-500 focus-within:border-ink-3 ${wide ? 'lg:col-span-2' : ''}`}>
      <div className="mb-4 flex items-center gap-2.5">
        <span className="grid h-9 w-9 place-items-center rounded-xl bg-panel text-ink-2"><Icon size={17} strokeWidth={1.75} /></span>
        <h2 className="text-[16px] font-medium">{title}</h2>
      </div>
      {children}
    </section>
  )
}

function Field({ label, children }: { label: string; children: React.ReactNode }) {
  return <label className="block"><span className="mb-1.5 block text-sm text-ink-2">{label}</span>{children}</label>
}

function Chips({ options, value, onToggle }: { options: string[]; value: string[]; onToggle: (v: string) => void }) {
  return (
    <div className="flex flex-wrap gap-2">
      {options.map((o) => {
        const on = value.includes(o)
        return (
          <button key={o} type="button" onClick={() => onToggle(o)} aria-pressed={on} className={`press inline-flex items-center gap-1.5 rounded-full border px-3.5 py-2 text-sm transition-colors duration-500 ${on ? 'border-north bg-north text-paper' : 'border-rule hover:border-ink-3'}`}>
            {on && <Check size={14} strokeWidth={2.25} />} {o}
          </button>
        )
      })}
    </div>
  )
}

function TriSelect({ value, onChange }: { value: Tri; onChange: (v: Tri) => void }) {
  const opts: [Tri, string][] = [['oui', 'Oui'], ['non', 'Non'], ['nsp', 'Je ne sais pas']]
  const idx = opts.findIndex(([v]) => v === value)
  return (
    <div className="relative inline-grid grid-cols-3 rounded-full bg-panel p-1 text-sm">
      {idx >= 0 && <span className="absolute inset-y-1 left-1 w-[calc((100%-8px)/3)] rounded-full bg-ink transition-transform duration-500 ease-[var(--ease-out-soft)]" style={{ transform: `translateX(${idx * 100}%)` }} />}
      {opts.map(([v, l]) => (
        <button key={v} type="button" onClick={() => onChange(value === v ? '' : v)} className={`press relative z-10 rounded-full px-4 py-2 transition-colors duration-500 ${value === v ? 'text-paper' : 'text-ink-2 hover:text-ink'}`}>{l}</button>
      ))}
    </div>
  )
}

function Check2({ label, checked, onChange, id }: { label: string; checked: boolean; onChange: (v: boolean) => void; id?: string }) {
  return (
    <label id={id} className="press mt-3 flex cursor-pointer items-start gap-3 rounded-2xl p-1 text-[15px]">
      <input type="checkbox" className="sr-only" checked={checked} onChange={(e) => onChange(e.target.checked)} />
      <span className={`mt-0.5 grid h-5 w-5 shrink-0 place-items-center rounded-md border transition-all duration-500 ${checked ? 'border-north bg-north text-paper' : 'border-ink-3/50'}`}>
        <Check size={13} strokeWidth={2.5} className={`transition-all duration-500 ${checked ? 'scale-100 opacity-100' : 'scale-50 opacity-0'}`} />
      </span>
      {label}
    </label>
  )
}

function Toggle({ label, hint, on, set }: { label: string; hint: string; on: boolean; set: (v: boolean) => void }) {
  return (
    <button type="button" onClick={() => set(!on)} aria-pressed={on} className="press flex w-full items-center justify-between gap-3 rounded-2xl px-1 py-2.5 text-left">
      <span><span className="block text-[15px]">{label}</span><span className="block text-xs text-ink-3">{hint}</span></span>
      <span className={`relative h-7 w-12 shrink-0 rounded-full transition-colors duration-500 ${on ? 'bg-north' : 'bg-rule'}`}>
        <span className={`absolute top-1 h-5 w-5 rounded-full bg-paper shadow transition-transform duration-500 ease-[var(--ease-out-soft)] ${on ? 'translate-x-6' : 'translate-x-1'}`} />
      </span>
    </button>
  )
}

const wait = (ms: number) => new Promise((r) => setTimeout(r, ms))
