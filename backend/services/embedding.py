"""
Embedding provider facade.

Reads EMBEDDING_PROVIDER from .env and re-exports the correct implementation.
Switching providers = change one env var, nothing else.

  EMBEDDING_PROVIDER=nomic   → nomic-embed-text-v1.5 + nomic-embed-vision-v1.5
  EMBEDDING_PROVIDER=google  → text-embedding-004 + Gemini image description
"""
from ..core.config import settings

if settings.embedding_provider == "nomic":
    from .embedding_nomic import embed_query, embed_document, embed_image
else:
    from .embedding_google import embed_query, embed_document, embed_image

__all__ = ["embed_query", "embed_document", "embed_image"]
