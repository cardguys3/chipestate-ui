// ==== FILE: /app/admin/users/filterAndSortUsers.ts ====

import { supabase } from '@/lib/supabaseClient'
import type { User } from '@/types'

export function filterAndSortUsers(
  users: User[],
  filters?: { approved?: boolean; active?: boolean },
  sortKey: keyof User = 'last_name',
  sortAsc: boolean = true
): User[] {
  let filtered = [...users]

  if (filters?.approved !== undefined) {
    filtered = filtered.filter((u) => u.is_approved === filters.approved)
  }

  if (filters?.active !== undefined) {
    filtered = filtered.filter((u) => u.is_active === filters.active)
  }

  return filtered.sort((a, b) => {
    const aVal = a[sortKey] ?? ''
    const bVal = b[sortKey] ?? ''
    return sortAsc
      ? String(aVal).localeCompare(String(bVal))
      : String(bVal).localeCompare(String(aVal))
  })
}
// ==== END FILE: /app/admin/users/filterAndSortUsers.ts ====
