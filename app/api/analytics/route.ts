import { NextRequest, NextResponse } from "next/server";
import { createClient } from "@supabase/supabase-js";

const supabaseUrl = process.env.NEXT_PUBLIC_SUPABASE_URL!;
const supabaseKey = process.env.SUPABASE_SERVICE_ROLE_KEY!;

function getReferrerDomain(referrer: string | null): string | null {
  if (!referrer || !referrer.startsWith("http")) return null;
  try {
    const url = new URL(referrer);
    return url.hostname;
  } catch {
    return null;
  }
}

const SEARCH_DOMAINS = [
  "google.com", "google.co.jp", "google.co.kr", "google.co.uk",
  "bing.com", "yahoo.co.jp", "yahoo.com", "duckduckgo.com",
  "baidu.com", "yandex.ru", "naver.com", "daum.net",
];

const SNS_MEDIA: Record<string, string> = {
  "facebook.com": "facebook",
  "www.facebook.com": "facebook",
  "m.facebook.com": "facebook",
  "twitter.com": "twitter",
  "x.com": "twitter",
  "t.co": "twitter",
  "instagram.com": "instagram",
  "www.instagram.com": "instagram",
  "line.me": "line",
  "line.naver.jp": "line",
  "tiktok.com": "tiktok",
  "www.tiktok.com": "tiktok",
  "linkedin.com": "linkedin",
  "www.linkedin.com": "linkedin",
  "youtube.com": "youtube",
  "www.youtube.com": "youtube",
  "reddit.com": "reddit",
  "www.reddit.com": "reddit",
};

function getSourceTypeAndMedia(domain: string | null): { source_type: string; source_media: string | null } {
  if (!domain) return { source_type: "direct", source_media: null };
  const lower = domain.toLowerCase();
  if (SEARCH_DOMAINS.some((d) => lower.includes(d))) {
    return { source_type: "search", source_media: null };
  }
  for (const [d, media] of Object.entries(SNS_MEDIA)) {
    if (lower.includes(d)) return { source_type: "sns", source_media: media };
  }
  return { source_type: "referral", source_media: null };
}

export async function POST(request: NextRequest) {
  if (!supabaseUrl || !supabaseKey) {
    return NextResponse.json({ ok: true }); // no-op when not configured
  }

  try {
    const body = await request.json();
    const { event, session_id, referrer, app_type, duration_seconds, is_logged_in } = body as {
      event: "session_start" | "tab_view" | "session_end";
      session_id?: string;
      referrer?: string;
      app_type?: "quiz" | "kotae";
      duration_seconds?: number;
      is_logged_in?: boolean;
    };

    const supabase = createClient(supabaseUrl, supabaseKey);
    const ref = referrer ?? request.headers.get("referer") ?? null;
    const domain = getReferrerDomain(ref);
    const { source_type, source_media } = getSourceTypeAndMedia(domain);
    const country = request.headers.get("x-vercel-ip-country") ?? null;
    const region = request.headers.get("x-vercel-ip-country-region") ?? request.headers.get("x-vercel-ip-city") ?? null;

    if (event === "session_start" && session_id && app_type) {
      await supabase.from("app_analytics").insert({
        session_id,
        referrer: ref,
        referrer_domain: domain,
        source_type,
        source_media,
        country,
        region,
        is_logged_in: is_logged_in ?? false,
        app_type,
        quiz_viewed: app_type === "quiz",
        kotae_viewed: app_type === "kotae",
      });
    } else if (event === "tab_view" && session_id && app_type) {
      const { data: row } = await supabase
        .from("app_analytics")
        .select("id")
        .eq("session_id", session_id)
        .order("created_at", { ascending: false })
        .limit(1)
        .single();
      if (row) {
        const update =
          app_type === "quiz"
            ? { quiz_viewed: true }
            : { kotae_viewed: true };
        await supabase.from("app_analytics").update(update).eq("id", row.id);
      }
    } else if (event === "session_end" && session_id && typeof duration_seconds === "number") {
      const { data } = await supabase
        .from("app_analytics")
        .select("id")
        .eq("session_id", session_id)
        .order("created_at", { ascending: false })
        .limit(1)
        .single();
      if (data) {
        await supabase
          .from("app_analytics")
          .update({ duration_seconds })
          .eq("id", data.id);
      }
    }

    return NextResponse.json({ ok: true });
  } catch (e) {
    console.error("[analytics]", e);
    return NextResponse.json({ ok: true }); // fail silently
  }
}
