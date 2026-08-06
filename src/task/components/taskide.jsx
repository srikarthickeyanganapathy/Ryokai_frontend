import React, { useState, useCallback, useRef, useEffect, useMemo } from 'react'
import { motion, AnimatePresence } from 'framer-motion'
import { cn } from '@/shared/lib/cn'
import { Icons } from '@/shared/ui/Icons'
import { Badge } from '@/shared/ui/Badge'

/* ─── Persistence ─── */
function load(key) { try { const r = localStorage.getItem(`ryokai_ide_${key}`); return r ? JSON.parse(r) : null } catch { return null } }
function save(key, s) { try { localStorage.setItem(`ryokai_ide_${key}`, JSON.stringify(s)) } catch {} }

/* ─── Drag Handle ─── */
function DragH({ vert, size, setSize, min, max, onDoubleClick }) {
  const drag = useRef(false), s = useRef(0), start = useRef(0)
  const down = useCallback((e) => {
    e.preventDefault(); drag.current = true
    start.current = vert ? e.clientX : e.clientY
    s.current = size
    document.body.style.cursor = vert ? 'col-resize' : 'row-resize'
    document.body.style.userSelect = 'none'
    const move = (me) => { if (!drag.current) return; const d = start.current - (vert ? me.clientX : me.clientY); setSize(Math.min(max, Math.max(min, s.current + d))) }
    const up = () => { drag.current = false; document.body.style.cursor = ''; document.body.style.userSelect = ''; window.removeEventListener('mousemove', move); window.removeEventListener('mouseup', up) }
    window.addEventListener('mousemove', move); window.addEventListener('mouseup', up)
  }, [vert, size, setSize, min, max])
  return <div onMouseDown={down} onDoubleClick={onDoubleClick} className={cn('shrink-0 transition-colors hover:bg-[var(--accent)]/30 z-10', vert ? 'w-[3px] cursor-col-resize' : 'h-[3px] cursor-row-resize')} />
}

const STATUS_DOT = { 'Done': 'bg-emerald-400', 'In Review': 'bg-purple-400', 'In Progress': 'bg-amber-400', 'To Do': 'bg-blue-400' }
const STATUS_COLOR = { 'Done': '#10B981', 'In Review': '#8B5CF6', 'In Progress': '#F59E0B', 'To Do': '#3B82F6' }

/**
 * TaskIDE — Full workspace system (VS Code philosophy)
 *
 * Activity Bar → Explorer → Editor (tabs + content) → Inspector
 *                                          ↓
 *                                    Bottom Dock
 *
 * Everything resizable, collapsible, persistent.
 */
export function TaskIDE({
  tasks = [], selectedTask, onTaskSelect, onTaskClose, onUpdateTask,
  user, workspaceMode, viewMode = 'list', onViewModeChange,
  renderEditor, renderBoard, renderDock, storageKey = 'tasks-ide',
}) {
  const s = load(storageKey)
  const [expOpen, setExpOpen] = useState(s?.expOpen ?? true)
  const [expW, setExpW] = useState(s?.expW ?? 240)
  const [inspOpen, setInspOpen] = useState(s?.inspOpen ?? false)
  const [inspW, setInspW] = useState(s?.inspW ?? 280)
  const [dockOpen, setDockOpen] = useState(s?.dockOpen ?? false)
  const [dockH, setDockH] = useState(s?.dockH ?? 220)
  const [dockTab, setDockTab] = useState(s?.dockTab ?? 'comments')
  const [openTabs, setOpenTabs] = useState(s?.openTabs ?? [])
  const [activeTab, setActiveTab] = useState(s?.activeTab ?? null)
  const [collapsed, setCollapsed] = useState(s?.collapsed ?? {})
  const [paletteOpen, setPaletteOpen] = useState(false)
  const [recent, setRecent] = useState(s?.recent ?? [])

  // Persist
  useEffect(() => { save(storageKey, { expOpen, expW, inspOpen, inspW, dockOpen, dockH, dockTab, openTabs, activeTab, collapsed, recent }) },
    [storageKey, expOpen, expW, inspOpen, inspW, dockOpen, dockH, dockTab, openTabs, activeTab, collapsed, recent])

  // Keyboard shortcuts
  useEffect(() => {
    const h = (e) => {
      const m = e.metaKey || e.ctrlKey
      if (m && e.key === 'b') { e.preventDefault(); setExpOpen(p => !p) }
      if (m && e.key === 'j') { e.preventDefault(); setDockOpen(p => !p) }
      if (m && e.key === 'i') { e.preventDefault(); setInspOpen(p => !p) }
      if (m && e.key === 'k') { e.preventDefault(); setPaletteOpen(p => !p) }
      if (m && e.key === 'w' && activeTab) { e.preventDefault(); closeTab(activeTab) }
      if (e.key === 'Escape') { setPaletteOpen(false) }
    }
    window.addEventListener('keydown', h)
    return () => window.removeEventListener('keydown', h)
  }, [activeTab])

  // Sync tabs with selected task
  useEffect(() => {
    if (selectedTask) {
      if (!openTabs.includes(selectedTask.id)) setOpenTabs(p => [...p, selectedTask.id])
      setActiveTab(selectedTask.id)
      setRecent(p => [selectedTask.id, ...p.filter(id => id !== selectedTask.id)].slice(0, 8))
    }
  }, [selectedTask])

  const closeTab = useCallback((id) => {
    setOpenTabs(prev => {
      const idx = prev.indexOf(id)
      const next = prev.filter(t => t !== id)
      if (activeTab === id) {
        if (next.length > 0) {
          const nt = next[Math.max(0, idx - 1)]
          const task = tasks.find(t => t.id === nt)
          if (task) onTaskSelect(task)
        } else { onTaskClose() }
      }
      return next
    })
  }, [activeTab, tasks, onTaskSelect, onTaskClose])

  const activeTask = useMemo(() => tasks.find(t => t.id === activeTab) || selectedTask, [tasks, activeTab, selectedTask])

  // ─── Explorer groups ───
  const groups = useMemo(() => {
    const now = new Date()
    const todayStr = now.toDateString()
    const weekEnd = new Date(now.getTime() + 7 * 86400000)
    const isOverdue = (t) => t.dueDate && new Date(t.dueDate) < now && t.status !== 'Done'
    const isToday = (t) => t.dueDate && new Date(t.dueDate).toDateString() === todayStr
    const isWeek = (t) => { if (!t.dueDate) return false; const d = new Date(t.dueDate); return d > now && d <= weekEnd }
    const isActive = (t) => t.status !== 'Done' && !t.archived

    return [
      { id: 'overdue', label: 'Overdue', tasks: tasks.filter(t => isActive(t) && isOverdue(t)), color: 'text-red-400' },
      { id: 'today', label: 'Today', tasks: tasks.filter(t => isActive(t) && isToday(t)), color: 'text-amber-400' },
      { id: 'week', label: 'This Week', tasks: tasks.filter(t => isActive(t) && isWeek(t)), color: 'text-blue-400' },
      { id: 'mine', label: 'Assigned to Me', tasks: tasks.filter(t => isActive(t) && t.assignedTo === user?.username), color: 'text-[var(--accent)]' },
      { id: 'priority', label: 'High Priority', tasks: tasks.filter(t => isActive(t) && (t.priority === 'URGENT' || t.priority === 'HIGH')), color: 'text-orange-400' },
      { id: 'completed', label: 'Completed', tasks: tasks.filter(t => t.status === 'Done' && !t.archived), color: 'text-emerald-400' },
    ].filter(g => g.tasks.length > 0)
  }, [tasks, user])

  const toggleGroup = (id) => setCollapsed(p => ({ ...p, [id]: !p[id] }))

  // ─── Command palette data ───
  const paletteResults = useMemo(() => {
    if (!paletteOpen) return { tasks: [], actions: [] }
    return {
      tasks: tasks.slice(0, 10),
      actions: [
        { id: 'toggle-exp', label: 'Toggle Explorer', shortcut: '⌘B', run: () => setExpOpen(p => !p) },
        { id: 'toggle-insp', label: 'Toggle Inspector', shortcut: '⌘I', run: () => setInspOpen(p => !p) },
        { id: 'toggle-dock', label: 'Toggle Dock', shortcut: '⌘J', run: () => setDockOpen(p => !p) },
        { id: 'view-board', label: 'Switch to Board View', run: () => onViewModeChange?.('board') },
        { id: 'view-list', label: 'Switch to List View', run: () => onViewModeChange?.('list') },
      ]
    }
  }, [paletteOpen, tasks, onViewModeChange])

  return (
    <div className="flex h-full w-full overflow-hidden bg-[var(--bg-base)]">
      {/* ── Activity Bar ── */}
      <div className="w-12 shrink-0 flex flex-col items-center py-2 gap-1 bg-[var(--bg-elevated)] border-r border-[var(--color-border-subtle)]">
        <div className="w-7 h-7 rounded-lg bg-[var(--accent)] flex items-center justify-center mb-2">
          <span className="text-white text-[11px] font-bold">R</span>
        </div>
        <ActBtn icon={Icons.checkSquare} active={expOpen} onClick={() => setExpOpen(p => !p)} label="Explorer" shortcut="⌘B" />
        <ActBtn icon={Icons.search} active={paletteOpen} onClick={() => setPaletteOpen(true)} label="Search" shortcut="⌘K" />
        <ActBtn icon={Icons.layout} active={viewMode === 'board'} onClick={() => onViewModeChange?.(viewMode === 'board' ? 'list' : 'board')} label="Board" />
        <ActBtn icon={Icons.globe} active={false} onClick={() => onViewModeChange?.('nebula')} label="Nebula" />
        <div className="flex-1" />
        <ActBtn icon={Icons.settings} active={inspOpen} onClick={() => setInspOpen(p => !p)} label="Inspector" shortcut="⌘I" />
      </div>

      {/* ── Explorer ── */}
      <AnimatePresence initial={false}>
        {expOpen && (
          <motion.div initial={{ width: 0, opacity: 0 }} animate={{ width: expW, opacity: 1 }} exit={{ width: 0, opacity: 0 }} transition={{ type: 'spring', stiffness: 300, damping: 30 }} className="shrink-0 overflow-hidden">
            <div className="h-full flex flex-col bg-[var(--bg-base)] border-r border-[var(--color-border-subtle)]" style={{ width: expW }}>
              {/* Header */}
              <div className="px-3 pt-3 pb-2 shrink-0">
                <div className="flex items-center justify-between mb-2">
                  <div className="flex items-center gap-1.5">
                    <span className="text-[11px] font-semibold text-[var(--text-primary)] tracking-widest uppercase">Explorer</span>
                    <Badge variant="outline" className="text-[9px] font-mono tabular-nums">{tasks.length}</Badge>
                  </div>
                </div>
                <input value={undefined} onChange={() => {}} placeholder="Search tasks…" className="w-full bg-[var(--bg-subtle)] border-none rounded-md px-2.5 py-1.5 text-[12px] text-[var(--text-primary)] placeholder:text-[var(--text-tertiary)] outline-none focus:ring-1 focus:ring-[var(--accent)]" />
              </div>
              {/* Groups */}
              <div className="flex-1 overflow-y-auto custom-scrollbar px-1.5 pb-2">
                {groups.length === 0 && <div className="px-2 py-4 text-center"><span className="text-[11px] text-[var(--text-muted)]">No tasks</span></div>}
                {groups.map(g => {
                  const isCol = collapsed[g.id]
                  return (
                    <div key={g.id} className="mb-1">
                      <button onClick={() => toggleGroup(g.id)} className="w-full flex items-center gap-1.5 px-2 py-1 rounded hover:bg-[var(--bg-subtle)] transition-colors group">
                        <motion.span animate={{ rotate: isCol ? 0 : 90 }} className="text-[var(--text-tertiary)] text-[9px]">▶</motion.span>
                        <span className={cn('text-[10px] font-semibold uppercase tracking-wider', g.color)}>{g.label}</span>
                        <span className="ml-auto text-[9px] text-[var(--text-tertiary)] tabular-nums font-mono">{g.tasks.length}</span>
                      </button>
                      <AnimatePresence initial={false}>
                        {!isCol && (
                          <motion.div initial={{ height: 0, opacity: 0 }} animate={{ height: 'auto', opacity: 1 }} exit={{ height: 0, opacity: 0 }} transition={{ duration: 0.15 }} className="overflow-hidden">
                            {g.tasks.map(task => {
                              const isSel = activeTask?.id === task.id
                              return (
                                <button key={task.id} onClick={() => onTaskSelect(task)} className={cn('w-full text-left px-2 py-1.5 rounded-md transition-colors flex items-center gap-2 mb-0.5', isSel ? 'bg-[var(--accent-soft)] ring-1 ring-[var(--accent-border)]' : 'hover:bg-[var(--bg-subtle)]')}>
                                  <div className={cn('w-1.5 h-1.5 rounded-full shrink-0', STATUS_DOT[task.status] || 'bg-gray-400')} />
                                  <span className={cn('text-[12px] truncate flex-1', isSel ? 'text-[var(--text-primary)] font-medium' : 'text-[var(--text-secondary)]')}>{task.title}</span>
                                  {task.priority === 'URGENT' && <div className="w-1 h-1 rounded-full bg-red-400 shrink-0" />}
                                  {task.dueDate && (() => { const d = new Date(task.dueDate); const now = new Date(); const od = d < now && task.status !== 'Done'; const td = d.toDateString() === now.toDateString(); return <span className={cn('text-[9px] shrink-0', od ? 'text-red-400' : td ? 'text-amber-400' : 'text-[var(--text-tertiary)]')}>{d.toLocaleDateString('en', { month: 'short', day: 'numeric' })}</span> })()}
                                </button>
                              )
                            })}
                          </motion.div>
                        )}
                      </AnimatePresence>
                    </div>
                  )
                })}
              </div>
            </div>
          </motion.div>
        )}
      </AnimatePresence>

      {/* Drag handle for explorer */}
      {expOpen && <DragH vert size={expW} setSize={setExpW} min={180} max={400} onDoubleClick={() => setExpOpen(false)} />}

      {/* ── Editor Area ── */}
      <div className="flex-1 flex flex-col min-w-0 overflow-hidden">
        {viewMode === 'board' ? (
          /* Board view fills the editor area */
          <div className="flex-1 overflow-auto">{renderBoard?.()}</div>
        ) : (
          <>
            {/* Editor Tabs */}
            {openTabs.length > 0 && (
              <div className="flex items-center h-9 bg-[var(--bg-base)] border-b border-[var(--color-border-subtle)] shrink-0 overflow-x-auto custom-scrollbar">
                {openTabs.map(tabId => {
                  const task = tasks.find(t => t.id === tabId)
                  if (!task) return null
                  const isActive = activeTab === tabId
                  return (
                    <div key={tabId} onClick={() => onTaskSelect(task)} className={cn('group flex items-center gap-2 px-3 h-full border-r border-[var(--color-border-subtle)] cursor-pointer transition-colors max-w-[200px]', isActive ? 'bg-[var(--bg-elevated)]' : 'bg-[var(--bg-base)] hover:bg-[var(--bg-subtle)]/50')}>
                      <div className={cn('w-1.5 h-1.5 rounded-full shrink-0', STATUS_DOT[task.status] || 'bg-gray-400')} />
                      <span className={cn('text-[11px] truncate', isActive ? 'text-[var(--text-primary)] font-medium' : 'text-[var(--text-muted)]')}>{task.title}</span>
                      <button onClick={(e) => { e.stopPropagation(); closeTab(tabId) }} className="opacity-0 group-hover:opacity-100 p-0.5 rounded hover:bg-[var(--bg-hover)] transition-all"><Icons.x className="w-3 h-3 text-[var(--text-muted)]" /></button>
                      {isActive && <motion.div layoutId="editor-tab-underline" className="absolute bottom-0 left-0 right-0 h-[2px] bg-[var(--accent)]" />}
                    </div>
                  )
                })}
              </div>
            )}

            {/* Editor content */}
            <div className="flex-1 overflow-hidden relative">
              <AnimatePresence mode="wait">
                {activeTask ? (
                  <motion.div key={activeTask.id} initial={{ opacity: 0, y: 6 }} animate={{ opacity: 1, y: 0 }} exit={{ opacity: 0, y: -6 }} transition={{ duration: 0.15 }} className="h-full">
                    {renderEditor?.(activeTask)}
                  </motion.div>
                ) : (
                  <motion.div key="empty" initial={{ opacity: 0 }} animate={{ opacity: 1 }} className="flex flex-col items-center justify-center h-full gap-3">
                    <div className="w-16 h-16 rounded-full bg-[var(--bg-subtle)] flex items-center justify-center"><Icons.checkSquare className="w-7 h-7 text-[var(--text-muted)] opacity-40" /></div>
                    <div className="text-center"><div className="text-[14px] font-semibold text-[var(--text-primary)]">No task open</div><div className="text-[12px] text-[var(--text-muted)] mt-0.5">Select a task from the explorer or press ⌘K</div></div>
                  </motion.div>
                )}
              </AnimatePresence>
            </div>

            {/* Bottom Dock */}
            <AnimatePresence initial={false}>
              {dockOpen && activeTask && (
                <>
                  <DragH vert={false} size={dockH} setSize={setDockH} min={100} max={500} onDoubleClick={() => setDockOpen(false)} />
                  <motion.div initial={{ height: 0, opacity: 0 }} animate={{ height: dockH, opacity: 1 }} exit={{ height: 0, opacity: 0 }} transition={{ type: 'spring', stiffness: 300, damping: 30 }} className="shrink-0 overflow-hidden border-t border-[var(--color-border-subtle)] bg-[var(--bg-elevated)] flex flex-col" style={{ height: dockH }}>
                    <div className="flex items-center justify-between h-8 shrink-0 bg-[var(--bg-subtle)]/50 border-b border-[var(--color-border-subtle)]">
                      <div className="flex items-center h-full">
                        {[{ id: 'comments', label: 'Comments', icon: Icons.messageSquare }, { id: 'evidence', label: 'Evidence', icon: Icons.paperclip }, { id: 'activity', label: 'Activity', icon: Icons.clock }].map(t => {
                          const isA = dockTab === t.id
                          return <button key={t.id} onClick={() => setDockTab(t.id)} className={cn('relative flex items-center gap-1.5 px-3 h-full text-[11px] font-medium transition-colors', isA ? 'text-[var(--text-primary)] bg-[var(--bg-elevated)]' : 'text-[var(--text-muted)] hover:text-[var(--text-secondary)]')}><t.icon className="w-3 h-3" />{t.label}{isA && <motion.div layoutId="dock-tab" className="absolute top-0 left-2 right-2 h-[2px] bg-[var(--accent)] rounded-full" />}</button>
                        })}
                      </div>
                      <button onClick={() => setDockOpen(false)} className="p-1 mr-1 rounded text-[var(--text-muted)] hover:text-[var(--text-primary)] hover:bg-[var(--bg-hover)] transition-colors"><Icons.x className="w-3 h-3" /></button>
                    </div>
                    <div className="flex-1 overflow-y-auto custom-scrollbar">{renderDock?.(activeTask, dockTab)}</div>
                  </motion.div>
                </>
              )}
            </AnimatePresence>
          </>
        )}
      </div>

      {/* Drag handle for inspector */}
      {inspOpen && viewMode !== 'board' && <DragH vert size={inspW} setSize={setInspW} min={200} max={400} onDoubleClick={() => setInspOpen(false)} />}

      {/* ── Inspector ── */}
      <AnimatePresence initial={false}>
        {inspOpen && viewMode !== 'board' && activeTask && (
          <motion.div initial={{ width: 0, opacity: 0 }} animate={{ width: inspW, opacity: 1 }} exit={{ width: 0, opacity: 0 }} transition={{ type: 'spring', stiffness: 300, damping: 30 }} className="shrink-0 overflow-hidden">
            <div className="h-full flex flex-col bg-[var(--bg-base)] border-l border-[var(--color-border-subtle)]" style={{ width: inspW }}>
              <div className="flex items-center justify-between h-8 px-3 shrink-0 border-b border-[var(--color-border-subtle)]">
                <span className="text-[10px] font-semibold text-[var(--text-muted)] uppercase tracking-widest">Inspector</span>
                <button onClick={() => setInspOpen(false)} className="p-1 rounded text-[var(--text-muted)] hover:text-[var(--text-primary)] hover:bg-[var(--bg-hover)] transition-colors"><Icons.x className="w-3 h-3" /></button>
              </div>
              <div className="flex-1 overflow-y-auto custom-scrollbar p-3 space-y-3">
                <InspRow label="Status">
                  <div className="flex items-center gap-1.5"><div className={cn('w-2 h-2 rounded-full', STATUS_DOT[activeTask.status] || 'bg-gray-400')} /><span className="text-[12px] font-medium text-[var(--text-primary)]">{activeTask.status || 'To Do'}</span></div>
                </InspRow>
                <InspRow label="Priority"><div className="flex items-center gap-1.5"><div className={cn('w-2 h-2 rounded-full', activeTask.priority === 'URGENT' && 'bg-red-400', activeTask.priority === 'HIGH' && 'bg-amber-400', activeTask.priority === 'MEDIUM' && 'bg-blue-400', activeTask.priority === 'LOW' && 'bg-gray-400')} /><span className="text-[12px] text-[var(--text-primary)]">{activeTask.priority || '—'}</span></div></InspRow>
                <InspRow label="Assignee"><div className="flex items-center gap-1.5"><div className="w-4 h-4 rounded-full bg-[var(--accent)] text-white flex items-center justify-center text-[9px] font-bold">{(activeTask.assignedTo || 'U').charAt(0).toUpperCase()}</div><span className="text-[12px] text-[var(--text-primary)]">{activeTask.assignedTo || 'Unassigned'}</span></div></InspRow>
                <InspRow label="Due Date"><span className="text-[12px] text-[var(--text-primary)]">{activeTask.dueDate ? new Date(activeTask.dueDate).toLocaleDateString() : 'No deadline'}</span></InspRow>
                <InspRow label="Created"><span className="text-[11px] text-[var(--text-muted)]">{activeTask.createdAt ? new Date(activeTask.createdAt).toLocaleDateString() : '—'}</span></InspRow>
                <InspRow label="Updated"><span className="text-[11px] text-[var(--text-muted)]">{activeTask.updatedAt ? new Date(activeTask.updatedAt).toLocaleDateString() : '—'}</span></InspRow>
                {activeTask.tags && <InspRow label="Tags"><div className="flex flex-wrap gap-1">{(Array.isArray(activeTask.tags) ? activeTask.tags : typeof activeTask.tags === 'string' ? activeTask.tags.split(',') : []).map((tag, i) => <span key={i} className="text-[9px] px-1.5 py-0.5 rounded bg-[var(--bg-subtle)] text-[var(--text-muted)]">{String(tag).trim()}</span>)}</div></InspRow>}
                {activeTask.checklists && activeTask.checklists.length > 0 && <InspRow label="Checklist"><span className="text-[11px] text-[var(--text-muted)]">{activeTask.checklists.filter(c => c.completed).length}/{activeTask.checklists.length} done</span></InspRow>}
              </div>
            </div>
          </motion.div>
        )}
      </AnimatePresence>

      {/* ── Command Palette ── */}
      <AnimatePresence>
        {paletteOpen && (
          <motion.div initial={{ opacity: 0 }} animate={{ opacity: 1 }} exit={{ opacity: 0 }} className="fixed inset-0 z-[200] flex items-start justify-center pt-[15vh] bg-black/30 backdrop-blur-sm" onClick={() => setPaletteOpen(false)}>
            <motion.div initial={{ scale: 0.96, y: -8 }} animate={{ scale: 1, y: 0 }} exit={{ scale: 0.96, y: -8 }} onClick={e => e.stopPropagation()} className="w-full max-w-xl bg-[var(--bg-elevated)] rounded-xl shadow-2xl border border-[var(--color-border-subtle)] overflow-hidden">
              <div className="flex items-center gap-2 px-4 py-3 border-b border-[var(--color-border-subtle)]">
                <Icons.search className="w-4 h-4 text-[var(--text-muted)]" />
                <input autoFocus placeholder="Search tasks or run a command…" className="flex-1 bg-transparent text-[14px] text-[var(--text-primary)] placeholder:text-[var(--text-tertiary)] outline-none" />
                <kbd className="text-[10px] text-[var(--text-tertiary)] font-mono px-1.5 py-0.5 rounded bg-[var(--bg-subtle)]">ESC</kbd>
              </div>
              <div className="max-h-[50vh] overflow-y-auto custom-scrollbar p-2">
                {paletteResults.tasks.length > 0 && <div className="text-[10px] font-semibold text-[var(--text-muted)] uppercase tracking-wider px-2 py-1.5">Tasks</div>}
                {paletteResults.tasks.map(t => (
                  <button key={t.id} onClick={() => { onTaskSelect(t); setPaletteOpen(false) }} className="w-full flex items-center gap-2.5 px-2 py-2 rounded-lg hover:bg-[var(--bg-subtle)] transition-colors text-left">
                    <div className={cn('w-1.5 h-1.5 rounded-full shrink-0', STATUS_DOT[t.status] || 'bg-gray-400')} />
                    <span className="text-[13px] text-[var(--text-primary)] truncate flex-1">{t.title}</span>
                    <span className="text-[10px] text-[var(--text-tertiary)] font-mono">{t.id}</span>
                  </button>
                ))}
                {paletteResults.actions.length > 0 && <div className="text-[10px] font-semibold text-[var(--text-muted)] uppercase tracking-wider px-2 py-1.5 mt-2">Actions</div>}
                {paletteResults.actions.map(a => (
                  <button key={a.id} onClick={() => { a.run(); setPaletteOpen(false) }} className="w-full flex items-center gap-2.5 px-2 py-2 rounded-lg hover:bg-[var(--bg-subtle)] transition-colors text-left">
                    <span className="text-[13px] text-[var(--text-primary)] flex-1">{a.label}</span>
                    {a.shortcut && <kbd className="text-[10px] text-[var(--text-tertiary)] font-mono">{a.shortcut}</kbd>}
                  </button>
                ))}
              </div>
            </motion.div>
          </motion.div>
        )}
      </AnimatePresence>
    </div>
  )
}

/* ─── Activity Bar Button ─── */
function ActBtn({ icon: Icon, active, onClick, label, shortcut }) {
  return (
    <motion.button whileHover={{ scale: 1.05 }} whileTap={{ scale: 0.95 }} onClick={onClick} title={`${label}${shortcut ? ` (${shortcut})` : ''}`}
      className={cn('relative w-9 h-9 rounded-lg flex items-center justify-center transition-colors', active ? 'text-[var(--text-primary)] bg-[var(--accent-soft)]' : 'text-[var(--text-muted)] hover:text-[var(--text-primary)] hover:bg-[var(--bg-subtle)]')}>
      <Icon className="w-4 h-4" />
      {active && <motion.div layoutId="actbar-indicator" className="absolute -left-2 top-1/2 -translate-y-1/2 w-[2px] h-5 rounded-full bg-[var(--accent)]" />}
    </motion.button>
  )
}

/* ─── Inspector Row ─── */
function InspRow({ label, children }) {
  return <div className="flex items-center justify-between gap-2"><span className="text-[10px] font-semibold text-[var(--text-muted)] uppercase tracking-wider shrink-0">{label}</span>{children}</div>
}
