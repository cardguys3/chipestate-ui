import { createRouteHandlerClient } from '@supabase/auth-helpers-nextjs'
import { cookies } from 'next/headers'
import { NextResponse } from 'next/server'
import { Database } from '@/types/supabase'

export async function POST(
  req: Request,
  context: { params: { id: string } }
) {
  const supabase = createRouteHandlerClient<Database>({ cookies })

  const { data: { user } } = await supabase.auth.getUser()

  // Only allow specific admin emails
  const isAdmin = ['mark@chipestate.com', 'cardguys3@gmail.com'].includes(user?.email || '')
  if (!isAdmin) {
    return NextResponse.json({ error: 'Unauthorized' }, { status: 403 })
  }

  const userId = context.params.id

  const { error } = await supabase
    .from('users_extended')
    .update({ is_approved: true })
    .eq('id', userId)

  if (error) {
    return NextResponse.json({ error: error.message }, { status: 500 })
  }

  return NextResponse.redirect(new URL(`/admin/users/${userId}/edit`, req.url))
}
