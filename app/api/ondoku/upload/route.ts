import { NextRequest, NextResponse } from "next/server";
import { createClient } from "@supabase/supabase-js";

const supabaseUrl = process.env.NEXT_PUBLIC_SUPABASE_URL!;
const supabaseKey = process.env.SUPABASE_SERVICE_ROLE_KEY!;

const BUCKET = "ondoku-audio";
const MAX_SIZE = 50 * 1024 * 1024; // 50MB
const ALLOWED_EXT = ["mp3", "wav", "webm", "ogg", "m4a"];

export async function POST(request: NextRequest) {
  if (!supabaseUrl || !supabaseKey) {
    return NextResponse.json({ error: "Supabase not configured" }, { status: 500 });
  }

  const auth = request.headers.get("authorization");
  const token = auth?.replace("Bearer ", "");
  if (!token) {
    return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
  }

  try {
    const supabase = createClient(supabaseUrl, supabaseKey);
    const { data: { user }, error: userError } = await supabase.auth.getUser(token);
    if (userError || !user) {
      return NextResponse.json({ error: "Invalid token" }, { status: 401 });
    }

    const formData = await request.formData();
    const file = formData.get("file") as File | null;
    const periodIndex = formData.get("period_index") as string;
    const itemIndex = formData.get("item_index") as string;

    if (!file || !periodIndex || !itemIndex) {
      return NextResponse.json({ error: "file, period_index, item_index required" }, { status: 400 });
    }

    const pi = parseInt(periodIndex, 10);
    const ii = parseInt(itemIndex, 10);
    if (isNaN(pi) || pi < 0 || pi > 7 || isNaN(ii) || ii < 0 || ii > 9) {
      return NextResponse.json({ error: "Invalid period_index or item_index" }, { status: 400 });
    }

    if (file.size > MAX_SIZE) {
      return NextResponse.json({ error: "ファイルサイズは50MB以下にしてください" }, { status: 400 });
    }

    const ext = file.name.split(".").pop()?.toLowerCase() || "";
    if (!ALLOWED_EXT.includes(ext)) {
      return NextResponse.json({ error: "mp3, wav, webm, ogg, m4a 形式のみ対応しています" }, { status: 400 });
    }
    const safeExt = ext;
    const path = `${user.id}/${pi}-${ii}/${Date.now()}.${safeExt}`;

    const arrayBuffer = await file.arrayBuffer();
    const buffer = Buffer.from(arrayBuffer);

    const { data, error } = await supabase.storage
      .from(BUCKET)
      .upload(path, buffer, {
        contentType: file.type || `audio/${safeExt}`,
        upsert: false,
      });

    if (error) {
      console.error("Storage upload error:", error);
      return NextResponse.json({ error: error.message || "アップロードに失敗しました" }, { status: 500 });
    }

    const { data: urlData } = supabase.storage.from(BUCKET).getPublicUrl(data.path);
    return NextResponse.json({ url: urlData.publicUrl });
  } catch (e) {
    console.error(e);
    return NextResponse.json({ error: "Server error" }, { status: 500 });
  }
}
