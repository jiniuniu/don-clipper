// components/explanation/explanation-preview-card.tsx
"use client";

import React, { useState } from "react";
import { Card, CardContent } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { AlertCircle } from "lucide-react";
import { cn } from "@/lib/utils";
import Link from "next/link";

interface ExplanationPreviewCardProps {
  explanation: {
    _id: string;
    question: string;
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

  return (
    <Link href={`/explanation/${explanation._id}`}>
      <Card
        className={cn(
          "group cursor-pointer transition-all duration-200 hover:shadow-lg hover:scale-[1.02] overflow-hidden",
          className
        )}
      >
        <CardContent className="p-0">
          {/* SVG 预览区域 */}
          <div className="aspect-video bg-gradient-to-br relative overflow-hidden">
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
          <div className="px-4 pt-4 space-y-2">
            {/* 分类 Badge 行 */}
            <div className="flex gap-1">
              {explanation.category && (
                <Badge variant="default" className="text-xs">
                  {explanation.category}
                </Badge>
              )}
              {explanation.subcategory && (
                <Badge variant="default" className="text-xs">
                  {explanation.subcategory}
                </Badge>
              )}
            </div>

            {/* 标题行 */}
            <div className="flex items-start justify-between gap-2">
              <h3 className="font-medium text-sm line-clamp-2 group-hover:text-primary transition-colors flex-1">
                {explanation.question}
              </h3>

              {/* 悬停指示器 */}
              <div className="w-2 h-2 rounded-full bg-primary opacity-0 group-hover:opacity-100 transition-opacity shrink-0" />
            </div>
          </div>
        </CardContent>
      </Card>
    </Link>
  );
}
