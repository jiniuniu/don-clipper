from langchain_core.output_parsers import PydanticOutputParser
from llm import get_llm
from models import AnimationData, GenerationRequest, StyleConfig
from prompts import ANIMATION_GENERATION_PROMPT


class AnimationGenerator:
    """简化的教育动画生成器"""

    def __init__(self):
        self.llm = get_llm()
        self.parser = PydanticOutputParser(pydantic_object=AnimationData)

    def generate(self, request: GenerationRequest) -> AnimationData:

        try:
            # 构建提示词
            prompt = ANIMATION_GENERATION_PROMPT.partial(
                format_instructions=self.parser.get_format_instructions()
            )

            # 创建链
            chain = prompt | self.llm | self.parser

            # 生成数据
            result: AnimationData = chain.invoke({"question": request.question})

            # 设置样式配置
            result.style = request.style

            return result

        except Exception as e:
            print(f"❌ 动画生成失败: {str(e)}")
            raise

    def generate_from_question(
        self, question: str, style: dict = None
    ) -> AnimationData:

        # 创建样式配置
        if style is None:
            style = {}

        style_config = StyleConfig(**style)

        # 创建请求
        request = GenerationRequest(question=question, style=style_config)

        return self.generate(request)
