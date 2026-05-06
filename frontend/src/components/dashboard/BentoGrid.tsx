import { InsightsTile } from './InsightsTile'
import { RecentUploadsTile } from './RecentUploadsTile'
import { BentoCard } from './BentoCard'
import { Zap, Database, MessageSquare } from 'lucide-react'

interface BentoGridProps {
  onNavigate: (view: string) => void
}

export function BentoGrid({ onNavigate }: BentoGridProps) {
  return (
    <div className="grid grid-cols-12 auto-rows-[140px] gap-4 p-6">

      {/* Row 1–2: Hero + Recents */}
      <InsightsTile />
      <RecentUploadsTile />

      {/* Row 3: Quick action tiles */}
      <BentoCard colSpan={4} delay={0.16} onClick={() => onNavigate('chat')} glow>
        <div className="flex flex-col gap-3 h-full justify-between">
          <div className="p-2 w-fit rounded-xl bg-violet-500/15">
            <MessageSquare size={18} className="text-violet-400" />
          </div>
          <div>
            <h3 className="text-sm font-semibold text-primary">Chat</h3>
            <p className="text-xs text-muted mt-0.5">Ask questions across your uploads</p>
          </div>
        </div>
      </BentoCard>

      <BentoCard colSpan={4} delay={0.22} onClick={() => onNavigate('upload')} glow>
        <div className="flex flex-col gap-3 h-full justify-between">
          <div className="p-2 w-fit rounded-xl bg-emerald-500/15">
            <Zap size={18} className="text-emerald-400" />
          </div>
          <div>
            <h3 className="text-sm font-semibold text-primary">Upload</h3>
            <p className="text-xs text-muted mt-0.5">Add images, docs, and notes</p>
          </div>
        </div>
      </BentoCard>

      <BentoCard colSpan={4} delay={0.28} onClick={() => onNavigate('search')} glow>
        <div className="flex flex-col gap-3 h-full justify-between">
          <div className="p-2 w-fit rounded-xl bg-sky-500/15">
            <Database size={18} className="text-sky-400" />
          </div>
          <div>
            <h3 className="text-sm font-semibold text-primary">Search</h3>
            <p className="text-xs text-muted mt-0.5">Semantic search across all content</p>
          </div>
        </div>
      </BentoCard>

    </div>
  )
}
