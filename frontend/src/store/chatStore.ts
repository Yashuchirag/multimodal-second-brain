import { create } from 'zustand'
import { ChatMessage, Citation } from '@/types'
import { generateId } from '@/lib/utils'

interface ChatStore {
  messages: ChatMessage[]
  sessionId: string | null
  isStreaming: boolean

  // Actions
  setSessionId: (id: string) => void
  addUserMessage: (content: string) => string           // returns message id
  addAssistantMessage: () => string                     // returns message id (empty, streaming)
  appendToken: (id: string, token: string) => void
  setReasoning: (id: string, reasoning: string) => void
  setCitations: (id: string, citations: Citation[]) => void
  finalizeMessage: (id: string) => void
  setStreaming: (value: boolean) => void
  clearMessages: () => void
}

export const useChatStore = create<ChatStore>((set) => ({
  messages: [],
  sessionId: null,
  isStreaming: false,

  setSessionId: (id) => set({ sessionId: id }),

  addUserMessage: (content) => {
    const id = generateId()
    set((state) => ({
      messages: [
        ...state.messages,
        { id, role: 'user', content, citations: [], created_at: new Date().toISOString() },
      ],
    }))
    return id
  },

  addAssistantMessage: () => {
    const id = generateId()
    set((state) => ({
      messages: [
        ...state.messages,
        { id, role: 'assistant', content: '', citations: [], isStreaming: true },
      ],
    }))
    return id
  },

  appendToken: (id, token) =>
    set((state) => ({
      messages: state.messages.map((m) =>
        m.id === id ? { ...m, content: m.content + token } : m
      ),
    })),

  setReasoning: (id, reasoning) =>
    set((state) => ({
      messages: state.messages.map((m) =>
        m.id === id ? { ...m, reasoning } : m
      ),
    })),

  setCitations: (id, citations) =>
    set((state) => ({
      messages: state.messages.map((m) =>
        m.id === id ? { ...m, citations } : m
      ),
    })),

  finalizeMessage: (id) =>
    set((state) => ({
      messages: state.messages.map((m) =>
        m.id === id ? { ...m, isStreaming: false, created_at: new Date().toISOString() } : m
      ),
    })),

  setStreaming: (value) => set({ isStreaming: value }),

  clearMessages: () => set({ messages: [], sessionId: null }),
}))
