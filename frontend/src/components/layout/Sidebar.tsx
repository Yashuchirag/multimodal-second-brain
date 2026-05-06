import { motion } from 'framer-motion'
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
  return (
    <motion.aside
      initial={{ x: -80, opacity: 0 }}
      animate={{ x: 0,   opacity: 1 }}
      transition={{ type: 'spring', stiffness: 260, damping: 28 }}
      className={cn(
        'fixed left-0 top-0 h-full w-16 z-40',
        'flex flex-col items-center py-5 gap-2',
        // Glassmorphism
        'bg-white/5 backdrop-blur-glass border-r border-white/7',
      )}
    >
      {/* Logo */}
      <div className="mb-4 p-2 rounded-xl bg-accent/20 text-accent">
        <Brain size={22} />
      </div>

      {/* Nav */}
      <nav className="flex flex-col gap-1 flex-1">
        {NAV_ITEMS.map((item) => {
          const isActive = activeView === item.id
          return (
            <motion.button
              key={item.id}
              whileHover={{ scale: 1.08 }}
              whileTap={{ scale: 0.95 }}
              onClick={() => onNavigate(item.id)}
              title={item.label}
              className={cn(
                'relative w-10 h-10 rounded-xl flex items-center justify-center',
                'transition-colors duration-150',
                isActive
                  ? 'bg-accent/20 text-accent'
                  : 'text-muted hover:text-secondary hover:bg-white/5'
              )}
            >
              {item.icon}
              {isActive && (
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
      <motion.button
        whileHover={{ scale: 1.08 }}
        whileTap={{ scale: 0.95 }}
        title="Settings"
        className="w-10 h-10 rounded-xl flex items-center justify-center text-muted hover:text-secondary hover:bg-white/5 transition-colors"
      >
        <Settings size={18} />
      </motion.button>
    </motion.aside>
  )
}
