// /app/dashboard/components/charts/EarningsOverTimeChart.tsx

'use client';

import { Line } from 'react-chartjs-2';
import { formatEarningsOverTime } from '@/app/dashboard/utils/chartUtils';
import { baseChartOptions } from '@/app/dashboard/utils/chartOptions';
import { MonthlyPayout } from '@/types';


// ==== BLOCK: interface Props – EarningsOverTimeChart.tsx ====
interface Props {
  data: MonthlyPayout[];
  selectedChips: string[];
  selectedProps: string[];
  months: string[];
  monthIndexes: number[];
}
// ==== END BLOCK: interface Props – EarningsOverTimeChart.tsx ====
// ==== BLOCK: EarningsOverTimeChart Component ====
// Renders a line chart using formatted earnings data over time
export default function EarningsOverTimeChart({ data }: Props) {
  const formattedData = formatEarningsOverTime(data);


  return (
    <div className="mb-8">
      <h2 className="text-xl font-semibold mb-2">Earnings Over Time</h2>
      <Line data={formattedData} options={baseChartOptions} />
    </div>
  );
}
// ==== END BLOCK: EarningsOverTimeChart Component ====
