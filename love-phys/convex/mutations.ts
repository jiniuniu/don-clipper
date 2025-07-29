import { mutation } from "./_generated/server";
import { v } from "convex/values";

export const createSession = mutation({
  args: { title: v.string() },
  handler: async (ctx, { title }) => {
    const identity = await ctx.auth.getUserIdentity();
    if (!identity) {
      throw new Error("user not signed in");
    }

    const now = Date.now();
    const sessionId = await ctx.db.insert("sessions", {
      title,
      userId: identity.subject, // 新session直接添加当前用户ID
      createdAt: now,
      updatedAt: now,
    });
    return sessionId;
  },
});

export const updateSession = mutation({
  args: {
    sessionId: v.id("sessions"),
    title: v.optional(v.string()),
  },
  handler: async (ctx, { sessionId, title }) => {
    const identity = await ctx.auth.getUserIdentity();
    if (!identity) {
      throw new Error("user not signed in");
    }

    // 验证用户权限
    const session = await ctx.db.get(sessionId);
    if (!session) {
      throw new Error("session not exists");
    }
    // 只有当session有userId时才验证权限
    if (session.userId && session.userId !== identity.subject) {
      throw new Error("unauthorized");
    }

    const updates: { updatedAt: number; title?: string; userId?: string } = {
      updatedAt: Date.now(),
    };

    // 如果session还没有userId，现在添加上
    if (!session.userId) {
      updates.userId = identity.subject;
    }

    if (title !== undefined) {
      updates.title = title;
    }

    await ctx.db.patch(sessionId, updates);
  },
});

export const createExplanation = mutation({
  args: {
    sessionId: v.id("sessions"),
    question: v.string(),
  },
  handler: async (ctx, { sessionId, question }) => {
    const identity = await ctx.auth.getUserIdentity();
    if (!identity) {
      throw new Error("user not signed in");
    }

    // 验证用户权限
    const session = await ctx.db.get(sessionId);
    if (!session) {
      throw new Error("session not exists");
    }
    // 只有当session有userId时才验证权限
    if (session.userId && session.userId !== identity.subject) {
      throw new Error("unauthorized");
    }

    // 如果session还没有userId，现在添加上
    if (!session.userId) {
      await ctx.db.patch(sessionId, {
        userId: identity.subject,
        updatedAt: Date.now(),
      });
    }

    const explanationId = await ctx.db.insert("explanations", {
      sessionId,
      question,
      status: "generating",
      createdAt: Date.now(),
    });
    return explanationId;
  },
});

export const updateExplanation = mutation({
  args: {
    explanationId: v.id("explanations"),
    svgCode: v.optional(v.string()),
    explanation: v.optional(v.string()),
    relatedPhenomena: v.optional(v.array(v.string())),
    furtherQuestions: v.optional(v.array(v.string())),
    status: v.optional(
      v.union(
        v.literal("generating"),
        v.literal("content_completed"),
        v.literal("svg_generating"),
        v.literal("completed"),
        v.literal("failed")
      )
    ),
    isPublic: v.optional(v.boolean()),
    category: v.optional(v.string()),
    subcategory: v.optional(v.string()),
  },
  handler: async (ctx, { explanationId, ...updates }) => {
    const identity = await ctx.auth.getUserIdentity();
    if (!identity) {
      throw new Error("user not signed in");
    }

    // 验证用户权限
    const explanation = await ctx.db.get(explanationId);
    if (!explanation) {
      throw new Error("explanation not found");
    }

    const session = await ctx.db.get(explanation.sessionId);
    if (!session) {
      throw new Error("session not found");
    }
    // 只有当session有userId时才验证权限
    if (session.userId && session.userId !== identity.subject) {
      throw new Error("unauthorized");
    }

    await ctx.db.patch(explanationId, updates);
  },
});

export const deleteSession = mutation({
  args: { sessionId: v.id("sessions") },
  handler: async (ctx, { sessionId }) => {
    const identity = await ctx.auth.getUserIdentity();
    if (!identity) {
      throw new Error("user not signed in");
    }

    // 验证用户权限
    const session = await ctx.db.get(sessionId);
    if (!session) {
      throw new Error("session not found");
    }
    // 只有当session有userId时才验证权限
    if (session.userId && session.userId !== identity.subject) {
      throw new Error("unauthorized");
    }

    // 删除 session 下的所有 explanations
    const explanations = await ctx.db
      .query("explanations")
      .withIndex("by_session", (q) => q.eq("sessionId", sessionId))
      .collect();

    for (const explanation of explanations) {
      await ctx.db.delete(explanation._id);
    }

    // 删除 session
    await ctx.db.delete(sessionId);
  },
});
