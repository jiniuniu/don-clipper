"use client";

import { usePhysics } from "@/hooks/use-physics";
import { Sidebar } from "@/components/layout/sidebar";
import { useRouter, usePathname } from "next/navigation";

interface SessionLayoutProps {
  children: React.ReactNode;
}

export default function SessionLayout({ children }: SessionLayoutProps) {
  const router = useRouter();
  const pathname = usePathname();
  const { sessions, deleteSession } = usePhysics();

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

  return (
    <div className="flex h-screen">
      <Sidebar
        sessions={sessions}
        activeSessionId={activeSessionId}
        onSessionSelect={handleSessionSelect}
        onNewSession={handleNewSession}
        onDeleteSession={handleDeleteSession}
      />

      <div className="flex-1 flex flex-col min-h-0 overflow-hidden">
        {children}
      </div>
    </div>
  );
}
