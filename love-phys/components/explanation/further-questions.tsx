"use client";

import React from "react";
import { Button } from "@/components/ui/button";
import { ArrowRight } from "lucide-react";

interface FurtherQuestionsProps {
  questions: string[];
  onQuestionClick: (question: string) => void;
  className?: string;
}

export function FurtherQuestions({
  questions,
  onQuestionClick,
  className,
}: FurtherQuestionsProps) {
  return (
    <div className={`space-y-3 ${className}`}>
      <h3 className="text-base font-semibold flex items-center text-primary">
        ❓ 继续探索
      </h3>
      <div className="grid gap-2 sm:grid-cols-1">
        {questions.map((question, index) => (
          <Button
            key={index}
            variant="outline"
            size="sm"
            onClick={() => onQuestionClick(question)}
            className="text-left justify-between h-auto whitespace-normal p-3 group hover:bg-primary hover:text-primary-foreground transition-all duration-200"
          >
            <span className="flex-1 text-sm leading-relaxed">{question}</span>
            <ArrowRight className="h-4 w-4 ml-2 opacity-0 group-hover:opacity-100 transition-opacity shrink-0" />
          </Button>
        ))}
      </div>
    </div>
  );
}
