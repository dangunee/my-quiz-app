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
  const { id, password, email, name, region, registration_source } = body;

  if (!id || !password || !email || !name) {
    return NextResponse.json(
      { error: "id, password, email, name 모두 필요합니다" },
      { status: 400 }
    );
  }

  try {
    const supabase = createClient(supabaseUrl, supabaseAnonKey);

    if (supabaseServiceKey) {
      const adminClient = createClient(supabaseUrl, supabaseServiceKey);
      const { data: listData } = await adminClient.auth.admin.listUsers({ perPage: 1000 });
      const users = listData?.users || [];
      const idLower = String(id).trim().toLowerCase();
      const emailLower = String(email).trim().toLowerCase();
      const usernameExists = users.some(
        (u) => String(u.user_metadata?.username ?? "").trim().toLowerCase() === idLower
      );
      const emailExists = users.some(
        (u) => String(u.email ?? "").trim().toLowerCase() === emailLower
      );
      if (usernameExists) {
        return NextResponse.json(
          { error: "このユーザーIDは既に使用されています。" },
          { status: 400 }
        );
      }
      if (emailExists) {
        return NextResponse.json(
          { error: "このメールアドレスは既に登録されています。" },
          { status: 400 }
        );
      }
    }

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
      const msg = error.message || "";
      if (/already registered|already exists|duplicate/i.test(msg)) {
        return NextResponse.json(
          { error: "このメールアドレスは既に登録されています。" },
          { status: 400 }
        );
      }
      return NextResponse.json({ error: error.message }, { status: 400 });
    }

    if (data.user?.id && supabaseServiceKey) {
      const adminClient = createClient(supabaseUrl, supabaseServiceKey);
      const profile: { user_id: string; region?: string; registration_source?: string } = { user_id: data.user.id };
      if (typeof region === "string" && region && region !== "選択してください") profile.region = region;
      if (registration_source === "QUIZ" || registration_source === "WRITING") profile.registration_source = registration_source;
      await adminClient.from("customer_profiles").upsert(profile, { onConflict: "user_id" });
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
