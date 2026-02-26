"use client";

import { useState, useEffect } from "react";
import Link from "next/link";
import { fetchWithAuth, getStoredToken } from "../../lib/auth";
import { LogoutConfirmModal } from "../../components/LogoutConfirmModal";

type User = {
  id: string;
  email: string;
  name?: string;
  username?: string;
};

export default function ProfilePage() {
  const [user, setUser] = useState<User | null>(null);
  const [customerProfile, setCustomerProfile] = useState<{ region: string | null; plan_type: string | null } | null>(null);
  const [loading, setLoading] = useState(true);
  const [deleting, setDeleting] = useState(false);
  const [message, setMessage] = useState("");
  const [showLogoutModal, setShowLogoutModal] = useState(false);

  useEffect(() => {
    const stored = typeof window !== "undefined" ? localStorage.getItem("quiz_user") : null;
    if (stored) {
      try {
        setUser(JSON.parse(stored));
      } catch {
        setUser(null);
      }
    } else {
      setUser(null);
    }
    setLoading(false);
  }, []);

  useEffect(() => {
    const token = getStoredToken();
    if (user && token) {
      fetchWithAuth("/api/customer/profile")
        .then((r) => r.json())
        .then((data) => setCustomerProfile({ region: data.region ?? null, plan_type: data.plan_type ?? null }))
        .catch(() => setCustomerProfile(null));
    } else {
      setCustomerProfile(null);
    }
  }, [user]);

  const handleDeleteAccount = async () => {
    if (!confirm("本当にアカウントを削除しますか？この操作は取り消せません。")) return;

    setDeleting(true);
    setMessage("");

    try {
      if (!getStoredToken()) {
        setMessage("ログインが必要です");
        return;
      }

      const res = await fetchWithAuth("/api/auth/delete-account", {
        method: "POST",
      });
      const data = await res.json();

      if (res.ok) {
        localStorage.removeItem("quiz_token");
        localStorage.removeItem("quiz_refresh_token");
        localStorage.removeItem("quiz_user");
        window.location.href = "/";
      } else {
        setMessage(data.error || "削除に失敗しました");
      }
    } catch (e) {
      setMessage("エラーが発生しました");
    } finally {
      setDeleting(false);
    }
  };

  if (loading) {
    return (
      <div className="min-h-screen flex items-center justify-center bg-gray-100 p-4">
        <p className="text-gray-500">ローディング中...</p>
      </div>
    );
  }

  if (!user) {
    return (
      <div className="min-h-screen flex items-center justify-center bg-gray-100 p-4">
        <div className="bg-white p-8 rounded-lg shadow-md w-full max-w-sm text-center">
          <p className="text-gray-600 mb-4">ログインが必要です</p>
          <Link
            href="/login"
            className="inline-block w-full py-2 bg-red-600 text-white rounded hover:bg-red-700"
          >
            ログイン
          </Link>
          <Link
            href="/"
            className="mt-4 block text-sm text-gray-500 hover:underline"
          >
            クイズに戻る
          </Link>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen flex items-center justify-center bg-gray-100 p-4">
      <div className="bg-white p-8 rounded-lg shadow-md w-full max-w-sm">
        <h1 className="text-xl font-bold mb-6 text-center">マイページ</h1>

        <div className="space-y-4 mb-6">
          <div>
            <label className="block text-sm text-gray-500 mb-1">地域</label>
            <p className="font-medium">{customerProfile?.region || "-"}</p>
          </div>
          <div>
            <label className="block text-sm text-gray-500 mb-1">無料/有料</label>
            <p className="font-medium">{customerProfile?.plan_type || "-"}</p>
          </div>
          <div>
            <label className="block text-sm text-gray-500 mb-1">メールアドレス</label>
            <p className="font-medium">{user.email}</p>
          </div>
          <div>
            <label className="block text-sm text-gray-500 mb-1">お名前</label>
            <p className="font-medium">{user.name || "-"}</p>
          </div>
          <div>
            <label className="block text-sm text-gray-500 mb-1">ユーザーID</label>
            <p className="font-medium">{user.username || "-"}</p>
          </div>
        </div>

        {message && (
          <p className="mb-4 text-sm text-red-600 text-center">{message}</p>
        )}

        <button
          type="button"
          onClick={() => setShowLogoutModal(true)}
          className="w-full py-2 bg-red-600 text-white rounded hover:bg-red-700 mb-3"
        >
          ログアウト
        </button>

        <LogoutConfirmModal
          isOpen={showLogoutModal}
          onClose={() => setShowLogoutModal(false)}
          onConfirm={() => {
            localStorage.removeItem("quiz_token");
            localStorage.removeItem("quiz_refresh_token");
            localStorage.removeItem("quiz_user");
            window.location.href = "/";
          }}
        />

        <button
          type="button"
          onClick={handleDeleteAccount}
          disabled={deleting}
          className="w-full py-2 border border-red-600 text-red-600 rounded hover:bg-red-50 disabled:opacity-50"
        >
          {deleting ? "処理中..." : "アカウントを削除する"}
        </button>

        <Link
          href="/"
          className="mt-6 block text-center text-sm text-gray-500 hover:underline"
        >
          クイズに戻る
        </Link>
      </div>
    </div>
  );
}
