// convex/schema.ts
import { defineSchema, defineTable } from "convex/server";
import { v } from "convex/values";

export default defineSchema({
  // 项目表 - 包含生成状态
  projects: defineTable({
    title: v.string(),
    concept: v.string(),
    description: v.string(),
    difficulty: v.union(
      v.literal("beginner"),
      v.literal("intermediate"),
      v.literal("advanced")
    ),

    // 生成状态字段
    status: v.union(
      v.literal("generating"), // 生成中
      v.literal("completed"), // 已完成
      v.literal("failed"), // 失败
      v.literal("draft") // 草稿（手动创建）
    ),
    progress: v.optional(v.number()), // 生成进度 0-100
    currentStep: v.optional(v.string()), // 当前步骤
    generationError: v.optional(v.string()), // 生成错误信息

    // 布局配置
    layout: v.object({
      gridSize: v.object({
        rows: v.number(),
        cols: v.number(),
      }),
      theme: v.union(v.literal("light"), v.literal("dark")),
    }),

    // 内容块数据 (存储为 JSON)
    contentBlocks: v.array(v.any()),

    // 元数据
    metadata: v.object({
      createdAt: v.string(),
      language: v.string(),
      tags: v.array(v.string()),
    }),

    // 系统字段
    createdAt: v.number(),
    updatedAt: v.number(),
    userId: v.optional(v.string()),
  })
    .index("by_created_at", ["createdAt"])
    .index("by_user", ["userId"])
    .index("by_status", ["status"])
    .searchIndex("search_projects", {
      searchField: "title",
      filterFields: ["userId", "difficulty", "status"],
    }),
});
