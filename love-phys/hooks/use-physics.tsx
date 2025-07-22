"use client";

import { useState } from "react";
import { useQuery, useMutation, useAction } from "convex/react";
import { api } from "../convex/_generated/api";
import { Id } from "../convex/_generated/dataModel";
import { Session, Explanation } from "@/types";

export interface UsePhysicsReturn {
  // 状态
  sessions: Session[];
  currentSession: Session | null;
  explanations: Explanation[];
  isGenerating: boolean;

  // 操作
  askQuestion: (question: string, sessionId?: string) => Promise<void>;
  selectSession: (sessionId: string) => void;
  createNewSession: () => void;
  deleteSession: (sessionId: string) => Promise<void>;
  retryGeneration: (explanationId: string) => Promise<void>;
}

export function usePhysics(): UsePhysicsReturn {
  const [currentSessionId, setCurrentSessionId] = useState<string | null>(null);

  // 查询
  const sessions = useQuery(api.queries.getSessions) ?? [];
  const currentSession = useQuery(
    api.queries.getSession,
    currentSessionId
      ? { sessionId: currentSessionId as Id<"sessions"> }
      : "skip"
  );
  const explanations =
    useQuery(
      api.queries.getSessionExplanations,
      currentSessionId
        ? { sessionId: currentSessionId as Id<"sessions"> }
        : "skip"
    ) ?? [];

  // 变更
  const generateExplanation = useAction(api.actions.generateExplanation);
  const deleteSessionMutation = useMutation(api.mutations.deleteSession);
  const retryGenerationMutation = useAction(api.actions.retryGeneration);

  // 检查是否正在生成
  const isGenerating = explanations.some((exp) => exp.status === "generating");

  // 提问
  const askQuestion = async (question: string, sessionId?: string) => {
    try {
      const result = await generateExplanation({
        question,
        sessionId: sessionId as Id<"sessions"> | undefined,
      });

      // 如果是新会话，自动切换到该会话
      if (!sessionId && result.sessionId) {
        setCurrentSessionId(result.sessionId);
      }
    } catch (error) {
      console.error("Failed to ask question:", error);
      throw error;
    }
  };

  // 选择会话
  const selectSession = (sessionId: string) => {
    setCurrentSessionId(sessionId);
  };

  // 创建新会话（清除当前选择）
  const createNewSession = () => {
    setCurrentSessionId(null);
  };

  // 删除会话
  const deleteSession = async (sessionId: string) => {
    try {
      await deleteSessionMutation({ sessionId: sessionId as Id<"sessions"> });

      // 如果删除的是当前会话，清除选择
      if (currentSessionId === sessionId) {
        setCurrentSessionId(null);
      }
    } catch (error) {
      console.error("Failed to delete session:", error);
      throw error;
    }
  };

  // 重试生成
  const retryGeneration = async (explanationId: string) => {
    try {
      await retryGenerationMutation({
        explanationId: explanationId as Id<"explanations">,
      });
    } catch (error) {
      console.error("Failed to retry generation:", error);
      throw error;
    }
  };

  return {
    sessions,
    currentSession: currentSession ?? null,
    explanations,
    isGenerating,
    askQuestion,
    selectSession,
    createNewSession,
    deleteSession,
    retryGeneration,
  };
}
