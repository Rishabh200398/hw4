"""Loads the system prompt text from prompt.md."""

from pathlib import Path

PROMPT = (Path(__file__).resolve().parent / "prompt.md").read_text(encoding="utf-8")
