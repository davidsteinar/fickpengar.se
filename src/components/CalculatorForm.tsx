// import * as Tabs from '@radix-ui/react-tabs'
import { CHORE_TIERS, CHORE_TIER_DEFAULT_RATES_EMPLOYEE, CHORE_TIER_DEFAULT_RATES_ENTREPRENEUR, getChoreTier, SWEDISH_EMPLOYEE_DEFAULTS } from '../lib/constants'
import { Input } from './ui/input'
import { Clock } from "lucide-react";
import { Slider } from './ui/slider'
import { Label } from './ui/label'
import { Select, SelectTrigger, SelectValue, SelectContent, SelectItem } from './ui/select'


interface Props {
  onFormChange: (newState: Partial<any>) => void
  formState: any
}


export function CalculatorForm({ onFormChange, formState }: Props) {
  const { mode, taskName, rate, hours, empHousing, empFood, empTransport, empEssentials, entOverheadMonthly, entBillable } = formState

  // Helper to keep total at or below 100%
  // Remove empTax from sliders, treat as constant. Discretionary is now purely derived, not user-adjustable.
  type SliderKey = 'empHousing' | 'empFood' | 'empTransport' | 'empEssentials';
  const TAX_DEFAULT = SWEDISH_EMPLOYEE_DEFAULTS.taxPct;
  function handleEmployeeSliderChange(key: SliderKey, value: number) {
    // All values in percent (0-1)
    let newState = {
      empTax: TAX_DEFAULT,
      empHousing: empHousing ?? 0,
      empFood: empFood ?? 0,
      empTransport: empTransport ?? 0,
      empEssentials: empEssentials ?? 0,
    };
    // Set chosen slider
    newState[key] = value;
    // Enforce cap so sum (excluding discretionary) does not exceed 1
    const sum = TAX_DEFAULT + newState.empHousing + newState.empFood + newState.empTransport + newState.empEssentials;
    if (sum > 1) {
      // Clamp the changed slider so remainder never negative
      const overflow = sum - 1;
      newState[key] = Math.max(0, value - overflow);
    }
    onFormChange(newState);
  }

  // When a task is selected, always set the rate to the default for its tier
  function handleTaskChange(chore: string) {
    const tier = getChoreTier(chore)
    if (tier) {
      const defaultRate = mode === 'employee'
        ? CHORE_TIER_DEFAULT_RATES_EMPLOYEE[tier]
        : CHORE_TIER_DEFAULT_RATES_ENTREPRENEUR[tier]
      onFormChange({ taskName: chore, rate: defaultRate })
      return
    }
    onFormChange({ taskName: chore })
  }

  function handleModeChange(newMode: 'employee' | 'entrepreneur') {
    // When switching modes, set rate based on current task tier if available
    const tier = taskName ? getChoreTier(taskName) : undefined
    if (tier) {
      const defaultRate = newMode === 'employee'
        ? CHORE_TIER_DEFAULT_RATES_EMPLOYEE[tier]
        : CHORE_TIER_DEFAULT_RATES_ENTREPRENEUR[tier]
      onFormChange({ mode: newMode, rate: defaultRate })
    } else {
      onFormChange({ mode: newMode })
    }
  }

  return (
    <div className="space-y-8">
      {/* Välj läge överst */}
      <div className="flex flex-col md:flex-row gap-4">
        {/* Anställd-kort */}
        <button
          type="button"
          aria-pressed={mode==='employee'}
          aria-label="Välj läge: Anställd"
          className={`flex-1 p-6 rounded-xl border-4 text-left transition-all duration-150 shadow-md relative group
            ${mode==='employee'
              ? 'border-blue-600 bg-blue-50 ring-2 ring-blue-400'
              : 'border-gray-200 bg-gray-50 hover:bg-gray-100'}
          `}
          onClick={() => handleModeChange('employee')}
        >
          <div className="flex items-center gap-2 mb-2">
            <span className="text-xl font-bold">Anställd</span>
            {mode==='employee' && (
              <span className="inline-block align-middle text-blue-600">
                <svg width="22" height="22" fill="none" viewBox="0 0 24 24"><circle cx="12" cy="12" r="12" fill="#2563eb"/><path d="M7 13.5l3 3 7-7" stroke="#fff" strokeWidth="2.5" strokeLinecap="round" strokeLinejoin="round"/></svg>
              </span>
            )}
          </div>
          <div className="text-sm mb-1 text-blue-900 font-medium">Rekommenderas för barn <b>under 12 år</b></div>
          <div className="text-xs text-blue-800">Enkelt: Se vad du får kvar efter skatt och grundkostnader.</div>
        </button>
        {/* Entrepreneur Card */}
        <button
          type="button"
          aria-pressed={mode==='entrepreneur'}
          aria-label="Välj läge: Egenföretagare"
          className={`flex-1 p-6 rounded-xl border-4 text-left transition-all duration-150 shadow-md relative group
            ${mode==='entrepreneur'
              ? 'border-green-600 bg-green-50 ring-2 ring-green-400'
              : 'border-gray-200 bg-gray-50 hover:bg-gray-100'}
          `}
          onClick={() => handleModeChange('entrepreneur')}
        >
          <div className="flex items-center gap-2 mb-2">
            <span className="text-xl font-bold">Egenföretagare</span>
            {mode==='entrepreneur' && (
              <span className="inline-block align-middle text-green-600">
                <svg width="22" height="22" fill="none" viewBox="0 0 24 24"><circle cx="12" cy="12" r="12" fill="#16a34a"/><path d="M7 13.5l3 3 7-7" stroke="#fff" strokeWidth="2.5" strokeLinecap="round" strokeLinejoin="round"/></svg>
              </span>
            )}
          </div>
          <div className="text-sm mb-1 text-green-900 font-medium">Rekommenderas för barn <b>12 år och över</b></div>
          <div className="text-xs text-green-800">Avancerat: Se alla skatter, moms och verkliga företagskostnader.</div>
        </button>
      </div>
      <div className="grid gap-4 md:grid-cols-3">
        <div className="md:col-span-2 space-y-4">
          <Label>Syssla</Label>
          <Select value={taskName} onValueChange={handleTaskChange}>
            <SelectTrigger>
              <SelectValue placeholder="Välj syssla" />
            </SelectTrigger>
            <SelectContent>
              <div className="px-2 py-1 text-xs text-muted-foreground font-semibold">Nivå A (Högst)</div>
              {CHORE_TIERS.A.map(c => (
                <SelectItem key={c} value={c}>{c} <span className="text-xs text-muted-foreground">(A)</span></SelectItem>
              ))}
              <div className="px-2 py-1 text-xs text-muted-foreground font-semibold">Nivå B</div>
              {CHORE_TIERS.B.map(c => (
                <SelectItem key={c} value={c}>{c} <span className="text-xs text-muted-foreground">(B)</span></SelectItem>
              ))}
              <div className="px-2 py-1 text-xs text-muted-foreground font-semibold">Nivå C (Bas)</div>
              {CHORE_TIERS.C.map(c => (
                <SelectItem key={c} value={c}>{c} <span className="text-xs text-muted-foreground">(C)</span></SelectItem>
              ))}
            </SelectContent>
          </Select>
          <div className="flex flex-row gap-4 items-end">
            <div className="flex-1">
              <Label htmlFor="rate-input" className="block mb-1">Timlön & Timmar</Label>
              <div className="flex flex-row gap-2">
                <div className="relative w-1/2">
                  <span className="-translate-y-1/2 absolute top-1/2 left-3 h-4 flex items-center text-muted-foreground select-none" style={{fontSize: '1rem'}}>kr</span>
                  <Input
                    className="bg-background pl-9"
                    id="rate-input"
                    step="1"
                    type="number"
                    value={rate ?? ''}
                    onChange={e => {
                      const val = e.target.value;
                      onFormChange({ rate: val === '' ? undefined : Number(val) });
                    }}
                  />
                </div>
                <div className="relative w-1/2">
                  <Clock className="-translate-y-1/2 absolute top-1/2 left-3 h-4 w-4 text-muted-foreground" />
                  <Input
                    id="hours-input"
                    type="number"
                    step="0.1"
                    placeholder="Timmar"
                    className="bg-background pl-9 pr-7"
                    value={hours}
                    onChange={e => onFormChange({ hours: Number(e.target.value) })}
                  />
                </div>
              </div>
              <p className="text-muted-foreground text-xs mt-1">Fyll i timlön (kr) och antal timmar. Lön anges i kr {mode === 'employee' ? 'per timme' : 'inkl. moms'}.</p>
            </div>
          </div>
          {/* Entrepreneur-specific inputs moved to right column; removed here */}
        </div>
        <div className="space-y-2">
          {/* Mode-specific sliders and settings */}
        {mode === 'employee' && (
          <div className="space-y-4">
            <div>
              <Label className="mb-1 block flex items-center justify-between">
                Skatt
                <span className="text-xs text-muted-foreground ml-2">
                  <span className="font-semibold">{Math.round(TAX_DEFAULT*100)}%</span>
                </span>
              </Label>
            </div>
            <div>
              <Label className="mb-1 block flex items-center justify-between">
                Boende
                <span className="text-xs text-muted-foreground ml-2">
                  <span className="font-semibold">{Math.round((empHousing ?? 0)*100)}%</span>
                </span>
              </Label>
              <Slider value={[(empHousing !== undefined ? empHousing : SWEDISH_EMPLOYEE_DEFAULTS.housingPct) * 100]} onValueChange={([v]) => handleEmployeeSliderChange('empHousing', v/100)} max={70} step={1} />
            </div>
            <div>
              <Label className="mb-1 block flex items-center justify-between">
                Mat
                <span className="text-xs text-muted-foreground ml-2">
                  <span className="font-semibold">{Math.round((empFood ?? 0)*100)}%</span>
                </span>
              </Label>
              <Slider value={[empFood ? empFood * 100 : 0]} onValueChange={([v]) => handleEmployeeSliderChange('empFood', v/100)} max={40} step={1} />
            </div>
            <div>
              <Label className="mb-1 block flex items-center justify-between">
                Transport
                <span className="text-xs text-muted-foreground ml-2">
                  <span className="font-semibold">{Math.round((empTransport ?? 0)*100)}%</span>
                </span>
              </Label>
              <Slider value={[empTransport ? empTransport * 100 : 0]} onValueChange={([v]) => handleEmployeeSliderChange('empTransport', v/100)} max={40} step={1} />
            </div>
            <div>
              <Label className="mb-1 block flex items-center justify-between">
                Nödvändigheter
                <span className="text-xs text-muted-foreground ml-2">
                  <span className="font-semibold">{Math.round((empEssentials ?? 0)*100)}%</span>
                </span>
              </Label>
              <Slider value={[empEssentials ? empEssentials * 100 : 0]} onValueChange={([v]) => handleEmployeeSliderChange('empEssentials', v/100)} max={40} step={1} />
            </div>
            <div>
              <Label className="mb-1 block flex items-center justify-between">
                Fickpengar (Rest)
                <span className="text-xs text-muted-foreground ml-2">
                  {(() => {
                    const remainderPct = Math.max(0, (1 - (TAX_DEFAULT + (empHousing ?? 0) + (empFood ?? 0) + (empTransport ?? 0) + (empEssentials ?? 0))) * 100);
                    return <span className="font-semibold">{Math.round(remainderPct)}%</span>
                  })()}
                </span>
              </Label>
              <p className="text-xs text-muted-foreground">Beräknas automatiskt utifrån vad som blir kvar efter skatt och levnadskostnader.</p>
            </div>
          </div>
        )}
          {mode === 'entrepreneur' && (
            <div className="space-y-4">
              <div>
                <Label>Månatliga omkostnader (kr)</Label>
                <Input type="number" value={entOverheadMonthly ?? ''} onChange={e => onFormChange({ entOverheadMonthly: Number(e.target.value) })} />
              </div>
              <div>
                <Label>Fakturerbara timmar / månad</Label>
                <Input type="number" value={entBillable ?? ''} onChange={e => onFormChange({ entBillable: Number(e.target.value) })} />
              </div>
            </div>
          )}
        </div>
      </div>
      {/* No calculate button, everything is reactive */}
    </div>
  )
}
