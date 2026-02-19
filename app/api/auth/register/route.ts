import { NextRequest, NextResponse } from "next/server";
import { createClient } from "@supabase/supabase-js";

const supabaseUrl = process.env.NEXT_PUBLIC_SUPABASE_URL!;
const supabaseAnonKey =
  process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY ||
  process.env.SUPABASE_SERVICE_ROLE_KEY!;
const supabaseServiceKey = process.env.SUPABASE_SERVICE_ROLE_KEY!;

export async function POST(request: NextRequest) {
  if (!supabaseUrl || !supabaseAnonKey) {
    return NextResponse.json(
      { error: "Supabase not configured" },
      { status: 500 }
    );
  }

  const body = await request.json();
  const { id, password, email, name, region } = body;

  if (!id || !password || !email || !name) {
    return NextResponse.json(
      { error: "id, password, email, name 모두 필요합니다" },
      { status: 400 }
    );
  }

  try {
    const supabase = createClient(supabaseUrl, supabaseAnonKey);

    const origin =
      process.env.NEXT_PUBLIC_SITE_URL ||
      request.headers.get("origin") ||
      new URL(request.url).origin;
    const redirectTo = `${origin}/login`;

    const { data, error } = await supabase.auth.signUp({
      email,
      password,
      options: {
        data: { username: id, name },
        emailRedirectTo: redirectTo,
      },
    });

    if (error) {
      return NextResponse.json({ error: error.message }, { status: 400 });
    }

    if (data.user?.id && supabaseServiceKey && typeof region === "string" && region && region !== "選択してください") {
      const adminClient = createClient(supabaseUrl, supabaseServiceKey);
      await adminClient.from("customer_profiles").upsert(
        { user_id: data.user.id, region },
        { onConflict: "user_id" }
      );
    }

    return NextResponse.json({
      success: true,
      user: {
        id: data.user?.id,
        email: data.user?.email,
        name: data.user?.user_metadata?.name,
        username: data.user?.user_metadata?.username,
      },
    });
  } catch (e) {
    console.error(e);
    return NextResponse.json({ error: "Server error" }, { status: 500 });
  }
}
