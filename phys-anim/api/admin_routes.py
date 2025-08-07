# api/admin_routes.py
from database import get_database
from fastapi import APIRouter, Depends, Request
from fastapi.responses import HTMLResponse
from fastapi.templating import Jinja2Templates
from services.history_service import HistoryService

# 创建路由器
admin_router = APIRouter()

# 模板配置
templates = Jinja2Templates(directory="templates")


# 依赖注入
async def get_history_service(db=Depends(get_database)):
    return HistoryService(db)


@admin_router.get("/admin", response_class=HTMLResponse)
async def admin_dashboard(
    request: Request, history_service: HistoryService = Depends(get_history_service)
):
    """管理页面主页"""
    try:
        # 获取一些初始数据（可选）
        recent_history = await history_service.get_recent_history(limit=10)
        stats = await history_service.get_stats()

        return templates.TemplateResponse(
            "admin/dashboard.html",
            {
                "request": request,
                "recent_history": recent_history,
                "stats": stats,
            },
        )
    except Exception as e:
        # 即使获取数据失败，也要显示页面
        return templates.TemplateResponse(
            "admin/dashboard.html", {"request": request, "error": str(e)}
        )
