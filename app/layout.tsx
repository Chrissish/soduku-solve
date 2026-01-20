import type { Metadata } from "next";
import OpenCVScript from "@/components/OpenCVScript";
import "./globals.css";

export const metadata: Metadata = {
  title: "数独解题助手",
  description: "基于 OCR 的自动数独解题工具",
};

export default function RootLayout({
  children,
}: Readonly<{
  children: React.ReactNode;
}>) {
  return (
    <html lang="zh-CN">
      <body>
        <OpenCVScript />
        {children}
      </body>
    </html>
  );
}
