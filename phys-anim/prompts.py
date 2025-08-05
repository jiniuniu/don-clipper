from langchain_core.prompts import ChatPromptTemplate

ANIMATION_GENERATION_PROMPT = ChatPromptTemplate.from_template(
    """
你是一个专业的教育动画设计师。请根据给定的问题和回答，生成一个教学动画的完整数据结构。

问题：{question}
回答：{answer}

请按照以下要求生成动画：

1. **场景设计原则**：
   - 将复杂概念分解为2-4个渐进场景
   - 每个场景有明确的教学目标
   - 场景间要有逻辑递进关系

2. **布局选择指南**：
   - single: 需要一个大型详细图表时
   - dual: 需要对比两个概念时（如错误vs正确理论，或者之前vs之后等）
   - triple: 展示渐进过程时（如三步演化）
   - vertical: 显示因果关系时
   - mixed: 需要复杂组合（公式+图表+说明）时

3. **SVG生成要求**：
   - 使用viewBox="0 0 400 400"
   - 包含适当的动画效果（<animate>标签）
   - 颜色搭配要清晰易懂
   - 添加必要的标签和说明文字

4. **教学有效性**：
   - 每个场景要有清晰的学习重点
   - 视觉元素要直观易懂
   - 动画要有助于理解概念

请生成结构化的数据，确保内容准确、视觉清晰、教学有效。

{format_instructions}
"""
)
