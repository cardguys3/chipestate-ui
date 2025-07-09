'use client'

import { useEffect, useState } from 'react'
import { createBrowserClient } from '@supabase/ssr'
import Link from 'next/link'
import { Line } from 'react-chartjs-2'
import {
  Chart as ChartJS,
  CategoryScale,
  LinearScale,
  PointElement,
  LineElement,
  Tooltip,
  Legend,
} from 'chart.js'

ChartJS.register(CategoryScale, LinearScale, PointElement, LineElement, Tooltip, Legend)

const supabase = createBrowserClient(
  process.env.NEXT_PUBLIC_SUPABASE_URL!,
  process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY!
)

export default function DashboardPage() {
  const [user, setUser] = useState<any>(null)
  const [chips, setChips] = useState<any[]>([])
  const [properties, setProperties] = useState<any[]>([])
  const [recommendations, setRecommendations] = useState<any[]>([])
  const [earnings, setEarnings] = useState<any[]>([])

  useEffect(() => {
    const loadData = async () => {
      const {
        data: { user },
      } = await supabase.auth.getUser()
      setUser(user)

      if (!user) return

      const { data: chipData } = await supabase.from('chips_view').select('*').eq('owner_id', user.id)
      setChips(chipData || [])

      const { data: allProps } = await supabase.from('properties').select('*')
      setProperties(allProps || [])

      const ownedPropertyIds = new Set((chipData || []).map((chip) => chip.property_id))
      const recs = (allProps || [])
        .filter((prop) => !ownedPropertyIds.has(prop.id) && prop.is_active && !prop.is_hidden)
        .slice(0, 3)
      setRecommendations(recs)

      const { data: earningsData } = await supabase
        .from('chip_earnings_view') // Replace with actual table/view
        .select('month, amount')
        .eq('user_id', user.id)
        .order('month', { ascending: true })
      setEarnings(earningsData || [])
    }

    loadData()
  }, [])

  const netWorth = chips.reduce((sum, chip) => sum + (chip.current_value || 0), 0)
  const uniqueProperties = new Set(chips.map((chip) => chip.property_id)).size

  const earningsChart = {
    labels: earnings.map((e) => e.month),
    datasets: [
      {
        label: 'Earnings (Dividends)',
        data: earnings.map((e) => e.amount),
        borderColor: 'rgba(34,197,94,1)',
        backgroundColor: 'rgba(34,197,94,0.2)',
        tension: 0.4,
      },
    ],
  }

  return (
    <main className="min-h-screen bg-[#0e1a2b] text-white p-8">
      <div className="flex justify-between items-center mb-4">
        <h1 className="text-3xl font-bold">
          Welcome{user?.user_metadata?.first_name ? `, ${user.user_metadata.first_name}` : ''}!
        </h1>
        <div className="space-x-4">
          <Link href="/account" className="text-emerald-400 underline">Account</Link>
          <Link href="/profile" className="text-emerald-400 underline">Profile</Link>
        </div>
      </div>

      <section className="mb-10">
        <h2 className="text-xl font-semibold mb-2">📊 Account Overview</h2>
        <div className="grid grid-cols-1 sm:grid-cols-3 gap-4">
          <div className="bg-[#1e2a3c] rounded-xl p-4 shadow">Net Worth: ${netWorth.toLocaleString()}</div>
          <div className="bg-[#1e2a3c] rounded-xl p-4 shadow">Chips Owned: {chips.length}</div>
          <div className="bg-[#1e2a3c] rounded-xl p-4 shadow">Properties Owned: {uniqueProperties}</div>
        </div>
      </section>

      <section className="mb-10">
        <h2 className="text-xl font-semibold mb-2">📈 Personal Performance</h2>
        <div className="bg-[#1e2a3c] p-6 rounded-xl">
          <Line data={earningsChart} />
        </div>
      </section>

      <section className="mb-10">
        <h2 className="text-xl font-semibold mb-2">🏠 Properties You Own</h2>
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
          {chips.map((chip) => {
            const property = properties.find((p) => p.id === chip.property_id)
            return (
              <div key={chip.id} className="bg-[#1e2a3c] rounded-xl p-4 shadow">
                <h3 className="text-lg font-bold mb-1">{property?.title || 'Unknown Property'}</h3>
                <p className="text-sm">Chips: {chip.serial}</p>
                <p className="text-sm">Value: ${chip.current_value?.toLocaleString()}</p>
                <p className="text-sm">Purchased: {new Date(chip.created_at).toLocaleDateString()}</p>
              </div>
            )
          })}
        </div>
      </section>

      <section className="mb-10">
        <h2 className="text-xl font-semibold mb-2">🌟 Recommended Properties</h2>
        <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
          {recommendations.map((p) => (
            <div key={p.id} className="bg-[#1e2a3c] rounded-xl p-4 shadow">
              <h3 className="text-lg font-bold mb-1">{p.title}</h3>
              <p className="text-sm mb-2">{p.city}, {p.state}</p>
              <p className="text-sm mb-4">Value: ${p.current_value?.toLocaleString()}</p>
              <Link className="text-emerald-400 underline" href={`/market/${p.id}`}>
                View Property ↗
              </Link>
            </div>
          ))}
        </div>
      </section>

      <section className="mb-10">
        <h2 className="text-xl font-semibold mb-2">🔗 Quick Access</h2>
        <div className="flex gap-4 flex-wrap">
          <Link href="/account" className="bg-emerald-600 px-4 py-2 rounded-xl text-white hover:bg-emerald-700">
            Account Details
          </Link>
          <Link href="/wallet/add-funds" className="bg-emerald-600 px-4 py-2 rounded-xl text-white hover:bg-emerald-700">
            Add Funds
          </Link>
          <Link href="/wallet/cash-out" className="bg-emerald-600 px-4 py-2 rounded-xl text-white hover:bg-emerald-700">
            Cash Out
          </Link>
        </div>
      </section>
    </main>
  )
}
