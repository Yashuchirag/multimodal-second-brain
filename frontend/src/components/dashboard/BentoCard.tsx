import { motion } from 'framer-motion'
import { cn } from '@/lib/utils'

interface BentoCardProps {
  children: React.ReactNode
  className?: string
  colSpan?: number          // 1–12
  rowSpan?: number
  delay?: number            // stagger delay for entrance animation
  onClick?: () => void
  glow?: boolean            // accent glow on hover
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
  return (
    <motion.div
      initial={{ opacity: 0, y: 24, scale: 0.97 }}
      animate={{ opacity: 1, y: 0,  scale: 1    }}
      transition={{
        type: 'spring',
        stiffness: 220,
        damping: 26,
        delay,
      }}
      whileHover={glow ? { boxShadow: '0 0 0 1px rgba(99,102,241,0.3), 0 8px 32px rgba(99,102,241,0.08)' } : {}}
      onClick={onClick}
      style={{
        gridColumn: `span ${colSpan}`,
        gridRow:    `span ${rowSpan}`,
      }}
      className={cn(
        'relative overflow-hidden rounded-2xl p-5',
        'bg-glass-card backdrop-blur-glass border border-white/7',
        'transition-colors duration-200',
        onClick && 'cursor-pointer hover:border-white/12',
        className,
      )}
    >
      {children}
    </motion.div>
  )
}
