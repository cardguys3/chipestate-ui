// app/property/[id]/page.tsx

import { cookies } from 'next/headers'
import { redirect } from 'next/navigation'
import { createServerClient } from '@supabase/ssr'
import { Metadata } from 'next'

interface PageProps {
  params: {
    id: string
  }
}

export const metadata: Metadata = {
  title: 'Property Details | ChipEstate',
}

export default async function PropertyDetailsPage({ params }: PageProps) {
  const supabase = createServerClient(
    process.env.NEXT_PUBLIC_SUPABASE_URL!,
    process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY!,
    { cookies }
  )

  const {
    data: { session },
  } = await supabase.auth.getSession()

  if (!session) {
    redirect('/login')
  }

  const { data: property, error } = await supabase
    .from('properties')
    .select('*')
    .eq('id', params.id)
    .single()

  if (error || !property) {
    return (
      <main className="min-h-screen bg-[#0B1D33] text-white p-8">
        <p>Property not found.</p>
      </main>
    )
  }

  const resolveImageUrl = (url: string): string => {
    if (!url) return ''
    if (url.startsWith('http')) return url
    return `https://ajburehyunbvpuhnyjbo.supabase.co/storage/v1/object/public/property-images/${url}`
  }

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

        <div className="border-t border-gray-700 pt-6 mt-6">
          <h2 className="text-2xl font-bold mb-4">Buy Chips</h2>
          <form action={`/checkout/${property.id}`} method="GET" className="flex items-center gap-4 mb-4">
            <label htmlFor="chipQty" className="text-white text-sm">
              Chips to Buy:
            </label>
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
        </div>
      </div>
    </main>
  )
}
