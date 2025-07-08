'use client'

import { useEffect, useState } from 'react'
import { createBrowserClient } from '@supabase/ssr'
import toast, { Toaster } from 'react-hot-toast'

type Chip = {
  id: string
  serial: string
  property_id: string
  user_id: string | null
  created_at: string
  assigned_at: string | null
  is_active: boolean
  is_hidden: boolean
  property_title: string
  user_email: string | null
}

export default function ChipsPage() {
  const supabase = createBrowserClient<any>(
    process.env.NEXT_PUBLIC_SUPABASE_URL!,
    process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY!
  )

  const [chips, setChips] = useState<Chip[]>([])
  const [properties, setProperties] = useState<any[]>([])
  const [users, setUsers] = useState<any[]>([])
  const [propertyId, setPropertyId] = useState('')
  const [chipCount, setChipCount] = useState(1)
  const [selectedUserId, setSelectedUserId] = useState('')
  const [assignPropertyId, setAssignPropertyId] = useState('')
  const [assignCount, setAssignCount] = useState(1)
  const [filterProperty, setFilterProperty] = useState('')
  const [filterUser, setFilterUser] = useState('')
  const [filterDate, setFilterDate] = useState('')
  const [currentPage, setCurrentPage] = useState(1)
  const [jumpPage, setJumpPage] = useState('')
  const pageSize = 10

  useEffect(() => {
    fetchAll()
  }, [])

  async function fetchAll() {
    const [chipRes, propertyRes, userRes] = await Promise.all([
      supabase.from('chips_view').select('*'),
      supabase.from('properties').select('id, title'),
      supabase.from('users_extended').select('id, email'),
    ])
    setChips(chipRes.data || [])
    setProperties(propertyRes.data || [])
    setUsers(userRes.data || [])
  }

  const filteredChips = chips.filter((chip) => {
    const matchesProperty = !filterProperty || chip.property_id === filterProperty
    const matchesUser = !filterUser || chip.user_id === filterUser
    const matchesDate = !filterDate || chip.created_at.startsWith(filterDate)
    return matchesProperty && matchesUser && matchesDate
  })

  const paginatedChips = filteredChips.slice((currentPage - 1) * pageSize, currentPage * pageSize)
  const totalPages = Math.ceil(filteredChips.length / pageSize)

  async function createChips() {
    if (!propertyId || chipCount < 1) return
    const { error } = await supabase.rpc('bulk_create_chips', {
      property_uuid: propertyId,
      count: chipCount,
    })
    error ? toast.error('Create failed') : toast.success('Chips created')
    fetchAll()
  }

  async function assignChips() {
    if (!assignPropertyId || !selectedUserId || assignCount < 1) return
    const { error } = await supabase.rpc('bulk_assign_chips', {
      property_uuid: assignPropertyId,
      user_uuid: selectedUserId,
      count: assignCount,
    })
    error ? toast.error('Assign failed') : toast.success('Chips assigned')
    fetchAll()
  }

  return (
    <div className="p-6 bg-gray-900 min-h-screen text-white">
      <Toaster />
      <h1 className="text-3xl font-bold mb-4">Manage Chips</h1>

      <div className="flex gap-8 mb-6">
        <div className="border border-white p-4 rounded w-1/2">
          <h2 className="text-xl mb-2 font-semibold">Create Chips</h2>
          <select value={propertyId} onChange={(e) => setPropertyId(e.target.value)} className="w-full p-2 mb-2 bg-gray-800 text-white border border-gray-500 rounded">
            <option value="">Select Property</option>
            {properties.map(p => <option key={p.id} value={p.id}>{p.title}</option>)}
          </select>
          <input type="number" value={chipCount} onChange={(e) => setChipCount(Number(e.target.value))} className="w-full p-2 mb-2 bg-gray-800 text-white border border-gray-500 rounded" min={1} />
          <button onClick={createChips} className="bg-emerald-500 px-4 py-2 rounded hover:bg-emerald-600 w-full">Create</button>
        </div>

        <div className="border border-white p-4 rounded w-1/2">
          <h2 className="text-xl mb-2 font-semibold">Assign Chips</h2>
          <select value={assignPropertyId} onChange={(e) => setAssignPropertyId(e.target.value)} className="w-full p-2 mb-2 bg-gray-800 text-white border border-gray-500 rounded">
            <option value="">Select Property</option>
            {properties.map(p => <option key={p.id} value={p.id}>{p.title}</option>)}
          </select>
          <select value={selectedUserId} onChange={(e) => setSelectedUserId(e.target.value)} className="w-full p-2 mb-2 bg-gray-800 text-white border border-gray-500 rounded">
            <option value="">Select User</option>
            {users.map(u => <option key={u.id} value={u.id}>{u.email}</option>)}
          </select>
          <input type="number" value={assignCount} onChange={(e) => setAssignCount(Number(e.target.value))} className="w-full p-2 mb-2 bg-gray-800 text-white border border-gray-500 rounded" min={1} />
          <button onClick={assignChips} className="bg-emerald-500 px-4 py-2 rounded hover:bg-emerald-600 w-full">Assign</button>
        </div>
      </div>

      {/* Filters */}
      <div className="mb-4 flex gap-4 items-center">
        <select value={filterProperty} onChange={(e) => setFilterProperty(e.target.value)} className="bg-gray-800 text-white p-2 border border-gray-500 rounded">
          <option value="">All Properties</option>
          {properties.map(p => <option key={p.id} value={p.id}>{p.title}</option>)}
        </select>
        <select value={filterUser} onChange={(e) => setFilterUser(e.target.value)} className="bg-gray-800 text-white p-2 border border-gray-500 rounded">
          <option value="">All Users</option>
          {users.map(u => <option key={u.id} value={u.id}>{u.email}</option>)}
        </select>
        <input type="date" value={filterDate} onChange={(e) => setFilterDate(e.target.value)} className="bg-gray-800 text-white p-2 border border-gray-500 rounded" placeholder="Filter Date" />
      </div>

      {/* Chip table */}
      <table className="w-full table-auto border border-white">
        <thead>
          <tr className="bg-gray-800">
            <th className="p-2">Property</th>
            <th className="p-2">Owner</th>
            <th className="p-2">Created</th>
            <th className="p-2">Assigned</th>
            <th className="p-2">Serial #</th>
            <th className="p-2">Actions</th>
          </tr>
        </thead>
        <tbody>
          {paginatedChips.map((chip) => (
            <tr key={chip.id} className="border-t border-gray-700">
              <td className="p-2">{chip.property_title}</td>
              <td className="p-2">{chip.user_email ?? '—'}</td>
              <td className="p-2">{chip.created_at}</td>
              <td className="p-2">{chip.assigned_at ?? '—'}</td>
              <td className="p-2">{chip.serial}</td>
              <td className="p-2 flex gap-2">
                <button className="bg-red-600 text-white px-2 rounded text-sm">Delete</button>
                <button className="bg-yellow-600 text-white px-2 rounded text-sm">Inactivate</button>
                <button className="bg-gray-600 text-white px-2 rounded text-sm">Hide</button>
              </td>
            </tr>
          ))}
        </tbody>
      </table>

      {/* Pagination */}
      <div className="mt-4 flex items-center gap-4">
        <button disabled={currentPage === 1} onClick={() => setCurrentPage(p => p - 1)} className="px-3 py-1 bg-white text-black rounded disabled:opacity-50">Previous</button>
        <span>Page {currentPage} of {totalPages}</span>
        <button disabled={currentPage === totalPages} onClick={() => setCurrentPage(p => p + 1)} className="px-3 py-1 bg-white text-black rounded disabled:opacity-50">Next</button>
        <input
          type="number"
          value={jumpPage}
          onChange={(e) => setJumpPage(e.target.value)}
          placeholder="Go to page"
          className="p-1 text-black w-24 rounded"
        />
        <button onClick={() => setCurrentPage(Number(jumpPage))} className="px-2 py-1 bg-blue-500 rounded">Go</button>
      </div>
    </div>
  )
}
