// Default hourly rates per chore tier (example values, adjust as needed)
export const CHORE_TIER_DEFAULT_RATES: Record<string, number> = {
  A: 250,
  B: 120,
  C: 60,
}

// Helper to get tier for a given chore
export function getChoreTier(chore: string): 'A' | 'B' | 'C' | undefined {
  if (CHORE_TIERS.A.includes(chore)) return 'A'
  if (CHORE_TIERS.B.includes(chore)) return 'B'
  if (CHORE_TIERS.C.includes(chore)) return 'C'
  return undefined
}
import type { EmployeeRatios, EntrepreneurDefaults } from './types'

export const SWEDISH_EMPLOYEE_DEFAULTS: EmployeeRatios & { discretionaryIncome?: number } = {
  taxPct: 0.32,         // Typical municipal + state tax for average income
  housingPct: 0.30,     // Housing costs are often 30-40% of net income
  foodPct: 0.13,        // Food is about 12-15% of net income
  transportPct: 0.07,   // Public transport/car is 7-10%
  essentialsPct: 0.07,  // Clothing, insurance, phone, etc.
  discretionaryIncome: 0.11, // Default discretionary income (11%)
}

export const SWEDISH_ENTREPRENEUR_DEFAULTS: EntrepreneurDefaults = {
  vatPct: 0.25,
  // Precise egenavgifter rate (most under 65): 28.97%
  socialFeePct: 0.2897,
  municipalTaxPct: 0.30,
  overheadMonthly: 7500,
  billableHoursPerMonth: 120,
}

export const CHORE_TIERS = {
  A: [
    'Biltvätt och rekond',
    'Fönsterputsning',
    'Gräsklippning',
    'Grundlig städning av rum',
    'Snöskottning',
    'Cykelreparation/rengöring',
  ],
  B: [
    'Tvätta och vika',
    'Diskhantering',
    'Matlagning / kökshjälp',
    'Trädgårdsrensning / vattning',
    'Organisera förråd',
  ],
  C: [
    'Bädda sin egen säng',
    'Städa sitt eget rum',
    'Plocka undan disk',
    'Grundläggande hygienuppgifter',
  ],
}

export const CHORE_SUGGESTIONS = [
  ...CHORE_TIERS.A,
  ...CHORE_TIERS.B,
  ...CHORE_TIERS.C,
]
