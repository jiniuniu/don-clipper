"use client";

import React from "react";
import { Loader2 } from "lucide-react";

interface LoadingExplanationProps {
  className?: string;
}

export function LoadingExplanation({ className }: LoadingExplanationProps) {
  return (
    <div className={`space-y-6 ${className}`}>
      {/* 生成中提示 */}
      <div className="text-center py-8">
        <Loader2 className="h-8 w-8 animate-spin mx-auto mb-4 text-primary" />
        <p className="text-lg font-medium">正在生成物理解释...</p>
        <p className="text-sm text-muted-foreground mt-2">
          请稍等片刻，我正在为你分析这个现象
        </p>
      </div>

      {/* 骨架屏效果 */}
      <div className="space-y-6">
        {/* SVG 区域骨架 */}
        <div className="bg-muted rounded-lg h-64 animate-pulse" />

        {/* 文本区域骨架 */}
        <div className="space-y-3">
          <div className="h-6 bg-muted rounded animate-pulse w-32" />
          <div className="space-y-2">
            <div className="h-4 bg-muted rounded animate-pulse" />
            <div className="h-4 bg-muted rounded animate-pulse w-5/6" />
            <div className="h-4 bg-muted rounded animate-pulse w-4/5" />
          </div>
        </div>

        {/* 标签区域骨架 */}
        <div className="space-y-3">
          <div className="h-6 bg-muted rounded animate-pulse w-24" />
          <div className="flex gap-2">
            <div className="h-8 bg-muted rounded-full animate-pulse w-20" />
            <div className="h-8 bg-muted rounded-full animate-pulse w-24" />
            <div className="h-8 bg-muted rounded-full animate-pulse w-16" />
          </div>
        </div>

        {/* 问题区域骨架 */}
        <div className="space-y-3">
          <div className="h-6 bg-muted rounded animate-pulse w-28" />
          <div className="flex flex-wrap gap-2">
            <div className="h-10 bg-muted rounded animate-pulse w-32" />
            <div className="h-10 bg-muted rounded animate-pulse w-28" />
            <div className="h-10 bg-muted rounded animate-pulse w-36" />
          </div>
        </div>
      </div>
    </div>
  );
}
