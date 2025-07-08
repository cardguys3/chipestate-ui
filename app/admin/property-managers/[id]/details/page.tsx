'use client'

import { useEffect, useState } from 'react'
import { useParams } from 'next/navigation'
import { supabase } from '@/lib/supabaseClient'
import Link from 'next/link'

export default function PropertyManagerDetails() {
  const { id } = useParams()
  const [manager, setManager] = useState<any>(null)

  useEffect(() => {
    const fetchManager = async () => {
      const { data, error } = await supabase.from('property_managers').select('*').eq('id', id).single()
      if (!error && data) setManager(data)
    }
    if (id) fetchManager()
  }, [id])

  if (!manager) return <div className="p-6 text-white">Loading manager details...</div>

  return (
    <main className="min-h-screen bg-[#0B1D33] text-white px-6 py-10">
      <div className="max-w-4xl mx-auto border border-white/20 rounded-lg p-6 space-y-4">
        <h1 className="text-2xl font-bold">Property Manager Details</h1>
        <div className="grid grid-cols-1 sm:grid-cols-2 gap-4 text-sm">
          <p><strong>Name:</strong> {manager.name}</p>
          <p><strong>Contact:</strong> {manager.contact_name}</p>
          <p><strong>Phone:</strong> {manager.phone}</p>
          <p><strong>Email:</strong> {manager.email}</p>
          <p><strong>City:</strong> {manager.city}</p>
          <p><strong>State:</strong> {manager.state}</p>
          <p><strong>Status:</strong> {manager.is_active ? 'Active' : 'Inactive'}</p>
        </div>

        <div className="pt-6 space-x-4">
          <Link href="/admin/property-managers" className="text-blue-400 hover:underline">← Back</Link>
          <Link href={`/admin/property-managers/${id}/edit`} className="text-emerald-400 hover:underline">Edit</Link>
        </div>
      </div>
    </main>
  )
}
