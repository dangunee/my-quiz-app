import { NextRequest, NextResponse } from "next/server";
import { Resend } from "resend";
import { verifyAdmin } from "../../../../lib/admin-auth";

const resendApiKey = process.env.RESEND_API_KEY;
const ONDOKU_EMAIL = "ondoku@kaonnuri.com";

export async function POST(request: NextRequest) {
  if (!verifyAdmin(request)) {
    return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
  }

  const body = await request.json();
  const { audio_url, student_name, period_label, item_label } = body;

  if (typeof audio_url !== "string" || !audio_url) {
    return NextResponse.json({ error: "audio_url required" }, { status: 400 });
  }

  if (!resendApiKey) {
    return NextResponse.json({ error: "RESEND_API_KEY not configured" }, { status: 500 });
  }

  try {
    const resend = new Resend(resendApiKey);
    const subject = `音読提出: ${period_label || ""} ${item_label || ""} - ${student_name || "生徒"}`;
    const text = `音読課題の録音ファイルです。\n\n生徒名: ${student_name || "-"}\n課題: ${period_label || ""} ${item_label || ""}\n\n音声ファイルは添付をご確認ください。`;

    const fromEmail = process.env.RESEND_FROM || "onboarding@resend.dev";
    const { data, error } = await resend.emails.send({
      from: `音読アプリ <${fromEmail}>`,
      to: ONDOKU_EMAIL,
      subject,
      text,
      attachments: [
        {
          filename: `ondoku_${student_name || "student"}_${Date.now()}.mp3`,
          path: audio_url,
        },
      ],
    });

    if (error) {
      console.error("[ondoku/send-email]", error);
      return NextResponse.json({ error: error.message }, { status: 500 });
    }

    return NextResponse.json({ ok: true, id: data?.id });
  } catch (e) {
    console.error("[ondoku/send-email]", e);
    return NextResponse.json({ error: "Server error" }, { status: 500 });
  }
}
