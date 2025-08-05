// File: /app/dashboard/components/charts/ChipEarningsComparisonChart.tsx

'use client'

import { MonthlyPayout, Chip, Property } from '@/types'
import { Bar } from 'react-chartjs-2'
// Use relative imports from this file location
import { formatChipEarningsComparison } from '../../utils/chartUtils'
import { barChartOptions } from '../../utils/chartOptions'

// ==== BLOCK: interface Props – ChipEarningsComparisonChart.tsx (REPLACE) ====
interface Props {
  data: MonthlyPayout[]
  selectedChips: string[]
  months: string[]
  monthIndexes: number[]
}
// ==== END BLOCK: interface Props – ChipEarningsComparisonChart.tsx (REPLACE) ====

// ==== BLOCK: Component – ChipEarningsComparisonChart (REPLACE) ====
export default function ChipEarningsComparisonChart({
  data,
  selectedChips,
  months,
  monthIndexes,
}: Props) {
  // Map MonthlyPayout[] to ChipEarnings[] with dummy ids
  const chipEarningsData = data.map((entry, index) => ({
    id: `ce-${index}`,
    chip_id: entry.chip_id || '',
    amount: entry.amount,
    date: entry.date,
  }))

  const properties: Property[] = []

  const chipsForSelected = selectedChips.map(id => ({ id, serial: '', property_id: '' }))

  const chartData = formatChipEarningsComparison(chipEarningsData, chipsForSelected, properties)

  return (
    <div className="mb-8">
      <h2 className="text-xl font-semibold mb-2">Chip Earnings Comparison</h2>
      <Bar data={chartData} options={barChartOptions} />
    </div>
  )
}
// ==== END BLOCK: Component – ChipEarningsComparisonChart (REPLACE) ====
