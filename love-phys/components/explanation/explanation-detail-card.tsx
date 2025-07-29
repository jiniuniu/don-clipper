// components/explanation/explanation-detail-card.tsx
"use client";

import React from "react";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Clock } from "lucide-react";
import { SVGDisplay } from "./svg-display";
import { ExplanationText } from "./explanation-text";
import { RelatedPhenomena } from "./related-phenomena";

interface ExplanationDetailCardProps {
  explanation: {
    _id: string;
    question: string;
    svgCode?: string;
    explanation?: string;
    relatedPhenomena?: string[];
    category?: string;
    subcategory?: string;
    createdAt: number;
  };
  className?: string;
}

export function ExplanationDetailCard({
  explanation,
  className,
}: ExplanationDetailCardProps) {
  const formatTime = (timestamp: number) => {
    return new Date(timestamp).toLocaleTimeString("zh-CN", {
      hour: "2-digit",
      minute: "2-digit",
    });
  };

  const formatDate = (timestamp: number) => {
    return new Date(timestamp).toLocaleDateString("zh-CN", {
      year: "numeric",
      month: "long",
      day: "numeric",
    });
  };

  return (
    <Card className={`transition-all duration-200 ${className}`}>
      <CardHeader className="pb-4">
        {/* 分类标签 */}
        {(explanation.category || explanation.subcategory) && (
          <div className="flex flex-wrap gap-2 mb-3">
            {explanation.category && (
              <Badge variant="default" className="text-xs">
                {explanation.category}
              </Badge>
            )}
            {explanation.subcategory && (
              <Badge variant="secondary" className="text-xs">
                {explanation.subcategory}
              </Badge>
            )}
          </div>
        )}

        {/* 标题和时间 */}
        <CardTitle className="text-xl flex items-start justify-between">
          <span className="flex items-start">
            <span className="mr-2">📋</span>
            <span className="leading-relaxed">{explanation.question}</span>
          </span>
          <div className="text-xs text-muted-foreground font-normal flex flex-col items-end">
            <div className="flex items-center">
              <Clock className="h-3 w-3 mr-1" />
              {formatTime(explanation.createdAt)}
            </div>
            <div className="mt-1 text-muted-foreground/70">
              {formatDate(explanation.createdAt)}
            </div>
          </div>
        </CardTitle>
      </CardHeader>

      <CardContent className="space-y-6">
        {/* SVG 图示 - 只读模式 */}
        {explanation.svgCode && (
          <SVGDisplay
            svgCode={explanation.svgCode}
            title={explanation.question}
            editable={false} // 详情页不可编辑
          />
        )}

        {/* 原理解释 */}
        {explanation.explanation && (
          <ExplanationText
            explanation={explanation.explanation}
            className="prose prose-base max-w-none"
          />
        )}

        {/* 相关现象 - 只显示，无交互 */}
        {explanation.relatedPhenomena &&
          explanation.relatedPhenomena.length > 0 && (
            <div className="pt-2 border-t border-border/50">
              <RelatedPhenomena phenomena={explanation.relatedPhenomena} />
            </div>
          )}
      </CardContent>
    </Card>
  );
}
