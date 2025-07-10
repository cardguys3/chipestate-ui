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
  Tooltip
} from 'chart.js'

ChartJS.register(CategoryScale, LinearScale, PointElement, LineElement, Tooltip)

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

  const cumulativeData = {
    labels: chipChartData.labels,
    datasets: chipChartData.datasets.map((ds) => {
      let cumulative = 0
      return {
        ...ds,
        data: ds.data.map((v) => (cumulative += v))
      }
    })
  }

  return (
    <main className="min-h-screen bg-[#0e1a2b] text-white p-8">
      <div className="flex flex-col md:flex-row justify-between items-start md:items-center mb-6">
        <h1 className="text-3xl font-bold mb-4 md:mb-0">Welcome, {firstName}!</h1>
        <div className="flex gap-2 items-center">
          <span className="text-lg font-semibold">🔗 Quick Access</span>
          <Link href="/account"><button className="bg-emerald-600 px-3 py-1 rounded-xl">Account</button></Link>
          <Link href="/account/add-funds"><button className="bg-emerald-600 px-3 py-1 rounded-xl">Add Funds</button></Link>
          <Link href="/account/cash-out"><button className="bg-emerald-600 px-3 py-1 rounded-xl">Cash Out</button></Link>
        </div>
      </div>

      <div className="grid grid-cols-1 md:grid-cols-3 gap-4 mb-6">
        <Select
          isMulti
          styles={customSelectStyles}
          options={chips.map(c => ({ value: c.id, label: `Chip ${c.serial || c.id.slice(0, 6)}` }))}
          value={chips.filter(c => selectedChips.includes(c.id)).map(c => ({ value: c.id, label: `Chip ${c.serial || c.id.slice(0, 6)}` }))}
          onChange={(vals) => setSelectedChips(vals.map(v => v.value))}
          placeholder="Chip"
        />
        <Select
          isMulti
          styles={customSelectStyles}
          options={properties.map(p => ({ value: p.id, label: p.title }))}
          value={properties.filter(p => selectedProps.includes(p.id)).map(p => ({ value: p.id, label: p.title }))}
          onChange={(vals) => setSelectedProps(vals.map(v => v.value))}
          placeholder="Property"
        />
        <div className="text-white">
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
      </div>

      <div className="grid grid-cols-1 md:grid-cols-4 gap-4 mb-6">
        <div className="border p-4 rounded-xl">Net Worth: ${netWorth.toFixed(2)}</div>
        <div className="border p-4 rounded-xl">Earnings: ${totalPayout.toFixed(2)}</div>
        <div className="border p-4 rounded-xl">Total Earnings: ${totalEarnings.toFixed(2)}</div>
        <div className="border p-4 rounded-xl">Properties Owned: {selectedProps.length}</div>
      </div>

      <div className="grid grid-cols-1 md:grid-cols-3 gap-6 mb-6">
        <div className="border p-4 rounded-xl">
          <h2 className="text-xl font-semibold mb-2">Chip Earnings</h2>
          <Line data={chipChartData} options={{ plugins: { legend: { display: false } } }} />
        </div>
        <div className="border p-4 rounded-xl">
          <h2 className="text-xl font-semibold mb-2">Property Earnings</h2>
          <Line data={propertyChartData} />
        </div>
        <div className="border p-4 rounded-xl">
          <h2 className="text-xl font-semibold mb-2">Cumulative Growth</h2>
          <Line data={cumulativeData} options={{ plugins: { legend: { display: false } } }} />
        </div>
      </div>
    </main>
  )
}
