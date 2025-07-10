'use client'

import { cookies } from 'next/headers'
import { createServerClient } from '@supabase/ssr'
import { notFound, useRouter } from 'next/navigation'
import Link from 'next/link'
import { useState } from 'react'

export const dynamic = 'force-dynamic'

interface PageProps {
  params: {
    id: string
  }
}

export default async function EditUserPage({ params }: PageProps) {
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

  async function updateApproval(status: boolean) {
    'use server'
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
    await supabase
      .from('users_extended')
      .update({ is_approved: status })
      .eq('id', params.id)
  }

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
        <p className="mb-4"><span className="font-semibold">Residential Address:</span> {userRecord.res_address_line1} {userRecord.res_address_line2}, {userRecord.res_city}, {userRecord.res_state} {userRecord.res_zip}</p>
        <p className="mb-4"><span className="font-semibold">Mailing Address:</span> {userRecord.mail_address_line1} {userRecord.mail_address_line2}, {userRecord.mail_city}, {userRecord.mail_state} {userRecord.mail_zip}</p>
        <p className="mb-4"><span className="font-semibold">Approved:</span> {userRecord.is_approved ? '✅' : '❌'}</p>

        <div className="mt-6 flex gap-4">
          <form action={async () => updateApproval(true)}>
            <button className="bg-emerald-600 hover:bg-emerald-500 text-white font-semibold py-2 px-4 rounded">✅ Approve</button>
          </form>
          <form action={async () => updateApproval(false)}>
            <button className="bg-red-600 hover:bg-red-500 text-white font-semibold py-2 px-4 rounded">❌ Deny</button>
          </form>
        </div>
      </div>
    </main>
  )
}
