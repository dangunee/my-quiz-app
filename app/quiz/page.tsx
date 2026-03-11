import { redirect } from "next/navigation";
import QuizClient from "../QuizClient";

interface PageProps {
  searchParams: Promise<{ tab?: string }>;
}

export default async function QuizPage({ searchParams }: PageProps) {
  const { tab } = await searchParams;
  // 생활한국어 탭은 ISR 페이지로 리다이렉트
  if (tab === "dailylife") redirect("/dailylife");
  return <QuizClient initialShowLanding={false} />;
}
