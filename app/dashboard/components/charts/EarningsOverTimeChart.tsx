// /app/dashboard/components/charts/EarningsOverTimeChart.tsx

'use client';

import { Line } from 'react-chartjs-2';
import { formatEarningsOverTime } from '@/app/dashboard/utils/chartUtils';
import { lineChartOptions } from '@/app/dashboard/utils/chartOptions';

interface Props {
  earnings: any[];
}

export default function EarningsOverTimeChart({ earnings }: Props) {
  const data = formatEarningsOverTime(earnings);

  return (
    <div className="mb-8">
      <h2 className="text-xl font-semibold mb-2">Earnings Over Time</h2>
      <Line data={data} options={lineChartOptions} />
    </div>
  );
}
