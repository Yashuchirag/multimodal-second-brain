import { motion } from 'framer-motion'
import { User } from 'lucide-react'
import { ChatMessage } from '@/types'
import { StreamingText } from './StreamingText'
import { ReasoningBlock } from './ReasoningBlock'
import { SourceBubble } from './SourceBubble'
import { cn } from '@/lib/utils'

interface ChatBubbleProps {
  message: ChatMessage
}

const BUBBLE_VARIANTS = {
  hidden: { opacity: 0, y: 16, scale: 0.97 },
  visible: {
    opacity: 1,
    y: 0,
    scale: 1,
    transition: { type: 'spring', stiffness: 280, damping: 26 },
  },
}

export function ChatBubble({ message }: ChatBubbleProps) {
  const isUser = message.role === 'user'

  return (
    <motion.div
      variants={BUBBLE_VARIANTS}
      initial="hidden"
      animate="visible"
      className={cn(
        'flex gap-3 max-w-[85%]',
        isUser ? 'ml-auto flex-row-reverse' : 'mr-auto'
      )}
    >
      {/* Avatar */}
      <div
        className={cn(
          'shrink-0 w-7 h-7 rounded-full flex items-center justify-center mt-1',
          isUser ? 'bg-accent/20' : 'bg-white/6 border border-white/8'
        )}
      >
        {isUser
          ? <User size={13} className="text-accent" />
          : <span className="text-[10px] font-bold text-secondary">AI</span>
        }
      </div>

      {/* Content */}
      <div className="flex flex-col gap-2 min-w-0">
        {/* Reasoning block (assistant only) */}
        {!isUser && message.reasoning && (
          <ReasoningBlock reasoning={message.reasoning} />
        )}

        {/* Message bubble */}
        <div
          className={cn(
            'px-4 py-3 rounded-2xl',
            isUser
              ? 'bg-accent/15 border border-accent/20 rounded-tr-sm'
              : 'bg-white/5 border border-white/7 rounded-tl-sm'
          )}
        >
          <StreamingText
            text={message.content}
            isStreaming={message.isStreaming ?? false}
          />
        </div>

        {/* Citations row (assistant only) */}
        {!isUser && message.citations.length > 0 && (
          <motion.div
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            transition={{ delay: 0.1 }}
            className="flex items-center gap-1.5 flex-wrap px-1"
          >
            <span className="text-[11px] text-muted">Sources:</span>
            {message.citations.map((citation, i) => (
              <SourceBubble key={citation.id} citation={citation} index={i} />
            ))}
          </motion.div>
        )}
      </div>
    </motion.div>
  )
}
