'use client'

import { useState, useEffect } from 'react'
import { supabase } from '@/lib/supabaseClient'
import { useRouter } from 'next/navigation'
import Link from 'next/link'

export default function PropertyManagersPage() {
  const router = useRouter()
  const [managers, setManagers] = useState<any[]>([])
  const [loading, setLoading] = useState(true)
  const [filter, setFilter] = useState('')
  const [form, setForm] = useState({
    name: '',
    contact_name: '',
    phone: '',
    email: '',
    city: '',
    state: '',
    is_active: true,
  })

  useEffect(() => {
    const fetchManagers = async () => {
      const { data, error } = await supabase.from('property_managers').select('*').order('name')
      if (!error && data) setManagers(data)
      setLoading(false)
    }
    fetchManagers()
  }, [])

  const handleChange = (e: any) => {
    const { name, value, type, checked } = e.target
    setForm((prev) => ({ ...prev, [name]: type === 'checkbox' ? checked : value }))
  }

  const handleSubmit = async () => {
    const { error } = await supabase.from('property_managers').insert({ ...form })
    if (!error) {
      router.refresh()
      setForm({ name: '', contact_name: '', phone: '', email: '', city: '', state: '', is_active: true })
    } else {
      console.error('Insert failed:', error.message)
    }
  }

  const toggleActiveStatus = async (id: string, currentStatus: boolean) => {
    const { data: props } = await supabase.from('properties').select('title').eq('property_manager_id', id)
    if (!currentStatus && props && props.length > 0) {
      alert(`Error: Cannot inactivate manager. Still assigned to properties:\n\n${props.map(p => '- ' + p.title).join('\n')}`)
      return
    }
    const { error } = await supabase.from('property_managers').update({ is_active: !currentStatus }).eq('id', id)
    if (!error) {
      alert('Success: This property manager was ' + (currentStatus ? 'inactivated' : 'activated'))
      router.refresh()
    } else {
      alert('Error updating status.')
    }
  }

  const filteredManagers = managers.filter((m) =>
    m.name.toLowerCase().includes(filter.toLowerCase()) ||
    m.city?.toLowerCase().includes(filter.toLowerCase()) ||
    m.state?.toLowerCase().includes(filter.toLowerCase())
  )

  return (
    <main className="min-h-screen bg-[#0B1D33] text-white px-6 py-10">
      <div className="max-w-6xl mx-auto">
        <h1 className="text-2xl font-bold mb-6">Manage Property Managers</h1>

        <div className="border border-white/20 rounded-lg p-6 space-y-4 mb-10">
          <h2 className="text-lg font-semibold mb-4">Add New Manager</h2>
          <div className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-3 gap-4">
            <input name="name" value={form.name} onChange={handleChange} className="p-2 rounded bg-[#0B1D33] border border-gray-600 text-white" placeholder="Company Name" />
            <input name="contact_name" value={form.contact_name} onChange={handleChange} className="p-2 rounded bg-[#0B1D33] border border-gray-600 text-white" placeholder="Contact Name" />
            <input name="phone" value={form.phone} onChange={handleChange} className="p-2 rounded bg-[#0B1D33] border border-gray-600 text-white" placeholder="Phone Number" />
            <input name="email" value={form.email} onChange={handleChange} className="p-2 rounded bg-[#0B1D33] border border-gray-600 text-white" placeholder="Email Address" />
            <input name="city" value={form.city} onChange={handleChange} className="p-2 rounded bg-[#0B1D33] border border-gray-600 text-white" placeholder="City" />
            <input name="state" value={form.state} onChange={handleChange} className="p-2 rounded bg-[#0B1D33] border border-gray-600 text-white" placeholder="State" />
          </div>
          <label className="flex items-center space-x-2">
            <input type="checkbox" name="is_active" checked={form.is_active} onChange={handleChange} />
            <span>Active</span>
          </label>
          <button onClick={handleSubmit} className="bg-emerald-600 px-4 py-2 rounded font-semibold">Save Manager</button>
        </div>

        <div className="mb-6">
          <input
            value={filter}
            onChange={(e) => setFilter(e.target.value)}
            className="w-full p-2 rounded bg-[#0B1D33] border border-white/10 text-white"
            placeholder="Search managers by name, city, or state..."
          />
        </div>

        <div className="overflow-x-auto border border-white/10 rounded-lg">
          <table className="w-full text-sm">
            <thead className="bg-white/10">
              <tr>
                <th className="px-4 py-2 text-left">Name</th>
                <th className="px-4 py-2 text-left">Contact</th>
                <th className="px-4 py-2 text-left">Email</th>
                <th className="px-4 py-2 text-left">Phone</th>
                <th className="px-4 py-2 text-left">City</th>
                <th className="px-4 py-2 text-left">State</th>
                <th className="px-4 py-2 text-left">Status</th>
                <th className="px-4 py-2 text-left">Actions</th>
              </tr>
            </thead>
            <tbody>
              {filteredManagers.map((m) => (
                <tr key={m.id} className={`border-t border-white/5 hover:bg-white/5 ${!m.is_active ? 'text-red-400 font-semibold line-through' : ''}`}>
                  <td className="px-4 py-2">
                    <Link href={`/admin/property-managers/${m.id}/details`} className="text-emerald-400 hover:underline">{m.name}</Link>
                  </td>
                  <td className="px-4 py-2">{m.contact_name}</td>
                  <td className="px-4 py-2">{m.email}</td>
                  <td className="px-4 py-2">{m.phone}</td>
                  <td className="px-4 py-2">{m.city}</td>
                  <td className="px-4 py-2">{m.state}</td>
                  <td className="px-4 py-2">{m.is_active ? 'Active' : 'Inactive'}</td>
                  <td className="px-4 py-2 space-x-2">
                    <Link href={`/admin/property-managers/${m.id}/edit`} className="text-blue-400 hover:underline">Edit</Link>
                    <button onClick={() => toggleActiveStatus(m.id, m.is_active)} className="text-yellow-400 hover:underline">
                      {m.is_active ? 'Inactivate' : 'Activate'}
                    </button>
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>

        <div className="text-sm text-center text-gray-400 mt-6">Pagination coming soon...</div>
      </div>
    </main>
  )
}
