from fastapi import APIRouter
from ..models.schemas import SearchRequest, SearchResponse, ChunkResponse
from ..services.search import vector_search

router = APIRouter()


@router.post("/search", response_model=SearchResponse)
async def search(request: SearchRequest) -> SearchResponse:
    """
    Embed the query and run cosine similarity search against pgvector.
    Returns top-k chunks with similarity scores.
    """
    raw_results = await vector_search(request.query, request.top_k)

    chunks = [
        ChunkResponse(
            id=r["id"],
            doc_id=r["doc_id"],
            content_type=r["content_type"],
            text=r.get("text"),
            image_url=r.get("image_url"),
            image_description=r.get("image_description"),
            metadata=r.get("metadata") or {},
            score=r.get("score"),
        )
        for r in raw_results
    ]

    return SearchResponse(results=chunks)
