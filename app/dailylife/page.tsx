import QuizClient from "../QuizClient";
import { getSeikatsuListWithContents } from "@/lib/qna-data";
import { buildFaqSchema } from "@/lib/faq-schema";
import { optimizeImagesInHtml } from "@/lib/html-utils";

export const revalidate = 60; // ISR: 1분마다 재생성

export default async function DailyLifePage() {
  const { list, contents } = await getSeikatsuListWithContents(20);

  const titles = list.map((i) => i.title);
  const contentsOptimized = contents.map((c) => ({
    ...c,
    html: optimizeImagesInHtml(c.html),
  }));

  // SEO: FAQ 스키마 (生活韓国語)
  const faqItems = contentsOptimized.map((c) => ({
    question: c.title,
    answer: c.html,
  }));
  const faqSchema = buildFaqSchema(faqItems);

  return (
    <>
      <script
        type="application/ld+json"
        dangerouslySetInnerHTML={{ __html: JSON.stringify(faqSchema) }}
      />
      <QuizClient
      initialShowLanding={false}
      initialTab="dailylife"
      initialSeikatsuList={titles}
      initialSeikatsuContents={contentsOptimized}
    />
    </>
  );
}
