"use client";

import { useState, useEffect } from "react";
import { QUIZZES } from "../quiz-data";

type OverrideRow = {
  explanation?: string;
  japanese?: string;
  options?: { id: number; text: string }[];
};

function formatJapanese(s: string) {
  const stripped = (s || "").replace(/[「」]/g, "").trim();
  if (!stripped) return stripped;
  const lastChar = stripped.slice(-1);
  if (/[。.?？!！]/.test(lastChar)) return stripped;
  return stripped + "。";
}

function getFullKorean(q: { options: readonly { id: number; text: string }[]; correctAnswer: number; koreanTemplate: string }) {
  const correctOption = q.options.find((o) => o.id === q.correctAnswer);
  if (!correctOption) return q.koreanTemplate;
  const text = correctOption.text;
  if (text.includes(" / ")) {
    const parts = text.split(" / ");
    let i = 0;
    return q.koreanTemplate.replace(/_{2,}/g, () => parts[i++] ?? "");
  }
  return q.koreanTemplate.replace(/_{10,}/g, text);
}

export default function AdminPage() {
  const [authKey, setAuthKey] = useState("");
  const [isAuthenticated, setIsAuthenticated] = useState(false);
  const [authChecked, setAuthChecked] = useState(false);

  const ADMIN_STORAGE_KEY = "admin_auth";

  useEffect(() => {
    const stored = typeof window !== "undefined" ? localStorage.getItem(ADMIN_STORAGE_KEY) : null;
    if (stored) {
      setAuthKey(stored);
      setIsAuthenticated(true);
    }
    setAuthChecked(true);
  }, []);
  const [overrides, setOverrides] = useState<Record<number, OverrideRow>>({});
  const [editing, setEditing] = useState<number | null>(null);
  const [editExplanation, setEditExplanation] = useState("");
  const [editJapanese, setEditJapanese] = useState("");
  const [editOptions, setEditOptions] = useState<{ id: number; text: string }[]>([]);
  const [saving, setSaving] = useState(false);
  const [loading, setLoading] = useState(true);
  const [currentPage, setCurrentPage] = useState(1);
  const [activeTab, setActiveTab] = useState<"quiz" | "users">("quiz");
  const [users, setUsers] = useState<{ id: string; email: string; name?: string; username?: string; createdAt?: string; lastSignInAt?: string }[]>([]);
  const [usersLoading, setUsersLoading] = useState(false);
  const [editingUserId, setEditingUserId] = useState<string | null>(null);
  const [editUserForm, setEditUserForm] = useState({ email: "", name: "", username: "" });
  const [userActionLoading, setUserActionLoading] = useState(false);

  const PER_PAGE = 10;
  const totalPages = Math.ceil(QUIZZES.length / PER_PAGE);
  const startIdx = (currentPage - 1) * PER_PAGE;
  const quizzesOnPage = QUIZZES.slice(startIdx, startIdx + PER_PAGE);

  useEffect(() => {
    fetch("/api/explanations")
      .then((r) => r.json())
      .then((data) => {
        const raw = data.overrides || {};
        const normalized: Record<number, OverrideRow> = {};
        for (const [k, v] of Object.entries(raw)) {
          const id = parseInt(k, 10);
          if (isNaN(id)) continue;
          normalized[id] =
            typeof v === "string"
              ? { explanation: v }
              : (v as OverrideRow);
        }
        setOverrides(normalized);
        setLoading(false);
      })
      .catch(() => setLoading(false));
  }, []);

  const handleLogin = (e: React.FormEvent) => {
    e.preventDefault();
    const key = authKey.trim();
    if (key) {
      localStorage.setItem(ADMIN_STORAGE_KEY, key);
      setIsAuthenticated(true);
    }
  };

  const handleLogout = () => {
    localStorage.removeItem(ADMIN_STORAGE_KEY);
    setIsAuthenticated(false);
    setAuthKey("");
  };

  const handleSave = async (
    quizId: number,
    explanation: string,
    japanese: string,
    options: { id: number; text: string }[]
  ) => {
    setSaving(true);
    try {
      const res = await fetch(`/api/admin/explanations/${quizId}`, {
        method: "PUT",
        headers: {
          "Content-Type": "application/json",
          Authorization: `Bearer ${authKey}`,
        },
        body: JSON.stringify({ explanation, japanese, options }),
      });
      if (res.ok) {
        setOverrides((prev) => ({
          ...prev,
          [quizId]: { explanation, japanese, options },
        }));
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

  if (!authChecked || !isAuthenticated) {
    if (!authChecked) {
      return (
        <div className="min-h-screen flex items-center justify-center bg-gray-100 p-4">
          <p className="text-gray-500">로딩 중...</p>
        </div>
      );
    }
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

  const handleEditUser = (u: { id: string; email: string; name?: string; username?: string }) => {
    setEditingUserId(u.id);
    setEditUserForm({
      email: u.email || "",
      name: u.name || "",
      username: u.username || "",
    });
  };

  const handleSaveUser = async () => {
    if (!editingUserId) return;
    setUserActionLoading(true);
    try {
      const res = await fetch(`/api/admin/users/${editingUserId}`, {
        method: "PUT",
        headers: {
          "Content-Type": "application/json",
          Authorization: `Bearer ${authKey}`,
        },
        body: JSON.stringify(editUserForm),
      });
      const data = await res.json();
      if (res.ok) {
        setUsers((prev) =>
          prev.map((u) =>
            u.id === editingUserId
              ? { ...u, ...data.user, email: data.user?.email ?? u.email }
              : u
          )
        );
        setEditingUserId(null);
      } else {
        alert(data.error || "저장 실패");
      }
    } catch (e) {
      alert("저장 중 오류 발생");
    } finally {
      setUserActionLoading(false);
    }
  };

  const handleDeleteUser = async (userId: string, email: string) => {
    if (!confirm(`"${email}" 회원을 삭제하시겠습니까? 이 작업은 되돌릴 수 없습니다.`)) return;
    setUserActionLoading(true);
    try {
      const res = await fetch(`/api/admin/users/${userId}`, {
        method: "DELETE",
        headers: { Authorization: `Bearer ${authKey}` },
      });
      const data = await res.json();
      if (res.ok) {
        setUsers((prev) => prev.filter((u) => u.id !== userId));
        if (editingUserId === userId) setEditingUserId(null);
      } else {
        alert(data.error || "삭제 실패");
      }
    } catch (e) {
      alert("삭제 중 오류 발생");
    } finally {
      setUserActionLoading(false);
    }
  };

  return (
    <div className="min-h-screen bg-gray-100 p-4">
      <div className="max-w-4xl mx-auto">
        <div className="flex justify-between items-center mb-6">
          <div className="flex gap-4">
          <button
            onClick={() => setActiveTab("quiz")}
            className={`px-4 py-2 rounded font-medium ${activeTab === "quiz" ? "bg-red-600 text-white" : "bg-white"}`}
          >
            퀴즈 수정
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
          <button
            onClick={handleLogout}
            className="text-sm text-gray-500 hover:text-gray-700"
          >
            로그아웃
          </button>
        </div>

        {activeTab === "quiz" && (
          <>
        <h1 className="text-2xl font-bold mb-4">퀴즈 수정</h1>
        <p className="text-sm text-gray-600 mb-6">
          문제(일본어), 선택지, 설명을 수정할 수 있습니다. Supabase가 설정되어 있어야 합니다.
        </p>

        {loading ? (
          <p>로딩 중...</p>
        ) : (
          <>
          <div className="flex gap-6">
          <div className="flex-1 min-w-0 space-y-4">
            {quizzesOnPage.map((q) => {
              const ov = overrides[q.id];
              const dispJapanese = ov?.japanese ?? q.japanese;
              const dispOptions = ov?.options ?? q.options;
              const dispExplanation = ov?.explanation ?? q.explanation;
              return (
              <div
                key={q.id}
                id={`quiz-${q.id}`}
                className="bg-white p-4 rounded-lg shadow"
              >
                <div className="flex justify-between items-center mb-2">
                  <span className="font-medium">문제 {q.id}</span>
                  <span className="text-sm text-gray-500">{formatJapanese(dispJapanese)}</span>
                </div>
                {editing === q.id ? (
                  <div className="space-y-4">
                    <div>
                      <label className="block text-sm font-semibold text-gray-800 mb-2">문제 (일본어 문장)</label>
                      <input
                        value={editJapanese}
                        onChange={(e) => setEditJapanese(e.target.value)}
                        className="w-full border-2 border-gray-300 rounded px-3 py-2.5 text-base focus:border-red-500 focus:outline-none"
                        placeholder="일본어 문장 입력"
                      />
                    </div>
                    <div>
                      <label className="block text-sm font-semibold text-gray-800 mb-2">선택지</label>
                      <div className="space-y-2">
                        {editOptions.map((opt) => (
                          <div key={opt.id} className="flex items-center gap-2">
                            <span className="text-gray-500 w-6">{["❶","❷","❸","❹"][opt.id - 1]}</span>
                            <input
                              value={opt.text}
                              onChange={(e) =>
                                setEditOptions((prev) =>
                                  prev.map((o) =>
                                    o.id === opt.id ? { ...o, text: e.target.value } : o
                                  )
                                )
                              }
                              className="flex-1 border rounded px-3 py-2 text-sm"
                            />
                          </div>
                        ))}
                      </div>
                    </div>
                    <div>
                      <label className="block text-sm font-medium text-gray-600 mb-1">답변 설명</label>
                      <textarea
                        value={editExplanation}
                        onChange={(e) => setEditExplanation(e.target.value)}
                        rows={6}
                        className="w-full border rounded px-3 py-2 font-mono text-sm"
                      />
                    </div>
                    <div className="flex gap-2">
                      <button
                        onClick={() => handleSave(q.id, editExplanation, editJapanese, editOptions)}
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
                    <div className="text-base font-medium text-gray-800 mb-2 py-2 border-b">
                      문제: {formatJapanese(dispJapanese)}
                    </div>
                    <div className="text-sm text-gray-700 mb-2">
                      <span className="font-medium">선택지: </span>
                      {dispOptions.map((o) => o.text).join(" / ")}
                    </div>
                    <div className="text-sm text-gray-600 mb-2">
                      <span className="font-medium">설명: </span>
                    </div>
                    <pre className="text-sm whitespace-pre-wrap bg-gray-50 p-3 rounded overflow-x-auto max-h-24 overflow-y-auto mb-2">
                      {(dispExplanation || "").replace(/\\n/g, "\n")}
                    </pre>
                    <button
                      onClick={() => {
                        setEditJapanese(dispJapanese);
                        setEditOptions(JSON.parse(JSON.stringify(dispOptions)));
                        setEditExplanation((dispExplanation || "").replace(/\\n/g, "\n"));
                        setEditing(q.id);
                      }}
                      className="mt-2 text-sm text-red-600 hover:underline"
                    >
                      수정
                    </button>
                  </div>
                )}
              </div>
            );
            })}
          </div>

          <aside className="w-64 shrink-0">
            <div className="sticky top-4 bg-white rounded-lg shadow p-4">
              <h3 className="font-medium text-sm text-gray-700 mb-3">문제 제목</h3>
              <ul className="space-y-0 text-sm text-gray-600 max-h-[70vh] overflow-y-auto">
                {QUIZZES.map((q) => {
                  const ov = overrides[q.id];
                  const j = ov?.japanese ?? q.japanese;
                  const opts = ov?.options ?? q.options;
                  const qWithOverrides = { ...q, japanese: j, options: opts };
                  return (
                  <li
                    key={q.id}
                    className={q.id % 2 === 1 ? "bg-white" : "bg-gray-100"}
                  >
                    <button
                      type="button"
                      onClick={() => {
                        setCurrentPage(Math.ceil(q.id / PER_PAGE));
                        setEditing(null);
                        setTimeout(() => {
                          document.getElementById(`quiz-${q.id}`)?.scrollIntoView({ behavior: "smooth" });
                        }, 100);
                      }}
                      className="text-left w-full hover:text-red-600 hover:underline block break-words px-2 py-1.5 rounded"
                      title={`${formatJapanese(j)} ${getFullKorean(qWithOverrides)}`}
                    >
                      {q.id}. {formatJapanese(j)} {getFullKorean(qWithOverrides)}
                    </button>
                  </li>
                );
                })}
              </ul>
            </div>
          </aside>
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
                      <th className="text-left py-2 px-3">마지막 접속</th>
                      <th className="text-left py-2 px-3">관리</th>
                    </tr>
                  </thead>
                  <tbody>
                    {users.map((u) => (
                      <tr key={u.id} className="border-b">
                        {editingUserId === u.id ? (
                          <>
                            <td className="py-2 px-3">
                              <input
                                value={editUserForm.email}
                                onChange={(e) => setEditUserForm((f) => ({ ...f, email: e.target.value }))}
                                className="w-full border rounded px-2 py-1 text-sm"
                                placeholder="이메일"
                              />
                            </td>
                            <td className="py-2 px-3">
                              <input
                                value={editUserForm.name}
                                onChange={(e) => setEditUserForm((f) => ({ ...f, name: e.target.value }))}
                                className="w-full border rounded px-2 py-1 text-sm"
                                placeholder="이름"
                              />
                            </td>
                            <td className="py-2 px-3">
                              <input
                                value={editUserForm.username}
                                onChange={(e) => setEditUserForm((f) => ({ ...f, username: e.target.value }))}
                                className="w-full border rounded px-2 py-1 text-sm"
                                placeholder="아이디"
                              />
                            </td>
                            <td className="py-2 px-3">
                              {u.createdAt ? new Date(u.createdAt).toLocaleDateString("ja-JP") : "-"}
                            </td>
                            <td className="py-2 px-3">
                              {u.lastSignInAt ? new Date(u.lastSignInAt).toLocaleString("ja-JP") : "-"}
                            </td>
                            <td className="py-2 px-3">
                              <div className="flex gap-2">
                                <button
                                  onClick={handleSaveUser}
                                  disabled={userActionLoading}
                                  className="px-2 py-1 bg-red-600 text-white rounded text-xs hover:bg-red-700 disabled:opacity-50"
                                >
                                  저장
                                </button>
                                <button
                                  onClick={() => setEditingUserId(null)}
                                  disabled={userActionLoading}
                                  className="px-2 py-1 bg-gray-300 rounded text-xs hover:bg-gray-400 disabled:opacity-50"
                                >
                                  취소
                                </button>
                              </div>
                            </td>
                          </>
                        ) : (
                          <>
                            <td className="py-2 px-3">{u.email}</td>
                            <td className="py-2 px-3">{u.name || "-"}</td>
                            <td className="py-2 px-3">{u.username || "-"}</td>
                            <td className="py-2 px-3">
                              {u.createdAt ? new Date(u.createdAt).toLocaleDateString("ja-JP") : "-"}
                            </td>
                            <td className="py-2 px-3">
                              {u.lastSignInAt ? new Date(u.lastSignInAt).toLocaleString("ja-JP") : "-"}
                            </td>
                            <td className="py-2 px-3">
                              <div className="flex gap-2">
                                <button
                                  onClick={() => handleEditUser(u)}
                                  disabled={userActionLoading}
                                  className="text-red-600 hover:underline text-xs disabled:opacity-50"
                                >
                                  수정
                                </button>
                                <button
                                  onClick={() => handleDeleteUser(u.id, u.email)}
                                  disabled={userActionLoading}
                                  className="text-red-600 hover:underline text-xs disabled:opacity-50"
                                >
                                  삭제
                                </button>
                              </div>
                            </td>
                          </>
                        )}
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
