//assign-chips route.ts

import { NextResponse } from 'next/server';
import { createServerClient } from '@supabase/ssr';
import { cookies } from 'next/headers';
import { Database } from '@/types/supabase';

export async function POST(req: Request) {
  const cookieStore = cookies();
  const supabase = createServerClient<Database>(
    process.env.NEXT_PUBLIC_SUPABASE_URL!,
    process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY!,
    { cookies: () => cookieStore }
  );

  const body = await req.json();
  const { user_id, property_id, chip_ids, paypal_transaction_id, quantity, total_amount } = body;

  if (!user_id || !chip_ids || chip_ids.length === 0) {
    return NextResponse.json({ error: 'Missing fields' }, { status: 400 });
  }

  // Step 1: Assign chips
  const { error: updateError } = await supabase
    .from('chips')
    .update({
      owner_id: user_id,
      assigned_at: new Date().toISOString()
    })
    .in('id', chip_ids);

  if (updateError) {
    return NextResponse.json({ error: updateError.message }, { status: 500 });
  }

  // Step 2: Log purchase transaction
  await supabase.from('chip_purchase_transactions').insert({
    user_id,
    property_id,
    chip_ids,
    paypal_transaction_id,
    quantity,
    total_amount
  });

  // Step 3: Award badges
  await evaluateAndAwardBadges(supabase, user_id);

  return NextResponse.json({ success: true });
}

async function evaluateAndAwardBadges(supabase: ReturnType<typeof createServerClient>, user_id: string) {
  const { data: chips, error: chipError } = await supabase
    .from('chips')
    .select('id, property_id, assigned_at')
    .eq('owner_id', user_id)
    .eq('is_hidden', false);

  if (!chips || chipError) return;

  const distinctProps = new Set(chips.map(c => c.property_id));
  const totalChips = chips.length;

  await insertBadgeIfEligible(supabase, user_id, 'first_chip', totalChips === 1);
  await insertBadgeIfEligible(supabase, user_id, 'diversifier', distinctProps.size >= 3);
  await insertBadgeIfEligible(supabase, user_id, 'whale_watcher', totalChips >= 100);

  const monthlyPurchaseMap = new Set(chips.map(c => {
    const date = new Date(c.assigned_at!);
    return `${date.getUTCFullYear()}-${date.getUTCMonth()}`;
  }));
  await insertBadgeIfEligible(supabase, user_id, 'consistent_investor', monthlyPurchaseMap.size >= 3);

  const { data: properties } = await supabase.from('properties').select('id, created_at');
  const propMap = Object.fromEntries((properties || []).map(p => [p.id, new Date(p.created_at)]));

  const isEarly = chips.some(c => {
    const assigned = new Date(c.assigned_at!);
    const created = propMap[c.property_id];
    return created && assigned.getTime() - created.getTime() < 3 * 24 * 60 * 60 * 1000;
  });
  await insertBadgeIfEligible(supabase, user_id, 'early_backer', isEarly);
}

async function insertBadgeIfEligible(
  supabase: ReturnType<typeof createServerClient>,
  user_id: string,
  badge_key: string,
  condition: boolean
) {
  if (!condition) return;

  const { data: existing } = await supabase
    .from('user_badges')
    .select('id')
    .eq('user_id', user_id)
    .eq('badge_key', badge_key)
    .maybeSingle();

  if (!existing) {
    await supabase.from('user_badges').insert({
      user_id,
      badge_key,
      earned_at: new Date().toISOString()
    });

    await supabase.from('badge_activity_log').insert({
      user_id,
      badge_key,
      triggered_by: 'chip_purchase'
    });
  }
}
