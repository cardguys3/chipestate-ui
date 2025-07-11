import { createServerComponentClient } from '@supabase/ssr'
import { cookies } from 'next/headers'
import { Database } from '@/types/supabase'
import Link from 'next/link'

export default function Page({ params }: { params: { id: string } }) {
  return <EditUser userId={params.id} />
}

async function EditUser({ userId }: { userId: string }) {
  const supabase = createServerComponentClient<Database>({ cookies })

  const { data: user, error } = await supabase
    .from('users_extended')
    .select('*')
    .eq('id', userId)
    .single()


  if (error || !user) {
    return (
      <main className="p-6">
        <h1 className="text-xl font-semibold text-red-600">Error loading user</h1>
        <p>{error?.message || 'User not found.'}</p>
      </main>
    )
  }

  return (
    <main className="p-6">
      <h1 className="text-2xl font-bold mb-4">Edit User</h1>
      <div className="space-y-2">
        <p><strong>Name:</strong> {user.first_name} {user.last_name}</p>
        <p><strong>Email:</strong> {user.email}</p>
        <p><strong>Phone:</strong> {user.phone || '—'}</p>
        <p><strong>DOB:</strong> {user.dob || '—'}</p>
        <p><strong>Address:</strong> {user.res_address_line1} {user.res_address_line2}, {user.res_city}, {user.res_state} {user.res_zip}</p>
        <p><strong>Registration Status:</strong> {user.registration_status || '—'}</p>
        <p><strong>Approved:</strong> {user.is_approved ? 'Yes' : 'No'}</p>
      </div>
      <div className="mt-6">
        <Link href="/admin/users" className="text-blue-600 hover:underline">← Back to Users</Link>
      </div>
    </main>
  )
}
