import { createServerClient } from '@supabase/ssr'
import { cookies as nextCookies } from 'next/headers'
import type { Database } from '@/types/supabase.types'
import { NextRequest } from 'next/server'

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
  })

  const { id } = context.params

  const { error } = await supabase
    .from('users_extended')
    .update({ registration_status: 'approved' })
    .eq('id', id)

  if (error) {
    return new Response(JSON.stringify({ error: error.message }), {
      status: 500,
    })
  }

  return new Response(JSON.stringify({ success: true }), {
    status: 200,
  })
}
