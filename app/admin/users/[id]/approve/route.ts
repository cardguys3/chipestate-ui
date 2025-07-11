import { NextResponse } from "next/server";
import { createClient } from "@/utils/supabase/server";
import { Database } from "@/types/supabase";

// Fix: correctly use context parameter
export async function POST(request: Request, context: { params: { id: string } }) {
  const { params } = context;
  const userId = params.id;

  const supabase = createClient();

  // Update the 'is_approved' field in the 'users_extended' table
  const { error } = await supabase
    .from("users_extended")
    .update({ is_approved: true })
    .eq("user_id", userId);

  if (error) {
    return NextResponse.json({ success: false, error: error.message }, { status: 500 });
  }

  return NextResponse.json({ success: true }, { status: 200 });
}
