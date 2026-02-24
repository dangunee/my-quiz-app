import { NextRequest, NextResponse } from "next/server";

const KOJIN_URL = "https://mirinae.jp/kojin.html?tab=tab01";
const BASE = "https://mirinae.jp";

export async function GET(req: NextRequest) {
  try {
    const res = await fetch(KOJIN_URL, {
      headers: { "User-Agent": "Mozilla/5.0 (compatible; QuizApp/1.0)" },
    });
    if (!res.ok) throw new Error("Kojin page fetch failed");
    const html = await res.text();

    // Extract tab01 content: try multiple patterns
    let contentMatch: string | undefined;
    // Pattern 1: from tab01 to tab02
    const m1 = html.match(/id=["']tab01["'][^>]*>([\s\S]*?)id=["']tab02["']/i);
    if (m1 && m1[1].length > 200) contentMatch = m1[1];
    // Pattern 2: content containing key text (個人レッスン section)
    if (!contentMatch) {
      const idx = html.indexOf("個人レッスンではテキストを使用し");
      if (idx >= 0) {
        const start = html.lastIndexOf("<", idx) || 0;
        const end = html.indexOf("『短期個人レッスン』", idx);
        const end2 = html.indexOf("id=\"tab02\"", idx);
        const cut = end > 0 ? Math.min(end, end2 > 0 ? end2 : 999999) : (end2 > 0 ? end2 : idx + 15000);
        contentMatch = html.slice(start, cut > 0 ? cut : undefined);
      }
    }
    // Pattern 3: main/article/content divs
    if (!contentMatch) {
      contentMatch = html.match(/<main[^>]*>([\s\S]*?)<\/main>/i)?.[1]
        || html.match(/<article[^>]*>([\s\S]*?)<\/article>/i)?.[1]
        || html.match(/<div[^>]*class=["'][^"']*content[^"']*["'][^>]*>([\s\S]*?)<\/div>/i)?.[1];
    }

    let content = contentMatch || html;

    // Rewrite relative URLs to absolute
    content = content.replace(
      /href=["'](?!https?:|\/\/|#|mailto:)([^"']*)["']/gi,
      (_, path) => `href="${path.startsWith("/") ? BASE + path : BASE + "/" + path}"`
    );
    content = content.replace(
      /src=["'](?!https?:|\/\/|data:)([^"']*)["']/gi,
      (_, path) => `src="${path.startsWith("/") ? BASE + path : BASE + "/" + path}"`
    );

    return NextResponse.json({ html: content, url: KOJIN_URL });
  } catch (err) {
    console.error("[kojin]", err);
    return NextResponse.json(
      { error: err instanceof Error ? err.message : "Failed to fetch" },
      { status: 500 }
    );
  }
}
