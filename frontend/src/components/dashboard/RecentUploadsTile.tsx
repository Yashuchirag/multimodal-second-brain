import { useQuery } from '@tanstack/react-query'
import { FileImage, FileText, Clock } from 'lucide-react'
import { BentoCard } from './BentoCard'
import { Document } from '@/types'
import { formatDate, truncate } from '@/lib/utils'
import { cn } from '@/lib/utils'

const API_URL = import.meta.env.VITE_API_URL ?? 'http://localhost:8000'

function StatusDot({ status }: { status: Document['status'] }) {
  return (
    <span
      className={cn(
        'w-1.5 h-1.5 rounded-full shrink-0',
        status === 'ready'      && 'bg-emerald-400',
        status === 'processing' && 'bg-amber-400 animate-pulse-slow',
        status === 'failed'     && 'bg-red-400',
      )}
    />
  )
}

export function RecentUploadsTile() {
  const { data, isLoading } = useQuery<{ documents: Document[] }>({
    queryKey: ['documents'],
    queryFn: () => fetch(`${API_URL}/api/documents`).then((r) => r.json()),
    refetchInterval: 5000,    // poll every 5s to pick up newly processed docs
  })

  const docs = data?.documents?.slice(0, 6) ?? []

  return (
    <BentoCard colSpan={4} rowSpan={2} delay={0.08}>
      <div className="flex flex-col h-full gap-3">
        <div className="flex items-center justify-between">
          <div className="flex items-center gap-2">
            <Clock size={14} className="text-muted" />
            <span className="text-xs font-medium text-secondary uppercase tracking-widest">
              Recent Uploads
            </span>
          </div>
          <span className="text-xs text-muted">{docs.length}</span>
        </div>

        {isLoading && (
          <div className="flex-1 flex flex-col gap-2">
            {[...Array(4)].map((_, i) => (
              <div key={i} className="h-10 rounded-lg bg-white/4 animate-pulse" />
            ))}
          </div>
        )}

        {!isLoading && docs.length === 0 && (
          <div className="flex-1 flex items-center justify-center">
            <p className="text-sm text-muted text-center">
              No uploads yet.<br />
              <span className="text-secondary">Drop a file to get started.</span>
            </p>
          </div>
        )}

        {!isLoading && docs.length > 0 && (
          <div className="flex-1 flex flex-col gap-1.5 overflow-y-auto">
            {docs.map((doc) => (
              <div
                key={doc.id}
                className="flex items-center gap-3 px-3 py-2 rounded-xl bg-white/3 hover:bg-white/5 transition-colors"
              >
                {doc.file_type === 'image'
                  ? <FileImage size={15} className="text-accent shrink-0" />
                  : <FileText  size={15} className="text-secondary shrink-0" />
                }
                <div className="flex-1 min-w-0">
                  <p className="text-xs text-primary truncate">{truncate(doc.title, 30)}</p>
                  <p className="text-[11px] text-muted">{formatDate(doc.created_at)}</p>
                </div>
                <StatusDot status={doc.status} />
              </div>
            ))}
          </div>
        )}
      </div>
    </BentoCard>
  )
}
