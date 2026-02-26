import { NextRequest, NextResponse } from "next/server";
import { createClient } from "@supabase/supabase-js";
import { verifyAdmin } from "@/lib/admin-auth";

const supabaseUrl = process.env.NEXT_PUBLIC_SUPABASE_URL!;
const supabaseKey = process.env.SUPABASE_SERVICE_ROLE_KEY!;
const BUCKET = "ondoku-audio";
const MAX_SIZE = 50 * 1024 * 1024; // 50MB
const ALLOWED_EXT = ["mp3", "wav", "webm", "ogg", "m4a"];

export async function POST(request: NextRequest) {
  if (!verifyAdmin(request)) {
    return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
  }
  if (!supabaseUrl || !supabaseKey) {
    return NextResponse.json({ error: "Supabase not configured" }, { status: 500 });
  }

  try {
    const formData = await request.formData();
    const file = formData.get("file") as File | null;
    const level = formData.get("level") as string;
    const period = formData.get("period") as string;
    const type = formData.get("type") as string;

    if (!file || !level || !period || !type) {
      return NextResponse.json({ error: "file, level, period, type required" }, { status: 400 });
    }
    if (!["chujokyu", "chuujokyu"].includes(level)) {
      return NextResponse.json({ error: "Invalid level" }, { status: 400 });
    }
    const pi = parseInt(period, 10);
    if (isNaN(pi) || pi < 0 || pi > 3) {
      return NextResponse.json({ error: "Invalid period" }, { status: 400 });
    }
    if (!["fast", "slow"].includes(type)) {
      return NextResponse.json({ error: "Invalid type (fast/slow)" }, { status: 400 });
    }

    if (file.size > MAX_SIZE) {
      return NextResponse.json({ error: "ファイルサイズは50MB以下にしてください" }, { status: 400 });
    }

    const ext = file.name.split(".").pop()?.toLowerCase() || "";
    if (!ALLOWED_EXT.includes(ext)) {
      return NextResponse.json({ error: "mp3, wav, webm, ogg, m4a 形式のみ対応しています" }, { status: 400 });
    }

    const supabase = createClient(supabaseUrl, supabaseKey);
    const path = `model-audio/${level}/${pi}/${type}.${ext}`;

    const arrayBuffer = await file.arrayBuffer();
    const buffer = Buffer.from(arrayBuffer);

    const { data: uploadData, error: uploadError } = await supabase.storage
      .from(BUCKET)
      .upload(path, buffer, {
        contentType: file.type || `audio/${ext}`,
        upsert: true,
      });

    if (uploadError) {
      console.error("Storage upload error:", uploadError);
      return NextResponse.json({ error: uploadError.message || "アップロードに失敗しました" }, { status: 500 });
    }

    const { data: urlData } = supabase.storage.from(BUCKET).getPublicUrl(uploadData.path);
    const url = urlData.publicUrl;

    const { error: upsertError } = await supabase
      .from("ondoku_model_audio")
      .upsert(
        { level, period: pi, type, url },
        { onConflict: "level,period,type" }
      );

    if (upsertError) {
      console.error("DB upsert error:", upsertError);
      return NextResponse.json({ error: upsertError.message || "保存に失敗しました" }, { status: 500 });
    }

    return NextResponse.json({ url });
  } catch (e) {
    console.error(e);
    return NextResponse.json({ error: "Server error" }, { status: 500 });
  }
}
