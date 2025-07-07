'use client'

import { useEffect, useState } from 'react'
import { createBrowserClient } from '@supabase/ssr'
import Link from 'next/link'

export default function ChipsPage() {
  const [chips, setChips] = useState<any[]>([])
  const [loading, setLoading] = useState(true)
  const [propertyId, setPropertyId] = useState('')
  const [quantity, setQuantity] = useState(0)
  const [assignEmail, setAssignEmail] = useState('')
  const [assignChipId, setAssignChipId] = useState('')

  const supabase = createBrowserClient<any>(
    process.env.NEXT_PUBLIC_SUPABASE_URL!,
    process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY!
  )

  useEffect(() => {
    fetchChips()
  }, [])

  const fetchChips = async () => {
    setLoading(true)
    const { data, error } = await supabase
      .from('chips')
      .select(`
        id,
        serial,
        property_id,
        owner_id,
        created_at,
        assigned_at,
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

  const handleBulkCreate = async () => {
    if (!propertyId || quantity <= 0) return
    const newChips = Array.from({ length: quantity }, (_, i) => ({
      serial: `${propertyId}-${Date.now()}-${i + 1}`,
      property_id: propertyId,
    }))
    const { error } = await supabase.from('chips').insert(newChips)
    if (error) {
      alert('Failed to create chips')
      console.error(error)
    } else {
      alert('Chips created successfully')
      fetchChips()
    }
  }

  const handleAssign = async () => {
    if (!assignChipId || !assignEmail) return
    const { data: user, error: userError } = await supabase
      .from('users_extended')
      .select('id')
      .eq('email', assignEmail)
      .single()

    if (userError || !user) {
      alert('User not found')
      return
    }

    const { error: updateError } = await supabase
      .from('chips')
      .update({ owner_id: user.id, assigned_at: new Date().toISOString() })
      .eq('id', assignChipId)

    if (updateError) {
      alert('Failed to assign chip')
    } else {
      alert('Chip assigned successfully')
      fetchChips()
    }
  }

  return (
    <main className="p-8 text-white bg-gray-900 min-h-screen">
      <h1 className="text-3xl font-bold mb-6">Chip Registry</h1>

      <div className="bg-gray-800 p-4 rounded mb-6">
        <h2 className="text-xl font-semibold mb-2">Bulk Create Chips</h2>
        <input
          type="text"
          placeholder="Property ID"
          value={propertyId}
          onChange={(e) => setPropertyId(e.target.value)}
          className="text-black px-2 py-1 mr-2"
        />
        <input
          type="number"
          placeholder="Quantity"
          value={quantity}
          onChange={(e) => setQuantity(Number(e.target.value))}
          className="text-black px-2 py-1 mr-2"
        />
        <button onClick={handleBulkCreate} className="bg-emerald-600 px-4 py-1 rounded">
          Create Chips
        </button>
      </div>

      <div className="bg-gray-800 p-4 rounded mb-6">
        <h2 className="text-xl font-semibold mb-2">Assign Chip to User</h2>
        <input
          type="text"
          placeholder="Chip ID"
          value={assignChipId}
          onChange={(e) => setAssignChipId(e.target.value)}
          className="text-black px-2 py-1 mr-2"
        />
        <input
          type="email"
          placeholder="User Email"
          value={assignEmail}
          onChange={(e) => setAssignEmail(e.target.value)}
          className="text-black px-2 py-1 mr-2"
        />
        <button onClick={handleAssign} className="bg-blue-600 px-4 py-1 rounded">
          Assign
        </button>
      </div>

      {loading ? (
        <p>Loading...</p>
      ) : (
        <table className="min-w-full table-auto border border-gray-700 text-sm">
          <thead>
            <tr className="bg-gray-800 text-left">
              <th className="px-3 py-2 border">Chip ID</th>
              <th className="px-3 py-2 border">Serial</th>
              <th className="px-3 py-2 border">Property</th>
              <th className="px-3 py-2 border">Created</th>
              <th className="px-3 py-2 border">Assigned</th>
              <th className="px-3 py-2 border">Owner</th>
            </tr>
          </thead>
          <tbody>
            {chips.map((chip) => (
              <tr key={chip.id} className="border-t border-gray-700">
                <td className="px-3 py-1 border">{chip.id}</td>
                <td className="px-3 py-1 border">{chip.serial}</td>
                <td className="px-3 py-1 border">{chip.properties?.title || '—'}</td>
                <td className="px-3 py-1 border">{chip.created_at?.slice(0, 10)}</td>
                <td className="px-3 py-1 border">{chip.assigned_at?.slice(0, 10) || '—'}</td>
                <td className="px-3 py-1 border">
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
