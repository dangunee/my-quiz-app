"use client";

import { useState } from "react";
import { quizData } from "./quiz-data";

export default function QuizClient() {
  const [currentIndex, setCurrentIndex] = useState(0);
  const [selectedAnswer, setSelectedAnswer] = useState<number | null>(null);
  const [showResult, setShowResult] = useState(false);
  const [streak, setStreak] = useState(0);

  const quiz = quizData[currentIndex];
  const isLastQuiz = currentIndex === quizData.length - 1;

  const handleSelect = (optionId: number) => {
    if (showResult) return;
    setSelectedAnswer(optionId);
    setShowResult(true);
    if (optionId === quiz.correctAnswer) {
      setStreak((s) => s + 1);
    } else {
      setStreak(0);
    }
  };

  const handleNext = () => {
    if (!isLastQuiz) {
      setCurrentIndex((i) => i + 1);
      setSelectedAnswer(null);
      setShowResult(false);
    }
  };

  const handleRestart = () => {
    setCurrentIndex(0);
    setSelectedAnswer(null);
    setShowResult(false);
    setStreak(0);
  };

  const getOptionNumber = (id: number) => ["❶", "❷", "❸", "❹"][id - 1];

  // ❶❷❸❹ 앞에 줄바꿈 추가
  const formatExplanation = (text: string) =>
    (text || "").replace(/([❶❷❸❹])/g, "\n$1").replace(/^\n+/, "");

  return (
    <div className="quiz-container">
      <header className="quiz-header">
        <h1>クイズで学ぶ韓国語</h1>
        <div className="quiz-meta">
          <span className="quiz-counter">
            {currentIndex + 1} / {quizData.length}
          </span>
          {streak > 0 && (
            <span className="quiz-streak">🔥 {streak}問連続正解</span>
          )}
        </div>
      </header>

      <main className="quiz-main">
        <p className="quiz-instruction">{quiz.question}</p>
        <div className="quiz-sentence quiz-japanese">{quiz.japanese}</div>
        <div className="quiz-sentence quiz-korean">
          {quiz.koreanTemplate.split("_________________________").map((part, i) => (
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
                      <strong>{v.word}</strong> {v.meaning}
                    </div>
                  ))}
                </div>
              )}
            </div>
            <div className="result-actions">
              {isLastQuiz ? (
                <button className="btn-primary" onClick={handleRestart}>
                  最初からやり直す
                </button>
              ) : (
                <button className="btn-primary" onClick={handleNext}>
                  次の問題へ
                </button>
              )}
            </div>
          </div>
        )}
      </main>

      <footer className="quiz-footer">
        <div className="progress-bar">
          <div
            className="progress-fill"
            style={{ width: `${((currentIndex + 1) / quizData.length) * 100}%` }}
          />
        </div>
      </footer>
    </div>
  );
}
