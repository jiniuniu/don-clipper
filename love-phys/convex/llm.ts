import { ChatOpenAI } from "@langchain/openai";
import { PromptTemplate } from "@langchain/core/prompts";
import { StructuredOutputParser } from "@langchain/core/output_parsers";
import { z } from "zod";

export const PhysicsExplanationSchema = z.object({
  svgCode: z.string().min(1, "SVG code is required"),
  explanation: z.string().min(50, "Explanation must be at least 50 characters"),
  relatedPhenomena: z
    .array(z.string())
    .length(3, "Must have exactly 3 related phenomena"),
  furtherQuestions: z
    .array(z.string())
    .length(3, "Must have exactly 3 further questions"),
});

export type PhysicsExplanation = z.infer<typeof PhysicsExplanationSchema>;

export const PROMPT_TMPL = `你是一个物理学教育助手，专门帮助用户理解自然现象背后的物理原理。

根据用户的问题和对话历史，生成一个完整的物理解释：

## SVG要求
- 尺寸：viewBox="0 0 800 400"
- 简洁清晰，使用鲜明颜色对比
- 包含必要的标签和箭头

## 解释要求
- 语言通俗易懂，200-400字
- 重点突出因果关系
- 考虑对话历史的连贯性

## 相关现象要求
- 基于相同物理原理，贴近日常生活
- 每个3-8个字

## 延伸问题要求
- 基于当前解释延伸，引发思考
- 每个问题控制在15字以内

{history}

用户问题：{question}

{format_instructions}`;

export async function createLLM() {
  return new ChatOpenAI({
    apiKey: process.env.OPENROUTER_API_KEY!,
    modelName: "anthropic/claude-sonnet-4",
    temperature: 0.3,
    configuration: {
      baseURL: "https://openrouter.ai/api/v1",
    },
  });
}

export async function generatePhysicsExplanation(
  question: string,
  conversationHistory: Array<{ role: string; content: string }> = []
) {
  const llm = await createLLM();

  const parser = StructuredOutputParser.fromZodSchema(PhysicsExplanationSchema);
  // 格式化对话历史
  const historyText =
    conversationHistory.length > 0
      ? `## 对话历史
${conversationHistory.map((msg) => `${msg.role === "user" ? "用户" : "AI"}: ${msg.content}`).join("\n\n")}

`
      : "";

  const prompt = PromptTemplate.fromTemplate(PROMPT_TMPL);

  // 创建 chain
  const chain = prompt.pipe(llm).pipe(parser);

  // 执行 chain
  return await chain.invoke({
    question,
    history: historyText,
    format_instructions: parser.getFormatInstructions(),
  });
}
