import type { Metadata } from "next";
import { Inter } from "next/font/google";
import "./globals.css";
import ConvexProvider from "./convex-provider";
import { ClerkProvider } from "@clerk/nextjs";

const inter = Inter({ subsets: ["latin"] });

export const metadata: Metadata = {
  title: "Love Physics - 探索自然现象背后的物理原理",
  description:
    "基于 AI 的物理学教育应用，用生动的图示和通俗的解释帮助你理解复杂的物理现象。",
  keywords: "物理教育, AI, 自然现象, 物理原理, 科学学习",
  authors: [{ name: "Love Physics Team" }],
  openGraph: {
    title: "Love Physics - 探索自然现象背后的物理原理",
    description:
      "基于 AI 的物理学教育应用，用生动的图示和通俗的解释帮助你理解复杂的物理现象。",
    type: "website",
  },
};

export default function RootLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  return (
    <html lang="zh-CN">
      <body className={inter.className}>
        <ClerkProvider>
          <ConvexProvider>{children}</ConvexProvider>
        </ClerkProvider>
      </body>
    </html>
  );
}
