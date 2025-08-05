// File: /app/admin/users/manuallyVerifyEmail.ts

'use server'

import { createClient } from '@/utils/supabase/server'
import { logStatusChange } from '@/utils/logStatusChange'

export async function manuallyVerifyEmail(userId: string) {
  // Await the async createClient function
  const supabase = await createClient()

  const { error } = await supabase
    .from('users_extended')
    .update({ email_confirmed_at: new Date().toISOString() })
    .eq('id', userId)

  if (error) {
    console.error('Failed to update user email confirmation:', error)
    return { error: 'Database update failed' }
  }

  await logStatusChange({
    entity_id: userId,
    entity_type: 'user',
    field_changed: 'email_verified',
    change_type: 'manual',
  })

  return { success: true }
}
// ==== END FILE: /app/admin/users/manuallyVerifyEmail.ts ====
