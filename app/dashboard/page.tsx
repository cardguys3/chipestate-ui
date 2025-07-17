//app/dashboard/page.tsx

'use client'

import { useEffect, useState } from 'react'
import { createClient } from '@/utils/supabase/client'
import { getMonthRange } from '@/lib/dateHelpers'
import Chart from '@/components/dashboard/Chart'
import Slider from 'rc-slider'
import 'rc-slider/assets/index.css'

const supabase = createClient()

export default function DashboardPage() {
  const [earningsData, setEarningsData] = useState<number[]>([])
  const [sliderRange, setSliderRange] = useState<[number, number]>([0, 11])
  const [badges, setBadges] = useState<string[]>([])
  const [metrics, setMetrics] = useState({
    totalEarnings: 0,
    avgMonthly: 0,
    chipsOwned: 0,
    propertiesOwned: 0,
    avgROI: 0,
    avgChipValue: 0,
    projectedAnnual: 0,
    spanMonths: 0,
  })

  useEffect(() => {
    async function fetchData() {
      const { data: earnings } = await supabase
        .from('user_earnings')
        .select('month, amount')
        .order('month')

      const { data: chips } = await supabase
        .from('user_chips')
        .select('property_id, purchase_price, earnings')

      const { data: badgeData } = await supabase
        .from('user_badges')
        .select('badge_id')

      const allMonths = earnings?.map((e) => e.amount) || []
      const total = allMonths.reduce((sum, val) => sum + val, 0)
      const avg = total / allMonths.length || 0
      const chipsOwned = chips?.length || 0
      const propertiesOwned = new Set(chips?.map((c) => c.property_id)).size
      const roi = chips?.reduce((acc, c) => acc + (c.earnings / c.purchase_price), 0) / chipsOwned || 0

      const avgChipValue = chipsOwned ? total / chipsOwned : 0
      const projectedAnnual = avg * 12
      const spanMonths = allMonths.length

      setEarningsData(allMonths)
      setMetrics({
        totalEarnings: total,
        avgMonthly: avg,
        chipsOwned,
        propertiesOwned,
        avgROI: roi,
        avgChipValue,
        projectedAnnual,
        spanMonths,
      })

      setBadges(badgeData?.map((b) => b.badge_id) || [])
    }

    fetchData()
  }, [])

  const badgeList = ['verified', 'early_backer', 'collector', 'diversified', 'consistent_investor']
  const [startLabel, endLabel] = getMonthRange(sliderRange, earningsData.length)

  return (
    <div className="p-6 text-white space-y-8">
      {/* Badge Section */}
      <div>
        <h2 className="text-lg font-semibold mb-3">Your Badges</h2>
        <div className="flex gap-4 flex-wrap">
          {badgeList.map((badge) => {
            const earned = badges.includes(badge)
            return (
              <div
                key={badge}
                className={`w-16 h-16 rounded-full bg-center bg-contain bg-no-repeat ${
                  earned ? '' : 'grayscale opacity-40'
                }`}
                title={badge.replaceAll('_', ' ')}
                style={{
                  backgroundImage: `url(/badges/${badge}.png)`,
                }}
              />
            )
          })}
        </div>
      </div>

      {/* Metrics Row */}
      <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
        <MetricCard label="Total Earnings" value={`$${metrics.totalEarnings.toFixed(2)}`} />
        <MetricCard label="Avg. Monthly" value={`$${metrics.avgMonthly.toFixed(2)}`} />
        <MetricCard label="Chips Owned" value={metrics.chipsOwned} />
        <MetricCard label="Properties" value={metrics.propertiesOwned} />
        <MetricCard label="Avg ROI" value={`${(metrics.avgROI * 100).toFixed(1)}%`} />
        <MetricCard label="Avg Chip Value" value={`$${metrics.avgChipValue.toFixed(2)}`} />
        <MetricCard label="Projected Annual" value={`$${metrics.projectedAnnual.toFixed(2)}`} />
        <MetricCard label="Investment Span" value={`${metrics.spanMonths} months`} />
      </div>

      {/* Charts Row */}
      <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
        <Chart title="Earnings Over Time" data={earningsData} color="#10b981" />
        <Chart title="ROI Over Time" data={earningsData.map((v,
