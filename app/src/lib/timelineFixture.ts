// Réponse IA PRÉ-ENREGISTRÉE pour le cas fictif (site public / hors ligne).
// Toujours affichée avec l'étiquette « réponse pré-enregistrée ».
export type TimelineResult = {
  events: { time: string; description: string; source: string; origin: string }[]
  gaps: { from: string; to: string; note: string }[]
  inconsistencies: { description: string; sources: string[]; suggestion: string }[]
}

export const TIMELINE_FIXTURE: TimelineResult = {
  events: [
    { time: '2 oct. ~22 h 00', description: 'Arrivée à une fête', source: 'arrivée à une fête le 2 octobre vers 22 h 00, au [LIEU]', origin: 'Récit de la patiente' },
    { time: '2 oct. ~22 h 45', description: 'Accepte un verre offert', source: 'A accepté un verre offert vers 22 h 45.', origin: 'Récit de la patiente' },
    { time: '2 oct. peu après 22 h 45', description: "Sensation d'étourdissement", source: "Se souvient s'être sentie étourdie peu après.", origin: 'Récit de la patiente' },
    { time: '3 oct. ~1 h 30', description: 'Réveil dans un appartement inconnu', source: "Ne se souvient de rien jusqu'à son réveil vers 1 h 30 dans un appartement qu'elle ne connaît pas.", origin: 'Récit de la patiente' },
    { time: '3 oct. ~2 h 15', description: 'Retour au domicile en taxi ; pas de douche', source: 'Est rentrée chez elle en taxi vers 2 h 15. Ne s\'est pas douchée.', origin: 'Récit de la patiente' },
    { time: '4 oct. 4 h 20', description: "Arrivée à l'urgence, accompagnée", source: "arrivée à l'urgence le 4 octobre à 4 h 20, accompagnée d'une amie.", origin: 'Note de triage' },
    { time: '4 oct. 4 h 40', description: "Consentement à l'examen recueilli", source: "consentement à l'examen recueilli à 4 h 40.", origin: 'Note infirmière' },
  ],
  gaps: [
    {
      from: '2 oct. ~22 h 45',
      to: '3 oct. ~1 h 30',
      note: "Information non disponible (environ 2 h 45). Fréquent après un traumatisme ou l'effet d'une substance : ce n'est pas un indicateur de fiabilité. Pertinent pour la toxicologie.",
    },
  ],
  inconsistencies: [
    {
      description: 'Dossier : le prélèvement urinaire est horodaté à 4 h 05, avant l\'arrivée (4 h 20) et avant le consentement (4 h 40).',
      sources: ["Prélèvement urinaire (toxicologie) noté à 4 h 05.", "arrivée à l'urgence le 4 octobre à 4 h 20", "consentement à l'examen recueilli à 4 h 40."],
      suggestion: "Vérifier et corriger l'heure du prélèvement avant scellé : une erreur d'horodatage peut fragiliser la chaîne de conservation.",
    },
  ],
}
