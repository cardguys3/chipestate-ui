'use client'

import { useEffect, useState } from 'react'
import { useParams, useRouter } from 'next/navigation'
import { supabase } from '@/lib/supabaseClient'

export default function EditPropertyManager() {
  const { id } = useParams()
  const router = useRouter()
  const [formData, setFormData] = useState<any>({})

  useEffect(() => {
    const fetchManager = async () => {
      const { data, error } = await supabase.from('property_managers').select('*').eq('id', id).single()
      if (!error && data) setFormData(data)
    }
    if (id) fetchManager()
  }, [id])

  const handleChange = (e: any) => {
    const { name, value } = e.target
    setFormData((prev: any) => ({ ...prev, [name]: value }))
  }

  const handleArrayChange = (e: any) => {
    const { name, value } = e.target
    setFormData((prev: any) => ({ ...prev, [name]: value.split(',').map((v: string) => v.trim()) }))
  }

  const handleSubmit = async (e: any) => {
    e.preventDefault()
    const { error } = await supabase.from('property_managers').update(formData).eq('id', id)
    if (!error) router.push('/admin/property-managers')
    else alert('Error updating property manager.')
  }

  return (
    <main className="min-h-screen bg-[#0B1D33] text-white px-6 py-10">
      <div className="max-w-3xl mx-auto border border-white/20 rounded-lg p-6 space-y-6">
        <h1 className="text-2xl font-bold mb-4">Edit Property Manager</h1>
        <form onSubmit={handleSubmit} className="grid grid-cols-1 sm:grid-cols-2 gap-4 text-sm">
          {[
            'name', 'contact_name', 'phone', 'email', 'city', 'state',
            'years_experience', 'management_fee', 'owner_communication', 'tenant_communication',
            'reporting_frequency', 'reporting_type', 'notes'
          ].map(field => (
            <div key={field}>
              <label className="block text-xs mb-1 capitalize">{field.replace('_', ' ')}</label>
              <input
                name={field}
                value={formData[field] || ''}
                onChange={handleChange}
                className="w-full bg-white/10 border border-white/20 rounded px-3 py-2"
              />
            </div>
          ))}

          {['compliance_states', 'service_types', 'references'].map(field => (
            <div key={field} className="sm:col-span-2">
              <label className="block text-xs mb-1 capitalize">{field.replace('_', ' ')} (comma separated)</label>
              <input
                name={field}
                value={(formData[field] || []).join(', ')}
                onChange={handleArrayChange}
                className="w-full bg-white/10 border border-white/20 rounded px-3 py-2"
              />
            </div>
          ))}

          <div className="sm:col-span-2 pt-4">
            <button type="submit" className="bg-emerald-600 hover:bg-emerald-700 text-white px-6 py-2 rounded">Save Changes</button>
          </div>
        </form>
      </div>
    </main>
  )
}
