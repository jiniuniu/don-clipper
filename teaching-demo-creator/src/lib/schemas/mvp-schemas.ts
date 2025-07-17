// lib/schemas/mvp-schemas.ts
import { z } from "zod";

// 基础类型定义
export const PositionSchema = z.object({
  x: z.number().min(0).max(11),
  y: z.number().min(0).max(11),
  width: z.number().min(1).max(12),
  height: z.number().min(1).max(12),
});

export const StyleConfigSchema = z.object({
  backgroundColor: z.string().optional(),
  borderColor: z.string().optional(),
  textColor: z.string().optional(),
  fontSize: z.enum(["xs", "sm", "md", "lg", "xl"]).optional(),
  padding: z.enum(["sm", "md", "lg"]).optional(),
});

// MVP 内容块类型枚举
export enum CoreContentTypes {
  TEXT = "text",
  HEADING = "heading",
  HIGHLIGHT_BOX = "highlight_box",
  CALLOUT = "callout",
}

export const ContentBlockTypeSchema = z.enum([
  "text",
  "heading",
  "highlight_box",
  "callout",
]);

// 基础内容块
export const BaseContentBlockSchema = z.object({
  id: z.string(),
  type: ContentBlockTypeSchema,
  position: PositionSchema,
  style: StyleConfigSchema.optional(),
});

// 1. 文本内容块
export const TextContentBlockSchema = BaseContentBlockSchema.extend({
  type: z.literal("text"),
  content: z.string().describe("支持 Markdown 的文本内容"),
  textAlign: z.enum(["left", "center", "right"]).optional().default("left"),
});

// 2. 标题内容块
export const HeadingContentBlockSchema = BaseContentBlockSchema.extend({
  type: z.literal("heading"),
  content: z.string().describe("标题文本"),
  level: z.number().min(1).max(6).describe("标题级别 1-6"),
});

// 3. 高亮框内容块
export const HighlightBoxContentBlockSchema = BaseContentBlockSchema.extend({
  type: z.literal("highlight_box"),
  content: z.string().describe("高亮框内容"),
  boxType: z.enum(["info", "warning", "success", "error"]).describe("框类型"),
  title: z.string().optional().describe("可选标题"),
});

// 4. 标注内容块
export const CalloutContentBlockSchema = BaseContentBlockSchema.extend({
  type: z.literal("callout"),
  content: z.string().describe("标注内容"),
  calloutType: z
    .enum(["note", "tip", "warning", "important"])
    .describe("标注类型"),
  title: z.string().optional().describe("可选标题"),
});

// MVP 联合类型
export const MVPContentBlockSchema = z.discriminatedUnion("type", [
  TextContentBlockSchema,
  HeadingContentBlockSchema,
  HighlightBoxContentBlockSchema,
  CalloutContentBlockSchema,
]);

// 简化的页面结构
export const MVPTeachingPageSchema = z.object({
  id: z.string(),
  title: z.string(),
  concept: z.string(),
  description: z.string(),
  difficulty: z.enum(["beginner", "intermediate", "advanced"]),

  layout: z.object({
    gridSize: z.object({
      rows: z.number().default(8),
      cols: z.number().default(12),
    }),
    theme: z.enum(["light", "dark"]).default("light"),
  }),

  contentBlocks: z.array(MVPContentBlockSchema),

  metadata: z.object({
    createdAt: z.string(),
    language: z.string().default("zh-CN"),
    tags: z.array(z.string()).default([]),
  }),
});

// 简化的用户输入
export const MVPUserInputSchema = z.object({
  concept: z.string().min(1).describe("要学习的概念"),
  difficulty: z
    .enum(["beginner", "intermediate", "advanced"])
    .default("intermediate"),
  language: z.string().default("zh-CN"),
});

// 简化的 LLM 输出
export const MVPGeneratedContentSchema = z.object({
  concept: z.string(),
  explanation: z.string(),
  page: MVPTeachingPageSchema,
});

// 类型导出
export type MVPContentBlock = z.infer<typeof MVPContentBlockSchema>;
export type MVPTeachingPage = z.infer<typeof MVPTeachingPageSchema>;
export type MVPUserInput = z.infer<typeof MVPUserInputSchema>;
export type MVPGeneratedContent = z.infer<typeof MVPGeneratedContentSchema>;
export type Position = z.infer<typeof PositionSchema>;
export type StyleConfig = z.infer<typeof StyleConfigSchema>;
