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

/** POST: Q&A·生活韓国語 전체 URL 칸 데이터 삭제 (빈 문자열로 설정) */
export async function POST(req: NextRequest) {
  if (!checkAuth(req)) {
    return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
  }
  if (!supabaseUrl || !supabaseKey) {
    return NextResponse.json({ error: "Supabase not configured" }, { status: 500 });
  }

  const supabase = createClient(supabaseUrl, supabaseKey);

  try {
    // qna_posts: id >= 0 인 모든 행 (실제로 모든 Q&A)
    const { error: qnaError } = await supabase
      .from("qna_posts")
      .update({ url: "" })
      .gte("id", 0);

    if (qnaError) {
      return NextResponse.json({ error: `qna_posts: ${qnaError.message}` }, { status: 500 });
    }

    // seikatsu_items: id가 있는 모든 행 (uuid이므로 모두 해당)
    const { error: seikatsuError } = await supabase
      .from("seikatsu_items")
      .update({ url: "" })
      .not("id", "is", null);

    if (seikatsuError) {
      return NextResponse.json({ error: `seikatsu_items: ${seikatsuError.message}` }, { status: 500 });
    }

    return NextResponse.json({ ok: true, message: "Q&A·生活韓国語 URL 모두 삭제 완료" });
  } catch (err) {
    console.error("[clear-urls]", err);
    return NextResponse.json(
      { error: err instanceof Error ? err.message : "Failed to clear URLs" },
      { status: 500 }
    );
  }
}
