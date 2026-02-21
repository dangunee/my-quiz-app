"use client";

import { useState, useEffect } from "react";
import Link from "next/link";
import { QUIZZES } from "../quiz-data";
import { DEFAULT_ASSIGNMENT_EXAMPLES, PERIOD_LABELS } from "../data/assignment-examples-defaults";
import { PERIOD_EXAMPLES } from "../data/assignment-examples-period";

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
  const [activeTab, setActiveTab] = useState<"quiz" | "users" | "analytics" | "assignments" | "submissions" | "kadai">("quiz");
  const [assignments, setAssignments] = useState<Assignment[]>([]);
  const [submissions, setSubmissions] = useState<Submission[]>([]);
  const [writingLoading, setWritingLoading] = useState(false);
  const [editingId, setEditingId] = useState<string | null>(null);
  const [editForm, setEditForm] = useState({ title_ko: "", title_ja: "", description: "", sort_order: 0 });
  const [newForm, setNewForm] = useState({ title_ko: "", title_ja: "", description: "", sort_order: 0 });
  const [feedbackId, setFeedbackId] = useState<string | null>(null);
  const [feedbackText, setFeedbackText] = useState("");
  const [writingSaving, setWritingSaving] = useState(false);
  const [seedLoading, setSeedLoading] = useState(false);
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

  const formatDuration = (sec: number) =>
    sec > 0 ? `${Math.floor(sec / 60)}分${sec % 60}秒` : "0分0秒";
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

  const loadAssignments = () => {
    setWritingLoading(true);
    fetch("/api/writing/admin/assignments", { headers: { Authorization: `Bearer ${authKey}` } })
      .then((r) => r.json())
      .then((data) => setAssignments(data.assignments || []))
      .catch(() => setAssignments([]))
      .finally(() => setWritingLoading(false));
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
    if (activeTab === "assignments") loadAssignments();
    else if (activeTab === "submissions") loadSubmissions();
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
      start_date: u.start_date ?? "",
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

  const handleSeedAssignments = async () => {
    setSeedLoading(true);
    try {
      for (const a of DEFAULT_ASSIGNMENTS) {
        await fetch("/api/writing/admin/assignments", {
          method: "POST",
          headers: { "Content-Type": "application/json", Authorization: `Bearer ${authKey}` },
          body: JSON.stringify(a),
        });
      }
      loadAssignments();
    } catch {
      alert("시드 추가 실패");
    } finally {
      setSeedLoading(false);
    }
  };

  const handleAddAssignment = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!newForm.title_ko.trim()) return;
    setWritingSaving(true);
    try {
      const res = await fetch("/api/writing/admin/assignments", {
        method: "POST",
        headers: { "Content-Type": "application/json", Authorization: `Bearer ${authKey}` },
        body: JSON.stringify(newForm),
      });
      const data = await res.json();
      if (res.ok && data?.assignment) {
        setAssignments((prev) => [...prev, data.assignment]);
        setNewForm({ title_ko: "", title_ja: "", description: "", sort_order: 0 });
      } else {
        alert(data.error || "추가 실패");
      }
    } catch {
      alert("오류 발생");
    } finally {
      setWritingSaving(false);
    }
  };

  const handleUpdateAssignment = async () => {
    if (!editingId) return;
    setWritingSaving(true);
    try {
      const res = await fetch(`/api/writing/admin/assignments/${editingId}`, {
        method: "PUT",
        headers: { "Content-Type": "application/json", Authorization: `Bearer ${authKey}` },
        body: JSON.stringify(editForm),
      });
      const data = await res.json();
      if (res.ok) {
        setAssignments((prev) => prev.map((a) => (a.id === editingId ? data.assignment : a)));
        setEditingId(null);
      } else {
        alert(data.error || "수정 실패");
      }
    } catch {
      alert("오류 발생");
    } finally {
      setWritingSaving(false);
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
    setWritingSaving(true);
    try {
      const res = await fetch(`/api/writing/admin/submissions/${feedbackId}`, {
        method: "PUT",
        headers: { "Content-Type": "application/json", Authorization: `Bearer ${authKey}` },
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
      <div className="w-full md:max-w-[80vw] mx-auto">
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
            onClick={() => setActiveTab("assignments")}
            className={`px-4 py-2 rounded font-medium ${activeTab === "assignments" ? "bg-red-600 text-white" : "bg-white"}`}
          >
            作文課題
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
            課題例
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
                                <option value="未定">未定</option>
                                <option value="完了">完了</option>
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
                      平均滞在 {formatDuration(analytics.quizStats.avgDuration)}
                    </p>
                  </div>
                  <div className="p-4 bg-green-50 rounded-lg">
                    <h3 className="font-semibold text-green-800 mb-1">Q&A</h3>
                    <p className="text-2xl font-bold text-green-600">{analytics.kotaeStats.sessions}</p>
                    <p className="text-sm text-gray-600">アクセス数</p>
                    <p className="text-sm text-gray-600 mt-1">
                      平均滞在 {formatDuration(analytics.kotaeStats.avgDuration)}
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
                            <td className="py-2 px-3 text-right">{formatDuration(s.avgDuration ?? 0)}</td>
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
                            <td className="py-2 px-3 text-right">{formatDuration(s.avgDuration ?? 0)}</td>
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
                            <td className="py-2 px-3 text-right">{formatDuration(s.avgDuration ?? 0)}</td>
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
                            <td className="py-2 px-3 text-right">{formatDuration(c.avgDuration ?? 0)}</td>
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
                            <td className="py-2 px-3 text-right">{formatDuration(r.avgDuration ?? 0)}</td>
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
                            <td className="py-2 px-3 text-right">{formatDuration(r.avgDuration ?? 0)}</td>
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

        {activeTab === "assignments" && (
          <div className="bg-white p-6 rounded-lg shadow">
            <h1 className="text-2xl font-bold mb-4">作文課題管理</h1>
            <div className="flex justify-between items-center mb-4">
              <Link href="/writing" className="text-sm text-gray-600 hover:underline">作文ページ</Link>
              <button
                type="button"
                onClick={handleSeedAssignments}
                disabled={seedLoading || assignments.length > 0}
                className="px-4 py-2 bg-amber-500 text-white rounded hover:bg-amber-600 disabled:opacity-50 disabled:cursor-not-allowed text-sm"
              >
                {seedLoading ? "追加中..." : "基本課題10件追加"}
              </button>
            </div>
            <form onSubmit={handleAddAssignment} className="mb-6 p-4 bg-gray-50 rounded-lg space-y-3">
              <h3 className="font-medium">新規課題追加</h3>
              <input
                type="text"
                value={newForm.title_ko}
                onChange={(e) => setNewForm((f) => ({ ...f, title_ko: e.target.value }))}
                placeholder="タイトル（韓国語）"
                className="w-full border rounded px-3 py-2"
                required
              />
              <input
                type="text"
                value={newForm.title_ja}
                onChange={(e) => setNewForm((f) => ({ ...f, title_ja: e.target.value }))}
                placeholder="タイトル（日本語）"
                className="w-full border rounded px-3 py-2"
              />
              <textarea
                value={newForm.description}
                onChange={(e) => setNewForm((f) => ({ ...f, description: e.target.value }))}
                placeholder="説明"
                rows={2}
                className="w-full border rounded px-3 py-2"
              />
              <button type="submit" disabled={writingSaving} className="px-4 py-2 bg-red-600 text-white rounded hover:bg-red-700 disabled:opacity-50">
                追加
              </button>
            </form>
            {writingLoading ? (
              <p>読み込み中...</p>
            ) : assignments.length === 0 ? (
              <p className="text-gray-500">登録された課題がありません。上で追加するか、基本課題を読み込んでください。</p>
            ) : (
              <ul className="space-y-3">
                {assignments.map((a) => (
                  <li key={a.id} className="p-4 border rounded-lg">
                    {editingId === a.id ? (
                      <div className="space-y-2">
                        <input
                          value={editForm.title_ko}
                          onChange={(e) => setEditForm((f) => ({ ...f, title_ko: e.target.value }))}
                          className="w-full border rounded px-3 py-2"
                          placeholder="タイトル（韓国語）"
                        />
                        <input
                          value={editForm.title_ja}
                          onChange={(e) => setEditForm((f) => ({ ...f, title_ja: e.target.value }))}
                          className="w-full border rounded px-3 py-2"
                          placeholder="タイトル（日本語）"
                        />
                        <textarea
                          value={editForm.description}
                          onChange={(e) => setEditForm((f) => ({ ...f, description: e.target.value }))}
                          rows={2}
                          className="w-full border rounded px-3 py-2"
                        />
                        <div className="flex gap-2">
                          <button type="button" onClick={handleUpdateAssignment} disabled={writingSaving} className="px-3 py-1 bg-red-600 text-white rounded text-sm">
                            保存
                          </button>
                          <button type="button" onClick={() => setEditingId(null)} className="px-3 py-1 bg-gray-300 rounded text-sm">
                            キャンセル
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
                            onClick={() => { setEditingId(a.id); setEditForm({ title_ko: a.title_ko, title_ja: a.title_ja || "", description: a.description || "", sort_order: a.sort_order }); }}
                            className="text-sm text-red-600 hover:underline"
                          >
                            編集
                          </button>
                          <button type="button" onClick={() => handleDeleteAssignment(a.id)} className="text-sm text-red-600 hover:underline">
                            削除
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

        {activeTab === "kadai" && (
          <div className="bg-white p-6 rounded-lg shadow">
            <h1 className="text-2xl font-bold mb-4">課題例（1期～8期）編集</h1>
            <p className="text-sm text-gray-600 mb-4">作文ページの課題例掲示板の「제목」と「실제 과제」を編集できます。</p>
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
                    const topic = ov?.topic ?? def.topic;
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
                              <label className="block text-xs font-medium text-gray-500 mb-1">실제 과제（実際の課題）</label>
                              <textarea
                                value={kadaiEditForm.topic}
                                onChange={(e) => setKadaiEditForm((f) => ({ ...f, topic: e.target.value }))}
                                className="w-full border rounded px-3 py-2 text-sm"
                                rows={2}
                                placeholder="실제 과제"
                              />
                            </div>
                            <div>
                              <label className="block text-xs font-medium text-gray-500 mb-1">テーマ</label>
                              <input
                                value={kadaiEditForm.theme}
                                onChange={(e) => setKadaiEditForm((f) => ({ ...f, theme: e.target.value }))}
                                className="w-full border rounded px-3 py-2 text-sm"
                                placeholder="テーマ"
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
                                topic,
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
                {submissions.map((s) => (
                  <li key={s.id} className="p-4 border rounded-lg">
                    <p className="text-sm text-gray-500">
                      {s.writing_assignments?.title_ko || "課題"} · {s.user?.email || "-"} · {s.user?.name || s.user?.username || ""}
                    </p>
                    <p className="mt-2 whitespace-pre-wrap">{s.content}</p>
                    {feedbackId === s.id ? (
                      <div className="mt-4">
                        <textarea
                          value={feedbackText}
                          onChange={(e) => setFeedbackText(e.target.value)}
                          placeholder="添削内容を入力..."
                          rows={4}
                          className="w-full border rounded px-3 py-2"
                        />
                        <div className="mt-2 flex gap-2">
                          <button type="button" onClick={handleSaveFeedback} disabled={writingSaving} className="px-3 py-1 bg-red-600 text-white rounded text-sm">
                            保存
                          </button>
                          <button type="button" onClick={() => { setFeedbackId(null); setFeedbackText(""); }} className="px-3 py-1 bg-gray-300 rounded text-sm">
                            キャンセル
                          </button>
                        </div>
                      </div>
                    ) : (
                      <div className="mt-3">
                        {s.feedback && (
                          <div className="p-3 bg-amber-50 rounded border border-amber-200 mb-2">
                            <p className="text-sm font-medium text-amber-800">添削:</p>
                            <p className="text-sm text-amber-900 whitespace-pre-wrap mt-1">{s.feedback}</p>
                          </div>
                        )}
                        <button
                          type="button"
                          onClick={() => { setFeedbackId(s.id); setFeedbackText(s.feedback || ""); }}
                          className="text-sm text-red-600 hover:underline"
                        >
                          {s.feedback ? "添削を編集" : "添削を記入"}
                        </button>
                      </div>
                    )}
                    <p className="mt-2 text-xs text-gray-400">{new Date(s.submitted_at).toLocaleString("ja-JP")}</p>
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
