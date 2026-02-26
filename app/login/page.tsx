"use client";

import { useState, useEffect } from "react";
import Link from "next/link";

export default function LoginPage() {
  const [redirectTo, setRedirectTo] = useState("/");
  useEffect(() => {
    if (typeof window !== "undefined") {
      const params = new URLSearchParams(window.location.search);
      const r = params.get("redirect");
      if (r && r.startsWith("/")) setRedirectTo(r);
    }
  }, []);
  const [isRegister, setIsRegister] = useState(false);
  const PREFECTURES = [
    "選択してください", "北海道", "青森県", "岩手県", "宮城県", "秋田県", "山形県", "福島県",
    "茨城県", "栃木県", "群馬県", "埼玉県", "千葉県", "東京23区", "東京都", "神奈川県", "山梨県",
    "長野県", "新潟県", "富山県", "石川県", "福井県", "岐阜県", "静岡県", "愛知県", "三重県",
    "滋賀県", "京都府", "大阪府", "兵庫県", "奈良県", "和歌山県", "鳥取県", "島根県", "岡山県",
    "広島県", "山口県", "徳島県", "香川県", "愛媛県", "高知県", "福岡県", "佐賀県", "長崎県",
    "熊本県", "大分県", "宮崎県", "鹿児島県", "沖縄県",
  ];
  const [id, setId] = useState("");
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [name, setName] = useState("");
  const [region, setRegion] = useState("選択してください");
  const [loading, setLoading] = useState(false);
  const [message, setMessage] = useState("");
  const [showForgotPassword, setShowForgotPassword] = useState(false);
  const [forgotEmail, setForgotEmail] = useState("");
  const [forgotLoading, setForgotLoading] = useState(false);
  const [forgotMessage, setForgotMessage] = useState("");

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setLoading(true);
    setMessage("");

    try {
      if (isRegister) {
        const regSource = typeof window !== "undefined" && window.location.hostname === "writing.mirinae.jp" ? "WRITING" : window.location.hostname === "ondoku.mirinae.jp" ? "ONDOKU" : "QUIZ";
        const res = await fetch("/api/auth/register", {
          method: "POST",
          headers: { "Content-Type": "application/json" },
          body: JSON.stringify({ id, email, password, name, region: region === "選択してください" ? "" : region, registration_source: regSource }),
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
            if (data.session?.refresh_token) {
              localStorage.setItem("quiz_refresh_token", data.session.refresh_token);
            }
            localStorage.setItem("quiz_user", JSON.stringify(data.user));
          }
          window.location.href = redirectTo;
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
                  onInvalid={(e) => {
                    (e.target as HTMLInputElement).setCustomValidity("ユーザーIDを入力してください。");
                  }}
                  onInput={(e) => (e.target as HTMLInputElement).setCustomValidity("")}
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
                  onInvalid={(e) => {
                    (e.target as HTMLInputElement).setCustomValidity("お名前を入力してください。");
                  }}
                  onInput={(e) => (e.target as HTMLInputElement).setCustomValidity("")}
                  placeholder="山田太郎"
                  className="w-full border rounded px-3 py-2"
                  required
                />
              </div>
              <div>
                <label className="block text-sm font-medium mb-1">地域</label>
                <select
                  value={region}
                  onChange={(e) => setRegion(e.target.value)}
                  className="w-full border rounded px-3 py-2"
                >
                  {PREFECTURES.map((p) => (
                    <option key={p} value={p}>{p}</option>
                  ))}
                </select>
              </div>
            </>
          )}
          <div>
            <label className="block text-sm font-medium mb-1">メールアドレス</label>
            <input
              type="email"
              value={email}
              onChange={(e) => setEmail(e.target.value)}
              onInvalid={(e) => {
                const target = e.target as HTMLInputElement;
                target.setCustomValidity(
                  target.validity.valueMissing
                    ? "メールアドレスを入力してください。"
                    : "メールアドレスを正しく入力してください。"
                );
              }}
              onInput={(e) => (e.target as HTMLInputElement).setCustomValidity("")}
              placeholder="メールアドレスを入力"
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
              onInvalid={(e) => {
                (e.target as HTMLInputElement).setCustomValidity("パスワードを入力してください。");
              }}
              onInput={(e) => (e.target as HTMLInputElement).setCustomValidity("")}
              placeholder="••••••••"
              className="w-full border rounded px-3 py-2"
              required
            />
            {!isRegister && (
              <button
                type="button"
                onClick={() => {
                  setShowForgotPassword(true);
                  setForgotEmail(email);
                  setForgotMessage("");
                }}
                className="mt-1 text-sm text-gray-500 hover:underline"
              >
                パスワードをお忘れの場合
              </button>
            )}
          </div>

          {showForgotPassword && !isRegister && (
            <div className="p-4 bg-gray-50 rounded-lg border border-gray-200 space-y-3">
              <p className="text-sm text-gray-700">登録済みのメールアドレスを入力してください。パスワード再設定用のリンクをお送りします。</p>
              <input
                type="email"
                value={forgotEmail}
                onChange={(e) => setForgotEmail(e.target.value)}
                placeholder="メールアドレス"
                className="w-full border rounded px-3 py-2 text-sm"
              />
              <div className="flex gap-2">
                <button
                  type="button"
                  onClick={async () => {
                    if (!forgotEmail.trim()) {
                      setForgotMessage("メールアドレスを入力してください。");
                      return;
                    }
                    setForgotLoading(true);
                    setForgotMessage("");
                    try {
                      const res = await fetch("/api/auth/forgot-password", {
                        method: "POST",
                        headers: { "Content-Type": "application/json" },
                        body: JSON.stringify({ email: forgotEmail.trim() }),
                      });
                      const data = await res.json();
                      if (res.ok) {
                        setForgotMessage("パスワード再設定用のメールを送信しました。メールをご確認ください。");
                        setShowForgotPassword(false);
                      } else {
                        setForgotMessage(data.error || "送信に失敗しました。");
                      }
                    } catch {
                      setForgotMessage("エラーが発生しました。");
                    } finally {
                      setForgotLoading(false);
                    }
                  }}
                  disabled={forgotLoading}
                  className="flex-1 py-2 bg-[#1a4d2e] text-white text-sm rounded hover:bg-[#2d6a4a] disabled:opacity-50"
                >
                  {forgotLoading ? "送信中..." : "送信"}
                </button>
                <button
                  type="button"
                  onClick={() => {
                    setShowForgotPassword(false);
                    setForgotMessage("");
                  }}
                  className="px-3 py-2 text-sm text-gray-600 hover:text-gray-800"
                >
                  キャンセル
                </button>
              </div>
              {forgotMessage && (
                <p className={`text-sm ${forgotMessage.includes("送信しました") ? "text-green-600" : "text-red-600"}`}>
                  {forgotMessage}
                </p>
              )}
            </div>
          )}

          <button
            type="submit"
            disabled={loading}
            className="w-full bg-red-600 text-white py-2 rounded hover:bg-red-700 disabled:opacity-50"
          >
            {loading ? "処理中..." : isRegister ? "登録" : "ログイン"}
          </button>
        </form>

        {message && (
          <p
            className={`mt-4 text-center ${
              message === "会員登録が完了しました。メール認証後にログインしてください。"
                ? "text-lg md:text-xl font-bold text-gray-800"
                : message.includes("既に") || message.includes("失敗") || message.includes("エラー")
                  ? "text-sm font-medium text-red-600"
                  : "text-sm text-gray-600"
            }`}
          >
            {message}
          </p>
        )}

        <button
          type="button"
          onClick={() => {
            setIsRegister(!isRegister);
            setMessage("");
            setRegion("選択してください");
          }}
          className="mt-4 w-full text-sm text-gray-500 hover:underline"
        >
          {isRegister ? "すでにアカウントをお持ちですか？ログイン" : "アカウントをお持ちでないですか？会員登録"}
        </button>

        <Link
          href="/"
          className="mt-4 block text-center text-sm text-gray-500 hover:underline"
        >
          元のページに戻る
        </Link>
      </div>
    </div>
  );
}
