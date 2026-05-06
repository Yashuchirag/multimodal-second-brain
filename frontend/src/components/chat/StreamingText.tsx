import { useEffect, useRef } from 'react'
import { motion } from 'framer-motion'
import { cn } from '@/lib/utils'

interface StreamingTextProps {
  text: string
  isStreaming: boolean
  className?: string
}

/**
 * Renders text that may still be streaming in.
 * Shows a blinking cursor at the end while isStreaming is true.
 * Uses a <pre> with word-break for proper whitespace handling.
 */
export function StreamingText({ text, isStreaming, className }: StreamingTextProps) {
  const endRef = useRef<HTMLSpanElement>(null)

  // Auto-scroll to bottom as tokens arrive
  useEffect(() => {
    if (isStreaming) {
      endRef.current?.scrollIntoView({ behavior: 'smooth', block: 'nearest' })
    }
  }, [text, isStreaming])

  return (
    <p
      className={cn(
        'text-sm text-primary leading-relaxed whitespace-pre-wrap break-words',
        className,
      )}
    >
      {text}
      {isStreaming && (
        <motion.span
          animate={{ opacity: [1, 0, 1] }}
          transition={{ repeat: Infinity, duration: 0.9, ease: 'easeInOut' }}
          className="inline-block w-0.5 h-4 ml-0.5 bg-accent align-middle rounded-full"
        />
      )}
      <span ref={endRef} />
    </p>
  )
}
