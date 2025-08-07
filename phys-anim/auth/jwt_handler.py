# auth/jwt_handler.py
import os
from datetime import datetime, timedelta
from typing import Optional

import jwt
from auth.auth_models import TokenData, UserRole
from dotenv import load_dotenv

load_dotenv()

# JWT配置
SECRET_KEY = os.getenv("JWT_SECRET_KEY", "your-secret-key-here")
ALGORITHM = os.getenv("JWT_ALGORITHM", "HS256")
ACCESS_TOKEN_EXPIRE_HOURS = int(os.getenv("JWT_EXPIRE_HOURS", "24"))


class JWTHandler:
    @staticmethod
    def create_access_token(
        user_id: str,
        username: str,
        role: UserRole,
        expires_delta: Optional[timedelta] = None,
    ) -> tuple[str, int]:
        """创建访问令牌"""
        if expires_delta:
            expire = datetime.utcnow() + expires_delta
        else:
            expire = datetime.utcnow() + timedelta(hours=ACCESS_TOKEN_EXPIRE_HOURS)

        expires_in = (
            int(expires_delta.total_seconds())
            if expires_delta
            else ACCESS_TOKEN_EXPIRE_HOURS * 3600
        )

        to_encode = {
            "sub": user_id,
            "username": username,
            "role": role.value,
            "exp": expire,
            "iat": datetime.utcnow(),
            "type": "access",
        }

        encoded_jwt = jwt.encode(to_encode, SECRET_KEY, algorithm=ALGORITHM)
        return encoded_jwt, expires_in

    @staticmethod
    def verify_token(token: str) -> Optional[TokenData]:
        """验证并解码令牌"""
        try:
            payload = jwt.decode(token, SECRET_KEY, algorithms=[ALGORITHM])

            user_id = payload.get("sub")
            username = payload.get("username")
            role = payload.get("role")

            if user_id is None or username is None or role is None:
                return None

            # 检查token类型
            if payload.get("type") != "access":
                return None

            return TokenData(user_id=user_id, username=username, role=UserRole(role))

        except jwt.ExpiredSignatureError:
            return None
        except jwt.JWTError:
            return None

    @staticmethod
    def create_refresh_token(user_id: str) -> str:
        """创建刷新令牌（可选功能）"""
        expire = datetime.utcnow() + timedelta(days=7)  # 刷新令牌7天有效期

        to_encode = {
            "sub": user_id,
            "exp": expire,
            "iat": datetime.utcnow(),
            "type": "refresh",
        }

        return jwt.encode(to_encode, SECRET_KEY, algorithm=ALGORITHM)

    @staticmethod
    def verify_refresh_token(token: str) -> Optional[str]:
        """验证刷新令牌"""
        try:
            payload = jwt.decode(token, SECRET_KEY, algorithms=[ALGORITHM])

            user_id = payload.get("sub")
            if user_id is None or payload.get("type") != "refresh":
                return None

            return user_id

        except jwt.ExpiredSignatureError:
            return None
        except jwt.JWTError:
            return None
