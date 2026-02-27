"use client";

import { useState, useEffect, useRef } from "react";
import Link from "next/link";
import { useRouter, usePathname, useSearchParams } from "next/navigation";
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

interface QuizClientProps {
  initialShowLanding?: boolean;
}

export default function QuizClient({ initialShowLanding = true }: QuizClientProps) {
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
  const [activeTab, setActiveTab] = useState<"quiz" | "kotae" | "dailylife">("quiz");
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
  const [expandedKotaeId, setExpandedKotaeId] = useState<number | null>(null);
  const [kotaeContent, setKotaeContent] = useState<{ html: string; url: string } | null>(null);
  const [kotaeLoading, setKotaeLoading] = useState(false);
  const [kotaeError, setKotaeError] = useState<string | null>(null);
  const [showLoginModal, setShowLoginModal] = useState(false);
  const [showLogoutModal, setShowLogoutModal] = useState(false);
  const [isAdmin, setIsAdmin] = useState(false);
  const [adminAuthKey, setAdminAuthKey] = useState<string | null>(null);
  const japaneseRef = useRef<HTMLDivElement>(null);

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

  const handleStartFromLanding = (tab: "quiz" | "kotae" | "dailylife") => {
    if (pathname === "/main.html") {
      router.push(`/?tab=${tab}`);
    } else {
      setShowLanding(false);
      setActiveTab(tab);
    }
  };

  useEffect(() => {
    const tab = searchParams.get("tab");
    if (tab === "quiz" || tab === "kotae" || tab === "dailylife") {
      setActiveTab(tab);
      setShowLanding(false);
    }
  }, [searchParams]);

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

  useEffect(() => {
    setExpandedKotaeId(null);
    setKotaeContent(null);
    setKotaeError(null);
  }, [kotaePage, kotaeSearch]);

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
    { label: "生活韓国語", href: "/dailylife", external: false },
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
                    onClick={() => { setLandingNavDropdownOpen(false); handleStartFromLanding("kotae"); }}
                    className="block w-full text-left px-4 py-2.5 text-sm hover:bg-[var(--primary)]/10 transition"
                    style={{ color: "var(--foreground)" }}
                  >
                    Q&A (큐앤에이)
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
              onClick={() => handleStartFromLanding("kotae")}
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
              <div className="bg-white rounded-xl shadow-sm border border-gray-200 overflow-hidden">
                <button type="button" onClick={() => { setActiveTab("quiz"); router.replace("/"); closeRightMenu(); }} className="w-full p-4 text-left">
                  <h3 className="font-bold text-gray-800 text-sm mb-3">クイズ</h3>
                  <span className="block w-full py-2.5 text-center text-sm font-medium rounded-xl bg-[var(--primary)] text-white">クイズを始める</span>
                </button>
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
        <div className="flex items-center gap-2 p-3 bg-gray-50">
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
            onClick={() => { setActiveTab("quiz"); router.replace("/"); }}
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
            onClick={() => { setActiveTab("kotae"); router.replace("/?tab=kotae"); }}
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
            onClick={() => { setActiveTab("dailylife"); router.replace("/?tab=dailylife"); }}
            className={`flex-1 py-2.5 px-3 text-sm font-bold rounded-lg transition ${
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
        {activeTab === "kotae" ? (
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
        ) : activeTab === "dailylife" ? (
          <div className="kotae-list flex flex-col max-h-[calc(100dvh-6rem)] md:max-h-[70vh] overflow-hidden">
            <div className="text-white shrink-0 px-6 pt-3 pb-4 border-b border-white/10" style={{ background: "var(--primary)" }}>
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
                      className="w-full text-left py-3 px-4 text-gray-800 text-sm flex items-center justify-between gap-2"
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
                        <div className="max-h-[500px] overflow-y-auto p-4">
                          {seikatsuLoading ? (
                            <p className="text-center text-gray-500 py-8">読み込み中...</p>
                          ) : seikatsuError ? (
                            <p className="text-center text-red-500 py-4">{seikatsuError}</p>
                          ) : seikatsuContent?.html ? (
                            <div
                              className="kotae-blog-content text-gray-800"
                              dangerouslySetInnerHTML={{ __html: seikatsuContent.html }}
                            />
                          ) : null}
                        </div>
                        {seikatsuContent?.url && (
                          <a
                            href={seikatsuContent.url}
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
        <header className="quiz-header">
          <div className="relative">
            <h1 className="min-w-0 break-words text-center">ミリネのクイズで学ぶ韓国語</h1>
            <input
              type="search"
              placeholder="問題を検索... (例: 日本語、韓国語、単語)"
              value={quizSearch}
              onChange={(e) => setQuizSearch(e.target.value)}
              className="w-full mt-3 px-4 py-2.5 text-sm border-0 rounded-lg bg-white/95 text-gray-800 placeholder:text-gray-500 focus:outline-none focus:ring-2 focus:ring-white/50"
            />
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
          <div className="quiz-meta flex items-center gap-3 flex-nowrap">
            <span className="quiz-counter whitespace-nowrap">{total}問</span>
            <span className="quiz-counter whitespace-nowrap">{currentIndex + 1} / {total}</span>
            {accuracyRate !== null && (
              <span className="quiz-accuracy whitespace-nowrap">正解率 {accuracyRate}%</span>
            )}
          </div>
        </header>

        <main className="quiz-main">
          {!quiz ? (
            <p className="py-12 text-center text-gray-500">該当する問題がありません</p>
          ) : (
          <>
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
            {(ov?.koreanTemplate ?? quiz.koreanTemplate).split(BLANK).map((part, i) => (
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

          {isAdmin && !isLoggedIn && quiz && (
            <div className="mb-4 flex justify-end">
              <Link
                href={`/admin?tab=quiz&quiz=${quiz.id}`}
                className="inline-flex items-center gap-2 px-4 py-2 text-sm font-medium rounded-lg border border-red-500 text-red-600 hover:bg-red-50 transition"
              >
                <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M11 5H6a2 2 0 00-2 2v11a2 2 0 002 2h11a2 2 0 002-2v-5m-1.414-9.414a2 2 0 112.828 2.828L11.828 15H9v-2.828l8.586-8.586z" />
                </svg>
                この問題を編集
              </Link>
            </div>
          )}

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
        <section className="flex flex-nowrap gap-3 justify-center items-center py-4 px-4 border-t shrink-0 overflow-x-auto" style={{ borderColor: "var(--border)", backgroundColor: "var(--background)" }}>
          <a href="https://writing.mirinae.jp" target="_blank" rel="noopener noreferrer" className="flex items-center gap-2 px-4 py-2.5 rounded-lg border hover:border-[var(--primary)] transition shrink-0" style={{ borderColor: "var(--border)", color: "var(--foreground)" }}>
            <svg className="w-5 h-5 shrink-0" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M15.232 5.232l3.536 3.536m-2.036-5.036a2.5 2.5 0 113.536 3.536L6.5 21.036H3v-3.572L16.732 3.732z" /></svg>
            作文
          </a>
          <a href="https://ondoku.mirinae.jp" target="_blank" rel="noopener noreferrer" className="flex items-center gap-2 px-4 py-2.5 rounded-lg border hover:border-[var(--primary)] transition shrink-0" style={{ borderColor: "var(--border)", color: "var(--foreground)" }}>
            <svg className="w-5 h-5 shrink-0" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M19 11a7 7 0 01-7 7m0 0a7 7 0 01-7-7m7 7v4m0 0V8m0 7a7 7 0 017-7" /></svg>
            音読
          </a>
          <a href="/main.html" className="flex items-center justify-center w-10 h-10 rounded-lg border hover:border-[var(--primary)] transition shrink-0" style={{ borderColor: "var(--border)", color: "var(--foreground)" }} aria-label="ホームページ">
            <svg className="w-5 h-5 shrink-0" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M3 12l2-2m0 0l7-7 7 7M5 10v10a1 1 0 001 1h3m10-11l2 2m-2-2v10a1 1 0 01-1 1h-3m-6 0a1 1 0 001-1v-4a1 1 0 011-1h2a1 1 0 011 1v4a1 1 0 001 1m-6 0h6" /></svg>
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
