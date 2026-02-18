"use client";

import { useState, useEffect, useRef } from "react";
import { QUIZZES } from "./quiz-data";
import { KOTAE_LIST } from "./kotae-data";

const BLANK = "_________________________";
const FREE_QUIZ_LIMIT = 10;

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
  const [blankWidth, setBlankWidth] = useState<number | null>(null);
  const [hasPaid, setHasPaid] = useState(false);
  const [showPaywall, setShowPaywall] = useState(false);
  const [checkoutLoading, setCheckoutLoading] = useState(false);
  const [activeTab, setActiveTab] = useState<"quiz" | "kotae">("quiz");
  const [kotaeSearch, setKotaeSearch] = useState("");
  const [kotaePage, setKotaePage] = useState(0);
  const [expandedKotaeUrl, setExpandedKotaeUrl] = useState<string | null>(null);
  const japaneseRef = useRef<HTMLDivElement>(null);

  const filteredKotae = kotaeSearch.trim()
    ? KOTAE_LIST.filter((item) =>
        item.title.toLowerCase().includes(kotaeSearch.trim().toLowerCase())
      )
    : KOTAE_LIST;

  const KOTAE_PAGE_SIZE = 20;
  const kotaeTotalPages = Math.ceil(filteredKotae.length / KOTAE_PAGE_SIZE) || 1;
  const kotaePaginated = filteredKotae.slice(
    kotaePage * KOTAE_PAGE_SIZE,
    (kotaePage + 1) * KOTAE_PAGE_SIZE
  );

  useEffect(() => {
    setKotaePage(0);
  }, [kotaeSearch]);

  useEffect(() => {
    setExpandedKotaeUrl(null);
  }, [kotaePage, kotaeSearch]);

  useEffect(() => {
    const shuffled = shuffle(
      QUIZZES.map((q) => ({
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

  const menuLinks = [
    { label: "ログイン", href: "/login", external: false },
    { label: "ホームページ", href: "https://mirinae.jp", external: true },
    { label: "個人レッスン", href: "https://mirinae.jp/kojin.html?tab=tab01", external: true },
    { label: "発音講座", href: "https://mirinae.jp/kaiwa.html?tab=tab03", external: true },
    { label: "会話クラス", href: "https://mirinae.jp/kaiwa.html?tab=tab01", external: true },
    { label: "音読クラス", href: "https://mirinae.jp/kaiwa.html?tab=tab02", external: true },
    { label: "集中講座", href: "https://mirinae.jp/syutyu.html?tab=tab02", external: true },
    { label: "申し込み", href: "https://mirinae.jp/trial.html?tab=tab01", external: true },
  ];

  const navLinks = (
    <div className="space-y-0">
      {isLoggedIn ? (
        <>
          <a
            href="/profile"
            target="_blank"
            rel="noopener noreferrer"
            className="block py-3 text-gray-800 hover:text-red-600 border-b"
            onClick={() => setMenuOpen(false)}
          >
            マイページ
          </a>
          <span className="block py-2 text-sm text-gray-500 border-b">ログイン中</span>
          <button
            type="button"
            onClick={() => {
              localStorage.removeItem("quiz_token");
              localStorage.removeItem("quiz_user");
              setIsLoggedIn(false);
              setMenuOpen(false);
            }}
            className="block w-full text-left py-3 text-gray-800 hover:text-red-600 border-b"
          >
            ログアウト
          </button>
        </>
      ) : (
        <a
          href="/login"
          target="_blank"
          rel="noopener noreferrer"
          className="block py-3 text-gray-800 hover:text-red-600 border-b"
          onClick={() => setMenuOpen(false)}
        >
          ログイン
        </a>
      )}
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

  const rightMenu = (
    <aside className="hidden md:flex md:flex-col md:w-56 md:shrink-0 md:bg-white md:rounded-2xl md:shadow-lg md:border md:border-gray-200 md:overflow-hidden">
      <div className="px-4 py-4 border-b border-gray-200">
        <span className="font-semibold text-gray-800">メニュー</span>
      </div>
      <nav className="flex-1 overflow-y-auto p-4">{navLinks}</nav>
    </aside>
  );

  return (
    <div className="app-wrapper">
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
        </>
      )}
      <div className="flex-1 flex flex-col min-w-0 w-full max-w-4xl md:px-4">
      <div className="flex-1 flex flex-col md:flex-row md:items-center md:justify-center md:gap-4 min-w-0">
        <div className="quiz-container w-full md:shrink-0">
        <div className="flex gap-2 p-3 border-b border-gray-200 bg-gray-50 rounded-t-[20px]">
          <button
            type="button"
            onClick={() => setActiveTab("quiz")}
            className={`flex-1 py-2.5 px-4 text-sm font-bold rounded-lg transition ${
              activeTab === "quiz"
                ? "bg-[#0ea5e9] text-white shadow"
                : "bg-white text-gray-600 border border-gray-200 hover:border-[#0ea5e9] hover:text-[#0ea5e9]"
            }`}
          >
            クイズ
          </button>
          <button
            type="button"
            onClick={() => setActiveTab("kotae")}
            className={`flex-1 py-2.5 px-4 text-sm font-bold rounded-lg transition ${
              activeTab === "kotae"
                ? "bg-[#0ea5e9] text-white shadow"
                : "bg-white text-gray-600 border border-gray-200 hover:border-[#0ea5e9] hover:text-[#0ea5e9]"
            }`}
          >
            Q&A
          </button>
        </div>
        {activeTab === "kotae" ? (
          <div className="kotae-list flex flex-col max-h-[70vh] overflow-hidden">
            <div className="bg-[#2d5a4a] text-white shrink-0 px-6 pt-3 pb-4 border-b border-white/10">
              <h2 className="text-center font-semibold text-base mb-3">韓国語の微妙なニュアンス Q&A</h2>
              <input
                type="search"
                placeholder="質問を検索... (例: 違い、使い方)"
                value={kotaeSearch}
                onChange={(e) => setKotaeSearch(e.target.value)}
                className="w-full px-4 py-2.5 text-sm border-0 rounded-lg bg-white/95 text-gray-800 placeholder:text-gray-500 focus:outline-none focus:ring-2 focus:ring-white/50"
              />
              <p className="text-sm text-white/90 mt-2">{filteredKotae.length}件の質問</p>
            </div>
            <ul className="flex-1 overflow-y-auto min-h-0">
              {filteredKotae.length === 0 ? (
                <li className="py-8 px-4 text-center text-gray-500 text-sm">
                  該当する質問がありません
                </li>
              ) : (
                kotaePaginated.map((item, i) => (
                  <li key={i} className="border-b border-gray-200 last:border-b-0">
                    <button
                      type="button"
                      onClick={() =>
                        setExpandedKotaeUrl((prev) => (prev === item.url ? null : item.url))
                      }
                      className="w-full text-left py-3 px-4 text-gray-800 text-sm flex items-center justify-between gap-2"
                    >
                      <span>{item.title}</span>
                      <span
                        className={`shrink-0 text-gray-400 transition-transform ${
                          expandedKotaeUrl === item.url ? "rotate-180" : ""
                        }`}
                      >
                        ▼
                      </span>
                    </button>
                    {expandedKotaeUrl === item.url && (
                      <div className="border-t border-gray-200 bg-white overflow-hidden">
                        <div className="relative h-[500px] overflow-hidden">
                          <iframe
                            src={item.url}
                            title={item.title}
                            className="absolute left-0 w-full h-[700px] border-0 -top-[200px]"
                            sandbox="allow-scripts allow-same-origin"
                          />
                        </div>
                        <a
                          href={item.url}
                          target="_blank"
                          rel="noopener noreferrer"
                          className="block py-2 px-4 text-center text-xs text-[#0ea5e9] hover:underline border-t border-gray-100"
                        >
                          元のページで開く →
                        </a>
                      </div>
                    )}
                  </li>
                ))
              )}
            </ul>
            {filteredKotae.length > KOTAE_PAGE_SIZE && (
              <div className="flex items-center justify-center gap-2 py-3 px-4 border-t border-gray-200 shrink-0">
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
              <h1 className="shrink-0 whitespace-nowrap">クイズで学ぶ韓国語</h1>
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
          <div className="flex justify-between items-start gap-4">
            <div className="flex items-center gap-2 min-w-0">
              <button
                type="button"
                onClick={() => setMenuOpen(true)}
                className="shrink-0 flex h-9 w-9 items-center justify-center rounded-lg bg-white/20 text-white md:hidden"
                aria-label="メニューを開く"
              >
                <svg className="h-5 w-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M4 6h16M4 12h16M4 18h16" />
                </svg>
              </button>
              <h1 className="shrink-0 whitespace-nowrap">クイズで学ぶ韓国語</h1>
            </div>
            <div className="hidden sm:block md:hidden shrink-0">
              {isLoggedIn ? (
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
                    onClick={() => {
                      localStorage.removeItem("quiz_token");
                      localStorage.removeItem("quiz_user");
                      setIsLoggedIn(false);
                    }}
                    className="text-white/90 text-sm hover:underline hover:text-white"
                  >
                    ログアウト
                  </button>
                </div>
              ) : (
                <a
                  href="/login"
                  className="text-white/90 text-sm hover:underline"
                >
                  ログイン
                </a>
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
                {part}
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
              {currentIndex < total - 1 && (
                <div className="result-actions">
                  <button className="btn-primary" onClick={handleNext}>
                    次の問題へ
                  </button>
                </div>
              )}
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
        {rightMenu}
      </div>
      </div>
    </div>
  );
}
