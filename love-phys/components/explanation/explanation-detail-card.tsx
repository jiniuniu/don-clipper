// components/explanation/explanation-detail-card.tsx
"use client";

import React from "react";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
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
  return (
    <Card className={`transition-all duration-200 ${className}`}>
      <CardHeader className="pb-4">
        <CardTitle className="text-xl flex items-start justify-between">
          <span className="flex items-start">
            <span className="mr-2">📋</span>
            <span className="leading-relaxed">{explanation.question}</span>
          </span>
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
