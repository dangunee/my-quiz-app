import { NextRequest, NextResponse } from "next/server";

const WRITING_HOST = "writing.mirinae.jp";
const ONDOKU_HOST = "ondoku.mirinae.jp";
const QUIZ_HOST = "quiz.mirinae.jp";
const APPS_HOST = "apps.mirinae.jp";

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

  // writing.mirinae.jp: 전체 → apps.mirinae.jp/writing
  if (isWritingHost) {
    const targetPath = pathname === "/" || pathname === "" ? "/writing" : pathname;
    const target = new URL(targetPath + request.nextUrl.search, `https://${APPS_HOST}`);
    return NextResponse.redirect(target.toString(), 302);
  }

  // ondoku.mirinae.jp: 전체 → apps.mirinae.jp/ondoku
  if (isOndokuHost) {
    const targetPath = pathname === "/" || pathname === "" ? "/ondoku" : pathname;
    const target = new URL(targetPath + request.nextUrl.search, `https://${APPS_HOST}`);
    return NextResponse.redirect(target.toString(), 302);
  }

  // /qna/123 → /qna?id=123 (퀴즈앱 내부 Q&A 탭에서 해당 글 펼침)
  const qnaIdMatch = pathname.match(/^\/qna\/(\d+)$/);
  if (qnaIdMatch) {
    const target = new URL("/qna", request.url);
    target.searchParams.set("id", qnaIdMatch[1]);
    return NextResponse.redirect(target.toString(), 302);
  }

  // apps.mirinae.jp: root → /quiz
  const isAppsHost = host === APPS_HOST || host === `www.${APPS_HOST}`;
  if (isAppsHost) {
    if (pathname === "/" || pathname === "") {
      return NextResponse.redirect(new URL("/quiz", request.url), 302);
    }
    // /quiz?tab=qna → /qna (dailylife는 /dailylife 페이지에서 직접 서빙)
    if (pathname === "/quiz") {
      const tab = request.nextUrl.searchParams.get("tab");
      if (tab === "qna") return NextResponse.redirect(new URL("/qna", request.url), 302);
    }
    // /dailylife: app/dailylife/page.tsx에서 직접 서빙 (ISR, SEO). 리다이렉트 제거하여 루프 방지
  }

  // quiz.mirinae.jp: 전체 → apps.mirinae.jp (기존 링크 호환)
  const isQuizHost = host === QUIZ_HOST || host === `www.${QUIZ_HOST}`;
  if (isQuizHost) {
    const targetPath = pathname === "/" || pathname === "" ? "/quiz" : pathname;
    const target = new URL(targetPath + request.nextUrl.search, `https://${APPS_HOST}`);
    return NextResponse.redirect(target.toString(), 302);
  }

  return NextResponse.next({ request: { headers: requestHeaders } });
}

export const config = {
  matcher: [
    "/((?!_next/static|_next/image|.*\\.(?:svg|png|ico|jpg|jpeg|gif|webp)$).*)",
  ],
};
