"""
Groq LLM provider (chat generation).

Uses llama-3.3-70b-versatile by default — fast, free tier, strong RAG quality.
Requires GROQ_API_KEY to be set. Get a free key at https://console.groq.com

Switch by setting LLM_PROVIDER=groq in .env.
"""
from typing import AsyncGenerator
from groq import AsyncGroq
from ..core.config import settings

_client = AsyncGroq(api_key=settings.groq_api_key)

SYSTEM_PROMPT = """You are a helpful AI assistant for a personal knowledge base.

Rules you must follow:
1. Base every answer on the uploaded documents provided in the context below.
2. If the context contains the string "NO_DOCUMENTS_UPLOADED", tell the user they have not uploaded any documents yet and ask them to upload one before asking questions.
3. If documents are provided but don't contain the specific information asked for, say so explicitly — do not invent or infer information that isn't in the sources.
4. Always cite which source (by its [Source N] label and filename) you are drawing from."""


async def generate_stream(message: str, context: str, history: list[dict] = []) -> AsyncGenerator[dict, None]:
    """
    Stream a Groq response token by token using native async SSE.

    Args:
      message: The current user question.
      context: Retrieved document context to prepend to the user turn.
      history: Previous conversation turns loaded from the DB (role + content).
               The last item is the user message we just inserted — it is
               excluded here because we add it manually with context attached.

    Yields:
      {"type": "token", "data": "<text chunk>"}
      {"type": "done"}
      {"type": "error", "data": "<message>"}   — only on failure
    """
    try:
        # Start with the system prompt
        messages = [{"role": "system", "content": SYSTEM_PROMPT}]

        # Replay prior turns, excluding the last item which is the user message
        # we just saved — it will be appended below with context prepended.
        for turn in history[:-1]:
            messages.append({"role": turn["role"], "content": turn["content"]})

        # Current user turn: context + question
        messages.append({
            "role": "user",
            "content": (
                f"Context from uploaded documents:\n{context}\n\n"
                f"Question: {message}"
            ),
        })

        stream = await _client.chat.completions.create(
            model=settings.groq_model,
            messages=messages,
            stream=True,
            temperature=0.2,
        )

        async for chunk in stream:
            delta = chunk.choices[0].delta.content
            if delta:
                yield {"type": "token", "data": delta}

    except Exception as e:
        yield {"type": "error", "data": str(e)}

    yield {"type": "done"}
