import { ChatOpenAI } from "@langchain/openai";
import { PromptTemplate } from "@langchain/core/prompts";
import { StructuredOutputParser } from "@langchain/core/output_parsers";
import { z } from "zod";

export const PhysicsContentSchema = z.object({
  explanation: z.string().min(50, "Explanation must be at least 50 characters"),
  relatedPhenomena: z
    .array(z.string())
    .length(3, "Must have exactly 3 related phenomena"),
  furtherQuestions: z
    .array(z.string())
    .length(3, "Must have exactly 3 further questions"),
});

export type PhysicsContent = z.infer<typeof PhysicsContentSchema>;

export const CONTENT_PROMPT_TMPL = `你是一个物理学教育助手，专门帮助用户理解自然现象背后的物理原理。

## 任务要求
请为用户的物理问题提供详细的原理解释，并给出相关现象和延伸问题。

## 解释要求
- 语言通俗易懂，200-400字
- 重点突出因果关系和物理机制
- 考虑对话历史的连贯性
- 使用生活化的类比和例子

## 相关现象要求
- 基于相同物理原理，贴近日常生活
- 每个3-8个字，简洁明了

## 延伸问题要求
- **第一个**：深化当前现象理解（探究更深层的"为什么"）
- **第二个**：横向联系其他现象（"还有什么类似的"）
- **第三个**：实际应用或前沿发展（"这个原理用在哪里"）
- 每个问题控制在15字以内

## 重要：文本格式要求
⚠️ 所有文本字段严格遵循以下规则：
- 解释文本中不要使用双引号(")，用单引号(')或中文引号("")代替
- 避免使用反斜杠(\)等特殊字符
- 相关现象和延伸问题使用简洁表述，避免引号
- 如需强调，使用**粗体**而非引号

错误示例："F浮"的大小取决于...
正确示例：F浮的大小取决于... 或 '浮力'的大小取决于...

{history}

用户问题：{question}

{format_instructions}`;

export async function createContentLLM() {
  return new ChatOpenAI({
    apiKey: process.env.OPENROUTER_API_KEY!,
    modelName: "anthropic/claude-sonnet-4",
    temperature: 0.3,
    configuration: {
      baseURL: "https://openrouter.ai/api/v1",
    },
  });
}

export async function generatePhysicsContent(
  question: string,
  conversationHistory: Array<{ role: string; content: string }> = []
): Promise<PhysicsContent> {
  const llm = await createContentLLM();
  const parser = StructuredOutputParser.fromZodSchema(PhysicsContentSchema);

  // 格式化对话历史
  const historyText =
    conversationHistory.length > 0
      ? `## 对话历史
${conversationHistory.map((msg) => `${msg.role === "user" ? "用户" : "AI"}: ${msg.content}`).join("\n\n")}

`
      : "";

  const prompt = PromptTemplate.fromTemplate(CONTENT_PROMPT_TMPL);
  const chain = prompt.pipe(llm).pipe(parser);

  return await chain.invoke({
    question,
    history: historyText,
    format_instructions: parser.getFormatInstructions(),
  });
}
