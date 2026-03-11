import { notFound } from "next/navigation";
import Link from "next/link";
import { getKotaeContent } from "@/lib/qna-data";
import { buildFaqSchema } from "@/lib/faq-schema";
import { optimizeImagesInHtml } from "@/lib/html-utils";
import QnaArticleClient from "./QnaArticleClient";

const APPS_BASE = "https://apps.mirinae.jp";

export const revalidate = 60; // ISR: 1분마다 재생성

export async function generateStaticParams() {
  const { getKotaeList } = await import("@/lib/qna-data");
  const list = await getKotaeList();
  return list.slice(0, 20).map((item) => ({ id: String(item.id) }));
}

interface PageProps {
  params: Promise<{ id: string }>;
}

export async function generateMetadata({ params }: PageProps) {
  const { id } = await params;
  if (!id || !/^\d+$/.test(id)) return {};
  const data = await getKotaeContent(parseInt(id, 10));
  if (!data) return {};
  return {
    title: data.title,
    description: data.title,
    openGraph: {
      title: data.title,
      url: `${APPS_BASE}/qna/${id}`,
    },
    alternates: { canonical: `${APPS_BASE}/qna/${id}` },
  };
}

export default async function QnaArticlePage({ params }: PageProps) {
  const { id } = await params;
  if (!id || !/^\d+$/.test(id)) notFound();

  const data = await getKotaeContent(parseInt(id, 10));
  if (!data) notFound();

  const html = optimizeImagesInHtml(data.html);
  const shareUrl = `${APPS_BASE}/qna/${id}`;

  // SEO: 단일 Q&A용 FAQ 스키마
  const faqSchema = buildFaqSchema([
    { question: data.title, answer: data.html },
  ]);

  return (
    <>
      <script
        type="application/ld+json"
        dangerouslySetInnerHTML={{ __html: JSON.stringify(faqSchema) }}
      />
      <QnaArticleClient
        html={html}
        title={data.title}
        shareUrl={shareUrl}
        hasScript={html.includes("<script")}
      />
    </>
  );
}
