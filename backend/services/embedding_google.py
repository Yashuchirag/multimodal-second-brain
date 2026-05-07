"""
Google text-embedding-004 provider.

Preserved as-is from the original implementation.
Switch back by setting EMBEDDING_PROVIDER=google in .env.
"""
import asyncio
from typing import List
import google.generativeai as genai
from ..core.config import settings

genai.configure(api_key=settings.google_api_key)

EMBEDDING_MODEL = "models/text-embedding-004"


async def embed_text(text: str, task_type: str = "retrieval_document") -> List[float]:
    def _call():
        result = genai.embed_content(
            model=EMBEDDING_MODEL,
            content=text,
            task_type=task_type,
        )
        return result["embedding"]

    return await asyncio.to_thread(_call)


async def embed_query(query: str) -> List[float]:
    return await embed_text(query, task_type="retrieval_query")


async def embed_document(text: str) -> List[float]:
    return await embed_text(text, task_type="retrieval_document")


async def embed_image(image_bytes: bytes, mime_type: str = "image/jpeg") -> List[float]:
    """
    Google path: Gemini generates a text description, which is then embedded.
    The description is also returned so callers can store it.
    """
    from .gemini import describe_image
    description = await describe_image(image_bytes, mime_type)
    embedding = await embed_document(description)
    return embedding, description
