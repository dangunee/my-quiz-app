import { NextRequest, NextResponse } from "next/server";
import { Resend } from "resend";
import { createClient } from "@supabase/supabase-js";
import { verifyAdmin } from "@/lib/admin-auth";
import { jsPDF } from "jspdf";
import autoTable from "jspdf-autotable";

const resendApiKey = process.env.RESEND_API_KEY;
const supabaseUrl = process.env.NEXT_PUBLIC_SUPABASE_URL!;
const supabaseKey = process.env.SUPABASE_SERVICE_ROLE_KEY!;

type OndokuFeedbackForm = {
  bunkei: string;
  wayaku: string;
  point: string;
  segments: { kadai: string; correct: string; learner: string; [key: string]: string }[];
  extraColumns: { key: string; label: string }[];
  kaisetsu: string;
};

function generatePdfBuffer(feedback: OndokuFeedbackForm): Buffer {
  const doc = new jsPDF({ orientation: "landscape", unit: "mm" });
  const headers = ["no.", "課題", "正しい発音", "学習者の発音", ...feedback.extraColumns.map((c) => c.label)];
  const rows = feedback.segments.map((seg, i) => [
    String(i + 1),
    seg.kadai,
    seg.correct,
    seg.learner,
    ...feedback.extraColumns.map((c) => seg[c.key] ?? ""),
  ]);
  autoTable(doc, { head: [headers], body: rows, styles: { fontSize: 8 } });
  const finalY = (doc as unknown as { lastAutoTable: { finalY: number } }).lastAutoTable?.finalY ?? 10;
  doc.text(`文型: ${feedback.bunkei}`, 14, finalY + 6);
  doc.text(`解説: ${feedback.kaisetsu.slice(0, 200)}${feedback.kaisetsu.length > 200 ? "..." : ""}`, 14, finalY + 12);
  return Buffer.from(doc.output("arraybuffer"));
}

export async function POST(request: NextRequest) {
  if (!verifyAdmin(request)) {
    return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
  }

  if (!resendApiKey) {
    return NextResponse.json({ error: "RESEND_API_KEY not configured" }, { status: 500 });
  }

  let body: { feedback: OndokuFeedbackForm; to: string; body?: string; scheduledAt?: string };
  try {
    body = await request.json();
  } catch {
    return NextResponse.json({ error: "Invalid JSON" }, { status: 400 });
  }

  const { feedback, to, body: emailBody, scheduledAt } = body;
  if (!feedback || !to || !to.includes("@")) {
    return NextResponse.json({ error: "feedback と to (メールアドレス) が必要です" }, { status: 400 });
  }

  try {
    const dt = scheduledAt?.trim() ? new Date(scheduledAt.trim()) : null;
    const now = new Date();
    const maxScheduled = new Date(now.getTime() + 30 * 24 * 60 * 60 * 1000);
    const isScheduled = dt && !isNaN(dt.getTime()) && dt > now && dt <= maxScheduled;

    if (dt && !isNaN(dt.getTime()) && dt > now && dt > maxScheduled) {
      return NextResponse.json({ error: "発送予定日は30日以内に設定してください" }, { status: 400 });
    }

    if (isScheduled) {
      if (!supabaseUrl || !supabaseKey) {
        return NextResponse.json({ error: "Supabase not configured" }, { status: 500 });
      }
      const supabase = createClient(supabaseUrl, supabaseKey);
      const { error: insertError } = await supabase.from("scheduled_ondoku_emails").insert({
        to: to.trim(),
        body: (emailBody || "").trim() || null,
        feedback_json: feedback,
        scheduled_at: dt.toISOString(),
        status: "pending",
      });
      if (insertError) {
        console.error("[ondoku/send-pdf-email] insert error:", insertError);
        return NextResponse.json({ error: insertError.message }, { status: 500 });
      }
      return NextResponse.json({ ok: true, scheduled: true });
    }

    const pdfBuffer = generatePdfBuffer(feedback);
    const resend = new Resend(resendApiKey);
    const fromEmail = process.env.RESEND_FROM || "onboarding@resend.dev";
    const { data, error } = await resend.emails.send({
      from: `音読アプリ <${fromEmail}>`,
      to: to.trim(),
      subject: "音読課題 添削結果",
      text: (emailBody || "").trim() || "添削結果をPDFでお送りします。",
      attachments: [{ filename: "ondoku_feedback.pdf", content: pdfBuffer }],
    });

    if (error) {
      console.error("[ondoku/send-pdf-email]", error);
      return NextResponse.json({ error: error.message }, { status: 500 });
    }

    return NextResponse.json({ ok: true, id: data?.id });
  } catch (e) {
    console.error("[ondoku/send-pdf-email]", e);
    return NextResponse.json({ error: e instanceof Error ? e.message : "Server error" }, { status: 500 });
  }
}
