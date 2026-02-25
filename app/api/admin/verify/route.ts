import { NextRequest, NextResponse } from "next/server";
import { getAdminKey } from "@/lib/admin-auth";

const adminSecret = process.env.ADMIN_SECRET!;

export async function POST(request: NextRequest) {
  const key = getAdminKey(request);
  if (!adminSecret || key !== adminSecret) {
    return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
  }
  const res = NextResponse.json({ ok: true });
  const host = request.headers.get("host") || "";
  if (host.includes("mirinae.jp")) {
    res.headers.set(
      "Set-Cookie",
      `admin_auth=${encodeURIComponent(key)}; Path=/; Domain=.mirinae.jp; Max-Age=86400; Secure; SameSite=Lax`
    );
  }
  return res;
}
