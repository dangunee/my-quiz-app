import type { Metadata } from "next";
import "./globals.css";

export const metadata: Metadata = {
  title: "クイズで学ぶ韓国語",
  description: "日本語を韓国語に訳すクイズで韓国語を学ぼう",
};

export default function RootLayout({
  children,
}: Readonly<{
  children: React.ReactNode;
}>) {
  return (
    <html lang="ja">
      <body className="antialiased">
        {children}
      </body>
    </html>
  );
}
