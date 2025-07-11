import { NextRequest, NextResponse } from 'next/server'
import { createServerActionClient } from '@supabase/auth-helpers-nextjs'
import { cookies } from 'next/headers'
import { Database } from '@/types/supabase'

export async function POST(req: NextRequest, { params }: { params: { id: string } }) {
  const supabase = createServerActionClient<Database>({ cookies })
  const formData = await req.formData()
  const action = formData.get('action')

  const is_approved = action === 'approve'
  const { error } = await supabase
    .from('users_extended')
    .update({ is_approved })
    .eq('id', params.id)

  if (error) {
    return NextResponse.json({ success: false, message: error.message }, { status: 500 })
  }

  return NextResponse.redirect(new URL('/admin/users', req.url))
}
