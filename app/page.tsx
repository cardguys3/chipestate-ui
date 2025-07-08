'use client'

import { useEffect, useState } from 'react'
import { supabase } from '@/lib/supabaseClient'
import PropertyCard from '@/components/PropertyCard'
import Footer from '@/components/Footer'
import ChatBubble from '@/components/ChatBubble'

export default function Home() {
  const [properties, setProperties] = useState<any[]>([])
  const [loading, setLoading] = useState(true)

  useEffect(() => {
    async function fetchProperties() {
      const { data, error } = await supabase
        .from('properties')
        .select('*')
        .eq('is_active', true)

      if (error) {
        console.error('Error loading properties:', error.message)
      } else {
        setProperties(data || [])
      }
      setLoading(false)
    }

    fetchProperties()
  }, [])

  const getImageUrl = (url: string | null) => {
    if (!url) return '/default-image.png'
    return url.startsWith('http')
      ? url
      : `https://ajburehyunbvpuhnyjbo.supabase.co/storage/v1/object/public/property-images/${url}`
  }

  return (
    <main className="min-h-screen bg-gray-50 pt-0 pb-0">
      <section className="px-4 text-center">
        <h1 className="text-4xl font-extrabold text-blue-800 mb-4">
          Welcome to ChipEstate
        </h1>
        <p className="text-gray-600 text-lg max-w-2xl mx-auto mb-10">
          Buy and sell fractional real estate — one chip at a time. Real properties, real earnings, and now you can build your real estate portfolio online.
        </p>
      </section>

      <section className="px-4 grid grid-cols-1 sm:grid-cols-2 md:grid-cols-3 gap-6 max-w-6xl mx-auto">
        {loading ? (
          <p className="col-span-full text-center text-gray-500">Loading properties...</p>
        ) : properties.length === 0 ? (
          <p className="col-span-full text-center text-gray-500">No active properties found.</p>
        ) : (
          properties.map((property) => (
            <div key={property.id} className="[perspective:1000px]">
              <div className="relative w-full h-[300px] [transform-style:preserve-3d] transition-transform duration-700 hover:[transform:rotateY(180deg)]">
                {/* Front */}
                <div className="absolute w-full h-full bg-white rounded-lg shadow overflow-hidden backface-hidden">
                  <img
                    src={getImageUrl(property.image_url)}
                    alt={property.title || 'Property image'}
                    className="w-full h-48 object-cover"
                  />
                  <div className="p-4">
                    <h2 className="text-xl font-semibold text-blue-800 mb-2">{property.title}</h2>
                    <p className="text-sm text-gray-600 line-clamp-2">{property.description}</p>
                  </div>
                </div>

                {/* Back */}
                <div className="absolute w-full h-full bg-blue-900 text-white rounded-lg p-4 [transform:rotateY(180deg)] backface-hidden">
                  <h3 className="text-lg font-bold mb-2">Property Details</h3>
                  <ul className="text-sm space-y-1">
                    <li><strong>Type:</strong> {property.property_type}</li>
                    <li><strong>Subtype:</strong> {property.sub_type}</li>
                    <li><strong>Return:</strong> {property.projected_return}</li>
                    <li><strong>Occupied:</strong> {property.occupied}</li>
                    <li><strong>Yield:</strong> {property.rental_yield}</li>
                  </ul>
                </div>
              </div>
            </div>
          ))
        )}
      </section>

      <ChatBubble />
    </main>
  )
}
