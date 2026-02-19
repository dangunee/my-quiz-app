"use client";

import { useState, useEffect } from "react";
import Link from "next/link";

type User = {
  id: string;
  email: string;
  name?: string;
  username?: string;
};

type Assignment = {
  id: string;
  title_ko: string;
  title_ja?: string;
  description?: string;
  sort_order: number;
};

type Submission = {
  id: string;
  assignment_id: string;
  content: string;
  feedback?: string;
  submitted_at: string;
  writing_assignments?: { title_ko: string; title_ja?: string };
};

const WRITING_HOST = "writing.mirinae.jp";

function useWritingBase() {
  const [base, setBase] = useState({
    adminPath: "/writing/admin",
    redirectPath: "/writing",
    quizLink: "/",
  });
  useEffect(() => {
    if (typeof window !== "undefined") {
      const isWriting = window.location.hostname === WRITING_HOST;
      setBase({
        adminPath: isWriting ? "/admin" : "/writing/admin",
        redirectPath: isWriting ? "/" : "/writing",
        quizLink: isWriting ? "https://quiz.mirinae.jp" : "/",
      });
    }
  }, []);
  return base;
}

const DEFAULT_ASSIGNMENTS: Assignment[] = [
  { id: "", title_ko: "오늘 하루 일과", title_ja: "今日の一日の流れ", description: "오늘 하루 동안 한 일을 3문장 이상으로 써 보세요.", sort_order: 1 },
  { id: "", title_ko: "스트레스 푸는 법", title_ja: "ストレス解消法", description: "스트레스를 느낄 때와 푸는 방법에 대해 써 보세요.", sort_order: 2 },
  { id: "", title_ko: "내가 좋아하는 음식", title_ja: "好きな食べ物", description: "가장 좋아하는 음식과 그 이유를 써 보세요.", sort_order: 3 },
  { id: "", title_ko: "주말 계획", title_ja: "週末の計画", description: "이번 주말에 할 계획을 한국어로 써 보세요.", sort_order: 4 },
  { id: "", title_ko: "가족 소개", title_ja: "家族紹介", description: "가족 구성원을 소개하는 글을 써 보세요.", sort_order: 5 },
  { id: "", title_ko: "한국 여행", title_ja: "韓国旅行", description: "한국에서 가고 싶은 곳과 그 이유를 써 보세요.", sort_order: 6 },
  { id: "", title_ko: "나의 취미", title_ja: "私の趣味", description: "취미 생활에 대해 5문장 이상으로 써 보세요.", sort_order: 7 },
  { id: "", title_ko: "기억에 남는 날", title_ja: "思い出に残る日", description: "특별히 기억에 남는 하루를 써 보세요.", sort_order: 8 },
  { id: "", title_ko: "한국어 공부 방법", title_ja: "韓国語の勉強法", description: "한국어를 어떻게 공부하고 있는지 써 보세요.", sort_order: 9 },
  { id: "", title_ko: "내 꿈", title_ja: "私の夢", description: "미래의 꿈이나 목표에 대해 써 보세요.", sort_order: 10 },
];

export default function WritingPage() {
  const { adminPath, redirectPath, quizLink } = useWritingBase();
  const [user, setUser] = useState<User | null>(null);
  const [assignments, setAssignments] = useState<Assignment[]>([]);
  const [submissions, setSubmissions] = useState<Submission[]>([]);
  const [loading, setLoading] = useState(true);
  const [selectedAssignment, setSelectedAssignment] = useState<Assignment | null>(null);
  const [content, setContent] = useState("");
  const [submitting, setSubmitting] = useState(false);
  const [message, setMessage] = useState("");
  const [menuOpen, setMenuOpen] = useState(false);
  const [sidebarCollapsed, setSidebarCollapsed] = useState(true);

  useEffect(() => {
    const stored = typeof window !== "undefined" ? localStorage.getItem("quiz_user") : null;
    if (stored) {
      try {
        setUser(JSON.parse(stored));
      } catch {
        setUser(null);
      }
    } else {
      setUser(null);
    }
    setLoading(false);
  }, []);

  useEffect(() => {
    fetch("/api/writing/assignments")
      .then((r) => r.json())
      .then((data) => {
        const list = data.assignments || [];
        setAssignments(list.length > 0 ? list : DEFAULT_ASSIGNMENTS);
      })
      .catch(() => setAssignments(DEFAULT_ASSIGNMENTS));
  }, []);

  useEffect(() => {
    if (!user) return;
    const token = localStorage.getItem("quiz_token");
    if (!token) return;
    fetch("/api/writing/submissions", {
      headers: { Authorization: `Bearer ${token}` },
    })
      .then((r) => r.json())
      .then((data) => setSubmissions(data.submissions || []))
      .catch(() => setSubmissions([]));
  }, [user]);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!selectedAssignment || !content.trim() || !user) return;
    setSubmitting(true);
    setMessage("");
    const token = localStorage.getItem("quiz_token");
    if (!token) {
      setMessage("로그인이 필요합니다.");
      setSubmitting(false);
      return;
    }
    try {
      const res = await fetch("/api/writing/submissions", {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
          Authorization: `Bearer ${token}`,
        },
        body: JSON.stringify({
          assignment_id: selectedAssignment.id,
          content: content.trim(),
        }),
      });
      const data = await res.json();
      if (res.ok) {
        setMessage("제출되었습니다!");
        setContent("");
        setSelectedAssignment(null);
        setSubmissions((prev) => [data.submission, ...prev]);
      } else {
        setMessage(data.error || "제출에 실패했습니다.");
      }
    } catch {
      setMessage("오류가 발생했습니다.");
    } finally {
      setSubmitting(false);
    }
  };

  const getSubmissionForAssignment = (a: Assignment) =>
    submissions.find((s) => s.assignment_id === a.id || (s as { writing_assignments?: { title_ko: string } })?.writing_assignments?.title_ko === a.title_ko);

  if (loading) {
    return (
      <div className="min-h-screen flex items-center justify-center bg-[#e8f6fc] p-4">
        <p className="text-gray-500">로딩 중...</p>
      </div>
    );
  }

  const sidebarNav = (
    <nav className="flex flex-col gap-0">
      {user ? (
        <>
          <Link
            href="/profile"
            target="_blank"
            rel="noopener noreferrer"
            className="block py-3 text-gray-800 hover:text-[#cd3737] border-b border-gray-200"
            onClick={() => { setMenuOpen(false); setSidebarCollapsed(true); }}
          >
            마이페이지
          </Link>
          <span className="block py-2 text-sm text-gray-500 border-b border-gray-200">
            {user.name || user.username || user.email}
          </span>
          <button
            type="button"
            onClick={() => {
              localStorage.removeItem("quiz_token");
              localStorage.removeItem("quiz_user");
              setMenuOpen(false);
              setSidebarCollapsed(true);
              window.location.href = redirectPath;
            }}
            className="block w-full text-left py-3 text-gray-800 hover:text-[#cd3737] border-b border-gray-200"
          >
            로그아웃
          </button>
        </>
      ) : (
        <Link
          href={`/login?redirect=${encodeURIComponent(redirectPath)}`}
          className="block py-3 text-gray-800 hover:text-[#cd3737] border-b border-gray-200"
          onClick={() => { setMenuOpen(false); setSidebarCollapsed(true); }}
        >
          로그인
        </Link>
      )}
      <Link
        href={adminPath}
        className="block py-3 text-gray-800 hover:text-[#cd3737] border-b border-gray-200"
        onClick={() => { setMenuOpen(false); setSidebarCollapsed(true); }}
      >
        관리자
      </Link>
      <Link
        href={quizLink}
        {...(quizLink.startsWith("http") ? { target: "_blank", rel: "noopener noreferrer" } : {})}
        className="block py-3 text-gray-800 hover:text-[#cd3737] border-b border-gray-200 last:border-b-0"
        onClick={() => { setMenuOpen(false); setSidebarCollapsed(true); }}
      >
        퀴즈 앱
      </Link>
    </nav>
  );

  return (
    <div className="min-h-screen bg-[#e8f6fc] text-[#2c2c2c] flex">
      {/* 모바일 메뉴 */}
      {menuOpen && (
        <>
          <div
            className="fixed inset-0 z-40 bg-black/30 md:hidden"
            onClick={() => setMenuOpen(false)}
            aria-hidden
          />
          <aside
            className="fixed left-0 top-0 z-50 h-full w-64 max-w-[85vw] bg-white shadow-xl md:hidden"
            style={{ animation: "slideIn 0.2s ease" }}
          >
            <div className="flex items-center justify-between border-b px-4 py-3">
              <span className="font-semibold text-gray-800">메뉴</span>
              <button
                type="button"
                onClick={() => setMenuOpen(false)}
                className="rounded p-2 text-gray-500 hover:bg-gray-100"
                aria-label="메뉴 닫기"
              >
                <svg className="h-5 w-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M6 18L18 6M6 6l12 12" />
                </svg>
              </button>
            </div>
            <div className="p-4">{sidebarNav}</div>
          </aside>
        </>
      )}

      {/* 데스크톱 사이드바 */}
      {!sidebarCollapsed && (
        <aside className="hidden md:flex md:flex-col md:w-56 md:shrink-0 md:bg-white md:rounded-2xl md:shadow-lg md:border md:border-gray-200 md:overflow-hidden md:m-4 md:self-start">
          <div className="px-4 py-4 border-b border-gray-200">
            <span className="font-semibold text-gray-800">메뉴</span>
          </div>
          <div className="flex-1 overflow-y-auto p-4">{sidebarNav}</div>
        </aside>
      )}

      <div className="flex-1 min-w-0 flex flex-col">
        <header className="bg-[#2d5a4a] text-white shadow-sm">
          <div className="max-w-4xl mx-auto px-4 py-4 flex items-center gap-3">
            <button
              type="button"
              onClick={() => setSidebarCollapsed((c) => !c)}
              className="hidden md:flex shrink-0 h-10 w-10 items-center justify-center rounded-lg bg-white/20 text-white hover:bg-white/30"
              aria-label={sidebarCollapsed ? "메뉴 열기" : "메뉴 닫기"}
            >
              <svg className="h-5 w-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M4 6h16M4 12h16M4 18h16" />
              </svg>
            </button>
            <button
              type="button"
              onClick={() => setMenuOpen(true)}
              className="md:hidden shrink-0 h-10 w-10 flex items-center justify-center rounded-lg bg-white/20 text-white hover:bg-white/30"
              aria-label="메뉴 열기"
            >
              <svg className="h-5 w-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M4 6h16M4 12h16M4 18h16" />
              </svg>
            </button>
            <h1 className="text-xl font-bold flex-1">ミリネ韓国語教室・作文トレーニング</h1>
          </div>
        </header>

      <main className="flex-1 max-w-4xl w-full mx-auto px-4 py-8">
        {!user ? (
          <div className="bg-white rounded-xl shadow-lg p-8 text-center">
            <p className="text-gray-600 mb-4">과제를 제출하려면 로그인이 필요합니다.</p>
            <Link
              href={`/login?redirect=${encodeURIComponent(redirectPath)}`}
              className="inline-block px-6 py-3 bg-[#cd3737] text-white rounded-lg hover:bg-[#a52d2d]"
            >
              로그인
            </Link>
          </div>
        ) : (
          <>
            {assignments.length > 0 && !assignments[0]?.id && (
              <div className="mb-4 p-4 bg-amber-50 border border-amber-200 rounded-lg text-sm text-amber-800">
                과제를 제출하려면 관리자가 먼저 과제를 등록해야 합니다.{" "}
                <Link href={adminPath} className="underline font-medium">
                  관리자 페이지
                </Link>
                에서 기본 과제를 추가할 수 있습니다.
              </div>
            )}
            <section className="mb-8">
              <h2 className="text-lg font-bold mb-4">과제 예시 게시판</h2>
              <div className="grid gap-3">
                {assignments.map((a) => {
                  const sub = getSubmissionForAssignment(a);
                  return (
                    <div
                      key={a.id || a.title_ko}
                      className="bg-white rounded-lg shadow p-4 border border-[#c5e3f0]"
                    >
                      <div className="flex justify-between items-start">
                        <div>
                          <h3 className="font-medium text-[#2c2c2c]">
                            ▶{a.title_ko}
                          </h3>
                          {a.title_ja && (
                            <p className="text-sm text-gray-500 mt-1">{a.title_ja}</p>
                          )}
                          {a.description && (
                            <p className="text-sm text-gray-600 mt-2">{a.description}</p>
                          )}
                        </div>
                        <button
                          type="button"
                          onClick={() => {
                            setSelectedAssignment(a);
                            setContent("");
                          }}
                          disabled={!a.id}
                          className="px-4 py-2 bg-[#cd3737] text-white rounded-lg hover:bg-[#a52d2d] disabled:opacity-50 disabled:cursor-not-allowed text-sm"
                        >
                          과제 제출
                        </button>
                      </div>
                      {sub && (
                        <p className="mt-2 text-sm text-green-600">
                          제출됨: {new Date(sub.submitted_at).toLocaleDateString("ko-KR")}
                        </p>
                      )}
                    </div>
                  );
                })}
              </div>
            </section>

            {selectedAssignment && (
              <section className="bg-white rounded-xl shadow-lg p-6 border border-[#c5e3f0]">
                <h2 className="text-lg font-bold mb-4">
                  과제 제출: {selectedAssignment.title_ko}
                </h2>
                <form onSubmit={handleSubmit} className="space-y-4">
                  <textarea
                    value={content}
                    onChange={(e) => setContent(e.target.value)}
                    placeholder="한국어로 작성해 주세요..."
                    rows={10}
                    className="w-full border-2 border-[#c5e3f0] rounded-lg px-4 py-3 focus:border-[#cd3737] focus:outline-none"
                    required
                  />
                  {message && (
                    <p className="text-sm text-[#cd3737]">{message}</p>
                  )}
                  <div className="flex gap-3">
                    <button
                      type="submit"
                      disabled={submitting}
                      className="px-6 py-2 bg-[#cd3737] text-white rounded-lg hover:bg-[#a52d2d] disabled:opacity-50"
                    >
                      {submitting ? "제출 중..." : "제출"}
                    </button>
                    <button
                      type="button"
                      onClick={() => {
                        setSelectedAssignment(null);
                        setContent("");
                        setMessage("");
                      }}
                      className="px-6 py-2 bg-gray-300 rounded-lg hover:bg-gray-400"
                    >
                      취소
                    </button>
                  </div>
                </form>
              </section>
            )}

            {submissions.length > 0 && (
              <section className="mt-8">
                <h2 className="text-lg font-bold mb-4">내 제출 목록</h2>
                <div className="space-y-3">
                  {submissions.map((s) => (
                    <div
                      key={s.id}
                      className="bg-white rounded-lg shadow p-4 border border-[#c5e3f0]"
                    >
                      <p className="font-medium text-gray-500 text-sm">
                        {(s as { writing_assignments?: { title_ko: string } })?.writing_assignments?.title_ko || "과제"}
                      </p>
                      <p className="mt-2 whitespace-pre-wrap">{s.content}</p>
                      {s.feedback && (
                        <div className="mt-3 p-3 bg-amber-50 rounded border border-amber-200">
                          <p className="text-sm font-medium text-amber-800">첨삭:</p>
                          <p className="text-sm text-amber-900 whitespace-pre-wrap mt-1">
                            {s.feedback}
                          </p>
                        </div>
                      )}
                      <p className="mt-2 text-xs text-gray-400">
                        {new Date(s.submitted_at).toLocaleString("ko-KR")}
                      </p>
                    </div>
                  ))}
                </div>
              </section>
            )}
          </>
        )}

        <div className="mt-8 text-center">
          <Link
            href={quizLink}
            {...(quizLink.startsWith("http") ? { target: "_blank", rel: "noopener noreferrer" } : {})}
            className="text-sm text-gray-500 hover:underline"
          >
            퀴즈 앱으로 돌아가기
          </Link>
        </div>
      </main>
      </div>
    </div>
  );
}
