import asyncio
import base64
import google.generativeai as genai
from typing import AsyncGenerator
from ..core.config import settings

genai.configure(api_key=settings.google_api_key)

# ── Image Description ──────────────────────────────────────────────────────────

DESCRIPTION_PROMPT = (
    "Describe this image in rich semantic detail for a knowledge retrieval system. "
    "Cover: all visible objects and their relationships, any text visible in the image (transcribe it), "
    "colors and visual style, the context and setting, key concepts or topics depicted, "
    "and any notable details that would help someone find this image through a text search. "
    "Be thorough, specific, and factual."
)


async def describe_image(image_bytes: bytes, mime_type: str = "image/jpeg") -> str:
    """
    Use Gemini 2.0 Flash to generate a rich semantic description of an image.
    This description is then embedded with text-embedding-004 for vector search.
    """
    model = genai.GenerativeModel("gemini-2.0-flash")
    image_data = base64.b64encode(image_bytes).decode("utf-8")
    image_part = {"mime_type": mime_type, "data": image_data}

    # Run sync call in thread pool to avoid blocking the event loop
    def _call():
        return model.generate_content([DESCRIPTION_PROMPT, image_part])

    response = await asyncio.to_thread(_call)
    return response.text


# ── Streaming Chat Generation ──────────────────────────────────────────────────

SYSTEM_PROMPT = """You are a helpful AI assistant for a personal knowledge base.
The user has uploaded images, documents, and notes. You answer questions based on their content.
When you reference specific uploads, be clear about which source you are drawing from.
If the context does not contain enough information to answer fully, say so honestly."""


async def generate_stream(
    message: str,
    context: str,
) -> AsyncGenerator[dict, None]:
    """
    Stream a Gemini 2.0 Flash response token by token.

    Yields dicts with shape:
      {"type": "token",     "data": "<text chunk>"}
      {"type": "done"}

    The caller (SSE router) is responsible for wrapping these as SSE events.
    """
    model = genai.GenerativeModel("gemini-2.0-flash")

    full_prompt = f"""{SYSTEM_PROMPT}

--- Context from uploaded documents ---
{context}
--- End context ---

User: {message}
Assistant:"""

    def _sync_stream():
        """Runs inside asyncio.to_thread — returns a list of (type, text) tuples."""
        chunks = []
        response = model.generate_content(full_prompt, stream=True)
        for chunk in response:
            if chunk.text:
                chunks.append(chunk.text)
        return chunks

    # Collect all streamed chunks in a thread (avoids blocking event loop)
    # For true token-by-token streaming from a thread, we use a queue approach
    queue: asyncio.Queue = asyncio.Queue()
    loop = asyncio.get_event_loop()

    def _producer():
        try:
            response = model.generate_content(full_prompt, stream=True)
            for chunk in response:
                if chunk.text:
                    loop.call_soon_threadsafe(queue.put_nowait, {"type": "token", "data": chunk.text})
        except Exception as e:
            loop.call_soon_threadsafe(queue.put_nowait, {"type": "error", "data": str(e)})
        finally:
            loop.call_soon_threadsafe(queue.put_nowait, {"type": "done"})

    # Start producer in thread
    await asyncio.to_thread(_producer)

    # Drain the queue
    while not queue.empty():
        event = await queue.get()
        yield event
        if event["type"] == "done":
            break
