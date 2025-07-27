// app/dashboard/page.tsx

'use client'

import { useEffect, useState } from 'react'
import { createBrowserClient } from '@supabase/ssr'
import Link from 'next/link'
import Slider from 'rc-slider'
import 'rc-slider/assets/index.css'
import { Bar, Line } from 'react-chartjs-2'
import {
  Chart as ChartJS,
  LineElement,
  BarElement,
  CategoryScale,
  LinearScale,
  PointElement,
  Tooltip,
  Legend,
} from 'chart.js';
import type { ChartOptions } from 'chart.js' // ✅ Needed for type safety

ChartJS.register(LineElement, BarElement, CategoryScale, LinearScale, PointElement, Tooltip, Legend)

const supabase = createBrowserClient(
  process.env.NEXT_PUBLIC_SUPABASE_URL!,
  process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY!
)

// ✅ For line charts with dollar Y-axis
const chartOptionsWithDollarYAxis: ChartOptions<'line'> = {
  scales: {
    y: {
      ticks: {
        callback: function (value) {
          return `$${value}`
        },
        color: 'white',
      },
      grid: {
        color: '#334155',
      },
    },
    x: {
      ticks: {
        color: 'white',
      },
      grid: {
        color: '#334155',
      },
    },
  },
  plugins: {
    legend: {
      labels: {
        color: 'white',
      },
    },
  },
}

// ✅ For bar charts with numeric Y-axis
const chartOptionsWithNumberYAxis: ChartOptions<'bar'> = {
  scales: {
    y: {
      ticks: {
        stepSize: 1,
        color: 'white',
      },
      grid: {
        color: '#334155',
      },
    },
    x: {
      ticks: {
        color: 'white',
      },
      grid: {
        color: '#334155',
      },
    },
  },
  plugins: {
    legend: {
      labels: {
        color: 'white',
      },
    },
  },
}

// ✅ For line charts with numeric Y-axis
const chartOptionsWithLineNumberYAxis: ChartOptions<'line'> = {
  scales: {
    y: {
      ticks: {
        stepSize: 1,
        color: 'white',
      },
      grid: {
        color: '#334155',
      },
    },
    x: {
      ticks: {
        color: 'white',
      },
      grid: {
        color: '#334155',
      },
    },
  },
  plugins: {
    legend: {
      labels: {
        color: 'white',
      },
    },
  },
}

// ✅ NEW: For bar charts with numeric Y-axis — to fix Bar chart type error
const chartOptionsWithBarNumberYAxis: ChartOptions<'bar'> = {
  scales: {
    y: {
      ticks: {
        stepSize: 1,
        color: 'white',
      },
      grid: {
        color: '#334155',
      },
    },
    x: {
      ticks: {
        color: 'white',
      },
      grid: {
        color: '#334155',
      },
    },
  },
  plugins: {
    legend: {
      labels: {
        color: 'white',
      },
    },
  },
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
  const [chipCountData, setChipCountData] = useState<any>(null)
  const [avgEarningsPerChipData, setAvgEarningsPerChipData] = useState<any>(null)
  const [activePropertiesData, setActivePropertiesData] = useState<any>(null)
  const [chipValueHeldData, setChipValueHeldData] = useState<any>(null)
  const [voteCategoryEarningsData, setVoteCategoryEarningsData] = useState<any>(null)

//useEffects Section
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
};

// ✅ Wrap everything in a single return, with conditional rendering
return (
  registrationStatus && registrationStatus !== 'approved' ? (
    <main className="min-h-screen bg-[#0e1a2b] text-white p-8">
      <div className="text-center mt-20">
        <h1 className="text-3xl font-bold mb-4">
          Your registration is still pending approval.
        </h1>
        <p className="text-lg">
          You’ll be notified once your account is reviewed by the ChipEstate team.
        </p>
      </div>
    </main>
  ) : (
    <main className="min-h-screen bg-[#0e1a2b] text-white p-8">
      <div className="flex flex-col md:flex-row justify-between items-start md:items-center mb-6">
        <h1 className="text-3xl font-bold mb-4 md:mb-0">Welcome, {firstName}!</h1>
        <div className="flex flex-wrap gap-2 items-center">
          <span className="text-lg font-semibold">🔗 Quick Links</span>
          {[
            { label: 'Account', href: '/account' },
            { label: 'Trade Chips', href: '/trade' },
            { label: 'Sell Chips', href: '/trade/list' },
            { label: 'Open Votes', href: '/votes/history' }
          ].map(({ label, href }) => (
            <Link key={label} href={href}>
              <button className="relative bg-emerald-600 hover:bg-emerald-500 border border-emerald-500 px-3 py-1 rounded-xl transition-colors duration-200">
                {label}
                {label === 'Open Votes' && (
                  <span
                    className="absolute top-0 right-0 -mt-1 -mr-1 w-2.5 h-2.5 bg-red-500 rounded-full border-2 border-emerald-600"
                    title="You have open votes"
                  />
                )}
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
                How to earn badges →
              </span>
            </Link>
          </div>
        </div>
      )}

	{/* Metrics */}
	<div className="mb-6">
	  <h2 className="text-xl font-semibold mb-2">📊 Performance</h2>
	  
	  {/* Filters */}
	<div className="flex flex-wrap gap-4 mb-4 items-end">
	  {/* ✅ Property Filter with Multi-Select */}
	<div className="flex flex-col">
	  <label className="text-sm text-gray-400">Property</label>
	  <div className="bg-[#1E2A3C] border border-emerald-600 rounded-md p-2 max-h-36 overflow-y-auto text-sm text-white">
		{properties.map((p) => (
		  <label key={p.id} className="flex items-center space-x-2 mb-1">
			<input
			  type="checkbox"
			  checked={selectedProps.includes(p.id)}
			  onChange={(e) => {
				if (e.target.checked) {
				  setSelectedProps([...selectedProps, p.id])
				} else {
				  setSelectedProps(selectedProps.filter((id) => id !== p.id))
				}
			  }}
			/>
			<span>{p.title}</span>
		  </label>
		))}
	  </div>
	</div>


	 {/* ✅ Chip Filter with Multi-Select and Hidden Chip ID */}
	<div className="flex flex-col">
	  <label className="text-sm text-gray-400">Chip</label>
	  <div className="bg-[#1E2A3C] border border-emerald-600 rounded-md p-2 max-h-36 overflow-y-auto text-sm text-white">
		{chips.map((chip) => {
		  const propTitle = properties.find((p) => p.id === chip.property_id)?.title || 'Unknown'
		  const label = `${chip.serial} - ${propTitle}`
		  return (
			<label key={chip.id} className="flex items-center space-x-2 mb-1">
			  <input
				type="checkbox"
				checked={selectedChips.includes(chip.id)}
				onChange={(e) => {
				  if (e.target.checked) {
					setSelectedChips([...selectedChips, chip.id])
				  } else {
					setSelectedChips(selectedChips.filter((id) => id !== chip.id))
				  }
				}}
			  />
			  <span>{label}</span>
			</label>
		  )
		})}
	  </div>
	</div>

	{/* ✅ Date Filter with Multi-Select by Month */}
	<div className="flex flex-col">
	  <label className="text-sm text-gray-400">Date (Month)</label>
	  <div className="bg-[#1E2A3C] border border-emerald-600 rounded-md p-2 max-h-36 overflow-y-auto text-sm text-white">
		{months.map((month, idx) => (
		  <label key={month} className="flex items-center space-x-2 mb-1">
			<input
			  type="checkbox"
			  checked={idx >= monthIndexes[0] && idx <= monthIndexes[1]}
			  onChange={(e) => {
				let start = monthIndexes[0]
				let end = monthIndexes[1]

				if (e.target.checked) {
				  start = Math.min(start, idx)
				  end = Math.max(end, idx)
				} else {
				  if (idx === start && idx === end) return setMonthIndexes([0, months.length - 1])
				  else if (idx === start) start++
				  else if (idx === end) end--
				}
				setMonthIndexes([start, end])
			  }}
			/>
			<span>{month}</span>
		  </label>
		))}
	  </div>
	</div>


	  
	  
	  <div className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-5 gap-4">
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
		<div className="relative group bg-gray-800 rounded-xl p-4">
		  <div className="text-sm text-gray-400">Properties Owned</div>
		  <div className="text-2xl font-bold cursor-pointer">{properties.length}</div>

		  {/* Tooltip / flyout list of property titles */}
		  {properties.length > 0 && (
			<div className="absolute z-10 left-0 top-full mt-2 w-64 bg-[#1E2A3C] border border-emerald-500 text-sm text-white rounded-lg shadow-lg p-3 opacity-0 group-hover:opacity-100 transition-opacity duration-200">
			  <p className="font-semibold text-emerald-400 mb-1">Your Properties:</p>
			  <ul className="list-disc pl-5 space-y-1 max-h-48 overflow-y-auto">
				{properties.slice(0, 10).map((p) => (
				  <li key={p.id} className="text-white">{p.title}</li>
				))}
			  </ul>
			  {properties.length > 10 && (
				<p className="mt-2 text-gray-400 italic">+ {properties.length - 10} more…</p>
			  )}
			</div>
		  )}
		</div>
		<div className="bg-gray-800 rounded-xl p-4">
		  <div className="text-sm text-gray-400">Total Chips</div>
		  <div className="text-2xl font-bold">{chips.length}</div>
		</div>
	  </div>
	</div>


		{/* Charts */}
		<div className="mb-6">
		  <div className="grid grid-cols-1 md:grid-cols-4 gap-4">
			{/* By Chip */}
			<div className="bg-gray-800 rounded-xl p-4 h-[200px]">
			  <h3 className="text-sm font-semibold mb-2">By Chip</h3>
			  {chipChartData?.labels?.length && chipChartData?.datasets?.length ? (
				<Line data={chipChartData} options={{ ...chartOptionsWithDollarYAxis, plugins: { legend: { display: false } } }} />
			  ) : (
				<p className="text-gray-400 text-sm">No data available</p>
			  )}
			</div>

			{/* By Property */}
			<div className="bg-gray-800 rounded-xl p-4 h-[200px]">
			  <h3 className="text-sm font-semibold mb-2">By Property</h3>
			  {propertyChartData?.labels?.length && propertyChartData?.datasets?.length ? (
				<Line data={propertyChartData} options={{ ...chartOptionsWithDollarYAxis, plugins: { legend: { display: false } } }} />
			  ) : (
				<p className="text-gray-400 text-sm">No data available</p>
			  )}
			</div>

			{/* Total Earnings */}
			<div className="bg-gray-800 rounded-xl p-4 h-[200px]">
			  <h3 className="text-sm font-semibold mb-2">Total Earnings</h3>
			  {monthlyEarningsData?.labels?.length && monthlyEarningsData?.datasets?.length ? (
				<Line data={monthlyEarningsData} options={{ ...chartOptionsWithDollarYAxis, plugins: { legend: { display: false } } }} />
			  ) : (
				<p className="text-gray-400 text-sm">No data available</p>
			  )}
			</div>

			{/* Chip Count */}
			<div className="bg-gray-800 rounded-xl p-4 h-[200px]">
			  <h3 className="text-sm font-semibold mb-2">Chip Count</h3>
			  {chipCountData?.labels?.length && chipCountData?.datasets?.length ? (
				<Line data={chipCountData} options={{ ...chartOptionsWithLineNumberYAxis, plugins: { legend: { display: false } } }} />
			  ) : (
				<p className="text-gray-400 text-sm">No data available</p>
			  )}
			</div>

			{/* Avg Earnings per Chip */}
			<div className="bg-gray-800 rounded-xl p-4 h-[200px]">
			  <h3 className="text-sm font-semibold mb-2">Avg Earnings per Chip</h3>
			  {avgEarningsPerChipData?.labels?.length && avgEarningsPerChipData?.datasets?.length ? (
				<Line data={avgEarningsPerChipData} options={{ ...chartOptionsWithDollarYAxis, plugins: { legend: { display: false } } }} />
			  ) : (
				<p className="text-gray-400 text-sm">No data available</p>
			  )}
			</div>

			{/* Active Properties */}
			<div className="bg-gray-800 rounded-xl p-4 h-[200px]">
			  <h3 className="text-sm font-semibold mb-2">Active Properties</h3>
			  {activePropertiesData?.labels?.length && activePropertiesData?.datasets?.length ? (
				<Line data={activePropertiesData} options={{ ...chartOptionsWithLineNumberYAxis, plugins: { legend: { display: false } } }} />
			  ) : (
				<p className="text-gray-400 text-sm">No data available</p>
			  )}
			</div>

			{/* Chip Value Held */}
			<div className="bg-gray-800 rounded-xl p-4 h-[200px]">
			  <h3 className="text-sm font-semibold mb-2">Chip Value Held</h3>
			  {chipValueHeldData?.labels?.length && chipValueHeldData?.datasets?.length ? (
				<Line data={chipValueHeldData} options={{ ...chartOptionsWithDollarYAxis, plugins: { legend: { display: false } } }} />
			  ) : (
				<p className="text-gray-400 text-sm">No data available</p>
			  )}
			</div>

			{/* Votes by Category */}
			<div className="bg-gray-800 rounded-xl p-4 h-[200px]">
			  <h3 className="text-sm font-semibold mb-2">Votes by Category</h3>
			  {voteCategoryEarningsData?.labels?.length && voteCategoryEarningsData?.datasets?.length ? (
				<Bar data={voteCategoryEarningsData} options={{ ...chartOptionsWithBarNumberYAxis, plugins: { legend: { display: false } } }} />
			  ) : (
				<p className="text-gray-400 text-sm">No data available</p>
			  )}
			</div>
		  </div>
		</div>
	</main>
  )
}
