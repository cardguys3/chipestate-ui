//assign-chips route.ts


import { NextRequest, NextResponse } from 'next/server';
import { cookies } from 'next/headers';
import { createServerClient } from '@supabase/ssr';
import { Database } from '@/types/supabase';

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
  const { user_id, property_id, chip_ids, total_amount } = body;

  if (!user_id || !property_id || !chip_ids || chip_ids.length === 0) {
    return NextResponse.json({ error: 'Invalid input' }, { status: 400 });
  }

  // Step 1: Mark chips as owned
  const updates = chip_ids.map((chipId: string) =>
    supabase
      .from('chips')
      .update({ owner_id: user_id, assigned_at: new Date().toISOString() })
      .eq('id', chipId)
  );

  await Promise.all(updates);

  // Step 2: Record ownership
  const ownerships = chip_ids.map((chipId: string) => ({
    chip_id: chipId,
    user_id,
    acquired_by: 'purchase',
    is_current: true,
  }));

  await supabase.from('chip_ownerships').insert(ownerships);

  // Step 3: Record transaction
  await supabase.from('chip_purchase_transactions').insert({
    user_id,
    property_id,
    chip_ids,
    quantity: chip_ids.length,
    total_amount,
  });

  // Step 4: Badge Logic (First_Chip, Whale_Watcher, Diversifier)
  const { data: ownedChips } = await supabase
    .from('chips')
    .select('id, property_id')
    .eq('owner_id', user_id);

  const { data: existingBadges } = await supabase
    .from('user_badges')
    .select('badge_key')
    .eq('user_id', user_id);

  const badgeSet = new Set(existingBadges?.map(b => b.badge_key) || []);
  const newBadges: string[] = [];

  if (!badgeSet.has('first_chip')) {
    newBadges.push('first_chip');
  }

  const uniquePropertyCount = new Set(ownedChips?.map(c => c.property_id)).size;
  if (uniquePropertyCount >= 3 && !badgeSet.has('diversifier')) {
    newBadges.push('diversifier');
  }

  if ((ownedChips?.length || 0) >= 100 && !badgeSet.has('whale_watcher')) {
    newBadges.push('whale_watcher');
  }

  if (newBadges.length > 0) {
    const badgeInserts = newBadges.map(b => ({
      user_id,
      badge_key: b,
      earned_at: new Date().toISOString(),
    }));

    await supabase.from('user_badges').insert(badgeInserts);
  }

  return NextResponse.json({ success: true, newBadges });
}
