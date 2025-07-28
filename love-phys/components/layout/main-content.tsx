"use client";

import React, { useRef, useEffect } from "react";
import { Explanation } from "@/types";
import { ExplanationCard } from "@/components/explanation/explanation-card";
import { EmptyState } from "@/components/input/empty-state";
import { ChatInput } from "@/components/input/chat-input";
import { cn } from "@/lib/utils";

interface MainContentProps {
  explanations: Explanation[];
  onAskQuestion: (question: string) => void;
  onRetry?: (explanationId: string) => void;
  isGenerating?: boolean;
  className?: string;
}

export function MainContent({
  explanations,
  onAskQuestion,
  onRetry,
  isGenerating,
  className,
}: MainContentProps) {
  const scrollAreaRef = useRef<HTMLDivElement>(null);

  // 自动滚动到底部
  useEffect(() => {
    if (scrollAreaRef.current) {
      scrollAreaRef.current.scrollTop = scrollAreaRef.current.scrollHeight;
    }
  }, [explanations.length, isGenerating]);

  // 如果没有解释记录，显示空状态
  if (explanations.length === 0) {
    return (
      <div className={cn("flex-1 flex flex-col", className)}>
        <EmptyState onSubmit={onAskQuestion} disabled={isGenerating} />
      </div>
    );
  }

  // 显示解释列表 + 底部输入框
  return (
    <div className={cn("flex-1 flex flex-col", className)}>
      {/* 滚动内容区域 */}
      <div ref={scrollAreaRef} className="flex-1 overflow-auto">
        <div className="max-w-4xl mx-auto p-6 space-y-6 pb-4">
          {explanations.map((explanation) => (
            <ExplanationCard
              key={explanation._id}
              explanation={explanation}
              onQuestionClick={onAskQuestion}
              onRetry={onRetry}
            />
          ))}
        </div>
      </div>

      {/* 底部固定输入框 */}
      <div className="border-t bg-background/95 backdrop-blur supports-[backdrop-filter]:bg-background/60">
        <div className="max-w-4xl mx-auto p-4">
          <ChatInput
            onSubmit={onAskQuestion}
            disabled={isGenerating}
            placeholder="continue asking..."
          />
        </div>
      </div>
    </div>
  );
}
