import { NextRequest } from "next/server";

export function getAdminKey(request: NextRequest): string | null {
  const auth = request.headers.get("authorization");
  const bearerKey = auth?.replace("Bearer ", "");
  if (bearerKey) return bearerKey;
  const cookie = request.headers.get("cookie") || "";
  const match = cookie.match(/admin_auth=([^;]+)/);
  return match ? decodeURIComponent(match[1].trim()) : null;
}

export function verifyAdmin(request: NextRequest): boolean {
  const adminSecret = process.env.ADMIN_SECRET!;
  const key = getAdminKey(request);
  return !!adminSecret && !!key && key === adminSecret;
}
