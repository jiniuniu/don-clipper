from typing import List, Literal

from pydantic import BaseModel, Field


class StyleConfig(BaseModel):
    """样式配置"""

    primary_color: str = Field(default="#2196F3", description="主色调")
    background: Literal["light", "dark"] = Field(default="dark", description="背景主题")
    font_size: Literal["small", "medium", "large"] = Field(
        default="medium", description="字体大小"
    )


class Scene(BaseModel):
    """场景数据"""

    scene_id: str = Field(description="场景ID")
    title: str = Field(description="场景标题")
    svg_content: str = Field(description="SVG内容，viewBox='0 0 800 600'")
    explanation: str = Field(description="核心说明，1-2句话")


class AnimationData(BaseModel):
    """完整动画数据"""

    question: str = Field(description="用户输入的问题")
    title: str = Field(description="动画总标题")
    total_scenes: int = Field(description="场景总数 2-4个")
    scenes: List[Scene] = Field(description="所有场景数据")
    style: StyleConfig = Field(description="样式配置")


class GenerationRequest(BaseModel):
    """生成请求"""

    question: str = Field(description="用户问题")
    style: StyleConfig = Field(description="样式配置")


class GenerationResponse(BaseModel):
    """生成响应"""

    success: bool
    data: AnimationData = None
    error: str = ""
