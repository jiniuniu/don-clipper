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
