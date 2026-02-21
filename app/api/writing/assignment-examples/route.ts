import { NextResponse } from "next/server";
import { createClient } from "@supabase/supabase-js";

const supabaseUrl = process.env.NEXT_PUBLIC_SUPABASE_URL!;
const supabaseKey = process.env.SUPABASE_SERVICE_ROLE_KEY!;

export async function GET() {
  if (!supabaseUrl || !supabaseKey) {
    return NextResponse.json({ overrides: {} });
  }

  try {
    const supabase = createClient(supabaseUrl, supabaseKey);
    const { data, error } = await supabase
      .from("assignment_example_overrides")
      .select("period_index, item_index, title, topic");

    if (error) {
      console.error("[assignment-examples]", error);
      return NextResponse.json({ overrides: {} });
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
    console.error("[assignment-examples]", e);
    return NextResponse.json({ overrides: {} });
  }
}
