import { createServerClient } from '@supabase/ssr'
import { cookies } from 'next/headers'
import Image from 'next/image'
import Link from 'next/link'

export default async function MarketPage() {
  const cookieStore = cookies()
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
    console.error('Error loading properties:', error.message)
    return <p className="text-red-500 p-4">Failed to load properties.</p>
  }

  const resolveImage = (imageUrl: string | null) => {
    if (!imageUrl) return '/placeholder.png'
    try {
      const isExternal = imageUrl.startsWith('http://') || imageUrl.startsWith('https://')
      return isExternal
        ? imageUrl
        : `${process.env.NEXT_PUBLIC_SUPABASE_URL}/storage/v1/object/public/property-images/${imageUrl}`
    } catch {
      return '/placeholder.png'
    }
  }

  return (
    <main className="bg-dark text-white min-h-screen p-6">
      <h1 className="text-3xl font-bold mb-6">Marketplace</h1>
      <div className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-3 gap-6">
        {properties?.map((property) => (
          <div key={property.id} className="bg-gray-800 rounded-lg shadow-md overflow-hidden">
            <Image
              src={resolveImage(property.image_url)}
              alt={property.name || 'Property Image'}
              width={400}
              height={300}
              className="w-full h-48 object-cover"
              unoptimized
            />
            <div className="p-4">
              <h2 className="text-xl font-semibold mb-2">{property.name}</h2>
              <p className="text-sm text-gray-300 mb-2">{property.address}</p>
              <p className="text-sm text-gray-400">
                {property.city}, {property.state} {property.zip}
              </p>
              <Link
                href={`/properties/${property.id}`}
                className="text-blue-400 hover:text-blue-200 text-sm mt-3 inline-block"
              >
                View Details →
              </Link>
            </div>
          </div>
        ))}
      </div>
    </main>
  )
}
