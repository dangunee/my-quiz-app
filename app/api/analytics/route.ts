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

export async function POST(request: NextRequest) {
  if (!supabaseUrl || !supabaseKey) {
    return NextResponse.json({ ok: true }); // no-op when not configured
  }

  try {
    const body = await request.json();
    const { event, session_id, referrer, app_type, duration_seconds } = body as {
      event: "session_start" | "tab_view" | "session_end";
      session_id?: string;
      referrer?: string;
      app_type?: "quiz" | "kotae";
      duration_seconds?: number;
    };

    const supabase = createClient(supabaseUrl, supabaseKey);
    const ref = referrer ?? request.headers.get("referer") ?? null;
    const domain = getReferrerDomain(ref);

    if (event === "session_start" && session_id && app_type) {
      await supabase.from("app_analytics").insert({
        session_id,
        referrer: ref,
        referrer_domain: domain,
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
