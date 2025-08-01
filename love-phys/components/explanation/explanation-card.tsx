// components/explanation/explanation-card.tsx - 添加分享按钮版本
"use client";

import React, { useState } from "react";
import { Explanation } from "@/types";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { SVGDisplay } from "./svg-display";
import { ExplanationText } from "./explanation-text";
import { RelatedPhenomena } from "./related-phenomena";
import { FurtherQuestions } from "./further-questions";
import { LoadingExplanation } from "./loading-status";
import { Button } from "@/components/ui/button";
import { RotateCcw, AlertCircle, Share2 } from "lucide-react";
import { useMutation } from "convex/react";
import { api } from "@/convex/_generated/api";

interface ExplanationCardProps {
  explanation: Explanation;
  onQuestionClick: (question: string) => void;
  onRetry?: (explanationId: string) => void;
  onShare?: (explanation: Explanation) => void; // 新增分享回调
  viewMode?: "default" | "detail";
  className?: string;
}

export function ExplanationCard({
  explanation,
  onQuestionClick,
  onRetry,
  onShare, // 新增分享回调参数
  viewMode = "default",
  className = "",
}: ExplanationCardProps) {
  const [isSaving, setIsSaving] = useState(false);

  // Convex mutation for updating explanation
  const updateExplanation = useMutation(api.mutations.updateExplanation);

  const handleSvgSave = async (updates: {
    svgCode?: string;
    isPublic?: boolean;
    category?: string;
    subcategory?: string;
  }) => {
    setIsSaving(true);
    try {
      // 如果要设为公开且还没有 slug，生成一个
      if (updates.isPublic && !explanation.slug) {
        const { generateSlug } = await import("@/lib/slug-generator");
        const slug = generateSlug(explanation.question);

        await updateExplanation({
          explanationId: explanation._id,
          slug, // 添加生成的 slug
          ...updates,
        });
      } else {
        await updateExplanation({
          explanationId: explanation._id,
          ...updates,
        });
      }
    } catch (error) {
      console.error("Failed to save updates:", error);
    } finally {
      setIsSaving(false);
    }
  };

  // 分享按钮点击处理
  const handleShare = () => {
    if (onShare) {
      onShare(explanation);
    }
  };

  if (
    explanation.status === "generating" ||
    explanation.status === "content_completed" ||
    explanation.status === "svg_generating"
  ) {
    return (
      <Card className="transition-all duration-200 hover:shadow-md">
        <CardHeader className="pb-4">
          <CardTitle className="text-lg flex items-center justify-between">
            <span className="flex items-center">📋 {explanation.question}</span>
            {/* 加载状态时不显示分享按钮 */}
          </CardTitle>
        </CardHeader>
        <CardContent>
          <LoadingExplanation status={explanation.status} />
        </CardContent>
      </Card>
    );
  }

  if (explanation.status === "failed") {
    return (
      <Card className="border-destructive/50 bg-destructive/5 transition-all duration-200 hover:shadow-md">
        <CardHeader className="pb-4">
          <CardTitle className="text-lg flex items-center justify-between">
            <span className="flex items-center">📋 {explanation.question}</span>
            {/* 失败状态时不显示分享按钮 */}
          </CardTitle>
        </CardHeader>
        <CardContent>
          <div className="text-center py-8 space-y-4">
            <AlertCircle className="h-12 w-12 text-destructive mx-auto" />
            <div>
              <p className="text-destructive font-medium">Generation Failed</p>
              <p className="text-sm text-muted-foreground mt-2">
                Sorry, an error occurred while generating the explanation.
                Please try again or ask a new question.
              </p>
            </div>
            <div className="flex gap-2 justify-center">
              {onRetry && (
                <Button
                  variant="outline"
                  onClick={() => onRetry(explanation._id)}
                  className="border-destructive text-destructive hover:bg-destructive hover:text-destructive-foreground"
                >
                  <RotateCcw className="mr-2 h-4 w-4" />
                  Retry
                </Button>
              )}
              <Button onClick={() => onQuestionClick(explanation.question)}>
                Ask Again
              </Button>
            </div>
          </div>
        </CardContent>
      </Card>
    );
  }

  return (
    <Card
      className={`transition-all duration-200 hover:shadow-md ${className}`}
    >
      <CardHeader className="pb-2">
        <CardTitle className="text-lg flex items-center justify-between">
          <span className="flex items-center">📋 {explanation.question}</span>
          {/* 分享按钮 - 只在成功状态显示 */}
          {onShare && (
            <Button
              variant="ghost"
              size="sm"
              onClick={handleShare}
              className="text-muted-foreground hover:text-foreground transition-colors"
              title="分享这个解释"
            >
              <Share2 className="h-4 w-4" />
            </Button>
          )}
        </CardTitle>
      </CardHeader>

      <CardContent className="space-y-2">
        {/* SVG 图示 - 带编辑功能 */}
        {explanation.svgCode && (
          <SVGDisplay
            svgCode={explanation.svgCode}
            title={explanation.question}
            editable={viewMode === "default"}
            onSave={handleSvgSave}
            requireAdmin={true}
            isSaving={isSaving}
            currentSettings={{
              isPublic: explanation.isPublic,
              category: explanation.category,
              subcategory: explanation.subcategory,
            }}
          />
        )}

        {/* 原理解释 */}
        {explanation.explanation && (
          <ExplanationText explanation={explanation.explanation} />
        )}

        {/* 底部交互区域 */}
        <div className="space-y-4 pt-2 border-t border-border/50">
          {/* 相关现象 */}
          {explanation.relatedPhenomena &&
            explanation.relatedPhenomena.length > 0 && (
              <RelatedPhenomena phenomena={explanation.relatedPhenomena} />
            )}

          {/* 延伸问题 - 根据视图模式显示不同样式 */}
          {explanation.furtherQuestions &&
            explanation.furtherQuestions.length > 0 && (
              <>
                {viewMode === "default" ? (
                  <FurtherQuestions
                    questions={explanation.furtherQuestions}
                    onQuestionClick={onQuestionClick}
                  />
                ) : (
                  <div className="space-y-3">
                    <h3 className="text-base font-semibold flex items-center text-primary">
                      ❓ Related Questions
                    </h3>
                    <div className="space-y-2">
                      {explanation.furtherQuestions.map((question, index) => (
                        <div
                          key={index}
                          className="text-sm text-gray-600 p-3 bg-gray-50 rounded-lg"
                        >
                          {question}
                        </div>
                      ))}
                    </div>
                  </div>
                )}
              </>
            )}
        </div>
      </CardContent>
    </Card>
  );
}
