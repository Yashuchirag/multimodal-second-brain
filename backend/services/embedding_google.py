"""
Google text-embedding-004 provider.

Preserved as-is from the original implementation.
Switch back by setting EMBEDDING_PROVIDER=google in .env.
"""
import asyncio
import base64
from typing import List, Tuple, Optional
import google.generativeai as genai
from ..core.config import settings

genai.configure(api_key=settings.google_api_key)

EMBEDDING_MODEL = "models/text-embedding-004"

_DESCRIPTION_PROMPT = (
    "Describe this image in rich semantic detail for a knowledge retrieval system. "
    "Cover: all visible objects and their relationships, any text visible in the image (transcribe it), "
    "colors and visual style, the context and setting, key concepts or topics depicted, "
    "and any notable details that would help someone find this image through a text search. "
    "Be thorough, specific, and factual."
)


async def _describe_image(image_bytes: bytes, mime_type: str) -> str:
    """Gemini 2.0 Flash generates a rich semantic description of an image."""
    model = genai.GenerativeModel("gemini-2.0-flash")
    image_data = base64.b64encode(image_bytes).decode("utf-8")
    image_part = {"mime_type": mime_type, "data": image_data}

    def _call():
        return model.generate_content([_DESCRIPTION_PROMPT, image_part])

    response = await asyncio.to_thread(_call)
    return response.text


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


async def embed_image(image_bytes: bytes, mime_type: str = "image/jpeg") -> Tuple[List[float], Optional[str]]:
    """Gemini describes the image; that description is then embedded."""
    description = await _describe_image(image_bytes, mime_type)
    embedding = await embed_document(description)
    return embedding, description
