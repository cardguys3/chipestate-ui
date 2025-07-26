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
  const [userBadges, setUserBadges] = useState<any[]>([])
  const [registrationStatus, setRegistrationStatus] = useState<string | null>(null)

  useEffect(() => {
    const loadData = async () => {
      const { data: { user } } = await supabase.auth.getUser()
      setUser(user)
      if (!user) return

      const { data: userData } = await supabase
		  .from('users_extended')
		  .select('first_name, is_approved, is_active, email_verified, email_confirmed_at')
		  .eq('id', user.id)
		  .single()

		if (userData?.first_name) setFirstName(userData.first_name)

		// Check approval logic using full conditions
		const isApproved = userData?.is_approved === true
		const isActive = userData?.is_active === true
		const isEmailVerified = userData?.email_verified === true || !!userData?.email_confirmed_at

		if (!isApproved || !isActive || !isEmailVerified) return


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

      const { data: badges } = await supabase
        .from('user_badges')
        .select('*, badges_catalog(*)')
        .eq('user_id', user.id)

      setUserBadges(badges || [])
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

  if (registrationStatus && registrationStatus !== 'approved') {
    return (
      <main className="min-h-screen bg-[#0e1a2b] text-white p-8">
        <div className="text-center mt-20">
          <h1 className="text-3xl font-bold mb-4">Your registration is still pending approval.</h1>
          <p className="text-lg">You’ll be notified once your account is reviewed by the ChipEstate team.</p>
        </div>
      </main>
    )
  }

  return (
    <main className="min-h-screen bg-[#0e1a2b] text-white p-8">
      <div className="flex flex-col md:flex-row justify-between items-start md:items-center mb-6">
        <h1 className="text-3xl font-bold mb-4 md:mb-0">Welcome, {firstName}!</h1>
        <div className="flex gap-2 items-center">
          <span className="text-lg font-semibold">🔗 Quick Links</span>
          {[{ label: 'Account', href: '/account' }, { label: 'Trade Chips', href: '/trade' }, { label: 'Sell Chips', href: '/trade/list' }].map(({ label, href }) => (
            <Link key={label} href={href}>
              <button className="bg-emerald-600 hover:bg-emerald-500 border border-emerald-500 px-3 py-1 rounded-xl transition-colors duration-200">
                {label}
              </button>
            </Link>
          ))}
        </div>
      </div>

      {/* Badges */}
		{userBadges.length > 0 && (
		  <div className="mb-6 w-full">
			<div className="flex flex-wrap gap-4">
			  {userBadges.map((badge) => (
				<div key={badge.id} className="flex flex-col items-center w-20">
				  <img
					src={badge.badges_catalog?.icon_url}
					alt={badge.badges_catalog?.name}
					title={badge.badges_catalog?.description}
					className="w-16 h-16 rounded-full shadow-md hover:scale-105 transition-transform"
				  />
				  <div className="text-xs text-center mt-1">{badge.badges_catalog?.name}</div>
				</div>
			  ))}
			</div>
			<div className="mt-2">
			  <Link href="/badges">
				<span className="text-emerald-400 hover:underline text-sm">
				  View all available badges and how to earn them →
				</span>
			  </Link>
			</div>
		  </div>
		)}

{/* Open Votes */}
<div className="mb-6">
  <h2 className="text-xl font-semibold mb-2">🗳️ Open Votes</h2>

  {/* This section is always rendered to give users visibility */}
  <div className="bg-gray-800 rounded-xl p-4 border border-gray-700">
    <p className="text-gray-300 text-sm mb-2">
      You currently have no open items to vote on.
    </p>
    <Link href="/votes/history">
      <span className="text-emerald-400 hover:underline text-sm">
        View your voting history →
      </span>
    </Link>
  </div>
</div>

      {/* Metrics */}
      <div className="mb-6">
        <h2 className="text-xl font-semibold mb-2">📊 Personal Metrics</h2>
        <div className="grid grid-cols-1 sm:grid-cols-3 gap-4">
          <div className="bg-gray-800 rounded-xl p-4">
            <div className="text-sm text-gray-400">Net Worth</div>
            <div className="text-2xl font-bold">${netWorth.toFixed(2)}</div>
          </div>
          <div className="bg-gray-800 rounded-xl p-4">
            <div className="text-sm text-gray-400">Chip Earnings (selected)</div>
            <div className="text-2xl font-bold">${totalPayout.toFixed(2)}</div>
          </div>
          <div className="bg-gray-800 rounded-xl p-4">
            <div className="text-sm text-gray-400">All-Time Earnings</div>
            <div className="text-2xl font-bold">${totalEarnings.toFixed(2)}</div>
          </div>
        </div>
      </div>

      {/* Charts */}
      <div className="mb-6">
        <h2 className="text-xl font-semibold mb-2">📈 Earnings Over Time</h2>
        <div className="mb-4">
          <Slider
            range
            min={0}
            max={months.length - 1}
            defaultValue={monthIndexes}
            onChange={(value) => setMonthIndexes(value as [number, number])}
          />
        </div>
        <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
          <div className="bg-gray-800 rounded-xl p-4">
            <h3 className="text-lg font-semibold mb-2">By Chip</h3>
            <Line data={chipChartData} options={chartOptionsWithDollarYAxis} />
          </div>
          <div className="bg-gray-800 rounded-xl p-4">
            <h3 className="text-lg font-semibold mb-2">By Property</h3>
            <Line data={propertyChartData} options={chartOptionsWithDollarYAxis} />
          </div>
          <div className="bg-gray-800 rounded-xl p-4">
            <h3 className="text-lg font-semibold mb-2">Total Earnings</h3>
            <Line data={monthlyEarningsData} options={chartOptionsWithDollarYAxis} />
          </div>
        </div>
      </div>
    </main>
  )
}
