// app/admin/chips/page.tsx
'use client'

import { useEffect, useState } from 'react'
import { createBrowserClient } from '@supabase/ssr'
import { Database } from '@/types/supabase'
import Link from 'next/link'

export default function ChipsPage() {
  const [chips, setChips] = useState<any[]>([])
  const [loading, setLoading] = useState(true)

  const supabase = createBrowserClient<Database>()

  useEffect(() => {
    async function fetchChips() {
      setLoading(true)
      const { data, error } = await supabase
        .from('chips')
        .select(`
          id,
          serial_number,
          property_id,
          owner_id,
          properties (
            id,
            title
          ),
          users_extended (
            id,
            email,
            first_name,
            last_name
          )
        `)

      if (error) {
        console.error('Error fetching chips:', error)
      } else {
        setChips(data)
      }

      setLoading(false)
    }

    fetchChips()
  }, [])

  return (
    <main className="p-8 text-white bg-gray-900 min-h-screen">
      <h1 className="text-3xl font-bold mb-6">Chip Registry</h1>
      {loading ? (
        <p>Loading...</p>
      ) : (
        <table className="min-w-full table-auto border border-gray-700">
          <thead>
            <tr className="bg-gray-800 text-left">
              <th className="px-4 py-2 border">Chip ID</th>
              <th className="px-4 py-2 border">Serial Number</th>
              <th className="px-4 py-2 border">Property</th>
              <th className="px-4 py-2 border">Owner</th>
            </tr>
          </thead>
          <tbody>
            {chips.map((chip) => (
              <tr key={chip.id} className="border-t border-gray-700">
                <td className="px-4 py-2 border">{chip.id}</td>
                <td className="px-4 py-2 border">{chip.serial_number}</td>
                <td className="px-4 py-2 border">
                  {chip.properties?.title || '—'}
                </td>
                <td className="px-4 py-2 border">
                  {chip.users_extended
                    ? `${chip.users_extended.first_name} ${chip.users_extended.last_name} (${chip.users_extended.email})`
                    : 'Unassigned'}
                </td>
              </tr>
            ))}
          </tbody>
        </table>
      )}
    </main>
  )
}
