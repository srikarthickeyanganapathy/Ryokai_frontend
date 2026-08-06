import React, { useState, useCallback, useRef, useEffect, createContext, useContext } from 'react'
import { motion, AnimatePresence } from 'framer-motion'
import { cn } from '@/shared/lib/cn'
import { Icons } from '@/shared/ui/Icons'

/* ─── IDE Layout Context ─── */
const IDELayoutContext = createContext({})

export function useIDELayout() {
  return useContext(IDELayoutContext)
}

function loadLayoutState(key) {
  try {
    const raw = localStorage.getItem(`ryokai_ide_${key}`)
    return raw ? JSON.parse(raw) : null
  } catch { return null }
}

function saveLayoutState(key, state) {
  try { localStorage.setItem(`ryokai_ide_${key}`, JSON.stringify(state)) } catch {}
}

export function IDELayout({ children, storageKey = 'default', className, forceRightPanelOpen, forceBottomPanelOpen }) {
  const saved = loadLayoutState(storageKey)

  const [rightPanelOpen, setRightPanelOpen] = useState(saved?.rightPanelOpen ?? false)
  const [rightPanelWidth, setRightPanelWidth] = useState(saved?.rightPanelWidth ?? 420)
  const [rightMaximized, setRightMaximized] = useState(false)
  const [bottomPanelOpen, setBottomPanelOpen] = useState(saved?.bottomPanelOpen ?? false)
  const [bottomPanelHeight, setBottomPanelHeight] = useState(saved?.bottomPanelHeight ?? 260)
  const [bottomMaximized, setBottomMaximized] = useState(false)
  const [bottomActiveTab, setBottomActiveTab] = useState(saved?.bottomActiveTab ?? 'comments')

  // Auto-open panels when forced by parent
  useEffect(() => {
    if (forceRightPanelOpen) setRightPanelOpen(true)
  }, [forceRightPanelOpen])

  useEffect(() => {
    if (forceBottomPanelOpen) {
      setBottomPanelOpen(true)
      setBottomMaximized(false)
    }
  }, [forceBottomPanelOpen])

  // Persist state
  useEffect(() => {
    saveLayoutState(storageKey, {
      rightPanelWidth, bottomPanelHeight, bottomActiveTab
    })
  }, [storageKey, rightPanelWidth, bottomPanelHeight, bottomActiveTab])

  // Keyboard shortcuts
  useEffect(() => {
    const handler = (e) => {
      if ((e.metaKey || e.ctrlKey) && e.key === 'j') {
        e.preventDefault()
        setBottomPanelOpen(prev => !prev)
        setBottomMaximized(false)
      }
      if ((e.metaKey || e.ctrlKey) && (e.key === 'b' || e.key === 'B')) {
        e.preventDefault()
        setRightPanelOpen(prev => !prev)
      }
    }
    window.addEventListener('keydown', handler)
    return () => window.removeEventListener('keydown', handler)
  }, [])

  const toggleRightPanel = useCallback(() => {
    setRightPanelOpen(prev => !prev)
    setRightMaximized(false)
  }, [])
  const toggleBottomPanel = useCallback(() => {
    setBottomPanelOpen(prev => !prev)
    setBottomMaximized(false)
  }, [])
  const toggleRightMaximize = useCallback(() => setRightMaximized(prev => !prev), [])
  const toggleBottomMaximize = useCallback(() => setBottomMaximized(prev => !prev), [])

  const contextValue = {
    rightPanelOpen, setRightPanelOpen, toggleRightPanel,
    rightPanelWidth, setRightPanelWidth, rightMaximized, toggleRightMaximize,
    bottomPanelOpen, setBottomPanelOpen, toggleBottomPanel,
    bottomPanelHeight, setBottomPanelHeight, bottomMaximized, toggleBottomMaximize,
    bottomActiveTab, setBottomActiveTab,
  }

  // Find child components
  const childrenArr = React.Children.toArray(children)
  const editorChild = childrenArr.find(c => c.type?.displayName === 'IDEEditor')
  const rightPanelChild = childrenArr.find(c => c.type?.displayName === 'IDERightPanel')
  const bottomPanelChild = childrenArr.find(c => c.type?.displayName === 'IDEBottomPanel')

  // Effective right panel width
  const effectiveRightWidth = rightMaximized ? '100%' : rightPanelWidth

  return (
    <IDELayoutContext.Provider value={contextValue}>
      <div className={cn('flex flex-col flex-1 min-h-0 overflow-hidden bg-[var(--bg-base)]', className)}>

        {/* Top area: Editor + Right Panel */}
        <div className="flex flex-1 min-h-0 overflow-hidden relative">
          {/* Editor */}
          {(!rightMaximized || !rightPanelOpen) && (
            <div className="flex-1 min-w-0 overflow-auto">
              {editorChild}
            </div>
          )}

          {/* Vertical divider + Right panel */}
          <AnimatePresence>
            {rightPanelOpen && rightPanelChild && (
              <>
                <VerticalDivider
                  onResize={setRightPanelWidth}
                  minSize={320}
                  maxSize={800}
                  currentSize={rightPanelWidth}
                  onDoubleClick={toggleRightPanel}
                />
                <motion.div
                  initial={{ width: 0, opacity: 0 }}
                  animate={{ width: rightMaximized ? 'calc(100% - 4px)' : rightPanelWidth, opacity: 1 }}
                  exit={{ width: 0, opacity: 0 }}
                  transition={{ type: 'spring', stiffness: 280, damping: 26, mass: 0.8 }}
                  className="shrink-0 overflow-hidden border-l border-[var(--color-border-subtle)] bg-[var(--bg-elevated)] flex flex-col"
                >
                  {/* Panel header bar */}
                  <div className="flex items-center justify-between h-8 px-3 bg-[var(--bg-subtle)] border-b border-[var(--color-border-subtle)] shrink-0">
                    <span className="text-[10px] uppercase tracking-wider font-semibold text-[var(--text-muted)]">Details</span>
                    <div className="flex items-center gap-0.5">
                      <PanelButton
                        onClick={toggleRightMaximize}
                        icon={<Icons.maximize className="w-3 h-3" />}
                        active={rightMaximized}
                        tooltip={rightMaximized ? 'Restore panel size' : 'Maximize panel'}
                      />
                      <PanelButton
                        onClick={toggleRightPanel}
                        icon={<Icons.x className="w-3 h-3" />}
                        tooltip="Close panel"
                      />
                    </div>
                  </div>
                  <div className="flex-1 overflow-hidden">
                    {rightPanelChild}
                  </div>
                </motion.div>
              </>
            )}
          </AnimatePresence>
        </div>

        {/* Horizontal divider + Bottom panel */}
        {bottomPanelChild && (
          <AnimatePresence>
            {bottomPanelOpen && (
              <>
                <HorizontalDivider
                  onResize={setBottomPanelHeight}
                  minSize={140}
                  maxSize={500}
                  currentSize={bottomPanelHeight}
                  onDoubleClick={toggleBottomPanel}
                />
                <motion.div
                  initial={{ height: 0, opacity: 0 }}
                  animate={{ height: bottomMaximized ? 'calc(100% - 100px)' : bottomPanelHeight, opacity: 1 }}
                  exit={{ height: 0, opacity: 0 }}
                  transition={{ type: 'spring', stiffness: 280, damping: 26, mass: 0.8 }}
                  className="shrink-0 overflow-hidden border-t border-[var(--color-border-subtle)] bg-[var(--bg-elevated)] flex flex-col"
                >
                  {/* Bottom panel header with tabs + controls */}
                  <div className="flex items-center justify-between bg-[var(--bg-subtle)]/50 border-b border-[var(--color-border-subtle)] shrink-0 h-8">
                    <BottomTabs
                      tabs={bottomPanelChild.props.tabs || []}
                      activeTab={bottomActiveTab}
                      onTabChange={setBottomActiveTab}
                    />
                    <div className="flex items-center gap-0.5 pr-1">
                      <PanelButton
                        onClick={toggleBottomMaximize}
                        icon={<Icons.maximize className="w-3 h-3" />}
                        active={bottomMaximized}
                        tooltip={bottomMaximized ? 'Restore panel' : 'Maximize panel'}
                      />
                      <PanelButton
                        onClick={toggleBottomPanel}
                        icon={<Icons.x className="w-3 h-3" />}
                        tooltip="Close panel (⌘J)"
                      />
                    </div>
                  </div>
                  <div className="flex-1 overflow-hidden">
                    {React.cloneElement(bottomPanelChild, {
                      activeTab: bottomActiveTab,
                      onTabChange: setBottomActiveTab,
                    })}
                  </div>
                </motion.div>
              </>
            )}
          </AnimatePresence>
        )}

        {/* Status bar */}
        <StatusBar />
      </div>
    </IDELayoutContext.Provider>
  )
}

/* ─── Sub-components ─── */
IDELayout.Editor = function IDEEditor({ children }) {
  return <>{children}</>
}
IDELayout.Editor.displayName = 'IDEEditor'

IDELayout.RightPanel = function IDERightPanel({ children }) {
  return <>{children}</>
}
IDELayout.RightPanel.displayName = 'IDERightPanel'

IDELayout.BottomPanel = function IDEBottomPanel({ children, tabs, activeTab, onTabChange }) {
  return (
    <div className="flex-1 overflow-y-auto custom-scrollbar">
      <AnimatePresence mode="wait">
        {React.Children.map(children, (child, idx) => {
          const tab = tabs?.[idx]
          if (!tab || tab.id !== activeTab) return null
          return (
            <motion.div
              key={tab.id}
              initial={{ opacity: 0 }}
              animate={{ opacity: 1 }}
              exit={{ opacity: 0 }}
              transition={{ duration: 0.12 }}
            >
              {child}
            </motion.div>
          )
        })}
      </AnimatePresence>
    </div>
  )
}
IDELayout.BottomPanel.displayName = 'IDEBottomPanel'

/* ─── Bottom Panel Tabs ─── */
function BottomTabs({ tabs, activeTab, onTabChange }) {
  if (!tabs?.length) return null
  return (
    <div className="flex items-center h-full">
      {tabs.map(tab => {
        const isActive = activeTab === tab.id
        return (
          <motion.button
            key={tab.id}
            onClick={() => onTabChange?.(tab.id)}
            whileHover={{ backgroundColor: 'var(--bg-elevated)' }}
            whileTap={{ scale: 0.97 }}
            className={cn(
              'relative flex items-center gap-1.5 px-3 py-1.5 text-[11px] font-medium transition-colors h-full',
              isActive
                ? 'text-[var(--text-primary)] bg-[var(--bg-elevated)]'
                : 'text-[var(--text-muted)] hover:text-[var(--text-secondary)]'
            )}
          >
            {tab.icon && <tab.icon className="w-3 h-3" />}
            <span>{tab.label}</span>
            {tab.count > 0 && (
              <span className={cn(
                'text-[9px] px-1.5 py-px rounded-full tabular-nums',
                isActive
                  ? 'bg-[var(--accent)] text-white'
                  : 'bg-[var(--bg-subtle)] text-[var(--text-muted)]'
              )}>
                {tab.count}
              </span>
            )}
            {isActive && (
              <motion.div
                layoutId="ide-bottom-tab-indicator"
                className="absolute top-0 left-2 right-2 h-[1.5px] bg-[var(--accent)] rounded-full"
                transition={{ type: 'spring', stiffness: 500, damping: 30 }}
              />
            )}
          </motion.button>
        )
      })}
    </div>
  )
}

/* ─── Panel Action Button ─── */
function PanelButton({ onClick, icon, active, tooltip }) {
  return (
    <motion.button
      whileHover={{ backgroundColor: 'var(--bg-hover)' }}
      whileTap={{ scale: 0.9 }}
      onClick={onClick}
      title={tooltip}
      className={cn(
        'p-1 rounded text-[11px] transition-colors',
        active ? 'text-[var(--accent)] bg-[var(--accent-soft)]' : 'text-[var(--text-muted)] hover:text-[var(--text-primary)]'
      )}
    >
      {icon}
    </motion.button>
  )
}

/* ─── Status Bar ─── */
function StatusBar() {
  const {
    rightPanelOpen, toggleRightPanel,
    bottomPanelOpen, toggleBottomPanel,
    rightMaximized, bottomMaximized, toggleRightMaximize, toggleBottomMaximize,
  } = useIDELayout()

  return (
    <div className="flex items-center justify-between h-6 px-3 bg-[var(--accent)] text-white text-[10px] font-medium select-none shrink-0 gap-4">
      <div className="flex items-center gap-4">
        <span className="opacity-90 tracking-wide">Ryokai Work OS</span>
        <span className="opacity-50 text-[9px]">Tasks Engine</span>
      </div>
      <div className="flex items-center gap-0.5">
        <StatusBarChip
          label="Panel"
          shortcut="⌘J"
          active={bottomPanelOpen}
          onClick={toggleBottomPanel}
        />
        <StatusBarChip
          label="Details"
          shortcut="⌘B"
          active={rightPanelOpen}
          onClick={toggleRightPanel}
        />
      </div>
    </div>
  )
}

function StatusBarChip({ label, shortcut, active, onClick }) {
  return (
    <motion.button
      whileHover={{ backgroundColor: 'rgba(255,255,255,0.15)' }}
      whileTap={{ scale: 0.95 }}
      onClick={onClick}
      className={cn(
        'px-2 py-0.5 rounded text-[9px] transition-colors flex items-center gap-1.5',
        active ? 'bg-white/20' : 'hover:bg-white/10 opacity-70'
      )}
    >
      <span className="opacity-60 font-mono text-[8px]">{shortcut}</span>
      <span>{label}</span>
    </motion.button>
  )
}

/* ─── Divider Components ─── */
function VerticalDivider({ onResize, minSize = 200, maxSize = 800, currentSize, onDoubleClick }) {
  const isDragging = useRef(false)
  const startX = useRef(0)
  const startSize = useRef(0)

  const handleMouseDown = useCallback((e) => {
    e.preventDefault()
    isDragging.current = true
    startX.current = e.clientX
    startSize.current = currentSize
    document.body.style.cursor = 'col-resize'
    document.body.style.userSelect = 'none'

    const handleMouseMove = (moveEvent) => {
      if (!isDragging.current) return
      const delta = startX.current - moveEvent.clientX
      onResize(Math.min(maxSize, Math.max(minSize, startSize.current + delta)))
    }
    const handleMouseUp = () => {
      isDragging.current = false
      document.body.style.cursor = ''
      document.body.style.userSelect = ''
      window.removeEventListener('mousemove', handleMouseMove)
      window.removeEventListener('mouseup', handleMouseUp)
    }
    window.addEventListener('mousemove', handleMouseMove)
    window.addEventListener('mouseup', handleMouseUp)
  }, [currentSize, onResize, minSize, maxSize])

  return (
    <div
      onMouseDown={handleMouseDown}
      onDoubleClick={onDoubleClick}
      className="w-[3px] bg-transparent hover:bg-[var(--accent)]/30 cursor-col-resize shrink-0 transition-colors relative group"
      title="Drag to resize · Double-click to close"
    >
      <div className="absolute inset-y-0 -left-1 -right-1" />
    </div>
  )
}

function HorizontalDivider({ onResize, minSize = 100, maxSize = 600, currentSize, onDoubleClick }) {
  const isDragging = useRef(false)
  const startY = useRef(0)
  const startSize = useRef(0)

  const handleMouseDown = useCallback((e) => {
    e.preventDefault()
    isDragging.current = true
    startY.current = e.clientY
    startSize.current = currentSize
    document.body.style.cursor = 'row-resize'
    document.body.style.userSelect = 'none'

    const handleMouseMove = (moveEvent) => {
      if (!isDragging.current) return
      const delta = startY.current - moveEvent.clientY
      onResize(Math.min(maxSize, Math.max(minSize, startSize.current + delta)))
    }
    const handleMouseUp = () => {
      isDragging.current = false
      document.body.style.cursor = ''
      document.body.style.userSelect = ''
      window.removeEventListener('mousemove', handleMouseMove)
      window.removeEventListener('mouseup', handleMouseUp)
    }
    window.addEventListener('mousemove', handleMouseMove)
    window.addEventListener('mouseup', handleMouseUp)
  }, [currentSize, onResize, minSize, maxSize])

  return (
    <div
      onMouseDown={handleMouseDown}
      onDoubleClick={onDoubleClick}
      className="h-[3px] bg-transparent hover:bg-[var(--accent)]/30 cursor-row-resize shrink-0 transition-colors relative group"
      title="Drag to resize · Double-click to close"
    >
      <div className="absolute inset-x-0 -top-1 -bottom-1" />
    </div>
  )
}
