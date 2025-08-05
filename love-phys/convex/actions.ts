import { action } from "./_generated/server";
import { v } from "convex/values";
import { api } from "./_generated/api";
import { Id } from "./_generated/dataModel";
import { generatePhysicsContent } from "./chains/content_chain";
import { generateSVGFromContent } from "./chains/svg_chain";

export const generateExplanation = action({
  args: {
    sessionId: v.id("sessions"),
    question: v.string(),
  },
  // eslint-disable-next-line @typescript-eslint/no-explicit-any
  handler: async (ctx, { sessionId, question }): Promise<any> => {
    let explanationId: Id<"explanations"> | undefined;
    try {
      // 添加用户身份验证
      const identity = await ctx.auth.getUserIdentity();
      if (!identity) {
        throw new Error("user not signed in");
      }

      // 1. 验证 Session
      const session = await ctx.runQuery(api.queries.getSession, { sessionId });
      if (!session) throw new Error("Session not found");

      // 验证用户权限 - 适配 optional userId
      if (session.userId && session.userId !== identity.subject) {
        throw new Error("unauthorized");
      }

      // 2. 检查是否已有相同问题的正在处理中的记录
      const existingExplanations = await ctx.runQuery(
        api.queries.getSessionExplanations,
        { sessionId }
      );
      const duplicateInProgress = existingExplanations.find(
        (exp) =>
          exp.question === question &&
          (exp.status === "generating" ||
            exp.status === "content_completed" ||
            exp.status === "svg_generating")
      );

      if (duplicateInProgress) {
        console.log(
          "Duplicate request detected, returning existing explanation ID"
        );
        return {
          sessionId,
          explanationId: duplicateInProgress._id,
          success: true,
        };
      }

      // 3. 创建初始记录
      explanationId = await ctx.runMutation(api.mutations.createExplanation, {
        sessionId,
        question,
      });

      // 4. 构建对话历史
      const conversationHistory = await buildConversationHistory(
        ctx,
        sessionId
      );

      // 第一步：生成内容
      const contentResult = await generatePhysicsContent(
        question,
        conversationHistory
      );

      // 更新为内容完成状态
      await ctx.runMutation(api.mutations.updateExplanation, {
        explanationId,
        explanation: contentResult.explanation,
        relatedPhenomena: contentResult.relatedPhenomena,
        furtherQuestions: contentResult.furtherQuestions,
        status: "content_completed",
      });

      // 更新状态为SVG生成中
      await ctx.runMutation(api.mutations.updateExplanation, {
        explanationId,
        status: "svg_generating",
      });

      // 第二步：生成SVG
      const svgResult = await generateSVGFromContent(
        question,
        contentResult.explanation,
        contentResult.relatedPhenomena
      );

      // 最终完成
      await ctx.runMutation(api.mutations.updateExplanation, {
        explanationId,
        svgCode: svgResult.svgCode,
        status: "completed",
      });

      // 添加积分消耗
      const isAdminFromClerk =
        (identity.publicMetadata as { isAdmin?: boolean })?.isAdmin === true;
      if (!isAdminFromClerk) {
        // 非管理员需要检查积分
        await ctx.runMutation(api.mutations.consumeCredits, {
          userId: identity.subject,
          amount: 1, // 每次提问消耗1积分
        });
      }

      return { sessionId, explanationId, success: true };
    } catch (error) {
      console.error("Failed to generate explanation:", error);
      if (explanationId) {
        await ctx.runMutation(api.mutations.updateExplanation, {
          explanationId,
          status: "failed",
        });
      }
      throw error;
    }
  },
});

export const retryGeneration = action({
  args: { explanationId: v.id("explanations") },
  handler: async (ctx, { explanationId }) => {
    try {
      // 添加用户身份验证
      const identity = await ctx.auth.getUserIdentity();
      if (!identity) {
        throw new Error("user not signed in");
      }

      // 获取原始问题
      const explanation = await ctx.runQuery(api.queries.getExplanation, {
        explanationId,
      });

      if (!explanation) {
        throw new Error("Explanation not found");
      }

      // 通过 getExplanation 查询已经包含了权限验证，所以这里不需要额外验证

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

      // 第一步：重新生成内容
      const contentResult = await generatePhysicsContent(
        explanation.question,
        conversationHistory
      );

      // 更新内容完成状态
      await ctx.runMutation(api.mutations.updateExplanation, {
        explanationId,
        explanation: contentResult.explanation,
        relatedPhenomena: contentResult.relatedPhenomena,
        furtherQuestions: contentResult.furtherQuestions,
        status: "content_completed",
      });

      // 第二步：生成SVG
      await ctx.runMutation(api.mutations.updateExplanation, {
        explanationId,
        status: "svg_generating",
      });

      const svgResult = await generateSVGFromContent(
        explanation.question,
        contentResult.explanation,
        contentResult.relatedPhenomena
      );

      // 最终完成
      await ctx.runMutation(api.mutations.updateExplanation, {
        explanationId,
        svgCode: svgResult.svgCode,
        status: "completed",
      });

      // 添加积分消耗
      const isAdminFromClerk =
        (identity.publicMetadata as { isAdmin?: boolean })?.isAdmin === true;
      if (!isAdminFromClerk) {
        // 非管理员需要检查积分
        await ctx.runMutation(api.mutations.consumeCredits, {
          userId: identity.subject,
          amount: 1, // 每次提问消耗1积分
        });
      }

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
