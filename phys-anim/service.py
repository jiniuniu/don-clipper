import os
from contextlib import asynccontextmanager

import uvicorn
from animation_generator import EducationalAnimationGenerator
from fastapi import FastAPI, HTTPException
from fastapi.responses import HTMLResponse
from frontend import FRONTEND_HTML
from pydantic import BaseModel

app = FastAPI(
    title="教育动画生成器", description="基于AI的教学动画自动生成服务", version="1.0.0"
)

generator = None


def initialize_generator():
    """初始化生成器"""
    global generator
    generator = EducationalAnimationGenerator()


@asynccontextmanager
async def lifespan(app: FastAPI):
    """应用生命周期管理"""
    # 启动时初始化
    try:
        initialize_generator()
        print("✅ 教育动画生成器初始化成功")
        yield
    except Exception as e:
        print(f"❌ 初始化失败: {e}")
        raise
    finally:
        # 关闭时清理（如果需要）
        print("🔄 服务正在关闭...")


app = FastAPI(
    title="教育动画生成器",
    description="基于AI的教学动画自动生成服务",
    version="1.0.0",
    lifespan=lifespan,
)


class GenerationRequest(BaseModel):
    """生成请求"""

    question: str
    answer: str


class GenerationResponse(BaseModel):
    """生成响应"""

    success: bool
    html_content: str = ""
    animation_data: dict = {}
    scene_count: int = 0
    error: str = ""


@app.get("/", response_class=HTMLResponse)
async def index():
    """主页面"""
    return HTMLResponse(content=FRONTEND_HTML)


@app.post("/generate", response_model=GenerationResponse)
async def generate_animation(request: GenerationRequest):
    """生成动画API"""
    if not generator:
        raise HTTPException(status_code=500, detail="生成器未初始化")

    try:
        # 生成动画数据
        animation_data = generator.generate_animation_data(
            question=request.question,
            answer=request.answer,
        )

        # 渲染HTML内容
        html_content = generator.template.render(animation_data=animation_data)

        return GenerationResponse(
            success=True,
            html_content=html_content,
            animation_data=animation_data.model_dump(),
            scene_count=len(animation_data.scenes),
        )

    except Exception as e:
        return GenerationResponse(success=False, error=str(e))


@app.get("/health")
async def health_check():
    """健康检查"""
    return {"status": "healthy", "generator_ready": generator is not None}


if __name__ == "__main__":

    uvicorn.run(app, host="0.0.0.0", port=12345)
