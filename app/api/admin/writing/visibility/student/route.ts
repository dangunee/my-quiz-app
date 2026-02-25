import { NextRequest, NextResponse } from "next/server";
import { createClient } from "@supabase/supabase-js";
import { verifyAdmin } from "@/lib/admin-auth";

const supabaseUrl = process.env.NEXT_PUBLIC_SUPABASE_URL!;
const supabaseKey = process.env.SUPABASE_SERVICE_ROLE_KEY!;

export async function PUT(request: NextRequest) {
  if (!verifyAdmin(request)) {
    return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
  }
  if (!supabaseUrl || !supabaseKey) {
    return NextResponse.json({ error: "Supabase not configured" }, { status: 500 });
  }

  const body = await request.json();
  const { user_id, period_index, item_index, visible_from } = body;

  if (!user_id || typeof user_id !== "string") {
    return NextResponse.json({ error: "user_id required" }, { status: 400 });
  }
  if (typeof period_index !== "number" || period_index < 0 || period_index > 7) {
    return NextResponse.json({ error: "period_index 0-7 required" }, { status: 400 });
  }
  if (typeof item_index !== "number" || item_index < 0 || item_index > 9) {
    return NextResponse.json({ error: "item_index 0-9 required" }, { status: 400 });
  }

  const visibleFromVal =
    visible_from === null || visible_from === undefined
      ? null
      : typeof visible_from === "string"
        ? visible_from.trim() || null
        : null;

  try {
    const supabase = createClient(supabaseUrl, supabaseKey);
    const { error } = await supabase
      .from("writing_visibility_student")
      .upsert(
        {
          user_id,
          period_index,
          item_index,
          visible_from: visibleFromVal,
        },
        { onConflict: "user_id,period_index,item_index" }
      );

    if (error) {
      return NextResponse.json({ error: error.message }, { status: 500 });
    }
    return NextResponse.json({ ok: true });
  } catch (e) {
    console.error(e);
    return NextResponse.json({ error: "Server error" }, { status: 500 });
  }
}
