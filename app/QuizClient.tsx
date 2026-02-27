"use client";

import { useState, useEffect, useRef } from "react";
import Link from "next/link";
import { createPortal } from "react-dom";
import { QUIZZES } from "./quiz-data";
import { LoginModal } from "../components/LoginModal";
import { LogoutConfirmModal } from "../components/LogoutConfirmModal";

const BLANK = "_________________________";

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

export default function QuizClient() {
  const [quizzes, setQuizzes] = useState(QUIZZES);
  const [currentIndex, setCurrentIndex] = useState(0);
  const [selectedAnswer, setSelectedAnswer] = useState<number | null>(null);
  const [showResult, setShowResult] = useState(false);
  const [correctCount, setCorrectCount] = useState(0);
  const [overrides, setOverrides] = useState<
    Record<number, { explanation?: string; japanese?: string; options?: { id: number; text: string }[] }>
  >({});
  const [isLoggedIn, setIsLoggedIn] = useState(false);
  const [menuOpen, setMenuOpen] = useState(false);
  const [rightMenuOpen, setRightMenuOpen] = useState(false);
  const [desktopRightSidebarVisible, setDesktopRightSidebarVisible] = useState(true);
  const [rightSidebarExpanded, setRightSidebarExpanded] = useState(false);
  const [expandedMenuType, setExpandedMenuType] = useState<"qa" | "dailykorean" | null>(null);
  const [desktopMenuCollapsed, setDesktopMenuCollapsed] = useState(true);
  const [blankWidth, setBlankWidth] = useState<number | null>(null);
  const [hasPaid, setHasPaid] = useState(false);
  const [showPaywall, setShowPaywall] = useState(false);
  const [checkoutLoading, setCheckoutLoading] = useState(false);
  const [activeTab, setActiveTab] = useState<"quiz" | "kotae" | "dailykorean">("quiz");
  const [showLanding, setShowLanding] = useState(true);
  const [kotaeSearch, setKotaeSearch] = useState("");
  const [kotaePage, setKotaePage] = useState(0);
  const [kotaeList, setKotaeList] = useState<KotaeItem[]>([]);
  const [kotaeListLoading, setKotaeListLoading] = useState(true);
  const [seikatsuList, setSeikatsuList] = useState<string[]>([]);
  const [seikatsuPage, setSeikatsuPage] = useState(0);
  const [expandedKotaeId, setExpandedKotaeId] = useState<number | null>(null);
  const [kotaeContent, setKotaeContent] = useState<{ html: string; url: string } | null>(null);
  const [kotaeLoading, setKotaeLoading] = useState(false);
  const [kotaeError, setKotaeError] = useState<string | null>(null);
  const [showLoginModal, setShowLoginModal] = useState(false);
  const [showLogoutModal, setShowLogoutModal] = useState(false);
  const [isAdmin, setIsAdmin] = useState(false);
  const [adminAuthKey, setAdminAuthKey] = useState<string | null>(null);
  const [landingNavOpen, setLandingNavOpen] = useState(false);
  const [showQuizOverlay, setShowQuizOverlay] = useState(false);
  const [dailyKoreanTitle, setDailyKoreanTitle] = useState<string | null>(null);
  const landingNavRef = useRef<HTMLDivElement>(null);
  const japaneseRef = useRef<HTMLDivElement>(null);

  useEffect(() => {
    const handleClickOutside = (e: MouseEvent) => {
      if (landingNavRef.current && !landingNavRef.current.contains(e.target as Node)) {
        setLandingNavOpen(false);
      }
    };
    if (landingNavOpen) document.addEventListener("click", handleClickOutside);
    return () => document.removeEventListener("click", handleClickOutside);
  }, [landingNavOpen]);

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
        app_type: activeTab,
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
      body: JSON.stringify({ event: "tab_view", session_id: s.id, app_type: activeTab }),
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
    fetch("/api/dailykorean-list")
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

  const SEIKATSU_PAGE_SIZE = 10;
  const seikatsuTotalPages = Math.ceil(seikatsuList.length / SEIKATSU_PAGE_SIZE) || 1;
  const seikatsuPaginated = seikatsuList.slice(
    seikatsuPage * SEIKATSU_PAGE_SIZE,
    (seikatsuPage + 1) * SEIKATSU_PAGE_SIZE
  );

  const closeRightMenu = () => {
    setRightMenuOpen(false);
    setRightSidebarExpanded(false);
    setExpandedMenuType(null);
  };

  useEffect(() => {
    setKotaePage(0);
  }, [kotaeSearch]);

  useEffect(() => {
    setExpandedKotaeId(null);
    setKotaeContent(null);
    setKotaeError(null);
  }, [kotaePage, kotaeSearch]);

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

  const quiz = quizzes[currentIndex];
  const ov = overrides[quiz.id];
  const explanation =
    (typeof ov === "string" ? ov : ov?.explanation) ?? quiz.explanation;
  const japanese = (typeof ov === "object" && ov?.japanese != null ? ov.japanese : null) ?? quiz.japanese;
  const options = (typeof ov === "object" && ov?.options != null ? ov.options : null) ?? quiz.options;

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
    const el = japaneseRef.current;
    if (!el) return;
    const span = el.querySelector(".measure-span") as HTMLElement;
    if (!span) return;
    const measure = () => setBlankWidth(span.offsetWidth);
    measure();
    const ro = new ResizeObserver(measure);
    ro.observe(el);
    return () => ro.disconnect();
  }, [japanese]);

  useEffect(() => {
    fetch("/api/explanations")
      .then((r) => r.json())
      .then((data) => setOverrides(data.overrides || {}))
      .catch(() => {});
  }, []);
  const total = quizzes.length;
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
    { label: "作文トレ", href: "https://writing.mirinae.jp", external: true },
    { label: "音読トレ", href: "https://ondoku.mirinae.jp", external: true },
    { label: "生活韓国語", href: "/dailykorean", external: false },
    { label: "初級クイズ", href: "https://quiz.mirinae.jp", external: true },
    { label: "変則活用", href: "https://mirinae.jp", external: true },
    { label: "初級文法", href: "https://mirinae.jp", external: true },
    { label: "中級文法", href: "https://mirinae.jp", external: true },
    { label: "上級文法", href: "https://mirinae.jp", external: true },
  ];

  const menuLinks = [
    { label: "ログイン", onClick: () => setShowLoginModal(true), external: false },
    { label: "個人レッスン", href: "/kojin", external: false },
    { label: "短期個人", href: "/tanki-kojin", external: false },
    { label: "発音講座", href: "https://mirinae.jp/kaiwa.html?tab=tab03", external: true },
    { label: "会話クラス", href: "https://mirinae.jp/kaiwa.html?tab=tab01", external: true },
    { label: "音読クラス", href: "https://mirinae.jp/kaiwa.html?tab=tab02", external: true },
    { label: "集中講座", href: "https://mirinae.jp/syutyu.html?tab=tab02", external: true },
    { label: "申し込み", href: "https://mirinae.jp/trial.html?tab=tab01", external: true },
  ];

  const roundMenuItems = menuLinks.slice(1);

  const menuIcons: Record<string, React.ReactNode> = {
    "個人レッスン": (
      <svg className="w-5 h-5" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
        <path d="M20 21v-2a4 4 0 0 0-4-4H8a4 4 0 0 0-4 4v2" />
        <circle cx="12" cy="7" r="4" />
      </svg>
    ),
    "短期個人": (
      <svg className="w-5 h-5" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
        <circle cx="12" cy="12" r="10" />
        <path d="M12 6v6l4 2" />
      </svg>
    ),
    "発音講座": (
      <svg className="w-5 h-5" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
        <path d="M12 1a3 3 0 0 0-3 3v8a3 3 0 0 0 6 0V4a3 3 0 0 0-3-3z" />
        <path d="M19 10v2a7 7 0 0 1-14 0v-2" />
        <path d="M12 19v4" />
        <path d="M8 23h8" />
      </svg>
    ),
    "会話クラス": (
      <svg className="w-5 h-5" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
        <path d="M21 15a2 2 0 0 1-2 2H7l-4 4V5a2 2 0 0 1 2-2h14a2 2 0 0 1 2 2z" />
      </svg>
    ),
    "音読クラス": (
      <svg className="w-5 h-5" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
        <path d="M4 19.5A2.5 2.5 0 0 1 6.5 17H20" />
        <path d="M6.5 2H20v20H6.5A2.5 2.5 0 0 1 4 19.5v-15A2.5 2.5 0 0 1 6.5 2z" />
        <path d="M8 7h8" />
        <path d="M8 11h8" />
      </svg>
    ),
    "集中講座": (
      <svg className="w-5 h-5" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
        <circle cx="12" cy="12" r="10" />
        <circle cx="12" cy="12" r="6" />
        <circle cx="12" cy="12" r="2" />
      </svg>
    ),
    "申し込み": (
      <svg className="w-5 h-5" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
        <path d="M9 11l3 3L22 4" />
        <path d="M21 12v7a2 2 0 0 1-2 2H5a2 2 0 0 1-2-2V5a2 2 0 0 1 2-2h11" />
      </svg>
    ),
  };

  const menuColors = ["#f59e0b", "#f97316", "#3b82f6", "#06b6d4", "#8b5cf6", "#ec4899", "#10b981"];

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

  const handleExpandMenu = (type: "qa" | "dailykorean") => {
    if (rightSidebarExpanded && expandedMenuType === type) {
      setRightSidebarExpanded(false);
      setExpandedMenuType(null);
    } else {
      setRightSidebarExpanded(true);
      setExpandedMenuType(type);
    }
  };

  const rightSidebar = (
    <aside
      className={`hidden md:shrink-0 md:gap-4 transition-all duration-300 ease-out ${
        desktopRightSidebarVisible ? "md:flex md:flex-col" : "md:hidden"
      } ${rightSidebarExpanded ? "md:w-[420px]" : "md:w-64"}`}
    >
      {/* ログイン・マイページ カード - コンパクト */}
      <div className="bg-white rounded-xl shadow-sm border border-gray-200 overflow-hidden shrink-0">
        <div className="p-3">
          <h3 className="font-semibold text-gray-800 text-xs mb-2">ログイン・マイページ</h3>
          {isAdmin && !isLoggedIn ? (
            <div className="space-y-1.5">
              <Link
                href="/admin"
                className="block w-full py-2 px-3 text-center text-sm font-medium rounded-lg bg-red-600 hover:bg-red-700 text-white transition"
              >
                管理者モードで接続中
              </Link>
              <button
                type="button"
                onClick={handleAdminLogout}
                className="block w-full text-left text-xs text-gray-500 hover:text-red-600"
              >
                管理者ログアウト
              </button>
            </div>
          ) : isLoggedIn ? (
            <div className="space-y-1.5">
              <a
                href="/profile"
                target="_blank"
                rel="noopener noreferrer"
                className="block w-full py-2 px-3 text-center text-sm font-medium rounded-lg bg-[var(--primary)] text-white hover:opacity-90 transition"
              >
                マイページ
              </a>
              <div className="flex items-center justify-between text-xs text-gray-500">
                <span>ログイン中</span>
                <button
                  type="button"
                  onClick={() => setShowLogoutModal(true)}
                  className="text-gray-500 hover:text-red-600"
                >
                  ログアウト
                </button>
              </div>
            </div>
          ) : (
            <div className="space-y-1.5">
              <button
                type="button"
                onClick={() => setShowLoginModal(true)}
                className="block w-full py-2 px-3 text-center text-sm font-medium rounded-lg bg-[var(--accent)] text-gray-800 hover:opacity-90 transition"
              >
                ログイン
              </button>
              <div className="flex justify-center gap-1.5 text-xs text-gray-500">
                <Link href="/login" className="hover:underline">アカウント</Link>
                <span>|</span>
                <Link href="/login" className="hover:underline">新規登録</Link>
              </div>
            </div>
          )}
        </div>
      </div>

      {/* クイズ カード - 上部 */}
      <div className="bg-white rounded-2xl shadow-md border border-gray-200 overflow-hidden shrink-0">
        <button
          type="button"
          onClick={() => setActiveTab("quiz")}
          className="w-full p-4 text-left hover:bg-gray-50/50 transition"
        >
          <h3 className="font-bold text-gray-800 text-sm mb-3">クイズ</h3>
          <p className="text-xs text-gray-600 mb-3">韓国語の自然な表現を学ぶ</p>
          <span className="block w-full py-2.5 px-4 text-center text-sm font-medium rounded-xl bg-[var(--primary)] text-white hover:opacity-90 transition">
            クイズを始める
          </span>
        </button>
      </div>

      {/* Q&A カード - クリックで展開・プルダウンメニュー */}
      <div className="bg-white rounded-2xl shadow-md border border-gray-200 overflow-hidden shrink-0">
        <button
          type="button"
          onClick={() => handleExpandMenu("qa")}
          className="w-full p-4 text-left hover:bg-gray-50/50 transition"
        >
          <h3 className="font-bold text-gray-800 text-sm mb-3">Q&A</h3>
          <p className="text-xs text-gray-600 mb-3">韓国語の微妙なニュアンス</p>
          <span className="block w-full py-2.5 px-4 text-center text-sm font-medium rounded-xl bg-[var(--primary)] text-white hover:opacity-90 transition">
            Q&Aを見る
          </span>
          {filteredKotae.length > 0 && (
            <p className="text-xs text-gray-500 mt-2">{filteredKotae.length}件の質問と答え</p>
          )}
        </button>
        {rightSidebarExpanded && expandedMenuType === "qa" && (
          <div className="border-t border-gray-200 max-h-[320px] overflow-y-auto">
            <div className="flex justify-end px-2 pt-1">
              <button
                type="button"
                onClick={() => { setRightSidebarExpanded(false); setExpandedMenuType(null); }}
                className="text-gray-400 hover:text-gray-600 text-sm px-1"
                aria-label="閉じる"
              >
                × 閉じる
              </button>
            </div>
            <div className="p-2">
              {kotaeListLoading ? (
                <p className="py-4 text-center text-gray-500 text-xs">読み込み中...</p>
              ) : filteredKotae.length === 0 ? (
                <p className="py-4 text-center text-gray-500 text-xs">該当なし</p>
              ) : (
                kotaePaginated.map((item) => (
                  <button
                    key={item.id}
                    type="button"
                    onClick={() => {
                      setActiveTab("kotae");
                      setExpandedKotaeId((prev) => (prev === item.id ? null : item.id));
                    }}
                    className="w-full text-left py-2.5 px-3 text-xs text-gray-700 hover:bg-[var(--primary)]/10 rounded-lg transition"
                  >
                    {item.title}
                  </button>
                ))
              )}
              {filteredKotae.length > KOTAE_PAGE_SIZE && (
                <div className="flex justify-center gap-1 py-2">
                  <button
                    type="button"
                    onClick={() => setKotaePage((p) => Math.max(0, p - 1))}
                    disabled={kotaePage === 0}
                    className="px-2 py-1 text-xs rounded border border-gray-300 disabled:opacity-40"
                  >
                    前へ
                  </button>
                  <span className="px-2 py-1 text-xs text-gray-600">
                    {kotaePage + 1}/{kotaeTotalPages}
                  </span>
                  <button
                    type="button"
                    onClick={() => setKotaePage((p) => Math.min(kotaeTotalPages - 1, p + 1))}
                    disabled={kotaePage >= kotaeTotalPages - 1}
                    className="px-2 py-1 text-xs rounded border border-gray-300 disabled:opacity-40"
                  >
                    次へ
                  </button>
                </div>
              )}
              <button
                type="button"
                onClick={() => setActiveTab("kotae")}
                className="w-full mt-2 py-2 text-center text-xs font-medium text-[var(--primary)] hover:underline"
              >
                一覧で見る →
              </button>
            </div>
          </div>
        )}
      </div>

      {/* 生活韓国語 カード - クリックで展開・プルダウンメニュー */}
      <div className="bg-white rounded-2xl shadow-md border border-gray-200 overflow-hidden shrink-0">
        <button
          type="button"
          onClick={() => handleExpandMenu("dailykorean")}
          className="w-full p-4 text-left hover:bg-gray-50/50 transition"
        >
          <h3 className="font-bold text-gray-800 text-sm mb-3">生活韓国語</h3>
          <p className="text-xs text-gray-600 mb-3">日常で使える韓国語表現</p>
          <span className="block w-full py-2.5 px-4 text-center text-sm font-medium rounded-xl bg-[var(--primary)] text-white hover:opacity-90 transition">
            生活韓国語を見る
          </span>
          {seikatsuList.length > 0 && (
            <p className="text-xs text-gray-500 mt-2">{seikatsuList.length}件の記事</p>
          )}
        </button>
        {rightSidebarExpanded && expandedMenuType === "dailykorean" && (
          <div className="border-t border-gray-200 max-h-[320px] overflow-y-auto">
            <div className="flex justify-end px-2 pt-1">
              <button
                type="button"
                onClick={() => { setRightSidebarExpanded(false); setExpandedMenuType(null); }}
                className="text-gray-400 hover:text-gray-600 text-sm px-1"
                aria-label="閉じる"
              >
                × 閉じる
              </button>
            </div>
            <div className="p-2">
              {seikatsuList.length === 0 ? (
                <p className="py-4 text-center text-gray-500 text-xs">読み込み中...</p>
              ) : (
                <>
                  {seikatsuPaginated.map((title, i) => (
                    <button
                      key={i}
                      type="button"
                      onClick={() => { setActiveTab("dailykorean"); setDailyKoreanTitle(title); setRightSidebarExpanded(false); setExpandedMenuType(null); }}
                      className="block w-full text-left py-2.5 px-3 text-xs text-gray-700 hover:bg-[var(--primary)]/10 rounded-lg transition"
                    >
                      {title}
                    </button>
                  ))}
                  {seikatsuList.length > SEIKATSU_PAGE_SIZE && (
                    <div className="flex justify-center gap-1 py-2">
                      <button
                        type="button"
                        onClick={() => setSeikatsuPage((p) => Math.max(0, p - 1))}
                        disabled={seikatsuPage === 0}
                        className="px-2 py-1 text-xs rounded border border-gray-300 disabled:opacity-40"
                      >
                        前へ
                      </button>
                      <span className="px-2 py-1 text-xs text-gray-600">
                        {seikatsuPage + 1}/{seikatsuTotalPages}
                      </span>
                      <button
                        type="button"
                        onClick={() => setSeikatsuPage((p) => Math.min(seikatsuTotalPages - 1, p + 1))}
                        disabled={seikatsuPage >= seikatsuTotalPages - 1}
                        className="px-2 py-1 text-xs rounded border border-gray-300 disabled:opacity-40"
                      >
                        次へ
                      </button>
                    </div>
                  )}
                  <button
                    type="button"
                    onClick={() => { setActiveTab("dailykorean"); setDailyKoreanTitle(null); setRightSidebarExpanded(false); setExpandedMenuType(null); }}
                    className="block w-full mt-2 py-2 text-center text-xs font-medium text-[var(--primary)] hover:underline"
                  >
                    一覧で見る →
                  </button>
                </>
              )}
            </div>
          </div>
        )}
      </div>

      {/* その他 - 下部に配置 */}
      <div className="bg-white rounded-2xl shadow-md border border-gray-200 overflow-hidden shrink-0 mt-auto">
        <div className="p-4">
          <h3 className="font-bold text-gray-800 text-sm mb-3">その他</h3>
          <div className="space-y-2">
            {rightMenuLinks.filter((l) => !["生活韓国語"].includes(l.label)).map((item) => (
              <a
                key={item.label}
                href={item.href}
                {...(item.external ? { target: "_blank", rel: "noopener noreferrer" } : {})}
                className="block py-2 text-sm text-gray-700 hover:text-[var(--primary)] hover:underline"
              >
                {item.label}
              </a>
            ))}
          </div>
        </div>
      </div>
    </aside>
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
          <div className="flex items-center gap-4">
            <div className="relative" ref={landingNavRef}>
              <button
                type="button"
                onClick={(e) => { e.stopPropagation(); setLandingNavOpen((p) => !p); }}
                className="flex items-center gap-1 text-sm font-medium hover:underline"
                style={{ color: "var(--foreground)" }}
              >
                퀴즈 · Q&A · 생활 한국어
                <svg className={`w-4 h-4 transition-transform ${landingNavOpen ? "rotate-180" : ""}`} fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M19 9l-7 7-7-7" />
                </svg>
              </button>
              {landingNavOpen && (
                <div
                  className="absolute left-0 top-full mt-1 py-2 min-w-[180px] shadow-lg border z-50"
                  style={{ background: "var(--card-bg)", borderColor: "var(--border)", borderRadius: "var(--radius)" }}
                >
                  <button
                    type="button"
                    onClick={() => { setLandingNavOpen(false); setShowLanding(false); setActiveTab("quiz"); }}
                    className="block w-full text-left px-4 py-2.5 text-sm hover:bg-black/5 transition"
                    style={{ color: "var(--foreground)" }}
                  >
                    퀴즈 (퀴즈 센터)
                  </button>
                  <button
                    type="button"
                    onClick={() => { setLandingNavOpen(false); setShowLanding(false); setActiveTab("kotae"); }}
                    className="block w-full text-left px-4 py-2.5 text-sm hover:bg-black/5 transition"
                    style={{ color: "var(--foreground)" }}
                  >
                    Q&A (큐앤에이)
                  </button>
                  <button
                    type="button"
                    onClick={() => { setLandingNavOpen(false); setShowLanding(false); setActiveTab("dailykorean"); }}
                    className="block w-full text-left px-4 py-2.5 text-sm hover:bg-black/5 transition"
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
              onClick={() => setLandingNavOpen(true)}
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
              onClick={() => setShowQuizOverlay(true)}
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
              onClick={() => setLandingNavOpen(true)}
              className="landing-card overflow-hidden text-left h-full flex flex-col"
            >
              <div className="landing-card-header text-white" style={{ background: "var(--primary)", opacity: 0.9 }}>
                Q&A (큐앤에이)
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
              onClick={() => setLandingNavOpen(true)}
              className="landing-card overflow-hidden text-left h-full flex flex-col"
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

          <section className="flex flex-wrap gap-4 justify-center pt-4 border-t" style={{ borderColor: "var(--border)" }}>
            <a href="https://writing.mirinae.jp" target="_blank" rel="noopener noreferrer" className="flex items-center gap-2 px-5 py-3 rounded-lg border hover:border-[var(--primary)] transition" style={{ borderColor: "var(--border)", color: "var(--foreground)" }}>
              <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M15.232 5.232l3.536 3.536m-2.036-5.036a2.5 2.5 0 113.536 3.536L6.5 21.036H3v-3.572L16.732 3.732z" /></svg>
              作文 (작문)
            </a>
            <a href="https://ondoku.mirinae.jp" target="_blank" rel="noopener noreferrer" className="flex items-center gap-2 px-5 py-3 rounded-lg border hover:border-[var(--primary)] transition" style={{ borderColor: "var(--border)", color: "var(--foreground)" }}>
              <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M19 11a7 7 0 01-7 7m0 0a7 7 0 01-7-7m7 7v4m0 0V8m0 7a7 7 0 017-7" /></svg>
              発音 (발음)
            </a>
            <a href="https://quiz.mirinae.jp" target="_blank" rel="noopener noreferrer" className="flex items-center gap-2 px-5 py-3 rounded-lg border hover:border-[var(--primary)] transition" style={{ borderColor: "var(--border)", color: "var(--foreground)" }}>
              <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 6.253v13m0-13C10.832 5.477 9.246 5 7.5 5S4.168 5.477 3 6.253v13C4.168 18.477 5.754 18 7.5 18s3.332.477 4.5 1.253m0-13C13.168 5.477 14.754 5 16.5 5c1.747 0 3.332.477 4.5 1.253v13C19.832 18.477 18.247 18 16.5 18c-1.746 0-3.332.477-4.5 1.253" /></svg>
              初級 (기초)
            </a>
            <a href="https://mirinae.jp" target="_blank" rel="noopener noreferrer" className="flex items-center gap-2 px-5 py-3 rounded-lg border hover:border-[var(--primary)] transition" style={{ borderColor: "var(--border)", color: "var(--foreground)" }}>
              <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M13 7l5 5m0 0l-5 5m5-5H6" /></svg>
              上級 (고급)
            </a>
          </section>
        </main>

        {showQuizOverlay && quiz && (
          <div
            className="fixed inset-0 z-[9999] flex items-center justify-center p-4"
            aria-modal
            aria-labelledby="quiz-overlay-title"
          >
            <div
              className="absolute inset-0 bg-black/50"
              onClick={() => setShowQuizOverlay(false)}
              aria-hidden
            />
            <div className="relative w-full max-w-lg max-h-[90vh] overflow-y-auto bg-white rounded-xl shadow-2xl" style={{ borderRadius: "var(--radius)" }}>
              <div className="sticky top-0 flex justify-between items-center px-4 py-3 bg-white border-b z-10" style={{ borderColor: "var(--border)" }}>
                <span id="quiz-overlay-title" className="font-semibold" style={{ color: "var(--foreground)" }}>クイズ</span>
                <button
                  type="button"
                  onClick={() => setShowQuizOverlay(false)}
                  className="p-2 rounded-lg hover:bg-gray-100 text-gray-600"
                  aria-label="閉じる"
                >
                  <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M6 18L18 6M6 6l12 12" />
                  </svg>
                </button>
              </div>
              <div className="quiz-container p-4">
                <div className="quiz-meta mb-3">
                  <span className="quiz-counter">{currentIndex + 1} / {total}</span>
                </div>
                <p className="quiz-instruction">{quiz.question}</p>
                <div ref={japaneseRef} className="quiz-sentence quiz-japanese" style={{ position: "relative" }}>
                  {formatJapanese(japanese)}
                  <span
                    className="measure-span"
                    aria-hidden
                    style={{ position: "absolute", left: -9999, whiteSpace: "nowrap", visibility: "hidden", pointerEvents: "none" }}
                  >
                    {formatJapanese(japanese)}
                  </span>
                </div>
                <div className="quiz-sentence quiz-korean">
                  {quiz.koreanTemplate.split(BLANK).map((part, i) => (
                    <span key={i}>
                      {part.trim() === "." ? "" : part}
                      {i === 0 && (
                        <span className="blank" style={blankWidth != null ? { width: blankWidth, minWidth: blankWidth } : undefined} />
                      )}
                    </span>
                  ))}
                </div>
                <div className="quiz-options">
                  {options.map((option) => {
                    const isSelected = selectedAnswer === option.id;
                    const isCorrect = option.id === quiz.correctAnswer;
                    const showCorrectness = showResult && (isSelected || isCorrect);
                    const showMark = showCorrectness && (isCorrect || (isSelected && !isCorrect));
                    return (
                      <button
                        key={option.id}
                        className={`quiz-option ${showCorrectness ? "revealed" : ""} ${showCorrectness && isCorrect ? "correct" : ""} ${showCorrectness && isSelected && !isCorrect ? "wrong" : ""}`}
                        onClick={() => handleSelect(option.id)}
                        disabled={showResult}
                      >
                        <span className="option-number">{getOptionNumber(option.id)}</span>
                        <span className="option-text">{option.text}</span>
                        {showMark && <span className="option-mark" aria-hidden>{isCorrect ? "⭕" : "❌"}</span>}
                      </button>
                    );
                  })}
                </div>
                {showResult && (
                  <div className="quiz-result">
                    <div className={`result-badge ${selectedAnswer === quiz.correctAnswer ? "correct" : "wrong"}`}>
                      {selectedAnswer === quiz.correctAnswer ? "正解！" : "不正解"}
                    </div>
                    <div className="result-explanation">
                      <p style={{ whiteSpace: "pre-line" }}>{formatExplanation(explanation)}</p>
                      {quiz.vocabulary && quiz.vocabulary.length > 0 && (
                        <div className="vocabulary-list">
                          {quiz.vocabulary.map((v, i) => (
                            <div key={i} className="vocab-item"><strong>{v}</strong></div>
                          ))}
                        </div>
                      )}
                    </div>
                    <div className="result-actions">
                      <button type="button" className="btn-secondary" onClick={handleUndo}>解いてやり直す</button>
                      {currentIndex < total - 1 && (
                        <button className="btn-primary" onClick={handleNext}>次の問題へ</button>
                      )}
                    </div>
                  </div>
                )}
              </div>
              <div className="quiz-footer p-4 border-t" style={{ borderColor: "var(--border)" }}>
                <div className="progress-bar">
                  <div className="progress-fill" style={{ width: `${((currentIndex + (showResult ? 1 : 0)) / total) * 100}%` }} />
                </div>
              </div>
            </div>
          </div>
        )}

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
              className="fixed inset-0 z-[9998] bg-black/40 md:hidden"
              onClick={() => closeRightMenu()}
              aria-hidden
            />
            <aside
              className={`fixed right-0 top-0 z-[9999] h-full bg-white shadow-2xl overflow-y-auto md:hidden transition-all duration-300 ${
                rightSidebarExpanded ? "w-[90vw] max-w-[400px]" : "w-72 max-w-[85vw]"
              }`}
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
              <div className="bg-white rounded-xl shadow-sm border border-gray-200 overflow-hidden">
                <button type="button" onClick={() => { setActiveTab("quiz"); closeRightMenu(); }} className="w-full p-4 text-left">
                  <h3 className="font-bold text-gray-800 text-sm mb-3">クイズ</h3>
                  <span className="block w-full py-2.5 text-center text-sm font-medium rounded-xl bg-[var(--primary)] text-white">クイズを始める</span>
                </button>
              </div>
              <div className="bg-white rounded-xl shadow-sm border border-gray-200 overflow-hidden">
                <button type="button" onClick={() => handleExpandMenu("qa")} className="w-full p-4 text-left">
                  <h3 className="font-bold text-gray-800 text-sm mb-3">Q&A</h3>
                  <span className="block w-full py-2.5 text-center text-sm font-medium rounded-xl bg-[var(--primary)] text-white">Q&Aを見る</span>
                </button>
                {rightSidebarExpanded && expandedMenuType === "qa" && (
                  <div className="border-t border-gray-200 max-h-[240px] overflow-y-auto p-2">
                    {kotaeListLoading ? (
                      <p className="py-4 text-center text-gray-500 text-xs">読み込み中...</p>
                    ) : filteredKotae.length === 0 ? (
                      <p className="py-4 text-center text-gray-500 text-xs">該当なし</p>
                    ) : (
                      kotaePaginated.map((item) => (
                        <button key={item.id} type="button" onClick={() => { setActiveTab("kotae"); setExpandedKotaeId((p) => (p === item.id ? null : item.id)); closeRightMenu(); }} className="w-full text-left py-2.5 px-3 text-xs text-gray-700 hover:bg-[var(--primary)]/10 rounded-lg">
                          {item.title}
                        </button>
                      ))
                    )}
                    <button type="button" onClick={() => { setActiveTab("kotae"); closeRightMenu(); }} className="w-full mt-2 py-2 text-center text-xs font-medium text-[var(--primary)]">一覧で見る →</button>
                  </div>
                )}
              </div>
              <div className="bg-white rounded-xl shadow-sm border border-gray-200 overflow-hidden">
                <button type="button" onClick={() => handleExpandMenu("dailykorean")} className="w-full p-4 text-left">
                  <h3 className="font-bold text-gray-800 text-sm mb-3">生活韓国語</h3>
                  <span className="block w-full py-2.5 text-center text-sm font-medium rounded-xl bg-[var(--primary)] text-white">生活韓国語を見る</span>
                </button>
                {rightSidebarExpanded && expandedMenuType === "dailykorean" && (
                  <div className="border-t border-gray-200 max-h-[240px] overflow-y-auto p-2">
                    {seikatsuList.length === 0 ? (
                      <p className="py-4 text-center text-gray-500 text-xs">読み込み中...</p>
                    ) : (
                      <>
                        {seikatsuPaginated.map((title, i) => (
                          <button
                            key={i}
                            type="button"
                            onClick={() => { setActiveTab("dailykorean"); setDailyKoreanTitle(title); closeRightMenu(); }}
                            className="block w-full text-left py-2.5 px-3 text-xs text-gray-700 hover:bg-[var(--primary)]/10 rounded-lg"
                          >
                            {title}
                          </button>
                        ))}
                        {seikatsuList.length > SEIKATSU_PAGE_SIZE && (
                          <div className="flex justify-center gap-1 py-2">
                            <button type="button" onClick={() => setSeikatsuPage((p) => Math.max(0, p - 1))} disabled={seikatsuPage === 0} className="px-2 py-1 text-xs rounded border border-gray-300 disabled:opacity-40">前へ</button>
                            <span className="px-2 py-1 text-xs text-gray-600">{seikatsuPage + 1}/{seikatsuTotalPages}</span>
                            <button type="button" onClick={() => setSeikatsuPage((p) => Math.min(seikatsuTotalPages - 1, p + 1))} disabled={seikatsuPage >= seikatsuTotalPages - 1} className="px-2 py-1 text-xs rounded border border-gray-300 disabled:opacity-40">次へ</button>
                          </div>
                        )}
                        <button type="button" onClick={() => { setActiveTab("dailykorean"); setDailyKoreanTitle(null); closeRightMenu(); }} className="block w-full mt-2 py-2 text-center text-xs font-medium text-[var(--primary)]">一覧で見る →</button>
                      </>
                    )}
                  </div>
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
      <div className="flex-1 flex flex-col min-w-0 w-full max-w-4xl mx-auto md:px-4">
      <div className="flex-1 flex flex-col md:flex-row md:items-start md:justify-center md:gap-4 min-w-0 w-full">
        {desktopMenu}
        <div className="quiz-container w-full md:shrink-0">
        <div className="px-4 pt-4 pb-2 rounded-t-[20px] bg-white">
          <div className="grid grid-cols-4 gap-2">
            {roundMenuItems.map((item, i) => (
              <a
                key={item.label}
                href={item.href}
                {...(item.external ? { target: "_blank", rel: "noopener noreferrer" } : {})}
                className="flex items-center gap-2 px-3 py-2.5 rounded-full bg-white border border-gray-200 shadow-sm hover:shadow-md hover:border-gray-300 transition-all"
              >
                <span
                  className="flex-shrink-0 w-9 h-9 rounded-full flex items-center justify-center"
                  style={{ backgroundColor: `${menuColors[i % menuColors.length]}20`, color: menuColors[i % menuColors.length] }}
                >
                  {menuIcons[item.label]}
                </span>
                <span className="text-sm font-medium text-gray-800 truncate">{item.label}</span>
              </a>
            ))}
          </div>
        </div>
        <div className="flex items-center gap-2 p-3 border-b bg-gray-50" style={{ borderColor: "var(--border)" }}>
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
            onClick={() => setShowLanding(true)}
            className="shrink-0 flex h-10 w-10 items-center justify-center rounded-lg border text-gray-600 hover:bg-gray-50"
            style={{ borderColor: "var(--border)" }}
            aria-label="ホームへ"
          >
            <svg className="h-5 w-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M3 12l2-2m0 0l7-7 7 7M5 10v10a1 1 0 001 1h3m10-11l2 2m-2-2v10a1 1 0 01-1 1h-3m-6 0a1 1 0 001-1v-4a1 1 0 011-1h2a1 1 0 011 1v4a1 1 0 001 1m-6 0h6" />
            </svg>
          </button>
          <button
            type="button"
            onClick={() => setActiveTab("quiz")}
            className={`flex-1 py-2.5 px-3 text-sm font-bold rounded-lg transition ${
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
            onClick={() => setActiveTab("kotae")}
            className={`flex-1 py-2.5 px-3 text-sm font-bold rounded-lg transition ${
              activeTab === "kotae"
                ? "text-white"
                : "bg-white text-gray-600 border hover:border-[var(--primary)] hover:text-[var(--primary)]"
            }`}
            style={activeTab === "kotae" ? { background: "var(--primary)" } : { borderColor: "var(--border)" }}
          >
            Q&A
          </button>
          <button
            type="button"
            onClick={() => setActiveTab("dailykorean")}
            className={`flex-1 py-2.5 px-3 text-sm font-bold rounded-lg transition ${
              activeTab === "dailykorean"
                ? "text-white"
                : "bg-white text-gray-600 border hover:border-[var(--primary)] hover:text-[var(--primary)]"
            }`}
            style={activeTab === "dailykorean" ? { background: "var(--primary)" } : { borderColor: "var(--border)" }}
          >
            生活韓国語
          </button>
          <button
            type="button"
            onClick={() => setRightMenuOpen(true)}
            className="md:hidden shrink-0 flex h-10 w-10 items-center justify-center rounded-lg bg-white border border-gray-200 text-gray-600 hover:bg-gray-50"
            aria-label="コンテンツメニューを開く"
          >
            <svg className="h-5 w-5" fill="currentColor" viewBox="0 0 24 24">
              <circle cx="12" cy="6" r="1.5" />
              <circle cx="12" cy="12" r="1.5" />
              <circle cx="12" cy="18" r="1.5" />
            </svg>
          </button>
          <button
            type="button"
            onClick={() => setDesktopRightSidebarVisible((v) => !v)}
            className="hidden md:flex shrink-0 h-10 w-10 items-center justify-center rounded-lg bg-white border border-gray-200 text-gray-600 hover:bg-gray-50"
            aria-label="コンテンツメニューを開閉"
          >
            <svg className="h-5 w-5" fill="currentColor" viewBox="0 0 24 24">
              <circle cx="12" cy="6" r="1.5" />
              <circle cx="12" cy="12" r="1.5" />
              <circle cx="12" cy="18" r="1.5" />
            </svg>
          </button>
        </div>
        {activeTab === "dailykorean" ? (
          <div className="flex flex-col w-full min-h-[calc(100dvh-6rem)] md:min-h-[70vh] overflow-hidden">
            <iframe
              src={dailyKoreanTitle ? `/dailykorean?title=${encodeURIComponent(dailyKoreanTitle)}` : "/dailykorean"}
              title="生活韓国語"
              className="w-full flex-1 min-h-[500px] border-0"
              style={{ borderRadius: "0 0 var(--radius) var(--radius)" }}
            />
          </div>
        ) : activeTab === "kotae" ? (
          <div className="kotae-list flex flex-col max-h-[calc(100dvh-6rem)] md:max-h-[70vh] overflow-hidden">
            <div className="text-white shrink-0 px-6 pt-3 pb-4 border-b border-white/10" style={{ background: "var(--primary)" }}>
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
                      onClick={() =>
                        setExpandedKotaeId((prev) => (prev === item.id ? null : item.id))
                      }
                      className="w-full text-left py-3 px-4 text-gray-800 text-sm flex items-center justify-between gap-2"
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
                        <div className="max-h-[500px] overflow-y-auto p-4">
                          {kotaeLoading ? (
                            <p className="text-center text-gray-500 py-8">読み込み中...</p>
                          ) : kotaeError ? (
                            <p className="text-center text-red-500 py-4">{kotaeError}</p>
                          ) : kotaeContent?.html ? (
                            <div
                              className="kotae-blog-content text-gray-800"
                              dangerouslySetInnerHTML={{ __html: kotaeContent.html }}
                            />
                          ) : null}
                        </div>
                        {kotaeContent?.url && (
                          <a
                            href={kotaeContent.url}
                            target="_blank"
                            rel="noopener noreferrer"
                            className="block py-2 px-4 text-center text-xs text-[var(--primary)] hover:underline border-t border-gray-100"
                          >
                            ブログで続きを読む →
                          </a>
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
        <header className="quiz-header">
          <div className="relative">
            <h1 className="min-w-0 break-words text-center">ミリネのクイズで学ぶ韓国語</h1>
            <div className="hidden sm:block md:hidden shrink-0 absolute right-0 top-0">
              {isAdmin && !isLoggedIn ? (
                <Link
                  href="/admin"
                  className="px-3 py-1.5 bg-red-600 hover:bg-red-700 text-white text-xs font-medium rounded-lg transition-colors"
                >
                  管理者モードで接続中
                </Link>
              ) : isLoggedIn ? (
                <div className="flex flex-col items-end gap-1.5">
                  <div className="flex items-center gap-2">
                    <a
                      href="/profile"
                      className="text-white/95 text-sm hover:underline whitespace-nowrap"
                    >
                      マイページ
                    </a>
                    <span className="text-white/95 text-sm whitespace-nowrap">ログイン中</span>
                  </div>
                  <button
                    type="button"
                    onClick={() => setShowLogoutModal(true)}
                    className="text-white/90 text-sm hover:underline hover:text-white"
                  >
                    ログアウト
                  </button>
                </div>
              ) : (
                <button
                  type="button"
                  onClick={() => setShowLoginModal(true)}
                  className="text-white/90 text-sm hover:underline"
                >
                  ログイン
                </button>
              )}
            </div>
          </div>
          <div className="quiz-meta">
            <span className="quiz-counter">
              {currentIndex + 1} / {total}
            </span>
            {accuracyRate !== null && (
              <span className="quiz-accuracy">正解率 {accuracyRate}%</span>
            )}
          </div>
        </header>

        <main className="quiz-main">
          <p className="quiz-instruction">{quiz.question}</p>
          <div ref={japaneseRef} className="quiz-sentence quiz-japanese" style={{ position: "relative" }}>
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
          <div className="quiz-sentence quiz-korean">
            {quiz.koreanTemplate.split(BLANK).map((part, i) => (
              <span key={i}>
                {part.trim() === "." ? "" : part}
                {i === 0 && (
                  <span
                    className="blank"
                    style={blankWidth != null ? { width: blankWidth, minWidth: blankWidth } : undefined}
                  />
                )}
              </span>
            ))}
          </div>

          <div className="quiz-options">
            {options.map((option) => {
              const isSelected = selectedAnswer === option.id;
              const isCorrect = option.id === quiz.correctAnswer;
              const showCorrectness = showResult && (isSelected || isCorrect);
              const showMark = showCorrectness && (isCorrect || (isSelected && !isCorrect));

              return (
                <button
                  key={option.id}
                  className={`quiz-option ${showCorrectness ? "revealed" : ""} ${
                    showCorrectness && isCorrect ? "correct" : ""
                  } ${showCorrectness && isSelected && !isCorrect ? "wrong" : ""}`}
                  onClick={() => handleSelect(option.id)}
                  disabled={showResult}
                >
                  <span className="option-number">{getOptionNumber(option.id)}</span>
                  <span className="option-text">{option.text}</span>
                  {showMark && (
                    <span className="option-mark" aria-hidden>
                      {isCorrect ? "⭕" : "❌"}
                    </span>
                  )}
                </button>
              );
            })}
          </div>

          {showResult && (
            <div className="quiz-result">
              <div
                className={`result-badge ${
                  selectedAnswer === quiz.correctAnswer ? "correct" : "wrong"
                }`}
              >
                {selectedAnswer === quiz.correctAnswer ? "正解！" : "不正解"}
              </div>
              <div className="result-explanation">
                <p style={{ whiteSpace: "pre-line" }}>{formatExplanation(explanation)}</p>
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
              <div className="result-actions">
                <button type="button" className="btn-secondary" onClick={handleUndo}>
                  解いてやり直す
                </button>
                {currentIndex < total - 1 && (
                  <button className="btn-primary" onClick={handleNext}>
                    次の問題へ
                  </button>
                )}
              </div>
            </div>
          )}
        </main>

        <footer className="quiz-footer">
          <div className="progress-bar">
            <div
              className="progress-fill"
              style={{ width: `${((currentIndex + (showResult ? 1 : 0)) / total) * 100}%` }}
            />
          </div>
        </footer>
        </>
        )}
        </div>
        {rightSidebar}
      </div>
      </div>
      <LoginModal isOpen={showLoginModal} onClose={() => setShowLoginModal(false)} redirectPath="/" />
      <LogoutConfirmModal isOpen={showLogoutModal} onClose={() => setShowLogoutModal(false)} onConfirm={handleLogout} />
    </div>
  );
}
