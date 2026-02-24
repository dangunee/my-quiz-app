"use client";

import Link from "next/link";
import { useState, useEffect } from "react";

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
const ITEMS_PER_PAGE = 10;

export default function DailyKoreanPage() {
  const [expandedTitle, setExpandedTitle] = useState<string | null>(null);
  const [content, setContent] = useState<{ html: string; url: string } | null>(null);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [currentPage, setCurrentPage] = useState(1);

  const totalPages = Math.ceil(SEIKATSU_LIST.length / ITEMS_PER_PAGE);
  const startIdx = (currentPage - 1) * ITEMS_PER_PAGE;
  const pageItems = SEIKATSU_LIST.slice(startIdx, startIdx + ITEMS_PER_PAGE);

  const goToPage = (page: number) => {
    const p = Math.max(1, Math.min(page, totalPages));
    setCurrentPage(p);
    setExpandedTitle(null);
  };

  const getPageNumbers = () => {
    const delta = 2;
    const range: number[] = [];
    const rangeStart = Math.max(1, currentPage - delta);
    const rangeEnd = Math.min(totalPages, currentPage + delta);
    for (let i = rangeStart; i <= rangeEnd; i++) range.push(i);
    return range;
  };

  useEffect(() => {
    if (!expandedTitle) {
      setContent(null);
      setError(null);
      return;
    }
    setLoading(true);
    setError(null);
    fetch(`/api/dailykorean-blog?title=${encodeURIComponent(expandedTitle)}`)
      .then((r) => r.json())
      .then((data) => {
        if (data.error && !data.html) {
          setError(data.error);
          setContent(null);
        } else {
          setContent({ html: data.html || "", url: data.url || "" });
          setError(null);
        }
      })
      .catch((err) => {
        setError(err.message || "読み込みに失敗しました");
        setContent(null);
      })
      .finally(() => setLoading(false));
  }, [expandedTitle]);

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
          <h1 className="text-2xl font-bold text-gray-800">生活韓国語</h1>
          <p className="text-gray-600 text-sm mt-2">
            知っておくと役に立つ韓国語
          </p>
        </div>

        <ul className="divide-y divide-gray-200">
          {pageItems.map((title, i) => (
            <li key={i} className="border-b border-gray-200 last:border-b-0">
              <button
                type="button"
                onClick={() =>
                  setExpandedTitle((prev) => (prev === title ? null : title))
                }
                className="w-full text-left py-3 px-4 text-gray-800 text-sm flex items-center justify-between gap-2 hover:bg-gray-50"
              >
                <span>{title}</span>
                <span
                  className={`shrink-0 text-gray-400 transition-transform ${
                    expandedTitle === title ? "rotate-180" : ""
                  }`}
                >
                  ▼
                </span>
              </button>
              {expandedTitle === title && (
                <div className="border-t border-gray-200 bg-gray-50 overflow-hidden">
                  <div className="max-h-[500px] overflow-y-auto p-4">
                    {loading ? (
                      <p className="text-center text-gray-500 py-8">読み込み中...</p>
                    ) : error ? (
                      <p className="text-center text-red-500 py-4">{error}</p>
                    ) : content?.html ? (
                      <div
                        className="kotae-blog-content text-gray-800"
                        dangerouslySetInnerHTML={{ __html: content.html }}
                      />
                    ) : null}
                  </div>
                  {content?.url && (
                    <a
                      href={content.url}
                      target="_blank"
                      rel="noopener noreferrer"
                      className="block py-2 px-4 text-center text-xs text-[#0ea5e9] hover:underline border-t border-gray-200"
                    >
                      ブログで続きを読む →
                    </a>
                  )}
                </div>
              )}
            </li>
          ))}
        </ul>

        {totalPages > 1 && (
          <div className="flex flex-wrap items-center justify-center gap-0 py-4 px-4 border-t border-gray-200 bg-white">
            <nav className="inline-flex rounded-lg overflow-hidden border border-gray-300">
              <button
                type="button"
                onClick={() => goToPage(1)}
                disabled={currentPage === 1}
                className="px-3 py-1.5 text-sm text-[#0ea5e9] bg-white border-r border-gray-300 hover:bg-gray-50 disabled:opacity-50 disabled:cursor-not-allowed"
              >
                &laquo;
              </button>
              <button
                type="button"
                onClick={() => goToPage(currentPage - 1)}
                disabled={currentPage === 1}
                className="px-3 py-1.5 text-sm text-[#0ea5e9] bg-white border-r border-gray-300 hover:bg-gray-50 disabled:opacity-50 disabled:cursor-not-allowed"
              >
                &lt; Prev
              </button>
              {getPageNumbers().map((p) => (
                <button
                  key={p}
                  type="button"
                  onClick={() => goToPage(p)}
                  className={`px-3 py-1.5 text-sm border-r border-gray-300 ${
                    currentPage === p
                      ? "bg-[#0ea5e9] text-white"
                      : "text-[#0ea5e9] bg-white hover:bg-gray-50"
                  }`}
                >
                  {p}
                </button>
              ))}
              <button
                type="button"
                onClick={() => goToPage(currentPage + 1)}
                disabled={currentPage === totalPages}
                className="px-3 py-1.5 text-sm text-[#0ea5e9] bg-white border-r border-gray-300 hover:bg-gray-50 disabled:opacity-50 disabled:cursor-not-allowed"
              >
                Next &gt;
              </button>
              <button
                type="button"
                onClick={() => goToPage(totalPages)}
                disabled={currentPage === totalPages}
                className="px-3 py-1.5 text-sm text-[#0ea5e9] bg-white hover:bg-gray-50 disabled:opacity-50 disabled:cursor-not-allowed border-r-0"
              >
                &raquo;
              </button>
            </nav>
          </div>
        )}

        <div className="p-4 border-t border-gray-200 bg-gray-50">
          <a
            href={BLOG_URL}
            target="_blank"
            rel="noopener noreferrer"
            className="block w-full py-3 px-4 bg-[#0ea5e9] text-white text-center font-semibold rounded-xl hover:bg-[#0284c7] transition-colors"
          >
            すべての記事を見る（ミリネブログ）
          </a>
        </div>
      </div>
    </div>
  );
}
