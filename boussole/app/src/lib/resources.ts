// Ressources réelles à Montréal. Organismes uniquement, jamais de professionnels nommés.
// Vérifiées le 2026-10-04 : voir research-resources.md (sources officielles : CIUSSS, CVASM, SPVM 2026,
// sites des organismes). Les adresses confidentielles (CALACS, MCVI) ne sont jamais affichées.
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
  // ── Examens et soins (centres désignés) ──
  { id: 'cdvasim', kind: 'exam', name: 'Centre désigné de l’Île-de-Montréal (CDVASIM), Hôpital Notre-Dame',
    what: 'Adultes. Accueil à l’urgence par une équipe formée : soins, examen, tests, trousse si vous le souhaitez. Gratuit, sans carte d’assurance maladie, sans plainte obligatoire.',
    address: '1560, rue Sherbrooke Est, Montréal (QC) H2L 4M1', phone: '+15144138999', phoneLabel: '+1 514 413-8999', hours: '24 h/24, 7 j/7', url: 'https://ccsmtl.gouv.qc.ca', lat: 45.5261, lng: -73.5634 },
  { id: 'cvasm-jour', kind: 'exam', name: 'CVASM, Clinique Médic Elle (jour)',
    what: 'Adultes, agression dans les 12 derniers mois. Bilingue. Une intervenante du CVASM est sur place.',
    address: '1980, rue Sherbrooke Ouest, bureau 500, Montréal (QC) H3H 1E8', phone: '+15147318531', phoneLabel: '+1 514 731-8531, poste 47455', hours: 'Lundi au vendredi, 8 h à 17 h', url: 'https://cvasm.org', lat: 45.4938, lng: -73.5837,
    note: 'Appelez avant de vous déplacer.' },
  { id: 'cvasm-soir', kind: 'exam', name: 'CVASM, Hôpital général de Montréal (soirs et fins de semaine)',
    what: 'Adultes. Présentez-vous à l’urgence : une intervenante du CVASM est appelée.',
    address: '1650, avenue Cedar, Montréal (QC) H3G 1A4', phone: '+15149348090', phoneLabel: '+1 514 934-8090', hours: 'Soirs (17 h à 8 h), fins de semaine, jours fériés', url: 'https://cvasm.org', lat: 45.4975, lng: -73.5883,
    note: 'Entrée de l’urgence par l’avenue des Pins.' },
  { id: 'sainte-justine', kind: 'exam', name: 'CHU Sainte-Justine (moins de 18 ans)',
    what: 'Centre désigné pour les enfants et adolescent·e·s. Urgence et clinique d’évaluation spécialisée.',
    address: '3175, chemin de la Côte-Sainte-Catherine, Montréal (QC) H3T 1C5', phone: '+15143454931', phoneLabel: '+1 514 345-4931', hours: 'Urgence 24 h/24', url: 'https://www.chusj.org', lat: 45.5034, lng: -73.6245 },
  { id: 'children', kind: 'exam', name: 'Hôpital de Montréal pour enfants, CUSM (moins de 18 ans)',
    what: 'Centre désigné pour les enfants et adolescent·e·s, services surtout en anglais.',
    address: '1001, boulevard Décarie, Montréal (QC) H4A 3J1', hours: 'Urgence 24 h/24', url: 'https://www.thechildren.com', lat: 45.4724, lng: -73.602,
    note: 'Numéro à confirmer : passez par Info-aide violence sexuelle.' },

  // ── Écoute et soutien psychologique ──
  { id: 'info-aide', kind: 'support', name: 'Info-aide violence sexuelle',
    what: 'Écoute, information et orientation pour toute personne touchée par la violence sexuelle et ses proches. Gratuit, confidentiel, bilingue. Clavardage en ligne.',
    phone: '+18889339007', phoneLabel: '+1 888 933-9007', hours: '24 h/24, 7 j/7', url: 'https://infoaideviolencesexuelle.ca' },
  { id: 'cvasm', kind: 'support', name: 'Centre pour les victimes d’agression sexuelle de Montréal (CVASM)',
    what: 'Adultes : intervention médicosociale et suivi psychologique individuel.',
    phone: '+15147318531', phoneLabel: '+1 514 731-8531, poste 47456', hours: 'Jours ouvrables', url: 'https://cvasm.org' },
  { id: 'cavac', kind: 'support', name: 'CAVAC de Montréal',
    what: 'Toute victime d’acte criminel et ses proches : soutien, information sur les droits, accompagnement à la cour, aide pour l’IVAC. Plainte non obligatoire.',
    address: '6472, boulevard Saint-Laurent, Montréal (QC) H2S 3C4', phone: '+15142779860', phoneLabel: '+1 514 277-9860', hours: 'Jours ouvrables', url: 'https://cavac.qc.ca', lat: 45.5303, lng: -73.6092,
    note: 'Adresse à confirmer par téléphone.' },
  { id: 'treve', kind: 'support', name: 'CALACS Trêve pour Elles',
    what: 'Femmes cis et trans, personnes non binaires, dès 14 ans : rencontres individuelles, groupes, accompagnement judiciaire, aide IVAC. Gratuit.',
    phone: '+15142510323', phoneLabel: '+1 514 251-0323', hours: 'Lundi au jeudi, 9 h à 17 h', url: 'https://trevepourelles.org', note: 'Adresse confidentielle, pour la sécurité des personnes.' },
  { id: 'consenti', kind: 'support', name: 'Collectif Consenti (CALACS de l’Ouest-de-l’Île)',
    what: 'Femmes cis et trans, personnes trans, bispirituelles et non binaires, dès 12 ans, dans l’Ouest-de-l’Île.',
    phone: '+15146842198', phoneLabel: '+1 514 684-2198', hours: 'Jours ouvrables', url: 'https://collectifconsenti.ca', note: 'Adresse confidentielle.' },
  { id: 'mcvi', kind: 'support', name: 'Mouvement contre le viol et l’inceste (MCVI)',
    what: 'Femmes, y compris immigrantes, demandeuses d’asile, réfugiées et racisées, et jeunes. Français, anglais, espagnol.',
    phone: '+15142789383', phoneLabel: '+1 514 278-9383', hours: 'Jours ouvrables', url: 'https://www.mcvicontreleviol.org', note: 'Adresse confidentielle.' },
  { id: 'criphase', kind: 'support', name: 'Criphase',
    what: 'Hommes ayant vécu des violences sexuelles, dans l’enfance ou à l’âge adulte.',
    phone: '+15145295567', phoneLabel: '+1 514 529-5567', hours: 'Lundi au vendredi, 9 h à 17 h', url: 'https://criphase.org' },
  { id: 'marie-vincent', kind: 'support', name: 'Centre d’expertise Marie-Vincent',
    what: 'Enfants et adolescent·e·s victimes de violence sexuelle et leurs parents : examen, entrevue, thérapie (sur référence).',
    address: '4100, rue Molson, 4e étage, Montréal (QC) H1Y 3N1', phone: '+15142850505', phoneLabel: '+1 514 285-0505', hours: 'Sur rendez-vous', url: 'https://marie-vincent.org', lat: 45.5411, lng: -73.5633 },
  { id: 'interligne', kind: 'support', name: 'Interligne',
    what: 'Personnes LGBTQ+ et leurs proches : écoute, aide et renseignements, y compris sur les violences.',
    phone: '+18885051010', phoneLabel: '+1 888 505-1010', hours: '24 h/24, clavardage en ligne', url: 'https://interligne.co' },
  { id: 'cpsm', kind: 'support', name: 'Centre de prévention du suicide de Montréal',
    what: 'Si vous avez des idées suicidaires ou êtes en grande détresse, ou pour un proche.',
    phone: '+18662773553', phoneLabel: '+1 866 277-3553', hours: '24 h/24, clavardage sur suicide.ca', url: 'https://cpsmontreal.ca' },
  { id: 'tel-aide', kind: 'support', name: 'Tel-Aide Montréal',
    what: 'Écoute anonyme et bienveillante, pour toute personne.',
    phone: '+15149351101', phoneLabel: '+1 514 935-1101', hours: '24 h/24', url: 'https://telaidemontreal.org' },
  { id: 'info-social', kind: 'support', name: 'Info-Social 811',
    what: 'Consultation psychosociale par téléphone et orientation vers les services près de chez vous.',
    phone: '811', phoneLabel: '811, option Info-Social', hours: '24 h/24', url: 'https://www.quebec.ca/sante/trouver-une-ressource/info-social-811' },
  { id: 'opq', kind: 'support', name: 'Ordre des psychologues du Québec : trouver un psychologue',
    what: 'Répertoire officiel des psychologues membres, filtrable par région et par problématique (traumatisme, violence sexuelle).',
    hours: 'En ligne', url: 'https://www.ordrepsy.qc.ca/ou-trouver' },

  // ── Droits, justice, aide financière ──
  { id: 'rebatir', kind: 'legal', name: 'Rebâtir',
    what: 'Jusqu’à 4 heures de conseils juridiques gratuits et confidentiels, par des avocat·e·s, pour les victimes de violence sexuelle ou conjugale. Interprète disponible.',
    phone: '+18337322847', phoneLabel: '+1 833 732-2847', hours: 'Lundi au vendredi, 8 h 30 à 16 h 30', url: 'https://rebatir.ca' },
  { id: 'ivac', kind: 'legal', name: 'IVAC, indemnisation des victimes d’actes criminels',
    what: 'Aide financière : thérapie, perte de revenu, frais médicaux. Aucun délai pour une demande liée à la violence sexuelle.',
    address: '1199, rue de Bleury, Montréal (QC) H3C 4E1', phone: '+15149063019', phoneLabel: '+1 514 906-3019 (sans frais +1 800 561-4822)', hours: 'Lundi au vendredi, 8 h 30 à 16 h 30', url: 'https://www.ivac.qc.ca', lat: 45.506, lng: -73.5655 },
  { id: 'info-justice', kind: 'legal', name: 'Info Justice Montréal',
    what: 'Information juridique gratuite et confidentielle, par des avocat·e·s et des intervenant·e·s.',
    address: '407, boulevard Saint-Laurent, bureau 410, Montréal (QC) H2Y 2Y5', phone: '+15142273782', phoneLabel: '+1 514 227-3782, option 4', hours: 'Sur rendez-vous, lundi au jeudi', url: 'https://info-justice.ca/centres/montreal/', lat: 45.5058, lng: -73.5541 },
  { id: 'juripop', kind: 'legal', name: 'Juripop',
    what: 'Clinique juridique à coût modique, avec un volet violences sexuelles.',
    phone: '+15147051637', phoneLabel: '+1 514 705-1637', hours: 'Jours ouvrables', url: 'https://juripop.org' },
  { id: 'dpcp', kind: 'legal', name: 'Ligne Info DPCP violence conjugale et sexuelle',
    what: 'Comprendre le processus judiciaire et ce qui se passe après une plainte.',
    phone: '+18775473727', phoneLabel: '+1 877 547-3727', hours: 'Jours ouvrables', url: 'https://www.dpcp.gouv.qc.ca' },
  { id: 'spvm', kind: 'legal', name: 'Police de Montréal (SPVM)',
    what: 'Porter plainte, si vous le décidez, peu importe le délai : au 911 en urgence, sinon à votre poste de quartier.',
    phone: '911', phoneLabel: '911 (urgence)', hours: '24 h/24', url: 'https://spvm.qc.ca/fr/Contact' },
]
