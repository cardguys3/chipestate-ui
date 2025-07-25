// app/admin/financials/page.tsx

'use client'

import { useState, useEffect } from 'react'
import { supabase } from '@/lib/supabaseClient'
import { v4 as uuidv4 } from 'uuid'

export default function TransactionsPage() {
  // State declarations
  const [transactions, setTransactions] = useState<any[]>([])
  const [loading, setLoading] = useState(true)
  const [properties, setProperties] = useState<any[]>([])
  const [users, setUsers] = useState<any[]>([])
  const [balance, setBalance] = useState(0)
  const [sortField, setSortField] = useState<string>('transaction_date')
  const [sortAsc, setSortAsc] = useState<boolean>(true)
  const [filters, setFilters] = useState({
  date: '',
  amount: '',
  property: '',
  notes: '',
  type: ''
})


  // New transaction form state
  const [newTransaction, setNewTransaction] = useState({
    type: 'admin_fee',
    property_id: '',
    amount: '',
    notes: '',
    transaction_date: new Date().toISOString().split('T')[0]
  })

  // Chipholder distribution form state
  const [distribution, setDistribution] = useState({
    property_id: '',
    amount: '',
    notes: '',
    distribution_date: new Date().toISOString().split('T')[0]
  })
  const [totalChipsForProperty, setTotalChipsForProperty] = useState<number | null>(null)
  const [ownedChipsForProperty, setOwnedChipsForProperty] = useState<number | null>(null)
  const [creating, setCreating] = useState(false)
  const [distributing, setDistributing] = useState(false)

  // Fetch initial data on mount
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
      const totalBalance = transactionsData?.reduce((sum, tx) => sum + Number(tx.amount || 0), 0) || 0
      setBalance(totalBalance)
      setLoading(false)
    }
    fetchInitialData()
  }, [])
  
  const updateChipCounts = async (propertyId: string) => {
  if (!propertyId) {
    setTotalChipsForProperty(null)
    setOwnedChipsForProperty(null)
    return
  }

  const [{ data: total }, { data: owned }] = await Promise.all([
    supabase.from('chips').select('id', { count: 'exact' }).eq('property_id', propertyId).eq('is_active', true).eq('is_hidden', false),
    supabase.from('chips').select('id', { count: 'exact' }).eq('property_id', propertyId).eq('is_active', true).eq('is_hidden', false).not('owner_id', 'is', null),
  ])

  setTotalChipsForProperty(total?.length ?? 0)
  setOwnedChipsForProperty(owned?.length ?? 0)
}
  
    // HANDLE SORT FUNCTION 
  const handleSort = (field: string) => {
    if (field === sortField) {
      setSortAsc(!sortAsc)
    } else {
      setSortField(field)
      setSortAsc(true)
    }
  }
   

  // Transaction filter logic
  const filtered = transactions.filter((t) => {
  return (
		(!filters.date || t.transaction_date?.startsWith(filters.date)) &&
		(!filters.amount || t.amount?.toString().includes(filters.amount)) &&
		(!filters.property || properties.find(p => p.id === t.property_id)?.title?.toLowerCase().includes(filters.property.toLowerCase())) &&
		(!filters.notes || t.notes?.toLowerCase().includes(filters.notes.toLowerCase())) &&
		(!filters.type || t.type?.toLowerCase().includes(filters.type.toLowerCase()))
	  )
	})

  // Add a new transaction
  const handleCreate = async () => {
    setCreating(true)
    const { data: { user } } = await supabase.auth.getUser()
    const { error } = await supabase.from('transactions').insert({
      id: uuidv4(),
      type: newTransaction.type,
      property_id: newTransaction.property_id,
      amount: parseFloat(newTransaction.amount),
      notes: newTransaction.notes,
      created_by: user?.id,
      transaction_date: newTransaction.transaction_date
    })
    if (!error) {
      setNewTransaction({ type: 'admin_fee', property_id: '', amount: '', notes: '', transaction_date: new Date().toISOString().split('T')[0] })
      const { data: updated } = await supabase.from('transactions').select('*').order('transaction_date', { ascending: false })
      setTransactions(updated || [])
      const newBalance = updated?.reduce((sum, tx) => sum + Number(tx.amount || 0), 0) || 0
      setBalance(newBalance)
    }
    setCreating(false)
  }

// Distribute to chipholders
const handleDistributeToChipholders = async () => {
  setDistributing(true)
  const { data: { user } } = await supabase.auth.getUser()

  // Fetch only owned chips for payout creation
  const { data: chips, error: chipError } = await supabase
    .from('chips')
    .select('id, owner_id')
    .eq('property_id', distribution.property_id)
    .eq('is_active', true)
    .eq('is_hidden', false)
    .not('owner_id', 'is', null)

  if (chipError || !chips) {
    alert('Error fetching chips.')
    setDistributing(false)
    return
  }

  if (chips.length === 0) {
    alert('No chips found with owners for this property.')
    setDistributing(false)
    return
  }

  // Fetch total chip count for the property (includes unsold chips)
  const { data: allChips, error: allChipsError } = await supabase
    .from('chips')
    .select('id')
    .eq('property_id', distribution.property_id)
    .eq('is_active', true)
    .eq('is_hidden', false)

  if (allChipsError || !allChips || allChips.length === 0) {
    alert('Error fetching total chip count.')
    setDistributing(false)
    return
  }

  const totalChipsForProperty = allChips.length
  const amountPerChip = parseFloat(distribution.amount) / totalChipsForProperty

  // Prepare chip earnings for owned chips only
  const earnings = chips.map(c => ({
    id: uuidv4(),
    chip_id: c.id,
    user_id: c.owner_id,
    property_id: distribution.property_id,
    amount: parseFloat(amountPerChip.toFixed(2)),
    earning_date: distribution.distribution_date
  }))

  const { error: insertErr } = await supabase.from('chip_earnings').insert(earnings)
  if (insertErr) {
    alert('Error inserting chip earnings.')
    setDistributing(false)
    return
  }

  // Log the transaction
  await supabase.from('transactions').insert({
    id: uuidv4(),
    type: 'chipholder_distribution',
    property_id: distribution.property_id,
    amount: parseFloat(distribution.amount),
    notes: distribution.notes,
    created_by: user?.id,
    transaction_date: distribution.distribution_date
  })

  // Prepare user notification payload
  const property = properties.find(p => p.id === distribution.property_id)
  const propertyName = property?.title || 'a ChipEstate property'

  const userSums: Record<string, number> = {}
  for (const e of earnings) {
    userSums[e.user_id] = (userSums[e.user_id] || 0) + e.amount
  }

  const userNotifications = Object.entries(userSums).map(([user_id, amount]) => ({
    user_id,
    amount: parseFloat(amount.toFixed(2)),
    property_name: propertyName
  }))

  // Call Supabase Edge Function to notify users
  try {
    const response = await fetch('https://szzglzcddjrnrtguwjsc.functions.supabase.co/notify-distribution', {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ userNotifications })
    })

    if (!response.ok) {
      console.error('Failed to trigger notification function:', await response.text())
    }
  } catch (error) {
    console.error('Error calling notify-distribution:', error)
  }

  // Refresh UI
  const { data: updated } = await supabase.from('transactions').select('*').order('transaction_date', { ascending: false })
  setTransactions(updated || [])
  const newBalance = updated?.reduce((sum, tx) => sum + Number(tx.amount || 0), 0) || 0
  setBalance(newBalance)

  alert('Distribution complete.')
  setDistribution({ property_id: '', amount: '', notes: '', distribution_date: new Date().toISOString().split('T')[0] })
  setDistributing(false)
}

  return (
    <main className="min-h-screen bg-[#0B1D33] text-white px-6 py-10">
      <div className="max-w-6xl mx-auto">
        <h1 className="text-2xl font-bold mb-4">Financials</h1>

        {/* Current Balance Display */}
        <div className="mb-6 p-4 rounded bg-white/10 text-white">
          <h2 className="text-lg font-semibold">Current Balance</h2>
          <p className="text-2xl font-bold mt-1">${balance.toLocaleString(undefined, { minimumFractionDigits: 2, maximumFractionDigits: 2 })}</p>
        </div>


             {/* Distribute to Chipholders */}
        <div className="mb-8 p-4 border border-yellow-500/20 rounded-lg bg-yellow-900/10">
          <h2 className="text-lg font-bold mb-3">Distribute to Chipholders</h2>
          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            <select
			  className="p-2 rounded bg-[#0B1D33] border border-white/10 text-white"
			  value={distribution.property_id}
			  onChange={(e) => {
				const selectedId = e.target.value
				setDistribution({ ...distribution, property_id: selectedId })
				updateChipCounts(selectedId)
			  }}
			>
              <option value="">Select Property</option>
              {properties.map((p) => (
                <option key={p.id} value={p.id}>{p.title}</option>
              ))}
            </select>

            <input
              type="number"
              className="p-2 rounded bg-[#0B1D33] border border-white/10 text-white"
              placeholder="Combined Total Amount to ALL Chip Holders"
              value={distribution.amount}
              onChange={(e) => setDistribution({ ...distribution, amount: e.target.value })}
            />

            <input
              type="date"
              className="p-2 rounded bg-[#0B1D33] border border-white/10 text-white"
              value={distribution.distribution_date}
              onChange={(e) => setDistribution({ ...distribution, distribution_date: e.target.value })}
            />

            <input
              type="text"
              className="p-2 rounded bg-[#0B1D33] border border-white/10 text-white"
              placeholder="Notes"
              value={distribution.notes}
              onChange={(e) => setDistribution({ ...distribution, notes: e.target.value })}
            />
          </div>
		  {distribution.property_id && (
  <div className="mt-4 text-sm text-yellow-300">
    Total Chips: {totalChipsForProperty ?? '...'} | Owned Chips: {ownedChipsForProperty ?? '...'}
  </div>
)}
          <button
            onClick={handleDistributeToChipholders}
            disabled={distributing || !distribution.property_id || !distribution.amount}
            className="mt-4 bg-yellow-600 hover:bg-yellow-700 text-white font-semibold px-4 py-2 rounded"
          >
            {distributing ? 'Distributing...' : 'Distribute'}
          </button>
        </div>

        {/* Add New Transaction */}
<div className="mb-8 p-4 border border-white/10 rounded-lg bg-white/5">
  <h2 className="text-lg font-bold mb-3">Add New Transaction</h2>
  <p className="text-sm text-yellow-400 mb-4">
    ⚠️ Enter negative values for money going out (e.g., chipholder distributions, repairs) and positive values for money coming in (e.g., rent payments, refunds).
  </p>
  <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
    <select
      className="p-2 rounded bg-[#0B1D33] border border-white/10 text-white"
      value={newTransaction.type}
      onChange={(e) => setNewTransaction({ ...newTransaction, type: e.target.value })}
    >
      <option value="admin_fee">Admin Fee</option>
      <option value="property_manager_fee">Property Manager Fee</option>
      <option value="upkeep">Upkeep</option>
      <option value="repair">Repair</option>
      <option value="rent">Rental Income</option>
      <option value="reserve_replenish">Reserve Replenishment</option>
      <option value="chipholder_distribution">Chipholder Distribution</option>
      <option value="refund">Refund</option>
      <option value="chargeback">Chargeback</option>
      <option value="chip_purchase">Chip Purchase</option>
      <option value="other">Other</option>
    </select>

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

    <input
      type="number"
      step="0.01"
      className="p-2 rounded bg-[#0B1D33] border border-white/10 text-white"
      placeholder="Amount"
      value={newTransaction.amount}
      onChange={(e) => setNewTransaction({ ...newTransaction, amount: e.target.value })}
    />

    <input
      type="date"
      className="p-2 rounded bg-[#0B1D33] border border-white/10 text-white"
      value={newTransaction.transaction_date}
      onChange={(e) => setNewTransaction({ ...newTransaction, transaction_date: e.target.value })}
    />

    <input
      type="text"
      className="p-2 rounded bg-[#0B1D33] border border-white/10 text-white col-span-1 md:col-span-2"
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
    {creating ? 'Creating...' : 'Add Transaction'}
  </button>
</div>

        {/* Advanced Filter Section */}
<div className="grid grid-cols-1 md:grid-cols-5 gap-4 mb-6">
  <input className="p-2 rounded bg-[#0B1D33] border border-white/10 text-white" placeholder="Date" value={filters.date} onChange={(e) => setFilters({ ...filters, date: e.target.value })} />
  <input className="p-2 rounded bg-[#0B1D33] border border-white/10 text-white" placeholder="Amount" value={filters.amount} onChange={(e) => setFilters({ ...filters, amount: e.target.value })} />
  <input className="p-2 rounded bg-[#0B1D33] border border-white/10 text-white" placeholder="Property" value={filters.property} onChange={(e) => setFilters({ ...filters, property: e.target.value })} />
  <input className="p-2 rounded bg-[#0B1D33] border border-white/10 text-white" placeholder="Type" value={filters.type} onChange={(e) => setFilters({ ...filters, type: e.target.value })} />
  <input className="p-2 rounded bg-[#0B1D33] border border-white/10 text-white" placeholder="Notes" value={filters.notes} onChange={(e) => setFilters({ ...filters, notes: e.target.value })} />
</div>


		{/* Transactions Table with Rounded Corners and Sorting */}
		<h2 className="text-xl font-bold mb-3 mt-8">Transactions</h2>
		  <div className="overflow-x-auto border border-white/10 rounded-xl">
			<table className="min-w-full text-sm">
			<thead className="bg-white/10">
			  <tr>
				<th className="text-left px-3 py-2 font-semibold cursor-pointer" onClick={() => handleSort('transaction_date')}>Date</th>
				<th className="text-left px-3 py-2 font-semibold cursor-pointer" onClick={() => handleSort('type')}>Type</th>
				<th className="text-left px-3 py-2 font-semibold cursor-pointer" onClick={() => handleSort('amount')}>Amount</th>
				<th className="text-left px-3 py-2 font-semibold cursor-pointer" onClick={() => handleSort('property_id')}>Property</th>
				<th className="text-left px-3 py-2 font-semibold cursor-pointer" onClick={() => handleSort('notes')}>Notes</th>
				<th className="text-left px-3 py-2 font-semibold">Balance</th>
			  </tr>
			</thead>
			<tbody>
			  {(() => {
				let runningBalance = 0
				return filtered.map((t) => {
				  runningBalance += parseFloat(t.amount || 0)
				  return (
					<tr key={t.id} className="border-t border-white/10 hover:bg-white/5">
					  <td className="px-3 py-2">{t.transaction_date?.split('T')[0]}</td>
					  <td className="px-3 py-2">{t.type}</td>
					  <td className="px-3 py-2">${parseFloat(t.amount).toFixed(2)}</td>
					  <td className="px-3 py-2">{properties.find(p => p.id === t.property_id)?.title || '—'}</td>
					  <td className="px-3 py-2">{t.notes || '—'}</td>
					  <td className="px-3 py-2 text-right">${runningBalance.toFixed(2)}</td>
					</tr>
				  )
				})
			  })()}
			</tbody>

		  </table>
		</div>
      </div>
    </main>
  )
}
