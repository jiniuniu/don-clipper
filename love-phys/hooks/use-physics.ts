"use client";

import { useQuery, useMutation, useAction } from "convex/react";
import { useCallback, useRef, useState, useEffect } from "react";
import { api } from "../convex/_generated/api";
import { Id } from "../convex/_generated/dataModel";
import { Session, Explanation } from "@/types";
import { useCredits } from "./use-credits";

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
  // 分页相关
  loadMoreSessions: () => void;
  hasMoreSessions: boolean;
  isLoadingMoreSessions: boolean;

  // 操作
  askQuestion: (question: string) => Promise<void>;
  createNewSession: () => Promise<string>;
  deleteSession: (sessionId: string) => Promise<void>;
  retryGeneration: (explanationId: string) => Promise<void>;
  createSessionAndAsk: (question: string) => Promise<string>;
}

export function usePhysics(sessionId?: string): UsePhysicsReturn {
  // 分页状态管理
  const [sessionsPaginationOpts, setSessionsPaginationOpts] = useState({
    numItems: 20, // 每页20个
    cursor: null as string | null,
  });
  const [allSessions, setAllSessions] = useState<Session[]>([]);
  const [hasMoreSessions, setHasMoreSessions] = useState(true);

  const { canUseFeature, isAdmin } = useCredits();

  // 查询 - 使用分页查询
  const sessionsQuery = useQuery(api.queries.getSessionsPaginated, {
    paginationOpts: sessionsPaginationOpts,
  });

  const currentSessionQuery = useQuery(
    api.queries.getSession,
    sessionId ? { sessionId: sessionId as Id<"sessions"> } : "skip"
  );
  const explanationsQuery = useQuery(
    api.queries.getSessionExplanations,
    sessionId ? { sessionId: sessionId as Id<"sessions"> } : "skip"
  );

  const creatingSessionRef = useRef(false);

  // 处理分页结果
  useEffect(() => {
    if (sessionsQuery) {
      if (sessionsPaginationOpts.cursor === null) {
        // 首次加载，替换所有数据
        setAllSessions(sessionsQuery.page);
      } else {
        // 加载更多，追加数据
        setAllSessions((prev) => [...prev, ...sessionsQuery.page]);
      }
      setHasMoreSessions(!sessionsQuery.isDone);
    }
  }, [sessionsQuery, sessionsPaginationOpts.cursor]);

  // 处理后的数据
  const sessions = allSessions;
  const currentSession = currentSessionQuery ?? null;
  const explanations = explanationsQuery ?? [];

  // 加载状态检测
  const isLoadingSessions =
    sessionsQuery === undefined && sessionsPaginationOpts.cursor === null;
  const isLoadingMoreSessions =
    sessionsQuery === undefined && sessionsPaginationOpts.cursor !== null;
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

  // 加载更多sessions
  const loadMoreSessions = useCallback(() => {
    if (
      sessionsQuery &&
      !sessionsQuery.isDone &&
      sessionsQuery.continueCursor
    ) {
      setSessionsPaginationOpts((prev) => ({
        ...prev,
        cursor: sessionsQuery.continueCursor,
      }));
    }
  }, [sessionsQuery]);

  // 提问 - 使用 useCallback 稳定引用
  const askQuestion = useCallback(
    async (question: string) => {
      if (!sessionId) {
        throw new Error("Cannot ask question without a session");
      }

      // 添加积分检查
      if (!isAdmin && !canUseFeature) {
        throw new Error(
          "Insufficient credits for today. Please try again tomorrow."
        );
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
    [sessionId, generateExplanation, isAdmin, canUseFeature] // 添加依赖
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

        // 从本地状态中移除已删除的session
        setAllSessions((prev) =>
          prev.filter((session) => session._id !== sessionIdToDelete)
        );
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

  const createSessionAndAsk = useCallback(
    async (question: string): Promise<string> => {
      // 防重复检查
      if (creatingSessionRef.current) {
        console.log("🚫 Duplicate createSessionAndAsk call blocked");
        throw new Error("Another session creation is in progress");
      }
      // 添加积分检查
      if (!isAdmin && !canUseFeature) {
        throw new Error(
          "Insufficient credits for today. Please try again tomorrow."
        );
      }

      try {
        creatingSessionRef.current = true;

        console.log(
          "🚀 Creating session and asking question atomically:",
          question
        );

        // 1. 创建会话，使用问题作为初始标题
        let sessionTitle = question.trim();
        if (sessionTitle.length > 50) {
          // 智能截取标题
          const sentenceEnd = sessionTitle.substring(0, 47).match(/.*[.!?]/);
          if (sentenceEnd) {
            sessionTitle = sentenceEnd[0];
          } else {
            const wordBoundary = sessionTitle.substring(0, 47).lastIndexOf(" ");
            if (wordBoundary > 20) {
              sessionTitle = sessionTitle.substring(0, wordBoundary) + "...";
            } else {
              sessionTitle = sessionTitle.substring(0, 47) + "...";
            }
          }
        }

        // 直接用问题作为标题创建会话
        console.log("📝 Creating session with title:", sessionTitle);
        const newSessionId = await createSessionMutation({
          title: sessionTitle,
        });

        console.log("✅ Session created:", newSessionId);

        // 2. 启动问题生成（不等待完成）
        console.log("❓ Starting question generation...");
        generateExplanation({
          question,
          sessionId: newSessionId as Id<"sessions">,
        }).catch((error) => {
          console.error("❌ Background question generation failed:", error);
        });

        // 3. 等待一小段时间确保 explanation 记录创建
        await new Promise((resolve) => setTimeout(resolve, 200));

        console.log("✅ Session ready for navigation");
        return newSessionId;
      } catch (error) {
        console.error("❌ Failed to create session and ask question:", error);
        throw error;
      } finally {
        creatingSessionRef.current = false;
      }
    },
    [createSessionMutation, generateExplanation, isAdmin, canUseFeature]
  );

  return {
    sessions,
    currentSession,
    explanations,
    isGenerating,
    isLoadingSessions,
    isLoadingCurrentSession,
    isLoadingExplanations,
    loadMoreSessions,
    hasMoreSessions,
    isLoadingMoreSessions,
    askQuestion,
    createNewSession,
    deleteSession,
    retryGeneration,
    createSessionAndAsk,
  };
}
