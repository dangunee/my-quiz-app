import { NextRequest, NextResponse } from "next/server";
import { createClient } from "@supabase/supabase-js";

const supabaseUrl = process.env.NEXT_PUBLIC_SUPABASE_URL!;
const supabaseKey = process.env.SUPABASE_SERVICE_ROLE_KEY!;

/**
 * 本文から「........」以降（ミリネ韓国語教室ホームページ 以降）を除去する
 */
function stripFooter(content: string): string {
  if (!content || typeof content !== "string") return "";
  // 4つ以上の連続するドット（.）から末尾までを除去
  const dotMatch = content.match(/\.{4,}/);
  if (dotMatch) {
    const cutIndex = content.indexOf(dotMatch[0]);
    if (cutIndex >= 0) return content.slice(0, cutIndex).trim();
  }
  return content.trim();
}

export async function GET(req: NextRequest) {
  const postId = req.nextUrl.searchParams.get("p");
  if (!postId || !/^\d+$/.test(postId)) {
    return NextResponse.json({ error: "p (post id) required", html: null }, { status: 400 });
  }

  if (!supabaseUrl || !supabaseKey) {
    return NextResponse.json({ error: "Database not configured", html: null }, { status: 500 });
  }

  try {
    const supabase = createClient(supabaseUrl, supabaseKey);
    const id = parseInt(postId, 10);
    const { data, error } = await supabase
      .from("qna_posts")
      .select("content, url, title")
      .eq("id", id)
      .single();

    if (error || !data) {
      return NextResponse.json({ error: "Not found", html: null }, { status: 404 });
    }

    const rawContent = data.content ?? "";
    const html = stripFooter(rawContent);
    const url = data.url ?? `https://apps.mirinae.jp/qna/${id}`;

    return NextResponse.json({ html, url, title: data.title ?? "" });
  } catch (err) {
    console.error("[kotae-blog]", err);
    return NextResponse.json(
      { error: err instanceof Error ? err.message : "Failed to fetch" },
      { status: 500 }
    );
  }
}
