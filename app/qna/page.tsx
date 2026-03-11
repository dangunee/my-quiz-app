import QuizClient from "../QuizClient";

export default function QnaPage() {
  return (
    <QuizClient
      initialShowLanding={false}
      initialTab="qna"
    />
  );
}
