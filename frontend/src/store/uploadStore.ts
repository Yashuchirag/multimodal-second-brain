import { create } from 'zustand'
import { UploadItem, UploadStatus } from '@/types'

interface UploadStore {
  uploads: UploadItem[]

  // Actions
  addUpload: (item: UploadItem) => void
  updateStatus: (id: string, status: UploadStatus, error?: string) => void
  removeUpload: (id: string) => void
  clearCompleted: () => void
}

export const useUploadStore = create<UploadStore>((set) => ({
  uploads: [],

  addUpload: (item) =>
    set((state) => ({ uploads: [...state.uploads, item] })),

  updateStatus: (id, status, error?) =>
    set((state) => ({
      uploads: state.uploads.map((u) =>
        u.id === id ? { ...u, status, ...(error ? { error } : {}) } : u
      ),
    })),

  removeUpload: (id) =>
    set((state) => ({ uploads: state.uploads.filter((u) => u.id !== id) })),

  clearCompleted: () =>
    set((state) => ({
      uploads: state.uploads.filter((u) => u.status !== 'ready'),
    })),
}))
