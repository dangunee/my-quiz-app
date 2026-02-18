import { NextRequest, NextResponse } from "next/server";
import { createClient } from "@supabase/supabase-js";

const supabaseUrl = process.env.NEXT_PUBLIC_SUPABASE_URL!;
const supabaseKey = process.env.SUPABASE_SERVICE_ROLE_KEY!;
const adminSecret = process.env.ADMIN_SECRET!;

export async function GET(request: NextRequest) {
  const auth = request.headers.get("authorization");
  const key = auth?.replace("Bearer ", "");
  if (!adminSecret || key !== adminSecret) {
    return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
  }

  if (!supabaseUrl || !supabaseKey) {
    return NextResponse.json({
      referrers: [],
      quizStats: { sessions: 0, avgDuration: 0 },
      kotaeStats: { sessions: 0, avgDuration: 0 },
    });
  }

  try {
    const supabase = createClient(supabaseUrl, supabaseKey);
    const days = parseInt(request.nextUrl.searchParams.get("days") || "30", 10);
    const since = new Date();
    since.setDate(since.getDate() - Math.min(Math.max(days, 1), 365));

    const { data: rows, error } = await supabase
      .from("app_analytics")
      .select("referrer_domain, referrer, quiz_viewed, kotae_viewed, duration_seconds, started_at")
      .gte("started_at", since.toISOString());

    if (error) {
      console.error("[admin/analytics]", error);
      return NextResponse.json({ error: error.message }, { status: 500 });
    }

    const list = rows || [];

    // 접속 출처 (referrer_domain별 집계)
    const refCount: Record<string, { count: number; domain: string }> = {};
    for (const r of list) {
      const domain = r.referrer_domain || "(直接)";
      if (!refCount[domain]) refCount[domain] = { count: 0, domain };
      refCount[domain].count++;
    }
    const referrers = Object.values(refCount).sort((a, b) => b.count - a.count);

    // 퀴즈 앱: quiz_viewed=true인 세션, 평균 체류시간
    const quizSessions = list.filter((r) => r.quiz_viewed);
    const quizWithDuration = quizSessions.filter((r) => r.duration_seconds != null);
    const quizStats = {
      sessions: quizSessions.length,
      avgDuration:
        quizWithDuration.length > 0
          ? Math.round(
              quizWithDuration.reduce((s, r) => s + (r.duration_seconds ?? 0), 0) / quizWithDuration.length
            )
          : 0,
    };

    // Q&A 앱: kotae_viewed=true인 세션, 평균 체류시간
    const kotaeSessions = list.filter((r) => r.kotae_viewed);
    const kotaeWithDuration = kotaeSessions.filter((r) => r.duration_seconds != null);
    const kotaeStats = {
      sessions: kotaeSessions.length,
      avgDuration:
        kotaeWithDuration.length > 0
          ? Math.round(
              kotaeWithDuration.reduce((s, r) => s + (r.duration_seconds ?? 0), 0) / kotaeWithDuration.length
            )
          : 0,
    };

    return NextResponse.json({
      referrers,
      quizStats,
      kotaeStats,
      totalSessions: list.length,
    });
  } catch (e) {
    console.error("[admin/analytics]", e);
    return NextResponse.json(
      { error: e instanceof Error ? e.message : "Failed" },
      { status: 500 }
    );
  }
}
