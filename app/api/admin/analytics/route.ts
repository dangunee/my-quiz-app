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
      .select("referrer_domain, referrer, source_type, source_media, country, region, is_logged_in, quiz_viewed, kotae_viewed, duration_seconds, started_at")
      .gte("started_at", since.toISOString());

    if (error) {
      console.error("[admin/analytics]", error);
      return NextResponse.json({ error: error.message }, { status: 500 });
    }

    const list = rows || [];

    // 접속 출처 (referrer_domain별 집계) + 평균 체류시간
    const refAgg: Record<string, { count: number; domain: string; totalDuration: number; withDuration: number }> = {};
    for (const r of list) {
      const domain = r.referrer_domain || "(直接)";
      if (!refAgg[domain]) refAgg[domain] = { count: 0, domain, totalDuration: 0, withDuration: 0 };
      refAgg[domain].count++;
      if (r.duration_seconds != null) {
        refAgg[domain].totalDuration += r.duration_seconds;
        refAgg[domain].withDuration++;
      }
    }
    const referrers = Object.values(refAgg).map((a) => ({
      domain: a.domain,
      count: a.count,
      avgDuration: a.withDuration > 0 ? Math.round(a.totalDuration / a.withDuration) : 0,
    })).sort((a, b) => b.count - a.count);

    // is_logged_in별 집계 (会員 / 外部)
    const userTypeAgg: Record<string, { count: number; totalDuration: number; withDuration: number }> = {};
    for (const r of list) {
      const key = r.is_logged_in === true ? "member" : "guest";
      if (!userTypeAgg[key]) userTypeAgg[key] = { count: 0, totalDuration: 0, withDuration: 0 };
      userTypeAgg[key].count++;
      if (r.duration_seconds != null) {
        userTypeAgg[key].totalDuration += r.duration_seconds;
        userTypeAgg[key].withDuration++;
      }
    }
    const userTypes = Object.entries(userTypeAgg).map(([type, a]) => ({
      type,
      count: a.count,
      avgDuration: a.withDuration > 0 ? Math.round(a.totalDuration / a.withDuration) : 0,
    })).sort((a, b) => b.count - a.count);

    // source_type별 집계 (検索 / SNS / 直接 / その他) + 평균 체류시간
    const sourceTypeAgg: Record<string, { count: number; totalDuration: number; withDuration: number }> = {};
    for (const r of list) {
      const st = r.source_type || "direct";
      if (!sourceTypeAgg[st]) sourceTypeAgg[st] = { count: 0, totalDuration: 0, withDuration: 0 };
      sourceTypeAgg[st].count++;
      if (r.duration_seconds != null) {
        sourceTypeAgg[st].totalDuration += r.duration_seconds;
        sourceTypeAgg[st].withDuration++;
      }
    }
    const sourceTypes = Object.entries(sourceTypeAgg).map(([type, a]) => ({
      type,
      count: a.count,
      avgDuration: a.withDuration > 0 ? Math.round(a.totalDuration / a.withDuration) : 0,
    })).sort((a, b) => b.count - a.count);

    // source_media별 집계 (SNS 미디어) + 평균 체류시간
    const sourceMediaAgg: Record<string, { count: number; totalDuration: number; withDuration: number }> = {};
    for (const r of list) {
      const sm = r.source_media || null;
      if (sm) {
        if (!sourceMediaAgg[sm]) sourceMediaAgg[sm] = { count: 0, totalDuration: 0, withDuration: 0 };
        sourceMediaAgg[sm].count++;
        if (r.duration_seconds != null) {
          sourceMediaAgg[sm].totalDuration += r.duration_seconds;
          sourceMediaAgg[sm].withDuration++;
        }
      }
    }
    const sourceMedias = Object.entries(sourceMediaAgg).map(([media, a]) => ({
      media,
      count: a.count,
      avgDuration: a.withDuration > 0 ? Math.round(a.totalDuration / a.withDuration) : 0,
    })).sort((a, b) => b.count - a.count);

    // country별 집계 + 평균 체류시간
    const countryAgg: Record<string, { count: number; totalDuration: number; withDuration: number }> = {};
    for (const r of list) {
      const c = r.country || "(不明)";
      if (!countryAgg[c]) countryAgg[c] = { count: 0, totalDuration: 0, withDuration: 0 };
      countryAgg[c].count++;
      if (r.duration_seconds != null) {
        countryAgg[c].totalDuration += r.duration_seconds;
        countryAgg[c].withDuration++;
      }
    }
    const countries = Object.entries(countryAgg).map(([country, a]) => ({
      country,
      count: a.count,
      avgDuration: a.withDuration > 0 ? Math.round(a.totalDuration / a.withDuration) : 0,
    })).sort((a, b) => b.count - a.count);

    // country + region별 집계 (지역 상세) + 평균 체류시간
    const regionAgg: Record<string, { count: number; totalDuration: number; withDuration: number }> = {};
    for (const r of list) {
      const c = r.country || "不明";
      const reg = r.region || "";
      const key = reg ? `${c} / ${reg}` : c;
      if (!regionAgg[key]) regionAgg[key] = { count: 0, totalDuration: 0, withDuration: 0 };
      regionAgg[key].count++;
      if (r.duration_seconds != null) {
        regionAgg[key].totalDuration += r.duration_seconds;
        regionAgg[key].withDuration++;
      }
    }
    const regions = Object.entries(regionAgg).map(([region, a]) => ({
      region,
      count: a.count,
      avgDuration: a.withDuration > 0 ? Math.round(a.totalDuration / a.withDuration) : 0,
    })).sort((a, b) => b.count - a.count);

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
      userTypes,
      sourceTypes,
      sourceMedias,
      countries,
      regions,
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
