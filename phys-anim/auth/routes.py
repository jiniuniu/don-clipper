# auth/routes.py
import logging
from typing import List

from auth.auth_models import (
    ChangePassword,
    Token,
    UpdateProfile,
    User,
    UserCreate,
    UserLogin,
    UserResponse,
    UserRole,
)
from auth.auth_service import AuthService
from auth.dependencies import get_auth_service, get_current_active_user, require_admin
from fastapi import APIRouter, Depends, HTTPException, Query, status
from schemas.schemas import SuccessResponse

logger = logging.getLogger(__name__)

router = APIRouter()


# ============ 公开路由（无需认证） ============


@router.post("/register", response_model=Token)
async def register_user(
    user_data: UserCreate, auth_service: AuthService = Depends(get_auth_service)
):
    """用户注册"""
    try:
        # 检查用户名和邮箱是否已存在
        existing_user = await auth_service.get_user_by_username(user_data.username)
        if existing_user:
            raise HTTPException(
                status_code=status.HTTP_400_BAD_REQUEST, detail="用户名已存在"
            )

        # 创建用户
        user = await auth_service.create_user(user_data)

        # 生成token
        token = await auth_service.create_token(user)

        logger.info(f"用户注册成功: {user.username}")
        return token

    except HTTPException:
        raise
    except ValueError as e:
        raise HTTPException(status_code=status.HTTP_400_BAD_REQUEST, detail=str(e))
    except Exception as e:
        logger.error(f"用户注册失败: {e}")
        raise HTTPException(
            status_code=status.HTTP_500_INTERNAL_SERVER_ERROR,
            detail="注册失败，请稍后重试",
        )


@router.post("/login", response_model=Token)
async def login_user(
    login_data: UserLogin, auth_service: AuthService = Depends(get_auth_service)
):
    """用户登录"""
    try:
        # 验证用户凭据
        user = await auth_service.authenticate_user(login_data)
        if not user:
            raise HTTPException(
                status_code=status.HTTP_401_UNAUTHORIZED,
                detail="用户名或密码错误",
                headers={"WWW-Authenticate": "Bearer"},
            )

        # 生成token
        token = await auth_service.create_token(user)

        logger.info(f"用户登录成功: {user.username}")
        return token

    except HTTPException:
        raise
    except Exception as e:
        logger.error(f"用户登录失败: {e}")
        raise HTTPException(
            status_code=status.HTTP_500_INTERNAL_SERVER_ERROR,
            detail="登录失败，请稍后重试",
        )


# ============ 需要认证的路由 ============


@router.get("/me", response_model=UserResponse)
async def get_current_user_info(current_user: User = Depends(get_current_active_user)):
    """获取当前用户信息"""
    return UserResponse(
        id=current_user.id,
        username=current_user.username,
        email=current_user.email,
        full_name=current_user.full_name,
        role=current_user.role,
        is_active=current_user.is_active,
        created_at=current_user.created_at,
    )


@router.put("/me", response_model=UserResponse)
async def update_current_user_profile(
    profile_data: UpdateProfile,
    current_user: User = Depends(get_current_active_user),
    auth_service: AuthService = Depends(get_auth_service),
):
    """更新当前用户资料"""
    try:
        success = await auth_service.update_user_profile(
            user_id=current_user.id,
            full_name=profile_data.full_name,
            email=profile_data.email,
        )

        if not success:
            raise HTTPException(
                status_code=status.HTTP_400_BAD_REQUEST, detail="更新失败"
            )

        # 返回更新后的用户信息
        updated_user = await auth_service.get_user_by_id(current_user.id)
        return UserResponse(
            id=updated_user.id,
            username=updated_user.username,
            email=updated_user.email,
            full_name=updated_user.full_name,
            role=updated_user.role,
            is_active=updated_user.is_active,
            created_at=updated_user.created_at,
        )

    except HTTPException:
        raise
    except Exception as e:
        logger.error(f"更新用户资料失败: {e}")
        raise HTTPException(
            status_code=status.HTTP_500_INTERNAL_SERVER_ERROR,
            detail="更新失败，请稍后重试",
        )


@router.put("/me/password")
async def change_password(
    password_data: ChangePassword,
    current_user: User = Depends(get_current_active_user),
    auth_service: AuthService = Depends(get_auth_service),
):
    """修改密码"""
    try:
        success = await auth_service.update_user_password(
            user_id=current_user.id,
            current_password=password_data.current_password,
            new_password=password_data.new_password,
        )

        if not success:
            raise HTTPException(
                status_code=status.HTTP_400_BAD_REQUEST, detail="密码更新失败"
            )

        logger.info(f"用户密码更新成功: {current_user.username}")
        return SuccessResponse(message="密码更新成功")

    except ValueError as e:
        raise HTTPException(status_code=status.HTTP_400_BAD_REQUEST, detail=str(e))
    except HTTPException:
        raise
    except Exception as e:
        logger.error(f"修改密码失败: {e}")
        raise HTTPException(
            status_code=status.HTTP_500_INTERNAL_SERVER_ERROR,
            detail="密码更新失败，请稍后重试",
        )


# ============ 管理员路由 ============


@router.post("/admin/create-user", response_model=UserResponse)
async def create_user_by_admin(
    user_data: UserCreate,
    role: UserRole = Query(UserRole.USER, description="用户角色"),
    current_user: User = Depends(require_admin()),
    auth_service: AuthService = Depends(get_auth_service),
):
    """管理员创建用户"""
    try:
        user = await auth_service.create_user(user_data, role=role)

        logger.info(f"管理员 {current_user.username} 创建用户: {user.username}")
        return UserResponse(
            id=user.id,
            username=user.username,
            email=user.email,
            full_name=user.full_name,
            role=user.role,
            is_active=user.is_active,
            created_at=user.created_at,
        )

    except ValueError as e:
        raise HTTPException(status_code=status.HTTP_400_BAD_REQUEST, detail=str(e))
    except Exception as e:
        logger.error(f"管理员创建用户失败: {e}")
        raise HTTPException(
            status_code=status.HTTP_500_INTERNAL_SERVER_ERROR,
            detail="创建用户失败，请稍后重试",
        )


@router.get("/admin/users", response_model=List[UserResponse])
async def get_users_list(
    skip: int = Query(0, ge=0, description="跳过数量"),
    limit: int = Query(50, ge=1, le=100, description="返回数量"),
    active_only: bool = Query(True, description="只显示活跃用户"),
    current_user: User = Depends(require_admin()),
    auth_service: AuthService = Depends(get_auth_service),
):
    """获取用户列表（管理员）"""
    try:
        users, total = await auth_service.get_users_list(
            skip=skip, limit=limit, active_only=active_only
        )

        logger.info(f"管理员 {current_user.username} 查询用户列表")
        return users

    except Exception as e:
        logger.error(f"获取用户列表失败: {e}")
        raise HTTPException(
            status_code=status.HTTP_500_INTERNAL_SERVER_ERROR,
            detail="获取用户列表失败，请稍后重试",
        )


@router.get("/admin/users/{user_id}", response_model=UserResponse)
async def get_user_by_id(
    user_id: str,
    current_user: User = Depends(require_admin()),
    auth_service: AuthService = Depends(get_auth_service),
):
    """根据ID获取用户信息（管理员）"""
    try:
        user = await auth_service.get_user_by_id(user_id)
        if not user:
            raise HTTPException(
                status_code=status.HTTP_404_NOT_FOUND, detail="用户不存在"
            )

        return UserResponse(
            id=user.id,
            username=user.username,
            email=user.email,
            full_name=user.full_name,
            role=user.role,
            is_active=user.is_active,
            created_at=user.created_at,
        )

    except HTTPException:
        raise
    except Exception as e:
        logger.error(f"获取用户信息失败: {e}")
        raise HTTPException(
            status_code=status.HTTP_500_INTERNAL_SERVER_ERROR,
            detail="获取用户信息失败，请稍后重试",
        )


@router.put("/admin/users/{user_id}/deactivate")
async def deactivate_user(
    user_id: str,
    current_user: User = Depends(require_admin()),
    auth_service: AuthService = Depends(get_auth_service),
):
    """停用用户（管理员）"""
    try:
        # 不能停用自己
        if user_id == current_user.id:
            raise HTTPException(
                status_code=status.HTTP_400_BAD_REQUEST, detail="不能停用自己的账户"
            )

        success = await auth_service.deactivate_user(user_id)
        if not success:
            raise HTTPException(
                status_code=status.HTTP_404_NOT_FOUND, detail="用户不存在"
            )

        logger.info(f"管理员 {current_user.username} 停用用户: {user_id}")
        return SuccessResponse(message="用户已停用", data={"user_id": user_id})

    except HTTPException:
        raise
    except Exception as e:
        logger.error(f"停用用户失败: {e}")
        raise HTTPException(
            status_code=status.HTTP_500_INTERNAL_SERVER_ERROR,
            detail="停用用户失败，请稍后重试",
        )
