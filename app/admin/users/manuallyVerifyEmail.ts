// /app/admin/users/manuallyVerifyEmail.ts

'use server'

import { createClient } from '../../../utils/supabase/server'
import { logStatusChange } from '../../../utils/logStatusChange'

export async function manuallyVerifyEmail(userId: string) {
  const supabase = createClient()

  const { error } = await supabase
    .from('users_extended')
    .update({ email_verified: true })
    .eq('id', userId)

  if (error) {
    console.error('Error verifying email manually:', error.message)
    throw new Error('Email verification failed.')
  }

  await logStatusChange({
    user_id: userId,
    entity_type: 'user',
    field_changed: 'email_verified',
    new_value: 'true',
    triggered_by: 'admin_manual',
  })

  return true
}
