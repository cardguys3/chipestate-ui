'use client'

import { useEffect, useState } from 'react'
import { useRouter } from 'next/navigation'
import { useSession, useSupabaseClient } from '@supabase/auth-helpers-react'

type UserRow = {
  id: string
  email: string
  first_name: string
  last_name: string
  created_at: string
  is_approved: boolean
}

export default function AdminUsersPage() {
  const session = useSession()
  const router = useRouter()
  const supabase = useSupabaseClient()
  const [users, setUsers] = useState<UserRow[]>([])
  const [loading, setLoading] = useState(true)

  useEffect(() => {
    if (!session) return
    const email = session.user?.email
    const isAdmin = ['mark@chipestate.com', 'cardguys3@gmail.com'].includes(email || '')
    if (!isAdmin) {
      router.push('/')
      return
    }

    const fetchUsers = async () => {
      const { data, error } = await supabase
        .from('users_extended')
        .select('id, email, first_name, last_name, created_at, is_approved')
        .order('created_at', { ascending: false })

      if (error) {
        console.error('Error loading users:', error)
      } else {
        setUsers(data as UserRow[])
      }

      setLoading(false)
    }

    fetchUsers()
  }, [session])

  const handleDelete = async (id: string) => {
    if (!confirm('Are you sure you want to delete this user?')) return
    const { error } = await supabase.from('users_extended').delete().eq('id', id)
    if (error) alert('Failed to delete user')
    else setUsers((prev) => prev.filter((u) => u.id !== id))
  }

  const handleResetPassword = async (email: string) => {
    const { error } = await supabase.auth.resetPasswordForEmail(email, {
      redirectTo: 'https://chipestate.com/reset-password',
    })
    if (error) alert('Failed to send reset link')
    else alert('Password reset email sent')
  }

  return (
    <main className="min-h-screen bg-gray-50 p-6">
      <h1 className="text-2xl font-bold text-blue-900 mb-6">Manage Users</h1>
      {loading ? (
        <p className="text-gray-600">Loading users...</p>
      ) : (
        <div className="overflow-x-auto">
          <table className="min-w-full bg-white border border-blue-900 rounded-lg shadow">
            <thead className="bg-blue-900 text-white">
              <tr>
                <th className="px-4 py-2 text-left">Name</th>
                <th className="px-4 py-2 text-left">Email</th>
                <th className="px-4 py-2 text-left">Approved</th>
                <th className="px-4 py-2 text-left">Created</th>
                <th className="px-4 py-2">Actions</th>
              </tr>
            </thead>
            <tbody>
              {users.map((user) => (
                <tr key={user.id} className="border-t hover:bg-blue-50">
                  <td className="px-4 py-2">{user.first_name} {user.last_name}</td>
                  <td className="px-4 py-2">{user.email}</td>
                  <td className="px-4 py-2">{user.is_approved ? '✅' : '❌'}</td>
                  <td className="px-4 py-2">{new Date(user.created_at).toLocaleDateString()}</td>
                  <td className="px-4 py-2 space-x-2 text-sm">
                    <button onClick={() => handleResetPassword(user.email)} className="text-blue-700 hover:text-blue-900 underline">Reset</button>
                    <button onClick={() => handleDelete(user.id)} className="text-red-600 hover:text-red-800 underline">Delete</button>
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      )}
    </main>
  )
}
