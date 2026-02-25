"use client";

import Link from "next/link";
import { useSearchParams } from "next/navigation";
import { Suspense, useState, useEffect } from "react";

const BLOG_URL = "https://mirinae.jp/blog/?cat=2";
const ITEMS_PER_PAGE = 20;

function DailyKoreanContent() {
  const searchParams = useSearchParams();
  const [seikatsuList, setSeikatsuList] = useState<string[]>([]);
  const [listLoading, setListLoading] = useState(true);
  const [expandedTitle, setExpandedTitle] = useState<string | null>(null);
  const [content, setContent] = useState<{ html: string; url: string } | null>(null);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [currentPage, setCurrentPage] = useState(1);

  useEffect(() => {
    fetch("/api/dailykorean-list")
      .then((r) => r.json())
      .then((data) => {
        if (Array.isArray(data)) setSeikatsuList(data);
      })
      .catch(() => setSeikatsuList([]))
      .finally(() => setListLoading(false));
  }, []);

  useEffect(() => {
    const t = searchParams.get("title") || searchParams.get("q") || null;
    if (t && seikatsuList.includes(t)) {
      setExpandedTitle(t);
      setCurrentPage(Math.floor(seikatsuList.indexOf(t) / ITEMS_PER_PAGE) + 1);
    }
  }, [searchParams, seikatsuList]);

  const totalPages = Math.ceil(seikatsuList.length / ITEMS_PER_PAGE) || 1;
  const startIdx = (currentPage - 1) * ITEMS_PER_PAGE;
  const pageItems = seikatsuList.slice(startIdx, startIdx + ITEMS_PER_PAGE);

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
          {listLoading ? (
            <li className="py-12 text-center text-gray-500">読み込み中...</li>
          ) : pageItems.length === 0 ? (
            <li className="py-12 text-center text-gray-500">該当する記事がありません</li>
          ) : (
            pageItems.map((title, i) => (
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
            ))
          )}
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

export default function DailyKoreanPage() {
  return (
    <Suspense fallback={<div className="min-h-screen bg-[#f5f5f5] p-4 flex items-center justify-center">読み込み中...</div>}>
      <DailyKoreanContent />
    </Suspense>
  );
}
