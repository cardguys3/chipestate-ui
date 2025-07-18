// File: app/api/register/route.ts
import { NextResponse } from 'next/server'
import { createClient } from '@supabase/supabase-js'

const supabase = createClient(
  process.env.NEXT_PUBLIC_SUPABASE_URL!,
  process.env.SUPABASE_SERVICE_ROLE_KEY! // THIS IS SERVER ONLY — never used in client
)

export async function POST(req: Request) {
  try {
    const body = await req.json()
    const { email, ...profileData } = body

    const { error } = await supabase
      .from('registration_buffer')
      .upsert({ email, ...profileData }, { onConflict: 'email' })

    if (error) {
      return NextResponse.json({ message: error.message }, { status: 500 })
    }

    return NextResponse.json({ message: 'Upsert successful' }, { status: 200 })
  } catch (err: any) {
    return NextResponse.json({ message: err.message || 'Unexpected error' }, { status: 500 })
  }
}
