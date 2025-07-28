"use client";

import React, { useMemo } from "react";
import { QuestionInput } from "./question-input";
import { APP_NAME, APP_DESCRIPTION, EXAMPLE_QUESTIONS } from "@/lib/constants";
import { Button } from "@/components/ui/button";

interface EmptyStateProps {
  onSubmit: (question: string) => void;
  disabled?: boolean;
}

// 简单的伪随机函数，基于日期作为种子
function seededRandom(seed: number) {
  const x = Math.sin(seed) * 10000;
  return x - Math.floor(x);
}

function getRandomQuestions(date: string) {
  const seed = date.split("").reduce((a, b) => a + b.charCodeAt(0), 0);
  const questions = [...EXAMPLE_QUESTIONS];

  // 使用固定种子的Fisher-Yates洗牌
  for (let i = questions.length - 1; i > 0; i--) {
    const j = Math.floor(seededRandom(seed + i) * (i + 1));
    [questions[i], questions[j]] = [questions[j], questions[i]];
  }

  return questions.slice(0, 3);
}

export function EmptyState({ onSubmit, disabled }: EmptyStateProps) {
  // 使用当天日期作为种子，确保同一天内服务器和客户端结果一致
  const randomQuestions = useMemo(() => {
    const today = new Date().toDateString(); // 只使用日期，不包含时间
    return getRandomQuestions(today);
  }, []);

  return (
    <div className="flex flex-col items-center justify-center min-h-full p-8">
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
            placeholder="Describe a natural or everyday phenomenon you're curious about..."
          />
        </div>

        {/* Example Questions */}
        <div className="space-y-4">
          <p className="text-lg font-medium">💡 Try these questions:</p>
          <div className="flex flex-col gap-2">
            {randomQuestions.map((question, index) => (
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
