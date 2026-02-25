import { NextRequest, NextResponse } from "next/server";
import { Resend } from "resend";
import { verifyAdmin } from "@/lib/admin-auth";

const resendApiKey = process.env.RESEND_API_KEY;

export async function POST(request: NextRequest) {
  if (!verifyAdmin(request)) {
    return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
  }

  if (!resendApiKey) {
    return NextResponse.json({ error: "RESEND_API_KEY not configured" }, { status: 500 });
  }

  const contentType = request.headers.get("content-type") || "";
  let to = "";
  let subject = "";
  let text = "";
  let audioUrl: string | null = null;
  const attachmentFiles: File[] = [];

  if (contentType.includes("multipart/form-data")) {
    const formData = await request.formData();
    to = (formData.get("to") as string) || "";
    subject = (formData.get("subject") as string) || "";
    text = (formData.get("body") as string) || "";
    audioUrl = (formData.get("audio_url") as string) || null;
    const files = formData.getAll("files") as File[];
    for (const f of files) {
      if (f && typeof f === "object" && "size" in f && f.size > 0) attachmentFiles.push(f);
    }
  } else {
    const body = await request.json();
    to = body.to || "";
    subject = body.subject || "";
    text = body.body || "";
    audioUrl = body.audio_url || null;
  }

  if (!to || !to.includes("@")) {
    return NextResponse.json({ error: "받는 사람(To) 이메일을 입력해 주세요" }, { status: 400 });
  }

  const attachments: Array<{ filename: string; content?: Buffer; path?: string }> = [];
  for (const f of attachmentFiles) {
    const buf = Buffer.from(await f.arrayBuffer());
    attachments.push({ filename: f.name || "audio.mp3", content: buf });
  }
  if (attachments.length === 0 && audioUrl) {
    attachments.push({ filename: `ondoku_${Date.now()}.mp3`, path: audioUrl });
  }

  try {
    const resend = new Resend(resendApiKey);
    const fromEmail = process.env.RESEND_FROM || "onboarding@resend.dev";
    const { data, error } = await resend.emails.send({
      from: `音読アプリ <${fromEmail}>`,
      to: to.trim(),
      subject: subject.trim() || "音読課題",
      text: text.trim() || "音読課題の録音ファイルです。",
      attachments: attachments.length > 0 ? attachments : undefined,
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
