import { Sparkles } from 'lucide-react'
import { BentoCard } from './BentoCard'

export function InsightsTile() {
  return (
    <BentoCard colSpan={8} rowSpan={2} delay={0} glow>
      {/* Gradient background accent */}
      <div className="absolute inset-0 bg-gradient-to-br from-accent/10 via-transparent to-transparent pointer-events-none" />

      <div className="relative z-10 h-full flex flex-col gap-4">
        {/* Header */}
        <div className="flex items-center gap-2">
          <div className="p-1.5 rounded-lg bg-accent/20">
            <Sparkles size={14} className="text-accent" />
          </div>
          <span className="text-xs font-medium text-secondary uppercase tracking-widest">
            AI Insights
          </span>
        </div>

        {/* Placeholder insight */}
        <div className="flex-1 flex flex-col justify-center gap-3">
          <h2 className="text-xl font-semibold text-primary leading-snug">
            Your second brain is ready.
          </h2>
          <p className="text-sm text-secondary leading-relaxed max-w-lg">
            Upload images, notes, or documents and ask anything. Gemini will
            analyze and connect your knowledge for you.
          </p>

          {/* Placeholder insight chips */}
          <div className="flex flex-wrap gap-2 mt-2">
            {['Upload your first file', 'Ask a question', 'Search your notes'].map((hint) => (
              <span
                key={hint}
                className="px-3 py-1 rounded-full text-xs bg-white/5 border border-white/8 text-secondary"
              >
                {hint}
              </span>
            ))}
          </div>
        </div>
      </div>
    </BentoCard>
  )
}
