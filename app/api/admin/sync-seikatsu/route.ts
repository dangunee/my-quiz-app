import { NextRequest, NextResponse } from "next/server";
import { createClient } from "@supabase/supabase-js";

const WP_API = "https://mirinae.jp/blog/index.php?rest_route=/wp/v2/posts";
const CAT_ID = "2";

function extractSeikatsuTitle(raw: string): string | null {
  const decoded = raw.replace(/&#(\d+);/g, (_, code: string) =>
    String.fromCharCode(parseInt(code, 10))
  );
  if (decoded.startsWith("生活韓国語")) return decoded;
  return null;
}

function getSeikatsuNumber(title: string): number {
  const m = title.match(/生活韓国語\s*(\d+)/);
  return m ? parseInt(m[1], 10) : 0;
}

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
    const all: string[] = [];
    let page = 1;
    let hasMore = true;

    while (hasMore) {
      const res = await fetch(
        `${WP_API}&categories=${CAT_ID}&per_page=100&page=${page}&_fields=title`,
        { headers: { "User-Agent": "Mozilla/5.0 (compatible; QuizApp/1.0)" } }
      );
      if (!res.ok) throw new Error("WP API failed");
      const posts: { title: { rendered: string } }[] = await res.json();
      if (posts.length === 0) break;

      for (const p of posts) {
        const title = extractSeikatsuTitle(p.title.rendered);
        if (title) all.push(title);
      }
      if (posts.length < 100) hasMore = false;
      else page++;
    }

    all.sort((a, b) => getSeikatsuNumber(b) - getSeikatsuNumber(a));

    const supabase = createClient(supabaseUrl, supabaseKey);

    const { data: existing } = await supabase.from("seikatsu_items").select("id");
    if (existing && existing.length > 0) {
      const ids = existing.map((r) => r.id);
      for (let i = 0; i < ids.length; i += 100) {
        const chunk = ids.slice(i, i + 100);
        await supabase.from("seikatsu_items").delete().in("id", chunk);
      }
    }
    const rows = all.map((title, i) => ({
      title,
      sort_order: all.length - i,
    }));

    const { error: insertError } = await supabase.from("seikatsu_items").insert(rows);
    if (insertError) {
      return NextResponse.json({ error: insertError.message }, { status: 500 });
    }

    return NextResponse.json({ ok: true, count: rows.length });
  } catch (err) {
    console.error("[admin/sync-seikatsu]", err);
    return NextResponse.json(
      { error: err instanceof Error ? err.message : "Sync failed" },
      { status: 500 }
    );
  }
}
