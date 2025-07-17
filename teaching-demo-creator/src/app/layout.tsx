import "./globals.css";
import type { Metadata } from "next";
import { Inter } from "next/font/google";
import { ConvexProvider, convex } from "@/lib/convex";
import { Toaster } from "@/components/ui/sonner";
import { cn } from "@/lib/utils";

const inter = Inter({ subsets: ["latin"] });

export const metadata: Metadata = {
  title: "Teaching Demo Creator",
  description: "AI-powered interactive teaching content generator",
};

export default function RootLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  return (
    <html lang="zh-CN">
      <body className={cn(inter.className, "antialiased")}>
        <ConvexProvider client={convex}>
          {children}
          <Toaster />
        </ConvexProvider>
      </body>
    </html>
  );
}
