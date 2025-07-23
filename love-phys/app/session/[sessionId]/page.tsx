"use client";

import { usePhysics } from "@/hooks/use-physics";
import { MainContent } from "@/components/layout/main-content";
import { APP_NAME } from "@/lib/constants";
import { useRouter, useSearchParams } from "next/navigation";
import { useEffect } from "react";
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

  // 检查会话是否存在
  useEffect(() => {
    // 只有当数据完全加载完成后才进行 404 检查
    if (!isLoadingSessions && !isLoadingCurrentSession && !isGenerating) {
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

  // 处理 URL 中的问题参数
  useEffect(() => {
    if (questionFromUrl && currentSession && !isGenerating) {
      askQuestion(questionFromUrl);
      // 清除 URL 中的问题参数
      const newUrl = `/session/${sessionId}`;
      router.replace(newUrl);
    }
  }, [
    questionFromUrl,
    currentSession,
    askQuestion,
    sessionId,
    router,
    isGenerating,
  ]);
  // 加载状态显示
  if (isLoadingSessions || isLoadingCurrentSession) {
    return (
      <>
        <header className="flex-shrink-0 border-b bg-background/95 backdrop-blur supports-[backdrop-filter]:bg-background/60">
          <div className="flex h-14 items-center px-6">
            <h1 className="font-semibold">{APP_NAME}</h1>
            <span className="ml-4 text-sm text-muted-foreground">
              正在加载会话...
            </span>
          </div>
        </header>
        <div className="flex-1 flex items-center justify-center">
          <div className="text-center">
            <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-primary mx-auto mb-4"></div>
            <p>正在加载会话数据...</p>
          </div>
        </div>
      </>
    );
  }

  return (
    <>
      {/* 顶部标题栏 */}
      <header className="flex-shrink-0 border-b bg-background/95 backdrop-blur supports-[backdrop-filter]:bg-background/60">
        <div className="flex h-14 items-center px-6">
          <h1 className="font-semibold">{APP_NAME}</h1>
          {currentSession && (
            <span className="ml-4 text-sm text-muted-foreground truncate max-w-md">
              {currentSession.title}
            </span>
          )}
        </div>
      </header>

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
