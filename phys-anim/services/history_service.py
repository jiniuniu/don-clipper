# services/history_service.py
import logging
import uuid
from datetime import datetime, timedelta
from typing import Any, Dict, List, Optional

from auth.auth_models import User, UserRole
from db.models import GenerationHistory, GenerationHistoryCreate, GenerationStatus
from motor.motor_asyncio import AsyncIOMotorDatabase
from pymongo import DESCENDING
from schemas.schemas import (
    ActivityStats,
    GenerationHistoryResponse,
    HistorySearchRequest,
    ModelStats,
    PaginatedResponse,
    StatsResponse,
    UserStats,
)

logger = logging.getLogger(__name__)


class HistoryService:
    def __init__(
        self,
        database: AsyncIOMotorDatabase,
        collection_name: str = "generation_history",
    ):
        self.db = database
        self.collection = database[collection_name]

    def _build_user_query(self, user: Optional[User] = None) -> Dict[str, Any]:
        """根据用户权限构建查询条件"""
        if user is None:
            # 无用户信息，返回空查询（通常不应该发生）
            return {}

        if user.role == UserRole.ADMIN:
            # 管理员可以查看所有记录
            return {}
        else:
            # 普通用户只能查看自己的记录
            return {"user_id": user.id}

    async def save_generation(
        self, create_data: GenerationHistoryCreate
    ) -> GenerationHistory:
        """保存生成记录到数据库"""
        try:
            now = datetime.now()
            history_data = {
                "id": str(uuid.uuid4()),
                "question": create_data.question,
                "explanation": create_data.explanation,
                "svg_code": create_data.svg_code,
                "model": create_data.model,
                "user_id": create_data.user_id,
                "status": create_data.status,
                "error_message": create_data.error_message,
                "created_at": now,
                "updated_at": now,
                "metadata": create_data.metadata or {},
            }

            await self.collection.insert_one(history_data)
            logger.info(
                f"保存历史记录成功: {history_data['id']} (用户: {create_data.user_id})"
            )

            return GenerationHistory(**history_data)

        except Exception as e:
            logger.error(f"保存历史记录失败: {e}")
            raise

    async def create_pending_record(
        self,
        question: str,
        model: str,
        user_id: str,
        metadata: Optional[Dict[str, Any]] = None,
    ) -> GenerationHistory:
        """创建一个pending状态的记录"""
        create_data = GenerationHistoryCreate(
            question=question,
            explanation="",
            svg_code="",
            model=model,
            user_id=user_id,
            status=GenerationStatus.PENDING,
            metadata=metadata,
        )
        return await self.save_generation(create_data)

    async def get_by_id(
        self, history_id: str, user: Optional[User] = None
    ) -> Optional[GenerationHistory]:
        """根据ID获取历史记录（带权限检查）"""
        try:
            result = await self.collection.find_one({"id": history_id})
            if not result:
                return None

            # 权限检查
            if user:
                if user.role != UserRole.ADMIN and result.get("user_id") != user.id:
                    # 普通用户尝试访问他人记录，或访问历史无主记录
                    return None

            # 移除MongoDB的_id字段
            result.pop("_id", None)
            return GenerationHistory(**result)

        except Exception as e:
            logger.error(f"查询历史记录失败: {e}")
            raise

    async def search_history(
        self, search_request: HistorySearchRequest, user: Optional[User] = None
    ) -> PaginatedResponse:
        """搜索历史记录（带权限过滤）"""
        try:
            # 构建基础查询条件
            query = self._build_user_query(user)

            # 关键词搜索
            if search_request.keyword:
                query["$or"] = [
                    {"question": {"$regex": search_request.keyword, "$options": "i"}},
                    {
                        "explanation": {
                            "$regex": search_request.keyword,
                            "$options": "i",
                        }
                    },
                ]

            # 模型筛选
            if search_request.model:
                query["model"] = search_request.model

            # 状态筛选
            if search_request.status:
                query["status"] = search_request.status

            # 日期范围筛选
            if search_request.start_date or search_request.end_date:
                date_query = {}
                if search_request.start_date:
                    date_query["$gte"] = search_request.start_date
                if search_request.end_date:
                    date_query["$lte"] = search_request.end_date
                query["created_at"] = date_query

            # 计算分页参数
            skip = (search_request.page - 1) * search_request.page_size
            limit = search_request.page_size

            # 查询总数
            total = await self.collection.count_documents(query)

            # 查询数据
            cursor = (
                self.collection.find(query, {"_id": 0})
                .sort("created_at", DESCENDING)
                .skip(skip)
                .limit(limit)
            )
            results = await cursor.to_list(length=limit)

            # 转换为响应模型
            items = []
            for result in results:
                items.append(GenerationHistoryResponse(**result))

            # 计算总页数
            total_pages = (
                total + search_request.page_size - 1
            ) // search_request.page_size

            return PaginatedResponse(
                items=items,
                total=total,
                page=search_request.page,
                page_size=search_request.page_size,
                total_pages=total_pages,
            )

        except Exception as e:
            logger.error(f"搜索历史记录失败: {e}")
            raise

    async def delete_by_id(self, history_id: str, user: Optional[User] = None) -> bool:
        """删除历史记录（带权限检查）"""
        try:
            # 先检查记录是否存在以及权限
            record = await self.get_by_id(history_id, user)
            if not record:
                return False

            result = await self.collection.delete_one({"id": history_id})
            success = result.deleted_count > 0

            if success:
                logger.info(
                    f"删除历史记录成功: {history_id} (用户: {user.id if user else 'unknown'})"
                )
            else:
                logger.warning(f"历史记录不存在: {history_id}")

            return success

        except Exception as e:
            logger.error(f"删除历史记录失败: {e}")
            raise

    async def update_record(
        self,
        history_id: str,
        explanation: Optional[str] = None,
        svg_code: Optional[str] = None,
        status: Optional[GenerationStatus] = None,
        error_message: Optional[str] = None,
    ) -> bool:
        """更新历史记录"""
        try:
            update_data = {"updated_at": datetime.now()}

            if explanation is not None:
                update_data["explanation"] = explanation
            if svg_code is not None:
                update_data["svg_code"] = svg_code
            if status is not None:
                update_data["status"] = status
            if error_message is not None:
                update_data["error_message"] = error_message

            result = await self.collection.update_one(
                {"id": history_id}, {"$set": update_data}
            )

            success = result.modified_count > 0
            if success:
                logger.info(f"更新历史记录成功: {history_id}")

            return success

        except Exception as e:
            logger.error(f"更新历史记录失败: {e}")
            raise

    async def get_stats(self, user: Optional[User] = None) -> StatsResponse:
        """获取统计信息（根据用户权限返回不同数据）"""
        try:
            # 根据用户权限构建查询
            base_query = self._build_user_query(user)

            # 基础统计
            total = await self.collection.count_documents(base_query)
            successful = await self.collection.count_documents(
                {**base_query, "status": GenerationStatus.SUCCESS}
            )
            failed = await self.collection.count_documents(
                {**base_query, "status": GenerationStatus.FAILED}
            )

            # 按模型统计
            model_pipeline = [
                {"$match": base_query},
                {
                    "$group": {
                        "_id": "$model",
                        "count": {"$sum": 1},
                        "latest_generation": {"$max": "$created_at"},
                    }
                },
                {"$sort": {"count": -1}},
            ]

            model_results = await self.collection.aggregate(model_pipeline).to_list(
                length=None
            )
            by_model = []
            for item in model_results:
                by_model.append(
                    ModelStats(
                        model=item["_id"],
                        count=item["count"],
                        latest_generation=item.get("latest_generation"),
                    )
                )

            # 按用户统计（仅管理员可见）
            by_user = None
            if user and user.role == UserRole.ADMIN:
                user_pipeline = [
                    {
                        "$group": {
                            "_id": "$user_id",
                            "count": {"$sum": 1},
                        }
                    },
                    {"$sort": {"count": -1}},
                    {"$limit": 10},  # 只取前10名
                ]

                user_results = await self.collection.aggregate(user_pipeline).to_list(
                    length=None
                )
                by_user = []
                for item in user_results:
                    by_user.append(UserStats(user_id=item["_id"], count=item["count"]))

            # 最近7天的活动统计
            seven_days_ago = datetime.now() - timedelta(days=7)
            activity_query = {**base_query, "created_at": {"$gte": seven_days_ago}}

            activity_pipeline = [
                {"$match": activity_query},
                {
                    "$group": {
                        "_id": {
                            "$dateToString": {
                                "format": "%Y-%m-%d",
                                "date": "$created_at",
                            }
                        },
                        "count": {"$sum": 1},
                    }
                },
                {"$sort": {"_id": -1}},
            ]

            activity_results = await self.collection.aggregate(
                activity_pipeline
            ).to_list(length=None)
            recent_activity = []
            for item in activity_results:
                recent_activity.append(
                    ActivityStats(date=item["_id"], count=item["count"])
                )

            return StatsResponse(
                total_generations=total,
                successful_generations=successful,
                failed_generations=failed,
                by_model=by_model,
                by_user=by_user,
                recent_activity=recent_activity,
                timestamp=datetime.now(),
            )

        except Exception as e:
            logger.error(f"获取统计信息失败: {e}")
            raise

    async def get_recent_history(
        self, limit: int = 10, user: Optional[User] = None
    ) -> List[GenerationHistoryResponse]:
        """获取最近的历史记录（带权限过滤）"""
        try:
            query = {**self._build_user_query(user), "status": GenerationStatus.SUCCESS}

            cursor = (
                self.collection.find(query, {"_id": 0})
                .sort("created_at", DESCENDING)
                .limit(limit)
            )

            results = await cursor.to_list(length=limit)

            return [GenerationHistoryResponse(**result) for result in results]

        except Exception as e:
            logger.error(f"获取最近历史记录失败: {e}")
            raise

    async def bulk_delete(
        self, history_ids: List[str], user: Optional[User] = None
    ) -> int:
        """批量删除历史记录（带权限检查）"""
        try:
            # 构建删除查询
            delete_query = {"id": {"$in": history_ids}}

            # 添加用户权限过滤
            user_query = self._build_user_query(user)
            delete_query.update(user_query)

            result = await self.collection.delete_many(delete_query)
            deleted_count = result.deleted_count

            logger.info(
                f"批量删除历史记录: {deleted_count}/{len(history_ids)} (用户: {user.id if user else 'unknown'})"
            )
            return deleted_count

        except Exception as e:
            logger.error(f"批量删除历史记录失败: {e}")
            raise

    async def count_by_status(
        self, status: GenerationStatus, user: Optional[User] = None
    ) -> int:
        """按状态统计记录数量（带权限过滤）"""
        try:
            query = {**self._build_user_query(user), "status": status}
            return await self.collection.count_documents(query)
        except Exception as e:
            logger.error(f"按状态统计失败: {e}")
            raise

    async def get_user_history(
        self, user_id: str, limit: int = 20
    ) -> List[GenerationHistoryResponse]:
        """获取特定用户的历史记录"""
        try:
            cursor = (
                self.collection.find({"user_id": user_id}, {"_id": 0})
                .sort("created_at", DESCENDING)
                .limit(limit)
            )

            results = await cursor.to_list(length=limit)

            return [GenerationHistoryResponse(**result) for result in results]

        except Exception as e:
            logger.error(f"获取用户历史记录失败: {e}")
            raise
