// /app/dashboard/components/PerformanceStats.tsx

'use client';

import { useMemo } from 'react';
import { Card, CardContent } from './internal/Card';

type Property = {
  id: string;
  title: string;
  current_value: number;
};

type Chip = {
  id: string;
  property_id: string;
};

type ChipEarning = {
  id: string;
  property_id: string;
  amount: number;
};

interface Props {
  properties: Property[];
  chips: Chip[];
  earnings: ChipEarning[];
}

export default function PerformanceStats({ properties, chips, earnings }: Props) {
  const stats = useMemo(() => {
    const totalChips = chips.length;

    const totalEarnings = earnings.reduce((acc, e) => acc + (e.amount || 0), 0);

    const propertyValueMap: Record<string, number> = {};
    properties.forEach((p) => {
      propertyValueMap[p.id] = p.current_value || 0;
    });

    const totalValue = chips.reduce((acc, chip) => {
      const propValue = propertyValueMap[chip.property_id] || 0;
      return acc + propValue;
    }, 0);

    const averageValue = totalChips > 0 ? totalValue / totalChips : 0;

    return {
      totalChips,
      totalEarnings,
      totalValue,
      averageValue,
    };
  }, [properties, chips, earnings]);

  return (
    <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4 mb-8">
      <Card>
        <CardContent>
          <p className="text-sm text-gray-400">Chips Owned</p>
          <p className="text-2xl font-semibold">{stats.totalChips}</p>
        </CardContent>
      </Card>

      <Card>
        <CardContent>
          <p className="text-sm text-gray-400">Total Earnings</p>
          <p className="text-2xl font-semibold">${stats.totalEarnings.toFixed(2)}</p>
        </CardContent>
      </Card>

      <Card>
        <CardContent>
          <p className="text-sm text-gray-400">Total Property Value</p>
          <p className="text-2xl font-semibold">${stats.totalValue.toLocaleString()}</p>
        </CardContent>
      </Card>

      <Card>
        <CardContent>
          <p className="text-sm text-gray-400">Avg Value per Chip</p>
          <p className="text-2xl font-semibold">${stats.averageValue.toFixed(2)}</p>
        </CardContent>
      </Card>
    </div>
  );
}
