"""
Nomic embedding provider.

Uses nomic-embed-text-v1.5 (text) and nomic-embed-vision-v1.5 (images).
Both models output 768-dim vectors in a shared vector space — text queries
and image embeddings are directly cosine-comparable in pgvector.

Set EMBEDDING_PROVIDER=nomic and NOMIC_API_KEY=<key> in .env to activate.
"""
import asyncio
import io
from typing import List, Tuple

from nomic import embed
import nomic
from PIL import Image

from ..core.config import settings

nomic.login(settings.nomic_api_key)


async def embed_text(text: str, task_type: str = "search_document") -> List[float]:
    """
    task_type must be:
      "search_document" — when storing content
      "search_query"    — when embedding a live query
    Getting this wrong silently degrades search quality.
    """
    def _call():
        output = embed.text(
            texts=[text],
            model="nomic-embed-text-v1.5",
            task_type=task_type,
        )
        return output["embeddings"][0]

    return await asyncio.to_thread(_call)


async def embed_query(query: str) -> List[float]:
    return await embed_text(query, task_type="search_query")


async def embed_document(text: str) -> List[float]:
    return await embed_text(text, task_type="search_document")


async def embed_image(image_bytes: bytes, mime_type: str = "image/jpeg") -> Tuple[List[float], None]:
    """
    Nomic path: embeds the image directly in the shared 768-dim vector space.
    No text description is generated — returns (embedding, None).

    Note: the vision model embeds the whole image without OCR. If images contain
    meaningful text (screenshots, scanned docs), consider also running OCR and
    calling embed_document() on the extracted text for a dual-embedding approach.
    """
    def _call():
        img = Image.open(io.BytesIO(image_bytes)).convert("RGB")
        output = embed.image(
            images=[img],
            model="nomic-embed-vision-v1.5",
        )
        return output["embeddings"][0]

    vector = await asyncio.to_thread(_call)
    return vector, None   # None = no text description available
