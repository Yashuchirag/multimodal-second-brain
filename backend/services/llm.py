"""
LLM provider facade.

Reads LLM_PROVIDER from .env and re-exports the correct implementation.
Switching providers = change one env var, nothing else.

  LLM_PROVIDER=groq    → Groq / llama-3.3-70b-versatile  (default)
  LLM_PROVIDER=gemini  → Gemini 2.0 Flash
"""
from ..core.config import settings

if settings.llm_provider == "gemini":
    from .llm_gemini import generate_stream
else:
    from .llm_groq import generate_stream

__all__ = ["generate_stream"]
