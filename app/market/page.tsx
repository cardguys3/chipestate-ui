'use server'

import { createServerClient } from '@supabase/ssr'
import { cookies } from 'next/headers'
import Image from 'next/image'

export default async function MarketPage() {
  const cookieStore = await cookies()

  const supabase = createServerClient(
    process.env.NEXT_PUBLIC_SUPABASE_URL!,
    process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY!,
    {
      cookies: {
        get(name) {
          return cookieStore.get(name)?.value ?? ''
        },
        set() {},
        remove() {},
      },
    }
  )

  const { data: properties, error } = await supabase
    .from('properties')
    .select('*')
    .eq('is_active', true)
    .eq('is_hidden', false)

  if (error) {
    return (
      <main className="min-h-screen bg-[#0B1D33] text-white px-6 py-8">
        <h1 className="text-2xl font-semibold">Marketplace</h1>
        <p className="mt-4 text-red-500">Error loading properties: {error.message}</p>
      </main>
    )
  }

  const getImageSrc = (imageUrl: string | null) => {
    if (!imageUrl) return '/placeholder.png'
    if (imageUrl.startsWith('http')) return imageUrl
    return `${process.env.NEXT_PUBLIC_SUPABASE_URL}/storage/v1/object/public/property-images/${imageUrl}`
  }

  return (
    <main className="min-h-screen bg-[#0B1D33] text-white px-6 py-8">
      <div className="max-w-7xl mx-auto">
        <h1 className="text-2xl font-semibold mb-6">Marketplace</h1>

        <div className="overflow-x-auto">
          <table className="min-w-full text-sm">
            <thead>
              <tr className="text-left border-b border-blue-800 text-gray-300">
                <th className="py-2 pr-4">Property</th>
                <th className="py-2 px-2">Price</th>
                <th className="py-2 px-2">Chart (30D)</th>
                <th className="py-2 px-2">Operating Reserve</th>
                <th className="py-2 px-2">Yield</th>
                <th className="py-2 px-2">Cap Rate</th>
                <th className="py-2 px-2">Status</th>
                <th className="py-2 px-2">Market Cap</th>
                <th className="py-2 px-2">Chips Available</th>
              </tr>
            </thead>
            <tbody>
              {properties.map((p: any) => (
                <tr
                  key={p.id}
                  className="border-b border-blue-800 hover:bg-blue-900 transition duration-150"
                >
                  <td className="flex items-center gap-3 py-3 pr-4">
                    <Image
                      src={getImageSrc(p.image_url)}
                      alt={p.address_line1}
                      width={60}
                      height={60}
                      className="rounded-md object-cover w-16 h-16"
                    />
                    <div>
                      <div className="font-semibold">{p.address_line1}</div>
                      <div className="text-gray-400 text-xs">{`${p.city}, ${p.state} ${p.zip}`}</div>
                    </div>
                  </td>
                  <td className="px-2">${p.price?.toFixed(2)}</td>
                  <td className="px-2 text-gray-400">N/A</td>
                  <td className="px-2">${p.reserve || 0} <span className="text-gray-400 text-xs">(0%)</span></td>
                  <td className="px-2">{p.yield || 'N/A'}</td>
                  <td className="px-2">{p.cap_rate || 'N/A'}</td>
                  <td className="px-2">
                    <span className="bg-purple-700 text-xs px-2 py-1 rounded-full text-white">{p.status || 'N/A'}</span>
                  </td>
                  <td className="px-2">${p.market_cap || 'N/A'}</td>
                  <td className="px-2">{p.chips_sold || 0}/{p.chips_total || 0}</td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      </div>
    </main>
  )
}
