import { useCallback, useEffect, useRef, useState } from 'react'
import { ArrowLeft, ArrowRight, FileLock2, HeartHandshake, Scale, ShieldCheck, Stethoscope, ToggleRight, X } from 'lucide-react'

const SEEN = 'boussole.parcours.vu'

const STEPS = [
  {
    icon: ShieldCheck,
    title: 'Vous êtes en sécurité',
    text: 'Les centres désignés accueillent 24 h/24. Vous n’avez aucune décision à prendre ce soir : on avance à votre rythme.',
    control: 'Vous pouvez arrêter à tout moment.',
  },
  {
    icon: ToggleRight,
    title: 'Vous choisissez, étape par étape',
    text: 'Examen, chaque prélèvement, conservation, transmission : chaque consentement est séparé et peut être retiré.',
    control: 'Dire non à une étape ne ferme aucune porte.',
  },
  {
    icon: FileLock2,
    title: 'Votre récit, une seule fois',
    text: 'Une fiche guidée que vous remplissez quand vous le souhaitez. Elle reste chiffrée sur votre appareil, avec votre phrase secrète.',
    control: 'Les trous de mémoire sont normaux. « Je ne sais pas » est une réponse.',
  },
  {
    icon: Stethoscope,
    title: 'Examens et prélèvements',
    text: 'Selon le temps écoulé, certains examens sont urgents (toxicologie, prophylaxie, trousse jusqu’à 5 jours). On vous montre où aller à Montréal.',
    control: 'Chaque prélèvement peut être refusé individuellement.',
  },
  {
    icon: HeartHandshake,
    title: 'Un soutien psychologique',
    text: 'CALACS, CAVAC, Ligne-ressource 24 h/24 et répertoire officiel des psychologues : tout est sur la carte, avec les numéros.',
    control: 'Gratuit, confidentiel, sans obligation de porter plainte.',
  },
  {
    icon: Scale,
    title: 'Si vous le décidez : le dossier',
    text: 'Boussole assemble votre récit, vos examens et un journal infalsifiable, puis les transmet à un service juridique spécialisé (Rebâtir, gratuit).',
    control: 'Rien ne part sans votre double confirmation.',
  },
]

export function shouldShowParcours() {
  try { return !localStorage.getItem(SEEN) } catch { return true }
}

export default function Parcours({ open, onClose, onStart }: { open: boolean; onClose: () => void; onStart?: () => void }) {
  const [i, setI] = useState(0)
  const [dir, setDir] = useState(1)
  const [never, setNever] = useState(true)
  const dialog = useRef<HTMLDivElement>(null)

  const close = useCallback(() => {
    if (never) { try { localStorage.setItem(SEEN, '1') } catch { /* rien */ } }
    onClose()
  }, [never, onClose])
  const go = useCallback((n: number) => { setDir(n > i ? 1 : -1); setI(Math.max(0, Math.min(STEPS.length - 1, n))) }, [i])

  useEffect(() => {
    if (!open) return
    setI(0)
    const prev = document.activeElement as HTMLElement | null
    dialog.current?.focus()
    document.body.style.overflow = 'hidden'
    return () => { document.body.style.overflow = ''; prev?.focus() }
  }, [open])

  useEffect(() => {
    if (!open) return
    const onKey = (e: KeyboardEvent) => {
      if (e.key === 'Escape') close()
      if (e.key === 'ArrowRight') go(i + 1)
      if (e.key === 'ArrowLeft') go(i - 1)
    }
    window.addEventListener('keydown', onKey)
    return () => window.removeEventListener('keydown', onKey)
  }, [open, i, go, close])

  if (!open) return null
  const s = STEPS[i]
  const last = i === STEPS.length - 1
  const Icon = s.icon

  return (
    <div className="fixed inset-0 z-50 flex items-end justify-center sm:items-center" role="presentation">
      <div className="fade-in absolute inset-0 bg-ink/40 backdrop-blur-sm" onClick={close} />
      <div
        ref={dialog}
        tabIndex={-1}
        role="dialog"
        aria-modal="true"
        aria-labelledby="parcours-title"
        className="sheet-in relative w-full max-w-xl overflow-hidden rounded-t-3xl border border-rule bg-paper shadow-[0_30px_80px_-20px_rgba(22,24,29,0.45)] outline-none sm:rounded-3xl"
      >
        <div className="flex items-center justify-between px-6 pt-5">
          <span className="eyebrow text-north">La prise en charge, en 6 étapes</span>
          <button onClick={close} aria-label="Fermer" className="press grid h-9 w-9 place-items-center rounded-full text-ink-2 hover:bg-panel hover:text-ink">
            <X size={18} strokeWidth={1.75} />
          </button>
        </div>
        <div className="mt-4 flex gap-1.5 px-6" aria-hidden>
          {STEPS.map((_, n) => (
            <button key={n} tabIndex={-1} onClick={() => go(n)} className="h-1.5 flex-1 overflow-hidden rounded-full bg-panel">
              <span className={`block h-full rounded-full bg-north transition-transform duration-700 ease-[var(--ease-out-soft)] origin-left ${n <= i ? 'scale-x-100' : 'scale-x-0'}`} />
            </button>
          ))}
        </div>

        <div key={i} className={`px-6 pb-2 pt-8 ${dir > 0 ? 'slide-l' : 'slide-r'}`}>
          <div className="grid h-14 w-14 place-items-center rounded-2xl bg-north-soft text-north">
            <Icon size={26} strokeWidth={1.6} />
          </div>
          <div className="mt-6 font-mono text-xs text-ink-3">Étape {i + 1} sur {STEPS.length}</div>
          <h2 id="parcours-title" className="display mt-2 text-[2rem] sm:text-4xl">{s.title}</h2>
          <p className="mt-4 text-[17px] leading-relaxed text-ink-2">{s.text}</p>
          <div className="mt-5 flex items-start gap-2.5 rounded-2xl bg-panel px-4 py-3 text-[15px]">
            <ShieldCheck size={18} strokeWidth={1.75} className="mt-0.5 shrink-0 text-north" />
            {s.control}
          </div>
        </div>

        <div className="mt-6 flex items-center justify-between gap-3 border-t border-rule px-6 py-4">
          <label className="flex cursor-pointer items-center gap-2 text-sm text-ink-3">
            <input type="checkbox" checked={never} onChange={(e) => setNever(e.target.checked)} className="h-4 w-4 rounded accent-[#0F7A64]" />
            Ne plus afficher
          </label>
          <div className="flex gap-2">
            <button onClick={() => go(i - 1)} disabled={i === 0} aria-label="Étape précédente" className="press grid h-11 w-11 place-items-center rounded-full border border-rule text-ink-2 hover:border-ink hover:text-ink disabled:opacity-30">
              <ArrowLeft size={18} strokeWidth={1.75} />
            </button>
            {last ? (
              <button onClick={() => { close(); onStart?.() }} className="press inline-flex h-11 items-center gap-2 rounded-full bg-north px-5 font-medium text-paper hover:bg-ink">
                Commencer <ArrowRight size={17} strokeWidth={1.75} />
              </button>
            ) : (
              <button onClick={() => go(i + 1)} className="press inline-flex h-11 items-center gap-2 rounded-full bg-ink px-5 font-medium text-paper hover:bg-north">
                Suivant <ArrowRight size={17} strokeWidth={1.75} />
              </button>
            )}
          </div>
        </div>
      </div>
    </div>
  )
}
