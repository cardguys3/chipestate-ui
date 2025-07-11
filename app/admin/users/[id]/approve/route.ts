import { NextRequest, NextResponse } from 'next/server'
import { createServerClient } from '@supabase/ssr'
import { cookies } from 'next/headers'
import type { Database } from '@/types/supabase.types'

const supabaseUrl = process.env.NEXT_PUBLIC_SUPABASE_URL!
const supabaseKey = process.env.SUPABASE_SERVICE_ROLE_KEY!

export async function POST(req: NextRequest, context: any) {
  const { id } = context.params

  const supabase = createServerClient<Database>(supabaseUrl, supabaseKey, {
    cookies // ✅ not cookies()
  })

  const { error } = await supabase
    .from('users_extended')
    .update({ is_approved: true })
    .eq('user_id', id)

  if (error) {
    return NextResponse.json({ success: false, error: error.message }, { status: 500 })
  }

  return NextResponse.json({ success: true }, { status: 200 })
}
