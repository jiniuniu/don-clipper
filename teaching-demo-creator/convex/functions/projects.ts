// convex/functions/projects.ts
import { query, mutation } from "../_generated/server";
import { v } from "convex/values";

// 获取所有项目
export const getProjects = query({
  args: {
    userId: v.optional(v.string()),
    includeGenerating: v.optional(v.boolean()),
  },
  handler: async (ctx, args) => {
    const baseQuery = ctx.db.query("projects");

    const projects = args.userId
      ? await baseQuery
          .withIndex("by_user", (q) => q.eq("userId", args.userId))
          .order("desc")
          .collect()
      : await baseQuery.withIndex("by_created_at").order("desc").collect();

    return args.includeGenerating
      ? projects
      : projects.filter((p) => p.status === "completed");
  },
});

// 获取单个项目
export const getProject = query({
  args: { id: v.id("projects") },
  handler: async (ctx, { id }) => {
    return await ctx.db.get(id);
  },
});

// 创建项目（生成中状态）
export const createProject = mutation({
  args: {
    concept: v.string(),
    difficulty: v.union(
      v.literal("beginner"),
      v.literal("intermediate"),
      v.literal("advanced")
    ),
    language: v.optional(v.string()),
    userId: v.optional(v.string()),
  },
  handler: async (ctx, args) => {
    const now = Date.now();

    const projectId = await ctx.db.insert("projects", {
      title: `生成中: ${args.concept}`,
      concept: args.concept,
      description: "正在生成内容...",
      difficulty: args.difficulty,

      // 生成状态
      status: "generating",
      progress: 0,
      currentStep: "正在分析概念...",

      // 默认布局
      layout: {
        gridSize: { rows: 8, cols: 12 },
        theme: "light",
      },

      // 空内容块
      contentBlocks: [],

      // 元数据
      metadata: {
        createdAt: new Date().toISOString(),
        language: args.language || "zh-CN",
        tags: [],
      },

      // 系统字段
      createdAt: now,
      updatedAt: now,
      userId: args.userId,
    });

    return projectId;
  },
});

// 更新生成进度
export const updateGenerationProgress = mutation({
  args: {
    id: v.id("projects"),
    progress: v.number(),
    currentStep: v.string(),
  },
  handler: async (ctx, { id, progress, currentStep }) => {
    await ctx.db.patch(id, {
      progress,
      currentStep,
      updatedAt: Date.now(),
    });
  },
});

// 完成生成
export const completeGeneration = mutation({
  args: {
    id: v.id("projects"),
    title: v.string(),
    description: v.string(),
    contentBlocks: v.array(v.any()),
    layout: v.object({
      gridSize: v.object({
        rows: v.number(),
        cols: v.number(),
      }),
      theme: v.union(v.literal("light"), v.literal("dark")),
    }),
    metadata: v.object({
      createdAt: v.string(),
      language: v.string(),
      tags: v.array(v.string()),
    }),
  },
  handler: async (ctx, { id, ...updates }) => {
    await ctx.db.patch(id, {
      ...updates,
      status: "completed",
      progress: 100,
      currentStep: "生成完成",
      updatedAt: Date.now(),
    });

    return id;
  },
});

// 标记生成失败
export const failGeneration = mutation({
  args: {
    id: v.id("projects"),
    error: v.string(),
  },
  handler: async (ctx, { id, error }) => {
    await ctx.db.patch(id, {
      status: "failed",
      generationError: error,
      currentStep: "生成失败",
      updatedAt: Date.now(),
    });
  },
});

// 更新项目内容
export const updateProject = mutation({
  args: {
    id: v.id("projects"),
    updates: v.object({
      title: v.optional(v.string()),
      description: v.optional(v.string()),
      contentBlocks: v.optional(v.array(v.any())),
      layout: v.optional(
        v.object({
          gridSize: v.object({
            rows: v.number(),
            cols: v.number(),
          }),
          theme: v.union(v.literal("light"), v.literal("dark")),
        })
      ),
    }),
  },
  handler: async (ctx, { id, updates }) => {
    await ctx.db.patch(id, {
      ...updates,
      updatedAt: Date.now(),
    });

    return id;
  },
});

// 删除项目
export const deleteProject = mutation({
  args: { id: v.id("projects") },
  handler: async (ctx, { id }) => {
    await ctx.db.delete(id);
    return { success: true };
  },
});

// 搜索项目
export const searchProjects = query({
  args: {
    query: v.string(),
    userId: v.optional(v.string()),
  },
  handler: async (ctx, { query, userId }) => {
    const results = await ctx.db
      .query("projects")
      .withSearchIndex(
        "search_projects",
        (q) =>
          q
            .search("title", query)
            .eq("userId", userId || undefined)
            .eq("status", "completed") // 只搜索已完成的项目
      )
      .collect();

    return results;
  },
});

// 获取生成中的项目（用于恢复状态）
export const getGeneratingProjects = query({
  args: {
    userId: v.optional(v.string()),
  },
  handler: async (ctx, args) => {
    const query = ctx.db
      .query("projects")
      .withIndex("by_status", (q) => q.eq("status", "generating"));

    const projects = await query.collect();

    return args.userId
      ? projects.filter((p) => p.userId === args.userId)
      : projects;
  },
});
