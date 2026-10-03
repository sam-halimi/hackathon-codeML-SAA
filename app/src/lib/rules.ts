// MOTEUR DE RÈGLES — aucune IA. Délais PROTOTYPE, À VALIDER PAR SOURCES MÉDICALES
// et par le protocole de l'établissement (ex. protocole médicosocial MSSS).
export const RULES_VERSION = 'règles-prototype v0.1 (non validées cliniquement)'

export type Intake = {
  hoursSince: number
  substance: boolean
  exposure: boolean // exposition possible à des liquides biologiques
  pregnancyRisk: boolean
  injuries: boolean
  showered: boolean
}

export type Rule = {
  id: string
  label: string
  windowH: number | null // null = sans délai fixe
  why: string
  applies: (i: Intake) => boolean
}

export const RULES: Rule[] = [
  { id: 'tox-sang', label: 'Toxicologie — prélèvement sanguin', windowH: 24, why: 'La plupart des substances ne sont plus détectables dans le sang après ~24 h.', applies: (i) => i.substance },
  { id: 'tox-urine', label: 'Toxicologie — prélèvement urinaire', windowH: 120, why: "L'urine peut prolonger la détection jusqu'à ~120 h.", applies: (i) => i.substance },
  { id: 'ppe-vih', label: 'Évaluation prophylaxie post-exposition (VIH)', windowH: 72, why: 'À débuter le plus tôt possible, au plus tard ~72 h.', applies: (i) => i.exposure },
  { id: 'cutane', label: 'Prélèvements cutanés (trousse)', windowH: 48, why: 'Fenêtre courte, surtout si douche.', applies: (i) => !i.showered },
  { id: 'trousse', label: 'Trousse médicolégale complète', windowH: 120, why: 'Au Québec : faits datant de 5 jours ou moins (révision en cours).', applies: () => true },
  { id: 'contraception', label: "Contraception d'urgence", windowH: 120, why: "Efficacité décroissante, jusqu'à ~120 h selon la méthode.", applies: (i) => i.pregnancyRisk },
  { id: 'photos', label: 'Photos des lésions', windowH: null, why: 'Dès que possible, avec consentement spécifique.', applies: (i) => i.injuries },
  { id: 'itss', label: 'Dépistage ITSS et suivi', windowH: null, why: 'Selon protocole, avec rendez-vous de suivi.', applies: () => true },
]

export type Status = 'urgent' | 'possible' | 'depasse' | 'sans-delai'

export type ChecklistItem = Rule & { remainingH: number | null; status: Status }

export function computeChecklist(intake: Intake): ChecklistItem[] {
  const order: Record<Status, number> = { urgent: 0, possible: 1, 'sans-delai': 2, depasse: 3 }
  return RULES.filter((r) => r.applies(intake))
    .map((r) => {
      const remainingH = r.windowH === null ? null : r.windowH - intake.hoursSince
      const status: Status =
        remainingH === null ? 'sans-delai' : remainingH < 0 ? 'depasse' : remainingH <= 48 ? 'urgent' : 'possible'
      return { ...r, remainingH, status }
    })
    .sort((a, b) => order[a.status] - order[b.status] || (a.remainingH ?? 1e9) - (b.remainingH ?? 1e9))
}
