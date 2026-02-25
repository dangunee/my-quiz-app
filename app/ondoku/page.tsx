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

const PERIOD_LABELS = ["1期", "2期", "3期", "4期"] as const;
const ALL_PERIODS = [0, 1, 2, 3] as const; // 1期, 2期, 3期, 4期 (both levels)

const ONDOKU_COMMON_INSTRUCTION = `【音読トレーニングの方法】

1．例文の把握：まず、課題を日本語訳して意味を把握します。

2．例文を見ながら模範音声を聞いて繰り返し音読10回、スムーズになるまで増やしてもいいです。記録シートの作成をお勧めします。

3．模範音声を聞いて例文を見ないで音読10回⇒録音して送ります。

4．次週添削が来たら模範抑揚シートを参考し、発音と抑揚がができていないところを集中的に練習します。シャドーイングの練習15回で終わりです。

「お願い」
録音の際に冒頭にお名前、何回目の課題かをおっしゃってください。
例)　第4回　田中直美　１．～
また、可能な方は添付ファイル名に「4田中」などお名前を明記していただくと大変助かります。
ご協力お願いいたします。

【録音注意事項】
1．録音ファイルはパソコンで再生可能なファイルでお願いします。（.mp3など）ご自分で再生可能か確認後、送るようにお願いします。

2．例文はまとめて1つのファイルにお願いします。番号を言ってからハングルの例文を録音してください。
たくさん練習して間違いのないように録音できればいいですが、
途中で間違った場合もそのまま続けて番号を言って録音してください。
例)　1．겨울이 가까워지면.... (間違い、少し間を取って）1. 겨울이 가까워지면서 해가 짧아졌어요.`;

const ONDOKU_1KAI_INSTRUCTION = `初中級通信音読の第1回課題をお送りいたします。
模範録音を先にお送りしますので、参考にして練習なさってください。
よろしくお願いします。

※十分に練習していただけるように2回目の課題からは締め切りの１週間前に送信する予定です。1月12日（月）に第2回目の課題（1月19日締め切り）送信がありますので、ご確認いただけると幸いです。

締切：1/12(月）21時までに録音ファイルをこのメールの返信に送ってください。
締切を過ぎるとチェックが難しくなるので、締切厳守お願い致します。

ご不明な点等ございましたら、このメールの返信でお問い合せ下さい。

よろしくお願いいたします。`;

import { ONDOKU_PERIOD_EXAMPLES } from "../data/ondoku-assignment-examples";

export default function OndokuPage() {
  const { redirectPath } = useOndokuBase();
  const [user, setUser] = useState<User | null>(null);
  const [activeTab, setActiveTab] = useState<TabId>("experience");
  const [menuOpen, setMenuOpen] = useState(false);
  const [exampleLevelTab, setExampleLevelTab] = useState<"chujokyu" | "chuujokyu">("chujokyu");
  const [examplePeriodTab, setExamplePeriodTab] = useState(0);
  const [expandedExampleId, setExpandedExampleId] = useState<number | null>(null);
  const [myPageData, setMyPageData] = useState<{
    name: string;
    period: number | null;
    submissions: {
      period_index: number;
      item_index: number;
      content: string;
      audio_url?: string;
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
  const [myPageLevelTab, setMyPageLevelTab] = useState<"chujokyu" | "chuujokyu">("chujokyu");
  const [myPagePeriodTab, setMyPagePeriodTab] = useState(0);
  const [myPageContentModal, setMyPageContentModal] = useState<{
    type: "submit" | "correction";
    periodIndex: number;
    itemIndex: number;
    content: string;
    audio_url?: string;
    title?: string;
  } | null>(null);
  const [submittedKeys, setSubmittedKeys] = useState<Set<string>>(new Set());
  const [submissionsByKey, setSubmissionsByKey] = useState<Record<string, { content: string; audio_url?: string; submitted_at: string }>>({});
  const [showExampleSubmitModal, setShowExampleSubmitModal] = useState(false);
  const [exampleSubmitContent, setExampleSubmitContent] = useState("");
  const [exampleSubmitAudioFile, setExampleSubmitAudioFile] = useState<File | null>(null);
  const [exampleSubmitUploading, setExampleSubmitUploading] = useState(false);
  const [selectedExample, setSelectedExample] = useState<{ id: number; title: string; periodIndex: number; itemIndex: number } | null>(null);
  const [showTrialModal, setShowTrialModal] = useState(false);
  const [trialActiveTab, setTrialActiveTab] = useState<"trial" | "course">("trial");
  const [trialForm, setTrialForm] = useState({
    name: "",
    furigana: "",
    koreanLevel: "選択してください",
    email: "",
  });
  const [trialSubmitting, setTrialSubmitting] = useState(false);
  const [trialSuccess, setTrialSuccess] = useState(false);
  const [trialError, setTrialError] = useState<string | null>(null);
  const [levelDetailTab, setLevelDetailTab] = useState<"chujokyu" | "chuujokyu">("chujokyu");

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

  const handleExampleSubmitClick = (ex: { id: number; title: string }, periodIndex: number, itemIndex: number, existingContent?: string) => {
    setSelectedExample({ ...ex, periodIndex, itemIndex });
    setExampleSubmitContent(existingContent ?? "");
    setShowExampleSubmitModal(true);
  };

  const handleCloseExampleSubmitModal = () => {
    setShowExampleSubmitModal(false);
    setExampleSubmitContent("");
    setExampleSubmitAudioFile(null);
    setSelectedExample(null);
  };

  const KOREAN_LEVELS = ["選択してください", "入門", "初級", "初中級", "中級", "中上級", "上級"];

  const handleTrialSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setTrialSubmitting(true);
    setTrialError(null);
    try {
      const subjectPrefix = trialActiveTab === "course" ? "講座申込" : "体験申込";
      const title = trialActiveTab === "trial" ? "体験レッスン" : "講座の申し込み";
      const payload = {
        _subject: `${subjectPrefix}（音読アプリ）: ${title}`,
        _replyto: trialForm.email,
        タイトル: title,
        お名前: trialForm.name,
        ふりがな: trialForm.furigana,
        韓国語レベル: trialForm.koreanLevel === "選択してください" ? "" : trialForm.koreanLevel,
        メールアドレス: trialForm.email,
      };
      const res = await fetch("https://formsubmit.co/ajax/mirinae@kaonnuri.com", {
        method: "POST",
        headers: { "Content-Type": "application/json", Accept: "application/json" },
        body: JSON.stringify(payload),
      });
      const data = await res.json();
      if (res.ok && data.success !== false && data.success !== "false") {
        setTrialSuccess(true);
      } else {
        setTrialError(data.message || data.error || "送信に失敗しました");
      }
    } catch {
      setTrialError("送信に失敗しました");
    } finally {
      setTrialSubmitting(false);
    }
  };

  const handleOndokuSubmit = async () => {
    if (!selectedExample || !getStoredToken()) {
      alert("ログインが必要です。");
      return;
    }
    if (!exampleSubmitAudioFile && !exampleSubmitContent.trim()) {
      alert("音声ファイルを選択するか、メモを入力してください。");
      return;
    }
    setExampleSubmitUploading(true);
    try {
      let audioUrl: string | undefined;
      if (exampleSubmitAudioFile) {
        const formData = new FormData();
        formData.append("file", exampleSubmitAudioFile);
        formData.append("period_index", String(selectedExample.periodIndex));
        formData.append("item_index", String(selectedExample.itemIndex));
        const uploadRes = await fetchWithAuth("/api/ondoku/upload", {
          method: "POST",
          body: formData,
        });
        if (!uploadRes.ok) {
          const err = await uploadRes.json().catch(() => ({}));
          throw new Error(err.error || "音声ファイルのアップロードに失敗しました");
        }
        const uploadData = await uploadRes.json();
        audioUrl = uploadData.url;
      }
      const key = `${selectedExample.periodIndex}-${selectedExample.itemIndex}`;
      const audioUrlToSend = audioUrl ?? submissionsByKey[key]?.audio_url;
      const res = await fetchWithAuth("/api/ondoku/submissions", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          period_index: selectedExample.periodIndex,
          item_index: selectedExample.itemIndex,
          content: exampleSubmitContent.trim() || (audioUrlToSend ? "（音声ファイル提出済み）" : "（録音ファイル送付済み）"),
          audio_url: audioUrlToSend,
        }),
      });
      if (!res.ok) {
        const err = await res.json().catch(() => ({}));
        throw new Error(err.error || `提出に失敗しました (${res.status})`);
      }
      setSubmittedKeys((prev) => new Set([...prev, key]));
      setSubmissionsByKey((prev) => ({
        ...prev,
        [key]: {
          content: exampleSubmitContent.trim() || (audioUrlToSend ? "（音声ファイル提出済み）" : "（録音ファイル送付済み）"),
          audio_url: audioUrlToSend,
          submitted_at: new Date().toISOString(),
        },
      }));
      handleCloseExampleSubmitModal();
    } catch (e) {
      alert(e instanceof Error ? e.message : "提出に失敗しました。");
    } finally {
      setExampleSubmitUploading(false);
    }
  };

  const mergedExamples = ONDOKU_PERIOD_EXAMPLES[examplePeriodTab] || [];

  return (
    <div className="min-h-screen flex flex-col bg-[#e8f0f5]">
      {/* 배경 패턴 */}
      <div className="fixed inset-0 bg-[#e8f0f5] opacity-100 pointer-events-none" aria-hidden>
        <svg className="absolute inset-0 w-full h-full opacity-30" xmlns="http://www.w3.org/2000/svg">
          <defs>
            <pattern id="grid" width="24" height="24" patternUnits="userSpaceOnUse">
              <circle cx="1" cy="1" r="0.5" fill="#1e3a5f" />
              <circle cx="13" cy="13" r="0.5" fill="#1e3a5f" />
            </pattern>
          </defs>
          <rect width="100%" height="100%" fill="url(#grid)" />
        </svg>
      </div>

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

      <header className="relative bg-white border-b border-gray-200 py-4 md:py-5 px-4 md:px-6 shadow-sm">
        <div className="max-w-4xl md:max-w-[75rem] mx-auto flex items-center justify-center min-h-[2.5rem]">
          <button type="button" onClick={() => setMenuOpen(true)} className="md:hidden absolute left-4 shrink-0 h-10 w-10 flex items-center justify-center rounded-lg bg-gray-100 text-gray-700 hover:bg-gray-200" aria-label="メニューを開く">
            <svg className="h-5 w-5" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M4 6h16M4 12h16M4 18h16" /></svg>
          </button>
          <h1 className="text-xl md:text-2xl font-bold text-gray-800 tracking-wide text-center">オンラインで音読トレーニング</h1>
        </div>
      </header>

      <div className="relative flex flex-1 justify-center">
        <div className="flex flex-1 flex-col md:flex-row max-w-4xl md:max-w-[75rem] w-full">
          <aside className="hidden md:flex md:flex-col md:w-56 md:shrink-0 bg-white/80 border-r border-gray-200">
            <div className="px-4 py-4 border-b border-gray-200">
              <span className="font-semibold text-gray-800">メニュー</span>
            </div>
            <div className="p-4 flex-1 overflow-y-auto">{sidebarContent}</div>
          </aside>

          <main className="flex-1 min-w-0 flex flex-col overflow-hidden">
            <div className="bg-white border-b border-gray-200 shadow-sm shrink-0">
              <nav className="flex overflow-x-auto px-4 md:px-6 py-0">
                {TABS.map((tab) => (
                  <button
                    key={tab.id}
                    onClick={() => setActiveTab(tab.id)}
                    className={`flex-1 min-w-0 py-3 px-4 font-medium text-sm whitespace-nowrap border-b-2 transition-colors ${activeTab === tab.id ? "border-[#1e3a5f] text-[#1e3a5f] bg-gray-100" : "border-transparent text-gray-500 hover:text-gray-700 hover:bg-gray-50"}`}
                  >
                    {tab.label}
                  </button>
                ))}
              </nav>
            </div>

            <div className="flex-1 overflow-auto px-0 py-4 pb-24 md:px-6 md:py-6 md:pb-6">
              {activeTab === "experience" && (
                <div className="max-w-3xl md:max-w-[52.75rem] w-full mx-auto">
                  <div className="bg-white rounded-lg border-t-4 border-t-[#1e3a5f] border border-gray-200 shadow-md overflow-hidden">
                    <div className="bg-[#1a4d2e] px-6 py-5">
                      <h2 className="text-lg md:text-xl font-bold text-white">オンラインで音読トレーニング</h2>
                      <p className="text-white/95 text-sm mt-1">音読添削 ＋ ネイティブ模範音声で発音・抑揚UP！会話力アップを図ります</p>
                    </div>
                    <div className="p-6 space-y-0">
                      <div className="overflow-hidden">
                        <div className="px-4 py-2.5 bg-[#1e3a5f]">
                          <h3 className="font-semibold text-white text-sm">特徴</h3>
                        </div>
                        <div className="bg-white text-sm divide-y divide-gray-200">
                          {[
                            { label: "◎", content: "音読を通して声に出して言うのに自信が付きます" },
                            { label: "①", content: "課題をすることで、語彙・文型・表現 パターンを覚えます" },
                            { label: "③", content: "ネイティブ添削文と模範音声で受講生の問題点を改善します" },
                            { label: "④", content: "音読トレーニングで話すスピードも速くなり、会話力アップを図ります" },
                            { label: "⑤", content: "週１回ペースで１０週間レベルアップ出来ます" },
                          ].map((row) => (
                            <div key={row.label} className="flex gap-3 px-4 py-3 text-gray-700">
                              <span className="text-[#1e3a5f] font-medium shrink-0">{row.label}</span>
                              <span>{row.content}</span>
                            </div>
                          ))}
                        </div>
                      </div>
                      <div className="mt-4 px-4 py-4 bg-gray-50 rounded-lg border border-gray-200 text-sm text-gray-700 space-y-4">
                        <h3 className="font-semibold text-[#1e3a5f] text-base">授業について</h3>
                        <div>
                          <p className="font-medium text-[#1e3a5f] mb-1">★音読とは?</p>
                          <p>音読とは、文字を声に出して読むことです。日々、語彙・文法・表現・発音など多くの知識をインプットしているのに、会話の場面ではなかなかアウトプットできない…そんな経験はありませんか？音読は、アウトプットの練習に最適。実際の会話で話せない・聞き取れないといった悩みを解消する近道です。</p>
                        </div>
                        <div>
                          <p className="font-bold text-[#1e3a5f] mb-1">3ヶ月で上達! ご自宅で発音矯正&音読レッスン!</p>
                          <p>通学が難しくても、韓国語で会話がしたい方へ。会話には語彙・文法の基礎が不可欠。そして、覚えた表現は正しい発音・抑揚で練習してこそ、相手に伝わります。</p>
                        </div>
                        <div>
                          <p className="font-medium text-[#1e3a5f] mb-1">≪語彙・文型・表現 パターンを覚え + 発音・抑揚を自然に≫</p>
                          <p>この2点を重視し、ご自宅で会話練習ができる講座を作りました。ミリネが厳選した課題文をしっかり音読して身につければ、リスニング・会話力・韓国語力の向上は間違いありません。</p>
                        </div>
                        <div>
                          <p className="font-medium text-[#1e3a5f] mb-1">【音読トレーニングの方法】</p>
                          <ul className="space-y-2 list-none">
                            <li>❶ 文章の把握：まず、課題を日本語に訳して意味を把握します。</li>
                            <li>❷ 文章を見ながら音読15回、スムーズに言えるようになるまで回数は調整してください。記録シートの作成をお勧めします。</li>
                            <li>❸ 文章を見ないで音をたよりに音読15回（次週にネイティブの録音ファイルをお送りします）</li>
                            <li>❹ シャドーイングの練習15回</li>
                          </ul>
                        </div>
                      </div>
                      <div className="overflow-hidden mt-4">
                        <div className="px-4 py-2.5 bg-[#1e3a5f]">
                          <h3 className="font-semibold text-white text-sm">詳細</h3>
                        </div>
                        <div className="bg-white text-sm">
                          {[
                            { label: "対象", content: "初中級 / 中上級 (レベルに合わせて選択可能)" },
                            { label: "目標", content: <>❶会話パターンを覚える<br />❷発音・抑揚の矯正<br />❸音読トレーニングで話すスピードも速くなり → 会話力が上がる事</> },
                            { label: "授業の流れ", content: <>❶毎週月曜日：課題をメールにて送信<br />❷課題の勉強、読みの練習後、スマホなどで録音<br />❸翌週の月曜日21時までに録音ファイルを<a href="mailto:ondoku@kaonnuri.com" className="text-[#1e3a5f] hover:underline font-medium">ondoku@kaonnuri.com</a>に提出<br />❹毎週金曜日：先生の解説文及び模範発音録音ファイルをメールにて送信</> },
                            { label: "日程", content: "4月3日(金)から10週間" },
                            { label: "教室", content: "オンライン" },
                            { label: "募集期間", content: "～4月1日(水)" },
                            { label: "テキスト", content: "ミリネ独自のテキスト(PDF)※事前にメールにてお送りします。" },
                          ].map((row, i) => (
                            <div key={row.label} className={`flex flex-row border-b border-gray-300 last:border-b-0 ${i % 2 === 0 ? "bg-white" : "bg-gray-50"}`}>
                              <div className="w-24 md:w-28 shrink-0 px-3 py-2.5 bg-gray-200 font-medium text-gray-800 border-r border-gray-300 text-xs md:text-sm">{row.label}</div>
                              <div className="flex-1 min-w-0 px-3 py-2.5 text-gray-700 text-xs md:text-sm">{row.content}</div>
                            </div>
                          ))}
                        </div>
                      </div>
                      <div className="mt-4 overflow-hidden border border-gray-200 rounded-lg">
                        <div className="flex border-b border-gray-200">
                          <button
                            type="button"
                            onClick={() => setLevelDetailTab("chujokyu")}
                            className={`flex-1 px-4 py-3 text-sm font-medium ${levelDetailTab === "chujokyu" ? "bg-[#1e3a5f] text-white" : "bg-gray-100 text-gray-700 hover:bg-gray-200"}`}
                          >
                            初中級
                          </button>
                          <button
                            type="button"
                            onClick={() => setLevelDetailTab("chuujokyu")}
                            className={`flex-1 px-4 py-3 text-sm font-medium border-l border-gray-200 ${levelDetailTab === "chuujokyu" ? "bg-[#1e3a5f] text-white" : "bg-gray-100 text-gray-700 hover:bg-gray-200"}`}
                          >
                            中上級
                          </button>
                        </div>
                        <div className="p-4 md:p-5 bg-white text-sm text-gray-700">
                          {levelDetailTab === "chujokyu" ? (
                            <div className="space-y-5">
                              <div>
                                <h4 className="font-bold text-[#1e3a5f] text-base mb-2 border-b-2 border-red-500 pb-1 inline-block">初中級</h4>
                                <p className="mt-2">1回につき、8個の課題が出ます。全10回コースで会話に必要な文型、表現をたくさん覚えられます。</p>
                                <p className="mt-1 text-gray-600">(9回目と10回目は、1-8回目で実施した内容からの出題となります。9・10回目で復習することで、発音の改善を実感できます。)</p>
                              </div>
                              <div>
                                <h4 className="font-semibold text-gray-800 mb-3">課題</h4>
                                <ul className="space-y-4">
                                  <li>
                                    <p className="font-medium">① <code className="bg-gray-100 px-1 rounded">-아/어지다</code>：形容詞の自然な変化を表す</p>
                                    <p className="mt-1 text-gray-600">例) 날씨가 좋아졌어요, 얼굴이 예뻐졌어요.</p>
                                    <p className="mt-1">課題：겨울이 가까워지면서 해가 짧아지고 추워졌어요。</p>
                                    <p className="mt-1 text-blue-600">※発音ポイント：複合母音、二重バッチム、濃音、激音</p>
                                  </li>
                                  <li>
                                    <p className="font-medium">② <code className="bg-gray-100 px-1 rounded">-(으)ㄹ 줄 알다</code>：(習って)することができる、する方法を知っている</p>
                                    <p className="mt-1 text-gray-600">例) 수영할 줄 알아요?</p>
                                    <p className="mt-1">課題：한국 사람들은 모두 김치를 담글 줄 알아요?</p>
                                    <p className="mt-1 text-blue-600">※発音ポイント：ㄹの発音、連音</p>
                                  </li>
                                  <li>
                                    <p className="font-medium">③ <code className="bg-gray-100 px-1 rounded">-(으)ㄹ 줄 모르다</code>：(習って)できない、する方法を知らない</p>
                                    <p className="mt-1 text-gray-600">例) 저는 영어를 할 줄 몰라요。</p>
                                    <p className="mt-1">課題：저는 면허가 없어요。運転할 줄 모릅니다。</p>
                                    <p className="mt-1 text-blue-600">※発音ポイント：ㅎの発音、二重バッチム、鼻音化</p>
                                  </li>
                                </ul>
                              </div>
                            </div>
                          ) : (
                            <div className="flex justify-center">
                              <img src="/ondoku-chuujokyu.png" alt="中級～上級 音読トレーニングの詳細" className="max-w-full h-auto" />
                            </div>
                          )}
                        </div>
                      </div>
                      <div id="trial-form-section" className="mt-6 pt-6 border-t-2 border-[#8b6914]">
                        <div className="mb-6 py-5 px-6 bg-[#faf6eb] border-b-2 border-[#8b6914] rounded-lg">
                          <p className="text-center text-sm md:text-base text-[#5c4a1a] mb-1">お試し１回料金</p>
                          <p className="text-center text-lg md:text-xl font-bold text-[#5c4a1a]">
                            初中級: 1,800円 / 中上級: 2,300円
                          </p>
                        </div>
                        <div className="bg-white rounded-xl border border-gray-200 overflow-hidden">
                          <div className="flex">
                            <button
                              type="button"
                              onClick={() => {
                                if (trialActiveTab === "trial" && showTrialModal) {
                                  setShowTrialModal(false);
                                } else {
                                  setTrialActiveTab("trial");
                                  setShowTrialModal(true);
                                  setTrialForm({ name: "", furigana: "", koreanLevel: "選択してください", email: "" });
                                  setTrialSuccess(false);
                                  setTrialError(null);
                                }
                              }}
                              className={`flex-1 px-6 py-4 font-medium flex items-center justify-between ${trialActiveTab === "trial" ? "bg-[#1e3a5f] text-white" : "bg-gray-100 text-gray-700 hover:bg-gray-200"}`}
                            >
                              <span>体験申込</span>
                              {trialActiveTab === "trial" && <span className="text-white/80">{showTrialModal ? "▲" : "▼"}</span>}
                            </button>
                            <button
                              type="button"
                              onClick={() => {
                                if (trialActiveTab === "course" && showTrialModal) {
                                  setShowTrialModal(false);
                                } else {
                                  setTrialActiveTab("course");
                                  setShowTrialModal(true);
                                  setTrialForm({ name: "", furigana: "", koreanLevel: "選択してください", email: "" });
                                  setTrialSuccess(false);
                                  setTrialError(null);
                                }
                              }}
                              className={`flex-1 px-6 py-4 font-medium flex items-center justify-between border-l border-gray-200 ${trialActiveTab === "course" ? "bg-[#1e3a5f] text-white" : "bg-gray-100 text-gray-700 hover:bg-gray-200"}`}
                            >
                              <span>講座申込</span>
                              {trialActiveTab === "course" && <span className="text-white/80">{showTrialModal ? "▲" : "▼"}</span>}
                            </button>
                          </div>
                          {showTrialModal && (
                            <div className="p-6 border-t border-gray-200 relative">
                              {trialError && (
                                <div className="mb-4 p-3 bg-red-50 border border-red-200 rounded-lg text-red-700 text-sm">
                                  {trialError}
                                  <button type="button" onClick={() => setTrialError(null)} className="ml-2 underline">閉じる</button>
                                </div>
                              )}
                              {trialSuccess ? (
                                <div className="text-center py-8">
                                  <p className="text-lg font-bold text-[#1a4d2e] mb-2">送信が完了しました</p>
                                  <p className="text-gray-600 text-sm">mirinae@kaonnuri.com 宛に送信しました。ご確認の上、ご連絡いたします。</p>
                                </div>
                              ) : (
                                <form onSubmit={handleTrialSubmit} className="space-y-4 max-w-xl mx-auto">
                                  <div>
                                    <label className="block text-sm font-medium text-gray-700 mb-1">お名前(*必須)</label>
                                    <input type="text" value={trialForm.name} onChange={(e) => setTrialForm((f) => ({ ...f, name: e.target.value }))} className="w-full border border-gray-300 rounded px-3 py-2" placeholder="お名前" required />
                                  </div>
                                  <div>
                                    <label className="block text-sm font-medium text-gray-700 mb-1">ふりがな(*必須)</label>
                                    <input type="text" value={trialForm.furigana} onChange={(e) => setTrialForm((f) => ({ ...f, furigana: e.target.value }))} className="w-full border border-gray-300 rounded px-3 py-2" placeholder="ふりがな" required />
                                  </div>
                                  <div>
                                    <label className="block text-sm font-medium text-gray-700 mb-1">韓国語レベル</label>
                                    <select value={trialForm.koreanLevel} onChange={(e) => setTrialForm((f) => ({ ...f, koreanLevel: e.target.value }))} className="w-full border border-gray-300 rounded px-3 py-2">
                                      {KOREAN_LEVELS.map((l) => <option key={l} value={l}>{l}</option>)}
                                    </select>
                                  </div>
                                  <div>
                                    <label className="block text-sm font-medium text-gray-700 mb-1">メールアドレス(*必須)</label>
                                    <p className="text-xs text-gray-500 mb-1">☆携帯メールの場合は返信のため、パソコン受信設定のチェックをお願いします。</p>
                                    <input type="email" value={trialForm.email} onChange={(e) => setTrialForm((f) => ({ ...f, email: e.target.value }))} className="w-full border border-gray-300 rounded px-3 py-2" placeholder="メールアドレスを入力" required />
                                  </div>
                                  <button type="submit" disabled={trialSubmitting} className="w-full py-3 bg-[#1a4d2e] text-white rounded-lg hover:bg-[#2d6a4a] disabled:opacity-50 font-medium">
                                    {trialSubmitting ? "送信中..." : "送信"}
                                  </button>
                                </form>
                              )}
                            </div>
                          )}
                        </div>
                      </div>
                      <div className="mt-6 pt-4 border-t-2 border-[#8b6914]">
                        <h3 className="font-semibold text-[#8b6914] text-base mb-3">授業料</h3>
                        <div className="border border-gray-300 rounded-lg overflow-hidden">
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
                          <button
                            type="button"
                            onClick={() => {
                              setExampleLevelTab("chujokyu");
                              setExpandedExampleId(null);
                            }}
                            className={`flex-1 min-w-0 px-4 py-3 font-medium text-sm ${exampleLevelTab === "chujokyu" ? "bg-[#1e3a5f] text-white" : "bg-[#faf8f5] text-gray-700 hover:bg-[#f5f0e6]"}`}
                          >
                            初中級
                          </button>
                          <button
                            type="button"
                            onClick={() => {
                              setExampleLevelTab("chuujokyu");
                              setExamplePeriodTab(2);
                              setExpandedExampleId(null);
                            }}
                            className={`flex-1 min-w-0 px-4 py-3 font-medium text-sm border-l border-[#e5dfd4] ${exampleLevelTab === "chuujokyu" ? "bg-[#1e3a5f] text-white" : "bg-[#faf8f5] text-gray-700 hover:bg-[#f5f0e6]"}`}
                          >
                            中上級
                          </button>
                        </div>
                        <div className="flex border-b border-[#e5dfd4]">
                          {ALL_PERIODS.map((periodIdx) => (
                            <button
                              key={periodIdx}
                              type="button"
                              onClick={() => {
                                setExamplePeriodTab(periodIdx);
                                setExpandedExampleId(null);
                              }}
                              className={`flex-1 min-w-0 px-4 py-3 font-medium text-sm ${examplePeriodTab === periodIdx ? "bg-[#1a4d2e] text-white" : "bg-[#faf8f5] text-gray-700 hover:bg-[#f5f0e6]"}`}
                            >
                              {PERIOD_LABELS[periodIdx]}
                            </button>
                          ))}
                        </div>
                        <div className="px-4 md:px-5 py-3 bg-[#faf8f5] border-b border-[#e5dfd4] font-semibold text-gray-800 text-sm md:text-base">音読課題例（{mergedExamples.length}件）</div>
                        {!user ? (
                          <div className="p-8 text-center bg-[#faf8f5] border-b border-[#e5dfd4]">
                            <p className="text-gray-700 mb-4">1期～4期の課題内容はログイン後にご覧いただけます。</p>
                            <Link href={`/login?redirect=${encodeURIComponent(redirectPath)}`} className="inline-block px-6 py-3 bg-[#1a4d2e] hover:bg-[#2d6a4a] text-white font-medium rounded-xl">ログイン</Link>
                          </div>
                        ) : (
                          <>
                        <div className="p-4 border-b border-[#e5dfd4] bg-white">
                          <p className="text-sm font-medium text-gray-700 mb-2">音読トレーニングの方法・録音のご案内</p>
                          <div className="text-sm text-gray-800 leading-relaxed whitespace-pre-line">
                            {ONDOKU_COMMON_INSTRUCTION}
                          </div>
                        </div>
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
                                {expandedExampleId === exId && (
                                  <div className="px-4 md:px-5 pb-4 pt-0 border-t border-[#e5dfd4] bg-[#fafbfc]">
                                    <div className="mt-3 flex flex-col gap-3">
                                      {examplePeriodTab === 0 && exampleLevelTab === "chujokyu" && idx === 0 && (
                                        <>
                                        <div className="p-4 rounded-xl bg-white border border-[#e5dfd4]">
                                          <img src="/ondoku-1st-assignment.png" alt="1회 과제 - 文型と課題一覧" className="w-full max-w-2xl mx-auto rounded-lg border border-gray-200 shadow-sm" />
                                        </div>
                                        <div className="p-4 rounded-xl bg-white border border-[#e5dfd4] text-sm text-gray-800 leading-relaxed whitespace-pre-line">
                                          {ONDOKU_1KAI_INSTRUCTION}
                                        </div>
                                        </>
                                      )}
                                      {(examplePeriodTab !== 0 || exampleLevelTab !== "chujokyu" || idx !== 0) && ex.modelContent && (
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
                                      )}
                                      {isSubmitted ? (
                                        <>
                                          <div className="p-4 rounded-xl bg-[#f0fdf4] border border-[#86efac]">
                                            <p className="text-sm font-medium text-[#166534] mb-2">提出済み</p>
                                            {submissionsByKey[key]?.audio_url && (
                                              <div className="mb-3">
                                                <audio controls src={submissionsByKey[key].audio_url} className="w-full max-w-md" />
                                                <a href={submissionsByKey[key].audio_url} download className="inline-block mt-2 text-sm text-[#1a4d2e] hover:underline">ダウンロード</a>
                                              </div>
                                            )}
                                            <pre className="whitespace-pre-wrap text-gray-800 text-sm leading-relaxed font-sans">{submissionsByKey[key]?.content || ""}</pre>
                                          </div>
                                          <div className="flex gap-2">
                                            <button type="button" onClick={() => handleExampleSubmitClick({ id: exId, title: ex.title }, examplePeriodTab, idx, submissionsByKey[key]?.content)} className="flex-1 py-3 px-6 bg-amber-500 hover:bg-amber-600 text-white font-medium rounded-xl shadow-md">修正・再提出</button>
                                            <button type="button" onClick={() => document.getElementById("mypage-section")?.scrollIntoView({ behavior: "smooth" })} className="flex-1 py-3 px-6 bg-[#4ade80] hover:bg-[#22c55e] text-gray-800 font-medium rounded-xl shadow-md">マイページで確認</button>
                                          </div>
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
                          </>
                        )}
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
                            <button type="button" onClick={() => setMyPageLevelTab("chujokyu")} className={`flex-1 min-w-0 px-4 py-3 font-medium text-sm ${myPageLevelTab === "chujokyu" ? "bg-[#1e3a5f] text-white" : "bg-[#faf8f5] text-gray-700 hover:bg-[#f5f0e6]"}`}>
                              初中級
                            </button>
                            <button type="button" onClick={() => setMyPageLevelTab("chuujokyu")} className={`flex-1 min-w-0 px-4 py-3 font-medium text-sm border-l border-[#e5dfd4] ${myPageLevelTab === "chuujokyu" ? "bg-[#1e3a5f] text-white" : "bg-[#faf8f5] text-gray-700 hover:bg-[#f5f0e6]"}`}>
                              中上級
                            </button>
                          </div>
                          <div className="flex border-b border-[#e5dfd4]">
                            {ALL_PERIODS.map((periodIdx) => (
                              <button key={periodIdx} type="button" onClick={() => setMyPagePeriodTab(periodIdx)} className={`flex-1 min-w-0 px-4 py-3 font-medium text-sm ${myPagePeriodTab === periodIdx ? "bg-[#1a4d2e] text-white" : "bg-[#faf8f5] text-gray-700 hover:bg-[#f5f0e6]"}`}>
                                {PERIOD_LABELS[periodIdx]}
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
                                          onClick={() => setMyPageContentModal({ type: "submit", periodIndex: myPagePeriodTab, itemIndex: itemIdx, content: row!.content, audio_url: row!.audio_url, title: ONDOKU_PERIOD_EXAMPLES[myPagePeriodTab]?.[itemIdx]?.title })}
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
            <div className="flex-1 overflow-y-auto p-4 sm:p-6 space-y-4">
              {myPageContentModal.type === "submit" && myPageContentModal.audio_url && (
                <div>
                  <p className="text-sm font-medium text-gray-700 mb-2">音声ファイル</p>
                  <audio controls src={myPageContentModal.audio_url} className="w-full max-w-md" />
                  <a href={myPageContentModal.audio_url} download className="inline-block mt-2 text-sm text-[#1a4d2e] hover:underline">ダウンロード</a>
                </div>
              )}
              <pre className="whitespace-pre-wrap text-gray-800 text-sm leading-relaxed font-sans">{myPageContentModal.content || "（内容なし）"}</pre>
            </div>
          </div>
        </div>
      )}

      {showExampleSubmitModal && selectedExample && (() => {
        const ex = ONDOKU_PERIOD_EXAMPLES[selectedExample.periodIndex]?.[selectedExample.itemIndex];
        const mc = ex?.modelContent;
        return (
        <div className="fixed inset-0 bg-black/50 flex items-center justify-center z-50 p-4">
          <div className="bg-white rounded-2xl shadow-xl max-w-2xl w-full max-h-[90vh] overflow-hidden flex flex-col">
            <div className="relative px-4 sm:px-6 py-4 shrink-0 border-b border-gray-200">
              <h3 className="text-lg font-bold text-gray-800 text-center pr-14">課題提出 - {selectedExample.title}</h3>
              <button onClick={handleCloseExampleSubmitModal} className="absolute right-4 top-4 text-gray-500 hover:text-gray-700 font-medium shrink-0">閉じる</button>
            </div>
            <div className="flex-1 overflow-y-auto p-4 sm:p-6 space-y-4">
              {selectedExample.periodIndex === 0 && selectedExample.itemIndex === 0 ? (
                <div className="p-4 rounded-xl bg-white border border-[#e5dfd4] text-sm text-gray-800 leading-relaxed whitespace-pre-line">
                  {ONDOKU_1KAI_INSTRUCTION}
                </div>
              ) : mc ? (
                <div className="p-4 rounded-xl bg-white border border-[#e5dfd4] text-sm space-y-3">
                  <p className="text-gray-700 font-medium">テーマ: {mc.theme}</p>
                  <p className="text-gray-800 text-lg font-medium leading-relaxed">{mc.sentence}</p>
                  {mc.patterns?.map((p, i) => (
                    <div key={i} className="text-gray-700">
                      <p className="font-medium text-gray-800">○ {p.pattern}</p>
                      <p className="text-gray-600 pl-2">{p.example}</p>
                    </div>
                  ))}
                  {mc.pronunciationNote && <p className="text-gray-600 font-medium">※{mc.pronunciationNote}</p>}
                </div>
              ) : null}
              <div className="p-4 rounded-xl bg-[#faf8f5] border border-[#e5dfd4] text-sm">
                <p className="text-gray-600 mb-2">音声ファイル（mp3, wav, webm, ogg, m4a）をアップロードして提出できます。50MB以下。</p>
              </div>
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-2">音声ファイル</label>
                <input
                  type="file"
                  accept="audio/mpeg,audio/mp3,audio/wav,audio/webm,audio/ogg,audio/m4a,.mp3,.wav,.webm,.ogg,.m4a"
                  onChange={(e) => setExampleSubmitAudioFile(e.target.files?.[0] || null)}
                  className="w-full text-sm text-gray-600 file:mr-4 file:py-2 file:px-4 file:rounded-lg file:border-0 file:bg-[#1a4d2e] file:text-white file:cursor-pointer hover:file:bg-[#2d6a4a]"
                />
                {exampleSubmitAudioFile && <p className="text-gray-500 text-xs mt-1">{exampleSubmitAudioFile.name}</p>}
              </div>
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-2">送付メモ（任意）</label>
                <textarea
                  value={exampleSubmitContent}
                  onChange={(e) => setExampleSubmitContent(e.target.value)}
                  placeholder="例：2024年1月15日 録音、補足メモなど"
                  className="w-full min-h-[80px] p-4 border border-gray-200 rounded-xl resize-y focus:ring-2 focus:ring-[#1a4d2e] focus:border-transparent"
                />
              </div>
            </div>
            <div className="px-4 sm:px-6 py-4 flex justify-end shrink-0 border-t border-gray-200">
              <button onClick={handleOndokuSubmit} disabled={exampleSubmitUploading || (!exampleSubmitAudioFile && !exampleSubmitContent.trim())} className="px-6 py-2.5 bg-[#86efac] hover:bg-[#4ade80] disabled:opacity-50 text-gray-800 font-medium rounded-xl">
                {exampleSubmitUploading ? "アップロード中..." : "提出する"}
              </button>
            </div>
          </div>
        </div>
        );
      })()}
    </div>
  );
}
