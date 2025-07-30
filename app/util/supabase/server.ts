// /app/utils/supabase/server.ts

import { createServerComponentClient } from '@supabase/auth-helpers-nextjs'
import { cookies } from 'next/headers'
import { Database } from '@/types/supabase'

export function createServerClient(cookieStore = cookies()) {
  return createServerComponentClient<Database>({ cookies: () => cookieStore })
}
