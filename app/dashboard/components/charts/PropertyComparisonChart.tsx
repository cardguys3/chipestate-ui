// /app/dashboard/components/charts/PropertyComparisonChart.tsx

'use client';

import { Bar } from 'react-chartjs-2';
import { formatPropertyComparison } from '@/app/dashboard/utils/chartUtils';
import { barChartOptions } from '@/app/dashboard/utils/chartOptions';

interface Props {
  properties: any[];
  earnings: any[];
}

export default function PropertyComparisonChart({ properties, earnings }: Props) {
  const data = formatPropertyComparison(properties, earnings);

  return (
    <div className="mb-8">
      <h2 className="text-xl font-semibold mb-2">Property Comparison</h2>
      <Bar data={data} options={barChartOptions} />
    </div>
  );
}
