'use client'

import { useEffect, useState } from 'react'
import { useParams, useRouter } from 'next/navigation'
import { supabase } from '@/lib/supabaseClient'

export default function EditPropertyManagerPage() {
  const { id } = useParams()
  const router = useRouter()
  const [formData, setFormData] = useState<any>({})
  const [loading, setLoading] = useState(true)

  useEffect(() => {
    const fetchManager = async () => {
      const { data, error } = await supabase.from('property_managers').select('*').eq('id', id).single()
      if (!error && data) setFormData(data)
      setLoading(false)
    }
    if (id) fetchManager()
  }, [id])

  const handleChange = (e: any) => {
    const { name, value, type, checked } = e.target
    setFormData((prev: any) => ({ ...prev, [name]: type === 'checkbox' ? checked : value }))
  }

  const handleSubmit = async () => {
    const { error } = await supabase.from('property_managers').update(formData).eq('id', id)
    if (!error) router.push('/admin/property-managers')
    else alert('Error updating property manager')
  }

  if (loading) return <div className="p-6 text-white">Loading...</div>

  return (
    <main className="min-h-screen bg-[#0B1D33] text-white px-6 py-10">
      <div className="max-w-4xl mx-auto border border-white/20 rounded-lg p-6 space-y-6">
        <h1 className="text-2xl font-bold mb-4">Edit Property Manager</h1>

        <div className="grid grid-cols-1 sm:grid-cols-2 gap-4 text-black">
          <input name="name" value={formData.name || ''} onChange={handleChange} placeholder="Manager Name*" className="p-2 rounded border" />
          <input name="contact_name" value={formData.contact_name || ''} onChange={handleChange} placeholder="Contact Name" className="p-2 rounded border" />
          <input name="email" value={formData.email || ''} onChange={handleChange} placeholder="Email*" className="p-2 rounded border" />
          <input name="phone" value={formData.phone || ''} onChange={handleChange} placeholder="Phone*" className="p-2 rounded border" />
          <input name="address" value={formData.address || ''} onChange={handleChange} placeholder="Address" className="p-2 rounded border" />
          <input name="city" value={formData.city || ''} onChange={handleChange} placeholder="City" className="p-2 rounded border" />
          <input name="state" value={formData.state || ''} onChange={handleChange} placeholder="State" className="p-2 rounded border" />
          <input name="years_experience" value={formData.years_experience || ''} onChange={handleChange} placeholder="Years of Experience" className="p-2 rounded border" />
          <input name="management_fee" value={formData.management_fee || ''} onChange={handleChange} placeholder="Management Fee" className="p-2 rounded border" />
          <input name="reporting_frequency" value={formData.reporting_frequency || ''} onChange={handleChange} placeholder="Reporting Frequency" className="p-2 rounded border" />
          <input name="reporting_type" value={formData.reporting_type || ''} onChange={handleChange} placeholder="Reporting Type" className="p-2 rounded border" />
          <input name="owner_communication" value={formData.owner_communication || ''} onChange={handleChange} placeholder="Preferred Contact (Owner)" className="p-2 rounded border" />
          <input name="tenant_communication" value={formData.tenant_communication || ''} onChange={handleChange} placeholder="Preferred Contact (Tenant)" className="p-2 rounded border" />
          <input name="compliance_states" value={formData.compliance_states || ''} onChange={handleChange} placeholder="Compliance States (comma-separated)" className="p-2 rounded border" />
          <input name="services_offered" value={formData.services_offered || ''} onChange={handleChange} placeholder="Services Offered (comma-separated)" className="p-2 rounded border" />
          <textarea name="references" value={formData.references || ''} onChange={handleChange} placeholder="References" className="p-2 rounded border col-span-2" />
          <textarea name="notes" value={formData.notes || ''} onChange={handleChange} placeholder="Notes" className="p-2 rounded border col-span-2" />
          <label className="flex items-center space-x-2 col-span-2">
            <input type="checkbox" name="is_active" checked={formData.is_active} onChange={handleChange} className="accent-blue-600" />
            <span>Active</span>
          </label>
        </div>

        <div className="pt-4 flex justify-between">
          <button onClick={() => router.push('/admin/property-managers')} className="bg-gray-500 hover:bg-gray-600 px-4 py-2 rounded text-white">Cancel</button>
          <button onClick={handleSubmit} className="bg-emerald-600 hover:bg-emerald-700 px-4 py-2 rounded text-white">Save Changes</button>
        </div>
      </div>
    </main>
  )
}
