import { useState } from 'react'
import { SWEDISH_EMPLOYEE_DEFAULTS, SWEDISH_ENTREPRENEUR_DEFAULTS, CHORE_TIER_DEFAULT_RATES, getChoreTier, CHORE_TIERS } from './lib/constants'
import './App.css'
import { CalculatorForm } from './components/CalculatorForm'
import { EmployeeMode } from './components/EmployeeMode'
import { EntrepreneurMode } from './components/EntrepreneurMode'
import SwishQrGenerator from './components/SwishQrGenerator';

function App() {
  // Default to first A tier chore and its rate
  const defaultChore = CHORE_TIERS.A[0]
  const defaultTier = getChoreTier(defaultChore) || 'A'
  const [formState, setFormState] = useState({
    mode: 'employee',
    taskName: defaultChore,
    rate: CHORE_TIER_DEFAULT_RATES[defaultTier],
    hours: 1.0,
    empTax: SWEDISH_EMPLOYEE_DEFAULTS.taxPct,
    empHousing: SWEDISH_EMPLOYEE_DEFAULTS.housingPct,
    empFood: SWEDISH_EMPLOYEE_DEFAULTS.foodPct,
    empTransport: SWEDISH_EMPLOYEE_DEFAULTS.transportPct,
    empEssentials: SWEDISH_EMPLOYEE_DEFAULTS.essentialsPct,
    entVat: SWEDISH_ENTREPRENEUR_DEFAULTS.vatPct,
    entSocial: SWEDISH_ENTREPRENEUR_DEFAULTS.socialFeePct,
    entTax: SWEDISH_ENTREPRENEUR_DEFAULTS.municipalTaxPct,
    entOverheadMonthly: SWEDISH_ENTREPRENEUR_DEFAULTS.overheadMonthly,
    entBillable: SWEDISH_ENTREPRENEUR_DEFAULTS.billableHoursPerMonth,
  })

  function handleFormChange(newState: Partial<typeof formState>) {
    setFormState(prev => ({ ...prev, ...newState }))
  }

  function handleReset() {
    setFormState({
      mode: 'employee',
      taskName: defaultChore,
      rate: CHORE_TIER_DEFAULT_RATES[defaultTier],
      hours: 1.0,
      empTax: SWEDISH_EMPLOYEE_DEFAULTS.taxPct,
      empHousing: SWEDISH_EMPLOYEE_DEFAULTS.housingPct,
      empFood: SWEDISH_EMPLOYEE_DEFAULTS.foodPct,
      empTransport: SWEDISH_EMPLOYEE_DEFAULTS.transportPct,
      empEssentials: SWEDISH_EMPLOYEE_DEFAULTS.essentialsPct,
      entVat: SWEDISH_ENTREPRENEUR_DEFAULTS.vatPct,
      entSocial: SWEDISH_ENTREPRENEUR_DEFAULTS.socialFeePct,
      entTax: SWEDISH_ENTREPRENEUR_DEFAULTS.municipalTaxPct,
      entOverheadMonthly: SWEDISH_ENTREPRENEUR_DEFAULTS.overheadMonthly,
      entBillable: SWEDISH_ENTREPRENEUR_DEFAULTS.billableHoursPerMonth,
    })
  }

  return (
    <div className="max-w-5xl mx-auto px-4 py-8 space-y-8 min-h-screen flex flex-col">
      <div className="space-y-2 text-center mb-8">
        <h1 className="text-3xl md:text-5xl font-bold tracking-tight text-slate-900">
          Räkna ut rättvis <span className="text-emerald-600">Veckopeng</span> & <span className="text-emerald-600">Månadspeng</span>
        </h1>
        <p className="text-muted-foreground text-lg md:text-xl max-w-2xl mx-auto">
          Sluta gissa summor. Använd vår kalkylator för att omvandla jobb till 
          <span className="font-medium text-slate-700"> verklig lön efter skatt</span>.
        </p>
      </div>
      <div className="space-y-6 flex-1">
        <CalculatorForm onFormChange={handleFormChange} formState={formState} />
      </div>
      {formState.mode === 'employee' ? (
        <EmployeeMode formState={formState} onReset={handleReset} />
      ) : (
        <EntrepreneurMode formState={formState} onReset={handleReset} />
      )}

      <div className="mt-8">
        <SwishQrGenerator formState={{ ...formState, mode: formState.mode as 'employee' | 'entrepreneur' }} />
      </div>
      <footer className="mt-12 pt-6 border-t text-center text-xs text-muted-foreground">
        © {new Date().getFullYear()} David Steinar Asgrimsson. 
        <a href="https://github.com/davidsteinar/fickpengar.se" target="_blank" rel="noopener noreferrer" className="underline ml-1">GitHub</a>
      </footer>
    </div>
  )
}

export default App
