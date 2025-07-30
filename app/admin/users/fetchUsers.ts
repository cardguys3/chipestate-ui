// /app/admin/users/fetchUsers.ts
import { cookies } from 'next/headers'
import { createServerClient } from '../../../../utils/supabase/server'

export async function fetchUsers() {
  const supabase = createServerClient<Database>();

  const { data, error } = await supabase
    .from('users_extended')
    .select(`
      id,
      email,
      first_name,
      last_name,
      phone,
      is_active,
      is_approved,
      email_verified,
      email_confirmed_at,
      created_at
    `);

  if (error) {
    console.error('Error fetching users:', error.message);
    return [];
  }

  return data || [];
}
