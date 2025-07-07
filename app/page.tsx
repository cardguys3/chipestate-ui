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

  return (
    <main className="min-h-screen bg-gray-50">

      <section className="mt-16 px-4 text-center">
        <h1 className="text-4xl font-extrabold text-blue-800 mb-4">
          Welcome to ChipEstate
        </h1>
        <p className="text-gray-600 text-lg max-w-2xl mx-auto">
          Buy and sell fractional real estate — one chip at a time. Real properties, real earnings, and now you can build your real estate portfolio from the ground up.
        </p>
      </section>

      <section className="mt-16 px-4">
        <h2 className="text-2xl font-bold text-blue-700 mb-4 text-center">Highlighted Properties</h2>

        {loading ? (
          <p className="text-center text-gray-500">Loading...</p>
        ) : properties.length === 0 ? (
          <p className="text-center text-gray-500">No properties available.</p>
        ) : (
          <div className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-3 lg:grid-cols-4 xl:grid-cols-5 gap-6 max-w-7xl mx-auto">
            {properties.map((property) => (
              <PropertyCard
                key={property.id}
                image={property.image_url}
                addressLine1={property.address_line1}
                cityStateZip={`${property.city}, ${property.state} ${property.zip}`}
                rentalReturn="--" // Replace with real calc if available
                projectedReturn="--" // Replace with real calc if available
                chipsAvailable={property.chips_available}
                chipsSold={property.total_chips - property.chips_available}
                chipPrice={`$${(property.current_value / property.total_chips).toFixed(2)}`}
                isOccupied={property.occupied}
                type={property.property_type}
                subType={property.sub_type}
              />
            ))}
          </div>
        )}
      </section>

      <Footer />
      <ChatBubble />
    </main>
  )
}
