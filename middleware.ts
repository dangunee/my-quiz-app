import { NextRequest, NextResponse } from "next/server";

const WRITING_HOST = "writing.mirinae.jp";
const ONDOKU_HOST = "ondoku.mirinae.jp";
const QUIZ_HOST = "quiz.mirinae.jp";

export function middleware(request: NextRequest) {
  const rawHost =
    request.headers.get("x-forwarded-host") ||
    request.headers.get("host") ||
    "";
  const host = rawHost.split(",")[0].trim().replace(/:\d+$/, "").toLowerCase();
  const urlHost = (request.nextUrl.hostname || "").toLowerCase();
  const pathname = request.nextUrl.pathname;

  const requestHeaders = new Headers(request.headers);
  requestHeaders.set("x-pathname", pathname);

  const isWritingHost =
    host === WRITING_HOST ||
    host === `www.${WRITING_HOST}` ||
    urlHost === WRITING_HOST ||
    urlHost === `www.${WRITING_HOST}`;
  const isOndokuHost =
    host === ONDOKU_HOST ||
    host === `www.${ONDOKU_HOST}` ||
    urlHost === ONDOKU_HOST ||
    urlHost === `www.${ONDOKU_HOST}`;

  // writing.mirinae.jp: root → /writing (rewrite), /writing/admin → /admin (통합 관리자)
  if (isWritingHost) {
    if (pathname === "/" || pathname === "") {
      return NextResponse.rewrite(new URL("/writing", request.url));
    }
    if (pathname === "/writing/admin") {
      return NextResponse.redirect(new URL("/admin", request.url), 302);
    }
    return NextResponse.next({ request: { headers: requestHeaders } });
  }

  // ondoku.mirinae.jp: root → /ondoku (rewrite)
  if (isOndokuHost) {
    if (pathname === "/" || pathname === "") {
      return NextResponse.rewrite(new URL("/ondoku", request.url));
    }
    return NextResponse.next({ request: { headers: requestHeaders } });
  }

  // quiz.mirinae.jp: /writing, /writing/* → redirect to writing.mirinae.jp
  const isQuizHost = host === QUIZ_HOST || host === `www.${QUIZ_HOST}`;
  if (isQuizHost && pathname.startsWith("/writing")) {
    const rest = pathname === "/writing" || pathname === "/writing/" ? "" : pathname.slice(8); // "/writing".length = 8
    const target = `https://${WRITING_HOST}${rest ? `/${rest}` : "/"}`;
    return NextResponse.redirect(target, 302);
  }

  // quiz.mirinae.jp: /ondoku, /ondoku/* → redirect to ondoku.mirinae.jp
  if (isQuizHost && pathname.startsWith("/ondoku")) {
    const rest = pathname === "/ondoku" || pathname === "/ondoku/" ? "" : pathname.slice(7); // "/ondoku".length = 7
    const target = `https://${ONDOKU_HOST}${rest ? `/${rest}` : "/"}`;
    return NextResponse.redirect(target, 302);
  }

  return NextResponse.next({ request: { headers: requestHeaders } });
}

export const config = {
  matcher: [
    "/((?!_next/static|_next/image|.*\\.(?:svg|png|ico|jpg|jpeg|gif|webp)$).*)",
  ],
};
