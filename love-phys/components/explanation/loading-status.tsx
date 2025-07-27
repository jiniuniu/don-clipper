"use client";

import React from "react";
import { Brain, Lightbulb, Image, CheckCircle, Loader2 } from "lucide-react";

interface LoadingExplanationProps {
  status: "generating" | "content_completed" | "svg_generating";
  className?: string;
}

// 定义三个真实的步骤
const LOADING_PHASES = [
  {
    key: "generating",
    icon: Brain,
    title: "分析物理现象",
    description: "理解问题背后的物理原理...",
  },
  {
    key: "content_completed",
    icon: Lightbulb,
    title: "生成原理解释",
    description: "整理物理概念和相关现象...",
  },
  {
    key: "svg_generating",
    icon: Image,
    title: "绘制演示图示",
    description: "根据解释生成可视化图表...",
  },
] as const;

export function LoadingExplanation({
  status,
  className,
}: LoadingExplanationProps) {
  // 根据状态确定当前阶段
  const statusToPhaseMap = {
    generating: 0,
    content_completed: 1,
    svg_generating: 2,
  };

  const currentPhaseIndex = statusToPhaseMap[status];
  const currentPhase = LOADING_PHASES[currentPhaseIndex];
  const CurrentIcon = currentPhase?.icon || Loader2;

  return (
    <div className={`space-y-6 ${className}`}>
      {/* 主要状态显示 */}
      <div className="text-center py-8">
        <div className="relative mb-6">
          <CurrentIcon className="h-12 w-12 animate-spin mx-auto text-primary" />
          {/* 脉冲效果 */}
          <div className="absolute inset-0 h-12 w-12 mx-auto rounded-full bg-primary/20 animate-ping" />
        </div>

        <h3 className="text-lg font-medium mb-2">正在生成物理解释</h3>
        <p className="text-sm text-muted-foreground mb-4">
          {currentPhase?.description || "正在处理中..."}
        </p>

        {/* 简单的步骤指示 */}
        <div className="text-xs text-muted-foreground">
          步骤 {currentPhaseIndex + 1} / {LOADING_PHASES.length}
        </div>
      </div>

      {/* 阶段指示器 */}
      <div className="flex justify-center space-x-6">
        {LOADING_PHASES.map((phase, index) => {
          const Icon = phase.icon;
          const isActive = index === currentPhaseIndex;
          const isCompleted = index < currentPhaseIndex;
          const isFuture = index > currentPhaseIndex;

          return (
            <div
              key={phase.key}
              className={`flex flex-col items-center space-y-2 transition-all duration-500 ${
                isActive
                  ? "scale-110"
                  : isCompleted
                    ? "scale-100 opacity-80"
                    : "scale-95 opacity-40"
              }`}
            >
              {/* 图标容器 */}
              <div
                className={`relative p-3 rounded-full border-2 transition-all duration-300 ${
                  isActive
                    ? "border-primary bg-primary/10 text-primary shadow-lg"
                    : isCompleted
                      ? "border-green-500 bg-green-50 text-green-600"
                      : "border-muted-foreground/30 bg-muted/30 text-muted-foreground"
                }`}
              >
                {isCompleted ? (
                  <CheckCircle className="h-5 w-5" />
                ) : (
                  <Icon
                    className={`h-5 w-5 ${isActive ? "animate-pulse" : ""}`}
                  />
                )}

                {/* 当前阶段的光晕效果 */}
                {isActive && (
                  <div className="absolute inset-0 rounded-full border-2 border-primary/30 animate-ping" />
                )}
              </div>

              {/* 阶段标题和状态 */}
              <div className="text-center">
                <p
                  className={`text-xs font-medium transition-colors ${
                    isActive
                      ? "text-primary"
                      : isCompleted
                        ? "text-green-600"
                        : "text-muted-foreground"
                  }`}
                >
                  {phase.title}
                </p>

                {/* 状态指示 */}
                <div className="mt-1">
                  {isCompleted && (
                    <div className="flex items-center justify-center space-x-1">
                      <div className="w-1.5 h-1.5 bg-green-500 rounded-full" />
                      <span className="text-xs text-green-600">完成</span>
                    </div>
                  )}
                  {isActive && (
                    <div className="flex items-center justify-center space-x-1">
                      <div className="w-1.5 h-1.5 bg-primary rounded-full animate-pulse" />
                      <span className="text-xs text-primary">进行中</span>
                    </div>
                  )}
                  {isFuture && (
                    <div className="flex items-center justify-center space-x-1">
                      <div className="w-1.5 h-1.5 bg-muted-foreground/50 rounded-full" />
                      <span className="text-xs text-muted-foreground">
                        等待
                      </span>
                    </div>
                  )}
                </div>
              </div>
            </div>
          );
        })}
      </div>

      {/* 连接线 */}
      <div className="flex justify-center">
        <div className="flex items-center space-x-4">
          {LOADING_PHASES.map((_, index) => {
            if (index === LOADING_PHASES.length - 1) return null;

            const isCompleted = index < currentPhaseIndex;
            const isActive =
              index === currentPhaseIndex - 1 && currentPhaseIndex > 0;

            return (
              <div
                key={index}
                className={`h-0.5 w-12 transition-all duration-500 ${
                  isCompleted
                    ? "bg-green-500"
                    : isActive
                      ? "bg-gradient-to-r from-green-500 to-primary animate-pulse"
                      : "bg-muted-foreground/30"
                }`}
              />
            );
          })}
        </div>
      </div>

      {/* 当前阶段提示 */}
      <div className="bg-muted/30 rounded-lg p-4 text-center">
        <div className="flex items-center justify-center space-x-2 mb-2">
          <CurrentIcon className="h-4 w-4 animate-spin text-primary" />
          <span className="text-sm font-medium text-foreground">
            {currentPhase?.title}
          </span>
        </div>
        <p className="text-xs text-muted-foreground">
          {currentPhase?.description}
        </p>
      </div>

      {/* 提示文本 */}
      <div className="text-center">
        <p className="text-xs text-muted-foreground">
          💡 AI 正在运用物理知识为您生成详细解释...
        </p>
      </div>
    </div>
  );
}
