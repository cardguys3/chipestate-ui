// File: /app/dashboard/components/charts/EarningsByPropertyChart.tsx

'use client'

import React from 'react'
import { Bar } from 'react-chartjs-2'
import { formatEarningsByProperty } from '@/app/dashboard/utils/chartUtils'
import { barChartOptions } from '@/app/dashboard/utils/chartOptions'
import { Chip, Property } from '@/types'

// ==== BLOCK: interface Props ====
interface Props {
  data: any[]
  chips: Chip[]            // Added chips prop
  properties: Property[]   // Added properties prop
  selectedProps: string[]
  months: string[]
  monthIndexes: number[]
}
// ==== END BLOCK: interface Props ====

// ==== BLOCK: Component Function ====
export default function EarningsByPropertyChart({
  data,
  chips,          // Added chips to props
  properties,     // Added properties to props
  selectedProps,
  months,
  monthIndexes,
}: Props) {
  const chartData = formatEarningsByProperty(data, selectedProps, months, monthIndexes)

  return (
    <div className="mb-8">
      <h2 className="text-xl font-semibold mb-2">Earnings by Property</h2>
      <Bar data={chartData} options={barChartOptions} />
    </div>
  )
}
// ==== END BLOCK: Component Function ====
