import { NextRequest, NextResponse } from "next/server";
import { createClient } from "@supabase/supabase-js";
import { Resend } from "resend";
import { jsPDF } from "jspdf";
import autoTable from "jspdf-autotable";

const cronSecret = process.env.CRON_SECRET;
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

export async function GET(request: NextRequest) {
  const authHeader = request.headers.get("authorization");
  if (cronSecret && authHeader !== `Bearer ${cronSecret}`) {
    return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
  }

  if (!resendApiKey || !supabaseUrl || !supabaseKey) {
    return NextResponse.json({ error: "Missing config" }, { status: 500 });
  }

  const supabase = createClient(supabaseUrl, supabaseKey);
  const now = new Date().toISOString();
  const { data: rows, error: fetchError } = await supabase
    .from("scheduled_ondoku_emails")
    .select("id, to, body, feedback_json")
    .eq("status", "pending")
    .lte("scheduled_at", now);

  if (fetchError || !rows?.length) {
    return NextResponse.json({ ok: true, sent: 0 });
  }

  const resend = new Resend(resendApiKey);
  const fromEmail = process.env.RESEND_FROM || "onboarding@resend.dev";
  let sent = 0;

  for (const row of rows) {
    try {
      const feedback = row.feedback_json as OndokuFeedbackForm;
      const pdfBuffer = generatePdfBuffer(feedback);
      const { error } = await resend.emails.send({
        from: `音読アプリ <${fromEmail}>`,
        to: row.to,
        subject: "音読課題 添削結果",
        text: row.body || "添削結果をPDFでお送りします。",
        attachments: [{ filename: "ondoku_feedback.pdf", content: pdfBuffer }],
      });
      if (error) throw new Error(error.message);
      await supabase
        .from("scheduled_ondoku_emails")
        .update({ status: "sent", sent_at: new Date().toISOString() })
        .eq("id", row.id);
      sent++;
    } catch (e) {
      const msg = e instanceof Error ? e.message : "Unknown error";
      await supabase
        .from("scheduled_ondoku_emails")
        .update({ status: "failed", error_message: msg })
        .eq("id", row.id);
      console.error("[cron/send-scheduled-ondoku-emails]", row.id, msg);
    }
  }

  return NextResponse.json({ ok: true, sent });
}
