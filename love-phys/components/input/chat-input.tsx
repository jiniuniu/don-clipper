"use client";

import React, { useState, useRef, useEffect, useMemo } from "react";
import { Textarea } from "@/components/ui/textarea";
import { Button } from "@/components/ui/button";
import { Send, Loader2, Lightbulb } from "lucide-react";
import { Badge } from "@/components/ui/badge";

interface ChatInputProps {
  onSubmit: (question: string) => void;
  disabled?: boolean;
  placeholder?: string;
  className?: string;
  suggestions?: string[];
}

// 智能提示词
const SMART_SUGGESTIONS = [
  "为什么会这样？",
  "这个原理是什么？",
  "有什么实际应用？",
  "如何用公式解释？",
  "能举个例子吗？",
  "这与什么现象相关？",
];

export function ChatInput({
  onSubmit,
  disabled,
  placeholder = "输入你的问题...",
  className,
  suggestions = [],
}: ChatInputProps) {
  const [question, setQuestion] = useState("");
  const [showSuggestions, setShowSuggestions] = useState(false);
  const textareaRef = useRef<HTMLTextAreaElement>(null);

  const handleSubmit = () => {
    const trimmedQuestion = question.trim();
    if (trimmedQuestion && !disabled) {
      onSubmit(trimmedQuestion);
      setQuestion("");
      setShowSuggestions(false);
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

    // Escape 键隐藏建议
    if (e.key === "Escape") {
      setShowSuggestions(false);
    }
  };

  const handleSuggestionClick = (suggestion: string) => {
    const newQuestion =
      question.trim() + (question.trim() ? " " : "") + suggestion;
    setQuestion(newQuestion);
    setShowSuggestions(false);
    textareaRef.current?.focus();
  };

  // 自动调整 textarea 高度
  useEffect(() => {
    const textarea = textareaRef.current;
    if (textarea) {
      textarea.style.height = "auto";
      textarea.style.height = Math.min(textarea.scrollHeight, 120) + "px";
    }
  }, [question]);

  // 智能建议逻辑
  // 用 useMemo 替代 useEffect
  const currentSuggestions = useMemo(() => {
    if (question.length > 3) {
      return [...(suggestions || []), ...SMART_SUGGESTIONS]
        .filter((s) => !question.toLowerCase().includes(s.toLowerCase()))
        .slice(0, 4);
    }
    return [];
  }, [question, suggestions]);

  // 然后删除 useEffect 和 currentSuggestions state

  return (
    <div className={`space-y-2 ${className}`}>
      {/* 智能建议 */}
      {currentSuggestions.length > 0 && showSuggestions && (
        <div className="flex flex-wrap gap-2 mb-2">
          <div className="flex items-center text-xs text-muted-foreground mr-2">
            <Lightbulb className="h-3 w-3 mr-1" />
            建议:
          </div>
          {currentSuggestions.map((suggestion, index) => (
            <Badge
              key={index}
              variant="outline"
              className="cursor-pointer hover:bg-primary hover:text-primary-foreground transition-colors text-xs py-1"
              onClick={() => handleSuggestionClick(suggestion)}
            >
              {suggestion}
            </Badge>
          ))}
        </div>
      )}

      {/* 输入区域 */}
      <div className="flex gap-2">
        <div className="flex-1 relative">
          <Textarea
            ref={textareaRef}
            value={question}
            onChange={(e) => setQuestion(e.target.value)}
            onKeyDown={handleKeyDown}
            onFocus={() => setShowSuggestions(true)}
            placeholder={placeholder}
            disabled={disabled}
            className="min-h-[44px] max-h-[120px] resize-none pr-12 py-3"
            rows={1}
          />

          {/* 字符计数和建议按钮 */}
          <div className="absolute bottom-2 right-2 flex items-center gap-1">
            {currentSuggestions.length > 0 && !showSuggestions && (
              <Button
                variant="ghost"
                size="sm"
                className="h-6 w-6 p-0 text-muted-foreground hover:text-foreground"
                onClick={() => setShowSuggestions(true)}
              >
                <Lightbulb className="h-3 w-3" />
              </Button>
            )}
            {question.length > 0 && (
              <span className="text-xs text-muted-foreground">
                {question.length}
              </span>
            )}
          </div>
        </div>

        <Button
          onClick={handleSubmit}
          disabled={disabled || !question.trim()}
          size="lg"
          className="px-4 self-end"
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
          <span>Enter 发送 • Shift+Enter 换行</span>
          {disabled && (
            <span className="flex items-center">
              <Loader2 className="h-3 w-3 animate-spin mr-1" />
              正在生成回复...
            </span>
          )}
        </div>
      )}
    </div>
  );
}
