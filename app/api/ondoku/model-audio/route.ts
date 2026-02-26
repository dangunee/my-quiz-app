import { NextResponse } from "next/server";
import { createClient } from "@supabase/supabase-js";

const supabaseUrl = process.env.NEXT_PUBLIC_SUPABASE_URL!;
const supabaseKey = process.env.SUPABASE_SERVICE_ROLE_KEY!;

export async function GET() {
  if (!supabaseUrl || !supabaseKey) {
    return NextResponse.json({ urls: { chujokyu: {}, chuujokyu: {} } });
  }

  try {
    const supabase = createClient(supabaseUrl, supabaseKey);
    const { data, error } = await supabase
      .from("ondoku_model_audio")
      .select("level, period, type, url");

    if (error) {
      console.error("Model audio fetch error:", error);
      return NextResponse.json({ urls: { chujokyu: {}, chuujokyu: {} } });
    }

    const urls: Record<string, Record<number, { fast?: string; slow?: string }>> = {
      chujokyu: { 0: {}, 1: {}, 2: {}, 3: {} },
      chuujokyu: { 0: {}, 1: {}, 2: {}, 3: {} },
    };

    (data || []).forEach((row) => {
      if (row.level && row.period !== undefined && row.type && row.url) {
        if (!urls[row.level][row.period]) urls[row.level][row.period] = {};
        urls[row.level][row.period][row.type as "fast" | "slow"] = row.url;
      }
    });

    return NextResponse.json({ urls });
  } catch (e) {
    console.error(e);
    return NextResponse.json({ urls: { chujokyu: {}, chuujokyu: {} } });
  }
}
