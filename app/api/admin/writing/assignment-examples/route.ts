import { NextRequest, NextResponse } from "next/server";
import { createClient } from "@supabase/supabase-js";

const supabaseUrl = process.env.NEXT_PUBLIC_SUPABASE_URL!;
const supabaseKey = process.env.SUPABASE_SERVICE_ROLE_KEY!;
const adminSecret = process.env.ADMIN_SECRET!;

function verifyAdmin(request: NextRequest): boolean {
  const auth = request.headers.get("authorization");
  const key = auth?.replace("Bearer ", "");
  return !!adminSecret && key === adminSecret;
}

export async function GET(request: NextRequest) {
  if (!verifyAdmin(request)) {
    return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
  }
  if (!supabaseUrl || !supabaseKey) {
    return NextResponse.json({ error: "Supabase not configured" }, { status: 500 });
  }

  try {
    const supabase = createClient(supabaseUrl, supabaseKey);
    const { data, error } = await supabase
      .from("assignment_example_overrides")
      .select("period_index, item_index, title, topic")
      .order("period_index")
      .order("item_index");

    if (error) {
      return NextResponse.json({ error: error.message }, { status: 500 });
    }

    const overrides: Record<number, Record<number, { title: string; topic: string }>> = {};
    for (const row of data || []) {
      if (!overrides[row.period_index]) overrides[row.period_index] = {};
      overrides[row.period_index][row.item_index] = {
        title: row.title || "",
        topic: row.topic || "",
      };
    }
    return NextResponse.json({ overrides });
  } catch (e) {
    console.error(e);
    return NextResponse.json({ error: "Server error" }, { status: 500 });
  }
}

export async function PUT(request: NextRequest) {
  if (!verifyAdmin(request)) {
    return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
  }
  if (!supabaseUrl || !supabaseKey) {
    return NextResponse.json({ error: "Supabase not configured" }, { status: 500 });
  }

  const body = await request.json();
  const { period_index, item_index, title, topic } = body;

  if (typeof period_index !== "number" || period_index < 0 || period_index > 7) {
    return NextResponse.json({ error: "period_index 0-7 required" }, { status: 400 });
  }
  if (typeof item_index !== "number" || item_index < 0 || item_index > 9) {
    return NextResponse.json({ error: "item_index 0-9 required" }, { status: 400 });
  }

  try {
    const supabase = createClient(supabaseUrl, supabaseKey);
    const { error } = await supabase
      .from("assignment_example_overrides")
      .upsert(
        {
          period_index,
          item_index,
          title: typeof title === "string" ? title.trim() : "",
          topic: typeof topic === "string" ? topic.trim() : "",
        },
        { onConflict: "period_index,item_index" }
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
