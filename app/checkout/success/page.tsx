"use client";

import { useEffect } from "react";
import Link from "next/link";

export default function CheckoutSuccessPage() {
  useEffect(() => {
    if (typeof window !== "undefined") {
      localStorage.setItem("quiz_has_paid", "true");
    }
  }, []);

  return (
    <div className="min-h-screen flex flex-col items-center justify-center p-6 bg-[#f5f5f5]">
      <div className="max-w-md w-full bg-white rounded-2xl shadow-lg p-8 text-center">
        <div className="text-6xl mb-4">✅</div>
        <h1 className="text-xl font-bold text-gray-800 mb-2">決済が完了しました</h1>
        <p className="text-gray-600 mb-6">
          全問題にアクセスできるようになりました。引き続きクイズをお楽しみください。
        </p>
        <Link
          href="/"
          className="inline-block w-full py-3 px-6 bg-[#cd3737] text-white font-semibold rounded-xl hover:opacity-90 transition"
        >
          クイズに戻る
        </Link>
      </div>
    </div>
  );
}
