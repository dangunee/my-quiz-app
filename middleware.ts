import { NextRequest, NextResponse } from "next/server";

const WRITING_HOST = "writing.mirinae.jp";
const QUIZ_HOST = "quiz.mirinae.jp";

export function middleware(request: NextRequest) {
  const rawHost =
    request.headers.get("x-forwarded-host") ||
    request.headers.get("host") ||
    "";
  const host = rawHost.split(",")[0].trim().replace(/:\d+$/, "").toLowerCase();
  const urlHost = (request.nextUrl.hostname || "").toLowerCase();
  const pathname = request.nextUrl.pathname;
  const isWritingHost =
    host === WRITING_HOST ||
    host === `www.${WRITING_HOST}` ||
    urlHost === WRITING_HOST ||
    urlHost === `www.${WRITING_HOST}`;

  // writing.mirinae.jp: root → /writing (rewrite), /writing/admin → /admin (통합 관리자)
  if (isWritingHost) {
    if (pathname === "/" || pathname === "") {
      return NextResponse.rewrite(new URL("/writing", request.url));
    }
    if (pathname === "/writing/admin") {
      return NextResponse.redirect(new URL("/admin", request.url), 302);
    }
    return NextResponse.next();
  }

  // quiz.mirinae.jp: /writing, /writing/* → redirect to writing.mirinae.jp
  const isQuizHost = host === QUIZ_HOST || host === `www.${QUIZ_HOST}`;
  if (isQuizHost && pathname.startsWith("/writing")) {
    const rest = pathname === "/writing" || pathname === "/writing/" ? "" : pathname.slice(8); // "/writing".length = 8
    const target = `https://${WRITING_HOST}${rest ? `/${rest}` : "/"}`;
    return NextResponse.redirect(target, 302);
  }

  return NextResponse.next();
}

export const config = {
  matcher: [
    "/",
    "/admin",
    "/writing",
    "/writing/:path*",
  ],
};
