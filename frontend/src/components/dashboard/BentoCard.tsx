import { useState } from 'react'
import { motion } from 'framer-motion'
import { cn } from '@/lib/utils'

interface BentoCardProps {
  children: React.ReactNode
  className?: string
  colSpan?: number
  rowSpan?: number
  delay?: number
  onClick?: () => void
  glow?: boolean
}

export function BentoCard({
  children,
  className,
  colSpan = 4,
  rowSpan = 1,
  delay = 0,
  onClick,
  glow = false,
}: BentoCardProps) {
  const [isHovered, setIsHovered] = useState(false)

  return (
    <motion.div
      initial={{ opacity: 0, y: 24, scale: 0.97 }}
      animate={{ opacity: 1, y: 0, scale: 1 }}
      transition={{ type: 'spring', stiffness: 220, damping: 26, delay }}
      whileHover={{
        y: -3,
        boxShadow: glow
          ? '0 0 0 1px rgba(99,102,241,0.4), 0 16px 48px rgba(99,102,241,0.12), 0 4px 12px rgba(0,0,0,0.4)'
          : '0 0 0 1px rgba(255,255,255,0.1), 0 12px 32px rgba(0,0,0,0.35)',
      }}
      onHoverStart={() => setIsHovered(true)}
      onHoverEnd={() => setIsHovered(false)}
      onClick={onClick}
      style={{ gridColumn: `span ${colSpan}`, gridRow: `span ${rowSpan}` }}
      className={cn(
        'relative overflow-hidden rounded-2xl p-5',
        'bg-glass-card backdrop-blur-glass border border-white/7',
        'transition-colors duration-200',
        onClick && 'cursor-pointer hover:border-white/12',
        className,
      )}
    >
      {/* Shine sweep on hover */}
      <motion.div
        className="absolute inset-0 pointer-events-none"
        animate={{
          background: isHovered
            ? 'linear-gradient(135deg, rgba(255,255,255,0.04) 0%, rgba(255,255,255,0) 60%)'
            : 'linear-gradient(135deg, rgba(255,255,255,0) 0%, rgba(255,255,255,0) 100%)',
        }}
        transition={{ duration: 0.25 }}
      />

      {children}
    </motion.div>
  )
}
