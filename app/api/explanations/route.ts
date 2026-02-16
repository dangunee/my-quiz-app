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
      .from("explanation_overrides")
      .select("quiz_id, explanation, japanese, options");

    if (error) {
      console.error("Supabase error:", error);
      return NextResponse.json({ overrides: {} });
    }

    const overrides: Record<
      number,
      { explanation?: string; japanese?: string | null; options?: { id: number; text: string }[] | null }
    > = {};
    for (const row of data || []) {
      overrides[row.quiz_id] = {
        explanation: row.explanation,
        japanese: row.japanese ?? undefined,
        options: row.options ?? undefined,
      };
    }
    return NextResponse.json({ overrides });
  } catch (e) {
    console.error(e);
    return NextResponse.json({ overrides: {} });
  }
}
