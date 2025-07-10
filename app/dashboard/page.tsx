'use client'

import { useEffect, useState } from 'react'
import { createBrowserClient } from '@supabase/ssr'
import { Line } from 'react-chartjs-2'
import Select from 'react-select'
import Link from 'next/link'
import {
  Chart as ChartJS,
  CategoryScale,
  LinearScale,
  PointElement,
  LineElement,
  Tooltip,
  Legend
} from 'chart.js'

ChartJS.register(CategoryScale, LinearScale, PointElement, LineElement, Tooltip, Legend)

const supabase = createBrowserClient(
  process.env.NEXT_PUBLIC_SUPABASE_URL!,
  process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY!
)

const customSelectStyles = {
  control: (base: any) => ({
    ...base,
    backgroundColor: 'white',
    color: 'black',
    borderColor: '#ccc'
  }),
  singleValue: (provided: any) => ({
    ...provided,
    color: 'black'
  }),
  menu: (base: any) => ({
    ...base,
    backgroundColor: 'white'
  }),
  option: (base: any, state: any) => ({
    ...base,
    backgroundColor: state.isFocused ? '#f0f0f0' : 'white',
    color: 'black'
  })
}

export default function DashboardPage() {
  const [user, setUser] = useState<any>(null)
  const [chips, setChips] = useState<any[]>([])
  const [properties, setProperties] = useState<any[]>([])
  const [recommendations, setRecommendations] = useState<any[]>([])
  const [earnings, setEarnings] = useState<any[]>([])
  const [selectedProps, setSelectedProps] = useState<any[]>([])
  const [selectedChips, setSelectedChips] = useState<any[]>([])
  const [monthRange, setMonthRange] = useState<[string, string]>(['2023-01', '2025-12'])

  useEffect(() => {
    const loadData = async () => {
      const {
        data: { user }
      } = await supabase.auth.getUser()
      setUser(user)

      if (!user) return

      const { data: chipData } = await supabase.from('chips_view').select('*').eq('owner_id', user.id)
      setChips(chipData || [])

      const { data: allProps } = await supabase.from('properties').select('*')
      const ownedPropertyIds = new Set((chipData || []).map((chip) => chip.property_id))
      const ownedProps = (allProps || []).filter((p) => ownedPropertyIds.has(p.id))
      setProperties(ownedProps)

      const recs = (allProps || [])
        .filter((prop) => !ownedPropertyIds.has(prop.id) && prop.is_active && !prop.is_hidden)
        .slice(0, 3)
      setRecommendations(recs)

      const { data: earningsData } = await supabase
        .from('chip_earnings_monthly')
        .select('*')
        .eq('user_id', user.id)
        .order('month', { ascending: true })

      setEarnings(earningsData || [])

      const months = [...new Set((earningsData || []).map((e) => e.month))]
      if (months.length >= 2) setMonthRange([months[0], months[months.length - 1]])
    }

    loadData()
  }, [])

  const getColor = (i: number) => {
    const colors = ['#10B981', '#3B82F6', '#F59E0B', '#EF4444', '#6366F1', '#EC4899', '#14B8A6', '#F97316']
    return colors[i % colors.length]
  }

  const isBetweenMonths = (m: string) => m >= monthRange[0] && m <= monthRange[1]

  const filteredEarnings = earnings.filter((e) => {
    const inProperty = selectedProps.length === 0 || selectedProps.includes(e.property_id)
    const inChip = selectedChips.length === 0 || selectedChips.includes(e.chip_id)
    return inProperty && inChip && isBetweenMonths(e.month)
  })

  const netWorth = chips.reduce((sum, chip) => sum + (chip.current_value || 0), 0)
  const totalPayout = filteredEarnings.reduce((sum, e) => sum + Number(e.total || 0), 0)
  const totalEarnings = earnings.reduce((sum, e) => sum + Number(e.total || 0), 0)
  const uniqueProperties = new Set(chips.map((chip) => chip.property_id)).size

  const months = [...new Set(filteredEarnings.map((e) => e.month))]

  const buildChartData = (items: any[], key: 'chip_id' | 'property_id') => {
    const grouped = items.reduce((acc, item) => {
      const id = item[key]
      if (!acc[id]) acc[id] = []
      acc[id].push(item)
      return acc
    }, {} as Record<string, any[]>)

    return {
      labels: months,
      datasets: Object.entries(grouped).map(([id, data], i) => ({
        label: `${key === 'chip_id' ? 'Chip' : 'Property'} ${id.slice(0, 6)}`,
        data: months.map((m) => {
          const match = data.find((d) => d.month === m)
          return match ? Number(match.total || 0) : 0
        }),
        borderColor: getColor(i),
        backgroundColor: getColor(i),
        fill: false
      }))
    }
  }

  const chipChartData = buildChartData(filteredEarnings, 'chip_id')
  const propertyChartData = buildChartData(filteredEarnings, 'property_id')

  const cumulativeData = {
    labels: months,
    datasets: chipChartData.datasets.map((ds, i) => {
      let cumulative = 0
      return {
        ...ds,
        label: `${ds.label} (cumulative)`,
        data: ds.data.map((v) => (cumulative += v))
      }
    })
  }

  return (
    <main className="min-h-screen bg-[#0e1a2b] text-white p-8">
      <div className="flex flex-col md:flex-row justify-between items-start md:items-center mb-6">
        <h1 className="text-3xl font-bold mb-4 md:mb-0">
          Welcome{user?.user_metadata?.first_name ? `, ${user.user_metadata.first_name}` : ''}!
        </h1>
        <div className="flex gap-2 items-center">
          <span className="text-lg font-semibold">🔗 Quick Access</span>
          <Link href="/account">
            <button className="bg-emerald-600 px-3 py-1 rounded-xl text-white">Account</button>
          </Link>
          <Link href="/account/add-funds">
            <button className="bg-emerald-600 px-3 py-1 rounded-xl text-white">Add Funds</button>
          </Link>
          <Link href="/account/cash-out">
            <button className="bg-emerald-600 px-3 py-1 rounded-xl text-white">Cash Out</button>
          </Link>
        </div>
      </div>

      <section className="mb-10">
        <h2 className="text-xl font-semibold mb-2">📊 Account Overview</h2>
        <div className="grid grid-cols-1 sm:grid-cols-5 gap-4">
          <div className="bg-[#1e2a3c] rounded-xl p-4 border border-gray-600 shadow">Net Worth: ${netWorth.toLocaleString()}</div>
          <div className="bg-[#1e2a3c] rounded-xl p-4 border border-gray-600 shadow">Chips Owned: {chips.length}</div>
          <div className="bg-[#1e2a3c] rounded-xl p-4 border border-gray-600 shadow">Properties Owned: {uniqueProperties}</div>
          <div className="bg-[#1e2a3c] rounded-xl p-4 border border-gray-600 shadow">Total Payouts: ${totalPayout.toFixed(2)}</div>
          <div className="bg-[#1e2a3c] rounded-xl p-4 border border-gray-600 shadow">Total Earnings: ${totalEarnings.toFixed(2)}</div>
        </div>
      </section>

      <section className="mb-10">
        <h2 className="text-lg font-semibold mb-2">Filters</h2>
        <div className="flex flex-col md:flex-row md:items-center gap-4 mb-4">
          <Select
            isMulti
            className="w-full md:w-1/3"
            options={properties.map((p) => ({ label: p.title, value: p.id }))}
            value={selectedProps.map((id) => ({
              value: id,
              label: properties.find((p) => p.id === id)?.title || id.slice(0, 6)
            }))}
            onChange={(opts) => setSelectedProps(opts.map((o) => o.value))}
            placeholder="Filter by property"
            styles={customSelectStyles}
          />
          <Select
            isMulti
            className="w-full md:w-1/3"
            options={chips.map((chip) => ({ label: chip.serial, value: chip.id }))}
            value={selectedChips.map((id) => ({
              value: id,
              label: chips.find((c) => c.id === id)?.serial || id.slice(0, 6)
            }))}
            onChange={(opts) => setSelectedChips(opts.map((o) => o.value))}
            placeholder="Filter by chip"
            styles={customSelectStyles}
          />
        </div>
      </section>

      <section className="mb-10 grid grid-cols-1 md:grid-cols-2 gap-6">
        <div className="bg-[#1e2a3c] p-4 rounded-xl border border-gray-600">
          <h3 className="text-lg font-semibold mb-2">Chip Earnings</h3>
          <Line data={chipChartData} />
        </div>
        <div className="bg-[#1e2a3c] p-4 rounded-xl border border-gray-600">
          <h3 className="text-lg font-semibold mb-2">Property Earnings</h3>
          <Line data={propertyChartData} />
        </div>
      </section>

      <section className="mb-10 bg-[#1e2a3c] p-4 rounded-xl border border-gray-600">
        <h3 className="text-lg font-semibold mb-2">Cumulative Chip Earnings</h3>
        <Line data={cumulativeData} />
      </section>

      <section className="mb-10">
        <h2 className="text-lg font-semibold mb-2">🏡 Recommended Properties</h2>
        <div className="grid grid-cols-1 sm:grid-cols-3 gap-4">
          {recommendations.map((prop) => (
            <div key={prop.id} className="bg-[#1e2a3c] border border-gray-600 rounded-xl p-4 shadow">
              <img src={prop.image_url || '/placeholder.jpg'} className="rounded mb-2 w-full h-32 object-cover" alt="Property" />
              <h3 className="text-lg font-bold mb-1">{prop.title}</h3>
              <p className="text-sm mb-1">{prop.city}, {prop.state}</p>
              <p className="text-sm">Value: ${Number(prop.current_value).toLocaleString()}</p>
            </div>
          ))}
        </div>
      </section>
    </main>
  )
}
