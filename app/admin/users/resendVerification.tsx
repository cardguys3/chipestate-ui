// File: /app/admin/users/resendVerification.ts

'use server'

import { createClient } from '@/utils/supabase/server'
import { revalidatePath } from 'next/cache'
import { logStatusChange } from '@/utils/logStatusChange'

export async function resendVerification(userId: string, email: string) {
  // Await createClient() because it returns a Promise
  const supabase = await createClient()

  const { data, error } = await supabase.auth.admin.inviteUserByEmail(email)

  if (error) {
    console.error('Error resending verification email:', error)
    return { error: 'Failed to resend verification email.' }
  }

  await logStatusChange({
    entity_id: userId,
    entity_type: 'user',
    field_changed: 'email_confirmed_at',
    change_type: 'resend_verification',
  })

  revalidatePath('/admin/users')
  return { success: true }
}
