'use client'

import { useEffect, useState } from 'react'
import { createBrowserClient } from '@supabase/ssr'
import { Line } from 'react-chartjs-2'
import Link from 'next/link'
import Slider from 'rc-slider'
import 'rc-slider/assets/index.css'
import {
  Chart as ChartJS,
  CategoryScale,
  LinearScale,
  PointElement,
  LineElement,
  Tooltip,
  ChartOptions
} from 'chart.js'

ChartJS.register(CategoryScale, LinearScale, PointElement, LineElement, Tooltip)

const supabase = createBrowserClient(
  process.env.NEXT_PUBLIC_SUPABASE_URL!,
  process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY!
)

const chartOptionsWithDollarYAxis: ChartOptions<'line'> = {
  scales: {
    y: {
      ticks: {
        callback: function (value) {
          return `$${value}`
        },
        color: 'white'
      },
      grid: {
        color: '#334155'
      }
    },
    x: {
      ticks: {
        color: 'white'
      },
      grid: {
        color: '#334155'
      }
    }
  },
  plugins: {
    legend: {
      labels: {
        color: 'white'
      }
    }
  }
}

export default function DashboardPage() {
  const [user, setUser] = useState<any>(null)
  const [firstName, setFirstName] = useState<string>('User')
  const [chips, setChips] = useState<any[]>([])
  const [properties, setProperties] = useState<any[]>([])
  const [earnings, setEarnings] = useState<any[]>([])
  const [selectedProps, setSelectedProps] = useState<any[]>([])
  const [selectedChips, setSelectedChips] = useState<any[]>([])
  const [months, setMonths] = useState<string[]>([])
  const [monthIndexes, setMonthIndexes] = useState<[number, number]>([0, 0])

  useEffect(() => {
    const loadData = async () => {
      const {
        data: { user }
      } = await supabase.auth.getUser()
      setUser(user)
      if (!user) return

      const { data: userData } = await supabase
        .from('users_extended')
        .select('first_name')
        .eq('id', user.id)
        .single()

      if (userData?.first_name) setFirstName(userData.first_name)

      const { data: chipData } = await supabase.from('chips_view').select('*').eq('owner_id', user.id)
      setChips(chipData || [])

      const propIds = [...new Set((chipData || []).map(chip => chip.property_id))]
      const { data: ownedProps } = await supabase.from('properties').select('*').in('id', propIds)
      setProperties(ownedProps || [])

      const { data: earningsData } = await supabase
        .from('chip_earnings_monthly')
        .select('*')
        .eq('user_id', user.id)
        .order('month', { ascending: true })

      setEarnings(earningsData || [])
      const uniqueMonths = [...new Set((earningsData || []).map((e) => e.month))]
      setMonths(uniqueMonths)
      if (uniqueMonths.length >= 2) setMonthIndexes([0, uniqueMonths.length - 1])

      const chipOptions = [...new Set((chipData || []).map(c => c.id))]
      setSelectedChips(chipOptions)

      const propOptions = [...new Set((chipData || []).map(c => c.property_id))]
      setSelectedProps(propOptions)
    }
    loadData()
  }, [])

  const getColor = (i: number) => {
    const colors = ['#10B981', '#3B82F6', '#F59E0B', '#EF4444', '#6366F1', '#EC4899', '#14B8A6', '#F97316']
    return colors[i % colors.length]
  }

  const filteredEarnings = earnings.filter((e) => {
    const inRange = months.indexOf(e.month) >= monthIndexes[0] && months.indexOf(e.month) <= monthIndexes[1]
    const inProp = selectedProps.length === 0 || selectedProps.includes(e.property_id)
    const inChip = selectedChips.length === 0 || selectedChips.includes(e.chip_id)
    return inRange && inProp && inChip
  })

  const netWorth = filteredEarnings.reduce((sum, e) => sum + Number(e.total || 0), 0)
  const totalPayout = filteredEarnings.reduce((sum, e) => sum + Number(e.total || 0), 0)
  const totalEarnings = earnings.reduce((sum, e) => sum + Number(e.total || 0), 0)

  const buildChartData = (items: any[], key: 'chip_id' | 'property_id') => {
    const grouped = items.reduce((acc, item) => {
      const id = item[key]
      if (!acc[id]) acc[id] = []
      acc[id].push(item)
      return acc
    }, {} as Record<string, any[]>)

    return {
      labels: months.slice(monthIndexes[0], monthIndexes[1] + 1),
      datasets: Object.entries(grouped).map(([id, data], i) => {
        return {
          label: key === 'chip_id'
            ? `Chip ${chips.find(c => c.id === id)?.serial || id.slice(0, 6)}`
            : properties.find(p => p.id === id)?.title || `Property ${id.slice(0, 6)}`,
          data: months.slice(monthIndexes[0], monthIndexes[1] + 1).map((m) => {
            const match = (data as any[]).find((d) => d.month === m)
            return match ? Number(match.total || 0) : 0
          }),
          borderColor: getColor(i),
          backgroundColor: getColor(i),
          fill: false,
          pointRadius: 0,
          pointHoverRadius: 0
        }
      })
    }
  }

  const chipChartData = buildChartData(filteredEarnings, 'chip_id')
  const propertyChartData = buildChartData(filteredEarnings, 'property_id')

  const monthlyEarningsData = {
    labels: months.slice(monthIndexes[0], monthIndexes[1] + 1),
    datasets: [
      {
        label: 'Total Monthly Earnings',
        data: months.slice(monthIndexes[0], monthIndexes[1] + 1).map(month =>
          filteredEarnings
            .filter(e => e.month === month)
            .reduce((sum, e) => sum + Number(e.total || 0), 0)
        ),
        borderColor: '#10B981',
        backgroundColor: '#10B981',
        fill: false,
        pointRadius: 2,
        pointHoverRadius: 4
      }
    ]
  }

  return (
    <main className="min-h-screen bg-[#0e1a2b] text-white p-8">
      <div className="flex flex-col md:flex-row justify-between items-start md:items-center mb-6">
        <h1 className="text-3xl font-bold mb-4 md:mb-0">Welcome, {firstName}!</h1>
        <div className="flex gap-2 items-center">
          <span className="text-lg font-semibold">🔗 Quick Access</span>
          {[
            { label: 'Account', href: '/account' },
            { label: 'Add Funds', href: '/account/add-funds' },
            { label: 'Cash Out', href: '/account/cash-out' }
          ].map(({ label, href }) => (
            <Link key={label} href={href}>
              <button className="bg-gray-700 hover:border-emerald-500 border border-transparent px-3 py-1 rounded-xl transition-colors duration-200">
                {label}
              </button>
            </Link>
          ))}
        </div>
      </div>

      <div className="text-white mb-6">
        <label className="block mb-1">Date Range</label>
        <Slider
          range
          min={0}
          max={months.length - 1}
          value={monthIndexes}
          onChange={(range) => setMonthIndexes(range as [number, number])}
        />
        <div className="flex justify-between text-xs">
          <span>{months[monthIndexes[0]]}</span>
          <span>{months[monthIndexes[1]]}</span>
        </div>
      </div>

      <div className="grid grid-cols-1 md:grid-cols-5 gap-4 mb-6">
  <div className="border p-4 rounded-xl">Net Worth: ${netWorth.toFixed(2)}</div>
  <div className="border p-4 rounded-xl">Earnings: ${totalPayout.toFixed(2)}</div>
  <div className="border p-4 rounded-xl">Total Earnings: ${totalEarnings.toFixed(2)}</div>
  <div className="border p-4 rounded-xl">
    Properties Owned: {
      new Set(filteredEarnings.map(e => e.property_id)).size
    }
  </div>
  <div className="border p-4 rounded-xl">
    Chips Owned: {
      new Set(filteredEarnings.map(e => e.chip_id)).size
    }
  </div>
</div>

      <div className="grid grid-cols-1 md:grid-cols-3 gap-6 mb-6">
        <div className="border p-4 rounded-xl">
          <h2 className="text-xl font-semibold mb-2">Chip Earnings</h2>
          <Line data={chipChartData} options={{ ...chartOptionsWithDollarYAxis, plugins: { legend: { display: false } } }} />
        </div>
        <div className="border p-4 rounded-xl">
          <h2 className="text-xl font-semibold mb-2">Property Earnings</h2>
          <Line data={propertyChartData} options={chartOptionsWithDollarYAxis} />
        </div>
        <div className="border p-4 rounded-xl">
          <h2 className="text-xl font-semibold mb-2">Monthly Earnings</h2>
          <Line data={monthlyEarningsData} options={{ ...chartOptionsWithDollarYAxis, plugins: { legend: { display: false } } }} />
        </div>
      </div>

      <div className="border p-4 rounded-xl mt-8">
        <h2 className="text-xl font-semibold mb-4">🏠 Suggested Properties</h2>
        <p className="text-sm text-gray-300">
          You don’t have any recommendations yet. They’ll appear here once you browse or invest in properties.
        </p>
      </div>
    </main>
  )
}
