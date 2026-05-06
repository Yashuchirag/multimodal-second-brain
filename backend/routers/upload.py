import uuid
from fastapi import APIRouter, UploadFile, File, BackgroundTasks, HTTPException
from ..core.database import supabase
from ..models.schemas import UploadResponse, DocumentStatusResponse
from ..services.storage import upload_file
from ..services.gemini import describe_image
from ..services.embedding import embed_document

router = APIRouter()

# MIME types we handle
IMAGE_TYPES = {"image/jpeg", "image/png", "image/gif", "image/webp"}
PDF_TYPE = "application/pdf"


# ── Background Pipeline ────────────────────────────────────────────────────────

async def _process_document(
    doc_id: str,
    file_bytes: bytes,
    file_type: str,
    file_url: str,
    filename: str,
) -> None:
    """
    Async background task:
      image → Gemini describe → text-embedding-004 embed → pgvector store
      text  → text-embedding-004 embed → pgvector store (future)
    """
    try:
        supabase.table("documents").update({"status": "processing"}).eq("id", doc_id).execute()

        if file_type == "image":
            # Step 1: Gemini generates a rich semantic description
            description = await describe_image(file_bytes)

            # Step 2: Embed the description with task_type=retrieval_document
            embedding = await embed_document(description)

            # Step 3: Insert chunk row into pgvector table
            supabase.table("chunks").insert({
                "doc_id": doc_id,
                "content_type": "image",
                "image_url": file_url,
                "image_description": description,
                "text": description,           # also stored as text for hybrid search
                "embedding": embedding,
                "metadata": {"filename": filename},
            }).execute()

        elif file_type == "text":
            # Plain text: embed directly (no description step needed)
            text_content = file_bytes.decode("utf-8", errors="replace")
            embedding = await embed_document(text_content)

            supabase.table("chunks").insert({
                "doc_id": doc_id,
                "content_type": "text",
                "text": text_content,
                "embedding": embedding,
                "metadata": {"filename": filename},
            }).execute()

        # Mark document as ready
        supabase.table("documents").update({"status": "ready"}).eq("id", doc_id).execute()

    except Exception as exc:
        supabase.table("documents").update({"status": "failed"}).eq("id", doc_id).execute()
        # Re-raise so FastAPI background task logs the traceback
        raise exc


# ── Routes ─────────────────────────────────────────────────────────────────────

@router.post("/upload", response_model=UploadResponse)
async def upload_document(
    background_tasks: BackgroundTasks,
    file: UploadFile = File(...),
) -> UploadResponse:
    """
    Accept a file upload, store it in Supabase Storage, and kick off the
    background pipeline (describe → embed → pgvector).

    Returns immediately with the document ID so the frontend can poll /status.
    """
    content_type = file.content_type or "application/octet-stream"

    if content_type in IMAGE_TYPES:
        file_type = "image"
    elif content_type == PDF_TYPE:
        # PDF support: planned for Phase 3+ (chunking + OCR)
        raise HTTPException(status_code=415, detail="PDF support coming soon.")
    else:
        file_type = "text"

    file_bytes = await file.read()
    doc_id = str(uuid.uuid4())

    # Upload raw file to Supabase Storage first
    file_url = await upload_file(file_bytes, file.filename or "upload", content_type)

    # Create document record (status = 'processing')
    supabase.table("documents").insert({
        "id": doc_id,
        "title": file.filename or "Untitled",
        "file_type": file_type,
        "file_url": file_url,
        "status": "processing",
    }).execute()

    # Queue the embedding pipeline as a background task
    background_tasks.add_task(
        _process_document,
        doc_id,
        file_bytes,
        file_type,
        file_url,
        file.filename or "upload",
    )

    return UploadResponse(
        id=doc_id,
        status="processing",
        message="File received. Processing started in background.",
    )


@router.get("/upload/{doc_id}/status", response_model=DocumentStatusResponse)
async def get_document_status(doc_id: str) -> DocumentStatusResponse:
    """Poll this endpoint until status == 'ready' or 'failed'."""
    result = (
        supabase.table("documents")
        .select("id, status, title")
        .eq("id", doc_id)
        .execute()
    )
    if not result.data:
        raise HTTPException(status_code=404, detail="Document not found.")
    row = result.data[0]
    return DocumentStatusResponse(id=row["id"], title=row["title"], status=row["status"])


@router.get("/documents")
async def list_documents():
    """Return all documents ordered by creation time (newest first)."""
    result = (
        supabase.table("documents")
        .select("id, title, file_type, file_url, status, created_at")
        .order("created_at", desc=True)
        .execute()
    )
    return {"documents": result.data or []}
