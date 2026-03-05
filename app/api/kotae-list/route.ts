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
      .from("qna_posts")
      .select("id, title, url")
      .order("sort_order", { ascending: true })
      .order("id", { ascending: true });

    if (error) {
      console.error("[kotae-list]", error);
      return NextResponse.json([]);
    }

    const list = (data || []).map((row) => ({
      id: row.id,
      title: row.title ?? "",
      url: row.url ?? (typeof row.id === "number" ? `https://apps.mirinae.jp/qna/${row.id}` : ""),
    }));

    return NextResponse.json(list);
  } catch (err) {
    console.error("[kotae-list]", err);
    return NextResponse.json([]);
  }
}
