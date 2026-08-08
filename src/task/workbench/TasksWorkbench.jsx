import React, { useState, useEffect, useCallback } from 'react'
import { motion, AnimatePresence } from 'framer-motion'
import { TasksSidebar } from './TasksSidebar'
import { TasksWorkspace } from './TasksWorkspace'
import { TaskContextPanel } from './TaskContextPanel'

const STORAGE_KEY = 'ryokai_workbench'
const LARGE_BP = 1440   // >=1440: rail + sidebar + workspace + panel (inline)
const MEDIUM_BP = 1024  // 1024-1439: rail + sidebar + workspace, panel -> overlay
const TABLET_BP = 768   // 768-1023: rail + workspace, sidebar -> drawer, panel -> overlay

function load(k) { try { const r = localStorage.getItem(`${STORAGE_KEY}_${k}`); return r ? JSON.parse(r) : null } catch { return null } }
function save(k, v) { try { localStorage.setItem(`${STORAGE_KEY}_${k}`, JSON.stringify(v)) } catch { /* storage unavailable */ } }

function getBreakpoints(width) {
  return {
    large: width >= LARGE_BP,
    medium: width >= MEDIUM_BP && width < LARGE_BP,
    tablet: width >= TABLET_BP && width < MEDIUM_BP,
    mobile: width < TABLET_BP,
  }
}

/**
 * TasksWorkbench — Premium responsive command center
 *
 *   LARGE  (≥1440) rail | sidebar | workspace | panel      — all inline
 *   MEDIUM (1024+) rail | sidebar | workspace              — panel becomes overlay
 *   TABLET (768+)  rail | workspace                       — sidebar becomes drawer, panel overlay
 *   MOBILE (<768)  workspace                              — sidebar drawer, panel full-screen
 *
 * Composition changes at breakpoints; panes never just shrink.
 */
export function TasksWorkbench({
  tasks, isLoading, isError, error, onRetry,
  selectedTask, onTaskSelect, onTaskClose,
  activeView, onViewChange,
  onTaskStatusChange, onQuickComplete, onQuickDelete,
  rowSelection, setRowSelection, user,
  workspaceFooter,
  searchActive, filtersActive, onClearFilters, onCreateTask,
  taskScope, onScopeChange,
  globalFilter, setGlobalFilter,
  priorityFilter, onPriorityFilterChange,
  sortBy, onSortChange,
  projectFilter, onProjectFilterChange,
  teamFilter, onTeamFilterChange,
  projectsList, teamsList,
}) {
  const [sidebarCollapsed, setSidebarCollapsed] = useState(() => load('sidebarCollapsed') ?? false)
  const [sidebarWidth, setSidebarWidth] = useState(() => load('sidebarWidth') ?? 220)
  const [panelWidth, setPanelWidth] = useState(() => load('panelWidth') ?? 440)
  const [drawerOpen, setDrawerOpen] = useState(false)
  const [width, setWidth] = useState(() => typeof window !== 'undefined' ? window.innerWidth : 1440)

  useEffect(() => { save('sidebarCollapsed', sidebarCollapsed) }, [sidebarCollapsed])
  useEffect(() => { save('sidebarWidth', sidebarWidth) }, [sidebarWidth])
  useEffect(() => { save('panelWidth', panelWidth) }, [panelWidth])

  useEffect(() => {
    const check = () => setWidth(window.innerWidth)
    window.addEventListener('resize', check)
    return () => window.removeEventListener('resize', check)
  }, [])

  const bp = getBreakpoints(width)

  // Sidebar inline on large+medium; drawer on tablet+mobile
  const sidebarInline = bp.large || bp.medium
  // Panel inline only on large; overlay on medium+tablet; full-screen on mobile (handled in TaskContextPanel)
  const panelInline = bp.large
  const panelOverlay = bp.medium || bp.tablet

  // Close drawer when crossing into inline territory
  useEffect(() => {
    // Intentionally sync drawer to the layout breakpoint; this is a layout
    // state adjustment, not a render-triggered update cycle.
    // eslint-disable-next-line react-hooks/set-state-in-effect
    if (sidebarInline && drawerOpen) setDrawerOpen(false)
  }, [sidebarInline, drawerOpen])

  // Auto-collapse sidebar when a task opens at medium (preserve workspace width)
  const effectiveCollapsed = sidebarCollapsed || (bp.medium && !!selectedTask)

  const handleSidebarDrag = useCallback((e) => {
    e.preventDefault()
    const startX = e.clientX
    const startW = sidebarCollapsed ? 48 : sidebarWidth
    document.body.style.cursor = 'col-resize'
    document.body.style.userSelect = 'none'
    const move = (me) => setSidebarWidth(Math.min(360, Math.max(160, startW + (me.clientX - startX))))
    const up = () => {
      document.body.style.cursor = ''; document.body.style.userSelect = ''
      window.removeEventListener('mousemove', move); window.removeEventListener('mouseup', up)
    }
    window.addEventListener('mousemove', move); window.addEventListener('mouseup', up)
  }, [sidebarCollapsed, sidebarWidth])

  const toggleSidebar = useCallback(() => setSidebarCollapsed(p => !p), [])
  const openDrawer = useCallback(() => setDrawerOpen(true), [])
  const closeDrawer = useCallback(() => setDrawerOpen(false), [])

  const sidebarProps = {
    tasks,
    activeView,
    onViewChange,
    selectedTaskId: selectedTask?.id,
    onTaskSelect,
    taskScope,
    onScopeChange,
  }

  return (
    <motion.div
      initial={{ opacity: 0 }}
      animate={{ opacity: 1 }}
      transition={{ duration: 0.2 }}
      className="flex flex-1 min-h-0 w-full overflow-hidden relative"
    >
      {/* ═══ LARGE / MEDIUM: Inline Sidebar ═══ */}
      {sidebarInline && (
        <>
          <div className="shrink-0 relative z-20" style={{ width: effectiveCollapsed ? 48 : sidebarWidth }}>
            <TasksSidebar
              {...sidebarProps}
              collapsed={effectiveCollapsed}
              onToggleCollapse={toggleSidebar}
            />
          </div>
          {!effectiveCollapsed && (
            <div
              onMouseDown={handleSidebarDrag}
              onDoubleClick={() => setSidebarWidth(220)}
              className="w-[3px] shrink-0 cursor-col-resize hover:bg-[var(--accent)]/40 transition-colors z-20"
            />
          )}
        </>
      )}

      {/* ═══ TABLET / MOBILE: Sidebar Drawer ═══ */}
      {!sidebarInline && (
        <AnimatePresence>
          {drawerOpen && (
            <>
              <motion.div
                initial={{ opacity: 0 }}
                animate={{ opacity: 1 }}
                exit={{ opacity: 0 }}
                transition={{ duration: 0.15 }}
                onClick={closeDrawer}
                className="absolute inset-0 z-30 bg-black/40"
              />
              <motion.div
                initial={{ x: -280 }}
                animate={{ x: 0 }}
                exit={{ x: -280 }}
                transition={{ type: 'spring', stiffness: 380, damping: 34 }}
                className="absolute top-0 left-0 bottom-0 z-40 w-[260px] max-w-[85vw] shadow-2xl"
              >
                <TasksSidebar
                  {...sidebarProps}
                  collapsed={false}
                  onToggleCollapse={closeDrawer}
                  onNavigate={closeDrawer}
                />
              </motion.div>
            </>
          )}
        </AnimatePresence>
      )}

      {/* ═══ CENTER: Main Workspace ═══ */}
      <div className="flex-1 flex flex-col min-w-0 overflow-hidden bg-[var(--bg-base)]/60">
        <div className="flex-1 overflow-hidden">
          <TasksWorkspace
            tasks={tasks}
            isLoading={isLoading}
            isError={isError}
            error={error}
            onRetry={onRetry}
            activeView={activeView}
            onTaskClick={onTaskSelect}
            onTaskStatusChange={onTaskStatusChange}
            onQuickComplete={onQuickComplete}
            onQuickDelete={onQuickDelete}
            rowSelection={rowSelection}
            setRowSelection={setRowSelection}
            searchActive={searchActive}
            filtersActive={filtersActive}
            onClearFilters={onClearFilters}
            onCreateTask={onCreateTask}
            selectedTask={selectedTask}
            globalFilter={globalFilter}
            setGlobalFilter={setGlobalFilter}
            priorityFilter={priorityFilter}
            onPriorityFilterChange={onPriorityFilterChange}
            sortBy={sortBy}
            onSortChange={onSortChange}
            projectFilter={projectFilter}
            onProjectFilterChange={onProjectFilterChange}
            teamFilter={teamFilter}
            onTeamFilterChange={onTeamFilterChange}
            projectsList={projectsList}
            teamsList={teamsList}
            showSidebarToggle={!sidebarInline}
            onSidebarToggle={openDrawer}
            isPanelOverlay={panelOverlay || bp.mobile}
          />
        </div>

        {workspaceFooter && (
          <div className="absolute bottom-0 left-0 right-0 pointer-events-none z-30">
            <div className="pointer-events-auto">{workspaceFooter}</div>
          </div>
        )}
      </div>

      {/* ═══ RIGHT: Task Panel ═══ */}
      {panelInline && (
        <TaskContextPanel
          task={selectedTask}
          isOpen={!!selectedTask}
          onClose={onTaskClose}
          width={panelWidth}
          onWidthChange={setPanelWidth}
          isLoading={false}
        />
      )}

      {/* Overlay mode (medium + tablet): panel floats over workspace */}
      {panelOverlay && (
        <AnimatePresence>
          {selectedTask && (
            <>
              <motion.div
                initial={{ opacity: 0 }}
                animate={{ opacity: 1 }}
                exit={{ opacity: 0 }}
                transition={{ duration: 0.15 }}
                onClick={onTaskClose}
                className="absolute inset-0 z-30 bg-black/30"
              />
              <motion.div
                key="panel-overlay"
                initial={{ x: '100%' }}
                animate={{ x: 0 }}
                exit={{ x: '100%' }}
                transition={{ type: 'spring', stiffness: 380, damping: 34 }}
                className="absolute top-0 right-0 bottom-0 z-40 shadow-2xl"
                style={{ width: Math.min(panelWidth, width - 280) }}
              >
                <TaskContextPanel
                  task={selectedTask}
                  isOpen={true}
                  onClose={onTaskClose}
                  width={Math.min(panelWidth, width - 280)}
                  onWidthChange={setPanelWidth}
                  isLoading={false}
                />
              </motion.div>
            </>
          )}
        </AnimatePresence>
      )}

      {/* Mobile: TaskContextPanel handles its own full-screen internally */}
      {bp.mobile && (
        <TaskContextPanel
          task={selectedTask}
          isOpen={!!selectedTask}
          onClose={onTaskClose}
          width={panelWidth}
          onWidthChange={setPanelWidth}
          isLoading={false}
        />
      )}
    </motion.div>
  )
}

export { TasksSidebar } from './TasksSidebar'
export { TasksWorkspace } from './TasksWorkspace'
export { TaskContextPanel } from './TaskContextPanel'
