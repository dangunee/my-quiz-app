import { NextRequest, NextResponse } from "next/server";
import { createClient } from "@supabase/supabase-js";

const supabaseUrl = process.env.NEXT_PUBLIC_SUPABASE_URL!;
const supabaseKey = process.env.SUPABASE_SERVICE_ROLE_KEY!;
const adminSecret = process.env.ADMIN_SECRET!;

type KadaiOverride = { title: string; topic: string; theme?: string; question?: string; grammarNote?: string; patterns?: { pattern: string; example: string }[] };

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
      .select("period_index, item_index, title, topic, theme, question, grammar_note, patterns")
      .order("period_index")
      .order("item_index");

    if (error) {
      return NextResponse.json({ error: error.message }, { status: 500 });
    }

    const overrides: Record<number, Record<number, KadaiOverride>> = {};
    for (const row of data || []) {
      if (!overrides[row.period_index]) overrides[row.period_index] = {};
      overrides[row.period_index][row.item_index] = {
        title: row.title || "",
        topic: row.topic || "",
        theme: row.theme ?? undefined,
        question: row.question ?? undefined,
        grammarNote: row.grammar_note ?? undefined,
        patterns: Array.isArray(row.patterns) ? row.patterns : undefined,
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
  const { period_index, item_index, title, topic, theme, question, grammar_note, patterns } = body;

  if (typeof period_index !== "number" || period_index < 0 || period_index > 7) {
    return NextResponse.json({ error: "period_index 0-7 required" }, { status: 400 });
  }
  if (typeof item_index !== "number" || item_index < 0 || item_index > 9) {
    return NextResponse.json({ error: "item_index 0-9 required" }, { status: 400 });
  }

  const patternsVal = Array.isArray(patterns)
    ? patterns
        .filter((p: unknown) => p && typeof p === "object" && "pattern" in p && "example" in p)
        .map((p: { pattern?: unknown; example?: unknown }) => ({
          pattern: String(p.pattern ?? ""),
          example: String(p.example ?? ""),
        }))
    : null;

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
          theme: typeof theme === "string" ? theme.trim() || null : null,
          question: typeof question === "string" ? question.trim() || null : null,
          grammar_note: typeof grammar_note === "string" ? grammar_note.trim() || null : null,
          patterns: patternsVal,
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

export async function DELETE(request: NextRequest) {
  if (!verifyAdmin(request)) {
    return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
  }
  if (!supabaseUrl || !supabaseKey) {
    return NextResponse.json({ error: "Supabase not configured" }, { status: 500 });
  }

  const { searchParams } = new URL(request.url);
  const period_index = parseInt(searchParams.get("period_index") ?? "", 10);
  const item_index = parseInt(searchParams.get("item_index") ?? "", 10);

  if (isNaN(period_index) || period_index < 0 || period_index > 7) {
    return NextResponse.json({ error: "period_index 0-7 required" }, { status: 400 });
  }
  if (isNaN(item_index) || item_index < 0 || item_index > 9) {
    return NextResponse.json({ error: "item_index 0-9 required" }, { status: 400 });
  }

  try {
    const supabase = createClient(supabaseUrl, supabaseKey);
    const { error } = await supabase
      .from("assignment_example_overrides")
      .delete()
      .eq("period_index", period_index)
      .eq("item_index", item_index);

    if (error) {
      return NextResponse.json({ error: error.message }, { status: 500 });
    }
    return NextResponse.json({ ok: true });
  } catch (e) {
    console.error(e);
    return NextResponse.json({ error: "Server error" }, { status: 500 });
  }
}
