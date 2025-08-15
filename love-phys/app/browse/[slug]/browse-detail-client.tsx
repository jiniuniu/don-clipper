"use client";

import React from "react";
import { ExplanationCard } from "@/components/explanation/explanation-card";
import { Button } from "@/components/ui/button";
import { ArrowLeft } from "lucide-react";
import Link from "next/link";
import { useRouter } from "next/navigation";
import { Explanation } from "@/types/physics";

interface BrowseDetailClientProps {
  explanation: Explanation;
  slug: string;
}

export function BrowseDetailClient({
  explanation,
  // eslint-disable-next-line @typescript-eslint/no-unused-vars
  slug,
}: BrowseDetailClientProps) {
  const router = useRouter();

  const handleAskSimilar = () => {
    router.push(`/session?q=${encodeURIComponent(explanation.question)}`);
  };

  return (
    <>
      {/* Navigation */}
      <nav className="m-2" aria-label="Breadcrumb">
        <Link href="/browse">
          <Button variant="ghost">
            <ArrowLeft className="mr-2 h-4 w-4" />
            Back to Browse
          </Button>
        </Link>
      </nav>

      {/* Explanation Card */}
      <ExplanationCard
        explanation={explanation}
        onQuestionClick={handleAskSimilar}
        className="bg-white/90 backdrop-blur shadow-lg"
        viewMode="detail"
      />
    </>
  );
}
