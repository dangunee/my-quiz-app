import { NextResponse } from "next/server";
import { createClient } from "@supabase/supabase-js";

const supabaseUrl = process.env.NEXT_PUBLIC_SUPABASE_URL!;
const supabaseKey = process.env.SUPABASE_SERVICE_ROLE_KEY!;

export async function GET() {
  if (!supabaseUrl || !supabaseKey) {
    return NextResponse.json([]);
  }

  try {
    const supabase = createClient(supabaseUrl, supabaseKey);
    const { data, error } = await supabase
      .from("seikatsu_items")
      .select("title")
      .order("sort_order", { ascending: false });

    if (error) {
      console.error("[dailykorean-list]", error);
      return NextResponse.json([]);
    }

    const list = (data || []).map((r) => r.title);
    return NextResponse.json(list);
  } catch (err) {
    console.error("[dailykorean-list]", err);
    return NextResponse.json([]);
  }
}
