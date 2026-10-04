// Ordre de prise en charge après une agression sexuelle, d'après les sources officielles du Québec.
// Délais indicatifs : à confirmer par l'équipe médicale du centre désigné.
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
    icon: 'danger', tint: 'coral',
    title: 'Vous mettre en sécurité',
    text: 'Si vous êtes en danger ou blessée gravement, appelez le 911. Sinon, allez dans un endroit où vous vous sentez en sécurité, avec une personne de confiance si vous le souhaitez.',
    action: { label: 'Appeler le 911', href: 'tel:911' },
    source: 'Gouvernement du Québec (quebec.ca)',
  },
  {
    icon: 'phone', tint: 'north',
    title: 'Appeler la Ligne-ressource',
    text: 'Gratuite, confidentielle, bilingue, ouverte 24 h/24. Une intervenante vous écoute, répond à vos questions et vous dit où aller près de chez vous.',
    action: { label: '+1 888 933-9007', href: 'tel:+18889339007' },
    source: 'Ligne-ressource provinciale pour les victimes d’agression sexuelle',
  },
  {
    icon: 'shirt', tint: 'sun',
    title: 'Avant de partir, si possible',
    text: 'Ces gestes aident à préserver des preuves. Si vous les avez déjà faits, ce n’est pas grave : venez quand même.',
    tips: [
      'Éviter de vous laver, de vous changer ou d’aller aux toilettes, si vous le pouvez.',
      'Garder les vêtements portés dans un sac en papier (pas en plastique).',
      'Apporter des vêtements de rechange.',
    ],
    source: 'CIUSSS du Centre-Sud-de-l’Île-de-Montréal ; Ligne-ressource',
  },
  {
    icon: 'exam', tint: 'sky',
    title: 'Aller dans un centre désigné',
    text: 'Des équipes formées vous accueillent 24 h/24, que vous portiez plainte ou non : soins, examen, tests, et prélèvements si vous le souhaitez.',
    timing: 'Le plus tôt possible : prophylaxie VIH idéalement dans les 72 h, contraception d’urgence et trousse médicolégale jusqu’à 5 jours.',
    action: { label: 'Voir les centres sur la carte', tab: 'aller' },
    source: 'Gouvernement du Québec ; CIUSSS du Centre-Sud-de-l’Île-de-Montréal',
  },
  {
    icon: 'choice', tint: 'sage',
    title: 'Vous décidez pour la plainte',
    text: 'Vous pouvez recevoir des soins et faire la trousse médicolégale sans porter plainte. Vous pourrez décider plus tard. Chaque prélèvement peut être refusé.',
    source: 'Gouvernement du Québec ; protocole médicosocial',
  },
  {
    icon: 'support', tint: 'sage',
    title: 'Être soutenue sur la durée',
    text: 'Un suivi psychologique gratuit existe : CALACS, CAVAC, intervenantes des centres désignés, psychologues. Il n’y a pas de bon moment pour commencer.',
    action: { label: 'Trouver du soutien près de moi', tab: 'aller' },
  },
  {
    icon: 'legal', tint: 'north',
    title: 'Comprendre vos droits',
    text: 'Rebâtir offre des conseils juridiques gratuits et confidentiels. L’IVAC peut vous aider financièrement (soins, thérapie, revenus), même sans plainte à la police.',
    action: { label: 'Préparer mon dossier', tab: 'dossier' },
    source: 'rebatir.ca ; IVAC',
  },
]
