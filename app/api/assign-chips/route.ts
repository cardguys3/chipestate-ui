import { createClient } from '@supabase/supabase-js'
import { NextResponse } from 'next/server'

const supabase = createClient(
  process.env.NEXT_PUBLIC_SUPABASE_URL!,
  process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY!
)

export async function POST(req: Request) {
  const { property_id, user_id, quantity, paypal_transaction_id } = await req.json()

  const { data: availableChips, error: chipError } = await supabase
    .from('chips')
    .select('id')
    .eq('property_id', property_id)
    .eq('owner_id', null)
    .eq('is_hidden', false)
    .eq('is_active', true)
    .limit(quantity)

  if (chipError || !availableChips || availableChips.length < quantity) {
    return NextResponse.json({ error: 'Not enough chips available' }, { status: 400 })
  }

  const chipIds = availableChips.map((c) => c.id)

  const { error: updateError } = await supabase
    .from('chips')
    .update({ owner_id: user_id, assigned_at: new Date().toISOString() })
    .in('id', chipIds)

  if (updateError) {
    return NextResponse.json({ error: 'Failed to assign chips' }, { status: 500 })
  }

  await supabase.from('chip_purchase_transactions').insert({
    user_id,
    property_id,
    chip_ids: chipIds,
    quantity,
    paypal_transaction_id
  })

  // 🏅 Badge logic
  await awardBadge(user_id, 'first_chip')
  await checkDiversifier(user_id)
  await checkWhaleWatcher(user_id)
  await checkMetaCollectorBadges(user_id)

  return NextResponse.json({ success: true })
}

async function awardBadge(user_id: string, badge_key: string) {
  const { data: existing } = await supabase
    .from('user_badges')
    .select('id')
    .eq('user_id', user_id)
    .eq('badge_key', badge_key)

  if (!existing?.length) {
    await supabase.from('user_badges').insert({ user_id, badge_key })
  }
}

async function checkDiversifier(user_id: string) {
  const { data: chips } = await supabase
    .from('chips')
    .select('property_id')
    .eq('owner_id', user_id)

  const uniqueProps = new Set(chips?.map(c => c.property_id))
  if (uniqueProps.size >= 3) {
    await awardBadge(user_id, 'diversifier')
  }
}

async function checkWhaleWatcher(user_id: string) {
  const { count } = await supabase
    .from('chips')
    .select('*', { count: 'exact', head: true })
    .eq('owner_id', user_id)

  if ((count || 0) >= 100) {
    await awardBadge(user_id, 'whale_watcher')
  }
}

async function checkMetaCollectorBadges(user_id: string) {
  const { data: userBadges } = await supabase
    .from('user_badges')
    .select('badge_key')
    .eq('user_id', user_id)

  const badgeCount = userBadges?.length || 0
  if (badgeCount >= 3) await awardBadge(user_id, 'badge_collector_3')
  if (badgeCount >= 5) await awardBadge(user_id, 'badge_collector_5')
  if (badgeCount >= 10) await awardBadge(user_id, 'badge_collector_10')

  const { data: allBadges } = await supabase.from('badges_catalog').select('key')
  const totalAvailable = allBadges?.length || 0

  if (badgeCount >= totalAvailable) {
    await awardBadge(user_id, 'badge_master')
  }
}
