import { useState } from 'react'
import { ArrowRight, ArrowUpRight, Clock, Route, Stethoscope, Fingerprint, Link2, Lock, ScrollText, ShieldCheck, Sparkles, UserCheck } from 'lucide-react'
import { Mark, Wordmark } from './Logo'
import Parcours from './Parcours'

const NB = ' '

const LEAKS = [
  { step: 'Où aller', stat: '3', unit: 'hôpitaux', text: `avant d'obtenir une trousse, pour une victime réorientée à Montréal (2020).`, src: 'Noovo' },
  { step: 'La première nuit', stat: '24', unit: 'heures', text: 'après, le sang ne révèle plus la plupart des drogues.', src: 'ANSI/ASB 121' },
  { step: 'La police', stat: '1/5', unit: 'plaintes', text: `classées «${NB}non fondées${NB}», près de deux fois plus que les voies de fait.`, src: 'The Globe and Mail' },
  { step: 'Le tribunal', stat: '1/3', unit: 'causes', text: `au-delà des délais Jordan en 2022-2023.`, src: 'Ombudsman fédéral des victimes' },
]

const LAYERS = [
  { icon: ScrollText, t: 'Règles', d: `Délais et prélèvements prioritaires calculés par des règles écrites, validées et versionnées par l'établissement. Aucune IA dans une décision médicale.` },
  { icon: Sparkles, t: 'IA', d: `Range les notes libres en chronologie. Chaque ligne cite sa phrase source. Signale les trous et les incohérences du dossier, jamais de la mémoire de la victime.` },
  { icon: UserCheck, t: 'Humain', d: `Le soignant valide ou rejette chaque suggestion. La victime décide de chaque étape. Le juge tranche.` },
]

const PRIVACY = [
  { icon: Fingerprint, t: `Pseudonymisation avant l'IA`, d: `Nom, date de naissance, adresse et téléphone masqués avant tout envoi, et visibles à l'écran.` },
  { icon: Lock, t: 'Consentement par finalité', d: `Révocable. Rien vers la police sans décision explicite de la personne.` },
  { icon: Link2, t: 'Journal infalsifiable', d: `Chaque action chaînée par SHA-256 : toute modification est détectée.` },
  { icon: ShieldCheck, t: 'En production', d: `Hébergement au Canada, chiffrement, évaluation Loi${NB}25, aucun entraînement sur les données.` },
]

export default function Landing() {
  const [parcours, setParcours] = useState(false)
  return (
    <div className="min-h-screen">
      <Parcours open={parcours} onClose={() => setParcours(false)} onStart={() => { window.location.hash = '#/espace' }} />
      <header className="sticky top-0 z-20 border-b border-rule bg-paper/90 backdrop-blur">
        <div className="mx-auto flex max-w-7xl items-stretch">
          <a href="#/" className="press flex items-center border-r border-rule px-6 py-4"><Wordmark animate /></a>
          <nav className="hidden flex-1 items-stretch md:flex">
            {[['Problème', '#probleme'], ['Fonctionnement', '#fonctionnement'], ['Confidentialité', '#confidentialite'], ['Pilote', '#pilote']].map(([l, h]) => (
              <a key={h} href={h} className="press flex items-center border-r border-rule px-6 text-sm text-ink-2 hover:bg-panel hover:text-ink">{l}</a>
            ))}
          </nav>
          <a href="#/espace" className="press group ml-auto flex items-center gap-2 bg-ink px-6 text-sm font-medium text-paper hover:bg-north">
            Ouvrir mon espace <ArrowRight size={16} strokeWidth={1.75} className="transition-transform duration-500 ease-[var(--ease-out-soft)] group-hover:translate-x-1" />
          </a>
        </div>
      </header>

      {/* Hero : une seule idée, en grille apparente */}
      <section className="border-b border-rule">
        <div className="mx-auto grid max-w-7xl md:grid-cols-[1.5fr_1fr]">
          <div className="flex min-h-[70vh] flex-col justify-end border-rule px-6 pb-14 pt-24 md:border-r">
            <div className="rise eyebrow text-north">Copilote des centres désignés</div>
            <h1 className="rise rise-1 display mt-6 text-[clamp(3.25rem,8vw,7rem)]">
              On répare<br />la première nuit.
            </h1>
          </div>
          <div className="flex flex-col justify-end px-6 pb-14 pt-10">
            <p className="rise rise-2 text-[19px] leading-relaxed text-ink-2">
              Un seul récit, des consentements respectés, des délais de preuve tenus, un dossier qui tient devant un juge.
            </p>
            <p className="rise rise-3 mt-6 text-[19px] font-medium">L'IA guide. L'humain décide.</p>
            <div className="rise rise-4 mt-8 flex flex-wrap gap-2">
              <button onClick={() => setParcours(true)} className="press group inline-flex items-center gap-2 rounded-full bg-north px-5 py-3 font-medium text-paper hover:bg-ink">
                <Route size={17} strokeWidth={1.75} /> Voir les étapes
              </button>
              <a href="#/demo" className="press inline-flex items-center gap-2 rounded-full border border-rule px-5 py-3 font-medium hover:border-ink">
                <Stethoscope size={17} strokeWidth={1.75} /> Outil soignant
              </a>
            </div>
            <div className="rise rise-4 mt-6 eyebrow text-ink-3">Bêta de test · données fictives uniquement</div>
          </div>
        </div>
      </section>

      <section id="probleme" className="border-b border-rule">
        <div className="mx-auto max-w-7xl px-6 py-28 sm:py-36">
          <div className="eyebrow text-ink-3">01 · Le problème</div>
          <h2 className="display mt-5 max-w-4xl text-[clamp(2.25rem,4.5vw,4rem)]">
            Le problème n'est pas la parole des victimes. C'est le dossier qui se construit mal, trop tard, au mauvais endroit.
          </h2>
          <p className="mt-6 max-w-2xl text-[18px] leading-relaxed text-ink-2">
            Au Canada, seulement <span className="font-medium text-ink">6 %</span> des agressions sexuelles sont signalées à la police (StatCan, 2019). Et le dossier fuit à chaque étape.
          </p>
        </div>
        <div className="mx-auto grid max-w-7xl border-t border-rule sm:grid-cols-2 lg:grid-cols-4">
          {LEAKS.map((l, i) => (
            <div key={l.step} className="border-b border-rule px-6 py-10 sm:border-r lg:border-b-0 lg:last:border-r-0">
              <div className="eyebrow text-ink-3">Fuite {i + 1} · {l.step}</div>
              <div className="display mt-6 text-7xl tabular-nums">{l.stat}<span className="ml-2 text-xl font-normal tracking-normal text-ink-3">{l.unit}</span></div>
              <p className="mt-4 text-[16px] leading-relaxed text-ink-2">{l.text}</p>
              <p className="mt-4 font-mono text-[11px] text-ink-3">{l.src}</p>
            </div>
          ))}
        </div>
      </section>

      <section id="fonctionnement" className="border-b border-rule">
        <div className="mx-auto max-w-7xl px-6 py-28 sm:py-36">
          <div className="eyebrow text-ink-3">02 · Fonctionnement</div>
          <h2 className="display mt-5 max-w-3xl text-[clamp(2.25rem,4.5vw,4rem)]">Trois couches, trois responsabilités.</h2>
          <p className="mt-6 max-w-2xl text-[18px] leading-relaxed text-ink-2">
            L'IA fait le travail de secrétaire, jamais celui de juge : aucune désignation de coupable, aucun score de crédibilité, aucune reconnaissance faciale.
          </p>
        </div>
        <div className="mx-auto grid max-w-7xl border-t border-rule md:grid-cols-3">
          {LAYERS.map(({ icon: Icon, t, d }, i) => (
            <div key={t} className="border-b border-rule px-6 py-12 md:border-b-0 md:border-r md:last:border-r-0">
              <div className="flex items-center justify-between">
                <span className="font-mono text-sm text-ink-3">0{i + 1}</span>
                <Icon size={22} strokeWidth={1.5} className={i === 1 ? 'text-north' : 'text-ink'} />
              </div>
              <div className="display mt-10 text-4xl">{t}</div>
              <p className="mt-4 text-[16px] leading-relaxed text-ink-2">{d}</p>
            </div>
          ))}
        </div>
      </section>

      <section id="confidentialite" className="border-b border-rule bg-ink text-paper">
        <div className="mx-auto grid max-w-7xl gap-16 px-6 py-28 sm:py-36 lg:grid-cols-[1fr_1.3fr]">
          <div>
            <div className="eyebrow text-paper/50">03 · Confidentialité</div>
            <h2 className="display mt-5 text-[clamp(2.25rem,4.5vw,4rem)]">Des données parmi les plus sensibles qui soient.</h2>
          </div>
          <div className="grid gap-px overflow-hidden rounded-2xl border border-paper/15 bg-paper/15 sm:grid-cols-2">
            {PRIVACY.map(({ icon: Icon, t, d }) => (
              <div key={t} className="bg-ink p-6">
                <Icon size={20} strokeWidth={1.5} className="text-[#6FC3AE]" />
                <div className="mt-6 text-[17px] font-medium">{t}</div>
                <p className="mt-2 text-[15px] leading-relaxed text-paper/70">{d}</p>
              </div>
            ))}
          </div>
        </div>
      </section>

      <section className="border-b border-rule">
        <div className="mx-auto max-w-7xl px-6 py-28 sm:py-36">
          <div className="eyebrow text-ink-3">04 · Pour qui</div>
          <h2 className="display mt-5 max-w-3xl text-[clamp(2.25rem,4.5vw,4rem)]">Pensé pour le soin, pas pour la poursuite.</h2>
        </div>
        <div className="mx-auto grid max-w-7xl border-t border-rule sm:grid-cols-2 lg:grid-cols-4">
          {[
            ['Paie', `Établissements de santé (CISSS, CIUSSS) qui hébergent les centres désignés. Licence annuelle par centre.`],
            ['Utilise', 'Infirmières, médecins et intervenantes des équipes médicosociales.'],
            ['Bénéficie', 'Les victimes. Gratuit, toujours.'],
            ['Reçoit', `Police et DPCP : un dossier complet, avec consentement. Ils ne pilotent pas l'outil.`],
          ].map(([k, v]) => (
            <div key={k} className="border-b border-rule px-6 py-10 sm:border-r lg:border-b-0 lg:last:border-r-0">
              <div className="eyebrow text-north">{k}</div>
              <p className="mt-5 text-[17px] leading-relaxed">{v}</p>
            </div>
          ))}
        </div>
      </section>

      <section id="pilote" className="border-b border-rule bg-panel">
        <div className="mx-auto grid max-w-7xl items-end gap-10 px-6 py-28 sm:py-36 md:grid-cols-[1.5fr_1fr]">
          <div>
            <div className="eyebrow text-ink-3">05 · Pilote</div>
            <h2 className="display mt-5 text-[clamp(2.5rem,5.5vw,5rem)]">On cherche un centre désigné pour un pilote de 3 mois.</h2>
            <p className="mt-6 max-w-xl text-[18px] leading-relaxed text-ink-2">
              Mesures : récits répétés, prélèvements dans les délais, dossiers incomplets, temps administratif.
            </p>
          </div>
          <a href="#/espace" className="press group flex items-center justify-between rounded-3xl bg-ink px-7 py-6 text-lg font-medium text-paper hover:bg-north">
            Ouvrir mon espace
            <ArrowUpRight size={22} strokeWidth={1.5} className="transition-transform duration-500 ease-[var(--ease-out-soft)] group-hover:-translate-y-1 group-hover:translate-x-1" />
          </a>
        </div>
      </section>

      <footer className="overflow-hidden">
        <div className="mx-auto max-w-7xl px-6 pt-20">
          <p className="max-w-2xl text-[19px] italic leading-relaxed text-ink-2">
            «{NB}On ne remplace pas l'humain auprès de la victime. On lui rend le temps de l'être.{NB}»
          </p>
          <div className="mt-16 flex items-end gap-5 border-t border-rule pt-10">
            <Mark size={64} />
            <span className="display text-[clamp(4rem,14vw,12rem)] leading-[0.8] text-ink">Boussole</span>
          </div>
          <div className="flex flex-wrap justify-between gap-4 border-t border-rule py-6 font-mono text-[11px] text-ink-3">
            <span>Prototype de hackathon · Propolys, Startup Challenge Sécurité &amp; IA · 2026</span>
            <span className="flex items-center gap-1.5"><Clock size={12} strokeWidth={1.75} /> Délais affichés : prototype, à valider par sources médicales</span>
            <span>Besoin d'aide : CAVAC, CALACS, ligne-ressource provinciale</span>
          </div>
        </div>
      </footer>
    </div>
  )
}
