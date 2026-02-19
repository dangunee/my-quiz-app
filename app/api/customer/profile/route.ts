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
      .select("region, plan_type")
      .eq("user_id", user.id)
      .single();

    return NextResponse.json({
      region: profile?.region ?? null,
      plan_type: profile?.plan_type ?? null,
    });
  } catch (e) {
    console.error(e);
    return NextResponse.json({ error: "Server error" }, { status: 500 });
  }
}
