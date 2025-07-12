import { createServerComponentClient } from '@supabase/ssr'
import { cookies } from 'next/headers'
import { Database } from '@/types/supabase'
import Link from 'next/link'
import { notFound } from 'next/navigation'

interface PageProps {
  params: {
    id: string
  }
}

export default async function Page({ params }: PageProps) {
  const supabase = createServerComponentClient<Database>({ cookies })

  const { data: user, error } = await supabase
    .from('users_extended')
    .select('*')
    .eq('id', params.id)
    .single()

  if (error || !user) return notFound()

  return (
    <div className="p-4">
      <h1 className="text-2xl font-bold mb-4">Edit User</h1>
      <p><strong>Email:</strong> {user.email}</p>
      <p><strong>First Name:</strong> {user.first_name}</p>
      <p><strong>Last Name:</strong> {user.last_name}</p>
      <p><strong>Phone:</strong> {user.phone}</p>
      <p><strong>Date of Birth:</strong> {user.dob}</p>
      <p><strong>Approved:</strong> {user.is_approved ? 'Yes' : 'No'}</p>

      <div className="mt-4">
        <Link href="/admin/users" className="text-blue-500 underline">
          ← Back to Users
        </Link>
      </div>
    </div>
  )
}
