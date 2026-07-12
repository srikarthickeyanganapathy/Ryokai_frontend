import React, { useState } from 'react'
import { Outlet } from 'react-router-dom'
import { AppSidebar } from '@/widgets/workspace/AppSidebar'
import { AppTopbar } from '@/widgets/workspace/AppTopbar'
import { useShortcuts } from "@/shared/hooks/useShortcuts"

export function MainLayout() {
  const [sidebarOpen, setSidebarOpen] = useState(false)

  // Global keyboard shortcuts
  useShortcuts()

  return (
    <div className="flex h-screen w-full bg-[var(--bg-base)] text-[var(--text-primary)] overflow-hidden">
      
      {/* Sidebar - Desktop is persistent, Mobile is drawer */}
      <AppSidebar 
        isOpen={sidebarOpen} 
        onClose={() => setSidebarOpen(false)} 
      />

      <div className="flex flex-1 flex-col min-w-0 overflow-hidden">
        {/* Persistent Topbar */}
        <AppTopbar onMenuClick={() => setSidebarOpen(true)} />

        {/* Dynamic Page Content */}
        <main className="flex-1 overflow-y-auto overflow-x-hidden relative custom-scrollbar">
          <div className="mx-auto max-w-[1400px] w-full p-4 md:p-8">
            <Outlet />
          </div>
        </main>
      </div>
    </div>
  )
}