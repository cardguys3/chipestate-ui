// File: /utils/logStatusChange.ts

import { createClient } from './supabase/server'

type LogParams = {
  entity_id: string
  entity_type: 'user' | 'property' | 'property_manager'
  field_changed: string
  change_type: string
}

export async function logStatusChange(params: LogParams) {
  // Await createClient() because it returns a Promise
  const supabase = await createClient()
  const { error } = await supabase.from('status_change_log').insert([params])

  if (error) {
    console.error('Error logging status change:', error)
  }
}
