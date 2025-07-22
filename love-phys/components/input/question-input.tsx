"use client";

import React, { useState } from "react";
import { Textarea } from "@/components/ui/textarea";
import { Button } from "@/components/ui/button";
import { Send } from "lucide-react";

interface QuestionInputProps {
  onSubmit: (question: string) => void;
  disabled?: boolean;
  placeholder?: string;
  className?: string;
}

export function QuestionInput({
  onSubmit,
  disabled,
  placeholder = "输入你的问题...",
  className,
}: QuestionInputProps) {
  const [question, setQuestion] = useState("");

  const handleSubmit = () => {
    const trimmedQuestion = question.trim();
    if (trimmedQuestion && !disabled) {
      onSubmit(trimmedQuestion);
      setQuestion("");
    }
  };

  const handleKeyDown = (e: React.KeyboardEvent) => {
    if (e.key === "Enter" && !e.shiftKey) {
      e.preventDefault();
      handleSubmit();
    }
  };

  return (
    <div className={`space-y-4 ${className}`}>
      <Textarea
        value={question}
        onChange={(e) => setQuestion(e.target.value)}
        onKeyDown={handleKeyDown}
        placeholder={placeholder}
        disabled={disabled}
        className="min-h-[100px] text-lg resize-none"
        autoFocus
      />
      <Button
        onClick={handleSubmit}
        disabled={disabled || !question.trim()}
        size="lg"
        className="w-full"
      >
        <Send className="mr-2 h-4 w-4" />
        开始探索
      </Button>
    </div>
  );
}
