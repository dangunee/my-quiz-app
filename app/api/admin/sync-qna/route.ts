import { NextRequest, NextResponse } from "next/server";
import { createClient } from "@supabase/supabase-js";

const WP_API = "https://mirinae.jp/blog/index.php?rest_route=/wp/v2/posts";
const CAT_ID = "7"; // 韓国語の微妙なニュアンス(Q&A)

function decodeTitle(raw: string): string {
  return raw.replace(/&#(\d+);/g, (_, code: string) =>
    String.fromCharCode(parseInt(code, 10))
  );
}

type WpPost = {
  id: number;
  title: { rendered: string };
  content: { rendered: string };
  link: string;
};

export async function POST(request: NextRequest) {
  const auth = request.headers.get("authorization");
  const key = auth?.replace("Bearer ", "");
  const adminSecret = process.env.ADMIN_SECRET;
  if (!adminSecret || key !== adminSecret) {
    return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
  }

  const supabaseUrl = process.env.NEXT_PUBLIC_SUPABASE_URL!;
  const supabaseKey = process.env.SUPABASE_SERVICE_ROLE_KEY!;
  if (!supabaseUrl || !supabaseKey) {
    return NextResponse.json({ error: "Supabase not configured" }, { status: 500 });
  }

  try {
    const all: { id: number; title: string; content: string; url: string }[] = [];
    let page = 1;
    let hasMore = true;

    while (hasMore) {
      const res = await fetch(
        `${WP_API}&categories=${CAT_ID}&per_page=100&page=${page}&_fields=id,title,content,link`,
        { headers: { "User-Agent": "Mozilla/5.0 (compatible; QuizApp/1.0)" } }
      );
      if (!res.ok) throw new Error("WP API failed");
      const posts: WpPost[] = await res.json();
      if (posts.length === 0) break;

      for (const p of posts) {
        const title = decodeTitle(p.title.rendered).trim();
        if (!title) continue;
        const content = (p.content?.rendered ?? "").trim();
        all.push({
          id: p.id,
          title,
          content,
          url: p.link ?? `https://mirinae.jp/blog/?p=${p.id}`,
        });
      }
      if (posts.length < 100) hasMore = false;
      else page++;
    }

    // WP returns newest first. sort_order: 1=oldest(Q1), higher=newer
    const supabase = createClient(supabaseUrl, supabaseKey);

    const rows = all.map((item, i) => ({
      id: item.id,
      title: item.title,
      content: item.content || null,
      url: item.url || null,
      sort_order: all.length - i,
    }));

    const { error: upsertError } = await supabase
      .from("qna_posts")
      .upsert(rows, { onConflict: "id" });

    if (upsertError) {
      return NextResponse.json({ error: upsertError.message }, { status: 500 });
    }

    return NextResponse.json({ ok: true, count: rows.length });
  } catch (err) {
    console.error("[admin/sync-qna]", err);
    return NextResponse.json(
      { error: err instanceof Error ? err.message : "Sync failed" },
      { status: 500 }
    );
  }
}
