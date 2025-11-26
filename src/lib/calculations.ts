import { CHORE_SUGGESTIONS, SWEDISH_EMPLOYEE_DEFAULTS, SWEDISH_ENTREPRENEUR_DEFAULTS } from './constants'
import type { CalculationResult, EmployeeRatios, EntrepreneurDefaults, MoneyFunnelLine, TaskDetails } from './types'

function round(n: number) {
  return Math.round(n * 100) / 100
}

export function calculateEmployee(task: TaskDetails, ratiosOverride?: Partial<EmployeeRatios>): CalculationResult {
  const ratios: EmployeeRatios = { ...SWEDISH_EMPLOYEE_DEFAULTS, ...ratiosOverride }
  const grossRevenue = round(task.rate * task.hours)
  // All funnel values as percent of gross
  const taxAmount = round(grossRevenue * ratios.taxPct * -1.0)
  const housing = round(grossRevenue * ratios.housingPct * -1.0)
  const food = round(grossRevenue * ratios.foodPct * -1.0)
  const transport = round(grossRevenue * ratios.transportPct * -1.0)
  const essentials = round(grossRevenue * ratios.essentialsPct * -1.0)
  const overheadSum = round(housing + food + transport + essentials)
  // Pocket/discretionary is the remainder
  const discretionary = round(grossRevenue + taxAmount + overheadSum)

  const lines: MoneyFunnelLine[] = [
    { key: 'gross', label: 'Gross Revenue', amount: grossRevenue },
    { key: 'taxes', label: 'Taxes', amount: taxAmount, description: 'Estimated income taxes (Sweden ~30%)', pctOfGross: round(ratios.taxPct * 100) },
    { key: 'housing', label: 'Housing', amount: housing, description: 'Rent or housing costs', pctOfGross: round(ratios.housingPct * 100) },
    { key: 'food', label: 'Food', amount: food, description: 'Groceries and meals', pctOfGross: round(ratios.foodPct * 100) },
    { key: 'transport', label: 'Transport', amount: transport, description: 'Public transport or fuel', pctOfGross: round(ratios.transportPct * 100) },
    { key: 'essentials', label: 'Essentials', amount: essentials, description: 'Utilities, phone, hygiene', pctOfGross: round(ratios.essentialsPct * 100) },
    { key: 'discretionary', label: 'Net Pocket Money', amount: discretionary, description: 'Remaining discretionary income', pctOfGross: round((1 - (ratios.taxPct + ratios.housingPct + ratios.foodPct + ratios.transportPct + ratios.essentialsPct)) * 100) },
  ]

  const chart = [
    { label: 'Skatter', value: taxAmount },
    { label: 'Kostnader', value: overheadSum },
    { label: 'Fickpengar', value: discretionary },
  ]

  return {
    mode: 'employee',
    task,
    grossRevenue,
    finalNet: discretionary,
    lines,
    chart,
    meta: {
      taxAmount,
      netAfterTax: grossRevenue - taxAmount,
      overheadSum,
    },
  }
}

export function calculateEntrepreneur(task: TaskDetails, defaultsOverride?: Partial<EntrepreneurDefaults>): CalculationResult {
  const defs: EntrepreneurDefaults = { ...SWEDISH_ENTREPRENEUR_DEFAULTS, ...defaultsOverride }
  const grossRevenue = round(task.rate * task.hours)
  const vatPortion = round(grossRevenue * (defs.vatPct / (1 + defs.vatPct))) // VAT inside VAT-inclusive price
  const netRevenue = round(grossRevenue - vatPortion)
  // Real Swedish sole trader method with schablonavdrag (25%)
  const schablonDeduction = round(netRevenue * 0.25) // non-cash standard deduction
  const taxableIncome = round(netRevenue * 0.75) // after schablonavdrag
  const incomeTax = round(taxableIncome * defs.municipalTaxPct)
  const socialFees = round(taxableIncome * defs.socialFeePct)
  // Net income (cash) does NOT subtract schablonavdrag (it is an accounting deduction only)
  const netIncome = round(netRevenue - incomeTax - socialFees)
  const overheadHourly = defs.overheadMonthly / defs.billableHoursPerMonth
  const livingOverhead = round(overheadHourly * task.hours)
  // Final profit as gross plus all negative outflows (VAT, taxes, living overhead). Schablon deduction excluded (non-cash).
  const finalProfit = round(grossRevenue - vatPortion - incomeTax - socialFees - livingOverhead)

  // Represent all outflows (VAT, deduction, taxes, fees, overhead) as negative numbers for consistency.
  const lines: MoneyFunnelLine[] = [
    { key: 'gross', label: 'Gross Revenue (VAT incl.)', amount: grossRevenue },
    { key: 'vat', label: 'VAT Portion', amount: -vatPortion, description: 'Value Added Tax inside price' },
    { key: 'netRevenue', label: 'Net Revenue (ex VAT)', amount: netRevenue },
    { key: 'schablonavdrag', label: 'Schablonavdrag', amount: -schablonDeduction, description: 'Standard deduction (non-cash) before taxes' },
    { key: 'taxableIncome', label: 'Taxable Income', amount: taxableIncome, description: 'Basis for income tax & social fees' },
    { key: 'incomeTax', label: 'Income Tax', amount: -incomeTax, description: 'Municipal income tax on taxable income' },
    { key: 'socialFees', label: 'Social Fees', amount: -socialFees, description: 'Egenavgifter on taxable income' },
    { key: 'netIncome', label: 'Net Income (after taxes)', amount: netIncome },
    { key: 'livingOverhead', label: 'Living Overhead', amount: -livingOverhead, description: 'Hourly share of monthly living costs' },
    { key: 'finalProfit', label: 'Final Profit', amount: finalProfit, description: 'True take-home after all costs' },
  ]

  const chart = [
    // Schablonavdrag är ej kontant; exkludera från skattepajen. Använd negativt för utflöden.
    { label: 'Skatter', value: round(-(vatPortion + socialFees + incomeTax)) },
    { label: 'Kostnader', value: -livingOverhead },
    { label: 'Fickpengar', value: finalProfit },
  ]

  return {
    mode: 'entrepreneur',
    task,
    grossRevenue,
    finalNet: finalProfit,
    lines,
    chart,
    meta: {
      vatPortion,
      netRevenue,
      schablonDeduction,
      taxableIncome,
      incomeTax,
      socialFees,
      netIncome,
      livingOverhead,
    },
  }
}

export function suggestChores(filterTier?: 'A' | 'B' | 'C') {
  if (!filterTier) return CHORE_SUGGESTIONS
  return CHORE_SUGGESTIONS.filter(c => {
    if (filterTier === 'A') return c.includes('cleaning') || c.includes('Lawn') || c.includes('Car') || c.includes('Window') || c.includes('Snow') || c.includes('Bicycle')
    if (filterTier === 'B') return c.includes('Laundry') || c.includes('Dish') || c.includes('Meal') || c.includes('Garden') || c.includes('Organizing')
    return c.includes('bed') || c.includes('room') || c.includes('dishes') || c.includes('hygiene')
  })
}
