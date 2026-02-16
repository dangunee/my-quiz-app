import { NextRequest, NextResponse } from "next/server";

const adminSecret = process.env.ADMIN_SECRET!;

export async function POST(request: NextRequest) {
  const auth = request.headers.get("authorization");
  const key = auth?.replace("Bearer ", "");
  if (!adminSecret || key !== adminSecret) {
    return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
  }
  return NextResponse.json({ ok: true });
}
