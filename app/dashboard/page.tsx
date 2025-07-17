// app/dashboard/page.tsx

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
  const [monthLabels, setMonthLabels] = useState<string[]>([])
  const [sliderRange, setSliderRange] = useState<[number, number]>([0, 11])
  const [badges, setBadges] = useState<string[]>([])
  const [investmentActivity, setInvestmentActivity] = useState<number[]>([])
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
      const {
        data: userResult,
        error: userError,
      } = await supabase.auth.getUser()
      const userId = userResult?.user?.id
      if (!userId) return

      const { data: earningsRaw } = await supabase
        .from('chip_earnings')
        .select('earning_date, amount')
        .eq('user_id', userId)
        .order('earning_date')

      const { data: chips } = await supabase
        .from('chips')
        .select('property_id, current_value, created_at')
        .eq('owner_id', userId)

      const { data: badgeData } = await supabase
        .from('user_badges')
        .select('badge_key')
        .eq('user_id', userId)

      const earningsByMonth = groupEarningsByMonth(earningsRaw || [])
      const months = Object.keys(earningsByMonth)
      const allMonths = Object.values(earningsByMonth)
      const total = allMonths.reduce((sum, val) => sum + val, 0)
      const avg = total / (allMonths.length || 1)

      const chipsOwned = chips?.length ?? 0
      const propertiesOwned = chips ? new Set(chips.map((c) => c.property_id)).size : 0
      const avgChipValue = chipsOwned
        ? chips.reduce((sum, c) => sum + (c.current_value || 0), 0) / chipsOwned
        : 0

      const projectedAnnual = avg * 12
      const spanMonths = allMonths.length

      setEarningsData(allMonths)
      setMonthLabels(months)
      setBadges(badgeData?.map((b) => b.badge_key) || [])
      setMetrics({
        totalEarnings: total,
        avgMonthly: avg,
        chipsOwned,
        propertiesOwned,
        avgROI: 0,
        avgChipValue,
        projectedAnnual,
        spanMonths,
      })

      const investmentByMonth: Record<string, number> = {}
      for (const chip of chips || []) {
        const dateKey = new Date(chip.created_at).toLocaleDateString('en-US', {
          year: '2-digit',
          month: 'short',
        })
        investmentByMonth[dateKey] = (investmentByMonth[dateKey] || 0) + 1
      }
      setInvestmentActivity(months.map((m) => investmentByMonth[m] || 0))
    }

    fetchData()
  }, [])

  function groupEarningsByMonth(raw: { earning_date: string; amount: number }[]) {
    const monthly: Record<string, number> = {}
    for (const row of raw) {
      const key = new Date(row.earning_date).toLocaleDateString('en-US', {
        year: '2-digit',
        month: 'short',
      })
      monthly[key] = (monthly[key] || 0) + Number(row.amount || 0)
    }
    return monthly
  }

  const badgeList = [
    { id: 'registration_complete', label: 'Registered' },
    { id: 'verified', label: 'Verified' },
    { id: 'early_backer', label: 'Early Backer' },
    { id: 'badge_collector_3', label: 'Bronze Collector' },
    { id: 'badge_collector_5', label: 'Silver Collector' },
    { id: 'badge_collector_10', label: 'Gold Collector' },
    { id: 'bulk_buyer_3', label: 'Bronze Bulk' },
    { id: 'bulk_buyer_5', label: 'Silver Bulk' },
    { id: 'bulk_buyer_10', label: 'Gold Bulk' },
    { id: 'diversified', label: 'Diversifyer' },
    { id: 'consistent_investor', label: 'Consistent' },
    { id: 'early_voter', label: 'Early Voter' },
    { id: 'feedback_champion', label: 'Feedback Champ' },
    { id: 'renter_friendly', label: 'Renter Friendly' },
    { id: 'reserve_guardian', label: 'Reserve Guardian' },
    { id: 'estate_planner', label: 'Estate Planner' },
    { id: 'market_mover', label: 'Market Mover' },
    { id: 'voting_citizen', label: 'Voting Citizen' },
    { id: 'alpha_tester', label: 'Alpha Tester' },
  ]

  const [start, end] = sliderRange
  const startLabel = monthLabels[start] || ''
  const endLabel = monthLabels[end] || ''
  const earningsSubset = earningsData.slice(start, end + 1)
  const chipActivitySubset = investmentActivity.slice(start, end + 1)

  const makeChartData = (label: string, values: number[], color: string) => ({
    labels: values.map((_, i) => monthLabels[i + start]),
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
    <div className="p-6 bg-[#050F20] text-white min-h-screen space-y-10">
      {/* Badges */}
      <section>
        <h2 className="text-lg font-semibold mb-4">Your Badges</h2>
        <div className="grid grid-cols-4 sm:grid-cols-9 md:grid-cols-12 lg:grid-cols-18 gap-3">
          {badgeList.map(({ id, label }) => {
            const earned = badges.includes(id)
            return (
              <div key={id} className="flex flex-col items-center text-center">
                <div
                  className={`w-10 h-10 rounded-full bg-center bg-contain bg-no-repeat border ${
                    earned ? '' : 'grayscale opacity-30'
                  }`}
                  title={label}
                  style={{ backgroundImage: `url(/badges/${id}.png)` }}
                />
                <span className="text-[9px] mt-1 text-gray-300">{label}</span>
              </div>
            )
          })}
        </div>
      </section>

      {/* Metrics */}
      <section>
        <div className="grid grid-cols-2 md:grid-cols-4 xl:grid-cols-8 gap-4">
          <MetricCard label="Total Earnings" value={`$${metrics.totalEarnings.toFixed(2)}`} />
          <MetricCard label="Avg. Monthly" value={`$${metrics.avgMonthly.toFixed(2)}`} />
          <MetricCard label="Chips Owned" value={metrics.chipsOwned} />
          <MetricCard label="Properties" value={metrics.propertiesOwned} />
          <MetricCard label="Avg ROI" value={`${(metrics.avgROI * 100).toFixed(1)}%`} />
          <MetricCard label="Avg Chip Value" value={`$${metrics.avgChipValue.toFixed(2)}`} />
          <MetricCard label="Projected Annual" value={`$${metrics.projectedAnnual.toFixed(2)}`} />
          <MetricCard label="Investment Span" value={`${metrics.spanMonths} months`} />
        </div>
      </section>

      {/* First Row Charts */}
      <section className="grid grid-cols-1 md:grid-cols-3 gap-6">
        <ChartCard title="Earnings" data={makeChartData('Earnings', earningsSubset, '#10b981')} />
        <ChartCard
          title="Return on Investment (ROI)"
          data={makeChartData(
            'ROI Change',
            earningsSubset.map((v, i, arr) =>
              i === 0 ? 0 : ((v - arr[i - 1]) / arr[i - 1]) * 100 || 0
            ),
            '#facc15'
          )}
        />
        <ChartCard
          title="Projected Annual Earnings"
          data={makeChartData('Projected Earnings', earningsSubset.map((v) => v * 12), '#3b82f6')}
        />
      </section>

      {/* Second Row Charts */}
      <section className="grid grid-cols-1 md:grid-cols-3 gap-6">
        <ChartCard
          title="Investment Activity"
          data={makeChartData('Chips Purchased', chipActivitySubset, '#e879f9')}
        />
        <ChartCard
          title="Overall Chip Value"
          data={makeChartData(
            'Total Value',
            earningsSubset.map((_, i) => metrics.avgChipValue * (metrics.chipsOwned || 1)),
            '#22d3ee'
          )}
        />
        <ChartCard
          title="Portfolio Growth Projection"
          data={makeChartData(
            'Growth Projection',
            earningsSubset.map((v, i) => (i + 1) * v * 2),
            '#8b5cf6'
          )}
        />
      </section>

      {/* Slider */}
      <section className="pt-6">
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
      </section>
    </div>
  )
}

function MetricCard({ label, value }: { label: string; value: string | number }) {
  return (
    <div className="bg-[#0B1D33] border border-white/10 p-3 rounded shadow">
      <div className="text-[10px] text-gray-400">{label}</div>
      <div className="text-lg font-bold text-white">{value}</div>
    </div>
  )
}

function ChartCard({ title, data }: { title: string; data: any }) {
  return (
    <div className="bg-[#0B1D33] p-4 rounded-lg shadow">
      <Line data={data} />
      <div className="text-xs text-gray-400 mt-2">{title}</div>
    </div>
  )
}
