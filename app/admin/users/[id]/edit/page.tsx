import { cookies } from 'next/headers'
import { createServerClient } from '@supabase/ssr'
import { notFound } from 'next/navigation'
import Link from 'next/link'

export const dynamic = 'force-dynamic'

export default async function EditUserPage({ params }: { params: { id: string } }) {
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

  const { data: userRecord, error } = await supabase
    .from('users_extended')
    .select('*')
    .eq('id', params.id)
    .single()

  if (!userRecord || error) return notFound()

  return (
    <main className="min-h-screen bg-blue-950 text-white p-6">
      <div className="flex justify-between items-center mb-6">
        <h1 className="text-3xl font-bold">Edit User</h1>
        <Link href="/admin/users" className="text-emerald-400 hover:underline">Back to Users</Link>
      </div>

      <div className="bg-blue-900 p-6 rounded-lg shadow-lg">
        <p className="mb-4"><span className="font-semibold">Email:</span> {userRecord.email}</p>
        <p className="mb-4"><span className="font-semibold">Name:</span> {userRecord.first_name} {userRecord.last_name}</p>
        <p className="mb-4"><span className="font-semibold">Phone:</span> {userRecord.phone || 'N/A'}</p>
        <p className="mb-4"><span className="font-semibold">DOB:</span> {userRecord.dob || 'N/A'}</p>
        <p className="mb-4"><span className="font-semibold">Address:</span> {userRecord.address_line1} {userRecord.address_line2}, {userRecord.city}, {userRecord.state} {userRecord.zip}</p>
        <p className="mb-4"><span className="font-semibold">Approved:</span> {userRecord.is_approved ? '✅' : '❌'}</p>

        {/* Future edit form can be inserted here */}
        <div className="mt-6">
          <button className="bg-emerald-700 hover:bg-emerald-600 text-white font-semibold py-2 px-4 rounded">Edit (Coming Soon)</button>
        </div>
      </div>
    </main>
  )
}
