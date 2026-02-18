import { NextResponse } from "next/server";

const WP_API = "https://mirinae.jp/blog/index.php?rest_route=/wp/v2/posts";
const CAT_ID = "7"; // 韓国語の微妙なニュアンス Q&A

function getQNumber(title: string): number {
  const m = title.match(/質問(\d+)/);
  return m ? parseInt(m[1], 10) : 0;
}

export async function GET() {
  try {
    const all: { id: number; title: string; url: string }[] = [];
    let page = 1;
    let hasMore = true;

    while (hasMore) {
      const res = await fetch(
        `${WP_API}&categories=${CAT_ID}&per_page=100&page=${page}&_fields=id,title`,
        { headers: { "User-Agent": "Mozilla/5.0 (compatible; QuizApp/1.0)" } }
      );
      if (!res.ok) throw new Error("WP API failed");
      const posts: { id: number; title: { rendered: string } }[] = await res.json();
      if (posts.length === 0) break;

      for (const p of posts) {
        const raw = p.title.rendered;
        const title = raw.replace(/&#(\d+);/g, (_, code) =>
          String.fromCharCode(parseInt(code, 10))
        );
        all.push({
          id: p.id,
          title,
          url: `https://mirinae.jp/blog/?p=${p.id}`,
        });
      }
      if (posts.length < 100) hasMore = false;
      else page++;
    }

    all.sort((a, b) => getQNumber(a.title) - getQNumber(b.title));
    return NextResponse.json(all);
  } catch (err) {
    console.error("[kotae-list]", err);
    return NextResponse.json(
      { error: err instanceof Error ? err.message : "Failed to fetch" },
      { status: 500 }
    );
  }
}
