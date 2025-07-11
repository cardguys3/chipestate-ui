import { NextRequest, NextResponse } from 'next/server'
import { createServerClient } from '@supabase/ssr'
import { cookies } from 'next/headers'

export async function POST(
  req: NextRequest,
  context: { params: Record<string, string> }
) {
  const { id } = context.params
  const supabase = createServerClient({ cookies })

  const { error } = await supabase
    .from('users_extended')
    .update({ is_approved: true })
    .eq('user_id', id)

  if (error) {
    return NextResponse.json({ success: false, error: error.message }, { status: 500 })
  }

  return NextResponse.json({ success: true }, { status: 200 })
}
