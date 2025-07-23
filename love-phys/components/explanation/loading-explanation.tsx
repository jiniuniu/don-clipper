"use client";

import React, { useState, useEffect } from "react";
import { Loader2, Sparkles, Brain, Lightbulb } from "lucide-react";
import { Progress } from "@/components/ui/progress";

interface LoadingExplanationProps {
  className?: string;
}

const LOADING_STEPS = [
  { icon: Brain, text: "分析物理现象...", duration: 5000 },
  { icon: Sparkles, text: "生成图示说明...", duration: 15000 },
  { icon: Lightbulb, text: "整理相关概念...", duration: 5000 },
  { icon: Loader2, text: "完善解释内容...", duration: 5000 },
];

export function LoadingExplanation({ className }: LoadingExplanationProps) {
  const [currentStep, setCurrentStep] = useState(0);
  const [progress, setProgress] = useState(0);
  // eslint-disable-next-line @typescript-eslint/no-unused-vars
  const [stepProgress, setStepProgress] = useState(0);

  useEffect(() => {
    let stepStartTime = Date.now();

    const interval = setInterval(() => {
      const now = Date.now();
      const stepElapsed = now - stepStartTime;
      const currentStepDuration = LOADING_STEPS[currentStep]?.duration || 1000;

      // 更新当前步骤进度
      const newStepProgress = Math.min(
        100,
        (stepElapsed / currentStepDuration) * 100
      );
      setStepProgress(newStepProgress);

      // 更新总进度
      const stepWeight = 100 / LOADING_STEPS.length;
      const newProgress =
        currentStep * stepWeight + (newStepProgress * stepWeight) / 100;
      setProgress(Math.min(95, newProgress)); // 最多到95%，避免到100%

      // 检查是否需要切换到下一步
      if (
        stepElapsed >= currentStepDuration &&
        currentStep < LOADING_STEPS.length - 1
      ) {
        setCurrentStep((prev) => prev + 1);
        stepStartTime = now;
        setStepProgress(0);
      }
    }, 100);

    return () => clearInterval(interval);
  }, [currentStep]);

  const CurrentIcon = LOADING_STEPS[currentStep]?.icon || Loader2;
  const currentText = LOADING_STEPS[currentStep]?.text || "正在生成...";

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
        <p className="text-sm text-muted-foreground mb-4">{currentText}</p>

        {/* 进度条 */}
        <div className="max-w-xs mx-auto space-y-2">
          <Progress value={progress} className="h-2" />
          <p className="text-xs text-muted-foreground">
            {Math.round(progress)}% 完成
          </p>
        </div>
      </div>

      {/* 步骤指示器 */}
      <div className="flex justify-center space-x-4">
        {LOADING_STEPS.map((step, index) => {
          const Icon = step.icon;
          const isActive = index === currentStep;
          const isCompleted = index < currentStep;

          return (
            <div
              key={index}
              className={`flex flex-col items-center space-y-1 transition-all duration-300 ${
                isActive
                  ? "scale-110"
                  : isCompleted
                    ? "opacity-60"
                    : "opacity-30"
              }`}
            >
              <div
                className={`p-2 rounded-full border-2 transition-colors ${
                  isActive
                    ? "border-primary bg-primary/10 text-primary"
                    : isCompleted
                      ? "border-green-500 bg-green-50 text-green-600"
                      : "border-muted-foreground/30 text-muted-foreground"
                }`}
              >
                <Icon
                  className={`h-4 w-4 ${isActive ? "animate-pulse" : ""}`}
                />
              </div>
              <span className="text-xs text-muted-foreground text-center max-w-16">
                {step.text.split("...")[0]}
              </span>
            </div>
          );
        })}
      </div>

      {/* 提示文本 */}
      <div className="text-center">
        <p className="text-xs text-muted-foreground">
          💡 我正在分析这个现象的物理原理，请稍等片刻...
        </p>
      </div>
    </div>
  );
}
