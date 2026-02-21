import { NextRequest, NextResponse } from "next/server";
import { createClient } from "@supabase/supabase-js";

const supabaseUrl = process.env.NEXT_PUBLIC_SUPABASE_URL!;
const supabaseKey = process.env.SUPABASE_SERVICE_ROLE_KEY!;
const adminSecret = process.env.ADMIN_SECRET!;

function unauthorized() {
  return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
}

export async function GET(request: NextRequest) {
  const auth = request.headers.get("authorization");
  const key = auth?.replace("Bearer ", "");
  if (!adminSecret || key !== adminSecret) {
    return unauthorized();
  }

  if (!supabaseUrl || !supabaseKey) {
    return NextResponse.json(
      { error: "Supabase not configured" },
      { status: 500 }
    );
  }

  try {
    const supabase = createClient(supabaseUrl, supabaseKey);
    const { data, error } = await supabase.auth.admin.listUsers({
      perPage: 100,
    });

    if (error) {
      return NextResponse.json({ error: error.message }, { status: 500 });
    }

    const userIds = (data?.users || []).map((u) => u.id);
    const { data: profiles } = await supabase
      .from("customer_profiles")
      .select("*")
      .in("user_id", userIds);
    const profileMap = new Map(
      (profiles || []).map((p) => [p.user_id, p])
    );

    const users = (data?.users || []).map((u) => {
      const p = profileMap.get(u.id);
      return {
        id: u.id,
        email: u.email,
        name: u.user_metadata?.name,
        username: u.user_metadata?.username,
        createdAt: u.created_at,
        lastSignInAt: u.last_sign_in_at,
        region: p?.region ?? null,
        plan_type: p?.plan_type ?? null,
        course_type: p?.course_type ?? null,
        payment_status: p?.payment_status ?? null,
        period: p?.period ?? null,
        interval: p?.course_interval ?? null,
        start_date: p?.start_date ?? null,
        writing_approved: p?.writing_approved ?? false,
      };
    });

    return NextResponse.json({ users });
  } catch (e) {
    console.error(e);
    return NextResponse.json({ error: "Server error" }, { status: 500 });
  }
}
