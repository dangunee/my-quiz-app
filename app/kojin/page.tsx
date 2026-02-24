"use client";

import Link from "next/link";
import { useState, useEffect } from "react";

const KOJIN_URL = "https://mirinae.jp/kojin.html?tab=tab01";

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
            <p className="text-center text-red-500 py-8">{error}</p>
          ) : content?.html ? (
            <div
              className="kotae-blog-content text-gray-800 max-h-[70vh] overflow-y-auto"
              dangerouslySetInnerHTML={{ __html: content.html }}
            />
          ) : null}
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
          {content?.url && (
            <a
              href={content.url}
              target="_blank"
              rel="noopener noreferrer"
              className="block w-full py-2 px-4 text-center text-sm text-[#0ea5e9] hover:underline mt-2"
            >
              ミリネHPで詳しく見る →
            </a>
          )}
        </div>
      </div>
    </div>
  );
}
