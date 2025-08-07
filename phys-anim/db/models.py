# db/models.py
"""
数据库模型
用于数据库操作和数据存储
"""

from datetime import datetime
from enum import Enum
from typing import Any, Dict, Optional

from pydantic import BaseModel


# 枚举类型（与schemas.py保持一致）
class GenerationStatus(str, Enum):
    PENDING = "pending"
    SUCCESS = "success"
    FAILED = "failed"


# ============ 数据库模型 ============


class GenerationHistoryCreate(BaseModel):
    """创建历史记录的数据模型"""

    question: str
    explanation: str
    svg_code: str
    model: str
    user_id: Optional[str] = None
    status: GenerationStatus = GenerationStatus.SUCCESS
    error_message: Optional[str] = None
    metadata: Optional[Dict[str, Any]] = None


class GenerationHistory(BaseModel):
    """历史记录完整数据库模型"""

    id: str
    question: str
    explanation: str
    svg_code: str
    model: str
    user_id: Optional[str] = None
    status: GenerationStatus
    error_message: Optional[str] = None
    created_at: datetime
    updated_at: Optional[datetime] = None
    metadata: Optional[Dict[str, Any]] = None

    class Config:
        """Pydantic配置"""

        # 允许从字典创建模型实例
        from_attributes = True
        # 在序列化时使用枚举值而不是枚举名称
        use_enum_values = True
