'use client'

import { useState, useEffect } from 'react'
import { supabase } from '@/lib/supabaseClient'
import { useRouter } from 'next/navigation'

export default function PropertyManagersPage() {
  const router = useRouter()
  const [managers, setManagers] = useState<any[]>([])
  const [loading, setLoading] = useState(true)

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
      if (!error && data) {
        setManagers(data)
      }
      setLoading(false)
    }
    fetchManagers()
  }, [])

  const handleChange = (e: any) => {
    const { name, value, type, checked } = e.target
    setForm((prev) => ({
      ...prev,
      [name]: type === 'checkbox' ? checked : value,
    }))
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

  return (
    <main className="min-h-screen bg-[#0B1D33] text-white px-6 py-10">
      <div className="max-w-4xl mx-auto">
        <h1 className="text-2xl font-bold mb-6">Manage Property Managers</h1>

        <div className="border border-white/20 rounded-lg p-6 space-y-4 mb-10">
          <h2 className="text-lg font-semibold mb-4">Add New Manager</h2>

          <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
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

        <div>
          <h2 className="text-lg font-semibold mb-4">Existing Managers</h2>
          {loading ? (
            <p>Loading...</p>
          ) : (
            <ul className="space-y-2">
              {managers.map((m) => (
                <li key={m.id} className="border border-white/10 bg-white/5 p-4 rounded text-sm">
                  <div className="font-semibold text-white">{m.name}</div>
                  <div className="text-gray-300">{m.contact_name} – {m.email} – {m.city}, {m.state}</div>
                </li>
              ))}
            </ul>
          )}
        </div>
      </div>
    </main>
  )
}
