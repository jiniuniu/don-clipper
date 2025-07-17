// lib/schemas/llm-schemas.ts
// 专门给 LLM 使用的简化 Schema - 符合 OpenAI API 要求

import { z } from "zod";

// 为每种类型定义单独的 Schema
const TextBlockSchema = z.object({
  id: z.string().describe("内容块ID，格式：text-数字"),
  type: z.literal("text"),
  content: z.string().describe("文本内容"),
  x: z.number().min(0).max(11).describe("网格列位置 0-11"),
  y: z.number().min(0).max(7).describe("网格行位置 0-7"),
  width: z.number().min(1).max(12).describe("占用列数"),
  height: z.number().min(1).max(8).describe("占用行数"),
});

const HeadingBlockSchema = z.object({
  id: z.string().describe("内容块ID，格式：heading-数字"),
  type: z.literal("heading"),
  content: z.string().describe("标题文本"),
  level: z.number().min(1).max(6).describe("标题级别 1-6"),
  x: z.number().min(0).max(11).describe("网格列位置 0-11"),
  y: z.number().min(0).max(7).describe("网格行位置 0-7"),
  width: z.number().min(1).max(12).describe("占用列数"),
  height: z.number().min(1).max(8).describe("占用行数"),
});

const HighlightBoxBlockSchema = z.object({
  id: z.string().describe("内容块ID，格式：highlight-数字"),
  type: z.literal("highlight_box"),
  content: z.string().describe("高亮框内容"),
  boxType: z.enum(["info", "warning", "success", "error"]).describe("框类型"),
  title: z.string().describe("标题，如无标题请填写空字符串"),
  x: z.number().min(0).max(11).describe("网格列位置 0-11"),
  y: z.number().min(0).max(7).describe("网格行位置 0-7"),
  width: z.number().min(1).max(12).describe("占用列数"),
  height: z.number().min(1).max(8).describe("占用行数"),
});

const CalloutBlockSchema = z.object({
  id: z.string().describe("内容块ID，格式：callout-数字"),
  type: z.literal("callout"),
  content: z.string().describe("标注内容"),
  calloutType: z
    .enum(["note", "tip", "warning", "important"])
    .describe("标注类型"),
  title: z.string().describe("标题，如无标题请填写空字符串"),
  x: z.number().min(0).max(11).describe("网格列位置 0-11"),
  y: z.number().min(0).max(7).describe("网格行位置 0-7"),
  width: z.number().min(1).max(12).describe("占用列数"),
  height: z.number().min(1).max(8).describe("占用行数"),
});

// 使用 Discriminated Union
const SimplifiedContentBlockSchema = z.discriminatedUnion("type", [
  TextBlockSchema,
  HeadingBlockSchema,
  HighlightBoxBlockSchema,
  CalloutBlockSchema,
]);

// 简化的页面 Schema
const SimplifiedPageSchema = z.object({
  title: z.string().describe("页面标题"),
  concept: z.string().describe("概念名称"),
  description: z.string().describe("概念描述"),
  difficulty: z.enum(["beginner", "intermediate", "advanced"]),
  contentBlocks: z
    .array(SimplifiedContentBlockSchema)
    .min(4)
    .max(8)
    .describe("4-8个内容块"),
});

// 给 LLM 的最终输出 Schema
export const LLMOutputSchema = z.object({
  concept: z.string(),
  explanation: z.string().describe("概念的简要解释"),
  page: SimplifiedPageSchema,
});

// 数据转换函数：从 LLM 输出转换为标准格式
export function transformLLMOutputToMVP(
  llmOutput: z.infer<typeof LLMOutputSchema>
) {
  const transformedBlocks = llmOutput.page.contentBlocks.map((block) => {
    const baseBlock = {
      id: block.id,
      type: block.type,
      position: {
        x: block.x,
        y: block.y,
        width: block.width,
        height: block.height,
      },
    };

    // 根据类型添加特定字段
    switch (block.type) {
      case "text":
        return {
          ...baseBlock,
          type: "text" as const,
          content: block.content,
          textAlign: "left" as const,
        };

      case "heading":
        return {
          ...baseBlock,
          type: "heading" as const,
          content: block.content,
          level: block.level,
        };

      case "highlight_box":
        return {
          ...baseBlock,
          type: "highlight_box" as const,
          content: block.content,
          boxType: block.boxType,
          title: block.title || undefined, // 空字符串转为 undefined
        };

      case "callout":
        return {
          ...baseBlock,
          type: "callout" as const,
          content: block.content,
          calloutType: block.calloutType,
          title: block.title || undefined, // 空字符串转为 undefined
        };

      default:
        // eslint-disable-next-line @typescript-eslint/no-explicit-any
        throw new Error(`未知的内容块类型: ${(block as any).type}`);
    }
  });

  return {
    concept: llmOutput.concept,
    explanation: llmOutput.explanation,
    page: {
      id: `page-${Date.now()}`,
      title: llmOutput.page.title,
      concept: llmOutput.page.concept,
      description: llmOutput.page.description,
      difficulty: llmOutput.page.difficulty,
      layout: {
        gridSize: { rows: 8, cols: 12 },
        theme: "light" as const,
      },
      contentBlocks: transformedBlocks,
      metadata: {
        createdAt: new Date().toISOString(),
        language: "zh-CN",
        tags: [],
      },
    },
  };
}

export type LLMOutput = z.infer<typeof LLMOutputSchema>;
