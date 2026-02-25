import { NextRequest, NextResponse } from "next/server";
import { createClient } from "@supabase/supabase-js";
import { verifyAdmin } from "../../../../lib/admin-auth";

const supabaseUrl = process.env.NEXT_PUBLIC_SUPABASE_URL!;
const supabaseKey = process.env.SUPABASE_SERVICE_ROLE_KEY!;

export async function GET(request: NextRequest) {
  if (!verifyAdmin(request)) {
    return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
  }
  if (!supabaseUrl || !supabaseKey) {
    return NextResponse.json({ error: "Supabase not configured" }, { status: 500 });
  }

  try {
    const supabase = createClient(supabaseUrl, supabaseKey);
    const { data, error } = await supabase
      .from("ondoku_submissions")
      .select("id, user_id, period_index, item_index, content, audio_url, submitted_at, feedback, corrected_content, status, feedback_at, completed_at")
      .order("submitted_at", { ascending: false });

    if (error) {
      console.error("Ondoku submissions error:", error);
      return NextResponse.json({ error: error.message }, { status: 500 });
    }

    const submissions = (data || []).map((s) => ({
      ...s,
      user: null as { email?: string; name?: string; username?: string } | null,
    }));

    for (let i = 0; i < submissions.length; i++) {
      const { data: userData } = await supabase.auth.admin.getUserById(submissions[i].user_id);
      if (userData?.user) {
        submissions[i].user = {
          email: userData.user.email,
          name: userData.user.user_metadata?.name,
          username: userData.user.user_metadata?.username,
        };
      }
    }

    return NextResponse.json({ submissions });
  } catch (e) {
    console.error(e);
    return NextResponse.json({ error: "Server error" }, { status: 500 });
  }
}
