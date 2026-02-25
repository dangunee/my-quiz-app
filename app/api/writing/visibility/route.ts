import { NextResponse } from "next/server";
import { createClient } from "@supabase/supabase-js";

const supabaseUrl = process.env.NEXT_PUBLIC_SUPABASE_URL!;
const supabaseKey = process.env.SUPABASE_SERVICE_ROLE_KEY!;

export async function GET() {
  if (!supabaseUrl || !supabaseKey) {
    return NextResponse.json({ visibility: {} });
  }

  try {
    const supabase = createClient(supabaseUrl, supabaseKey);
    const { data, error } = await supabase
      .from("writing_visibility")
      .select("period_index, item_index, visible_from");

    if (error) {
      console.error("[writing/visibility]", error);
      return NextResponse.json({ visibility: {} });
    }

    const visibility: Record<number, Record<number, string | null>> = {};
    for (const row of data || []) {
      if (!visibility[row.period_index]) visibility[row.period_index] = {};
      visibility[row.period_index][row.item_index] = row.visible_from;
    }
    return NextResponse.json({ visibility });
  } catch (e) {
    console.error("[writing/visibility]", e);
    return NextResponse.json({ visibility: {} });
  }
}
