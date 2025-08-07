# auth/auth_service.py
import hashlib
import logging
import uuid
from datetime import datetime
from typing import Optional

from auth.auth_models import Token, User, UserCreate, UserLogin, UserResponse, UserRole
from auth.jwt_handler import JWTHandler
from motor.motor_asyncio import AsyncIOMotorDatabase
from pymongo.errors import DuplicateKeyError

logger = logging.getLogger(__name__)


class AuthService:
    def __init__(self, database: AsyncIOMotorDatabase, collection_name: str = "users"):
        self.db = database
        self.collection = database[collection_name]

    @staticmethod
    def hash_password(password: str) -> str:
        """密码加密"""
        return hashlib.sha256(password.encode()).hexdigest()

    @staticmethod
    def verify_password(plain_password: str, hashed_password: str) -> bool:
        """验证密码"""
        return hashlib.sha256(plain_password.encode()).hexdigest() == hashed_password

    async def create_user(
        self, user_data: UserCreate, role: UserRole = UserRole.USER
    ) -> User:
        """创建用户"""
        try:
            now = datetime.now()
            user_dict = {
                "id": str(uuid.uuid4()),
                "username": user_data.username,
                "email": user_data.email,
                "full_name": user_data.full_name,
                "password_hash": self.hash_password(user_data.password),
                "role": role.value,
                "is_active": True,
                "created_at": now,
                "updated_at": now,
            }

            await self.collection.insert_one(user_dict)
            logger.info(f"用户创建成功: {user_data.username}")

            # 移除密码hash后返回
            user_dict.pop("password_hash")
            user_dict["role"] = UserRole(user_dict["role"])
            return User(**user_dict)

        except DuplicateKeyError as e:
            if "username" in str(e):
                raise ValueError("用户名已存在")
            elif "email" in str(e):
                raise ValueError("邮箱已存在")
            else:
                raise ValueError("用户信息重复")
        except Exception as e:
            logger.error(f"创建用户失败: {e}")
            raise

    async def authenticate_user(self, login_data: UserLogin) -> Optional[User]:
        """验证用户登录"""
        try:
            # 支持用户名或邮箱登录
            query = {
                "$or": [
                    {"username": login_data.username},
                    {"email": login_data.username},
                ],
                "is_active": True,
            }

            user_doc = await self.collection.find_one(query)
            if not user_doc:
                return None

            # 验证密码
            if not self.verify_password(login_data.password, user_doc["password_hash"]):
                return None

            # 移除密码hash
            user_doc.pop("password_hash")
            user_doc.pop("_id", None)
            user_doc["role"] = UserRole(user_doc["role"])

            return User(**user_doc)

        except Exception as e:
            logger.error(f"用户认证失败: {e}")
            return None

    async def get_user_by_id(self, user_id: str) -> Optional[User]:
        """根据ID获取用户"""
        try:
            user_doc = await self.collection.find_one(
                {"id": user_id, "is_active": True}, {"password_hash": 0, "_id": 0}
            )

            if user_doc:
                user_doc["role"] = UserRole(user_doc["role"])
                return User(**user_doc)
            return None

        except Exception as e:
            logger.error(f"获取用户失败: {e}")
            return None

    async def get_user_by_username(self, username: str) -> Optional[User]:
        """根据用户名获取用户"""
        try:
            user_doc = await self.collection.find_one(
                {"username": username, "is_active": True},
                {"password_hash": 0, "_id": 0},
            )

            if user_doc:
                user_doc["role"] = UserRole(user_doc["role"])
                return User(**user_doc)
            return None

        except Exception as e:
            logger.error(f"获取用户失败: {e}")
            return None

    async def create_token(self, user: User) -> Token:
        """创建访问令牌"""
        access_token, expires_in = JWTHandler.create_access_token(
            user_id=user.id, username=user.username, role=user.role
        )

        return Token(
            access_token=access_token,
            expires_in=expires_in,
            user=UserResponse(
                id=user.id,
                username=user.username,
                email=user.email,
                full_name=user.full_name,
                role=user.role,
                is_active=user.is_active,
                created_at=user.created_at,
            ),
        )

    async def update_user_password(
        self, user_id: str, current_password: str, new_password: str
    ) -> bool:
        """更新用户密码"""
        try:
            # 先验证当前密码
            user_doc = await self.collection.find_one(
                {"id": user_id, "is_active": True}
            )
            if not user_doc:
                return False

            if not self.verify_password(current_password, user_doc["password_hash"]):
                raise ValueError("当前密码不正确")

            # 更新密码
            new_password_hash = self.hash_password(new_password)
            result = await self.collection.update_one(
                {"id": user_id},
                {
                    "$set": {
                        "password_hash": new_password_hash,
                        "updated_at": datetime.now(),
                    }
                },
            )

            return result.modified_count > 0

        except ValueError:
            raise
        except Exception as e:
            logger.error(f"更新密码失败: {e}")
            raise

    async def update_user_profile(self, user_id: str, **kwargs) -> bool:
        """更新用户资料"""
        try:
            update_data = {"updated_at": datetime.now()}

            for key, value in kwargs.items():
                if value is not None and key in ["full_name", "email"]:
                    update_data[key] = value

            if len(update_data) == 1:  # 只有updated_at
                return True

            result = await self.collection.update_one(
                {"id": user_id, "is_active": True}, {"$set": update_data}
            )

            return result.modified_count > 0

        except Exception as e:
            logger.error(f"更新用户资料失败: {e}")
            raise

    async def deactivate_user(self, user_id: str) -> bool:
        """停用用户"""
        try:
            result = await self.collection.update_one(
                {"id": user_id},
                {"$set": {"is_active": False, "updated_at": datetime.now()}},
            )

            return result.modified_count > 0

        except Exception as e:
            logger.error(f"停用用户失败: {e}")
            raise

    async def get_users_list(
        self, skip: int = 0, limit: int = 50, active_only: bool = True
    ):
        """获取用户列表（管理员功能）"""
        try:
            query = {"is_active": True} if active_only else {}

            cursor = (
                self.collection.find(query, {"password_hash": 0, "_id": 0})
                .skip(skip)
                .limit(limit)
                .sort("created_at", -1)
            )

            users = []
            async for user_doc in cursor:
                user_doc["role"] = UserRole(user_doc["role"])
                users.append(UserResponse(**user_doc))

            total = await self.collection.count_documents(query)

            return users, total

        except Exception as e:
            logger.error(f"获取用户列表失败: {e}")
            raise
