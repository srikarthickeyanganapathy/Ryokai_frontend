import React from 'react'
import { Outlet, useLocation } from 'react-router-dom'
import { motion, AnimatePresence } from 'framer-motion'
import { PlatformSidebar } from '@/platform/admin/components/platform/PlatformSidebar'
import { AppTopbar } from '@/platform/workspace'

export function PlatformLayout() {
  const location = useLocation()

  return (
    <div className="flex h-screen overflow-hidden bg-[var(--bg-base)] text-[var(--text-primary)] font-sans">
      {/* Control Plane Navigation */}
      <PlatformSidebar className="hidden md:flex" />

      {/* Main Content Area */}
      <div className="flex-1 flex flex-col min-w-0 relative h-full bg-[var(--bg-subtle)] p-2 md:p-3">
        <div className="flex flex-1 flex-col bg-[var(--bg-base)] rounded-[var(--radius-xl)] shadow-sm border border-[var(--color-border-subtle)] overflow-hidden relative">
          <AppTopbar onMenuClick={() => {}} />
          
          <main className="flex-1 overflow-y-auto overflow-x-hidden relative custom-scrollbar">
            <AnimatePresence mode="popLayout">
              <motion.div
                key={location.pathname}
                initial={{ opacity: 0, y: 10, scale: 0.99 }}
                animate={{ opacity: 1, y: 0, scale: 1 }}
                exit={{ opacity: 0, y: -10, scale: 0.99 }}
                transition={{ duration: 0.25, ease: [0.16, 1, 0.3, 1] }}
                className="w-full h-full"
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

