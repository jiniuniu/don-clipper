import { action } from "./_generated/server";
import { v } from "convex/values";
import { api } from "./_generated/api";
import { generatePhysicsExplanation } from "./llm";
import { Id } from "./_generated/dataModel";

export const generateExplanation = action({
  args: {
    sessionId: v.id("sessions"), // 现在是必需的
    question: v.string(),
  },
  // eslint-disable-next-line @typescript-eslint/no-explicit-any
  handler: async (ctx, { sessionId, question }): Promise<any> => {
    let explanationId: Id<"explanations"> | undefined;
    try {
      // 1. 验证 Session 是否存在
      const session = await ctx.runQuery(api.queries.getSession, {
        sessionId,
      });

      if (!session) {
        throw new Error("Session not found");
      }

      // 2. 创建 generating 状态的解释记录
      explanationId = await ctx.runMutation(api.mutations.createExplanation, {
        sessionId,
        question,
      });

      // 3. 构建对话历史
      const conversationHistory = await buildConversationHistory(
        ctx,
        sessionId
      );

      // 4. 生成物理解释
      const result = await generatePhysicsExplanation(
        question,
        conversationHistory
      );

      // 5. 更新解释记录
      await ctx.runMutation(api.mutations.updateExplanation, {
        explanationId,
        svgCode: result.svgCode,
        explanation: result.explanation,
        relatedPhenomena: result.relatedPhenomena,
        furtherQuestions: result.furtherQuestions,
        status: "completed",
      });

      // 6. 更新 Session 时间戳和标题（如果需要）
      const shouldUpdateTitle =
        question.length <= 50 && session.title === "新的物理探索";
      await ctx.runMutation(api.mutations.updateSession, {
        sessionId,
        title: shouldUpdateTitle
          ? question.slice(0, 30) + (question.length > 30 ? "..." : "")
          : undefined,
      });

      return {
        sessionId,
        explanationId,
        success: true,
      };
    } catch (error) {
      console.error("Failed to generate explanation:", error);

      // 错误处理：标记解释为失败状态
      if (explanationId) {
        await ctx.runMutation(api.mutations.updateExplanation, {
          explanationId,
          status: "failed",
        });
      }

      throw new Error(`Failed to generate explanation: ${error}`);
    }
  },
});

export const retryGeneration = action({
  args: { explanationId: v.id("explanations") },
  handler: async (ctx, { explanationId }) => {
    try {
      // 获取原始问题
      const explanation = await ctx.runQuery(api.queries.getExplanation, {
        explanationId,
      });

      if (!explanation) {
        throw new Error("Explanation not found");
      }

      // 重置状态为 generating
      await ctx.runMutation(api.mutations.updateExplanation, {
        explanationId,
        status: "generating",
      });

      // 构建对话历史
      const conversationHistory = await buildConversationHistory(
        ctx,
        explanation.sessionId
      );

      // 重新生成
      const result = await generatePhysicsExplanation(
        explanation.question,
        conversationHistory
      );

      // 更新结果
      await ctx.runMutation(api.mutations.updateExplanation, {
        explanationId,
        svgCode: result.svgCode,
        explanation: result.explanation,
        relatedPhenomena: result.relatedPhenomena,
        furtherQuestions: result.furtherQuestions,
        status: "completed",
      });

      return { success: true };
    } catch (error) {
      // 标记为失败
      await ctx.runMutation(api.mutations.updateExplanation, {
        explanationId,
        status: "failed",
      });

      throw new Error(`Failed to generate explanation: ${error}`);
    }
  },
});

async function buildConversationHistory(
  // eslint-disable-next-line @typescript-eslint/no-explicit-any
  ctx: any,
  sessionId: Id<"sessions">
): Promise<Array<{ role: string; content: string }>> {
  const explanations = await ctx.runQuery(api.queries.getSessionExplanations, {
    sessionId,
  });

  const messages: Array<{ role: string; content: string }> = [];

  for (const explanation of explanations) {
    if (explanation.status === "completed") {
      // 用户问题
      messages.push({
        role: "user",
        content: explanation.question,
      });

      // AI 解释（只使用核心解释文本）
      if (explanation.explanation) {
        messages.push({
          role: "assistant",
          content: explanation.explanation,
        });
      }
    }
  }

  // 限制历史长度，避免 token 超限
  const maxMessages = 10;
  return messages.slice(-maxMessages);
}
