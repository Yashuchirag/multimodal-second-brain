import { useState } from 'react'
import { motion, AnimatePresence } from 'framer-motion'
import { FileImage, FileText } from 'lucide-react'
import { Citation } from '@/types'
import { truncate } from '@/lib/utils'
import { cn } from '@/lib/utils'

interface SourceBubbleProps {
  citation: Citation
  index: number
}

/**
 * A small numbered badge that, on hover, shows a preview card of the
 * source document (image preview or text snippet).
 */
export function SourceBubble({ citation, index }: SourceBubbleProps) {
  const [isVisible, setIsVisible] = useState(false)
  const isImage = citation.content_type === 'image'

  return (
    <div
      className="relative inline-block"
      onMouseEnter={() => setIsVisible(true)}
      onMouseLeave={() => setIsVisible(false)}
    >
      {/* Badge */}
      <span
        className={cn(
          'inline-flex items-center justify-center',
          'w-4 h-4 rounded-full text-[10px] font-semibold',
          'bg-accent/20 text-accent border border-accent/30',
          'cursor-default select-none'
        )}
      >
        {index + 1}
      </span>

      {/* Hover preview card */}
      <AnimatePresence>
        {isVisible && (
          <motion.div
            initial={{ opacity: 0, y: 8, scale: 0.95 }}
            animate={{ opacity: 1, y: 0, scale: 1  }}
            exit={{    opacity: 0, y: 8, scale: 0.95 }}
            transition={{ duration: 0.15 }}
            className={cn(
              'absolute bottom-6 left-1/2 -translate-x-1/2 z-50 w-56',
              'rounded-xl overflow-hidden',
              'bg-surface-2 border border-white/10',
              'shadow-[0_16px_48px_rgba(0,0,0,0.6)]',
            )}
          >
            {/* Image preview */}
            {isImage && citation.image_url && (
              <img
                src={citation.image_url}
                alt="Source preview"
                className="w-full h-32 object-cover"
              />
            )}

            {/* Text / description */}
            <div className="p-3 flex flex-col gap-1.5">
              <div className="flex items-center gap-1.5">
                {isImage
                  ? <FileImage size={12} className="text-accent shrink-0" />
                  : <FileText  size={12} className="text-secondary shrink-0" />
                }
                <span className="text-[11px] font-medium text-secondary uppercase tracking-wide">
                  {isImage ? 'Image' : 'Text'} Source
                </span>
                {citation.score !== undefined && (
                  <span className="ml-auto text-[10px] text-muted">
                    {(citation.score * 100).toFixed(0)}% match
                  </span>
                )}
              </div>

              <p className="text-[11px] text-secondary leading-relaxed">
                {truncate(
                  citation.image_description ?? citation.text ?? 'No preview available.',
                  120,
                )}
              </p>
            </div>
          </motion.div>
        )}
      </AnimatePresence>
    </div>
  )
}
