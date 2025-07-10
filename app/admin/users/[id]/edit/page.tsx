import { notFound } from 'next/navigation'
import { createServerComponentClient } from '@supabase/auth-helpers-nextjs'
import { cookies } from 'next/headers'
import { Database } from '@/types/supabase'
import Link from 'next/link'

export default async function EditUserPage({
  params,
}: {
  params: { id: string }
}) {
  const supabase = createServerComponentClient<Database>({ cookies })

  const { data: userRecord, error } = await supabase
    .from('users_extended')
    .select('*')
    .eq('id', params.id)
    .single()

  if (!userRecord || error) return notFound()

  const approveAction = async () => {
    'use server'
    const supabase = createServerComponentClient<Database>({ cookies })
    await supabase
      .from('users_extended')
      .update({ is_approved: true })
      .eq('id', params.id)
  }

  const denyAction = async () => {
    'use server'
    const supabase = createServerComponentClient<Database>({ cookies })
    await supabase
      .from('users_extended')
      .update({ is_approved: false })
      .eq('id', params.id)
  }

  return (
    <main className="min-h-screen bg-blue-950 text-white p-6">
      <h1 className="text-2xl font-bold mb-6">Edit User: {userRecord.email}</h1>
      <div className="mb-4">
        <p><strong>Name:</strong> {userRecord.first_name} {userRecord.middle_name} {userRecord.last_name}</p>
        <p><strong>Phone:</strong> {userRecord.phone}</p>
        <p><strong>DOB:</strong> {userRecord.dob}</p>
        <p><strong>Email:</strong> {userRecord.email}</p>
        <p><strong>Approved:</strong> {userRecord.is_approved ? 'Yes' : 'No'}</p>
      </div>

      <form className="flex gap-4" action={approveAction}>
        <button
          type="submit"
          className="bg-emerald-600 hover:bg-emerald-500 text-white px-4 py-2 rounded"
        >
          Approve
        </button>
      </form>

      <form className="mt-2" action={denyAction}>
        <button
          type="submit"
          className="bg-red-600 hover:bg-red-500 text-white px-4 py-2 rounded"
        >
          Deny
        </button>
      </form>

      <Link
        href="/admin/users"
        className="inline-block mt-6 text-sm text-emerald-400 underline hover:text-emerald-200"
      >
        ← Back to User List
      </Link>
    </main>
  )
}
