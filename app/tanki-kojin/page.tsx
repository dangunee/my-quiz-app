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

function SectionCard({
  title,
  children,
}: {
  title: string;
  children: React.ReactNode;
}) {
  return (
    <div className="rounded-xl border border-gray-200 bg-white shadow-sm overflow-hidden">
      <div className="px-4 py-2.5" style={{ backgroundColor: GOLD }}>
        <h3 className="text-white font-semibold text-sm">{title}</h3>
      </div>
      <div className="p-4 text-gray-800 text-sm leading-relaxed">{children}</div>
    </div>
  );
}

export default function TankiKojinPage() {
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
            <h1 className="text-2xl font-bold text-gray-800">短期個人レッスン</h1>
            <p className="text-gray-600 text-sm mt-2">
              集中的に学んでこそ上達。韓国語を本気でマスターしたい方にオススメ
            </p>
          </div>
        </div>

        <div className="space-y-4 max-h-[60vh] overflow-y-auto">
          <SectionCard title="『短期個人レッスン』">
            <p className="mb-3">
              <strong>こんな悩みはありませんか？</strong>
            </p>
            <ul className="list-disc pl-5 space-y-1 mb-3">
              <li>色んな勉強法を試してみたが、伸びない。</li>
              <li>文法はある程度マスターしたつもりだけど、会話に自信が持てない</li>
              <li>グループレッスンを受けているが、話す順番がなかなか回ってこない</li>
              <li>基礎から学びたいけど、何をどうしたらいいかわからない</li>
              <li>仕事で韓国語が必要で自分に合わせた指導が必要</li>
            </ul>
            <p className="mb-2">語学は集中的に学んでこそ上達します。韓国語を本気でマスターしたい方にオススメの短期集中個人レッスン！</p>
            <p className="mb-2">自由予約制だから好きな曜日程間にレッスンが可能！週に複数回、もちろん毎日だってＯＫ！</p>
            <p className="text-gray-600 text-xs">
              ※短期集中個人レッスンとは：通常の個人レッスンチケットよりも短期間で集中的に勉強するチケット（12コマ、24コマ、48コマ、72コマ）を購入いただくことで１コマあたりのお値段が割安になるレッスンです。
            </p>
            <p className="mt-2 font-semibold">語学は毎日続けないと上達できません。ミリネで韓国語留学！</p>
            <p>信頼できる韓国語講師が責任を持ってあなたをサポートします。自宅が遠くて通えない方にはスカイプでマンツーマンレッスンが可能です。毎日来られないという方もまとめて一日で４~５時間一気に勉強するなど、韓国語漬けにできます！</p>
          </SectionCard>

          <SectionCard title="対象">
            <ul className="list-disc pl-5 space-y-1">
              <li>入門・初級・中級・上級、全レベル対象</li>
              <li>韓国留学、韓国滞在前に、短期間でレベルアップしたい方</li>
            </ul>
          </SectionCard>

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
