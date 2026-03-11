"use client";

import Link from "next/link";
import { useState } from "react";
import { wrapHtmlForIframe } from "@/lib/html-utils";

interface QnaArticleClientProps {
  html: string;
  title: string;
  shareUrl: string;
  hasScript: boolean;
}

export default function QnaArticleClient({
  html,
  title,
  shareUrl,
  hasScript,
}: QnaArticleClientProps) {
  const [copied, setCopied] = useState(false);

  const handleCopyUrl = async () => {
    try {
      await navigator.clipboard.writeText(shareUrl);
      setCopied(true);
      setTimeout(() => setCopied(false), 2000);
    } catch {
      setCopied(false);
    }
  };

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
          {title && (
            <h1 className="text-xl font-bold text-gray-800 mb-2">{title}</h1>
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
        {hasScript ? (
          <iframe
            srcDoc={wrapHtmlForIframe(html)}
            title={title || "Q&A content"}
            className="w-full min-h-[500px] border-0 kotae-blog-content p-6"
            sandbox="allow-scripts"
          />
        ) : (
          <div
            className="kotae-blog-content p-6 text-gray-800 prose prose-sm max-w-none"
            dangerouslySetInnerHTML={{ __html: html }}
          />
        )}
      </div>
    </div>
  );
}
