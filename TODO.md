# TODO — Multimodal Second Brain

## Current Version
v0.4 — Phase 3 complete. Backend is fully operational with deps installed, servers running, and all endpoints verified.

## In Progress
- [ ] Frontend integration and UI polish (Phase 6–9)

## Done
- [x] Finalized tech stack and architecture — 2026-05-05
- [x] Chose embedding strategy: Gemini describe → text-embedding-004 — 2026-05-05
- [x] Created CLAUDE.md, PROJECT_INSTRUCTIONS.md, TODO.md — 2026-05-05
- [x] Phase 1: Backend scaffold (main.py, routers, services, models, core) — 2026-05-05
- [x] Phase 1: Frontend scaffold (Vite+TS, components, hooks, stores, types) — 2026-05-05
- [x] Phase 2: Database migration SQL + match_chunks RPC — 2026-05-05
- [x] Phase 3: Fill .env files with real Supabase + Google AI Studio credentials — 2026-05-05
- [x] Phase 3: Create "documents" Storage bucket in Supabase dashboard — 2026-05-05
- [x] Phase 3: Run 001_initial_schema.sql in Supabase SQL Editor — 2026-05-05
- [x] Phase 3: Install backend deps (pip install -r requirements.txt) — 2026-05-05
- [x] Phase 3: Install frontend deps (npm install inside /frontend) — 2026-05-05
- [x] Phase 3: Boot servers (uvicorn + npm run dev) — 2026-05-05
- [x] Phase 3: Test upload pipeline end-to-end via Postman — 2026-05-05
- [x] Phase 3: Test /api/search with a real query — 2026-05-05
- [x] Phase 3: Test /api/chat/stream SSE in browser — 2026-05-05

### Phase 6–9 (UI Polish)
- [ ] Add search view component (SearchResults.tsx) — priority: medium
- [ ] Add error boundaries to all views — priority: medium
- [ ] Add PDF support to upload pipeline — priority: low
- [ ] Gemini thinking model integration for reasoning block — priority: low
- [ ] Supabase Auth (post-MVP) — priority: low
