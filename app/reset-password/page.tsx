"use client";

import { useState, useEffect } from "react";
import Link from "next/link";
import { createClient } from "@supabase/supabase-js";

const supabaseUrl = process.env.NEXT_PUBLIC_SUPABASE_URL!;
const supabaseAnonKey = process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY!;

export default function ResetPasswordPage() {
  const [password, setPassword] = useState("");
  const [confirmPassword, setConfirmPassword] = useState("");
  const [loading, setLoading] = useState(false);
  const [message, setMessage] = useState("");
  const [success, setSuccess] = useState(false);
  const [hasRecoverySession, setHasRecoverySession] = useState<boolean | null>(null);

  useEffect(() => {
    if (typeof window !== "undefined" && supabaseUrl && supabaseAnonKey) {
      const supabase = createClient(supabaseUrl, supabaseAnonKey);
      const checkSession = () => {
        supabase.auth.getSession().then(({ data: { session } }) => {
          setHasRecoverySession(!!session);
        });
      };
      checkSession();
      supabase.auth.onAuthStateChange((event) => {
        if (event === "PASSWORD_RECOVERY") {
          setMessage("");
          setHasRecoverySession(true);
        }
      });
      const hash = typeof window !== "undefined" ? window.location.hash : "";
      if (hash && (hash.includes("type=recovery") || hash.includes("access_token"))) {
        setHasRecoverySession(true);
      }
    }
  }, []);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setMessage("");
    if (password.length < 6) {
      setMessage("パスワードは6文字以上で入力してください。");
      return;
    }
    if (password !== confirmPassword) {
      setMessage("パスワードが一致しません。");
      return;
    }
    setLoading(true);
    try {
      const supabase = createClient(supabaseUrl, supabaseAnonKey);
      const { error } = await supabase.auth.updateUser({ password });
      if (error) {
        setMessage(error.message === "New password should be different from the old password." ? "新しいパスワードを入力してください。" : error.message);
        return;
      }
      setSuccess(true);
      setMessage("パスワードを変更しました。ログインページから新しいパスワードでログインしてください。");
    } catch {
      setMessage("エラーが発生しました。");
    } finally {
      setLoading(false);
    }
  };

  if (!supabaseUrl || !supabaseAnonKey) {
    return (
      <div className="min-h-screen flex items-center justify-center bg-gray-100 p-4">
        <div className="bg-white p-8 rounded-lg shadow-md w-full max-w-sm text-center text-gray-600">
          設定が正しくありません。
        </div>
      </div>
    );
  }

  if (hasRecoverySession === false) {
    return (
      <div className="min-h-screen flex items-center justify-center bg-gray-100 p-4">
        <div className="bg-white p-8 rounded-lg shadow-md w-full max-w-sm text-center">
          <p className="text-gray-700 mb-4">パスワード再設定のリンクはメールからアクセスしてください。</p>
          <Link href="/login" className="text-red-600 hover:underline">ログインページへ</Link>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen flex items-center justify-center bg-gray-100 p-4">
      <div className="bg-white p-8 rounded-lg shadow-md w-full max-w-sm">
        <h1 className="text-xl font-bold mb-4 text-center">パスワードの再設定</h1>

        {success ? (
          <div className="space-y-4">
            <p className="text-gray-700 text-sm">{message}</p>
            <Link
              href="/login"
              className="block w-full bg-red-600 text-white py-2 rounded hover:bg-red-700 text-center"
            >
              ログインページへ
            </Link>
          </div>
        ) : (
          <form onSubmit={handleSubmit} className="space-y-4">
            <div>
              <label className="block text-sm font-medium mb-1">新しいパスワード</label>
              <input
                type="password"
                value={password}
                onChange={(e) => setPassword(e.target.value)}
                placeholder="6文字以上"
                className="w-full border rounded px-3 py-2"
                required
                minLength={6}
              />
            </div>
            <div>
              <label className="block text-sm font-medium mb-1">パスワード（確認）</label>
              <input
                type="password"
                value={confirmPassword}
                onChange={(e) => setConfirmPassword(e.target.value)}
                placeholder="もう一度入力"
                className="w-full border rounded px-3 py-2"
                required
                minLength={6}
              />
            </div>
            <button
              type="submit"
              disabled={loading}
              className="w-full bg-red-600 text-white py-2 rounded hover:bg-red-700 disabled:opacity-50"
            >
              {loading ? "処理中..." : "パスワードを変更"}
            </button>
          </form>
        )}

        {message && !success && (
          <p className="mt-4 text-center text-sm text-red-600">{message}</p>
        )}

        <Link
          href="/login"
          className="mt-4 block text-center text-sm text-gray-500 hover:underline"
        >
          ログインページに戻る
        </Link>
      </div>
    </div>
  );
}
