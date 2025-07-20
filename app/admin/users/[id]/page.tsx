// app/admin/users/[id]/page.tsx
'use client'

import { useEffect, useState } from 'react'
import { useParams } from 'next/navigation'
import { createBrowserClient } from '@supabase/ssr'
import Link from 'next/link'

const supabase = createBrowserClient(
  process.env.NEXT_PUBLIC_SUPABASE_URL!,
  process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY!
)

export default function AdminUserDetailPage() {
  const { id } = useParams()
  const [user, setUser] = useState<any>(null)
  const [error, setError] = useState<string>('')

  useEffect(() => {
    if (!id || typeof id !== 'string') {
      setError('Invalid user ID.')
      return
    }

    const fetchUser = async () => {
      const { data, error } = await supabase.from('users_extended').select('*').eq('id', id).single()
      if (error || !data) {
        console.error('Error loading user:', error)
        setError('User not found.')
        return
      }
      setUser(data)
    }

    fetchUser()
  }, [id])

  if (error) {
    return <div className="min-h-screen p-10 text-red-500">{error}</div>
  }

  if (!user) {
    return <div className="min-h-screen p-10 text-white">Loading user...</div>
  }

  return (
    <main className="min-h-screen bg-[#0B1D33] text-white p-6 space-y-6">
      <h1 className="text-2xl font-bold">User Details</h1>
      <div className="border border-gray-700 p-6 rounded-xl space-y-4">
        <p><strong>Name:</strong> {user.first_name ?? ''} {user.last_name ?? ''}</p>
        <p><strong>Email:</strong> {user.email}</p>
        <p><strong>Phone:</strong> {user.phone ?? '—'}</p>
        <p><strong>State:</strong> {user.res_state ?? '—'}</p>
        <p><strong>Approved:</strong> {user.is_approved ? 'Yes' : 'No'}</p>
        <p><strong>Active:</strong> {user.is_active ? 'Yes' : 'No'}</p>
        <p><strong>Created:</strong> {new Date(user.created_at).toLocaleString()}</p>
      </div>
      <Link
        href={`/admin/users/${user.id}/edit-user`}
        className="inline-block mt-4 px-4 py-2 bg-emerald-600 rounded hover:bg-emerald-700"
      >
        Edit User
      </Link>
    </main>
  )
}
