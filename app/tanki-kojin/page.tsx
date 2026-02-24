"use client";

import Link from "next/link";

const TANKI_URL = "https://mirinae.jp/kojin.html?tab=tab02";

const GOLD = "#c5a572";
const TEAL_DARK = "#0f766e";
const TEAL_MID = "#0d9488";
const TEAL_LIGHT = "#99f6e4";
const LIME_LIGHT = "#bef264";
const AMBER_COMPLETE = "#fde68a";
const GRAY_EMPTY = "#e2e8f0";

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

const PlaneIcon = () => (
  <svg className="w-8 h-8 text-gray-600" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.5">
    <path d="M22 2L2 12l4 4 6 2 8-14-4-4-6-2-8 14 4 4 6 2 8-14z" />
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

function ProgressCircle({ percent }: { percent: number }) {
  const r = 45;
  const circumference = 2 * Math.PI * r;
  const offset = circumference - (percent / 100) * circumference;
  return (
    <div className="relative w-24 h-24 flex-shrink-0">
      <svg className="w-full h-full -rotate-90" viewBox="0 0 100 100">
        <circle cx="50" cy="50" r={r} fill="none" stroke="#e5e7eb" strokeWidth="8" />
        <circle cx="50" cy="50" r={r} fill="none" stroke="#93c5fd" strokeWidth="8" strokeDasharray={circumference} strokeDashoffset={offset} strokeLinecap="round" className="transition-all duration-500" />
      </svg>
      <div className="absolute inset-0 flex items-center justify-center">
        <span className="text-lg font-bold text-gray-700">{percent}%</span>
      </div>
    </div>
  );
}

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

export default function TankiKojinPage() {
  return (
    <div className="min-h-screen bg-[#f0f0f0]">
      <div className="max-w-2xl mx-auto">
        {/* Header with blurred background - 個人レッスンと同デザイン */}
        <div
          className="relative rounded-t-2xl overflow-hidden shadow-lg mb-4"
          style={{
            backgroundImage: "url(https://images.unsplash.com/photo-1522202176988-66273c2fd55f?w=800)",
            backgroundSize: "cover",
            backgroundPosition: "center",
          }}
        >
          <div className="absolute inset-0" style={{ backdropFilter: "blur(8px)", backgroundColor: "rgba(255,255,255,0.75)" }} />
          <div className="relative p-6 pt-8">
            <Link href="/" className="inline-flex items-center text-sm mb-4 hover:underline" style={{ color: "#2d7d46" }}>
              <LeafIcon />
              クイズに戻る
            </Link>
            <h1 className="text-2xl font-bold text-gray-800">短期個人レッスン</h1>
            <p className="text-gray-600 text-sm mt-2">
              集中的に学んでこそ上達。韓国語を本気でマスターしたい方にオススメ
            </p>
          </div>
        </div>

        <div className="px-4 pb-8 space-y-4 max-h-[65vh] overflow-y-auto">
          {/* Main 短期個人レッスン card with progress & skill icons */}
          <div className="rounded-xl bg-white shadow-md overflow-hidden">
            <div className="px-4 py-2.5" style={{ backgroundColor: GOLD }}>
              <h3 className="text-white font-semibold text-sm">『短期個人レッスン』</h3>
            </div>
            <div className="p-4">
              <div className="flex flex-wrap items-start gap-4 mb-4">
                <div className="flex items-center gap-3">
                  <ProgressCircle percent={80} />
                  <span className="text-sm text-gray-600">集中効率</span>
                </div>
                <div className="flex gap-6 flex-1 min-w-[180px]">
                  <div className="flex flex-col items-center gap-1">
                    <div style={{ color: GOLD }}><ListenIcon /></div>
                    <span className="text-xs text-gray-600">聞く</span>
                  </div>
                  <div className="flex flex-col items-center gap-1">
                    <div style={{ color: GOLD }}><ReadIcon /></div>
                    <span className="text-xs text-gray-600">読む</span>
                  </div>
                  <div className="flex flex-col items-center gap-1">
                    <div style={{ color: GOLD }}><WriteIcon /></div>
                    <span className="text-xs text-gray-600">書く</span>
                  </div>
                </div>
              </div>
              <p className="mb-3 text-gray-800 text-sm leading-relaxed">
                語学は集中的に学んでこそ上達します。韓国語を本気でマスターしたい方にオススメの短期集中個人レッスン！自由予約制だから好きな曜日程間にレッスンが可能。週に複数回、もちろん毎日だってＯＫ！
              </p>
              <p className="mb-2 text-gray-800 text-sm leading-relaxed">
                <strong>こんな悩みはありませんか？</strong> 色んな勉強法を試してみたが伸びない、会話に自信が持てない、話す順番がなかなか回ってこない…。信頼できる韓国語講師が責任を持ってあなたをサポートします。
              </p>
              <p className="text-gray-600 text-xs">
                ※12コマ、24コマ、48コマ、72コマのチケットで１コマあたり割安に。自宅が遠い方にはスカイプでマンツーマンレッスン可能。一日で４~５時間まとめて勉強もOK！
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
                  <span className="text-xs text-gray-700">入門・初級・中級・上級 全レベル対象</span>
                </div>
                <div className="bg-white rounded-lg p-3 shadow-sm flex items-start gap-2">
                  <PlaneIcon />
                  <span className="text-xs text-gray-700">韓国留学・滞在前に短期間でレベルアップしたい方</span>
                </div>
                <div className="bg-white rounded-lg p-3 shadow-sm flex items-start gap-2">
                  <BuildingIcon />
                  <span className="text-xs text-gray-700">新宿教室での対面授業</span>
                </div>
                <div className="bg-white rounded-lg p-3 shadow-sm flex items-start gap-2">
                  <LaptopIcon />
                  <span className="text-xs text-gray-700">オンライン授業（Skype又はZoom）</span>
                </div>
              </div>
              <div className="flex flex-wrap gap-3 items-center">
                <span className="text-xs" style={{ color: GOLD }}>どちらでも受講可能 →</span>
              </div>
              <p className="text-gray-400 text-xs mt-2">※対面・オンラインどちらでも受講可能</p>
            </div>
          </div>

          <SectionCard title="日程">
            <ul className="list-disc pl-5 space-y-1">
              <li>火～金 10:00-17:00</li>
              <li>予約制（50分）</li>
            </ul>
          </SectionCard>

          <SectionCard title="カリキュラム">
            <p className="mb-3 font-bold text-gray-800">カリキュラム</p>
            <div className="overflow-x-auto mb-6">
              <table className="w-full border-collapse text-xs min-w-[400px] table-fixed">
                <colgroup>
                  <col style={{ width: "8%" }} />
                  <col style={{ width: "30.67%" }} />
                  <col style={{ width: "30.67%" }} />
                  <col style={{ width: "30.67%" }} />
                </colgroup>
                <thead>
                  <tr>
                    <th colSpan={4} className="p-2.5 text-center font-bold text-white" style={{ backgroundColor: TEAL_DARK }}>初級</th>
                  </tr>
                  <tr>
                    <th className="border border-gray-200 p-1.5 text-center font-semibold bg-white">コマ</th>
                    <th className="border border-gray-200 p-1.5 text-center font-semibold text-white" style={{ backgroundColor: TEAL_MID }}>12コマ</th>
                    <th className="border border-gray-200 p-1.5 text-center font-semibold text-white" style={{ backgroundColor: TEAL_MID }}>24コマ</th>
                    <th className="border border-gray-200 p-1.5 text-center font-semibold text-white" style={{ backgroundColor: TEAL_MID }}>48コマ</th>
                  </tr>
                </thead>
                <tbody>
                  <tr><td className="border border-gray-200 p-1.5 align-top break-words">1</td><td className="border border-gray-200 p-1.5 align-top break-words">発音のルール1・2 発音矯正集中トレーニング1</td><td className="border border-gray-200 p-1.5 align-top break-words">発音のルール1・2 発音矯正集中トレーニング1・2</td><td className="border border-gray-200 p-1.5 align-top break-words">発音のルール1 発音のルール2 発音矯正集中トレーニング1・2・3</td></tr>
                  <tr><td className="border border-gray-200 p-1.5 align-top break-words">4</td><td className="border border-gray-200 p-1.5 align-top break-words">해요/입니다 体 連体形 変則のまとめ 初級 時制, 助詞のまとめ</td><td className="border border-gray-200 p-1.5 align-top break-words"></td><td className="border border-gray-200 p-1.5 align-top break-words"></td></tr>
                  <tr><td className="border border-gray-200 p-1.5 align-top break-words">5</td><td className="border border-gray-200 p-1.5 align-top break-words"></td><td className="border border-gray-200 p-1.5 align-top break-words" style={{ backgroundColor: TEAL_LIGHT }}>ネイティブ抑揚トレーニング1・2・3</td><td className="border border-gray-200 p-1.5 align-top break-words" style={{ backgroundColor: LIME_LIGHT }}>ネイティブ抑揚トレーニング1・2・3・4</td></tr>
                  <tr><td className="border border-gray-200 p-1.5 align-top break-words font-medium">6</td><td className="border border-gray-200 p-1.5 align-top break-words"></td><td className="border border-gray-200 p-1.5 align-top break-words" style={{ backgroundColor: TEAL_LIGHT }}></td><td className="border border-gray-200 p-1.5 align-top break-words" style={{ backgroundColor: LIME_LIGHT }}></td></tr>
                  <tr><td className="border border-gray-200 p-1.5 align-top break-words font-medium">8</td><td className="border border-gray-200 p-1.5 align-top break-words">必須初級単語(全体25%構成)1・2・3</td><td className="border border-gray-200 p-1.5 align-top break-words" style={{ backgroundColor: TEAL_LIGHT }}>音読トレーニング 1・2</td><td className="border border-gray-200 p-1.5 align-top break-words"></td></tr>
                  <tr><td className="border border-gray-200 p-1.5 align-top break-words">10</td><td className="border border-gray-200 p-1.5 align-top break-words"></td><td className="border border-gray-200 p-1.5 align-top break-words">해요/입니다, 初級 敬語 連体形, 助詞の総まとめ 変則,～겠/았었、時制、数字、日付 ～아/어서 vs ～고 初級～아/어 総まとめ 初級理由表現の総まとめ</td><td className="border border-gray-200 p-1.5 align-top break-words">音読トレーニング 1 音読トレーニング 2</td></tr>
                  <tr><td className="border border-gray-200 p-1.5 align-top break-words">11</td><td className="border border-gray-200 p-1.5 align-top break-words">会話トレーニング 1・2</td><td className="border border-gray-200 p-1.5 align-top break-words"></td><td className="border border-gray-200 p-1.5 align-top break-words"></td></tr>
                  <tr><td className="border border-gray-200 p-1.5 align-top break-words">12</td><td className="border border-gray-200 p-1.5 align-top break-words">해요/입니다, 初級 敬語 連体形, 助詞のまとめ 変則のまとめ 겠/았었など 時制, 数字 日付 아/어서 vs 고 初級 아/어 総まとめ 初級 理由表現 総まとめ 意思・可能形 表現のまとめ 初級 부정적 表現のまとめ 対比と推量 願望, お願い, 要求, 助け 試み, 経験 提案, 意見 目的, 計画 初級 条件と仮定</td><td className="border border-gray-200 p-1.5 align-top break-words"></td><td className="border border-gray-200 p-1.5 align-top break-words"></td></tr>
                  <tr><td className="border border-gray-200 p-1.5 align-top break-words font-medium">13</td><td className="border border-gray-200 p-1.5 align-top break-words font-semibold" style={{ backgroundColor: AMBER_COMPLETE }}>12コマ修了 ✔</td><td className="border border-gray-200 p-1.5 align-top break-words"></td><td className="border border-gray-200 p-1.5 align-top break-words"></td></tr>
                  <tr><td className="border border-gray-200 p-1.5 align-top break-words font-medium">17</td><td className="border border-gray-200 p-1.5 align-top break-words" style={{ backgroundColor: GRAY_EMPTY }}></td><td className="border border-gray-200 p-1.5 align-top break-words"></td><td className="border border-gray-200 p-1.5 align-top break-words bg-gray-100">必須初級単語(全体50%構成)1・2・3・4</td></tr>
                  <tr><td className="border border-gray-200 p-1.5 align-top break-words font-medium">21~24</td><td className="border border-gray-200 p-1.5 align-top break-words" style={{ backgroundColor: GRAY_EMPTY }}></td><td className="border border-gray-200 p-1.5 align-top break-words">会話トレーニング 1・2・3・4</td><td className="border border-gray-200 p-1.5 align-top break-words"></td></tr>
                  <tr><td className="border border-gray-200 p-1.5 align-top break-words font-medium">25</td><td className="border border-gray-200 p-1.5 align-top break-words" style={{ backgroundColor: GRAY_EMPTY }}></td><td className="border border-gray-200 p-1.5 align-top break-words font-semibold" style={{ backgroundColor: AMBER_COMPLETE }}>24コマ修了 ✔</td><td className="border border-gray-200 p-1.5 align-top break-words"></td></tr>
                  <tr><td className="border border-gray-200 p-1.5 align-top break-words font-medium">27~33</td><td className="border border-gray-200 p-1.5 align-top break-words" style={{ backgroundColor: GRAY_EMPTY }}></td><td className="border border-gray-200 p-1.5 align-top break-words" style={{ backgroundColor: GRAY_EMPTY }}></td><td className="border border-gray-200 p-1.5 align-top break-words">必須初級単語(100%構成)1・2・3・4・5・6・7</td></tr>
                  <tr><td className="border border-gray-200 p-1.5 align-top break-words font-medium">34~37</td><td className="border border-gray-200 p-1.5 align-top break-words" style={{ backgroundColor: GRAY_EMPTY }}></td><td className="border border-gray-200 p-1.5 align-top break-words" style={{ backgroundColor: GRAY_EMPTY }}></td><td className="border border-gray-200 p-1.5 align-top break-words">初級 必須表現1・2・3・4</td></tr>
                  <tr><td className="border border-gray-200 p-1.5 align-top break-words font-medium">38~40</td><td className="border border-gray-200 p-1.5 align-top break-words" style={{ backgroundColor: GRAY_EMPTY }}></td><td className="border border-gray-200 p-1.5 align-top break-words" style={{ backgroundColor: GRAY_EMPTY }}></td><td className="border border-gray-200 p-1.5 align-top break-words">TOPIK Ⅱ 作文対策1・2・3</td></tr>
                  <tr><td className="border border-gray-200 p-1.5 align-top break-words font-medium">41~48</td><td className="border border-gray-200 p-1.5 align-top break-words" style={{ backgroundColor: GRAY_EMPTY }}></td><td className="border border-gray-200 p-1.5 align-top break-words" style={{ backgroundColor: GRAY_EMPTY }}></td><td className="border border-gray-200 p-1.5 align-top break-words">会話トレーニング 1・2・3・4・5・7・8</td></tr>
                  <tr><td className="border border-gray-200 p-1.5 align-top break-words font-medium">49</td><td className="border border-gray-200 p-1.5 align-top break-words" style={{ backgroundColor: GRAY_EMPTY }}></td><td className="border border-gray-200 p-1.5 align-top break-words" style={{ backgroundColor: GRAY_EMPTY }}></td><td className="border border-gray-200 p-1.5 align-top break-words font-semibold" style={{ backgroundColor: AMBER_COMPLETE }}>48コマ修了 ✔</td></tr>
                </tbody>
              </table>
            </div>
            <div className="overflow-x-auto mb-6">
              <table className="w-full border-collapse text-xs min-w-[400px] table-fixed">
                <colgroup>
                  <col style={{ width: "8%" }} />
                  <col style={{ width: "30.67%" }} />
                  <col style={{ width: "30.67%" }} />
                  <col style={{ width: "30.67%" }} />
                </colgroup>
                <thead>
                  <tr>
                    <th colSpan={4} className="p-2.5 text-center font-bold text-white" style={{ backgroundColor: TEAL_DARK }}>中級</th>
                  </tr>
                  <tr>
                    <th className="border border-gray-200 p-1.5 text-center font-semibold bg-white">コマ</th>
                    <th className="border border-gray-200 p-1.5 text-center font-semibold text-white" style={{ backgroundColor: TEAL_MID }}>12コマ</th>
                    <th className="border border-gray-200 p-1.5 text-center font-semibold text-white" style={{ backgroundColor: TEAL_MID }}>24コマ</th>
                    <th className="border border-gray-200 p-1.5 text-center font-semibold text-white" style={{ backgroundColor: TEAL_MID }}>48コマ</th>
                  </tr>
                </thead>
                <tbody>
                  <tr><td className="border border-gray-200 p-1.5 align-top break-words">1</td><td className="border border-gray-200 p-1.5 align-top break-words">発音のルール1・2 発音矯正集中トレーニング1</td><td className="border border-gray-200 p-1.5 align-top break-words">発音のルール1・2 発音矯正集中トレーニング1・2</td><td className="border border-gray-200 p-1.5 align-top break-words">発音のルール1・2 発音矯正集中トレーニング 1・2・3</td></tr>
                  <tr><td className="border border-gray-200 p-1.5 align-top break-words">4</td><td className="border border-gray-200 p-1.5 align-top break-words">推量と予想表現 文章体と반말体 中級 理由 総まとめ(거든요, 잖아요 等) 初中級 間接話法</td><td className="border border-gray-200 p-1.5 align-top break-words"></td><td className="border border-gray-200 p-1.5 align-top break-words"></td></tr>
                  <tr><td className="border border-gray-200 p-1.5 align-top break-words">5</td><td className="border border-gray-200 p-1.5 align-top break-words"></td><td className="border border-gray-200 p-1.5 align-top break-words" style={{ backgroundColor: TEAL_LIGHT }}>ネイティブ抑揚トレーニング 1・2・3</td><td className="border border-gray-200 p-1.5 align-top break-words"></td></tr>
                  <tr><td className="border border-gray-200 p-1.5 align-top break-words">6</td><td className="border border-gray-200 p-1.5 align-top break-words"></td><td className="border border-gray-200 p-1.5 align-top break-words" style={{ backgroundColor: TEAL_LIGHT }}>ネイティブ抑揚トレーニング 1・2・3・4</td><td className="border border-gray-200 p-1.5 align-top break-words"></td></tr>
                  <tr><td className="border border-gray-200 p-1.5 align-top break-words">8</td><td className="border border-gray-200 p-1.5 align-top break-words">必須中級単語(全体25%構成) 1・2・3</td><td className="border border-gray-200 p-1.5 align-top break-words" style={{ backgroundColor: TEAL_LIGHT }}>音読トレーニング 1・2</td><td className="border border-gray-200 p-1.5 align-top break-words"></td></tr>
                  <tr><td className="border border-gray-200 p-1.5 align-top break-words">10</td><td className="border border-gray-200 p-1.5 align-top break-words"></td><td className="border border-gray-200 p-1.5 align-top break-words">推量과 予想 表現 文正体とタメ口体 中級 理由 総まとめ(거든요, 잖아요など) 初中級 間接話法 使役/受身 決心と意図(～ㄹ까하다,～려던 참이다など) 回想を表す 表現のまとめ(～더,～던)</td><td className="border border-gray-200 p-1.5 align-top break-words">音読トレーニング 1・2</td></tr>
                  <tr><td className="border border-gray-200 p-1.5 align-top break-words">11</td><td className="border border-gray-200 p-1.5 align-top break-words">会話トレーニング 1・2</td><td className="border border-gray-200 p-1.5 align-top break-words"></td><td className="border border-gray-200 p-1.5 align-top break-words"></td></tr>
                  <tr><td className="border border-gray-200 p-1.5 align-top break-words">12</td><td className="border border-gray-200 p-1.5 align-top break-words">音読トレーニング 2 推量と予想 表現 文正体とタメ口体 中級の理由表現の総まとめ(～거든요,～잖아요など) 初中級の間接話法 使役/受身 決心と意図(～ㄹ까하다,～려던 참이다など) 回想を表す表現のまとめ(～더,～던) 中級条件の表現(～아/어야,～거든などを含む) 条件を表す表現 -다가 시리즈 整理 -고 보니 vs -아/어 보니 整理 中級 仮定 表現 総まとめ 上級になるための文法</td><td className="border border-gray-200 p-1.5 align-top break-words"></td><td className="border border-gray-200 p-1.5 align-top break-words"></td></tr>
                  <tr><td className="border border-gray-200 p-1.5 align-top break-words">13</td><td className="border border-gray-200 p-1.5 align-top break-words font-semibold" style={{ backgroundColor: AMBER_COMPLETE }}>12コマ修了 ✔</td><td className="border border-gray-200 p-1.5 align-top break-words"></td><td className="border border-gray-200 p-1.5 align-top break-words"></td></tr>
                  <tr><td className="border border-gray-200 p-1.5 align-top break-words">17</td><td className="border border-gray-200 p-1.5 align-top break-words" style={{ backgroundColor: GRAY_EMPTY }}></td><td className="border border-gray-200 p-1.5 align-top break-words" style={{ backgroundColor: GRAY_EMPTY }}></td><td className="border border-gray-200 p-1.5 align-top break-words bg-gray-100">必須中級単語(全体50%構成) 1・2・3・4</td></tr>
                  <tr><td className="border border-gray-200 p-1.5 align-top break-words">21</td><td className="border border-gray-200 p-1.5 align-top break-words" style={{ backgroundColor: GRAY_EMPTY }}></td><td className="border border-gray-200 p-1.5 align-top break-words">会話トレーニング 1・2・3・4</td><td className="border border-gray-200 p-1.5 align-top break-words"></td></tr>
                  <tr><td className="border border-gray-200 p-1.5 align-top break-words">25</td><td className="border border-gray-200 p-1.5 align-top break-words" style={{ backgroundColor: GRAY_EMPTY }}></td><td className="border border-gray-200 p-1.5 align-top break-words font-semibold" style={{ backgroundColor: AMBER_COMPLETE }}>24コマ修了 ✔</td><td className="border border-gray-200 p-1.5 align-top break-words"></td></tr>
                  <tr><td className="border border-gray-200 p-1.5 align-top break-words">27~33</td><td className="border border-gray-200 p-1.5 align-top break-words" style={{ backgroundColor: GRAY_EMPTY }}></td><td className="border border-gray-200 p-1.5 align-top break-words" style={{ backgroundColor: GRAY_EMPTY }}></td><td className="border border-gray-200 p-1.5 align-top break-words">必須中級単語(100%構成) 1・2・3・4・5・6・7</td></tr>
                  <tr><td className="border border-gray-200 p-1.5 align-top break-words">34~37</td><td className="border border-gray-200 p-1.5 align-top break-words" style={{ backgroundColor: GRAY_EMPTY }}></td><td className="border border-gray-200 p-1.5 align-top break-words" style={{ backgroundColor: GRAY_EMPTY }}></td><td className="border border-gray-200 p-1.5 align-top break-words">中級必須表現 1・2・3・4</td></tr>
                  <tr><td className="border border-gray-200 p-1.5 align-top break-words">38~40</td><td className="border border-gray-200 p-1.5 align-top break-words" style={{ backgroundColor: GRAY_EMPTY }}></td><td className="border border-gray-200 p-1.5 align-top break-words" style={{ backgroundColor: GRAY_EMPTY }}></td><td className="border border-gray-200 p-1.5 align-top break-words">TOPIK 5級目標 作文対策 1・2・3</td></tr>
                  <tr><td className="border border-gray-200 p-1.5 align-top break-words">41~48</td><td className="border border-gray-200 p-1.5 align-top break-words" style={{ backgroundColor: GRAY_EMPTY }}></td><td className="border border-gray-200 p-1.5 align-top break-words" style={{ backgroundColor: GRAY_EMPTY }}></td><td className="border border-gray-200 p-1.5 align-top break-words">会話トレーニング 1・2・3・4・5・6・7・8</td></tr>
                  <tr><td className="border border-gray-200 p-1.5 align-top break-words">49</td><td className="border border-gray-200 p-1.5 align-top break-words" style={{ backgroundColor: GRAY_EMPTY }}></td><td className="border border-gray-200 p-1.5 align-top break-words" style={{ backgroundColor: GRAY_EMPTY }}></td><td className="border border-gray-200 p-1.5 align-top break-words font-semibold" style={{ backgroundColor: AMBER_COMPLETE }}>48コマ修了 ✔</td></tr>
                </tbody>
              </table>
            </div>
            <p className="mb-3 font-bold text-gray-800">上級</p>
            <div className="overflow-x-auto">
              <table className="w-full border-collapse text-xs min-w-[400px] table-fixed">
                <colgroup>
                  <col style={{ width: "8%" }} />
                  <col style={{ width: "30.67%" }} />
                  <col style={{ width: "30.67%" }} />
                  <col style={{ width: "30.67%" }} />
                </colgroup>
                <thead>
                  <tr>
                    <th colSpan={4} className="p-2.5 text-center font-bold text-white" style={{ backgroundColor: TEAL_DARK }}>上級</th>
                  </tr>
                  <tr>
                    <th className="border border-gray-200 p-1.5 text-center font-semibold bg-white">コマ</th>
                    <th className="border border-gray-200 p-1.5 text-center font-semibold text-white" style={{ backgroundColor: TEAL_MID }}>12コマ</th>
                    <th className="border border-gray-200 p-1.5 text-center font-semibold text-white" style={{ backgroundColor: TEAL_MID }}>24コマ</th>
                    <th className="border border-gray-200 p-1.5 text-center font-semibold text-white" style={{ backgroundColor: TEAL_MID }}>48コマ</th>
                  </tr>
                </thead>
                <tbody>
                  <tr><td className="border border-gray-200 p-1.5 align-top break-words">1</td><td className="border border-gray-200 p-1.5 align-top break-words">発音のルール1・2 発音矯正集中トレーニング1</td><td className="border border-gray-200 p-1.5 align-top break-words">発音のルール1・2 発音矯正集中トレーニング1・2・3</td><td className="border border-gray-200 p-1.5 align-top break-words">発音のルール1・2 発音矯正集中トレーニング1・2・3</td></tr>
                  <tr><td className="border border-gray-200 p-1.5 align-top break-words">4</td><td className="border border-gray-200 p-1.5 align-top break-words">上級変化表現(～에 따라,～음에 따라,～어서부터) 上級引用文法 上級否定表現 上級状況表現(마당에/판국에/状況に/참에/통에)</td><td className="border border-gray-200 p-1.5 align-top break-words"></td><td className="border border-gray-200 p-1.5 align-top break-words"></td></tr>
                  <tr><td className="border border-gray-200 p-1.5 align-top break-words">5</td><td className="border border-gray-200 p-1.5 align-top break-words"></td><td className="border border-gray-200 p-1.5 align-top break-words" style={{ backgroundColor: TEAL_LIGHT }}>ネイティブ抑揚トレーニング1・2・3</td><td className="border border-gray-200 p-1.5 align-top break-words" style={{ backgroundColor: LIME_LIGHT }}>ネイティブ抑揚トレーニング1・2・3・4</td></tr>
                  <tr><td className="border border-gray-200 p-1.5 align-top break-words">8</td><td className="border border-gray-200 p-1.5 align-top break-words">必須上級単語(全体25%構成)1・2・3</td><td className="border border-gray-200 p-1.5 align-top break-words" style={{ backgroundColor: TEAL_LIGHT }}>音読トレーニング 1・2</td><td className="border border-gray-200 p-1.5 align-top break-words"></td></tr>
                  <tr><td className="border border-gray-200 p-1.5 align-top break-words">10</td><td className="border border-gray-200 p-1.5 align-top break-words"></td><td className="border border-gray-200 p-1.5 align-top break-words">上級変化表現 上級引用文法 上級否定表現 上級状況表現 上級推量表現 上級条件表現 ネイティブが使う韓国語 表現 1</td><td className="border border-gray-200 p-1.5 align-top break-words">音読トレーニング 1 音読トレーニング 2</td></tr>
                  <tr><td className="border border-gray-200 p-1.5 align-top break-words">11</td><td className="border border-gray-200 p-1.5 align-top break-words">会話トレーニング 1 会話トレーニング 2</td><td className="border border-gray-200 p-1.5 align-top break-words"></td><td className="border border-gray-200 p-1.5 align-top break-words"></td></tr>
                  <tr><td className="border border-gray-200 p-1.5 align-top break-words">12</td><td className="border border-gray-200 p-1.5 align-top break-words">上級変化表現 上級引用文法 上級否定表現 上級状況表現 上級推量表現 上級条件表現 ネイティブが使う韓国語表現 1・2 追加と含む 習慣과 態度 状況や基準を表す 表現 強調表現 上級敬語 深化 事のすべて 上級必須反語</td><td className="border border-gray-200 p-1.5 align-top break-words"></td><td className="border border-gray-200 p-1.5 align-top break-words"></td></tr>
                  <tr><td className="border border-gray-200 p-1.5 align-top break-words">13</td><td className="border border-gray-200 p-1.5 align-top break-words font-semibold" style={{ backgroundColor: AMBER_COMPLETE }}>12コマ修了 ✔</td><td className="border border-gray-200 p-1.5 align-top break-words"></td><td className="border border-gray-200 p-1.5 align-top break-words"></td></tr>
                  <tr><td className="border border-gray-200 p-1.5 align-top break-words">17</td><td className="border border-gray-200 p-1.5 align-top break-words" style={{ backgroundColor: GRAY_EMPTY }}></td><td className="border border-gray-200 p-1.5 align-top break-words" style={{ backgroundColor: GRAY_EMPTY }}></td><td className="border border-gray-200 p-1.5 align-top break-words bg-gray-100">必須上級単語(全体50%構成)1・2・3・4</td></tr>
                  <tr><td className="border border-gray-200 p-1.5 align-top break-words">21</td><td className="border border-gray-200 p-1.5 align-top break-words">会話トレーニング 1</td><td className="border border-gray-200 p-1.5 align-top break-words"></td><td className="border border-gray-200 p-1.5 align-top break-words"></td></tr>
                  <tr><td className="border border-gray-200 p-1.5 align-top break-words">25</td><td className="border border-gray-200 p-1.5 align-top break-words" style={{ backgroundColor: GRAY_EMPTY }}></td><td className="border border-gray-200 p-1.5 align-top break-words font-semibold" style={{ backgroundColor: AMBER_COMPLETE }}>24コマ修了 ✔</td><td className="border border-gray-200 p-1.5 align-top break-words"></td></tr>
                  <tr><td className="border border-gray-200 p-1.5 align-top break-words">27~33</td><td className="border border-gray-200 p-1.5 align-top break-words" style={{ backgroundColor: GRAY_EMPTY }}></td><td className="border border-gray-200 p-1.5 align-top break-words" style={{ backgroundColor: GRAY_EMPTY }}></td><td className="border border-gray-200 p-1.5 align-top break-words">必須上級単語(100%構成)1・2・3・4・5・6・7</td></tr>
                  <tr><td className="border border-gray-200 p-1.5 align-top break-words">34~37</td><td className="border border-gray-200 p-1.5 align-top break-words" style={{ backgroundColor: GRAY_EMPTY }}></td><td className="border border-gray-200 p-1.5 align-top break-words" style={{ backgroundColor: GRAY_EMPTY }}></td><td className="border border-gray-200 p-1.5 align-top break-words">ネイティブのようになる、上級必須表現1・2・3・4</td></tr>
                  <tr><td className="border border-gray-200 p-1.5 align-top break-words">38-40</td><td className="border border-gray-200 p-1.5 align-top break-words" style={{ backgroundColor: GRAY_EMPTY }}></td><td className="border border-gray-200 p-1.5 align-top break-words" style={{ backgroundColor: GRAY_EMPTY }}></td><td className="border border-gray-200 p-1.5 align-top break-words">TOPIK5,6級を目指す作文対策1・2・3</td></tr>
                  <tr><td className="border border-gray-200 p-1.5 align-top break-words">41~48</td><td className="border border-gray-200 p-1.5 align-top break-words" style={{ backgroundColor: GRAY_EMPTY }}></td><td className="border border-gray-200 p-1.5 align-top break-words" style={{ backgroundColor: GRAY_EMPTY }}></td><td className="border border-gray-200 p-1.5 align-top break-words">会話トレーニング1・2・3・4・5・6・7・8</td></tr>
                  <tr><td className="border border-gray-200 p-1.5 align-top break-words">49</td><td className="border border-gray-200 p-1.5 align-top break-words" style={{ backgroundColor: GRAY_EMPTY }}></td><td className="border border-gray-200 p-1.5 align-top break-words" style={{ backgroundColor: GRAY_EMPTY }}></td><td className="border border-gray-200 p-1.5 align-top break-words font-semibold" style={{ backgroundColor: AMBER_COMPLETE }}>48コマ修了 ✔</td></tr>
                </tbody>
              </table>
            </div>
          </SectionCard>

          <SectionCard title="テキスト">
            <p>ミリネ韓国語テキスト１，２，３，４</p>
          </SectionCard>

          <SectionCard title="進め方">
            <ol className="list-decimal pl-5 space-y-1">
              <li>テキスト本文の理解（音読、和訳、発音指導、オバーラッピング、シャドーイング）</li>
              <li>文法、語彙、表現の学習（音読、和訳、発音指導）</li>
              <li>練習問題（作文、音読、聞き取り、聞き逃した箇所の和訳）</li>
              <li>学んだことは次回に復習（講師：日本語→生徒さん：韓国語に訳して声に出す）</li>
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
                    <th className="border border-gray-200 p-2 text-left">授業料（税込）</th>
                    <th className="border border-gray-200 p-2 text-left">使用期限</th>
                  </tr>
                </thead>
                <tbody>
                  <tr><td className="border border-gray-200 p-2">12回</td><td className="border border-gray-200 p-2">4,280円</td><td className="border border-gray-200 p-2">56,496円</td><td className="border border-gray-200 p-2">1ヶ月</td></tr>
                  <tr className="bg-gray-50"><td className="border border-gray-200 p-2">24回</td><td className="border border-gray-200 p-2">3,880円</td><td className="border border-gray-200 p-2">102,432円</td><td className="border border-gray-200 p-2">2ヶ月</td></tr>
                  <tr><td className="border border-gray-200 p-2">48回</td><td className="border border-gray-200 p-2">3,580円</td><td className="border border-gray-200 p-2">189,024円</td><td className="border border-gray-200 p-2">3ヶ月</td></tr>
                  <tr className="bg-gray-50"><td className="border border-gray-200 p-2">72回</td><td className="border border-gray-200 p-2">3,380円</td><td className="border border-gray-200 p-2">267,696円</td><td className="border border-gray-200 p-2">5ヶ月</td></tr>
                </tbody>
              </table>
            </div>
          </SectionCard>

          <SectionCard title="『生徒の声』">
            <div className="space-y-4">
              <div className="border-l-2 pl-3" style={{ borderColor: GOLD }}>
                <p className="font-semibold text-gray-800">A様｜48コマコース｜2020.1</p>
                <p className="mt-1 text-gray-700">約2か月間という短い期間でしたが、すごく充実した時間になりました。毎日2，3コマずつでも続けられました。教科書の内容に合わせながら、韓国の文化について教えてくださるのも魅力の１つでした。</p>
              </div>
              <div className="border-l-2 pl-3" style={{ borderColor: GOLD }}>
                <p className="font-semibold text-gray-800">Y様｜24コマコース｜2020.2</p>
                <p className="mt-1 text-gray-700">約1か月間通って、頭の中に自然と韓国語が浮かぶ瞬間が増えてきたと思います。少しずつ語彙力がついて表現できるようになってきました。毎週通って、ますます韓国語が好きになりました。</p>
              </div>
              <div className="border-l-2 pl-3" style={{ borderColor: GOLD }}>
                <p className="font-semibold text-gray-800">K様｜48コマコース｜2020.3</p>
                <p className="mt-1 text-gray-700">48時間大変お世話になりました。自分で言いたい事を韓国語で話せるようになることがとても楽しく思えました。毎日、前回の復習をして、習った語彙と文法を使いながらお話をする時間があったことはとてもためになりました。</p>
              </div>
              <div className="border-l-2 pl-3" style={{ borderColor: GOLD }}>
                <p className="font-semibold text-gray-800">H様｜24コマコース｜2018.11</p>
                <p className="mt-1 text-gray-700">留学前に24回コースに通いました。スピーキングに自信がなかったので、マンツーマンで発音を教えてくださってとても勉強になりました。集中して勉強が出来て自信になりました。</p>
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
            href={TANKI_URL}
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
