import React, { createContext, useContext, useState, useCallback } from 'react'
import { AnimatePresence, motion } from 'framer-motion'
import { cn } from '@/shared/lib/cn'

/**
 * DrawerManager
 * ─────────────────────────────────────────────────────────
 * Centralized presentation controller for contextual workspace drawers.
 *
 * Manages ONLY the open/close lifecycle and animation of drawers.
 * Does NOT fetch data — the opening page provides all data via payload.
 *
 * Drawer Contract:
 *   open(drawerId, payload) — Open a drawer with data
 *   close()                 — Close the active drawer
 *   isOpen                  — Boolean open state
 *   activeDrawer            — Current drawer ID
 *   payload                 — Data passed to the drawer
 *
 * Scope: Contextual workspace drawers only (Member, Task, Project, Team).
 * NOT for: Delete confirmations, date pickers, simple form modals.
 */

const DrawerContext = createContext(null)

export function DrawerProvider({ children }) {
  const [activeDrawer, setActiveDrawer] = useState(null)
  const [payload, setPayload] = useState(null)

  const open = useCallback((drawerId, data = null) => {
    setActiveDrawer(drawerId)
    setPayload(data)
  }, [])

  const close = useCallback(() => {
    setActiveDrawer(null)
    setPayload(null)
  }, [])

  const value = {
    isOpen: !!activeDrawer,
    activeDrawer,
    payload,
    open,
    close,
  }

  return (
    <DrawerContext.Provider value={value}>
      {children}
    </DrawerContext.Provider>
  )
}

export function useDrawerManager() {
  const ctx = useContext(DrawerContext)
  if (!ctx) {
    throw new Error('useDrawerManager must be used within a DrawerProvider')
  }
  return ctx
}

/**
 * DrawerOutlet
 * ─────────────────────────────────────────────────────────
 * Place this once in your layout. It renders the currently active drawer.
 * Accepts a registry of drawer components keyed by drawer ID.
 *
 * @param {Object<string, React.Component>} drawers — { memberId: MemberDrawer, ... }
 *
 * Usage:
 *   <DrawerOutlet drawers={{
 *     member: MemberProfileDrawer,
 *     task: TaskDrawer,
 *     project: ProjectDrawer,
 *     team: TeamDrawer,
 *   }} />
 */
export function DrawerOutlet({ drawers = {} }) {
  const { isOpen, activeDrawer, payload, close } = useDrawerManager()
  const DrawerComponent = activeDrawer ? drawers[activeDrawer] : null

  return (
    <AnimatePresence>
      {isOpen && DrawerComponent && (
        <>
          {/* Overlay */}
          <motion.div
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            exit={{ opacity: 0 }}
            transition={{ duration: 0.2 }}
            onClick={close}
            className="fixed inset-0 z-40 bg-[var(--bg-overlay)] backdrop-blur-[2px]"
          />

          {/* Drawer Panel */}
          <motion.aside
            initial={{ x: '100%' }}
            animate={{ x: 0 }}
            exit={{ x: '100%' }}
            transition={{ type: 'spring', damping: 28, stiffness: 300 }}
            className={cn(
              'fixed inset-y-0 right-0 z-50 w-full sm:w-[420px] lg:w-[480px]',
              'bg-[var(--bg-elevated)] border-l border-[var(--border-subtle)]',
              'shadow-[var(--shadow-lg)] overflow-y-auto custom-scrollbar'
            )}
          >
            {/* Close button */}
            <button
              onClick={close}
              className="absolute right-4 top-4 p-1.5 rounded-[var(--radius-sm)] text-[var(--text-tertiary)] hover:text-[var(--text-primary)] hover:bg-[var(--bg-hover)] transition-colors z-10"
            >
              <svg className="w-4 h-4" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={2}>
                <path strokeLinecap="round" strokeLinejoin="round" d="M6 18L18 6M6 6l12 12" />
              </svg>
            </button>

            <DrawerComponent data={payload} onClose={close} />
          </motion.aside>
        </>
      )}
    </AnimatePresence>
  )
}
