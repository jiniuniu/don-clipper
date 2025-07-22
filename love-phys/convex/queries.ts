import { query } from "./_generated/server";
import { v } from "convex/values";

export const getSessions = query({
  args: {},
  handler: async (ctx) => {
    const sessions = await ctx.db.query("sessions").order("desc").collect();
    return sessions;
  },
});

export const getSession = query({
  args: { sessionId: v.id("sessions") },
  handler: async (ctx, { sessionId }) => {
    const session = await ctx.db.get(sessionId);
    return session;
  },
});

export const getSessionExplanations = query({
  args: { sessionId: v.id("sessions") },
  handler: async (ctx, { sessionId }) => {
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
    const explanation = await ctx.db.get(explanationId);
    return explanation;
  },
});
