// File: /app/api/assign-chips/route.ts

import { createServerClient } from '@supabase/ssr'
import { NextResponse } from 'next/server'
import { cookies as nextCookies } from 'next/headers'
// import nodemailer from 'nodemailer' // Removed for Vercel compatibility

export async function POST(req: Request) {
  const cookieStore = nextCookies()
  const supabase = createServerClient(
    process.env.NEXT_PUBLIC_SUPABASE_URL!,
    process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY!,
    { cookies: cookieStore as any }
  )

  const { property_id, user_id, quantity, paypal_transaction_id } = await req.json()
  if (!property_id || !user_id || !quantity || !paypal_transaction_id) {
    return NextResponse.json({ error: 'Missing required fields' }, { status: 400 })
  }

  // Step 1: Get unassigned chips
  const { data: chips, error: chipError } = await supabase
    .from('chips')
    .select('*')
    .eq('property_id', property_id)
    .is('owner_id', null)
    .limit(quantity)

  if (chipError || !chips || chips.length < quantity) {
    return NextResponse.json({ error: 'Not enough chips available' }, { status: 400 })
  }

  const now = new Date().toISOString()

  // Step 2: Update chips
  const updates = chips.map(chip =>
    supabase
      .from('chips')
      .update({ owner_id: user_id, assigned_at: now })
      .eq('id', chip.id)
  )

  await Promise.all(updates)

  // Step 3: Insert chip ownerships
  const ownerships = chips.map(chip => ({
    chip_id: chip.id,
    user_id,
    acquired_at: now,
    acquired_by: 'paypal',
    is_current: true
  }))

  const { error: ownershipError } = await supabase
    .from('chip_ownerships')
    .insert(ownerships)

  if (ownershipError) {
    return NextResponse.json({ error: 'Ownership insert failed' }, { status: 500 })
  }

  // Step 4: Log to property_logs
  const { error: logError } = await supabase
    .from('property_logs')
    .insert({
      property_id,
      admin_email: 'system@chipestate.com',
      action: 'chip_purchase',
      changes: {
        user_id,
        chips_assigned: chips.map(chip => chip.id),
        quantity,
        paypal_transaction_id
      },
      created_at: now
    })

  if (logError) {
    console.error('Logging failed:', logError.message)
  }

  // Step 5: Insert into chip_purchase_transactions
  const { error: txnError } = await supabase
    .from('chip_purchase_transactions')
    .insert({
      user_id,
      property_id,
      paypal_transaction_id,
      chip_ids: chips.map(chip => chip.id),
      quantity,
      total_amount: quantity * 50,
      created_at: now
    })

  if (txnError) {
    console.error('Transaction log failed:', txnError.message)
  }

  // Step 6: Email notification (disabled for Edge Runtime compatibility)
  // TODO: Offload to Supabase Edge Function or external email service like Resend/Postmark
  // const transporter = nodemailer.createTransport({
  //   service: 'gmail',
  //   auth: {
  //     user: process.env.SMTP_USER,
  //     pass: process.env.SMTP_PASS
  //   }
  // })
  // await transporter.sendMail({
  //   from: 'system@chipestate.com',
  //   to: 'cardguys3@gmail.com',
  //   subject: 'Chip Purchase Confirmation',
  //   text: `${quantity} chip(s) have been successfully purchased for property ID ${property_id}.`
  // })

  return NextResponse.json({ message: 'Chips successfully assigned' }, { status: 200 })
}
