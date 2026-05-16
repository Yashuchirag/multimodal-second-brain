from fastapi import FastAPI
from fastapi.middleware.cors import CORSMiddleware
from backend.routers import upload, search, chat

app = FastAPI(
    title="Multimodal Second Brain API",
    description="RAG-powered knowledge base with Groq + Nomic + pgvector",
    version="0.1.0",
)

# ── CORS ───────────────────────────────────────────────────────────────────────
# Allow the Vite dev server. Update in production.
app.add_middleware(
    CORSMiddleware,
    allow_origins=["http://localhost:5173"],
    allow_credentials=True,
    allow_methods=["*"],
    allow_headers=["*"],
)

# ── Routers ────────────────────────────────────────────────────────────────────
app.include_router(upload.router, prefix="/api", tags=["Upload"])
app.include_router(search.router, prefix="/api", tags=["Search"])
app.include_router(chat.router,   prefix="/api", tags=["Chat"])


# ── Health Check ───────────────────────────────────────────────────────────────
@app.get("/health", tags=["Health"])
async def health():
    return {"status": "ok", "version": app.version}
