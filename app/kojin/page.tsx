"use client";

import Link from "next/link";

const KOJIN_URL = "https://mirinae.jp/kojin.html?tab=tab01";

const GOLD = "#c5a572";

// Simple inline SVG icons
const LeafIcon = () => (
  <svg className="w-4 h-4 inline-block mr-1" viewBox="0 0 24 24" fill="currentColor">
    <path d="M17 8C8 10 5.9 16.17 3.82 21.34l1.89.66.95-2.3c.48.17.98.3 1.34.3C19 20 22 3 22 3c-1 2-8 2.25-13 3.75S2 11.5 2 13.5s1.75 3.75 1.75 3.75C7 8 17 8 17 8z" />
  </svg>
);

const ListenIcon = () => (
  <svg className="w-8 h-8" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.5">
    <path d="M12 2a3 3 0 0 1 3 3v7a3 3 0 0 1-6 0V5a3 3 0 0 1 3-3z" />
    <path d="M19 10v2a7 7 0 0 1-14 0v-2" />
    <path d="M12 19v4" />
    <path d="M8 23h8" />
  </svg>
);

const ReadIcon = () => (
  <svg className="w-8 h-8" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.5">
    <path d="M4 19.5A2.5 2.5 0 0 1 6.5 17H20" />
    <path d="M6.5 2H20v20H6.5A2.5 2.5 0 0 1 4 19.5v-15A2.5 2.5 0 0 1 6.5 2z" />
    <path d="M8 7h8" />
    <path d="M8 11h8" />
  </svg>
);

const WriteIcon = () => (
  <svg className="w-8 h-8" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.5">
    <path d="M12 19l7-7 3 3-7 7-3-3z" />
    <path d="M18 13l-1.5-7.5L2 2l3.5 14.5L13 18l5-5z" />
    <path d="M2 2l7.586 7.586" />
  </svg>
);

const LevelIcon = () => (
  <span className="text-2xl font-bold text-gray-600">A+</span>
);

const HeadphoneIcon = () => (
  <svg className="w-8 h-8 text-gray-600" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.5">
    <path d="M3 18v-6a9 9 0 0 1 18 0v6" />
    <path d="M21 19a2 2 0 0 1-2 2h-1a2 2 0 0 1-2-2v-3a2 2 0 0 1 2-2h3zM3 19a2 2 0 0 0 2 2h1a2 2 0 0 0 2-2v-3a2 2 0 0 0-2-2H3z" />
  </svg>
);

const ChatIcon = () => (
  <svg className="w-8 h-8 text-gray-600" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.5">
    <path d="M21 15a2 2 0 0 1-2 2H7l-4 4V5a2 2 0 0 1 2-2h14a2 2 0 0 1 2 2z" />
  </svg>
);

const MicIcon = () => (
  <svg className="w-8 h-8 text-gray-600" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.5">
    <path d="M12 1a3 3 0 0 0-3 3v8a3 3 0 0 0 6 0V4a3 3 0 0 0-3-3z" />
    <path d="M19 10v2a7 7 0 0 1-14 0v-2" />
    <path d="M12 19v4" />
    <path d="M8 23h8" />
  </svg>
);

const BuildingIcon = () => (
  <svg className="w-6 h-6 text-gray-600" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.5">
    <path d="M3 21h18" />
    <path d="M9 8h1" />
    <path d="M9 12h1" />
    <path d="M9 16h1" />
    <path d="M14 8h1" />
    <path d="M14 12h1" />
    <path d="M14 16h1" />
    <path d="M5 21V5a2 2 0 0 1 2-2h10a2 2 0 0 1 2 2v16" />
  </svg>
);

const LaptopIcon = () => (
  <svg className="w-6 h-6 text-gray-600" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.5">
    <rect x="2" y="4" width="20" height="14" rx="2" />
    <path d="M22 18h-4" />
    <path d="M6 18H2" />
  </svg>
);

const ClockIcon = ({ className = "w-5 h-5" }: { className?: string }) => (
  <svg className={className} viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.5" style={{ color: GOLD }}>
    <circle cx="12" cy="12" r="10" />
    <path d="M12 6v6l4 2" />
  </svg>
);

function SectionCard({
  title,
  children,
}: {
  title: string;
  children: React.ReactNode;
}) {
  return (
    <div className="rounded-xl bg-white shadow-md overflow-hidden">
      <div className="px-4 py-2.5" style={{ backgroundColor: GOLD }}>
        <h3 className="text-white font-semibold text-sm">{title}</h3>
      </div>
      <div className="p-4 text-gray-800 text-sm leading-relaxed">{children}</div>
    </div>
  );
}

function ProgressCircle({ percent }: { percent: number }) {
  const r = 45;
  const circumference = 2 * Math.PI * r;
  const offset = circumference - (percent / 100) * circumference;
  return (
    <div className="relative w-24 h-24 flex-shrink-0">
      <svg className="w-full h-full -rotate-90" viewBox="0 0 100 100">
        <circle
          cx="50"
          cy="50"
          r={r}
          fill="none"
          stroke="#e5e7eb"
          strokeWidth="8"
        />
        <circle
          cx="50"
          cy="50"
          r={r}
          fill="none"
          stroke="#93c5fd"
          strokeWidth="8"
          strokeDasharray={circumference}
          strokeDashoffset={offset}
          strokeLinecap="round"
          className="transition-all duration-500"
        />
      </svg>
      <div className="absolute inset-0 flex items-center justify-center">
        <span className="text-lg font-bold text-gray-700">{percent}%</span>
      </div>
    </div>
  );
}

export default function KojinPage() {
  return (
    <div className="min-h-screen bg-[#f0f0f0]">
      <div className="max-w-2xl mx-auto">
        {/* Header with blurred background */}
        <div
          className="relative rounded-t-2xl overflow-hidden shadow-lg mb-4"
          style={{
            backgroundImage: "url(https://images.unsplash.com/photo-1522202176988-66273c2fd55f?w=800)",
            backgroundSize: "cover",
            backgroundPosition: "center",
          }}
        >
          <div
            className="absolute inset-0"
            style={{
              backdropFilter: "blur(8px)",
              backgroundColor: "rgba(255,255,255,0.75)",
            }}
          />
          <div className="relative p-6 pt-8">
            <Link
              href="/"
              className="inline-flex items-center text-sm mb-4 hover:underline"
              style={{ color: "#2d7d46" }}
            >
              <LeafIcon />
              クイズに戻る
            </Link>
            <h1 className="text-2xl font-bold text-gray-800">個人レッスン</h1>
            <p className="text-gray-600 text-sm mt-2">
              都合に合わせて予約し、自分のペースで勉強できます
            </p>
          </div>
        </div>

        <div className="px-4 pb-8 space-y-4 max-h-[65vh] overflow-y-auto">
          {/* Main 個人レッスン card with progress & skill icons */}
          <div className="rounded-xl bg-white shadow-md overflow-hidden">
            <div className="px-4 py-2.5" style={{ backgroundColor: GOLD }}>
              <h3 className="text-white font-semibold text-sm">『個人レッスン』</h3>
            </div>
            <div className="p-4">
              <div className="flex flex-wrap items-start gap-4 mb-4">
                <div className="flex items-center gap-3">
                  <ProgressCircle percent={70} />
                  <span className="text-sm text-gray-600">発話参加率</span>
                </div>
                <div className="flex gap-6 flex-1 min-w-[180px]">
                  <div className="flex flex-col items-center gap-1">
                    <div style={{ color: GOLD }}>
                      <ListenIcon />
                    </div>
                    <span className="text-xs text-gray-600">聞く</span>
                  </div>
                  <div className="flex flex-col items-center gap-1">
                    <div style={{ color: GOLD }}>
                      <ReadIcon />
                    </div>
                    <span className="text-xs text-gray-600">読む</span>
                  </div>
                  <div className="flex flex-col items-center gap-1">
                    <div style={{ color: GOLD }}>
                      <WriteIcon />
                    </div>
                    <span className="text-xs text-gray-600">書く</span>
                  </div>
                </div>
              </div>
              <p className="text-gray-800 text-sm leading-relaxed">
                個人レッスンではテキストを使用し、聞く・話す・読む・書くを総合的に学習します。文法、語彙、表現については講師から説明いたしますが、レッスンの7割は音読や会話となり、生徒さんにどんどん声を出していただくことをモットーとしております。丁寧な解説で文法のポイントを学んだ後は、練習問題で反復練習をし、「書くチカラ」も身につけます。授業中に学習した本文や例文は暗記していたただき、次のレッスン時に、韓国語で声に出していただきます。レッスンはこのように丁寧に行われるため、1コマで１つの課の50％~80％ほどの目安で進められます。
              </p>
            </div>
          </div>

          {/* 対象 section - icon cards grid */}
          <div className="rounded-xl bg-[#f8f8f8] shadow-md overflow-hidden">
            <div className="p-4">
              <h3 className="font-semibold text-gray-800 mb-4">対象</h3>
              <div className="grid grid-cols-2 gap-3 mb-4">
                <div className="bg-white rounded-lg p-3 shadow-sm flex items-start gap-2">
                  <LevelIcon />
                  <span className="text-xs text-gray-700">入門・初級・中級、上級 全レベル対象</span>
                </div>
                <div className="bg-white rounded-lg p-3 shadow-sm flex items-start gap-2">
                  <HeadphoneIcon />
                  <span className="text-xs text-gray-700">韓国ドラマやK-POPを聞き取れるようになりたい方</span>
                </div>
                <div className="bg-white rounded-lg p-3 shadow-sm flex items-start gap-2">
                  <ChatIcon />
                  <span className="text-xs text-gray-700">韓国語で上手に話せるようになりたい方</span>
                </div>
                <div className="bg-white rounded-lg p-3 shadow-sm flex items-start gap-2">
                  <MicIcon />
                  <span className="text-xs text-gray-700">韓国語の正確な発音を身につけたい方</span>
                </div>
              </div>
              <div className="flex flex-wrap gap-3 items-center">
                <div className="flex items-center gap-2 bg-white rounded-lg px-3 py-2 shadow-sm">
                  <BuildingIcon />
                  <span className="text-xs text-gray-700">新宿教室での対面授業</span>
                </div>
                <div className="flex items-center gap-2 bg-white rounded-lg px-3 py-2 shadow-sm">
                  <LaptopIcon />
                  <span className="text-xs text-gray-700">オンライン授業（Skype又はZoom）</span>
                </div>
                <span className="text-xs" style={{ color: GOLD }}>どちらでも受講可能 →</span>
              </div>
            </div>
          </div>

          {/* 授業形式〜進め方：新デザイン */}
          <div className="rounded-xl bg-white shadow-md overflow-hidden">
            <div className="p-4">
              <p className="text-gray-400 text-xs mb-1">※対面・オンラインどちらでも受講可能</p>
              <h3 className="text-lg font-bold text-gray-800">授業形式</h3>
              <div className="h-px my-3" style={{ backgroundColor: GOLD }} />
              <ul className="list-disc pl-5 space-y-1 text-sm text-gray-700">
                <li>新宿教室での対面授業</li>
                <li>オンライン授業（Skype又はZoom）</li>
                <li>どちらでも受講可</li>
              </ul>

              <h3 className="text-lg font-bold text-gray-800 mt-6 flex items-center gap-2">
                日程
                <ClockIcon className="w-4 h-4" />
              </h3>
              <div className="h-px my-3" style={{ backgroundColor: GOLD }} />
              <div className="flex items-center gap-3">
                <ClockIcon className="w-6 h-6 flex-shrink-0" />
                <div className="text-sm text-gray-700 space-y-0.5">
                  <p>火～金 10:00-21:00</p>
                  <p>土 10:00-18:00 / 日 10:00-17:00</p>
                  <p>予約制（50分）</p>
                </div>
              </div>

              <h3 className="text-lg font-bold text-gray-800 mt-6 flex items-center gap-2">
                テキスト
                <ClockIcon className="w-4 h-4" />
              </h3>
              <div className="h-px my-3" style={{ backgroundColor: GOLD }} />
              <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
                <div
                  className="rounded-lg p-4 border"
                  style={{ backgroundColor: "#faf8f5", borderColor: GOLD }}
                >
                  <p className="font-semibold text-gray-800 text-sm">ミリネ韓国語テキスト</p>
                  <p className="text-gray-500 text-xs mt-1">ミリネのオリジナルストーリーも入っているので、楽しく韓国語を学べます</p>
                </div>
                <div
                  className="rounded-lg p-4 border"
                  style={{ backgroundColor: "#faf8f5", borderColor: GOLD }}
                >
                  <p className="font-semibold text-gray-800 text-sm">ソウル大韓国語</p>
                  <p className="text-gray-500 text-xs mt-1">ソウル大学の教科書で体系的に韓国語を学べます（1A-6B）</p>
                </div>
              </div>
              <p className="text-gray-500 text-xs mt-2">その他、学習ニーズに合わせて教材を選定いたします。</p>

              <h3 className="text-lg font-bold text-gray-800 mt-6">進め方</h3>
              <div className="h-px my-3" style={{ backgroundColor: GOLD }} />
              <div className="mt-4">
                <div className="flex w-full h-2 rounded-full overflow-hidden bg-gray-200">
                  <div className="h-full rounded-l-full" style={{ width: "25%", backgroundColor: GOLD }} />
                  <div className="h-full" style={{ width: "25%", backgroundColor: GOLD }} />
                  <div className="h-full" style={{ width: "25%", backgroundColor: GOLD }} />
                  <div className="h-full rounded-r-full" style={{ width: "25%", backgroundColor: GOLD }} />
                </div>
                <div className="flex justify-between mt-2 text-xs text-gray-600">
                  <span className="w-[22%] text-center">①本文理解</span>
                  <span className="w-[22%] text-center">②文法・語彙</span>
                  <span className="w-[22%] text-center">③練習問題</span>
                  <span className="w-[22%] text-center">④復習</span>
                </div>
                <ol className="mt-4 space-y-2 text-sm text-gray-700 list-decimal list-inside">
                  <li>テキスト本文の理解（音読、和訳、発音指導、オバーラッピング、シャドーイング）</li>
                  <li>文法、語彙、表現の学習（音読、和訳、発音指導）</li>
                  <li>練習問題（作文、音読、聞き取り、聞き逃した箇所の和訳）</li>
                  <li>学んだことは次回に復習（講師：日本語→生徒さん：韓国語に訳して声に出す）</li>
                </ol>
              </div>

              <h3 className="text-lg font-bold text-gray-800 mt-6">内容</h3>
              <div className="h-px my-3" style={{ backgroundColor: GOLD }} />
              <ol className="list-decimal pl-5 space-y-2 text-sm text-gray-700">
                <li>主に音読(声に出して読む)を中心とした指導をしています。音読で大切なのは、その場で先生から、きちんと発音と抑揚の指摘を受け、直してもらうことです。スポーツ選手のトレーナーのように、発音と抑揚の技術を教え、練習をそばで支えてくれる人が必要なのです。練習問題も声に出して解いていただきます。</li>
                <li>そのため授業は予習を前提として進められます。予習課題をしていただくことで週1回や2~3回の授業を無駄なく消化できるようになります。</li>
                <li>韓国語のテキスト本文や文法の和訳も事前にしてきていただきます。当教室では受講生の和訳に正確なチェックを入れ、より効果的に覚えられるよう指導します。もちろん和訳していく中で出てくる似ている文型や微妙なニュアンスの違いも漏れなく解説いたします。</li>
                <li>「オバーラッピング」と「シャドーイング」を使って、ネイティブの話すスピードについて行けるようなトレーニングを行います。<br /><span className="text-gray-500 text-xs">※オバーラッピング:音声と同時に読むこと　シャドーイング:テキストを見ないで音声だけを聞きながら重ねて言うこと</span></li>
                <li>韓国語訳の復習を通して学んだ内容の定着を図る：１つの課が終わったら、学習した「文型や表現」は次の課を始める前に韓国語訳を行い、どのくらい頭の中に定着したか確認します。講師が日本語で例文を話します。<br /><span className="text-gray-500 text-xs">※ミリネのレッスンは主に受講生の方が約7割話すことで、聞き取り力・会話力の両方を引きあげます。</span></li>
              </ol>

              <h3 className="text-lg font-bold text-gray-800 mt-6">入学金</h3>
              <div className="h-px my-3" style={{ backgroundColor: GOLD }} />
              <p className="font-semibold text-gray-800">9,800円</p>

              <h3 className="text-lg font-bold text-gray-800 mt-6">授業料</h3>
              <div className="h-px my-3" style={{ backgroundColor: GOLD }} />
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

              <h3 className="text-lg font-bold text-gray-800 mt-6">『生徒の声』</h3>
              <div className="h-px my-3" style={{ backgroundColor: GOLD }} />
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
            </div>
          </div>
        </div>

        <div className="p-4 bg-white rounded-2xl shadow-lg mx-4 mb-6">
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
