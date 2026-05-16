import { useState, KeyboardEvent } from 'react'
import { motion, AnimatePresence } from 'framer-motion'
import { Search, FileImage, FileText, Loader2 } from 'lucide-react'
import { useSearch } from '@/hooks/useSearch'
import { cn } from '@/lib/utils'

function firstCleanExcerpt(text: string, maxLen = 280): string {
  // Skip past any short/garbled leading lines; start from the first line with real content
  const lines = text.split('\n').map((l) => l.trim()).filter(Boolean)
  const goodLines: string[] = []
  for (const line of lines) {
    if (goodLines.join(' ').length >= maxLen) break
    if (line.length > 20) goodLines.push(line)    // skip very short lines (headers, stray chars)
  }
  const excerpt = goodLines.join(' ')
  return excerpt.length <= maxLen ? excerpt : excerpt.slice(0, maxLen) + '…'
}

export function SearchView() {
  const [query, setQuery] = useState('')
  const { results, isSearching, error, search, clearResults } = useSearch()
  const [hasSearched, setHasSearched] = useState(false)

  const handleSearch = () => {
    if (!query.trim() || isSearching) return
    setHasSearched(true)
    search(query.trim())
  }

  const handleKeyDown = (e: KeyboardEvent<HTMLInputElement>) => {
    if (e.key === 'Enter') handleSearch()
  }

  const handleChange = (val: string) => {
    setQuery(val)
    if (!val.trim()) { clearResults(); setHasSearched(false) }
  }

  return (
    <div className="flex flex-col gap-6 p-6 max-w-2xl mx-auto">
      {/* Header */}
      <motion.div
        initial={{ opacity: 0, y: 12 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ type: 'spring', stiffness: 260, damping: 28 }}
      >
        <h1 className="text-lg font-semibold text-primary">Semantic Search</h1>
        <p className="text-sm text-muted mt-0.5">
          Find anything across your uploads using meaning, not keywords.
        </p>
      </motion.div>

      {/* Search input */}
      <motion.div
        initial={{ opacity: 0, y: 12 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ type: 'spring', stiffness: 260, damping: 28, delay: 0.05 }}
        className="flex items-center gap-3 px-4 py-3 rounded-2xl
                   bg-white/[0.08] border border-white/[0.17] focus-within:border-accent/50
                   focus-within:shadow-[0_0_0_1px_rgba(99,102,241,0.35)]
                   transition-all duration-200"
      >
        <Search size={16} className="text-muted shrink-0" />
        <input
          type="text"
          value={query}
          onChange={(e) => handleChange(e.target.value)}
          onKeyDown={handleKeyDown}
          placeholder="Describe what you're looking for…"
          className="flex-1 bg-transparent outline-none text-sm text-primary placeholder:text-muted"
          autoFocus
        />
        <button
          onClick={handleSearch}
          disabled={!query.trim() || isSearching}
          className={cn(
            'shrink-0 px-3 py-1.5 rounded-lg text-xs font-medium transition-all',
            query.trim() && !isSearching
              ? 'bg-accent text-white hover:bg-accent-hover'
              : 'bg-white/[0.09] text-secondary cursor-not-allowed'
          )}
        >
          {isSearching ? <Loader2 size={13} className="animate-spin" /> : 'Search'}
        </button>
      </motion.div>

      {/* Results */}
      <AnimatePresence mode="wait">
        {isSearching && (
          <motion.div key="loading" initial={{ opacity: 0 }} animate={{ opacity: 1 }} exit={{ opacity: 0 }}
            className="flex flex-col gap-3">
            {[...Array(3)].map((_, i) => (
              <div key={i} className="h-24 rounded-xl bg-white/[0.07] animate-pulse" />
            ))}
          </motion.div>
        )}

        {!isSearching && error && (
          <motion.p key="error" initial={{ opacity: 0 }} animate={{ opacity: 1 }} exit={{ opacity: 0 }}
            className="text-sm text-red-400">{error}</motion.p>
        )}

        {!isSearching && hasSearched && results.length === 0 && !error && (
          <motion.div key="empty" initial={{ opacity: 0, y: 8 }} animate={{ opacity: 1, y: 0 }} exit={{ opacity: 0 }}
            className="flex flex-col items-center gap-2 py-12">
            <Search size={28} className="text-muted" />
            <p className="text-sm text-muted">No matches found.</p>
            <p className="text-xs text-muted">Try rephrasing or upload more content.</p>
          </motion.div>
        )}

        {!isSearching && results.length > 0 && (
          <motion.div key="results" initial={{ opacity: 0 }} animate={{ opacity: 1 }} exit={{ opacity: 0 }}
            className="flex flex-col gap-3">
            <p className="text-xs text-muted px-1">
              {results.length} result{results.length !== 1 ? 's' : ''}
            </p>

            {results.map((chunk, i) => {
              const isImage = chunk.content_type === 'image'
              const score   = chunk.score != null ? Math.round(chunk.score * 100) : null
              const meta    = (chunk.metadata ?? {}) as Record<string, any>
              const filename    = meta.filename as string | undefined
              const page        = meta.page as number | undefined
              const totalPages  = meta.total_pages as number | undefined
              const excerpt = isImage
                ? (chunk.image_description ?? 'Image content')
                : firstCleanExcerpt(chunk.text ?? '')

              return (
                <motion.div
                  key={chunk.id}
                  initial={{ opacity: 0, y: 10 }}
                  animate={{ opacity: 1, y: 0 }}
                  transition={{ delay: i * 0.05, type: 'spring', stiffness: 280, damping: 26 }}
                  className="flex flex-col gap-3 p-4 rounded-xl
                             bg-white/[0.06] border border-white/[0.13]
                             hover:bg-white/[0.10] hover:border-white/[0.22] transition-colors"
                >
                  {/* Row 1: icon + source info + score */}
                  <div className="flex items-center gap-2.5">
                    <div className={cn(
                      'w-7 h-7 rounded-lg flex items-center justify-center shrink-0',
                      isImage ? 'bg-accent/25' : 'bg-white/[0.11]'
                    )}>
                      {isImage
                        ? <FileImage size={14} className="text-accent" />
                        : <FileText  size={14} className="text-secondary" />
                      }
                    </div>

                    <div className="flex-1 min-w-0">
                      {filename && (
                        <p className="text-xs font-medium text-secondary truncate">{filename}</p>
                      )}
                      <div className="flex items-center gap-1.5 mt-0.5">
                        <span className="text-[11px] text-muted uppercase tracking-wide">
                          {isImage ? 'Image' : 'Text'}
                        </span>
                        {page != null && (
                          <>
                            <span className="text-muted/40 text-[10px]">·</span>
                            <span className="text-[11px] text-muted">
                              Page {page}{totalPages ? ` of ${totalPages}` : ''}
                            </span>
                          </>
                        )}
                      </div>
                    </div>

                    {score !== null && (
                      <span className={cn(
                        'shrink-0 text-[11px] font-medium px-2 py-0.5 rounded-full',
                        score >= 80 ? 'bg-emerald-500/15 text-emerald-400'
                          : score >= 60 ? 'bg-accent/15 text-accent'
                          : 'bg-white/[0.11] text-secondary'
                      )}>
                        {score}%
                      </span>
                    )}
                  </div>

                  {/* Row 2: image thumbnail */}
                  {isImage && chunk.image_url && (
                    <img
                      src={chunk.image_url}
                      alt="Result preview"
                      className="w-full max-h-40 rounded-lg object-cover"
                    />
                  )}

                  {/* Row 3: text excerpt */}
                  <p className="text-sm text-secondary leading-relaxed">
                    {excerpt}
                  </p>
                </motion.div>
              )
            })}
          </motion.div>
        )}
      </AnimatePresence>
    </div>
  )
}
