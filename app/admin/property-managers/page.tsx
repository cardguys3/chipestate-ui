'use client'

import { useState, useEffect } from 'react'
import { useRouter } from 'next/navigation'
import { supabase } from '@/lib/supabaseClient'
import Link from 'next/link'
import { v4 as uuidv4 } from 'uuid'

export default function PropertyManagersPage() {
  const router = useRouter()
  const [managers, setManagers] = useState<any[]>([])
  const [filters, setFilters] = useState({ name: '', city: '', state: '', activeOnly: true })
  const [newManager, setNewManager] = useState({
    name: '',
    contact_name: '',
    phone: '',
    email: '',
    city: '',
    state: ''
  })

  const fetchManagers = async () => {
    const { data, error } = await supabase.from('property_managers').select('*')
    if (!error && data) setManagers(data)
  }

  useEffect(() => {
    fetchManagers()
  }, [])

  const handleAdd = async () => {
    const newId = uuidv4()
    const { error } = await supabase.from('property_managers').insert({ id: newId, ...newManager })
    if (!error) {
      setNewManager({ name: '', contact_name: '', phone: '', email: '', city: '', state: '' })
      fetchManagers()
    }
  }

  const handleToggleActive = async (id: string, isActive: boolean) => {
    const { error } = await supabase
      .from('property_managers')
      .update({ is_active: !isActive })
      .eq('id', id)
    if (!error) fetchManagers()
  }

  const filtered = managers.filter((m) => {
    return (
      (!filters.name || m.name.toLowerCase().includes(filters.name.toLowerCase())) &&
      (!filters.city || m.city?.toLowerCase().includes(filters.city.toLowerCase())) &&
      (!filters.state || m.state?.toLowerCase().includes(filters.state.toLowerCase())) &&
      (!filters.activeOnly || m.is_active)
    )
  })

  return (
    <main className="min-h-screen bg-[#0B1D33] text-white px-6 py-10">
      <div className="max-w-6xl mx-auto">
        <h1 className="text-2xl font-bold mb-6">Manage Property Managers</h1>

        <div className="border border-white/20 rounded-lg p-6 space-y-4 mb-10">
          <h2 className="text-lg font-semibold">Add New Property Manager</h2>
          <div className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-3 gap-4">
            {Object.entries(newManager).map(([key, value]) => (
              <input
                key={key}
                type="text"
                placeholder={key.replace('_', ' ')}
                className="p-2 rounded bg-white/10 text-white border border-white/20"
                value={value}
                onChange={(e) => setNewManager({ ...newManager, [key]: e.target.value })}
              />
            ))}
          </div>
          <button onClick={handleAdd} className="mt-4 px-4 py-2 bg-emerald-500 rounded hover:bg-emerald-600">
            Add Manager
          </button>
        </div>

        <div className="border border-white/20 rounded-lg p-6 space-y-4 mb-10">
          <h2 className="text-lg font-semibold">Filters</h2>
          <div className="grid grid-cols-1 sm:grid-cols-4 gap-4">
            <input
              type="text"
              placeholder="Filter by Name"
              className="p-2 rounded bg-white/10 text-white border border-white/20"
              value={filters.name}
              onChange={(e) => setFilters({ ...filters, name: e.target.value })}
            />
            <input
              type="text"
              placeholder="Filter by City"
              className="p-2 rounded bg-white/10 text-white border border-white/20"
              value={filters.city}
              onChange={(e) => setFilters({ ...filters, city: e.target.value })}
            />
            <input
              type="text"
              placeholder="Filter by State"
              className="p-2 rounded bg-white/10 text-white border border-white/20"
              value={filters.state}
              onChange={(e) => setFilters({ ...filters, state: e.target.value })}
            />
            <label className="flex items-center space-x-2">
              <input
                type="checkbox"
                checked={filters.activeOnly}
                onChange={(e) => setFilters({ ...filters, activeOnly: e.target.checked })}
              />
              <span>Active Only</span>
            </label>
          </div>
        </div>

        <div className="border border-white/20 rounded-lg overflow-hidden">
          <table className="w-full text-sm">
            <thead className="bg-white/10">
              <tr>
                <th className="text-left px-4 py-2">Name</th>
                <th className="text-left px-4 py-2">Contact</th>
                <th className="text-left px-4 py-2">Phone</th>
                <th className="text-left px-4 py-2">Email</th>
                <th className="text-left px-4 py-2">City</th>
                <th className="text-left px-4 py-2">State</th>
                <th className="text-left px-4 py-2">Status</th>
                <th className="text-left px-4 py-2">Actions</th>
              </tr>
            </thead>
            <tbody>
              {filtered.map((m) => (
                <tr key={m.id} className="border-t border-white/10 hover:bg-white/5">
                  <td className="px-4 py-2">
                    <Link href={`/admin/property-managers/${m.id}/details`} className="text-blue-400 hover:underline">
                      {m.name}
                    </Link>
                  </td>
                  <td className="px-4 py-2">{m.contact_name}</td>
                  <td className="px-4 py-2">{m.phone}</td>
                  <td className="px-4 py-2">{m.email}</td>
                  <td className="px-4 py-2">{m.city}</td>
                  <td className="px-4 py-2">{m.state}</td>
                  <td className="px-4 py-2">{m.is_active ? 'Active' : 'Inactive'}</td>
                  <td className="px-4 py-2 space-x-2">
                    <Link
                      href={`/admin/property-managers/${m.id}/edit`}
                      className="text-emerald-400 hover:underline"
                    >
                      Edit
                    </Link>
                    <button
                      onClick={() => handleToggleActive(m.id, m.is_active)}
                      className="text-red-400 hover:underline"
                    >
                      {m.is_active ? 'Inactivate' : 'Activate'}
                    </button>
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      </div>
    </main>
  )
}
