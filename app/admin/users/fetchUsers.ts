// ==== FILE: /app/admin/users/fetchUsers.ts START ====
'use server'

import { createClient } from '@/utils/supabase/server'

export async function fetchUsers() {
  const supabase = createClient()

  const { data, error } = await supabase
    .from('users_extended')
    .select(`
      *,
      auth:auth.users (
        id,
        email,
        email_confirmed_at
      )
    `)
    .order('created_at', { ascending: false })

  if (error) {
    console.error('Error fetching users:', error)
    return []
  }

  return data.map((user: any) => ({
    ...user,
    email: user.auth?.email ?? '',
    email_confirmed_at: user.auth?.email_confirmed_at ?? null
  }))
}
// ==== FILE: /app/admin/users/fetchUsers.ts END ====
