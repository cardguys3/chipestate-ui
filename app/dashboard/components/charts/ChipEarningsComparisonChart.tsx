// /app/dashboard/components/charts/ChipEarningsComparisonChart.tsx

'use client';

import { Bar } from 'react-chartjs-2';
import { formatChipEarningsComparison } from '@/app/dashboard/utils/chartUtils';
import { barChartOptions } from '@/app/dashboard/utils/chartOptions';

interface Props {
  chips: any[];
  earnings: any[];
}

export default function ChipEarningsComparisonChart({ chips, earnings }: Props) {
  const data = formatChipEarningsComparison(chips, earnings);

  return (
    <div className="mb-8">
      <h2 className="text-xl font-semibold mb-2">Chip Earnings Comparison</h2>
      <Bar data={data} options={barChartOptions} />
    </div>
  );
}
