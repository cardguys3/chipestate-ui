// /app/dashboard/components/charts/EarningsByPropertyChart.tsx

'use client';

import { Bar } from 'react-chartjs-2';
import { formatEarningsByProperty } from '@/app/dashboard/utils/chartUtils';
import { barChartOptions } from '@/app/dashboard/utils/chartOptions';

interface Props {
  earnings: any[];
  properties: any[];
}

export default function EarningsByPropertyChart({ earnings, properties }: Props) {
  const data = formatEarningsByProperty(earnings, properties);

  return (
    <div className="mb-8">
      <h2 className="text-xl font-semibold mb-2">Earnings by Property</h2>
      <Bar data={data} options={barChartOptions} />
    </div>
  );
}
