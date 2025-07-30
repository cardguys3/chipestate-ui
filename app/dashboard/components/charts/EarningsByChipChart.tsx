// /app/dashboard/components/charts/EarningsByChipChart.tsx

'use client';

import { Line } from 'react-chartjs-2';
import { formatEarningsByChip } from '@/app/dashboard/utils/chartUtils';
import { lineChartOptions } from '@/app/dashboard/utils/chartOptions';

interface Props {
  earnings: any[];
  chips: any[];
}

export default function EarningsByChipChart({ earnings, chips }: Props) {
  const data = formatEarningsByChip(earnings, chips);

  return (
    <div className="mb-8">
      <h2 className="text-xl font-semibold mb-2">Earnings by Chip</h2>
      <Line data={data} options={lineChartOptions} />
    </div>
  );
}
