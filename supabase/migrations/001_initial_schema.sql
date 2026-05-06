-- ─────────────────────────────────────────────────────────────────────────────
-- Multimodal Second Brain — Initial Schema
-- Run this in: Supabase Dashboard → SQL Editor
-- ─────────────────────────────────────────────────────────────────────────────

-- 1. Enable pgvector extension
CREATE EXTENSION IF NOT EXISTS vector;


-- 2. Documents table (one row per uploaded file)
CREATE TABLE IF NOT EXISTS documents (
  id          uuid        PRIMARY KEY DEFAULT gen_random_uuid(),
  user_id     uuid,                               -- reserved for auth (post-MVP)
  title       text        NOT NULL,
  file_type   text        NOT NULL,               -- 'image' | 'text' | 'pdf'
  file_url    text        NOT NULL,               -- Supabase Storage public URL
  status      text        NOT NULL DEFAULT 'processing',  -- 'processing' | 'ready' | 'failed'
  created_at  timestamptz NOT NULL DEFAULT now()
);


-- 3. Chunks table (one row per embedded unit)
CREATE TABLE IF NOT EXISTS chunks (
  id                  uuid        PRIMARY KEY DEFAULT gen_random_uuid(),
  doc_id              uuid        NOT NULL REFERENCES documents(id) ON DELETE CASCADE,
  content_type        text        NOT NULL,       -- 'text' | 'image'
  text                text,                       -- raw text OR Gemini image description
  image_url           text,                       -- original image Storage URL
  image_description   text,                       -- Gemini-generated semantic description
  embedding           vector(768) NOT NULL,       -- text-embedding-004 output (768 dims)
  metadata            jsonb       NOT NULL DEFAULT '{}',
  created_at          timestamptz NOT NULL DEFAULT now()
);


-- 4. ivfflat index for fast approximate nearest-neighbour search
--    lists = 100 is a good default for up to ~1M rows
CREATE INDEX IF NOT EXISTS chunks_embedding_idx
  ON chunks
  USING ivfflat (embedding vector_cosine_ops)
  WITH (lists = 100);


-- 5. Chat sessions
CREATE TABLE IF NOT EXISTS chat_sessions (
  id          uuid        PRIMARY KEY DEFAULT gen_random_uuid(),
  user_id     uuid,
  title       text        NOT NULL DEFAULT 'New Chat',
  created_at  timestamptz NOT NULL DEFAULT now()
);


-- 6. Messages (with reasoning and citations stored as JSONB)
CREATE TABLE IF NOT EXISTS messages (
  id          uuid        PRIMARY KEY DEFAULT gen_random_uuid(),
  session_id  uuid        NOT NULL REFERENCES chat_sessions(id) ON DELETE CASCADE,
  role        text        NOT NULL,               -- 'user' | 'assistant'
  content     text        NOT NULL,
  reasoning   text,                               -- Gemini thinking output
  citations   jsonb       NOT NULL DEFAULT '[]',  -- array of Citation objects
  created_at  timestamptz NOT NULL DEFAULT now()
);


-- ─────────────────────────────────────────────────────────────────────────────
-- 7. match_chunks RPC — called by services/search.py
--
--    Accepts a query embedding and returns the top match_count chunks
--    ordered by cosine similarity (highest score first).
-- ─────────────────────────────────────────────────────────────────────────────
CREATE OR REPLACE FUNCTION match_chunks(
  query_embedding  vector(768),
  match_count      int DEFAULT 5
)
RETURNS TABLE (
  id                  uuid,
  doc_id              uuid,
  content_type        text,
  text                text,
  image_url           text,
  image_description   text,
  metadata            jsonb,
  score               float
)
LANGUAGE plpgsql
AS $$
BEGIN
  RETURN QUERY
  SELECT
    c.id,
    c.doc_id,
    c.content_type,
    c.text,
    c.image_url,
    c.image_description,
    c.metadata,
    -- cosine similarity = 1 - cosine distance
    (1 - (c.embedding <=> query_embedding))::float AS score
  FROM chunks c
  ORDER BY c.embedding <=> query_embedding
  LIMIT match_count;
END;
$$;


-- ─────────────────────────────────────────────────────────────────────────────
-- 8. Supabase Storage bucket
--    Create this manually in: Supabase Dashboard → Storage → New Bucket
--    Name: "documents"
--    Public: true  (so file_url links are publicly accessible for image preview)
-- ─────────────────────────────────────────────────────────────────────────────
