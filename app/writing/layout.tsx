import type { Metadata } from "next";

export const metadata: Metadata = {
  title: "作文トレーニング",
};

export default function WritingLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  return <>{children}</>;
}
