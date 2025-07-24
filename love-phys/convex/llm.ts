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

## SVG要求
- **尺寸**：viewBox="0 0 800 400"，使用响应式设计
- **动画效果**：当现象涉及运动、变化过程时，必须添加SVG动画
  - 使用<animateTransform>、<animate>、<animateMotion>等标签
  - 例如：波的传播、粒子运动、光线折射、磁场变化等
  - 动画时长建议2-4秒，可循环播放
- **分层展示**：复杂现象要分步骤展示，使用<g>分组管理
  - 背景环境一层、主要对象一层、标注文字一层
  - 可以通过opacity或transform实现层次效果
- **交互元素**：适当添加hover效果和视觉反馈
  - 重要元素hover时改变颜色或大小
  - 使用渐变和阴影增强立体感
- **物理准确性**：确保比例、角度、方向符合物理定律
  - 力的方向要正确，比例要合理
  - 遵循物理量的矢量性质
- **颜色规范**：使用物理学色彩惯例
  - 温度：红色=热，蓝色=冷
  - 电荷：红色=正电荷，蓝色=负电荷  
  - 速度：绿色箭头表示速度方向
  - 能量：黄色表示高能量，紫色表示低能量
- **标注清晰**：
  - 使用<text>标签添加物理量标注
  - 重要参数用粗体，单位要标明
  - 箭头指向要准确，长度表示大小
- **性能优化**：避免过于复杂的路径，合理使用<defs>定义重复元素
- **可访问性**：添加<title>和<desc>标签描述图像内容
- **浏览器兼容**：使用标准SVG特性，避免实验性功能

## 特殊现象处理策略
- **波动现象**：必须展示波的传播动画，用正弦曲线和相位变化
- **电磁现象**：用场线和颜色梯度表示场强，电场线从正到负
- **热力学现象**：用粒子运动速度和密度表示温度高低
- **光学现象**：准确展示光路、入射角、折射角和反射角
- **力学现象**：清晰标示力的方向和大小，用箭头长度表示力的大小

针对不同问题类型的具体策略：
- **静态现象**：重点标注结构和力的分布，使用剖面图展示内部
- **动态过程**：必须使用动画展示时间演化，标记关键时刻
- **因果关系**：通过对比或参数变化展示因果，可用虚线表示"如果"情况
- **对比分析**：左右分割或上下对比，保持元素对应关系清晰
- **复杂系统**：多层级展示，主系统+子系统，用连接线表示相互作用

## 解释要求
- 语言通俗易懂，200-400字
- 重点突出因果关系
- 考虑对话历史的连贯性

## 相关现象要求
- 基于相同物理原理，贴近日常生活
- 每个3-8个字

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

## SVG格式要求
- **JSON安全**：SVG代码中所有双引号必须使用单引号替代
- **转义字符**：避免使用反斜杠、换行符等特殊字符
- **简化结构**：减少复杂的嵌套和过长的属性值
- **长度控制**：SVG代码总长度控制在5000字符以内

示例格式：
svgCode: "<svg viewBox='0 0 800 400' xmlns='http://www.w3.org/2000/svg'>...</svg>"

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
