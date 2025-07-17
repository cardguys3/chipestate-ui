//app/market/page.tsx

'use client'

import { useEffect, useState } from 'react'
import { supabase } from '@/lib/supabaseClient'
import LoginModal from '@/components/LoginModal'
import PropertyCard from '@/components/PropertyCard'

export default function MarketPage() {
  const [properties, setProperties] = useState<any[]>([])
  const [showLogin, setShowLogin] = useState(false)

  useEffect(() => {
    const fetchProperties = async () => {
      const { data, error } = await supabase
        .from('properties')
        .select('*')
        .eq('hidden', false)
        .eq('active', true)

      if (data) setProperties(data)
    }

    fetchProperties()
  }, [])

  return (
    <div className="min-h-screen bg-[#0B1D33] text-white p-6">
      <h1 className="text-3xl font-bold mb-6 text-center">Explore the Market</h1>

      {showLogin && <LoginModal onClose={() => setShowLogin(false)} />}

      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
        {properties.map((property) => (
          <PropertyCard
            key={property.id}
            property={property}
            onLoginClick={() => setShowLogin(true)}
          />
        ))}
      </div>
    </div>
  )
}
