import type { CalculationResult } from '../lib/types'
import { Card, CardHeader, CardTitle, CardContent } from './ui/card'
import { Button } from './ui/button'
import { Table, TableHeader, TableBody, TableHead, TableRow, TableCell } from './ui/table'
import { SWEDISH_EMPLOYEE_DEFAULTS } from '../lib/constants'

// Lightweight tooltip component for explanations.
function ExplainTooltip({ explanation }: { explanation: string }) {
  return (
    <span className="relative group cursor-help inline-block w-full h-full">
      <span className="pointer-events-none invisible opacity-0 group-hover:visible group-hover:opacity-100 transition-opacity duration-150 absolute left-1/2 -translate-x-1/2 top-full mt-1 z-30 w-72 max-w-xs bg-white border border-blue-200 shadow-lg rounded p-2 text-[11px] text-neutral-800">
        {explanation}
      </span>
    </span>
  )
}

const ENTREPRENEUR_EXPLANATIONS: Record<string, { label: string; explanation: string }> = {
  gross: {
    label: 'Bruttointäkt (inkl. moms)',
    explanation: 'Det du fakturerar kunden. Inkluderar moms som du bara håller åt staten – inte din verkliga intäkt.'
  },
  vat: {
    label: 'Momsdel',
    explanation: 'Den del av fakturan som är moms (20 % av brutto). Betalas vidare till Skatteverket och är aldrig din inkomst.'
  },
  netRevenue: {
    label: 'Nettointäkt (exkl. moms)',
    explanation: 'Företagets riktiga intäkt innan avdrag, skatt och avgifter.'
  },
  schablonavdrag: {
    label: 'Schablonavdrag',
    explanation: 'Standardavdrag som ska motsvara typiska kostnader. Bokföringspost – inga pengar lämnar kontot.'
  },
  taxableIncome: {
    label: 'Beskattningsbar inkomst',
    explanation: 'Underlag som både inkomstskatt och egenavgifter beräknas på.'
  },
  incomeTax: {
    label: 'Inkomstskatt',
    explanation: 'Kommunal skatt som finansierar samhällstjänster: vård, skola, omsorg, infrastruktur.'
  },
  socialFees: {
    label: 'Egenavgifter',
    explanation: 'Sociala avgifter som täcker pension, sjuk- och föräldraförsäkring m.m.'
  },
  netIncome: {
    label: 'Nettolön efter skatt',
    explanation: 'Beloppet du kan ta ut efter skatter och avgifter.'
  },
  livingOverhead: {
    label: 'Omkostnader',
    explanation: 'Exempel på kostnad för att hålla företaget i drift (försäkring, boende, transport).'
  },
  finalProfit: {  
    label: 'Fickpengar',
    explanation: 'Det som verkligen blir kvar i plånboken när allt är betalt.'
  }
}

interface Props {
  result: CalculationResult
  onReset: () => void
  onGeneratePdf: () => void
  PieChart?: React.ComponentType<{ data: { label: string; value: number }[] }>
  formState?: any
}

export function ResultsView({ result, onReset, onGeneratePdf, PieChart, formState = {} }: Props) {
  const taxFraction = formState.empTax ?? SWEDISH_EMPLOYEE_DEFAULTS.taxPct
  const housingFraction = formState.empHousing ?? 0
  const foodFraction = formState.empFood ?? 0
  const transportFraction = formState.empTransport ?? 0
  const essentialsFraction = formState.empEssentials ?? 0
  const remainderFraction = Math.max(0, 1 - (taxFraction + housingFraction + foodFraction + transportFraction + essentialsFraction))
  const sliderPct = {
    taxes: taxFraction * 100,
    housing: housingFraction * 100,
    food: foodFraction * 100,
    transport: transportFraction * 100,
    essentials: essentialsFraction * 100,
    pocket: remainderFraction * 100,
  }

  return (
    <div className="space-y-6">
      <div className="flex items-center justify-between">
        <h2 className="text-xl font-semibold">{result.mode === 'employee' ? 'Lönespecifikation' : 'Fakturasammanställning'}</h2>
        <div className="flex gap-2">
          <Button variant="outline" onClick={onReset}>Börja om</Button>
          <Button variant="outline" onClick={onGeneratePdf}>Ladda ner PDF</Button>
        </div>
      </div>
      <div className="grid gap-6 md:grid-cols-3">
        <Card className="md:col-span-2">
          <CardHeader>
            <CardTitle>Pengaflödesuppdelning</CardTitle>
          </CardHeader>
          <CardContent>
            <Table>
              <TableHeader>
                <TableRow>
                  <TableHead className="w-44">Steg</TableHead>
                  <TableHead>Post</TableHead>
                  <TableHead className="w-12 text-center" title="Förklaring">
                    <span className="inline-block w-4 h-4 bg-blue-100 text-blue-700 rounded-full text-center font-bold text-xs leading-4 align-middle select-none">?</span>
                  </TableHead>
                  <TableHead className="text-right">Belopp (kr)</TableHead>
                </TableRow>
              </TableHeader>
              <TableBody>
                {result.mode === 'entrepreneur' ? (
                  (() => {
                    const gross = result.lines.find(l => l.key === 'gross')?.amount || 0
                    const vat = result.lines.find(l => l.key === 'vat')
                    const netRevenue = result.lines.find(l => l.key === 'netRevenue')
                    const socialFees = result.lines.find(l => l.key === 'socialFees')
                    const incomeTax = result.lines.find(l => l.key === 'incomeTax')
                    const schablon = result.lines.find(l => l.key === 'schablonavdrag')
                    const taxableIncome = result.lines.find(l => l.key === 'taxableIncome')
                    const netIncome = result.lines.find(l => l.key === 'netIncome')
                    const livingOverhead = result.lines.find(l => l.key === 'livingOverhead')
                    const finalProfit = result.lines.find(l => l.key === 'finalProfit')
                    const rows: React.ReactNode[] = []
                    // Section 1: VAT flow
                    rows.push(
                      <TableRow key="gross">
                        <TableCell rowSpan={3} className="align-top font-semibold bg-muted">Momsflöde</TableCell>
                        <TableCell className="text-left">{ENTREPRENEUR_EXPLANATIONS.gross.label}</TableCell>
                        <TableCell className="text-center group relative">
                          <div className="w-full h-full">
                            <ExplainTooltip explanation={ENTREPRENEUR_EXPLANATIONS.gross.explanation} />
                          </div>
                        </TableCell>
                        <TableCell className="text-right text-green-700">{gross.toLocaleString('sv-SE')} kr</TableCell>
                      </TableRow>
                    )
                    if (vat) rows.push(
                      <TableRow key="vat">
                        <TableCell className="text-left">
                          <div className="flex flex-col">
                            {ENTREPRENEUR_EXPLANATIONS.vat.label}
                            <span className="text-xs text-muted-foreground mt-0.5">{(Math.abs(vat.amount) / gross * 100).toFixed(1)}% av brutto</span>
                          </div>
                        </TableCell>
                        <TableCell className="text-center group relative">
                          <div className="w-full h-full">
                            <ExplainTooltip explanation={ENTREPRENEUR_EXPLANATIONS.vat.explanation} />
                          </div>
                        </TableCell>
                        <TableCell className="text-right text-red-600">{vat.amount.toLocaleString('sv-SE')} kr</TableCell>
                      </TableRow>
                    )
                    rows.push(
                      <TableRow key="netRevenue">
                        <TableCell className="text-left"><b>{ENTREPRENEUR_EXPLANATIONS.netRevenue.label}</b></TableCell>
                        <TableCell className="text-center group relative">
                          <div className="w-full h-full">
                            <ExplainTooltip explanation={ENTREPRENEUR_EXPLANATIONS.netRevenue.explanation} />
                          </div>
                        </TableCell>
                        <TableCell className="text-right text-green-700">{netRevenue?.amount.toLocaleString('sv-SE')} kr</TableCell>
                      </TableRow>
                    )
                    // Section 2: Taxes & deductions
                    rows.push(
                      <TableRow key="schablonavdrag">
                        <TableCell rowSpan={5} className="align-top font-semibold bg-muted">Skatter & Avdrag</TableCell>
                        <TableCell className="text-left">
                          <div className="flex flex-col">
                            {ENTREPRENEUR_EXPLANATIONS.schablonavdrag.label}
                            <span className="text-xs text-muted-foreground mt-0.5">Bokföringsavdrag</span>
                          </div>
                        </TableCell>
                        <TableCell className="text-center group relative">
                          <div className="w-full h-full">
                            <ExplainTooltip explanation={ENTREPRENEUR_EXPLANATIONS.schablonavdrag.explanation} />
                          </div>
                        </TableCell>
                        <TableCell className="text-right text-red-600">{typeof schablon?.amount === 'number' ? schablon.amount.toLocaleString('sv-SE') + ' kr' : ''}</TableCell>
                      </TableRow>
                    )
                    rows.push(
                      <TableRow key="taxableIncome">
                        <TableCell className="text-left">
                          <div className="flex flex-col">
                            {ENTREPRENEUR_EXPLANATIONS.taxableIncome.label}
                            <span className="text-xs text-muted-foreground mt-0.5">Underlag för båda skatterna</span>
                          </div>
                        </TableCell>
                        <TableCell className="text-center group relative">
                          <div className="w-full h-full">
                            <ExplainTooltip explanation={ENTREPRENEUR_EXPLANATIONS.taxableIncome.explanation} />
                          </div>
                        </TableCell>
                        <TableCell className="text-right text-green-700">{taxableIncome?.amount.toLocaleString('sv-SE')} kr</TableCell>
                      </TableRow>
                    )
                    rows.push(
                      <TableRow key="incomeTax">
                        <TableCell className="text-left">
                          <div className="flex flex-col">
                            {ENTREPRENEUR_EXPLANATIONS.incomeTax.label}
                            <span className="text-xs text-muted-foreground mt-0.5">{typeof incomeTax?.amount === 'number' && taxableIncome?.amount ? (Math.abs(incomeTax.amount) / taxableIncome.amount * 100).toFixed(1) + '% av beskattningsbar inkomst' : ''}</span>
                          </div>
                        </TableCell>
                        <TableCell className="text-center group relative">
                          <div className="w-full h-full">
                            <ExplainTooltip explanation={ENTREPRENEUR_EXPLANATIONS.incomeTax.explanation} />
                          </div>
                        </TableCell>
                        <TableCell className="text-right text-red-600">{typeof incomeTax?.amount === 'number' ? incomeTax.amount.toLocaleString('sv-SE') + ' kr' : ''}</TableCell>
                      </TableRow>
                    )
                    rows.push(
                      <TableRow key="socialFees">
                        <TableCell className="text-left">
                          <div className="flex flex-col">
                            {ENTREPRENEUR_EXPLANATIONS.socialFees.label}
                            <span className="text-xs text-muted-foreground mt-0.5">{typeof socialFees?.amount === 'number' && taxableIncome?.amount ? (Math.abs(socialFees.amount) / taxableIncome.amount * 100).toFixed(1) + '% av beskattningsbar inkomst' : ''}</span>
                          </div>
                        </TableCell>
                        <TableCell className="text-center group relative">
                          <div className="w-full h-full">
                            <ExplainTooltip explanation={ENTREPRENEUR_EXPLANATIONS.socialFees.explanation} />
                          </div>
                        </TableCell>
                        <TableCell className="text-right text-red-600">{typeof socialFees?.amount === 'number' ? socialFees.amount.toLocaleString('sv-SE') + ' kr' : ''}</TableCell>
                      </TableRow>
                    )
                    rows.push(
                      <TableRow key="netIncome">
                        <TableCell className="text-left"><b>{ENTREPRENEUR_EXPLANATIONS.netIncome.label}</b></TableCell>
                        <TableCell className="text-center group relative">
                          <div className="w-full h-full">
                            <ExplainTooltip explanation={ENTREPRENEUR_EXPLANATIONS.netIncome.explanation} />
                          </div>
                        </TableCell>
                        <TableCell className="text-right text-green-700">{netIncome?.amount.toLocaleString('sv-SE')} kr</TableCell>
                      </TableRow>
                    )
                    // Section 3: Living & final profit
                    rows.push(
                      <TableRow key="livingOverhead">
                        <TableCell rowSpan={2} className="align-top font-semibold bg-muted">Levnad & Vinst</TableCell>
                        <TableCell className="text-left">{ENTREPRENEUR_EXPLANATIONS.livingOverhead.label}</TableCell>
                        <TableCell className="text-center group relative">
                          <div className="w-full h-full">
                            <ExplainTooltip explanation={ENTREPRENEUR_EXPLANATIONS.livingOverhead.explanation} />
                          </div>
                        </TableCell>
                        <TableCell className="text-right text-red-600">{typeof livingOverhead?.amount === 'number' ? livingOverhead.amount.toLocaleString('sv-SE') + ' kr' : ''}</TableCell>
                      </TableRow>
                    )
                    rows.push(
                      <TableRow key="finalProfit">
                        <TableCell className="text-left"><b>{ENTREPRENEUR_EXPLANATIONS.finalProfit.label}</b></TableCell>
                        <TableCell className="text-center group relative">
                          <div className="w-full h-full">
                            <ExplainTooltip explanation={ENTREPRENEUR_EXPLANATIONS.finalProfit.explanation} />
                          </div>
                        </TableCell>
                        <TableCell className="text-right text-green-700">{finalProfit?.amount.toLocaleString('sv-SE')} kr</TableCell>
                      </TableRow>
                    )
                    return rows
                  })()
                ) : (
                  (() => {
                    // Explanations for employee mode
                    const EMPLOYEE_EXPLANATIONS: Record<string, { label: string; explanation: string; positive?: boolean }> = {
                      gross: {
                        label: 'Bruttolön',
                        explanation: 'Din lön före skatt och avdrag.',
                        positive: true,
                      },
                      taxes: {
                        label: 'Skatt',
                        explanation: 'Preliminär inkomstskatt som dras från lönen.',
                      },
                      housing: {
                        label: 'Boende',
                        explanation: 'Hyra eller boendekostnad.',
                      },
                      food: {
                        label: 'Mat',
                        explanation: 'Matkostnader, inklusive dagligvaror och måltider.',
                      },
                      transport: {
                        label: 'Transport',
                        explanation: 'Kostnader för kollektivtrafik eller bil.',
                      },
                      essentials: {
                        label: 'Nödvändigheter',
                        explanation: 'Nödvändiga utgifter som telefon, hygien, försäkring.',
                      },
                      discretionary: {
                        label: 'Fickpengar',
                        explanation: 'Det som blir kvar efter alla utgifter.',
                        positive: true,
                      },
                    }
                    const gross = result.lines.find(l => l.key === 'gross')
                    const taxes = result.lines.find(l => l.key === 'taxes')
                    const housing = result.lines.find(l => l.key === 'housing')
                    const food = result.lines.find(l => l.key === 'food')
                    const transport = result.lines.find(l => l.key === 'transport')
                    const essentials = result.lines.find(l => l.key === 'essentials')
                    const discretionary = result.lines.find(l => l.key === 'discretionary')
                    const finalProfit = result.lines.find(l => l.key === 'finalProfit') || discretionary
                    function pct(lineKey: string) {
                      if (lineKey === 'taxes') return sliderPct.taxes.toFixed(0) + '%'
                      if (lineKey === 'housing') return sliderPct.housing.toFixed(0) + '%'
                      if (lineKey === 'food') return sliderPct.food.toFixed(0) + '%'
                      if (lineKey === 'transport') return sliderPct.transport.toFixed(0) + '%'
                      if (lineKey === 'essentials') return sliderPct.essentials.toFixed(0) + '%'
                      if (lineKey === 'discretionary' || lineKey === 'finalProfit') return sliderPct.pocket.toFixed(0) + '%'
                      return ''
                    }
                    const rows: React.ReactNode[] = []
                    if (gross) rows.push(
                      <TableRow key="gross">
                        <TableCell rowSpan={1} className="align-top font-semibold bg-muted">Bruttolön</TableCell>
                        <TableCell className="text-left">{EMPLOYEE_EXPLANATIONS.gross.label}</TableCell>
                        <TableCell className="text-center group relative">
                          <div className="w-full h-full">
                            <ExplainTooltip explanation={EMPLOYEE_EXPLANATIONS.gross.explanation} />
                          </div>
                        </TableCell>
                        <TableCell className="text-right text-green-700">{gross.amount.toLocaleString('sv-SE')} kr</TableCell>
                      </TableRow>
                    )
                    if (taxes) rows.push(
                      <TableRow key="taxes">
                        <TableCell rowSpan={1} className="align-top font-semibold bg-muted">Skatt</TableCell>
                        <TableCell className="text-left">{EMPLOYEE_EXPLANATIONS.taxes.label}</TableCell>
                        <TableCell className="text-center group relative">
                          <div className="w-full h-full">
                            <ExplainTooltip explanation={EMPLOYEE_EXPLANATIONS.taxes.explanation} />
                          </div>
                        </TableCell>
                        <TableCell className="text-right text-red-600">{taxes.amount.toLocaleString('sv-SE')} kr</TableCell>
                      </TableRow>
                    )
                    const livingLines = [housing, food, transport, essentials].filter(Boolean)
                    if (livingLines.length) livingLines.forEach((line, idx) => rows.push(
                      <TableRow key={line!.key}>
                        {idx === 0 && <TableCell rowSpan={livingLines.length} className="align-top font-semibold bg-muted">Levnadskostnader</TableCell>}
                        <TableCell className="text-left">{EMPLOYEE_EXPLANATIONS[line!.key]?.label ?? line!.label}</TableCell>
                        <TableCell className="text-center group relative">
                          <div className="w-full h-full">
                            <ExplainTooltip explanation={EMPLOYEE_EXPLANATIONS[line!.key]?.explanation ?? ''} />
                          </div>
                        </TableCell>
                        <TableCell className="text-right text-red-600">{line!.amount.toLocaleString('sv-SE')} kr</TableCell>
                      </TableRow>
                    ))
                    if (discretionary) rows.push(
                      <TableRow key={discretionary.key}>
                        <TableCell rowSpan={1} className="align-top font-semibold bg-muted">Fickpengar</TableCell>
                        <TableCell className="text-left">{EMPLOYEE_EXPLANATIONS.discretionary.label}</TableCell>
                        <TableCell className="text-center group relative">
                          <div className="w-full h-full">
                            <ExplainTooltip explanation={EMPLOYEE_EXPLANATIONS.discretionary.explanation} />
                          </div>
                        </TableCell>
                        <TableCell className="text-right text-green-700">{discretionary.amount.toLocaleString('sv-SE')} kr</TableCell>
                      </TableRow>
                    )
                    return rows
                  })()
                )}
              </TableBody>
            </Table>
          </CardContent>
        </Card>
        <Card>
          <CardHeader>
            <CardTitle>Fördelning</CardTitle>
          </CardHeader>
          <CardContent>
            {PieChart ? <PieChart data={result.chart} /> : <div className="text-muted-foreground text-sm">Cirkeldiagram laddas...</div>}
            <div className="mt-4 flex flex-wrap gap-3 justify-center">
              {result.chart.map((item, idx) => {
                const colors = ['#2563eb', '#f59e42', '#22c55e', '#ef4444', '#a21caf', '#eab308']
                const color = colors[idx % colors.length]
                return (
                  <div key={item.label} className="flex items-center gap-2 text-xs">
                    <span className="inline-block w-4 h-4 rounded-full" style={{ background: color }}></span>
                    <span>{item.label}</span>
                  </div>
                )
              })}
            </div>
          </CardContent>
        </Card>
      </div>
      {/* <div className="space-y-4">
        <Card>
          <CardHeader>
            <CardTitle>Väx din ekonomi (valfritt)</CardTitle>
          </CardHeader>
          <CardContent className="space-y-2 text-sm">
            <p>Öppna ett barnkonto/debetkort (partnerlänk placeholder).</p>
            <p>Investera en del via enkla ETF-plattformar.</p>
            <p>Ladda ner hushållsekonomistartpaketet (kommer snart).</p>
          </CardContent>
        </Card>
      </div> */}
    </div>
  )
}
