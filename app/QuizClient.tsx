"use client";

import { useState, useEffect, useRef } from "react";
import { QUIZZES } from "./quiz-data";

const BLANK = "_________________________";

function formatJapanese(s: string) {
  const stripped = (s || "").replace(/[「」]/g, "").trim();
  if (!stripped) return stripped;
  const lastChar = stripped.slice(-1);
  if (/[。.?？!！]/.test(lastChar)) return stripped;
  return stripped + "。";
}

function getOptionNumber(id: number) {
  return ["❶", "❷", "❸", "❹"][id - 1] || "❶";
}

export default function QuizClient() {
  const [currentIndex, setCurrentIndex] = useState(0);
  const [selectedAnswer, setSelectedAnswer] = useState<number | null>(null);
  const [showResult, setShowResult] = useState(false);
  const [correctCount, setCorrectCount] = useState(0);
  const [overrides, setOverrides] = useState<
    Record<number, { explanation?: string; japanese?: string; options?: { id: number; text: string }[] }>
  >({});
  const [isLoggedIn, setIsLoggedIn] = useState(false);
  const [blankWidth, setBlankWidth] = useState<number | null>(null);
  const japaneseRef = useRef<HTMLDivElement>(null);

  const quiz = QUIZZES[currentIndex];
  const ov = overrides[quiz.id];
  const explanation =
    (typeof ov === "string" ? ov : ov?.explanation) ?? quiz.explanation;
  const japanese = (typeof ov === "object" && ov?.japanese != null ? ov.japanese : null) ?? quiz.japanese;
  const options = (typeof ov === "object" && ov?.options != null ? ov.options : null) ?? quiz.options;

  useEffect(() => {
    const token = typeof window !== "undefined" ? localStorage.getItem("quiz_token") : null;
    setIsLoggedIn(!!token);
  }, []);

  useEffect(() => {
    const el = japaneseRef.current;
    if (!el) return;
    const span = el.querySelector(".measure-span") as HTMLElement;
    if (!span) return;
    const measure = () => setBlankWidth(span.offsetWidth);
    measure();
    const ro = new ResizeObserver(measure);
    ro.observe(el);
    return () => ro.disconnect();
  }, [japanese]);

  useEffect(() => {
    fetch("/api/explanations")
      .then((r) => r.json())
      .then((data) => setOverrides(data.overrides || {}))
      .catch(() => {});
  }, []);
  const total = QUIZZES.length;
  const isComplete = currentIndex >= total - 1 && showResult;
  const answeredCount = showResult ? currentIndex + 1 : 0;
  const accuracyRate = showResult && answeredCount > 0
    ? Math.round((correctCount / answeredCount) * 100)
    : null;

  const formatExplanation = (text: string) =>
    (text || "")
      .replace(/\\n/g, "\n")
      .replace(/(?<!、)([❶❷❸❹])/g, "\n$1")
      .replace(/\n{2,}/g, "\n")
      .replace(/^\n+/, "");

  const handleSelect = (optionId: number) => {
    if (showResult) return;
    setSelectedAnswer(optionId);
    setShowResult(true);
    if (optionId === quiz.correctAnswer) {
      setCorrectCount((c) => c + 1);
    }
  };

  const handleNext = () => {
    if (currentIndex < total - 1) {
      setCurrentIndex((i) => i + 1);
      setSelectedAnswer(null);
      setShowResult(false);
    }
  };

  return (
    <div className="app-wrapper">
      <div className="quiz-container">
        <header className="quiz-header">
          <div className="flex justify-between items-start gap-4">
            <h1 className="shrink-0 whitespace-nowrap">クイズで学ぶ韓国語</h1>
            {isLoggedIn ? (
              <div className="flex shrink-0 flex-col items-end gap-1.5">
                <div className="flex items-center gap-2">
                  <a
                    href="/profile"
                    className="text-white/95 text-sm hover:underline whitespace-nowrap"
                  >
                    マイページ
                  </a>
                  <span className="text-white/95 text-sm whitespace-nowrap">ログイン中</span>
                </div>
                <button
                  type="button"
                  onClick={() => {
                    localStorage.removeItem("quiz_token");
                    localStorage.removeItem("quiz_user");
                    setIsLoggedIn(false);
                  }}
                  className="text-white/90 text-sm hover:underline hover:text-white"
                >
                  ログアウト
                </button>
              </div>
            ) : (
              <a
                href="/login"
                className="shrink-0 text-white/90 text-sm hover:underline"
              >
                ログイン
              </a>
            )}
          </div>
          <div className="quiz-meta">
            <span className="quiz-counter">
              {currentIndex + 1} / {total}
            </span>
            {accuracyRate !== null && (
              <span className="quiz-accuracy">正解率 {accuracyRate}%</span>
            )}
          </div>
        </header>

        <main className="quiz-main">
          <p className="quiz-instruction">{quiz.question}</p>
          <div ref={japaneseRef} className="quiz-sentence quiz-japanese" style={{ position: "relative" }}>
            {formatJapanese(japanese)}
            <span
              className="measure-span"
              aria-hidden
              style={{
                position: "absolute",
                left: -9999,
                whiteSpace: "nowrap",
                visibility: "hidden",
                pointerEvents: "none",
              }}
            >
              {formatJapanese(japanese)}
            </span>
          </div>
          <div className="quiz-sentence quiz-korean">
            {quiz.koreanTemplate.split(BLANK).map((part, i) => (
              <span key={i}>
                {part}
                {i === 0 && (
                  <span
                    className="blank"
                    style={blankWidth != null ? { width: blankWidth, minWidth: blankWidth } : undefined}
                  />
                )}
              </span>
            ))}
          </div>

          <div className="quiz-options">
            {options.map((option) => {
              const isSelected = selectedAnswer === option.id;
              const isCorrect = option.id === quiz.correctAnswer;
              const showCorrectness = showResult && (isSelected || isCorrect);
              const showMark = showCorrectness && (isCorrect || (isSelected && !isCorrect));

              return (
                <button
                  key={option.id}
                  className={`quiz-option ${showCorrectness ? "revealed" : ""} ${
                    showCorrectness && isCorrect ? "correct" : ""
                  } ${showCorrectness && isSelected && !isCorrect ? "wrong" : ""}`}
                  onClick={() => handleSelect(option.id)}
                  disabled={showResult}
                >
                  <span className="option-number">{getOptionNumber(option.id)}</span>
                  <span className="option-text">{option.text}</span>
                  {showMark && (
                    <span className="option-mark" aria-hidden>
                      {isCorrect ? "⭕" : "❌"}
                    </span>
                  )}
                </button>
              );
            })}
          </div>

          {showResult && (
            <div className="quiz-result">
              <div
                className={`result-badge ${
                  selectedAnswer === quiz.correctAnswer ? "correct" : "wrong"
                }`}
              >
                {selectedAnswer === quiz.correctAnswer ? "正解！" : "不正解"}
              </div>
              <div className="result-explanation">
                <p style={{ whiteSpace: "pre-line" }}>{formatExplanation(explanation)}</p>
                {quiz.vocabulary && quiz.vocabulary.length > 0 && (
                  <div className="vocabulary-list">
                    {quiz.vocabulary.map((v, i) => (
                      <div key={i} className="vocab-item">
                        <strong>{v}</strong>
                      </div>
                    ))}
                  </div>
                )}
              </div>
              {currentIndex < total - 1 && (
                <div className="result-actions">
                  <button className="btn-primary" onClick={handleNext}>
                    次の問題へ
                  </button>
                </div>
              )}
            </div>
          )}
        </main>

        <footer className="quiz-footer">
          <div className="progress-bar">
            <div
              className="progress-fill"
              style={{ width: `${((currentIndex + (showResult ? 1 : 0)) / total) * 100}%` }}
            />
          </div>
        </footer>
      </div>
    </div>
  );
}
