// ==== FILE: /app/admin/users/manuallyVerifyEmail.ts START ====
'use server'

import { createClient } from '@/utils/supabase/server'
import { revalidatePath } from 'next/cache'
import { logStatusChange } from '@/utils/logStatusChange'

export async function manuallyVerifyEmail(userId: string) {
  const supabase = createClient()

  const { error } = await supabase
    .from('users_extended')
    .update({ email_confirmed_at: new Date().toISOString() })
    .eq('id', userId)

  if (error) {
    console.error('Error manually verifying email:', error)
    return { error: 'Failed to verify email manually.' }
  }

  await logStatusChange({
    entity_id: userId,
    entity_type: 'user',
    field_changed: 'email_confirmed_at',
    change_type: 'manual_override'
  })

  revalidatePath('/admin/users')
  return { success: true }
}
// ==== FILE: /app/admin/users/manuallyVerifyEmail.ts END ====
