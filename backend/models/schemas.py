from pydantic import BaseModel
from typing import Optional, List, Any
from uuid import UUID
from datetime import datetime


# ── Documents ──────────────────────────────────────────────────────────────────

class DocumentResponse(BaseModel):
    id: UUID
    title: str
    file_type: str          # 'image' | 'pdf' | 'text'
    file_url: str
    status: str             # 'processing' | 'ready' | 'failed'
    created_at: datetime


class DocumentStatusResponse(BaseModel):
    id: str
    title: str
    status: str


class UploadResponse(BaseModel):
    id: str
    status: str
    message: str


# ── Chunks ─────────────────────────────────────────────────────────────────────

class ChunkResponse(BaseModel):
    id: str
    doc_id: str
    content_type: str               # 'text' | 'image'
    text: Optional[str] = None
    image_url: Optional[str] = None
    image_description: Optional[str] = None
    metadata: dict = {}
    score: Optional[float] = None   # cosine similarity score from vector search


# ── Search ─────────────────────────────────────────────────────────────────────

class SearchRequest(BaseModel):
    query: str
    top_k: int = 5


class SearchResponse(BaseModel):
    results: List[ChunkResponse]


# ── Chat ───────────────────────────────────────────────────────────────────────

class ChatRequest(BaseModel):
    session_id: Optional[UUID] = None
    message: str
    top_k: int = 5


class Citation(BaseModel):
    id: str
    content_type: str
    image_url: Optional[str] = None
    image_description: Optional[str] = None
    text: Optional[str] = None
    score: Optional[float] = None


class ChatMessage(BaseModel):
    role: str                       # 'user' | 'assistant'
    content: str
    reasoning: Optional[str] = None
    citations: List[Citation] = []
    created_at: Optional[datetime] = None


# ── SSE Event Payloads ─────────────────────────────────────────────────────────
# These match the JSON shapes emitted by the /chat/stream endpoint.
# Frontend should check event["type"] to route accordingly.

class SSECitationsEvent(BaseModel):
    type: str = "citations"
    data: List[Citation]


class SSETokenEvent(BaseModel):
    type: str = "token"
    data: str


class SSEReasoningEvent(BaseModel):
    type: str = "reasoning"
    data: str


class SSEDoneEvent(BaseModel):
    type: str = "done"


class SSEErrorEvent(BaseModel):
    type: str = "error"
    data: str
