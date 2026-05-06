import { useState } from 'react'
import { QueryClient, QueryClientProvider } from '@tanstack/react-query'
import { Sidebar } from '@/components/layout/Sidebar'
import { BentoGrid } from '@/components/dashboard/BentoGrid'
import { ChatComponent } from '@/components/chat/ChatComponent'
import { UploadZone } from '@/components/upload/UploadZone'

const queryClient = new QueryClient({
  defaultOptions: {
    queries: { staleTime: 30_000, retry: 1 },
  },
})

type View = 'dashboard' | 'chat' | 'upload' | 'search'

export default function App() {
  const [activeView, setActiveView] = useState<View>('dashboard')

  return (
    <QueryClientProvider client={queryClient}>
      <div className="flex h-screen bg-background overflow-hidden">
        {/* Sidebar */}
        <Sidebar activeView={activeView} onNavigate={(id) => setActiveView(id as View)} />

        {/* Main content — offset by sidebar width */}
        <main className="flex-1 ml-16 overflow-y-auto relative">
          {activeView === 'dashboard' && (
            <BentoGrid onNavigate={(id) => setActiveView(id as View)} />
          )}
          {activeView === 'chat' && (
            <div className="h-full">
              <ChatComponent />
            </div>
          )}
          {activeView === 'upload' && <UploadZone />}
          {activeView === 'search' && (
            <div className="p-6">
              <p className="text-secondary text-sm">Search view — coming in Phase 8.</p>
            </div>
          )}
        </main>
      </div>
    </QueryClientProvider>
  )
}
