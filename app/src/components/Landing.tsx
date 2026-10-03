import { Logo } from './Demo'

const LEAKS = [
  { step: 'Où aller ?', stat: '3 hôpitaux', text: "Une victime francophone a été réorientée trois fois à Montréal avant d'obtenir une trousse (2020).", src: 'Noovo' },
  { step: 'La première nuit', stat: '< 24 h', text: 'La plupart des drogues ne sont plus détectables dans le sang après 24 h. La trousse : 5 jours au plus.', src: 'ANSI/ASB 121 · protocole QC' },
  { step: 'La police', stat: '1 sur 5', text: 'plaintes pour agression sexuelle classées « non fondées », près de deux fois plus que les voies de fait.', src: 'Globe and Mail, 2017' },
  { step: 'Le tribunal', stat: '1 sur 7', text: "causes d'agression sexuelle arrêtées ou retirées pour délais déraisonnables (arrêt Jordan), 2022-2023.", src: 'Ombudsman fédéral des victimes' },
]

export default function Landing() {
  return (
    <div className="min-h-screen">
      <div className="bg-alert text-white text-center text-xs font-semibold py-1">PROTOTYPE · HACKATHON CODEML 2026 · DÉMONSTRATION SUR DONNÉES 100 % FICTIVES</div>

      <section className="bg-navy text-cream">
        <div className="max-w-5xl mx-auto px-4 py-16 sm:py-24">
          <div className="flex items-center gap-2 text-xl font-bold mb-10">
            <Logo /> Boussole
          </div>
          <h1 className="text-4xl sm:text-6xl font-bold leading-tight max-w-3xl">
            L'IA guide.<br />
            <span className="text-amber">L'humain décide.</span>
          </h1>
          <p className="mt-6 text-lg text-cream/80 max-w-2xl">
            Le copilote des soignants qui accueillent une victime d'agression sexuelle : un seul récit, des consentements respectés, des délais de preuve tenus, un dossier qui tient devant un juge.
          </p>
          <div className="mt-8 flex flex-wrap gap-3">
            <a href="#/demo" className="px-6 py-3 rounded-lg bg-amber text-navy font-bold">Essayer la démo →</a>
            <a href="#pilote" className="px-6 py-3 rounded-lg border border-cream/40 font-semibold">Devenir centre pilote</a>
          </div>
        </div>
      </section>

      <section className="max-w-5xl mx-auto px-4 py-16">
        <p className="text-sm font-semibold text-alert uppercase tracking-wide">Le problème</p>
        <h2 className="text-3xl font-bold mt-1 max-w-3xl">Le problème n'est pas la parole des victimes. C'est le dossier qui se construit mal, trop tard, au mauvais endroit.</h2>
        <p className="mt-3 text-navy/70">Au Canada, seulement <b>6 %</b> des agressions sexuelles sont signalées à la police (StatCan, 2019). Et le dossier fuit à chaque étape :</p>
        <div className="mt-8 grid sm:grid-cols-2 lg:grid-cols-4 gap-4">
          {LEAKS.map((l, i) => (
            <div key={l.step} className="bg-white rounded-xl p-5 border border-navy/10">
              <div className="text-xs font-semibold text-navy/50">FUITE {i + 1} · {l.step}</div>
              <div className="text-3xl font-bold text-alert mt-2">{l.stat}</div>
              <p className="text-sm mt-2">{l.text}</p>
              <p className="text-xs text-navy/40 mt-2">{l.src}</p>
            </div>
          ))}
        </div>
        <p className="mt-6 font-semibold">On ne répare pas les tribunaux. On répare la première nuit, celle où tout commence et où la preuve se perd.</p>
      </section>

      <section className="bg-white border-y border-navy/10">
        <div className="max-w-5xl mx-auto px-4 py-16">
          <p className="text-sm font-semibold text-amber uppercase tracking-wide">Comment ça marche</p>
          <h2 className="text-3xl font-bold mt-1">Trois briques, trois responsabilités</h2>
          <div className="mt-8 grid md:grid-cols-3 gap-4">
            {[
              ['Règles', 'Délais et prélèvements prioritaires calculés par des règles écrites, validées et versionnées par l’établissement. Aucune IA dans une décision médicale.'],
              ['IA', 'Range les notes libres en chronologie. Chaque ligne cite sa phrase source. Signale les trous et les incohérences du dossier, jamais de la mémoire de la victime.'],
              ['Humain', 'Le soignant valide ou rejette chaque suggestion. La victime décide de chaque étape. Le juge tranche.'],
            ].map(([t, d]) => (
              <div key={t} className="rounded-xl p-5 bg-cream">
                <div className="text-xl font-bold">{t}</div>
                <p className="text-sm mt-2 text-navy/80">{d}</p>
              </div>
            ))}
          </div>
          <p className="mt-6 text-sm text-navy/70">
            L'IA fait le travail de secrétaire, jamais celui de juge : aucune désignation de coupable, aucun score de crédibilité, aucune reconnaissance faciale.
          </p>
        </div>
      </section>

      <section className="max-w-5xl mx-auto px-4 py-16 grid md:grid-cols-2 gap-10">
        <div>
          <p className="text-sm font-semibold text-ok uppercase tracking-wide">Confidentialité</p>
          <h2 className="text-3xl font-bold mt-1">Des données parmi les plus sensibles qui soient</h2>
          <ul className="mt-4 space-y-2 text-sm">
            <li>🔒 <b>Pseudonymisation avant l'IA</b> : nom, date de naissance, adresse, téléphone masqués avant tout envoi. Visible à l'écran.</li>
            <li>✍ <b>Consentement par finalité</b>, révocable. Rien vers la police sans décision explicite de la personne.</li>
            <li>⛓ <b>Journal infalsifiable</b> : chaque action chaînée par SHA-256, toute modification est détectée.</li>
            <li>🇨🇦 <b>En production</b> : hébergement au Canada, chiffrement, évaluation des facteurs relatifs à la vie privée (Loi 25), aucun entraînement sur les données.</li>
          </ul>
        </div>
        <div>
          <p className="text-sm font-semibold text-navy/60 uppercase tracking-wide">Pour qui</p>
          <h2 className="text-3xl font-bold mt-1">Pensé pour le soin, pas pour la poursuite</h2>
          <ul className="mt-4 space-y-2 text-sm">
            <li><b>Établissements de santé</b> (centres désignés des CISSS/CIUSSS) : licence annuelle par centre.</li>
            <li><b>Équipes médicosociales</b> : infirmières, médecins, intervenantes.</li>
            <li><b>Victimes</b> : gratuit, toujours.</li>
            <li><b>Police et DPCP</b> : reçoivent un dossier complet, avec consentement. Ils ne pilotent pas l'outil.</li>
          </ul>
        </div>
      </section>

      <section id="pilote" className="bg-navy text-cream">
        <div className="max-w-5xl mx-auto px-4 py-16 text-center">
          <h2 className="text-3xl font-bold">On cherche un centre désigné pour un pilote de 3 mois.</h2>
          <p className="mt-3 text-cream/70">Mesures : récits répétés, prélèvements dans les délais, dossiers incomplets, temps administratif.</p>
          <a href="#/demo" className="inline-block mt-6 px-6 py-3 rounded-lg bg-amber text-navy font-bold">Voir le prototype →</a>
          <p className="mt-10 text-lg italic text-cream/90">« On ne remplace pas l'humain auprès de la victime. On lui rend le temps de l'être. »</p>
        </div>
      </section>

      <footer className="max-w-5xl mx-auto px-4 py-8 text-xs text-navy/50">
        Prototype de hackathon (Propolys · Startup Challenge Sécurité & IA). Délais affichés : prototype, à valider par sources médicales. Sources : Statistique Canada, INSPQ, Globe and Mail, Bureau de l'ombudsman fédéral des victimes d'actes criminels, ANSI/ASB 121.
        Si vous avez besoin d'aide : CAVAC, CALACS, ou la ligne-ressource provinciale pour les victimes d'agression sexuelle.
      </footer>
    </div>
  )
}
