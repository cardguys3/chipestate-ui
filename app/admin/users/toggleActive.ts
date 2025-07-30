// ==== FILE: /app/admin/users/toggleActive.ts START ====
'use server'

import { createClient } from '@/utils/supabase/server'
import { revalidatePath } from 'next/cache'
import { logStatusChange } from '@/utils/logStatusChange'

export async function toggleActive(userId: string, currentStatus: boolean) {
  const supabase = createClient()

  const { error } = await supabase
    .from('users_extended')
    .update({ is_active: !currentStatus })
    .eq('id', userId)

  if (error) {
    console.error('Error toggling active status:', error)
    return { error: 'Failed to update active status.' }
  }

  await logStatusChange({
    entity_id: userId,
    entity_type: 'user',
    field_changed: 'is_active',
    new_value: (!currentStatus).toString(),
    change_type: 'toggle'
  })

  revalidatePath('/admin/users')
  return { success: true }
}
// ==== FILE: /app/admin/users/toggleActive.ts END ====
