"use client";

import { usePhysics } from "@/hooks/use-physics";
import { EmptyState } from "@/components/input/empty-state";
import { useRouter } from "next/navigation";

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
      {/* 空状态 */}
      <div className="flex-1">
        <EmptyState onSubmit={handleStartExploring} />
      </div>
    </>
  );
}
