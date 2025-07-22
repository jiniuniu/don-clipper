"use client";

import React from "react";
import { QuestionInput } from "./question-input";
import { APP_NAME, APP_DESCRIPTION, EXAMPLE_QUESTIONS } from "@/lib/constants";
import { Button } from "@/components/ui/button";

interface EmptyStateProps {
  onSubmit: (question: string) => void;
  disabled?: boolean;
}

export function EmptyState({ onSubmit, disabled }: EmptyStateProps) {
  return (
    <div className="flex flex-col items-center justify-center min-h-screen p-8">
      <div className="max-w-2xl w-full text-center space-y-8">
        {/* Logo and Title */}
        <div className="space-y-4">
          <div className="text-6xl">🔬</div>
          <h1 className="text-4xl font-bold">{APP_NAME}</h1>
          <p className="text-xl text-muted-foreground">{APP_DESCRIPTION}</p>
        </div>

        {/* Input Section */}
        <div className="space-y-4">
          <QuestionInput
            onSubmit={onSubmit}
            disabled={disabled}
            placeholder="描述一个你好奇的自然现象或生活现象..."
          />
        </div>

        {/* Example Questions */}
        <div className="space-y-4">
          <p className="text-lg font-medium">💡 试试这些问题:</p>
          <div className="flex flex-col gap-2">
            {EXAMPLE_QUESTIONS.map((question, index) => (
              <Button
                key={index}
                variant="outline"
                className="text-left justify-start"
                onClick={() => onSubmit(question)}
                disabled={disabled}
              >
                • {question}
              </Button>
            ))}
          </div>
        </div>
      </div>
    </div>
  );
}
