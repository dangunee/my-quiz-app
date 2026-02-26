"use client";

import { useState, useEffect } from "react";
import Link from "next/link";
import { QUIZZES } from "../quiz-data";
import { DEFAULT_ASSIGNMENT_EXAMPLES, PERIOD_LABELS } from "../data/assignment-examples-defaults";
import { PERIOD_EXAMPLES } from "../data/assignment-examples-period";
import { ONDOKU_PERIOD_EXAMPLES } from "../data/ondoku-assignment-examples";

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

type OndokuSubmission = {
  id: string;
  user_id: string;
  period_index: number;
  item_index: number;
  content: string;
  audio_url?: string;
  submitted_at: string;
  feedback?: string;
  corrected_content?: string;
  status?: string;
  feedback_at?: string;
  completed_at?: string;
  user?: { email?: string; name?: string; username?: string };
};

type OndokuFeedbackSegment = { kadai: string; correct: string; learner: string; [key: string]: string };
type CellStyle = { fontSize?: number; bgColor?: string; textAlign?: "left" | "center" | "right" };
type OndokuFeedbackForm = {
  bunkei: string;
  wayaku: string;
  point: string;
  segments: OndokuFeedbackSegment[];
  extraColumns: { key: string; label: string }[];
  cellStyles?: Record<string, CellStyle>;
  kaisetsu: string;
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
  const [activeTab, setActiveTab] = useState<"quiz" | "users" | "analytics" | "submissions" | "kadai" | "ondoku" | "writingVisibility">("quiz");
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
    registration_source: "",
  });
  const [userActionLoading, setUserActionLoading] = useState(false);
  const [userSearchKeyword, setUserSearchKeyword] = useState("");
  const [analytics, setAnalytics] = useState<{
    referrers: { domain: string; referrer?: string | null; count: number; avgDuration?: number; latestAt?: string | null }[];
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
  const [writingVisPeriodTab, setWritingVisPeriodTab] = useState(0);
  const [writingVisStudents, setWritingVisStudents] = useState<{ id: string; email: string; name: string }[]>([]);
  const [writingVisData, setWritingVisData] = useState<Record<string, Record<number, string | null>>>({});
  const [writingVisLoading, setWritingVisLoading] = useState(false);
  const [writingVisSaving, setWritingVisSaving] = useState<string | null>(null);
  const [writingVisScheduleStudent, setWritingVisScheduleStudent] = useState<{ id: string; name: string; email: string } | null>(null);
  const [writingVisScheduleData, setWritingVisScheduleData] = useState<Record<number, Record<number, { visible: boolean; date: string | null }>> | null>(null);
  const [editingKadai, setEditingKadai] = useState<{ period: number; item: number } | null>(null);
  const [kadaiEditForm, setKadaiEditForm] = useState({ title: "", topic: "", theme: "", question: "", grammarNote: "", patterns: [] as { pattern: string; example: string }[] });
  const [kadaiSaving, setKadaiSaving] = useState(false);
  const [analyticsDays, setAnalyticsDays] = useState(30);
  const [ondokuSubmissions, setOndokuSubmissions] = useState<OndokuSubmission[]>([]);
  const [ondokuLoading, setOndokuLoading] = useState(false);
  const [ondokuPeriodTab, setOndokuPeriodTab] = useState(0);
  const [expandedOndokuId, setExpandedOndokuId] = useState<string | null>(null);
  const [ondokuFeedbackForm, setOndokuFeedbackForm] = useState<OndokuFeedbackForm | null>(null);
  const [ondokuFeedbackSaving, setOndokuFeedbackSaving] = useState(false);
  const [ondokuSelectedCell, setOndokuSelectedCell] = useState<{ row: number; col: string } | null>(null);
  const [ondokuPdfMailBody, setOndokuPdfMailBody] = useState("");
  const [ondokuPdfSending, setOndokuPdfSending] = useState(false);
  const [ondokuPdfConfirmFor, setOndokuPdfConfirmFor] = useState<string | null>(null);
  const [ondokuPdfScheduledAt, setOndokuPdfScheduledAt] = useState<string>("");
  const ONDOKU_PERIOD_LABELS = ["1期", "2期", "3期", "4期"];

  const DEFAULT_SEGMENT_ROWS = 40;
  const DEFAULT_SEGMENT_COLS = 10; // 課題, 正しい発音, 学習者の発音(3) + 追加列7
  const defaultExtraColumns = () => Array.from({ length: DEFAULT_SEGMENT_COLS - 3 }, (_, i) => ({ key: `ext_${i + 1}`, label: `列${i + 1}` }));
  const emptySegment = (extraCols: { key: string; label: string }[]) => ({ kadai: "", correct: "", learner: "", ...Object.fromEntries(extraCols.map((c) => [c.key, ""])) });

  function initOndokuFeedbackForm(sub: OndokuSubmission, ex: { modelContent?: { theme?: string; sentence?: string; pronunciationNote?: string; patterns?: { pattern: string; example: string }[] }; topic?: string } | undefined): OndokuFeedbackForm {
    const sentence = ex?.modelContent?.sentence || "";
    const defaultCols = defaultExtraColumns();
    const segments = (() => {
      try {
        const parsed = JSON.parse(sub.feedback || "{}");
        if (parsed.segments && Array.isArray(parsed.segments) && parsed.segments.length > 0) return parsed.segments;
      } catch {}
      const fromSentence = sentence.split(/\s+/).filter(Boolean).map((k) => ({ kadai: k, correct: k, learner: "", ...Object.fromEntries(defaultCols.map((c) => [c.key, ""])) }));
      const base = fromSentence.length > 0 ? fromSentence : [];
      while (base.length < DEFAULT_SEGMENT_ROWS) base.push(emptySegment(defaultCols));
      return base;
    })();
    try {
      const parsed = JSON.parse(sub.feedback || "{}");
      const extraCols = Array.isArray(parsed.extraColumns) && parsed.extraColumns.length > 0 ? parsed.extraColumns : defaultCols;
      if (parsed.bunkei != null || parsed.wayaku != null || parsed.point != null || parsed.kaisetsu != null) {
        const segs = (parsed.segments ?? segments) as OndokuFeedbackSegment[];
        extraCols.forEach((c: { key?: string; label?: string }) => {
          const k = c?.key;
          if (k && k !== "kadai" && k !== "correct" && k !== "learner") {
            segs.forEach((s) => { if (!(k in s)) (s as Record<string, string>)[k] = ""; });
          }
        });
        return {
          bunkei: parsed.bunkei ?? ex?.modelContent?.theme ?? "",
          wayaku: parsed.wayaku ?? ex?.topic ?? "",
          point: parsed.point ?? ex?.modelContent?.pronunciationNote ?? "",
          segments: segs,
          extraColumns: extraCols,
          cellStyles: parsed.cellStyles && typeof parsed.cellStyles === "object" ? parsed.cellStyles : {},
          kaisetsu: parsed.kaisetsu ?? "",
        };
      }
    } catch {}
    return {
      bunkei: ex?.modelContent?.theme ?? "",
      wayaku: ex?.topic ?? "",
      point: ex?.modelContent?.pronunciationNote ?? "",
      segments,
      extraColumns: defaultCols,
      cellStyles: {},
      kaisetsu: sub.feedback && !sub.feedback.startsWith("{") ? sub.feedback : "",
    };
  }
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
    if (typeof document !== "undefined" && document.location.hostname.includes("mirinae.jp")) {
      document.cookie = "admin_auth=; Path=/; Domain=.mirinae.jp; Max-Age=0";
    }
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

  const loadOndokuSubmissions = () => {
    setOndokuLoading(true);
    fetch("/api/admin/ondoku/submissions", { headers: { Authorization: `Bearer ${authKey}` } })
      .then((r) => r.json())
      .then((data) => setOndokuSubmissions(data.submissions || []))
      .catch(() => setOndokuSubmissions([]))
      .finally(() => setOndokuLoading(false));
  };

  useEffect(() => {
    if (!isAuthenticated || !authKey) return;
    if (activeTab === "submissions") loadSubmissions();
    else if (activeTab === "ondoku") loadOndokuSubmissions();
    else if (activeTab === "kadai") {
      setKadaiLoading(true);
      fetch("/api/admin/writing/assignment-examples", { headers: { Authorization: `Bearer ${authKey}` } })
        .then((r) => r.json())
        .then((assignData) => {
          setKadaiOverrides(assignData.overrides || {});
        })
        .catch(() => {})
        .finally(() => setKadaiLoading(false));
    }
  }, [isAuthenticated, authKey, activeTab]);

  useEffect(() => {
    if (!isAuthenticated || !authKey || activeTab !== "writingVisibility") return;
    setWritingVisLoading(true);
    fetch(`/api/admin/writing/visibility/students?period_index=${writingVisPeriodTab}`, {
      headers: { Authorization: `Bearer ${authKey}` },
    })
      .then((r) => r.json())
      .then((data) => {
        setWritingVisStudents(data.students || []);
        setWritingVisData(data.visibility || {});
      })
      .catch(() => {
        setWritingVisStudents([]);
        setWritingVisData({});
      })
      .finally(() => setWritingVisLoading(false));
  }, [writingVisPeriodTab, activeTab, isAuthenticated, authKey]);


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
      registration_source: u.registration_source ?? "",
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
            onClick={() => {
              setActiveTab("users");
              loadUsers();
            }}
            className={`px-4 py-2 rounded font-medium ${activeTab === "users" ? "bg-red-600 text-white" : "bg-white"}`}
          >
            会員一覧
          </button>
          <button
            onClick={() => setActiveTab("quiz")}
            className={`px-4 py-2 rounded font-medium ${activeTab === "quiz" ? "bg-red-600 text-white" : "bg-white"}`}
          >
            クイズ編集
          </button>
          <button
            onClick={() => setActiveTab("kadai")}
            className={`px-4 py-2 rounded font-medium ${activeTab === "kadai" ? "bg-red-600 text-white" : "bg-white"}`}
          >
            作文課題
          </button>
          <button
            onClick={() => setActiveTab("writingVisibility")}
            className={`px-4 py-2 rounded font-medium ${activeTab === "writingVisibility" ? "bg-red-600 text-white" : "bg-white"}`}
          >
            作文公開日
          </button>
          <button
            onClick={() => setActiveTab("submissions")}
            className={`px-4 py-2 rounded font-medium ${activeTab === "submissions" ? "bg-red-600 text-white" : "bg-white"}`}
          >
            作文提出
          </button>
          <button
            onClick={() => {
              setActiveTab("ondoku");
              loadOndokuSubmissions();
            }}
            className={`px-4 py-2 rounded font-medium ${activeTab === "ondoku" ? "bg-red-600 text-white" : "bg-white"}`}
          >
            音読提出
          </button>
          </div>
          <div className="flex items-center gap-3">
            <Link
              href="/"
              className="text-sm text-gray-600 hover:text-gray-800"
            >
              フロントページへ
            </Link>
            <button
              onClick={handleLogout}
              className="text-sm text-gray-500 hover:text-gray-700"
            >
              ログアウト
            </button>
          </div>
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
          <div className="flex-[7] min-w-0 space-y-4">
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

          <aside className="flex-[3] shrink-0 min-w-0">
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
                            <td className="py-2 px-3">
                              <select
                                value={editUserForm.registration_source}
                                onChange={(e) => setEditUserForm((f) => ({ ...f, registration_source: e.target.value }))}
                                className="w-full border rounded px-2 py-1 text-sm"
                              >
                                <option value="">-</option>
                                <option value="QUIZ">QUIZ</option>
                                <option value="WRITING">WRITING</option>
                              </select>
                            </td>
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
            <div className="mb-6 p-4 bg-gray-50 rounded-lg border border-gray-200">
              <h3 className="font-semibold text-gray-800 mb-3">流入元の把握方法</h3>
              <table className="w-full text-sm">
                <thead>
                  <tr className="border-b border-gray-300">
                    <th className="text-left py-2 px-3 w-40">方法</th>
                    <th className="text-left py-2 px-3">説明</th>
                  </tr>
                </thead>
                <tbody>
                  <tr className="border-b border-gray-200">
                    <td className="py-2 px-3 font-medium">Referrer（リファラー）</td>
                    <td className="py-2 px-3 text-gray-600">他サイトのリンクから遷移した場合、ブラウザが送る Referer ヘッダーで参照元を確認できます。</td>
                  </tr>
                  <tr className="border-b border-gray-200">
                    <td className="py-2 px-3 font-medium">UTMパラメータ</td>
                    <td className="py-2 px-3 text-gray-600">リンクに ?utm_source=google などを付けると、その値で参照元を追跡できます。</td>
                  </tr>
                  <tr className="border-b border-gray-200">
                    <td className="py-2 px-3 font-medium">分析ツール</td>
                    <td className="py-2 px-3 text-gray-600">Google Analytics、Vercel Analytics などで流入経路・チャネルを表示します。</td>
                  </tr>
                </tbody>
              </table>
            </div>
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
                          <th className="text-left py-2 px-3">リファラー</th>
                          <th className="text-right py-2 px-3">アクセス数</th>
                          <th className="text-right py-2 px-3">平均滞在</th>
                          <th className="text-left py-2 px-3">最新アクセス</th>
                        </tr>
                      </thead>
                      <tbody>
                        {analytics.referrers.map((r) => (
                          <tr key={r.domain} className="border-b">
                            <td className="py-2 px-3">{r.domain}</td>
                            <td className="py-2 px-3 text-gray-600 max-w-xs truncate" title={r.referrer || undefined}>
                              {r.referrer ? (
                                <a href={r.referrer} target="_blank" rel="noopener noreferrer" className="text-blue-600 hover:underline truncate block">
                                  {r.referrer}
                                </a>
                              ) : (
                                "-"
                              )}
                            </td>
                            <td className="py-2 px-3 text-right">{r.count}</td>
                            <td className="py-2 px-3 text-right">{formatDuration(r.avgDuration ?? null)}</td>
                            <td className="py-2 px-3 text-gray-600">{r.latestAt ? new Date(r.latestAt).toLocaleString("ja-JP") : "データなし"}</td>
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
                            <div className="mt-2 flex gap-3">
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
                                className="text-sm text-red-600 hover:underline"
                              >
                                編集
                              </button>
                              {ov && (
                                <button
                                  type="button"
                                  onClick={async () => {
                                    if (!confirm("この課題の上書きを削除し、コードの既定値に戻します。よろしいですか？")) return;
                                    setKadaiSaving(true);
                                    try {
                                      const res = await fetch(`/api/admin/writing/assignment-examples?period_index=${kadaiPeriodTab}&item_index=${itemIdx}`, {
                                        method: "DELETE",
                                        headers: { Authorization: `Bearer ${authKey}` },
                                      });
                                      if (res.ok) {
                                        setKadaiOverrides((prev) => {
                                          const next = { ...prev };
                                          if (next[kadaiPeriodTab]) {
                                            const period = { ...next[kadaiPeriodTab] };
                                            delete period[itemIdx];
                                            if (Object.keys(period).length) {
                                              next[kadaiPeriodTab] = period;
                                            } else {
                                              delete next[kadaiPeriodTab];
                                            }
                                          }
                                          return next;
                                        });
                                      } else {
                                        const data = await res.json();
                                        alert(data.error || "削除に失敗しました");
                                      }
                                    } catch {
                                      alert("エラーが発生しました");
                                    } finally {
                                      setKadaiSaving(false);
                                    }
                                  }}
                                  disabled={kadaiSaving}
                                  className="text-sm text-gray-600 hover:underline"
                                >
                                  既定に戻す
                                </button>
                              )}
                            </div>
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

        {activeTab === "ondoku" && (
          <div className="bg-white p-6 rounded-lg shadow">
            <h1 className="text-2xl font-bold mb-4">音読提出一覧</h1>
            <p className="text-sm text-gray-600 mb-4">全生徒の音読録音ファイルを確認・再生できます。1期～4期、1회～10회別に表示。</p>
            <Link href="/ondoku" className="text-sm text-gray-600 hover:underline mb-4 block">音読ページ</Link>
            {ondokuLoading ? (
              <p>読み込み中...</p>
            ) : (
              <>
                <div className="flex gap-2 mb-4 flex-wrap">
                  {ONDOKU_PERIOD_LABELS.map((label, i) => (
                    <button
                      key={i}
                      onClick={() => setOndokuPeriodTab(i)}
                      className={`px-3 py-1.5 rounded text-sm font-medium ${ondokuPeriodTab === i ? "bg-red-600 text-white" : "bg-gray-200 text-gray-700"}`}
                    >
                      {label}
                    </button>
                  ))}
                </div>
                <div className="space-y-4">
                  {[0, 1, 2, 3, 4, 5, 6, 7, 8, 9].map((itemIdx) => {
                    const periodSubmissions = ondokuSubmissions.filter(
                      (s) => s.period_index === ondokuPeriodTab && s.item_index === itemIdx
                    );
                    const ex = ONDOKU_PERIOD_EXAMPLES[ondokuPeriodTab]?.[itemIdx];
                    const title = ex?.title || `${itemIdx + 1}회`;
                    if (periodSubmissions.length === 0) return null;
                    return (
                      <div key={itemIdx} className="p-4 border rounded-lg">
                        <h3 className="font-medium text-gray-800 mb-3">
                          {ONDOKU_PERIOD_LABELS[ondokuPeriodTab]} {title}
                          {ex?.topic && <span className="text-sm font-normal text-gray-600 ml-2">({ex.topic})</span>}
                        </h3>
                        <ul className="space-y-3">
                          {periodSubmissions.map((s) => (
                            <li key={s.id} className="border border-gray-200 rounded-lg overflow-hidden">
                              <button
                                type="button"
                                onClick={() => {
                                  if (expandedOndokuId === s.id) {
                                    setExpandedOndokuId(null);
                                    setOndokuFeedbackForm(null);
                                    setOndokuSelectedCell(null);
                                    setOndokuPdfMailBody("");
                                    setOndokuPdfConfirmFor(null);
                                    setOndokuPdfScheduledAt("");
                                  } else {
                                    setExpandedOndokuId(s.id);
                                    setOndokuFeedbackForm(initOndokuFeedbackForm(s, ex));
                                    setOndokuSelectedCell(null);
                                    setOndokuPdfMailBody("");
                                    setOndokuPdfConfirmFor(null);
                                    setOndokuPdfScheduledAt("");
                                  }
                                }}
                                className="w-full flex flex-col sm:flex-row sm:items-center gap-2 p-3 bg-gray-50 hover:bg-gray-100 text-left text-sm"
                              >
                                <div className="flex-1 min-w-0">
                                  <p className="font-medium text-gray-800">{(s.user?.name || s.user?.username || s.user?.email) || "-"}</p>
                                  <p className="text-xs text-gray-500">{new Date(s.submitted_at).toLocaleString("ja-JP")}</p>
                                  {s.content && <p className="mt-1 text-gray-700 whitespace-pre-wrap">{s.content}</p>}
                                </div>
                                {s.audio_url ? (
                                  <div className="flex items-center gap-2 shrink-0" onClick={(e) => e.stopPropagation()}>
                                    <audio controls src={s.audio_url} className="max-w-[200px] h-8" />
                                    <a href={s.audio_url} download className="text-red-600 hover:underline text-xs">ダウンロード</a>
                                  </div>
                                ) : (
                                  <span className="text-gray-500 text-xs">音声なし</span>
                                )}
                                <span className="text-gray-400 text-xs">{expandedOndokuId === s.id ? "▲ 閉じる" : "▼ 添削"}</span>
                              </button>
                              {expandedOndokuId === s.id && ondokuFeedbackForm && (
                                <div className="p-4 bg-white border-t border-gray-200">
                                  <h4 className="font-medium text-gray-800 mb-3">添削エディタ（スプレッドシート形式）</h4>
                                  {ondokuSelectedCell && (
                                    <div className="flex flex-wrap items-center gap-2 mb-3 p-2 bg-gray-100 rounded border border-gray-200">
                                      <span className="text-xs text-gray-600">文字サイズ:</span>
                                      {[8, 10, 12, 14, 16, 18].map((sz) => (
                                        <button key={sz} type="button" onClick={() => setOndokuFeedbackForm((f) => {
                                          if (!f) return f;
                                          const key = `${ondokuSelectedCell.row}_${ondokuSelectedCell.col}`;
                                          const styles = { ...(f.cellStyles || {}), [key]: { ...(f.cellStyles?.[key] || {}), fontSize: sz } };
                                          return { ...f, cellStyles: styles };
                                        })} className="px-2 py-0.5 text-xs rounded border border-gray-300 hover:bg-white">{sz}</button>
                                      ))}
                                      <span className="text-xs text-gray-600 ml-2">背景色:</span>
                                      {["#ffffff", "#fef08a", "#bbf7d0", "#bfdbfe", "#fecaca"].map((c) => (
                                        <button key={c} type="button" onClick={() => setOndokuFeedbackForm((f) => {
                                          if (!f) return f;
                                          const key = `${ondokuSelectedCell.row}_${ondokuSelectedCell.col}`;
                                          const styles = { ...(f.cellStyles || {}), [key]: { ...(f.cellStyles?.[key] || {}), bgColor: c } };
                                          return { ...f, cellStyles: styles };
                                        })} className="w-6 h-6 rounded border border-gray-300" style={{ backgroundColor: c }} title={c} />
                                      ))}
                                      <input type="color" value={ondokuFeedbackForm.cellStyles?.[`${ondokuSelectedCell.row}_${ondokuSelectedCell.col}`]?.bgColor || "#ffffff"} onChange={(e) => setOndokuFeedbackForm((f) => {
                                        if (!f) return f;
                                        const key = `${ondokuSelectedCell.row}_${ondokuSelectedCell.col}`;
                                        const styles = { ...(f.cellStyles || {}), [key]: { ...(f.cellStyles?.[key] || {}), bgColor: e.target.value } };
                                        return { ...f, cellStyles: styles };
                                      })} className="w-8 h-6 cursor-pointer" />
                                      <span className="text-xs text-gray-600 ml-2">配置:</span>
                                      {(["left", "center", "right"] as const).map((align) => (
                                        <button key={align} type="button" onClick={() => setOndokuFeedbackForm((f) => {
                                          if (!f) return f;
                                          const key = `${ondokuSelectedCell.row}_${ondokuSelectedCell.col}`;
                                          const styles = { ...(f.cellStyles || {}), [key]: { ...(f.cellStyles?.[key] || {}), textAlign: align } };
                                          return { ...f, cellStyles: styles };
                                        })} className="px-2 py-0.5 text-xs rounded border border-gray-300 hover:bg-white">{align === "left" ? "左" : align === "center" ? "中央" : "右"}</button>
                                      ))}
                                    </div>
                                  )}
                                  <div className="overflow-auto max-h-[60vh] max-w-full border border-gray-200 rounded">
                                    <table className="border-collapse text-sm" style={{ minWidth: `${Math.max(600, (5 + (ondokuFeedbackForm?.extraColumns?.length ?? 0)) * 90)}px` }}>
                                      <tbody>
                                        <tr>
                                          <td className="py-1 px-2 bg-gray-100 font-medium w-20 align-top">文型</td>
                                          <td className="py-1 px-2 border border-gray-200" colSpan={5}>
                                            <input value={ondokuFeedbackForm.bunkei} onChange={(e) => setOndokuFeedbackForm((f) => f && { ...f, bunkei: e.target.value })} className="w-full px-2 py-1 border-0 focus:ring-1 focus:ring-red-500" placeholder="文型" />
                                          </td>
                                        </tr>
                                        <tr>
                                          <td className="py-1 px-2 bg-gray-100 font-medium align-top">課題</td>
                                          <td className="py-1 px-2 border border-gray-200 text-gray-800" colSpan={5}>{ex?.modelContent?.sentence || "-"}</td>
                                        </tr>
                                        <tr>
                                          <td className="py-1 px-2 bg-gray-100 font-medium align-top">和訳</td>
                                          <td className="py-1 px-2 border border-gray-200" colSpan={5}>
                                            <input value={ondokuFeedbackForm.wayaku} onChange={(e) => setOndokuFeedbackForm((f) => f && { ...f, wayaku: e.target.value })} className="w-full px-2 py-1 border-0 focus:ring-1 focus:ring-red-500" placeholder="和訳" />
                                          </td>
                                        </tr>
                                        <tr>
                                          <td className="py-1 px-2 bg-gray-100 font-medium align-top">ポイント</td>
                                          <td className="py-1 px-2 border border-gray-200" colSpan={5}>
                                            <input value={ondokuFeedbackForm.point} onChange={(e) => setOndokuFeedbackForm((f) => f && { ...f, point: e.target.value })} className="w-full px-2 py-1 border-0 focus:ring-1 focus:ring-red-500" placeholder="発音ポイント" />
                                          </td>
                                        </tr>
                                        <tr className="bg-gray-50">
                                          <td className="py-1 px-2 font-medium">no.</td>
                                          <td className="py-1 px-2 font-medium">課題</td>
                                          <td className="py-1 px-2 font-medium">正しい発音</td>
                                          <td className="py-1 px-2 font-medium">学習者の発音</td>
                                          {ondokuFeedbackForm.extraColumns.map((col) => (
                                            <td key={col.key} className="py-1 px-2 font-medium border-l border-gray-200">
                                              <span className="mr-1">{col.label}</span>
                                              <button type="button" onClick={() => setOndokuFeedbackForm((f) => {
                                                if (!f) return f;
                                                const newCols = f.extraColumns.filter((c) => c.key !== col.key);
                                                const segs = f.segments.map((s) => {
                                                  const { [col.key]: _, ...rest } = s;
                                                  return rest as OndokuFeedbackSegment;
                                                });
                                                return { ...f, extraColumns: newCols, segments: segs };
                                              })} className="text-red-500 text-xs hover:underline">×</button>
                                            </td>
                                          ))}
                                          <td className="py-1 px-2 w-12" />
                                        </tr>
                                        {ondokuFeedbackForm.segments.map((seg, i) => {
                                          const getCellStyle = (colKey: string) => ondokuFeedbackForm.cellStyles?.[`${i}_${colKey}`] || {};
                                          const isSelected = (colKey: string) => ondokuSelectedCell?.row === i && ondokuSelectedCell?.col === colKey;
                                          const cellCls = (colKey: string) => "py-1 px-2 border border-gray-200" + (isSelected(colKey) ? " ring-2 ring-red-500 ring-inset" : "");
                                          const inputCls = "w-full px-2 py-1 border-0 focus:ring-1 focus:ring-red-500 min-w-[60px]";
                                          return (
                                          <tr key={i}>
                                            <td className="py-1 px-2">{i + 1}</td>
                                            <td className={cellCls("kadai")} style={{ backgroundColor: getCellStyle("kadai").bgColor, textAlign: getCellStyle("kadai").textAlign }}>
                                              <input value={seg.kadai} onFocus={() => setOndokuSelectedCell({ row: i, col: "kadai" })} onChange={(e) => setOndokuFeedbackForm((f) => {
                                                if (!f) return f;
                                                const segs = [...f.segments];
                                                segs[i] = { ...segs[i], kadai: e.target.value };
                                                return { ...f, segments: segs };
                                              })} className={inputCls} style={{ fontSize: getCellStyle("kadai").fontSize }} />
                                            </td>
                                            <td className={cellCls("correct")} style={{ backgroundColor: getCellStyle("correct").bgColor, textAlign: getCellStyle("correct").textAlign }}>
                                              <input value={seg.correct} onFocus={() => setOndokuSelectedCell({ row: i, col: "correct" })} onChange={(e) => setOndokuFeedbackForm((f) => {
                                                if (!f) return f;
                                                const segs = [...f.segments];
                                                segs[i] = { ...segs[i], correct: e.target.value };
                                                return { ...f, segments: segs };
                                              })} className={inputCls} style={{ fontSize: getCellStyle("correct").fontSize }} />
                                            </td>
                                            <td className={cellCls("learner")} style={{ backgroundColor: getCellStyle("learner").bgColor, textAlign: getCellStyle("learner").textAlign }}>
                                              <input value={seg.learner} onFocus={() => setOndokuSelectedCell({ row: i, col: "learner" })} onChange={(e) => setOndokuFeedbackForm((f) => {
                                                if (!f) return f;
                                                const segs = [...f.segments];
                                                segs[i] = { ...segs[i], learner: e.target.value };
                                                return { ...f, segments: segs };
                                              })} className={inputCls} style={{ fontSize: getCellStyle("learner").fontSize }} />
                                            </td>
                                            {ondokuFeedbackForm.extraColumns.map((col) => (
                                              <td key={col.key} className={cellCls(col.key)} style={{ backgroundColor: getCellStyle(col.key).bgColor, textAlign: getCellStyle(col.key).textAlign }}>
                                                <input value={(seg as Record<string, string>)[col.key] ?? ""} onFocus={() => setOndokuSelectedCell({ row: i, col: col.key })} onChange={(e) => setOndokuFeedbackForm((f) => {
                                                  if (!f) return f;
                                                  const segs = [...f.segments];
                                                  segs[i] = { ...segs[i], [col.key]: e.target.value };
                                                  return { ...f, segments: segs };
                                                })} className={inputCls} style={{ fontSize: getCellStyle(col.key).fontSize }} />
                                              </td>
                                            ))}
                                            <td className="py-1 px-2">
                                              <button type="button" onClick={() => setOndokuFeedbackForm((f) => f && { ...f, segments: f.segments.filter((_, j) => j !== i) })} className="text-red-600 text-xs hover:underline">削除</button>
                                            </td>
                                          </tr>
                                          );
                                        })}
                                        <tr>
                                          <td colSpan={4 + ondokuFeedbackForm.extraColumns.length + 1} className="py-1">
                                            <button type="button" onClick={() => setOndokuFeedbackForm((f) => f && { ...f, segments: [...f.segments, { kadai: "", correct: "", learner: "", ...Object.fromEntries(f.extraColumns.map((c) => [c.key, ""])) }] })} className="text-red-600 text-sm hover:underline mr-3">+ 行を追加</button>
                                            <button type="button" onClick={() => {
                                              const label = window.prompt("列の名前を入力してください");
                                              if (!label?.trim()) return;
                                              const key = "ext_" + Date.now();
                                              setOndokuFeedbackForm((f) => f ? {
                                                ...f,
                                                extraColumns: [...f.extraColumns, { key, label: label.trim() }],
                                                segments: f.segments.map((s) => ({ ...s, [key]: "" })),
                                              } : f);
                                            }} className="text-blue-600 text-sm hover:underline">+ 列を追加</button>
                                          </td>
                                        </tr>
                                        <tr>
                                          <td className="py-1 px-2 bg-gray-100 font-medium align-top">解説</td>
                                          <td className="py-1 px-2 border border-gray-200" colSpan={5}>
                                            <textarea value={ondokuFeedbackForm.kaisetsu} onChange={(e) => setOndokuFeedbackForm((f) => f && { ...f, kaisetsu: e.target.value })} rows={4} className="w-full px-2 py-1 border-0 focus:ring-1 focus:ring-red-500" placeholder="発音の解説・フィードバック" />
                                          </td>
                                        </tr>
                                      </tbody>
                                    </table>
                                  </div>
                                  <div className="mt-3 flex flex-wrap gap-4 items-start justify-between">
                                    <div className="flex gap-2">
                                      <button
                                        type="button"
                                        onClick={async () => {
                                          if (!ondokuFeedbackForm || !s.id) return;
                                          setOndokuFeedbackSaving(true);
                                          try {
                                            const feedbackJson = JSON.stringify(ondokuFeedbackForm);
                                            const res = await fetch(`/api/admin/ondoku/submissions/${s.id}`, {
                                              method: "PUT",
                                              headers: { "Content-Type": "application/json", Authorization: `Bearer ${authKey}` },
                                              body: JSON.stringify({ feedback: feedbackJson, status: "in_progress" }),
                                            });
                                            if (!res.ok) throw new Error("保存に失敗しました");
                                            setOndokuSubmissions((prev) => prev.map((x) => x.id === s.id ? { ...x, feedback: feedbackJson, status: "in_progress" } : x));
                                          } catch (e) {
                                            alert(e instanceof Error ? e.message : "保存に失敗しました");
                                          } finally {
                                            setOndokuFeedbackSaving(false);
                                          }
                                        }}
                                        disabled={ondokuFeedbackSaving}
                                        className="px-4 py-2 bg-red-600 text-white rounded text-sm hover:bg-red-700 disabled:opacity-50"
                                      >
                                        {ondokuFeedbackSaving ? "保存中..." : "保存"}
                                      </button>
                                      <button
                                        type="button"
                                        onClick={async () => {
                                          if (!ondokuFeedbackForm || !s.id) return;
                                          setOndokuFeedbackSaving(true);
                                          try {
                                            const feedbackJson = JSON.stringify(ondokuFeedbackForm);
                                            const res = await fetch(`/api/admin/ondoku/submissions/${s.id}`, {
                                              method: "PUT",
                                              headers: { "Content-Type": "application/json", Authorization: `Bearer ${authKey}` },
                                              body: JSON.stringify({ feedback: feedbackJson, status: "completed" }),
                                            });
                                            if (!res.ok) throw new Error("保存に失敗しました");
                                            setOndokuSubmissions((prev) => prev.map((x) => x.id === s.id ? { ...x, feedback: feedbackJson, status: "completed" } : x));
                                          } catch (e) {
                                            alert(e instanceof Error ? e.message : "保存に失敗しました");
                                          } finally {
                                            setOndokuFeedbackSaving(false);
                                          }
                                        }}
                                        disabled={ondokuFeedbackSaving}
                                        className="px-4 py-2 bg-green-600 text-white rounded text-sm hover:bg-green-700 disabled:opacity-50"
                                      >
                                        完了
                                      </button>
                                    </div>
                                    <div className="flex flex-col gap-2 min-w-[280px]">
                                      <textarea value={ondokuPdfMailBody} onChange={(e) => setOndokuPdfMailBody(e.target.value)} rows={3} className="w-full px-3 py-2 border border-gray-300 rounded text-sm" placeholder="メール本文（PDF送付時）" />
                                      <button
                                        type="button"
                                        disabled={ondokuPdfSending || !ondokuFeedbackForm}
                                        onClick={() => {
                                          if (!ondokuFeedbackForm || !s.user?.email) {
                                            alert("生徒のメールアドレスがありません");
                                            return;
                                          }
                                          setOndokuPdfConfirmFor(s.id);
                                        }}
                                        className="px-4 py-2 bg-blue-600 text-white rounded text-sm hover:bg-blue-700 disabled:opacity-50"
                                      >
                                        PDF保存してメール送信
                                      </button>
                                    </div>
                                  </div>
                                </div>
                              )}
                            </li>
                          ))}
                        </ul>
                      </div>
                    );
                  })}
                </div>
                {ondokuSubmissions.filter((s) => s.period_index === ondokuPeriodTab).length === 0 && (
                  <p className="text-gray-500 py-4">この期の提出はありません。</p>
                )}
                {ondokuPdfConfirmFor && ondokuFeedbackForm && (() => {
                  const sub = ondokuSubmissions.find((x) => x.id === ondokuPdfConfirmFor);
                  if (!sub?.user?.email) return null;
                  return (
                    <div className="fixed inset-0 bg-black/50 flex items-center justify-center z-50 p-4" onClick={() => setOndokuPdfConfirmFor(null)}>
                      <div className="bg-white rounded-lg shadow-xl max-w-md w-full p-4" onClick={(e) => e.stopPropagation()}>
                        <h4 className="font-medium text-gray-800 mb-3">メール送信の確認</h4>
                        <div className="space-y-3 text-sm">
                          <div>
                            <span className="text-gray-600">宛先:</span>
                            <p className="font-medium text-gray-800 mt-0.5">{sub.user.email}</p>
                            <p className="text-xs text-gray-500">（提出した生徒のメールアドレス）</p>
                          </div>
                          <div>
                            <span className="text-gray-600">件名:</span>
                            <p className="font-medium text-gray-800 mt-0.5">音読課題 添削結果</p>
                          </div>
                          <div>
                            <label className="text-gray-600 block mb-1">本文:</label>
                            <textarea value={ondokuPdfMailBody} onChange={(e) => setOndokuPdfMailBody(e.target.value)} rows={4} className="w-full px-3 py-2 border border-gray-300 rounded text-sm" placeholder="メール本文" />
                          </div>
                          <div>
                            <label className="text-gray-600 block mb-1">発送予定日:</label>
                            <input type="datetime-local" value={ondokuPdfScheduledAt} onChange={(e) => setOndokuPdfScheduledAt(e.target.value)} min={new Date().toISOString().slice(0, 16)} max={new Date(Date.now() + 30 * 24 * 60 * 60 * 1000).toISOString().slice(0, 16)} className="w-full px-3 py-2 border border-gray-300 rounded text-sm" />
                            <p className="text-xs text-gray-500 mt-0.5">空欄の場合は即時送信。最大30日後まで予約可能。</p>
                          </div>
                        </div>
                        <p className="text-xs text-gray-500 mt-2">PDF（添削結果）が添付されます。</p>
                        <div className="flex gap-2 mt-4">
                          <button type="button" onClick={() => setOndokuPdfConfirmFor(null)} className="px-4 py-2 border border-gray-300 rounded text-sm hover:bg-gray-50">キャンセル</button>
                          <button
                            type="button"
                            disabled={ondokuPdfSending}
                            onClick={async () => {
                              setOndokuPdfSending(true);
                              try {
                                const res = await fetch("/api/admin/ondoku/send-pdf-email", {
                                  method: "POST",
                                  headers: { "Content-Type": "application/json", Authorization: `Bearer ${authKey}` },
                                  body: JSON.stringify({
                                    feedback: ondokuFeedbackForm,
                                    to: sub.user!.email,
                                    body: ondokuPdfMailBody.trim() || undefined,
                                    scheduledAt: ondokuPdfScheduledAt.trim() || undefined,
                                  }),
                                });
                                const data = await res.json();
                                if (!res.ok) throw new Error(data.error || "送信に失敗しました");
                                setOndokuPdfConfirmFor(null);
                                setOndokuPdfScheduledAt("");
                                alert(ondokuPdfScheduledAt.trim() ? "メールを予約しました" : "メールを送信しました");
                              } catch (e) {
                                const msg = e instanceof Error ? e.message : "PDF生成・送信に失敗しました";
                                alert(msg === "RESEND_API_KEY not configured" ? "RESEND_API_KEY が設定されていません。Vercel の環境変数に RESEND_API_KEY を追加してください。" : msg);
                              } finally {
                                setOndokuPdfSending(false);
                              }
                            }}
                            className="px-4 py-2 bg-blue-600 text-white rounded text-sm hover:bg-blue-700 disabled:opacity-50"
                          >
                            {ondokuPdfSending ? "送信中..." : "送信する"}
                          </button>
                        </div>
                      </div>
                    </div>
                  );
                })()}
              </>
            )}
          </div>
        )}

        {activeTab === "writingVisibility" && (
          <div className="bg-white p-6 rounded-lg shadow">
            <h1 className="text-2xl font-bold mb-4">作文公開日設定（기수/회차 生徒별 공개일）</h1>
            <p className="text-sm text-gray-600 mb-4">各生徒ごとに、期・回別の公開日を設定できます。設定した日付以降にのみ、該当生徒に課題内容が表示されます。空欄の場合は非公開です。</p>
            <Link href="/writing" className="text-sm text-gray-600 hover:underline mb-4 block">作文ページ</Link>

            <div className="flex gap-2 mb-4 flex-wrap">
              {PERIOD_LABELS.map((label, i) => (
                <button
                  key={i}
                  onClick={() => setWritingVisPeriodTab(i)}
                  className={`px-4 py-2 rounded text-sm font-medium ${writingVisPeriodTab === i ? "bg-red-600 text-white" : "bg-gray-200 text-gray-700"}`}
                >
                  {label}
                </button>
              ))}
            </div>

            {writingVisLoading ? (
              <p>読み込み中...</p>
            ) : writingVisStudents.length === 0 ? (
              <p className="text-gray-500 py-4">writing_approved の生徒がいません。</p>
            ) : (
              <div className="overflow-x-auto">
                <table className="w-full text-sm border-collapse min-w-[800px]">
                  <thead>
                    <tr className="bg-gray-100">
                      <th className="border px-2 py-2 text-left sticky left-0 bg-gray-100 z-10">生徒</th>
                      {[0, 1, 2, 3, 4, 5, 6, 7, 8, 9].map((i) => (
                        <th key={i} className="border px-2 py-2 text-center">第{i + 1}回</th>
                      ))}
                    </tr>
                  </thead>
                  <tbody>
                    {writingVisStudents.map((student) => (
                      <tr key={student.id}>
                        <td className="border px-2 py-1 sticky left-0 bg-white z-10">
                          <div>
                            <div className="flex items-center gap-2">
                              <span className="font-medium text-gray-800">{student.name}</span>
                              <button
                                type="button"
                                onClick={() => {
                                  setWritingVisScheduleStudent(student);
                                  setWritingVisScheduleData(null);
                                  fetch(`/api/admin/writing/visibility/student-preview?user_id=${encodeURIComponent(student.id)}`, {
                                    headers: { Authorization: `Bearer ${authKey}` },
                                  })
                                    .then((r) => r.json())
                                    .then((data) => setWritingVisScheduleData(data.status || {}))
                                    .catch(() => setWritingVisScheduleData({}));
                                }}
                                className="shrink-0 px-2 py-1 bg-blue-600 text-white rounded text-xs hover:bg-blue-700"
                              >
                                일정 보기
                              </button>
                            </div>
                            <div className="text-xs text-gray-500 truncate max-w-[120px] mt-0.5">{student.email}</div>
                          </div>
                        </td>
                        {[0, 1, 2, 3, 4, 5, 6, 7, 8, 9].map((itemIdx) => {
                          const key = `${student.id}-${itemIdx}`;
                          const val = writingVisData[student.id]?.[itemIdx];
                          const dateStr = val ? new Date(val).toISOString().slice(0, 10) : "";
                          const displayDateStr = val ? new Date(val).toLocaleDateString("ja-JP", { year: "numeric", month: "2-digit", day: "2-digit" }).replace(/\//g, ".") : "";
                          return (
                            <td key={itemIdx} className="border px-1 py-1">
                              <div className="flex items-center gap-1 flex-wrap">
                                {val ? (
                                  <span className="text-green-600 font-medium text-xs shrink-0">확정 {displayDateStr}</span>
                                ) : (
                                  <span className="text-gray-500 text-xs shrink-0">미정</span>
                                )}
                                <input
                                  type="date"
                                  key={`sv-${key}-${dateStr}`}
                                  defaultValue={dateStr}
                                  id={`sv-${key}`}
                                  className="border rounded px-1 py-0.5 text-xs w-24"
                                  title="캘린더에서 날짜 선택"
                                />
                                <button
                                  type="button"
                                  onClick={async () => {
                                    const input = document.getElementById(`sv-${key}`) as HTMLInputElement;
                                    const v = input?.value?.trim() || null;
                                    setWritingVisSaving(key);
                                    try {
                                      const res = await fetch("/api/admin/writing/visibility/student", {
                                        method: "PUT",
                                        headers: { "Content-Type": "application/json", Authorization: `Bearer ${authKey}` },
                                        body: JSON.stringify({
                                          user_id: student.id,
                                          period_index: writingVisPeriodTab,
                                          item_index: itemIdx,
                                          visible_from: v ? `${v}T00:00:00Z` : null,
                                        }),
                                      });
                                      if (res.ok) {
                                        setWritingVisData((prev) => {
                                          const next = { ...prev };
                                          if (!next[student.id]) next[student.id] = {};
                                          next[student.id][itemIdx] = v ? `${v}T00:00:00Z` : null;
                                          return next;
                                        });
                                      } else {
                                        const err = await res.json();
                                        alert(err.error || "保存に失敗しました");
                                      }
                                    } catch {
                                      alert("保存中にエラーが発生しました");
                                    } finally {
                                      setWritingVisSaving(null);
                                    }
                                  }}
                                  disabled={writingVisSaving === key || writingVisSaving === `cancel-${key}`}
                                  className="px-1 py-0.5 bg-amber-600 text-white rounded text-xs hover:bg-amber-700 disabled:opacity-50 shrink-0"
                                >
                                  {writingVisSaving === key ? "..." : "保存"}
                                </button>
                                {val && (
                                  <button
                                    type="button"
                                    onClick={async () => {
                                      setWritingVisSaving(`cancel-${key}`);
                                      try {
                                        const res = await fetch("/api/admin/writing/visibility/student", {
                                          method: "PUT",
                                          headers: { "Content-Type": "application/json", Authorization: `Bearer ${authKey}` },
                                          body: JSON.stringify({
                                            user_id: student.id,
                                            period_index: writingVisPeriodTab,
                                            item_index: itemIdx,
                                            visible_from: null,
                                          }),
                                        });
                                        if (res.ok) {
                                          setWritingVisData((prev) => {
                                            const next = { ...prev };
                                            if (!next[student.id]) next[student.id] = {};
                                            next[student.id][itemIdx] = null;
                                            return next;
                                          });
                                        } else {
                                          const err = await res.json();
                                          alert(err.error || "保存に失敗しました");
                                        }
                                      } catch {
                                        alert("保存中にエラーが発生しました");
                                      } finally {
                                        setWritingVisSaving(null);
                                      }
                                    }}
                                    disabled={writingVisSaving === key || writingVisSaving === `cancel-${key}`}
                                    className="px-1 py-0.5 bg-gray-500 text-white rounded text-xs hover:bg-gray-600 disabled:opacity-50 shrink-0"
                                  >
                                    {writingVisSaving === `cancel-${key}` ? "..." : "취소"}
                                  </button>
                                )}
                              </div>
                            </td>
                          );
                        })}
                      </tr>
                    ))}
                  </tbody>
                </table>
              </div>
            )}

            {writingVisScheduleStudent && (
              <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/50" onClick={() => setWritingVisScheduleStudent(null)}>
                <div className="bg-white rounded-xl shadow-xl max-w-4xl w-full max-h-[90vh] overflow-hidden flex flex-col" onClick={(e) => e.stopPropagation()}>
                  <div className="px-4 py-3 border-b border-gray-200 flex justify-between items-center">
                    <h3 className="font-bold text-gray-800">
                      과제 제출 프론트 페이지 상태 - {writingVisScheduleStudent.name}
                    </h3>
                    <button type="button" onClick={() => setWritingVisScheduleStudent(null)} className="text-gray-500 hover:text-gray-700 font-medium">닫기</button>
                  </div>
                  <div className="flex-1 overflow-auto p-4">
                    {writingVisScheduleData === null ? (
                      <p className="text-gray-500">読み込み中...</p>
                    ) : (
                      <div className="overflow-x-auto">
                        <table className="w-full text-sm border-collapse">
                          <thead>
                            <tr className="bg-gray-100">
                              <th className="border px-2 py-2 text-left">期</th>
                              {[0, 1, 2, 3, 4, 5, 6, 7, 8, 9].map((i) => (
                                <th key={i} className="border px-2 py-2 text-center">第{i + 1}回</th>
                              ))}
                            </tr>
                          </thead>
                          <tbody>
                            {[0, 1, 2, 3, 4, 5, 6, 7].map((p) => (
                              <tr key={p}>
                                <td className="border px-2 py-1 font-medium">{PERIOD_LABELS[p]}</td>
                                {[0, 1, 2, 3, 4, 5, 6, 7, 8, 9].map((i) => {
                                  const s = writingVisScheduleData?.[p]?.[i];
                                  const visible = s?.visible ?? false;
                                  const dateStr = s?.date ? new Date(s.date).toLocaleDateString("ja-JP", { month: "numeric", day: "numeric" }) : null;
                                  const hasDate = !!s?.date;
                                  return (
                                    <td key={i} className="border px-2 py-1 text-center">
                                      {visible ? (
                                        <span className="text-green-600 font-medium">확정 공개</span>
                                      ) : hasDate ? (
                                        <span className="text-amber-600" title={s?.date || ""}>확정 예정 {dateStr}</span>
                                      ) : (
                                        <span className="text-gray-500">미정 (비공개)</span>
                                      )}
                                    </td>
                                  );
                                })}
                              </tr>
                            ))}
                          </tbody>
                        </table>
                      </div>
                    )}
                  </div>
                </div>
              </div>
            )}
          </div>
        )}

      </div>
    </div>
  );
}
