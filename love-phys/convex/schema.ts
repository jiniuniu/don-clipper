import { defineSchema, defineTable } from "convex/server";
import { v } from "convex/values";

export default defineSchema({
  sessions: defineTable({
    title: v.string(),
    userId: v.optional(v.string()),
    createdAt: v.number(),
    updatedAt: v.number(),
  }).index("by_user", ["userId"]),

  explanations: defineTable({
    sessionId: v.id("sessions"),
    question: v.string(),
    svgCode: v.optional(v.string()),
    explanation: v.optional(v.string()),
    relatedPhenomena: v.optional(v.array(v.string())),
    furtherQuestions: v.optional(v.array(v.string())),
    status: v.union(
      v.literal("generating"), // 开始生成内容
      v.literal("content_completed"), // 内容生成完成，准备生成SVG
      v.literal("svg_generating"), // 正在生成SVG
      v.literal("completed"), // 全部完成
      v.literal("failed") // 失败
    ),
    createdAt: v.number(),
  }).index("by_session", ["sessionId"]),
});
