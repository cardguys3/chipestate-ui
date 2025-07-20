// File: app/admin/users/page.tsx
'use client'

import { useEffect, useState } from 'react'
import { useRouter } from 'next/navigation'
import Link from 'next/link'
import { supabase } from '@/lib/supabaseClient'

export default function AdminUsersPage() {
  const router = useRouter()
  const [users, setUsers] = useState<any[]>([])
  const [filters, setFilters] = useState({
    name: '',
    email: '',
    state: '',
    approved: '',
    active: ''
  })

  useEffect(() => {
    fetchUsers()
  }, [])

  async function fetchUsers() {
    const { data } = await supabase
      .from('users_extended')
      .select('*')
      .order('created_at', { ascending: false })

    if (data) setUsers(data)
  }

  async function toggleApproval(id: string, current: boolean) {
    await supabase.from('users_extended').update({ is_approved: !current }).eq('id', id)
    fetchUsers()
  }

  async function toggleActive(id: string, current: boolean) {
    await supabase.from('users_extended').update({ is_active: !current }).eq('id', id)
    fetchUsers()
  }

  const filteredUsers = users.filter((u) => {
    const fullName = `${u.first_name ?? ''} ${u.last_name ?? ''}`.toLowerCase()
    return (
      (!filters.name || fullName.includes(filters.name.toLowerCase())) &&
      (!filters.email || u.email?.toLowerCase().includes(filters.email.toLowerCase())) &&
      (!filters.state || u.res_state?.toLowerCase().includes(filters.state.toLowerCase())) &&
      (!filters.approved || String(u.is_approved) === filters.approved) &&
      (!filters.active || String(u.is_active) === filters.active)
    )
  })

  const formatDate = (dateStr: string | null) => {
    if (!dateStr) return '—'
    const d = new Date(dateStr)
    return isNaN(d.getTime()) ? '—' : d.toLocaleDateString()
  }

  return (
    <main className="min-h-screen bg-[#0B1D33] text-white p-6 space-y-6">
      <div className="flex items-center justify-between">
        <h1 className="text-3xl font-bold">Users</h1>
        <Link
          href="/admin/users/[id]/add"
          className="bg-emerald-600 hover:bg-emerald-700 text-white px-4 py-2 rounded-xl shadow"
        >
          + Add User
        </Link>
      </div>

      <div className="grid grid-cols-2 sm:grid-cols-6 gap-4">
        <input
          type="text"
          placeholder="Filter by name"
          value={filters.name}
          onChange={(e) => setFilters({ ...filters, name: e.target.value })}
          className="p-2 rounded bg-[#0B1D33] border border-gray-600 text-white"
        />
        <input
          type="text"
          placeholder="Filter by email"
          value={filters.email}
          onChange={(e) => setFilters({ ...filters, email: e.target.value })}
          className="p-2 rounded bg-[#0B1D33] border border-gray-600 text-white"
        />
        <input
          type="text"
          placeholder="Filter by state"
          value={filters.state}
          onChange={(e) => setFilters({ ...filters, state: e.target.value })}
          className="p-2 rounded bg-[#0B1D33] border border-gray-600 text-white"
        />
        <select
          value={filters.approved}
          onChange={(e) => setFilters({ ...filters, approved: e.target.value })}
          className="p-2 rounded bg-[#0B1D33] border border-gray-600 text-white"
        >
          <option value="">Approved?</option>
          <option value="true">Approved</option>
          <option value="false">Not Approved</option>
        </select>
        <select
          value={filters.active}
          onChange={(e) => setFilters({ ...filters, active: e.target.value })}
          className="p-2 rounded bg-[#0B1D33] border border-gray-600 text-white"
        >
          <option value="">Active?</option>
          <option value="true">Active</option>
          <option value="false">Inactive</option>
        </select>
        <button onClick={fetchUsers} className="bg-blue-600 hover:bg-blue-700 px-4 py-2 rounded text-white">
          Refresh
        </button>
      </div>

      {filteredUsers.length === 0 ? (
        <p className="text-lg text-gray-300">No users found.</p>
      ) : (
        <div className="overflow-x-auto rounded-lg border border-gray-700">
          <table className="min-w-full text-sm">
            <thead className="bg-gray-800 text-left text-white">
              <tr>
                <th className="p-3 font-semibold">Name</th>
                <th className="p-3 font-semibold">Email</th>
                <th className="p-3 font-semibold">State</th>
                <th className="p-3 font-semibold whitespace-nowrap">Created</th>
                <th className="p-3 font-semibold">Approved</th>
                <th className="p-3 font-semibold">Active</th>
                <th className="p-3 font-semibold">Actions</th>
              </tr>
            </thead>
            <tbody>
              {filteredUsers.map((u) => {
                const name = `${u.first_name ?? ''} ${u.last_name ?? ''}`.trim() || '—'
                return (
                  <tr key={u.id} className="border-t border-gray-700 hover:bg-white/5">
                    <td className="p-3">
                      <Link
                        href={`/admin/users/${u.id}`}
                        className="text-blue-400 hover:underline"
                      >
                        {name}
                      </Link>
                    </td>
                    <td className="p-3">{u.email ?? '—'}</td>
                    <td className="p-3">{u.res_state ?? '—'}</td>
                    <td className="p-3 whitespace-nowrap">{formatDate(u.created_at)}</td>
                    <td className="p-3">{u.is_approved ? 'Yes' : 'No'}</td>
                    <td className="p-3">{u.is_active ? 'Yes' : 'No'}</td>
                    <td className="p-3 space-x-3">
                      <Link
                        href={`/admin/users/${u.id}/edit-user`}
                        className="text-emerald-400 hover:underline"
                      >
                        Edit
                      </Link>
                      <button
                        onClick={() => toggleApproval(u.id, u.is_approved)}
                        className="text-yellow-400 hover:underline"
                      >
                        {u.is_approved ? 'Deny' : 'Approve'}
                      </button>
                      <button
                        onClick={() => toggleActive(u.id, u.is_active)}
                        className="text-red-400 hover:underline"
                      >
                        {u.is_active ? 'Deactivate' : 'Activate'}
                      </button>
                    </td>
                  </tr>
                )
              })}
            </tbody>
          </table>
        </div>
      )}
    </main>
  )
}
