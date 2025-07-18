// File: app/admin/users/[id]/page.tsx
'use client'

import { useEffect, useState } from 'react'
import { useRouter, useParams } from 'next/navigation'
import { createClientComponentClient } from '@supabase/auth-helpers-nextjs'
import { Database } from '@/types/supabase'
import Link from 'next/link'

export default function ViewUserPage() {
  const supabase = createClientComponentClient<Database>()
  const router = useRouter()
  const { id } = useParams()
  const [user, setUser] = useState<any>(null)
  const [loading, setLoading] = useState(true)
  const [error, setError] = useState<string | null>(null)

  useEffect(() => {
    const fetchUser = async () => {
      setLoading(true)
      const { data, error } = await supabase
        .from('users_extended')
        .select('*')
        .eq('id', id)
        .single()

      if (error) {
        setError('Failed to load user details.')
      } else {
        setUser(data)
      }
      setLoading(false)
    }

    if (id) fetchUser()
  }, [id])

  if (loading) return <p className="text-white p-4">Loading user details...</p>
  if (error) return <p className="text-red-500 p-4">{error}</p>
  if (!user) return <p className="text-white p-4">User not found.</p>

  return (
    <main className="min-h-screen bg-blue-950 text-white p-6">
      <div className="max-w-3xl mx-auto border border-emerald-700 rounded p-6">
        <h1 className="text-xl font-bold mb-4">User Details: {user.first_name} {user.last_name}</h1>

        <div className="grid grid-cols-1 md:grid-cols-2 gap-4 text-sm">
          <p><strong>Email:</strong> {user.email}</p>
          <p><strong>Phone:</strong> {user.phone}</p>
          <p><strong>Date of Birth:</strong> {user.dob}</p>

          <p><strong>Residential Address:</strong><br />
            {user.res_address_line1}<br />
            {user.res_address_line2}<br />
            {user.res_city}, {user.res_state} {user.res_zip}
          </p>

          <p><strong>Mailing Address:</strong><br />
            {user.mail_address_line1}<br />
            {user.mail_address_line2}<br />
            {user.mail_city}, {user.mail_state} {user.mail_zip}
          </p>

          <p><strong>Registration Status:</strong> {user.registration_status}</p>
          <p><strong>Approval Status:</strong> {user.approval_status}</p>
        </div>

        <div className="mt-6 flex gap-4">
          <Link href={`/admin/users/${id}/edit-user`} className="bg-emerald-600 hover:bg-emerald-700 px-4 py-2 rounded text-white text-sm">Edit User</Link>
          <Link href={`/admin/users/${id}/approve`} className="bg-blue-600 hover:bg-blue-700 px-4 py-2 rounded text-white text-sm">Approve</Link>
          <Link href={`/admin/users/${id}/deny`} className="bg-red-600 hover:bg-red-700 px-4 py-2 rounded text-white text-sm">Deny</Link>
        </div>
      </div>
    </main>
  )
}
