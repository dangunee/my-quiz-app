import { NextRequest, NextResponse } from "next/server";
import { createClient } from "@supabase/supabase-js";

const supabaseUrl = process.env.NEXT_PUBLIC_SUPABASE_URL!;
const supabaseKey = process.env.SUPABASE_SERVICE_ROLE_KEY!;
const adminSecret = process.env.ADMIN_SECRET!;

function unauthorized() {
  return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
}

export async function PUT(
  request: NextRequest,
  { params }: { params: Promise<{ id: string }> }
) {
  const auth = request.headers.get("authorization");
  const key = auth?.replace("Bearer ", "");
  if (!adminSecret || key !== adminSecret) {
    return unauthorized();
  }

  if (!supabaseUrl || !supabaseKey) {
    return NextResponse.json(
      { error: "Supabase not configured" },
      { status: 500 }
    );
  }

  const { id } = await params;
  const quizId = parseInt(id, 10);
  if (isNaN(quizId) || quizId < 1) {
    return NextResponse.json({ error: "Invalid quiz ID" }, { status: 400 });
  }

  const body = await request.json();
  const { explanation, japanese, options, koreanTemplate } = body;
  if (typeof explanation !== "string") {
    return NextResponse.json({ error: "explanation required" }, { status: 400 });
  }
  if (
    options !== undefined &&
    (!Array.isArray(options) ||
      !options.every(
        (o: unknown) =>
          o != null &&
          typeof o === "object" &&
          "id" in o &&
          "text" in o &&
          typeof (o as { id: unknown }).id === "number" &&
          typeof (o as { text: unknown }).text === "string"
      ))
  ) {
    return NextResponse.json({ error: "options must be array of {id, text}" }, { status: 400 });
  }

  const payload: Record<string, unknown> = {
    quiz_id: quizId,
    explanation,
    updated_at: new Date().toISOString(),
  };
  if (japanese !== undefined) payload.japanese = japanese;
  if (options !== undefined) payload.options = options;
  if (koreanTemplate !== undefined) payload.korean_template = koreanTemplate;

  try {
    const supabase = createClient(supabaseUrl, supabaseKey);
    const { error } = await supabase
      .from("explanation_overrides")
      .upsert(payload, { onConflict: "quiz_id" });

    if (error) {
      console.error("Supabase error:", error);
      return NextResponse.json({ error: error.message }, { status: 500 });
    }

    return NextResponse.json({ success: true });
  } catch (e) {
    console.error(e);
    return NextResponse.json({ error: "Server error" }, { status: 500 });
  }
}
