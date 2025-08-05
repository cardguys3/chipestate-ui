// File: /app/admin/users/toggleApproval.ts

'use server'

import { createClient } from '@/utils/supabase/server'
import { revalidatePath } from 'next/cache'
import { logStatusChange } from '@/utils/logStatusChange'

export async function toggleApproval(userId: string, currentStatus: boolean) {
  // Await createClient() because it returns a Promise
  const supabase = await createClient()

  const { error } = await supabase
    .from('users_extended')
    .update({ is_approved: !currentStatus })
    .eq('id', userId)

  if (error) {
    console.error('Failed to update approval status:', error)
    return { error: 'Failed to update status' }
  }

  await logStatusChange({
    entity_id: userId,
    entity_type: 'user',
    field_changed: 'is_approved',
    change_type: 'toggle',
  })

  revalidatePath('/admin/users')
  return { success: true }
}
