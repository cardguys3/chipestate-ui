// FULL UPDATED DASHBOARD PAGE WITH GRAPHS, FILTERS, METRICS, SLIDER, PERSONALIZATION
'use client'

import { useEffect, useState } from 'react'
import { createBrowserClient } from '@supabase/ssr'
import { Line } from 'react-chartjs-2'
import Select from 'react-select'
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
    backgroundColor: '#1e2a3c',
    color: 'white',
    borderColor: '#ccc'
  }),
  singleValue: (provided: any) => ({
    ...provided,
    color: 'white'
  }),
  menu: (base: any) => ({
    ...base,
    backgroundColor: '#1e2a3c'
  }),
  option: (base: any, state: any) => ({
    ...base,
    backgroundColor: state.isFocused ? '#2d3a50' : '#1e2a3c',
    color: 'white'
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
  const [months, setMonths] = useState<string[]>([])
  const [monthIndexes, setMonthIndexes] = useState<[number, number]>([0, 0])

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
      const uniqueMonths = [...new Set((earningsData || []).map((e) => e.month))]
      setMonths(uniqueMonths)
      if (uniqueMonths.length >= 2) setMonthIndexes([0, uniqueMonths.length - 1])
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

  const netWorth = chips.reduce((sum, chip) => sum + (chip.current_value || 0), 0)
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
            ? `Chip ${id.slice(0, 6)}`
            : properties.find(p => p.id === id)?.title || `Property ${id.slice(0, 6)}`,
          data: months.slice(monthIndexes[0], monthIndexes[1] + 1).map((m) => {
            const match = data.find((d) => d.month === m)
            return match ? Number(match.total || 0) : 0
          }),
          borderColor: getColor(i),
          backgroundColor: getColor(i),
          fill: false
        }
      })
    }
  }

  const chipChartData = buildChartData(filteredEarnings, 'chip_id')
  const propertyChartData = buildChartData(filteredEarnings, 'property_id')

  const cumulativeData = {
    labels: chipChartData.labels,
    datasets: chipChartData.datasets.map((ds) => {
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
        <h1 className="text-3xl font-bold mb-4 md:mb-0">Welcome, {user?.user_metadata?.first_name || 'User'}!</h1>
        <div className="flex gap-2 items-center">
          <span className="text-lg font-semibold">🔗 Quick Access</span>
          <Link href="/account"><button className="bg-emerald-600 px-3 py-1 rounded-xl">Account</button></Link>
          <Link href="/account/add-funds"><button className="bg-emerald-600 px-3 py-1 rounded-xl">Add Funds</button></Link>
          <Link href="/account/cash-out"><button className="bg-emerald-600 px-3 py-1 rounded-xl">Cash Out</button></Link>
        </div>
      </div>

      <section className="mb-10">
        <h2 className="text-xl font-semibold mb-2">📊 Overview</h2>
        <div className="grid grid-cols-1 sm:grid-cols-5 gap-4">
          <div className="bg-[#1e2a3c] rounded-xl p-4 border border-gray-600 shadow">Net Worth: ${netWorth.toLocaleString()}</div>
          <div className="bg-[#1e2a3c] rounded-xl p-4 border border-gray-600 shadow">Chips Owned: {filteredEarnings.reduce((acc, e) => acc.add(e.chip_id), new Set()).size}</div>
          <div className="bg-[#1e2a3c] rounded-xl p-4 border border-gray-600 shadow">Properties Owned: {filteredEarnings.reduce((acc, e) => acc.add(e.property_id), new Set()).size}</div>
          <div className="bg-[#1e2a3c] rounded-xl p-4 border border-gray-600 shadow">Earnings: ${totalPayout.toFixed(2)}</div>
          <div className="bg-[#1e2a3c] rounded-xl p-4 border border-gray-600 shadow">Lifetime Earnings: ${totalEarnings.toFixed(2)}</div>
        </div>
      </section>

      <section className="mb-10">
        <h2 className="text-lg font-semibold mb-2">Filters</h2>
        <div className="flex flex-col md:flex-row md:items-center gap-4 mb-4">
          <Select isMulti className="w-full md:w-1/3" options={properties.map((p) => ({ label: p.title, value: p.id }))} value={selectedProps.map((id) => ({ value: id, label: properties.find((p) => p.id === id)?.title || id.slice(0, 6) }))} onChange={(opts) => setSelectedProps(opts.map((o) => o.value))} placeholder="Property" styles={customSelectStyles} />
          <Select isMulti className="w-full md:w-1/3" options={chips.map((chip) => ({ label: chip.serial, value: chip.id }))} value={selectedChips.map((id) => ({ value: id, label: chips.find((c) => c.id === id)?.serial || id.slice(0, 6) }))} onChange={(opts) => setSelectedChips(opts.map((o) => o.value))} placeholder="Chip" styles={customSelectStyles} />
        </div>
        {months.length > 1 && (
          <div className="mt-2 text-white">
            <label className="block mb-1">Date Range</label>
            <Slider range min={0} max={months.length - 1} value={monthIndexes} onChange={(val) => setMonthIndexes(val as [number, number])} />
            <div className="flex justify-between text-sm mt-1">
              <span>{months[monthIndexes[0]]}</span>
              <span>{months[monthIndexes[1]]}</span>
            </div>
          </div>
        )}
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
