'use client'

import { useEffect } from 'react'
import { useRouter } from 'next/navigation'
import { useSession } from '@supabase/auth-helpers-react'

export default function AdminDashboard() {
  const session = useSession()
  const router = useRouter()

  useEffect(() => {
    if (!session) return
    const email = session.user?.email
    const isAdmin = ['mark@chipestate.com', 'cardguys3@gmail.com'].includes(email || '')
    if (!isAdmin) {
      router.push('/') // redirect non-admins
    }
  }, [session])

  return (
    <main className="min-h-screen bg-gray-50 p-6">
      <h1 className="text-3xl font-bold text-blue-900 mb-6">Admin Dashboard</h1>
      <p className="text-gray-600 mb-4">Welcome, authorized administrator. Choose a section:</p>

      <div className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-3 gap-4">
        <AdminCard title="Users" href="/admin/users" />
        <AdminCard title="Properties" href="/admin/properties" />
        <AdminCard title="Chips" href="/admin/chips" />
        <AdminCard title="Financials" href="/admin/financials" />
        <AdminCard title="Approvals" href="/admin/approvals" />
      </div>
    </main>
  )
}

function AdminCard({ title, href }: { title: string; href: string }) {
  return (
    <a href={href} className="block p-4 border border-blue-900 rounded-lg hover:bg-blue-100 transition">
      <h2 className="text-lg font-semibold text-blue-800">{title}</h2>
      <p className="text-sm text-gray-600">Manage {title.toLowerCase()} here</p>
    </a>
  )
}
