// /app/dashboard/components/charts/PropertyComparisonChart.tsx

'use client';

import { Bar } from 'react-chartjs-2';
import { barChartOptions } from '@/app/dashboard/utils/chartOptions';
import type { MonthlyPayout, Property } from '@/types';

// ==== BLOCK: interface Props – PropertyComparisonChart.tsx ====
interface Props {
  data: MonthlyPayout[];
  selectedProps: string[];
  months: string[];
  monthIndexes: number[];
  properties: Property[];
}
// ==== END BLOCK: interface Props – PropertyComparisonChart.tsx ====

// ==== BLOCK: formatPropertyComparison ====
function formatPropertyComparison(
  properties: { id: string; title: string }[],
  earnings: { property_id: string; amount: number }[]
) {
  const totals: Record<string, number> = {};

  for (const entry of earnings) {
    totals[entry.property_id] = (totals[entry.property_id] || 0) + entry.amount;
  }

  const labels = properties.map((p) => p.title);
  const data = properties.map((p) => totals[p.id] || 0);

  return {
    labels,
    datasets: [
      {
        label: 'Earnings',
        data,
        backgroundColor: 'rgba(59, 130, 246, 0.7)',
        borderColor: 'rgba(59, 130, 246, 1)',
        borderWidth: 2,
      },
    ],
  };
}
// ==== END BLOCK: formatPropertyComparison ====

// ==== BLOCK: PropertyComparisonChart Component ====
export default function PropertyComparisonChart({
  data,
  selectedProps,
  monthIndexes,
  months,
  properties,
}: Props) {
  const selectedProperties = properties.filter((p) =>
    selectedProps.includes(p.id)
  );

  const earnings = data
    .filter((entry) => entry.property_id && selectedProps.includes(entry.property_id))
    .map((entry) => ({
      property_id: entry.property_id as string,
      amount: entry.amount,
    }));

  const chartData = formatPropertyComparison(selectedProperties, earnings);

  return (
    <div className="mb-8">
      <Bar data={chartData} options={barChartOptions} />
    </div>
  );
}
// ==== END BLOCK: PropertyComparisonChart Component ====
