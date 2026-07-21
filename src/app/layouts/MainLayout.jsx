import React, { useState } from 'react'
import { Outlet, useLocation } from 'react-router-dom'
import { motion, AnimatePresence } from 'framer-motion'
import { AppSidebar } from '@/widgets/workspace/AppSidebar'
import { AppTopbar } from '@/widgets/workspace/AppTopbar'
import { useShortcuts } from "@/shared/hooks/useShortcuts"

export function MainLayout() {
  const [sidebarOpen, setSidebarOpen] = useState(false)
  const location = useLocation()

  // Global keyboard shortcuts
  useShortcuts()

  return (
    <div className="flex h-screen w-full bg-[var(--bg-subtle)] text-[var(--text-primary)] overflow-hidden font-sans">
      
      {/* Sidebar - Desktop is persistent, Mobile is drawer */}
      <AppSidebar 
        isOpen={sidebarOpen} 
        onClose={() => setSidebarOpen(false)} 
      />

      <div className="flex flex-1 flex-col min-w-0 overflow-hidden relative p-2 md:p-3">
        {/* Curvy Main Content Area */}
        <div className="flex flex-1 flex-col bg-[var(--bg-base)] rounded-[var(--radius-xl)] shadow-sm border border-[var(--color-border-subtle)] overflow-hidden relative">
          
          {/* Persistent Topbar */}
          <AppTopbar onMenuClick={() => setSidebarOpen(true)} />

          {/* Dynamic Page Content */}
          <main className="flex-1 overflow-y-auto overflow-x-hidden relative custom-scrollbar">
            <AnimatePresence mode="wait">
              <motion.div
                key={location.pathname}
                initial={{ opacity: 0, y: 10, scale: 0.99 }}
                animate={{ opacity: 1, y: 0, scale: 1 }}
                exit={{ opacity: 0, y: -10, scale: 0.99 }}
                transition={{ duration: 0.25, ease: [0.16, 1, 0.3, 1] }}
                className="w-full h-full p-6 md:p-10"
              >
                <Outlet />
              </motion.div>
            </AnimatePresence>
          </main>
        </div>
      </div>
    </div>
  )
}
