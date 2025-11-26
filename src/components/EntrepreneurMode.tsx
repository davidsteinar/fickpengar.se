import { useMemo } from 'react'
import { calculateEntrepreneur } from '../lib/calculations'
import { ResultsView } from './ResultsView'
import { PieDistribution } from './PieDistribution'
import { buildPdf, triggerDownload } from '../lib/pdf'
import { SWEDISH_ENTREPRENEUR_DEFAULTS } from '../lib/constants'

interface Props {
  formState: any
  onReset: () => void
}

export function EntrepreneurMode({ formState, onReset }: Props) {
  const result = useMemo(() => {
    const { taskName, rate, hours, entVat, entSocial, entTax, entOverheadMonthly, entBillable } = formState
    const task = { taskName, rate, hours }
    return calculateEntrepreneur(task, {
      vatPct: entVat ?? SWEDISH_ENTREPRENEUR_DEFAULTS.vatPct,
      socialFeePct: entSocial ?? SWEDISH_ENTREPRENEUR_DEFAULTS.socialFeePct,
      municipalTaxPct: entTax ?? SWEDISH_ENTREPRENEUR_DEFAULTS.municipalTaxPct,
      overheadMonthly: entOverheadMonthly ?? SWEDISH_ENTREPRENEUR_DEFAULTS.overheadMonthly,
      billableHoursPerMonth: entBillable ?? SWEDISH_ENTREPRENEUR_DEFAULTS.billableHoursPerMonth,
    })
  }, [formState])

  async function handleGeneratePdf() {
    if (!result) return
    const bytes = await buildPdf(result)
    triggerDownload(bytes, 'invoice-summary.pdf')
  }

  const overheadMonthly = formState.entOverheadMonthly ?? SWEDISH_ENTREPRENEUR_DEFAULTS.overheadMonthly
  const billableHours = formState.entBillable ?? SWEDISH_ENTREPRENEUR_DEFAULTS.billableHoursPerMonth
  const hourlyOverhead = (billableHours > 0 ? overheadMonthly / billableHours : 0).toFixed(2)

  return (
    <div className="space-y-6">
      {/* Start collapsed but reserve space to avoid perceived shrink */}
    <div className="mb-4">
      <details className="p-4 bg-yellow-50 border-l-4 border-yellow-400 rounded group [&:not([open])]:overflow-hidden">
        <summary className="font-semibold mb-2 text-yellow-900 cursor-pointer flex items-center gap-2">
        <span>Förstå omkostnader</span>
        <span className="text-xs font-normal text-yellow-700">(klicka för att expandera)</span>
        </summary>
        <div className="space-y-3">
        <p className="text-sm text-yellow-900">
          I affärsvärlden är <b>omkostnader</b> de löpande utgifter som krävs för att upprätthålla och driva en verksamhet. Det är viktigt att förstå vilka typer av omkostnader som finns, eftersom de påverkar hur mycket du behöver tjäna varje timme bara för att gå runt.
        </p>
        <ul className="list-disc pl-5 text-sm text-yellow-900 space-y-1">
          <li>
            <b>Hyra:</b> Kostnaden för att hyra en lokal eller anläggning för verksamheten. Ofta en av de största och mest nödvändiga omkostnaderna, särskilt i större städer eller för större företag.
          </li>
          <li>
            <b>Allmännyttiga tjänster:</b> Utgifter för el, vatten, värme, internet och liknande. Ju större lokal, desto högre brukar dessa kostnader bli.
          </li>
          <li>
            <b>Förnödenheter/Leveranser:</b> Material och varor som behövs för att driva verksamheten. Kan variera mycket beroende på företagstyp – från minimala kostnader för en datorverkstad till stora summor för en butik.
          </li>
          <li>
            <b>Marknadsföringskostnader:</b> Utgifter för att nå ut till nya kunder, t.ex. annonser, webbplats eller reklam. Kan vara allt från små lokala annonser till stora kampanjer.
          </li>
        </ul>
        <p className="text-sm text-yellow-900">
          <b>Exempel på basutgifter i en medelstor svensk stad:</b>
        </p>
        <div className="overflow-x-auto">
          <table className="text-xs w-full border-collapse">
            <thead>
            <tr className="bg-yellow-100">
              <th className="p-1 border">Utgift</th>
              <th className="p-1 border">Månadskostnad (kr)</th>
              <th className="p-1 border">Varför detta pris?</th>
            </tr>
            </thead>
            <tbody>
            <tr><td className="border p-1">Hyra</td><td className="border p-1">5,500</td><td className="border p-1">Kostnaden för att hyra en lokal eller kontorsrum.</td></tr>
            <tr><td className="border p-1">Tjänster</td><td className="border p-1">1,500</td><td className="border p-1">Utgifter för el, vatten, värme och internet för lokalen.</td></tr>
            <tr><td className="border p-1">Förnödenheter/Leveranser</td><td className="border p-1">400</td><td className="border p-1">Material och varor som behövs för att driva verksamheten.</td></tr>
            <tr><td className="border p-1">Marknadsföringskostnader</td><td className="border p-1">600</td><td className="border p-1">Utgifter för annonser, webbplats och reklam.</td></tr>
            <tr><td className="border p-1">Telefon</td><td className="border p-1">400</td><td className="border p-1">Mobilabonnemang och kommunikation.</td></tr>
            <tr className="font-semibold bg-yellow-100"><td className="border p-1">TOTALT</td><td className="border p-1">7,400</td><td className="border p-1">Exempel på månatliga omkostnader.</td></tr>
            </tbody>
          </table>
        </div>
        <p className="text-sm text-yellow-900">
          <b>Timkostnad för omkostnader:</b><br/>
          Du har just nu satt omkostnader till <b>{overheadMonthly} kr</b> och debiterbara timmar till <b>{billableHours}</b>.<br/>
          <span className="inline-block bg-yellow-100 rounded px-2 py-1 font-mono mt-1">{overheadMonthly} kr / {billableHours} h = <b>{hourlyOverhead} kr/tim</b></span>
        </p>
        <p className="text-sm text-yellow-900">
          <b>Lärdom:</b> <i>De första {hourlyOverhead} kr du tjänar varje debiterbar timme är redan uppbokade bara för att täcka dina omkostnader.</i>
        </p>
        </div>
      </details>
    </div>
      <ResultsView
        result={result}
        onReset={onReset}
        onGeneratePdf={handleGeneratePdf}
        PieChart={PieDistribution}
        formState={formState}
      />
    </div>
  )
}
