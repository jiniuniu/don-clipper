"use client";

import React, { useState, useRef, useEffect } from "react";
import { Textarea } from "@/components/ui/textarea";
import { Button } from "@/components/ui/button";
import { Send, Loader2 } from "lucide-react";

interface ChatInputProps {
  onSubmit: (question: string) => void;
  disabled?: boolean;
  placeholder?: string;
  className?: string;
}

export function ChatInput({
  onSubmit,
  disabled,
  placeholder = "输入你的问题...",
  className,
}: ChatInputProps) {
  const [question, setQuestion] = useState("");
  const textareaRef = useRef<HTMLTextAreaElement>(null);

  const handleSubmit = () => {
    const trimmedQuestion = question.trim();
    if (trimmedQuestion && !disabled) {
      onSubmit(trimmedQuestion);
      setQuestion("");
      // 重置 textarea 高度
      if (textareaRef.current) {
        textareaRef.current.style.height = "auto";
      }
    }
  };

  const handleKeyDown = (e: React.KeyboardEvent) => {
    if (e.key === "Enter" && !e.shiftKey) {
      e.preventDefault();
      handleSubmit();
    }
  };

  // 自动调整 textarea 高度
  useEffect(() => {
    const textarea = textareaRef.current;
    if (textarea) {
      textarea.style.height = "auto";
      textarea.style.height = Math.min(textarea.scrollHeight, 120) + "px";
    }
  }, [question]);

  return (
    <div className={`space-y-2 ${className}`}>
      {/* 输入区域 */}
      <div className="flex gap-2 items-end">
        <div className="flex-1 relative">
          <Textarea
            ref={textareaRef}
            value={question}
            onChange={(e) => setQuestion(e.target.value)}
            onKeyDown={handleKeyDown}
            placeholder={placeholder}
            disabled={disabled}
            className="min-h-[44px] md:min-h-[44px] max-h-[120px] resize-none pr-12 py-3 text-base md:text-sm"
            rows={1}
          />

          {/* 字符计数 */}
          {question.length > 0 && (
            <div className="absolute bottom-2 right-2">
              <span className="text-xs text-muted-foreground">
                {question.length}
              </span>
            </div>
          )}
        </div>

        <Button
          onClick={handleSubmit}
          disabled={disabled || !question.trim()}
          size="lg"
          className="px-4 self-end min-h-[44px] min-w-[44px]"
        >
          {disabled ? (
            <Loader2 className="h-4 w-4 animate-spin" />
          ) : (
            <Send className="h-4 w-4" />
          )}
        </Button>
      </div>

      {/* 快捷键提示 */}
      {question.length > 0 && (
        <div className="flex justify-between items-center text-xs text-muted-foreground">
          <span>Enter to send • Shift+Enter for new line</span>
          {disabled && (
            <span className="flex items-center">
              <Loader2 className="h-3 w-3 animate-spin mr-1" />
              Generating response...
            </span>
          )}
        </div>
      )}
    </div>
  );
}
