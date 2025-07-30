"use client";

import { usePhysics } from "@/hooks/use-physics";
import { EmptyState } from "@/components/input/empty-state";
import { useRouter } from "next/navigation";
import { useRef, useState } from "react";

export default function SessionPage() {
  const router = useRouter();
  const { createSessionAndAsk } = usePhysics();

  // 状态管理
  const [isCreatingSession, setIsCreatingSession] = useState(false);
  const [loadingMessage, setLoadingMessage] = useState("");

  // 防重复逻辑
  const lastQuestionRef = useRef<string>("");
  const lastSubmitTimeRef = useRef<number>(0);

  const handleStartExploring = async (question: string) => {
    const now = Date.now();
    const timeSinceLastSubmit = now - lastSubmitTimeRef.current;

    // 防止相同问题在短时间内重复提交（2秒内）
    if (lastQuestionRef.current === question && timeSinceLastSubmit < 2000) {
      console.log("🚫 Duplicate question submitted too quickly, ignoring");
      return;
    }

    // 防止重复点击
    if (isCreatingSession) {
      console.log("🚫 Already creating session, ignoring");
      return;
    }

    try {
      setIsCreatingSession(true);
      lastQuestionRef.current = question;
      lastSubmitTimeRef.current = now;

      console.log("🚀 Starting exploration with question:", question);

      // 第一阶段：创建会话
      setLoadingMessage("Creating your exploration...");
      const sessionId = await createSessionAndAsk(question);
      console.log("✅ Session created and question asked:", sessionId);

      // 第二阶段：准备跳转
      setLoadingMessage("Preparing your session...");
      await new Promise((resolve) => setTimeout(resolve, 500));

      // 第三阶段：跳转
      setLoadingMessage("Opening your exploration...");
      console.log("🔄 Navigating to session:", sessionId);
      router.push(`/session/${sessionId}`);

      // 延迟重置状态，确保跳转完成
      setTimeout(() => {
        setIsCreatingSession(false);
        setLoadingMessage("");
      }, 3000);
    } catch (error) {
      console.error("❌ Failed to start exploring:", error);
      // 重置状态以允许重试
      lastQuestionRef.current = "";
      setIsCreatingSession(false);
      setLoadingMessage("");
    }
  };

  // 如果正在创建会话，显示 loading 状态
  if (isCreatingSession) {
    return (
      <div className="flex-1 flex items-center justify-center">
        <div className="text-center space-y-4">
          <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-primary mx-auto"></div>
          <div className="space-y-2">
            <p className="text-lg font-medium">{loadingMessage}</p>
            <p className="text-sm text-muted-foreground">
              This may take a moment...
            </p>
          </div>
        </div>
      </div>
    );
  }

  return (
    <>
      {/* 空状态 */}
      <div className="flex-1">
        <EmptyState onSubmit={handleStartExploring} />
      </div>
    </>
  );
}
