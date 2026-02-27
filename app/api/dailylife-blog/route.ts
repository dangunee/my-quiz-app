import { NextRequest, NextResponse } from "next/server";

const BLOG_BASE = "https://mirinae.jp/blog";
const BLOG_CAT = "2"; // 生活韓国語 카테고리

export async function GET(req: NextRequest) {
  try {
    const postId = req.nextUrl.searchParams.get("p");
    const title = req.nextUrl.searchParams.get("title") || req.nextUrl.searchParams.get("q") || "";

    let postUrl: string | null = null;

    if (postId && /^\d+$/.test(postId)) {
      postUrl = `${BLOG_BASE}/?p=${postId}`;
    } else if (title.trim()) {
      const searchTerm = title.trim().slice(0, 80);
      const searchUrl = `${BLOG_BASE}/?s=${encodeURIComponent(searchTerm)}&cat=${BLOG_CAT}`;

      const searchRes = await fetch(searchUrl, {
        headers: { "User-Agent": "Mozilla/5.0 (compatible; QuizApp/1.0)" },
      });
      if (!searchRes.ok) throw new Error("Blog search failed");
      const searchHtml = await searchRes.text();

      const postMatch =
        searchHtml.match(/href=["'](https?:\/\/mirinae\.jp\/blog\/\?p=\d+)[^"']*["']/i) ||
        searchHtml.match(/href=["'](\/blog\/\?p=\d+)[^"']*["']/i);
      postUrl = postMatch
        ? postMatch[1].startsWith("http")
          ? postMatch[1]
          : `https://mirinae.jp${postMatch[1]}`
        : null;
    }

    if (!postUrl) {
      const status = !title.trim() ? 400 : 404;
      const error = !title.trim()
        ? "title or q required"
        : "No matching post found";
      return NextResponse.json({ error, html: null }, { status });
    }

    const postRes = await fetch(postUrl, {
      headers: { "User-Agent": "Mozilla/5.0 (compatible; QuizApp/1.0)" },
    });
    if (!postRes.ok) throw new Error("Blog post fetch failed");
    const postHtml = await postRes.text();

    const contentMatch = postHtml.match(/<article[^>]*>([\s\S]*?)<\/article>/i)
      || postHtml.match(/<div[^>]*class=["'][^"']*post[^"']*["'][^>]*>([\s\S]*?)<\/div>/i)
      || postHtml.match(/<div[^>]*class=["'][^"']*entry-content[^"']*["'][^>]*>([\s\S]*?)<\/div>/i)
      || postHtml.match(/<div[^>]*class=["'][^"']*content[^"']*["'][^>]*>([\s\S]*?)<\/div>/i);

    const content = contentMatch ? contentMatch[1] : postHtml;

    return NextResponse.json({ html: content, url: postUrl });
  } catch (err) {
    console.error("[dailylife-blog]", err);
    return NextResponse.json(
      { error: err instanceof Error ? err.message : "Failed to fetch" },
      { status: 500 }
    );
  }
}
