// File: /app/dashboard/utils/chartUtils.ts

// ==== BLOCK: IMPORTS ====
import { ChartData } from 'chart.js'
import { ChipEarnings, Chip, Property } from '@/types'  // Correct absolute import
// ==== END BLOCK: IMPORTS ====


// ==== BLOCK: formatChipEarningsComparison ====
// Formats chip earnings over time for bar chart grouped by month/year
export function formatChipEarningsComparison(
  earnings: ChipEarnings[],
  chips: Chip[],
  properties: Property[]
): ChartData<'bar'> {
  const map: Record<string, { amount: number; label: string }> = {}

  earnings.forEach((entry) => {
    const date = new Date(entry.date)
    const label = `${date.toLocaleString('default', { month: 'short' })} ${date.getFullYear()}`
    const key = `${date.getFullYear()}-${date.getMonth()}`

    if (!map[key]) {
      map[key] = { amount: 0, label }
    }

    map[key].amount += entry.amount || 0
  })

  const sorted = Object.entries(map)
    .sort(([a], [b]) => (a > b ? 1 : -1))
    .map(([_, value]) => value)

  return {
    labels: sorted.map((item) => item.label),
    datasets: [
      {
        label: 'Total Earnings',
        data: sorted.map((item) => item.amount),
        backgroundColor: '#10B981',
      },
    ],
  }
}
// ==== END BLOCK: formatChipEarningsComparison ====


// ==== BLOCK: formatEarningsByChip ====
// Formats earnings per chip for a bar chart
export function formatEarningsByChip(
  earnings: ChipEarnings[],
  selectedChips: string[],
  chips: Chip[]
): ChartData<'bar'> {
  const earningsMap: Record<string, number> = {}

  earnings.forEach((entry) => {
    const chipId = entry.chip_id
    if (selectedChips.includes(chipId)) {
      earningsMap[chipId] = (earningsMap[chipId] || 0) + entry.amount
    }
  })

  const filteredChips = chips.filter(chip => selectedChips.includes(chip.id))
  const labels = filteredChips.map((chip) => chip.serial)
  const data = filteredChips.map((chip) => earningsMap[chip.id] || 0)

  return {
    labels,
    datasets: [
      {
        label: 'Earnings',
        data,
        backgroundColor: 'rgba(34, 197, 94, 0.7)',
        borderColor: 'rgba(34, 197, 94, 1)',
        borderWidth: 2,
      },
    ],
  }
}
// ==== END BLOCK: formatEarningsByChip ====


// ==== BLOCK: formatEarningsByProperty ====
// Aggregates chip earnings by property for bar chart display
export function formatEarningsByProperty(
  earnings: { property_id?: string; date: string; amount: number }[],
  selectedProps: string[],
  months: string[],
  monthIndexes: number[]
): ChartData<'bar'> {
  const monthlyMap: Record<string, number[]> = {}

  selectedProps.forEach((propId) => {
    monthlyMap[propId] = new Array(monthIndexes.length).fill(0)
  })

  earnings.forEach((e) => {
    const idx = monthIndexes.indexOf(new Date(e.date).getMonth())
    if (idx !== -1 && e.property_id && monthlyMap[e.property_id]) {
      monthlyMap[e.property_id][idx] += e.amount
    }
  })

  const datasets = selectedProps.map((propId) => ({
    label: propId,
    data: monthlyMap[propId],
    backgroundColor: 'rgba(59, 130, 246, 0.7)',
    borderColor: 'rgba(59, 130, 246, 1)',
    borderWidth: 2,
  }))

  return {
    labels: months,
    datasets,
  }
}
// ==== END BLOCK: formatEarningsByProperty ====


// ==== BLOCK: formatEarningsOverTime ====
// Groups earnings by date and formats data for a line chart
export function formatEarningsOverTime(
  earnings: { date: string; amount: number }[]
): ChartData<'line'> {
  const map: Record<string, number> = {}

  for (const { date, amount } of earnings) {
    const day = new Date(date).toISOString().split('T')[0]
    map[day] = (map[day] || 0) + amount
  }

  const sortedDates = Object.keys(map).sort()

  return {
    labels: sortedDates,
    datasets: [
      {
        label: 'Total Earnings',
        data: sortedDates.map((d) => map[d]),
        fill: false,
        borderColor: 'rgba(34, 197, 94, 1)', // emerald-500
        tension: 0.3,
      },
    ],
  }
}
// ==== END BLOCK: formatEarningsOverTime ====


// ==== BLOCK: formatPropertyComparison ====
// Aggregates earnings by property and formats chart data
export function formatPropertyComparison(
  properties: { id: string; title: string }[],
  earnings: { property_id: string; amount: number }[]
) {
  const totals: Record<string, number> = {}

  for (const entry of earnings) {
    totals[entry.property_id] = (totals[entry.property_id] || 0) + entry.amount
  }

  const labels = properties.map((p) => p.title)
  const data = properties.map((p) => totals[p.id] || 0)

  return {
    labels,
    datasets: [
      {
        label: 'Earnings',
        data,
        backgroundColor: 'rgba(59, 130, 246, 0.7)',
        borderColor: 'rgba(59, 130, 246, 1)',
        borderWidth: 2,
      },
    ],
  }
}
// ==== END BLOCK: formatPropertyComparison ====
