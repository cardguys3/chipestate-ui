
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

  const [bulkAssignPropertyId, setBulkAssignPropertyId] = useState('')
  const [bulkAssignEmail, setBulkAssignEmail] = useState('')
  const [bulkAssignQuantity, setBulkAssignQuantity] = useState(0)

  const [filterPropertyId, setFilterPropertyId] = useState('')
  const [filterOwnerId, setFilterOwnerId] = useState('')
  const [filterCreatedDate, setFilterCreatedDate] = useState('')

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
      .select(\`
        id,
        serial,
        property_id,
        owner_id,
        created_at,
        assigned_at,
        is_active,
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
      \`)
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
      serial: \`\${selectedPropertyId}-\${Date.now()}-\${i + 1}\`,
      property_id: selectedPropertyId,
    }))
    const { error } = await supabase.from('chips').insert(newChips)
    if (error) alert('Failed to create chips')
    else {
      alert('Chips created successfully')
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

  const handleDeleteChip = async (id: string) => {
    const confirm = window.confirm('Delete this chip?')
    if (!confirm) return
    const { error } = await supabase.from('chips').delete().eq('id', id)
    if (!error) fetchChips()
  }

  const handleInactivateChip = async (id: string) => {
    const { error } = await supabase.from('chips').update({ is_active: false }).eq('id', id)
    if (!error) fetchChips()
  }

  const filteredChips = chips.filter(chip =>
    (!filterPropertyId || chip.property_id === filterPropertyId) &&
    (!filterOwnerId || chip.owner_id === filterOwnerId) &&
    (!filterCreatedDate || chip.created_at?.startsWith(filterCreatedDate))
  )

  return (
    <main className="p-8 text-white bg-gray-900 min-h-screen">
      <h1 className="text-3xl font-bold mb-6">Chip Registry</h1>

      {/* Create Chips */}
      <div className="bg-gray-800 p-6 rounded border border-gray-700 mb-6">
        <h2 className="text-xl font-semibold mb-4">Create Chips</h2>
        <div className="flex gap-4 flex-wrap">
          <select
            value={selectedPropertyId}
            onChange={(e) => setSelectedPropertyId(e.target.value)}
            className="bg-gray-900 border rounded px-3 py-2 text-white"
          >
            <option value="">-- Property --</option>
            {properties.map((p) => (
              <option key={p.id} value={p.id}>
                {p.title}
              </option>
            ))}
          </select>
          <input
            type="number"
            value={quantity}
            onChange={(e) => setQuantity(Number(e.target.value))}
            placeholder="Quantity"
            className="bg-gray-900 border rounded px-3 py-2 text-white"
          />
          <button
            onClick={handleBulkCreate}
            className="bg-green-600 px-4 py-2 rounded text-white"
          >
            Create Chips
          </button>
        </div>
      </div>

      {/* Assign Chips */}
      <div className="bg-gray-800 p-6 rounded border border-gray-700 mb-6">
        <h2 className="text-xl font-semibold mb-4">Assign Chips</h2>
        <div className="flex gap-4 flex-wrap">
          <select
            value={bulkAssignPropertyId}
            onChange={(e) => setBulkAssignPropertyId(e.target.value)}
            className="bg-gray-900 border rounded px-3 py-2 text-white"
          >
            <option value="">-- Property --</option>
            {properties.map((p) => (
              <option key={p.id} value={p.id}>
                {p.title}
              </option>
            ))}
          </select>
          <input
            type="number"
            value={bulkAssignQuantity}
            onChange={(e) => setBulkAssignQuantity(Number(e.target.value))}
            placeholder="Quantity"
            className="bg-gray-900 border rounded px-3 py-2 text-white"
          />
          <select
            value={bulkAssignEmail}
            onChange={(e) => setBulkAssignEmail(e.target.value)}
            className="bg-gray-900 border rounded px-3 py-2 text-white"
          >
            <option value="">-- User --</option>
            {users.map((u) => (
              <option key={u.id} value={u.email}>
                {u.email}
              </option>
            ))}
          </select>
          <input
            type="email"
            placeholder="Or enter email"
            value={bulkAssignEmail}
            onChange={(e) => setBulkAssignEmail(e.target.value)}
            className="bg-gray-900 border rounded px-3 py-2 text-white"
          />
          <button
            onClick={handleBulkAssign}
            className="bg-blue-600 px-4 py-2 rounded text-white"
          >
            Assign Chips
          </button>
        </div>
      </div>

      {/* Filters */}
      <div className="bg-gray-800 p-4 rounded border border-gray-700 mb-6 flex gap-4 flex-wrap">
        <select
          value={filterPropertyId}
          onChange={(e) => setFilterPropertyId(e.target.value)}
          className="bg-gray-900 border rounded px-3 py-2 text-white"
        >
          <option value="">-- Filter Property --</option>
          {properties.map((p) => (
            <option key={p.id} value={p.id}>
              {p.title}
            </option>
          ))}
        </select>
        <select
          value={filterOwnerId}
          onChange={(e) => setFilterOwnerId(e.target.value)}
          className="bg-gray-900 border rounded px-3 py-2 text-white"
        >
          <option value="">-- Filter Owner --</option>
          {users.map((u) => (
            <option key={u.id} value={u.id}>
              {u.email}
            </option>
          ))}
        </select>
        <input
          type="date"
          value={filterCreatedDate}
          onChange={(e) => setFilterCreatedDate(e.target.value)}
          className="bg-gray-900 border rounded px-3 py-2 text-white"
        />
      </div>

      {/* Chip Table */}
      {loading ? (
        <p>Loading...</p>
      ) : (
        <table className="min-w-full table-auto border border-gray-700 text-sm">
          <thead>
            <tr className="bg-gray-800 text-left">
              <th className="px-3 py-2 border">Property</th>
              <th className="px-3 py-2 border">Owner</th>
              <th className="px-3 py-2 border">Created</th>
              <th className="px-3 py-2 border">Assigned</th>
              <th className="px-3 py-2 border">Serial</th>
              <th className="px-3 py-2 border">Actions</th>
            </tr>
          </thead>
          <tbody>
            {filteredChips.map((chip) => (
              <tr key={chip.id} className="border-t border-gray-700">
                <td className="px-3 py-1 border">{chip.properties?.title || '—'}</td>
                <td className="px-3 py-1 border">
                  {chip.users_extended
                    ? `${chip.users_extended.first_name || ''} ${chip.users_extended.last_name || ''} (${chip.users_extended.email})`
                    : 'Unassigned'}
                </td>
                <td className="px-3 py-1 border">{chip.created_at?.slice(0, 10)}</td>
                <td className="px-3 py-1 border">{chip.assigned_at?.slice(0, 10) || '—'}</td>
                <td className="px-3 py-1 border">{chip.serial}</td>
                <td className="px-3 py-1 border">
                  <button
                    className="text-red-500 mr-2"
                    onClick={() => handleDeleteChip(chip.id)}
                  >
                    Delete
                  </button>
                  {!chip.is_active && <span className="text-yellow-400">Inactive</span>}
                  {chip.is_active && (
                    <button
                      className="text-yellow-400"
                      onClick={() => handleInactivateChip(chip.id)}
                    >
                      Inactivate
                    </button>
                  )}
                </td>
              </tr>
            ))}
          </tbody>
        </table>
      )}
    </main>
  )
}
