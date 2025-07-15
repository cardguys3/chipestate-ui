'use client'

import { useState, useEffect } from 'react'
import { supabase } from '@/lib/supabaseClient'
import { v4 as uuidv4 } from 'uuid'

export default function PropertyFinancialsPage() {
  const [transactions, setTransactions] = useState<any[]>([])
  const [loading, setLoading] = useState(true)
  const [filter, setFilter] = useState('')
  const [properties, setProperties] = useState<any[]>([])
  const [users, setUsers] = useState<any[]>([])
  const [form, setForm] = useState({
    id: uuidv4(),
    property_id: '',
    transaction_name: '',
    category: 'Category: Rent',
    amount: '',
    created_by: '',
    transaction_date: new Date().toISOString().substring(0, 10)
  })
  const [reserveBalance, setReserveBalance] = useState<number | null>(null)

  const categories = ['Category: Rent', 'Category: Tax', 'Category: Repair', 'Category: Reserve Refill', 'Category: Admin Fee', 'Category: Distribution', 'Category: Other']

  useEffect(() => {
    const fetchInitialData = async () => {
      const [{ data: transactionsData }, { data: propertiesData }, { data: usersData }] = await Promise.all([
        supabase.from('property_transactions').select('*').order('transaction_date', { ascending: false }),
        supabase.from('properties').select('id, title, reserve_balance'),
        supabase.from('users_extended').select('id, first_name')
      ])

      setTransactions(transactionsData || [])
      setProperties(propertiesData || [])
      setUsers(usersData || [])
      setLoading(false)
    }
    fetchInitialData()
  }, [])

  useEffect(() => {
    const selectedProperty = properties.find(p => p.id === form.property_id)
    setReserveBalance(selectedProperty?.reserve_balance ?? null)
  }, [form.property_id, properties])

  const handleChange = (e: any) => {
    const { name, value } = e.target
    setForm((prev) => ({ ...prev, [name]: value }))
  }

  const handleSubmit = async () => {
    const { error } = await supabase.from('property_transactions').insert([form])
    if (!error) {
      setForm({
        id: uuidv4(),
        property_id: '',
        transaction_name: '',
        category: 'Category: Rent',
        amount: '',
        created_by: '',
        transaction_date: new Date().toISOString().substring(0, 10)
      })
      const { data } = await supabase
        .from('property_transactions')
        .select('*')
        .order('transaction_date', { ascending: false })
      setTransactions(data || [])
    } else {
      console.error('Insert error:', error.message)
    }
  }

  const handleInactivate = async (id: string) => {
    const { error } = await supabase
      .from('property_transactions')
      .update({ amount: 0, transaction_name: '(inactive)' })
      .eq('id', id)
    if (!error) {
      const { data } = await supabase
        .from('property_transactions')
        .select('*')
        .order('transaction_date', { ascending: false })
      setTransactions(data || [])
    }
  }

  const filtered = transactions.filter((t) => {
    const propertyTitle = properties.find(p => p.id === t.property_id)?.title || ''
    const creatorName = users.find(u => u.id === t.created_by)?.first_name || ''
    return (
      t.transaction_name?.toLowerCase().includes(filter.toLowerCase()) ||
      t.category?.toLowerCase().includes(filter.toLowerCase()) ||
      propertyTitle.toLowerCase().includes(filter.toLowerCase()) ||
      creatorName.toLowerCase().includes(filter.toLowerCase()) ||
      t.amount?.toString().includes(filter)
    )
  })

  return (
    <main className="min-h-screen bg-[#0B1D33] text-white px-6 py-10">
      <div className="max-w-6xl mx-auto">
        <h1 className="text-2xl font-bold mb-6">Property Financials</h1>

        <div className="border border-white/20 rounded-lg p-6 space-y-4 mb-10">
          <h2 className="text-lg font-semibold mb-4">Add New Transaction</h2>
          <div className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-3 gap-4">
            <select name="property_id" value={form.property_id} onChange={handleChange} className="p-2 rounded bg-[#0B1D33] border border-gray-600 text-white">
              <option value="">Select Property</option>
              {properties.map(p => (
                <option key={p.id} value={p.id}>{p.title}</option>
              ))}
            </select>
            <input name="transaction_name" value={form.transaction_name} onChange={handleChange} className="p-2 rounded bg-[#0B1D33] border border-gray-600 text-white" placeholder="Notes" />
            <select name="category" value={form.category} onChange={handleChange} className="p-2 rounded bg-[#0B1D33] border border-gray-600 text-white">
              {categories.map((c) => (
                <option key={c} value={c}>{c}</option>
              ))}
            </select>
            <input name="amount" value={form.amount} onChange={handleChange} className="p-2 rounded bg-[#0B1D33] border border-gray-600 text-white" placeholder="Amount" />
            <select name="created_by" value={form.created_by} onChange={handleChange} className="p-2 rounded bg-[#0B1D33] border border-gray-600 text-white">
              <option value="">Created By</option>
              {users.map(u => (
                <option key={u.id} value={u.id}>{u.first_name}</option>
              ))}
            </select>
            <input type="date" name="transaction_date" value={form.transaction_date} onChange={handleChange} className="p-2 rounded bg-[#0B1D33] border border-gray-600 text-white" />
          </div>
          <button onClick={handleSubmit} className="bg-emerald-600 px-4 py-2 rounded font-semibold">Save Transaction</button>
          {reserveBalance !== null && (
            <div className="text-emerald-400 font-medium mt-4">Reserve Balance: ${reserveBalance.toFixed(2)}</div>
          )}
        </div>

        <div className="mb-6">
          <input
            value={filter}
            onChange={(e) => setFilter(e.target.value)}
            className="w-full p-2 rounded bg-[#0B1D33] border border-white/10 text-white"
            placeholder="Filter by property, amount, or name..."
          />
        </div>

        <div className="overflow-x-auto border border-white/10 rounded-lg">
          <table className="w-full text-sm">
            <thead className="bg-white/10">
              <tr>
                <th className="px-4 py-2 text-left">Date</th>
                <th className="px-4 py-2 text-left">Property</th>
                <th className="px-4 py-2 text-left">Notes</th>
                <th className="px-4 py-2 text-left">Category</th>
                <th className="px-4 py-2 text-left">Amount</th>
                <th className="px-4 py-2 text-left">Created By</th>
                <th className="px-4 py-2 text-left">Actions</th>
              </tr>
            </thead>
            <tbody>
              {filtered.map((t) => {
                const prop = properties.find(p => p.id === t.property_id)
                const user = users.find(u => u.id === t.created_by)
                return (
                  <tr key={t.id} className="border-t border-white/5 hover:bg-white/5">
                    <td className="px-4 py-2">{t.transaction_date?.split('T')[0]}</td>
                    <td className="px-4 py-2">{prop?.title || t.property_id}</td>
                    <td className="px-4 py-2">{t.transaction_name}</td>
                    <td className="px-4 py-2">{t.category}</td>
                    <td className="px-4 py-2">${parseFloat(t.amount).toFixed(2)}</td>
                    <td className="px-4 py-2">{user?.first_name || t.created_by}</td>
                    <td className="px-4 py-2">
                      <div className="flex gap-2">
                        <button className="text-emerald-400 hover:underline text-xs" disabled>Edit</button>
                        <button className="text-red-400 hover:underline text-xs" onClick={() => handleInactivate(t.id)}>Inactivate</button>
                      </div>
                    </td>
                  </tr>
                )
              })}
            </tbody>
          </table>
        </div>

        <div className="text-sm text-center text-gray-400 mt-6">Pagination coming soon...</div>
      </div>
    </main>
  )
}
