# api/routes.py
import logging
from datetime import datetime
from typing import List, Optional

from auth.auth_models import User
from auth.dependencies import get_current_active_user, require_admin
from db.database import get_database
from fastapi import APIRouter, Depends, HTTPException, Query
from fastapi.responses import Response
from schemas.schemas import (
    FullGenerationResponse,
    GenerateAnimationRequest,
    GenerateContentRequest,
    GenerationHistoryResponse,
    HistorySearchRequest,
    PaginatedResponse,
    StatsResponse,
    SuccessResponse,
)
from services.generation_service import GenerationService
from services.history_service import HistoryService

logger = logging.getLogger(__name__)

# 创建路由器
router = APIRouter()


# 依赖注入
async def get_history_service(db=Depends(get_database)):
    return HistoryService(db)


async def get_generation_service(
    history_service: HistoryService = Depends(get_history_service),
):
    return GenerationService(history_service)


# ============ 基础路由（无需认证） ============


@router.get("/health")
async def health_check():
    """健康检查"""
    return {"status": "healthy", "timestamp": datetime.now()}


# ============ 缓存管理路由（仅管理员） ============


@router.get("/cache/info")
async def get_cache_info(
    current_user: User = Depends(require_admin()),
    generation_service: GenerationService = Depends(get_generation_service),
):
    """获取缓存信息（仅管理员）"""
    try:
        cache_info = generation_service.get_cache_info()
        return {"cache_info": cache_info, "timestamp": datetime.now()}
    except Exception as e:
        logger.error(f"获取缓存信息失败: {e}")
        raise HTTPException(status_code=500, detail=f"获取缓存信息失败: {str(e)}")


@router.delete("/cache")
async def clear_cache(
    model: Optional[str] = Query(None, description="要清理的模型"),
    chain_type: Optional[str] = Query(None, description="要清理的chain类型"),
    current_user: User = Depends(require_admin()),
    generation_service: GenerationService = Depends(get_generation_service),
):
    """清理缓存（仅管理员）"""
    try:
        generation_service.clear_cache(model=model, chain_type=chain_type)
        logger.info(
            f"管理员 {current_user.username} 清理缓存: model={model}, chain_type={chain_type}"
        )
        return SuccessResponse(
            message=f"缓存清理成功", data={"model": model, "chain_type": chain_type}
        )
    except Exception as e:
        logger.error(f"清理缓存失败: {e}")
        raise HTTPException(status_code=500, detail=f"清理缓存失败: {str(e)}")


# ============ 生成相关路由（需要登录） ============


@router.post("/generate/content")
async def generate_content(
    request: GenerateContentRequest,
    current_user: User = Depends(get_current_active_user),
    generation_service: GenerationService = Depends(get_generation_service),
):
    """生成物理内容解释（需要登录）"""
    try:
        result = await generation_service.generate_content_only(
            question=request.question, model=request.model
        )
        logger.info(f"用户 {current_user.username} 生成内容成功")
        return result
    except Exception as e:
        logger.error(f"内容生成失败: {e}")
        raise HTTPException(status_code=500, detail=f"内容生成失败: {str(e)}")


@router.post("/generate/animation")
async def generate_animation(
    request: GenerateAnimationRequest,
    current_user: User = Depends(get_current_active_user),
    generation_service: GenerationService = Depends(get_generation_service),
):
    """生成SVG动画（需要登录）"""
    try:
        result = await generation_service.generate_animation_only(
            question=request.question,
            explanation=request.explanation,
            model=request.model,
        )
        logger.info(f"用户 {current_user.username} 生成动画成功")
        return result
    except Exception as e:
        logger.error(f"动画生成失败: {e}")
        raise HTTPException(status_code=500, detail=f"动画生成失败: {str(e)}")


@router.post("/generate/full")
async def generate_full(
    request: GenerateContentRequest,
    current_user: User = Depends(get_current_active_user),
    generation_service: GenerationService = Depends(get_generation_service),
):
    """生成完整的物理解释和SVG动画，并保存到历史记录（需要登录）"""
    try:
        physics_content, svg_result, history_id = (
            await generation_service.generate_full_with_history(
                question=request.question,
                model=request.model,
                user_id=current_user.id,  # 关联当前用户
            )
        )

        logger.info(f"用户 {current_user.username} 完整生成成功: {history_id}")
        return FullGenerationResponse(
            id=history_id,
            question=request.question,
            model=request.model,
            content={"explanation": physics_content.explanation},
            animation={"svgCode": svg_result.svgCode},
            created_at=datetime.now(),
        )

    except Exception as e:
        logger.error(f"完整生成失败: {e}")
        raise HTTPException(status_code=500, detail=f"完整生成失败: {str(e)}")


# ============ 历史记录相关路由（需要登录，权限过滤） ============


@router.post("/history/search", response_model=PaginatedResponse)
async def search_history(
    search_request: HistorySearchRequest,
    current_user: User = Depends(get_current_active_user),
    history_service: HistoryService = Depends(get_history_service),
):
    """搜索历史记录（权限过滤）"""
    try:
        return await history_service.search_history(search_request, user=current_user)
    except Exception as e:
        logger.error(f"搜索历史记录失败: {e}")
        raise HTTPException(status_code=500, detail=f"搜索失败: {str(e)}")


@router.get("/history", response_model=PaginatedResponse)
async def get_history_list(
    page: int = Query(1, ge=1, description="页码"),
    page_size: int = Query(20, ge=1, le=100, description="每页数量"),
    keyword: Optional[str] = Query(None, description="搜索关键词"),
    model: Optional[str] = Query(None, description="模型筛选"),
    status: Optional[str] = Query(None, description="状态筛选"),
    current_user: User = Depends(get_current_active_user),
    history_service: HistoryService = Depends(get_history_service),
):
    """获取历史记录列表（权限过滤）"""
    try:
        search_request = HistorySearchRequest(
            keyword=keyword, model=model, status=status, page=page, page_size=page_size
        )
        return await history_service.search_history(search_request, user=current_user)
    except Exception as e:
        logger.error(f"获取历史记录列表失败: {e}")
        raise HTTPException(status_code=500, detail=f"获取列表失败: {str(e)}")


@router.get("/history/recent")
async def get_recent_history(
    limit: int = Query(10, ge=1, le=50, description="返回数量"),
    current_user: User = Depends(get_current_active_user),
    history_service: HistoryService = Depends(get_history_service),
):
    """获取最近的历史记录（权限过滤）"""
    try:
        results = await history_service.get_recent_history(limit, user=current_user)
        return {"items": results, "count": len(results), "timestamp": datetime.now()}
    except Exception as e:
        logger.error(f"获取最近历史记录失败: {e}")
        raise HTTPException(status_code=500, detail=f"获取最近记录失败: {str(e)}")


@router.get("/history/{history_id}", response_model=GenerationHistoryResponse)
async def get_history_by_id(
    history_id: str,
    current_user: User = Depends(get_current_active_user),
    history_service: HistoryService = Depends(get_history_service),
):
    """根据ID获取历史记录（权限检查）"""
    try:
        result = await history_service.get_by_id(history_id, user=current_user)
        if not result:
            raise HTTPException(status_code=404, detail="历史记录未找到或无权访问")

        return GenerationHistoryResponse(**result.dict())
    except HTTPException:
        raise
    except Exception as e:
        logger.error(f"查询历史记录失败: {e}")
        raise HTTPException(status_code=500, detail=f"查询失败: {str(e)}")


@router.delete("/history/{history_id}")
async def delete_history(
    history_id: str,
    current_user: User = Depends(get_current_active_user),
    history_service: HistoryService = Depends(get_history_service),
):
    """删除历史记录（权限检查）"""
    try:
        success = await history_service.delete_by_id(history_id, user=current_user)
        if not success:
            raise HTTPException(status_code=404, detail="历史记录未找到或无权删除")

        logger.info(f"用户 {current_user.username} 删除历史记录: {history_id}")
        return SuccessResponse(message="历史记录已删除", data={"id": history_id})
    except HTTPException:
        raise
    except Exception as e:
        logger.error(f"删除历史记录失败: {e}")
        raise HTTPException(status_code=500, detail=f"删除失败: {str(e)}")


@router.delete("/history/batch")
async def batch_delete_history(
    history_ids: List[str],
    current_user: User = Depends(get_current_active_user),
    history_service: HistoryService = Depends(get_history_service),
):
    """批量删除历史记录（权限检查）"""
    try:
        if len(history_ids) > 50:  # 限制批量删除数量
            raise HTTPException(status_code=400, detail="批量删除数量不能超过50个")

        deleted_count = await history_service.bulk_delete(
            history_ids, user=current_user
        )

        logger.info(
            f"用户 {current_user.username} 批量删除历史记录: {deleted_count}/{len(history_ids)}"
        )
        return SuccessResponse(
            message=f"批量删除完成",
            data={"requested": len(history_ids), "deleted": deleted_count},
        )
    except HTTPException:
        raise
    except Exception as e:
        logger.error(f"批量删除历史记录失败: {e}")
        raise HTTPException(status_code=500, detail=f"批量删除失败: {str(e)}")


# ============ 统计相关路由（权限控制） ============


@router.get("/stats/summary", response_model=StatsResponse)
async def get_stats(
    current_user: User = Depends(get_current_active_user),
    history_service: HistoryService = Depends(get_history_service),
):
    """获取统计信息（根据用户权限返回不同数据）"""
    try:
        return await history_service.get_stats(user=current_user)
    except Exception as e:
        logger.error(f"获取统计信息失败: {e}")
        raise HTTPException(status_code=500, detail=f"获取统计信息失败: {str(e)}")


@router.get("/stats/models")
async def get_model_stats(
    current_user: User = Depends(get_current_active_user),
    history_service: HistoryService = Depends(get_history_service),
):
    """获取模型使用统计（权限过滤）"""
    try:
        stats = await history_service.get_stats(user=current_user)
        return {"model_stats": stats.by_model, "timestamp": datetime.now()}
    except Exception as e:
        logger.error(f"获取模型统计失败: {e}")
        raise HTTPException(status_code=500, detail=f"获取模型统计失败: {str(e)}")


# ============ 导出相关路由（权限检查） ============


@router.get("/export/history/{history_id}/svg")
async def export_svg(
    history_id: str,
    current_user: User = Depends(get_current_active_user),
    history_service: HistoryService = Depends(get_history_service),
):
    """导出SVG文件（权限检查）"""
    try:
        result = await history_service.get_by_id(history_id, user=current_user)
        if not result:
            raise HTTPException(status_code=404, detail="历史记录未找到或无权访问")

        if not result.svg_code:
            raise HTTPException(status_code=404, detail="该记录没有SVG内容")

        logger.info(f"用户 {current_user.username} 导出SVG: {history_id}")
        return Response(
            content=result.svg_code,
            media_type="image/svg+xml",
            headers={
                "Content-Disposition": f"attachment; filename=physics_animation_{history_id}.svg"
            },
        )
    except HTTPException:
        raise
    except Exception as e:
        logger.error(f"导出SVG失败: {e}")
        raise HTTPException(status_code=500, detail=f"导出失败: {str(e)}")


@router.get("/export/history/{history_id}/json")
async def export_json(
    history_id: str,
    current_user: User = Depends(get_current_active_user),
    history_service: HistoryService = Depends(get_history_service),
):
    """导出JSON格式的历史记录（权限检查）"""
    try:
        result = await history_service.get_by_id(history_id, user=current_user)
        if not result:
            raise HTTPException(status_code=404, detail="历史记录未找到或无权访问")

        logger.info(f"用户 {current_user.username} 导出JSON: {history_id}")
        return Response(
            content=result.model_dump_json(indent=2, ensure_ascii=False),
            media_type="application/json",
            headers={
                "Content-Disposition": f"attachment; filename=physics_record_{history_id}.json"
            },
        )
    except HTTPException:
        raise
    except Exception as e:
        logger.error(f"导出JSON失败: {e}")
        raise HTTPException(status_code=500, detail=f"导出失败: {str(e)}")
