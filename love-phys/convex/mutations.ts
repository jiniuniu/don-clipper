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
    slug: v.optional(v.string()),
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

export const createOrUpdateUser = mutation({
  args: {
    email: v.string(),
    name: v.optional(v.string()),
  },
  handler: async (ctx, { email, name }) => {
    const identity = await ctx.auth.getUserIdentity();
    if (!identity) {
      throw new Error("user not signed in");
    }

    const existingUser = await ctx.db
      .query("users")
      .withIndex("by_user_id", (q) => q.eq("userId", identity.subject))
      .first();

    const today = new Date().toISOString().split("T")[0];
    const now = Date.now();

    if (existingUser) {
      // 更新现有用户
      await ctx.db.patch(existingUser._id, {
        email,
        name,
        updatedAt: now,
      });
      return existingUser._id;
    } else {
      // 创建新用户
      const isAdminFromClerk =
        (identity.publicMetadata as { isAdmin?: boolean })?.isAdmin === true;

      const userId = await ctx.db.insert("users", {
        userId: identity.subject,
        email,
        name,
        isAdmin: isAdminFromClerk,
        dailyCredits: 15, // 新用户额外积分
        usedCredits: 0,
        lastResetDate: today,
        totalEarnedCredits: 0,
        createdAt: now,
        updatedAt: now,
      });
      return userId;
    }
  },
});

export const resetDailyCredits = mutation({
  args: { userId: v.string() },
  handler: async (ctx, { userId }) => {
    const user = await ctx.db
      .query("users")
      .withIndex("by_user_id", (q) => q.eq("userId", userId))
      .first();

    if (!user) {
      throw new Error("User not found");
    }

    const today = new Date().toISOString().split("T")[0];

    await ctx.db.patch(user._id, {
      usedCredits: 0,
      lastResetDate: today,
      updatedAt: Date.now(),
    });
  },
});

export const consumeCredits = mutation({
  args: {
    userId: v.string(),
    amount: v.number(),
  },
  handler: async (ctx, { userId, amount }) => {
    const user = await ctx.db
      .query("users")
      .withIndex("by_user_id", (q) => q.eq("userId", userId))
      .first();

    if (!user) {
      throw new Error("User not found");
    }

    // 检查是否为管理员
    if (user.isAdmin) {
      return; // 管理员不消耗积分
    }

    // 检查积分是否足够
    if (user.usedCredits + amount > user.dailyCredits) {
      throw new Error("Insufficient credits");
    }

    await ctx.db.patch(user._id, {
      usedCredits: user.usedCredits + amount,
      updatedAt: Date.now(),
    });
  },
});
