import { useState, useCallback } from 'react'
import { Chunk } from '@/types'

const API_URL = import.meta.env.VITE_API_URL ?? 'http://localhost:8000'

export function useSearch() {
  const [results, setResults] = useState<Chunk[]>([])
  const [isSearching, setIsSearching] = useState(false)
  const [error, setError] = useState<string | null>(null)

  const search = useCallback(async (query: string, topK = 5) => {
    if (!query.trim()) return
    setIsSearching(true)
    setError(null)

    try {
      const res = await fetch(`${API_URL}/api/search`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ query, top_k: topK }),
      })

      if (!res.ok) throw new Error('Search request failed.')
      const data = await res.json()
      setResults(data.results ?? [])
    } catch (err) {
      setError(err instanceof Error ? err.message : 'Search failed.')
    } finally {
      setIsSearching(false)
    }
  }, [])

  const clearResults = useCallback(() => setResults([]), [])

  return { results, isSearching, error, search, clearResults }
}
