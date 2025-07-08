'use client'
import { useEffect, useState } from 'react'
import { useRouter } from 'next/navigation'
import { createBrowserClient } from '@supabase/ssr'

const supabase = createBrowserClient(
  process.env.NEXT_PUBLIC_SUPABASE_URL!,
  process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY!
)

export default function AdminChipsPage() {
  const router = useRouter()

  const [chips, setChips] = useState<any[]>([])
  const [loading, setLoading] = useState(true)
  const [propertyFilter, setPropertyFilter] = useState('')
  const [userFilter, setUserFilter] = useState('')
  const [dateFilter, setDateFilter] = useState('')

  const [propertyOptions, setPropertyOptions] = useState<any[]>([])
  const [userOptions, setUserOptions] = useState<any[]>([])

  useEffect(() => {
    fetchChips()
    fetchProperties()
    fetchUsers()
  }, [])

  const fetchChips = async () => {
    setLoading(true)
    const { data, error } = await supabase
      .from('chips')
      .select('serial, created_at, assigned_at, user_email, is_active, property_id, properties(title)')
      .order('created_at', { ascending: false })

    if (!error) setChips(data || [])
    setLoading(false)
  }

  const fetchProperties = async () => {
    const { data } = await supabase.from('properties').select('id, title')
    setPropertyOptions(data || [])
  }

  const fetchUsers = async () => {
    const { data } = await supabase.from('users_extended').select('email')
    setUserOptions(data || [])
  }

  const handleCreateChips = async (propertyId: string, quantity: number) => {
    const chipsToInsert = Array.from({ length: quantity }, () => ({
      property_id: propertyId,
      serial: crypto.randomUUID()
    }))
    await supabase.from('chips').insert(chipsToInsert)
    fetchChips()
  }

  const handleAssignChips = async (propertyId: string, userEmail: string) => {
    const { data: chipsToAssign } = await supabase
      .from('chips')
      .select('id')
      .eq('property_id', propertyId)
      .is('user_email', null)
      .limit(1)

    if (chipsToAssign && chipsToAssign.length > 0) {
      await supabase
        .from('chips')
        .update({ user_email: userEmail, assigned_at: new Date() })
        .eq('id', chipsToAssign[0].id)
      fetchChips()
    }
  }

  const handleUpdateChip = async (serial: string, updates: any) => {
    await supabase.from('chips').update(updates).eq('serial', serial)
    fetchChips()
  }

  const filteredChips = chips.filter((chip) =>
    (!propertyFilter || chip.properties?.title === propertyFilter) &&
    (!userFilter || chip.user_email === userFilter) &&
    (!dateFilter || chip.created_at?.startsWith(dateFilter))
  )

  return (
    <main className="min-h-screen bg-[#0B1D33] text-white p-6">
      <h1 className="text-3xl font-bold mb-6">Manage Chips</h1>

      <div className="grid grid-cols-1 md:grid-cols-3 gap-4 mb-6">
        <select
          value={propertyFilter}
          onChange={(e) => setPropertyFilter(e.target.value)}
          className="bg-gray-800 border border-gray-600 p-2 rounded text-white"
        >
          <option value="">Filter by Property</option>
          {propertyOptions.map((p) => (
            <option key={p.id} value={p.title}>{p.title}</option>
          ))}
        </select>

        <select
          value={userFilter}
          onChange={(e) => setUserFilter(e.target.value)}
          className="bg-gray-800 border border-gray-600 p-2 rounded text-white"
        >
          <option value="">Filter by Owner</option>
          {userOptions.map((u) => (
            <option key={u.email} value={u.email}>{u.email}</option>
          ))}
        </select>

        <input
          type="date"
          value={dateFilter}
          onChange={(e) => setDateFilter(e.target.value)}
          className="bg-gray-800 border border-gray-600 p-2 rounded text-white"
        />
      </div>

      <table className="w-full border border-white/10 rounded overflow-hidden text-sm">
        <thead className="bg-gray-700 text-white">
          <tr>
            <th className="p-2 text-left">Property</th>
            <th className="p-2 text-left">Owner</th>
            <th className="p-2 text-left">Created</th>
            <th className="p-2 text-left">Assigned</th>
            <th className="p-2 text-left">Serial</th>
            <th className="p-2 text-left">Actions</th>
          </tr>
        </thead>
        <tbody>
          {filteredChips.map((chip, idx) => (
            <tr key={idx} className="border-t border-gray-800">
              <td className="p-2">{chip.properties?.title || 'Unknown'}</td>
              <td className="p-2">{chip.user_email || '-'}</td>
              <td className="p-2">{chip.created_at?.split('T')[0]}</td>
              <td className="p-2">{chip.assigned_at?.split('T')[0] || '-'}</td>
              <td className="p-2">{chip.serial}</td>
              <td className="p-2 space-x-2">
                <button onClick={() => handleUpdateChip(chip.serial, { is_active: false })} className="text-red-400 hover:underline">Inactivate</button>
                <button onClick={() => handleUpdateChip(chip.serial, { hidden: true })} className="text-yellow-400 hover:underline">Hide</button>
                <button onClick={() => handleUpdateChip(chip.serial, { deleted: true })} className="text-gray-400 hover:underline">Delete</button>
              </td>
            </tr>
          ))}
        </tbody>
      </table>

      <div className="mt-10">
        <h2 className="text-xl font-semibold mb-2">Create Chips</h2>
        <form
          onSubmit={(e) => {
            e.preventDefault()
            const form = e.target as HTMLFormElement
            const propertyId = form.property.value
            const quantity = parseInt(form.quantity.value)
            handleCreateChips(propertyId, quantity)
          }}
          className="bg-white/5 border border-white/10 rounded p-4 mt-2 space-y-4"
        >
          <select name="property" required className="bg-gray-800 text-white w-full p-2 rounded">
            <option value="">Select Property</option>
            {propertyOptions.map((p) => (
              <option key={p.id} value={p.id}>{p.title}</option>
            ))}
          </select>
          <input name="quantity" type="number" min="1" placeholder="Chip Quantity" required className="bg-gray-800 text-white w-full p-2 rounded" />
          <button type="submit" className="bg-emerald-600 hover:bg-emerald-700 px-4 py-2 rounded text-white">
            Create Chips
          </button>
        </form>
      </div>

      <div className="mt-10">
        <h2 className="text-xl font-semibold mb-2">Assign Chips</h2>
        <form
          onSubmit={(e) => {
            e.preventDefault()
            const form = e.target as HTMLFormElement
            const propertyId = form.assign_property.value
            const userEmail = form.user.value
            handleAssignChips(propertyId, userEmail)
          }}
          className="bg-white/5 border border-white/10 rounded p-4 mt-2 space-y-4"
        >
          <select name="assign_property" required className="bg-gray-800 text-white w-full p-2 rounded">
            <option value="">Select Property</option>
            {propertyOptions.map((p) => (
              <option key={p.id} value={p.id}>{p.title}</option>
            ))}
          </select>
          <select name="user" required className="bg-gray-800 text-white w-full p-2 rounded">
            <option value="">Select User</option>
            {userOptions.map((u) => (
              <option key={u.email} value={u.email}>{u.email}</option>
            ))}
          </select>
          <button type="submit" className="bg-emerald-600 hover:bg-emerald-700 px-4 py-2 rounded text-white">
            Assign Chips
          </button>
        </form>
      </div>
    </main>
  )
}
