"use client";

import { useState } from "react";

const PREFECTURES = [
  "選択してください", "北海道", "青森県", "岩手県", "宮城県", "秋田県", "山形県", "福島県",
  "茨城県", "栃木県", "群馬県", "埼玉県", "千葉県", "東京23区", "東京都", "神奈川県", "山梨県",
  "長野県", "新潟県", "富山県", "石川県", "福井県", "岐阜県", "静岡県", "愛知県", "三重県",
  "滋賀県", "京都府", "大阪府", "兵庫県", "奈良県", "和歌山県", "鳥取県", "島根県", "岡山県",
  "広島県", "山口県", "徳島県", "香川県", "愛媛県", "高知県", "福岡県", "佐賀県", "長崎県",
  "熊本県", "大分県", "宮崎県", "鹿児島県", "沖縄県",
];

function getRegistrationSource(): "QUIZ" | "WRITING" | "ONDOKU" {
  if (typeof window === "undefined") return "QUIZ";
  if (window.location.hostname === "writing.mirinae.jp") return "WRITING";
  if (window.location.hostname === "ondoku.mirinae.jp") return "ONDOKU";
  return "QUIZ";
}

type LoginModalProps = {
  isOpen: boolean;
  onClose: () => void;
  onSuccess?: () => void;
  redirectPath?: string;
};

export function LoginModal({ isOpen, onClose, onSuccess, redirectPath = "/" }: LoginModalProps) {
  const [isRegister, setIsRegister] = useState(false);
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
        const regSource = getRegistrationSource();
        const res = await fetch("/api/auth/register", {
          method: "POST",
          headers: { "Content-Type": "application/json" },
          body: JSON.stringify({
            id,
            email,
            password,
            name,
            region: region === "選択してください" ? "" : region,
            registration_source: regSource,
          }),
        });
        const data = await res.json();
        if (res.ok) {
          setMessage("会員登録が完了しました。メール認証後にログインしてください。");
          setId("");
          setName("");
          setRegion("選択してください");
          setEmail("");
          setPassword("");
          setTimeout(() => {
            setIsRegister(false);
            setMessage("");
          }, 2500);
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
          if (data.session?.access_token) {
            localStorage.setItem("quiz_token", data.session.access_token);
            if (data.session?.refresh_token) {
              localStorage.setItem("quiz_refresh_token", data.session.refresh_token);
            }
            localStorage.setItem("quiz_user", JSON.stringify(data.user));
          }
          onSuccess?.();
          onClose();
          setEmail("");
          setPassword("");
          setMessage("");
          window.location.reload();
        } else {
          setMessage(data.error || "ログインに失敗しました");
        }
      }
    } catch {
      setMessage("エラーが発生しました。");
    } finally {
      setLoading(false);
    }
  };

  const handleForgotPassword = async () => {
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
  };

  if (!isOpen) return null;

  return (
    <div className="fixed inset-0 z-[100] flex items-center justify-center p-4 bg-black/50" onClick={onClose}>
      <div
        className="bg-white rounded-2xl shadow-xl w-full max-w-md overflow-hidden"
        onClick={(e) => e.stopPropagation()}
      >
        <div className="relative px-6 pt-6 pb-2">
          <button
            type="button"
            onClick={onClose}
            className="absolute left-4 top-4 p-2 rounded-full hover:bg-gray-100 text-gray-600"
            aria-label="閉じる"
          >
            <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M6 18L18 6M6 6l12 12" />
            </svg>
          </button>
          <h2 className="text-xl font-bold text-center text-gray-900">{isRegister ? "会員登録" : "ログイン"}</h2>
        </div>

        <form onSubmit={handleSubmit} className="px-6 pb-6 space-y-4">
          {isRegister && (
            <>
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1">ユーザーID</label>
                <input
                  type="text"
                  value={id}
                  onChange={(e) => setId(e.target.value)}
                  placeholder="username"
                  className="w-full border border-gray-300 rounded-lg px-4 py-3 focus:ring-2 focus:ring-[#1a4d2e] focus:border-[#1a4d2e]"
                  required
                  autoComplete="username"
                />
              </div>
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1">お名前</label>
                <input
                  type="text"
                  value={name}
                  onChange={(e) => setName(e.target.value)}
                  placeholder="山田太郎"
                  className="w-full border border-gray-300 rounded-lg px-4 py-3 focus:ring-2 focus:ring-[#1a4d2e] focus:border-[#1a4d2e]"
                  required
                  autoComplete="name"
                />
              </div>
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1">地域</label>
                <select
                  value={region}
                  onChange={(e) => setRegion(e.target.value)}
                  className="w-full border border-gray-300 rounded-lg px-4 py-3 focus:ring-2 focus:ring-[#1a4d2e] focus:border-[#1a4d2e]"
                >
                  {PREFECTURES.map((p) => (
                    <option key={p} value={p}>{p}</option>
                  ))}
                </select>
              </div>
            </>
          )}
          <div>
            <label className="block text-sm font-medium text-gray-700 mb-1">メールアドレス</label>
            <input
              type="email"
              value={email}
              onChange={(e) => setEmail(e.target.value)}
              placeholder="メールアドレスを入力"
              className="w-full border border-gray-300 rounded-lg px-4 py-3 focus:ring-2 focus:ring-[#1a4d2e] focus:border-[#1a4d2e]"
              required
              autoComplete="email"
            />
          </div>
          <div>
            <label className="block text-sm font-medium text-gray-700 mb-1">パスワード</label>
            <input
              type="password"
              value={password}
              onChange={(e) => setPassword(e.target.value)}
              placeholder="••••••••"
              className="w-full border border-gray-300 rounded-lg px-4 py-3 focus:ring-2 focus:ring-[#1a4d2e] focus:border-[#1a4d2e]"
              required
              autoComplete={isRegister ? "new-password" : "current-password"}
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

          {!isRegister && showForgotPassword && (
            <div className="p-4 bg-gray-50 rounded-lg border border-gray-200 space-y-3">
              <p className="text-sm text-gray-700">登録済みのメールアドレスを入力してください。</p>
              <input
                type="email"
                value={forgotEmail}
                onChange={(e) => setForgotEmail(e.target.value)}
                placeholder="メールアドレス"
                className="w-full border rounded-lg px-3 py-2 text-sm"
              />
              <div className="flex gap-2">
                <button
                  type="button"
                  onClick={handleForgotPassword}
                  disabled={forgotLoading}
                  className="flex-1 py-2 bg-[#1a4d2e] text-white text-sm rounded-lg hover:bg-[#2d6a4a] disabled:opacity-50"
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
            className="w-full bg-[#1a4d2e] text-white py-3 rounded-lg font-medium hover:bg-[#2d6a4a] disabled:opacity-50"
          >
            {loading ? "処理中..." : isRegister ? "登録" : "ログイン"}
          </button>
        </form>

        {message && (
          <p className={`px-6 pb-4 text-center text-sm ${message.includes("完了") ? "text-green-600" : "text-red-600"}`}>
            {message}
          </p>
        )}

        <div className="px-6 pb-6 pt-0 border-t border-gray-200">
          <button
            type="button"
            onClick={() => {
              setIsRegister(!isRegister);
              setMessage("");
              setShowForgotPassword(false);
              setRegion("選択してください");
            }}
            className="block w-full text-center text-sm text-gray-500 hover:underline"
          >
            {isRegister ? "すでにアカウントをお持ちですか？ログイン" : "アカウントをお持ちでないですか？会員登録"}
          </button>
        </div>
      </div>
    </div>
  );
}
