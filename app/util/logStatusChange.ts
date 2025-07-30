// /app/utils/logStatusChange.ts

import { createServerClient } from '@/utils/supabase/server'
import { cookies } from 'next/headers'

type LogStatusChangeParams = {
  entity_type: 'user' | 'property' | 'property_manager'
  entity_id: string
  status_type: string
  status: string
  changed_by?: string | null
}

export async function logStatusChange({
  entity_type,
  entity_id,
  status_type,
  status,
  changed_by,
}: LogStatusChangeParams) {
  const supabase = createServerClient(cookies())

  await supabase.from('status_change_log').insert([
    {
      entity_type,
      entity_id,
      status_type,
      status,
      changed_by: changed_by ?? null,
    },
  ])
}
