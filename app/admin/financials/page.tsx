import { useState, useEffect } from 'react'
import { supabase } from '@/lib/supabaseClient'
import { v4 as uuidv4 } from 'uuid'

export default function PropertyFinancialsPage() {
  const [transactions, setTransactions] = useState<any[]>([])
  const [loading, setLoading] = useState(true)
  const [filter, setFilter] = useState('')
  const [form, setForm] = useState({
    id: uuidv4(),
    property_id: '',
    transaction_name: '',
    category: 'Rent',
    amount: '',
    created_by: '',
    transaction_date: new Date().toISOString().substring(0, 10)
  })

  const categories = ['Rent', 'Tax', 'Repair', 'Reserve Refill', 'Admin Fee', 'Distribution', 'Other']

  useEffect(() => {
    const fetchTransactions = async () => {
      const { data, error } = await supabase
        .from('property_transactions')
        .select('*')
        .order('transaction_date', { ascending: false })
      if (!error && data) {
        setTransactions(data)
      }
      setLoading(false)
    }
    fetchTransactions()
  }, [])

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
        category: 'Rent',
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

  const filtered = transactions.filter((t) =>
    t.transaction_name?.toLowerCase().includes(filter.toLowerCase()) ||
    t.category?.toLowerCase().includes(filter.toLowerCase())
  )

  return (
    <main className="min-h-screen bg-[#0B1D33] text-white px-6 py-10">
      <div className="max-w-6xl mx-auto">
        <h1 className="text-2xl font-bold mb-6">Property Financials</h1>

        {/* Add Transaction Form */}
        <div className="border border-white/20 rounded-lg p-6 space-y-4 mb-10">
          <h2 className="text-lg font-semibold mb-4">Add New Transaction</h2>
          <div className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-3 gap-4">
            <input name="property_id" value={form.property_id} onChange={handleChange} className="p-2 rounded bg-[#0B1D33] border border-gray-600 text-white" placeholder="Property ID" />
            <input name="transaction_name" value={form.transaction_name} onChange={handleChange} className="p-2 rounded bg-[#0B1D33] border border-gray-600 text-white" placeholder="Transaction Name" />
            <select name="category" value={form.category} onChange={handleChange} className="p-2 rounded bg-[#0B1D33] border border-gray-600 text-white">
              {categories.map((c) => (
                <option key={c} value={c}>{c}</option>
              ))}
            </select>
            <input name="amount" value={form.amount} onChange={handleChange} className="p-2 rounded bg-[#0B1D33] border border-gray-600 text-white" placeholder="Amount" />
            <input name="created_by" value={form.created_by} onChange={handleChange} className="p-2 rounded bg-[#0B1D33] border border-gray-600 text-white" placeholder="Created By (UUID)" />
            <input type="date" name="transaction_date" value={form.transaction_date} onChange={handleChange} className="p-2 rounded bg-[#0B1D33] border border-gray-600 text-white" />
          </div>
          <button onClick={handleSubmit} className="bg-emerald-600 px-4 py-2 rounded font-semibold">Save Transaction</button>
        </div>

        {/* Filter */}
        <div className="mb-6">
          <input
            value={filter}
            onChange={(e) => setFilter(e.target.value)}
            className="w-full p-2 rounded bg-[#0B1D33] border border-white/10 text-white"
            placeholder="Search transactions by name or category..."
          />
        </div>

        {/* Table */}
        <div className="overflow-x-auto border border-white/10 rounded-lg">
          <table className="w-full text-sm">
            <thead className="bg-white/10">
              <tr>
                <th className="px-4 py-2 text-left">Date</th>
                <th className="px-4 py-2 text-left">Property ID</th>
                <th className="px-4 py-2 text-left">Name</th>
                <th className="px-4 py-2 text-left">Category</th>
                <th className="px-4 py-2 text-left">Amount</th>
              </tr>
            </thead>
            <tbody>
              {filtered.map((t) => (
                <tr key={t.id} className="border-t border-white/5 hover:bg-white/5">
                  <td className="px-4 py-2">{t.transaction_date?.split('T')[0]}</td>
                  <td className="px-4 py-2">{t.property_id}</td>
                  <td className="px-4 py-2">{t.transaction_name}</td>
                  <td className="px-4 py-2">{t.category}</td>
                  <td className="px-4 py-2">${parseFloat(t.amount).toFixed(2)}</td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>

        <div className="text-sm text-center text-gray-400 mt-6">Pagination coming soon...</div>
      </div>
    </main>
  )
}
