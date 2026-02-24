import Link from "next/link";

const SEIKATSU_LIST = [
  "生活韓国語300［交通違反］",
  "生活韓国語299.［物価］",
  "生活韓国語298.［歯がしみる］",
  "生活韓国語297.［パワハラ］",
  "生活韓国語296.［更年期］",
  "生活韓国語295.［告白］",
  "生活韓国語294.［姿勢］",
  "生活韓国語293.［お腹の肉］",
  "生活韓国語292.［お年玉］",
  "生活韓国語291.［新年目標］",
  "生活韓国語290.［プレゼント］",
  "生活韓国語289.【初恋】",
  "生活韓国語288.【バイト】",
  "生活韓国語287.［内視鏡］",
  "生活韓国語286.［W杯］",
  "生活韓国語285.［受験］",
  "生活韓国語284.【紅葉】",
  "生活韓国語283.［ニュース］",
  "生活韓国語282.［登山］",
  "生活韓国語281.［円安］",
  "生活韓国語280.［アル中］",
  "生活韓国語279.［食堂の予約］",
  "生活韓国語278.［上京］",
  "生活韓国語277.［水害］",
  "生活韓国語276.［膳立て］",
  "生活韓国語275.［桃］",
  "生活韓国語274.［不眠症］",
  "生活韓国語273.［墓］",
  "生活韓国語272.［換気］",
  "生活韓国語271.［臭い］",
];

const BLOG_URL = "https://mirinae.jp/blog/?cat=2";

export default function SeikatsuPage() {
  return (
    <div className="min-h-screen bg-[#f5f5f5] p-4">
      <div className="max-w-2xl mx-auto bg-white rounded-2xl shadow-lg p-6">
        <div className="mb-6">
          <Link
            href="/"
            className="text-[#0ea5e9] hover:underline text-sm mb-4 inline-block"
          >
            ← クイズに戻る
          </Link>
          <h1 className="text-2xl font-bold text-gray-800">生活韓国語</h1>
          <p className="text-gray-600 text-sm mt-2">
            知っておくと役に立つ韓国語
          </p>
        </div>

        <a
          href={BLOG_URL}
          target="_blank"
          rel="noopener noreferrer"
          className="block w-full py-3 px-4 mb-6 bg-[#0ea5e9] text-white text-center font-semibold rounded-xl hover:bg-[#0284c7] transition-colors"
        >
          すべての記事を見る（ミリネブログ）
        </a>

        <ul className="space-y-0 border-t border-gray-200">
          {SEIKATSU_LIST.map((title, i) => (
            <li key={i} className="border-b border-gray-100 last:border-b-0">
              <a
                href={BLOG_URL}
                target="_blank"
                rel="noopener noreferrer"
                className="block py-3 px-2 text-gray-800 hover:text-[#0ea5e9] hover:bg-gray-50 transition-colors"
              >
                {title}
              </a>
            </li>
          ))}
        </ul>
      </div>
    </div>
  );
}
