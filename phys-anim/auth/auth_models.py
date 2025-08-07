# auth/models.py
from datetime import datetime
from enum import Enum
from typing import Optional

from pydantic import BaseModel, EmailStr, Field


class UserRole(str, Enum):
    USER = "user"
    ADMIN = "admin"


class UserCreate(BaseModel):
    """用户注册模型"""

    username: str = Field(..., min_length=3, max_length=50, description="用户名")
    email: EmailStr = Field(..., description="邮箱地址")
    password: str = Field(..., min_length=6, max_length=100, description="密码")
    full_name: Optional[str] = Field(None, max_length=100, description="真实姓名")


class UserLogin(BaseModel):
    """用户登录模型"""

    username: str = Field(..., description="用户名或邮箱")
    password: str = Field(..., description="密码")


class User(BaseModel):
    """用户模型"""

    id: str
    username: str
    email: str
    full_name: Optional[str] = None
    role: UserRole = UserRole.USER
    is_active: bool = True
    created_at: datetime
    updated_at: datetime


class UserResponse(BaseModel):
    """用户响应模型（不包含敏感信息）"""

    id: str
    username: str
    email: str
    full_name: Optional[str] = None
    role: UserRole
    is_active: bool
    created_at: datetime


class Token(BaseModel):
    """Token响应模型"""

    access_token: str
    token_type: str = "bearer"
    expires_in: int
    user: UserResponse


class TokenData(BaseModel):
    """Token数据模型"""

    user_id: Optional[str] = None
    username: Optional[str] = None
    role: Optional[UserRole] = None


class ChangePassword(BaseModel):
    """修改密码模型"""

    current_password: str = Field(..., description="当前密码")
    new_password: str = Field(..., min_length=6, max_length=100, description="新密码")


class UpdateProfile(BaseModel):
    """更新个人信息模型"""

    full_name: Optional[str] = Field(None, max_length=100, description="真实姓名")
    email: Optional[EmailStr] = Field(None, description="邮箱地址")
