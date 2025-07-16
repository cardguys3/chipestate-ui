//app trade page

'use client'

import { useEffect, useState } from 'react'
import { createBrowserClient } from '@supabase/ssr'
import { Database } from '@/types/supabase'
import { format } from 'date-fns'
import Link from 'next/link'

export default function ChipTradePage() {
  const [user, setUser] = useState<any>(null)
  const [chips, setChips] = useState<any[]>([])
  const [listings, setListings] = useState<any[]>([])

  useEffect(() => {
    const loadData = async () => {
      const supabase = createBrowserClient<Database>(
        process.env.NEXT_PUBLIC_SUPABASE_URL!,
        process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY!
      )

      const {
        data: { user }
      } = await supabase.auth.getUser()
      setUser(user)

      if (!user) return

      const { data: chipData } = await supabase
        .from('chips_view')
        .select('*')
        .eq('owner_id', user.id)

      setChips(chipData || [])

      const { data: activeListings } = await supabase
        .from('chip_listings')
        .select('*, chips(serial), users_extended(email)')
        .eq('status', 'open')
        .order('listed_at', { ascending: false })

      setListings(activeListings || [])
    }

    loadData()
  }, [])

  return (
    <main className="min-h-screen bg-[#0e1a2b] text-white p-8">
      <h1 className="text-3xl font-bold mb-6">Chip Trading Platform</h1>

      <section className="mb-12">
        <h2 className="text-xl font-semibold mb-4">📈 Your Chips – List for Sale</h2>
        {chips.length === 0 ? (
          <p>You currently do not own any chips.</p>
        ) : (
          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            {chips.map(chip => (
              <div key={chip.id} className="bg-gray-800 p-4 rounded-xl shadow">
                <p className="font-bold">Chip Serial: {chip.serial}</p>
                <p className="text-sm">Property: {chip.property_title}</p>
                <p className="text-sm text-gray-300">Value: ${chip.current_value}</p>
                <Link
                  href={`/trade/list/${chip.id}`}
                  className="inline-block mt-2 text-emerald-400 hover:underline"
                >
                  List This Chip
                </Link>
              </div>
            ))}
          </div>
        )}
      </section>

      <section>
        <h2 className="text-xl font-semibold mb-4">🛒 Open Listings</h2>
        {listings.length === 0 ? (
          <p>No chips are currently listed for sale.</p>
        ) : (
          <table className="w-full border border-gray-600 rounded-lg">
            <thead className="bg-gray-700 text-left">
              <tr>
                <th className="p-2">Chip Serial</th>
                <th className="p-2">Seller</th>
                <th className="p-2">Price</th>
                <th className="p-2">Listed At</th>
              </tr>
            </thead>
            <tbody>
              {listings.map(listing => (
                <tr key={listing.id} className="border-t border-gray-700 hover:bg-gray-800">
                  <td className="p-2">{listing.chips?.serial}</td>
                  <td className="p-2">{listing.users_extended?.email}</td>
                  <td className="p-2">${listing.asking_price}</td>
                  <td className="p-2">{format(new Date(listing.listed_at), 'PPp')}</td>
                </tr>
              ))}
            </tbody>
          </table>
        )}
      </section>
    </main>
  )
}
