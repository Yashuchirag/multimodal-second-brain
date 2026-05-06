import { useState, useRef, KeyboardEvent } from 'react'
import { motion, AnimatePresence } from 'framer-motion'
import { ArrowUp, Loader2, Paperclip } from 'lucide-react'
import { cn } from '@/lib/utils'

interface CommandBarProps {
  onSend: (message: string) => void
  isStreaming: boolean
  placeholder?: string
}

export function CommandBar({
  onSend,
  isStreaming,
  placeholder = 'Ask anything about your notes…',
}: CommandBarProps) {
  const [value, setValue] = useState('')
  const textareaRef = useRef<HTMLTextAreaElement>(null)

  const canSend = value.trim().length > 0 && !isStreaming

  const handleSend = () => {
    if (!canSend) return
    onSend(value.trim())
    setValue('')
    // Reset textarea height
    if (textareaRef.current) textareaRef.current.style.height = 'auto'
  }

  const handleKeyDown = (e: KeyboardEvent<HTMLTextAreaElement>) => {
    if (e.key === 'Enter' && !e.shiftKey) {
      e.preventDefault()
      handleSend()
    }
  }

  const handleInput = () => {
    const el = textareaRef.current
    if (!el) return
    el.style.height = 'auto'
    el.style.height = `${Math.min(el.scrollHeight, 200)}px`
  }

  return (
    <motion.div
      initial={{ y: 40, opacity: 0 }}
      animate={{ y: 0,  opacity: 1 }}
      transition={{ type: 'spring', stiffness: 260, damping: 28, delay: 0.1 }}
      className="fixed bottom-6 left-1/2 -translate-x-1/2 w-full max-w-2xl px-4 z-30"
    >
      <div
        className={cn(
          'flex items-end gap-3 px-4 py-3 rounded-2xl',
          'bg-white/8 backdrop-blur-glass-lg border border-white/10',
          'shadow-[0_8px_32px_rgba(0,0,0,0.4)]',
          'transition-all duration-200',
          isStreaming && 'border-accent/30'
        )}
      >
        {/* Attachment button */}
        <button
          className="shrink-0 mb-0.5 text-muted hover:text-secondary transition-colors"
          title="Attach file"
        >
          <Paperclip size={18} />
        </button>

        {/* Textarea */}
        <textarea
          ref={textareaRef}
          value={value}
          onChange={(e) => setValue(e.target.value)}
          onKeyDown={handleKeyDown}
          onInput={handleInput}
          placeholder={placeholder}
          rows={1}
          className={cn(
            'flex-1 resize-none bg-transparent outline-none',
            'text-sm text-primary placeholder:text-muted',
            'leading-6 max-h-[200px] overflow-y-auto',
            'scrollbar-thin scrollbar-thumb-white/10'
          )}
        />

        {/* Send / Loading button */}
        <AnimatePresence mode="wait">
          {isStreaming ? (
            <motion.div
              key="loading"
              initial={{ scale: 0.8, opacity: 0 }}
              animate={{ scale: 1,   opacity: 1 }}
              exit={{    scale: 0.8, opacity: 0 }}
              className="shrink-0 mb-0.5 text-accent"
            >
              <Loader2 size={20} className="animate-spin" />
            </motion.div>
          ) : (
            <motion.button
              key="send"
              initial={{ scale: 0.8, opacity: 0 }}
              animate={{ scale: 1,   opacity: 1 }}
              exit={{    scale: 0.8, opacity: 0 }}
              whileHover={canSend ? { scale: 1.1 } : {}}
              whileTap={canSend  ? { scale: 0.9 } : {}}
              onClick={handleSend}
              disabled={!canSend}
              className={cn(
                'shrink-0 mb-0.5 w-7 h-7 rounded-lg flex items-center justify-center transition-all',
                canSend
                  ? 'bg-accent text-white hover:bg-accent-hover'
                  : 'bg-white/5 text-muted cursor-not-allowed'
              )}
            >
              <ArrowUp size={15} />
            </motion.button>
          )}
        </AnimatePresence>
      </div>

      <p className="mt-1.5 text-center text-[11px] text-muted">
        Enter to send · Shift+Enter for new line
      </p>
    </motion.div>
  )
}
