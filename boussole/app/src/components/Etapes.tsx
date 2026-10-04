import { useCallback, useEffect, useRef, useState } from 'react'
import { ArrowLeft, ArrowRight, Clock, FileLock2, HeartHandshake, Phone, Scale, ShieldAlert, Shirt, Stethoscope, ToggleRight, X } from 'lucide-react'
import { CARE_STEPS } from '../lib/careSteps'

const ICONS = { danger: ShieldAlert, phone: Phone, shirt: Shirt, exam: Stethoscope, choice: ToggleRight, support: HeartHandshake, legal: Scale, file: FileLock2 }
const TINT: Record<string, string> = {
  coral: 'bg-coral-soft text-coral', north: 'bg-north-soft text-north', sky: 'bg-sky-soft text-sky', sage: 'bg-sage-soft text-sage', sun: 'bg-sun-soft text-warn',
}

export default function Etapes({ open, onClose, prenom, go }: { open: boolean; onClose: () => void; prenom?: string; go: (tab: string) => void }) {
  const [i, setI] = useState(0)
  const [dir, setDir] = useState(1)
  const dialog = useRef<HTMLDivElement>(null)
  const steps = CARE_STEPS
  const move = useCallback((n: number) => { setDir(n > i ? 1 : -1); setI(Math.max(0, Math.min(steps.length - 1, n))) }, [i, steps.length])

  useEffect(() => {
    if (!open) return
    setI(0)
    dialog.current?.focus()
    document.body.style.overflow = 'hidden'
    return () => { document.body.style.overflow = '' }
  }, [open])
  useEffect(() => {
    if (!open) return
    const onKey = (e: KeyboardEvent) => {
      if (e.key === 'Escape') onClose()
      if (e.key === 'ArrowRight') move(i + 1)
      if (e.key === 'ArrowLeft') move(i - 1)
    }
    window.addEventListener('keydown', onKey)
    return () => window.removeEventListener('keydown', onKey)
  }, [open, i, move, onClose])

  if (!open) return null
  const s = steps[i]
  const Icon = ICONS[s.icon]
  const last = i === steps.length - 1

  return (
    <div className="fixed inset-0 z-50 flex items-end justify-center sm:items-center" role="presentation">
      <div className="fade-in absolute inset-0 bg-ink/45 backdrop-blur-sm" onClick={onClose} />
      <div ref={dialog} tabIndex={-1} role="dialog" aria-modal="true" aria-labelledby="etape-titre" id="etapes"
        className="sheet-in relative flex max-h-[92vh] w-full max-w-2xl flex-col overflow-hidden rounded-t-[32px] bg-paper shadow-[0_40px_90px_-30px_rgba(45,36,64,.6)] outline-none sm:rounded-[32px]">
        <div className="flex items-center justify-between px-6 pt-6">
          <div>
            <div className="text-sm font-extrabold text-north">{prenom ? `${prenom}, voici` : 'Voici'} les étapes, dans l’ordre</div>
            <div className="text-xs text-ink-3">Vous pouvez vous arrêter à tout moment. Rien n’est obligatoire.</div>
          </div>
          <button onClick={onClose} aria-label="Fermer" className="press grid h-10 w-10 place-items-center rounded-full bg-panel text-ink-2 hover:bg-rule"><X size={18} strokeWidth={2.25} /></button>
        </div>

        {/* Frise des étapes, cliquable */}
        <ol className="mt-5 flex gap-1.5 overflow-x-auto px-6 pb-1">
          {steps.map((st, n) => (
            <li key={st.title} className="shrink-0">
              <button onClick={() => move(n)} aria-label={`Étape ${n + 1} : ${st.title}`}
                className={`press grid h-9 min-w-9 place-items-center rounded-full px-2 text-sm font-extrabold transition-all duration-500 ${n === i ? 'bg-ink text-white' : n < i ? `${TINT[st.tint]}` : 'bg-panel text-ink-3'}`}>
                {n + 1}
              </button>
            </li>
          ))}
        </ol>

        <div key={i} className={`flex-1 overflow-auto px-6 pb-2 pt-6 ${dir > 0 ? 'slide-l' : 'slide-r'}`}>
          <div className="flex items-start gap-4">
            <span className={`grid h-16 w-16 shrink-0 place-items-center rounded-[22px] ${TINT[s.tint]}`}><Icon size={30} strokeWidth={1.9} /></span>
            <div>
              <div className="text-xs font-extrabold text-ink-3">Étape {i + 1} sur {steps.length}</div>
              <h2 id="etape-titre" className="display mt-1 text-[1.9rem] sm:text-4xl">{s.title}</h2>
            </div>
          </div>
          <p className="mt-5 text-[17px] leading-relaxed text-ink-2">{s.text}</p>
          {s.timing && (
            <div className="mt-4 inline-flex items-start gap-2 rounded-2xl bg-sun-soft px-4 py-3 text-[15px] font-bold text-warn"><Clock size={18} strokeWidth={2} className="mt-0.5 shrink-0" /> {s.timing}</div>
          )}
          {s.tips && (
            <ul className="mt-4 space-y-2">
              {s.tips.map((t) => <li key={t} className="flex gap-2.5 rounded-2xl bg-white px-4 py-3 text-[15px] leading-relaxed shadow-[0_10px_24px_-22px_rgba(45,36,64,.6)]"><span className="mt-2 h-2 w-2 shrink-0 rounded-full bg-north" /> {t}</li>)}
            </ul>
          )}
          {s.action && (
            s.action.href ? (
              <a href={s.action.href} className="press mt-5 inline-flex items-center gap-2 rounded-full bg-coral px-5 py-3 font-extrabold text-white hover:brightness-105"><Phone size={17} strokeWidth={2.25} /> {s.action.label}</a>
            ) : (
              <button onClick={() => go(s.action!.tab!)} className="press mt-5 inline-flex items-center gap-2 rounded-full bg-north-soft px-5 py-3 font-extrabold text-north hover:bg-north hover:text-white">{s.action.label} <ArrowRight size={17} strokeWidth={2.25} /></button>
            )
          )}
          {s.source && <p className="mt-5 text-xs text-ink-3">Source : {s.source}</p>}
        </div>

        <div className="flex items-center justify-between gap-3 border-t border-rule px-6 py-4">
          <button onClick={onClose} className="press rounded-full px-3 py-2 text-sm font-bold text-ink-3 hover:bg-panel">Plus tard</button>
          <div className="flex gap-2">
            <button onClick={() => move(i - 1)} disabled={i === 0} aria-label="Étape précédente" className="press grid h-12 w-12 place-items-center rounded-full bg-panel text-ink hover:bg-rule disabled:opacity-30"><ArrowLeft size={19} strokeWidth={2.25} /></button>
            <button id="etape-next" onClick={() => (last ? onClose() : move(i + 1))} className="press inline-flex h-12 items-center gap-2 rounded-full bg-ink px-6 font-extrabold text-white hover:bg-north">
              {last ? 'C’est compris' : 'Suivant'} <ArrowRight size={18} strokeWidth={2.25} />
            </button>
          </div>
        </div>
      </div>
    </div>
  )
}
