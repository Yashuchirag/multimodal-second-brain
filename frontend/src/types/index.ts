// ── Document & Chunk Types ─────────────────────────────────────────────────────

export type FileType = 'image' | 'pdf' | 'text'
export type DocumentStatus = 'processing' | 'ready' | 'failed'

export interface Document {
  id: string
  title: string
  file_type: FileType
  file_url: string
  status: DocumentStatus
  created_at: string
}

export interface Chunk {
  id: string
  doc_id: string
  content_type: 'text' | 'image'
  text?: string
  image_url?: string
  image_description?: string
  metadata: Record<string, unknown>
  score?: number
}

// ── Chat Types ─────────────────────────────────────────────────────────────────

export interface Citation {
  id: string
  content_type: 'text' | 'image'
  image_url?: string
  image_description?: string
  text?: string
  score?: number
}

export interface ChatMessage {
  id: string
  role: 'user' | 'assistant'
  content: string
  reasoning?: string
  citations: Citation[]
  isStreaming?: boolean   // true while tokens are still arriving
  created_at?: string
}

export interface ChatSession {
  session_id: string
  title: string
  created_at?: string
}

// ── SSE Event Types ────────────────────────────────────────────────────────────
// These match the JSON shapes emitted by /api/chat/stream

export type SSEEventType = 'citations' | 'token' | 'reasoning' | 'done' | 'error'

export interface SSEEvent {
  type: SSEEventType
  data?: string | Citation[]
}

// ── Upload Types ───────────────────────────────────────────────────────────────

export type UploadStatus = 'idle' | 'uploading' | 'processing' | 'ready' | 'failed'

export interface UploadItem {
  id: string
  filename: string
  status: UploadStatus
  preview?: string       // object URL for image preview
  error?: string
}

// ── Search Types ───────────────────────────────────────────────────────────────

export interface SearchResult {
  chunk: Chunk
  score: number
}
