import { PDFDocument, StandardFonts, rgb } from 'pdf-lib'
import type { CalculationResult, MoneyFunnelLine } from './types'

// Improved PDF builder with grouped table reflecting UI table
export async function buildPdf(result: CalculationResult, householdName = 'Household', childName = 'Child'): Promise<Uint8Array> {
  const doc = await PDFDocument.create()
  const fontRegular = await doc.embedFont(StandardFonts.Helvetica)
  const fontBold = await doc.embedFont(StandardFonts.HelveticaBold)

  const pageSize: [number, number] = [595.28, 841.89] // A4 portrait
  let page = doc.addPage(pageSize)
  const { width, height } = page.getSize()
  const margin = 40
  const rowHeight = 26
  const groupCellWidth = 140
  const itemCellWidth = 240
  const pctCellWidth = 70
  // Amount column width is derived implicitly from remaining space; no explicit variable needed.
  const headerBg = rgb(0.94, 0.94, 0.96)
  const mutedBg = rgb(0.95, 0.95, 0.95)
  const borderColor = rgb(0.75, 0.75, 0.78)
  const positiveColor = rgb(0.1, 0.5, 0.2)
  const negativeColor = rgb(0.75, 0.15, 0.15)

  function newPage() {
    page = doc.addPage(pageSize)
    drawHeader()
  }

  function drawHeader() {
    const title = result.mode === 'employee' ? 'EARNINGS STATEMENT' : 'INVOICE SUMMARY'
    let y = height - margin
    page.drawText(title, { x: margin, y: y, size: 20, font: fontBold })
    y -= 20
    page.drawText(`Household: ${householdName}`, { x: margin, y, size: 12, font: fontRegular })
    y -= 16
    page.drawText(`Child: ${childName}`, { x: margin, y, size: 12, font: fontRegular })
    y -= 16
    page.drawText(`Task: ${result.task.taskName}`, { x: margin, y, size: 12, font: fontRegular })
    y -= 16
    page.drawText(`Rate: ${result.task.rate} kr`, { x: margin, y, size: 12, font: fontRegular })
    y -= 16
    page.drawText(`Hours: ${result.task.hours}`, { x: margin, y, size: 12, font: fontRegular })
    y -= 12
    page.drawLine({ start: { x: margin, y }, end: { x: width - margin, y }, thickness: 1, color: borderColor })
    currentY = y - 30
    drawTableHeader()
  }

  function drawTableHeader() {
    // Draw header background rectangle
    page.drawRectangle({ x: margin, y: currentY - rowHeight + 4, width: width - margin * 2, height: rowHeight, color: headerBg })
    const yText = currentY - rowHeight + 12
    page.drawText('Stage', { x: margin + 6, y: yText, size: 12, font: fontBold })
    page.drawText('Item', { x: margin + groupCellWidth + 6, y: yText, size: 12, font: fontBold })
    page.drawText('Pct', { x: margin + groupCellWidth + itemCellWidth + 6, y: yText, size: 12, font: fontBold })
    page.drawText('Amount (kr)', { x: margin + groupCellWidth + itemCellWidth + pctCellWidth + 6, y: yText, size: 12, font: fontBold })
    currentY -= rowHeight + 4
  }

  function formatAmount(n: number) {
    return `${(Math.abs(n)).toLocaleString('sv-SE', { minimumFractionDigits: 2, maximumFractionDigits: 2 })} kr`
  }

  function linePct(line: MoneyFunnelLine): string {
    const gross = result.grossRevenue || (result.lines.find(l => l.key === 'gross')?.amount ?? 0)
    if (!gross) return ''
    // For non-cash schablon we still show percentage
    return `${(Math.abs(line.amount) / gross * 100).toFixed(1)}%`
  }

  let currentY = height - margin
  drawHeader()

  // Build grouped structure similar to UI
  type Group = { label: string; keys: string[] }
  let groups: Group[]
  if (result.mode === 'entrepreneur') {
    groups = [
      { label: 'VAT Deduction', keys: ['gross', 'vat', 'netRevenue'] },
      { label: 'Tax Deductions & Taxes', keys: ['schablonavdrag', 'taxableIncome', 'incomeTax', 'socialFees', 'netIncome'] },
      { label: 'Living Costs & Final Profit', keys: ['livingOverhead', 'finalProfit'] },
    ]
  } else {
    // employee
    const hasFinal = result.lines.some(l => l.key === 'finalProfit')
    groups = [
      { label: 'Gross Pay', keys: ['gross'] },
      { label: 'Tax', keys: ['taxes'] },
      { label: 'Living Costs', keys: ['housing', 'food', 'transport', 'essentials'] },
      { label: 'Take-home', keys: hasFinal ? ['discretionary', 'finalProfit'] : ['discretionary'] },
    ]
  }

  function ensureSpace(rowsNeeded: number) {
    const needed = rowsNeeded * rowHeight + 80 // extra for summary if near end
    if (currentY - needed < margin + 120) { // keep some space above footer/summary
      newPage()
    }
  }

  function drawGroup(group: Group) {
    const lines = group.keys.map(k => result.lines.find(l => l.key === k)).filter(Boolean) as MoneyFunnelLine[]
    if (!lines.length) return
    ensureSpace(lines.length)
    const groupHeight = lines.length * rowHeight
    // Group cell background
    page.drawRectangle({ x: margin, y: currentY - groupHeight, width: groupCellWidth, height: groupHeight, color: mutedBg })
    // Group label
    page.drawText(group.label, { x: margin + 6, y: currentY - 18, size: 12, font: fontBold })
    // Rows
    lines.forEach((line, idx) => {
      const rowTopY = currentY - (idx + 1) * rowHeight
      // Horizontal separator line
      page.drawLine({ start: { x: margin, y: rowTopY }, end: { x: width - margin, y: rowTopY }, thickness: 0.5, color: borderColor })
      const itemX = margin + groupCellWidth + 6
      const pctX = margin + groupCellWidth + itemCellWidth + 6
      const amtX = margin + groupCellWidth + itemCellWidth + pctCellWidth + 6
      // Item label
      const labelY = rowTopY + 8
      const isBold = /gross|netRevenue|netIncome|finalProfit|discretionary|taxableIncome/.test(line.key)
      page.drawText(line.label, { x: itemX, y: labelY + 8, size: 11, font: isBold ? fontBold : fontRegular })
      if (line.description) {
        page.drawText(line.description.slice(0, 60), { x: itemX, y: labelY - 2, size: 8, font: fontRegular, color: rgb(0.35, 0.35, 0.35) })
      }
      // Percentage
      const pct = linePct(line)
      page.drawText(pct, { x: pctX, y: labelY + 8, size: 10, font: fontRegular, color: rgb(0.25, 0.25, 0.25) })
      // Amount (negative red, positive green)
      const amtColor = line.amount >= 0 ? positiveColor : negativeColor
      page.drawText((line.amount < 0 ? '-' : '') + formatAmount(line.amount), { x: amtX, y: labelY + 8, size: 11, font: fontBold, color: amtColor })
    })
    currentY -= groupHeight
  }

  groups.forEach(g => drawGroup(g))

  // Summary / Final box
  ensureSpace(2)
  const boxHeight = 70
  const boxY = currentY - boxHeight - 10
  page.drawRectangle({ x: margin, y: boxY, width: width - margin * 2, height: boxHeight, color: rgb(0.92, 0.98, 0.93) })
  page.drawRectangle({ x: margin, y: boxY, width: width - margin * 2, height: boxHeight, borderWidth: 1.2, borderColor: positiveColor })
  const finalLabel = result.mode === 'employee' ? 'FINAL TAKE-HOME' : 'FINAL PROFIT (TAKE-HOME)'
  page.drawText(finalLabel, { x: margin + 16, y: boxY + boxHeight - 24, size: 14, font: fontBold, color: positiveColor })
  page.drawText(formatAmount(result.finalNet), { x: margin + 16, y: boxY + boxHeight - 44, size: 18, font: fontBold, color: positiveColor })
  page.drawText('This is what you actually keep after all costs.', { x: margin + 16, y: boxY + 14, size: 10, font: fontRegular, color: rgb(0.3, 0.4, 0.3) })

  const pdfBytes = await doc.save()
  return pdfBytes
}

export function triggerDownload(bytes: Uint8Array, filename: string) {
  const blob = new Blob([bytes as unknown as BlobPart], { type: 'application/pdf' })
  const url = URL.createObjectURL(blob)
  const a = document.createElement('a')
  a.href = url
  a.download = filename
  a.click()
  URL.revokeObjectURL(url)
}
