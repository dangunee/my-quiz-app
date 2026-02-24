"use client";

import Link from "next/link";
import { useState, useEffect } from "react";

const KOJIN_URL = "https://mirinae.jp/kojin.html?tab=tab01";

const FALLBACK_HTML = `
<h2 class="text-lg font-semibold mt-4 mb-2">『個人レッスン』</h2>
<p>個人レッスンではテキストを使用し、聞く・話す・読む・書くを総合的に学習します。文法、語彙、表現については講師から説明いたしますが、レッスンの7割は音読や会話となり、生徒さんにどんどん声を出していただくことをモットーとしております。丁寧な解説で文法のポイントを学んだ後は、練習問題で反復練習をし、「書くチカラ」も身につけます。授業中に学習した本文や例文は暗記していたただき、次のレッスン時に、韓国語で声に出していただきます。レッスンはこのように丁寧に行われるため、1コマで１つの課の50％~80％ほどの目安で進められます。</p>

<h3 class="text-base font-semibold mt-6 mb-2">『詳細』</h3>

<h4 class="font-semibold mt-4 mb-1">対象</h4>
<ul class="list-disc pl-5 space-y-1">
  <li>入門・初級・中級、上級 全レベル対象</li>
  <li>韓国語で上手に話せるようになりたい方</li>
  <li>韓国ドラマやK-POPを聞き取れるようになりたい方</li>
  <li>韓国語の正確な発音を身につけたい方</li>
</ul>

<h4 class="font-semibold mt-4 mb-1">授業形式</h4>
<ul class="list-disc pl-5 space-y-1">
  <li>新宿教室での対面授業</li>
  <li>オンライン授業（Skype又はZoom）</li>
  <li>どちらでも受講可</li>
</ul>

<h4 class="font-semibold mt-4 mb-1">日程</h4>
<ul class="list-disc pl-5 space-y-1">
  <li>火～金 10:00-21:00</li>
  <li>土 10:00-18:00</li>
  <li>日 10:00-17:00</li>
  <li>予約制（50分）</li>
</ul>

<h4 class="font-semibold mt-4 mb-1">テキスト</h4>
<p>ミリネ独自の教材（ミリネ1-4）（ミリネのオリジナルストーリーも入っているので、楽しく韓国語を学ぶことができます）<br/>ソウル大韓国語（1A-6B）<br/>その他、学習ニーズに合わせて教材を選定させていただきます。</p>

<h4 class="font-semibold mt-4 mb-1">進め方</h4>
<ol class="list-decimal pl-5 space-y-1">
  <li>テキスト本文の理解（音読、和訳、発音指導、オバーラッピング、シャドーイング）</li>
  <li>文法、語彙、表現の学習（音読、和訳、発音指導）</li>
  <li>練習問題（作文、音読、聞き取り、聞き逃した箇所の和訳）</li>
  <li>学んだことは次回に復習（講師：日本語→生徒さん：韓国語に訳して声に出す）</li>
</ol>

<h4 class="font-semibold mt-4 mb-1">入学金</h4>
<p>9,800円</p>

<h4 class="font-semibold mt-4 mb-1">授業料</h4>
<table class="w-full border-collapse border border-gray-300 my-2 text-sm">
  <tr class="bg-gray-100"><th class="border border-gray-300 p-2">12回コース</th><td class="border border-gray-300 p-2">1コマ4,900円／12回=58,800円（税込64,680円）／有効期限3ヶ月</td></tr>
  <tr><th class="border border-gray-300 p-2 bg-gray-50">24回コース</th><td class="border border-gray-300 p-2">1コマ4,400円／24回=105,600円（税込116,160円）／有効期限8ヶ月</td></tr>
  <tr class="bg-gray-100"><th class="border border-gray-300 p-2">48回コース</th><td class="border border-gray-300 p-2">1コマ3,980円／48回=191,040円（税込210,144円）／有効期限1年</td></tr>
  <tr><th class="border border-gray-300 p-2 bg-gray-50">72回コース</th><td class="border border-gray-300 p-2">1コマ3,600円／72回=259,200円（税込285,120円）／有効期限1年</td></tr>
</table>
`;

export default function KojinPage() {
  const [content, setContent] = useState<{ html: string; url: string } | null>(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    fetch("/api/kojin")
      .then((r) => r.json())
      .then((data) => {
        if (data.error && !data.html) {
          setError(data.error);
          setContent(null);
        } else {
          setContent({ html: data.html || "", url: data.url || KOJIN_URL });
          setError(null);
        }
      })
      .catch((err) => {
        setError(err.message || "読み込みに失敗しました");
        setContent(null);
      })
      .finally(() => setLoading(false));
  }, []);

  return (
    <div className="min-h-screen bg-[#f5f5f5] p-4">
      <div className="max-w-2xl mx-auto bg-white rounded-2xl shadow-lg overflow-hidden">
        <div className="p-6 border-b border-gray-200">
          <Link
            href="/"
            className="text-[#0ea5e9] hover:underline text-sm mb-4 inline-block"
          >
            ← クイズに戻る
          </Link>
          <h1 className="text-2xl font-bold text-gray-800">個人レッスン</h1>
          <p className="text-gray-600 text-sm mt-2">
            都合に合わせて予約し、自分のペースで勉強できます
          </p>
        </div>

        <div className="p-6">
          {loading ? (
            <p className="text-center text-gray-500 py-12">読み込み中...</p>
          ) : error ? (
            <>
              <p className="text-center text-red-500 py-4 text-sm">{error}</p>
              <div
                className="kotae-blog-content text-gray-800 max-h-[70vh] overflow-y-auto"
                dangerouslySetInnerHTML={{ __html: FALLBACK_HTML }}
              />
            </>
          ) : (
            <div
              className="kotae-blog-content text-gray-800 max-h-[70vh] overflow-y-auto"
              dangerouslySetInnerHTML={{
                __html: content?.html?.trim() ? content.html : FALLBACK_HTML,
              }}
            />
          )}
        </div>

        <div className="p-4 border-t border-gray-200 bg-gray-50">
          <a
            href="https://mirinae.jp/trial.html"
            target="_blank"
            rel="noopener noreferrer"
            className="block w-full py-3 px-4 bg-[#0ea5e9] text-white text-center font-semibold rounded-xl hover:bg-[#0284c7] transition-colors"
          >
            お申込みはこちら
          </a>
          <a
            href={KOJIN_URL}
            target="_blank"
            rel="noopener noreferrer"
            className="block w-full py-2 px-4 text-center text-sm text-[#0ea5e9] hover:underline mt-2"
          >
            ミリネHPで詳しく見る →
          </a>
        </div>
      </div>
    </div>
  );
}
