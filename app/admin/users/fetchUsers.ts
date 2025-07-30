// /app/admin/users/fetchUsers.ts

'use server'

import { createClient } from '../../../utils/supabase/server'

export async function fetchUsers() {
  const supabase = createClient()

  const { data, error } = await supabase
    .from('users_extended')
    .select('*')

  if (error) {
    console.error('Error fetching users:', error.message)
    return []
  }

  return data || []
}
