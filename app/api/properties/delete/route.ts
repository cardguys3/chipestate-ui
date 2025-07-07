import { createServerClient } from '@supabase/ssr'
import { cookies as getCookies } from 'next/headers'
import { NextRequest, NextResponse } from 'next/server'

export async function POST(req: NextRequest) {
  const cookieStore = await getCookies()

  const supabase = createServerClient(
    process.env.NEXT_PUBLIC_SUPABASE_URL!,
    process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY!,
    {
      cookies: {
        get: (name) => cookieStore.get(name)?.value ?? '',
        set: () => {},   // No-op for SSR
        remove: () => {} // No-op for SSR
      }
    }
  )

  const { id } = await req.json()

  const { error } = await supabase
    .from('properties')
    .update({ is_hidden: true })
    .eq('id', id)

  if (error) {
    return NextResponse.json({ success: false, error: error.message }, { status: 500 })
  }

  return NextResponse.json({ success: true })
}
