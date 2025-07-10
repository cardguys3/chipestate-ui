import { cookies } from 'next/headers'
import { createServerClient } from '@supabase/ssr'
import { notFound } from 'next/navigation'
import type { Metadata } from 'next'

export const dynamic = 'force-dynamic'

export const metadata: Metadata = {
  title: 'Edit User | ChipEstate',
}

export default async function EditUserPage({
  params,
}: {
  params: { id: string }
}) {
  const cookieStore = cookies()
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

  const { data: { user } } = await supabase.auth.getUser()
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
      <h1 className="text-2xl font-bold mb-4">Edit User</h1>
      <div className="bg-blue-900 p-4 rounded shadow max-w-xl">
        <p><strong>Name:</strong> {userRecord.first_name} {userRecord.last_name}</p>
        <p><strong>Email:</strong> {userRecord.email}</p>
        <p><strong>Phone:</strong> {userRecord.phone || '-'}</p>
        <p><strong>Approved:</strong> {userRecord.is_approved ? 'Yes' : 'No'}</p>

        <form
          action={`/admin/users/${params.id}/approve`}
          method="POST"
          className="mt-4 inline-block mr-3"
        >
          <button type="submit" className="bg-green-600 hover:bg-green-500 text-white font-semibold py-1 px-4 rounded">
            Approve
          </button>
        </form>

        <form
          action={`/admin/users/${params.id}/deny`}
          method="POST"
          className="inline-block"
        >
          <button type="submit" className="bg-red-600 hover:bg-red-500 text-white font-semibold py-1 px-4 rounded">
            Deny
          </button>
        </form>
      </div>
    </main>
  )
}
