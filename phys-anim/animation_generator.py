import json
from pathlib import Path
from typing import Any, Dict

from fastapi.templating import Jinja2Templates
from langchain_core.output_parsers import PydanticOutputParser
from llm import get_llm
from models import AnimationData
from prompts import ANIMATION_GENERATION_PROMPT


class EducationalAnimationGenerator:
    """教育动画生成器"""

    def __init__(self):
        self.llm = get_llm()
        self.parser = PydanticOutputParser(pydantic_object=AnimationData)
        self.templates = Jinja2Templates(directory="templates")

    def generate_animation_data(self, question: str, answer: str) -> AnimationData:
        """生成动画数据

        Args:
            question: 教学问题
            answer: 参考答案

        Returns:
            生成的动画数据
        """
        # 构建提示词
        prompt = ANIMATION_GENERATION_PROMPT.partial(
            format_instructions=self.parser.get_format_instructions()
        )

        # 创建链
        chain = prompt | self.llm | self.parser

        # 生成数据
        result = chain.invoke({"question": question, "answer": answer})

        return result

    def render_html(
        self, animation_data: AnimationData, output_path: str = None
    ) -> str:
        """渲染HTML文件

        Args:
            animation_data: 动画数据
            output_path: 输出文件路径（可选）

        Returns:
            生成的HTML内容
        """
        html_content = self.templates.get_template("animation.html").render(
            animation_data=animation_data
        )

        # 如果指定了输出路径，则保存文件
        if output_path:
            Path(output_path).parent.mkdir(parents=True, exist_ok=True)
            with open(output_path, "w", encoding="utf-8") as f:
                f.write(html_content)

        return html_content

    def generate(
        self, question: str, answer: str, output_path: str = None
    ) -> Dict[str, Any]:
        """完整生成流程

        Args:
            question: 教学问题
            answer: 参考答案
            output_path: 输出HTML文件路径（可选）

        Returns:
            包含生成信息的字典
        """
        try:
            # 生成动画数据
            print("🔄 正在分析教学内容...")
            animation_data = self.generate_animation_data(question, answer)

            # 渲染HTML
            print("🎨 正在生成HTML动画...")
            html_content = self.render_html(animation_data, output_path)

            # 保存JSON数据（如果指定了输出路径）
            if output_path:
                json_path = output_path.replace(".html", "_data.json")
                with open(json_path, "w", encoding="utf-8") as f:
                    json.dump(
                        animation_data.model_dump(), f, ensure_ascii=False, indent=2
                    )

                print(f"✅ 生成完成！")
                print(f"📄 HTML文件: {output_path}")
                print(f"📊 数据文件: {json_path}")

            return {
                "success": True,
                "html_path": output_path,
                "json_path": (
                    output_path.replace(".html", "_data.json") if output_path else None
                ),
                "html_content": html_content,
                "animation_data": animation_data,
                "scene_count": len(animation_data.scenes),
            }

        except Exception as e:
            print(f"❌ 生成失败: {str(e)}")
            return {"success": False, "error": str(e)}
