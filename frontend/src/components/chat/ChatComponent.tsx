import { useEffect, useRef } from 'react'
import { motion, AnimatePresence } from 'framer-motion'
import { Brain } from 'lucide-react'
import { useChat } from '@/hooks/useChat'
import { ChatBubble } from './ChatBubble'
import { CommandBar } from '@/components/layout/CommandBar'

const SUGGESTED_PROMPTS = [
  'What are the main themes in my notes?',
  'Summarize my recent uploads',
  'Find connections between my documents',
  "What topics haven't I covered yet?",
]

export function ChatComponent() {
  const { messages, isStreaming, sendMessage } = useChat()
  const bottomRef = useRef<HTMLDivElement>(null)

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
              className="flex-1 flex flex-col items-center justify-center gap-6 py-20"
            >
              {/* Icon */}
              <motion.div
                initial={{ scale: 0.8, opacity: 0 }}
                animate={{ scale: 1, opacity: 1 }}
                transition={{ type: 'spring', stiffness: 260, damping: 22, delay: 0.05 }}
                className="p-4 rounded-2xl bg-accent/10 border border-accent/20 text-accent"
              >
                <Brain size={28} />
              </motion.div>

              <div className="text-center">
                <p className="text-secondary text-base font-medium">Ask anything about your uploads</p>
                <p className="text-muted text-sm mt-1 max-w-xs">
                  Answers are grounded in your documents with direct citations.
                </p>
              </div>

              {/* Suggested prompts */}
              <div className="grid grid-cols-2 gap-2 w-full max-w-lg">
                {SUGGESTED_PROMPTS.map((prompt, i) => (
                  <motion.button
                    key={prompt}
                    initial={{ opacity: 0, y: 8 }}
                    animate={{ opacity: 1, y: 0 }}
                    transition={{ delay: 0.12 + i * 0.07, type: 'spring', stiffness: 280, damping: 26 }}
                    whileHover={{ scale: 1.02, backgroundColor: 'rgba(255,255,255,0.06)' }}
                    whileTap={{ scale: 0.98 }}
                    onClick={() => sendMessage(prompt)}
                    className="px-4 py-3 rounded-xl text-left text-xs text-secondary
                               bg-white/3 border border-white/8 hover:border-white/14
                               hover:text-primary transition-colors duration-150 leading-snug"
                  >
                    {prompt}
                  </motion.button>
                ))}
              </div>
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
