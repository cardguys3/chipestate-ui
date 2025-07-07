'use client'

import { useEffect, useState } from 'react'
import { createBrowserClient } from '@supabase/ssr'

export default function ChipsPage() {
  const [chips, setChips] = useState<any[]>([])
  const [loading, setLoading] = useState(true)
  const [properties, setProperties] = useState<any[]>([])
  const [users, setUsers] = useState<any[]>([])

  const [selectedPropertyId, setSelectedPropertyId] = useState('')
  const [quantity, setQuantity] = useState(0)

  const [assignChipId, setAssignChipId] = useState('')
  const [assignEmail, setAssignEmail] = useState('')

  const [bulkAssignPropertyId, setBulkAssignPropertyId] = useState('')
  const [bulkAssignEmail, setBulkAssignEmail] = useState('')
  const [bulkAssignQuantity, setBulkAssignQuantity] = useState(0)

  const supabase = createBrowserClient<any>(
    process.env.NEXT_PUBLIC_SUPABASE_URL!,
    process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY!
  )

  useEffect(() => {
    fetchChips()
    fetchProperties()
    fetchUsers()
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
    if (error) console.error('Error fetching chips:', error)
    else setChips(data)
    setLoading(false)
  }

  const fetchProperties = async () => {
    const { data, error } = await supabase.from('properties').select('id, title')
    if (!error && data) setProperties(data)
  }

  const fetchUsers = async () => {
    const { data, error } = await supabase.from('users_extended').select('id, email')
    if (!error && data) setUsers(data)
  }

  const handleBulkCreate = async () => {
    if (!selectedPropertyId || quantity <= 0) return
    const newChips = Array.from({ length: quantity }, (_, i) => ({
      serial: `${selectedPropertyId}-${Date.now()}-${i + 1}`,
      property_id: selectedPropertyId,
    }))
    const { error } = await supabase.from('chips').insert(newChips)
    if (error) alert('Failed to create chips')
    else {
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

    if (userError || !user) return alert('User not found')

    const { error } = await supabase
      .from('chips')
      .update({ owner_id: user.id, assigned_at: new Date().toISOString() })
      .eq('id', assignChipId)

    if (error) alert('Failed to assign chip')
    else {
      alert('Chip assigned successfully')
      fetchChips()
    }
  }

  const handleBulkAssign = async () => {
    if (!bulkAssignEmail || !bulkAssignPropertyId || bulkAssignQuantity <= 0) return

    const { data: user, error: userError } = await supabase
      .from('users_extended')
      .select('id')
      .eq('email', bulkAssignEmail)
      .single()

    if (userError || !user) return alert('User not found')

    const { data: availableChips } = await supabase
      .from('chips')
      .select('id')
      .eq('property_id', bulkAssignPropertyId)
      .is('owner_id', null)
      .limit(bulkAssignQuantity)

    if (!availableChips || availableChips.length < bulkAssignQuantity) {
      return alert('Not enough unassigned chips available for that property.')
    }

    const chipIds = availableChips.map((chip) => chip.id)

    const { error } = await supabase
      .from('chips')
      .update({ owner_id: user.id, assigned_at: new Date().toISOString() })
      .in('id', chipIds)

    if (error) alert('Bulk assignment failed')
    else {
      alert('Chips assigned successfully')
      fetchChips()
    }
  }

  return (
    <main className="p-8 text-white bg-gray-900 min-h-screen">
      <h1 className="text-3xl font-bold mb-6">Chip Registry</h1>

      {/* Bulk Create */}
      <div className="bg-gray-800 p-6 rounded border border-gray-700 mb-6">
        <h2 className="text-xl font-semibold mb-4">Bulk Create Chips</h2>
        <div className="flex flex-col md:flex-row gap-4">
          <div className="flex-1">
            <label className="block mb-1 text-white">Select Property</label>
            <select
              value={selectedPropertyId}
              onChange={(e) => setSelectedPropertyId(e.target.value)}
              className="w-full text-black px-3 py-2 rounded border"
            >
              <option value="">-- Choose a Property --</option>
              {properties.map((prop) => (
                <option key={prop.id} value={prop.id}>
                  {prop.title}
                </option>
              ))}
            </select>
          </div>
          <div className="flex-1">
            <label className="block mb-1 text-white">Quantity</label>
            <input
              type="number"
              value={quantity}
              onChange={(e) => setQuantity(Number(e.target.value))}
              className="w-full text-black px-3 py-2 rounded border"
              placeholder="Enter quantity"
            />
          </div>
          <div className="flex items-end">
            <button
              onClick={handleBulkCreate}
              className="bg-emerald-600 text-white px-4 py-2 rounded"
            >
              Create Chips
            </button>
          </div>
        </div>
      </div>

      {/* Assign Individual Chip */}
      <div className="bg-gray-800 p-6 rounded border border-gray-700 mb-6">
        <h2 className="text-xl font-semibold mb-4">Assign Single Chip</h2>
        <div className="flex flex-col md:flex-row gap-4">
          <div className="flex-1">
            <label className="block mb-1 text-white">Chip ID</label>
            <input
              type="text"
              value={assignChipId}
              onChange={(e) => setAssignChipId(e.target.value)}
              className="w-full text-black px-3 py-2 rounded border"
              placeholder="Enter Chip ID"
            />
          </div>
          <div className="flex-1">
            <label className="block mb-1 text-white">User Email</label>
            <select
              value={assignEmail}
              onChange={(e) => setAssignEmail(e.target.value)}
              className="w-full text-black px-3 py-2 rounded border mb-2"
            >
              <option value="">-- Select a User --</option>
              {users.map((u) => (
                <option key={u.id} value={u.email}>
                  {u.email}
                </option>
              ))}
            </select>
            <input
              type="email"
              value={assignEmail}
              onChange={(e) => setAssignEmail(e.target.value)}
              className="w-full text-black px-3 py-2 rounded border"
              placeholder="Or type email manually"
            />
          </div>
          <div className="flex items-end">
            <button
              onClick={handleAssign}
              className="bg-blue-600 text-white px-4 py-2 rounded"
            >
              Assign Chip
            </button>
          </div>
        </div>
      </div>

      {/* Bulk Assign Chips */}
      <div className="bg-gray-800 p-6 rounded border border-gray-700 mb-6">
        <h2 className="text-xl font-semibold mb-4">Bulk Assign Chips</h2>
        <div className="flex flex-col md:flex-row gap-4">
          <div className="flex-1">
            <label className="block mb-1 text-white">Property</label>
            <select
              value={bulkAssignPropertyId}
              onChange={(e) => setBulkAssignPropertyId(e.target.value)}
              className="w-full text-black px-3 py-2 rounded border"
            >
              <option value="">-- Choose Property --</option>
              {properties.map((prop) => (
                <option key={prop.id} value={prop.id}>
                  {prop.title}
                </option>
              ))}
            </select>
          </div>
          <div className="flex-1">
            <label className="block mb-1 text-white">Quantity</label>
            <input
              type="number"
              value={bulkAssignQuantity}
              onChange={(e) => setBulkAssignQuantity(Number(e.target.value))}
              className="w-full text-black px-3 py-2 rounded border"
              placeholder="Number of chips"
            />
          </div>
          <div className="flex-1">
            <label className="block mb-1 text-white">User Email</label>
            <select
              value={bulkAssignEmail}
              onChange={(e) => setBulkAssignEmail(e.target.value)}
              className="w-full text-black px-3 py-2 rounded border mb-2"
            >
              <option value="">-- Select User --</option>
              {users.map((u) => (
                <option key={u.id} value={u.email}>
                  {u.email}
                </option>
              ))}
            </select>
            <input
              type="email"
              value={bulkAssignEmail}
              onChange={(e) => setBulkAssignEmail(e.target.value)}
              className="w-full text-black px-3 py-2 rounded border"
              placeholder="Or type email manually"
            />
          </div>
          <div className="flex items-end">
            <button
              onClick={handleBulkAssign}
              className="bg-purple-600 text-white px-4 py-2 rounded"
            >
              Assign Chips
            </button>
          </div>
        </div>
      </div>

      {/* Chip Table */}
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
