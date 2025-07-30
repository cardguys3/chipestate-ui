// /app/dashboard/components/PerformanceStats.tsx

'use client'

import React from 'react'
import { Card, CardContent } from '@/components/ui/card'

type Chip = {
  properties?: {
    current_value?: number
    chip_count?: number
    title?: string
  }
}

type PerformanceStatsProps = {
  chips: Chip[]
  properties: any[]
  netWorth: number
  totalEarnings: number
  totalPayout: number
}

const PerformanceStats: React.FC<PerformanceStatsProps> = ({
  chips,
  properties,
  netWorth,
  totalEarnings,
  totalPayout
}) => {
  return (
    <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4 mb-8">
      <Card>
        <CardContent className="p-4">
          <div className="text-sm text-gray-400">Net Worth</div>
          <div className="text-xl font-semibold">${netWorth.toFixed(2)}</div>
        </CardContent>
      </Card>
      <Card>
        <CardContent className="p-4">
          <div className="text-sm text-gray-400">Total Payout</div>
          <div className="text-xl font-semibold">${totalPayout.toFixed(2)}</div>
        </CardContent>
      </Card>
      <Card>
        <CardContent className="p-4">
          <div className="text-sm text-gray-400">Earnings</div>
          <div className="text-xl font-semibold">${totalEarnings.toFixed(2)}</div>
        </CardContent>
      </Card>
      <Card>
        <CardContent className="p-4">
          <div className="text-sm text-gray-400">Return (ROI)</div>
          <div className="text-xl font-semibold">
            {(netWorth !== 0
              ? ((totalEarnings / netWorth) * 100).toFixed(1)
              : '0.0') + '%'}
          </div>
        </CardContent>
      </Card>
    </div>
  )
}

export default PerformanceStats
