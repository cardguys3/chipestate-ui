'use client'

import { useEffect, useState } from 'react'
import { useRouter } from 'next/navigation'
import { useSession } from '@supabase/auth-helpers-react'
import { supabase } from '@/lib/supabaseClient'

export default function AdminDashboard() {
  const session = useSession()
  const router = useRouter()

  const [firstName, setFirstName] = useState<string | null>(null)
  const [loading, setLoading] = useState(true)

  useEffect(() => {
    const loadAdmin = async () => {
      if (!session?.user) return

      const email = session.user.email
      const isAdmin = ['mark@chipestate.com', 'cardguys3@gmail.com'].includes(email || '')
      if (!isAdmin) {
        router.push('/')
        return
      }

      const { data, error } = await supabase
        .from('users_extended')
        .select('first_name')
        .eq('id', session.user.id)
        .single()

      if (data?.first_name) {
        setFirstName(data.first_name)
      }

      setLoading(false)
    }

    loadAdmin()
  }, [session, router])

  if (loading) {
    return <main className="min-h-screen bg-[#0B1D33] text-white p-10">Loading...</main>
  }

  return (
    <main className="min-h-screen bg-[#0B1D33] text-white px-6 py-10">
      <div className="max-w-7xl mx-auto">
        <h1 className="text-3xl font-bold mb-6">Admin Dashboard</h1>
        <p className="text-gray-300 mb-8">
          Welcome, {firstName || 'administrator'}. Select a section to manage:
        </p>

        <div className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-3 gap-6">
          <AdminCard title="Users" href="/admin/users" />
          <AdminCard title="Properties" href="/admin/properties" />
          <AdminCard title="Chips" href="/admin/chips" />
          <AdminCard title="Financials" href="/admin/financials" />
          <AdminCard title="Approvals" href="/admin/approvals" />
        </div>
      </div>
    </main>
  )
}

function AdminCard({ title, href }: { title: string; href: string }) {
  return (
    <a
      href={href}
      className="block p-5 rounded-xl border border-white/10 bg-white/5 hover:bg-white/10 hover:border-emerald-400 transition duration-200"
    >
      <h2 className="text-xl font-semibold text-white mb-1">{title}</h2>
      <p className="text-sm text-gray-300">Manage {title.toLowerCase()} here</p>
    </a>
  )
}

