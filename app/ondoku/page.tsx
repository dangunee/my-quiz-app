"use client";

import React, { useState, useEffect } from "react";
import Link from "next/link";
import { fetchWithAuth, getStoredToken } from "../../lib/auth";

const ONDOKU_HOST = "ondoku.mirinae.jp";

type User = {
  id: string;
  email: string;
  name?: string;
  username?: string;
};

function useOndokuBase() {
  const [base, setBase] = useState({
    adminPath: "/admin",
    redirectPath: "/ondoku",
    quizLink: "/",
  });
  useEffect(() => {
    if (typeof window !== "undefined") {
      const isOndoku = window.location.hostname === ONDOKU_HOST;
      setBase({
        adminPath: "/admin",
        redirectPath: isOndoku ? "/" : "/ondoku",
        quizLink: isOndoku ? "https://quiz.mirinae.jp" : "/",
      });
    }
  }, []);
  return base;
}

type TabId = "experience" | "writing";

const TABS: { id: TabId; label: string }[] = [
  { id: "experience", label: "音読トレーニング" },
  { id: "writing", label: "課題提出" },
];

const PERIOD_LABELS = ["1期", "2期", "3期", "4期", "5期", "6期", "7期", "8期"] as const;

import { ONDOKU_PERIOD_EXAMPLES } from "../data/ondoku-assignment-examples";

export default function OndokuPage() {
  const { redirectPath } = useOndokuBase();
  const [user, setUser] = useState<User | null>(null);
  const [activeTab, setActiveTab] = useState<TabId>("experience");
  const [menuOpen, setMenuOpen] = useState(false);
  const [examplePeriodTab, setExamplePeriodTab] = useState(0);
  const [expandedExampleId, setExpandedExampleId] = useState<number | null>(null);
  const [myPageData, setMyPageData] = useState<{
    name: string;
    period: number | null;
    submissions: {
      period_index: number;
      item_index: number;
      content: string;
      feedback?: string;
      corrected_content?: string;
      submitted_at: string;
      feedback_at?: string;
      completed_at?: string;
      status: string;
    }[];
  } | null>(null);
  const [myPageLoading, setMyPageLoading] = useState(false);
  const [myPageError, setMyPageError] = useState<string | null>(null);
  const [myPagePeriodTab, setMyPagePeriodTab] = useState(0);
  const [myPageContentModal, setMyPageContentModal] = useState<{
    type: "submit" | "correction";
    periodIndex: number;
    itemIndex: number;
    content: string;
    title?: string;
  } | null>(null);
  const [submittedKeys, setSubmittedKeys] = useState<Set<string>>(new Set());
  const [submissionsByKey, setSubmissionsByKey] = useState<Record<string, { content: string; submitted_at: string }>>({});
  const [showExampleSubmitModal, setShowExampleSubmitModal] = useState(false);
  const [exampleSubmitContent, setExampleSubmitContent] = useState("");
  const [selectedExample, setSelectedExample] = useState<{ id: number; title: string; periodIndex: number; itemIndex: number } | null>(null);

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
  }, []);

  useEffect(() => {
    if (activeTab !== "writing" || !user || !getStoredToken()) return;
    setMyPageLoading(true);
    setMyPageError(null);
    fetchWithAuth("/api/ondoku/mypage")
      .then((r) => r.json())
      .then((data) => {
        if (data.error && !data.approved) {
          setMyPageError(data.error);
          setMyPageData(null);
        } else if (data.approved) {
          setMyPageData({
            name: data.name || "",
            period: data.period ?? null,
            submissions: data.submissions || [],
          });
          setMyPageError(null);
        } else {
          setMyPageError(data.error || "読み込みに失敗しました");
          setMyPageData(null);
        }
      })
      .catch(() => {
        setMyPageError("読み込みに失敗しました");
        setMyPageData(null);
      })
      .finally(() => setMyPageLoading(false));
  }, [activeTab, user]);

  useEffect(() => {
    if (!user || !getStoredToken()) return;
    fetchWithAuth("/api/ondoku/submissions")
      .then((r) => r.json())
      .then((data) => {
        if (data.submitted) {
          setSubmittedKeys(new Set(data.submitted));
        }
        if (data.submissionsByKey) {
          setSubmissionsByKey(data.submissionsByKey);
        }
      })
      .catch(() => {});
  }, [user]);

  const menuLinks = [
    { label: "ログイン", href: "/login", external: false },
    { label: "クイズ", href: "https://quiz.mirinae.jp", external: true },
    { label: "作文トレ", href: "/writing", external: false },
    { label: "ホームページ", href: "https://mirinae.jp", external: true },
    { label: "申し込み", href: "https://mirinae.jp/trial.html?tab=tab02", external: true },
  ];

  const sidebarContent = (
    <nav className="space-y-0">
      {user ? (
        <>
          <span className="block py-2 text-sm text-gray-500 border-b border-[#e5dfd4]">ログイン中</span>
          <button
            type="button"
            onClick={() => {
              localStorage.removeItem("quiz_token");
              localStorage.removeItem("quiz_refresh_token");
              localStorage.removeItem("quiz_user");
              setMenuOpen(false);
              window.location.href = redirectPath;
            }}
            className="block w-full text-left py-3 text-gray-800 hover:text-red-600 border-b border-[#e5dfd4]"
          >
            ログアウト
          </button>
        </>
      ) : (
        <Link
          href={`/login?redirect=${encodeURIComponent(redirectPath)}`}
          className="block py-3 text-gray-800 hover:text-red-600 border-b border-[#e5dfd4]"
          onClick={() => setMenuOpen(false)}
        >
          ログイン
        </Link>
      )}
      {menuLinks.slice(1).map((item) => (
        <a
          key={item.href}
          href={item.href}
          {...(item.external ? { target: "_blank", rel: "noopener noreferrer" } : {})}
          className="block py-3 text-gray-800 hover:text-red-600 border-b border-[#e5dfd4] last:border-b-0"
          onClick={() => setMenuOpen(false)}
        >
          {item.label}
        </a>
      ))}
    </nav>
  );

  const handleExampleSubmitClick = (ex: { id: number; title: string }, periodIndex: number, itemIndex: number) => {
    setSelectedExample({ ...ex, periodIndex, itemIndex });
    setExampleSubmitContent("");
    setShowExampleSubmitModal(true);
  };

  const handleCloseExampleSubmitModal = () => {
    setShowExampleSubmitModal(false);
    setExampleSubmitContent("");
    setSelectedExample(null);
  };

  const handleOndokuSubmit = async () => {
    if (!selectedExample || !getStoredToken()) {
      alert("ログインが必要です。");
      return;
    }
    try {
      const res = await fetchWithAuth("/api/ondoku/submissions", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          period_index: selectedExample.periodIndex,
          item_index: selectedExample.itemIndex,
          content: exampleSubmitContent.trim() || "（録音ファイルをondoku@kaonnuri.comに送付済み）",
        }),
      });
      if (!res.ok) {
        const err = await res.json().catch(() => ({}));
        throw new Error(err.error || `提出に失敗しました (${res.status})`);
      }
      setSubmittedKeys((prev) => new Set([...prev, `${selectedExample.periodIndex}-${selectedExample.itemIndex}`]));
      setSubmissionsByKey((prev) => ({
        ...prev,
        [`${selectedExample.periodIndex}-${selectedExample.itemIndex}`]: {
          content: exampleSubmitContent.trim() || "（録音ファイル送付済み）",
          submitted_at: new Date().toISOString(),
        },
      }));
      handleCloseExampleSubmitModal();
    } catch (e) {
      alert(e instanceof Error ? e.message : "提出に失敗しました。");
    }
  };

  const mergedExamples = ONDOKU_PERIOD_EXAMPLES[examplePeriodTab] || [];

  return (
    <div className="min-h-screen flex flex-col bg-[#f8f6f1]">
      {menuOpen && (
        <>
          <div className="fixed inset-0 z-40 bg-black/30 md:hidden" onClick={() => setMenuOpen(false)} aria-hidden />
          <aside className="fixed left-0 top-0 z-50 h-full w-64 max-w-[85vw] bg-white shadow-xl md:hidden" style={{ animation: "slideIn 0.2s ease" }}>
            <div className="flex items-center justify-between border-b px-4 py-3">
              <span className="font-semibold text-gray-800">メニュー</span>
              <button type="button" onClick={() => setMenuOpen(false)} className="rounded p-2 text-gray-500 hover:bg-gray-100" aria-label="メニューを閉じる">
                <svg className="h-5 w-5" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M6 18L18 6M6 6l12 12" /></svg>
              </button>
            </div>
            <div className="p-4">{sidebarContent}</div>
          </aside>
        </>
      )}

      <header className="bg-[#1a4d2e] text-white py-4 md:py-6 px-4 md:px-6 shadow-lg relative">
        <div className="max-w-4xl md:max-w-[75rem] mx-auto flex items-center justify-center min-h-[2.5rem]">
          <button type="button" onClick={() => setMenuOpen(true)} className="md:hidden absolute left-4 shrink-0 h-10 w-10 flex items-center justify-center rounded-lg bg-white/20 text-white hover:bg-white/30" aria-label="メニューを開く">
            <svg className="h-5 w-5" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M4 6h16M4 12h16M4 18h16" /></svg>
          </button>
          <h1 className="text-2xl md:text-4xl font-bold tracking-wide text-center">メールで音読トレーニング</h1>
        </div>
      </header>

      <div className="flex flex-1 justify-center">
        <div className="flex flex-1 flex-col md:flex-row max-w-4xl md:max-w-[75rem] w-full">
          <aside className="hidden md:flex md:flex-col md:w-56 md:shrink-0 bg-[#f5f0e6] border-r border-[#e5dfd4]">
            <div className="px-4 py-4 border-b border-[#e5dfd4]">
              <span className="font-semibold text-gray-800">メニュー</span>
            </div>
            <div className="p-4 flex-1 overflow-y-auto">{sidebarContent}</div>
          </aside>

          <main className="flex-1 min-w-0 flex flex-col overflow-hidden">
            <div className="bg-white border-b border-[#e5dfd4] shadow-sm shrink-0">
              <nav className="flex overflow-x-auto px-4 md:px-6 py-2">
                {TABS.map((tab) => (
                  <button
                    key={tab.id}
                    onClick={() => setActiveTab(tab.id)}
                    className={`flex-1 min-w-0 py-3 px-2 font-medium text-sm whitespace-nowrap border-b-2 transition-colors ${activeTab === tab.id ? "border-[#1a4d2e] text-[#1a4d2e]" : "border-transparent text-gray-500 hover:text-gray-700 hover:border-gray-300"}`}
                  >
                    {tab.label}
                  </button>
                ))}
              </nav>
            </div>

            <div className="flex-1 overflow-auto px-0 py-4 pb-24 md:px-6 md:py-6 md:pb-6">
              {activeTab === "experience" && (
                <div className="max-w-3xl md:max-w-[52.75rem] w-full mx-auto">
                  <div className="bg-white rounded-none md:rounded-2xl border border-[#e5dfd4] shadow-sm overflow-hidden">
                    <div className="bg-[#1a4d2e] px-6 py-4">
                      <h2 className="text-lg md:text-xl font-bold text-white">メールで音読トレーニング</h2>
                      <p className="text-white/90 text-sm mt-1">音読添削 ＋ ネイティブ模範音声で発音・抑揚UP！会話力アップを図ります</p>
                    </div>
                    <div className="p-6 space-y-4">
                      <div className="overflow-hidden rounded-lg border border-gray-300">
                        <div className="px-4 py-2 bg-[#1e3a5f]">
                          <h3 className="font-semibold text-white text-sm">特徴</h3>
                        </div>
                        <div className="text-sm">
                          {[
                            { label: "①", content: "音読を通して声に出して言うのに自信が付きます" },
                            { label: "②", content: "課題をすることで、語彙・文型・表現 パターンを覚えます" },
                            { label: "③", content: "ネイティブ添削文と模範音声で受講生の問題点を改善します" },
                            { label: "④", content: "音読トレーニングで話すスピードも速くなり、会話力アップを図ります" },
                            { label: "⑤", content: "週１回ペースで１０週間レベルアップ出来ます" },
                          ].map((row) => (
                            <div key={row.label} className="flex gap-2 px-3 py-2.5 border-b border-gray-300 last:border-b-0 text-gray-700 text-xs md:text-sm">
                              <span className="text-[#1a4d2e] font-medium shrink-0">{row.label}</span>
                              <span>{row.content}</span>
                            </div>
                          ))}
                        </div>
                      </div>
                      <div className="overflow-hidden rounded-lg border border-gray-300">
                        <div className="px-4 py-2 bg-[#1e3a5f]">
                          <h3 className="font-semibold text-white text-sm">詳細</h3>
                        </div>
                        <div className="border-collapse text-sm">
                          {[
                            { label: "対象", content: "初中級 / 中上級 (レベルに合わせて選択可能)" },
                            { label: "目標", content: "❶会話パターンを覚える ❷発音・抑揚の矯正 ❸音読トレーニングで話すスピードも速くなり → 会話力が上がる事" },
                            { label: "授業の流れ", content: <>❶毎週月曜日：課題をメールにて送信 ❷課題の勉強、読みの練習後、スマホなどで録音 ❸翌週の月曜日21時までに録音ファイルを<a href="mailto:ondoku@kaonnuri.com" className="text-[#1a4d2e] hover:underline">ondoku@kaonnuri.com</a>に提出 ❹毎週金曜日：先生の解説文及び模範発音録音ファイルをメールにて送信</> },
                            { label: "日程", content: "4月3日(金)から10週間" },
                            { label: "教室", content: "オンライン" },
                            { label: "募集期間", content: "～4月1日(水)" },
                            { label: "テキスト", content: "ミリネ独自のテキスト(PDF)※事前にメールにてお送りします。" },
                          ].map((row, i) => (
                            <div key={row.label} className="flex flex-row border-b border-gray-300 last:border-b-0">
                              <div className="w-20 md:w-32 shrink-0 px-2 md:px-3 py-2.5 bg-gray-200 font-medium text-gray-800 border-r border-gray-300 text-xs md:text-sm">{row.label}</div>
                              <div className={`flex-1 min-w-0 px-2 md:px-3 py-2.5 text-gray-700 text-xs md:text-sm ${i % 2 === 0 ? "bg-white" : "bg-gray-100"}`}>{row.content}</div>
                            </div>
                          ))}
                        </div>
                      </div>
                      <div className="pt-4">
                        <div className="overflow-hidden rounded-lg border border-gray-300">
                          <div className="px-4 py-2 bg-[#1e3a5f]">
                            <h3 className="font-semibold text-white text-sm">まずは体験から!</h3>
                          </div>
                          <div className="border-collapse text-sm">
                            {[
                              { label: "体験申込の締切", content: "3月19日(木)" },
                              { label: "体験課題送信日", content: "3月20日(金)" },
                              { label: "体験添削送信日", content: "3月27日(金)" },
                              { label: "当講座開始日", content: "4月3日(金)" },
                            ].map((row, i) => (
                              <div key={row.label} className="flex flex-row border-b border-gray-300 last:border-b-0">
                                <div className="w-20 md:w-32 shrink-0 px-2 md:px-3 py-2.5 bg-gray-200 font-medium text-gray-800 border-r border-gray-300 text-xs md:text-sm">{row.label}</div>
                                <div className={`flex-1 min-w-0 px-2 md:px-3 py-2.5 text-gray-700 text-xs md:text-sm font-semibold ${i % 2 === 0 ? "bg-white" : "bg-gray-100"}`}>{row.content}</div>
                              </div>
                            ))}
                            <div className="px-2 md:px-3 py-2.5 bg-[#1e3a5f] text-white text-xs md:text-sm font-semibold text-center">初中級: 1,800円 / 中上級: 2,300円</div>
                          </div>
                        </div>
                      </div>
                      <div className="pt-4">
                        <a href="https://mirinae.jp/trial.html?tab=tab02" className="block w-full py-3 bg-[#1a4d2e] text-white text-center font-medium rounded-lg hover:bg-[#2d6a4a]">体験申込▼講座申込</a>
                      </div>
                      <div className="pt-4 border-t-2 border-[#c45c26]">
                        <h3 className="font-semibold text-[#c45c26] text-base md:text-lg mb-2">授業料</h3>
                        <div className="border border-gray-300 rounded-b-lg overflow-hidden">
                          <table className="w-full border-collapse text-sm">
                            <thead>
                              <tr className="bg-[#87ceeb]">
                                <th className="py-2 px-4 text-left font-medium text-gray-800 border-b-2 border-[#1e3a5f]">レベル</th>
                                <th className="py-2 px-4 text-left font-medium text-gray-800 border-b-2 border-[#1e3a5f]">1回当たり</th>
                                <th className="py-2 px-4 text-left font-medium text-gray-800 border-b-2 border-[#1e3a5f]">回数</th>
                                <th className="py-2 px-4 text-left font-medium text-gray-800 border-b-2 border-[#1e3a5f]">税込</th>
                              </tr>
                            </thead>
                            <tbody>
                              <tr className="bg-white"><td className="py-3 px-4 font-semibold text-gray-800">初中級</td><td className="py-3 px-4">2,180円</td><td className="py-3 px-4">10回</td><td className="py-3 px-4">23,980円</td></tr>
                              <tr className="bg-gray-50"><td className="py-3 px-4 font-semibold text-gray-800">中級-上級</td><td className="py-3 px-4">2,720円</td><td className="py-3 px-4">10回</td><td className="py-3 px-4">29,920円</td></tr>
                            </tbody>
                          </table>
                        </div>
                      </div>
                    </div>
                  </div>
                </div>
              )}

              {activeTab === "writing" && (
                <div className="px-4 md:px-0 mx-auto max-w-3xl w-full">
                  <div className="rounded-xl border border-[#e5dfd4] p-4 md:p-6 bg-white shadow-sm">
                    <div className="mb-6 md:mb-8">
                      <h2 className="text-lg md:text-xl font-bold text-gray-800 mb-4">課題例掲示板</h2>
                      <div className="bg-white rounded-xl border border-[#e5dfd4] shadow-sm overflow-hidden">
                        {user && (
                          <div className="px-4 py-2 bg-[#f0fdf4] border-b border-[#e5dfd4] text-sm">
                            <span className="text-gray-600">ログイン中：</span>
                            <span className="font-medium text-gray-800">{user.name || user.username || user.email || "-"}様</span>
                          </div>
                        )}
                        <div className="flex border-b border-[#e5dfd4]">
                          {PERIOD_LABELS.map((label, i) => (
                            <button
                              key={label}
                              type="button"
                              onClick={() => {
                                setExamplePeriodTab(i);
                                setExpandedExampleId(null);
                              }}
                              className={`flex-1 min-w-0 px-4 py-3 font-medium text-sm ${examplePeriodTab === i ? "bg-[#1a4d2e] text-white" : "bg-[#faf8f5] text-gray-700 hover:bg-[#f5f0e6]"}`}
                            >
                              {label}
                            </button>
                          ))}
                        </div>
                        <div className="px-4 md:px-5 py-3 bg-[#faf8f5] border-b border-[#e5dfd4] font-semibold text-gray-800 text-sm md:text-base">音読課題例（10件）</div>
                        <div className="divide-y divide-[#e5dfd4]">
                          {mergedExamples.map((ex, idx) => {
                            const exId = examplePeriodTab * 10 + idx + 1;
                            const key = `${examplePeriodTab}-${idx}`;
                            const isSubmitted = submittedKeys.has(key);
                            return (
                              <div key={exId}>
                                <button
                                  type="button"
                                  onClick={() => setExpandedExampleId(expandedExampleId === exId ? null : exId)}
                                  className="w-full px-4 md:px-5 py-3 hover:bg-[#faf8f5] flex flex-col sm:flex-row sm:items-center sm:justify-between gap-2 text-left"
                                >
                                  <div className="flex items-center gap-3">
                                    <span className="text-gray-500 text-xs w-4 inline-block">{expandedExampleId === exId ? "▼" : "▶"}</span>
                                    <span className={`font-medium text-gray-800 ${isSubmitted ? "underline" : ""}`}>{ex.title}</span>
                                  </div>
                                </button>
                                {expandedExampleId === exId && ex.modelContent && (
                                  <div className="px-4 md:px-5 pb-4 pt-0 border-t border-[#e5dfd4] bg-[#fafbfc]">
                                    <div className="mt-3 flex flex-col gap-3">
                                      <div className="p-4 rounded-xl bg-white border border-[#e5dfd4] text-sm space-y-4">
                                        <p className="text-gray-600 font-medium">テーマ：{ex.modelContent.theme}</p>
                                        <p className="text-gray-800 leading-relaxed text-lg font-medium">{ex.modelContent.sentence}</p>
                                        {ex.modelContent.pronunciationNote && (
                                          <p className="text-gray-600 font-medium">※{ex.modelContent.pronunciationNote}</p>
                                        )}
                                        {ex.modelContent.patterns?.length > 0 && (
                                          <div className="space-y-2 pt-2">
                                            {ex.modelContent.patterns.map((p, i) => (
                                              <div key={i} className="text-gray-700">
                                                <p className="font-medium text-gray-800">○ {p.pattern}</p>
                                                <p className="text-gray-600 pl-2">{p.example}</p>
                                              </div>
                                            ))}
                                          </div>
                                        )}
                                      </div>
                                      <p className="text-sm text-gray-600">録音ファイルを<a href="mailto:ondoku@kaonnuri.com" className="text-[#1a4d2e] hover:underline">ondoku@kaonnuri.com</a>に送付後、下記で提出完了としてください。</p>
                                      {isSubmitted ? (
                                        <>
                                          <div className="p-4 rounded-xl bg-[#f0fdf4] border border-[#86efac]">
                                            <p className="text-sm font-medium text-[#166534] mb-2">提出済み</p>
                                            <pre className="whitespace-pre-wrap text-gray-800 text-sm leading-relaxed font-sans">{submissionsByKey[key]?.content || ""}</pre>
                                          </div>
                                          <button type="button" onClick={() => document.getElementById("mypage-section")?.scrollIntoView({ behavior: "smooth" })} className="w-full py-3 px-6 bg-[#4ade80] hover:bg-[#22c55e] text-gray-800 font-medium rounded-xl shadow-md">マイページで確認</button>
                                        </>
                                      ) : user ? (
                                        <button onClick={() => handleExampleSubmitClick({ id: exId, title: ex.title }, examplePeriodTab, idx)} className="w-full py-3 px-6 bg-[#1a4d2e] hover:bg-[#2d6a4a] text-white font-medium rounded-xl shadow-md">課題提出</button>
                                      ) : (
                                        <div className="p-4 rounded-xl bg-[#fef3c7] border border-[#fcd34d]">
                                          <p className="text-gray-700 text-sm mb-2">課題提出はログイン後にご利用いただけます。</p>
                                          <Link href={`/login?redirect=${encodeURIComponent(redirectPath)}`} className="inline-block px-4 py-2 bg-[#1a4d2e] hover:bg-[#2d6a4a] text-white font-medium rounded-lg text-sm">ログイン</Link>
                                        </div>
                                      )}
                                    </div>
                                  </div>
                                )}
                              </div>
                            );
                          })}
                        </div>
                      </div>
                    </div>

                    <h2 id="mypage-section" className="text-lg md:text-xl font-bold text-gray-800 mb-4 md:mb-6">マイページ</h2>

                    {!user ? (
                      <div className="p-6 rounded-xl border border-[#e5dfd4] bg-[#faf8f5] text-center">
                        <p className="text-gray-600 mb-4">マイページはログイン後にご利用いただけます。</p>
                        <Link href={`/login?redirect=${encodeURIComponent(redirectPath)}`} className="inline-block px-6 py-2.5 bg-[#1a4d2e] hover:bg-[#2d6a4a] text-white font-medium rounded-xl">ログイン</Link>
                      </div>
                    ) : myPageLoading ? (
                      <div className="p-6 rounded-xl border border-[#e5dfd4] bg-[#faf8f5] text-center text-gray-600">読み込み中...</div>
                    ) : myPageError ? (
                      <div className="p-6 rounded-xl border border-[#e5dfd4] bg-[#faf8f5] text-center">
                        <p className="text-gray-600">{myPageError}</p>
                      </div>
                    ) : myPageData ? (
                      <div className="space-y-4">
                        <div className="p-4 rounded-xl bg-[#f0fdf4] border border-[#86efac]">
                          <h3 className="font-bold text-gray-800 mb-3">添削状況進行表</h3>
                          {(() => {
                            const periodSubs = myPageData.submissions.filter((s) => s.period_index === myPagePeriodTab);
                            const total = 10;
                            const submitted = periodSubs.length;
                            const unsubmitted = total - submitted;
                            const pending = periodSubs.filter((s) => s.status === "pending").length;
                            const completed = periodSubs.filter((s) => s.status === "completed").length;
                            return (
                              <>
                                <div className="flex flex-wrap gap-4 mb-3">
                                  <span className="text-sm"><span className="text-gray-500">未提出:</span> <strong>{unsubmitted}</strong></span>
                                  <span className="text-sm"><span className="text-gray-500">未添削:</span> <strong className="text-amber-600">{pending}</strong></span>
                                  <span className="text-sm"><span className="text-gray-500">完了:</span> <strong className="text-green-600">{completed}</strong></span>
                                </div>
                                <div className="h-3 bg-gray-200 rounded-full overflow-hidden flex">
                                  <div className="bg-gray-400" style={{ width: `${(unsubmitted / total) * 100}%` }} title="未提出" />
                                  <div className="bg-amber-400" style={{ width: `${(pending / total) * 100}%` }} title="未添削" />
                                  <div className="bg-green-500" style={{ width: `${(completed / total) * 100}%` }} title="完了" />
                                </div>
                              </>
                            );
                          })()}
                        </div>
                        <div className="flex flex-wrap gap-4 p-4 rounded-xl bg-[#faf8f5] border border-[#e5dfd4]">
                          <div>
                            <span className="text-gray-500 text-sm">名前</span>
                            <p className="font-medium text-gray-800">{myPageData.name || "-"}様</p>
                          </div>
                          <div>
                            <span className="text-gray-500 text-sm">期目</span>
                            <p className="font-medium text-gray-800">{myPageData.period != null ? `${myPageData.period}期` : "-"}</p>
                          </div>
                        </div>
                        <div className="overflow-x-auto rounded-xl border border-[#e5dfd4] bg-white">
                          <div className="flex border-b border-[#e5dfd4]">
                            {PERIOD_LABELS.map((label, i) => (
                              <button key={label} type="button" onClick={() => setMyPagePeriodTab(i)} className={`flex-1 min-w-0 px-4 py-3 font-medium text-sm ${myPagePeriodTab === i ? "bg-[#1a4d2e] text-white" : "bg-[#faf8f5] text-gray-700 hover:bg-[#f5f0e6]"}`}>
                                {label}
                              </button>
                            ))}
                          </div>
                          <table className="w-full min-w-[600px]">
                            <thead>
                              <tr className="bg-[#f5f0e6] text-gray-700 text-sm">
                                <th className="text-left py-2 px-3 font-medium w-24"> </th>
                                {[0, 1, 2, 3, 4, 5, 6, 7, 8, 9].map((i) => (
                                  <th key={i} className="text-center py-2 px-2 font-medium">第{i + 1}回</th>
                                ))}
                              </tr>
                            </thead>
                            <tbody>
                              <tr className="border-t border-[#e5dfd4]">
                                <td className="py-2 px-3 bg-[#faf8f5] font-medium text-gray-700 text-sm">提出日</td>
                                {[0, 1, 2, 3, 4, 5, 6, 7, 8, 9].map((itemIdx) => {
                                  const row = myPageData.submissions.find((s) => s.period_index === myPagePeriodTab && s.item_index === itemIdx);
                                  const dateStr = row?.submitted_at ? new Date(row.submitted_at).toLocaleDateString("ja-JP", { month: "numeric", day: "numeric" }) : null;
                                  return (
                                    <td key={itemIdx} className="py-2 px-2 text-center border-l border-[#e5dfd4]">
                                      {dateStr ? (
                                        <button
                                          type="button"
                                          onClick={() => setMyPageContentModal({ type: "submit", periodIndex: myPagePeriodTab, itemIndex: itemIdx, content: row!.content, title: ONDOKU_PERIOD_EXAMPLES[myPagePeriodTab]?.[itemIdx]?.title })}
                                          className="text-[#1a4d2e] hover:underline font-medium"
                                        >
                                          {dateStr}
                                        </button>
                                      ) : (
                                        <span className="text-red-600 font-medium">未提出</span>
                                      )}
                                    </td>
                                  );
                                })}
                              </tr>
                              <tr className="border-t border-[#e5dfd4]">
                                <td className="py-2 px-3 bg-[#faf8f5] font-medium text-gray-700 text-sm">添削日</td>
                                {[0, 1, 2, 3, 4, 5, 6, 7, 8, 9].map((itemIdx) => {
                                  const row = myPageData.submissions.find((s) => s.period_index === myPagePeriodTab && s.item_index === itemIdx);
                                  const hasCorrection = row && (row.corrected_content || row.feedback) && (row.status === "completed");
                                  const dateStr = hasCorrection && (row?.completed_at || row?.feedback_at) ? new Date(row.completed_at || row.feedback_at!).toLocaleDateString("ja-JP", { month: "numeric", day: "numeric" }) : null;
                                  const ex = ONDOKU_PERIOD_EXAMPLES[myPagePeriodTab]?.[itemIdx];
                                  if (dateStr && hasCorrection) {
                                    return (
                                      <td key={itemIdx} className="py-2 px-2 text-center border-l border-[#e5dfd4]">
                                        <button
                                          type="button"
                                          onClick={() => setMyPageContentModal({ type: "correction", periodIndex: myPagePeriodTab, itemIndex: itemIdx, content: (row!.corrected_content || row!.content || "") + (row!.feedback ? `\n\n【添削】\n${row!.feedback}` : ""), title: ex?.title })}
                                          className="text-[#1a4d2e] hover:underline font-medium"
                                        >
                                          {dateStr}
                                        </button>
                                      </td>
                                    );
                                  }
                                  return (
                                    <td key={itemIdx} className="py-2 px-2 text-center border-l border-[#e5dfd4]">
                                      <span className="text-gray-400">-</span>
                                    </td>
                                  );
                                })}
                              </tr>
                            </tbody>
                          </table>
                        </div>
                      </div>
                    ) : null}
                  </div>
                </div>
              )}
            </div>
          </main>
        </div>
      </div>

      {myPageContentModal && (
        <div className="fixed inset-0 bg-black/50 flex items-center justify-center z-50 p-4">
          <div className="bg-white rounded-2xl shadow-xl max-w-2xl w-full max-h-[90vh] overflow-hidden flex flex-col">
            <div className="relative px-4 sm:px-6 py-4 shrink-0 border-b border-gray-200">
              <h3 className="text-lg font-bold text-gray-800 text-center pr-14">
                {myPageContentModal.type === "submit" ? "提出内容" : "添削結果"}
                {myPageContentModal.title ? ` - ${myPageContentModal.title}` : ""}
              </h3>
              <button onClick={() => setMyPageContentModal(null)} className="absolute right-4 top-4 text-gray-500 hover:text-gray-700 font-medium shrink-0">閉じる</button>
            </div>
            <div className="flex-1 overflow-y-auto p-4 sm:p-6">
              <pre className="whitespace-pre-wrap text-gray-800 text-sm leading-relaxed font-sans">{myPageContentModal.content || "（内容なし）"}</pre>
            </div>
          </div>
        </div>
      )}

      {showExampleSubmitModal && selectedExample && (
        <div className="fixed inset-0 bg-black/50 flex items-center justify-center z-50 p-4">
          <div className="bg-white rounded-2xl shadow-xl max-w-2xl w-full max-h-[90vh] overflow-hidden flex flex-col">
            <div className="relative px-4 sm:px-6 py-4 shrink-0 border-b border-gray-200">
              <h3 className="text-lg font-bold text-gray-800 text-center pr-14">課題提出 - {selectedExample.title}</h3>
              <button onClick={handleCloseExampleSubmitModal} className="absolute right-4 top-4 text-gray-500 hover:text-gray-700 font-medium shrink-0">閉じる</button>
            </div>
            <div className="flex-1 overflow-y-auto p-4 sm:p-6 space-y-4">
              <div className="p-4 rounded-xl bg-[#faf8f5] border border-[#e5dfd4] text-sm">
                <p className="text-gray-600 mb-2">録音ファイルを<a href="mailto:ondoku@kaonnuri.com" className="text-[#1a4d2e] hover:underline">ondoku@kaonnuri.com</a>に送付してください。</p>
                <p className="text-gray-600 mb-4">送付後、下記に送付日時やメモを記入して「提出する」をクリックしてください。</p>
              </div>
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-2">送付メモ（任意）</label>
                <textarea
                  value={exampleSubmitContent}
                  onChange={(e) => setExampleSubmitContent(e.target.value)}
                  placeholder="例：2024年1月15日 送付、または録音ファイルのURLなど"
                  className="w-full min-h-[120px] p-4 border border-gray-200 rounded-xl resize-y focus:ring-2 focus:ring-[#1a4d2e] focus:border-transparent"
                  autoFocus
                />
              </div>
            </div>
            <div className="px-4 sm:px-6 py-4 flex justify-end shrink-0 border-t border-gray-200">
              <button onClick={handleOndokuSubmit} className="px-6 py-2.5 bg-[#86efac] hover:bg-[#4ade80] text-gray-800 font-medium rounded-xl">提出する</button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}
