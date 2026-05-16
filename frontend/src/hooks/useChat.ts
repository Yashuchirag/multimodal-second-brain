import { useCallback, useEffect } from 'react'
import { useChatStore } from '@/store/chatStore'
import { ChatMessage, Citation } from '@/types'
import { generateId } from '@/lib/utils'

const API_URL = import.meta.env.VITE_API_URL ?? 'http://localhost:8000'

export function useChat() {
  const {
    messages,
    isStreaming,
    sessionId,
    setSessionId,
    addUserMessage,
    addAssistantMessage,
    appendToken,
    setCitations,
    finalizeMessage,
    setStreaming,
    clearMessages,
    setMessages,
  } = useChatStore()

  // Creates a new backend session and returns the session_id
  const createSession = useCallback(async (): Promise<string> => {
    const res = await fetch(`${API_URL}/api/chat/sessions`, { method: 'POST' })
    const data = await res.json()
    const sid: string = data.session_id
    setSessionId(sid)
    return sid
  }, [setSessionId])

  // Fetches message history for a session and hydrates the store
  const loadHistory = useCallback(
    async (sid: string): Promise<void> => {
      const res = await fetch(`${API_URL}/api/chat/sessions/${sid}/messages`)
      const data = await res.json()
      const dbMessages: Array<{
        id: string
        session_id: string
        role: 'user' | 'assistant'
        content: string
        citations: Citation[]
        created_at: string
      }> = data.messages ?? []

      const hydrated: ChatMessage[] = dbMessages.map((m) => ({
        id: generateId(),
        role: m.role,
        content: m.content,
        citations: m.citations ?? [],
        isStreaming: false,
        created_at: m.created_at,
      }))

      setMessages(hydrated)
    },
    [setMessages]
  )

  // On mount: create a session (if none exists) and load its history
  useEffect(() => {
    if (sessionId) return
    createSession().then((sid) => {
      // Only load history when we have no messages yet (fresh mount)
      if (messages.length === 0) {
        loadHistory(sid).catch(() => {
          // History fetch failure is non-fatal; conversation can still proceed
        })
      }
    })
    // Intentionally run only once on mount
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [])

  // Clears the current conversation and starts a brand-new backend session
  const newChat = useCallback(async (): Promise<void> => {
    clearMessages()
    await createSession()
  }, [clearMessages, createSession])

  const sendMessage = useCallback(
    async (content: string) => {
      if (isStreaming || !content.trim()) return

      // 1. Ensure a session exists (mount effect handles this normally; guard for edge cases)
      let sid = sessionId
      if (!sid) {
        sid = await createSession()
      }

      // 2. Optimistically add user bubble
      addUserMessage(content)

      // 3. Add empty assistant bubble (will fill via streaming)
      const assistantId = addAssistantMessage()
      setStreaming(true)

      try {
        const response = await fetch(`${API_URL}/api/chat/stream`, {
          method: 'POST',
          headers: { 'Content-Type': 'application/json' },
          body: JSON.stringify({ session_id: sid, message: content, top_k: 5 }),
        })

        if (!response.body) throw new Error('No response body')

        const reader = response.body.getReader()
        const decoder = new TextDecoder()
        let buffer = ''
        let streamDone = false

        // 4. Read SSE stream
        while (!streamDone) {
          const { done, value } = await reader.read()
          if (done) break

          buffer += decoder.decode(value, { stream: true })
          const lines = buffer.split('\n')
          buffer = lines.pop() ?? ''     // keep incomplete line in buffer

          for (const line of lines) {
            if (!line.startsWith('data: ')) continue
            const raw = line.slice(6).trim()
            if (!raw) continue

            try {
              const event = JSON.parse(raw)

              if (event.type === 'citations') {
                setCitations(assistantId, event.data as Citation[])
              } else if (event.type === 'token') {
                appendToken(assistantId, event.data as string)
              } else if (event.type === 'done') {
                streamDone = true
                break
              } else if (event.type === 'error') {
                appendToken(assistantId, `\n\n⚠️ Error: ${event.data}`)
                streamDone = true
                break
              }
            } catch {
              // Malformed JSON in stream — skip
            }
          }
        }
      } finally {
        finalizeMessage(assistantId)
        setStreaming(false)
      }
    },
    [
      isStreaming,
      sessionId,
      createSession,
      addUserMessage,
      addAssistantMessage,
      appendToken,
      setCitations,
      finalizeMessage,
      setStreaming,
    ]
  )

  return { messages, isStreaming, sendMessage, clearMessages, newChat }
}
