// app/admin/financials/page.tsx

'use client'

import { useState, useEffect } from 'react'
import { supabase } from '@/lib/supabaseClient'
import { v4 as uuidv4 } from 'uuid'

export default function TransactionsPage() {
  const [transactions, setTransactions] = useState<any[]>([])
  const [loading, setLoading] = useState(true)
  const [filter, setFilter] = useState('')
  const [properties, setProperties] = useState<any[]>([])
  const [users, setUsers] = useState<any[]>([])
  const [newTransaction, setNewTransaction] = useState({
    type: 'admin_fee',
    property_id: '',
    amount: '',
    notes: ''
  })
  const [creating, setCreating] = useState(false)

  useEffect(() => {
    const fetchInitialData = async () => {
      const [{ data: transactionsData }, { data: propertiesData }, { data: usersData }] = await Promise.all([
        supabase.from('transactions').select('*').order('transaction_date', { ascending: false }),
        supabase.from('properties').select('id, title, reserve_balance'),
        supabase.from('users_extended').select('id, first_name, last_name')
      ])
      setTransactions(transactionsData || [])
      setProperties(propertiesData || [])
      setUsers(usersData || [])
      setLoading(false)
    }
    fetchInitialData()
  }, [])

  const filtered = transactions.filter((t) => {
    const propertyTitle = properties.find(p => p.id === t.property_id)?.title || ''
    const creatorName = users.find(u => u.id === t.created_by)?.first_name || ''
    return (
      t.notes?.toLowerCase().includes(filter.toLowerCase()) ||
      t.type?.toLowerCase().includes(filter.toLowerCase()) ||
      propertyTitle.toLowerCase().includes(filter.toLowerCase()) ||
      creatorName.toLowerCase().includes(filter.toLowerCase()) ||
      t.amount?.toString().includes(filter)
    )
  })

  const handleCreate = async () => {
    setCreating(true)
    const { data: { user } } = await supabase.auth.getUser()
    const { error } = await supabase.from('transactions').insert({
      id: uuidv4(),
      type: newTransaction.type,
      property_id: newTransaction.property_id,
      amount: parseFloat(newTransaction.amount),
      notes: newTransaction.notes,
      created_by: user?.id
    })
    if (!error) {
      setNewTransaction({ type: 'admin_fee', property_id: '', amount: '', notes: '' })
      const { data: updated } = await supabase.from('transactions').select('*').order('transaction_date', { ascending: false })
      setTransactions(updated || [])
    }
    setCreating(false)
  }

  return (
    <main className="min-h-screen bg-[#0B1D33] text-white px-6 py-10">
      <div className="max-w-6xl mx-auto">
        <h1 className="text-2xl font-bold mb-6">All Financial Transactions</h1>

        <div className="mb-6">
          <input
            value={filter}
            onChange={(e) => setFilter(e.target.value)}
            className="w-full p-2 rounded bg-[#0B1D33] border border-white/10 text-white"
            placeholder="Filter by property, amount, or notes..."
          />
        </div>

        {/* Add New Transaction Form */}
        <div className="mb-8 p-4 border border-white/10 rounded-lg bg-white/5">
          <h2 className="text-lg font-bold mb-3">Add New Transaction</h2>
          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            <select
              className="p-2 rounded bg-[#0B1D33] border border-white/10 text-white"
              value={newTransaction.property_id}
              onChange={(e) => setNewTransaction({ ...newTransaction, property_id: e.target.value })}
            >
              <option value="">Select Property</option>
              {properties.map((p) => (
                <option key={p.id} value={p.id}>{p.title}</option>
              ))}
            </select>

            <select
              className="p-2 rounded bg-[#0B1D33] border border-white/10 text-white"
              value={newTransaction.type}
              onChange={(e) => setNewTransaction({ ...newTransaction, type: e.target.value })}
            >
              <option value="admin_fee">Admin Fee</option>
              <option value="refund">Refund</option>
              <option value="chip_purchase">Chip Purchase</option>
              <option value="rent">Rent</option>
              <option value="repair">Repair</option>
              <option value="tax">Tax</option>
              <option value="reserve_replenish">Reserve Replenish</option>
              <option value="chipholder_distribution">Chipholder Distribution</option>
              <option value="other">Other</option>
            </select>

            <input
              type="number"
              className="p-2 rounded bg-[#0B1D33] border border-white/10 text-white"
              placeholder="Amount"
              value={newTransaction.amount}
              onChange={(e) => setNewTransaction({ ...newTransaction, amount: e.target.value })}
            />

            <input
              type="text"
              className="p-2 rounded bg-[#0B1D33] border border-white/10 text-white"
              placeholder="Notes"
              value={newTransaction.notes}
              onChange={(e) => setNewTransaction({ ...newTransaction, notes: e.target.value })}
            />
          </div>
          <button
            onClick={handleCreate}
            disabled={creating || !newTransaction.property_id || !newTransaction.amount}
            className="mt-4 bg-emerald-600 hover:bg-emerald-700 text-white font-semibold px-4 py-2 rounded"
          >
            {creating ? 'Adding...' : 'Add Transaction'}
          </button>
        </div>

        {/* Transactions Table */}
        <div className="overflow-x-auto border border-white/10 rounded-lg">
          <table className="w-full text-sm">
            <thead className="bg-white/10">
              <tr>
                <th className="px-4 py-2 text-left">Date</th>
                <th className="px-4 py-2 text-left">Type</th>
                <th className="px-4 py-2 text-left">Property</th>
                <th className="px-4 py-2 text-left">Notes</th>
                <th className="px-4 py-2 text-left">Amount</th>
                <th className="px-4 py-2 text-left">Created By</th>
              </tr>
            </thead>
            <tbody>
              {filtered.map((t) => {
                const prop = properties.find(p => p.id === t.property_id)
                const user = users.find(u => u.id === t.created_by)
                return (
                  <tr key={t.id} className="border-t border-white/5 hover:bg-white/5">
                    <td className="px-4 py-2">{t.transaction_date?.split('T')[0]}</td>
                    <td className="px-4 py-2">{t.type}</td>
                    <td className="px-4 py-2">{prop?.title || t.property_id}</td>
                    <td className="px-4 py-2">{t.notes || '-'}</td>
                    <td className="px-4 py-2">${parseFloat(t.amount).toFixed(2)}</td>
                    <td className="px-4 py-2">{user ? `${user.first_name}` : t.created_by}</td>
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
