import { NextRequest, NextResponse } from "next/server";
import { createClient } from "@supabase/supabase-js";
import { extractBodyIfFullDocument } from "@/lib/html-utils";

/** 本文明文はDB(seikatsu_items)から取得。강좌 안내는 sync 시 상단만 저장되어 있음 */
export async function GET(req: NextRequest) {
  const postId = req.nextUrl.searchParams.get("p");
  const titleParam = req.nextUrl.searchParams.get("title") || req.nextUrl.searchParams.get("q") || "";

  if (!postId && !titleParam.trim()) {
    return NextResponse.json({ error: "title or q or p required", html: null }, { status: 400 });
  }

  const supabaseUrl = process.env.NEXT_PUBLIC_SUPABASE_URL;
  const supabaseKey = process.env.SUPABASE_SERVICE_ROLE_KEY;
  if (!supabaseUrl || !supabaseKey) {
    return NextResponse.json({ error: "Database not configured", html: null }, { status: 500 });
  }

  try {
    const supabase = createClient(supabaseUrl, supabaseKey);

    if (postId && /^\d+$/.test(postId)) {
      const wpId = parseInt(postId, 10);
      const { data, error } = await supabase
        .from("seikatsu_items")
        .select("content, url, title")
        .eq("wp_id", wpId)
        .single();

      if (error || !data) {
        return NextResponse.json({ error: "Not found", html: null }, { status: 404 });
      }
      const html = extractBodyIfFullDocument(data.content ?? "");
      const url = data.url ?? `https://mirinae.jp/blog/?p=${wpId}`;
      return NextResponse.json({ html, url });
    }

    const title = titleParam.trim().slice(0, 200);
    const { data, error } = await supabase
      .from("seikatsu_items")
      .select("content, url")
      .eq("title", title)
      .single();

    if (error || !data) {
      return NextResponse.json({ error: "Not found", html: null }, { status: 404 });
    }
    const html = extractBodyIfFullDocument(data.content ?? "");
    const url = data.url ?? "https://mirinae.jp/blog/";
    return NextResponse.json({ html, url });
  } catch (err) {
    console.error("[dailylife-blog]", err);
    return NextResponse.json(
      { error: err instanceof Error ? err.message : "Failed to fetch" },
      { status: 500 }
    );
  }
}
