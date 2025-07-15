//Edit PM

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
      const { data, error } = await supabase
        .from('property_managers')
        .select('*')
        .eq('id', id)
        .single()
      if (!error && data) setFormData(data)
      setLoading(false)
    }
    if (id) fetchManager()
  }, [id])

  const handleChange = (e: any) => {
    const { name, value, type, checked } = e.target
    setFormData((prev: any) => ({
      ...prev,
      [name]: type === 'checkbox' ? checked : value,
    }))
  }

  const handleSubmit = async () => {
    const { error } = await supabase
      .from('property_managers')
      .update(formData)
      .eq('id', id)
    if (!error) router.push('/admin/property-managers')
    else alert('Error updating property manager')
  }

  if (loading)
    return <div className="p-6 text-white">Loading...</div>

  return (
    <main className="min-h-screen bg-[#0B1D33] text-white px-4 py-10">
      <div className="max-w-4xl mx-auto border border-white/20 rounded-xl p-6 shadow-xl">
        <h1 className="text-2xl font-bold mb-6 text-center">Edit Property Manager</h1>

        <div className="grid grid-cols-1 sm:grid-cols-2 gap-6 text-sm text-black">
          {[
            { name: 'name', label: 'Manager Name*' },
            { name: 'contact_name', label: 'Contact Name' },
            { name: 'email', label: 'Email*' },
            { name: 'phone', label: 'Phone*' },
            { name: 'address_line1', label: 'Address Line 1' },
            { name: 'address_line2', label: 'Address Line 2' },
            { name: 'city', label: 'City' },
            { name: 'state', label: 'State' },
            { name: 'zip', label: 'Zip' },
            { name: 'years_experience', label: 'Years of Experience' },
            { name: 'management_fee_type', label: 'Management Fee Type' },
            { name: 'management_fee_amount', label: 'Management Fee Amount' },
            { name: 'reporting_frequency', label: 'Reporting Frequency' },
            { name: 'reporting_type', label: 'Reporting Type' },
            { name: 'preferred_owner_communication', label: 'Preferred Contact (Owner)' },
            { name: 'preferred_tenant_communication', label: 'Preferred Contact (Tenant)' },
            { name: 'compliant_states', label: 'Compliance States (comma-separated)' },
            { name: 'services_offered', label: 'Services Offered (comma-separated)' },
          ].map(({ name, label }) => (
            <label key={name} className="flex flex-col text-white">
              <span className="mb-1">{label}</span>
              <input
                name={name}
                value={formData[name] || ''}
                onChange={handleChange}
                className="rounded px-3 py-2 border border-gray-300 text-black"
              />
            </label>
          ))}

          <label className="sm:col-span-2 flex flex-col text-white">
            <span className="mb-1">References</span>
            <textarea
              name="reference_contacts"
              value={formData.reference_contacts || ''}
              onChange={handleChange}
              className="rounded px-3 py-2 border border-gray-300 text-black"
              rows={3}
            />
          </label>

          <label className="sm:col-span-2 flex flex-col text-white">
            <span className="mb-1">Notes</span>
            <textarea
              name="notes"
              value={formData.notes || ''}
              onChange={handleChange}
              className="rounded px-3 py-2 border border-gray-300 text-black"
              rows={3}
            />
          </label>

          <label className="flex items-center space-x-2 sm:col-span-2">
            <input
              type="checkbox"
              name="is_active"
              checked={formData.is_active || false}
              onChange={handleChange}
              className="accent-emerald-600"
            />
            <span className="text-white">Active</span>
          </label>
        </div>

        <div className="pt-6 mt-6 border-t border-white/10 flex justify-between">
          <button
            onClick={() => router.push('/admin/property-managers')}
            className="bg-gray-500 hover:bg-gray-600 px-5 py-2 rounded text-white"
          >
            Cancel
          </button>
          <button
            onClick={handleSubmit}
            className="bg-emerald-600 hover:bg-emerald-700 px-5 py-2 rounded text-white"
          >
            Save Changes
          </button>
        </div>
      </div>
    </main>
  )
}
