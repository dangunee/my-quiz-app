import { NextRequest, NextResponse } from "next/server";
import { createClient } from "@supabase/supabase-js";
import { verifyAdmin } from "@/lib/admin-auth";

const supabaseUrl = process.env.NEXT_PUBLIC_SUPABASE_URL!;
const supabaseKey = process.env.SUPABASE_SERVICE_ROLE_KEY!;

export async function GET(request: NextRequest) {
  if (!verifyAdmin(request)) {
    return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
  }
  const { searchParams } = new URL(request.url);
  const periodIndex = parseInt(searchParams.get("period_index") ?? "0", 10);
  if (periodIndex < 0 || periodIndex > 7) {
    return NextResponse.json({ error: "period_index 0-7 required" }, { status: 400 });
  }

  if (!supabaseUrl || !supabaseKey) {
    return NextResponse.json({ error: "Supabase not configured" }, { status: 500 });
  }

  try {
    const supabase = createClient(supabaseUrl, supabaseKey);

    const { data: profiles } = await supabase
      .from("customer_profiles")
      .select("user_id")
      .eq("writing_approved", true);

    const userIds = (profiles || []).map((p) => p.user_id).filter(Boolean);
    if (userIds.length === 0) {
      return NextResponse.json({ students: [], visibility: {} });
    }

    const { data: usersData } = await supabase.auth.admin.listUsers({ perPage: 1000 });
    const usersMap = new Map((usersData?.users || []).map((u) => [u.id, u]));
    const students = userIds
      .map((id) => {
        const u = usersMap.get(id);
        if (!u) return null;
        return {
          id: u.id,
          email: u.email || "",
          name: u.user_metadata?.name || u.user_metadata?.username || "-",
        };
      })
      .filter(Boolean) as { id: string; email: string; name: string }[];

    const { data: visData } = await supabase
      .from("writing_visibility_student")
      .select("user_id, item_index, visible_from")
      .eq("period_index", periodIndex);

    const visibility: Record<string, Record<number, string | null>> = {};
    for (const row of visData || []) {
      if (!visibility[row.user_id]) visibility[row.user_id] = {};
      visibility[row.user_id][row.item_index] = row.visible_from;
    }

    return NextResponse.json({ students, visibility });
  } catch (e) {
    console.error(e);
    return NextResponse.json({ error: "Server error" }, { status: 500 });
  }
}
