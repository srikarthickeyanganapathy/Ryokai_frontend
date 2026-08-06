import React, { useRef, useCallback } from 'react'
import { cn } from '@/shared/lib/cn'

/**
 * DragHandle — resizable divider between panels.
 * Supports vertical (col-resize) and horizontal (row-resize) orientations.
 * Double-click resets to default (collapses panel).
 */
export function DragHandle({ orientation = 'vertical', size, setSize, min, max, onDoubleClick }) {
  const drag = useRef(false)
  const startSize = useRef(0)
  const startPos = useRef(0)

  const isVertical = orientation === 'vertical'

  const handleDown = useCallback(
    (e) => {
      e.preventDefault()
      drag.current = true
      startPos.current = isVertical ? e.clientX : e.clientY
      startSize.current = size
      document.body.style.cursor = isVertical ? 'col-resize' : 'row-resize'
      document.body.style.userSelect = 'none'
      document.body.style.pointerEvents = 'none'

      const move = (me) => {
        if (!drag.current) return
        const delta = startPos.current - (isVertical ? me.clientX : me.clientY)
        const next = Math.min(max, Math.max(min, startSize.current + delta))
        setSize(next)
      }

      const up = () => {
        drag.current = false
        document.body.style.cursor = ''
        document.body.style.userSelect = ''
        document.body.style.pointerEvents = ''
        window.removeEventListener('mousemove', move)
        window.removeEventListener('mouseup', up)
      }

      window.addEventListener('mousemove', move)
      window.addEventListener('mouseup', up)
    },
    [isVertical, size, setSize, min, max]
  )

  return (
    <div
      onMouseDown={handleDown}
      onDoubleClick={onDoubleClick}
      className={cn(
        'shrink-0 transition-colors hover:bg-[var(--accent)]/30 active:bg-[var(--accent)]/40 z-10 relative group',
        isVertical ? 'w-[3px] cursor-col-resize' : 'h-[3px] cursor-row-resize'
      )}
    >
      {/* Wider invisible hit area */}
      <div className={cn('absolute', isVertical ? 'inset-y-0 -left-1 -right-1' : 'inset-x-0 -top-1 -bottom-1')} />
    </div>
  )
}

/**
 * IconBtn — compact icon button for activity bar / panel headers.
 */
export function IconBtn({ icon: Icon, active, onClick, label, shortcut, className }) {
  return (
    <button
      onClick={onClick}
      title={`${label}${shortcut ? ` (${shortcut})` : ''}`}
      className={cn(
        'relative w-9 h-9 rounded-lg flex items-center justify-center transition-colors',
        active
          ? 'text-[var(--text-primary)] bg-[var(--accent-soft)]'
          : 'text-[var(--text-tertiary)] hover:text-[var(--text-primary)] hover:bg-[var(--bg-hover)]',
        className
      )}
    >
      <Icon className="w-4 h-4" strokeWidth={1.75} />
      {active && (
        <span className="absolute -left-2 top-1/2 -translate-y-1/2 w-[2px] h-5 rounded-full bg-[var(--accent)]" />
      )}
    </button>
  )
}

/**
 * SectionHeader — collapsible section header in the sidebar.
 */
export function SectionHeader({ label, count, color, collapsed, onToggle, actions }) {
  return (
    <div className="flex items-center justify-between group/section px-2 py-1 rounded hover:bg-[var(--bg-hover)]/50 transition-colors">
      <button onClick={onToggle} className="flex items-center gap-1.5 flex-1 min-w-0">
        <span
          className="text-[var(--text-tertiary)] text-[9px] transition-transform duration-150"
          style={{ transform: collapsed ? 'rotate(0deg)' : 'rotate(90deg)' }}
        >
          ▶
        </span>
        <span className={cn('text-[10px] font-semibold uppercase tracking-wider truncate', color || 'text-[var(--text-tertiary)]')}>
          {label}
        </span>
        {count != null && count > 0 && (
          <span className="text-[9px] text-[var(--text-tertiary)] tabular-nums font-mono">{count}</span>
        )}
      </button>
      {actions && (
        <div className="flex items-center gap-0.5 opacity-0 group-hover/section:opacity-100 transition-opacity">
          {actions}
        </div>
      )}
    </div>
  )
}

/**
 * Kbd — keyboard shortcut chip.
 */
export function Kbd({ children }) {
  return (
    <kbd className="font-mono text-[10px] text-[var(--text-tertiary)] bg-[var(--bg-subtle)] border border-[var(--border-default)] rounded px-1.5 py-0.5 leading-none">
      {children}
    </kbd>
  )
}
