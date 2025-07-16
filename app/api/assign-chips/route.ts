//assign-chips route.ts

import { NextRequest, NextResponse } from 'next/server';
import { createRouteHandlerClient } from '@supabase/auth-helpers-nextjs';
import { cookies } from 'next/headers';
import { v4 as uuidv4 } from 'uuid';

export async function POST(req: NextRequest) {
  const cookieStore = cookies();

  const supabase = createRouteHandlerClient({ cookies: () => cookieStore });

  const body = await req.json();
  const { property_id, chip_quantity, transaction_id } = body;

  const {
    data: { user },
    error: userError
  } = await supabase.auth.getUser();

  if (userError || !user?.id) {
    return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
  }

  const user_id = user.id;

  // Create chips
  const chipIds: string[] = [];
  for (let i = 0; i < chip_quantity; i++) {
    chipIds.push(uuidv4());
  }

  const { error: chipError } = await supabase
    .from('chips')
    .insert(
      chipIds.map((id) => ({
        id,
        property_id,
        serial: `CHIP-${id.slice(0, 8)}`,
        transaction_id,
        is_active: true,
        is_hidden: false
      }))
    );

  if (chipError) {
    return NextResponse.json({ error: 'Failed to insert chips', detail: chipError }, { status: 500 });
  }

  // Assign chips to user
  const { error: ownershipError } = await supabase
    .from('chip_ownerships')
    .insert(
      chipIds.map((chip_id) => ({
        chip_id,
        user_id,
        owner_id: user_id,
        assigned_at: new Date().toISOString()
      }))
    );

  if (ownershipError) {
    return NextResponse.json({ error: 'Failed to assign chips', detail: ownershipError }, { status: 500 });
  }

  return NextResponse.json({ success: true, chipIds });
}
