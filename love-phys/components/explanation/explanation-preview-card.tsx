// components/explanation/explanation-preview-card.tsx - 完整修复版本
"use client";

import React, { useState } from "react";
import { Card, CardContent } from "@/components/ui/card";
import { AlertCircle } from "lucide-react";
import { cn } from "@/lib/utils";
import Link from "next/link";

interface ExplanationPreviewCardProps {
  explanation: {
    _id: string;
    question: string;
    slug?: string;
    svgCode?: string;
    category?: string;
    subcategory?: string;
    createdAt: number;
  };
  className?: string;
}

export function ExplanationPreviewCard({
  explanation,
  className,
}: ExplanationPreviewCardProps) {
  const [hasError, setHasError] = useState(false);

  const href = `/browse/${explanation.slug}`;

  return (
    <Link href={href}>
      <Card
        className={cn(
          "group cursor-pointer transition-all duration-200 hover:shadow-lg hover:scale-[1.02] overflow-hidden",
          className
        )}
      >
        <CardContent className="p-0">
          {/* SVG 预览区域 */}
          <div className="aspect-video bg-gradient-to-br from-blue-50 to-purple-50 relative overflow-hidden">
            {explanation.svgCode && !hasError ? (
              <div
                className="w-full h-full flex items-center justify-center p-4"
                dangerouslySetInnerHTML={{ __html: explanation.svgCode }}
                onError={() => setHasError(true)}
              />
            ) : (
              <div className="w-full h-full flex items-center justify-center">
                <div className="text-center text-muted-foreground">
                  <AlertCircle className="h-12 w-12 mx-auto mb-2 opacity-50" />
                  <p className="text-xs">No preview available</p>
                </div>
              </div>
            )}
          </div>

          {/* 内容区域 */}
          <div className="px-4 py-4 space-y-3">
            {/* 标题行 */}
            <div className="flex items-start justify-between gap-2">
              <h3 className="font-medium text-sm line-clamp-2 group-hover:text-primary transition-colors flex-1">
                {explanation.question}
              </h3>

              {/* 悬停指示器 */}
              <div className="w-2 h-2 rounded-full bg-primary opacity-0 group-hover:opacity-100 transition-opacity shrink-0 mt-1" />
            </div>

            {/* 分类标签 */}
            {explanation.category && (
              <div className="flex items-center gap-2">
                <span className="text-xs text-muted-foreground bg-muted px-2 py-1 rounded-full">
                  {explanation.category.replace(/_/g, " ")}
                </span>
                {explanation.subcategory && (
                  <span className="text-xs text-muted-foreground bg-muted/50 px-2 py-1 rounded-full">
                    {explanation.subcategory.replace(/_/g, " ")}
                  </span>
                )}
              </div>
            )}
          </div>
        </CardContent>
      </Card>
    </Link>
  );
}
