import { useEffect, useRef } from 'react'
import { motion } from 'framer-motion'
import ReactMarkdown from 'react-markdown'
import remarkGfm from 'remark-gfm'
import { cn } from '@/lib/utils'

interface StreamingTextProps {
  text: string
  isStreaming: boolean
  className?: string
}

const MD_COMPONENTS = {
  p:      ({ children }: any) => <p className="mb-2 last:mb-0 leading-relaxed">{children}</p>,
  strong: ({ children }: any) => <strong className="font-semibold text-primary">{children}</strong>,
  em:     ({ children }: any) => <em className="italic text-secondary">{children}</em>,
  ul:     ({ children }: any) => <ul className="my-1.5 ml-4 list-disc space-y-0.5">{children}</ul>,
  ol:     ({ children }: any) => <ol className="my-1.5 ml-4 list-decimal space-y-0.5">{children}</ol>,
  li:     ({ children }: any) => <li className="leading-relaxed">{children}</li>,
  h1:     ({ children }: any) => <h1 className="text-base font-semibold text-primary mt-3 mb-1">{children}</h1>,
  h2:     ({ children }: any) => <h2 className="text-sm font-semibold text-primary mt-3 mb-1">{children}</h2>,
  h3:     ({ children }: any) => <h3 className="text-sm font-medium text-primary mt-2 mb-0.5">{children}</h3>,
  code:   ({ children, className }: any) => {
    const isBlock = className?.includes('language-')
    return isBlock
      ? <pre className="my-2 p-3 rounded-lg bg-black/30 border border-white/8 overflow-x-auto text-xs font-mono text-secondary">{children}</pre>
      : <code className="px-1.5 py-0.5 rounded-md bg-white/8 text-xs font-mono text-accent">{children}</code>
  },
  blockquote: ({ children }: any) => (
    <blockquote className="my-2 pl-3 border-l-2 border-accent/40 text-secondary italic">{children}</blockquote>
  ),
  a: ({ children, href }: any) => (
    <a href={href} target="_blank" rel="noopener noreferrer" className="text-accent hover:underline">{children}</a>
  ),
}

export function StreamingText({ text, isStreaming, className }: StreamingTextProps) {
  const endRef = useRef<HTMLDivElement>(null)

  useEffect(() => {
    if (isStreaming) {
      endRef.current?.scrollIntoView({ behavior: 'smooth', block: 'nearest' })
    }
  }, [text, isStreaming])

  return (
    <div className={cn('text-sm text-primary', className)}>
      <ReactMarkdown remarkPlugins={[remarkGfm]} components={MD_COMPONENTS}>
        {text}
      </ReactMarkdown>

      {isStreaming && (
        <motion.span
          animate={{ opacity: [1, 0, 1] }}
          transition={{ repeat: Infinity, duration: 0.9, ease: 'easeInOut' }}
          className="inline-block w-0.5 h-3.5 ml-0.5 bg-accent align-middle rounded-full"
        />
      )}

      <div ref={endRef} />
    </div>
  )
}
