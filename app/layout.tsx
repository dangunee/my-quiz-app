import type { Metadata } from "next";
import { headers } from "next/headers";
import "./globals.css";

const QUIZ_URL = "https://quiz.mirinae.jp";
const WRITING_URL = "https://writing.mirinae.jp";
const ONDOKU_URL = "https://ondoku.mirinae.jp";

const QUIZ_METADATA: Metadata = {
  title: {
    default: "ミリネのクイズで学ぶ韓国語｜東京・新宿の韓国語教室",
    template: "%s｜ミリネ韓国語",
  },
  description:
    "東京・新宿の韓国語教室ミリネ。韓国語クイズ、個人レッスン、グループレッスン、発音矯正で韓国語を学べます。日本語を韓国語に訳すクイズで楽しく学習。",
  keywords: [
    "東京　韓国語教室",
    "韓国語教室　新宿",
    "韓国語　個人レッスン",
    "韓国語　グループレッスン",
    "韓国語　発音矯正",
    "ミリネ",
    "韓国語クイズ",
  ],
  openGraph: {
    type: "website",
    locale: "ja_JP",
    url: QUIZ_URL,
    siteName: "ミリネ韓国語クイズ",
    title: "ミリネのクイズで学ぶ韓国語｜東京・新宿の韓国語教室",
    description:
      "東京・新宿の韓国語教室。個人レッスン、グループレッスン、発音矯正。韓国語クイズで楽しく学べます。",
  },
  twitter: {
    card: "summary_large_image",
    title: "ミリネのクイズで学ぶ韓国語｜東京・新宿の韓国語教室",
    description: "東京・新宿の韓国語教室。個人レッスン、グループレッスン、発音矯正。",
  },
  alternates: { canonical: QUIZ_URL },
  robots: { index: true, follow: true },
};

const WRITING_METADATA: Metadata = {
  icons: {
    icon: "/favicon-writing.png",
  },
  title: {
    default: "韓国語作文トレーニング｜東京・新宿の韓国語教室ミリネ",
    template: "%s｜ミリネ韓国語",
  },
  description:
    "東京・新宿の韓国語教室ミリネ。韓国語レッスン　作文、TOPIK作文対策。個人レッスン、グループレッスン、発音矯正。韓国語作文トレーニングでライティング力を鍛えよう。",
  keywords: [
    "東京　韓国語教室",
    "韓国語教室　新宿",
    "韓国語　個人レッスン",
    "韓国語　グループレッスン",
    "韓国語　発音矯正",
    "韓国語レッスン　作文",
    "韓国語レッスン　TOPIK 作文",
    "ミリネ",
    "韓国語作文",
  ],
  openGraph: {
    type: "website",
    locale: "ja_JP",
    url: WRITING_URL,
    siteName: "ミリネ韓国語作文トレーニング",
    title: "韓国語作文トレーニング｜東京・新宿の韓国語教室ミリネ",
    description:
      "東京・新宿の韓国語教室。韓国語レッスン　作文、TOPIK作文。個人レッスン、グループレッスン、発音矯正。",
  },
  twitter: {
    card: "summary_large_image",
    title: "韓国語作文トレーニング｜東京・新宿の韓国語教室ミリネ",
    description: "韓国語レッスン　作文、TOPIK作文。東京・新宿の韓国語教室。",
  },
  alternates: { canonical: WRITING_URL },
  robots: { index: true, follow: true },
};

const ONDOKU_METADATA: Metadata = {
  title: {
    default: "ミリネ韓国語音読トレーニング｜東京・新宿の韓国語教室",
    template: "%s｜ミリネ韓国語",
  },
  description:
    "東京・新宿の韓国語教室ミリネ。メールで音読トレーニング。ネイティブ添削＋模範音声で発音・抑揚UP。個人レッスン、グループレッスン、発音矯正。",
  keywords: [
    "東京　韓国語教室",
    "韓国語教室　新宿",
    "韓国語　個人レッスン",
    "韓国語　音読",
    "韓国語　発音矯正",
    "ミリネ",
    "韓国語音読",
  ],
  openGraph: {
    type: "website",
    locale: "ja_JP",
    url: ONDOKU_URL,
    siteName: "ミリネ韓国語音読トレーニング",
    title: "ミリネ韓国語音読トレーニング｜東京・新宿の韓国語教室",
    description:
      "東京・新宿の韓国語教室。メールで音読トレーニング。ネイティブ添削＋模範音声で発音・抑揚UP。",
  },
  twitter: {
    card: "summary_large_image",
    title: "ミリネ韓国語音読トレーニング｜東京・新宿の韓国語教室",
    description: "メールで音読トレーニング。ネイティブ添削＋模範音声で発音・抑揚UP。",
  },
  alternates: { canonical: ONDOKU_URL },
  robots: { index: true, follow: true },
};

export async function generateMetadata(): Promise<Metadata> {
  const headersList = await headers();
  const host =
    headersList.get("x-forwarded-host") ||
    headersList.get("host") ||
    "";
  const isWriting =
    host.includes("writing.mirinae.jp") ||
    host.includes("www.writing.mirinae.jp");
  const isOndoku =
    host.includes("ondoku.mirinae.jp") ||
    host.includes("www.ondoku.mirinae.jp");
  if (isWriting) return WRITING_METADATA;
  if (isOndoku) return ONDOKU_METADATA;
  return QUIZ_METADATA;
}

const QUIZ_JSON_LD = {
  "@context": "https://schema.org",
  "@type": "WebApplication",
  name: "ミリネ韓国語クイズ",
  description:
    "東京・新宿の韓国語教室ミリネ。韓国語クイズ、個人レッスン、グループレッスン、発音矯正。",
  url: QUIZ_URL,
  applicationCategory: "EducationalApplication",
  operatingSystem: "Any",
  offers: { "@type": "Offer", price: "0", priceCurrency: "JPY" },
  publisher: {
    "@type": "EducationalOrganization",
    name: "ミリネ",
    url: "https://mirinae.jp",
    address: { "@type": "PostalAddress", addressLocality: "新宿", addressRegion: "東京都" },
  },
};

const WRITING_JSON_LD = {
  "@context": "https://schema.org",
  "@type": "WebApplication",
  name: "ミリネ韓国語作文トレーニング",
  description:
    "東京・新宿の韓国語教室ミリネ。韓国語レッスン　作文、TOPIK作文。個人レッスン、グループレッスン、発音矯正。",
  url: WRITING_URL,
  applicationCategory: "EducationalApplication",
  operatingSystem: "Any",
  offers: { "@type": "Offer", price: "0", priceCurrency: "JPY" },
  publisher: {
    "@type": "EducationalOrganization",
    name: "ミリネ",
    url: "https://mirinae.jp",
    address: { "@type": "PostalAddress", addressLocality: "新宿", addressRegion: "東京都" },
  },
};

const ONDOKU_JSON_LD = {
  "@context": "https://schema.org",
  "@type": "WebApplication",
  name: "ミリネ韓国語音読トレーニング",
  description:
    "東京・新宿の韓国語教室ミリネ。メールで音読トレーニング。ネイティブ添削＋模範音声で発音・抑揚UP。",
  url: ONDOKU_URL,
  applicationCategory: "EducationalApplication",
  operatingSystem: "Any",
  offers: { "@type": "Offer", price: "0", priceCurrency: "JPY" },
  publisher: {
    "@type": "EducationalOrganization",
    name: "ミリネ",
    url: "https://mirinae.jp",
    address: { "@type": "PostalAddress", addressLocality: "新宿", addressRegion: "東京都" },
  },
};

export default async function RootLayout({
  children,
}: Readonly<{
  children: React.ReactNode;
}>) {
  const headersList = await headers();
  const host =
    headersList.get("x-forwarded-host") ||
    headersList.get("host") ||
    "";
  const isWriting =
    host.includes("writing.mirinae.jp") ||
    host.includes("www.writing.mirinae.jp");
  const isOndoku =
    host.includes("ondoku.mirinae.jp") ||
    host.includes("www.ondoku.mirinae.jp");
  const jsonLd = isWriting ? WRITING_JSON_LD : isOndoku ? ONDOKU_JSON_LD : QUIZ_JSON_LD;

  return (
    <html lang="ja">
      <body className="antialiased">
        <script
          type="application/ld+json"
          dangerouslySetInnerHTML={{ __html: JSON.stringify(jsonLd) }}
        />
        {children}
      </body>
    </html>
  );
}
