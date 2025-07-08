'use client'

import { useEffect, useState } from 'react'
import { useParams } from 'next/navigation'
import { supabase } from '@/lib/supabaseClient'
import Link from 'next/link'

export default function PropertyManagerDetails() {
  const { id } = useParams()
  const [manager, setManager] = useState<any>(null)
  const [transactions, setTransactions] = useState<any[]>([])

  useEffect(() => {
    const fetchManager = async () => {
      const { data, error } = await supabase.from('property_managers').select('*').eq('id', id).single()
      if (!error && data) setManager(data)
    }

    const fetchTransactions = async () => {
      const { data, error } = await supabase
        .from('property_transactions')
        .select('amount, notes, transaction_category, date, properties(title)')
        .eq('payee_type', 'property_manager')
        .eq('payee_id', id)
        .order('date', { ascending: false })
      if (!error && data) setTransactions(data)
    }

    if (id) {
      fetchManager()
      fetchTransactions()
    }
  }, [id])

  if (!manager) return <div className="p-6 text-white">Loading manager details...</div>

  const inactiveClass = !manager.is_active ? 'line-through text-red-400 font-semibold' : ''

  return (
    <main className="min-h-screen bg-[#0B1D33] text-white px-6 py-10">
      <div className="max-w-5xl mx-auto border border-white/20 rounded-lg p-6 space-y-6">
        <h1 className="text-2xl font-bold">Property Manager Details</h1>
        <div className="grid grid-cols-1 sm:grid-cols-2 gap-4 text-sm">
          <p className={inactiveClass}><strong>Name:</strong> {manager.name}</p>
          <p className={inactiveClass}><strong>Contact:</strong> {manager.contact_name}</p>
          <p className={inactiveClass}><strong>Phone:</strong> {manager.phone}</p>
          <p className={inactiveClass}><strong>Email:</strong> {manager.email}</p>
          <p className={inactiveClass}><strong>City:</strong> {manager.city}</p>
          <p className={inactiveClass}><strong>State:</strong> {manager.state}</p>
          <p className={inactiveClass}><strong>Status:</strong> {manager.is_active ? 'Active' : 'Inactive'}</p>
          <p className={inactiveClass}><strong>Years of Experience:</strong> {manager.years_experience}</p>
          <p className={inactiveClass}><strong>Management Fee:</strong> {manager.management_fee}</p>
          <p className={inactiveClass}><strong>Services Offered:</strong> {manager.service_types?.join(', ')}</p>
          <p className={inactiveClass}><strong>Preferred Contact (Owners):</strong> {manager.owner_communication}</p>
          <p className={inactiveClass}><strong>Preferred Contact (Tenants):</strong> {manager.tenant_communication}</p>
          <p className={inactiveClass}><strong>Compliance States:</strong> {manager.compliance_states?.join(', ')}</p>
          <p className={inactiveClass}><strong>Reporting Frequency:</strong> {manager.reporting_frequency}</p>
          <p className={inactiveClass}><strong>Reporting Type:</strong> {manager.reporting_type}</p>
          <p className={inactiveClass}><strong>References:</strong> {manager.references?.join(', ')}</p>
          <p className={inactiveClass}><strong>Notes:</strong> {manager.notes}</p>
        </div>

        <div className="pt-4 space-x-4">
          <Link href="/admin/property-managers" className="text-blue-400 hover:underline">← Back</Link>
          <Link href={`/admin/property-managers/${id}/edit`} className="text-emerald-400 hover:underline">Edit</Link>
        </div>

        <div className="pt-10">
          <h2 className="text-xl font-bold mb-4">Payment Transactions</h2>
          {transactions.length === 0 ? (
            <p className="text-sm text-gray-300">No transactions recorded for this property manager.</p>
          ) : (
            <table className="w-full text-sm border border-white/10 rounded-lg overflow-hidden">
              <thead className="bg-white/10">
                <tr>
                  <th className="text-left px-4 py-2">Date</th>
                  <th className="text-left px-4 py-2">Amount</th>
                  <th className="text-left px-4 py-2">Category</th>
                  <th className="text-left px-4 py-2">Notes</th>
                  <th className="text-left px-4 py-2">Property</th>
                </tr>
              </thead>
              <tbody>
                {transactions.map((tx, i) => (
                  <tr key={i} className="border-t border-white/5">
                    <td className="px-4 py-2">{new Date(tx.date).toLocaleDateString()}</td>
                    <td className="px-4 py-2">${tx.amount.toFixed(2)}</td>
                    <td className="px-4 py-2">{tx.transaction_category}</td>
                    <td className="px-4 py-2">{tx.notes}</td>
                    <td className="px-4 py-2">{tx.properties?.title}</td>
                  </tr>
                ))}
              </tbody>
            </table>
          )}
        </div>
      </div>
    </main>
  )
}
