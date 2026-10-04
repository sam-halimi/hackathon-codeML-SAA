// Ordre de prise en charge après une agression sexuelle, d'après les sources officielles
// (Info-aide violence sexuelle / CVASM, CIUSSS de Montréal 2026, dépliant SPVM mai 2026, quebec.ca, IVAC).
// Détail et liens : research-resources.md. Délais indicatifs, confirmés par l'équipe médicale sur place.
export type CareStep = {
  icon: 'danger' | 'phone' | 'shirt' | 'exam' | 'choice' | 'support' | 'legal' | 'file'
  tint: 'coral' | 'north' | 'sky' | 'sage' | 'sun'
  title: string
  text: string
  timing?: string
  tips?: string[]
  action?: { label: string; href?: string; tab?: string }
  source?: string
}

export const CARE_STEPS: CareStep[] = [
  {
    icon: 'danger', tint: 'coral', title: 'Vous mettre en sécurité',
    text: 'Si vous êtes en danger ou gravement blessée, appelez le 911. Sinon, allez dans un endroit où vous vous sentez en sécurité, avec une personne de confiance si vous le souhaitez.',
    action: { label: 'Appeler le 911', href: 'tel:911' }, source: 'SPVM (2026)',
  },
  {
    icon: 'phone', tint: 'north', title: 'Appeler Info-aide',
    text: 'Info-aide violence sexuelle : gratuit, confidentiel, bilingue, 24 h/24. Une intervenante vous écoute et vous dit où aller. Vous pouvez aussi clavarder.',
    action: { label: '+1 888 933-9007', href: 'tel:+18889339007' }, source: 'CVASM, Info-aide violence sexuelle',
  },
  {
    icon: 'shirt', tint: 'sun', title: 'Préserver les preuves, si possible',
    text: 'Ces gestes aident si vous choisissez la trousse. Si vous les avez déjà faits, ce n’est pas grave : venez quand même.',
    tips: [
      'Éviter de vous laver, d’uriner, de manger ou de boire, si vous le pouvez.',
      'Garder les vêtements non lavés dans un sac en papier, pas en plastique.',
      'Apporter des vêtements de rechange.',
    ],
    source: 'SPVM (2026) ; guide du MSSS',
  },
  {
    icon: 'exam', tint: 'sky', title: 'Aller dans un centre désigné',
    text: 'Une équipe formée vous accueille : intervenante, médecin, infirmière. Gratuit et confidentiel, sans carte d’assurance maladie, sans référence et sans plainte obligatoire. Vous pouvez venir accompagnée.',
    timing: 'Le plus tôt possible : en urgence dans les 5 à 7 jours, sur rendez-vous ensuite.',
    action: { label: 'Voir les centres sur la carte', tab: 'aller' }, source: 'CVASM ; CIUSSS de Montréal (2026)',
  },
  {
    icon: 'file', tint: 'sky', title: 'Recevoir des soins',
    text: 'Soins des blessures, dépistage et prévention des infections, contraception d’urgence. Les soins vous sont offerts même si vous refusez la trousse ou ne portez pas plainte.',
    timing: 'Prophylaxie VIH : dans les 72 h. Contraception d’urgence : jusqu’à 5 jours.',
    source: 'CVASM ; formation CISSS (2025)',
  },
  {
    icon: 'choice', tint: 'sage', title: 'Choisir la trousse, ou non',
    text: 'La trousse médicolégale recueille des preuves. Vous pouvez la faire sans avoir décidé de porter plainte : elle est conservée en attendant votre décision. Vous pouvez refuser chaque prélèvement.',
    timing: 'Trousse : jusqu’à 5 à 7 jours selon les sources. Recherche de drogues : le plus tôt possible.',
    source: 'SPVM (2026) ; CVASM',
  },
  {
    icon: 'support', tint: 'sage', title: 'Être soutenue, sur la durée',
    text: 'Une intervenante vous accompagne dès le centre désigné. Ensuite, les CALACS, le CAVAC, le MCVI ou Criphase offrent un soutien gratuit. L’aide est possible même des années plus tard.',
    action: { label: 'Trouver du soutien près de moi', tab: 'aller' }, source: 'CVASM ; CIUSSS de Montréal',
  },
  {
    icon: 'legal', tint: 'north', title: 'Vos droits, à votre rythme',
    text: 'Porter plainte est votre décision, peu importe le délai. Rebâtir offre des conseils juridiques gratuits. L’IVAC peut payer une thérapie ou compenser une perte de revenu, sans délai pour la violence sexuelle.',
    action: { label: 'Préparer mon dossier', tab: 'dossier' }, source: 'rebatir.ca ; SPVM (2026) ; IVAC',
  },
]
