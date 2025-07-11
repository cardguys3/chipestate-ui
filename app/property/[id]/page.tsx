'use client'

import { useEffect, useState } from 'react'
import { useParams, useRouter } from 'next/navigation'
import { createBrowserClient } from '@supabase/ssr'

const supabase = createBrowserClient(
  process.env.NEXT_PUBLIC_SUPABASE_URL!,
  process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY!
)

export default function PropertyDetailsPage() {
  const { id } = useParams()
  const router = useRouter()
  const [property, setProperty] = useState<any>(null)
  const [loading, setLoading] = useState(true)
  const [mainImage, setMainImage] = useState<string>('')
  const [chipQty, setChipQty] = useState(1)

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
        if (data.image_urls?.length > 0) {
          setMainImage(resolveImageUrl(data.image_urls[0]))
        } else if (data.image_url) {
          setMainImage(resolveImageUrl(data.image_url))
        }
      }

      setLoading(false)
    }

    fetchProperty()
  }, [id])

  const resolveImageUrl = (url: string): string => {
    if (!url) return ''
    if (url.startsWith('http')) return url
    return `https://ajburehyunbvpuhnyjbo.supabase.co/storage/v1/object/public/property-images/${url}`
  }

  const handleCheckout = () => {
    router.push(`/checkout/${id}?qty=${chipQty}`)
  }

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
    <main className="min-h-screen bg-[#0B1D33] text-white p-6">
      <div className="max-w-5xl mx-auto border border-gray-600 rounded-xl p-6">
        <h1 className="text-3xl font-bold mb-4 border-b pb-2">{property.title}</h1>

        {/* Main Image */}
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

        {/* Thumbnails */}
        {property.image_urls?.length > 0 && (
          <div className="flex gap-3 mb-6 overflow-x-auto">
            {property.image_urls.map((url: string, index: number) => {
              const resolved = resolveImageUrl(url)
              return (
                <img
                  key={index}
                  src={resolved}
                  alt={`Thumbnail ${index + 1}`}
                  className={`rounded cursor-pointer border w-[120px] h-[80px] object-cover ${resolved === mainImage ? 'border-emerald-400' : 'border-transparent'}`}
                  onClick={() => setMainImage(resolved)}
                />
              )
            })}
          </div>
        )}

        {/* Property Details */}
        <div className="grid grid-cols-1 sm:grid-cols-2 gap-6 text-sm mb-6">
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
              )}%)
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
            <p className={`font-medium ${property.is_active ? 'text-green-400' : 'text-red-400'}`}>
              {property.is_active ? 'Active' : 'Inactive'}
            </p>
          </div>
        </div>

        {/* Buy Chips Section */}
        <div className="border-t border-gray-700 pt-6 mt-6">
          <h2 className="text-2xl font-bold mb-4">Buy Chips</h2>
          <div className="flex items-center gap-4 mb-4">
            <label htmlFor="chipQty" className="text-white text-sm">
              Chips to Buy:
            </label>
            <input
              id="chipQty"
              type="number"
              min={1}
              max={property.chips_available}
              value={chipQty}
              onChange={(e) => setChipQty(Math.min(property.chips_available, Math.max(1, Number(e.target.value))))}
              className="w-24 p-2 rounded bg-gray-800 border border-gray-600 text-white"
            />
            <span className="text-sm text-gray-400">
  (${(chipQty * 50).toLocaleString()} total)
</span>
          </div>
          <button
            onClick={handleCheckout}
            className="bg-emerald-600 hover:bg-emerald-700 text-white px-6 py-2 rounded-xl transition"
          >
            Continue to Checkout
          </button>
        </div>
      </div>
    </main>
  )
}
