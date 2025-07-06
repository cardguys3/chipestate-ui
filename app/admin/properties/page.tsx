'use client'

import { useEffect, useState } from 'react'
import { useSession, useSupabaseClient } from '@supabase/auth-helpers-react'
import { useRouter } from 'next/navigation'
import Link from 'next/link'

type Property = {
  id: string
  title: string
  city: string
  state: string
  purchase_price: number
  current_value: number
  image_url: string | null
  occupied: boolean
  is_active: boolean
}

export default function AdminPropertiesPage() {
  const session = useSession()
  const router = useRouter()
  const supabase = useSupabaseClient()
  const [properties, setProperties] = useState<Property[]>([])
  const [loading, setLoading] = useState(true)

  useEffect(() => {
    if (!session) return
    const email = session.user?.email
    const isAdmin = ['mark@chipestate.com', 'cardguys3@gmail.com'].includes(email || '')
    if (!isAdmin) {
      router.push('/')
      return
    }

    const loadProperties = async () => {
      const { data, error } = await supabase
        .from('properties')
        .select('*')
        .order('created_at', { ascending: false })

      if (error) {
        console.error('Error loading properties:', error)
      } else {
        setProperties(data || [])
      }
      setLoading(false)
    }

    loadProperties()
  }, [session])

  const handleDelete = async (id: string) => {
    if (!confirm('Are you sure you want to delete this property?')) return
    const { error } = await supabase.from('properties').delete().eq('id', id)
    if (error) {
      alert('Failed to delete property')
    } else {
      setProperties((prev) => prev.filter((p) => p.id !== id))
    }
  }

  return (
    <main className="min-h-screen bg-gray-50 p-6">
      <div className="flex justify-between items-center mb-6">
        <h1 className="text-2xl font-bold text-blue-900">Manage Properties</h1>
        <Link
          href="/admin/properties/new"
          className="bg-emerald-600 text-white px-4 py-2 rounded-md hover:bg-emerald-700"
        >
          Add Property
        </Link>
      </div>

      {loading ? (
        <p>Loading properties...</p>
      ) : properties.length === 0 ? (
        <p className="text-gray-600">No properties found.</p>
      ) : (
        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-6">
          {properties.map((p) => (
            <div key={p.id} className="border rounded-lg bg-white shadow-md overflow-hidden">
              {p.image_url ? (
                <img src={p.image_url} alt={p.title} className="h-40 w-full object-cover" />
              ) : (
                <div className="h-40 bg-gray-200 flex items-center justify-center text-gray-500 text-sm">
                  No Image
                </div>
              )}
              <div className="p-4 space-y-1">
                <h2 className="text-lg font-semibold text-blue-900">{p.title}</h2>
                <p className="text-sm text-gray-600">
                  {p.city}, {p.state}
                </p>
                <p className="text-sm">💰 ${p.current_value.toLocaleString()}</p>
                <p className="text-sm">🏠 {p.occupied ? 'Occupied' : 'Vacant'}</p>
              </div>
              <div className="px-4 pb-4 flex justify-between">
                <Link href={`/admin/properties/edit/${p.id}`} className="text-blue-700 hover:underline">
                  Edit
                </Link>
                <button onClick={() => handleDelete(p.id)} className="text-red-600 hover:underline">
                  Delete
                </button>
              </div>
            </div>
          ))}
        </div>
      )}
    </main>
  )
}
