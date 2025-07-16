//assign-chips route.ts

import { createServerClient } from '@supabase/ssr';
import { cookies } from 'next/headers';
import { NextRequest, NextResponse } from 'next/server';
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
  const { user_id, property_id, chip_quantity, transaction_id } = body;

  // 1. Insert into chip_ownerships
  const { data: ownership, error: ownershipError } = await supabase
    .from('chip_ownerships')
    .insert({
      owner_id: user_id,
      property_id,
      quantity: chip_quantity,
      transaction_id,
    })
    .select()
    .single();

  if (ownershipError || !ownership) {
    return NextResponse.json({ error: 'Failed to assign chips.' }, { status: 500 });
  }

  // 2. Award badges
  const { data: userBadges } = await supabase
    .from('user_badges')
    .select('badge_key')
    .eq('user_id', user_id);

  const earnedBadges = userBadges?.map((b) => b.badge_key) || [];

  const badgeToAward = 'first_investment';

  if (!earnedBadges.includes(badgeToAward)) {
    await supabase.from('user_badges').insert({
      user_id,
      badge_key: badgeToAward,
      earned_at: new Date().toISOString(),
    });
  }

  return NextResponse.json({ message: 'Chips assigned and badge awarded.' });
}
