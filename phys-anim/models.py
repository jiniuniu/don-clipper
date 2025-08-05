from typing import List, Literal, Optional

from pydantic import BaseModel, Field


class LayoutConfig(BaseModel):
    """布局配置"""

    type: Literal["single", "dual", "triple", "vertical", "mixed"] = Field(
        description="布局类型"
    )
    distribution: Optional[str] = Field(
        default="50-50", description="空间分配比例，如 '60-40', '33-33-34'"
    )
    direction: Optional[Literal["horizontal", "vertical"]] = Field(
        default="horizontal", description="排列方向"
    )
    reasoning: str = Field(description="选择此布局的原因")


class ContentArea(BaseModel):
    """内容区域"""

    area_id: str = Field(description="区域标识符")
    grid_position: str = Field(description="CSS Grid位置，如 '1/1/2/3'")
    content_type: Literal["svg", "html", "text"] = Field(description="内容类型")
    content: str = Field(description="具体内容代码")
    title: Optional[str] = Field(default="", description="区域标题")
    caption: Optional[str] = Field(default="", description="说明文字")


class Scene(BaseModel):
    """场景数据"""

    scene_id: str = Field(description="场景ID，如 scene1, scene2")
    title: str = Field(description="场景标题")
    layout: LayoutConfig = Field(description="布局配置")
    content_areas: List[ContentArea] = Field(description="内容区域列表")
    explanation: str = Field(description="底部说明文字")
    script: str = Field(description="视频脚本文字")


class AnimationData(BaseModel):
    """完整动画数据"""

    animation_title: str = Field(description="动画总标题")
    total_scenes: int = Field(description="场景总数")
    scenes: List[Scene] = Field(description="所有场景数据")
