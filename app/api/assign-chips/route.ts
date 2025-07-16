//assign-chips route.ts

import { createRouteHandlerClient } from '@supabase/auth-helpers-nextjs';
import { cookies } from 'next/headers';
import { NextResponse } from 'next/server';
import { v4 as uuidv4 } from 'uuid';
import { Database } from '@/types/supabase';

export async function POST(req: Request) {
  const cookieStore = cookies();

  const supabase = createRouteHandlerClient<Database>(
    {
      cookies: {
        get: (name: string) => cookieStore.get(name)?.value,
        set() {},
        remove() {},
      },
    }
  );

  const body = await req.json();
  const { user_id, property_id, chip_quantity, amount_usd } = body;

  if (!user_id || !property_id || !chip_quantity || !amount_usd) {
    return NextResponse.json({ error: 'Missing required fields' }, { status: 400 });
  }

  // Create the chip_purchase_transaction record
  const { data: transactionData, error: transactionError } = await supabase
    .from('chip_purchase_transactions')
    .insert({
      user_id,
      property_id,
      quantity: chip_quantity,
      amount_usd,
    })
    .select()
    .single();

  if (transactionError || !transactionData) {
    return NextResponse.json({ error: 'Failed to record transaction' }, { status: 500 });
  }

  // Create chip_ownerships record
  const { error: ownershipError } = await supabase
    .from('chip_ownerships')
    .insert({
      owner_id: user_id,
      property_id,
      quantity: chip_quantity,
      transaction_id: transactionData.id,
    });

  if (ownershipError) {
    return NextResponse.json({ error: 'Failed to assign ownership' }, { status: 500 });
  }

  // Get badge keys already awarded
  const { data: userBadges } = await supabase
    .from('user_badges')
    .select('badge_key')
    .eq('user_id', user_id);

  const awarded = new Set(userBadges?.map((b) => b.badge_key));

  const newBadges: string[] = [];

  // Check badge logic
  if (chip_quantity >= 10 && !awarded.has('big_spender')) {
    newBadges.push('big_spender');
  }

  if (!awarded.has('first_purchase')) {
    newBadges.push('first_purchase');
  }

  // Award new badges
  if (newBadges.length > 0) {
    const badgeRecords = newBadges.map((badge_key) => ({
      user_id,
      badge_key,
    }));

    await supabase.from('user_badges').insert(badgeRecords);
  }

  return NextResponse.json({
    success: true,
    newBadges,
  });
}
