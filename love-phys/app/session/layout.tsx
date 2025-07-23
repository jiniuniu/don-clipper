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
      await deleteSession(sessionId);

      // 立即检查当前路径，不依赖 sessions 数组的状态
      const isCurrentSession = pathname === `/session/${sessionId}`;

      // 如果删除的是当前会话，立即跳转
      if (isCurrentSession) {
        router.push("/session");
        return; // 立即返回，不需要再判断其他条件
      }

      // 如果不是当前会话，等待数据更新后再判断是否需要跳转
      // 这里可以添加一个短暂的延迟检查，或者通过其他方式检查
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
