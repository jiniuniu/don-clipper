# auth/dependencies.py
import logging
from typing import Optional

from auth.auth_models import User, UserRole
from auth.auth_service import AuthService
from auth.jwt_handler import JWTHandler
from db.database import get_database
from fastapi import Depends, HTTPException, status
from fastapi.security import HTTPAuthorizationCredentials, HTTPBearer

logger = logging.getLogger(__name__)

# Bearer token方案
bearer_scheme = HTTPBearer()


async def get_auth_service(db=Depends(get_database)):
    """获取认证服务实例"""
    return AuthService(db)


async def get_current_user(
    credentials: HTTPAuthorizationCredentials = Depends(bearer_scheme),
    auth_service: AuthService = Depends(get_auth_service),
) -> User:
    """获取当前认证用户"""
    credentials_exception = HTTPException(
        status_code=status.HTTP_401_UNAUTHORIZED,
        detail="无效的认证凭据",
        headers={"WWW-Authenticate": "Bearer"},
    )

    try:
        # 验证token
        token_data = JWTHandler.verify_token(credentials.credentials)
        if token_data is None or token_data.user_id is None:
            raise credentials_exception

        # 获取用户信息
        user = await auth_service.get_user_by_id(token_data.user_id)
        if user is None:
            raise credentials_exception

        return user

    except HTTPException:
        raise
    except Exception as e:
        logger.error(f"获取当前用户失败: {e}")
        raise credentials_exception


async def get_current_active_user(
    current_user: User = Depends(get_current_user),
) -> User:
    """获取当前活跃用户"""
    if not current_user.is_active:
        raise HTTPException(
            status_code=status.HTTP_400_BAD_REQUEST, detail="用户账户已被停用"
        )
    return current_user


def require_role(required_role: UserRole):
    """要求特定角色的依赖工厂"""

    async def role_checker(
        current_user: User = Depends(get_current_active_user),
    ) -> User:
        if current_user.role != required_role:
            raise HTTPException(
                status_code=status.HTTP_403_FORBIDDEN, detail="权限不足"
            )
        return current_user

    return role_checker


def require_admin():
    """要求管理员权限"""
    return require_role(UserRole.ADMIN)


def require_user_or_admin():
    """要求用户或管理员权限（基本上就是需要登录）"""
    return get_current_active_user


async def get_optional_user(
    auth_service: AuthService = Depends(get_auth_service),
    credentials: Optional[HTTPAuthorizationCredentials] = Depends(
        HTTPBearer(auto_error=False)
    ),
) -> Optional[User]:
    """获取可选的用户信息（用于某些公开但可以个性化的端点）"""
    if not credentials:
        return None

    try:
        token_data = JWTHandler.verify_token(credentials.credentials)
        if token_data is None or token_data.user_id is None:
            return None

        user = await auth_service.get_user_by_id(token_data.user_id)
        return user if user and user.is_active else None

    except Exception as e:
        logger.warning(f"可选用户认证失败: {e}")
        return None


def check_user_access_permission(
    current_user: User, target_user_id: Optional[str]
) -> bool:
    """检查用户是否有权限访问特定数据"""
    # 管理员可以访问所有数据
    if current_user.role == UserRole.ADMIN:
        return True

    # 普通用户只能访问自己的数据
    if target_user_id is None:
        # 对于历史数据（无user_id），只有管理员可以访问
        return False

    return current_user.id == target_user_id


def require_user_access(target_user_id: Optional[str] = None):
    """要求用户访问权限的依赖工厂"""

    async def access_checker(
        current_user: User = Depends(get_current_active_user),
    ) -> User:
        if not check_user_access_permission(current_user, target_user_id):
            raise HTTPException(
                status_code=status.HTTP_403_FORBIDDEN, detail="无权限访问该资源"
            )
        return current_user

    return access_checker
