# database.py
import logging
import os

from dotenv import load_dotenv
from motor.motor_asyncio import AsyncIOMotorClient, AsyncIOMotorDatabase

load_dotenv()

logger = logging.getLogger(__name__)


class Database:
    client: AsyncIOMotorClient = None
    database: AsyncIOMotorDatabase = None


db = Database()


async def connect_to_mongo():
    """连接到MongoDB数据库"""
    mongo_url = os.getenv("MONGODB_URL", "mongodb://localhost:27017")
    db_name = os.getenv("MONGODB_DB_NAME", "physics_animations")

    logger.info(f"正在连接到MongoDB: {mongo_url}")

    try:
        db.client = AsyncIOMotorClient(mongo_url)
        db.database = db.client[db_name]

        # 测试连接
        await db.client.admin.command("ping")
        logger.info("成功连接到MongoDB")

        # 创建索引
        await create_indexes()

    except Exception as e:
        logger.error(f"MongoDB连接失败: {e}")
        raise


async def close_mongo_connection():
    """关闭MongoDB连接"""
    if db.client:
        logger.info("正在关闭MongoDB连接...")
        db.client.close()


async def get_database() -> AsyncIOMotorDatabase:
    """获取数据库实例"""
    return db.database


async def create_indexes():
    """创建数据库索引"""
    try:
        # 历史记录集合索引
        history_collection = db.database.generation_history

        # 创建各种索引
        await history_collection.create_index("created_at")
        await history_collection.create_index("model")
        await history_collection.create_index("status")
        await history_collection.create_index("user_id")
        await history_collection.create_index(
            [("question", "text"), ("explanation", "text")]
        )

        # 复合索引：用户+状态+时间
        await history_collection.create_index(
            [("user_id", 1), ("status", 1), ("created_at", -1)]
        )

        # 用户集合索引
        users_collection = db.database.users

        # 创建用户相关索引
        await users_collection.create_index("username", unique=True)
        await users_collection.create_index("email", unique=True)
        await users_collection.create_index("created_at")
        await users_collection.create_index("is_active")
        await users_collection.create_index("role")

        logger.info("数据库索引创建完成")

    except Exception as e:
        logger.error(f"创建索引失败: {e}")
        raise
