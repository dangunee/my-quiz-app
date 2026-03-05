"use client";

import React, { useState, useEffect, useRef } from "react";
import Link from "next/link";
import { useRouter, usePathname, useSearchParams } from "next/navigation";
import { createPortal } from "react-dom";
import { QUIZZES } from "./quiz-data";
import { LoginModal } from "../components/LoginModal";
import { LogoutConfirmModal } from "../components/LogoutConfirmModal";
import { MIRINAE_JP } from "../lib/config";
import { wrapHtmlForIframe } from "../lib/html-utils";

/** Matches 2+ underscores so admin can use any underline length; first group is the blank. (dotall via [\s\S]) */
const BLANK_REGEX = /([\s\S]*?)(_{2,})([\s\S]*)/;

interface KotaeItem {
  id: number;
  title: string;
  url: string;
}
const FREE_QUIZ_LIMIT = 999; // 결제 모듈 보류 - 무제한

function shuffle<T>(arr: T[]): T[] {
  const a = [...arr];
  for (let i = a.length - 1; i > 0; i--) {
    const j = Math.floor(Math.random() * (i + 1));
    [a[i], a[j]] = [a[j], a[i]];
  }
  return a;
}

function formatJapanese(s: string) {
  const stripped = (s || "").replace(/[「」]/g, "").trim();
  if (!stripped) return stripped;
  const lastChar = stripped.slice(-1);
  if (/[。.?？!！]/.test(lastChar)) return stripped;
  return stripped + "。";
}

function getOptionNumber(id: number) {
  return ["❶", "❷", "❸", "❹"][id - 1] || "❶";
}

const QUIZ_BASE = "/quiz";

interface QuizClientProps {
  initialShowLanding?: boolean;
  initialTab?: "quiz" | "qna" | "dailylife";
}

export default function QuizClient({ initialShowLanding = true, initialTab }: QuizClientProps) {
  const router = useRouter();
  const pathname = usePathname();
  const searchParams = useSearchParams();
  const [quizzes, setQuizzes] = useState(QUIZZES);
  const [currentIndex, setCurrentIndex] = useState(0);
  const [selectedAnswer, setSelectedAnswer] = useState<number | null>(null);
  const [showResult, setShowResult] = useState(false);
  const [correctCount, setCorrectCount] = useState(0);
  const [overrides, setOverrides] = useState<
    Record<number, { explanation?: string; japanese?: string; options?: { id: number; text: string }[]; koreanTemplate?: string }>
  >({});
  const [isLoggedIn, setIsLoggedIn] = useState(false);
  const [menuOpen, setMenuOpen] = useState(false);
  const [rightMenuOpen, setRightMenuOpen] = useState(false);
  const [desktopMenuCollapsed, setDesktopMenuCollapsed] = useState(true);
  const [blankWidth, setBlankWidth] = useState<number | null>(null);
  const [hasPaid, setHasPaid] = useState(false);
  const [showPaywall, setShowPaywall] = useState(false);
  const [checkoutLoading, setCheckoutLoading] = useState(false);
  const [activeTab, setActiveTab] = useState<"quiz" | "qna" | "dailylife">(initialTab ?? "quiz");
  const [showLanding, setShowLanding] = useState(initialShowLanding);
  const [landingNavDropdownOpen, setLandingNavDropdownOpen] = useState(false);
  const [quizSearch, setQuizSearch] = useState("");
  const landingNavDropdownRef = useRef<HTMLDivElement>(null);
  const [kotaeSearch, setKotaeSearch] = useState("");
  const [kotaePage, setKotaePage] = useState(0);
  const [kotaeList, setKotaeList] = useState<KotaeItem[]>([]);
  const [kotaeListLoading, setKotaeListLoading] = useState(true);
  const [seikatsuList, setSeikatsuList] = useState<string[]>([]);
  const [seikatsuPage, setSeikatsuPage] = useState(0);
  const [seikatsuSearch, setSeikatsuSearch] = useState("");
  const [expandedSeikatsuTitle, setExpandedSeikatsuTitle] = useState<string | null>(null);
  const [seikatsuContent, setSeikatsuContent] = useState<{ html: string; url: string } | null>(null);
  const [seikatsuLoading, setSeikatsuLoading] = useState(false);
  const [seikatsuError, setSeikatsuError] = useState<string | null>(null);
  const [seikatsuUrlCopied, setSeikatsuUrlCopied] = useState(false);
  const [expandedKotaeId, setExpandedKotaeId] = useState<number | null>(null);
  const [kotaeContent, setKotaeContent] = useState<{ html: string; url: string } | null>(null);
  const [kotaeLoading, setKotaeLoading] = useState(false);
  const [kotaeError, setKotaeError] = useState<string | null>(null);
  const [kotaeUrlCopied, setKotaeUrlCopied] = useState(false);
  const [showLoginModal, setShowLoginModal] = useState(false);
  const [showLogoutModal, setShowLogoutModal] = useState(false);
  const [isAdmin, setIsAdmin] = useState(false);
  const [adminAuthKey, setAdminAuthKey] = useState<string | null>(null);
  const japaneseRef = useRef<HTMLDivElement>(null);
  const blankMeasureRef = useRef<HTMLSpanElement>(null);

  useEffect(() => {
    const checkAdmin = (authKey: string | null) => {
      const opts: RequestInit = authKey
        ? { method: "POST", headers: { Authorization: `Bearer ${authKey}` } }
        : { method: "POST", credentials: "include" };
      fetch("/api/admin/verify", opts)
        .then((r) => {
          if (r.ok) {
            setIsAdmin(true);
            if (authKey) setAdminAuthKey(authKey);
          }
        })
        .catch(() => {});
    };
    const stored = typeof window !== "undefined" ? localStorage.getItem("admin_auth") : null;
    if (stored) {
      checkAdmin(stored);
    } else {
      checkAdmin(null);
    }
  }, []);

  const handleAdminLogout = () => {
    localStorage.removeItem("admin_auth");
    if (typeof document !== "undefined" && document.location.hostname.includes("mirinae.jp")) {
      document.cookie = "admin_auth=; Path=/; Domain=.mirinae.jp; Max-Age=0";
    }
    setMenuOpen(false);
    setRightMenuOpen(false);
    window.location.reload();
  };

  const handleLogout = () => {
    localStorage.removeItem("quiz_token");
    localStorage.removeItem("quiz_refresh_token");
    localStorage.removeItem("quiz_user");
    setIsLoggedIn(false);
    setMenuOpen(false);
    setRightMenuOpen(false);
  };
  const analyticsSessionRef = useRef<{ id: string; start: number } | null>(null);

  useEffect(() => {
    const storageKey = "quiz_analytics_session";
    let sessionId = typeof sessionStorage !== "undefined" ? sessionStorage.getItem(storageKey) : null;
    if (!sessionId) {
      sessionId = crypto.randomUUID?.() ?? `s-${Date.now()}-${Math.random().toString(36).slice(2)}`;
      sessionStorage?.setItem(storageKey, sessionId);
    }
    const start = Date.now();
    analyticsSessionRef.current = { id: sessionId, start };
    const isLoggedIn = typeof localStorage !== "undefined" && !!localStorage.getItem("quiz_token");
    fetch("/api/analytics", {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({
        event: "session_start",
        session_id: sessionId,
        referrer: typeof document !== "undefined" ? document.referrer || undefined : undefined,
        app_type: activeTab === "qna" ? "kotae" : activeTab,
        is_logged_in: isLoggedIn,
      }),
    }).catch(() => {});
  }, []);

  useEffect(() => {
    const s = analyticsSessionRef.current;
    if (!s) return;
    fetch("/api/analytics", {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ event: "tab_view", session_id: s.id, app_type: activeTab === "qna" ? "kotae" : activeTab }),
    }).catch(() => {});
  }, [activeTab]);

  useEffect(() => {
    const sendEnd = () => {
      const s = analyticsSessionRef.current;
      if (!s) return;
      const duration = Math.round((Date.now() - s.start) / 1000);
      const body = JSON.stringify({
        event: "session_end",
        session_id: s.id,
        duration_seconds: duration,
      });
      navigator.sendBeacon?.("/api/analytics", new Blob([body], { type: "application/json" }));
      analyticsSessionRef.current = null;
    };
    const onHide = () => sendEnd();
    if (typeof document !== "undefined") {
      document.addEventListener("visibilitychange", () => {
        if (document.visibilityState === "hidden") onHide();
      });
      window.addEventListener("pagehide", onHide);
      return () => {
        window.removeEventListener("pagehide", onHide);
      };
    }
  }, []);

  useEffect(() => {
    fetch("/api/kotae-list")
      .then((r) => r.json())
      .then((data) => {
        if (Array.isArray(data)) setKotaeList(data);
      })
      .catch(() => setKotaeList([]))
      .finally(() => setKotaeListLoading(false));
  }, []);

  useEffect(() => {
    fetch("/api/dailylife-list")
      .then((r) => r.json())
      .then((data) => {
        if (Array.isArray(data)) setSeikatsuList(data);
      })
      .catch(() => setSeikatsuList([]));
  }, []);

  const filteredKotae = kotaeSearch.trim()
    ? kotaeList.filter((item) =>
        item.title.toLowerCase().includes(kotaeSearch.trim().toLowerCase())
      )
    : kotaeList;

  const KOTAE_PAGE_SIZE = 20;
  const kotaeTotalPages = Math.ceil(filteredKotae.length / KOTAE_PAGE_SIZE) || 1;
  const kotaePaginated = filteredKotae.slice(
    kotaePage * KOTAE_PAGE_SIZE,
    (kotaePage + 1) * KOTAE_PAGE_SIZE
  );

  const kotaeIdFromUrl = searchParams.get("id");
  // 단일 글 보기: URL에 ?id= 있으면 해당 글만 표시 (목록 숨김) - 리스트 로드 전에도 즉시 표시
  const kotaeSingleViewId = kotaeIdFromUrl && /^\d+$/.test(kotaeIdFromUrl) ? parseInt(kotaeIdFromUrl, 10) : null;
  const kotaeSingleViewIdx = kotaeSingleViewId != null ? filteredKotae.findIndex((i) => i.id === kotaeSingleViewId) : -1;
  const kotaePrevItem = kotaeSingleViewIdx > 0 ? filteredKotae[kotaeSingleViewIdx - 1] : null;
  const kotaeNextItem = kotaeSingleViewIdx >= 0 && kotaeSingleViewIdx < filteredKotae.length - 1 ? filteredKotae[kotaeSingleViewIdx + 1] : null;

  const filteredSeikatsu = seikatsuSearch.trim()
    ? seikatsuList.filter((t) =>
        t.toLowerCase().includes(seikatsuSearch.trim().toLowerCase())
      )
    : seikatsuList;

  const SEIKATSU_PAGE_SIZE = 10;
  const seikatsuTotalPages = Math.ceil(filteredSeikatsu.length / SEIKATSU_PAGE_SIZE) || 1;
  const seikatsuPaginated = filteredSeikatsu.slice(
    seikatsuPage * SEIKATSU_PAGE_SIZE,
    (seikatsuPage + 1) * SEIKATSU_PAGE_SIZE
  );

  const closeRightMenu = () => {
    setRightMenuOpen(false);
  };

  const handleStartFromLanding = (tab: "quiz" | "qna" | "dailylife") => {
    if (pathname === "/main.html") {
      router.push(tab === "quiz" ? QUIZ_BASE : tab === "qna" ? "/qna" : `${QUIZ_BASE}?tab=dailylife`);
    } else {
      setShowLanding(false);
      setActiveTab(tab);
    }
  };

  useEffect(() => {
    const tab = searchParams.get("tab");
    if (tab === "quiz" || tab === "qna" || tab === "dailylife") {
      setActiveTab(tab);
      setShowLanding(false);
    } else if (tab === "kotae") {
      setActiveTab("qna");
      setShowLanding(false);
      router.replace("/qna", { scroll: false });
    }
  }, [searchParams]);

  // /quiz?tab=dailylife&title=xxx: 특정 글 자동 펼침
  useEffect(() => {
    if (activeTab !== "dailylife") return;
    const title = searchParams.get("title") || searchParams.get("q");
    if (title && seikatsuList.includes(title)) {
      setExpandedSeikatsuTitle(title);
      const idx = seikatsuList.indexOf(title);
      const SEIKATSU_PAGE = 10;
      setSeikatsuPage(Math.floor(idx / SEIKATSU_PAGE));
    }
  }, [activeTab, searchParams, seikatsuList]);

  const quizIdFromUrl = searchParams.get("quiz");
  useEffect(() => {
    if (activeTab !== "quiz" || !quizIdFromUrl) return;
    const id = parseInt(quizIdFromUrl, 10);
    if (isNaN(id)) return;
    const idx = quizzes.findIndex((q) => q.id === id);
    if (idx >= 0) setCurrentIndex(idx);
  }, [activeTab, quizIdFromUrl, quizzes]);

  useEffect(() => {
    setKotaePage(0);
  }, [kotaeSearch]);

  useEffect(() => {
    setSeikatsuPage(0);
  }, [seikatsuSearch]);

  useEffect(() => {
    const close = (e: MouseEvent) => {
      if (landingNavDropdownRef.current && !landingNavDropdownRef.current.contains(e.target as Node)) {
        setLandingNavDropdownOpen(false);
      }
    };
    if (landingNavDropdownOpen) {
      document.addEventListener("click", close);
      return () => document.removeEventListener("click", close);
    }
  }, [landingNavDropdownOpen]);

  // /qna?id=xxx: 해당 글만 표시, expandedKotaeId 즉시 설정 (리스트 로드 대기 없이)
  useEffect(() => {
    if (activeTab !== "qna" || !kotaeIdFromUrl) return;
    const id = parseInt(kotaeIdFromUrl, 10);
    if (isNaN(id)) return;
    setExpandedKotaeId(id);
    if (!kotaeListLoading) {
      const idx = kotaeList.findIndex((i) => i.id === id);
      if (idx >= 0) setKotaePage(Math.floor(idx / KOTAE_PAGE_SIZE));
    }
  }, [activeTab, kotaeIdFromUrl, kotaeList, kotaeListLoading]);

  useEffect(() => {
    const idParam = searchParams.get("id");
    if (idParam && /^\d+$/.test(idParam)) return; // URL에 id가 있으면 펼침 유지 (공유 링크용)
    setExpandedKotaeId(null);
    setKotaeContent(null);
    setKotaeError(null);
  }, [kotaePage, kotaeSearch, searchParams, kotaeList]);

  useEffect(() => {
    setExpandedSeikatsuTitle(null);
    setSeikatsuContent(null);
    setSeikatsuError(null);
  }, [seikatsuPage, seikatsuSearch]);

  useEffect(() => {
    if (!expandedSeikatsuTitle) {
      setSeikatsuContent(null);
      setSeikatsuError(null);
      return;
    }
    setSeikatsuLoading(true);
    setSeikatsuError(null);
    fetch(`/api/dailylife-blog?title=${encodeURIComponent(expandedSeikatsuTitle)}`)
      .then((r) => r.json())
      .then((data) => {
        if (data.error && !data.html) {
          setSeikatsuError(data.error);
          setSeikatsuContent(null);
        } else {
          setSeikatsuContent({ html: data.html || "", url: data.url || "" });
          setSeikatsuError(null);
        }
      })
      .catch((err) => {
        setSeikatsuError(err.message || "読み込みに失敗しました");
        setSeikatsuContent(null);
      })
      .finally(() => setSeikatsuLoading(false));
  }, [expandedSeikatsuTitle]);

  useEffect(() => {
    if (!expandedKotaeId) {
      setKotaeContent(null);
      setKotaeError(null);
      return;
    }
    const item = kotaeList.find((i) => i.id === expandedKotaeId);
    if (!item) return;

    setKotaeLoading(true);
    setKotaeError(null);
    fetch(`/api/kotae-blog?p=${item.id}`)
      .then((r) => r.json())
      .then((data) => {
        if (data.error && !data.html) {
          setKotaeError(data.error);
          setKotaeContent(null);
        } else {
          setKotaeContent({ html: data.html || "", url: data.url || "" });
          setKotaeError(null);
        }
      })
      .catch((err) => {
        setKotaeError(err.message || "読み込みに失敗しました");
        setKotaeContent(null);
      })
      .finally(() => setKotaeLoading(false));
  }, [expandedKotaeId, kotaeList]);

  useEffect(() => {
    const validQuizzes = QUIZZES.filter(
      (q) => q.options?.every((o) => o.text?.trim()) && q.koreanTemplate?.trim()
    );
    const shuffled = shuffle(
      validQuizzes.map((q) => ({
        ...q,
        options: shuffle([...q.options]),
      }))
    ) as unknown as typeof QUIZZES;
    setQuizzes(shuffled);
  }, []);

  const filteredQuizzes = quizSearch.trim()
    ? quizzes.filter((q) => {
        const q2 = q as { japanese?: string; koreanTemplate?: string; options?: { text: string }[]; explanation?: string; vocabulary?: string[] };
        const search = quizSearch.trim().toLowerCase();
        const jp = (q2.japanese || "").toLowerCase();
        const kr = (q2.koreanTemplate || "").toLowerCase();
        const opts = (q2.options || []).map((o) => o.text?.toLowerCase() || "").join(" ");
        const exp = (q2.explanation || "").toLowerCase();
        const voc = (q2.vocabulary || []).join(" ").toLowerCase();
        return [jp, kr, opts, exp, voc].some((s) => s.includes(search));
      })
    : quizzes;

  useEffect(() => {
    if (currentIndex >= filteredQuizzes.length) {
      setCurrentIndex(Math.max(0, filteredQuizzes.length - 1));
    }
  }, [filteredQuizzes.length, currentIndex]);

  useEffect(() => {
    setCurrentIndex(0);
    setSelectedAnswer(null);
    setShowResult(false);
  }, [quizSearch]);

  const quiz = filteredQuizzes[currentIndex];
  const ov = quiz ? overrides[quiz.id] : undefined;
  const explanation =
    quiz ? ((typeof ov === "string" ? ov : ov?.explanation) ?? quiz.explanation) : "";
  const japanese = quiz ? ((typeof ov === "object" && ov?.japanese != null ? ov.japanese : null) ?? quiz.japanese) : "";
  const options = quiz ? ((typeof ov === "object" && ov?.options != null ? ov.options : null) ?? quiz.options) : [];

  useEffect(() => {
    const token = typeof window !== "undefined" ? localStorage.getItem("quiz_token") : null;
    setIsLoggedIn(!!token);
  }, []);

  useEffect(() => {
    if (typeof window !== "undefined") {
      setHasPaid(localStorage.getItem("quiz_has_paid") === "true");
    }
  }, []);

  useEffect(() => {
    const shouldShow = currentIndex >= FREE_QUIZ_LIMIT && !hasPaid;
    setShowPaywall(shouldShow);
  }, [currentIndex, hasPaid]);

  useEffect(() => {
    const span = blankMeasureRef.current;
    if (!span) return;
    const measure = () => setBlankWidth(span.offsetWidth);
    measure();
    const ro = new ResizeObserver(measure);
    ro.observe(span);
    return () => ro.disconnect();
  }, [currentIndex, overrides, filteredQuizzes]);

  useEffect(() => {
    fetch("/api/explanations")
      .then((r) => r.json())
      .then((data) => setOverrides(data.overrides || {}))
      .catch(() => {});
  }, []);
  const total = filteredQuizzes.length;
  const isComplete = currentIndex >= total - 1 && showResult;
  const answeredCount = showResult ? currentIndex + 1 : 0;
  const accuracyRate = showResult && answeredCount > 0
    ? Math.round((correctCount / answeredCount) * 100)
    : null;

  const formatExplanation = (text: string) =>
    (text || "")
      .replace(/\\n/g, "\n")
      .replace(/(?<!、)([❶❷❸❹])/g, "\n$1")
      .replace(/\n{2,}/g, "\n")
      .replace(/^\n+/, "");

  const renderExplanation = (raw: string) => {
    const t = raw || "";
    const pointStart = "#";
    const pointEnd = "/#";
    if (!t.includes(pointStart)) {
      return <p style={{ whiteSpace: "pre-line" }}>{formatExplanation(t)}</p>;
    }
    const parts: React.ReactNode[] = [];
    let rest = t;
    let key = 0;
    while (rest.length > 0) {
      const i = rest.indexOf(pointStart);
      const j = rest.indexOf(pointEnd, i + pointStart.length);
      if (i === -1) {
        parts.push(<p key={key++} style={{ whiteSpace: "pre-line" }}>{formatExplanation(rest)}</p>);
        break;
      }
      if (i > 0) {
        parts.push(<p key={key++} style={{ whiteSpace: "pre-line" }}>{formatExplanation(rest.slice(0, i))}</p>);
      }
      if (j !== -1) {
        const pointContent = rest.slice(i + pointStart.length, j).trim();
        parts.push(<div key={key++} className="point">{formatExplanation(pointContent)}</div>);
        rest = rest.slice(j + pointEnd.length);
      } else {
        rest = rest.slice(i + pointStart.length);
      }
    }
    return <>{parts}</>;
  };

  const handleSelect = (optionId: number) => {
    if (showResult) return;
    setSelectedAnswer(optionId);
    setShowResult(true);
    if (optionId === quiz.correctAnswer) {
      setCorrectCount((c) => c + 1);
    }
  };

  const handleUndo = () => {
    if (selectedAnswer === quiz.correctAnswer) {
      setCorrectCount((c) => Math.max(0, c - 1));
    }
    setSelectedAnswer(null);
    setShowResult(false);
  };

  const handleNext = () => {
    if (currentIndex < total - 1) {
      const nextIndex = currentIndex + 1;
      if (nextIndex >= FREE_QUIZ_LIMIT && !hasPaid) {
        setShowPaywall(true);
        return;
      }
      setCurrentIndex(nextIndex);
      setSelectedAnswer(null);
      setShowResult(false);
    }
  };

  const handleCheckout = async () => {
    setCheckoutLoading(true);
    try {
      const res = await fetch("/api/checkout", { method: "POST" });
      const data = await res.json();
      if (data.url) window.location.href = data.url;
      else throw new Error(data.error || "Checkout failed");
    } catch (e) {
      console.error(e);
      setCheckoutLoading(false);
    }
  };

  const rightMenuLinks = [
    { label: "作文トレ", href: "https://apps.mirinae.jp/writing", external: true },
    { label: "音読トレ", href: "https://apps.mirinae.jp/ondoku", external: true },
    { label: "生活韓国語", href: "/quiz?tab=dailylife", external: false },
    { label: "初級クイズ", href: "https://apps.mirinae.jp/quiz", external: true },
    { label: "変則活用", href: "https://mirinae.jp", external: true },
    { label: "初級文法", href: "https://mirinae.jp", external: true },
    { label: "中級文法", href: "https://mirinae.jp", external: true },
    { label: "上級文法", href: "https://mirinae.jp", external: true },
  ];

  const menuLinks = [
    { label: "ログイン", onClick: () => setShowLoginModal(true), external: false },
    { label: "個人レッスン", href: `${MIRINAE_JP}/kojin.html`, external: true },
    { label: "短期個人", href: `${MIRINAE_JP}/kojin.html#tab02`, external: true },
    { label: "発音講座", href: `${MIRINAE_JP}/kojin.html#tab03`, external: true },
    { label: "会話クラス", href: `${MIRINAE_JP}/kaiwa.html`, external: true },
    { label: "音読クラス", href: `${MIRINAE_JP}/kaiwa.html#tab02`, external: true },
    { label: "集中講座", href: `${MIRINAE_JP}/syutyu.html`, external: true },
    { label: "申し込み", href: `${MIRINAE_JP}/trial.html`, external: true },
  ];

  const navLinks = (
    <div className="space-y-0">
      {menuLinks.slice(1).map((item) => (
        <a
          key={item.href}
          href={item.href}
          {...(item.external ? { target: "_blank", rel: "noopener noreferrer" } : {})}
          className="block py-3 text-gray-800 hover:text-red-600 border-b last:border-b-0"
          onClick={() => setMenuOpen(false)}
        >
          {item.label}
        </a>
      ))}
    </div>
  );

  const desktopMenu = (
    <>
      {!desktopMenuCollapsed && (
        <aside className="hidden md:flex md:flex-col md:w-56 md:shrink-0 md:bg-white md:rounded-2xl md:shadow-lg md:border md:border-gray-200 md:overflow-hidden">
          <div className="px-4 py-4 border-b border-gray-200">
            <span className="font-semibold text-gray-800">メニュー</span>
          </div>
          <nav className="flex-1 overflow-y-auto p-4">{navLinks}</nav>
        </aside>
      )}
    </>
  );

  const desktopMenuToggle = (
    <button
      type="button"
      onClick={() => setDesktopMenuCollapsed((c) => !c)}
      className="hidden md:flex shrink-0 h-10 w-10 items-center justify-center rounded-lg bg-white/90 text-gray-600 hover:bg-white border border-gray-200/80"
      aria-label={desktopMenuCollapsed ? "メニューを開く" : "メニューを閉じる"}
    >
      <svg className="h-5 w-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M4 6h16M4 12h16M4 18h16" />
      </svg>
    </button>
  );

  if (showLanding) {
    return (
      <div className="app-wrapper min-h-screen w-full">
        <nav className="landing-nav w-full px-4 py-3 flex items-center justify-between gap-4">
          <span className="font-bold text-lg" style={{ color: "var(--primary)" }}>
            Mirinae Korean (미리내 한국어)
          </span>
          <div className="flex items-center gap-4" ref={landingNavDropdownRef}>
            <div className="relative">
              <button
                type="button"
                onClick={(e) => { e.stopPropagation(); setLandingNavDropdownOpen((v) => !v); }}
                className="flex items-center gap-1 text-sm font-medium hover:underline"
                style={{ color: "var(--foreground)" }}
              >
                メニュー
                <svg className={`w-4 h-4 transition-transform ${landingNavDropdownOpen ? "rotate-180" : ""}`} fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M19 9l-7 7-7-7" />
                </svg>
              </button>
              {landingNavDropdownOpen && (
                <div
                  className="absolute left-0 top-full mt-1 py-1 min-w-[160px] rounded-lg shadow-lg border z-50"
                  style={{ background: "var(--card-bg)", borderColor: "var(--border)" }}
                >
                  <button
                    type="button"
                    onClick={() => { setLandingNavDropdownOpen(false); handleStartFromLanding("quiz"); }}
                    className="block w-full text-left px-4 py-2.5 text-sm hover:bg-[var(--primary)]/10 transition"
                    style={{ color: "var(--foreground)" }}
                  >
                    クイズ (퀴즈)
                  </button>
                  <button
                    type="button"
                    onClick={() => { setLandingNavDropdownOpen(false); handleStartFromLanding("qna"); }}
                    className="block w-full text-left px-4 py-2.5 text-sm hover:bg-[var(--primary)]/10 transition"
                    style={{ color: "var(--foreground)" }}
                  >
                    Q＆A
                  </button>
                  <button
                    type="button"
                    onClick={() => { setLandingNavDropdownOpen(false); handleStartFromLanding("dailylife"); }}
                    className="block w-full text-left px-4 py-2.5 text-sm hover:bg-[var(--primary)]/10 transition"
                    style={{ color: "var(--foreground)" }}
                  >
                    生活韓国語 (생활 한국어)
                  </button>
                </div>
              )}
            </div>
            {isAdmin && !isLoggedIn ? (
              <Link href="/admin" className="px-4 py-2 text-sm font-medium rounded-lg text-white" style={{ background: "var(--accent)" }}>
                管理者
              </Link>
            ) : isLoggedIn ? (
              <a href="/profile" target="_blank" rel="noopener noreferrer" className="text-sm font-medium hover:underline">
                マイページ
              </a>
            ) : (
              <button type="button" onClick={() => setShowLoginModal(true)} className="px-4 py-2 text-sm font-medium rounded-lg text-white" style={{ background: "var(--accent)" }}>
                ログイン
              </button>
            )}
          </div>
        </nav>

        <main className="flex-1 w-full max-w-6xl mx-auto px-4 py-8 space-y-8">
          <section className="landing-hero p-8 text-center">
            <h1 className="text-2xl md:text-3xl font-bold mb-4" style={{ color: "var(--foreground)" }}>
              ミリネのクイズで学ぶ韓国語
            </h1>
            <p className="text-base mb-6" style={{ color: "var(--text-muted)" }}>
              韓国語の微妙なニュアンスを、楽しいクイズと専門家のガイダンスで学びましょう。
            </p>
            <button
              type="button"
              onClick={() => handleStartFromLanding("quiz")}
              className="landing-cta landing-cta-primary inline-flex items-center gap-2"
            >
              지금 시작하기
              <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M17 8l4 4m0 0l-4 4m4-4H3" />
              </svg>
            </button>
          </section>

          <section className="grid grid-cols-1 md:grid-cols-3 gap-6">
            <button
              type="button"
              onClick={() => handleStartFromLanding("quiz")}
              className="landing-card overflow-hidden text-left h-full flex flex-col"
            >
              <div className="landing-card-header text-white" style={{ background: "var(--primary)" }}>
                クイズ (퀴즈 센터)
              </div>
              <div className="p-4 flex-1 flex flex-col">
                <p className="text-sm mb-3" style={{ color: "var(--text-muted)" }}>
                  韓国語の自然な表現をクイズで学ぶ
                </p>
                <p className="text-xs mt-auto" style={{ color: "var(--text-muted)" }}>
                  90問のクイズで実力アップ
                </p>
                <span className="mt-3 inline-block py-2 px-4 text-center text-sm font-medium rounded-lg text-white" style={{ background: "var(--primary)" }}>
                  クイズを始める
                </span>
              </div>
            </button>

            <button
              type="button"
              onClick={() => handleStartFromLanding("qna")}
              className="landing-card overflow-hidden text-left h-full flex flex-col"
            >
              <div className="landing-card-header text-white" style={{ background: "var(--primary)", opacity: 0.9 }}>
                Q＆A
              </div>
              <div className="p-4 flex-1 flex flex-col">
                <p className="text-sm mb-3" style={{ color: "var(--text-muted)" }}>
                  韓国語の微妙なニュアンスをQ&Aで
                </p>
                <p className="text-xs mt-auto" style={{ color: "var(--text-muted)" }}>
                  {filteredKotae.length}件の質問と答え
                </p>
                <span className="mt-3 inline-block py-2 px-4 text-center text-sm font-medium rounded-lg text-white" style={{ background: "var(--primary)" }}>
                  Q&Aを見る
                </span>
              </div>
            </button>

            <button
              type="button"
              onClick={() => handleStartFromLanding("dailylife")}
              className="landing-card overflow-hidden text-left h-full flex flex-col block"
            >
              <div className="landing-card-header text-white" style={{ background: "var(--accent-alt)", color: "var(--foreground)" }}>
                生活韓国語 (생활 한국어)
              </div>
              <div className="p-4 flex-1 flex flex-col">
                <p className="text-sm mb-3" style={{ color: "var(--text-muted)" }}>
                  日常で使える韓国語表現
                </p>
                <p className="text-xs mt-auto" style={{ color: "var(--text-muted)" }}>
                  {seikatsuList.length}件の記事
                </p>
                <span className="mt-3 inline-block py-2 px-4 text-center text-sm font-medium rounded-lg" style={{ background: "var(--accent-alt)", color: "var(--foreground)" }}>
                  生活韓国語を見る
                </span>
              </div>
            </button>
          </section>

        </main>

        <LoginModal isOpen={showLoginModal} onClose={() => setShowLoginModal(false)} redirectPath="/" />
        <LogoutConfirmModal isOpen={showLogoutModal} onClose={() => setShowLogoutModal(false)} onConfirm={handleLogout} />
      </div>
    );
  }

  return (
    <div className="app-wrapper">
      {rightMenuOpen &&
        typeof document !== "undefined" &&
        createPortal(
          <>
            <div
              className="fixed inset-0 z-[9998] bg-black/40"
              onClick={() => closeRightMenu()}
              aria-hidden
            />
            <aside
              className={`fixed right-0 top-0 z-[9999] h-full bg-white shadow-2xl overflow-y-auto transition-all duration-300 w-72 max-w-[85vw] md:max-w-[320px]`}
              style={{ animation: "slideInRight 0.2s ease" }}
            >
            <div className="flex items-center justify-between border-b border-gray-200 bg-white px-4 py-3">
              <span className="font-semibold text-gray-800">メニュー</span>
              <button
                type="button"
                onClick={() => closeRightMenu()}
                className="rounded p-2 text-gray-500 hover:bg-gray-100"
                aria-label="メニューを閉じる"
              >
                <svg className="h-5 w-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M6 18L18 6M6 6l12 12" />
                </svg>
              </button>
            </div>
            <div className="p-4 space-y-4">
              <div className="bg-white rounded-xl shadow-sm border border-gray-200 p-3">
                <h3 className="font-semibold text-gray-800 text-xs mb-2">ログイン・マイページ</h3>
                {isAdmin && !isLoggedIn ? (
                  <>
                    <Link href="/admin" onClick={() => closeRightMenu()} className="block w-full py-2 px-3 text-center text-sm font-medium rounded-lg bg-red-600 hover:bg-red-700 text-white mb-1.5">管理者モードで接続中</Link>
                    <button type="button" onClick={() => { handleAdminLogout(); closeRightMenu(); }} className="block w-full text-left text-xs text-gray-500 hover:text-red-600">管理者ログアウト</button>
                  </>
                ) : isLoggedIn ? (
                  <>
                    <a href="/profile" target="_blank" rel="noopener noreferrer" className="block w-full py-2 px-3 text-center text-sm font-medium rounded-lg bg-[var(--primary)] text-white mb-1.5" onClick={() => closeRightMenu()}>マイページ</a>
                    <div className="flex justify-between items-center text-xs text-gray-500">
                      <span>ログイン中</span>
                      <button type="button" onClick={() => { setShowLogoutModal(true); closeRightMenu(); }} className="hover:text-red-600">ログアウト</button>
                    </div>
                  </>
                ) : (
                  <>
                    <button type="button" onClick={() => { setShowLoginModal(true); closeRightMenu(); }} className="block w-full py-2 px-3 text-center text-sm font-medium rounded-lg bg-[var(--accent)] text-gray-800 mb-1.5">ログイン</button>
                    <div className="flex justify-center gap-1.5 text-xs text-gray-500">
                      <Link href="/login" onClick={() => closeRightMenu()} className="hover:underline">アカウント</Link>
                      <span>|</span>
                      <Link href="/login" onClick={() => closeRightMenu()} className="hover:underline">新規登録</Link>
                    </div>
                  </>
                )}
              </div>
              <div className="border-t border-gray-200 pt-4">
                <p className="text-xs font-semibold text-gray-500 mb-2">その他</p>
                {rightMenuLinks.filter((l) => !["生活韓国語"].includes(l.label)).map((item) => (
                  <a key={item.label} href={item.href} {...(item.external ? { target: "_blank", rel: "noopener noreferrer" } : {})} className="block py-2 text-sm text-gray-700 hover:text-[var(--primary)]" onClick={() => closeRightMenu()}>{item.label}</a>
                ))}
              </div>
            </div>
          </aside>
          </>,
          document.body
        )}
      {menuOpen &&
        typeof document !== "undefined" &&
        createPortal(
          <>
            <div
              className="fixed inset-0 z-[9998] bg-black/40 md:hidden"
              onClick={() => setMenuOpen(false)}
              aria-hidden
            />
            <aside
              className="fixed left-0 top-0 z-[9999] h-full w-64 max-w-[85vw] bg-white shadow-2xl md:hidden"
              style={{ animation: "slideIn 0.2s ease" }}
            >
            <div className="flex items-center justify-between border-b px-4 py-3">
              <span className="font-semibold text-gray-800">メニュー</span>
              <button
                type="button"
                onClick={() => setMenuOpen(false)}
                className="rounded p-2 text-gray-500 hover:bg-gray-100"
                aria-label="メニューを閉じる"
              >
                <svg className="h-5 w-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M6 18L18 6M6 6l12 12" />
                </svg>
              </button>
            </div>
            <nav className="p-4">{navLinks}</nav>
          </aside>
          </>,
          document.body
        )}
      <div className={`flex-1 flex flex-col min-h-0 min-w-0 w-full max-w-full mx-auto px-0 md:px-4 ${kotaeSingleViewId ? "" : "md:max-w-4xl"}`}>
      <div className={`flex-1 flex flex-col min-h-0 md:flex-row md:justify-center md:gap-4 min-w-0 w-full ${kotaeSingleViewId ? "md:items-stretch" : "md:items-start"}`}>
        {desktopMenu}
        <div className={`quiz-container flex flex-col flex-1 min-h-0 w-full md:shrink-0 ${kotaeSingleViewId ? "quiz-container--single" : ""} ${activeTab === "qna" || activeTab === "dailylife" ? `max-w-full rounded-none md:rounded-[var(--radius)] border-0 md:border md:border-gray-200 ${kotaeSingleViewId ? "" : "md:max-w-[520px]"}` : ""} ${kotaeSingleViewId ? "min-h-[calc(100dvh-6rem)] md:h-full" : ""}`}>
        <div className="flex items-center gap-2 p-2 md:p-3 bg-gray-50">
          {desktopMenuToggle}
          <button
            type="button"
            onClick={() => setMenuOpen(true)}
            className="md:hidden shrink-0 flex h-10 w-10 items-center justify-center rounded-lg bg-white border text-gray-600 hover:bg-gray-50"
            style={{ borderColor: "var(--border)" }}
            aria-label="メニューを開く"
          >
            <svg className="h-5 w-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M4 6h16M4 12h16M4 18h16" />
            </svg>
          </button>
          <button
            type="button"
            onClick={() => { setActiveTab("quiz"); router.replace(QUIZ_BASE); }}
            className={`quiz-tab-btn flex-1 py-2.5 px-3 text-sm font-bold rounded-lg transition ${
              activeTab === "quiz"
                ? "text-white"
                : "bg-white text-gray-600 border hover:border-[var(--primary)] hover:text-[var(--primary)]"
            }`}
            style={activeTab === "quiz" ? { background: "var(--primary)" } : { borderColor: "var(--border)" }}
          >
            クイズ
          </button>
          <button
            type="button"
            onClick={() => { setActiveTab("qna"); router.replace("/qna"); }}
            className={`quiz-tab-btn flex-1 py-2.5 px-3 text-sm font-bold rounded-lg transition ${
              activeTab === "qna"
                ? "text-white"
                : "bg-white text-gray-600 border hover:border-[var(--primary)] hover:text-[var(--primary)]"
            }`}
            style={activeTab === "qna" ? { background: "var(--primary)" } : { borderColor: "var(--border)" }}
          >
            Q&A
          </button>
          <button
            type="button"
            onClick={() => { setActiveTab("dailylife"); router.replace(`${QUIZ_BASE}?tab=dailylife`); }}
            className={`quiz-tab-btn flex-1 py-2.5 px-3 text-sm font-bold rounded-lg transition ${
              activeTab === "dailylife"
                ? "text-white"
                : "bg-white text-gray-600 border hover:border-[var(--primary)] hover:text-[var(--primary)]"
            }`}
            style={activeTab === "dailylife" ? { background: "var(--primary)" } : { borderColor: "var(--border)" }}
          >
            生活韓国語
          </button>
          <button
            type="button"
            onClick={() => setRightMenuOpen(true)}
            className="md:hidden shrink-0 flex h-10 w-10 items-center justify-center rounded-lg bg-white border border-gray-200 text-gray-600 hover:bg-gray-50"
            aria-label="メニューを開く"
          >
            <svg className="h-5 w-5" fill="currentColor" viewBox="0 0 24 24">
              <circle cx="12" cy="6" r="1.5" />
              <circle cx="12" cy="12" r="1.5" />
              <circle cx="12" cy="18" r="1.5" />
            </svg>
          </button>
          <button
            type="button"
            onClick={() => setRightMenuOpen(true)}
            className="hidden md:flex shrink-0 h-10 w-10 items-center justify-center rounded-lg bg-white border border-gray-200 text-gray-600 hover:bg-gray-50"
            aria-label="メニューを開く"
          >
            <svg className="h-5 w-5" fill="currentColor" viewBox="0 0 24 24">
              <circle cx="12" cy="6" r="1.5" />
              <circle cx="12" cy="12" r="1.5" />
              <circle cx="12" cy="18" r="1.5" />
            </svg>
          </button>
        </div>
        {activeTab === "qna" ? kotaeSingleViewId ? (
          <div className="kotae-single flex flex-col flex-1 min-h-0 overflow-hidden w-full h-full" style={{ minHeight: "calc(100dvh - 7rem)" }}>
            <div className="shrink-0 flex items-center justify-between gap-2 px-2 md:px-4 py-3 border-b bg-white" style={{ borderColor: "var(--border)" }}>
              <button type="button" onClick={() => router.replace("/qna")} className="flex items-center gap-1 text-sm text-gray-600 hover:text-[var(--primary)]">
                <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M15 19l-7-7 7-7" /></svg>
                リストに戻る
              </button>
              <div className="flex items-center gap-1">
                <button
                  type="button"
                  disabled={!kotaePrevItem}
                  onClick={() => kotaePrevItem && router.replace(`/qna?id=${kotaePrevItem.id}`)}
                  className="p-2 rounded-lg border disabled:opacity-40 disabled:cursor-not-allowed hover:bg-gray-50"
                  style={{ borderColor: "var(--border)" }}
                  aria-label="이전 글"
                >
                  <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M15 19l-7-7 7-7" /></svg>
                </button>
                <span className="text-sm text-gray-600 min-w-[4rem] text-center">
                  {kotaeSingleViewIdx >= 0 ? `${kotaeSingleViewIdx + 1} / ${filteredKotae.length}` : "-"}
                </span>
                <button
                  type="button"
                  disabled={!kotaeNextItem}
                  onClick={() => kotaeNextItem && router.replace(`/qna?id=${kotaeNextItem.id}`)}
                  className="p-2 rounded-lg border disabled:opacity-40 disabled:cursor-not-allowed hover:bg-gray-50"
                  style={{ borderColor: "var(--border)" }}
                  aria-label="다음 글"
                >
                  <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M17 8l4 4m0 0l-4 4m4-4H3" /></svg>
                </button>
              </div>
            </div>
            <div className="flex-1 min-h-0 overflow-y-auto px-0 py-4 md:px-4">
              {kotaeLoading ? (
                <p className="text-center text-gray-500 py-8">読み込み中...</p>
              ) : kotaeError ? (
                <p className="text-center text-red-500 py-4">{kotaeError}</p>
              ) : kotaeContent?.html ? kotaeContent.html.includes("<script") ? (
                <iframe
                  srcDoc={wrapHtmlForIframe(kotaeContent.html)}
                  title="Q&A content"
                  className="w-full min-h-[400px] border-0 kotae-blog-content"
                  sandbox="allow-scripts"
                />
              ) : (
                <div className="kotae-blog-content text-gray-800" dangerouslySetInnerHTML={{ __html: kotaeContent.html }} />
              ) : null}
            </div>
            {kotaeSingleViewId && (
              <div className="py-3 px-2 md:px-4 border-t shrink-0 bg-gray-50" style={{ borderColor: "var(--border)" }}>
                <p className="text-xs text-gray-500 mb-1.5">この記事のリンク（共有用）:</p>
                <div className="flex flex-wrap items-center gap-2">
                  <a href={`https://apps.mirinae.jp/qna/${kotaeSingleViewId}`} target="_blank" rel="noopener noreferrer" className="flex-1 min-w-0 text-xs text-[var(--primary)] hover:underline truncate">
                    https://apps.mirinae.jp/qna/{kotaeSingleViewId}
                  </a>
                  <button
                    type="button"
                    onClick={async () => {
                      try {
                        await navigator.clipboard.writeText(`https://apps.mirinae.jp/qna/${kotaeSingleViewId}`);
                        setKotaeUrlCopied(true);
                        setTimeout(() => setKotaeUrlCopied(false), 2000);
                      } catch {}
                    }}
                    className="px-2.5 py-1 text-xs font-medium rounded bg-[var(--primary)] text-white hover:opacity-90 shrink-0"
                  >
                    {kotaeUrlCopied ? "コピーしました" : "URLをコピー"}
                  </button>
                </div>
              </div>
            )}
          </div>
        ) : (
          <div className="kotae-list flex flex-col flex-1 min-h-0 overflow-hidden">
            <div className="text-white shrink-0 px-4 md:px-6 pt-3 pb-4 border-b border-white/10" style={{ background: "var(--primary)" }}>
              <h2 className="text-center font-semibold text-base mb-3">韓国語の微妙なニュアンス Q&A</h2>
              <input
                type="search"
                placeholder="質問を検索... (例: 違い、使い方)"
                value={kotaeSearch}
                onChange={(e) => setKotaeSearch(e.target.value)}
                className="w-full px-4 py-2.5 text-sm border-0 rounded-lg bg-white/95 text-gray-800 placeholder:text-gray-500 focus:outline-none focus:ring-2 focus:ring-white/50"
              />
              <p className="text-sm text-white/90 mt-2">{filteredKotae.length}件の質問と答え</p>
            </div>
            <ul className="flex-1 overflow-y-auto min-h-0">
              {kotaeListLoading ? (
                <li className="py-8 px-4 text-center text-gray-500 text-sm">
                  読み込み中...
                </li>
              ) : filteredKotae.length === 0 ? (
                <li className="py-8 px-4 text-center text-gray-500 text-sm">
                  該当する質問がありません
                </li>
              ) : (
                kotaePaginated.map((item, i) => (
                  <li key={item.id} className="border-b border-gray-200 last:border-b-0">
                    <button
                      type="button"
                      onClick={() => {
                        if (expandedKotaeId === item.id) {
                          setExpandedKotaeId(null);
                          router.replace("/qna");
                        } else {
                          router.replace(`/qna?id=${item.id}`);
                        }
                      }}
                      className="w-full text-left py-3 px-2 md:px-4 text-gray-800 text-sm flex items-center justify-between gap-2"
                    >
                      <span>{item.title}</span>
                      <span
                        className={`shrink-0 text-gray-400 transition-transform ${
                          expandedKotaeId === item.id ? "rotate-180" : ""
                        }`}
                      >
                        ▼
                      </span>
                    </button>
                    {expandedKotaeId === item.id && (
                      <div className="border-t border-gray-200 bg-white overflow-hidden">
                        <div className="min-h-[300px] max-h-[70vh] md:max-h-[calc(100vh-12rem)] overflow-y-auto px-0 py-4 md:px-4">
                          {kotaeLoading ? (
                            <p className="text-center text-gray-500 py-8">読み込み中...</p>
                          ) : kotaeError ? (
                            <p className="text-center text-red-500 py-4">{kotaeError}</p>
                          ) : kotaeContent?.html ? kotaeContent.html.includes("<script") ? (
                            <iframe
                              srcDoc={wrapHtmlForIframe(kotaeContent.html)}
                              title="Q&A content"
                              className="w-full min-h-[400px] border-0 kotae-blog-content"
                              sandbox="allow-scripts"
                            />
                          ) : (
                            <div
                              className="kotae-blog-content text-gray-800"
                              dangerouslySetInnerHTML={{ __html: kotaeContent.html }}
                            />
                          ) : null}
                        </div>
                        {expandedKotaeId && (
                          <div className="py-3 px-2 md:px-4 border-t border-gray-100 bg-gray-50">
                            <p className="text-xs text-gray-500 mb-1.5">この記事のリンク（共有用）:</p>
                            <div className="flex flex-wrap items-center gap-2">
                              <a
                                href={`https://apps.mirinae.jp/qna/${expandedKotaeId}`}
                                target="_blank"
                                rel="noopener noreferrer"
                                className="flex-1 min-w-0 text-xs text-[var(--primary)] hover:underline truncate"
                              >
                                {`https://apps.mirinae.jp/qna/${expandedKotaeId}`}
                              </a>
                              <button
                                type="button"
                                onClick={async () => {
                                  try {
                                    await navigator.clipboard.writeText(`https://apps.mirinae.jp/qna/${expandedKotaeId}`);
                                    setKotaeUrlCopied(true);
                                    setTimeout(() => setKotaeUrlCopied(false), 2000);
                                  } catch {}
                                }}
                                className="px-2.5 py-1 text-xs font-medium rounded bg-[var(--primary)] text-white hover:opacity-90 shrink-0"
                              >
                                {kotaeUrlCopied ? "コピーしました" : "URLをコピー"}
                              </button>
                            </div>
                          </div>
                        )}
                      </div>
                    )}
                  </li>
                ))
              )}
            </ul>
            {filteredKotae.length > KOTAE_PAGE_SIZE && (
              <div className="flex items-center justify-center gap-2 py-2 px-4 border-t border-gray-200 shrink-0">
                <button
                  type="button"
                  onClick={() => setKotaePage((p) => Math.max(0, p - 1))}
                  disabled={kotaePage === 0}
                  className="px-3 py-1.5 text-sm rounded border border-gray-300 disabled:opacity-40 disabled:cursor-not-allowed hover:bg-gray-50"
                >
                  前へ
                </button>
                <span className="text-sm text-gray-600">
                  {kotaePage + 1} / {kotaeTotalPages}
                </span>
                <button
                  type="button"
                  onClick={() => setKotaePage((p) => Math.min(kotaeTotalPages - 1, p + 1))}
                  disabled={kotaePage >= kotaeTotalPages - 1}
                  className="px-3 py-1.5 text-sm rounded border border-gray-300 disabled:opacity-40 disabled:cursor-not-allowed hover:bg-gray-50"
                >
                  次へ
                </button>
              </div>
            )}
          </div>
        ) : activeTab === "dailylife" ? (
          <div className="kotae-list flex flex-col flex-1 min-h-0 overflow-hidden">
            <div className="text-white shrink-0 px-4 md:px-6 pt-3 pb-4 border-b border-white/10" style={{ background: "var(--primary)" }}>
              <h2 className="text-center font-semibold text-base mb-3">生活韓国語 (생활 한국어)</h2>
              <input
                type="search"
                placeholder="記事を検索... (例: 表現、使い方)"
                value={seikatsuSearch}
                onChange={(e) => setSeikatsuSearch(e.target.value)}
                className="w-full px-4 py-2.5 text-sm border-0 rounded-lg bg-white/95 text-gray-800 placeholder:text-gray-500 focus:outline-none focus:ring-2 focus:ring-white/50"
              />
              <p className="text-sm text-white/90 mt-2">{filteredSeikatsu.length}件の記事</p>
            </div>
            <ul className="flex-1 overflow-y-auto min-h-0">
              {seikatsuList.length === 0 ? (
                <li className="py-8 px-4 text-center text-gray-500 text-sm">
                  読み込み中...
                </li>
              ) : filteredSeikatsu.length === 0 ? (
                <li className="py-8 px-4 text-center text-gray-500 text-sm">
                  該当する記事がありません
                </li>
              ) : (
                seikatsuPaginated.map((title, i) => (
                  <li key={i} className="border-b border-gray-200 last:border-b-0">
                    <button
                      type="button"
                      onClick={() =>
                        setExpandedSeikatsuTitle((prev) => (prev === title ? null : title))
                      }
                      className="w-full text-left py-3 px-2 md:px-4 text-gray-800 text-sm flex items-center justify-between gap-2"
                    >
                      <span>{title}</span>
                      <span
                        className={`shrink-0 text-gray-400 transition-transform ${
                          expandedSeikatsuTitle === title ? "rotate-180" : ""
                        }`}
                      >
                        ▼
                      </span>
                    </button>
                    {expandedSeikatsuTitle === title && (
                      <div className="border-t border-gray-200 bg-white overflow-hidden">
                        <div className="seikatsu-content min-h-[300px] max-h-[70vh] md:max-h-[calc(100vh-12rem)] overflow-y-auto px-0 py-4 md:px-4">
                          {seikatsuLoading ? (
                            <p className="text-center text-gray-500 py-8">読み込み中...</p>
                          ) : seikatsuError ? (
                            <p className="text-center text-red-500 py-4">{seikatsuError}</p>
                          ) : seikatsuContent?.html ? seikatsuContent.html.includes("<script") ? (
                            <iframe
                              srcDoc={wrapHtmlForIframe(seikatsuContent.html)}
                              title="生活韓国語 content"
                              className="w-full min-h-[400px] border-0 kotae-blog-content"
                              sandbox="allow-scripts"
                            />
                          ) : (
                            <div
                              className="kotae-blog-content text-gray-800"
                              dangerouslySetInnerHTML={{ __html: seikatsuContent.html }}
                            />
                          ) : null}
                        </div>
                        {expandedSeikatsuTitle && (
                          <div className="py-3 px-2 md:px-4 border-t border-gray-100 bg-gray-50">
                            <p className="text-xs text-gray-500 mb-1.5">この記事のリンク（共有用）:</p>
                            <div className="flex flex-wrap items-center gap-2">
                              <a
                                href={`https://apps.mirinae.jp/dailylife?title=${encodeURIComponent(expandedSeikatsuTitle)}`}
                                target="_blank"
                                rel="noopener noreferrer"
                                className="flex-1 min-w-0 text-xs text-[var(--primary)] hover:underline break-all"
                              >
                                {`https://apps.mirinae.jp/dailylife?title=${encodeURIComponent(expandedSeikatsuTitle)}`}
                              </a>
                              <button
                                type="button"
                                onClick={async () => {
                                  try {
                                    const url = `https://apps.mirinae.jp/dailylife?title=${encodeURIComponent(expandedSeikatsuTitle)}`;
                                    await navigator.clipboard.writeText(url);
                                    setSeikatsuUrlCopied(true);
                                    setTimeout(() => setSeikatsuUrlCopied(false), 2000);
                                  } catch {}
                                }}
                                className="px-2.5 py-1 text-xs font-medium rounded bg-[var(--primary)] text-white hover:opacity-90 shrink-0"
                              >
                                {seikatsuUrlCopied ? "コピーしました" : "URLをコピー"}
                              </button>
                            </div>
                          </div>
                        )}
                      </div>
                    )}
                  </li>
                ))
              )}
            </ul>
            {filteredSeikatsu.length > SEIKATSU_PAGE_SIZE && (
              <div className="flex items-center justify-center gap-2 py-2 px-4 border-t border-gray-200 shrink-0">
                <button
                  type="button"
                  onClick={() => setSeikatsuPage((p) => Math.max(0, p - 1))}
                  disabled={seikatsuPage === 0}
                  className="px-3 py-1.5 text-sm rounded border border-gray-300 disabled:opacity-40 disabled:cursor-not-allowed hover:bg-gray-50"
                >
                  前へ
                </button>
                <span className="text-sm text-gray-600">
                  {seikatsuPage + 1} / {seikatsuTotalPages}
                </span>
                <button
                  type="button"
                  onClick={() => setSeikatsuPage((p) => Math.min(seikatsuTotalPages - 1, p + 1))}
                  disabled={seikatsuPage >= seikatsuTotalPages - 1}
                  className="px-3 py-1.5 text-sm rounded border border-gray-300 disabled:opacity-40 disabled:cursor-not-allowed hover:bg-gray-50"
                >
                  次へ
                </button>
              </div>
            )}
          </div>
        ) : showPaywall ? (
          <>
            <header className="quiz-header">
              <h1 className="min-w-0 break-words">ミリネのクイズで学ぶ韓国語</h1>
              <div className="quiz-meta">
                <span className="quiz-counter">{FREE_QUIZ_LIMIT} / {total}</span>
              </div>
            </header>
            <div className="quiz-main p-8 text-center">
              <p className="text-lg text-gray-700 mb-4">
                無料で{FREE_QUIZ_LIMIT}問までお楽しみいただけます。
              </p>
              <p className="text-gray-600 mb-6">
                11問目以降をご利用になるには、決済が必要です。
              </p>
              <p className="text-2xl font-bold text-[#cd3737] mb-2">¥980</p>
              <p className="text-sm text-gray-500 mb-6">（税込）全問題アンロック</p>
              <button
                type="button"
                onClick={handleCheckout}
                disabled={checkoutLoading}
                className="w-full py-4 px-6 bg-[#cd3737] text-white font-semibold rounded-xl hover:opacity-90 disabled:opacity-70 transition"
              >
                {checkoutLoading ? "処理中..." : "決済して続ける"}
              </button>
              <p className="mt-4 text-xs text-gray-400">
                Stripe決済により安全に処理されます
              </p>
            </div>
          </>
        ) : (
        <>
        <header className="quiz-header-panel">
          <div className="quiz-title">ミリネのクイズで学ぶ韓国語</div>
          <div className="search-wrap">
            <svg className="search-icon" width="15" height="15" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
              <circle cx="11" cy="11" r="8" /><line x1="21" y1="21" x2="16.65" y2="16.65" />
            </svg>
            <input
              type="search"
              className="search-box"
              placeholder="問題を検索… (例: 日本語、韓国語、単語)"
              value={quizSearch}
              onChange={(e) => setQuizSearch(e.target.value)}
            />
          </div>
          <div className="quiz-meta">
            <div className="quiz-count">{total}問 &nbsp;<strong>{currentIndex + 1} / {total}</strong></div>
            {accuracyRate !== null && (
              <div className="score-badge">
                <span className="score-dot" />
                正解率 {accuracyRate}%
              </div>
            )}
          </div>
          <div className="progress-bar-wrap">
            <div
              className="progress-bar-fill"
              style={{ width: `${total > 0 ? ((currentIndex + (showResult ? 1 : 0)) / total) * 100 : 0}%` }}
            />
          </div>
        </header>

        <main className="quiz-body">
          {!quiz ? (
            <p className="py-12 text-center text-gray-500">該当する問題がありません</p>
          ) : (
          <>
          <p className="instruction">{quiz.question}</p>
          <div ref={japaneseRef} className="q-card" style={{ position: "relative" }}>
            {formatJapanese(japanese)}
            <span
              className="measure-span"
              aria-hidden
              style={{
                position: "absolute",
                left: -9999,
                whiteSpace: "nowrap",
                visibility: "hidden",
                pointerEvents: "none",
              }}
            >
              {formatJapanese(japanese)}
            </span>
          </div>
          <div className="q-card korean">
            {(() => {
              const template = (ov?.koreanTemplate ?? quiz.koreanTemplate) ?? "";
              const m = template.match(BLANK_REGEX);
              if (!m) {
                return <span>{template}</span>;
              }
              const [, before, underscoreStr, after] = m;
              return (
                <span>
                  {before.trim() === "." ? "" : before}
                  <span
                    ref={blankMeasureRef}
                    className="blank-measure"
                    aria-hidden
                    style={{
                      position: "absolute",
                      left: -9999,
                      whiteSpace: "nowrap",
                      visibility: "hidden",
                      pointerEvents: "none",
                    }}
                  >
                    {underscoreStr}
                  </span>
                  <span
                    className="blank"
                    style={blankWidth != null ? { width: blankWidth, minWidth: blankWidth } : undefined}
                  />
                  {after.trim() === "." ? "" : after}
                </span>
              );
            })()}
          </div>

          <div className="nav-controls">
            <button
              type="button"
              className="nav-btn"
              onClick={() => {
                if (currentIndex > 0) {
                  setCurrentIndex(currentIndex - 1);
                  setSelectedAnswer(null);
                  setShowResult(false);
                }
              }}
              disabled={currentIndex <= 0}
              aria-label="前の問題へ"
            >
              <svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.5" strokeLinecap="round"><polyline points="15 18 9 12 15 6" /></svg>
            </button>
            <button
              type="button"
              className="nav-btn"
              onClick={() => {
                if (currentIndex < total - 1) {
                  setCurrentIndex(currentIndex + 1);
                  setSelectedAnswer(null);
                  setShowResult(false);
                }
              }}
              disabled={currentIndex >= total - 1}
              aria-label="次の問題へ"
            >
              <svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.5" strokeLinecap="round"><polyline points="9 18 15 12 9 6" /></svg>
            </button>
            {isAdmin && !isLoggedIn && (
              <Link href={`/admin?tab=quiz&quiz=${quiz.id}`} className="edit-btn">
                <svg width="13" height="13" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round"><path d="M11 4H4a2 2 0 0 0-2 2v14a2 2 0 0 0 2 2h14a2 2 0 0 0 2-2v-7" /><path d="M18.5 2.5a2.121 2.121 0 0 1 3 3L12 15l-4 1 1-4 9.5-9.5z" /></svg>
                この問題を編集
              </Link>
            )}
          </div>

          <div className="choices">
            {[...options].sort((a, b) => a.id - b.id).map((option) => {
              const isSelected = selectedAnswer === option.id;
              const isCorrect = option.id === quiz.correctAnswer;
              const showCorrectness = showResult && (isSelected || isCorrect);

              return (
                <button
                  key={option.id}
                  type="button"
                  className={`choice ${isSelected && !showResult ? "selected" : ""} ${
                    showCorrectness && isCorrect ? "correct" : ""
                  } ${showCorrectness && isSelected && !isCorrect ? "wrong" : ""}`}
                  onClick={() => handleSelect(option.id)}
                  disabled={showResult}
                >
                  <div className="choice-num">{["①", "②", "③", "④"][option.id - 1]}</div>
                  <div className="choice-text">{option.text}</div>
                  <div className="choice-mark" aria-hidden />
                </button>
              );
            })}
          </div>

          {showResult && (
            <div className="quiz-explanation">
              <div className={`result-badge ${selectedAnswer === quiz.correctAnswer ? "correct" : "wrong"}`}>
                {selectedAnswer === quiz.correctAnswer ? "✓  正解！" : "✗  不正解…"}
              </div>
              <div className="explanation-text">
                {renderExplanation(explanation)}
                {quiz.vocabulary && quiz.vocabulary.length > 0 && (
                  <div className="vocabulary-list">
                    {quiz.vocabulary.map((v, i) => (
                      <div key={i} className="vocab-item">
                        <strong>{v}</strong>
                      </div>
                    ))}
                  </div>
                )}
              </div>
              <div className="action-area">
                {currentIndex < total - 1 && (
                  <button type="button" className="btn-next" onClick={handleNext}>
                    次の問題へ →
                  </button>
                )}
              </div>
            </div>
          )}
          </>
          )}
        </main>

        <footer className="quiz-footer">
          <div className="progress-bar">
            <div
              className="progress-fill"
              style={{ width: `${total > 0 ? ((currentIndex + (showResult ? 1 : 0)) / total) * 100 : 0}%` }}
            />
          </div>
        </footer>
        </>
        )}
        <section className="quiz-bottom-nav flex flex-nowrap gap-3 justify-center items-center py-4 px-4 border-t shrink-0 overflow-x-auto" style={{ borderColor: "var(--border)", backgroundColor: "var(--background)" }}>
          <a href="https://apps.mirinae.jp/writing" target="_blank" rel="noopener noreferrer" className="quiz-bottom-link flex items-center gap-2 px-4 py-2.5 rounded-lg border hover:border-[var(--primary)] transition shrink-0" style={{ borderColor: "var(--border)", color: "var(--foreground)" }}>
            <svg className="w-5 h-5 shrink-0" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M15.232 5.232l3.536 3.536m-2.036-5.036a2.5 2.5 0 113.536 3.536L6.5 21.036H3v-3.572L16.732 3.732z" /></svg>
            作文
          </a>
          <a href="/main.html" className="quiz-bottom-link flex items-center justify-center w-10 h-10 rounded-lg border hover:border-[var(--primary)] transition shrink-0" style={{ borderColor: "var(--border)", color: "var(--foreground)" }} aria-label="ホームページ">
            <svg className="w-5 h-5 shrink-0" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M3 12l2-2m0 0l7-7 7 7M5 10v10a1 1 0 001 1h3m10-11l2 2m-2-2v10a1 1 0 01-1 1h-3m-6 0a1 1 0 001-1v-4a1 1 0 011-1h2a1 1 0 011 1v4a1 1 0 001 1m-6 0h6" /></svg>
          </a>
          <a href="https://apps.mirinae.jp/ondoku" target="_blank" rel="noopener noreferrer" className="quiz-bottom-link flex items-center gap-2 px-4 py-2.5 rounded-lg border hover:border-[var(--primary)] transition shrink-0" style={{ borderColor: "var(--border)", color: "var(--foreground)" }}>
            <svg className="w-5 h-5 shrink-0" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M19 11a7 7 0 01-7 7m0 0a7 7 0 01-7-7m7 7v4m0 0V8m0 7a7 7 0 017-7" /></svg>
            音読
          </a>
        </section>
        </div>
      </div>
      </div>
      <LoginModal isOpen={showLoginModal} onClose={() => setShowLoginModal(false)} redirectPath="/" />
      <LogoutConfirmModal isOpen={showLogoutModal} onClose={() => setShowLogoutModal(false)} onConfirm={handleLogout} />
    </div>
  );
}
