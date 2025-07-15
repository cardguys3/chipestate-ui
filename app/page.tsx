//app.page.tsx this is the landing page for chipestate
'use client'

import { useEffect, useState } from 'react'
import { useRouter } from 'next/navigation'
import { supabase } from '@/lib/supabaseClient'
import PropertyCard from '@/components/PropertyCard'
import Footer from '@/components/Footer'
import ChatBubble from '@/components/ChatBubble'  // ← Updated component
import LoginModal from '@/components/LoginModal'

export default function Home() {
  const router = useRouter()
  const [properties, setProperties] = useState<any[]>([])
  const [loading, setLoading] = useState(true)
  const [showLogin, setShowLogin] = useState(false)
  const [user, setUser] = useState<any>(null)

  useEffect(() => {
    async function fetchProperties() {
      const { data, error } = await supabase
        .from('properties')
        .select('*')
        .eq('is_active', true)
        .eq('is_hidden', false)
        .limit(9)

      if (error) {
        console.error('Error loading properties:', error.message)
      } else {
        setProperties(data || [])
      }
      setLoading(false)
    }

    async function fetchUser() {
      const { data: { user } } = await supabase.auth.getUser()
      setUser(user)
    }

    fetchProperties()
    fetchUser()
  }, [])

  const getImageUrl = (url: string | null) => {
    if (!url) return '/default-image.png'
    return url.startsWith('http')
      ? url
      : `https://ajburehyunbvpuhnyjbo.supabase.co/storage/v1/object/public/property-images/${url}`
  }

  const handleCardClick = (id: string) => {
    if (user) {
      router.push(`/property/${id}`)
    } else {
      setShowLogin(true)
    }
  }

  return (
    <main className="min-h-screen bg-[#0c1a2c] text-white pt-0 pb-0">
      <section className="px-4 text-center">
        <h1 className="text-4xl font-extrabold text-white mb-4">
          Welcome to ChipEstate
        </h1>
        <p className="text-gray-300 text-lg max-w-2xl mx-auto mb-10">
          The bitcoin of real estate
        </p>
      </section>

      <section className="px-4 grid grid-cols-1 sm:grid-cols-2 md:grid-cols-3 gap-6 max-w-6xl mx-auto">
        {loading ? (
          <p className="col-span-full text-center text-gray-400">Loading properties...</p>
        ) : properties.length === 0 ? (
          <p className="col-span-full text-center text-gray-400">No active properties found.</p>
        ) : (
          properties.map((property) => (
            <div
              key={property.id}
              className="[perspective:1000px] cursor-pointer"
              onClick={() => handleCardClick(property.id)}
            >
              <div className="relative w-full h-[200px] [transform-style:preserve-3d] transition-transform duration-700 hover:[transform:rotateY(180deg)]">
                {/* Front */}
                <div className="absolute w-full h-full bg-white border-2 border-emerald-400 rounded-lg shadow overflow-hidden backface-hidden text-sm">
                  <div className="relative w-full h-full">
                    <img
                      src={getImageUrl(property.image_url)}
                      alt={property.title || 'Property image'}
                      className="w-full h-full object-cover"
                    />
                    <div className="absolute bottom-0 left-0 w-full bg-blue-800 bg-opacity-90 text-white text-sm font-bold px-2 py-1 text-center">
                      {property.title}
                    </div>
                  </div>
                </div>

                {/* Back */}
                <div className="absolute w-full h-full bg-blue-900 text-white border-2 border-emerald-400 rounded-lg p-4 [transform:rotateY(180deg)] backface-hidden overflow-y-auto">
                  <h2 className="text-xl font-bold mb-3 text-center">{property.title}</h2>
                  <ul className="text-xs space-y-1">
  <li><strong>Projected Return:</strong> {property.projected_return}%</li>
  <li><strong>Rental Yield:</strong> {property.rental_yield}%</li>
  <li><strong>Avg Earnings/Chip (mo):</strong> ${property.avg_monthly_chip_earning?.toFixed(2)}</li>
  <li><strong>Occupancy Rate:</strong> {property.occupancy_rate}%</li>
  <li><strong>Reserve Balance:</strong> {(property.reserve_balance && property.current_value) ? ((property.reserve_balance / property.current_value) * 100).toFixed(1) + '%' : 'N/A'}</li>
  <li><strong>Chips Remaining:</strong> {(property.chips_available && property.total_chips) ? ((property.chips_available / property.total_chips) * 100).toFixed(1) + '%' : 'N/A'}</li>
</ul>
                </div>
              </div>
            </div>
          ))
        )}
      </section>

      <ChatBubble />
      {showLogin && <LoginModal onClose={() => setShowLogin(false)} />}
    </main>
  )
}
