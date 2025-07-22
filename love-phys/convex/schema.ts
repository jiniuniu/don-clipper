import { defineSchema, defineTable } from "convex/server";
import { v } from "convex/values";

export default defineSchema({
  sessions: defineTable({
    title: v.string(),
    createdAt: v.number(),
    updatedAt: v.number(),
  }),

  explanations: defineTable({
    sessionId: v.id("sessions"),
    question: v.string(),
    svgCode: v.optional(v.string()),
    explanation: v.optional(v.string()),
    relatedPhenomena: v.optional(v.array(v.string())),
    furtherQuestions: v.optional(v.array(v.string())),
    status: v.union(
      v.literal("generating"),
      v.literal("completed"),
      v.literal("failed")
    ),
    createdAt: v.number(),
  }).index("by_session", ["sessionId"]),
});
