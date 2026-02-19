import { NextResponse } from "next/server";

const TRIAL_URL = "https://mirinae.jp/trial.html";
const BASE = "https://mirinae.jp";

function extractTabContent(html: string, startMarker: string, endMarker: string): string {
  const startIdx = html.indexOf(startMarker);
  if (startIdx === -1) return "";
  const endIdx = html.indexOf(endMarker, startIdx);
  if (endIdx === -1) return "";
  return html.slice(startIdx, endIdx);
}

function fixRelativeUrls(html: string): string {
  const base = BASE.endsWith("/") ? BASE.slice(0, -1) : BASE;
  return html
    .replace(/href="(?!https?:\/\/)(\/?[^"]*)"/g, (_, p) => `href="${p.startsWith("/") ? base + p : base + "/" + p}"`)
    .replace(/src="(?!https?:\/\/)(\/?[^"]*)"/g, (_, p) => `src="${p.startsWith("/") ? base + p : base + "/" + p}"`)
    .replace(/action="(?!https?:\/\/)(\/?[^"]*)"/g, (_, p) => `action="${p.startsWith("/") ? base + p : base + "/" + p}"`)
    .replace(/<form /g, "<form target=\"_blank\" ");
}

export async function GET() {
  try {
    const res = await fetch(TRIAL_URL, {
      headers: { "User-Agent": "Mozilla/5.0 (compatible; MirinaeBot/1.0)" },
    });
    if (!res.ok) throw new Error(`Fetch failed: ${res.status}`);
    const html = await res.text();

    const tab1 = extractTabContent(
      html,
      '<div class="conbox con1">',
      '<div class="conbox con2">'
    );
    const tab2 = extractTabContent(
      html,
      '<div class="conbox con2">',
      '<div class="conbox con3">'
    );

    return NextResponse.json({
      tab1: fixRelativeUrls(tab1),
      tab2: fixRelativeUrls(tab2),
    });
  } catch (e) {
    console.error("trial fetch error:", e);
    return NextResponse.json(
      { error: "Failed to fetch trial content" },
      { status: 500 }
    );
  }
}
