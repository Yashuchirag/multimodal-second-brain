import { useEffect, useRef } from 'react'
import { motion, AnimatePresence } from 'framer-motion'
import { MessageSquare } from 'lucide-react'
import { useChat } from '@/hooks/useChat'
import { ChatBubble } from './ChatBubble'
import { CommandBar } from '@/components/layout/CommandBar'

export function ChatComponent() {
  const { messages, isStreaming, sendMessage } = useChat()
  const bottomRef = useRef<HTMLDivElement>(null)

  // Scroll to bottom whenever messages change
  useEffect(() => {
    bottomRef.current?.scrollIntoView({ behavior: 'smooth' })
  }, [messages])

  return (
    <div className="relative flex flex-col h-full">
      {/* Message list */}
      <div className="flex-1 overflow-y-auto px-6 py-6 pb-32 flex flex-col gap-5">
        <AnimatePresence initial={false}>
          {messages.length === 0 ? (
            <motion.div
              key="empty"
              initial={{ opacity: 0, y: 12 }}
              animate={{ opacity: 1, y: 0 }}
              className="flex-1 flex flex-col items-center justify-center gap-3 py-24"
            >
              <div className="p-4 rounded-2xl bg-white/4 border border-white/7">
                <MessageSquare size={28} className="text-muted" />
              </div>
              <p className="text-secondary text-sm">Ask anything about your uploads</p>
              <p className="text-muted text-xs text-center max-w-xs">
                Your questions are answered using the documents you've uploaded,
                with direct citations back to the sources.
              </p>
            </motion.div>
          ) : (
            messages.map((message) => (
              <ChatBubble key={message.id} message={message} />
            ))
          )}
        </AnimatePresence>
        <div ref={bottomRef} />
      </div>

      {/* Floating command bar */}
      <CommandBar onSend={sendMessage} isStreaming={isStreaming} />
    </div>
  )
}
