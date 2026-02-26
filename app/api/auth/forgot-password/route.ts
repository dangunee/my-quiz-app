import { NextRequest, NextResponse } from "next/server";
import { createClient } from "@supabase/supabase-js";

const supabaseUrl = process.env.NEXT_PUBLIC_SUPABASE_URL!;
const supabaseAnonKey =
  process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY ||
  process.env.SUPABASE_SERVICE_ROLE_KEY!;

export async function POST(request: NextRequest) {
  if (!supabaseUrl || !supabaseAnonKey) {
    return NextResponse.json(
      { error: "Supabase not configured" },
      { status: 500 }
    );
  }

  const body = await request.json();
  const { email } = body;

  if (!email || typeof email !== "string" || !email.trim()) {
    return NextResponse.json(
      { error: "メールアドレスを入力してください。" },
      { status: 400 }
    );
  }

  try {
    const supabase = createClient(supabaseUrl, supabaseAnonKey);

    const origin =
      request.headers.get("x-forwarded-proto") && request.headers.get("x-forwarded-host")
        ? `${request.headers.get("x-forwarded-proto")}://${request.headers.get("x-forwarded-host")}`
        : request.headers.get("origin") || process.env.NEXT_PUBLIC_APP_URL || "http://localhost:3000";
    const redirectTo = `${origin}/reset-password`;

    const { error } = await supabase.auth.resetPasswordForEmail(email.trim(), {
      redirectTo,
    });

    if (error) {
      return NextResponse.json(
        { error: error.message === "User not found" ? "このメールアドレスは登録されていません。" : error.message },
        { status: 400 }
      );
    }

    return NextResponse.json({
      success: true,
      message: "パスワード再設定用のメールを送信しました。メール内のリンクから新しいパスワードを設定してください。",
    });
  } catch (e) {
    console.error(e);
    return NextResponse.json({ error: "エラーが発生しました。" }, { status: 500 });
  }
}
