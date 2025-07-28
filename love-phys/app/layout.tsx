import type { Metadata } from "next";
import { Inter } from "next/font/google";
import "./globals.css";
import ConvexProvider from "./convex-provider";
import { ClerkProvider } from "@clerk/nextjs";

const inter = Inter({ subsets: ["latin"] });

export const metadata: Metadata = {
  title:
    "Love Physics - Explore the Physical Principles Behind Natural Phenomena",
  description:
    "An AI-powered physics education application that helps you understand complex physical phenomena through vivid illustrations and accessible explanations.",
  keywords:
    "physics education, AI, natural phenomena, physical principles, science learning",
  authors: [{ name: "Love Physics Team" }],
  openGraph: {
    title:
      "Love Physics - Explore the Physical Principles Behind Natural Phenomena",
    description:
      "An AI-powered physics education application that helps you understand complex physical phenomena through vivid illustrations and accessible explanations.",
    type: "website",
  },
};

export default function RootLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  return (
    <html lang="en">
      <body className={inter.className}>
        <ClerkProvider>
          <ConvexProvider>{children}</ConvexProvider>
        </ClerkProvider>
      </body>
    </html>
  );
}
