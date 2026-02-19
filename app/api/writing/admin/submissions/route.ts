import { NextRequest, NextResponse } from "next/server";
import { createClient } from "@supabase/supabase-js";

const supabaseUrl = process.env.NEXT_PUBLIC_SUPABASE_URL!;
const supabaseKey = process.env.SUPABASE_SERVICE_ROLE_KEY!;
const adminSecret = process.env.ADMIN_SECRET!;

function verifyAdmin(request: NextRequest): boolean {
  const auth = request.headers.get("authorization");
  const key = auth?.replace("Bearer ", "");
  return !!adminSecret && key === adminSecret;
}

export async function GET(request: NextRequest) {
  if (!verifyAdmin(request)) {
    return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
  }
  if (!supabaseUrl || !supabaseKey) {
    return NextResponse.json(
      { error: "Supabase not configured" },
      { status: 500 }
    );
  }

  const { searchParams } = new URL(request.url);
  const assignmentId = searchParams.get("assignment_id");

  try {
    const supabase = createClient(supabaseUrl, supabaseKey);
    let query = supabase
      .from("writing_submissions")
      .select(`
        *,
        writing_assignments!assignment_id(title_ko, title_ja)
      `)
      .order("submitted_at", { ascending: false });

    if (assignmentId) {
      query = query.eq("assignment_id", assignmentId);
    }

    const { data, error } = await query;

    if (error) {
      return NextResponse.json({ error: error.message }, { status: 500 });
    }

    const submissions = data || [];
    const userIds = [...new Set(submissions.map((s: { user_id: string }) => s.user_id))];
    const { data: usersData } = await supabase.auth.admin.listUsers();
    const usersMap = new Map(
      (usersData?.users || []).map((u) => [
        u.id,
        { email: u.email, name: u.user_metadata?.name, username: u.user_metadata?.username },
      ])
    );

    const enriched = submissions.map((s: Record<string, unknown>) => ({
      ...s,
      user: usersMap.get(s.user_id as string) || { email: "-", name: "-", username: "-" },
    }));

    return NextResponse.json({ submissions: enriched });
  } catch (e) {
    console.error(e);
    return NextResponse.json({ error: "Server error" }, { status: 500 });
  }
}
