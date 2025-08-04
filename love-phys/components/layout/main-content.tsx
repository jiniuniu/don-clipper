"use client";

import React, { useRef, useEffect, useState } from "react";
import { Explanation } from "@/types";
import { ExplanationCard } from "@/components/explanation/explanation-card";
import { EmptyState } from "@/components/input/empty-state";
import { ChatInput } from "@/components/input/chat-input";
import { cn } from "@/lib/utils";
import { ShareModal } from "@/components/explanation/share-modal";
import { useMutation } from "convex/react";
import { api } from "@/convex/_generated/api";

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
  const [shareModalOpen, setShareModalOpen] = useState(false);
  const [explanationToShare, setExplanationToShare] =
    useState<Explanation | null>(null);
  const [isSharing, setIsSharing] = useState(false);
  const [shareUrl, setShareUrl] = useState<string | null>(null);

  // Convex mutation for updating explanation
  const updateExplanation = useMutation(api.mutations.updateExplanation);

  // 自动滚动到底部
  useEffect(() => {
    if (scrollAreaRef.current) {
      scrollAreaRef.current.scrollTop = scrollAreaRef.current.scrollHeight;
    }
  }, [explanations.length, isGenerating]);

  // 处理分享按钮点击
  const handleShareClick = (explanation: Explanation) => {
    setExplanationToShare(explanation);

    // 检查是否已经是公开的且有 slug
    if (explanation.isPublic && explanation.slug) {
      const url = `${window.location.origin}/browse/${explanation.slug}`;
      setShareUrl(url);
    } else {
      setShareUrl(null);
    }

    setShareModalOpen(true);
  };

  // 确认分享
  const handleConfirmShare = async () => {
    if (!explanationToShare) return;

    setIsSharing(true);
    try {
      // 生成 slug
      const { generateSlug } = await import("@/lib/slug-generator");
      const slug = generateSlug(explanationToShare.question);

      // 调用 updateExplanation 使解释公开并设置 slug
      await updateExplanation({
        explanationId: explanationToShare._id,
        isPublic: true,
        slug: slug,
      });

      // 生成分享链接并显示在 modal 中
      const url = `${window.location.origin}/browse/${slug}`;
      setShareUrl(url);
    } catch (error) {
      console.error("Share failed:", error);
    } finally {
      setIsSharing(false);
    }
  };

  // 取消分享
  const handleCancelShare = () => {
    setShareModalOpen(false);
    setExplanationToShare(null);
    setShareUrl(null);
  };

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
              onShare={handleShareClick} // 只在 default viewMode 下传递
              viewMode="default"
            />
          ))}
        </div>
      </div>

      {/* 底部固定输入框 */}
      <div className="border-t bg-background/95 backdrop-blur supports-[backdrop-filter]:bg-background/60">
        <div className="max-w-4xl mx-auto p-4 pb-6 md:pb-4">
          <ChatInput
            onSubmit={onAskQuestion}
            disabled={isGenerating}
            placeholder="continue asking..."
          />
        </div>
      </div>

      {/* 分享确认弹窗 */}
      <ShareModal
        open={shareModalOpen}
        onOpenChange={setShareModalOpen}
        explanation={explanationToShare}
        shareUrl={shareUrl}
        isSharing={isSharing}
        onConfirmShare={handleConfirmShare}
        onCancel={handleCancelShare}
      />
    </div>
  );
}
