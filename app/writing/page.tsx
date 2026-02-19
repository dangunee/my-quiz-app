"use client";

import { useState, useEffect, useRef } from "react";
import Link from "next/link";

const WRITING_HOST = "writing.mirinae.jp";

type User = {
  id: string;
  email: string;
  name?: string;
  username?: string;
};

function useWritingBase() {
  const [base, setBase] = useState({
    adminPath: "/admin",
    redirectPath: "/writing",
    quizLink: "/",
  });
  useEffect(() => {
    if (typeof window !== "undefined") {
      const isWriting = window.location.hostname === WRITING_HOST;
      setBase({
        adminPath: "/admin",
        redirectPath: isWriting ? "/" : "/writing",
        quizLink: isWriting ? "https://quiz.mirinae.jp" : "/",
      });
    }
  }, []);
  return base;
}

type AssignmentStatus = "미제출" | "제출완료" | "첨삭완료";
type CorrectionStatus = "-" | "확인" | "완료";

interface Assignment {
  id: string;
  title: string;
  dateRange: string;
  status: AssignmentStatus;
  correction: CorrectionStatus;
  studentView: boolean;
  content?: string;
  correctedContent?: string;
  submittedAt?: string;
  feedback?: string;
}

const MOCK_ASSIGNMENTS: Assignment[] = [
  { id: "1", title: "과제 1", dateRange: "2/15 ~ 2/21", status: "미제출", correction: "-", studentView: false },
  { id: "2", title: "과제 2", dateRange: "2/8 ~ 2/14", status: "미제출", correction: "-", studentView: false },
];

const MOCK_STUDENTS = [
  { id: "1", name: "학생 1" },
  { id: "2", name: "학생 2" },
];

interface AssignmentExample {
  id: number;
  title: string;
  topic: string;
  modelContent?: {
    courseInfo?: string;
    theme: string;
    question: string;
    grammarNote?: string;
    patterns: { pattern: string; example: string }[];
  };
}

const ASSIGNMENT_EXAMPLES: AssignmentExample[] = [
  { id: 1, title: "오늘 하루 일과", topic: "오늘 하루 동안 한 일을 3문장 이상으로 써 보세요.", modelContent: { courseInfo: "10回コースの第１回課題", theme: "오늘 하루 일과", question: "오늘 하루 동안 무엇을 했습니까? 아침, 점심, 저녁 시간을 어떻게 보냈는지 3문장 이상으로 써 보세요.", grammarNote: "下記に提示された文型を、必ず2つ以上使用すること。", patterns: [{ pattern: "○-ㄹ/줄 몰랐다　～とは思わなかった", example: "예) 그런 좋은 방법이 있는 줄 몰랐다." }, { pattern: "○-(으)ㄹ까 한다 ～しようかと思う", example: "예) 스트레스를 풀러 여행을 갈까 한다." }] } },
  { id: 2, title: "스트레스 푸는 법", topic: "스트레스를 느낄 때와 푸는 방법에 대해 써 보세요.", modelContent: { courseInfo: "10回コースの第４回課題", theme: "스트레스 푸는 법", question: "당신은 어떨 때 스트레스를 느낍니까？ 스트레스가 쌓였을 때는 어떤 방법으로 풉니까? 추천하고 싶은 방법이 있으면 소개해 보세요.", grammarNote: "下記に提示された文型を、必ず2つ以上使用すること。", patterns: [{ pattern: "○-ㄹ/줄 몰랐다　～とは思わなかった", example: "예) 그런 좋은 방법이 있는 줄 몰랐다." }, { pattern: "○-(으)ㄹ까 한다 ～しようかと思う", example: "예) 스트레스를 풀러 여행을 갈까 한다." }, { pattern: "○-(으)려고 ～しようと", example: "예) 살을 빼려고 저녁을 굶기로 했다." }] } },
  { id: 3, title: "내가 좋아하는 음식", topic: "가장 좋아하는 음식과 그 이유를 써 보세요.", modelContent: { theme: "내가 좋아하는 음식", question: "가장 좋아하는 음식은 무엇입니까? 그 음식을 좋아하는 이유를 3문장 이상으로 써 보세요.", grammarNote: "下記に提示された文型を、必ず2つ以上使用すること。", patterns: [{ pattern: "○-ㄴ/은/는/(으)ㄹ 것 같다 ～ようだ", example: "예) 그 음식은 맛있을 것 같다." }, { pattern: "○-기 때문에 ～ので", example: "예) 맛있기 때문에 자주 먹는다." }] } },
  { id: 4, title: "주말 계획", topic: "이번 주말에 할 계획을 한국어로 써 보세요.", modelContent: { theme: "주말 계획", question: "이번 주말에 무엇을 할 계획입니까? 3문장 이상으로 써 보세요.", grammarNote: "下記に提示された文型を、必ず2つ以上使用すること。", patterns: [{ pattern: "○-(으)ㄹ 예정이다 ～予定だ", example: "예) 친구를 만날 예정이다." }, { pattern: "○-기로 했다 ～することにした", example: "예) 영화를 보기로 했다." }] } },
  { id: 5, title: "가족 소개", topic: "가족 구성원을 소개하는 글을 써 보세요.", modelContent: { theme: "가족 소개", question: "가족 구성원을 소개해 보세요. 각 가족에 대해 1문장 이상씩 써 보세요.", grammarNote: "下記に提示された文型を、必ず2つ以上使用すること。", patterns: [{ pattern: "○-ㄴ/은/는/(으)ㄹ N ～するN", example: "예) 요리를 하는 엄마가 있다." }, { pattern: "○-고 ～て（接続）", example: "예) 아버지는 회사에 가고, 엄마는 집에 있다." }] } },
  { id: 6, title: "한국 여행", topic: "한국에서 가고 싶은 곳과 그 이유를 써 보세요.", modelContent: { theme: "한국 여행", question: "한국에서 가고 싶은 곳이 있습니까? 그곳에 가고 싶은 이유를 3문장 이상으로 써 보세요.", grammarNote: "下記に提示された文型を、必ず2つ以上使用すること。", patterns: [{ pattern: "○-(으)ㄹ까 하다 ～しようかと思う", example: "예) 부산에 갈까 한다." }, { pattern: "○-기로 했다 ～することにした", example: "예) 경복궁을 보기로 했다." }] } },
  { id: 7, title: "나의 취미", topic: "취미 생활에 대해 5문장 이상으로 써 보세요.", modelContent: { theme: "나의 취미", question: "취미가 무엇입니까? 그 취미를 어떻게 즐기고 있는지 5문장 이상으로 써 보세요.", grammarNote: "下記に提示された文型を、必ず2つ以上使用すること。", patterns: [{ pattern: "○-는/(으)ㄴ/(으)ㄹ 때 ～時", example: "예) 심심할 때 음악을 듣는다." }, { pattern: "○-기 시작하다 ～し始める", example: "예) 3년 전부터 기타를 치기 시작했다." }] } },
  { id: 8, title: "기억에 남는 날", topic: "특별히 기억에 남는 하루를 써 보세요.", modelContent: { theme: "기억에 남는 날", question: "특별히 기억에 남는 날이 있습니까? 그날 무슨 일이 있었는지 3문장 이상으로 써 보세요.", grammarNote: "下記に提示された文型を、必ず2つ以上使用すること。", patterns: [{ pattern: "○-ㄴ/은/(으)ㄹ 때 ～時", example: "예) 그날은 날씨가 좋았다." }, { pattern: "○-기 때문에 ～ので", example: "예) 특별한 날이었기 때문에 잊을 수 없다." }] } },
  { id: 9, title: "한국어 공부 방법", topic: "한국어를 어떻게 공부하고 있는지 써 보세요.", modelContent: { theme: "한국어 공부 방법", question: "한국어를 어떻게 공부하고 있습니까? 효과적인 방법이 있다면 소개해 보세요.", grammarNote: "下記に提示された文型を、必ず2つ以上使用すること。", patterns: [{ pattern: "○-(으)면서 ～ながら", example: "예) 드라마를 보면서 한국어를 배운다." }, { pattern: "○-는/(으)ㄴ/(으)ㄹ 것 같다 ～ようだ", example: "예) 이 방법이 효과적일 것 같다." }] } },
  { id: 10, title: "내 꿈", topic: "미래의 꿈이나 목표에 대해 써 보세요.", modelContent: { theme: "내 꿈", question: "미래의 꿈이나 목표가 있습니까? 그 꿈을 위해 무엇을 하고 있는지 5문장 이상으로 써 보세요.", grammarNote: "下記に提示された文型を、必ず2つ以上使用すること。", patterns: [{ pattern: "○-(으)려고 ～しようと", example: "예) 꿈을 이루려고 열심히 공부한다." }, { pattern: "○-기 위해 ～ために", example: "예) 좋은 직업을 갖기 위해 노력한다." }] } },
];

const STORAGE_KEY = "writing_assignments";

function getStoredAssignments(): Assignment[] {
  if (typeof window === "undefined") return MOCK_ASSIGNMENTS;
  try {
    const stored = localStorage.getItem(STORAGE_KEY);
    if (stored) {
      const parsed = JSON.parse(stored);
      return parsed.length > 0 ? parsed : MOCK_ASSIGNMENTS;
    }
  } catch {}
  return MOCK_ASSIGNMENTS;
}

function saveAssignments(assignments: Assignment[]) {
  if (typeof window === "undefined") return;
  localStorage.setItem(STORAGE_KEY, JSON.stringify(assignments));
}

type TabId = "experience" | "writing" | "topik";

const TABS: { id: TabId; label: string }[] = [
  { id: "experience", label: "作文トレーニング" },
  { id: "writing", label: "課題提出" },
  { id: "topik", label: "TOPIK作文トレーニング" },
];

export default function WritingPage() {
  const { redirectPath } = useWritingBase();
  const [user, setUser] = useState<User | null>(null);
  const [activeTab, setActiveTab] = useState<TabId>("experience");
  const [assignments, setAssignments] = useState<Assignment[]>(MOCK_ASSIGNMENTS);
  const [menuOpen, setMenuOpen] = useState(false);
  const [showSubmitModal, setShowSubmitModal] = useState(false);
  const [selectedAssignment, setSelectedAssignment] = useState<Assignment | null>(null);
  const [selectedStudentId, setSelectedStudentId] = useState<string>("");
  const [selectedAssignmentId, setSelectedAssignmentId] = useState<string>("");
  const [submitContent, setSubmitContent] = useState("");
  const [submitLoading, setSubmitLoading] = useState(false);
  const [viewingStudent, setViewingStudent] = useState<Assignment | null>(null);
  const [feedbackModal, setFeedbackModal] = useState<Assignment | null>(null);
  const [teacherFeedback, setTeacherFeedback] = useState("");
  const [expandedExampleId, setExpandedExampleId] = useState<number | null>(null);
  const [expandedExperience, setExpandedExperience] = useState(false);
  const [expandedCheombi, setExpandedCheombi] = useState(false);
  const [showImageModal, setShowImageModal] = useState(false);
  const [showTrialModal, setShowTrialModal] = useState(false);
  const [trialTab1, setTrialTab1] = useState("");
  const [trialTab2, setTrialTab2] = useState("");
  const [trialLoading, setTrialLoading] = useState(false);
  const [trialActiveTab, setTrialActiveTab] = useState<"tab1" | "tab2">("tab1");
  const [showExampleSubmitModal, setShowExampleSubmitModal] = useState(false);
  const [exampleSubmitContent, setExampleSubmitContent] = useState("");
  const [showProfileModal, setShowProfileModal] = useState(false);
  const [profileDeleting, setProfileDeleting] = useState(false);
  const [profileMessage, setProfileMessage] = useState("");
  const [expandedSeitoVoice, setExpandedSeitoVoice] = useState(false);
  const editorRef = useRef<HTMLDivElement>(null);

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
  }, []);

  useEffect(() => {
    if (viewingStudent && editorRef.current) {
      editorRef.current.innerHTML =
        viewingStudent.correctedContent ??
        (viewingStudent.content ? viewingStudent.content.replace(/\n/g, "<br>") : "<p><br></p>");
    }
  }, [viewingStudent]);

  useEffect(() => {
    setAssignments(getStoredAssignments());
  }, []);

  const groupedByDate = assignments.reduce<Record<string, Assignment[]>>((acc, a) => {
    if (!acc[a.dateRange]) acc[a.dateRange] = [];
    acc[a.dateRange].push(a);
    return acc;
  }, {});

  const sortedDateRanges = Object.keys(groupedByDate).sort((a, b) => {
    const parseDate = (s: string) => {
      const [start] = s.split(" ~ ");
      const [m, d] = start.split("/").map(Number);
      return m * 100 + d;
    };
    return parseDate(b) - parseDate(a);
  });

  const handleTrialClick = async () => {
    setShowTrialModal(true);
    if (trialTab1 || trialTab2) return;
    setTrialLoading(true);
    try {
      const res = await fetch("/api/trial");
      if (!res.ok) throw new Error("Fetch failed");
      const { tab1, tab2 } = await res.json();
      setTrialTab1(tab1);
      setTrialTab2(tab2);
    } catch {
      setTrialTab1("<p class=\"text-red-600\">読み込みに失敗しました。<a href=\"https://mirinae.jp/trial.html?tab=tab01\" target=\"_blank\" rel=\"noopener noreferrer\" class=\"underline\">こちら</a>からお申し込みください。</p>");
      setTrialTab2("");
    } finally {
      setTrialLoading(false);
    }
  };

  const handleSubmitClick = () => {
    setSelectedAssignment(null);
    setSelectedStudentId("");
    setSelectedAssignmentId("");
    setSubmitContent("");
    setShowSubmitModal(true);
  };

  const handleExampleSubmitClick = () => {
    setExampleSubmitContent("");
    setShowExampleSubmitModal(true);
  };

  const handleCloseExampleSubmitModal = () => {
    setShowExampleSubmitModal(false);
    setExampleSubmitContent("");
  };

  const selectedExample = expandedExampleId ? ASSIGNMENT_EXAMPLES.find((ex) => ex.id === expandedExampleId) : null;

  const handleSubmitAssignment = (assignment: Assignment) => {
    setSelectedAssignment(assignment);
    setSelectedAssignmentId(assignment.id);
    setSelectedStudentId("");
    setSubmitContent(assignment.content || "");
    setShowSubmitModal(true);
  };

  const handleCloseSubmitModal = () => {
    setShowSubmitModal(false);
    setSelectedAssignment(null);
    setSelectedStudentId("");
    setSelectedAssignmentId("");
    setSubmitContent("");
  };

  const handleConfirmSubmit = () => {
    if (!submitContent.trim()) return;
    setSubmitLoading(true);
    setTimeout(() => {
      const targetId = selectedAssignmentId || selectedAssignment?.id || assignments.find((x) => x.status === "미제출")?.id;
      const updated = assignments.map((a) =>
        a.id === targetId ? { ...a, status: "제출완료" as AssignmentStatus, content: submitContent, submittedAt: new Date().toISOString() } : a
      );
      setAssignments(updated);
      saveAssignments(updated);
      setSubmitLoading(false);
      handleCloseSubmitModal();
    }, 600);
  };

  const handleViewStudent = (a: Assignment) => setViewingStudent(a);

  const applyFormat = (command: string, value?: string) => {
    document.execCommand(command, false, value);
    editorRef.current?.focus();
  };

  const handleSaveCorrectedContent = () => {
    if (!viewingStudent || !editorRef.current) return;
    const html = editorRef.current.innerHTML;
    const updated = assignments.map((a) =>
      a.id === viewingStudent.id ? { ...a, correctedContent: html, correction: "완료" as CorrectionStatus, status: "첨삭완료" as AssignmentStatus } : a
    );
    setAssignments(updated);
    saveAssignments(updated);
    setViewingStudent(null);
  };

  const handleOpenFeedback = (a: Assignment) => {
    setFeedbackModal(a);
    setTeacherFeedback(a.feedback || "");
  };

  const handleSaveFeedback = () => {
    if (!feedbackModal) return;
    const updated = assignments.map((a) =>
      a.id === feedbackModal.id ? { ...a, feedback: teacherFeedback, correction: "완료" as CorrectionStatus, status: "첨삭완료" as AssignmentStatus } : a
    );
    setAssignments(updated);
    saveAssignments(updated);
    setFeedbackModal(null);
    setTeacherFeedback("");
  };

  const handleProfileDeleteAccount = async () => {
    if (!confirm("本当にアカウントを削除しますか？この操作は取り消せません。")) return;
    setProfileDeleting(true);
    setProfileMessage("");
    try {
      const token = localStorage.getItem("quiz_token");
      if (!token) {
        setProfileMessage("ログインが必要です");
        return;
      }
      const res = await fetch("/api/auth/delete-account", {
        method: "POST",
        headers: { Authorization: `Bearer ${token}` },
      });
      const data = await res.json();
      if (res.ok) {
        localStorage.removeItem("quiz_token");
        localStorage.removeItem("quiz_user");
        setUser(null);
        setShowProfileModal(false);
        window.location.href = redirectPath;
      } else {
        setProfileMessage(data.error || "削除に失敗しました");
      }
    } catch {
      setProfileMessage("エラーが発生しました");
    } finally {
      setProfileDeleting(false);
    }
  };

  const menuLinks = [
    { label: "ログイン", href: "/login", external: false },
    { label: "クイズ", href: "https://quiz.mirinae.jp", external: true },
    { label: "ホームページ", href: "https://mirinae.jp", external: true },
    { label: "個人レッスン", href: "https://mirinae.jp/kojin.html?tab=tab01", external: true },
    { label: "発音講座", href: "https://mirinae.jp/kaiwa.html?tab=tab03", external: true },
    { label: "会話クラス", href: "https://mirinae.jp/kaiwa.html?tab=tab01", external: true },
    { label: "音読クラス", href: "https://mirinae.jp/kaiwa.html?tab=tab02", external: true },
    { label: "集中講座", href: "https://mirinae.jp/syutyu.html?tab=tab02", external: true },
    { label: "申し込み", href: "https://mirinae.jp/trial.html?tab=tab01", external: true },
  ];

  const sidebarContent = (
    <nav className="space-y-0">
      {user ? (
        <>
          <button type="button" onClick={() => { setMenuOpen(false); setShowProfileModal(true); }} className="block w-full text-left py-3 text-gray-800 hover:text-red-600 border-b border-[#e5dfd4]">
            マイページ
          </button>
          <span className="block py-2 text-sm text-gray-500 border-b border-[#e5dfd4]">ログイン中</span>
          <button
            type="button"
            onClick={() => { localStorage.removeItem("quiz_token"); localStorage.removeItem("quiz_user"); setMenuOpen(false); window.location.href = redirectPath; }}
            className="block w-full text-left py-3 text-gray-800 hover:text-red-600 border-b border-[#e5dfd4]"
          >
            ログアウト
          </button>
        </>
      ) : (
        <Link href={`/login?redirect=${encodeURIComponent(redirectPath)}`} className="block py-3 text-gray-800 hover:text-red-600 border-b border-[#e5dfd4]" onClick={() => setMenuOpen(false)}>
          ログイン
        </Link>
      )}
      {menuLinks.slice(1).map((item) => (
        <a
          key={item.href}
          href={item.href}
          {...(item.external ? { target: "_blank", rel: "noopener noreferrer" } : {})}
          className="block py-3 text-gray-800 hover:text-red-600 border-b border-[#e5dfd4] last:border-b-0"
          onClick={() => setMenuOpen(false)}
        >
          {item.label}
        </a>
      ))}
    </nav>
  );

  return (
    <div className="min-h-screen flex flex-col bg-[#f8f6f1]">
      {menuOpen && (
        <>
          <div className="fixed inset-0 z-40 bg-black/30 md:hidden" onClick={() => setMenuOpen(false)} aria-hidden />
          <aside className="fixed left-0 top-0 z-50 h-full w-64 max-w-[85vw] bg-white shadow-xl md:hidden" style={{ animation: "slideIn 0.2s ease" }}>
            <div className="flex items-center justify-between border-b px-4 py-3">
              <span className="font-semibold text-gray-800">メニュー</span>
              <button type="button" onClick={() => setMenuOpen(false)} className="rounded p-2 text-gray-500 hover:bg-gray-100" aria-label="メニューを閉じる">
                <svg className="h-5 w-5" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M6 18L18 6M6 6l12 12" /></svg>
              </button>
            </div>
            <div className="p-4">{sidebarContent}</div>
          </aside>
        </>
      )}

      {showProfileModal && user && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/50" onClick={() => setShowProfileModal(false)}>
          <div className="bg-white rounded-xl shadow-xl w-full max-w-sm p-6" onClick={(e) => e.stopPropagation()}>
            <div className="flex justify-between items-center mb-6">
              <h2 className="text-xl font-bold text-gray-800">マイページ</h2>
              <button type="button" onClick={() => setShowProfileModal(false)} className="rounded p-2 text-gray-500 hover:bg-gray-100" aria-label="閉じる">
                <svg className="h-5 w-5" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M6 18L18 6M6 6l12 12" /></svg>
              </button>
            </div>
            <div className="space-y-4 mb-6">
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
            {profileMessage && <p className="mb-4 text-sm text-red-600 text-center">{profileMessage}</p>}
            <button
              type="button"
              onClick={() => { localStorage.removeItem("quiz_token"); localStorage.removeItem("quiz_user"); setUser(null); setShowProfileModal(false); window.location.href = redirectPath; }}
              className="w-full py-2 bg-red-600 text-white rounded hover:bg-red-700 mb-3"
            >
              ログアウト
            </button>
            <button
              type="button"
              onClick={handleProfileDeleteAccount}
              disabled={profileDeleting}
              className="w-full py-2 border border-red-600 text-red-600 rounded hover:bg-red-50 disabled:opacity-50"
            >
              {profileDeleting ? "処理中..." : "アカウントを削除する"}
            </button>
          </div>
        </div>
      )}

      <header className="bg-[#1a4d2e] text-white py-4 md:py-6 px-4 md:px-6 shadow-lg relative">
        <div className="max-w-4xl md:max-w-[75rem] mx-auto flex items-center justify-center min-h-[2.5rem] md:min-h-[2.5rem]">
          <button type="button" onClick={() => setMenuOpen(true)} className="md:hidden absolute left-4 md:left-6 shrink-0 h-10 w-10 flex items-center justify-center rounded-lg bg-white/20 text-white hover:bg-white/30" aria-label="メニューを開く">
            <svg className="h-5 w-5" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M4 6h16M4 12h16M4 18h16" /></svg>
          </button>
          <h1 className="text-2xl md:text-4xl font-bold tracking-wide text-center">ミリネ韓国語教室・作文トレーニング</h1>
        </div>
      </header>

      <div className="flex flex-1 justify-center">
        <div className="flex flex-1 flex-col md:flex-row max-w-4xl md:max-w-[75rem] w-full">
          <aside className="hidden md:flex md:flex-col md:w-56 md:shrink-0 bg-[#f5f0e6] border-r border-[#e5dfd4]">
            <div className="px-4 py-4 border-b border-[#e5dfd4]">
              <span className="font-semibold text-gray-800">メニュー</span>
            </div>
            <div className="p-4 flex-1 overflow-y-auto">{sidebarContent}</div>
          </aside>

          <main className="flex-1 min-w-0 flex flex-col overflow-hidden">
            <div className="bg-white border-b border-[#e5dfd4] shadow-sm shrink-0">
              <nav className="flex overflow-x-auto px-4 md:px-6 py-2">
                {TABS.map((tab) => (
                  <button
                    key={tab.id}
                    onClick={() => setActiveTab(tab.id)}
                    className={`flex-1 min-w-0 py-3 px-2 font-medium text-sm whitespace-nowrap border-b-2 transition-colors ${activeTab === tab.id ? "border-[#1a4d2e] text-[#1a4d2e]" : "border-transparent text-gray-500 hover:text-gray-700 hover:border-gray-300"}`}
                  >
                    {tab.label}
                  </button>
                ))}
              </nav>
            </div>

            <div className="flex-1 overflow-auto px-0 py-4 pb-24 md:px-6 md:py-6 md:pb-6">
              {activeTab === "experience" && (
                <div className="max-w-3xl md:max-w-[52.75rem] w-full mx-auto">
                  <div className="bg-white rounded-none md:rounded-2xl border border-[#e5dfd4] shadow-sm overflow-hidden">
                    <div className="bg-[#1a4d2e] px-6 py-4">
                      <h2 className="text-lg md:text-xl font-bold text-white">メールで作文トレーニング</h2>
                      <p className="text-white/90 text-sm mt-1">300～500字作文 作文添削 ＋ ネイティブ比較文 ＋ 模範文 までつく！</p>
                    </div>
                    <div className="p-6 space-y-6">
                      <div>
                        <h3 className="font-semibold text-gray-800 mb-3 text-sm">特徴</h3>
                        <ul className="space-y-2 text-gray-700 text-sm">
                          <li className="flex gap-2"><span className="text-[#1a4d2e] font-medium shrink-0">①</span>自分の書いた文章を自然な韓国語に直してもらいます</li>
                          <li className="flex gap-2"><span className="text-[#1a4d2e] font-medium shrink-0">②</span>表現力をアップさせるために、毎週毎回違うテーマについての作文にチャレンジできます</li>
                          <li className="flex gap-2"><span className="text-[#1a4d2e] font-medium shrink-0">③</span>課題は、さらに厳選された文型を必ず使用するよう出題します</li>
                          <li className="flex gap-2"><span className="text-[#1a4d2e] font-medium shrink-0">④</span>ネイティブの添削とあわせて送付される模範作文を比較し、更に多くの文型や表現に触れることが出来、読解力も向上します</li>
                        </ul>
                      </div>
                      <div className="pt-4 border-t border-[#e5dfd4] overflow-hidden rounded-lg border border-gray-300 bg-[#1e3a5f]">
                        <div className="px-4 py-1">
                          <h3 className="font-semibold text-white text-base">詳細</h3>
                        </div>
                        <div className="border-collapse text-sm">
                          {[
                            { label: "特徴", content: "毎週テーマで作文にチャレンジ。ネイティブ添削＋模範文で表現力UP。TOPIK対策にも最適。" },
                            { label: "対象", content: "初、中、上級(レベルの区別はありません)" },
                            { label: "目標", content: "語彙・文型を増やし、自然な韓国語の表現を身につける" },
                            { label: "授業の流れ", content: <>金曜にテーマ送付 → 月曜夜9時までに <a href="mailto:sakubun@kaonnuri.com" className="text-[#1a4d2e] hover:underline">sakubun@kaonnuri.com</a> へ提出</> },
                            { label: "日程", content: "1月9日(金)から10週間" },
                            { label: "教室", content: "オンライン" },
                            { label: "募集期間", content: "～2026年1月7日(水)" },
                            { label: "テキスト", content: "ミリネ独自テキスト(PDF)※事前にメールでお送りします" },
                          ].map((row, i) => (
                            <div key={row.label} className="flex flex-row border-b border-gray-300 last:border-b-0">
                              <div className="w-20 md:w-32 shrink-0 px-2 md:px-3 py-2.5 bg-gray-200 font-medium text-gray-800 border-r border-gray-300 text-xs md:text-sm">
                                {row.label}
                              </div>
                              <div className={`flex-1 min-w-0 px-2 md:px-3 py-2.5 text-gray-700 text-xs md:text-sm ${i % 2 === 0 ? "bg-white" : "bg-gray-100"}`}>
                                {row.content}
                              </div>
                            </div>
                          ))}
                        </div>
                      </div>
                      <div className="pt-4 border-t border-[#e5dfd4]">
                        <div className="px-4 md:px-5 py-3 bg-[#faf8f5] rounded-t-lg border border-b-0 border-gray-300 font-semibold text-gray-800 text-sm md:text-base">体験例</div>
                        <div className="border border-gray-300 rounded-b-lg overflow-hidden">
                          <div>
                            <button type="button" onClick={() => setExpandedExperience(!expandedExperience)} className="w-full px-4 md:px-5 py-3 hover:bg-[#faf8f5] flex flex-col sm:flex-row sm:items-center sm:justify-between gap-2 text-left">
                              <div className="flex items-center gap-3">
                                <span className="text-gray-500 text-xs w-4 inline-block">{expandedExperience ? "▼" : "▶"}</span>
                                <span className="font-medium text-gray-800">課題提示、文型、添削事例</span>
                              </div>
                              <p className="text-gray-600 text-sm pl-9 sm:pl-0 sm:max-w-md">성형수술에 대해 어떻게 생각하는지 쓰시오</p>
                            </button>
                            {expandedExperience && (
                              <div className="px-4 md:px-5 pb-4 pt-0 border-t border-[#e5dfd4] bg-[#fafbfc]">
                                <div className="mt-3 p-4 rounded-xl bg-white border border-[#e5dfd4] text-sm space-y-4">
                                  <p className="text-gray-800 leading-relaxed">요즘 쁘띠 성형이라고 해서 칼을 대지 않고도 성형을 할 수 있는 시대가 되었다. 연예인들도 자신의 성형을 당당히 밝히고 있는데, 성형수술, 어떻게 생각하는지 쓰시오</p>
                                  <p className="text-gray-600 font-medium">参考単語: 미의 기준, 다이어트, 자기만족, 중독, 자연스럽다, 성격</p>
                                  <p className="text-gray-600 font-medium">下記に提示された文型を、必ず2つ以上使用すること。</p>
                                  <div className="space-y-2 pt-2">
                                    <div className="text-gray-700">
                                      <p className="font-medium text-gray-800">○ -다 못해　～しきれなくて、～してもどうにもならなくて</p>
                                      <p className="text-gray-600 pl-2">예) 참다 못해 성형을 했다고 한다</p>
                                    </div>
                                    <div className="text-gray-700">
                                      <p className="font-medium text-gray-800">○ -(으)ㄴ가/는가 하면 ～するかと思えば、～する一方で</p>
                                      <p className="text-gray-600 pl-2">예) 한번 성형하면 끝인가 하면 중독이 되는 사람도 많다고 한다</p>
                                    </div>
                                    <div className="text-gray-700">
                                      <p className="font-medium text-gray-800">○ -(으)므로 ～ので、（だ）から</p>
                                      <p className="text-gray-600 pl-2">예) 부모님이 물려 주신 소중한 몸이므로 성형을 해서는 안된다고 생각한다</p>
                                    </div>
                                    <div className="text-gray-700">
                                      <p className="font-medium text-gray-800">○ -(으)ㄴ/는 김에 ～するついでに</p>
                                      <p className="text-gray-600 pl-2">예) 한국에 관광 가는 김에 성형까지 하고 오는 사람도 있다</p>
                                    </div>
                                  </div>
                                  <div className="pt-4 mt-4 border-t border-gray-300 md:border-[#e5dfd4]">
                                    <div className="py-2 font-semibold text-gray-800 text-sm border-b border-gray-200 md:border-0 md:px-3 md:py-2 md:bg-[#1e3a5f] md:rounded-t-lg">
                                      <span className="md:text-white">添削事例</span>
                                    </div>
                                    <div className="py-3 md:p-4 md:rounded-b-lg md:border md:border-t-0 md:border-gray-300 md:bg-gray-50">
                                      <p className="text-gray-800 leading-relaxed text-base">
                                        요즘 성형수술을 <span className="text-gray-700">많이 하다</span><span className="text-gray-400 mx-1">→</span><span className="text-red-600 font-medium">하는 사람이 많다</span>. 나는 성형을 생각할 때 참다 못해 부모님이 <span className="text-gray-700">물려주신</span><span className="text-gray-400 mx-1">→</span><span className="text-red-600 font-medium">물려 주신 소중한</span> 몸이므로 <span className="text-gray-700">성형하면</span><span className="text-gray-400 mx-1">→</span><span className="text-red-600 font-medium">성형을 해서는</span> 안 된다고 생각한다.
                                      </p>
                                    </div>
                                  </div>
                                  <div className="pt-4 mt-4 border-t border-gray-300 md:border-0 md:overflow-hidden md:rounded-lg md:border md:border-[#e5dfd4]">
                                    <div className="py-2 font-semibold text-gray-800 text-sm border-b border-gray-200 md:border-0 md:px-3 md:py-2 md:bg-[#1e3a5f] md:rounded-t-lg">
                                      <span className="md:text-white">模範文</span>
                                    </div>
                                    <div className="py-3 md:p-4 md:bg-[#f5f0e6]">
                                      <p className="text-gray-700 leading-relaxed text-base whitespace-pre-line">한국 사람이라고 해서 누구나 성형수술에 관대한 것은 아니지만, 나는 어느 쪽인가 하면 적당한 성형에 찬성하는 편이다. 평생 콤플렉스를 가진 채 고민하며 사느니 조금 고쳐서 자신감을 갖는 것이 더 낫다고 생각하기 때문이다. 내 주변에는 성형중독은 없지만 쌍커풀 수술이나 코 수술 정도는 몇 명이나 있다.
고등학교 때 콧대가 낮은 것이 콤플렉스였던 친구는 대학에 들어가자마자 참다 못해 수술을 했고, 코 수술하는 김에 쌍커풀도 손을 봤다. 그 후 자신감을 얻어 유명한 영어 강사가 되고 멋진 남자와 결혼도 했다. 친구 중 한 명은 교통사고가 나서 보험금을 많이 받게 되었는데 어차피 회사를 1년 정도 쉬기 때문에 그 김에 치아교정을 하기도 했다.
그렇지만, 이렇게 성공한 사람이 있는가 하면 수술을 안하느니만 못하게 실패한 사람도 있다. 그러므로 성형수술은 훨씬 예뻐지겠다고 욕심을 내서는 안 되고 적당히 자연스럽게 콤플렉스만 해결할 수 있을 정도로 해야 한다고 생각한다. (501자)</p>
                                    </div>
                                  </div>
                                </div>
                              </div>
                            )}
                          </div>
                          <div className="border-t border-[#e5dfd4]">
                            <button type="button" onClick={() => setExpandedCheombi(!expandedCheombi)} className="w-full px-4 md:px-5 py-3 hover:bg-[#faf8f5] flex flex-col sm:flex-row sm:items-center sm:justify-between gap-2 text-left">
                              <div className="flex items-center gap-3">
                                <span className="text-gray-500 text-xs w-4 inline-block">{expandedCheombi ? "▼" : "▶"}</span>
                                <span className="font-medium text-gray-800">添削文・比較文・模範文</span>
                              </div>
                              <p className="text-gray-600 text-sm pl-9 sm:pl-0 sm:max-w-md">服とファッションの添削例</p>
                            </button>
                            {expandedCheombi && (
                              <div className="px-4 md:px-5 pb-4 pt-0 border-t border-[#e5dfd4] bg-[#fafbfc]">
                                <div className="mt-3 p-4 md:rounded-xl md:bg-white md:border md:border-[#e5dfd4] text-sm space-y-0 md:space-y-4 divide-y divide-gray-200 md:divide-y-0">
                                  <div className="pt-4 first:pt-0 md:pt-0 md:overflow-hidden md:rounded-lg md:border md:border-gray-300">
                                    <div className="py-2 font-semibold text-gray-800 text-sm border-b border-gray-200 md:border-0 md:px-3 md:py-2 md:bg-[#1e3a5f]">
                                      <span className="md:text-white">添削文</span>
                                    </div>
                                    <div className="py-3 md:p-4 md:bg-white text-base leading-relaxed">
                                      <p>나는 어렸을 때부터 옷을 좋아해서 어머니와 함께 쇼핑을 가서 옷을 고르는 것이 즐거움이었다. 중학생 까지는<span className="text-red-600 font-medium">중학생까지는</span> 항상 어머니가 고른옷을<span className="text-red-600 font-medium">고르신 옷을</span> 입고 있었다.<span className="text-red-600 font-medium">입었다.</span> 고등학생 때는 옷은 친구와 함께 사러 가게되었다.<span className="text-red-600 font-medium">가게 되었다.</span> 당시 마추다 세이고 씨가<span className="text-red-600 font-medium">마쓰다 세이코 씨가</span> 인기가 있어서 그녀를 흉내내서 예쁜 옷을 고르고 입고 있었다.<span className="text-red-600 font-medium">골라서 입었다.</span> 이십 대는 &quot;보디곤&quot; 으로 불리는 몸의 선이 나온 옷이<span className="text-red-600 font-medium">몸의 선이 드러나는 옷이</span> 인기가 있었고 나도 좋아해서 입고 있었다.<span className="text-red-600 font-medium">입었다.</span> 지금보다 10킬로그램 정도 빼고 있었다.<span className="text-red-600 font-medium">날씬했기 때문에 그때는</span> 자신이 곱게 보이는 옷을 고르고 입고 있었다.<span className="text-red-600 font-medium">나 자신이 예뻐 보이는 옷을 골라서 입었다.</span> 결혼해서 아이가 어렸을 때는 움직이기 편한 옷을 입고 있었다.<span className="text-red-600 font-medium">입었다.</span> 항상 청바지를 입고 아이들과 뛰어다니고 있었다.<span className="text-red-600 font-medium">뛰어다녔다.</span> 매일 바빠서 멋내기는 생각 못 했다.<span className="text-red-600 font-medium">생각도 못 했다.</span> 그리고 나는 이제 나이를 먹어서 50대가 되었다. 다시 멋을 낼 수 있는 연대 지만<span className="text-red-600 font-medium">아직 멋을 낼 수 있는 연령이지만</span> 살이 쪄서 옷을 잘 소화할 수 없었다.<span className="text-red-600 font-medium">없다.</span> 요즘은 몸의선이 숨 은 옷만<span className="text-red-600 font-medium">몸매가 드러나지 않는 옷만 입는다.</span> 나잇값으로<span className="text-red-600 font-medium">나이에 맞게</span> 멋지게 옷을 소화할 수 있는 여성이 되고 싶다.</p>
                                    </div>
                                  </div>
                                  <div className="pt-4 md:pt-0 md:overflow-hidden md:rounded-lg md:border md:border-[#1e3a5f]">
                                    <div className="py-2 font-semibold text-gray-800 text-sm border-b border-gray-200 md:border-0 md:px-3 md:py-2 md:bg-[#1e3a5f]">
                                      <span className="md:text-white">比較文</span>
                                    </div>
                                    <div className="py-3 md:p-4 md:bg-[#1e3a5f]/10">
                                      <p className="text-[#1e3a5f] leading-relaxed text-base whitespace-pre-line">나는 어렸을 때부터 옷을 좋아해서 어머니와 함께 쇼핑을 가서 옷을 고르는 것이 즐거움이었다. 중학생까지는 항상 어머니가 골라 주신 옷을 입었다. 하지만 고등학생 때부터는 옷을 친구와 함께 사러 가게 되었다. 당시 마쓰다 세이코 씨가 인기가 있어서 그녀를 따라 예쁜 옷을 골라서 입었다. 이십 대 때는 &apos;보디곤&apos;으로 불리는 몸의 선이 드러나는 옷이 인기가 있었고 나도 좋아해서 그것을 주로 입었다. 지금보다 10킬로그램 정도 날씬했기 때문에 그때는 나 자신이 예뻐 보이는 옷을 골라서 입었다. 그러나 결혼하고 아이가 생긴 후 움직이기 편한 옷을 입기 시작했다. 항상 청바지를 입고 아이들과 뛰어다녔다. 매일 바빠서 멋내기는 생각도 못 했다. 그리고 이제 나이를 먹고 50대가 되었다. 아직 멋을 낼 수 있는 나이지만 살이 쪄서 옷을 잘 소화할 수 없다. 그래서 요즘은 몸매가 드러나지 않는 옷만 입는다. 나이에 맞게 멋지게 옷을 소화할 수 있는 여성이 되고 싶다.</p>
                                    </div>
                                  </div>
                                  <div className="pt-4 md:pt-0 md:overflow-hidden md:rounded-lg md:border md:border-[#e5dfd4]">
                                    <div className="py-2 font-semibold text-gray-800 text-sm border-b border-gray-200 md:border-0 md:px-3 md:py-2 md:bg-[#1e3a5f]">
                                      <span className="md:text-white">模範文</span>
                                    </div>
                                    <div className="py-3 md:p-4 md:bg-[#f5f0e6]">
                                      <p className="text-gray-700 leading-relaxed text-base whitespace-pre-line">나는 어렸을 때부터 옷을 좋아하는 사람이었다. 옷을 잘 입는 사람은 아니지만 유행에도 민감하고 늘 패션에 관심은 두고 있었다. 그래서 교복을 입던 학생 때는 너무 지루했는데, 대학생이 되어서 옷 가게에서 아르바이트를 시작했다. 약 1년 반 정도 계속했었는데, 옷에 둘러싸여 있는 세상은 참 재미있었지만 어려운 일이었다.

옷을 팔 때는 어울리는 옷을 제안하거나 관리 및 세탁법을 알려 드려야 하고, 손님과의 대화 기술 등 많은 지식이 필요했다. 아마 나에게 조금이나마 감각이 있었다면 계속 옷에 관련된 일을 했을지도 모른다. 그러나 불행하게도 나에게는 그런 재능이 없었고, 그걸 깨달은 이상 더 이상 옷과 관련된 일을 할 수는 없었다.

나이가 들면서 좋아하는 옷은 바뀌고 있다. 어릴 때는 어울리는 색깔이나 디자인이 중요했는데, 지금은 소재나 질이 중요하다. 더불어 때와 장소에 맞는 품격도 필요하다. 그래서 나는 직장용, 모임용, 나들이용으로 나눠서 옷을 구입한다. 직장용은 저렴하면서 단정한 옷이고, 모임용은 대개 백화점에서 원피스를 산다. 휴일에 입는 나들이용은 유니클로나 갭 같은 캐주얼 브랜드가 적당하다.

한국에 있을 때는 인터넷 쇼핑으로도 옷을 많이 샀는데, 일본에서는 반품이나 환불이 귀찮고 복잡해서 인터넷에서 살 생각도 못 한다. 여름옷은 이미 지겨워져서 8월엔 다가오는 가을 옷이나 구경 갈까 한다.</p>
                                    </div>
                                  </div>
                                </div>
                              </div>
                            )}
                          </div>
                        </div>
                      </div>
                      <div className="pt-4">
                        <button type="button" onClick={() => setShowImageModal(true)} className="w-full block rounded-lg overflow-x-auto overflow-y-hidden border border-[#e5dfd4] hover:opacity-90 transition-opacity cursor-pointer md:overflow-hidden">
                          <img src="/experience-sample.png" alt="添削文・比較文・模範文" className="min-w-[800px] md:min-w-0 md:w-full h-auto" />
                        </button>
                        <p className="text-center text-gray-500 text-xs mt-1">クリックで拡大</p>
                      </div>
                      {showImageModal && (
                        <div className="fixed inset-0 z-50 flex flex-col bg-black/70" onClick={() => setShowImageModal(false)}>
                          <div className="shrink-0 flex justify-end p-2">
                            <button type="button" onClick={() => setShowImageModal(false)} className="w-10 h-10 flex items-center justify-center rounded-full bg-white/20 text-white hover:bg-white/30" aria-label="閉じる">
                              <svg className="w-6 h-6" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M6 18L18 6M6 6l12 12" /></svg>
                            </button>
                          </div>
                          <div className="flex-1 overflow-auto p-4 flex items-start justify-center min-h-0" onClick={(e) => e.stopPropagation()}>
                            <img src="/experience-sample.png" alt="添削文・比較文・模範文（拡大）" className="min-w-[800px] w-auto rounded-lg shadow-2xl" onClick={(e) => e.stopPropagation()} />
                          </div>
                        </div>
                      )}
                      <div className="pt-4 text-center">
                        <button type="button" onClick={handleTrialClick} className="inline-flex items-center justify-center min-w-[200px] px-8 py-3 bg-[#1a4d2e] hover:bg-[#2d6a4a] text-white font-medium rounded-xl shadow-md transition-colors cursor-pointer">
                          お申し込み
                        </button>
                      </div>
                      {showTrialModal && (
                        <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/50 p-4" onClick={() => setShowTrialModal(false)}>
                          <div className="bg-white rounded-xl shadow-xl w-full max-w-2xl flex flex-col max-h-[calc(100vh-2rem)] overflow-hidden" onClick={(e) => e.stopPropagation()}>
                            <div className="flex items-center justify-between gap-4 p-4 border-b border-[#e5dfd4] shrink-0">
                              <div className="flex border-b border-[#e5dfd4] flex-1">
                                <button type="button" onClick={() => setTrialActiveTab("tab1")} className={`flex-1 py-3 px-4 font-medium text-sm ${trialActiveTab === "tab1" ? "border-b-2 border-[#1a4d2e] text-[#1a4d2e]" : "text-gray-500 hover:text-gray-700"}`}>体験申込</button>
                                <button type="button" onClick={() => setTrialActiveTab("tab2")} className={`flex-1 py-3 px-4 font-medium text-sm ${trialActiveTab === "tab2" ? "border-b-2 border-[#1a4d2e] text-[#1a4d2e]" : "text-gray-500 hover:text-gray-700"}`}>講座申込</button>
                              </div>
                              <button type="button" onClick={() => setShowTrialModal(false)} className="shrink-0 p-2 text-gray-500 hover:text-gray-700 hover:bg-gray-100 rounded" aria-label="閉じる">
                                <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M6 18L18 6M6 6l12 12" /></svg>
                              </button>
                            </div>
                            {trialLoading ? (
                              <div className="flex items-center justify-center py-16 text-gray-500 flex-1">読み込み中...</div>
                            ) : (
                              <div className="flex-1 min-h-0 overflow-auto">
                                <iframe
                                  title={trialActiveTab === "tab1" ? "体験申込" : "講座申込"}
                                  srcDoc={`<!DOCTYPE html><html><head><base href="https://mirinae.jp/"/><link rel="stylesheet" href="https://mirinae.jp/css/reset.css"/><link rel="stylesheet" href="https://mirinae.jp/css/style.css"/><style>body{background:#fff!important;background-image:none!important}*{background-image:none!important}.conbox{display:block!important}</style></head><body style="padding:1rem;background:#fff">${trialActiveTab === "tab1" ? trialTab1 : trialTab2}</body></html>`}
                                  className="w-full border-0 min-h-[85vh] md:min-h-[calc(100vh-8rem)]"
                                  sandbox="allow-forms allow-same-origin"
                                />
                              </div>
                            )}
                          </div>
                        </div>
                      )}
                      <div className="pt-4 border-t border-[#e5dfd4]">
                        <div className="px-4 md:px-5 py-3 bg-[#1e3a5f] rounded-t-lg border border-b-0 border-gray-300 font-semibold text-white text-sm md:text-base">生徒の声</div>
                        <div className="border border-gray-300 rounded-b-lg overflow-hidden p-4 space-y-4 bg-white">
                          <div className="p-4 bg-[#fffde7] rounded-lg border border-[#e5dfd4]">
                            <p className="font-semibold text-gray-800 mb-2">N様 | 2019.3月</p>
                            <p className="text-gray-700 text-sm leading-relaxed">毎週韓国語で文章を作ることで、自然な韓国語の表現について考える習慣がついたように感じます。自分の言葉で文章を作る難しさも痛感しました。添削していただいた文はすごく勉強になりました。まだ復習しきれていないので、これから1つ1つの添削をじっくり復習したいと思います。ありがとうございました。</p>
                          </div>
                          <div className="p-4 bg-[#fffde7] rounded-lg border border-[#e5dfd4]">
                            <p className="font-semibold text-gray-800 mb-2">U様 | 2019.3月</p>
                            <p className="text-gray-700 text-sm leading-relaxed">大きな収穫は、やはり私の作文はただ日本語を韓国語に訳しただけのものだと痛感したことです。韓国語を意識して書いたつもりでも、どうしても日本語脳が働いてしまいます。決められた文型を使うことも難しかったですが、書き終えた時の達成感があり、楽しくトレーニングを受けることができました。ありがとうございました。模範文を繰り返し書いて、次の10回に活かします。</p>
                          </div>
                          <div className="p-4 bg-[#fffde7] rounded-lg border border-[#e5dfd4]">
                            <p className="font-semibold text-gray-800 mb-2">H様 | 2019.3月</p>
                            <p className="text-gray-700 text-sm leading-relaxed">10回のご指導をありがとうございました。最初は、決められた文型を入れて文章を作ることに時間がかかりましたが、だんだん慣れてきたとは思います。私は思った以上に、分かち書きと形容詞の한다体が間違いやすく、まだまだ慣れていかないとだめだなと感じています。ですが間違いなく、韓国語文字を入力することは、速くなりました(笑)打ち間違いが多くて変な文章内容だったりと、先生も添削に悪戦苦闘されたと思います。根気よくチェックしていただいて、本当にありがとうございました。</p>
                          </div>
                          {!expandedSeitoVoice && (
                            <button type="button" onClick={() => setExpandedSeitoVoice(true)} className="w-full py-3 text-[#1a4d2e] font-medium hover:bg-[#f5f0e6] rounded-lg border border-[#e5dfd4] transition-colors">
                              もっと読む
                            </button>
                          )}
                          {expandedSeitoVoice && (
                            <>
                          <div className="p-4 bg-[#fffde7] rounded-lg border border-[#e5dfd4]">
                            <p className="font-semibold text-gray-800 mb-2">S様 | 2018.7月~9月</p>
                            <p className="text-gray-700 text-sm leading-relaxed">10回の課題を終えて、添削していただきありがとうございました。毎週韓国語で文章を作るということは、とても意味のあることだと感じました。先生が直してくださった文と自分の文を比較することで、勉強になることがたくさんありました。普段使わないようなネイティブの表現も学ぶことができ、模範文を読むのも楽しみでした。</p>
                          </div>
                          <div className="p-4 bg-[#fffde7] rounded-lg border border-[#e5dfd4]">
                            <p className="font-semibold text-gray-800 mb-2">H様 | 2018.7月~9月</p>
                            <p className="text-gray-700 text-sm leading-relaxed">선생님 그동안 많은 도움을 받았습니다. 저는 요즘 혼자서 공부하기 때문에 특히 말하기와 쓰기가 부족합니다. 이렇게 10번의 작문에 대해 비교문,모범문까지 자세히 가르쳐 줘서 정말 감사드립니다。이대로 작문 코스를 계속하고 싶은 마음도 있는데 일단 제 작문의 잘못을 다시 공부하려고 합니다。제가 다시 작문에 도전할 때 선생님의 도움을 잘 부탁드립니다。건강에 유의하시고 매일매일 행복하시길 바랍니다 (*^^*)</p>
                          </div>
                          <div className="p-4 bg-[#fffde7] rounded-lg border border-[#e5dfd4]">
                            <p className="font-semibold text-gray-800 mb-2">N様 | 2017.1月</p>
                            <p className="text-gray-700 text-sm leading-relaxed">先生方、大変お世話になりました。翻訳の経験がなく、課題をきちんとこなせるか不安でしたが、10回の課題はあっという間に過ぎていきました。先生方に添削していただくことが日々の励みになり、終わってしまうのが少し寂しく感じました。毎回丁寧に添削していただき、新しい発見や自分の不足している点に気づくことができました。通学が難しい環境で、翻訳者を目指す者にとって学ぶ機会が少ない中、丁寧にご指導いただき感謝しております。過去の課題を復習し、一日も早く翻訳者になれるよう頑張ります。</p>
                          </div>
                          <div className="p-4 bg-[#fffde7] rounded-lg border border-[#e5dfd4]">
                            <p className="font-semibold text-gray-800 mb-2">M様 | 2016.12月</p>
                            <p className="text-gray-700 text-sm leading-relaxed">10回の課題を終えて、木曜に課題が届き、金土で内容を考え、一度手書きしてから打ち込んで月曜夜までに提出という慌ただしいスケジュールでしたが、なんとか締め切りに間に合わせて提出できました。自分の考えを表現するというより、指定された文型をどう入れるか、文字数にどう収めるかばかり考えてしまい、不慣れなタイピングもあり大変でした。提出した作文を丁寧に添削していただくだけでなく、先生が書き直してくださった文までいただけるとは思っていなかったので、とても驚きました。まだ十分に消化しきれていないので、最後の課題が終わったら、表現の違いを丁寧に抽出して確認したいと思っています。非常にコストパフォーマンスの高い講座だったと思います。</p>
                          </div>
                          <div className="p-4 bg-[#fffde7] rounded-lg border border-[#e5dfd4]">
                            <p className="font-semibold text-gray-800 mb-2">A様 | 2016.12月</p>
                            <p className="text-gray-700 text-sm leading-relaxed">10回の課題を終えて 벌써 10회가 끝났다니 시간이 지나는 것은 정말 빠르네요. 添削していただきありがとうございました。課題の内容が難しい時は、指定された文法を使って書くのは大変でしたが、いつも楽しく書くことができました。土日には作文を打ち込んで、翌日もう一度確認してから提出する習慣がつきました。忙しい日々でしたが、木曜日を楽しみに過ごしていました。一番役に立ったのは添削だけでなく比較文があったことです。自分が言いたいことをより韓国語らしく表現する力がついたように感じ、比較文を復習する時間が一番充実していました。ただ、模範文を十分に復習する時間がなかったのが残念でした。</p>
                          </div>
                          <div className="p-4 bg-[#fffde7] rounded-lg border border-[#e5dfd4]">
                            <p className="font-semibold text-gray-800 mb-2">Y様 | 2016.4月</p>
                            <p className="text-gray-700 text-sm leading-relaxed">こんにちは。先生方、お元気でいらっしゃいますか。作文添削ありがとうございました。忙しい3ヶ月でしたが、提出したらすぐに次の課題が届き、毎回丁寧に添削していただいて大変勉強になりました。첨삭 한마디をいただいて嬉しかったです。自分の考えを韓国語で書くというのは何と難しいことか…と落ち込むこともありましたが、作文は本当にいい訓練になりますね。パダスギ(ディクテーション)のように、自分ではなかなかやらないハードな訓練の機会をいただけて感謝しています。もっと韓国語を勉強して、レベルが上がったらまた挑戦したいと思います。解説のオプションも、とても詳しくかつ具体的に説明してくださってありがたかったです。プリントアウトして丁寧に読み、メモを取り、赤や青で直された部分をノートに写し、첨삭 한마디を何度も読み返しました。毎回どの先生が添削してくださったのか気になりました。去年9月の集中講座の先生でしょうか。あの集中講座は楽しかったので、次は上級クラスに参加したいです。ありがとうございました。</p>
                          </div>
                          <div className="p-4 bg-[#fffde7] rounded-lg border border-[#e5dfd4]">
                            <p className="font-semibold text-gray-800 mb-2">S様 | 2016.4月</p>
                            <p className="text-gray-700 text-sm leading-relaxed">10回作文添削、完走できて達成感を感じることができ、とても嬉しく思います。4、5回の課題は1週間しかないような気がして、書き続けるのが大変でした。添削文や模範文を十分に復習する時間がありませんでした。10年以上勉強してきて様々な先生に教えていただく機会がありましたが、分かち書きの基準が先生によって違うことが多く、混乱することがありました。作文添削を試した主な理由は、正しい分かち書きを学びたかったからです。作文IIも続けたいと思っており、この点について引き続きご指導いただければと思います。模範文は作文を書く上でとても参考になりました。今後の作文トレーニングに活かしていきたいと思います。10回の添削、ありがとうございました。</p>
                          </div>
                          <div className="p-4 bg-[#fffde7] rounded-lg border border-[#e5dfd4]">
                            <p className="font-semibold text-gray-800 mb-2">H様 | 2016.4月</p>
                            <p className="text-gray-700 text-sm leading-relaxed">作文を添削していただきまして有難うございました。10回の提出は、大変でした。1つの作文をじっくり復習する時間がないうちに、次の作文を書かなければならない状況でした。文法をどれをどのようにつかうのか未だにわかりませんが、溜まった添削文をゆっくり復習していきたいと思います。単発でも作文添削を受けてくださるといいと思います。あまりにひどい作文をよく読んで添削してくださいまして有難うございました。また機会があればお願いします。</p>
                          </div>
                          <div className="p-4 bg-[#fffde7] rounded-lg border border-[#e5dfd4]">
                            <p className="font-semibold text-gray-800 mb-2">E様 | 2016.3月</p>
                            <p className="text-gray-700 text-sm leading-relaxed">10回の作文添削、本当にありがとうございました。今まで、誰かの書いた文章を翻訳するという事はありましたが、自分で文章を書くという経験があまりなかったので、いい機会だと思い受講しました。まず、「自分で文章を書く」という事の難しさ、大変さを痛感しました。限られた字数の中で起承転結をまとめ、さらにいかに自然な韓国語で表現するか･･･これは本当に難しい作業でした。500字というのも、自分が思うより沢山書かなければ埋まらない字数だとわかりました。また、添削して頂いた事によって、自分がきちんと理解できていなかった部分、勘違いしていた部分等が見えたのは何より良かったと思います。ネイティブが使う自然な表現に直して頂いた事も、本当に助けになりました。トレーニングIIでも、さらに多くの事を学んで、もっと自然な表現に近づけるように頑張っていきたいと思っております。今後ともよろしくお願い致します。※受講料も大変ありがたい価格設定でした。何万円･･･という受講料では、受講したくてもできませんでしたので･･･。感謝しております!!</p>
                          </div>
                          <div className="p-4 bg-[#fffde7] rounded-lg border border-[#e5dfd4]">
                            <p className="font-semibold text-gray-800 mb-2">H様 | 2016.3月</p>
                            <p className="text-gray-700 text-sm leading-relaxed">添削指導ありがとうございました。10回の課題提出は、正直なところ苦しかったです(苦;)毎回のテーマは簡単なのですが、指定した文型を使わなければならないところが難しかったです。このことで、文章の構成と使う単語などの訓練ができたと思います。また、丁寧な添削指導で、「韓国語らしい」表現を教えていただいています。まだまだレベルの低い内容でしか書けませんが、なんだか面白く思えてきたので、新コースにも挑戦してみようと思っています。今度は誤打が無いように、気を付けます。</p>
                          </div>
                          <div className="p-4 bg-[#fffde7] rounded-lg border border-[#e5dfd4]">
                            <p className="font-semibold text-gray-800 mb-2">A様 | 2016.3月</p>
                            <p className="text-gray-700 text-sm leading-relaxed">私はこの4月に受験予定のTOPIK試験対策としてこのコースを受講しました。前回の試験で5級に合格しましたが、作文が苦手で、いつも点数が悪くて悩んでいました。今回この作文の添削を受けてみて、毎週決まった文字数の文章を書くというのが思いのほか時間がかかって難しいことが分かり、毎日少しずつでも書く練習をするのが大事なんだと改めて感じました。それに、思った以上に誤字や分かち書きの間違いが多かったので、試験では必ず見直しをする時間を作ろうと思いました。今回の添削は、文字数が300から500字だったのですが、上級では700字くらいの作文が必要なので、コースの選択ができればよいかなと思いました。</p>
                          </div>
                          <div className="p-4 bg-[#fffde7] rounded-lg border border-[#e5dfd4]">
                            <p className="font-semibold text-gray-800 mb-2">U様 | 2016.3月</p>
                            <p className="text-gray-700 text-sm leading-relaxed">3ヶ月間のご指導ありがとうございました。仕事が忙しく、添削していただいた課題を復習する時間をなかなか作れませんでした。副詞の使い方や辞書の選び方に悩み、深く考えすぎると何も書けなくなってしまうこともありました。語彙力や文末表現の不足で、初級レベルの作文に間違いだらけで恥ずかしい思いをしました。TOPIKの作文は、制限時間内に大量に書かなければならず特に大変でした。繰り返し練習すればもっと書けるようになると思います。緊張するとテーマが浮かばないこともあるので、作文は一人ではできないので、このような講座を続けて練習したいと思います。これからもよろしくお願いいたします。</p>
                          </div>
                            <button type="button" onClick={() => setExpandedSeitoVoice(false)} className="w-full py-3 text-[#1a4d2e] font-medium hover:bg-[#f5f0e6] rounded-lg border border-[#e5dfd4] transition-colors">
                              閉じる
                            </button>
                            </>
                          )}
                        </div>
                      </div>
                    </div>
                  </div>
                </div>
              )}

              {activeTab === "writing" && (
                <div className="px-4 md:px-0 mx-auto max-w-2xl w-full">
                  <div className="rounded-xl border border-[#e5dfd4] p-4 md:p-6 bg-white shadow-sm">
                  <div className="md:hidden mb-4">
                    <div className="bg-white rounded-xl border border-[#e5dfd4] shadow-sm p-4">
                      <h2 className="font-semibold text-gray-800 mb-2 text-sm">課題提出</h2>
                      <button onClick={handleSubmitClick} className="w-full py-3 px-4 bg-[#1a4d2e] hover:bg-[#2d6a4a] text-white font-medium rounded-lg">
                        課題提出ボタン
                      </button>
                    </div>
                  </div>

                  <div className="mb-6 md:mb-8">
                    <h2 className="text-lg md:text-xl font-bold text-gray-800 mb-4">課題例掲示板</h2>
                    <div className="bg-white rounded-xl border border-[#e5dfd4] shadow-sm overflow-hidden">
                      <div className="px-4 md:px-5 py-3 bg-[#faf8f5] border-b border-[#e5dfd4] font-semibold text-gray-800 text-sm md:text-base">課題例（10件）</div>
                      <div className="divide-y divide-[#e5dfd4]">
                        {ASSIGNMENT_EXAMPLES.map((ex) => (
                          <div key={ex.id}>
                            <button type="button" onClick={() => setExpandedExampleId(expandedExampleId === ex.id ? null : ex.id)} className="w-full px-4 md:px-5 py-3 hover:bg-[#faf8f5] flex flex-col sm:flex-row sm:items-center sm:justify-between gap-2 text-left">
                              <div className="flex items-center gap-3">
                                <span className="text-gray-500 text-xs w-4 inline-block">{expandedExampleId === ex.id ? "▼" : "▶"}</span>
                                <span className="font-medium text-gray-800">{ex.title}</span>
                              </div>
                              <p className="text-gray-600 text-sm pl-9 sm:pl-0 sm:max-w-md">{ex.topic}</p>
                            </button>
                            {expandedExampleId === ex.id && ex.modelContent && (
                              <div className="px-4 md:px-5 pb-4 pt-0 border-t border-[#e5dfd4] bg-[#fafbfc]">
                                <div className="mt-3 flex flex-col gap-3">
                                  <div className="p-4 rounded-xl bg-white border border-[#e5dfd4] text-sm space-y-4">
                                    {ex.modelContent.courseInfo && <p className="text-gray-600 font-medium">{ex.modelContent.courseInfo}：　テーマ： {ex.modelContent.theme}</p>}
                                    {!ex.modelContent.courseInfo && <p className="text-gray-600 font-medium">テーマ：{ex.modelContent.theme}</p>}
                                    <p className="text-gray-800 leading-relaxed">{ex.modelContent.question}</p>
                                    {ex.modelContent.grammarNote && <p className="text-gray-600 font-medium">{ex.modelContent.grammarNote}</p>}
                                    <div className="space-y-2 pt-2">
                                      {ex.modelContent.patterns.map((p, i) => (
                                        <div key={i} className="text-gray-700">
                                          <p className="font-medium text-gray-800">○ {p.pattern}</p>
                                          <p className="text-gray-600 pl-2">{p.example}</p>
                                        </div>
                                      ))}
                                    </div>
                                  </div>
                                  <button onClick={handleExampleSubmitClick} className="w-full py-3 px-6 bg-[#1a4d2e] hover:bg-[#2d6a4a] text-white font-medium rounded-xl shadow-md">
                                    課題提出
                                  </button>
                                </div>
                              </div>
                            )}
                          </div>
                        ))}
                      </div>
                    </div>
                  </div>

                  <h2 className="text-lg md:text-xl font-bold text-gray-800 mb-4 md:mb-6">投稿リスト</h2>

                  <div className="space-y-4 md:space-y-6">
                    {sortedDateRanges.map((dateRange) => (
                      <div key={dateRange} className="bg-white rounded-xl border border-[#e5dfd4] shadow-sm overflow-hidden">
                        <div className="px-4 md:px-5 py-3 bg-[#faf8f5] border-b border-[#e5dfd4] font-semibold text-gray-800 text-sm md:text-base">{dateRange}</div>
                        <div className="hidden md:block overflow-x-auto">
                          <table className="w-full">
                            <thead>
                              <tr className="bg-[#f5f0e6] text-gray-700 text-sm">
                                <th className="text-left py-3 px-4 font-medium">課題</th>
                                <th className="text-left py-3 px-4 font-medium">課題提出</th>
                                <th className="text-left py-3 px-4 font-medium">添削</th>
                                <th className="text-left py-3 px-4 font-medium">学生を見る</th>
                              </tr>
                            </thead>
                            <tbody>
                              {groupedByDate[dateRange].map((a) => (
                                <tr key={a.id} className="border-t border-[#e5dfd4] hover:bg-[#faf8f5]">
                                  <td className="py-3 px-4"><span className="font-medium text-gray-800">{a.title}</span></td>
                                  <td className="py-3 px-4">
                                    {a.status === "미제출" ? (
                                      <button onClick={() => handleSubmitAssignment(a)} className="text-[#c53030] hover:text-[#9b2c2c] font-medium underline">未提出</button>
                                    ) : (
                                      <span className="text-[#2d7d46] font-medium">{a.status === "제출완료" ? "提出完了" : a.status === "첨삭완료" ? "添削完了" : a.status}</span>
                                    )}
                                  </td>
                                  <td className="py-3 px-4">
                                    {a.correction === "-" ? <span className="text-gray-400">-</span> : a.status === "첨삭완료" ? (
                                      <button onClick={() => handleOpenFeedback(a)} className="text-[#1a4d2e] hover:underline font-medium">確認</button>
                                    ) : (
                                      <button onClick={() => handleOpenFeedback(a)} className="text-[#1a4d2e] hover:underline">{a.correction === "완료" ? "完了" : a.correction === "확인" ? "確認" : a.correction}</button>
                                    )}
                                  </td>
                                  <td className="py-3 px-4">
                                    {a.content ? <button onClick={() => handleViewStudent(a)} className="text-[#1a4d2e] hover:underline">学生を見る</button> : <span className="text-gray-400">-</span>}
                                  </td>
                                </tr>
                              ))}
                            </tbody>
                          </table>
                        </div>
                        <div className="md:hidden divide-y divide-[#e5dfd4]">
                          {groupedByDate[dateRange].map((a) => (
                            <div key={a.id} className="p-4 space-y-2">
                              <div className="flex justify-between items-center">
                                <span className="font-medium text-gray-800">{a.title}</span>
                                {a.status === "미제출" ? <button onClick={() => handleSubmitAssignment(a)} className="text-sm text-[#c53030] font-medium underline">未提出</button> : <span className="text-sm text-[#2d7d46] font-medium">{a.status === "제출완료" ? "提出完了" : a.status === "첨삭완료" ? "添削完了" : a.status}</span>}
                              </div>
                              <div className="flex flex-wrap gap-3 text-sm">
                                {a.content && <button onClick={() => handleOpenFeedback(a)} className="text-[#1a4d2e] hover:underline">{a.correction === "-" ? "添削する" : "添削確認"}</button>}
                                {a.content && <button onClick={() => handleViewStudent(a)} className="text-[#1a4d2e] hover:underline">学生を見る</button>}
                                {!a.content && <span className="text-gray-400">添削: -</span>}
                              </div>
                            </div>
                          ))}
                        </div>
                      </div>
                    ))}
                  </div>
                  </div>
                </div>
              )}

              {activeTab === "topik" && (
                <div className="px-4 md:px-0 mx-auto max-w-2xl w-full">
                  <div className="rounded-xl border border-[#e5dfd4] p-4 md:p-6 bg-white shadow-sm">
                    <h2 className="text-lg md:text-xl font-bold text-gray-800 mb-4">TOPIK作文トレーニング</h2>
                    <p className="text-gray-600">TOPIK作文トレーニングのコンテンツはこちらに表示されます。</p>
                    <p className="text-gray-500 text-sm mt-2">準備中です。</p>
                  </div>
                </div>
              )}
            </div>
          </main>
        </div>
      </div>

      {showExampleSubmitModal && selectedExample?.modelContent && (
        <div className="fixed inset-0 bg-black/50 flex items-center justify-center z-50 p-4">
          <div className="bg-white rounded-2xl shadow-xl max-w-2xl w-full max-h-[90vh] overflow-hidden flex flex-col">
            <div className="relative px-4 sm:px-6 py-4 shrink-0 border-b border-gray-200">
              <h3 className="text-lg font-bold text-gray-800 text-center pr-14">課題提出 - {selectedExample.title}</h3>
              <button onClick={handleCloseExampleSubmitModal} className="absolute right-4 top-4 text-gray-500 hover:text-gray-700 font-medium shrink-0">취소</button>
            </div>
            <div className="flex-1 overflow-y-auto p-4 sm:p-6 space-y-4">
              <div className="p-4 rounded-xl bg-[#faf8f5] border border-[#e5dfd4] text-sm space-y-3">
                {selectedExample.modelContent.courseInfo && <p className="text-gray-600 font-medium">{selectedExample.modelContent.courseInfo}：　テーマ： {selectedExample.modelContent.theme}</p>}
                {!selectedExample.modelContent.courseInfo && <p className="text-gray-600 font-medium">テーマ：{selectedExample.modelContent.theme}</p>}
                <p className="text-gray-800 leading-relaxed">{selectedExample.modelContent.question}</p>
                {selectedExample.modelContent.grammarNote && <p className="text-gray-600 font-medium">{selectedExample.modelContent.grammarNote}</p>}
                <div className="space-y-2 pt-2">
                  {selectedExample.modelContent.patterns.map((p, i) => (
                    <div key={i} className="text-gray-700">
                      <p className="font-medium text-gray-800">○ {p.pattern}</p>
                      <p className="text-gray-600 pl-2">{p.example}</p>
                    </div>
                  ))}
                </div>
              </div>
              <div className="border-t-2 border-dashed border-[#e5dfd4]" />
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-2">작문 내용</label>
                <textarea value={exampleSubmitContent} onChange={(e) => setExampleSubmitContent(e.target.value)} placeholder="여기에 글을 입력해 주세요..." className="w-full min-h-[200px] p-4 border border-gray-200 rounded-xl resize-y focus:ring-2 focus:ring-[#1a4d2e] focus:border-transparent" autoFocus />
              </div>
            </div>
            <div className="px-4 sm:px-6 py-4 flex justify-end shrink-0 border-t border-gray-200">
              <button
                onClick={() => {
                  const targetId = assignments.find((x) => x.status === "미제출")?.id;
                  if (targetId) {
                    const updated = assignments.map((a) =>
                      a.id === targetId ? { ...a, status: "제출완료" as AssignmentStatus, content: exampleSubmitContent, submittedAt: new Date().toISOString() } : a
                    );
                    setAssignments(updated);
                    saveAssignments(updated);
                  }
                  handleCloseExampleSubmitModal();
                }}
                disabled={!exampleSubmitContent.trim()}
                className="px-6 py-2.5 bg-[#86efac] hover:bg-[#4ade80] disabled:opacity-50 text-gray-800 font-medium rounded-xl"
              >
                提出する
              </button>
            </div>
          </div>
        </div>
      )}

      {showSubmitModal && (
        <div className="fixed inset-0 bg-black/50 flex items-center justify-center z-50 p-3 sm:p-4">
          <div className="bg-white rounded-2xl shadow-xl max-w-lg w-full max-h-[90vh] overflow-hidden flex flex-col">
            <div className="relative px-4 sm:px-6 py-4 shrink-0">
              <h3 className="text-lg font-bold text-gray-800 text-center pr-14">새로운 스레드</h3>
              <button onClick={handleCloseSubmitModal} className="absolute right-4 top-4 text-gray-500 hover:text-gray-700 font-medium shrink-0">취소</button>
            </div>
            <div className="px-4 sm:px-6 pb-6 flex-1 overflow-y-auto space-y-4">
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-2">학생 선택</label>
                <select value={selectedStudentId} onChange={(e) => setSelectedStudentId(e.target.value)} className="w-full px-4 py-2.5 border border-gray-200 rounded-xl focus:ring-2 focus:ring-[#1a4d2e] focus:border-transparent bg-white">
                  <option value="">선택하세요</option>
                  {MOCK_STUDENTS.map((s) => (
                    <option key={s.id} value={s.id}>{s.name}</option>
                  ))}
                </select>
              </div>
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-2">課題選択</label>
                <select value={selectedAssignmentId} onChange={(e) => setSelectedAssignmentId(e.target.value)} className="w-full px-4 py-2.5 border border-gray-200 rounded-xl focus:ring-2 focus:ring-[#1a4d2e] focus:border-transparent bg-white">
                  <option value="">선택하세요</option>
                  {assignments.map((a) => (
                    <option key={a.id} value={a.id}>{a.title} ({a.dateRange})</option>
                  ))}
                </select>
              </div>
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-2">課題内容</label>
                <textarea value={submitContent} onChange={(e) => setSubmitContent(e.target.value)} placeholder="새로운 소식이 있나요?" className="w-full h-40 p-4 border border-gray-200 rounded-xl resize-y focus:ring-2 focus:ring-[#1a4d2e] focus:border-transparent" autoFocus />
              </div>
            </div>
            <div className="px-4 sm:px-6 py-4 flex justify-end shrink-0">
              <button onClick={handleConfirmSubmit} disabled={!submitContent.trim() || submitLoading} className="px-6 py-2.5 bg-[#86efac] hover:bg-[#4ade80] disabled:opacity-50 text-gray-800 font-medium rounded-xl transition-colors">
                {submitLoading ? "提出中..." : "投稿"}
              </button>
            </div>
          </div>
        </div>
      )}

      {viewingStudent && (
        <div className="fixed inset-0 bg-black/50 flex items-center justify-center z-50 p-4">
          <div className="bg-white rounded-2xl shadow-xl max-w-2xl w-full max-h-[90vh] overflow-hidden flex flex-col">
            <div className="px-6 py-4 border-b border-gray-200 flex justify-between items-center shrink-0">
              <h3 className="text-lg font-bold text-gray-800">学生を見る - {viewingStudent.title}</h3>
              <button onClick={() => setViewingStudent(null)} className="text-gray-500 hover:text-gray-700 text-2xl leading-none">×</button>
            </div>
            <div className="px-4 py-2 border-b border-gray-200 flex flex-wrap gap-2 shrink-0 bg-gray-50">
              <button type="button" onClick={() => applyFormat("strikeThrough")} className="px-3 py-1.5 text-sm border border-gray-300 rounded-lg hover:bg-gray-200" title="가운데 선">S̶</button>
              <button type="button" onClick={() => applyFormat("foreColor", "#dc2626")} className="px-3 py-1.5 text-sm border border-gray-300 rounded-lg hover:bg-gray-200 text-red-600" title="빨간색">A</button>
              <button type="button" onClick={() => applyFormat("foreColor", "#2563eb")} className="px-3 py-1.5 text-sm border border-gray-300 rounded-lg hover:bg-gray-200 text-blue-600" title="파란색">A</button>
              <button type="button" onClick={() => applyFormat("underline")} className="px-3 py-1.5 text-sm border border-gray-300 rounded-lg hover:bg-gray-200 underline" title="밑줄">U</button>
              <button type="button" onClick={() => applyFormat("removeFormat")} className="px-3 py-1.5 text-sm border border-gray-300 rounded-lg hover:bg-gray-200 text-gray-500" title="포맷 제거">✕</button>
            </div>
            <div className="p-6 flex-1 overflow-y-auto">
              <div ref={editorRef} contentEditable suppressContentEditableWarning className="min-h-[200px] p-4 border border-gray-200 rounded-xl focus:ring-2 focus:ring-[#1a4d2e] focus:border-transparent outline-none text-gray-800 leading-relaxed" />
              {viewingStudent.feedback && (
                <div className="mt-4 p-4 bg-[#f0fdf4] rounded-xl border border-[#86efac]">
                  <h4 className="font-semibold text-[#166534] mb-2">添削フィードバック</h4>
                  <p className="whitespace-pre-wrap text-gray-700">{viewingStudent.feedback}</p>
                </div>
              )}
            </div>
            <div className="px-6 py-4 border-t border-gray-200 flex justify-end gap-2 shrink-0">
              <button onClick={() => setViewingStudent(null)} className="px-4 py-2 text-gray-600 hover:bg-gray-100 rounded-lg">취소</button>
              <button onClick={handleSaveCorrectedContent} className="px-5 py-2 bg-[#1a4d2e] hover:bg-[#2d6a4a] text-white font-medium rounded-lg">添削保存</button>
            </div>
          </div>
        </div>
      )}

      {feedbackModal && (
        <div className="fixed inset-0 bg-black/50 flex items-center justify-center z-50 p-4">
          <div className="bg-white rounded-2xl shadow-xl max-w-lg w-full max-h-[90vh] overflow-hidden flex flex-col">
            <div className="px-6 py-4 border-b border-gray-200 flex justify-between items-center">
              <h3 className="text-lg font-bold text-gray-800">添削 - {feedbackModal.title}</h3>
              <button onClick={() => { setFeedbackModal(null); setTeacherFeedback(""); }} className="text-gray-500 hover:text-gray-700 text-2xl leading-none">×</button>
            </div>
            <div className="p-6 flex-1 overflow-y-auto space-y-4">
              {feedbackModal.content && (
                <div>
                  <h4 className="font-semibold text-gray-700 mb-2">学生提出内容</h4>
                  <p className="whitespace-pre-wrap text-gray-600 bg-gray-50 p-4 rounded-lg">{feedbackModal.content}</p>
                </div>
              )}
              <div>
                <label className="block font-semibold text-gray-700 mb-2">添削フィードバック</label>
                <textarea value={teacherFeedback} onChange={(e) => setTeacherFeedback(e.target.value)} placeholder="添削内容を入力してください..." className="w-full h-32 p-4 border border-gray-200 rounded-xl resize-none focus:ring-2 focus:ring-[#1a4d2e] focus:border-transparent" />
              </div>
            </div>
            <div className="px-6 py-4 border-t border-gray-200 flex justify-end">
              <button onClick={handleSaveFeedback} className="px-5 py-2 bg-[#1a4d2e] hover:bg-[#2d6a4a] text-white font-medium rounded-lg">저장</button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}
