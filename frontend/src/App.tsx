import { useState } from 'react'
import { QueryClient, QueryClientProvider } from '@tanstack/react-query'
import { Sidebar } from '@/components/layout/Sidebar'
import { BentoGrid } from '@/components/dashboard/BentoGrid'
import { ChatComponent } from '@/components/chat/ChatComponent'
import { UploadZone } from '@/components/upload/UploadZone'
import { SearchView } from '@/components/search/SearchView'

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
        {/* Ambient background */}
        <div className="fixed inset-0 pointer-events-none overflow-hidden z-0">
          <div className="absolute top-[-15%] left-[15%] w-[700px] h-[700px] rounded-full bg-accent/[0.04] blur-[140px]" />
          <div className="absolute bottom-[-25%] right-[5%] w-[600px] h-[600px] rounded-full bg-violet-600/[0.035] blur-[120px]" />
          <div className="absolute top-[40%] left-[50%] w-[400px] h-[400px] rounded-full bg-indigo-500/[0.025] blur-[100px]" />
        </div>

        {/* Sidebar */}
        <Sidebar activeView={activeView} onNavigate={(id) => setActiveView(id as View)} />

        {/* Main content — offset by sidebar width */}
        <main className="flex-1 ml-16 overflow-y-auto relative z-10">
          {activeView === 'dashboard' && (
            <BentoGrid onNavigate={(id) => setActiveView(id as View)} />
          )}
          {activeView === 'chat' && (
            <div className="h-full">
              <ChatComponent />
            </div>
          )}
          {activeView === 'upload' && <UploadZone />}
          {activeView === 'search' && <SearchView />}
        </main>
      </div>
    </QueryClientProvider>
  )
}
