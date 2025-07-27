"use client";

import React, { useState } from "react";
import { AlertCircle, Maximize2, Minimize2 } from "lucide-react";
import { Button } from "@/components/ui/button";
import { cn } from "@/lib/utils";

interface SVGDisplayProps {
  svgCode: string;
  title: string;
  className?: string;
}

export function SVGDisplay({ svgCode, title, className }: SVGDisplayProps) {
  const [hasError, setHasError] = useState(false);
  const [isFullscreen, setIsFullscreen] = useState(false);

  // 简单的 SVG 验证
  const isSVGValid =
    svgCode.trim().startsWith("<svg") && svgCode.trim().endsWith("</svg>");

  if (!isSVGValid || hasError) {
    return (
      <div
        className={cn(
          "bg-muted rounded-lg p-8 text-center border-2 border-dashed",
          className
        )}
      >
        <AlertCircle className="h-12 w-12 text-muted-foreground mx-auto mb-4" />
        <p className="text-muted-foreground font-medium">图示生成失败</p>
        <p className="text-sm text-muted-foreground/70 mt-1">
          SVG 代码格式错误或渲染失败
        </p>
      </div>
    );
  }

  const toggleFullscreen = () => {
    setIsFullscreen(!isFullscreen);
  };

  return (
    <>
      <div className={cn("relative group", className)}>
        {/* SVG 容器 */}
        <div className="bg-white rounded-lg border overflow-hidden shadow-sm">
          {/* 控制栏 */}
          <div className="absolute top-2 right-2 z-10 opacity-0 group-hover:opacity-100 transition-opacity">
            <Button
              variant="secondary"
              size="sm"
              onClick={toggleFullscreen}
              className="h-8 w-8 p-0 bg-background/80 backdrop-blur"
            >
              <Maximize2 className="h-4 w-4" />
            </Button>
          </div>

          {/* SVG 内容 */}
          <div
            className="w-full max-h-[600px] overflow-hidden flex items-center justify-center"
            dangerouslySetInnerHTML={{ __html: svgCode }}
            onError={() => setHasError(true)}
          />
        </div>

        {/* 标题 */}
        <p className="text-xs text-muted-foreground mt-2 text-center">
          📊 {title} - 示意图
        </p>
      </div>

      {/* 全屏模态框 */}
      {isFullscreen && (
        <div className="fixed inset-0 z-50 bg-background/95 backdrop-blur supports-[backdrop-filter]:bg-background/60">
          <div className="flex h-full items-center justify-center p-4">
            <div className="relative max-w-6xl max-h-full w-full">
              {/* 关闭按钮 */}
              <div className="absolute top-4 right-4 z-10">
                <Button
                  variant="secondary"
                  size="sm"
                  onClick={toggleFullscreen}
                  className="h-10 w-10 p-0"
                >
                  <Minimize2 className="h-5 w-5" />
                </Button>
              </div>

              {/* 全屏 SVG */}
              <div className="bg-white rounded-lg border shadow-lg overflow-hidden">
                <div
                  className="w-full h-full min-h-[400px] flex items-center justify-center p-8"
                  dangerouslySetInnerHTML={{ __html: svgCode }}
                />
              </div>

              {/* 全屏标题 */}
              <p className="text-center mt-4 text-lg font-medium">
                📊 {title} - 详细示意图
              </p>
            </div>
          </div>
        </div>
      )}
    </>
  );
}
