// app/admin/properties/page.tsx
'use client'

import { useEffect, useState } from 'react'
import Link from 'next/link'
import { createBrowserClient } from '@supabase/ssr'
import { useRouter } from 'next/navigation'

const supabase = createBrowserClient(
  process.env.NEXT_PUBLIC_SUPABASE_URL!,
  process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY!
)

export default function AdminPropertiesPage() {
  const [properties, setProperties] = useState<any[]>([])
  const [filter, setFilter] = useState({
    title: '',
    property_type: '',
    sub_type: '',
    is_active: false,
    is_hidden: false,
    property_manager: ''
  })
  const [sortBy, setSortBy] = useState('created_at')
  const [sortDirection, setSortDirection] = useState<'asc' | 'desc'>('desc')
  const [allTitles, setAllTitles] = useState<string[]>([])
  const [allTypes, setAllTypes] = useState<string[]>([])
  const [allSubtypes, setAllSubtypes] = useState<string[]>([])
  const [allManagers, setAllManagers] = useState<string[]>([])
  const [titleSearch, setTitleSearch] = useState('')

  useEffect(() => {
    const fetchProperties = async () => {
      const { data } = await supabase
        .from('properties')
        .select('*')
        .order(sortBy, { ascending: sortDirection === 'asc' })

      if (!data) return

      const titles = [...new Set(data.map(p => p.title).filter(Boolean))]
      const types = [...new Set(data.map(p => p.property_type).filter(Boolean))]
      const subtypes = [...new Set(data.map(p => p.sub_type).filter(Boolean))]
      const managers = [...new Set(data.map(p => p.property_manager).filter(Boolean))]

      setAllTitles(titles)
      setAllTypes(types)
      setAllSubtypes(subtypes)
      setAllManagers(managers)

      const filtered = data.filter(p =>
        (filter.title === '' || p.title === filter.title) &&
        (filter.property_type === '' || p.property_type === filter.property_type) &&
        (filter.sub_type === '' || p.sub_type === filter.sub_type) &&
        (filter.property_manager === '' || p.property_manager === filter.property_manager) &&
        (!filter.is_active || p.is_active) &&
        (!filter.is_hidden || p.is_hidden)
      )

      setProperties(filtered)
    }

    fetchProperties()
  }, [filter, sortBy, sortDirection])

  const handleDelete = async (id: string) => {
    const confirmDelete = confirm('Are you sure you want to permanently remove this property?')
    if (!confirmDelete) return
    await supabase.from('properties').delete().eq('id', id)
    setProperties(prev => prev.filter(p => p.id !== id))
  }

  const handleHideToggle = async (id: string, isHidden: boolean) => {
    await supabase.from('properties').update({ is_hidden: !isHidden }).eq('id', id)
    setProperties(prev =>
      prev.map(p => (p.id === id ? { ...p, is_hidden: !isHidden } : p))
    )
  }

  const toggleSort = (field: string) => {
    if (sortBy === field) {
      setSortDirection(prev => (prev === 'asc' ? 'desc' : 'asc'))
    } else {
      setSortBy(field)
      setSortDirection('asc')
    }
  }

  return (
    <main className="min-h-screen bg-[#0e1a2b] text-white px-6 py-8">
      <div className="flex items-center justify-between mb-6">
        <h1 className="text-2xl font-bold">Manage Properties</h1>
        <Link href="/admin/properties/new" className="bg-emerald-600 hover:bg-emerald-700 text-white px-4 py-2 rounded-xl shadow">
          + Add Property
        </Link>
      </div>

      <div className="border border-emerald-600 p-4 rounded-xl grid grid-cols-1 sm:grid-cols-6 gap-4 mb-6">
        <input
          type="text"
          placeholder="Search title..."
          value={titleSearch}
          onChange={(e) => setTitleSearch(e.target.value)}
          className="w-full p-2 rounded bg-[#1e2a3c] border border-gray-600"
        />
        <select
          value={filter.title}
          onChange={(e) => setFilter({ ...filter, title: e.target.value })}
          className="w-full p-2 rounded bg-[#1e2a3c] border border-gray-600"
        >
          <option value=''>Title</option>
          {allTitles.filter(t => t.toLowerCase().includes(titleSearch.toLowerCase())).map(t => (
            <option key={t}>{t}</option>
          ))}
        </select>
        <select
          value={filter.property_type}
          onChange={(e) => setFilter({ ...filter, property_type: e.target.value })}
          className="p-2 rounded bg-[#1e2a3c] border border-gray-600"
        >
          <option value=''>Property Type</option>
          {allTypes.map(t => <option key={t}>{t}</option>)}
        </select>
        <select
          value={filter.sub_type}
          onChange={(e) => setFilter({ ...filter, sub_type: e.target.value })}
          className="p-2 rounded bg-[#1e2a3c] border border-gray-600"
        >
          <option value=''>Subtype</option>
          {allSubtypes.map(s => <option key={s}>{s}</option>)}
        </select>
        <select
          value={filter.property_manager}
          onChange={(e) => setFilter({ ...filter, property_manager: e.target.value })}
          className="p-2 rounded bg-[#1e2a3c] border border-gray-600"
        >
          <option value=''>Manager</option>
          {allManagers.map(m => <option key={m}>{m}</option>)}
        </select>
        <label className="flex items-center space-x-2">
          <input
            type="checkbox"
            checked={filter.is_active}
            onChange={(e) => setFilter({ ...filter, is_active: e.target.checked })}
          />
          <span>Active Only</span>
        </label>
        <label className="flex items-center space-x-2">
          <input
            type="checkbox"
            checked={filter.is_hidden}
            onChange={(e) => setFilter({ ...filter, is_hidden: e.target.checked })}
          />
          <span>Hidden Only</span>
        </label>
      </div>

      <table className="w-full text-sm border border-gray-700">
        <thead className="bg-[#1a2a3c] text-gray-300">
          <tr>
            {['Title', 'Property Type', 'Subtype', 'Active', 'Hidden', 'Created At'].map((col, i) => (
              <th
                key={col}
                className="p-2 cursor-pointer hover:text-white"
                onClick={() => toggleSort(['title', 'property_type', 'sub_type', 'is_active', 'is_hidden', 'created_at'][i])}
              >
                {col}
                {sortBy === ['title', 'property_type', 'sub_type', 'is_active', 'is_hidden', 'created_at'][i] ? (sortDirection === 'asc' ? ' ▲' : ' ▼') : ''}
              </th>
            ))}
            <th className="p-2">Actions</th>
          </tr>
        </thead>
        <tbody>
          {properties.map((p) => (
            <tr key={p.id} className="border-t border-gray-700 hover:bg-[#162435]">
              <td className="p-2 text-blue-400 underline">
                <Link href={`/admin/properties/details/${p.id}`}>{p.title}</Link>
              </td>
              <td className="p-2">{p.property_type}</td>
              <td className="p-2">{p.sub_type}</td>
              <td className="p-2">{p.is_active ? 'Yes' : 'No'}</td>
              <td className="p-2">{p.is_hidden ? 'Yes' : 'No'}</td>
              <td className="p-2">{new Date(p.created_at).toLocaleDateString()}</td>
              <td className="p-2 space-x-2">
                <button onClick={() => handleHideToggle(p.id, p.is_hidden)} className="text-yellow-400 hover:text-yellow-600">
                  {p.is_hidden ? 'Visible' : 'Hidden'}
                </button>
                <button onClick={() => handleDelete(p.id)} className="text-red-400 hover:text-red-600">
                  Delete
                </button>
              </td>
            </tr>
          ))}
        </tbody>
      </table>
    </main>
  )
}
