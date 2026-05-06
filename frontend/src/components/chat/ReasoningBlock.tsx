import { useState } from 'react'
import { motion, AnimatePresence } from 'framer-motion'
import { ChevronDown, Brain } from 'lucide-react'
import { cn } from '@/lib/utils'

interface ReasoningBlockProps {
  reasoning: string
}

/**
 * Collapsible block showing Gemini's internal thinking before the final answer.
 * Collapsed by default — users can expand to see the reasoning chain.
 */
export function ReasoningBlock({ reasoning }: ReasoningBlockProps) {
  const [isOpen, setIsOpen] = useState(false)

  if (!reasoning) return null

  return (
    <div className="rounded-xl border border-white/7 bg-white/3 overflow-hidden">
      {/* Toggle header */}
      <button
        onClick={() => setIsOpen((v) => !v)}
        className="w-full flex items-center gap-2 px-3 py-2 hover:bg-white/4 transition-colors"
      >
        <Brain size={13} className="text-accent shrink-0" />
        <span className="flex-1 text-left text-xs text-secondary">Reasoning</span>
        <motion.div
          animate={{ rotate: isOpen ? 180 : 0 }}
          transition={{ duration: 0.2 }}
        >
          <ChevronDown size={13} className="text-muted" />
        </motion.div>
      </button>

      {/* Collapsible content */}
      <AnimatePresence initial={false}>
        {isOpen && (
          <motion.div
            key="reasoning-content"
            initial={{ height: 0, opacity: 0 }}
            animate={{ height: 'auto', opacity: 1 }}
            exit={{ height: 0, opacity: 0 }}
            transition={{ duration: 0.22, ease: 'easeInOut' }}
            className="overflow-hidden"
          >
            <p
              className={cn(
                'px-3 pb-3 pt-1 text-xs text-muted leading-relaxed',
                'whitespace-pre-wrap border-t border-white/5',
                'font-mono'
              )}
            >
              {reasoning}
            </p>
          </motion.div>
        )}
      </AnimatePresence>
    </div>
  )
}
