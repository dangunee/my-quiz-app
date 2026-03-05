"use client";

import { useParams, useRouter } from "next/navigation";
import Link from "next/link";
import { useState, useEffect } from "react";
import { wrapHtmlForIframe } from "@/lib/html-utils";

const APPS_BASE = "https://apps.mirinae.jp";

export default function QnaArticlePage() {
  const params = useParams();
  const router = useRouter();
  const id = params?.id as string;
  const [data, setData] = useState<{ html: string; url: string; title?: string } | null>(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [copied, setCopied] = useState(false);

  const shareUrl = id ? `${APPS_BASE}/qna/${id}` : "";

  useEffect(() => {
    if (!id || !/^\d+$/.test(id)) {
      setError("Invalid article");
      setLoading(false);
      return;
    }
    setLoading(true);
    setError(null);
    fetch(`/api/kotae-blog?p=${id}`)
      .then((r) => r.json())
      .then((res) => {
        if (res.error && !res.html) {
          setError(res.error || "Not found");
          setData(null);
        } else {
          setData({
            html: res.html || "",
            url: res.url || shareUrl,
            title: res.title,
          });
        }
      })
      .catch((err) => {
        setError(err.message || "読み込みに失敗しました");
        setData(null);
      })
      .finally(() => setLoading(false));
  }, [id, shareUrl]);

  const handleCopyUrl = async () => {
    try {
      await navigator.clipboard.writeText(shareUrl);
      setCopied(true);
      setTimeout(() => setCopied(false), 2000);
    } catch {
      setCopied(false);
    }
  };

  if (loading) {
    return (
      <div className="min-h-screen bg-[#f5f5f5] flex items-center justify-center">
        <p className="text-gray-500">読み込み中...</p>
      </div>
    );
  }

  if (error || !data) {
    return (
      <div className="min-h-screen bg-[#f5f5f5] p-4 flex flex-col items-center justify-center">
        <p className="text-red-500 mb-4">{error || "記事が見つかりません"}</p>
        <Link href="/qna" className="text-[#0ea5e9] hover:underline">
          Q&A一覧に戻る
        </Link>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-[#f5f5f5] p-4">
      <div className="max-w-2xl mx-auto bg-white rounded-2xl shadow-lg overflow-hidden">
        <div className="p-6 border-b border-gray-200">
          <Link
            href="/qna"
            className="text-[#0ea5e9] hover:underline text-sm mb-4 inline-block"
          >
            ← Q&A一覧に戻る
          </Link>
          {data.title && (
            <h1 className="text-xl font-bold text-gray-800 mb-2">{data.title}</h1>
          )}
          <div className="flex flex-wrap items-center gap-2 mt-3">
            <span className="text-xs text-gray-500">この記事のリンク:</span>
            <code className="flex-1 min-w-0 text-xs bg-gray-100 px-2 py-1.5 rounded truncate">
              {shareUrl}
            </code>
            <button
              type="button"
              onClick={handleCopyUrl}
              className="px-3 py-1.5 text-xs font-medium rounded-lg bg-[#0ea5e9] text-white hover:bg-[#0284c7] transition-colors shrink-0"
            >
              {copied ? "コピーしました" : "URLをコピー"}
            </button>
          </div>
        </div>
        {data.html.includes("<script") ? (
          <iframe
            srcDoc={wrapHtmlForIframe(data.html)}
            title={data.title || "Q&A content"}
            className="w-full min-h-[500px] border-0 kotae-blog-content p-6"
            sandbox="allow-scripts"
          />
        ) : (
          <div
            className="kotae-blog-content p-6 text-gray-800 prose prose-sm max-w-none"
            dangerouslySetInnerHTML={{ __html: data.html }}
          />
        )}
      </div>
    </div>
  );
}
