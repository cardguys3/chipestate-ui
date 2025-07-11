'use client'

import Link from 'next/link'
import { useEffect, useState } from 'react'

type User = {
  id: string
  email: string
  first_name: string
  last_name: string
  res_state: string | null
  created_at: string
}

export default function AdminUsersPage() {
  const [users, setUsers] = useState<User[]>([])
  const [error, setError] = useState<string | null>(null)

  useEffect(() => {
    async function fetchUsers() {
      try {
        const res = await fetch('/api/admin/users')
        if (!res.ok) throw new Error('Failed to fetch users')
        const data = await res.json()
        setUsers(data)
      } catch (err: any) {
        setError(err.message || 'Error loading users')
      }
    }

    fetchUsers()
  }, [])

  if (error) {
    return <main><p className="text-red-600 text-xl">{error}</p></main>
  }

  return (
    <main className="p-6">
      <h1 className="text-2xl font-bold mb-4">Users</h1>
      <table className="w-full border">
        <thead>
          <tr className="bg-gray-100 dark:bg-gray-800 text-left">
            <th className="p-2">Name</th>
            <th className="p-2">Email</th>
            <th className="p-2">State</th>
            <th className="p-2">Created At</th>
            <th className="p-2">Actions</th>
          </tr>
        </thead>
        <tbody>
          {users.map((user) => (
            <tr key={user.id} className="border-t">
              <td className="p-2">{user.first_name} {user.last_name}</td>
              <td className="p-2">{user.email}</td>
              <td className="p-2">{user.res_state || '—'}</td>
              <td className="p-2">{new Date(user.created_at).toLocaleDateString()}</td>
              <td className="p-2">
                <Link href={`/admin/users/${user.id}/edit-user`} className="text-blue-600 hover:underline">Edit</Link>
              </td>
            </tr>
          ))}
        </tbody>
      </table>
    </main>
  )
}
