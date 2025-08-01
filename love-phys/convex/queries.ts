import { paginationOptsValidator } from "convex/server";
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
    paginationOpts: paginationOptsValidator,
    category: v.optional(v.string()),
    requireSlug: v.optional(v.boolean()), // 新增参数：是否要求有 slug
  },
  handler: async (ctx, { paginationOpts, category, requireSlug = false }) => {
    let queryBuilder = ctx.db
      .query("explanations")
      .withIndex("by_public", (q) => q.eq("isPublic", true));

    // 如果指定了分类，进一步筛选
    if (category) {
      queryBuilder = ctx.db
        .query("explanations")
        .withIndex("by_category", (q) =>
          q.eq("category", category).eq("isPublic", true)
        );
    }

    // 如果要求有 slug，添加过滤条件
    if (requireSlug) {
      queryBuilder = queryBuilder.filter((q) =>
        q.neq(q.field("slug"), undefined)
      );
    }

    // 使用 Convex 官方的 paginate 方法
    const result = await queryBuilder.order("desc").paginate(paginationOpts);

    return result;
    // result 包含:
    // - page: 当前页的数据数组
    // - continueCursor: 下一页的游标（字符串）
    // - isDone: 是否已经到最后一页
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
    // 只统计有 slug 且公开的内容
    const explanations = await ctx.db
      .query("explanations")
      .withIndex("by_public", (q) => q.eq("isPublic", true))
      .filter((q) => q.neq(q.field("slug"), undefined))
      .collect();

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

export const getSessionsPaginated = query({
  args: {
    paginationOpts: paginationOptsValidator,
  },
  handler: async (ctx, { paginationOpts }) => {
    const identity = await ctx.auth.getUserIdentity();
    if (!identity) {
      return {
        page: [],
        continueCursor: null,
        isDone: true,
      };
    }

    // 使用 Convex 官方的 paginate 方法
    const result = await ctx.db
      .query("sessions")
      .withIndex("by_user", (q) => q.eq("userId", identity.subject))
      .order("desc")
      .paginate(paginationOpts);

    return result;
    // result 包含:
    // - page: 当前页的数据数组
    // - continueCursor: 下一页的游标（字符串）
    // - isDone: 是否已经到最后一页
  },
});

export const getPublicExplanationBySlug = query({
  args: { slug: v.string() },
  handler: async (ctx, { slug }) => {
    const explanation = await ctx.db
      .query("explanations")
      .withIndex("by_slug", (q) => q.eq("slug", slug))
      .filter((q) => q.eq(q.field("isPublic"), true))
      .first();

    return explanation;
  },
});
