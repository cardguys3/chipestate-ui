import { cookies } from 'next/headers';
import { createServerClient } from '@supabase/ssr';

export async function POST(request: Request, context: { params: { id: string } }) {
  const { params } = context;

  const supabase = createServerClient({ cookies });

  const { error } = await supabase
    .from('users_extended')
    .update({ is_approved: true })
    .eq('user_id', params.id);

  if (error) {
    return new Response(JSON.stringify({ success: false, error: error.message }), {
      status: 500,
    });
  }

  return new Response(JSON.stringify({ success: true }), {
    status: 200,
  });
}
