import { motion } from 'framer-motion'
import { Loader2 } from 'lucide-react'

/**
 * Full-card shimmer shown while Gemini is analysing an uploaded image.
 */
export function UploadShimmer() {
  return (
    <div className="relative overflow-hidden rounded-xl border border-white/7 bg-white/3 p-4">
      {/* Sweeping shimmer gradient */}
      <div
        className="absolute inset-0 -translate-x-full animate-shimmer"
        style={{
          background: 'linear-gradient(90deg, transparent 0%, rgba(255,255,255,0.04) 50%, transparent 100%)',
          backgroundSize: '200% 100%',
        }}
      />

      <div className="relative z-10 flex items-center gap-3">
        <div className="w-10 h-10 rounded-lg bg-white/6 animate-pulse" />
        <div className="flex-1 flex flex-col gap-1.5">
          <div className="h-3 w-3/4 rounded bg-white/6 animate-pulse" />
          <div className="h-2.5 w-1/2 rounded bg-white/4 animate-pulse" />
        </div>
        <Loader2 size={15} className="text-accent animate-spin shrink-0" />
      </div>

      <p className="relative z-10 mt-3 text-xs text-muted">
        Analysing and embedding your file…
      </p>
    </div>
  )
}

/**
 * Minimal inline shimmer row for upload items in a list.
 */
export function UploadShimmerRow() {
  return (
    <motion.div
      initial={{ opacity: 0, height: 0 }}
      animate={{ opacity: 1, height: 'auto' }}
      exit={{ opacity: 0, height: 0 }}
      className="overflow-hidden"
    >
      <UploadShimmer />
    </motion.div>
  )
}
