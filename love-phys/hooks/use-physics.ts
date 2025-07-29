"use client";

import { useQuery, useMutation, useAction } from "convex/react";
import { useCallback } from "react";
import { api } from "../convex/_generated/api";
import { Id } from "../convex/_generated/dataModel";
import { Session, Explanation } from "@/types";

export interface UsePhysicsReturn {
  // 状态
  sessions: Session[];
  currentSession: Session | null;
  explanations: Explanation[];
  isGenerating: boolean;
  // 新增加载状态
  isLoadingSessions: boolean;
  isLoadingCurrentSession: boolean;
  isLoadingExplanations: boolean;

  // 操作
  askQuestion: (question: string) => Promise<void>;
  createNewSession: () => Promise<string>;
  deleteSession: (sessionId: string) => Promise<void>;
  retryGeneration: (explanationId: string) => Promise<void>;
}

export function usePhysics(sessionId?: string): UsePhysicsReturn {
  // 查询 - 保存原始查询结果以检测加载状态
  const sessionsQuery = useQuery(api.queries.getSessions);
  const currentSessionQuery = useQuery(
    api.queries.getSession,
    sessionId ? { sessionId: sessionId as Id<"sessions"> } : "skip"
  );
  const explanationsQuery = useQuery(
    api.queries.getSessionExplanations,
    sessionId ? { sessionId: sessionId as Id<"sessions"> } : "skip"
  );

  // 处理后的数据
  const sessions = sessionsQuery ?? [];
  const currentSession = currentSessionQuery ?? null;
  const explanations = explanationsQuery ?? [];

  // 加载状态检测
  const isLoadingSessions = sessionsQuery === undefined;
  const isLoadingCurrentSession = sessionId
    ? currentSessionQuery === undefined
    : false;
  const isLoadingExplanations = sessionId
    ? explanationsQuery === undefined
    : false;

  // 变更
  const generateExplanation = useAction(api.actions.generateExplanation);
  const deleteSessionMutation = useMutation(api.mutations.deleteSession);
  const retryGenerationAction = useAction(api.actions.retryGeneration);
  const createSessionMutation = useMutation(api.mutations.createSession);

  // 检查是否正在生成
  const isGenerating = explanations.some((exp) => exp.status === "generating");

  // 提问 - 使用 useCallback 稳定引用
  const askQuestion = useCallback(
    async (question: string) => {
      if (!sessionId) {
        throw new Error("Cannot ask question without a session");
      }

      try {
        await generateExplanation({
          question,
          sessionId: sessionId as Id<"sessions">,
        });
      } catch (error) {
        console.error("Failed to ask question:", error);
        throw error;
      }
    },
    [sessionId, generateExplanation]
  );

  // 创建新会话 - 使用 useCallback
  const createNewSession = useCallback(async (): Promise<string> => {
    try {
      const newSessionId = await createSessionMutation({
        title: "new exploration",
      });
      return newSessionId;
    } catch (error) {
      console.error("Failed to create new session:", error);
      throw error;
    }
  }, [createSessionMutation]);

  // 删除会话 - 使用 useCallback
  const deleteSession = useCallback(
    async (sessionIdToDelete: string) => {
      try {
        await deleteSessionMutation({
          sessionId: sessionIdToDelete as Id<"sessions">,
        });
      } catch (error) {
        console.error("Failed to delete session:", error);
        throw error;
      }
    },
    [deleteSessionMutation]
  );

  // 重试生成 - 使用 useCallback
  const retryGeneration = useCallback(
    async (explanationId: string) => {
      try {
        await retryGenerationAction({
          explanationId: explanationId as Id<"explanations">,
        });
      } catch (error) {
        console.error("Failed to retry generation:", error);
        throw error;
      }
    },
    [retryGenerationAction]
  );

  return {
    sessions,
    currentSession,
    explanations,
    isGenerating,
    isLoadingSessions,
    isLoadingCurrentSession,
    isLoadingExplanations,
    askQuestion,
    createNewSession,
    deleteSession,
    retryGeneration,
  };
}
