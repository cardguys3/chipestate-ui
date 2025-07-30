// ==== FILE: /app/admin/users/page.tsx START ====

import { fetchUsers } from './fetchUsers'
import { createClient } from '@/utils/supabase/server'
import AdminUsersPageContent from './AdminUsersPageContent'

export default async function AdminUsersPage() {
  const supabase = createClient()
  const users = await fetchUsers()

  const { data: properties, error } = await supabase
    .from('properties')
    .select('id, title')

  if (error) {
    console.error('Error fetching properties:', error)
    return <div className="text-red-500 p-4">Error loading properties</div>
  }

  return (
    <main className="min-h-screen bg-[#0e1a2b] text-white p-6">
      <h1 className="text-3xl font-bold mb-4">Manage Users</h1>
      <AdminUsersPageContent users={users} properties={properties} />
    </main>
  )
}
// ==== FILE: /app/admin/users/page.tsx END ====
