
import { cookies } from 'next/headers'
import { createServerClient } from '@supabase/ssr'
import Link from 'next/link'

export default async function AdminPropertiesPage() {
  const cookieStore = cookies()

  const supabase = createServerClient(
    process.env.NEXT_PUBLIC_SUPABASE_URL!,
    process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY!,
    
    {
      cookies: {
        get: (name) => cookieStore.get(name)?.value ?? '',
        set: () => {}, // No-op for SSR
        remove: () => {}, // No-op for SSR
      },
    }
  )

  const {
    data: { session },
  } = await supabase.auth.getSession()

  if (!session) {
    return (
      <div className="text-white text-center mt-10">
        You must be logged in to view this page.
      </div>
    )
  }

  const { data: properties, error } = await supabase
    .from('properties')
    .select('*')
    .order('created_at', { ascending: false })

  if (error) {
    return (
      <div className="text-red-500 text-center mt-10">
        Error loading properties: {error.message}
      </div>
    )
  }

  return (
    <main className="min-h-screen bg-gray-900 text-white p-8">
      <div className="flex justify-between items-center mb-6">
        <h1 className="text-2xl font-bold">Manage Properties</h1>
        <Link
          href="/admin/properties/new"
          className="bg-emerald-600 hover:bg-emerald-700 text-white px-4 py-2 rounded"
        >
          + Add Property
        </Link>
      </div>

      {properties?.length === 0 ? (
        <p className="text-gray-400">No properties found.</p>
      ) : (
        <table className="w-full border-collapse bg-gray-800 rounded overflow-hidden">
          <thead>
            <tr className="bg-gray-700 text-left text-sm uppercase text-gray-300">
              <th className="px-4 py-3">Title</th>
              <th className="px-4 py-3">Type</th>
              <th className="px-4 py-3">Chips</th>
              <th className="px-4 py-3">Available</th>
              <th className="px-4 py-3">Status</th>
              <th className="px-4 py-3">Actions</th>
            </tr>
          </thead>
          <tbody>
            {properties?.map((property) => (
              <tr key={property.id} className="border-t border-gray-700 text-sm">
                <td className="px-4 py-3">{property.title}</td>
                <td className="px-4 py-3">{property.property_type}</td>
                <td className="px-4 py-3">{property.total_chips}</td>
                <td className="px-4 py-3">{property.chips_available}</td>
                <td className="px-4 py-3">
                  {property.is_active ? (
                    <span className="text-green-400">Active</span>
                  ) : (
                    <span className="text-red-400">Inactive</span>
                  )}
                </td>
                <td className="px-4 py-3">
                  <Link
                    href={`/admin/properties/edit/${property.id}`}
                    className="text-blue-400 hover:underline"
                  >
                    Edit
                  </Link>
                </td>
              </tr>
            ))}
          </tbody>
        </table>
      )}
    </main>
  )
}
