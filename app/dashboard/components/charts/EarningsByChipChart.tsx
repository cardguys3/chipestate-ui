// File: /app/dashboard/components/charts/EarningsByChipChart.tsx

'use client'

import React from 'react'
import { Bar } from 'react-chartjs-2'
import { formatEarningsByChip } from '@/app/dashboard/utils/chartUtils'
import { barChartOptions } from '@/app/dashboard/utils/chartOptions'
import { ChartData } from 'chart.js'
import { Chip } from '@/types'

// ==== BLOCK: interface Props ====
interface Props {
  data: any[];
  chips: Chip[];
  selectedChips: string[];
  months: string[];
  monthIndexes: number[];
}
// ==== END BLOCK: interface Props ====

// ==== BLOCK: Component Function ====
export default function EarningsByChipChart({
  data,
  chips,
  selectedChips,
  months,
  monthIndexes
}: Props) {
  const earnings = data.filter(
    (entry) =>
      selectedChips.includes(entry.chip_id) &&
      monthIndexes.includes(months.indexOf(entry.date))
  );

  const chartData: ChartData<'bar'> = formatEarningsByChip(earnings, selectedChips, chips);

  return (
    <div className="mb-8">
      <h2 className="text-xl font-semibold mb-2">Earnings by Chip</h2>
      <Bar data={chartData} options={barChartOptions} />
    </div>
  );
}
// ==== END BLOCK: Component Function ====
