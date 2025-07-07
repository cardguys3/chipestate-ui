// app/admin/page.tsx
import { cookies } from 'next/headers'
import { createServerClient } from '@supabase/ssr'
import { redirect } from 'next/navigation'

export default async function AdminPage() {
  const cookieStore = cookies()

  const supabase = createServerClient(
    process.env.NEXT_PUBLIC_SUPABASE_URL!,
    process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY!,
    {
      cookies: cookieStore, // <-- FIXED: pass cookieStore directly
    }
  )

  const {
    data: { user },
  } = await supabase.auth.getUser()

  const adminEmails = ['mark@chipestate.com', 'cardguys3@gmail.com']
  if (!user || !adminEmails.includes(user.email ?? '')) {
    redirect('/')
  }

  const { data } = await supabase
    .from('users_extended')
    .select('first_name')
    .eq('id', user.id)
    .single()

  const firstName = data?.first_name ?? 'Administrator'

  return (
    <main className="min-h-screen bg-[#0B1D33] text-white px-6 py-10">
      <div className="max-w-7xl mx-auto">
        <h1 className="text-3xl font-bold mb-6">Admin Dashboard</h1>
        <p className="text-gray-300 mb-8">Welcome, {firstName}. Select a section to manage:</p>

        <div className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-3 gap-6">
          <AdminCard title="Users" href="/admin/users" />
          <AdminCard title="Properties" href="/admin/properties" />
          <AdminCard title="Chips" href="/admin/chips" />
          <AdminCard title="Financials" href="/admin/financials" />
          <AdminCard title="Approvals" href="/admin/approvals" />
          <AdminCard title="Analytics" href="/admin/analytics" />
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
