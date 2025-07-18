// app/dashboard/page.tsx

'use client'

import { useEffect, useState } from 'react'
import { supabase } from '@/lib/supabaseClient'
import { Line } from 'react-chartjs-2'
import Slider from 'rc-slider'
import Link from 'next/link'
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
  const [firstName, setFirstName] = useState<string>('')
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
      } = await supabase.auth.getUser()
      const userId = userResult?.user?.id
      if (!userId) return

      const { data: userInfo } = await supabase
        .from('users_extended')
        .select('first_name')
        .eq('id', userId)
        .single()
      setFirstName(userInfo?.first_name || '')

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
      const avgChipValue = chips && chipsOwned
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

  const badgeList = [...]
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
      <section>
        <h1 className="text-2xl font-bold mb-4">Welcome, {firstName} 👋</h1>
        <div className="grid grid-cols-2 md:grid-cols-4 gap-4 mb-6">
          <Link href="/market" className="bg-emerald-600 hover:bg-emerald-700 text-white p-4 rounded-lg shadow text-center font-semibold">Buy Chips</Link>
          <Link href="/dashboard/holdings" className="bg-blue-600 hover:bg-blue-700 text-white p-4 rounded-lg shadow text-center font-semibold">Sell Chips</Link>
          <Link href="/dashboard/account" className="bg-gray-600 hover:bg-gray-700 text-white p-4 rounded-lg shadow text-center font-semibold">Account</Link>
          <Link href="/voting" className="bg-yellow-500 hover:bg-yellow-600 text-white p-4 rounded-lg shadow text-center font-semibold">Voting</Link>
        </div>
      </section>

      {/* ... badges, metrics, charts, slider sections ... */}
    </div>
  )
}
