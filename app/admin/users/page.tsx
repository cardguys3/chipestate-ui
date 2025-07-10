import { cookies } from 'next/headers'
import { createServerClient } from '@supabase/ssr'
import Link from 'next/link'

export const dynamic = 'force-dynamic'

export default async function AdminUsersPage() {
  const cookieStore = await cookies()
  const supabase = createServerClient(
    process.env.NEXT_PUBLIC_SUPABASE_URL!,
    process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY!,
    {
      cookies: {
        get: (name) => cookieStore.get(name)?.value ?? '',
        set: () => {},
        remove: () => {},
      },
    }
  )

  const {
    data: { user },
  } = await supabase.auth.getUser()

  const isAdmin = ['mark@chipestate.com', 'cardguys3@gmail.com'].includes(user?.email || '')
  if (!isAdmin) {
    return (
      <main className="min-h-screen flex items-center justify-center text-white bg-blue-950">
        <p className="text-xl">Unauthorized</p>
      </main>
    )
  }

  const { data: users, error } = await supabase
    .from('users_extended')
    .select('id, email, first_name, last_name, created_at, is_approved')
    .order('created_at', { ascending: false })

  if (error) {
    return (
      <main className="min-h-screen flex items-center justify-center text-white bg-blue-950">
        <p className="text-xl">Error loading users</p>
      </main>
    )
  }

  return (
    <main className="min-h-screen bg-blue-950 text-white p-6">
      <div className="flex justify-between items-center mb-6">
        <h1 className="text-3xl font-bold">Manage Users</h1>
        <Link
          href="/admin/users/add"
          className="bg-emerald-700 hover:bg-emerald-600 text-white font-semibold py-2 px-4 rounded shadow"
        >
          + Add User
        </Link>
      </div>
      <div className="overflow-x-auto">
        <table className="min-w-full bg-blue-900 text-white border border-blue-700 rounded-lg shadow">
          <thead className="bg-blue-800">
            <tr>
              <th className="px-4 py-2 text-left">Name</th>
              <th className="px-4 py-2 text-left">Email</th>
              <th className="px-4 py-2 text-left">Approved</th>
              <th className="px-4 py-2 text-left">Created</th>
              <th className="px-4 py-2 text-left">Actions</th>
            </tr>
          </thead>
          <tbody>
            {users?.map((user) => (
              <tr key={user.id} className="border-t border-blue-700 hover:bg-blue-800">
                <td className="px-4 py-2">
                  <Link
                    href={`/admin/users/${user.id}/edit`}
                    className="text-emerald-300 hover:underline"
                  >
                    {user.first_name} {user.last_name}
                  </Link>
                </td>
                <td className="px-4 py-2">{user.email}</td>
                <td className="px-4 py-2">{user.is_approved ? '✅' : '❌'}</td>
                <td className="px-4 py-2">{new Date(user.created_at).toLocaleDateString()}</td>
                <td className="px-4 py-2 space-x-2">
                  <button className="text-yellow-400 hover:underline">Deactivate</button>
                  <button className="text-red-500 hover:underline">Delete</button>
                </td>
              </tr>
            ))}
          </tbody>
        </table>
      </div>
    </main>
  )
}
