import { ChatOpenAI } from "@langchain/openai";
import { PromptTemplate } from "@langchain/core/prompts";
import { StructuredOutputParser } from "@langchain/core/output_parsers";
import { z } from "zod";

export const SVGGenerationSchema = z.object({
  svgCode: z.string().min(100, "SVG code must be substantial"),
});

export type SVGGeneration = z.infer<typeof SVGGenerationSchema>;

export const SVG_PROMPT_TMPL = `你是一个专业的物理图示设计师，根据提供的物理解释创建准确、清晰、美观的SVG演示图。

## SVG技术要求
- **响应式设计**：使用合适的 viewBox，推荐比例 2:1 或 3:2 或 4:3
- **尺寸灵活**：根据内容复杂度选择合适尺寸，宽度建议 600-1200px
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

## 物理准确性要求
- **比例准确**：确保比例、角度、方向符合物理定律
- **力的表示**：力的方向要正确，箭头长度表示力的大小
- **矢量性质**：遵循物理量的矢量性质
- **能量守恒**：展示能量转换过程要符合守恒定律

## 颜色规范
- **温度**：红色=热，蓝色=冷
- **电荷**：红色=正电荷，蓝色=负电荷  
- **速度**：绿色箭头表示速度方向
- **能量**：黄色表示高能量，紫色表示低能量
- **磁场**：蓝色表示N极，红色表示S极

## 标注要求
- 使用<text>标签添加物理量标注
- 重要参数用粗体，单位要标明
- 箭头指向要准确，长度表示大小
- 文字大小适中，确保可读性

## 特殊现象处理策略
- **波动现象**：必须展示波的传播动画，用正弦曲线和相位变化
- **电磁现象**：用场线和颜色梯度表示场强，电场线从正到负
- **热力学现象**：用粒子运动速度和密度表示温度高低
- **光学现象**：准确展示光路、入射角、折射角和反射角
- **力学现象**：清晰标示力的方向和大小

## SVG格式要求
- **JSON安全**：SVG代码中所有双引号必须使用单引号替代
- **转义字符**：避免使用反斜杠、换行符等特殊字符
- **简化结构**：减少复杂的嵌套和过长的属性值
- **性能优化**：避免过于复杂的路径，合理使用<defs>定义重复元素

## 可访问性
- 添加<title>和<desc>标签描述图像内容
- 使用语义化的元素结构
- 确保足够的对比度

示例格式：
svgCode: "<svg viewBox='0 0 800 400' xmlns='http://www.w3.org/2000/svg'>...</svg>"

## 输入信息
**用户问题**：{question}

**物理解释**：{explanation}

**相关现象**：{relatedPhenomena}

请根据以上解释创建一个准确、清晰、美观的SVG物理演示图。

{format_instructions}`;

export async function createSVGLLM() {
  return new ChatOpenAI({
    apiKey: process.env.OPENROUTER_API_KEY!,
    modelName: "anthropic/claude-sonnet-4",
    temperature: 0.2, // SVG生成用更低的温度确保准确性
    configuration: {
      baseURL: "https://openrouter.ai/api/v1",
    },
  });
}

export async function generateSVGFromContent(
  question: string,
  explanation: string,
  relatedPhenomena: string[]
): Promise<SVGGeneration> {
  const llm = await createSVGLLM();
  const parser = StructuredOutputParser.fromZodSchema(SVGGenerationSchema);

  const prompt = PromptTemplate.fromTemplate(SVG_PROMPT_TMPL);
  const chain = prompt.pipe(llm).pipe(parser);

  return await chain.invoke({
    question,
    explanation,
    relatedPhenomena: relatedPhenomena.join("、"),
    format_instructions: parser.getFormatInstructions(),
  });
}
