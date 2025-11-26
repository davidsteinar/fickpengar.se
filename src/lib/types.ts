export type Mode = 'employee' | 'entrepreneur'

export interface TaskDetails {
  taskName: string
  rate: number
  hours: number
  perJob?: boolean
}

export interface EmployeeRatios {
  taxPct: number
  housingPct: number
  foodPct: number
  transportPct: number
  essentialsPct: number
}

export interface EntrepreneurDefaults {
  vatPct: number
  socialFeePct: number
  municipalTaxPct: number
  overheadMonthly: number
  billableHoursPerMonth: number
}

export interface MoneyFunnelLine {
  key: string
  label: string
  amount: number
  description?: string
  pctOfGross?: number
}

export interface ChartSegment {
  label: string
  value: number
}

export interface CalculationResult {
  mode: Mode
  task: TaskDetails
  grossRevenue: number
  finalNet: number
  lines: MoneyFunnelLine[]
  chart: ChartSegment[]
  meta?: Record<string, number>
}
