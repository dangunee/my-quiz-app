import { NextRequest, NextResponse } from "next/server";
import { createClient } from "@supabase/supabase-js";

const supabaseUrl = process.env.NEXT_PUBLIC_SUPABASE_URL!;
const supabaseKey = process.env.SUPABASE_SERVICE_ROLE_KEY!;

export async function GET(request: NextRequest) {
  const auth = request.headers.get("authorization");
  const token = auth?.replace("Bearer ", "");
  if (!token) {
    return NextResponse.json({ error: "認証が必要です" }, { status: 401 });
  }

  if (!supabaseUrl || !supabaseKey) {
    return NextResponse.json(
      { error: "Supabase not configured" },
      { status: 500 }
    );
  }

  try {
    const supabase = createClient(supabaseUrl, supabaseKey);
    const {
      data: { user },
      error: getUserError,
    } = await supabase.auth.getUser(token);

    if (getUserError || !user) {
      return NextResponse.json({ error: "認証に失敗しました" }, { status: 401 });
    }

    const { data: profile } = await supabase
      .from("customer_profiles")
      .select("ondoku_approved, period")
      .eq("user_id", user.id)
      .single();

    if (!profile?.ondoku_approved) {
      return NextResponse.json(
        { error: "MY PAGEへのアクセスは管理者の承認が必要です", approved: false },
        { status: 403 }
      );
    }

    const { data: submissions } = await supabase
      .from("ondoku_submissions")
      .select("*")
      .eq("user_id", user.id)
      .order("period_index", { ascending: true })
      .order("item_index", { ascending: true });

    const userName = user.user_metadata?.name || user.user_metadata?.username || user.email || "";
    const periodNum = profile?.period ?? null;

    return NextResponse.json({
      approved: true,
      name: userName,
      period: periodNum,
      submissions: submissions || [],
    });
  } catch (e) {
    console.error(e);
    return NextResponse.json({ error: "Server error" }, { status: 500 });
  }
}
