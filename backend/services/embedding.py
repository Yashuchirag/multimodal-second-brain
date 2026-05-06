import asyncio
from typing import List
import google.generativeai as genai
from ..core.config import settings

genai.configure(api_key=settings.google_api_key)

EMBEDDING_MODEL = "models/text-embedding-004"


async def embed_text(text: str, task_type: str = "retrieval_document") -> List[float]:
    """
    Embed a text string using Google text-embedding-004.

    task_type should be:
      - "retrieval_document"  when storing content in pgvector
      - "retrieval_query"     when embedding a live search query
    """
    def _call():
        result = genai.embed_content(
            model=EMBEDDING_MODEL,
            content=text,
            task_type=task_type,
        )
        return result["embedding"]

    return await asyncio.to_thread(_call)


async def embed_query(query: str) -> List[float]:
    """Convenience wrapper for query-time embedding."""
    return await embed_text(query, task_type="retrieval_query")


async def embed_document(text: str) -> List[float]:
    """Convenience wrapper for document-time embedding."""
    return await embed_text(text, task_type="retrieval_document")
