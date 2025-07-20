// File: app/property/[id]/page.tsx
'use client'

import { useEffect, useState } from 'react'
import { useParams } from 'next/navigation'
import { createBrowserClient } from '@supabase/ssr' //updated this per CGPT
import LoginModal from '@/components/LoginModal'

export default function PropertyDetailsPage() {
  const [property, setProperty] = useState<any>(null)
  const [sessionChecked, setSessionChecked] = useState(false)
  const [showLogin, setShowLogin] = useState(false)
  const [userApproved, setUserApproved] = useState<boolean | null>(null)

  const supabase = createBrowserClient() //updated this per CGPT
  const { id } = useParams()

  useEffect(() => {
    const fetchData = async () => {
      const { data: { session } } = await supabase.auth.getSession()

      if (!session) {
        setShowLogin(true)
        setSessionChecked(true)
        return
      }

      const userId = session.user.id

      // Fetch user approval status
      const { data: userRecord } = await supabase
        .from('users_extended')
        .select('is_approved')
        .eq('id', userId)
        .single()

      if (userRecord?.is_approved === false) {
        setUserApproved(false)
      } else {
        setUserApproved(true)
      }

      const { data, error } = await supabase
        .from('properties')
        .select('*')
        .eq('id', id)
        .single()

      if (!error && data) {
        setProperty(data)
      }

      setSessionChecked(true)
    }

    fetchData()
  }, [id, supabase])

  const resolveImageUrl = (url: string): string => {
    if (!url) return ''
    if (url.startsWith('http')) return url
    return `https://ajburehyunbvpuhnyjbo.supabase.co/storage/v1/object/public/property-images/${url}`
  }

  if (showLogin) return <LoginModal onClose={() => setShowLogin(false)} />
  if (!sessionChecked) return <main className="min-h-screen bg-[#0B1D33] text-white p-8"><p>Loading...</p></main>
  if (!property) return <main className="min-h-screen bg-[#0B1D33] text-white p-8"><p>Property not found.</p></main>

  const mainImage = property.image_urls?.length
    ? resolveImageUrl(property.image_urls[0])
    : property.image_url
    ? resolveImageUrl(property.image_url)
    : ''

  return (
    <main className="min-h-screen bg-[#0B1D33] text-white p-6">
      <div className="max-w-5xl mx-auto border border-gray-600 rounded-xl p-6">
        <h1 className="text-3xl font-bold mb-4 border-b pb-2">{property.title}</h1>

        {mainImage ? (
          <img
            src={mainImage}
            alt={property.title}
            className="rounded-lg mb-4 object-cover w-full h-80 border"
          />
        ) : (
          <div className="h-80 bg-gray-800 rounded-lg flex items-center justify-center text-gray-400 mb-4">
            No image available
          </div>
        )}

        <div className="grid grid-cols-1 sm:grid-cols-2 gap-6 text-sm mb-6">
          {[
            ['Current Price', property.current_value],
            ['Purchase Price', property.purchase_price],
            ['Cap Rate', property.cap_rate ? `${property.cap_rate}%` : 'N/A'],
            ['Operating Reserve', `$${property.reserve_balance?.toLocaleString()} (${Math.round(((property.reserve_balance || 0) / (property.current_value || 1)) * 100)}%)`],
            ['Chips Available', property.chips_available],
            ['Total Chips', property.total_chips],
            ['Market Cap', property.market_cap ? `$${property.market_cap.toLocaleString()}` : 'N/A'],
            ['Status', property.is_active ? 'Active' : 'Inactive'],
          ].map(([label, value], i) => (
            <div key={i}>
              <p className="text-gray-400">{label}</p>
              <p className={`text-white font-medium ${value === 'Inactive' ? 'text-red-400' : value === 'Active' ? 'text-green-400' : ''}`}>
                {value}
              </p>
            </div>
          ))}
        </div>

        <div className="border-t border-gray-700 pt-6 mt-6">
          <h2 className="text-2xl font-bold mb-4">Buy Chips</h2>

          {userApproved === false ? (
            <p className="text-yellow-400 font-semibold">
              Your account is not yet approved to purchase chips. Please wait for admin approval.
            </p>
          ) : (
            <form
              action={`/checkout/${property.id}`}
              method="GET"
              className="flex items-center gap-4 mb-4"
            >
              <label htmlFor="chipQty" className="text-white text-sm">Chips to Buy:</label>
              <input
                id="chipQty"
                name="qty"
                type="number"
                defaultValue={1}
                min={1}
                max={property.chips_available}
                className="w-24 p-2 rounded bg-gray-800 border border-gray-600 text-white"
              />
              <button
                type="submit"
                className="bg-emerald-600 hover:bg-emerald-700 text-white px-6 py-2 rounded-xl transition"
              >
                Continue to Checkout
              </button>
            </form>
          )}
        </div>
      </div>
    </main>
  )
}
