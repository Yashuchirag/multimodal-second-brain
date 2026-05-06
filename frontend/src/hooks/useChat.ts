import { useCallback } from 'react'
import { useChatStore } from '@/store/chatStore'
import { Citation } from '@/types'

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
  } = useChatStore()

  const sendMessage = useCallback(
    async (content: string) => {
      if (isStreaming || !content.trim()) return

      // 1. Create a session if none exists
      let sid = sessionId
      if (!sid) {
        const res = await fetch(`${API_URL}/api/chat/sessions`, { method: 'POST' })
        const data = await res.json()
        sid = data.session_id
        setSessionId(sid!)
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

        // 4. Read SSE stream
        while (true) {
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
                break
              } else if (event.type === 'error') {
                appendToken(assistantId, `\n\n⚠️ Error: ${event.data}`)
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
      setSessionId,
      addUserMessage,
      addAssistantMessage,
      appendToken,
      setCitations,
      finalizeMessage,
      setStreaming,
    ]
  )

  return { messages, isStreaming, sendMessage, clearMessages }
}
