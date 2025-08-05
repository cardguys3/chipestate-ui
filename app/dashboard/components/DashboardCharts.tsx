// File: /app/dashboard/components/DashboardCharts.tsx

'use client';

import React from 'react';
import { MonthlyPayout, Property, Chip } from '@/types';
import EarningsByChipChart from './charts/EarningsByChipChart';
import EarningsByPropertyChart from './charts/EarningsByPropertyChart';
import EarningsOverTimeChart from './charts/EarningsOverTimeChart';
import ChipEarningsComparisonChart from './charts/ChipEarningsComparisonChart';
import PropertyComparisonChart from './charts/PropertyComparisonChart';

// ==== BLOCK: DashboardCharts Component ====
interface DashboardChartsProps {
  earningsData: MonthlyPayout[];   // Add this
  properties: Property[];
  chips: Chip[];
  selectedChips: string[];
  selectedProps: string[];
  months: string[];
  monthIndexes: number[];
}


const DashboardCharts: React.FC<DashboardChartsProps> = ({
  earningsData,
  properties,
  chips,
  selectedChips,
  selectedProps,
  months,
  monthIndexes,
}) => {
  return (
    <div className="mb-6">
      <div className="grid grid-cols-1 md:grid-cols-4 gap-4">
        {/* Earnings by Chip */}
        <div className="bg-gray-800 rounded-xl p-4 col-span-2">
          <h3 className="text-lg font-semibold mb-2">Earnings by Chip</h3>
          <EarningsByChipChart
            data={earningsData}
            chips={chips}
            selectedChips={selectedChips}
            months={months}
            monthIndexes={monthIndexes}
          />
        </div>

        {/* Earnings by Property */}
        <div className="bg-gray-800 rounded-xl p-4 col-span-2">
          <h3 className="text-lg font-semibold mb-2">Earnings by Property</h3>
          <EarningsByPropertyChart
            data={earningsData}
            chips={chips}
            properties={properties}
            selectedProps={selectedProps}
            months={months}
            monthIndexes={monthIndexes}
          />
        </div>

        {/* Earnings Over Time */}
        <div className="bg-gray-800 rounded-xl p-4 col-span-4">
          <h3 className="text-lg font-semibold mb-2">Earnings Over Time</h3>
          <EarningsOverTimeChart
            data={earningsData}
            selectedChips={selectedChips}
            selectedProps={selectedProps}
            months={months}
            monthIndexes={monthIndexes}
          />
        </div>

        {/* Chip Earnings Comparison */}
        <div className="bg-gray-800 rounded-xl p-4 col-span-2">
          <h3 className="text-lg font-semibold mb-2">Chip Earnings Comparison</h3>
          <ChipEarningsComparisonChart
            data={earningsData}
            selectedChips={selectedChips}
            months={months}
            monthIndexes={monthIndexes}
          />
        </div>

        {/* Property Earnings Comparison */}
        <div className="bg-gray-800 rounded-xl p-4 col-span-2">
          <h3 className="text-lg font-semibold mb-2">Property Earnings Comparison</h3>
          <PropertyComparisonChart
            data={earningsData}
            properties={properties}
            selectedProps={selectedProps}
            months={months}
            monthIndexes={monthIndexes}
          />
        </div>
      </div>
    </div>
  );
};

export default DashboardCharts;
// ==== BLOCK: DashboardCharts Component ... END ====
