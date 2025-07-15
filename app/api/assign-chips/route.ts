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
  const { user_id, chip_ids, property_id } = body;

  if (!user_id || !chip_ids?.length || !property_id) {
    return NextResponse.json({ error: 'Missing data' }, { status: 400 });
  }

  // Assign each chip to the user
  const { error: updateError } = await supabase
    .from('chips')
    .update({ owner_id: user_id, assigned_at: new Date().toISOString() })
    .in('id', chip_ids);

  if (updateError) {
    return NextResponse.json({ error: updateError.message }, { status: 500 });
  }

  const badgeResults: string[] = [];

  const { data: ownedChips } = await supabase
    .from('chips')
    .select('id, property_id')
    .eq('owner_id', user_id)
    .eq('is_hidden', false);

  const distinctProperties = new Set(ownedChips?.map(c => c.property_id));
  const totalChips = ownedChips?.length || 0;

  const badgeChecks = [
    { key: 'first_chip', check: totalChips === chip_ids.length },
    { key: 'diversifier', check: distinctProperties.size >= 3 },
    { key: 'whale_watcher', check: totalChips >= 100 },
  ];

  const { data: userBadges } = await supabase
    .from('user_badges')
    .select('badge_key')
    .eq('user_id', user_id);

  const earnedBadges = new Set(userBadges?.map(b => b.badge_key));

  for (const b of badgeChecks) {
    if (b.check && !earnedBadges.has(b.key)) {
      await supabase.from('user_badges').insert({
        user_id,
        badge_key: b.key,
        earned_at: new Date().toISOString(),
      });
      await supabase.from('badge_activity_log').insert({
        user_id,
        badge_key: b.key,
        triggered_by: 'chip_purchase',
      });
      badgeResults.push(b.key);
    }
  }

  return NextResponse.json({ success: true, newBadges: badgeResults });
}
