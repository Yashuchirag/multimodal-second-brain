# TODO — Multimodal Second Brain

## Current Version
v0.3 — Full scaffold complete. Backend, frontend, and DB migration all implemented. Ready to install deps and run.

## In Progress
- [ ] Install deps and boot both servers locally

## Done
- [x] Finalized tech stack and architecture — 2026-05-05
- [x] Chose embedding strategy: Gemini describe → text-embedding-004 — 2026-05-05
- [x] Created CLAUDE.md, PROJECT_INSTRUCTIONS.md, TODO.md — 2026-05-05
- [x] Phase 1: Backend scaffold (main.py, routers, services, models, core) — 2026-05-05
- [x] Phase 1: Frontend scaffold (Vite+TS, components, hooks, stores, types) — 2026-05-05
- [x] Phase 2: Database migration SQL + match_chunks RPC — 2026-05-05

## Backlog

### Next Steps (Phase 3 onward)
- [ ] Fill .env files with real Supabase + Google AI Studio credentials — priority: high
- [ ] Create "documents" Storage bucket in Supabase dashboard — priority: high
- [ ] Run 001_initial_schema.sql in Supabase SQL Editor — priority: high
- [ ] Install backend deps: pip install -r requirements.txt — priority: high
- [ ] Install frontend deps: npm install inside /frontend — priority: high
- [ ] Boot servers: uvicorn backend.main:app --reload + npm run dev — priority: high
- [ ] Test upload pipeline end-to-end via Postman — priority: high
- [ ] Test /api/search with a real query — priority: high
- [ ] Test /api/chat/stream SSE in browser — priority: high

### Phase 6–9 (UI Polish)
- [ ] Add search view component (SearchResults.tsx) — priority: medium
- [ ] Add error boundaries to all views — priority: medium
- [ ] Add PDF support to upload pipeline — priority: low
- [ ] Gemini thinking model integration for reasoning block — priority: low
- [ ] Supabase Auth (post-MVP) — priority: low
