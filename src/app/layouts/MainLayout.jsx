import React, { useState } from 'react'
import { Outlet, useLocation } from 'react-router-dom'
import { motion, AnimatePresence } from 'framer-motion'
import { AppSidebar, AppTopbar, GlobalCommandPalette } from '@/platform/workspace'
import { WorkspaceInspector } from "@/shared/workspace-framework/interactions/inspector/WorkspaceInspector"
import { useShortcuts } from "@/shared/hooks/useShortcuts"
import { CosmicBackground } from '@/shared/ui/CosmicBackground'
import {
  DrawerProvider,
  DrawerOutlet,
  MemberProfileDrawer,
  TaskDrawer,
  ProjectDrawer,
  TeamDrawer,
} from '@/shared/workspace-framework'
import { SignalDrawer } from '@/dashboard'

/** Registry of contextual drawers keyed by drawer ID. */
const DRAWER_REGISTRY = {
  member: MemberProfileDrawer,
  task: TaskDrawer,
  project: ProjectDrawer,
  team: TeamDrawer,
  signal: SignalDrawer,
}

export function MainLayout() {
  const [sidebarOpen, setSidebarOpen] = useState(false)
  const location = useLocation()

  // Global keyboard shortcuts
  useShortcuts()

  return (
    <div className="flex h-screen w-full bg-[var(--bg-subtle)] text-[var(--text-primary)] overflow-hidden font-sans relative">
      
      {/* Cosmic ambient particles — Ryokai signature atmosphere */}
      <CosmicBackground variant="full" opacity={0.25} />
      
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
          <DrawerProvider>
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

            {/* Contextual Drawer Outlet (Member, Task, Project, Team) */}
            <DrawerOutlet drawers={DRAWER_REGISTRY} />
          </DrawerProvider>
        </div>
      </div>
      
      {/* Global Command Palette & Inspector */}
      <GlobalCommandPalette />
      <WorkspaceInspector />
    </div>
  )
}
