import { NextRequest, NextResponse } from 'next/server'
import { createServerClient } from '@supabase/ssr'
import { cookies as nextCookies } from 'next/headers'
import type { Database } from '@/types/supabase.types'
import type { CookieOptionsWithName } from '@supabase/ssr'

const supabaseUrl = process.env.NEXT_PUBLIC_SUPABASE_URL!
const supabaseKey = process.env.SUPABASE_SERVICE_ROLE_KEY!

export async function POST(req: NextRequest, context: any) {
  const cookieStore = nextCookies()

  const supabase = createServerClient<Database>(supabaseUrl, supabaseKey, {
    cookies: {
      get: (name: string) => cookieStore.get(name)?.value ?? null,
      getAll: () =>
        cookieStore.getAll().map(({ name, value }) => ({ name, value })),
      set: () => {},
      remove: () => {},
    },
    cookieOptions: {
      name: 'sb', // required by Supabase typing, safe default
    } satisfies CookieOptionsWithName,
  })

  const { id } = context.params

  const { error } = await supabase
    .from('users_extended')
    .update({ is_approved: true })
    .eq('user_id', id)

  if (error) {
    return NextResponse.json({ success: false, error: error.message }, { status: 500 })
  }

  return NextResponse.json({ success: true }, { status: 200 })
}
