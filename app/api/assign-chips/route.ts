//assign-chips route.ts

import { NextRequest, NextResponse } from 'next/server';
import { createRouteHandlerClient } from '@supabase/auth-helpers-nextjs';
import { cookies } from 'next/headers';
import { Database } from '@/types/supabase';

export async function POST(req: NextRequest) {
  const cookieStore = cookies();
  const supabase = createRouteHandlerClient<Database>({ cookies: () => cookieStore });

  const body = await req.json();
  const { user_id, property_id, chip_quantity, transaction_id } = body;

  if (!user_id || !property_id || !chip_quantity || !transaction_id) {
    return NextResponse.json({ error: 'Missing required fields.' }, { status: 400 });
  }

  const { data: chipInsert, error: chipInsertError } = await supabase
    .from('chips')
    .insert({
      user_id,
      property_id,
      quantity: chip_quantity,
      transaction_id
    });

  if (chipInsertError) {
    console.error('Chip insert error:', chipInsertError);
    return NextResponse.json({ error: 'Failed to assign chips.' }, { status: 500 });
  }

  // --- Badge Logic ---
  const { data: userBadges } = await supabase
    .from('user_badges')
    .select('badge_key')
    .eq('user_id', user_id);

  const ownedBadges = userBadges?.map((b) => b.badge_key) || [];

  const { data: chipHoldings } = await supabase
    .from('chips')
    .select('property_id, quantity')
    .eq('user_id', user_id);

  const totalChips = chipHoldings?.reduce((sum, c) => sum + Number(c.quantity), 0) || 0;
  const distinctProperties = new Set(chipHoldings?.map((c) => c.property_id)).size;

  const newBadges: string[] = [];

  const awardBadge = async (badge_key: string) => {
    if (!ownedBadges.includes(badge_key)) {
      await supabase.from('user_badges').insert({
        user_id,
        badge_key
      });
      newBadges.push(badge_key);
    }
  };

  if (totalChips > 0) await awardBadge('first_chip');
  if (distinctProperties >= 3) await awardBadge('diversifier');
  if (totalChips >= 100) await awardBadge('whale_watcher');

  return NextResponse.json({
    success: true,
    newBadges
  });
}
