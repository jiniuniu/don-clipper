"use client";

import { usePhysics } from "@/hooks/use-physics";
import { Sidebar } from "@/components/layout/sidebar";
import { useRouter, usePathname } from "next/navigation"; // 添加 usePathname

interface SessionLayoutProps {
  children: React.ReactNode;
}

export default function SessionLayout({ children }: SessionLayoutProps) {
  const router = useRouter();
  const pathname = usePathname(); // 使用 Next.js hook
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

      // 如果要删除当前会话，先计算跳转目标
      let redirectTarget = null;
      if (isCurrentSession) {
        const otherSessions = sessions.filter((s) => s._id !== sessionId);
        redirectTarget =
          otherSessions.length > 0
            ? `/session/${otherSessions[0]._id}`
            : "/session";
      }

      // 执行删除
      await deleteSession(sessionId);

      // 执行跳转
      if (redirectTarget) {
        router.replace(redirectTarget); // 使用 replace 而不是 push
      }
    } catch (error) {
      console.error("Failed to delete session:", error);
    }
  };
  return (
    <div className="flex h-screen overflow-hidden">
      <Sidebar
        sessions={sessions}
        activeSessionId={activeSessionId} // 传入从路径提取的 sessionId
        onSessionSelect={handleSessionSelect}
        onNewSession={handleNewSession}
        onDeleteSession={handleDeleteSession}
      />

      <div className="flex-1 flex flex-col min-h-0">{children}</div>
    </div>
  );
}
