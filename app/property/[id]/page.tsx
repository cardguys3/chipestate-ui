'use client'

import { useEffect, useState } from 'react'
import { useParams, useRouter } from 'next/navigation'
import { createBrowserClient } from '@supabase/ssr'
import Image from 'next/image'

const supabase = createBrowserClient(
  process.env.NEXT_PUBLIC_SUPABASE_URL!,
  process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY!
)

export default function PropertyDetailsPage() {
  const { id } = useParams()
  const router = useRouter()
  const [property, setProperty] = useState<any>(null)
  const [loading, setLoading] = useState(true)

  useEffect(() => {
    const fetchProperty = async () => {
      const { data, error } = await supabase
        .from('properties')
        .select('*')
        .eq('id', id)
        .single()

      if (error) {
        console.error('Error loading property:', error.message)
      } else {
        setProperty(data)
      }

      setLoading(false)
    }

    fetchProperty()
  }, [id])

  if (loading) {
    return <main className="min-h-screen bg-[#0B1D33] text-white p-8">Loading...</main>
  }

  if (!property) {
    return (
      <main className="min-h-screen bg-[#0B1D33] text-white p-8">
        <p>Property not found.</p>
      </main>
    )
  }

  return (
    <main className="min-h-screen bg-[#0B1D33] text-white p-8">
      <div className="max-w-4xl mx-auto">
        <h1 className="text-3xl font-bold mb-4">{property.title}</h1>

        {property.image_url ? (
          <Image
            src={property.image_url}
            alt={property.title}
            width={800}
            height={400}
            className="rounded-lg mb-6 object-cover w-full h-64"
          />
        ) : (
          <div className="h-64 bg-gray-800 rounded-lg flex items-center justify-center text-gray-400 mb-6">
            No image available
          </div>
        )}

        <div className="grid grid-cols-1 sm:grid-cols-2 gap-6 text-sm">
          <div>
            <p className="text-gray-400">Current Price</p>
            <p className="text-white font-medium">${property.current_value?.toLocaleString()}</p>
          </div>
          <div>
            <p className="text-gray-400">Purchase Price</p>
            <p className="text-white font-medium">${property.purchase_price?.toLocaleString()}</p>
          </div>
          <div>
            <p className="text-gray-400">Cap Rate</p>
            <p className="text-white font-medium">{property.cap_rate || 'N/A'}%</p>
          </div>
          <div>
            <p className="text-gray-400">Operating Reserve</p>
            <p className="text-white font-medium">
              ${property.reserve_balance?.toLocaleString()} (
              {Math.round(
                ((property.reserve_balance || 0) / (property.current_value || 1)) * 100
              )}
              %)
            </p>
          </div>
          <div>
            <p className="text-gray-400">Chips Available</p>
            <p className="text-white font-medium">{property.chips_available}</p>
          </div>
          <div>
            <p className="text-gray-400">Total Chips</p>
            <p className="text-white font-medium">{property.total_chips}</p>
          </div>
          <div>
            <p className="text-gray-400">Market Cap</p>
            <p className="text-white font-medium">
              ${property.market_cap ? property.market_cap.toLocaleString() : 'N/A'}
            </p>
          </div>
          <div>
            <p className="text-gray-400">Status</p>
            <p
              className={`font-medium ${
                property.is_active ? 'text-green-400' : 'text-red-400'
              }`}
            >
              {property.is_active ? 'Active' : 'Inactive'}
            </p>
          </div>
        </div>
      </div>
    </main>
  )
}
