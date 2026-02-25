import type { Metadata } from "next";

export const metadata: Metadata = {
  title: "音読トレーニング",
};

export default function OndokuLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  return <>{children}</>;
}
