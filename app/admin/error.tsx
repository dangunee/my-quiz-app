"use client";

import { useEffect } from "react";
import Link from "next/link";

export default function AdminError({
  error,
  reset,
}: {
  error: Error & { digest?: string };
  reset: () => void;
}) {
  useEffect(() => {
    console.error("Admin error:", error);
  }, [error]);

  return (
    <div className="min-h-screen flex flex-col items-center justify-center bg-gray-100 p-4">
      <h1 className="text-xl font-bold text-gray-800 mb-2">管理者ページでエラーが発生しました</h1>
      <p className="text-gray-600 text-sm mb-4 text-center max-w-md">
        {error.message || "エラーが発生しました。ブラウザのコンソール（開発者ツール）で詳細を確認してください。"}
      </p>
      <div className="flex gap-3">
        <button
          onClick={() => reset()}
          className="px-4 py-2 bg-red-600 text-white rounded hover:bg-red-700"
        >
          再試行
        </button>
        <Link
          href="/"
          className="px-4 py-2 bg-gray-300 text-gray-800 rounded hover:bg-gray-400"
        >
          トップへ
        </Link>
      </div>
    </div>
  );
}
