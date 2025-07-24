// app/api/purchase/route.ts

import { NextRequest, NextResponse } from 'next/server';
import { createRouteHandlerClient } from '@supabase/auth-helpers-nextjs';
import { cookies } from 'next/headers';
import { v4 as uuidv4 } from 'uuid';

export async function POST(req: NextRequest) {
  const cookieStore = cookies();
  const supabase = createRouteHandlerClient({ cookies: () => cookieStore });

  const body = await req.json();
  const { property_id, quantity, paypal_transaction_id } = body;

  if (!property_id || !quantity || !paypal_transaction_id) {
    return NextResponse.json({ error: 'Missing required fields' }, { status: 400 });
  }

  const {
    data: { user },
    error: userError
  } = await supabase.auth.getUser();

  if (userError || !user?.id) {
    return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
  }

  const user_id = user.id;

  // Step 1: Select unassigned chips
  const { data: availableChips, error: chipSelectError } = await supabase
    .from('chips')
    .select('id, serial')
    .eq('property_id', property_id)
    .is('owner_id', null)
    .eq('is_hidden', false)
    .eq('is_active', true)
    .limit(quantity);

  if (chipSelectError) {
    return NextResponse.json({ error: 'Failed to query chips', detail: chipSelectError }, { status: 500 });
  }

  if (!availableChips || availableChips.length < quantity) {
    return NextResponse.json({ error: 'Not enough chips available' }, { status: 400 });
  }

  const now = new Date().toISOString();
  const totalAmount = quantity * 50;

  // Step 2: Insert transaction
  const { error: txnError } = await supabase.from('transactions').insert({
    id: uuidv4(),
    property_id,
    user_id,
    type: 'chip_purchase',
    amount: totalAmount,
    external_reference: paypal_transaction_id,
    notes: `${quantity} chips purchased`,
    created_by: user_id,
    created_at: now
  });

  if (txnError) {
    return NextResponse.json({ error: 'Failed to create transaction', detail: txnError }, { status: 500 });
  }

  // Step 3: Assign chips to user
  const chipIds = availableChips.map((c) => c.id);

  const { error: chipUpdateError } = await supabase
    .from('chips')
    .update({ owner_id: user_id, assigned_at: now })
    .in('id', chipIds);

  if (chipUpdateError) {
    return NextResponse.json({ error: 'Failed to update chip ownership', detail: chipUpdateError }, { status: 500 });
  }

  // Step 4: Insert into chip_ownerships
  const ownershipInserts = chipIds.map((chip_id) => ({ chip_id, user_id, acquired_by: 'purchase', is_current: true }));
  const { error: ownershipInsertError } = await supabase
    .from('chip_ownerships')
    .insert(ownershipInserts);

  if (ownershipInsertError) {
    return NextResponse.json({ error: 'Failed to log chip ownerships', detail: ownershipInsertError }, { status: 500 });
  }

  // Step 5: Decrement property chips_available
  const { error: updatePropertyError } = await supabase.rpc('decrement_chips_available', {
    prop_id: property_id,
    decrement_count: quantity
  });

  if (updatePropertyError) {
    return NextResponse.json({ error: 'Failed to update property chip count', detail: updatePropertyError }, { status: 500 });
  }

  return NextResponse.json({ success: true, chip_serials: availableChips.map(c => c.serial) });
}
