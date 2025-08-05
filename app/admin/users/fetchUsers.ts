// ==== FILE: /app/admin/users/fetchUsers.ts ====

import { supabase } from '@/lib/supabaseClient'
import type { Database } from '@/types/supabase'

export async function fetchUsers() {
  const { data, error } = await supabase
    .from('users_extended')
    .select('*')

  if (error) {
    console.error('Error fetching users:', error)
    return []
  }

  return data
}
// ==== END FILE: /app/admin/users/fetchUsers.ts ====
