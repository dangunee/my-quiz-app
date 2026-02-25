import { NextRequest, NextResponse } from "next/server";
import { createClient } from "@supabase/supabase-js";
import { verifyAdmin } from "@/lib/admin-auth";

const supabaseUrl = process.env.NEXT_PUBLIC_SUPABASE_URL!;
const supabaseKey = process.env.SUPABASE_SERVICE_ROLE_KEY!;

export async function GET(request: NextRequest) {
  if (!verifyAdmin(request)) {
    return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
  }
  const { searchParams } = new URL(request.url);
  const userId = searchParams.get("user_id");
  if (!userId) {
    return NextResponse.json({ error: "user_id required" }, { status: 400 });
  }

  if (!supabaseUrl || !supabaseKey) {
    return NextResponse.json({ error: "Supabase not configured" }, { status: 500 });
  }

  try {
    const supabase = createClient(supabaseUrl, supabaseKey);

    const { data: studentVis } = await supabase
      .from("writing_visibility_student")
      .select("period_index, item_index, visible_from")
      .eq("user_id", userId);

    const { data: contentVis } = await supabase
      .from("writing_visibility")
      .select("period_index, item_index, visible_from");

    const studentMap: Record<number, Record<number, string | null>> = {};
    for (const row of studentVis || []) {
      if (!studentMap[row.period_index]) studentMap[row.period_index] = {};
      studentMap[row.period_index][row.item_index] = row.visible_from;
    }

    const contentMap: Record<number, Record<number, string | null>> = {};
    for (const row of contentVis || []) {
      if (!contentMap[row.period_index]) contentMap[row.period_index] = {};
      contentMap[row.period_index][row.item_index] = row.visible_from;
    }

    const now = new Date();
    const status: Record<number, Record<number, { visible: boolean; date: string | null }>> = {};
    for (let p = 0; p < 8; p++) {
      status[p] = {};
      for (let i = 0; i < 10; i++) {
        const visibleFrom = studentMap[p]?.[i] ?? contentMap[p]?.[i];
        const visible = !!visibleFrom && new Date(visibleFrom) <= now;
        status[p][i] = {
          visible,
          date: visibleFrom,
        };
      }
    }

    return NextResponse.json({ status });
  } catch (e) {
    console.error(e);
    return NextResponse.json({ error: "Server error" }, { status: 500 });
  }
}
