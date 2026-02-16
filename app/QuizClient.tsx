"use client";

import { useState } from "react";
import { QUIZZES } from "./quiz-data";

const BLANK = "_________________________";

function getOptionNumber(id: number) {
  return ["❶", "❷", "❸", "❹"][id - 1] || "❶";
}

export default function QuizClient() {
  const [currentIndex, setCurrentIndex] = useState(0);
  const [selectedAnswer, setSelectedAnswer] = useState<number | null>(null);
  const [showResult, setShowResult] = useState(false);
  const [correctCount, setCorrectCount] = useState(0);

  const quiz = QUIZZES[currentIndex];
  const total = QUIZZES.length;
  const isComplete = currentIndex >= total - 1 && showResult;
  const accuracyRate = isComplete ? Math.round((correctCount / total) * 100) : null;

  const formatExplanation = (text: string) =>
    (text || "")
      .replace(/\\n/g, "\n")
      .replace(/([❶❷❸❹])/g, "\n$1")
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
          <h1>クイズで学ぶ韓国語</h1>
          <div className="quiz-meta">
            <span className="quiz-counter">
              {currentIndex + 1} / {total}
            </span>
            {isComplete && accuracyRate !== null && (
              <span className="quiz-accuracy">정답률 {accuracyRate}%</span>
            )}
          </div>
        </header>

        <main className="quiz-main">
          <p className="quiz-instruction">{quiz.question}</p>
          <div className="quiz-sentence quiz-japanese">{quiz.japanese}</div>
          <div className="quiz-sentence quiz-korean">
            {quiz.koreanTemplate.split(BLANK).map((part, i) => (
              <span key={i}>
                {part}
                {i === 0 && <span className="blank" />}
              </span>
            ))}
          </div>

          <div className="quiz-options">
            {quiz.options.map((option) => {
              const isSelected = selectedAnswer === option.id;
              const isCorrect = option.id === quiz.correctAnswer;
              const showCorrectness = showResult && (isSelected || isCorrect);

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
                <p style={{ whiteSpace: "pre-line" }}>{formatExplanation(quiz.explanation)}</p>
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
