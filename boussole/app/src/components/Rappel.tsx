import { useMemo, useState } from 'react'
import { CalendarCheck, CalendarPlus, Check, HeartHandshake, Languages, MessageSquareOff, Phone, ShieldCheck, Users, Video } from 'lucide-react'

// Choix d'un créneau de rappel par un service juridique spécialisé (simulé en bêta).
// Il y a toujours des créneaux : aujourd'hui (au plus tôt dans 1 h) jusqu'à 21 h, et demain de 8 h à 21 h.
function slotsFor(day: Date, from: number) {
  const out: Date[] = []
  for (let h = 8; h <= 20; h++) for (const m of [0, 30]) {
    const d = new Date(day); d.setHours(h, m, 0, 0)
    if (d.getTime() >= from) out.push(d)
  }
  return out
}
const fmtTime = (d: Date) => d.toLocaleTimeString('fr-CA', { hour: '2-digit', minute: '2-digit' })
const fmtDay = (d: Date) => d.toLocaleDateString('fr-CA', { weekday: 'long', day: 'numeric', month: 'long' })

export type Booking = { at: string; mode: 'tel' | 'video'; phone: string; prefs: string[] }

export default function Rappel({ onConfirm }: { onConfirm: (b: Booking) => void }) {
  const now = useMemo(() => new Date(), [])
  const today = useMemo(() => slotsFor(now, now.getTime() + 60 * 60 * 1000), [now])
  const tomorrow = useMemo(() => { const t = new Date(now); t.setDate(t.getDate() + 1); return slotsFor(t, 0) }, [now])
  const [day, setDay] = useState<0 | 1>(today.length ? 0 : 1)
  const [slot, setSlot] = useState<Date | null>(null)
  const [mode, setMode] = useState<'tel' | 'video'>('tel')
  const [phone, setPhone] = useState('+1 ')
  const [prefs, setPrefs] = useState<string[]>(['Pas de message vocal laissé'])
  const [done, setDone] = useState<Booking | null>(null)
  const list = day === 0 ? today : tomorrow
  const PREFS = [
    { t: 'Une avocate (femme) si possible', icon: HeartHandshake },
    { t: 'Un ou une interprète', icon: Languages },
    { t: 'Une personne de confiance peut être présente', icon: Users },
    { t: 'Pas de message vocal laissé', icon: MessageSquareOff },
  ]
  const validPhone = /^\+1[\s-]?\(?\d{3}\)?[\s-]?\d{3}[\s-]?\d{4}$/.test(phone.trim())

  const ics = (b: Booking) => {
    const start = new Date(b.at); const end = new Date(start.getTime() + 45 * 60000)
    const f = (d: Date) => d.toISOString().replace(/[-:]/g, '').replace(/\.\d{3}/, '')
    const body = ['BEGIN:VCALENDAR', 'VERSION:2.0', 'PRODID:-//Boussole//FR', 'BEGIN:VEVENT', `DTSTART:${f(start)}`, `DTEND:${f(end)}`, 'SUMMARY:Appel (rendez-vous personnel)', 'DESCRIPTION:Rappel simulé (bêta Boussole).', 'END:VEVENT', 'END:VCALENDAR'].join('\r\n')
    const a = document.createElement('a'); a.href = URL.createObjectURL(new Blob([body], { type: 'text/calendar' })); a.download = 'rendez-vous.ics'; a.click()
  }

  if (done) {
    const d = new Date(done.at)
    return (
      <div className="sheet-in mt-5 rounded-[28px] bg-sage-soft p-6" id="rappel-ok">
        <div className="flex items-center gap-3">
          <span className="grid h-12 w-12 place-items-center rounded-2xl bg-sage text-white"><CalendarCheck size={24} strokeWidth={2} /></span>
          <div>
            <div className="text-sm font-extrabold text-sage">Rendez-vous confirmé (simulé)</div>
            <div className="display text-2xl capitalize">{fmtDay(d)}, {fmtTime(d)}</div>
          </div>
        </div>
        <p className="mt-4 text-[15px] leading-relaxed text-ink-2">
          Un avocat ou une avocate spécialisée en violences sexuelles vous {done.mode === 'tel' ? 'appellera' : 'enverra un lien vidéo'} à cette heure-là. L’appel dure environ 30 à 45 minutes. Vous pouvez faire une pause, refuser une question ou raccrocher à tout moment : on vous rappellera quand vous voulez.
        </p>
        <div className="mt-4 flex flex-wrap gap-2">
          <button onClick={() => ics(done)} className="press inline-flex items-center gap-2 rounded-full bg-white px-4 py-2.5 text-sm font-bold hover:bg-paper"><CalendarPlus size={16} strokeWidth={2} /> Ajouter à mon agenda</button>
          <button onClick={() => setDone(null)} className="press rounded-full px-4 py-2.5 text-sm font-bold text-ink-2 hover:bg-white/60">Changer le créneau</button>
        </div>
      </div>
    )
  }

  return (
    <div className="sheet-in mt-5 rounded-[28px] bg-white p-6 shadow-[0_20px_40px_-30px_rgba(45,36,64,.5)]" id="rappel">
      <div className="text-sm font-extrabold text-north">Dernière étape</div>
      <h3 className="display mt-1 text-2xl sm:text-3xl">Quand souhaitez-vous être rappelée ?</h3>
      <p className="mt-2 text-[15px] leading-relaxed text-ink-2">Un avocat ou une avocate formée aux violences sexuelles vous appelle pour parler de votre dossier, à votre rythme, en tenant compte de ce que vous vivez.</p>

      <div className="mt-5 inline-grid grid-cols-2 rounded-full bg-panel p-1 text-sm font-bold">
        {[['Aujourd’hui', today.length], ['Demain', tomorrow.length]].map(([l, n], k) => (
          <button key={l as string} disabled={!n} onClick={() => { setDay(k as 0 | 1); setSlot(null) }} className={`press rounded-full px-5 py-2 transition-colors duration-500 disabled:opacity-30 ${day === k ? 'bg-ink text-white' : 'text-ink-2'}`}>{l}</button>
        ))}
      </div>
      <div className="mt-4 grid grid-cols-3 gap-2 sm:grid-cols-5" role="listbox" aria-label="Créneaux disponibles">
        {list.map((d) => {
          const on = slot?.getTime() === d.getTime()
          return (
            <button key={d.getTime()} role="option" aria-selected={on} onClick={() => setSlot(d)} className={`slot press rounded-2xl py-2.5 text-[15px] font-bold transition-all duration-300 ${on ? 'bg-north text-white shadow-[0_10px_20px_-12px_rgba(106,76,224,.9)]' : 'bg-north-soft text-north hover:bg-north/15'}`}>
              {fmtTime(d)}
            </button>
          )
        })}
      </div>

      <div className="mt-6 grid gap-3 sm:grid-cols-2">
        {([['tel', 'Par téléphone', Phone], ['video', 'En vidéo', Video]] as const).map(([v, l, Icon]) => (
          <button key={v} onClick={() => setMode(v)} className={`press flex items-center gap-3 rounded-2xl border-2 px-4 py-3 text-left font-bold transition-colors duration-500 ${mode === v ? 'border-north bg-north-soft text-north' : 'border-panel hover:border-rule'}`}>
            <Icon size={19} strokeWidth={2} /> {l}
          </button>
        ))}
      </div>
      <label className="mt-4 block">
        <span className="mb-1.5 block text-sm font-bold text-ink-2">Numéro où vous joindre</span>
        <input id="rappel-phone" value={phone} onChange={(e) => setPhone(e.target.value)} inputMode="tel" className="input" placeholder="+1 514 555-0123" />
      </label>

      <div className="mt-5 text-sm font-bold text-ink-2">Ce qui vous mettrait à l’aise</div>
      <div className="mt-2 flex flex-wrap gap-2">
        {PREFS.map(({ t, icon: Icon }) => {
          const on = prefs.includes(t)
          return (
            <button key={t} onClick={() => setPrefs(on ? prefs.filter((x) => x !== t) : [...prefs, t])} aria-pressed={on} className={`press inline-flex items-center gap-1.5 rounded-full border px-3.5 py-2 text-sm transition-colors duration-500 ${on ? 'border-sage bg-sage text-white' : 'border-rule hover:border-ink-3'}`}>
              {on ? <Check size={14} strokeWidth={2.5} /> : <Icon size={14} strokeWidth={2} />} {t}
            </button>
          )
        })}
      </div>

      <button id="rappel-confirm" disabled={!slot || !validPhone} onClick={() => { const b = { at: slot!.toISOString(), mode, phone: phone.trim(), prefs }; setDone(b); onConfirm(b) }}
        className="press mt-6 inline-flex w-full items-center justify-center gap-2 rounded-full bg-north py-4 font-extrabold text-white hover:bg-ink disabled:cursor-not-allowed disabled:opacity-35">
        <CalendarCheck size={18} strokeWidth={2.25} /> {slot ? `Confirmer ${day === 0 ? 'aujourd’hui' : 'demain'} à ${fmtTime(slot)}` : 'Choisissez un créneau'}
      </button>
      {!validPhone && phone.length > 3 && <p className="mt-2 text-center text-xs font-bold text-coral">Format attendu : +1 514 555-0123</p>}
      <p className="mt-3 flex items-start justify-center gap-1.5 text-center text-xs text-ink-3"><ShieldCheck size={14} strokeWidth={2} className="mt-0.5 shrink-0" /> Bêta : aucun appel réel n’est programmé. En production, le rappel est assuré par un service juridique partenaire.</p>
    </div>
  )
}
