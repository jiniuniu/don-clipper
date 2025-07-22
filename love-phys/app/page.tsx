"use client";

import { usePhysics } from "@/hooks/use-physics";
import { Sidebar } from "@/components/layout/sidebar";
import { MainContent } from "@/components/layout/main-content";
import { APP_NAME } from "@/lib/constants";

export default function HomePage() {
  const {
    sessions,
    currentSession,
    explanations,
    isGenerating,
    askQuestion,
    selectSession,
    createNewSession,
    deleteSession,
    retryGeneration,
  } = usePhysics();

  return (
    <div className="flex h-screen overflow-hidden">
      {" "}
      {/* 添加 overflow-hidden */}
      {/* 侧边栏 - 固定 */}
      <Sidebar
        sessions={sessions}
        activeSessionId={currentSession?._id}
        onSessionSelect={selectSession}
        onNewSession={createNewSession}
        onDeleteSession={deleteSession}
      />
      {/* 主内容区 - 固定高度 */}
      <div className="flex-1 flex flex-col min-h-0">
        {" "}
        {/* 添加 min-h-0 */}
        {/* 顶部标题栏 - 固定 */}
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
        {/* 主要内容 - 可滚动 */}
        <MainContent
          explanations={explanations}
          onAskQuestion={askQuestion}
          onRetry={retryGeneration}
          isGenerating={isGenerating}
          className="min-h-0" // 关键：允许内容区域收缩
        />
      </div>
    </div>
  );
}
