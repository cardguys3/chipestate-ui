
'use client'

import { useEffect, useState } from 'react'
import { useParams } from 'next/navigation'
import { createBrowserClient } from '@supabase/ssr'

const supabase = createBrowserClient(
  process.env.NEXT_PUBLIC_SUPABASE_URL!,
  process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY!
)

export default function PropertyDetailsPage() {
  const { id } = useParams()
  const [property, setProperty] = useState<any>(null)
  const [error, setError] = useState<string | null>(null)

  useEffect(() => {
    if (!id) return

    const fetchData = async () => {
      const { data, error } = await supabase
        .from('properties')
        .select('*')
        .eq('id', id)
        .single()

      if (error) {
        setError('Failed to load property.')
      } else {
        setProperty(data)
      }
    }

    fetchData()
  }, [id])

  if (error) return <p className="text-red-500 p-6">{error}</p>
  if (!property) return <p className="p-6 text-white">Loading...</p>

  return (
    <main className="min-h-screen bg-[#0e1a2b] text-white px-8 py-10">
      <h1 className="text-2xl font-bold mb-6">{property.title}</h1>
      <p><strong>Type:</strong> {property.property_type} - {property.sub_type}</p>
      <p><strong>Address:</strong> {property.address_line1}, {property.city}, {property.state} {property.zip}</p>
      <p><strong>Purchase Price:</strong> ${property.purchase_price?.toLocaleString()}</p>
      <p><strong>Current Value:</strong> ${property.current_value?.toLocaleString()}</p>
      <p><strong>Reserve Balance:</strong> ${property.reserve_balance?.toLocaleString()}</p>
      <p><strong>Status:</strong> {property.is_active ? 'Active' : 'Inactive'} | {property.is_hidden ? 'Hidden' : 'Visible'} | {property.occupied ? 'Occupied' : 'Vacant'}</p>
    </main>
  )
}
