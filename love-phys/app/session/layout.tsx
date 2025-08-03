"use client";

import { usePhysics } from "@/hooks/use-physics";
import { Sidebar } from "@/components/layout/sidebar";
import { useRouter, usePathname } from "next/navigation";
import { useState } from "react";
import { Button } from "@/components/ui/button";
import { Menu } from "lucide-react";

interface SessionLayoutProps {
  children: React.ReactNode;
}

export default function SessionLayout({ children }: SessionLayoutProps) {
  const router = useRouter();
  const pathname = usePathname();
  const {
    sessions,
    deleteSession,
    loadMoreSessions,
    hasMoreSessions,
    isLoadingMoreSessions,
  } = usePhysics();

  // 从路径中提取 sessionId
  const activeSessionId = pathname.match(/^\/session\/([^\/]+)$/)?.[1];

  const handleNewSession = () => {
    router.push("/session");
  };

  const handleSessionSelect = (sessionId: string) => {
    router.push(`/session/${sessionId}`);
  };

  const handleDeleteSession = async (sessionId: string) => {
    try {
      const isCurrentSession = pathname === `/session/${sessionId}`;

      console.log("Deleting session:", sessionId);
      console.log("Is current session:", isCurrentSession);
      console.log("Current pathname:", pathname);
      console.log("Current sessions count:", sessions.length);

      // 先计算跳转目标（在删除之前）
      let redirectTarget: string | null = null;

      if (isCurrentSession) {
        // 计算删除后剩余的会话
        const remainingSessions = sessions.filter((s) => s._id !== sessionId);

        if (remainingSessions.length > 0) {
          // 还有其他会话，跳转到最新的一个（按 updatedAt 排序）
          const sortedSessions = remainingSessions.sort(
            (a, b) => b.updatedAt - a.updatedAt
          );
          redirectTarget = `/session/${sortedSessions[0]._id}`;
        } else {
          // 没有其他会话了，跳转到主页
          redirectTarget = "/session";
        }

        console.log("Calculated redirect target:", redirectTarget);
      }

      // 执行删除操作
      await deleteSession(sessionId);

      // 如果需要跳转，立即执行
      if (redirectTarget) {
        console.log("Executing redirect to:", redirectTarget);
        router.replace(redirectTarget);
      }
    } catch (error) {
      console.error("Failed to delete session:", error);
    }
  };
  const [sidebarOpen, setSidebarOpen] = useState(false);

  return (
    <div className="flex h-screen">
      {/* Desktop Sidebar */}
      <div className="hidden lg:block">
        <Sidebar
          sessions={sessions}
          activeSessionId={activeSessionId}
          onSessionSelect={handleSessionSelect}
          onNewSession={handleNewSession}
          onDeleteSession={handleDeleteSession}
          onLoadMore={loadMoreSessions}
          hasMore={hasMoreSessions}
          isLoadingMore={isLoadingMoreSessions}
        />
      </div>

      {/* Mobile Sidebar Overlay */}
      {sidebarOpen && (
        <div className="fixed inset-0 z-50 lg:hidden">
          <div
            className="fixed inset-0 bg-black/50"
            onClick={() => setSidebarOpen(false)}
          />
          <div className="fixed left-0 top-0 h-full w-80 bg-background">
            <Sidebar
              sessions={sessions}
              activeSessionId={activeSessionId}
              onSessionSelect={(sessionId) => {
                handleSessionSelect(sessionId);
                setSidebarOpen(false);
              }}
              onNewSession={() => {
                handleNewSession();
                setSidebarOpen(false);
              }}
              onDeleteSession={handleDeleteSession}
              onLoadMore={loadMoreSessions}
              hasMore={hasMoreSessions}
              isLoadingMore={isLoadingMoreSessions}
            />
          </div>
        </div>
      )}

      <div className="flex-1 flex flex-col min-h-0 overflow-hidden">
        {/* Mobile Header */}
        <div className="lg:hidden border-b p-4 flex items-center justify-between">
          <Button variant="ghost" onClick={() => setSidebarOpen(true)}>
            <Menu className="h-5 w-5" />
          </Button>
        </div>
        {children}
      </div>
    </div>
  );
}
