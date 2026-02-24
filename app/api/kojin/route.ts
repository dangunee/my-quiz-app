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

    // Extract tab01 content (from tab01 opening to tab02)
    const tab01Match = html.match(/id=["']tab01["'][^>]*>([\s\S]*?)id=["']tab02["']/i)
      || html.match(/<div[^>]*id=["']tab01["'][^>]*>([\s\S]*?)<\/div>\s*<div[^>]*id=["']tab02["']/i);
    const contentMatch = tab01Match
      ? tab01Match[1]
      : html.match(/<main[^>]*>([\s\S]*?)<\/main>/i)?.[1]
      || html.match(/<article[^>]*>([\s\S]*?)<\/article>/i)?.[1]
      || html.match(/<div[^>]*class=["'][^"']*content[^"']*["'][^>]*>([\s\S]*?)<\/div>/i)?.[1]
      || html.match(/<div[^>]*class=["'][^"']*entry-content[^"']*["'][^>]*>([\s\S]*?)<\/div>/i)?.[1];

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
