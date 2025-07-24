// supabase/functions/notify-distribution/index.ts

import { serve } from "https://deno.land/std@0.177.0/http/server.ts"
import { createClient } from "https://esm.sh/@supabase/supabase-js@2"

serve(async (req) => {
  const { SUPABASE_URL, SUPABASE_ANON_KEY } = Deno.env.toObject()

  const supabase = createClient(SUPABASE_URL!, SUPABASE_ANON_KEY!)

  const { property_id, distribution_date, chip_earnings } = await req.json()

  if (!property_id || !chip_earnings || !Array.isArray(chip_earnings)) {
    return new Response("Missing required parameters", { status: 400 })
  }

  const { data: property, error: propertyErr } = await supabase
    .from("properties")
    .select("title")
    .eq("id", property_id)
    .single()

  if (propertyErr) {
    return new Response("Property not found", { status: 404 })
  }

  const messages = chip_earnings.map((entry: any) => ({
    user_id: entry.user_id,
    type: "chip_earning",
    message: `Good News! Your chips just earned $${entry.amount.toFixed(
      2
    )} from ${property.title}.`,
    metadata: {
      chip_id: entry.chip_id,
      property_id: property_id,
      amount: entry.amount,
      earning_date: distribution_date,
    },
  }))

  const { error: insertError } = await supabase.from("notifications").insert(messages)

  if (insertError) {
    console.error(insertError)
    return new Response("Failed to send notifications", { status: 500 })
  }

  return new Response("Notifications sent", { status: 200 })
})
