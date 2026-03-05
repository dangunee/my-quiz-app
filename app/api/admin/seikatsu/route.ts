import { NextRequest, NextResponse } from "next/server";
import { createClient } from "@supabase/supabase-js";

const supabaseUrl = process.env.NEXT_PUBLIC_SUPABASE_URL!;
const supabaseKey = process.env.SUPABASE_SERVICE_ROLE_KEY!;

function checkAuth(req: NextRequest) {
  const auth = req.headers.get("authorization");
  const key = auth?.replace("Bearer ", "");
  const adminSecret = process.env.ADMIN_SECRET;
  if (!adminSecret || key !== adminSecret) return null;
  return true;
}

export async function GET(req: NextRequest) {
  if (!checkAuth(req)) {
    return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
  }
  if (!supabaseUrl || !supabaseKey) {
    return NextResponse.json({ error: "Supabase not configured" }, { status: 500 });
  }

  const title = req.nextUrl.searchParams.get("title");
  if (!title || !title.trim()) {
    return NextResponse.json({ error: "title required" }, { status: 400 });
  }

  const supabase = createClient(supabaseUrl, supabaseKey);
  const { data, error } = await supabase
    .from("seikatsu_items")
    .select("id, title, content, url, wp_id, sort_order")
    .eq("title", title.trim())
    .single();

  if (error || !data) {
    return NextResponse.json({ error: "Not found" }, { status: 404 });
  }

  return NextResponse.json(data);
}

export async function PUT(req: NextRequest) {
  if (!checkAuth(req)) {
    return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
  }
  if (!supabaseUrl || !supabaseKey) {
    return NextResponse.json({ error: "Supabase not configured" }, { status: 500 });
  }

  const body = await req.json();
  const { title: lookupTitle, content, url } = body;

  if (!lookupTitle || typeof lookupTitle !== "string") {
    return NextResponse.json({ error: "title required" }, { status: 400 });
  }

  const supabase = createClient(supabaseUrl, supabaseKey);
  const updates: Record<string, unknown> = {};
  if (typeof content === "string") updates.content = content;
  if (typeof url === "string") updates.url = url;

  if (Object.keys(updates).length === 0) {
    return NextResponse.json({ error: "No fields to update" }, { status: 400 });
  }

  const { data, error } = await supabase
    .from("seikatsu_items")
    .update(updates)
    .eq("title", lookupTitle.trim())
    .select()
    .single();

  if (error) {
    return NextResponse.json({ error: error.message }, { status: 500 });
  }

  return NextResponse.json(data);
}

/** POST: 새 생활한국어 글 추가 */
export async function POST(req: NextRequest) {
  if (!checkAuth(req)) {
    return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
  }
  if (!supabaseUrl || !supabaseKey) {
    return NextResponse.json({ error: "Supabase not configured" }, { status: 500 });
  }

  const body = await req.json();
  const { title, content, url } = body;

  if (!title || typeof title !== "string" || !title.trim()) {
    return NextResponse.json({ error: "title required" }, { status: 400 });
  }

  const supabase = createClient(supabaseUrl, supabaseKey);

  // 중복 제목 확인
  const { data: existing } = await supabase
    .from("seikatsu_items")
    .select("id")
    .eq("title", title.trim())
    .single();

  if (existing) {
    return NextResponse.json({ error: "이미 같은 제목의 글이 있습니다" }, { status: 400 });
  }

  // sort_order: max+1 (최신이 위로)
  const { data: maxSort } = await supabase
    .from("seikatsu_items")
    .select("sort_order")
    .order("sort_order", { ascending: false })
    .limit(1)
    .single();

  const newSortOrder = maxSort?.sort_order != null ? Number(maxSort.sort_order) + 1 : 1;

  const { data, error } = await supabase
    .from("seikatsu_items")
    .insert({
      title: title.trim(),
      content: typeof content === "string" ? content : "",
      url: typeof url === "string" && url.trim() ? url.trim() : `https://quiz.mirinae.jp/dailylife?title=${encodeURIComponent(title.trim())}`,
      wp_id: null,
      sort_order: newSortOrder,
    })
    .select("id, title, content, url, sort_order")
    .single();

  if (error) {
    return NextResponse.json({ error: error.message }, { status: 500 });
  }

  return NextResponse.json(data);
}
