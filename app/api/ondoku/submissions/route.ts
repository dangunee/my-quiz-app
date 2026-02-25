import { NextRequest, NextResponse } from "next/server";
import { createClient } from "@supabase/supabase-js";

const supabaseUrl = process.env.NEXT_PUBLIC_SUPABASE_URL!;
const supabaseKey = process.env.SUPABASE_SERVICE_ROLE_KEY!;

export async function GET(request: NextRequest) {
  const auth = request.headers.get("authorization");
  const token = auth?.replace("Bearer ", "");
  if (!token) {
    return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
  }

  if (!supabaseUrl || !supabaseKey) {
    return NextResponse.json({ error: "Supabase not configured" }, { status: 500 });
  }

  try {
    const supabase = createClient(supabaseUrl, supabaseKey);
    const { data: { user }, error: userError } = await supabase.auth.getUser(token);
    if (userError || !user) {
      return NextResponse.json({ error: "Invalid token" }, { status: 401 });
    }

    const { data, error } = await supabase
      .from("ondoku_submissions")
      .select("period_index, item_index, content, audio_url, submitted_at")
      .eq("user_id", user.id);

    if (error) {
      return NextResponse.json({ error: error.message }, { status: 500 });
    }

    const submitted = (data || []).map((s) => `${s.period_index}-${s.item_index}`);
    const submissionsByKey = (data || []).reduce<Record<string, { content: string; audio_url?: string; submitted_at: string }>>((acc, s) => {
      acc[`${s.period_index}-${s.item_index}`] = {
        content: s.content || "",
        audio_url: s.audio_url || undefined,
        submitted_at: s.submitted_at || "",
      };
      return acc;
    }, {});
    return NextResponse.json({ submitted, submissionsByKey });
  } catch (e) {
    console.error(e);
    return NextResponse.json({ error: "Server error" }, { status: 500 });
  }
}

export async function POST(request: NextRequest) {
  if (!supabaseUrl || !supabaseKey) {
    return NextResponse.json({ error: "Supabase not configured" }, { status: 500 });
  }

  const auth = request.headers.get("authorization");
  const token = auth?.replace("Bearer ", "");
  if (!token) {
    return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
  }

  const body = await request.json();
  const { period_index, item_index, content, audio_url } = body;

  if (typeof period_index !== "number" || period_index < 0 || period_index > 7) {
    return NextResponse.json({ error: "period_index 0-7 required" }, { status: 400 });
  }
  if (typeof item_index !== "number" || item_index < 0 || item_index > 9) {
    return NextResponse.json({ error: "item_index 0-9 required" }, { status: 400 });
  }
  if (typeof content !== "string") {
    return NextResponse.json({ error: "content required" }, { status: 400 });
  }

  try {
    const supabase = createClient(supabaseUrl, supabaseKey);
    const { data: { user }, error: userError } = await supabase.auth.getUser(token);
    if (userError || !user) {
      return NextResponse.json({ error: "Invalid token" }, { status: 401 });
    }

    const payload: Record<string, unknown> = {
      user_id: user.id,
      period_index,
      item_index,
      content: content.trim() || (audio_url ? "（音声ファイル提出済み）" : "（録音ファイル送付済み）"),
      status: "pending",
      submitted_at: new Date().toISOString(),
    };
    if (typeof audio_url === "string" && audio_url) {
      payload.audio_url = audio_url;
    }

    const { data, error } = await supabase
      .from("ondoku_submissions")
      .upsert(payload, { onConflict: "user_id,period_index,item_index" })
      .select()
      .single();

    if (error) {
      return NextResponse.json({ error: error.message }, { status: 500 });
    }

    return NextResponse.json({ submission: data });
  } catch (e) {
    console.error(e);
    return NextResponse.json({ error: "Server error" }, { status: 500 });
  }
}
