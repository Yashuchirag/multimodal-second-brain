from typing import List, Dict, Any
from ..core.database import supabase
from .embedding import embed_query


async def vector_search(query: str, top_k: int = 5) -> List[Dict[str, Any]]:
    """
    Embed the query and run cosine similarity search against pgvector.

    Calls the match_chunks Postgres function (defined in the SQL migration)
    which returns chunks ordered by cosine distance, with scores attached.

    Returns a list of chunk dicts with keys:
      id, doc_id, content_type, text, image_url, image_description, metadata, score
    """
    query_embedding = await embed_query(query)

    result = supabase.rpc(
        "match_chunks",
        {
            "query_embedding": query_embedding,
            "match_count": top_k,
        },
    ).execute()

    return result.data or []
