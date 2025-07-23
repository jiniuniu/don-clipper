import { mutation } from "./_generated/server";
import { v } from "convex/values";

export const createSession = mutation({
  args: { title: v.string() },
  handler: async (ctx, { title }) => {
    const now = Date.now();
    const sessionId = await ctx.db.insert("sessions", {
      title,
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
    const updates: { updatedAt: number; title?: string } = {
      updatedAt: Date.now(),
    };

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
        v.literal("completed"),
        v.literal("failed")
      )
    ),
  },
  handler: async (ctx, { explanationId, ...updates }) => {
    await ctx.db.patch(explanationId, updates);
  },
});

export const deleteSession = mutation({
  args: { sessionId: v.id("sessions") },
  handler: async (ctx, { sessionId }) => {
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
