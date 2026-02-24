"use client";

import Link from "next/link";

const KOJIN_URL = "https://mirinae.jp/kojin.html?tab=tab01";

// 個人レッスン(tab01)の内容をページ内に直接埋め込み
const KOJIN_CONTENT = `
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

<h4 class="font-semibold mt-4 mb-1">内容</h4>
<ol class="list-decimal pl-5 space-y-2">
  <li>主に音読(声に出して読む)を中心とした指導をしています。音読で大切なのは、その場で先生から、きちんと発音と抑揚の指摘を受け、直してもらうことです。スポーツ選手のトレーナーのように、発音と抑揚の技術を教え、練習をそばで支えてくれる人が必要なのです。練習問題も声に出して解いていただきます。</li>
  <li>そのため授業は予習を前提として進められます。予習課題をしていただくことで週1回や2~3回の授業を無駄なく消化できるようになります。</li>
  <li>韓国語のテキスト本文や文法の和訳も事前にしてきていただきます。当教室では受講生の和訳に正確なチェックを入れ、より効果的に覚えられるよう指導します。もちろん和訳していく中で出てくる似ている文型や微妙なニュアンスの違いも漏れなく解説いたします。</li>
  <li>「オバーラッピング」と「シャドーイング」を使って、ネイティブの話すスピードについて行けるようなトレーニングを行います。<br/><small>※オバーラッピング:音声と同時に読むこと　シャドーイング:テキストを見ないで音声だけを聞きながら重ねて言うこと</small></li>
  <li>韓国語訳の復習を通して学んだ内容の定着を図る：１つの課が終わったら、学習した「文型や表現」は次の課を始める前に韓国語訳を行い、どのくらい頭の中に定着したか確認します。講師が日本語で例文を話します。<br/><small>※ミリネのレッスンは主に受講生の方が約7割話すことで、聞き取り力・会話力の両方を引きあげます。</small></li>
</ol>

<h4 class="font-semibold mt-4 mb-1">入学金</h4>
<p>9,800円</p>

<h4 class="font-semibold mt-4 mb-1">授業料</h4>
<table class="w-full border-collapse border border-gray-300 my-2 text-sm">
  <thead><tr class="bg-gray-100"><th class="border border-gray-300 p-2">コース</th><th class="border border-gray-300 p-2">1コマ</th><th class="border border-gray-300 p-2">授業料</th><th class="border border-gray-300 p-2">有効期限</th></tr></thead>
  <tbody>
    <tr><td class="border border-gray-300 p-2">12回コース</td><td class="border border-gray-300 p-2">4,900円</td><td class="border border-gray-300 p-2">58,800円（税込64,680円）</td><td class="border border-gray-300 p-2">3ヶ月</td></tr>
    <tr class="bg-gray-50"><td class="border border-gray-300 p-2">24回コース</td><td class="border border-gray-300 p-2">4,400円</td><td class="border border-gray-300 p-2">105,600円（税込116,160円）</td><td class="border border-gray-300 p-2">8ヶ月</td></tr>
    <tr><td class="border border-gray-300 p-2">48回コース</td><td class="border border-gray-300 p-2">3,980円</td><td class="border border-gray-300 p-2">191,040円（税込210,144円）</td><td class="border border-gray-300 p-2">1年</td></tr>
    <tr class="bg-gray-50"><td class="border border-gray-300 p-2">72回コース</td><td class="border border-gray-300 p-2">3,600円</td><td class="border border-gray-300 p-2">259,200円（税込285,120円）</td><td class="border border-gray-300 p-2">1年</td></tr>
    <tr><td class="border border-gray-300 p-2">※月謝制(月8コマ)</td><td class="border border-gray-300 p-2">5,100円</td><td class="border border-gray-300 p-2">40,800円（税込44,880円）</td><td class="border border-gray-300 p-2">1ヶ月</td></tr>
  </tbody>
</table>

<h3 class="text-base font-semibold mt-6 mb-2">『生徒の声』</h3>
<div class="space-y-4 text-sm">
  <div class="border-l-2 border-[#0ea5e9] pl-3">
    <p class="font-semibold">NS様｜6級｜2023.08</p>
    <p class="mt-1">この教室で初級1から習い始めて１年１０カ月でTOPIK6級に合格しました。素直に、とても嬉しいです。半年でTOPIK5級に合格されたミリネ受講生の記事を拝見し、直感でここだなと思いました。自分の生活リズムに合わせて勉強が出来て本当に良かったです。</p>
  </div>
  <div class="border-l-2 border-[#0ea5e9] pl-3">
    <p class="font-semibold">WY様｜4級｜2019.07</p>
    <p class="mt-1">ソウル大学教科書を通じて文法を学びながらも各課のテーマに沿った単語や表現、良く使う言い回しも教わりました。ネイティブの先生からの発音チェックでは、自分では気づかないクセや、発音のポイントを教わりました。ありがとうございました。</p>
  </div>
  <div class="border-l-2 border-[#0ea5e9] pl-3">
    <p class="font-semibold">IT様｜中級(TOPIK5級）｜2018.5</p>
    <p class="mt-1">私の興味にあわせて教えてくださること、質問に納得いくまでとことん説明してくださるところ、安心感があるところが良かったです。授業がほぼ韓国語になると、上達したんだなという実感も湧き嬉しくなります。</p>
  </div>
  <div class="border-l-2 border-[#0ea5e9] pl-3">
    <p class="font-semibold">TM様｜3級｜2016.8～2017.10</p>
    <p class="mt-1">テキストCDの音声とオーバーラッピングしながら読み、本文全てを暗記する等、他の教室ではあまりやらないような方法で学びました。ある一定の緊張感を保ちつつ授業を受ける事が出来るので、とても良いと感じました。</p>
  </div>
</div>
`;

export default function KojinPage() {
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
          <div
            className="kotae-blog-content text-gray-800 max-h-[70vh] overflow-y-auto"
            dangerouslySetInnerHTML={{ __html: KOJIN_CONTENT }}
          />
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
