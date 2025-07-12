import { createServerClient } from '@supabase/ssr'
import { cookies } from 'next/headers'
import { Database } from '@/types/supabase'
import Link from 'next/link'

function formatDate(date: string | null): string {
  if (!date) return '—'
  const parsed = new Date(date)
  return isNaN(parsed.getTime()) ? '—' : parsed.toLocaleDateString()
}

export default async function AdminUsersPage() {
  const supabaseUrl = process.env.NEXT_PUBLIC_SUPABASE_URL!
  const supabaseAnonKey = process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY!
  const cookieStore = await cookies()

  const supabase = createServerClient<Database>(
    supabaseUrl,
    supabaseAnonKey,
    { cookies: cookieStore }
  )

  const { data: users, error } = await supabase
    .from('users_extended')
    .select('*')

  if (error || !users) {
    return <main><p className="text-red-600 text-xl">Failed to fetch users: {error.message}</p></main>
  }

  return (
    <main className="p-6">
      <div className="flex justify-between items-center mb-4">
        <h1 className="text-2xl font-bold">Users</h1>
        <Link
          href="/admin/users/add-user"
          className="bg-emerald-600 hover:bg-emerald-700 text-white px-4 py-2 rounded shadow"
        >
          + Add User
        </Link>
      </div>

      <table className="w-full border">
        <thead>
          <tr className="bg-gray-100 dark:bg-gray-800 text-left">
            <th className="p-2">Name</th>
            <th className="p-2">Email</th>
            <th className="p-2">State</th>
            <th className="p-2">Created At</th>
            <th className="p-2">Actions</th>
          </tr>
        </thead>
        <tbody>
          {users.map((user) => (
            <tr key={user.id} className="border-t">
              <td className="p-2">
                <Link
                  href={`/admin/users/${user.id}/edit-user`}
                  className="text-blue-600 hover:underline"
                >
                  {user.first_name} {user.last_name}
                </Link>
              </td>
              <td className="p-2">{user.email}</td>
              <td className="p-2">{user.res_state || '—'}</td>
              <td className="p-2">{formatDate(user.created_at)}</td>
              <td className="p-2 space-x-2">
                <Link
                  href={`/admin/users/${user.id}/edit-user`}
                  className="text-blue-600 hover:underline"
                >
                  Edit
                </Link>
                <button
                  className="text-green-600 hover:underline"
                  onClick={() => console.log(`Approve ${user.id}`)}
                >
                  Approve
                </button>
                <button
                  className="text-red-600 hover:underline"
                  onClick={() => console.log(`Deny ${user.id}`)}
                >
                  Deny
                </button>
              </td>
            </tr>
          ))}
        </tbody>
      </table>
    </main>
  )
}
