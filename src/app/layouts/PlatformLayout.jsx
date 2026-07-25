import React from 'react'
import { Outlet } from 'react-router-dom'
import { PlatformSidebar } from '@/widgets/platform/PlatformSidebar'
import { AppTopbar } from '@/widgets/workspace/AppTopbar'

export function PlatformLayout() {
  return (
    <div className="flex h-screen overflow-hidden bg-[var(--bg-base)] text-[var(--text-primary)] font-sans">
      {/* Control Plane Navigation */}
      <PlatformSidebar className="hidden md:flex" />

      {/* Main Content Area */}
      <div className="flex-1 flex flex-col min-w-0 relative h-full bg-[var(--bg-subtle)] p-2 md:p-3">
        <div className="flex flex-1 flex-col bg-[var(--bg-base)] rounded-[var(--radius-xl)] shadow-sm border border-[var(--color-border-subtle)] overflow-hidden relative">
          <AppTopbar onMenuClick={() => {}} />
          
          <main className="flex-1 overflow-y-auto overflow-x-hidden relative custom-scrollbar">
            <div className="w-full h-full p-6 md:p-10">
              <Outlet />
            </div>
          </main>
        </div>
      </div>
    </div>
  )
}

