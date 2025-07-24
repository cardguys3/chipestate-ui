// supabase/functions/notify-distribution/index.ts
import { serve } from 'https://deno.land/std@0.168.0/http/server.ts'
import { createClient } from 'https://esm.sh/@supabase/supabase-js@2'

serve(async (req) => {
  const SUPABASE_URL = Deno.env.get('SUPABASE_URL')!
  const SUPABASE_SERVICE_ROLE_KEY = Deno.env.get('SUPABASE_SERVICE_ROLE_KEY')!

  const supabase = createClient(SUPABASE_URL, SUPABASE_SERVICE_ROLE_KEY)

  if (req.method !== 'POST') {
    return new Response('Method not allowed', { status: 405 })
  }

  const body = await req.json()
  const { userNotifications } = body // [{ user_id, amount, property_name }]

  if (!Array.isArray(userNotifications)) {
    return new Response(JSON.stringify({ error: 'Missing userNotifications array' }), { status: 400 })
  }

  const messages = userNotifications.map(n => ({
    user_id: n.user_id,
    type: 'chip_distribution',
    message: `Good News! Your chips just earned $${n.amount.toFixed(2)} from ${n.property_name}.`,
    metadata: { amount: n.amount, property_name: n.property_name }
  }))

  const { error } = await supabase.from('notifications').insert(messages)
  if (error) {
    return new Response(JSON.stringify({ error: error.message }), { status: 500 })
  }

  return new Response(JSON.stringify({ status: 'success', count: messages.length }), { status: 200 })
})
