// Ressources réelles à Montréal. Organismes uniquement, jamais de professionnels nommés.
// Sources vérifiées le 2026-10-04 : CIUSSS du Centre-Sud-de-l'Île-de-Montréal (fiche « Aide aux victimes
// d'agression sexuelle »), 211 Québec, rebatir.ca. Les coordonnées GPS sont approximatives.
export type Resource = {
  id: string
  kind: 'exam' | 'support' | 'legal'
  name: string
  what: string
  address?: string
  phone?: string
  phoneLabel?: string
  hours: string
  url?: string
  lat?: number
  lng?: number
  note?: string
}

export const RESOURCES: Resource[] = [
  {
    id: 'cdvasim', kind: 'exam',
    name: 'Centre désigné de l’Île-de-Montréal (CDVASIM)',
    what: 'Urgence de l’Hôpital Notre-Dame. Examen médical et médicolégal, trousse, tests ITSS, prophylaxie, suivi psychosocial. Adultes, en français.',
    address: '1560, rue Sherbrooke Est, Montréal (QC) H2L 4M1',
    hours: '24 h/24, 7 j/7', lat: 45.5257, lng: -73.5622,
    note: 'Il est recommandé d’appeler la Ligne-ressource avant de se déplacer.',
  },
  {
    id: 'cvasm-jour', kind: 'exam',
    name: 'Centre pour les victimes d’agression sexuelle de Montréal (CVASM), jour',
    what: 'Clinique Médic-Elle. Examen médical et médicolégal, suivi. Adultes, services en anglais.',
    address: '1980, rue Sherbrooke Ouest, bureau 500, Montréal (QC) H3H 1E8',
    phone: '+15147318531', phoneLabel: '+1 514 731-8531, poste 47455',
    hours: 'Lundi au vendredi, 8 h à 17 h', lat: 45.4957, lng: -73.5807,
  },
  {
    id: 'cvasm-soir', kind: 'exam',
    name: 'Hôpital général de Montréal (CVASM), soir et fin de semaine',
    what: 'Urgence du CUSM. Examen médical et médicolégal en dehors des heures de bureau. Adultes, services en anglais.',
    address: '1650, avenue Cedar, Montréal (QC) H3G 1A4',
    phone: '+15149348090', phoneLabel: '+1 514 934-8090',
    hours: 'Soirs, fins de semaine et jours fériés', lat: 45.4968, lng: -73.5884,
  },
  {
    id: 'ligne', kind: 'support',
    name: 'Ligne-ressource provinciale pour les victimes d’agression sexuelle',
    what: 'Écoute, information, orientation vers le centre désigné le plus proche. Gratuit, bilingue, confidentiel. Clavardage de midi à minuit.',
    phone: '+18889339007', phoneLabel: '+1 888 933-9007',
    hours: '24 h/24, 7 j/7', url: 'https://www.sexualviolencehelpline.ca',
  },
  {
    id: 'cavac', kind: 'support',
    name: 'CAVAC de Montréal',
    what: 'Centre d’aide aux victimes d’actes criminels : soutien psychologique, information sur les droits, accompagnement.',
    address: '6472, boulevard Saint-Laurent, Montréal (QC) H2S 3C4',
    phone: '+15142779860', phoneLabel: '+1 514 277-9860',
    hours: 'Lundi au vendredi, 9 h à 17 h', lat: 45.5306, lng: -73.6048,
  },
  {
    id: 'calacs-tpe', kind: 'support',
    name: 'CALACS Trêve pour Elles',
    what: 'Centre d’aide et de lutte contre les agressions à caractère sexuel : suivi individuel et de groupe. Femmes cis et trans, personnes non binaires, dès 14 ans.',
    address: '1805, rue Joliette, Montréal (QC)',
    phone: '+15142510323', phoneLabel: '+1 514 251-0323',
    hours: 'Lundi au jeudi, 9 h à 17 h', url: 'https://www.trevepourelles.org', lat: 45.5468, lng: -73.5459,
  },
  {
    id: 'opq', kind: 'support',
    name: 'Ordre des psychologues du Québec, « Trouver un psychologue »',
    what: 'Répertoire officiel des psychologues membres de l’Ordre, filtrable par région (Montréal) et par problématique (traumatisme, violence sexuelle).',
    hours: 'En ligne', url: 'https://www.ordrepsy.qc.ca/trouver-un-psychologue',
  },
  {
    id: 'rebatir', kind: 'legal',
    name: 'Rebâtir',
    what: 'Service public de consultation juridique gratuite pour les victimes de violence sexuelle et conjugale : 4 heures de conseils, plus si nécessaire, sans condition de revenu. Interprète disponible.',
    phone: '+18337322847', phoneLabel: '+1 833 REBÂTIR (732-2847)',
    hours: 'Lundi au vendredi, 8 h 30 à 16 h 30', url: 'https://rebatir.ca',
  },
]
