import { useState } from 'react'
import { motion, AnimatePresence } from 'framer-motion'
import { Brain, LayoutDashboard, MessageSquare, Upload, Search, Settings } from 'lucide-react'
import { cn } from '@/lib/utils'

interface NavItem {
  icon: React.ReactNode
  label: string
  id: string
}

const NAV_ITEMS: NavItem[] = [
  { icon: <LayoutDashboard size={18} />, label: 'Dashboard', id: 'dashboard' },
  { icon: <MessageSquare size={18} />,  label: 'Chat',       id: 'chat'      },
  { icon: <Upload size={18} />,         label: 'Upload',     id: 'upload'    },
  { icon: <Search size={18} />,         label: 'Search',     id: 'search'    },
]

interface SidebarProps {
  activeView: string
  onNavigate: (id: string) => void
}

export function Sidebar({ activeView, onNavigate }: SidebarProps) {
  const [isExpanded, setIsExpanded] = useState(false)

  return (
    <motion.aside
      initial={{ x: -80, opacity: 0 }}
      animate={{ x: 0, opacity: 1, width: isExpanded ? 176 : 64 }}
      transition={{ type: 'spring', stiffness: 260, damping: 28 }}
      onHoverStart={() => setIsExpanded(true)}
      onHoverEnd={() => setIsExpanded(false)}
      className={cn(
        'fixed left-0 top-0 h-full z-40',
        'flex flex-col items-start py-5 gap-2',
        'bg-white/[0.07] backdrop-blur-glass border-r border-white/[0.12]',
        'overflow-hidden',
      )}
    >
      {/* Logo */}
      <div className="mb-4 px-[19px] flex items-center gap-3 w-full">
        <div className="shrink-0 p-2 rounded-xl bg-accent/20 text-accent">
          <Brain size={22} />
        </div>
        <AnimatePresence>
          {isExpanded && (
            <motion.span
              initial={{ opacity: 0, x: -8 }}
              animate={{ opacity: 1, x: 0 }}
              exit={{ opacity: 0, x: -8 }}
              transition={{ duration: 0.15, delay: 0.05 }}
              className="text-sm font-semibold text-primary whitespace-nowrap overflow-hidden"
            >
              Second Brain
            </motion.span>
          )}
        </AnimatePresence>
      </div>

      {/* Nav */}
      <nav className="flex flex-col gap-1 flex-1 w-full px-3">
        {NAV_ITEMS.map((item) => {
          const isActive = activeView === item.id
          return (
            <motion.button
              key={item.id}
              whileHover={{ scale: 1.02 }}
              whileTap={{ scale: 0.97 }}
              onClick={() => onNavigate(item.id)}
              title={isExpanded ? undefined : item.label}
              className={cn(
                'relative flex items-center gap-3 w-full h-10 rounded-xl px-2.5',
                'transition-colors duration-150 text-left',
                isActive
                  ? 'bg-accent/20 text-accent'
                  : 'text-secondary hover:text-primary hover:bg-white/[0.08]'
              )}
            >
              <span className="shrink-0">{item.icon}</span>

              <AnimatePresence>
                {isExpanded && (
                  <motion.span
                    initial={{ opacity: 0, x: -6 }}
                    animate={{ opacity: 1, x: 0 }}
                    exit={{ opacity: 0, x: -6 }}
                    transition={{ duration: 0.14, delay: 0.04 }}
                    className="text-sm font-medium whitespace-nowrap overflow-hidden"
                  >
                    {item.label}
                  </motion.span>
                )}
              </AnimatePresence>

              {isActive && !isExpanded && (
                <motion.span
                  layoutId="nav-indicator"
                  className="absolute -right-[1px] top-2 bottom-2 w-0.5 rounded-full bg-accent"
                />
              )}
            </motion.button>
          )
        })}
      </nav>

      {/* Settings at bottom */}
      <div className="w-full px-3">
        <motion.button
          whileHover={{ scale: 1.02 }}
          whileTap={{ scale: 0.97 }}
          title={isExpanded ? undefined : 'Settings'}
          className="flex items-center gap-3 w-full h-10 rounded-xl px-2.5 text-secondary hover:text-primary hover:bg-white/[0.08] transition-colors"
        >
          <span className="shrink-0"><Settings size={18} /></span>
          <AnimatePresence>
            {isExpanded && (
              <motion.span
                initial={{ opacity: 0, x: -6 }}
                animate={{ opacity: 1, x: 0 }}
                exit={{ opacity: 0, x: -6 }}
                transition={{ duration: 0.14, delay: 0.04 }}
                className="text-sm font-medium whitespace-nowrap overflow-hidden"
              >
                Settings
              </motion.span>
            )}
          </AnimatePresence>
        </motion.button>
      </div>
    </motion.aside>
  )
}
