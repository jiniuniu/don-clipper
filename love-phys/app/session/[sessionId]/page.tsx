"use client";

import { usePhysics } from "@/hooks/use-physics";
import { MainContent } from "@/components/layout/main-content";
import { useRouter, useSearchParams } from "next/navigation";
import { useEffect, useRef } from "react";
import { notFound } from "next/navigation";
import { use } from "react";

interface SessionDetailPageProps {
  params: Promise<{
    sessionId: string;
  }>;
}

export default function SessionDetailPage({ params }: SessionDetailPageProps) {
  const { sessionId } = use(params);
  const router = useRouter();
  const searchParams = useSearchParams();
  const questionFromUrl = searchParams.get("question");

  // 使用 ref 来跟踪是否已经处理过 URL 中的问题
  const hasProcessedUrlQuestion = useRef(false);

  const {
    sessions,
    currentSession,
    explanations,
    isGenerating,
    isLoadingSessions,
    isLoadingCurrentSession,
    askQuestion,
    retryGeneration,
  } = usePhysics(sessionId);

  // 检查会话是否存在 - 添加防抖逻辑
  useEffect(() => {
    // 只有当数据完全加载完成后才进行 404 检查
    if (!isLoadingSessions && !isLoadingCurrentSession && !isGenerating) {
      // 添加短暂延迟，等待可能的状态更新完成
      const timeoutId = setTimeout(() => {
        // 情况1：sessions 已加载，但列表为空（用户没有任何会话）
        if (sessions.length === 0) {
          console.log("No sessions found, redirecting to /session");
          router.push("/session");
          return;
        }

        // 情况2：sessions 已加载，但当前 sessionId 不存在
        if (sessions.length > 0 && !currentSession) {
          console.log("Session not found, calling notFound()");
          notFound();
          return;
        }
      }, 100); // 100ms 延迟

      return () => clearTimeout(timeoutId);
    }
  }, [
    sessionId,
    sessions,
    currentSession,
    isLoadingSessions,
    isLoadingCurrentSession,
    isGenerating,
    router,
  ]);

  // 处理 URL 中的问题参数 - 兼容新的流程
  useEffect(() => {
    if (
      questionFromUrl &&
      currentSession &&
      !isGenerating &&
      !hasProcessedUrlQuestion.current
    ) {
      console.log("🔍 Processing question from URL:", questionFromUrl);
      hasProcessedUrlQuestion.current = true;

      // 检查是否已经有这个问题的 explanation
      const hasExistingExplanation = explanations.some(
        (exp) => exp.question === questionFromUrl
      );

      if (!hasExistingExplanation) {
        console.log("❓ Asking question from URL");
        askQuestion(questionFromUrl)
          .then(() => {
            console.log("✅ Question from URL processed successfully");
            // 清除 URL 中的问题参数
            const newUrl = `/session/${sessionId}`;
            router.replace(newUrl);
          })
          .catch((error) => {
            console.error("❌ Failed to ask question:", error);
            hasProcessedUrlQuestion.current = false; // 失败时重置，允许重试
          });
      } else {
        console.log("ℹ️ Question already exists, just cleaning URL");
        // 如果问题已经存在，只清理 URL
        const newUrl = `/session/${sessionId}`;
        router.replace(newUrl);
      }
    }

    // 当没有 questionFromUrl 时重置标志
    if (!questionFromUrl) {
      hasProcessedUrlQuestion.current = false;
    }
  }, [
    questionFromUrl,
    currentSession,
    isGenerating,
    explanations,
    askQuestion,
    router,
    sessionId,
  ]);

  // 加载状态显示
  if (isLoadingSessions || isLoadingCurrentSession) {
    return (
      <>
        <div className="flex-1 flex items-center justify-center">
          <div className="text-center">
            <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-primary mx-auto mb-4"></div>
            <p>loading session data...</p>
          </div>
        </div>
      </>
    );
  }

  return (
    <>
      {/* 主要内容 */}
      <MainContent
        explanations={explanations}
        onAskQuestion={askQuestion}
        onRetry={retryGeneration}
        isGenerating={isGenerating}
        className="min-h-0"
      />
    </>
  );
}
