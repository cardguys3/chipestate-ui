'use client'

import { useEffect, useState } from 'react'
import { createBrowserClient } from '@supabase/ssr'
import toast, { Toaster } from 'react-hot-toast'

type Chip = {
  id: string
  serial: string
  property_title: string
  user_email?: string
  created_at: string
  assigned_at?: string
}

export default function ChipsPage() {
  const [chips, setChips] = useState<Chip[]>([])
  const [loading, setLoading] = useState(true)
  const [propertyId, setPropertyId] = useState('')
  const [chipCount, setChipCount] = useState(1)
  const [assignEmail, setAssignEmail] = useState('')
  const [assignProperty, setAssignProperty] = useState('')
  const [filterEmail, setFilterEmail] = useState('')
  const [filterProperty, setFilterProperty] = useState('')
  const [filterDate, setFilterDate] = useState('')
  const [currentPage, setCurrentPage] = useState(1)

  const supabase = createBrowserClient(
    process.env.NEXT_PUBLIC_SUPABASE_URL!,
    process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY!
  )

  const pageSize = 10
  const totalPages = Math.ceil(chips.length / pageSize)
  const paginatedChips = chips.slice((currentPage - 1) * pageSize, currentPage * pageSize)

  const fetchChips = async () => {
    setLoading(true)
    let query = supabase
      .from('chips')
      .select(`id, serial, created_at, assigned_at, properties(title), users_extended(email)`)

    if (filterEmail) query = query.eq('users_extended.email', filterEmail)
    if (filterProperty) query = query.eq('properties.title', filterProperty)
    if (filterDate) query = query.gte('created_at', filterDate)

    const { data, error } = await query

    if (!error && data) {
      setChips(
        data.map((chip: any) => ({
          id: chip.id,
          serial: chip.serial,
          created_at: chip.created_at,
          assigned_at: chip.assigned_at,
          property_title: chip.properties?.title ?? 'Unknown',
          user_email: chip.users_extended?.email ?? '',
        }))
      )
    } else {
      toast.error('Failed to load chips')
    }
    setLoading(false)
  }

  const handleCreate = async () => {
    const { error } = await supabase.functions.invoke('create-chips', {
      body: { property_id: propertyId, count: chipCount },
    })
    error ? toast.error('Failed to create chips') : toast.success('Chips created')
    fetchChips()
  }

  const handleAssign = async () => {
    const { error } = await supabase.functions.invoke('assign-chips', {
      body: { property_id: assignProperty, email: assignEmail },
    })
    error ? toast.error('Failed to assign chips') : toast.success('Chips assigned')
    fetchChips()
  }

  const handleDelete = async (serial: string) => {
    const { error } = await supabase.from('chips').delete().eq('serial', serial)
    error ? toast.error('Delete failed') : toast.success('Chip deleted')
    fetchChips()
  }

  const handleInactivate = async (serial: string) => {
    const { error } = await supabase.from('chips').update({ is_active: false }).eq('serial', serial)
    error ? toast.error('Inactivate failed') : toast.success('Chip inactivated')
    fetchChips()
  }

  const handleHide = async (serial: string) => {
    const { error } = await supabase.from('chips').update({ hidden: true }).eq('serial', serial)
    error ? toast.error('Hide failed') : toast.success('Chip hidden')
    fetchChips()
  }

  useEffect(() => {
    fetchChips()
  }, [])

  return (
    <div className="p-8 text-white bg-gray-900 min-h-screen">
      <Toaster />
      <h1 className="text-3xl font-bold mb-6">Manage Chips</h1>

      {/* Create & Assign Chips */}
      <div className="flex gap-8 mb-6">
        <div className="flex-1 bg-gray-800 p-4 rounded border border-gray-700">
          <h2 className="text-xl font-semibold mb-2">Create Chips</h2>
          <input
            type="text"
            placeholder="Property ID"
            value={propertyId}
            onChange={(e) => setPropertyId(e.target.value)}
            className="w-full p-2 mb-2 bg-gray-700 text-white rounded"
          />
          <input
            type="number"
            min={1}
            placeholder="Quantity"
            value={chipCount}
            onChange={(e) => setChipCount(parseInt(e.target.value))}
            className="w-full p-2 mb-2 bg-gray-700 text-white rounded"
          />
          <button
            onClick={handleCreate}
            className="bg-emerald-600 hover:bg-emerald-500 text-white p-2 w-full rounded"
          >
            Create Chips
          </button>
        </div>

        <div className="flex-1 bg-gray-800 p-4 rounded border border-gray-700">
          <h2 className="text-xl font-semibold mb-2">Assign Chips</h2>
          <input
            type="text"
            placeholder="User Email"
            value={assignEmail}
            onChange={(e) => setAssignEmail(e.target.value)}
            className="w-full p-2 mb-2 bg-gray-700 text-white rounded"
          />
          <input
            type="text"
            placeholder="Property ID"
            value={assignProperty}
            onChange={(e) => setAssignProperty(e.target.value)}
            className="w-full p-2 mb-2 bg-gray-700 text-white rounded"
          />
          <button
            onClick={handleAssign}
            className="bg-blue-600 hover:bg-blue-500 text-white p-2 w-full rounded"
          >
            Assign Chips
          </button>
        </div>
      </div>

      {/* Filters */}
      <div className="flex gap-4 mb-6">
        <input
          type="text"
          placeholder="Filter Email"
          value={filterEmail}
          onChange={(e) => setFilterEmail(e.target.value)}
          className="p-2 rounded bg-gray-700 text-white"
        />
        <input
          type="text"
          placeholder="Filter Property"
          value={filterProperty}
          onChange={(e) => setFilterProperty(e.target.value)}
          className="p-2 rounded bg-gray-700 text-white"
        />
        <input
          type="date"
          placeholder="Filter Date"
          value={filterDate}
          onChange={(e) => setFilterDate(e.target.value)}
          className="p-2 rounded bg-gray-700 text-white"
        />
        <button
          onClick={fetchChips}
          className="bg-purple-700 hover:bg-purple-600 p-2 rounded text-white"
        >
          Apply Filters
        </button>
      </div>

      {/* Chips Table */}
      <div className="overflow-x-auto">
        <table className="w-full table-auto border-collapse border border-gray-700 text-sm">
          <thead>
            <tr className="bg-gray-800 text-white">
              <th className="p-2 border border-gray-700">Property</th>
              <th className="p-2 border border-gray-700">Owner</th>
              <th className="p-2 border border-gray-700">Created</th>
              <th className="p-2 border border-gray-700">Assigned</th>
              <th className="p-2 border border-gray-700">Serial #</th>
              <th className="p-2 border border-gray-700">Actions</th>
            </tr>
          </thead>
          <tbody>
            {paginatedChips.length === 0 && (
              <tr>
                <td colSpan={6} className="p-4 text-center text-gray-400">
                  No chips found.
                </td>
              </tr>
            )}
            {paginatedChips.map((chip) => (
              <tr key={chip.serial} className="hover:bg-gray-800">
                <td className="p-2 border border-gray-700">{chip.property_title}</td>
                <td className="p-2 border border-gray-700">{chip.user_email || '-'}</td>
                <td className="p-2 border border-gray-700">{chip.created_at.slice(0, 10)}</td>
                <td className="p-2 border border-gray-700">{chip.assigned_at?.slice(0, 10) || '-'}</td>
                <td className="p-2 border border-gray-700">{chip.serial}</td>
                <td className="p-2 border border-gray-700 space-x-2">
                  <button onClick={() => handleDelete(chip.serial)} className="text-red-500">Delete</button>
                  <button onClick={() => handleInactivate(chip.serial)} className="text-yellow-400">Inactivate</button>
                  <button onClick={() => handleHide(chip.serial)} className="text-gray-400">Hide</button>
                </td>
              </tr>
            ))}
          </tbody>
        </table>
      </div>

      {/* Pagination Controls */}
      <div className="mt-6 flex justify-center items-center gap-4">
        <button
          onClick={() => setCurrentPage((p) => Math.max(p - 1, 1))}
          className="px-4 py-2 bg-gray-700 text-white rounded"
        >
          Prev
        </button>
        <span>Page {currentPage} of {totalPages}</span>
        <button
          onClick={() => setCurrentPage((p) => Math.min(p + 1, totalPages))}
          className="px-4 py-2 bg-gray-700 text-white rounded"
        >
          Next
        </button>
      </div>
    </div>
  )
}
