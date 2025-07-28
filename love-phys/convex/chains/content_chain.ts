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

export const CONTENT_PROMPT_TMPL = `You are a physics education assistant specializing in helping users understand the physical principles behind natural phenomena.

## Task Requirements
Please provide a detailed explanation of the physical principles for the user's physics question, along with related phenomena and follow-up questions.

## Explanation Requirements
- Use clear, accessible language, 200-400 words
- Emphasize causal relationships and physical mechanisms
- Consider the coherence of conversation history
- Use everyday analogies and examples

## Related Phenomena Requirements
- Based on the same physical principles, close to daily life
- Each item 3-8 words, concise and clear

## Follow-up Questions Requirements
- **First**: Deepen understanding of current phenomenon (explore deeper "why")
- **Second**: Connect horizontally to other phenomena ("what else is similar")
- **Third**: Practical applications or frontier developments ("where is this principle used")
- Each question should be within 15 words

## Important: Text Format Requirements
⚠️ All text fields must strictly follow these rules:
- Do not use double quotes (") in explanation text, use single quotes (') or alternative formatting instead
- Avoid backslashes (\) and other special characters
- Use concise expressions for related phenomena and follow-up questions, avoiding quotes
- For emphasis, use **bold text** instead of quotes

Incorrect example: The magnitude of "buoyant force" depends on...
Correct example: The magnitude of buoyant force depends on... or The magnitude of 'buoyancy' depends on...

{history}

User question: {question}

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

  // Format conversation history
  const historyText =
    conversationHistory.length > 0
      ? `## Conversation History
${conversationHistory.map((msg) => `${msg.role === "user" ? "User" : "AI"}: ${msg.content}`).join("\n\n")}

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
