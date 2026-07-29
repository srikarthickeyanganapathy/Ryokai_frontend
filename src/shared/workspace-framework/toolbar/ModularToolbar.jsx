import React from 'react'
import { cn } from '@/shared/lib/cn'
import { layoutClasses } from '../tokens/layoutTokens'

/**
 * ModularToolbar
 * ─────────────────────────────────────────────────────────
 * Composable plugin container for page toolbars.
 * Renders only the plugins a page opts into.
 *
 * Toolbar plugins are STATELESS UI components.
 * State is owned by the consuming page, passed via props.
 *
 * @param {React.ReactNode} [left] — Left-aligned plugins (search, filters)
 * @param {React.ReactNode} [center] — Center content (view switcher)
 * @param {React.ReactNode} [right] — Right-aligned plugins (density, export)
 * @param {string} [className] — Additional toolbar styles
 */
export function ModularToolbar({
  left,
  center,
  right,
  className,
}) {
  const hasContent = left || center || right
  if (!hasContent) return null

  return (
    <div
      className={cn(
        'flex items-center justify-between gap-3 flex-wrap',
        className
      )}
    >
      {/* Left zone: search, filters */}
      {left && (
        <div className="flex items-center gap-2 flex-wrap flex-1 min-w-0">
          {left}
        </div>
      )}

      {/* Center zone: view switcher */}
      {center && (
        <div className="flex items-center gap-2">
          {center}
        </div>
      )}

      {/* Right zone: density, export, etc */}
      {right && (
        <div className="flex items-center gap-2 shrink-0">
          {right}
        </div>
      )}
    </div>
  )
}
