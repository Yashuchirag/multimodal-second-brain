# TODO — Multimodal Second Brain

## Current Version
v0.6 — Full stack running. All frontend views implemented (dashboard, chat, upload, search). Backend live on Groq + Nomic. Ready for end-to-end testing.

## In Progress
- [ ] End-to-end test: upload → embed → search → chat via UI

## Done
- [x] Finalized tech stack and architecture — 2026-05-05
- [x] Created CLAUDE.md, PROJECT_INSTRUCTIONS.md, TODO.md — 2026-05-05
- [x] Phase 1: Backend scaffold (main.py, routers, services, models, core) — 2026-05-05
- [x] Phase 1: Frontend scaffold (Vite+TS, all components, hooks, stores, types) — 2026-05-05
- [x] Phase 2: Database migrations + match_chunks RPC + ivfflat index — 2026-05-05
- [x] Phase 2: Supabase Storage "documents" bucket created — 2026-05-05
- [x] Phase 3: Backend deps installed, server running, all endpoints tested — 2026-05-05
- [x] Stack migration: Groq (LLM) + Nomic (embeddings), Gemini/Google removed — 2026-05-14
- [x] Frontend: all chat components implemented (ChatComponent, ChatBubble, StreamingText, ReasoningBlock, SourceBubble, CommandBar) — 2026-05-14
- [x] Frontend: upload components implemented (UploadZone, UploadShimmer) — 2026-05-14
- [x] Frontend: dashboard implemented (BentoGrid, BentoCard, InsightsTile, RecentUploadsTile) — 2026-05-14
- [x] Frontend: Sidebar, useChat, useUpload, useSearch, all stores + types — 2026-05-14
- [x] Frontend: SearchView component built and wired into App.tsx — 2026-05-14
- [x] Frontend + backend running, UI loads correctly — 2026-05-14

## Backlog

### Testing & Polish (priority: high)
- [ ] End-to-end test: upload an image → confirm status = ready — priority: high
- [ ] End-to-end test: send a chat message → verify streaming + citations — priority: high
- [ ] End-to-end test: semantic search → verify results match upload — priority: high
- [ ] Confirm RecentUploadsTile updates after upload — priority: high

### Improvements (priority: medium)
- [ ] Add PDF text extraction to upload pipeline — priority: medium
- [ ] Add error boundaries to all views — priority: medium
- [ ] Add clear-chat button to ChatComponent — priority: low
- [ ] Supabase Auth (post-MVP) — priority: low
