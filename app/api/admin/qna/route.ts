import { NextRequest, NextResponse } from "next/server";
import { createClient } from "@supabase/supabase-js";
import { stripLongDataUrls } from "@/lib/html-utils";

const supabaseUrl = process.env.NEXT_PUBLIC_SUPABASE_URL!;
const supabaseKey = process.env.SUPABASE_SERVICE_ROLE_KEY!;

function checkAuth(req: NextRequest) {
  const auth = req.headers.get("authorization");
  const key = auth?.replace("Bearer ", "");
  const adminSecret = process.env.ADMIN_SECRET;
  if (!adminSecret || key !== adminSecret) {
    return null;
  }
  return true;
}

/** POST: 새 Q&A 글 추가 */
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

  // 새 id: max(id)+1 (수동 추가 글용)
  const { data: maxRow } = await supabase
    .from("qna_posts")
    .select("id")
    .order("id", { ascending: false })
    .limit(1)
    .single();

  const newId = maxRow?.id != null ? (Number(maxRow.id) + 1) : 1;

  // sort_order: max+1 (최신이 위로)
  const { data: maxSort } = await supabase
    .from("qna_posts")
    .select("sort_order")
    .order("sort_order", { ascending: false })
    .limit(1)
    .single();

  const newSortOrder = maxSort?.sort_order != null ? Number(maxSort.sort_order) + 1 : 1;

  const { data, error } = await supabase
    .from("qna_posts")
    .insert({
      id: newId,
      title: title.trim(),
      content: stripLongDataUrls(typeof content === "string" ? content : ""),
      url: typeof url === "string" && url.trim() ? url.trim() : `https://apps.mirinae.jp/qna/${newId}`,
      sort_order: newSortOrder,
    })
    .select("id, title, content, url, sort_order")
    .single();

  if (error) {
    return NextResponse.json({ error: error.message }, { status: 500 });
  }

  return NextResponse.json(data);
}
