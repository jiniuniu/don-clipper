from contextlib import asynccontextmanager

import uvicorn
from animation_generator import AnimationGenerator
from fastapi import FastAPI, HTTPException, Request
from fastapi.responses import HTMLResponse, JSONResponse
from fastapi.staticfiles import StaticFiles
from fastapi.templating import Jinja2Templates
from models import GenerationRequest, GenerationResponse

# 全局变量
generator = None


def initialize_generator():
    """初始化生成器"""
    global generator
    try:

        generator = AnimationGenerator()
        print("✅ 动画生成器初始化成功")
    except Exception as e:
        print(f"❌ 初始化失败: {e}")
        raise


@asynccontextmanager
async def lifespan(app: FastAPI):
    """应用生命周期管理"""
    # 启动时初始化
    initialize_generator()
    yield
    # 关闭时清理（如果需要）
    print("🔄 服务正在关闭...")


# 创建应用实例
app = FastAPI(
    title="简化教育动画生成器",
    description="基于AI的教学动画自动生成服务 - 简化版",
    version="2.0.0",
    lifespan=lifespan,
)

# 挂载静态文件
app.mount("/static", StaticFiles(directory="static"), name="static")

# 配置模板
templates = Jinja2Templates(directory="templates")


@app.get("/", response_class=HTMLResponse)
async def index(request: Request):
    """主页面"""
    return templates.TemplateResponse("index.html", {"request": request})


@app.post("/generate", response_model=GenerationResponse)
async def generate_animation(request: GenerationRequest):
    """生成动画API"""
    if not generator:
        raise HTTPException(status_code=500, detail="生成器未初始化")

    try:
        print(f"📝 收到生成请求: {request.question[:50]}...")
        print(f"🎨 样式配置: {request.style}")

        # 生成动画数据
        animation_data = generator.generate(request)

        print(f"✅ 生成成功！共 {animation_data.total_scenes} 个场景")

        return GenerationResponse(success=True, data=animation_data)

    except Exception as e:
        print(f"❌ 生成失败: {str(e)}")
        return GenerationResponse(success=False, error=str(e))


@app.get("/health")
async def health_check():
    """健康检查"""
    return {"status": "healthy", "generator_ready": generator is not None}


@app.exception_handler(Exception)
async def global_exception_handler(request: Request, exc: Exception):
    """全局异常处理"""
    print(f"❌ 未处理的异常: {str(exc)}")
    return JSONResponse(
        status_code=500, content={"detail": f"服务器内部错误: {str(exc)}"}
    )


if __name__ == "__main__":
    uvicorn.run(app, port=12345)
