import os

from dotenv import load_dotenv
from langchain_openai import ChatOpenAI

load_dotenv()


def get_llm(
    model: str = "anthropic/claude-sonnet-4",
    temperature: float = 0.2,
) -> ChatOpenAI:
    return ChatOpenAI(
        api_key=os.getenv("OPENROUTER_API_KEY"),
        model=model,
        temperature=temperature,
        base_url="https://openrouter.ai/api/v1",
    )
