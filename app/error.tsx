"use client";

import { useEffect } from "react";

export default function Error({
  error,
  reset,
}: {
  error: Error & { digest?: string };
  reset: () => void;
}) {
  useEffect(() => {
    console.error("Application error:", error);
  }, [error]);

  const isChunkError = /Loading chunk|ChunkLoadError|Loading CSS chunk/i.test(error.message);
  const handleRetry = () => (isChunkError ? window.location.reload() : reset());

  return (
    <div className="min-h-screen flex flex-col items-center justify-center bg-gray-100 p-4">
      <h1 className="text-xl font-bold text-gray-800 mb-2">エラーが発生しました</h1>
      <p className="text-gray-600 text-sm mb-4 text-center max-w-md">
        {error.message || "クライアント側でエラーが発生しました。ブラウザのコンソールで詳細を確認してください。"}
      </p>
      <button
        onClick={handleRetry}
        className="px-4 py-2 bg-red-600 text-white rounded hover:bg-red-700"
      >
        再試行
      </button>
    </div>
  );
}
