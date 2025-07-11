import { NextRequest } from 'next/server'
import { createServerClient, type CookieMethodsServer, type CookieOptionsWithName } from '@supabase/ssr'
import { cookies as nextCookies } from 'next/headers'
import type { Database } from '@/types/supabase'

const supabaseUrl = process.env.NEXT_PUBLIC_SUPABASE_URL!
const supabaseKey = process.env.SUPABASE_SERVICE_ROLE_KEY!

export async function POST(req: NextRequest, context: any) {
  const cookieStore = nextCookies()

  const cookieMethods: CookieMethodsServer = {
    get(name: string) {
      const value = cookieStore.get(name)
      return value?.value ?? null
    },
    getAll() {
      return cookieStore.getAll().map(({ name, value }) => ({ name, value }))
    },
    set() {
      // Implement as needed
    },
    remove() {
      // Implement as needed
    },
  }

  const supabase = createServerClient<Database>(supabaseUrl, supabaseKey, {
    cookies: cookieMethods,
    cookieOptions: {
      name: 'sb',
    } satisfies CookieOptionsWithName,
  })

  const { id } = context.params

  const { error } = await supabase
    .from('users_extended')
    .update({ is_approved: true })
    .eq('id', id)

  if (error) {
    return new Response(JSON.stringify({ error: error.message }), {
      status: 500,
    })
  }

  return new Response(JSON.stringify({ success: true }))
}
