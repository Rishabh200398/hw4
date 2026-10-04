"""Builds the LLM used by the agent: an OpenAI model routed through Portkey.

The key comes from PORTKEY_API_KEY in the project .env (never committed). The agent
only ever talks to the model through this gateway.
"""

import os
from pathlib import Path

from dotenv import load_dotenv
from pydantic_ai.models.openai import OpenAIChatModel
from pydantic_ai.providers.openai import OpenAIProvider

# Load the .env sitting at the project root (one level above backend/).
load_dotenv(Path(__file__).resolve().parent.parent / ".env")

DEFAULT_MODEL = "gpt-5.6-sol"
PORTKEY_BASE_URL = "https://api.portkey.ai/v1"


def build_model() -> OpenAIChatModel:
    api_key = os.getenv("PORTKEY_API_KEY")
    if not api_key:
        raise RuntimeError(
            "PORTKEY_API_KEY is missing. Copy .env.example to .env and add your Portkey key."
        )
    provider = OpenAIProvider(
        api_key=api_key,
        base_url=os.getenv("PORTKEY_BASE_URL", PORTKEY_BASE_URL),
    )
    return OpenAIChatModel(os.getenv("PORTKEY_MODEL", DEFAULT_MODEL), provider=provider)
