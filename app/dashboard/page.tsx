// /app/dashboard/page.tsx

'use client'

import { useEffect, useState } from 'react'
import { supabase } from '@/lib/supabaseClient'
import { Line } from 'react-chartjs-2'
import Slider from 'rc-slider'
import 'rc-slider/assets/index.css'
import {
  Chart as ChartJS,
  LineElement,
  PointElement,
  CategoryScale,
  LinearScale,
  Tooltip,
  Legend,
} from 'chart.js'

ChartJS.register(LineElement, PointElement, CategoryScale, LinearScale, Tooltip, Legend)

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

  const getMonthLabel = (i: number) => {
    const now = new Date()
    now.setMonth(now.getMonth() - (earningsData.length - 1 - i))
    return now.toLocaleString('default', { month: 'short', year: '2-digit' })
  }

  const [start, end] = sliderRange
  const startLabel = getMonthLabel(start)
  const endLabel = getMonthLabel(end)

  const earningsSubset = earningsData.slice(start, end + 1)

  const makeChartData = (label: string, values: number[], color: string) => ({
    labels: values.map((_, i) => getMonthLabel(i + start)),
    datasets: [
      {
        label,
        data: values,
        fill: false,
        borderColor: color,
        tension: 0.3,
      },
    ],
  })

  return (
    <div className="p-6 text-white space-y-8">
      {/* Badges */}
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
                style={{ backgroundImage: `url(/badges/${badge}.png)` }}
              />
            )
          })}
        </div>
      </div>

      {/* Metrics */}
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

      {/* Charts */}
      <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
        <Line data={makeChartData('Earnings', earningsSubset, '#10b981')} />
        <Line
          data={makeChartData(
            'ROI Change',
            earningsSubset.map((v, i, arr) =>
              i === 0 ? 0 : ((v - arr[i - 1]) / arr[i - 1]) * 100 || 0
            ),
            '#facc15'
          )}
        />
        <Line data={makeChartData('Projected Earnings', earningsSubset.map(v => v * 12), '#3b82f6')} />
      </div>

      {/* Slider */}
      <div className="pt-6">
        <h3 className="font-semibold mb-2">Earnings Range</h3>
        <div className="flex items-center gap-4">
          <span className="text-sm text-gray-300 w-20 text-right">{startLabel}</span>
          <Slider
            range
            min={0}
            max={earningsData.length - 1}
            value={sliderRange}
            onChange={(val) => setSliderRange(val as [number, number])}
            className="flex-grow max-w-2xl"
            trackStyle={[{ backgroundColor: '#10b981' }]}
            handleStyle={[{ borderColor: '#10b981' }, { borderColor: '#10b981' }]}
          />
          <span className="text-sm text-gray-300 w-20">{endLabel}</span>
        </div>
      </div>
    </div>
  )
}

function MetricCard({ label, value }: { label: string; value: string | number }) {
  return (
    <div className="bg-[#0B1D33] border border-white/10 p-4 rounded shadow">
      <div className="text-sm text-gray-400">{label}</div>
      <div className="text-xl font-bold text-white">{value}</div>
    </div>
  )
}
