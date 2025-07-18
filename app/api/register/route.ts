// File: app/api/register/route.ts

import { NextResponse } from 'next/server'
import { createClient } from '@supabase/supabase-js'

const supabaseUrl = process.env.NEXT_PUBLIC_SUPABASE_URL!
const serviceRoleKey = process.env.SUPABASE_SERVICE_ROLE_KEY!

const supabase = createClient(supabaseUrl, serviceRoleKey)

export async function POST(request: Request) {
  try {
    const body = await request.json()

    if (!body?.email) {
      return NextResponse.json({ error: 'Missing email' }, { status: 400 })
    }

    const { error } = await supabase
      .from('registration_buffer')
      .upsert(body)

    if (error) {
      console.error('Upsert failed:', error)
      return NextResponse.json({ error: error.message }, { status: 500 })
    }

    return NextResponse.json({ message: 'Upsert successful' })
  } catch (err: any) {
    console.error('Unexpected error in API route:', err)
    return NextResponse.json({ error: 'Internal server error' }, { status: 500 })
  }
}
