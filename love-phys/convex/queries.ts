import { query } from "./_generated/server";
import { v } from "convex/values";

export const getSessions = query({
  args: {},
  handler: async (ctx) => {
    const identity = await ctx.auth.getUserIdentity();
    if (!identity) {
      return [];
    }

    const sessions = await ctx.db
      .query("sessions")
      .withIndex("by_user", (q) => q.eq("userId", identity.subject))
      .order("desc")
      .collect();
    return sessions;
  },
});

export const getSession = query({
  args: { sessionId: v.id("sessions") },
  handler: async (ctx, { sessionId }) => {
    const identity = await ctx.auth.getUserIdentity();
    if (!identity) {
      return null;
    }

    const session = await ctx.db.get(sessionId);
    // 验证用户权限 - 只有当session有userId时才验证
    if (session && session.userId && session.userId !== identity.subject) {
      return null;
    }
    return session;
  },
});

export const getSessionExplanations = query({
  args: { sessionId: v.id("sessions") },
  handler: async (ctx, { sessionId }) => {
    const identity = await ctx.auth.getUserIdentity();
    if (!identity) {
      return [];
    }

    // 先验证用户对session的权限
    const session = await ctx.db.get(sessionId);
    if (!session) {
      return [];
    }
    // 只有当session有userId时才验证权限
    if (session.userId && session.userId !== identity.subject) {
      return [];
    }

    const explanations = await ctx.db
      .query("explanations")
      .withIndex("by_session", (q) => q.eq("sessionId", sessionId))
      .order("asc")
      .collect();
    return explanations;
  },
});

export const getExplanation = query({
  args: { explanationId: v.id("explanations") },
  handler: async (ctx, { explanationId }) => {
    const identity = await ctx.auth.getUserIdentity();
    if (!identity) {
      return null;
    }

    const explanation = await ctx.db.get(explanationId);
    if (!explanation) {
      return null;
    }

    // 验证用户权限
    const session = await ctx.db.get(explanation.sessionId);
    if (!session) {
      return null;
    }
    // 只有当session有userId时才验证权限
    if (session.userId && session.userId !== identity.subject) {
      return null;
    }

    return explanation;
  },
});

export const getPublicExplanations = query({
  args: {
    category: v.optional(v.string()),
    limit: v.optional(v.number()),
    cursor: v.optional(v.number()), // 用于无限滚动
  },
  handler: async (ctx, { category, limit = 20, cursor = 0 }) => {
    let query = ctx.db
      .query("explanations")
      .withIndex("by_public", (q) => q.eq("isPublic", true));

    // 如果指定了分类，进一步筛选
    if (category) {
      query = ctx.db
        .query("explanations")
        .withIndex("by_category", (q) =>
          q.eq("category", category).eq("isPublic", true)
        );
    }

    const explanations = await query.order("desc").take(limit + cursor);

    // 返回分页数据
    return {
      explanations: explanations.slice(cursor, cursor + limit),
      hasMore: explanations.length > cursor + limit,
      nextCursor: cursor + limit,
    };
  },
});

export const getPublicExplanation = query({
  args: { explanationId: v.id("explanations") },
  handler: async (ctx, { explanationId }) => {
    const explanation = await ctx.db.get(explanationId);

    // 只返回公开的解释
    if (!explanation || !explanation.isPublic) {
      return null;
    }

    return explanation;
  },
});

export const getUsedCategories = query({
  args: {},
  handler: async (ctx) => {
    const explanations = await ctx.db
      .query("explanations")
      .withIndex("by_public", (q) => q.eq("isPublic", true))
      .collect();

    // 统计使用的分类
    const categoryCount: Record<string, number> = {};
    explanations.forEach((exp) => {
      if (exp.category) {
        categoryCount[exp.category] = (categoryCount[exp.category] || 0) + 1;
      }
    });

    return Object.entries(categoryCount).map(([category, count]) => ({
      category,
      count,
    }));
  },
});
