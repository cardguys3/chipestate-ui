// File: app/admin/users/page.tsx

'use client'

import { useEffect, useState } from 'react'
import { useRouter } from 'next/navigation'
import Link from 'next/link'
import { supabase } from '@/lib/supabaseClient'

function formatPhoneNumber(phone: string | null): string {
  if (!phone) return '—'
  const cleaned = phone.replace(/\D/g, '')
  const match = cleaned.match(/^(\d{3})(\d{3})(\d{4})$/)
  return match ? `(${match[1]}) ${match[2]}-${match[3]}` : phone
}

export default function AdminUsersPage() {
  const router = useRouter()
  const [users, setUsers] = useState<any[]>([])
  const [verifications, setVerifications] = useState<Record<string, string | null>>({})
  const [filters, setFilters] = useState({
    name: '',
    email: '',
    state: '',
    activeOnly: false,
    approvedOnly: false,
    unverifiedOnly: false
  })
  const [sortField, setSortField] = useState<string>('created_at')
  const [sortDirection, setSortDirection] = useState<'asc' | 'desc'>('desc')

  useEffect(() => {
    fetchUsers()
  }, [])

  async function fetchUsers() {
    const { data: usersData } = await supabase
      .from('users_extended')
      .select('*')
      .order('created_at', { ascending: false })

    const { data: logsData } = await supabase
      .from('status_change_log')
      .select('entity_id, created_at')
      .eq('status_type', 'email_verification')
      .eq('status', 'resent')

    const recentVerifications: Record<string, string | null> = {}
    if (logsData) {
      for (const log of logsData) {
        if (!recentVerifications[log.entity_id] || new Date(log.created_at) > new Date(recentVerifications[log.entity_id]!)) {
          recentVerifications[log.entity_id] = log.created_at
        }
      }
    }

    if (usersData) {
      setUsers(usersData)
      setVerifications(recentVerifications)
    }
  }

  async function toggleApproval(id: string, current: boolean) {
    const { data: { session } } = await supabase.auth.getSession()
    const adminId = session?.user?.id ?? null

    await supabase.from('users_extended').update({ is_approved: !current }).eq('id', id)

    await supabase.from('status_change_log').insert({
      entity_type: 'user',
      entity_id: id,
      status: !current ? 'approved' : 'not_approved',
      status_type: 'approval',
      changed_by: adminId
    })

    fetchUsers()
  }

  async function toggleActive(id: string, current: boolean) {
    const { data: { session } } = await supabase.auth.getSession()
    const adminId = session?.user?.id ?? null

    await supabase.from('users_extended').update({ is_active: !current }).eq('id', id)

    await supabase.from('status_change_log').insert({
      entity_type: 'user',
      entity_id: id,
      status: !current ? 'active' : 'inactive',
      status_type: 'active',
      changed_by: adminId
    })

    fetchUsers()
  }

  async function resendVerification(email: string, id: string) {
    const { data: { session } } = await supabase.auth.getSession()
    const adminId = session?.user?.id ?? null

    const today = new Date().toISOString().split('T')[0]
    const lastSentDate = verifications[id]?.split('T')[0]

    if (lastSentDate === today) {
      alert('Verification email already sent today.')
      return
    }

    const { error } = await supabase.auth.resend({
      type: 'signup',
      email,
      options: {
        emailRedirectTo: 'https://chipestate.com/dashboard',
      }
    })

    if (error) {
      console.error(error)
      alert('Failed to send verification email.')
    } else {
      alert('Verification email sent.')
      await supabase.from('status_change_log').insert({
        entity_type: 'user',
        entity_id: id,
        status: 'resent',
        status_type: 'email_verification',
        changed_by: adminId
      })
      fetchUsers()
    }
  }

  async function manuallyVerifyEmail(id: string) {
    const { data: { session } } = await supabase.auth.getSession()
    const adminId = session?.user?.id ?? null

    const { error } = await supabase
      .from('users_extended')
      .update({ email_confirmed_at: new Date().toISOString() })
      .eq('id', id)

    if (error) {
      console.error(error)
      alert('Failed to manually verify email.')
      return
    }

    await supabase.from('status_change_log').insert({
      entity_type: 'user',
      entity_id: id,
      status_type: 'email_verification',
      status: 'manual_override',
      changed_by: adminId
    })

    alert('Email manually marked as verified.')
    fetchUsers()
  }

  const handleSort = (field: string) => {
    if (sortField === field) {
      setSortDirection((prev) => (prev === 'asc' ? 'desc' : 'asc'))
    } else {
      setSortField(field)
      setSortDirection('asc')
    }
  }

  const filtered = users
    .filter((u) => {
      const fullName = `${u.first_name ?? ''} ${u.last_name ?? ''}`.toLowerCase()
      return (
        (!filters.name || fullName.includes(filters.name.toLowerCase())) &&
        (!filters.email || u.email?.toLowerCase().includes(filters.email.toLowerCase())) &&
        (!filters.state || u.res_state?.toLowerCase().includes(filters.state.toLowerCase())) &&
        (!filters.activeOnly || u.is_active) &&
        (!filters.approvedOnly || u.is_approved) &&
        (!filters.unverifiedOnly || !u.email_confirmed_at)
      )
    })
    .sort((a, b) => {
      const aValue = a[sortField]
      const bValue = b[sortField]
      if (typeof aValue === 'string' && typeof bValue === 'string') {
        return sortDirection === 'asc'
          ? aValue.localeCompare(bValue)
          : bValue.localeCompare(aValue)
      }
      return sortDirection === 'asc'
        ? Number(aValue) - Number(bValue)
        : Number(bValue) - Number(aValue)
    })

  const formatDate = (dateStr: string | null) => {
    if (!dateStr) return '—'
    const d = new Date(dateStr)
    return isNaN(d.getTime()) ? '—' : d.toLocaleDateString()
  }

  const daysAgo = (dateStr: string) => {
    const diff = (new Date().getTime() - new Date(dateStr).getTime()) / (1000 * 60 * 60 * 24)
    return Math.floor(diff)
  }

  const sortArrow = (field: string) =>
    sortField === field ? (sortDirection === 'asc' ? '↑' : '↓') : ''

  return (
    <main className="min-h-screen bg-[#0B1D33] text-white p-6 space-y-6">
      <div className="flex items-center justify-between">
        <h1 className="text-3xl font-bold">Users</h1>
        <Link
          href="/admin/users/add"
          className="bg-emerald-600 hover:bg-emerald-700 text-white px-4 py-2 rounded-xl shadow"
        >
          + Add User
        </Link>
      </div>

      <div className="border border-emerald-600 p-4 rounded-xl space-y-4">
        <h2 className="text-xl font-semibold text-emerald-400">Filter Users</h2>
        <div className="grid grid-cols-1 sm:grid-cols-4 gap-4">
          <input type="text" placeholder="Name" value={filters.name} onChange={(e) => setFilters({ ...filters, name: e.target.value })} className="p-2 rounded bg-[#0B1D33] border border-gray-600 text-white" />
          <input type="text" placeholder="Email" value={filters.email} onChange={(e) => setFilters({ ...filters, email: e.target.value })} className="p-2 rounded bg-[#0B1D33] border border-gray-600 text-white" />
          <input type="text" placeholder="State" value={filters.state} onChange={(e) => setFilters({ ...filters, state: e.target.value })} className="p-2 rounded bg-[#0B1D33] border border-gray-600 text-white" />
          <label className="flex items-center space-x-2">
            <input type="checkbox" checked={filters.activeOnly} onChange={(e) => setFilters({ ...filters, activeOnly: e.target.checked })} />
            <span>Active Only</span>
          </label>
          <label className="flex items-center space-x-2">
            <input type="checkbox" checked={filters.approvedOnly} onChange={(e) => setFilters({ ...filters, approvedOnly: e.target.checked })} />
            <span>Approved Only</span>
          </label>
          <label className="flex items-center space-x-2">
            <input type="checkbox" checked={filters.unverifiedOnly} onChange={(e) => setFilters({ ...filters, unverifiedOnly: e.target.checked })} />
            <span>Unverified Only</span>
          </label>
        </div>
      </div>

      {filtered.length === 0 ? (
        <p className="text-lg text-gray-300">No users found.</p>
      ) : (
        <div className="overflow-x-auto rounded-lg border border-gray-700">
          <table className="min-w-full text-sm">
            <thead className="bg-gray-800 text-left text-white">
              <tr>
                <th className="p-3 font-semibold cursor-pointer" onClick={() => handleSort('name')}>Name {sortArrow('name')}</th>
                <th className="p-3 font-semibold cursor-pointer" onClick={() => handleSort('email')}>Email {sortArrow('email')}</th>
                <th className="p-3 font-semibold">Phone</th>
                <th className="p-3 font-semibold cursor-pointer" onClick={() => handleSort('res_state')}>State {sortArrow('res_state')}</th>
                <th className="p-3 font-semibold cursor-pointer" onClick={() => handleSort('created_at')}>Created {sortArrow('created_at')}</th>
                <th className="p-3 font-semibold cursor-pointer" onClick={() => handleSort('is_approved')}>Acct Approved {sortArrow('is_approved')}</th>
                <th className="p-3 font-semibold cursor-pointer" onClick={() => handleSort('is_active')}>Active {sortArrow('is_active')}</th>
                <th className="p-3 font-semibold">Email Verified</th>
                <th className="p-3 font-semibold">Actions</th>
              </tr>
            </thead>
            <tbody>
              {filtered.map((u) => {
                const name = `${u.first_name ?? ''} ${u.last_name ?? ''}`.trim() || '—'
                const lastSent = verifications[u.id]

                return (
                  <tr key={u.id} className="border-t border-gray-700 hover:bg-white/5">
                    <td className="p-3">
                      <Link href={`/admin/users/${u.id}`} className="text-blue-400 hover:underline">
                        {name}
                      </Link>
                    </td>
                    <td className="p-3">{u.email ?? '—'}</td>
                    <td className="p-3">{formatPhoneNumber(u.phone)}</td>
                    <td className="p-3">{u.res_state ?? '—'}</td>
                    <td className="p-3">{formatDate(u.created_at)}</td>
                    <td className="p-3">{u.is_approved ? 'Yes' : 'No'}</td>
                    <td className="p-3">{u.is_active ? 'Yes' : 'No'}</td>
                    <td className="p-3">
                      {u.email_confirmed_at
                        ? 'Yes'
                        : lastSent
                          ? `Sent ${daysAgo(lastSent)} day(s) ago`
                          : (
                            <>
                              <button onClick={() => resendVerification(u.email, u.id)} className="text-blue-400 hover:underline">Send</button>
                              <span className="mx-2">|</span>
                              <button onClick={() => manuallyVerifyEmail(u.id)} className="text-green-400 hover:underline">Verify</button>
                            </>
                          )
                      }
                    </td>
                    <td className="p-3 space-x-3">
                      <Link href={`/admin/users/${u.id}/edit-user`} className="text-emerald-400 hover:underline">Edit</Link>
                      <button onClick={() => toggleApproval(u.id, u.is_approved)} className="text-yellow-400 hover:underline">
                        {u.is_approved ? 'Deny' : 'Approve'}
                      </button>
                      <button onClick={() => toggleActive(u.id, u.is_active)} className="text-red-400 hover:underline">
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
