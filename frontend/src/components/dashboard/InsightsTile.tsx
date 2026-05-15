import { motion } from 'framer-motion'
import { Sparkles, ArrowRight } from 'lucide-react'
import { BentoCard } from './BentoCard'

const HINT_CHIPS = [
  { label: 'Upload your first file', emoji: '📄' },
  { label: 'Ask a question',         emoji: '💬' },
  { label: 'Search your notes',      emoji: '🔍' },
]

export function InsightsTile() {
  return (
    <BentoCard colSpan={8} rowSpan={2} delay={0} glow>
      {/* Animated radial glow */}
      <motion.div
        className="absolute inset-0 pointer-events-none"
        animate={{
          background: [
            'radial-gradient(ellipse 60% 50% at 20% 40%, rgba(99,102,241,0.10) 0%, transparent 70%)',
            'radial-gradient(ellipse 60% 50% at 30% 60%, rgba(99,102,241,0.07) 0%, transparent 70%)',
            'radial-gradient(ellipse 60% 50% at 20% 40%, rgba(99,102,241,0.10) 0%, transparent 70%)',
          ],
        }}
        transition={{ duration: 6, repeat: Infinity, ease: 'easeInOut' }}
      />

      <div className="relative z-10 h-full flex flex-col gap-4">
        {/* Header */}
        <div className="flex items-center gap-2">
          <div className="p-1.5 rounded-lg bg-accent/20">
            <Sparkles size={14} className="text-accent" />
          </div>
          <span className="text-xs font-medium text-secondary uppercase tracking-widest">
            AI Insights
          </span>
          <motion.div
            className="ml-auto w-1.5 h-1.5 rounded-full bg-accent"
            animate={{ opacity: [1, 0.3, 1] }}
            transition={{ duration: 2.4, repeat: Infinity, ease: 'easeInOut' }}
          />
        </div>

        {/* Content */}
        <div className="flex-1 flex flex-col justify-center gap-4">
          <div>
            <h2 className="text-2xl font-semibold text-primary leading-snug tracking-tight">
              Your second brain is ready.
            </h2>
            <p className="text-sm text-secondary leading-relaxed max-w-lg mt-2">
              Upload images, notes, or documents and ask anything. Your AI
              will search, connect, and reason across your knowledge for you.
            </p>
          </div>

          {/* Chips */}
          <div className="flex flex-wrap gap-2">
            {HINT_CHIPS.map((chip, i) => (
              <motion.span
                key={chip.label}
                initial={{ opacity: 0, y: 8 }}
                animate={{ opacity: 1, y: 0 }}
                transition={{ delay: 0.3 + i * 0.08, type: 'spring', stiffness: 280, damping: 24 }}
                whileHover={{ scale: 1.03, backgroundColor: 'rgba(255,255,255,0.07)' }}
                className="group flex items-center gap-1.5 px-3 py-1.5 rounded-full text-xs
                           bg-white/4 border border-white/8 text-secondary cursor-default
                           transition-colors duration-150"
              >
                <span>{chip.emoji}</span>
                {chip.label}
                <ArrowRight
                  size={10}
                  className="opacity-0 group-hover:opacity-60 transition-opacity -ml-0.5 text-accent"
                />
              </motion.span>
            ))}
          </div>
        </div>
      </div>
    </BentoCard>
  )
}
