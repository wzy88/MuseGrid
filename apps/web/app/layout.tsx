import type { Metadata } from "next";
import "./globals.css";

export const metadata: Metadata = {
  title: "MuseGrid",
  description: "MuseGrid 音乐创作工作台",
};

export default function RootLayout({
  children,
}: Readonly<{
  children: React.ReactNode;
}>) {
  return (
    <html lang="zh-CN">
      <body>{children}</body>
    </html>
  );
}
