import { useCallback, useRef } from 'react'
import { useUploadStore } from '@/store/uploadStore'
import { generateId } from '@/lib/utils'

const API_URL = import.meta.env.VITE_API_URL ?? 'http://localhost:8000'
const POLL_INTERVAL_MS = 2000
const MAX_POLL_ATTEMPTS = 30   // 60 seconds max before giving up

export function useUpload() {
  const { uploads, addUpload, updateStatus } = useUploadStore()
  const pollRefs = useRef<Record<string, ReturnType<typeof setInterval>>>({})

  const pollStatus = useCallback(
    (docId: string, uploadItemId: string) => {
      let attempts = 0

      pollRefs.current[uploadItemId] = setInterval(async () => {
        attempts++

        try {
          const res = await fetch(`${API_URL}/api/upload/${docId}/status`)
          if (!res.ok) throw new Error('Status check failed')
          const data = await res.json()

          if (data.status === 'ready') {
            updateStatus(uploadItemId, 'ready')
            clearInterval(pollRefs.current[uploadItemId])
            delete pollRefs.current[uploadItemId]
          } else if (data.status === 'failed') {
            updateStatus(uploadItemId, 'failed', 'Processing failed on server.')
            clearInterval(pollRefs.current[uploadItemId])
            delete pollRefs.current[uploadItemId]
          } else if (attempts >= MAX_POLL_ATTEMPTS) {
            updateStatus(uploadItemId, 'failed', 'Processing timed out.')
            clearInterval(pollRefs.current[uploadItemId])
            delete pollRefs.current[uploadItemId]
          }
        } catch {
          updateStatus(uploadItemId, 'failed', 'Could not reach server.')
          clearInterval(pollRefs.current[uploadItemId])
          delete pollRefs.current[uploadItemId]
        }
      }, POLL_INTERVAL_MS)
    },
    [updateStatus]
  )

  const uploadFile = useCallback(
    async (file: File) => {
      const uploadItemId = generateId()
      const preview = file.type.startsWith('image/')
        ? URL.createObjectURL(file)
        : undefined

      // Add to store immediately for optimistic UI
      addUpload({
        id: uploadItemId,
        filename: file.name,
        status: 'uploading',
        preview,
      })

      try {
        const formData = new FormData()
        formData.append('file', file)

        const res = await fetch(`${API_URL}/api/upload`, {
          method: 'POST',
          body: formData,
        })

        if (!res.ok) {
          const err = await res.json().catch(() => ({ detail: 'Upload failed.' }))
          throw new Error(err.detail ?? 'Upload failed.')
        }

        const data = await res.json()
        updateStatus(uploadItemId, 'processing')

        // Start polling until document is ready
        pollStatus(data.id, uploadItemId)
      } catch (err) {
        updateStatus(
          uploadItemId,
          'failed',
          err instanceof Error ? err.message : 'Unknown error.'
        )
      }
    },
    [addUpload, updateStatus, pollStatus]
  )

  return { uploads, uploadFile }
}
