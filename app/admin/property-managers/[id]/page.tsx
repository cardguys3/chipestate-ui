'use client'

import { useState, useEffect } from 'react'
import { useRouter } from 'next/navigation'
import { supabase } from '@/lib/supabaseClient'
import { useParams } from 'next/navigation'

export default function EditPropertyManagerPage() {
  const router = useRouter()
  const params = useParams()
  const id = params?.id as string
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
    const fetchManager = async () => {
      const { data, error } = await supabase
        .from('property_managers')
        .select('*')
        .eq('id', id)
        .single()
      if (data) setForm(data)
      setLoading(false)
    }
    if (id) fetchManager()
  }, [id])

  const handleChange = (e: any) => {
    const { name, value, type, checked } = e.target
    setForm((prev) => ({
      ...prev,
      [name]: type === 'checkbox' ? checked : value,
    }))
  }

  const handleSubmit = async () => {
    const { error } = await supabase
      .from('property_managers')
      .update(form)
      .eq('id', id)
    if (!error) router.push('/admin/property-managers')
  }

  if (loading) return <p className="text-white p-4">Loading...</p>

  return (
    <main className="min-h-screen bg-[#0B1D33] text-white px-6 py-10">
      <div className="max-w-4xl mx-auto">
        <h1 className="text-2xl font-bold mb-6">Edit Property Manager</h1>
        <div className="border border-white/20 rounded-lg p-6 space-y-4">
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
          <div className="space-x-4">
            <button onClick={handleSubmit} className="bg-emerald-600 px-4 py-2 rounded font-semibold">Save Changes</button>
            <button onClick={() => router.push('/admin/property-managers')} className="bg-gray-600 px-4 py-2 rounded font-semibold">Cancel</button>
          </div>
        </div>
      </div>
    </main>
  )
}
