"use client";

import { useState, useEffect } from "react";
import { QUIZZES } from "../quiz-data";

export default function AdminPage() {
  const [authKey, setAuthKey] = useState("");
  const [isAuthenticated, setIsAuthenticated] = useState(false);
  const [overrides, setOverrides] = useState<Record<number, string>>({});
  const [editing, setEditing] = useState<number | null>(null);
  const [editValue, setEditValue] = useState("");
  const [saving, setSaving] = useState(false);
  const [loading, setLoading] = useState(true);
  const [currentPage, setCurrentPage] = useState(1);
  const [activeTab, setActiveTab] = useState<"quiz" | "users">("quiz");
  const [users, setUsers] = useState<{ id: string; email: string; name?: string; username?: string; createdAt?: string }[]>([]);
  const [usersLoading, setUsersLoading] = useState(false);

  const PER_PAGE = 10;
  const totalPages = Math.ceil(QUIZZES.length / PER_PAGE);
  const startIdx = (currentPage - 1) * PER_PAGE;
  const quizzesOnPage = QUIZZES.slice(startIdx, startIdx + PER_PAGE);

  useEffect(() => {
    fetch("/api/explanations")
      .then((r) => r.json())
      .then((data) => {
        setOverrides(data.overrides || {});
        setLoading(false);
      })
      .catch(() => setLoading(false));
  }, []);

  const handleLogin = (e: React.FormEvent) => {
    e.preventDefault();
    if (authKey.trim()) {
      setIsAuthenticated(true);
    }
  };

  const handleSave = async (quizId: number, explanation: string) => {
    setSaving(true);
    try {
      const res = await fetch(`/api/admin/explanations/${quizId}`, {
        method: "PUT",
        headers: {
          "Content-Type": "application/json",
          Authorization: `Bearer ${authKey}`,
        },
        body: JSON.stringify({ explanation }),
      });
      if (res.ok) {
        setOverrides((prev) => ({ ...prev, [quizId]: explanation }));
        setEditing(null);
      } else {
        const err = await res.json();
        alert(err.error || "저장 실패");
      }
    } catch (e) {
      alert("저장 중 오류 발생");
    } finally {
      setSaving(false);
    }
  };

  if (!isAuthenticated) {
    return (
      <div className="min-h-screen flex items-center justify-center bg-gray-100 p-4">
        <form
          onSubmit={handleLogin}
          className="bg-white p-8 rounded-lg shadow-md w-full max-w-sm"
        >
          <h1 className="text-xl font-bold mb-4">관리자 로그인</h1>
          <input
            type="password"
            value={authKey}
            onChange={(e) => setAuthKey(e.target.value)}
            placeholder="ADMIN_SECRET 입력"
            className="w-full border rounded px-3 py-2 mb-4"
          />
          <button
            type="submit"
            className="w-full bg-red-600 text-white py-2 rounded hover:bg-red-700"
          >
            로그인
          </button>
        </form>
      </div>
    );
  }

  const loadUsers = () => {
    setUsersLoading(true);
    fetch("/api/admin/users", {
      headers: { Authorization: `Bearer ${authKey}` },
    })
      .then((r) => r.json())
      .then((data) => {
        setUsers(data.users || []);
      })
      .catch(() => setUsers([]))
      .finally(() => setUsersLoading(false));
  };

  return (
    <div className="min-h-screen bg-gray-100 p-4">
      <div className="max-w-4xl mx-auto">
        <div className="flex gap-4 mb-6">
          <button
            onClick={() => setActiveTab("quiz")}
            className={`px-4 py-2 rounded font-medium ${activeTab === "quiz" ? "bg-red-600 text-white" : "bg-white"}`}
          >
            답변 설명 수정
          </button>
          <button
            onClick={() => {
              setActiveTab("users");
              loadUsers();
            }}
            className={`px-4 py-2 rounded font-medium ${activeTab === "users" ? "bg-red-600 text-white" : "bg-white"}`}
          >
            회원 목록
          </button>
        </div>

        {activeTab === "quiz" && (
          <>
        <h1 className="text-2xl font-bold mb-4">답변 설명 수정</h1>
        <p className="text-sm text-gray-600 mb-6">
          퀴즈 ID별로 설명을 수정할 수 있습니다. Supabase가 설정되어 있어야
          합니다.
        </p>

        {loading ? (
          <p>로딩 중...</p>
        ) : (
          <>
          <div className="space-y-4">
            {quizzesOnPage.map((q) => (
              <div
                key={q.id}
                className="bg-white p-4 rounded-lg shadow"
              >
                <div className="flex justify-between items-center mb-2">
                  <span className="font-medium">문제 {q.id}</span>
                  <span className="text-sm text-gray-500">{q.japanese}</span>
                </div>
                {editing === q.id ? (
                  <div>
                    <textarea
                      value={editValue}
                      onChange={(e) => setEditValue(e.target.value)}
                      rows={8}
                      className="w-full border rounded px-3 py-2 font-mono text-sm"
                    />
                    <div className="mt-2 flex gap-2">
                      <button
                        onClick={() => handleSave(q.id, editValue)}
                        disabled={saving}
                        className="px-4 py-2 bg-red-600 text-white rounded hover:bg-red-700 disabled:opacity-50"
                      >
                        저장
                      </button>
                      <button
                        onClick={() => setEditing(null)}
                        className="px-4 py-2 bg-gray-300 rounded hover:bg-gray-400"
                      >
                        취소
                      </button>
                    </div>
                  </div>
                ) : (
                  <div>
                    <pre className="text-sm whitespace-pre-wrap bg-gray-50 p-3 rounded overflow-x-auto max-h-32 overflow-y-auto">
                      {(overrides[q.id] ?? q.explanation).replace(/\\n/g, "\n")}
                    </pre>
                    <button
                      onClick={() => {
                        setEditValue((overrides[q.id] ?? q.explanation).replace(/\\n/g, "\n"));
                        setEditing(q.id);
                      }}
                      className="mt-2 text-sm text-red-600 hover:underline"
                    >
                      수정
                    </button>
                  </div>
                )}
              </div>
            ))}
          </div>

          {totalPages > 1 && (
            <div className="mt-6 flex items-center justify-center gap-2">
              <button
                onClick={() => { setEditing(null); setCurrentPage((p) => Math.max(1, p - 1)); }}
                disabled={currentPage === 1}
                className="px-4 py-2 bg-white border rounded hover:bg-gray-50 disabled:opacity-50 disabled:cursor-not-allowed"
              >
                이전
              </button>
              <span className="px-4 py-2 text-sm">
                {currentPage} / {totalPages}
              </span>
              <button
                onClick={() => { setEditing(null); setCurrentPage((p) => Math.min(totalPages, p + 1)); }}
                disabled={currentPage === totalPages}
                className="px-4 py-2 bg-white border rounded hover:bg-gray-50 disabled:opacity-50 disabled:cursor-not-allowed"
              >
                다음
              </button>
            </div>
          )}
          </>
        )}

        {activeTab === "users" && (
          <div className="bg-white p-6 rounded-lg shadow">
            <h1 className="text-2xl font-bold mb-4">회원 등록 데이터</h1>
            {usersLoading ? (
              <p>로딩 중...</p>
            ) : users.length === 0 ? (
              <p className="text-gray-500">등록된 회원이 없습니다.</p>
            ) : (
              <div className="overflow-x-auto">
                <table className="w-full text-sm">
                  <thead>
                    <tr className="border-b">
                      <th className="text-left py-2 px-3">이메일</th>
                      <th className="text-left py-2 px-3">이름</th>
                      <th className="text-left py-2 px-3">아이디</th>
                      <th className="text-left py-2 px-3">가입일</th>
                    </tr>
                  </thead>
                  <tbody>
                    {users.map((u) => (
                      <tr key={u.id} className="border-b">
                        <td className="py-2 px-3">{u.email}</td>
                        <td className="py-2 px-3">{u.name || "-"}</td>
                        <td className="py-2 px-3">{u.username || "-"}</td>
                        <td className="py-2 px-3">
                          {u.createdAt ? new Date(u.createdAt).toLocaleDateString("ja-JP") : "-"}
                        </td>
                      </tr>
                    ))}
                  </tbody>
                </table>
              </div>
            )}
            <button
              onClick={loadUsers}
              className="mt-4 text-sm text-red-600 hover:underline"
            >
              새로고침
            </button>
          </div>
        )}
      </div>
    </div>
  );
}
