import uuid
import logging
from fastapi import APIRouter, UploadFile, File, BackgroundTasks, HTTPException
from ..core.database import supabase
from ..models.schemas import UploadResponse, DocumentStatusResponse
from ..services.storage import upload_file, delete_file
from ..services.embedding import embed_document, embed_image
from ..services.pdf import extract_pages_async

logger = logging.getLogger(__name__)

router = APIRouter()

IMAGE_TYPES = {"image/jpeg", "image/png", "image/gif", "image/webp"}
PDF_TYPE = "application/pdf"


# ── Background Pipeline ────────────────────────────────────────────────────────

async def _process_document(
    doc_id: str,
    file_bytes: bytes,
    file_type: str,
    mime_type: str,
    file_url: str,
    filename: str,
) -> None:
    """
    Async background task.

    image → nomic-embed-vision-v1.5 → pgvector store
    text  → nomic-embed-text-v1.5   → pgvector store
    pdf   → extract pages → nomic-embed-text-v1.5 per page → pgvector store
    """
    try:
        supabase.table("documents").update({"status": "processing"}).eq("id", doc_id).execute()

        if file_type == "image":
            embedding, description = await embed_image(file_bytes, mime_type)
            supabase.table("chunks").insert({
                "doc_id": doc_id,
                "content_type": "image",
                "image_url": file_url,
                "image_description": description,
                "text": description,
                "embedding": embedding,
                "metadata": {"filename": filename},
            }).execute()

        elif file_type == "text":
            text_content = file_bytes.decode("utf-8", errors="replace")
            embedding = await embed_document(text_content)
            supabase.table("chunks").insert({
                "doc_id": doc_id,
                "content_type": "text",
                "text": text_content,
                "embedding": embedding,
                "metadata": {"filename": filename},
            }).execute()

        elif file_type == "pdf":
            pages = await extract_pages_async(file_bytes)

            if not pages:
                # Scanned / image-only PDF — no extractable text
                raise ValueError(
                    "No extractable text found. This PDF may be image-only (scanned). "
                    "Try uploading individual pages as images instead."
                )

            total = len(pages)
            for page_num, text in pages:
                embedding = await embed_document(text)
                supabase.table("chunks").insert({
                    "doc_id": doc_id,
                    "content_type": "text",
                    "text": text,
                    "embedding": embedding,
                    "metadata": {
                        "filename": filename,
                        "page": page_num,
                        "total_pages": total,
                    },
                }).execute()

        supabase.table("documents").update({"status": "ready"}).eq("id", doc_id).execute()

    except Exception as exc:
        supabase.table("documents").update({"status": "failed"}).eq("id", doc_id).execute()
        logger.exception("Pipeline failed for doc %s: %s", doc_id, exc)


# ── Routes ─────────────────────────────────────────────────────────────────────

@router.post("/upload", response_model=UploadResponse)
async def upload_document(
    background_tasks: BackgroundTasks,
    file: UploadFile = File(...),
) -> UploadResponse:
    content_type = file.content_type or "application/octet-stream"

    if content_type in IMAGE_TYPES:
        file_type = "image"
    elif content_type == PDF_TYPE:
        file_type = "pdf"
    else:
        file_type = "text"

    file_bytes = await file.read()
    doc_id = str(uuid.uuid4())

    file_url = await upload_file(file_bytes, file.filename or "upload", content_type)

    supabase.table("documents").insert({
        "id": doc_id,
        "title": file.filename or "Untitled",
        "file_type": file_type,
        "file_url": file_url,
        "status": "processing",
    }).execute()

    background_tasks.add_task(
        _process_document,
        doc_id,
        file_bytes,
        file_type,
        content_type,       # mime_type passed through for embed_image
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


@router.delete("/documents/{doc_id}", status_code=204)
async def delete_document(doc_id: str):
    result = (
        supabase.table("documents")
        .select("file_url")
        .eq("id", doc_id)
        .execute()
    )
    if not result.data:
        raise HTTPException(status_code=404, detail="Document not found.")

    file_url = result.data[0]["file_url"]

    # Delete from Storage (best-effort — don't fail if file already gone)
    try:
        await delete_file(file_url)
    except Exception:
        logger.warning("Storage delete failed for doc %s, continuing.", doc_id)

    # Delete from DB — chunks cascade automatically
    supabase.table("documents").delete().eq("id", doc_id).execute()


@router.get("/documents")
async def list_documents():
    result = (
        supabase.table("documents")
        .select("id, title, file_type, file_url, status, created_at")
        .order("created_at", desc=True)
        .execute()
    )
    return {"documents": result.data or []}
