# services/generation_service.py
import logging
from typing import Any, Dict, Optional, Tuple

from core.chains import (
    PhysicsContent,
    SVGGeneration,
    create_content_chain,
    create_svg_chain,
)
from core.llm import get_llm
from db.models import GenerationStatus
from langchain_core.runnables import Runnable
from services.history_service import HistoryService

logger = logging.getLogger(__name__)


class GenerationService:
    def __init__(self, history_service: HistoryService):
        self.history_service = history_service
        # 统一的chains缓存：{model-chain_type: chain}
        self.chains: Dict[str, Runnable] = {}

    def get_chain(self, model: str, chain_type: str):
        """获取或创建指定类型的chain"""
        cache_key = f"{model}-{chain_type}"

        if cache_key not in self.chains:
            logger.info(f"创建新的chain: {cache_key}")
            llm = get_llm(model=model)

            if chain_type == "content":
                self.chains[cache_key] = create_content_chain(llm)
            elif chain_type == "svg":
                self.chains[cache_key] = create_svg_chain(llm)
            else:
                raise ValueError(f"未知的chain类型: {chain_type}")

        return self.chains[cache_key]

    async def generate_content_only(self, question: str, model: str) -> PhysicsContent:
        """仅生成物理内容解释"""
        try:
            logger.info(f"开始生成内容: {question[:50]}... 使用模型: {model}")

            content_chain = self.get_chain(model, "content")
            result: PhysicsContent = await content_chain.ainvoke({"question": question})

            logger.info(f"内容生成成功，长度: {len(result.explanation)}")
            return result

        except Exception as e:
            logger.error(f"内容生成失败: {e}")
            raise

    async def generate_animation_only(
        self, question: str, explanation: str, model: str
    ) -> SVGGeneration:
        """仅生成SVG动画"""
        try:
            logger.info(f"开始生成动画: {question[:50]}... 使用模型: {model}")

            svg_chain = self.get_chain(model, "svg")
            result: SVGGeneration = await svg_chain.ainvoke(
                {"question": question, "explanation": explanation}
            )

            logger.info(f"动画生成成功，SVG长度: {len(result.svgCode)}")
            return result

        except Exception as e:
            logger.error(f"动画生成失败: {e}")
            raise

    async def generate_full_with_history(
        self,
        question: str,
        model: str,
        user_id: str,
        metadata: Optional[Dict[str, Any]] = None,
    ) -> Tuple[PhysicsContent, SVGGeneration, str]:
        """生成完整内容并保存到历史记录"""
        history_record = None

        try:
            # 1. 创建pending记录
            logger.info(f"创建pending记录: {question[:50]}... (用户: {user_id})")
            history_record = await self.history_service.create_pending_record(
                question=question, model=model, user_id=user_id, metadata=metadata
            )
            history_id = history_record.id

            # 2. 获取chains
            content_chain = self.get_chain(model, "content")
            svg_chain = self.get_chain(model, "svg")

            # 3. 生成物理内容
            logger.info(f"生成物理内容: {history_id}")
            physics_content: PhysicsContent = await content_chain.ainvoke(
                {"question": question}
            )

            # 4. 生成SVG动画
            logger.info(f"生成SVG动画: {history_id}")
            svg_result: SVGGeneration = await svg_chain.ainvoke(
                {"question": question, "explanation": physics_content.explanation}
            )

            # 5. 更新为成功状态
            await self.history_service.update_record(
                history_id=history_id,
                explanation=physics_content.explanation,
                svg_code=svg_result.svgCode,
                status=GenerationStatus.SUCCESS,
            )

            logger.info(f"完整生成成功: {history_id} (用户: {user_id})")
            return physics_content, svg_result, history_id

        except Exception as e:
            logger.error(f"完整生成失败: {e}")

            # 更新为失败状态
            if history_record:
                try:
                    await self.history_service.update_record(
                        history_id=history_record.id,
                        status=GenerationStatus.FAILED,
                        error_message=str(e),
                    )
                except Exception as update_error:
                    logger.error(f"更新失败状态失败: {update_error}")

            raise

    def clear_cache(
        self, model: Optional[str] = None, chain_type: Optional[str] = None
    ):
        """清理缓存"""
        if model and chain_type:
            # 清理特定的chain
            cache_key = f"{model}-{chain_type}"
            if cache_key in self.chains:
                del self.chains[cache_key]
                logger.info(f"清理特定chain缓存: {cache_key}")
        elif model:
            # 清理特定模型的所有chains
            keys_to_remove = [
                key for key in self.chains.keys() if key.startswith(f"{model}-")
            ]
            for key in keys_to_remove:
                del self.chains[key]
            logger.info(f"清理模型所有chains: {model}")
        elif chain_type:
            # 清理特定类型的所有chains
            keys_to_remove = [
                key for key in self.chains.keys() if key.endswith(f"-{chain_type}")
            ]
            for key in keys_to_remove:
                del self.chains[key]
            logger.info(f"清理类型所有chains: {chain_type}")
        else:
            # 清理所有缓存
            self.chains.clear()
            logger.info("清理所有chain缓存")

    def get_cache_info(self) -> Dict[str, Any]:
        """获取缓存信息"""
        cached_chains = list(self.chains.keys())
        models = set()
        chain_types = set()

        for key in cached_chains:
            if "-" in key:
                model, chain_type = key.split("-", 1)
                models.add(model)
                chain_types.add(chain_type)

        return {
            "cached_chains": cached_chains,
            "cached_models": list(models),
            "cached_chain_types": list(chain_types),
            "total_cached": len(cached_chains),
        }
