/**
 * FAQ Schema (JSON-LD) for SEO - Google 검색 결과에 Q&A 직접 노출
 */
export interface FaqItem {
  question: string;
  answer: string;
}

/** HTML 태그 제거 후 순수 텍스트 추출 (FAQ schema용) */
export function stripHtmlForSchema(html: string): string {
  if (!html || typeof html !== "string") return "";
  return html
    .replace(/<script[\s\S]*?<\/script>/gi, "")
    .replace(/<style[\s\S]*?<\/style>/gi, "")
    .replace(/<[^>]+>/g, " ")
    .replace(/\s+/g, " ")
    .trim()
    .slice(0, 5000); // schema 권장 길이
}

export function buildFaqSchema(items: FaqItem[]): object {
  return {
    "@context": "https://schema.org",
    "@type": "FAQPage",
    mainEntity: items.map(({ question, answer }) => ({
      "@type": "Question",
      name: question,
      acceptedAnswer: {
        "@type": "Answer",
        text: stripHtmlForSchema(answer),
      },
    })),
  };
}
