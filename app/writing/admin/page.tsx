"use client";

import { useState, useEffect } from "react";
import Link from "next/link";

const ADMIN_STORAGE_KEY = "admin_auth";
const WRITING_HOST = "writing.mirinae.jp";

type Assignment = {
  id: string;
  title_ko: string;
  title_ja?: string;
  description?: string;
  sort_order: number;
};

type Submission = {
  id: string;
  user_id: string;
  assignment_id: string;
  content: string;
  feedback?: string;
  submitted_at: string;
  feedback_at?: string;
  writing_assignments?: { title_ko: string; title_ja?: string };
  user?: { email: string; name?: string; username?: string };
};

const DEFAULT_ASSIGNMENTS = [
  { title_ko: "오늘 하루 일과", title_ja: "今日の一日の流れ", description: "오늘 하루 동안 한 일을 3문장 이상으로 써 보세요.", sort_order: 1 },
  { title_ko: "스트레스 푸는 법", title_ja: "ストレス解消法", description: "스트레스를 느낄 때와 푸는 방법에 대해 써 보세요.", sort_order: 2 },
  { title_ko: "내가 좋아하는 음식", title_ja: "好きな食べ物", description: "가장 좋아하는 음식과 그 이유를 써 보세요.", sort_order: 3 },
  { title_ko: "주말 계획", title_ja: "週末の計画", description: "이번 주말에 할 계획을 한국어로 써 보세요.", sort_order: 4 },
  { title_ko: "가족 소개", title_ja: "家族紹介", description: "가족 구성원을 소개하는 글을 써 보세요.", sort_order: 5 },
  { title_ko: "한국 여행", title_ja: "韓国旅行", description: "한국에서 가고 싶은 곳과 그 이유를 써 보세요.", sort_order: 6 },
  { title_ko: "나의 취미", title_ja: "私の趣味", description: "취미 생활에 대해 5문장 이상으로 써 보세요.", sort_order: 7 },
  { title_ko: "기억에 남는 날", title_ja: "思い出に残る日", description: "특별히 기억에 남는 하루를 써 보세요.", sort_order: 8 },
  { title_ko: "한국어 공부 방법", title_ja: "韓国語の勉強法", description: "한국어를 어떻게 공부하고 있는지 써 보세요.", sort_order: 9 },
  { title_ko: "내 꿈", title_ja: "私の夢", description: "미래의 꿈이나 목표에 대해 써 보세요.", sort_order: 10 },
];

export default function WritingAdminPage() {
  const [authKey, setAuthKey] = useState("");
  const [isAuthenticated, setIsAuthenticated] = useState(false);
  const [authChecked, setAuthChecked] = useState(false);
  const [activeTab, setActiveTab] = useState<"assignments" | "submissions">("assignments");
  const [assignments, setAssignments] = useState<Assignment[]>([]);
  const [submissions, setSubmissions] = useState<Submission[]>([]);
  const [loading, setLoading] = useState(false);
  const [loginError, setLoginError] = useState("");
  const [loginLoading, setLoginLoading] = useState(false);
  const [editingId, setEditingId] = useState<string | null>(null);
  const [editForm, setEditForm] = useState({ title_ko: "", title_ja: "", description: "", sort_order: 0 });
  const [newForm, setNewForm] = useState({ title_ko: "", title_ja: "", description: "", sort_order: 0 });
  const [feedbackId, setFeedbackId] = useState<string | null>(null);
  const [feedbackText, setFeedbackText] = useState("");
  const [saving, setSaving] = useState(false);
  const [seedLoading, setSeedLoading] = useState(false);

  useEffect(() => {
    const stored = typeof window !== "undefined" ? localStorage.getItem(ADMIN_STORAGE_KEY) : null;
    if (stored) {
      setAuthKey(stored);
      fetch("/api/admin/verify", {
        method: "POST",
        headers: { Authorization: `Bearer ${stored}` },
      })
        .then((r) => {
          if (r.ok) setIsAuthenticated(true);
          else localStorage.removeItem(ADMIN_STORAGE_KEY);
        })
        .catch(() => localStorage.removeItem(ADMIN_STORAGE_KEY))
        .finally(() => setAuthChecked(true));
    } else {
      setAuthChecked(true);
    }
  }, []);

  const loadAssignments = () => {
    setLoading(true);
    fetch("/api/writing/admin/assignments", {
      headers: { Authorization: `Bearer ${authKey}` },
    })
      .then((r) => r.json())
      .then((data) => setAssignments(data.assignments || []))
      .catch(() => setAssignments([]))
      .finally(() => setLoading(false));
  };

  const loadSubmissions = () => {
    setLoading(true);
    fetch("/api/writing/admin/submissions", {
      headers: { Authorization: `Bearer ${authKey}` },
    })
      .then((r) => r.json())
      .then((data) => setSubmissions(data.submissions || []))
      .catch(() => setSubmissions([]))
      .finally(() => setLoading(false));
  };

  useEffect(() => {
    if (!isAuthenticated || !authKey) return;
    if (activeTab === "assignments") loadAssignments();
    else loadSubmissions();
  }, [isAuthenticated, authKey, activeTab]);

  const handleLogin = async (e: React.FormEvent) => {
    e.preventDefault();
    const key = authKey.trim();
    if (!key) return;
    setLoginError("");
    setLoginLoading(true);
    try {
      const res = await fetch("/api/admin/verify", {
        method: "POST",
        headers: { Authorization: `Bearer ${key}` },
      });
      if (res.ok) {
        localStorage.setItem(ADMIN_STORAGE_KEY, key);
        setIsAuthenticated(true);
      } else {
        setLoginError("パスワードが正しくありません。");
      }
    } catch {
      setLoginError("接続に失敗しました。");
    } finally {
      setLoginLoading(false);
    }
  };

  const handleSeedAssignments = async () => {
    setSeedLoading(true);
    try {
      for (const a of DEFAULT_ASSIGNMENTS) {
        await fetch("/api/writing/admin/assignments", {
          method: "POST",
          headers: {
            "Content-Type": "application/json",
            Authorization: `Bearer ${authKey}`,
          },
          body: JSON.stringify(a),
        });
      }
      loadAssignments();
    } catch (e) {
      alert("시드 추가 실패");
    } finally {
      setSeedLoading(false);
    }
  };

  const handleAddAssignment = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!newForm.title_ko.trim()) return;
    setSaving(true);
    try {
      const res = await fetch("/api/writing/admin/assignments", {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
          Authorization: `Bearer ${authKey}`,
        },
        body: JSON.stringify(newForm),
      });
      const data = await res.json();
      if (res.ok) {
        setAssignments((prev) => [...prev, data.assignment]);
        setNewForm({ title_ko: "", title_ja: "", description: "", sort_order: 0 });
      } else {
        alert(data.error || "추가 실패");
      }
    } catch {
      alert("오류 발생");
    } finally {
      setSaving(false);
    }
  };

  const handleUpdateAssignment = async () => {
    if (!editingId) return;
    setSaving(true);
    try {
      const res = await fetch(`/api/writing/admin/assignments/${editingId}`, {
        method: "PUT",
        headers: {
          "Content-Type": "application/json",
          Authorization: `Bearer ${authKey}`,
        },
        body: JSON.stringify(editForm),
      });
      const data = await res.json();
      if (res.ok) {
        setAssignments((prev) =>
          prev.map((a) => (a.id === editingId ? data.assignment : a))
        );
        setEditingId(null);
      } else {
        alert(data.error || "수정 실패");
      }
    } catch {
      alert("오류 발생");
    } finally {
      setSaving(false);
    }
  };

  const handleDeleteAssignment = async (id: string) => {
    if (!confirm("이 과제를 삭제하시겠습니까?")) return;
    try {
      const res = await fetch(`/api/writing/admin/assignments/${id}`, {
        method: "DELETE",
        headers: { Authorization: `Bearer ${authKey}` },
      });
      if (res.ok) {
        setAssignments((prev) => prev.filter((a) => a.id !== id));
      } else {
        const data = await res.json();
        alert(data.error || "삭제 실패");
      }
    } catch {
      alert("오류 발생");
    }
  };

  const handleSaveFeedback = async () => {
    if (!feedbackId) return;
    setSaving(true);
    try {
      const res = await fetch(`/api/writing/admin/submissions/${feedbackId}`, {
        method: "PUT",
        headers: {
          "Content-Type": "application/json",
          Authorization: `Bearer ${authKey}`,
        },
        body: JSON.stringify({ feedback: feedbackText }),
      });
      const data = await res.json();
      if (res.ok) {
        setSubmissions((prev) =>
          prev.map((s) =>
            s.id === feedbackId ? { ...s, feedback: feedbackText, feedback_at: new Date().toISOString() } : s
          )
        );
        setFeedbackId(null);
        setFeedbackText("");
      } else {
        alert(data.error || "저장 실패");
      }
    } catch {
      alert("오류 발생");
    } finally {
      setSaving(false);
    }
  };

  if (!authChecked || !isAuthenticated) {
    if (!authChecked) {
      return (
        <div className="min-h-screen flex items-center justify-center bg-[#e8f6fc] p-4">
          <p className="text-gray-500">로딩 중...</p>
        </div>
      );
    }
    return (
      <div className="min-h-screen flex items-center justify-center bg-[#e8f6fc] p-4">
        <form
          onSubmit={handleLogin}
          className="bg-white p-8 rounded-xl shadow-lg w-full max-w-sm border border-[#c5e3f0]"
        >
          <h1 className="text-xl font-bold mb-4 text-center">관리자 로그인</h1>
          <input
            type="password"
            value={authKey}
            onChange={(e) => {
              setAuthKey(e.target.value);
              setLoginError("");
            }}
            placeholder="ADMIN_SECRET 입력"
            className="w-full border-2 border-[#c5e3f0] rounded-lg px-4 py-2 mb-2 focus:border-[#cd3737] focus:outline-none"
          />
          {loginError && <p className="text-red-600 text-sm mb-2">{loginError}</p>}
          <button
            type="submit"
            disabled={loginLoading}
            className="w-full bg-[#cd3737] text-white py-2 rounded-lg hover:bg-[#a52d2d] disabled:opacity-50"
          >
            {loginLoading ? "확인 중..." : "로그인"}
          </button>
          <Link href="/writing" className="mt-4 block text-center text-sm text-gray-500 hover:underline">
            作文 페이지로 돌아가기
          </Link>
        </form>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-[#e8f6fc] p-4">
      <div className="max-w-4xl mx-auto">
        <header className="flex justify-between items-center mb-6">
          <h1 className="text-2xl font-bold">作文 관리자</h1>
          <div className="flex gap-4">
            <Link href="/writing" className="text-sm text-gray-600 hover:underline">
              作文 페이지
            </Link>
            <Link href="/admin" className="text-sm text-gray-600 hover:underline">
              퀴즈 관리자
            </Link>
            <button
              type="button"
              onClick={() => {
                localStorage.removeItem(ADMIN_STORAGE_KEY);
                window.location.href = "/writing/admin";
              }}
              className="text-sm text-gray-500 hover:underline"
            >
              로그아웃
            </button>
          </div>
        </header>

        <div className="flex gap-4 mb-6">
          <button
            type="button"
            onClick={() => setActiveTab("assignments")}
            className={`px-4 py-2 rounded-lg font-medium ${
              activeTab === "assignments" ? "bg-[#cd3737] text-white" : "bg-white border border-[#c5e3f0]"
            }`}
          >
            과제 관리
          </button>
          <button
            type="button"
            onClick={() => setActiveTab("submissions")}
            className={`px-4 py-2 rounded-lg font-medium ${
              activeTab === "submissions" ? "bg-[#cd3737] text-white" : "bg-white border border-[#c5e3f0]"
            }`}
          >
            제출/첨삭
          </button>
        </div>

        {activeTab === "assignments" && (
          <div className="bg-white rounded-xl shadow-lg p-6 border border-[#c5e3f0]">
            <div className="flex justify-between items-center mb-4">
              <h2 className="text-lg font-bold">과제 목록</h2>
              <button
                type="button"
                onClick={handleSeedAssignments}
                disabled={seedLoading || assignments.length > 0}
                className="px-4 py-2 bg-amber-500 text-white rounded-lg hover:bg-amber-600 disabled:opacity-50 disabled:cursor-not-allowed text-sm"
              >
                {seedLoading ? "추가 중..." : "기본 과제 10개 추가"}
              </button>
            </div>

            <form onSubmit={handleAddAssignment} className="mb-6 p-4 bg-gray-50 rounded-lg space-y-3">
              <h3 className="font-medium">새 과제 추가</h3>
              <input
                type="text"
                value={newForm.title_ko}
                onChange={(e) => setNewForm((f) => ({ ...f, title_ko: e.target.value }))}
                placeholder="제목 (한국어)"
                className="w-full border rounded px-3 py-2"
                required
              />
              <input
                type="text"
                value={newForm.title_ja}
                onChange={(e) => setNewForm((f) => ({ ...f, title_ja: e.target.value }))}
                placeholder="제목 (일본어)"
                className="w-full border rounded px-3 py-2"
              />
              <textarea
                value={newForm.description}
                onChange={(e) => setNewForm((f) => ({ ...f, description: e.target.value }))}
                placeholder="설명"
                rows={2}
                className="w-full border rounded px-3 py-2"
              />
              <button type="submit" disabled={saving} className="px-4 py-2 bg-[#cd3737] text-white rounded-lg hover:bg-[#a52d2d] disabled:opacity-50">
                추가
              </button>
            </form>

            {loading ? (
              <p>로딩 중...</p>
            ) : assignments.length === 0 ? (
              <p className="text-gray-500">등록된 과제가 없습니다. 위에서 추가하거나 기본 과제를 불러오세요.</p>
            ) : (
              <ul className="space-y-3">
                {assignments.map((a) => (
                  <li key={a.id} className="p-4 border border-[#c5e3f0] rounded-lg">
                    {editingId === a.id ? (
                      <div className="space-y-2">
                        <input
                          value={editForm.title_ko}
                          onChange={(e) => setEditForm((f) => ({ ...f, title_ko: e.target.value }))}
                          className="w-full border rounded px-3 py-2"
                          placeholder="제목 (한국어)"
                        />
                        <input
                          value={editForm.title_ja}
                          onChange={(e) => setEditForm((f) => ({ ...f, title_ja: e.target.value }))}
                          className="w-full border rounded px-3 py-2"
                          placeholder="제목 (일본어)"
                        />
                        <textarea
                          value={editForm.description}
                          onChange={(e) => setEditForm((f) => ({ ...f, description: e.target.value }))}
                          rows={2}
                          className="w-full border rounded px-3 py-2"
                        />
                        <div className="flex gap-2">
                          <button
                            type="button"
                            onClick={handleUpdateAssignment}
                            disabled={saving}
                            className="px-3 py-1 bg-[#cd3737] text-white rounded text-sm"
                          >
                            저장
                          </button>
                          <button
                            type="button"
                            onClick={() => setEditingId(null)}
                            className="px-3 py-1 bg-gray-300 rounded text-sm"
                          >
                            취소
                          </button>
                        </div>
                      </div>
                    ) : (
                      <>
                        <p className="font-medium">{a.title_ko}</p>
                        {a.title_ja && <p className="text-sm text-gray-500">{a.title_ja}</p>}
                        {a.description && <p className="text-sm text-gray-600 mt-1">{a.description}</p>}
                        <div className="mt-2 flex gap-2">
                          <button
                            type="button"
                            onClick={() => {
                              setEditingId(a.id);
                              setEditForm({
                                title_ko: a.title_ko,
                                title_ja: a.title_ja || "",
                                description: a.description || "",
                                sort_order: a.sort_order,
                              });
                            }}
                            className="text-sm text-[#cd3737] hover:underline"
                          >
                            수정
                          </button>
                          <button
                            type="button"
                            onClick={() => handleDeleteAssignment(a.id)}
                            className="text-sm text-red-600 hover:underline"
                          >
                            삭제
                          </button>
                        </div>
                      </>
                    )}
                  </li>
                ))}
              </ul>
            )}
          </div>
        )}

        {activeTab === "submissions" && (
          <div className="bg-white rounded-xl shadow-lg p-6 border border-[#c5e3f0]">
            <h2 className="text-lg font-bold mb-4">제출 목록 / 첨삭</h2>
            {loading ? (
              <p>로딩 중...</p>
            ) : submissions.length === 0 ? (
              <p className="text-gray-500">제출된 과제가 없습니다.</p>
            ) : (
              <ul className="space-y-4">
                {submissions.map((s) => (
                  <li key={s.id} className="p-4 border border-[#c5e3f0] rounded-lg">
                    <p className="text-sm text-gray-500">
                      {(s as Submission).writing_assignments?.title_ko || "과제"} · {(s as Submission).user?.email || "-"} · {(s as Submission).user?.name || (s as Submission).user?.username || ""}
                    </p>
                    <p className="mt-2 whitespace-pre-wrap">{s.content}</p>
                    {feedbackId === s.id ? (
                      <div className="mt-4">
                        <textarea
                          value={feedbackText}
                          onChange={(e) => setFeedbackText(e.target.value)}
                          placeholder="첨삭 내용 입력..."
                          rows={4}
                          className="w-full border rounded px-3 py-2"
                        />
                        <div className="mt-2 flex gap-2">
                          <button
                            type="button"
                            onClick={handleSaveFeedback}
                            disabled={saving}
                            className="px-3 py-1 bg-[#cd3737] text-white rounded text-sm"
                          >
                            저장
                          </button>
                          <button
                            type="button"
                            onClick={() => {
                              setFeedbackId(null);
                              setFeedbackText("");
                            }}
                            className="px-3 py-1 bg-gray-300 rounded text-sm"
                          >
                            취소
                          </button>
                        </div>
                      </div>
                    ) : (
                      <div className="mt-3">
                        {s.feedback && (
                          <div className="p-3 bg-amber-50 rounded border border-amber-200 mb-2">
                            <p className="text-sm font-medium text-amber-800">첨삭:</p>
                            <p className="text-sm text-amber-900 whitespace-pre-wrap mt-1">{s.feedback}</p>
                          </div>
                        )}
                        <button
                          type="button"
                          onClick={() => {
                            setFeedbackId(s.id);
                            setFeedbackText(s.feedback || "");
                          }}
                          className="text-sm text-[#cd3737] hover:underline"
                        >
                          {s.feedback ? "첨삭 수정" : "첨삭 작성"}
                        </button>
                      </div>
                    )}
                    <p className="mt-2 text-xs text-gray-400">
                      {new Date(s.submitted_at).toLocaleString("ko-KR")}
                    </p>
                  </li>
                ))}
              </ul>
            )}
          </div>
        )}
      </div>
    </div>
  );
}
