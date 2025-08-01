import { createServerClient } from '@supabase/ssr';
import { cookies } from 'next/headers';
import { NextRequest } from 'next/server';
import type { Database } from '@/types/supabase.types';

const supabaseUrl = process.env.NEXT_PUBLIC_SUPABASE_URL!;
const supabaseKey = process.env.SUPABASE_SERVICE_ROLE_KEY!;

export async function POST(req: NextRequest, context: any) {
  const cookieStore = await cookies(); // ✅ FIXED: Await cookies()

  const supabase = createServerClient<Database>(supabaseUrl, supabaseKey, {
    cookies: cookieStore, // ✅ Now this is a valid CookieMethodsServer
  });

  const { id } = context.params;

  const { error } = await supabase
    .from('users_extended')
    .update({ registration_status: 'denied' })
    .eq('id', id);

  if (error) {
    return new Response(JSON.stringify({ error: error.message }), {
      status: 500,
    });
  }

  return new Response(JSON.stringify({ success: true }), {
    status: 200,
  });
}
