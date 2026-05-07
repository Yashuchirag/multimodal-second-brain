from pydantic_settings import BaseSettings
from functools import lru_cache


class Settings(BaseSettings):
    supabase_url: str
    supabase_anon_key: str
    supabase_service_role_key: str

    # ── Embedding provider ─────────────────────────────────────────────────────
    # "nomic"  → nomic-embed-text-v1.5 + nomic-embed-vision-v1.5
    # "google" → text-embedding-004 + Gemini image description
    embedding_provider: str = "nomic"
    nomic_api_key: str = ""

    # ── LLM / chat provider ────────────────────────────────────────────────────
    # "groq"   → llama-3.3-70b-versatile via Groq (free tier)
    # "gemini" → Gemini 2.0 Flash
    llm_provider: str = "groq"
    groq_api_key: str = ""
    groq_model: str = "llama-3.3-70b-versatile"

    # ── Google (only needed when a *_provider = "google" or "gemini") ──────────
    google_api_key: str = ""

    class Config:
        env_file = ".env"
        env_file_encoding = "utf-8"


@lru_cache()
def get_settings() -> Settings:
    return Settings()


settings = get_settings()
