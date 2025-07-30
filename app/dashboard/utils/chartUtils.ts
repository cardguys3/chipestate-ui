// /app/dashboard/utils/chartUtils.ts

import { ChipEarnings, Chip, Property } from '../types'

export function groupEarningsByMonth(
  earnings: ChipEarnings[],
  chips: Chip[],
  properties: Property[]
) {
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

  // Convert to array and sort by date
  const sorted = Object.entries(map)
    .sort(([a], [b]) => (a > b ? 1 : -1))
    .map(([_, value]) => value)

  return sorted
}
