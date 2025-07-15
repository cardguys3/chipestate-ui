//assign-chips route.ts

import { NextRequest, NextResponse } from 'next/server';
import { createServerClient } from '@supabase/ssr';
import { Database } from '@/types/supabase';
import { cookies } from 'next/headers';

export async function POST(req: NextRequest) {
  const cookieStore = cookies();

  const supabase = createServerClient<Database>(
    process.env.NEXT_PUBLIC_SUPABASE_URL!,
    process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY!,
    {
      cookies: {
        get(name: string) {
          return cookieStore.get(name)?.value;
        },
        set() {},
        remove() {},
      },
    }
  );

  const body = await req.json();
  const { user_id, chip_ids, property_id, quantity, paypal_transaction_id, total_amount } = body;

  const { error: txError } = await supabase.from('chip_purchase_transactions').insert([
    {
      user_id,
      chip_ids,
      property_id,
      quantity,
      paypal_transaction_id,
      total_amount,
    },
  ]);

  if (txError) return NextResponse.json({ error: txError.message }, { status: 500 });

  const now = new Date().toISOString();

  const ownerships = chip_ids.map((chip_id: string) => ({
    chip_id,
    user_id,
    acquired_at: now,
    acquired_by: 'paypal',
    is_current: true,
  }));

  const { error: ownershipError } = await supabase.from('chip_ownerships').insert(ownerships);
  if (ownershipError) return NextResponse.json({ error: ownershipError.message }, { status: 500 });

  const { error: chipUpdateError } = await supabase
    .from('chips')
    .update({ owner_id: user_id, assigned_at: now })
    .in('id', chip_ids);

  if (chipUpdateError) return NextResponse.json({ error: chipUpdateError.message }, { status: 500 });

  // 🏅 Badge Logic – First Chip, Whale Watcher
  const { data: userBadges } = await supabase
    .from('user_badges')
    .select('badge_key')
    .eq('user_id', user_id);

  const hasBadge = (key: string) => userBadges?.some((b) => b.badge_key === key);

  const { data: allOwnerships } = await supabase
    .from('chip_ownerships')
    .select('id')
    .eq('user_id', user_id)
    .eq('is_current', true);

  const earnedBadges: string[] = [];

  if (!hasBadge('first_chip')) {
    earnedBadges.push('first_chip');
  }

  if (!hasBadge('whale_watcher') && (allOwnerships?.length || 0) >= 100) {
    earnedBadges.push('whale_watcher');
  }

  if (earnedBadges.length > 0) {
    const insertPayload = earnedBadges.map((badge_key) => ({
      user_id,
      badge_key,
      earned_at: new Date().toISOString(),
    }));

    await supabase.from('user_badges').insert(insertPayload);
  }

  return NextResponse.json({ success: true, earnedBadges });
}
