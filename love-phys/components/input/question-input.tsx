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
  placeholder = "Enter your question...",
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
    <div className={`relative ${className}`}>
      <Textarea
        value={question}
        onChange={(e) => setQuestion(e.target.value)}
        onKeyDown={handleKeyDown}
        placeholder={placeholder}
        disabled={disabled}
        className="min-h-[100px] text-lg resize-none pr-16 pb-16"
        autoFocus
      />
      <Button
        onClick={handleSubmit}
        disabled={disabled || !question.trim()}
        size="icon"
        className="absolute bottom-3 right-3 h-10 w-10 rounded-full shadow-lg hover:shadow-xl transition-all duration-200"
      >
        <Send className="h-4 w-4" />
      </Button>
    </div>
  );
}
