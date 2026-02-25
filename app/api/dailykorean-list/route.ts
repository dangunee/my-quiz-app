import { NextResponse } from "next/server";
import { createClient } from "@supabase/supabase-js";

const WP_API = "https://mirinae.jp/blog/index.php?rest_route=/wp/v2/posts";
const CAT_ID = "2";

function decodeTitle(raw: string): string {
  return raw.replace(/&#(\d+);/g, (_, code: string) =>
    String.fromCharCode(parseInt(code, 10))
  );
}

async function fetchFromWordPress(): Promise<string[]> {
  const all: string[] = [];
  let page = 1;
  let hasMore = true;
  while (hasMore) {
    const res = await fetch(
      `${WP_API}&categories=${CAT_ID}&per_page=100&page=${page}&_fields=title`,
      { headers: { "User-Agent": "Mozilla/5.0 (compatible; QuizApp/1.0)" } }
    );
    if (!res.ok) return [];
    const posts: { title: { rendered: string } }[] = await res.json();
    if (posts.length === 0) break;
    for (const p of posts) {
      const title = decodeTitle(p.title.rendered).trim();
      if (title) all.push(title);
    }
    if (posts.length < 100) hasMore = false;
    else page++;
  }
  return all;
}

export async function GET() {
  const supabaseUrl = process.env.NEXT_PUBLIC_SUPABASE_URL;
  const supabaseKey = process.env.SUPABASE_SERVICE_ROLE_KEY;

  if (supabaseUrl && supabaseKey) {
    try {
      const supabase = createClient(supabaseUrl, supabaseKey);
      const { data, error } = await supabase
        .from("seikatsu_items")
        .select("title")
        .order("sort_order", { ascending: false });

      if (!error && data && data.length > 0) {
        const list = data.map((r) => r.title);
        return NextResponse.json(list);
      }
      if (error) console.error("[dailykorean-list]", error);
    } catch (err) {
      console.error("[dailykorean-list]", err);
    }
  }

  // Fallback: fetch directly from WordPress when DB is empty or unavailable
  try {
    const list = await fetchFromWordPress();
    return NextResponse.json(list);
  } catch (err) {
    console.error("[dailykorean-list] WP fallback", err);
    return NextResponse.json([]);
  }
}
