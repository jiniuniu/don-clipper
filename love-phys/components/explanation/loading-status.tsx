"use client";

import React, { useState, useEffect } from "react";
import { Brain, Image, CheckCircle, Loader2, Clock } from "lucide-react";

interface LoadingExplanationProps {
  status: "generating" | "content_completed" | "svg_generating";
  className?: string;
}

// 定义两个主要步骤，包含预计时间
const LOADING_PHASES = [
  {
    key: "generating",
    icon: Brain,
    title: "生成物理解释",
    description: "分析物理现象并生成详细解释...",
    estimatedTime: "30-60秒",
  },
  {
    key: "svg_generating",
    icon: Image,
    title: "绘制演示图示",
    description: "根据解释生成可视化图表...",
    estimatedTime: "1-2分钟",
  },
] as const;

export function LoadingExplanation({
  status,
  className,
}: LoadingExplanationProps) {
  const [startTime] = useState(() => Date.now());
  const [elapsedTime, setElapsedTime] = useState(0);
  const [phaseStartTimes, setPhaseStartTimes] = useState<
    Record<string, number>
  >({});

  // 根据状态确定当前阶段
  const statusToPhaseMap = {
    generating: 0,
    content_completed: 0, // 内容完成仍显示第一阶段
    svg_generating: 1,
  };

  const currentPhaseIndex = statusToPhaseMap[status];
  const currentPhase = LOADING_PHASES[currentPhaseIndex];
  const CurrentIcon = currentPhase?.icon || Loader2;

  // 记录每个阶段的开始时间
  useEffect(() => {
    if (currentPhase && !phaseStartTimes[currentPhase.key]) {
      setPhaseStartTimes((prev) => ({
        ...prev,
        [currentPhase.key]: Date.now(),
      }));
    }
  }, [status, currentPhase, phaseStartTimes]);

  // 更新总执行时间
  useEffect(() => {
    const timer = setInterval(() => {
      setElapsedTime(Date.now() - startTime);
    }, 1000);

    return () => clearInterval(timer);
  }, [startTime]);

  // 格式化时间显示
  const formatTime = (ms: number) => {
    const seconds = Math.floor(ms / 1000);
    const minutes = Math.floor(seconds / 60);
    const remainingSeconds = seconds % 60;

    if (minutes > 0) {
      return `${minutes}分${remainingSeconds}秒`;
    }
    return `${remainingSeconds}秒`;
  };

  return (
    <div className={`space-y-6 ${className}`}>
      {/* 执行时间显示 */}
      <div className="flex justify-center">
        <div className="flex items-center space-x-2 px-3 py-1 bg-blue-50 rounded-full">
          <Clock className="h-4 w-4 text-blue-600" />
          <span className="text-blue-700 text-sm">
            已用时: {formatTime(elapsedTime)}
          </span>
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
        <p className="text-xs text-muted-foreground mb-2">
          {currentPhase?.description}
        </p>

        {/* 特别提示图表生成时间 */}
        {status === "svg_generating" && (
          <div className="mt-2 p-2 bg-amber-50 rounded border border-amber-200">
            <p className="text-xs text-amber-700">
              ⏰ 图表生成需要1-2分钟，请耐心等待
            </p>
          </div>
        )}
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
