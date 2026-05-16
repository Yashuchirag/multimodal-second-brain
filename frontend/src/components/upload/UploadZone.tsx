import { useCallback } from 'react'
import { useDropzone } from 'react-dropzone'
import { motion, AnimatePresence } from 'framer-motion'
import { Upload, CheckCircle2, XCircle, FileText } from 'lucide-react'
import { useUpload } from '@/hooks/useUpload'
import { UploadShimmerRow } from './UploadShimmer'
import { cn } from '@/lib/utils'

const ACCEPTED = {
  'image/*':        ['.jpg', '.jpeg', '.png', '.gif', '.webp'],
  'text/plain':     ['.txt', '.md'],
  'application/pdf': ['.pdf'],
}

export function UploadZone() {
  const { uploads, uploadFile } = useUpload()

  const onDrop = useCallback(
    (accepted: File[]) => {
      accepted.forEach(uploadFile)
    },
    [uploadFile]
  )

  const { getRootProps, getInputProps, isDragActive } = useDropzone({
    onDrop,
    accept: ACCEPTED,
    multiple: true,
  })

  return (
    <div className="flex flex-col gap-5 p-6 max-w-2xl mx-auto">
      {/* Drop zone — motion wrapper for entrance animation, inner div owns dropzone props */}
      <motion.div
        initial={{ opacity: 0, y: 16 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ type: 'spring', stiffness: 240, damping: 26 }}
      >
        <div
          {...getRootProps()}
          className={cn(
            'relative flex flex-col items-center justify-center gap-4',
            'h-48 rounded-2xl border-2 border-dashed cursor-pointer',
            'transition-all duration-200',
            isDragActive
              ? 'border-accent bg-accent/[0.12] scale-[1.01]'
              : 'border-white/[0.16] bg-white/[0.04] hover:border-white/[0.28] hover:bg-white/[0.07]'
          )}
        >
          <input {...getInputProps()} />

          <motion.div
            animate={isDragActive ? { scale: 1.15, rotate: -6 } : { scale: 1, rotate: 0 }}
            transition={{ type: 'spring', stiffness: 300, damping: 20 }}
            className={cn(
              'p-4 rounded-2xl',
              isDragActive ? 'bg-accent/25' : 'bg-white/[0.09]'
            )}
          >
            <Upload size={24} className={isDragActive ? 'text-accent' : 'text-muted'} />
          </motion.div>

          <div className="text-center">
            <p className="text-sm font-medium text-secondary">
              {isDragActive ? 'Drop to upload' : 'Drag & drop files here'}
            </p>
            <p className="text-xs text-muted mt-1">
              Images (JPG, PNG, WebP) · PDF · Text (TXT, MD)
            </p>
          </div>

          <span className="text-xs px-3 py-1 rounded-full bg-white/[0.09] border border-white/[0.16] text-secondary">
            or click to browse
          </span>
        </div>
      </motion.div>

      {/* Upload queue */}
      <AnimatePresence>
        {uploads.length > 0 && (
          <motion.div
            initial={{ opacity: 0, height: 0 }}
            animate={{ opacity: 1, height: 'auto' }}
            exit={{    opacity: 0, height: 0 }}
            className="flex flex-col gap-2"
          >
            <p className="text-xs text-muted font-medium uppercase tracking-widest px-1">
              Queue
            </p>

            {uploads.map((item) => {
              if (item.status === 'processing') {
                return <UploadShimmerRow key={item.id} />
              }

              return (
                <motion.div
                  key={item.id}
                  initial={{ opacity: 0, x: -12 }}
                  animate={{ opacity: 1, x: 0 }}
                  exit={{    opacity: 0, x:  12 }}
                  className="flex items-center gap-3 px-4 py-3 rounded-xl bg-white/[0.07] border border-white/[0.14]"
                >
                  {/* Thumbnail or icon */}
                  {item.preview
                    ? <img src={item.preview} alt="" className="w-9 h-9 rounded-lg object-cover shrink-0" />
                    : (
                      <div className="w-9 h-9 rounded-lg bg-white/[0.09] flex items-center justify-center shrink-0">
                        <FileText size={16} className="text-muted" />
                      </div>
                    )
                  }

                  <div className="flex-1 min-w-0">
                    <p className="text-xs text-primary truncate">{item.filename}</p>
                    <p className="text-[11px] text-muted capitalize">{item.status}</p>
                  </div>

                  {/* Status icon */}
                  {item.status === 'uploading' && (
                    <div className="w-1.5 h-1.5 rounded-full bg-amber-400 animate-pulse-slow shrink-0" />
                  )}
                  {item.status === 'ready' && (
                    <CheckCircle2 size={15} className="text-emerald-400 shrink-0" />
                  )}
                  {item.status === 'failed' && (
                    <XCircle size={15} className="text-red-400 shrink-0" />
                  )}
                </motion.div>
              )
            })}
          </motion.div>
        )}
      </AnimatePresence>
    </div>
  )
}
