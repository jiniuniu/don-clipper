/* eslint-disable @typescript-eslint/no-explicit-any */
// convex/actions/generateContent.ts
"use node";

import { action } from "../_generated/server";
import { api } from "../_generated/api";
import { v } from "convex/values";
import { ChatOpenAI } from "@langchain/openai";
import {
  LLMOutputSchema,
  transformLLMOutputToMVP,
} from "../../src/lib/schemas/llm-schemas";

export const generateTeachingContent = action({
  args: {
    concept: v.string(),
    difficulty: v.optional(v.string()),
    language: v.optional(v.string()),
    userId: v.optional(v.string()),
  },
  handler: async (ctx, args): Promise<any> => {
    let projectId;

    try {
      // 创建项目记录（生成中状态）
      projectId = await ctx.runMutation(api.functions.projects.createProject, {
        concept: args.concept,
        difficulty: (args.difficulty as any) || "intermediate",
        language: args.language || "zh-CN",
        userId: args.userId,
      });

      // 设置 LLM - 使用现代化的 withStructuredOutput 方法
      const llm = new ChatOpenAI({
        modelName: "gpt-4o-mini",
        temperature: 0.3,
        maxTokens: 3000,
        openAIApiKey: process.env.OPENAI_API_KEY,
      });

      // 绑定 Schema 到模型
      const structuredLLM = llm.withStructuredOutput(LLMOutputSchema, {
        name: "teaching_content",
      });

      // 更新进度 - 分析阶段
      await ctx.runMutation(api.functions.projects.updateGenerationProgress, {
        id: projectId,
        progress: 25,
        currentStep: "正在规划布局...",
      });

      // 构建 prompt - 明确指定每种类型的要求
      const prompt = `你是一个教学内容设计专家。请为给定概念创建教学页面。

用户输入：
- 概念：${args.concept}
- 难度：${args.difficulty || "intermediate"}
- 语言：${args.language || "zh-CN"}

## 内容块类型及要求：

1. **text**: 普通文本
   - 必须字段: id, type, content, x, y, width, height
   
2. **heading**: 标题  
   - 必须字段: id, type, content, level (1-6), x, y, width, height
   
3. **highlight_box**: 高亮信息框
   - 必须字段: id, type, content, boxType (info/warning/success/error), title, x, y, width, height
   - 如果没有标题，title 设为空字符串 ""
   
4. **callout**: 标注框
   - 必须字段: id, type, content, calloutType (note/tip/warning/important), title, x, y, width, height  
   - 如果没有标题，title 设为空字符串 ""

## 布局规则（12列x8行网格）：
- 标题: x=0, y=0, width=12, height=1
- 文本: width=6-12, height=2-3
- 信息框: width=4-8, height=2-3
- 标注: width=4-6, height=2-3

## 重要约束：
1. 生成 4-8 个内容块
2. 内容块不能重叠
3. 每个内容块的所有字段都必须填写，不能为空
4. ID 格式：类型-数字（如 heading-1, text-1）

请返回包含 concept、explanation 和 page 三个字段的 JSON 对象。`;

      // 生成内容
      const llmResult = await structuredLLM.invoke(prompt);

      await ctx.runMutation(api.functions.projects.updateGenerationProgress, {
        id: projectId,
        progress: 50,
        currentStep: "正在生成内容块...",
      });

      // 验证 LLM 输出
      const validatedLLMResult = LLMOutputSchema.parse(llmResult);

      await ctx.runMutation(api.functions.projects.updateGenerationProgress, {
        id: projectId,
        progress: 75,
        currentStep: "正在完善细节...",
      });

      // 转换为标准格式
      const transformedResult = transformLLMOutputToMVP(validatedLLMResult);

      // 完成生成，更新项目
      await ctx.runMutation(api.functions.projects.completeGeneration, {
        id: projectId,
        title: transformedResult.page.title,
        description: transformedResult.explanation,
        contentBlocks: transformedResult.page.contentBlocks,
        layout: transformedResult.page.layout,
        metadata: transformedResult.page.metadata,
      });

      return {
        success: true,
        projectId,
        result: transformedResult,
      };
    } catch (error) {
      console.error("内容生成失败:", error);

      if (projectId) {
        await ctx.runMutation(api.functions.projects.failGeneration, {
          id: projectId,
          error: error instanceof Error ? error.message : "未知错误",
        });
      }

      throw new Error(
        `内容生成失败: ${error instanceof Error ? error.message : "未知错误"}`
      );
    }
  },
});
