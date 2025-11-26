import { useMemo } from 'react'
import { calculateEmployee } from '../lib/calculations'
import { ResultsView } from './ResultsView'
import { PieDistribution } from './PieDistribution'
import { buildPdf, triggerDownload } from '../lib/pdf'
import { SWEDISH_EMPLOYEE_DEFAULTS } from '../lib/constants'

interface Props {
  formState: any
  onReset: () => void
}

export function EmployeeMode({ formState, onReset }: Props) {
  const result = useMemo(() => {
    const { taskName, rate, hours, empTax, empHousing, empFood, empTransport, empEssentials } = formState
    const task = { taskName, rate, hours }
    return calculateEmployee(task, {
      taxPct: empTax ?? SWEDISH_EMPLOYEE_DEFAULTS.taxPct,
      housingPct: empHousing ?? SWEDISH_EMPLOYEE_DEFAULTS.housingPct,
      foodPct: empFood ?? SWEDISH_EMPLOYEE_DEFAULTS.foodPct,
      transportPct: empTransport ?? SWEDISH_EMPLOYEE_DEFAULTS.transportPct,
      essentialsPct: empEssentials ?? SWEDISH_EMPLOYEE_DEFAULTS.essentialsPct,
    })
  }, [formState])

  async function handleGeneratePdf() {
    if (!result) return
    const bytes = await buildPdf(result)
    triggerDownload(bytes, 'earnings-statement.pdf')
  }

  return (
    <ResultsView
      result={result}
      onReset={onReset}
      onGeneratePdf={handleGeneratePdf}
      PieChart={PieDistribution}
      formState={formState}
    />
  )
}
