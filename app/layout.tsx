import type { Metadata } from "next";
import "./globals.css";

export const metadata: Metadata = {
  title: "MajorMap AI",
  description: "AI 기반 진로-교과 로드맵 설계 MVP",
};

export default function RootLayout({
  children,
}: Readonly<{
  children: React.ReactNode;
}>) {
  return (
    <html lang="ko" className="h-full antialiased">
      <body className="min-h-full flex flex-col">{children}</body>
    </html>
  );
}
