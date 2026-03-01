import { NextResponse } from "next/server";
import { createClient } from "@supabase/supabase-js";

/** 生活韓国語 리스트는 블로그가 아닌 DB(seikatsu_items)에서만 조회합니다。 */
export async function GET() {
  const supabaseUrl = process.env.NEXT_PUBLIC_SUPABASE_URL;
  const supabaseKey = process.env.SUPABASE_SERVICE_ROLE_KEY;

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
      console.error("[dailylife-list]", error);
      return NextResponse.json([]);
    }

    const list = data?.map((r) => r.title) ?? [];
    return NextResponse.json(list);
  } catch (err) {
    console.error("[dailylife-list]", err);
    return NextResponse.json([]);
  }
}
