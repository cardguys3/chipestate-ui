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
      <main className="min-h-screen flex items-center justify-center text-white bg-[#0B1D33]">
        <p className="text-xl">Unauthorized</p>
      </main>
    )
  }

  const { data: users, error } = await supabase
    .from('users_extended')
    .select('id, email, first_name, last_name, created_at')
    .order('created_at', { ascending: false })

  if (error) {
    return (
      <main className="min-h-screen flex items-center justify-center text-white bg-[#0B1D33]">
        <p className="text-xl">Error loading users</p>
      </main>
    )
  }

  return (
    <main className="min-h-screen bg-[#0B1D33] text-white px-6 py-10">
      <div className="max-w-6xl mx-auto">
        <div className="flex justify-between items-center mb-6">
          <h1 className="text-2xl font-bold">Manage Users</h1>
          <Link
            href="/admin/users/add"
            className="bg-emerald-500 hover:bg-emerald-600 text-white font-medium px-4 py-2 rounded shadow"
          >
            + Add User
          </Link>
        </div>

        <div className="border border-white/20 rounded-lg overflow-hidden">
          <table className="w-full text-sm">
            <thead className="bg-white/10">
              <tr>
                <th className="text-left px-4 py-2">Name</th>
                <th className="text-left px-4 py-2">Email</th>
                <th className="text-left px-4 py-2">Created</th>
                <th className="text-left px-4 py-2">Actions</th>
              </tr>
            </thead>
            <tbody>
              {users?.map((u) => (
                <tr key={u.id} className="border-t border-white/10 hover:bg-white/5">
                  <td className="px-4 py-2">
                    <Link
                      href={`/admin/users/${u.id}/edit`}
                      className="text-blue-400 hover:underline"
                    >
                      {u.first_name} {u.last_name}
                    </Link>
                  </td>
                  <td className="px-4 py-2">{u.email}</td>
                  <td className="px-4 py-2">{new Date(u.created_at).toLocaleDateString()}</td>
                  <td className="px-4 py-2 space-x-2">
                    <button className="text-yellow-400 hover:underline">Deactivate</button>
                    <button className="text-red-500 hover:underline">Delete</button>
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      </div>
    </main>
  )
}
