import { NextRequest, NextResponse } from "next/server";

const BLOG_BASE = "https://mirinae.jp/blog";
const BLOG_CAT = "7"; // Q&A 카테고리

function extractSearchTerm(title: string): string {
  const m = title.match(/^Q\d+\s*(.+)$/);
  return (m ? m[1] : title).trim().slice(0, 80);
}

export async function GET(req: NextRequest) {
  try {
    const title = req.nextUrl.searchParams.get("title") || req.nextUrl.searchParams.get("q") || "";
    if (!title.trim()) {
      return NextResponse.json({ error: "title or q required" }, { status: 400 });
    }

    const searchTerm = extractSearchTerm(title);
    const searchUrl = `${BLOG_BASE}/?s=${encodeURIComponent(searchTerm)}&cat=${BLOG_CAT}`;

    const searchRes = await fetch(searchUrl, {
      headers: { "User-Agent": "Mozilla/5.0 (compatible; QuizApp/1.0)" },
    });
    if (!searchRes.ok) throw new Error("Blog search failed");
    const searchHtml = await searchRes.text();

    const postMatch =
      searchHtml.match(/href=["'](https?:\/\/mirinae\.jp\/blog\/\?p=\d+)[^"']*["']/i) ||
      searchHtml.match(/href=["'](\/blog\/\?p=\d+)[^"']*["']/i);
    const postUrl = postMatch
      ? postMatch[1].startsWith("http")
        ? postMatch[1]
        : `https://mirinae.jp${postMatch[1]}`
      : null;

    if (!postUrl) {
      return NextResponse.json({ error: "No matching post found", html: null }, { status: 404 });
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
    console.error("[kotae-blog]", err);
    return NextResponse.json(
      { error: err instanceof Error ? err.message : "Failed to fetch" },
      { status: 500 }
    );
  }
}
