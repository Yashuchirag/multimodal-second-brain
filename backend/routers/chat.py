import json
import uuid
from fastapi import APIRouter
from fastapi.responses import StreamingResponse
from ..models.schemas import ChatRequest, Citation
from ..services.search import vector_search
from ..services.llm import generate_stream
from ..core.database import supabase

router = APIRouter()


@router.post("/chat/stream")
async def chat_stream(request: ChatRequest) -> StreamingResponse:
    """
    SSE streaming endpoint for the chat interface.

    Event sequence emitted to the client:
      1. {"type": "citations", "data": [...]}   — context chunks retrieved
      2. {"type": "token",     "data": "..."}   — repeated per streaming token
      3. {"type": "done"}                        — stream complete
      4. {"type": "error",    "data": "..."}    — only if an exception occurs

    The frontend useChat hook should handle each event type separately.
    """

    async def event_generator():
        try:
            # ── Step 1: Retrieve relevant context via pgvector ─────────────────
            chunks = await vector_search(request.message, request.top_k)

            context_parts = []
            citations: list[Citation] = []

            for i, chunk in enumerate(chunks):
                # Build readable context for the prompt
                chunk_text = chunk.get("text") or chunk.get("image_description") or ""
                context_parts.append(f"[Source {i + 1}]: {chunk_text}")

                citations.append(Citation(
                    id=chunk["id"],
                    content_type=chunk["content_type"],
                    image_url=chunk.get("image_url"),
                    image_description=chunk.get("image_description"),
                    text=chunk.get("text"),
                    score=chunk.get("score"),
                ))

            context = "\n\n".join(context_parts) if context_parts else "No relevant documents found."

            # ── Step 2: Emit citations before streaming starts ─────────────────
            yield f"data: {json.dumps({'type': 'citations', 'data': [c.model_dump() for c in citations]})}\n\n"

            # ── Step 3: Stream Gemini response token by token ──────────────────
            full_content = ""

            async for event in generate_stream(request.message, context):
                if event["type"] == "token":
                    full_content += event["data"]
                    yield f"data: {json.dumps(event)}\n\n"
                elif event["type"] == "error":
                    yield f"data: {json.dumps(event)}\n\n"
                    return
                elif event["type"] == "done":
                    break

            # ── Step 4: Emit done ──────────────────────────────────────────────
            yield f"data: {json.dumps({'type': 'done'})}\n\n"

            # ── Step 5: Persist message to DB if session_id provided ───────────
            if request.session_id:
                supabase.table("messages").insert({
                    "id": str(uuid.uuid4()),
                    "session_id": str(request.session_id),
                    "role": "assistant",
                    "content": full_content,
                    "citations": [c.model_dump() for c in citations],
                }).execute()

        except Exception as exc:
            yield f"data: {json.dumps({'type': 'error', 'data': str(exc)})}\n\n"

    return StreamingResponse(
        event_generator(),
        media_type="text/event-stream",
        headers={
            "Cache-Control": "no-cache",
            "Connection": "keep-alive",
            "X-Accel-Buffering": "no",      # disables Nginx response buffering
        },
    )


@router.post("/chat/sessions")
async def create_session():
    """Create a new chat session and return its ID."""
    session_id = str(uuid.uuid4())
    supabase.table("chat_sessions").insert({
        "id": session_id,
        "title": "New Chat",
    }).execute()
    return {"session_id": session_id}


@router.get("/chat/sessions/{session_id}/messages")
async def get_session_messages(session_id: str):
    """Load message history for a session."""
    result = (
        supabase.table("messages")
        .select("*")
        .eq("session_id", session_id)
        .order("created_at")
        .execute()
    )
    return {"messages": result.data or []}
