"use client";

import { useState, useEffect } from "react";
import Link from "next/link";
import { QUIZZES } from "../quiz-data";
import { DEFAULT_ASSIGNMENT_EXAMPLES, PERIOD_LABELS } from "../data/assignment-examples-defaults";
import { PERIOD_EXAMPLES } from "../data/assignment-examples-period";

type Submission = {
  id: string;
  user_id: string;
  period_index: number;
  item_index: number;
  content: string;
  feedback?: string;
  corrected_content?: string;
  status: "pending" | "in_progress" | "completed";
  submitted_at: string;
  feedback_at?: string;
  completed_at?: string;
  user?: { email: string; name?: string; username?: string };
};

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
  const [overrides, setOverrides] = useState<Record<number, OverrideRow>>({});
  const [editing, setEditing] = useState<number | null>(null);
  const [editExplanation, setEditExplanation] = useState("");
  const [editJapanese, setEditJapanese] = useState("");
  const [editOptions, setEditOptions] = useState<{ id: number; text: string }[]>([]);
  const [saving, setSaving] = useState(false);
  const [loading, setLoading] = useState(true);
  const [currentPage, setCurrentPage] = useState(1);
  const [activeTab, setActiveTab] = useState<"quiz" | "users" | "analytics" | "submissions" | "kadai">("quiz");
  const [submissions, setSubmissions] = useState<Submission[]>([]);
  const [writingLoading, setWritingLoading] = useState(false);
  const [editingSubmissionId, setEditingSubmissionId] = useState<string | null>(null);
  const [feedbackText, setFeedbackText] = useState("");
  const [correctedContent, setCorrectedContent] = useState("");
  const [writingSaving, setWritingSaving] = useState(false);
  type UserRow = {
  id: string;
  email: string;
  name?: string;
  username?: string;
  createdAt?: string;
  lastSignInAt?: string;
  region?: string | null;
  plan_type?: string | null;
  course_type?: string | null;
  payment_status?: string | null;
  period?: number | null;
  interval?: string | null;
  start_date?: string | null;
  writing_approved?: boolean;
  registration_source?: string | null;
};
  const [users, setUsers] = useState<UserRow[]>([]);
  const [usersLoading, setUsersLoading] = useState(false);
  const [editingUserId, setEditingUserId] = useState<string | null>(null);
  const [editUserForm, setEditUserForm] = useState({
    email: "",
    name: "",
    username: "",
    region: "",
    plan_type: "",
    course_type: "",
    payment_status: "",
    period: "",
    interval: "",
    start_date: "",
    writing_approved: false,
  });
  const [userActionLoading, setUserActionLoading] = useState(false);
  const [userSearchKeyword, setUserSearchKeyword] = useState("");
  const [analytics, setAnalytics] = useState<{
    referrers: { domain: string; count: number; avgDuration?: number }[];
    userTypes?: { type: string; count: number; avgDuration?: number }[];
    sourceTypes?: { type: string; count: number; avgDuration?: number }[];
    sourceMedias?: { media: string; count: number; avgDuration?: number }[];
    countries?: { country: string; count: number; avgDuration?: number }[];
    regions?: { region: string; count: number; avgDuration?: number }[];
    quizStats: { sessions: number; avgDuration: number };
    kotaeStats: { sessions: number; avgDuration: number };
    totalSessions: number;
  } | null>(null);

  const formatDuration = (sec: number | null | undefined) =>
    sec == null ? "データなし" : sec > 0 ? `${Math.floor(sec / 60)}分${sec % 60}秒` : "0分0秒";
  const [analyticsLoading, setAnalyticsLoading] = useState(false);
  type KadaiOverrideItem = { title: string; topic: string; theme?: string; question?: string; grammarNote?: string; patterns?: { pattern: string; example: string }[] };
  const [kadaiOverrides, setKadaiOverrides] = useState<Record<number, Record<number, KadaiOverrideItem>>>({});
  const [kadaiLoading, setKadaiLoading] = useState(false);
  const [kadaiPeriodTab, setKadaiPeriodTab] = useState(0);
  const [editingKadai, setEditingKadai] = useState<{ period: number; item: number } | null>(null);
  const [kadaiEditForm, setKadaiEditForm] = useState({ title: "", topic: "", theme: "", question: "", grammarNote: "", patterns: [] as { pattern: string; example: string }[] });
  const [kadaiSaving, setKadaiSaving] = useState(false);
  const [analyticsDays, setAnalyticsDays] = useState(30);
  const filteredUsers = userSearchKeyword.trim()
    ? users.filter((u) => {
        const kw = userSearchKeyword.trim().toLowerCase();
        const email = (u.email || "").toLowerCase();
        const name = (u.name || "").toLowerCase();
        const username = (u.username || "").toLowerCase();
        return email.includes(kw) || name.includes(kw) || username.includes(kw);
      })
    : users;

  const [searchKeyword, setSearchKeyword] = useState("");
  const PER_PAGE = 10;
  const filteredQuizzes = searchKeyword.trim()
    ? (QUIZZES || []).filter((q) => {
        const ov = overrides[q.id];
        const kw = searchKeyword.trim().toLowerCase();
        const expl = (typeof ov === "string" ? ov : ov?.explanation) ?? q.explanation ?? "";
        const jpn = (typeof ov === "object" && ov?.japanese != null ? ov.japanese : null) ?? q.japanese ?? "";
        const opts = (typeof ov === "object" && ov?.options != null ? ov.options : null) ?? q.options ?? [];
        const searchable =
          expl.replace(/\\n/g, "\n") +
          " " +
          jpn +
          " " +
          q.koreanTemplate +
          " " +
          opts.map((o) => o.text).join(" ");
        return searchable.toLowerCase().includes(kw);
      })
    : (QUIZZES || []);
  const totalPages = Math.ceil(filteredQuizzes.length / PER_PAGE) || 1;
  const safePage = Math.min(Math.max(1, currentPage), totalPages);
  const startIdx = (safePage - 1) * PER_PAGE;
  const quizzesOnPage = filteredQuizzes.slice(startIdx, startIdx + PER_PAGE);

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

  const [loginError, setLoginError] = useState("");
  const [loginLoading, setLoginLoading] = useState(false);

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

  const handleLogout = () => {
    localStorage.removeItem(ADMIN_STORAGE_KEY);
    setIsAuthenticated(false);
    setAuthKey("");
  };

  const loadSubmissions = () => {
    setWritingLoading(true);
    fetch("/api/writing/admin/submissions", { headers: { Authorization: `Bearer ${authKey}` } })
      .then((r) => r.json())
      .then((data) => setSubmissions(data.submissions || []))
      .catch(() => setSubmissions([]))
      .finally(() => setWritingLoading(false));
  };

  useEffect(() => {
    if (!isAuthenticated || !authKey) return;
    if (activeTab === "submissions") loadSubmissions();
    else if (activeTab === "kadai") {
      setKadaiLoading(true);
      fetch("/api/admin/writing/assignment-examples", { headers: { Authorization: `Bearer ${authKey}` } })
        .then((r) => r.json())
        .then((data) => setKadaiOverrides(data.overrides || {}))
        .catch(() => setKadaiOverrides({}))
        .finally(() => setKadaiLoading(false));
    }
  }, [isAuthenticated, authKey, activeTab]);

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
        alert(err.error || "保存に失敗しました");
      }
    } catch (e) {
      alert("保存中にエラーが発生しました");
    } finally {
      setSaving(false);
    }
  };

  if (!authChecked || !isAuthenticated) {
    if (!authChecked) {
      return (
        <div className="min-h-screen flex items-center justify-center bg-gray-100 p-4">
          <p className="text-gray-500">読み込み中...</p>
        </div>
      );
    }
    return (
      <div className="min-h-screen flex items-center justify-center bg-gray-100 p-4">
        <form
          onSubmit={handleLogin}
          className="bg-white p-8 rounded-lg shadow-md w-full max-w-sm"
        >
          <h1 className="text-xl font-bold mb-4">管理者ログイン</h1>
          <input
            type="password"
            value={authKey}
            onChange={(e) => { setAuthKey(e.target.value); setLoginError(""); }}
            placeholder="ADMIN_SECRETを入力"
            className="w-full border rounded px-3 py-2 mb-2"
          />
          {loginError && (
            <p className="text-red-600 text-sm mb-2">{loginError}</p>
          )}
          <button
            type="submit"
            disabled={loginLoading}
            className="w-full bg-red-600 text-white py-2 rounded hover:bg-red-700 disabled:opacity-50"
          >
            {loginLoading ? "確認中..." : "ログイン"}
          </button>
        </form>
      </div>
    );
  }

  const loadUsers = () => {
    setUsersLoading(true);
    fetch("/api/admin/users", { headers: { Authorization: `Bearer ${authKey}` } })
      .then((r) => r.json())
      .then((data) => setUsers(data.users || []))
      .catch(() => setUsers([]))
      .finally(() => setUsersLoading(false));
  };

  const handleEditUser = (u: UserRow) => {
    setEditingUserId(u.id);
    setEditUserForm({
      email: u.email || "",
      name: u.name || "",
      username: u.username || "",
      region: u.region ?? "",
      plan_type: u.plan_type ?? "",
      course_type: u.course_type ?? "",
      payment_status: u.payment_status ?? "",
      period: u.period != null ? String(u.period) : "",
      interval: u.interval ?? "",
      start_date: u.start_date ? (String(u.start_date).split("T")[0] || u.start_date) : "",
      writing_approved: u.writing_approved ?? false,
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
        alert(data.error || "保存に失敗しました");
      }
    } catch (e) {
      alert("保存中にエラーが発生しました");
    } finally {
      setUserActionLoading(false);
    }
  };

  const handleToggleApproval = async (u: UserRow) => {
    setUserActionLoading(true);
    try {
      const res = await fetch(`/api/admin/users/${u.id}`, {
        method: "PUT",
        headers: {
          "Content-Type": "application/json",
          Authorization: `Bearer ${authKey}`,
        },
        body: JSON.stringify({ writing_approved: !u.writing_approved }),
      });
      const data = await res.json();
      if (res.ok) {
        setUsers((prev) =>
          prev.map((user) =>
            user.id === u.id ? { ...user, writing_approved: data.user?.writing_approved ?? !u.writing_approved } : user
          )
        );
      } else {
        alert(data.error || "更新に失敗しました");
      }
    } catch (e) {
      alert("更新中にエラーが発生しました");
    } finally {
      setUserActionLoading(false);
    }
  };

  const handleDeleteUser = async (userId: string, email: string) => {
    if (!confirm(`"${email}" を削除しますか？この操作は取り消せません。`)) return;
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
        alert(data.error || "削除に失敗しました");
      }
    } catch (e) {
      alert("削除中にエラーが発生しました");
    } finally {
      setUserActionLoading(false);
    }
  };

  const handleSaveFeedback = async (markCompleted?: boolean) => {
    if (!editingSubmissionId) return;
    setWritingSaving(true);
    try {
      const res = await fetch(`/api/writing/admin/submissions/${editingSubmissionId}`, {
        method: "PUT",
        headers: { "Content-Type": "application/json", Authorization: `Bearer ${authKey}` },
        body: JSON.stringify({
          feedback: feedbackText,
          corrected_content: correctedContent,
          status: markCompleted ? "completed" : "in_progress",
        }),
      });
      const data = await res.json();
      if (res.ok) {
        setSubmissions((prev) =>
          prev.map((s) =>
            s.id === editingSubmissionId
              ? {
                  ...s,
                  feedback: feedbackText,
                  corrected_content: correctedContent,
                  status: (markCompleted ? "completed" : "in_progress") as "pending" | "in_progress" | "completed",
                  feedback_at: new Date().toISOString(),
                  completed_at: markCompleted ? new Date().toISOString() : s.completed_at,
                }
              : s
          )
        );
        setEditingSubmissionId(null);
        setFeedbackText("");
        setCorrectedContent("");
      } else {
        alert(data.error || "저장 실패");
      }
    } catch {
      alert("오류 발생");
    } finally {
      setWritingSaving(false);
    }
  };

  const handleSaveKadai = async () => {
    if (!editingKadai) return;
    setKadaiSaving(true);
    try {
      const res = await fetch("/api/admin/writing/assignment-examples", {
        method: "PUT",
        headers: { "Content-Type": "application/json", Authorization: `Bearer ${authKey}` },
        body: JSON.stringify({
          period_index: editingKadai.period,
          item_index: editingKadai.item,
          title: kadaiEditForm.title,
          topic: kadaiEditForm.topic,
          theme: kadaiEditForm.theme || null,
          question: kadaiEditForm.question || null,
          grammar_note: kadaiEditForm.grammarNote || null,
          patterns: kadaiEditForm.patterns.length > 0 ? kadaiEditForm.patterns : null,
        }),
      });
      const data = await res.json();
      if (res.ok) {
        setKadaiOverrides((prev) => {
          const next = { ...prev };
          if (!next[editingKadai.period]) next[editingKadai.period] = {};
          next[editingKadai.period] = { ...next[editingKadai.period], [editingKadai.item]: { title: kadaiEditForm.title, topic: kadaiEditForm.topic, theme: kadaiEditForm.theme || undefined, question: kadaiEditForm.question || undefined, grammarNote: kadaiEditForm.grammarNote || undefined, patterns: kadaiEditForm.patterns.length > 0 ? kadaiEditForm.patterns : undefined } };
          return next;
        });
        setEditingKadai(null);
      } else {
        alert(data.error || "保存に失敗しました");
      }
    } catch {
      alert("保存中にエラーが発生しました");
    } finally {
      setKadaiSaving(false);
    }
  };

  return (
    <div className="min-h-screen bg-gray-100 p-4">
      <div className="w-full max-w-full px-4">
        <div className="flex justify-between items-center mb-6">
          <div className="flex gap-4">
          <button
            onClick={() => setActiveTab("quiz")}
            className={`px-4 py-2 rounded font-medium ${activeTab === "quiz" ? "bg-red-600 text-white" : "bg-white"}`}
          >
            クイズ編集
          </button>
          <button
            onClick={() => {
              setActiveTab("users");
              loadUsers();
            }}
            className={`px-4 py-2 rounded font-medium ${activeTab === "users" ? "bg-red-600 text-white" : "bg-white"}`}
          >
            会員一覧
          </button>
          <button
            onClick={() => {
              setActiveTab("analytics");
              setAnalyticsLoading(true);
              fetch(`/api/admin/analytics?days=${analyticsDays}`, {
                headers: { Authorization: `Bearer ${authKey}` },
              })
                .then((r) => r.json())
                .then((data) => {
                  if (data.error) throw new Error(data.error);
                  setAnalytics(data);
                })
                .catch(() => setAnalytics(null))
                .finally(() => setAnalyticsLoading(false));
            }}
            className={`px-4 py-2 rounded font-medium ${activeTab === "analytics" ? "bg-red-600 text-white" : "bg-white"}`}
          >
            アクセス解析
          </button>
          <button
            onClick={() => setActiveTab("submissions")}
            className={`px-4 py-2 rounded font-medium ${activeTab === "submissions" ? "bg-red-600 text-white" : "bg-white"}`}
          >
            作文提出
          </button>
          <button
            onClick={() => setActiveTab("kadai")}
            className={`px-4 py-2 rounded font-medium ${activeTab === "kadai" ? "bg-red-600 text-white" : "bg-white"}`}
          >
            作文課題
          </button>
          </div>
          <button
            onClick={handleLogout}
            className="text-sm text-gray-500 hover:text-gray-700"
          >
            ログアウト
          </button>
        </div>

        {activeTab === "quiz" && (
          <>
        <h1 className="text-2xl font-bold mb-4">クイズ編集</h1>
        <p className="text-sm text-gray-600 mb-4">
          問題(日本語)、選択肢(韓国語)、説明を編集できます。Supabaseの設定が必要です。
        </p>
        <div className="mb-6">
          <input
            type="text"
            value={searchKeyword}
            onChange={(e) => {
              setSearchKeyword(e.target.value);
              setCurrentPage(1);
            }}
            placeholder="問題・選択肢・説明でキーワード検索"
            className="w-full max-w-md border rounded-lg px-4 py-2.5 text-sm focus:border-red-500 focus:outline-none focus:ring-1 focus:ring-red-500"
          />
          {searchKeyword.trim() && (
            <p className="mt-1 text-sm text-gray-500">
              {filteredQuizzes.length}件
            </p>
          )}
        </div>

        {loading ? (
          <p>読み込み中...</p>
        ) : filteredQuizzes.length === 0 ? (
          <p className="text-gray-500">該当する問題がありません。</p>
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
                  <span className="font-medium">問題 {q.id}</span>
                </div>
                {editing === q.id ? (
                  <div className="space-y-4">
                    <div>
                      <label className="block text-sm font-semibold text-gray-800 mb-2">問題（日本語の文）</label>
                      <input
                        value={editJapanese}
                        onChange={(e) => setEditJapanese(e.target.value)}
                        className="w-full border-2 border-gray-300 rounded px-3 py-2.5 text-base focus:border-red-500 focus:outline-none"
                        placeholder="日本語の文を入力"
                      />
                    </div>
                    <div>
                      <label className="block text-sm font-semibold text-gray-800 mb-2">選択肢（韓国語）</label>
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
                      <label className="block text-sm font-medium text-gray-600 mb-1">回答の説明</label>
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
                        保存
                      </button>
                      <button
                        onClick={() => setEditing(null)}
                        className="px-4 py-2 bg-gray-300 rounded hover:bg-gray-400"
                      >
                        キャンセル
                      </button>
                    </div>
                  </div>
                ) : (
                  <div>
                    <div className="text-base font-medium text-gray-800 mb-2 py-2">
                      {q.koreanTemplate.replace(/_{10,}/g, "________________________")}
                    </div>
                    <div className="text-sm text-gray-700 mb-2 py-2 border-b">
                      <span className="font-medium">問題: </span>
                      {formatJapanese(dispJapanese)}
                    </div>
                    <div className="text-sm text-gray-700 mb-2 pt-2">
                      <span className="font-medium">選択肢(韓国語): </span>
                      {dispOptions.map((o) => o.text).join(" / ")}
                    </div>
                    <div className="text-sm text-gray-600 mb-2">
                      <span className="font-medium">説明: </span>
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
                      編集
                    </button>
                  </div>
                )}
              </div>
            );
            })}
          </div>

          <aside className="w-64 shrink-0">
            <div className="sticky top-4 bg-white rounded-lg shadow p-4">
              <h3 className="font-medium text-sm text-gray-700 mb-3">問題タイトル</h3>
              <ul className="space-y-0 text-sm text-gray-600 max-h-[70vh] overflow-y-auto">
                {filteredQuizzes.map((q, idx) => {
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
                        setCurrentPage(Math.ceil((idx + 1) / PER_PAGE) || 1);
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
                disabled={safePage === 1}
                className="px-4 py-2 bg-white border rounded hover:bg-gray-50 disabled:opacity-50 disabled:cursor-not-allowed"
              >
                前へ
              </button>
              <span className="px-4 py-2 text-sm">
                {safePage} / {totalPages}
              </span>
              <button
                onClick={() => { setEditing(null); setCurrentPage((p) => Math.min(totalPages, p + 1)); }}
                disabled={safePage === totalPages}
                className="px-4 py-2 bg-white border rounded hover:bg-gray-50 disabled:opacity-50 disabled:cursor-not-allowed"
              >
                次へ
              </button>
            </div>
          )}
          </>
        )}
        </>
        )}

        {activeTab === "users" && (
          <div className="bg-white p-6 rounded-lg shadow">
            <h1 className="text-2xl font-bold mb-4">会員登録データ</h1>
            <div className="mb-4">
              <input
                type="text"
                value={userSearchKeyword}
                onChange={(e) => setUserSearchKeyword(e.target.value)}
                placeholder="メール・名前・IDで検索"
                className="w-full max-w-md border rounded-lg px-4 py-2.5 text-sm focus:border-red-500 focus:outline-none focus:ring-1 focus:ring-red-500"
              />
              {userSearchKeyword.trim() && (
                <p className="mt-1 text-sm text-gray-500">
                  {filteredUsers.length}件
                </p>
              )}
            </div>
            {usersLoading ? (
              <p>読み込み中...</p>
            ) : users.length === 0 ? (
              <p className="text-gray-500">登録された会員はいません。</p>
            ) : filteredUsers.length === 0 ? (
              <p className="text-gray-500">該当する会員がありません。</p>
            ) : (
              <div className="overflow-x-auto">
                <table className="w-full text-sm">
                  <thead>
                    <tr className="border-b">
                      <th className="text-left py-2 px-3">登録元</th>
                      <th className="text-left py-2 px-3">メール</th>
                      <th className="text-left py-2 px-3">名前</th>
                      <th className="text-left py-2 px-3">ID</th>
                      <th className="text-left py-2 px-3">地域</th>
                      <th className="text-left py-2 px-3">無料/有料</th>
                      <th className="text-left py-2 px-3">作文/音読</th>
                      <th className="text-left py-2 px-3">決済</th>
                      <th className="text-left py-2 px-3">期目</th>
                      <th className="text-left py-2 px-3">間隔</th>
                      <th className="text-left py-2 px-3">開始日</th>
                      <th className="text-left py-2 px-3">MY PAGE</th>
                      <th className="text-left py-2 px-3">登録日</th>
                      <th className="text-left py-2 px-3">最終アクセス</th>
                      <th className="text-left py-2 px-3">管理</th>
                    </tr>
                  </thead>
                  <tbody>
                    {filteredUsers.map((u) => (
                      <tr key={u.id} className="border-b">
                        {editingUserId === u.id ? (
                          <>
                            <td className="py-2 px-3 text-gray-500 text-xs">{u.registration_source || "-"}</td>
                            <td className="py-2 px-3">
                              <input
                                value={editUserForm.email}
                                onChange={(e) => setEditUserForm((f) => ({ ...f, email: e.target.value }))}
                                className="w-full min-w-[120px] border rounded px-2 py-1 text-sm"
                                placeholder="メール"
                              />
                            </td>
                            <td className="py-2 px-3">
                              <input
                                value={editUserForm.name}
                                onChange={(e) => setEditUserForm((f) => ({ ...f, name: e.target.value }))}
                                className="w-full border rounded px-2 py-1 text-sm"
                                placeholder="名前"
                              />
                            </td>
                            <td className="py-2 px-3">
                              <input
                                value={editUserForm.username}
                                onChange={(e) => setEditUserForm((f) => ({ ...f, username: e.target.value }))}
                                className="w-full border rounded px-2 py-1 text-sm"
                                placeholder="ID"
                              />
                            </td>
                            <td className="py-2 px-3">
                              <input
                                value={editUserForm.region}
                                onChange={(e) => setEditUserForm((f) => ({ ...f, region: e.target.value }))}
                                className="w-full border rounded px-2 py-1 text-sm"
                                placeholder="地域"
                              />
                            </td>
                            <td className="py-2 px-3">
                              <select
                                value={editUserForm.plan_type}
                                onChange={(e) => setEditUserForm((f) => ({ ...f, plan_type: e.target.value }))}
                                className="w-full border rounded px-2 py-1 text-sm"
                              >
                                <option value="">-</option>
                                <option value="無料">無料</option>
                                <option value="有料">有料</option>
                              </select>
                            </td>
                            <td className="py-2 px-3">
                              <select
                                value={editUserForm.course_type}
                                onChange={(e) => setEditUserForm((f) => ({ ...f, course_type: e.target.value }))}
                                className="w-full border rounded px-2 py-1 text-sm"
                              >
                                <option value="">-</option>
                                <option value="作文">作文</option>
                                <option value="音読">音読</option>
                              </select>
                            </td>
                            <td className="py-2 px-3">
                              <select
                                value={editUserForm.payment_status}
                                onChange={(e) => setEditUserForm((f) => ({ ...f, payment_status: e.target.value }))}
                                className="w-full border rounded px-2 py-1 text-sm"
                              >
                                <option value="">-</option>
                                <option value="有">有</option>
                                <option value="無">無</option>
                              </select>
                            </td>
                            <td className="py-2 px-3">
                              <select
                                value={editUserForm.period}
                                onChange={(e) => setEditUserForm((f) => ({ ...f, period: e.target.value }))}
                                className="w-full border rounded px-2 py-1 text-sm"
                              >
                                <option value="">-</option>
                                {[1, 2, 3, 4, 5, 6, 7, 8].map((n) => (
                                  <option key={n} value={n}>{n}</option>
                                ))}
                              </select>
                            </td>
                            <td className="py-2 px-3">
                              <select
                                value={editUserForm.interval}
                                onChange={(e) => setEditUserForm((f) => ({ ...f, interval: e.target.value }))}
                                className="w-full border rounded px-2 py-1 text-sm"
                              >
                                <option value="">-</option>
                                <option value="1週">1週</option>
                                <option value="2週">2週</option>
                              </select>
                            </td>
                            <td className="py-2 px-3">
                              <input
                                type="date"
                                value={editUserForm.start_date}
                                onChange={(e) => setEditUserForm((f) => ({ ...f, start_date: e.target.value }))}
                                className="w-full border rounded px-2 py-1 text-sm"
                              />
                            </td>
                            <td className="py-2 px-3">
                              <label className="flex items-center gap-1 cursor-pointer">
                                <input
                                  type="checkbox"
                                  checked={editUserForm.writing_approved}
                                  onChange={(e) => setEditUserForm((f) => ({ ...f, writing_approved: e.target.checked }))}
                                  className="rounded"
                                />
                                <span className="text-xs">承認</span>
                              </label>
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
                                  保存
                                </button>
                                <button
                                  onClick={() => setEditingUserId(null)}
                                  disabled={userActionLoading}
                                  className="px-2 py-1 bg-gray-300 rounded text-xs hover:bg-gray-400 disabled:opacity-50"
                                >
                                  キャンセル
                                </button>
                              </div>
                            </td>
                          </>
                        ) : (
                          <>
                            <td className="py-2 px-3 font-medium">{u.registration_source || "-"}</td>
                            <td className="py-2 px-3">{u.email}</td>
                            <td className="py-2 px-3">{u.name || "-"}</td>
                            <td className="py-2 px-3">{u.username || "-"}</td>
                            <td className="py-2 px-3">{u.region || "-"}</td>
                            <td className="py-2 px-3">{u.plan_type || "-"}</td>
                            <td className="py-2 px-3">{u.course_type || "-"}</td>
                            <td className="py-2 px-3">{u.payment_status || "-"}</td>
                            <td className="py-2 px-3">{u.period ?? "-"}</td>
                            <td className="py-2 px-3">{u.interval || "-"}</td>
                            <td className="py-2 px-3">{u.start_date ? new Date(u.start_date).toLocaleDateString("ja-JP") : "-"}</td>
                            <td className="py-2 px-3">
                              <button
                                type="button"
                                onClick={() => handleToggleApproval(u)}
                                disabled={userActionLoading}
                                className={`px-2 py-1 rounded text-xs font-medium ${u.writing_approved ? "bg-green-100 text-green-800 hover:bg-green-200" : "bg-gray-100 text-gray-600 hover:bg-gray-200"} disabled:opacity-50`}
                                title={u.writing_approved ? "承認を取り消す" : "承認する"}
                              >
                                {u.writing_approved ? "✓ 承認" : "未承認"}
                              </button>
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
                                  onClick={() => handleEditUser(u)}
                                  disabled={userActionLoading}
                                  className="text-red-600 hover:underline text-xs disabled:opacity-50"
                                >
                                  編集
                                </button>
                                <button
                                  onClick={() => handleDeleteUser(u.id, u.email)}
                                  disabled={userActionLoading}
                                  className="text-red-600 hover:underline text-xs disabled:opacity-50"
                                >
                                  削除
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
              更新
            </button>
          </div>
        )}

        {activeTab === "analytics" && (
          <div className="bg-white p-6 rounded-lg shadow">
            <h1 className="text-2xl font-bold mb-4">アクセス解析</h1>
            <p className="text-sm text-gray-600 mb-4">
              クイズ・Q&Aアプリへのアクセス元と滞在時間を分析します。
            </p>
            <div className="mb-4 flex items-center gap-2">
              <label className="text-sm">期間:</label>
              <select
                value={analyticsDays}
                onChange={(e) => setAnalyticsDays(parseInt(e.target.value, 10))}
                className="border rounded px-3 py-1.5 text-sm"
              >
                <option value={7}>過去7日</option>
                <option value={30}>過去30日</option>
                <option value={90}>過去90日</option>
              </select>
              <button
                onClick={() => {
                  setAnalyticsLoading(true);
                  fetch(`/api/admin/analytics?days=${analyticsDays}`, {
                    headers: { Authorization: `Bearer ${authKey}` },
                  })
                    .then((r) => r.json())
                    .then((data) => {
                      if (data.error) throw new Error(data.error);
                      setAnalytics(data);
                    })
                    .catch(() => setAnalytics(null))
                    .finally(() => setAnalyticsLoading(false));
                }}
                className="px-3 py-1.5 text-sm bg-gray-100 rounded hover:bg-gray-200"
              >
                更新
              </button>
            </div>
            {analyticsLoading ? (
              <p>読み込み中...</p>
            ) : analytics ? (
              <div className="space-y-6">
                <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
                  <div className="p-4 bg-blue-50 rounded-lg">
                    <h3 className="font-semibold text-blue-800 mb-1">クイズ</h3>
                    <p className="text-2xl font-bold text-blue-600">{analytics.quizStats.sessions}</p>
                    <p className="text-sm text-gray-600">アクセス数</p>
                    <p className="text-sm text-gray-600 mt-1">
                      平均滞在 {formatDuration(analytics.quizStats.avgDuration ?? null)}
                    </p>
                  </div>
                  <div className="p-4 bg-green-50 rounded-lg">
                    <h3 className="font-semibold text-green-800 mb-1">Q&A</h3>
                    <p className="text-2xl font-bold text-green-600">{analytics.kotaeStats.sessions}</p>
                    <p className="text-sm text-gray-600">アクセス数</p>
                    <p className="text-sm text-gray-600 mt-1">
                      平均滞在 {formatDuration(analytics.kotaeStats.avgDuration ?? null)}
                    </p>
                  </div>
                  <div className="p-4 bg-gray-50 rounded-lg">
                    <h3 className="font-semibold text-gray-800 mb-1">合計</h3>
                    <p className="text-2xl font-bold text-gray-600">{analytics.totalSessions}</p>
                    <p className="text-sm text-gray-600">セッション数</p>
                  </div>
                </div>
                {(analytics.userTypes?.length ?? 0) > 0 && (
                  <div>
                    <h3 className="font-semibold mb-3">会員 / 外部</h3>
                    <table className="w-full text-sm">
                      <thead>
                        <tr className="border-b">
                          <th className="text-left py-2 px-3">区分</th>
                          <th className="text-right py-2 px-3">アクセス数</th>
                          <th className="text-right py-2 px-3">平均滞在</th>
                        </tr>
                      </thead>
                      <tbody>
                        {analytics.userTypes!.map((s) => (
                          <tr key={s.type} className="border-b">
                            <td className="py-2 px-3">
                              {s.type === "member" ? "ログイン会員" : "外部アクセス"}
                            </td>
                            <td className="py-2 px-3 text-right">{s.count}</td>
                            <td className="py-2 px-3 text-right">{formatDuration(s.avgDuration ?? null)}</td>
                          </tr>
                        ))}
                      </tbody>
                    </table>
                  </div>
                )}
                {(analytics.sourceTypes?.length ?? 0) > 0 && (
                  <div>
                    <h3 className="font-semibold mb-3">流入元タイプ</h3>
                    <table className="w-full text-sm">
                      <thead>
                        <tr className="border-b">
                          <th className="text-left py-2 px-3">タイプ</th>
                          <th className="text-right py-2 px-3">アクセス数</th>
                          <th className="text-right py-2 px-3">平均滞在</th>
                        </tr>
                      </thead>
                      <tbody>
                        {analytics.sourceTypes!.map((s) => (
                          <tr key={s.type} className="border-b">
                            <td className="py-2 px-3">
                              {s.type === "search" ? "検索" : s.type === "sns" ? "SNS" : s.type === "direct" ? "直接" : s.type === "referral" ? "その他" : s.type}
                            </td>
                            <td className="py-2 px-3 text-right">{s.count}</td>
                            <td className="py-2 px-3 text-right">{formatDuration(s.avgDuration ?? null)}</td>
                          </tr>
                        ))}
                      </tbody>
                    </table>
                  </div>
                )}
                {(analytics.sourceMedias?.length ?? 0) > 0 && (
                  <div>
                    <h3 className="font-semibold mb-3">SNSメディア別</h3>
                    <table className="w-full text-sm">
                      <thead>
                        <tr className="border-b">
                          <th className="text-left py-2 px-3">メディア</th>
                          <th className="text-right py-2 px-3">アクセス数</th>
                          <th className="text-right py-2 px-3">平均滞在</th>
                        </tr>
                      </thead>
                      <tbody>
                        {analytics.sourceMedias!.map((s) => (
                          <tr key={s.media} className="border-b">
                            <td className="py-2 px-3">{s.media}</td>
                            <td className="py-2 px-3 text-right">{s.count}</td>
                            <td className="py-2 px-3 text-right">{formatDuration(s.avgDuration ?? null)}</td>
                          </tr>
                        ))}
                      </tbody>
                    </table>
                  </div>
                )}
                {(analytics.countries?.length ?? 0) > 0 && (
                  <div>
                    <h3 className="font-semibold mb-3">国・地域別</h3>
                    <table className="w-full text-sm">
                      <thead>
                        <tr className="border-b">
                          <th className="text-left py-2 px-3">国・地域</th>
                          <th className="text-right py-2 px-3">アクセス数</th>
                          <th className="text-right py-2 px-3">平均滞在</th>
                        </tr>
                      </thead>
                      <tbody>
                        {analytics.countries!.map((c) => (
                          <tr key={c.country} className="border-b">
                            <td className="py-2 px-3">{c.country}</td>
                            <td className="py-2 px-3 text-right">{c.count}</td>
                            <td className="py-2 px-3 text-right">{formatDuration(c.avgDuration ?? null)}</td>
                          </tr>
                        ))}
                      </tbody>
                    </table>
                  </div>
                )}
                {(analytics.regions?.length ?? 0) > 0 && (
                  <div>
                    <h3 className="font-semibold mb-3">地域詳細（国 / 都道府県・都市）</h3>
                    <table className="w-full text-sm">
                      <thead>
                        <tr className="border-b">
                          <th className="text-left py-2 px-3">地域</th>
                          <th className="text-right py-2 px-3">アクセス数</th>
                          <th className="text-right py-2 px-3">平均滞在</th>
                        </tr>
                      </thead>
                      <tbody>
                        {analytics.regions!.map((r) => (
                          <tr key={r.region} className="border-b">
                            <td className="py-2 px-3">{r.region}</td>
                            <td className="py-2 px-3 text-right">{r.count}</td>
                            <td className="py-2 px-3 text-right">{formatDuration(r.avgDuration ?? null)}</td>
                          </tr>
                        ))}
                      </tbody>
                    </table>
                  </div>
                )}
                <div>
                  <h3 className="font-semibold mb-3">アクセス元（参照元）</h3>
                  {analytics.referrers.length === 0 ? (
                    <p className="text-gray-500">データがありません。</p>
                  ) : (
                    <table className="w-full text-sm">
                      <thead>
                        <tr className="border-b">
                          <th className="text-left py-2 px-3">参照元</th>
                          <th className="text-right py-2 px-3">アクセス数</th>
                          <th className="text-right py-2 px-3">平均滞在</th>
                        </tr>
                      </thead>
                      <tbody>
                        {analytics.referrers.map((r) => (
                          <tr key={r.domain} className="border-b">
                            <td className="py-2 px-3">{r.domain}</td>
                            <td className="py-2 px-3 text-right">{r.count}</td>
                            <td className="py-2 px-3 text-right">{formatDuration(r.avgDuration ?? null)}</td>
                          </tr>
                        ))}
                      </tbody>
                    </table>
                  )}
                </div>
              </div>
            ) : (
              <p className="text-gray-500">データを読み込んでください。</p>
            )}
          </div>
        )}

        {activeTab === "submissions" && (
          <div className="bg-white p-6 rounded-lg shadow">
            <h1 className="text-2xl font-bold mb-4">作文提出一覧・添削</h1>
            <Link href="/writing" className="text-sm text-gray-600 hover:underline mb-4 block">作文ページ</Link>
            {writingLoading ? (
              <p>読み込み中...</p>
            ) : submissions.length === 0 ? (
              <p className="text-gray-500">提出された課題がありません。</p>
            ) : (
              <ul className="space-y-4">
                {submissions.map((s) => {
                  const title = DEFAULT_ASSIGNMENT_EXAMPLES[s.period_index]?.[s.item_index]?.title || `第${s.item_index + 1}回`;
                  const periodLabel = PERIOD_LABELS[s.period_index] || `${s.period_index + 1}期`;
                  const statusLabel = s.status === "completed" ? "完了" : s.status === "in_progress" ? "添削中" : "未添削";
                  const statusColor = s.status === "completed" ? "bg-green-100 text-green-800" : s.status === "in_progress" ? "bg-amber-100 text-amber-800" : "bg-gray-100 text-gray-700";
                  return (
                    <li key={s.id} className="p-4 border rounded-lg">
                      <div className="flex items-center justify-between gap-2 flex-wrap">
                        <p className="text-sm text-gray-700">
                          <span className="font-medium">{periodLabel} 第{s.item_index + 1}回</span> · {title} · {s.user?.name || s.user?.username || s.user?.email || "-"}
                        </p>
                        <span className={`px-2 py-0.5 rounded text-xs font-medium ${statusColor}`}>{statusLabel}</span>
                      </div>
                      <p className="mt-1 text-xs text-gray-500">{new Date(s.submitted_at).toLocaleString("ja-JP")}</p>
                      <p className="mt-2 whitespace-pre-wrap text-sm">{s.content}</p>
                      {s.feedback && (
                        <div className="mt-2 p-3 bg-amber-50 rounded border border-amber-200">
                          <p className="text-xs font-medium text-amber-800">添削:</p>
                          <p className="text-sm text-amber-900 whitespace-pre-wrap mt-1">{s.feedback}</p>
                        </div>
                      )}
                      <button
                        type="button"
                        onClick={() => {
                          setEditingSubmissionId(s.id);
                          setFeedbackText(s.feedback || "");
                          setCorrectedContent(s.corrected_content || s.content);
                        }}
                        className="mt-2 text-sm text-red-600 hover:underline"
                      >
                        添削・編集
                      </button>
                    </li>
                  );
                })}
              </ul>
            )}
            {editingSubmissionId && (() => {
              const s = submissions.find((x) => x.id === editingSubmissionId);
              if (!s) return null;
              return (
                <div className="fixed inset-0 bg-black/50 flex items-center justify-center z-50 p-4">
                  <div className="bg-white rounded-xl shadow-xl max-w-2xl w-full max-h-[90vh] overflow-hidden flex flex-col">
                    <div className="px-4 py-3 border-b flex justify-between items-center">
                      <h3 className="font-bold">
                        {PERIOD_LABELS[s.period_index]} 第{s.item_index + 1}回 · {DEFAULT_ASSIGNMENT_EXAMPLES[s.period_index]?.[s.item_index]?.title || "課題"} · {s.user?.name || s.user?.email || "-"}
                      </h3>
                      <button onClick={() => { setEditingSubmissionId(null); setFeedbackText(""); setCorrectedContent(""); }} className="text-gray-500 hover:text-gray-700">閉じる</button>
                    </div>
                    <div className="flex-1 overflow-y-auto p-4 space-y-4">
                      <div>
                        <label className="block text-xs font-medium text-gray-500 mb-1">提出原文（読み取り専用）</label>
                        <pre className="p-3 bg-gray-50 rounded text-sm whitespace-pre-wrap max-h-32 overflow-y-auto">{s.content}</pre>
                      </div>
                      <div>
                        <label className="block text-xs font-medium text-gray-500 mb-1">修正文（編集可）</label>
                        <textarea
                          value={correctedContent}
                          onChange={(e) => setCorrectedContent(e.target.value)}
                          rows={8}
                          className="w-full border rounded px-3 py-2 text-sm"
                          placeholder="修正した原文を入力..."
                        />
                      </div>
                      <div>
                        <label className="block text-xs font-medium text-gray-500 mb-1">添削コメント</label>
                        <textarea
                          value={feedbackText}
                          onChange={(e) => setFeedbackText(e.target.value)}
                          rows={4}
                          className="w-full border rounded px-3 py-2 text-sm"
                          placeholder="添削内容を入力..."
                        />
                      </div>
                    </div>
                    <div className="px-4 py-3 border-t flex gap-2 justify-end">
                      <button type="button" onClick={() => handleSaveFeedback(false)} disabled={writingSaving} className="px-4 py-2 bg-gray-600 text-white rounded text-sm hover:bg-gray-700 disabled:opacity-50">
                        保存
                      </button>
                      <button type="button" onClick={() => handleSaveFeedback(true)} disabled={writingSaving} className="px-4 py-2 bg-green-600 text-white rounded text-sm hover:bg-green-700 disabled:opacity-50">
                        完了
                      </button>
                    </div>
                  </div>
                </div>
              );
            })()}
          </div>
        )}

        {activeTab === "kadai" && (
          <div className="bg-white p-6 rounded-lg shadow">
            <h1 className="text-2xl font-bold mb-4">作文課題（1期～8期）編集</h1>
            <p className="text-sm text-gray-600 mb-4">作文ページの作文課題掲示板の「제목」と「실제 과제」を編集できます。</p>
            <Link href="/writing" className="text-sm text-gray-600 hover:underline mb-4 block">作文ページ</Link>
            {kadaiLoading ? (
              <p>読み込み中...</p>
            ) : (
              <>
                <div className="flex gap-2 mb-4 flex-wrap">
                  {PERIOD_LABELS.map((label, i) => (
                    <button
                      key={i}
                      onClick={() => { setKadaiPeriodTab(i); setEditingKadai(null); }}
                      className={`px-3 py-1.5 rounded text-sm font-medium ${kadaiPeriodTab === i ? "bg-red-600 text-white" : "bg-gray-200 text-gray-700"}`}
                    >
                      {label}
                    </button>
                  ))}
                </div>
                <div className="space-y-3">
                  {DEFAULT_ASSIGNMENT_EXAMPLES[kadaiPeriodTab]?.map((def, itemIdx) => {
                    const ov = kadaiOverrides[kadaiPeriodTab]?.[itemIdx];
                    const title = ov?.title ?? def.title;
                    const topic = ""; // 설명 비표시
                    const isEditing = editingKadai?.period === kadaiPeriodTab && editingKadai?.item === itemIdx;
                    return (
                      <div key={itemIdx} className="p-4 border rounded-lg">
                        {isEditing ? (
                          <div className="space-y-2">
                            <div>
                              <label className="block text-xs font-medium text-gray-500 mb-1">제목（タイトル）</label>
                              <input
                                value={kadaiEditForm.title}
                                onChange={(e) => setKadaiEditForm((f) => ({ ...f, title: e.target.value }))}
                                className="w-full border rounded px-3 py-2 text-sm"
                                placeholder="제목"
                              />
                            </div>
                            <div>
                              <label className="block text-xs font-medium text-gray-500 mb-1">課題内容（韓国語）</label>
                              <textarea
                                value={kadaiEditForm.question}
                                onChange={(e) => setKadaiEditForm((f) => ({ ...f, question: e.target.value }))}
                                className="w-full border rounded px-3 py-2 text-sm"
                                rows={3}
                                placeholder="課題内容"
                              />
                            </div>
                            <div>
                              <label className="block text-xs font-medium text-gray-500 mb-1">文型使用の注意（例: 下記に提示された文型を、必ず2つ以上使用すること。）</label>
                              <input
                                value={kadaiEditForm.grammarNote}
                                onChange={(e) => setKadaiEditForm((f) => ({ ...f, grammarNote: e.target.value }))}
                                className="w-full border rounded px-3 py-2 text-sm"
                                placeholder="文型使用の注意"
                              />
                            </div>
                            <div>
                              <label className="block text-xs font-medium text-gray-500 mb-1">文型パターン（pattern / example）</label>
                              {kadaiEditForm.patterns.map((p, i) => (
                                <div key={i} className="flex gap-2 mb-2">
                                  <input
                                    value={p.pattern}
                                    onChange={(e) => setKadaiEditForm((f) => {
                                      const next = [...f.patterns];
                                      next[i] = { ...next[i], pattern: e.target.value };
                                      return { ...f, patterns: next };
                                    })}
                                    className="flex-1 border rounded px-3 py-2 text-sm"
                                    placeholder="○-ㄹ/줄 몰랐다　～とは思わなかった"
                                  />
                                  <input
                                    value={p.example}
                                    onChange={(e) => setKadaiEditForm((f) => {
                                      const next = [...f.patterns];
                                      next[i] = { ...next[i], example: e.target.value };
                                      return { ...f, patterns: next };
                                    })}
                                    className="flex-1 border rounded px-3 py-2 text-sm"
                                    placeholder="예) 그런 좋은 방법이 있는 줄 몰랐다."
                                  />
                                  <button type="button" onClick={() => setKadaiEditForm((f) => ({ ...f, patterns: f.patterns.filter((_, j) => j !== i) }))} className="text-red-600 text-sm">削除</button>
                                </div>
                              ))}
                              <button type="button" onClick={() => setKadaiEditForm((f) => ({ ...f, patterns: [...f.patterns, { pattern: "", example: "" }] }))} className="text-sm text-red-600 hover:underline">+ 文型を追加</button>
                            </div>
                            <div className="flex gap-2">
                              <button type="button" onClick={handleSaveKadai} disabled={kadaiSaving} className="px-3 py-1 bg-red-600 text-white rounded text-sm">
                                保存
                              </button>
                              <button type="button" onClick={() => setEditingKadai(null)} className="px-3 py-1 bg-gray-300 rounded text-sm">
                                キャンセル
                              </button>
                            </div>
                          </div>
                        ) : (
                          <>
                            <p className="font-medium text-gray-800">{title}</p>
                            {topic && <p className="text-sm text-gray-600 mt-1">{topic}</p>}
                            <button
                              type="button"
                              onClick={() => {
                              const defModel = PERIOD_EXAMPLES[kadaiPeriodTab]?.[itemIdx]?.modelContent;
                              setEditingKadai({ period: kadaiPeriodTab, item: itemIdx });
                              setKadaiEditForm({
                                title,
                                topic: "",
                                theme: ov?.theme ?? defModel?.theme ?? "",
                                question: ov?.question ?? defModel?.question ?? "",
                                grammarNote: ov?.grammarNote ?? defModel?.grammarNote ?? "",
                                patterns: (ov?.patterns && ov.patterns.length > 0) ? ov.patterns : (defModel?.patterns ?? []),
                              });
                            }}
                              className="mt-2 text-sm text-red-600 hover:underline"
                            >
                              編集
                            </button>
                          </>
                        )}
                      </div>
                    );
                  })}
                </div>
              </>
            )}
          </div>
        )}

      </div>
    </div>
  );
}
