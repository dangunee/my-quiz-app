import QuizClient from "../QuizClient";
import { getKotaeListWithContents } from "@/lib/qna-data";
import { buildFaqSchema } from "@/lib/faq-schema";
import { optimizeImagesInHtml } from "@/lib/html-utils";

export const revalidate = 60; // ISR: 1분마다 재생성

export default async function QnaPage() {
  const { list, contents } = await getKotaeListWithContents(20);

  // SEO: FAQ 스키마 (구글 검색 결과에 Q&A 직접 노출)
  const faqItems = contents.map((c) => ({
    question: c.title,
    answer: c.html,
  }));
  const faqSchema = buildFaqSchema(faqItems);

  // 이미지 최적화 (lazy loading)
  const contentsOptimized = contents.map((c) => ({
    ...c,
    html: optimizeImagesInHtml(c.html),
  }));

  return (
    <>
      <script
        type="application/ld+json"
        dangerouslySetInnerHTML={{ __html: JSON.stringify(faqSchema) }}
      />
      <QuizClient
        initialShowLanding={false}
        initialTab="qna"
        initialKotaeList={list}
        initialKotaeContents={contentsOptimized}
      />
    </>
  );
}
