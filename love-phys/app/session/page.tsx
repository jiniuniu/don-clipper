"use client";

import { usePhysics } from "@/hooks/use-physics";
import { EmptyState } from "@/components/input/empty-state";
import { APP_NAME } from "@/lib/constants";
import { useRouter } from "next/navigation";
import { UserAvatar } from "@/components/layout/user-avatar";

export default function SessionPage() {
  const router = useRouter();
  const { createNewSession } = usePhysics();

  const handleStartExploring = async (question: string) => {
    try {
      const sessionId = await createNewSession();
      router.push(
        `/session/${sessionId}?question=${encodeURIComponent(question)}`
      );
    } catch (error) {
      console.error("Failed to start exploring:", error);
    }
  };

  return (
    <>
      {/* 顶部标题栏 */}
      <header className="flex-shrink-0 border-b bg-background/95 backdrop-blur supports-[backdrop-filter]:bg-background/60">
        <div className="flex h-14 items-center justify-between px-6">
          <div className="flex items-center">
            <h1 className="font-semibold">{APP_NAME}</h1>
            <span className="ml-4 text-sm text-muted-foreground">
              select a session or start new exploration
            </span>
          </div>
          <UserAvatar />
        </div>
      </header>

      {/* 空状态 */}
      <div className="flex-1">
        <EmptyState onSubmit={handleStartExploring} />
      </div>
    </>
  );
}
