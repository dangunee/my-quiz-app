"use client";

import { useState } from "react";
import Link from "next/link";

export default function LoginPage() {
  const [isRegister, setIsRegister] = useState(false);
  const [id, setId] = useState("");
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [name, setName] = useState("");
  const [loading, setLoading] = useState(false);
  const [message, setMessage] = useState("");

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setLoading(true);
    setMessage("");

    try {
      if (isRegister) {
        const res = await fetch("/api/auth/register", {
          method: "POST",
          headers: { "Content-Type": "application/json" },
          body: JSON.stringify({ id, email, password, name }),
        });
        const data = await res.json();
        if (res.ok) {
          setMessage("会員登録が完了しました。メール認証後にログインしてください。");
        } else {
          setMessage(data.error || "会員登録に失敗しました");
        }
      } else {
        const res = await fetch("/api/auth/login", {
          method: "POST",
          headers: { "Content-Type": "application/json" },
          body: JSON.stringify({ email, password }),
        });
        const data = await res.json();
        if (res.ok) {
          setMessage("ログインに成功しました！");
          if (data.session?.access_token) {
            localStorage.setItem("quiz_token", data.session.access_token);
            localStorage.setItem("quiz_user", JSON.stringify(data.user));
          }
          window.location.href = "/";
        } else {
          setMessage(data.error || "ログインに失敗しました");
        }
      }
    } catch (e) {
      setMessage("エラーが発生しました。");
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="min-h-screen flex items-center justify-center bg-gray-100 p-4">
      <div className="bg-white p-8 rounded-lg shadow-md w-full max-w-sm">
        <h1 className="text-xl font-bold mb-4 text-center">
          {isRegister ? "会員登録" : "ログイン"}
        </h1>

        <form onSubmit={handleSubmit} className="space-y-4">
          {isRegister && (
            <>
              <div>
                <label className="block text-sm font-medium mb-1">ユーザーID</label>
                <input
                  type="text"
                  value={id}
                  onChange={(e) => setId(e.target.value)}
                  placeholder="username"
                  className="w-full border rounded px-3 py-2"
                  required
                />
              </div>
              <div>
                <label className="block text-sm font-medium mb-1">お名前</label>
                <input
                  type="text"
                  value={name}
                  onChange={(e) => setName(e.target.value)}
                  placeholder="山田太郎"
                  className="w-full border rounded px-3 py-2"
                  required
                />
              </div>
            </>
          )}
          <div>
            <label className="block text-sm font-medium mb-1">メールアドレス</label>
            <input
              type="email"
              value={email}
              onChange={(e) => setEmail(e.target.value)}
              placeholder="email@example.com"
              className="w-full border rounded px-3 py-2"
              required
            />
          </div>
          <div>
            <label className="block text-sm font-medium mb-1">パスワード</label>
            <input
              type="password"
              value={password}
              onChange={(e) => setPassword(e.target.value)}
              placeholder="••••••••"
              className="w-full border rounded px-3 py-2"
              required
            />
          </div>

          <button
            type="submit"
            disabled={loading}
            className="w-full bg-red-600 text-white py-2 rounded hover:bg-red-700 disabled:opacity-50"
          >
            {loading ? "処理中..." : isRegister ? "登録" : "ログイン"}
          </button>
        </form>

        {message && (
          <p className="mt-4 text-sm text-center text-gray-600">{message}</p>
        )}

        <button
          type="button"
          onClick={() => {
            setIsRegister(!isRegister);
            setMessage("");
          }}
          className="mt-4 w-full text-sm text-gray-500 hover:underline"
        >
          {isRegister ? "すでにアカウントをお持ちですか？ログイン" : "アカウントをお持ちでないですか？会員登録"}
        </button>

        <Link
          href="/"
          className="mt-4 block text-center text-sm text-gray-500 hover:underline"
        >
          クイズに戻る
        </Link>
      </div>
    </div>
  );
}
