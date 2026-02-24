"use client";

import Link from "next/link";

const KOJIN_URL = "https://mirinae.jp/kojin.html?tab=tab01";

const GOLD = "#c5a572"; // 더 부드러운 금색

function SectionCard({
  title,
  children,
}: {
  title: string;
  children: React.ReactNode;
}) {
  return (
    <div className="rounded-xl border border-amber-100 bg-white shadow-sm overflow-hidden">
      <div className="px-4 py-2.5" style={{ backgroundColor: GOLD }}>
        <h3 className="text-white font-semibold text-sm">{title}</h3>
      </div>
      <div className="p-4 text-gray-800 text-sm leading-relaxed">{children}</div>
    </div>
  );
}

export default function KojinPage() {
  return (
    <div className="min-h-screen bg-[#f5f5f5] p-4">
      <div className="max-w-2xl mx-auto">
        <div className="bg-white rounded-2xl shadow-lg overflow-hidden mb-4">
          <div className="p-6 border-b border-gray-200">
            <Link
              href="/"
              className="hover:underline text-sm mb-4 inline-block"
              style={{ color: GOLD }}
            >
              ← クイズに戻る
            </Link>
            <h1 className="text-2xl font-bold text-gray-800">個人レッスン</h1>
            <p className="text-gray-600 text-sm mt-2">
              都合に合わせて予約し、自分のペースで勉強できます
            </p>
          </div>
        </div>

        <div className="space-y-4 max-h-[60vh] overflow-y-auto">
          <SectionCard title="『個人レッスン』">
            <p>
              個人レッスンではテキストを使用し、聞く・話す・読む・書くを総合的に学習します。文法、語彙、表現については講師から説明いたしますが、レッスンの7割は音読や会話となり、生徒さんにどんどん声を出していただくことをモットーとしております。丁寧な解説で文法のポイントを学んだ後は、練習問題で反復練習をし、「書くチカラ」も身につけます。授業中に学習した本文や例文は暗記していたただき、次のレッスン時に、韓国語で声に出していただきます。レッスンはこのように丁寧に行われるため、1コマで１つの課の50％~80％ほどの目安で進められます。
            </p>
          </SectionCard>

          <SectionCard title="対象">
            <ul className="list-disc pl-5 space-y-1">
              <li>入門・初級・中級、上級 全レベル対象</li>
              <li>韓国語で上手に話せるようになりたい方</li>
              <li>韓国ドラマやK-POPを聞き取れるようになりたい方</li>
              <li>韓国語の正確な発音を身につけたい方</li>
            </ul>
          </SectionCard>

          <SectionCard title="授業形式">
            <ul className="list-disc pl-5 space-y-1">
              <li>新宿教室での対面授業</li>
              <li>オンライン授業（Skype又はZoom）</li>
              <li>どちらでも受講可</li>
            </ul>
          </SectionCard>

          <SectionCard title="日程">
            <ul className="list-disc pl-5 space-y-1">
              <li>火～金 10:00-21:00</li>
              <li>土 10:00-18:00</li>
              <li>日 10:00-17:00</li>
              <li>予約制（50分）</li>
            </ul>
          </SectionCard>

          <SectionCard title="テキスト">
            <p>
              ミリネ独自の教材（ミリネ1-4）（ミリネのオリジナルストーリーも入っているので、楽しく韓国語を学ぶことができます）
              <br />
              ソウル大韓国語（1A-6B）
              <br />
              その他、学習ニーズに合わせて教材を選定させていただきます。
            </p>
          </SectionCard>

          <SectionCard title="進め方">
            <ol className="list-decimal pl-5 space-y-1">
              <li>テキスト本文の理解（音読、和訳、発音指導、オバーラッピング、シャドーイング）</li>
              <li>文法、語彙、表現の学習（音読、和訳、発音指導）</li>
              <li>練習問題（作文、音読、聞き取り、聞き逃した箇所の和訳）</li>
              <li>学んだことは次回に復習（講師：日本語→生徒さん：韓国語に訳して声に出す）</li>
            </ol>
          </SectionCard>

          <SectionCard title="内容">
            <ol className="list-decimal pl-5 space-y-2">
              <li>主に音読(声に出して読む)を中心とした指導をしています。音読で大切なのは、その場で先生から、きちんと発音と抑揚の指摘を受け、直してもらうことです。スポーツ選手のトレーナーのように、発音と抑揚の技術を教え、練習をそばで支えてくれる人が必要なのです。練習問題も声に出して解いていただきます。</li>
              <li>そのため授業は予習を前提として進められます。予習課題をしていただくことで週1回や2~3回の授業を無駄なく消化できるようになります。</li>
              <li>韓国語のテキスト本文や文法の和訳も事前にしてきていただきます。当教室では受講生の和訳に正確なチェックを入れ、より効果的に覚えられるよう指導します。もちろん和訳していく中で出てくる似ている文型や微妙なニュアンスの違いも漏れなく解説いたします。</li>
              <li>「オバーラッピング」と「シャドーイング」を使って、ネイティブの話すスピードについて行けるようなトレーニングを行います。<br /><span className="text-gray-600 text-xs">※オバーラッピング:音声と同時に読むこと　シャドーイング:テキストを見ないで音声だけを聞きながら重ねて言うこと</span></li>
              <li>韓国語訳の復習を通して学んだ内容の定着を図る：１つの課が終わったら、学習した「文型や表現」は次の課を始める前に韓国語訳を行い、どのくらい頭の中に定着したか確認します。講師が日本語で例文を話します。<br /><span className="text-gray-600 text-xs">※ミリネのレッスンは主に受講生の方が約7割話すことで、聞き取り力・会話力の両方を引きあげます。</span></li>
            </ol>
          </SectionCard>

          <SectionCard title="入学金">
            <p className="font-semibold">9,800円</p>
          </SectionCard>

          <SectionCard title="授業料">
            <div className="overflow-x-auto">
              <table className="w-full border-collapse text-sm min-w-[320px]">
                <thead>
                  <tr className="bg-gray-100">
                    <th className="border border-gray-200 p-2 text-left">コース</th>
                    <th className="border border-gray-200 p-2 text-left">1コマ</th>
                    <th className="border border-gray-200 p-2 text-left">授業料</th>
                    <th className="border border-gray-200 p-2 text-left">有効期限</th>
                  </tr>
                </thead>
                <tbody>
                  <tr><td className="border border-gray-200 p-2">12回コース</td><td className="border border-gray-200 p-2">4,900円</td><td className="border border-gray-200 p-2">58,800円（税込64,680円）</td><td className="border border-gray-200 p-2">3ヶ月</td></tr>
                  <tr className="bg-gray-50"><td className="border border-gray-200 p-2">24回コース</td><td className="border border-gray-200 p-2">4,400円</td><td className="border border-gray-200 p-2">105,600円（税込116,160円）</td><td className="border border-gray-200 p-2">8ヶ月</td></tr>
                  <tr><td className="border border-gray-200 p-2">48回コース</td><td className="border border-gray-200 p-2">3,980円</td><td className="border border-gray-200 p-2">191,040円（税込210,144円）</td><td className="border border-gray-200 p-2">1年</td></tr>
                  <tr className="bg-gray-50"><td className="border border-gray-200 p-2">72回コース</td><td className="border border-gray-200 p-2">3,600円</td><td className="border border-gray-200 p-2">259,200円（税込285,120円）</td><td className="border border-gray-200 p-2">1年</td></tr>
                  <tr><td className="border border-gray-200 p-2">※月謝制(月8コマ)</td><td className="border border-gray-200 p-2">5,100円</td><td className="border border-gray-200 p-2">40,800円（税込44,880円）</td><td className="border border-gray-200 p-2">1ヶ月</td></tr>
                </tbody>
              </table>
            </div>
          </SectionCard>

          <SectionCard title="『生徒の声』">
            <div className="space-y-4">
              <div className="border-l-2 pl-3" style={{ borderColor: GOLD }}>
                <p className="font-semibold text-gray-800">NS様｜6級｜2023.08</p>
                <p className="mt-1 text-gray-700">この教室で初級1から習い始めて１年１０カ月でTOPIK6級に合格しました。素直に、とても嬉しいです。半年でTOPIK5級に合格されたミリネ受講生の記事を拝見し、直感でここだなと思いました。自分の生活リズムに合わせて勉強が出来て本当に良かったです。</p>
              </div>
              <div className="border-l-2 pl-3" style={{ borderColor: GOLD }}>
                <p className="font-semibold text-gray-800">WY様｜4級｜2019.07</p>
                <p className="mt-1 text-gray-700">ソウル大学教科書を通じて文法を学びながらも各課のテーマに沿った単語や表現、良く使う言い回しも教わりました。ネイティブの先生からの発音チェックでは、自分では気づかないクセや、発音のポイントを教わりました。ありがとうございました。</p>
              </div>
              <div className="border-l-2 pl-3" style={{ borderColor: GOLD }}>
                <p className="font-semibold text-gray-800">IT様｜中級(TOPIK5級）｜2018.5</p>
                <p className="mt-1 text-gray-700">私の興味にあわせて教えてくださること、質問に納得いくまでとことん説明してくださるところ、安心感があるところが良かったです。授業がほぼ韓国語になると、上達したんだなという実感も湧き嬉しくなります。</p>
              </div>
              <div className="border-l-2 pl-3" style={{ borderColor: GOLD }}>
                <p className="font-semibold text-gray-800">TM様｜3級｜2016.8～2017.10</p>
                <p className="mt-1 text-gray-700">テキストCDの音声とオーバーラッピングしながら読み、本文全てを暗記する等、他の教室ではあまりやらないような方法で学びました。ある一定の緊張感を保ちつつ授業を受ける事が出来るので、とても良いと感じました。</p>
              </div>
            </div>
          </SectionCard>
        </div>

        <div className="mt-4 p-4 bg-white rounded-2xl shadow-lg border-t border-gray-200">
          <a
            href="https://mirinae.jp/trial.html"
            target="_blank"
            rel="noopener noreferrer"
            className="block w-full py-3 px-4 text-white text-center font-semibold rounded-xl transition-colors hover:opacity-90"
            style={{ backgroundColor: GOLD }}
          >
            お申込みはこちら
          </a>
          <a
            href={KOJIN_URL}
            target="_blank"
            rel="noopener noreferrer"
            className="block w-full py-2 px-4 text-center text-sm hover:underline mt-2"
            style={{ color: GOLD }}
          >
            ミリネHPで詳しく見る →
          </a>
        </div>
      </div>
    </div>
  );
}
