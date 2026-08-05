import React from 'react'
import { ChevronLeft, ChevronRight, Pin, PinOff, MapPin } from 'lucide-react'
import { cn } from '@/shared/lib/cn'

/**
 * ExplorerNavBar — shared navigation bar used by all analysis modes.
 * Shows back/forward, breadcrumb trail, and pin controls.
 */
export default function ExplorerNavBar({ navigator, onCenterOnGraph }) {
  if (!navigator) return null

  const { breadcrumbs, canGoBack, canGoForward, goBack, goForward, currentTaskId, pinned, pin, unpin } = navigator
  const isPinned = currentTaskId && pinned.has(currentTaskId)

  return (
    <div className="flex items-center gap-1.5 pb-3 mb-3 border-b border-white/10 select-none">
      {/* Back / Forward */}
      <button
        onClick={goBack}
        disabled={!canGoBack}
        className={cn(
          "p-1 rounded-md transition-colors",
          canGoBack ? "text-white/60 hover:text-white hover:bg-white/10 cursor-pointer" : "text-white/15 cursor-default"
        )}
        title="Go Back"
      >
        <ChevronLeft size={14} />
      </button>
      <button
        onClick={goForward}
        disabled={!canGoForward}
        className={cn(
          "p-1 rounded-md transition-colors",
          canGoForward ? "text-white/60 hover:text-white hover:bg-white/10 cursor-pointer" : "text-white/15 cursor-default"
        )}
        title="Go Forward"
      >
        <ChevronRight size={14} />
      </button>

      {/* Breadcrumb Trail */}
      <div className="flex items-center gap-1 flex-1 overflow-x-auto no-scrollbar">
        {breadcrumbs.map((crumb, idx) => {
          const isLast = idx === breadcrumbs.length - 1
          return (
            <React.Fragment key={crumb.id}>
              {idx > 0 && <span className="text-white/15 text-[10px]">›</span>}
              <button
                onClick={() => {
                  if (!isLast) {
                    // Navigate to this breadcrumb position
                    const stepsBack = breadcrumbs.length - 1 - idx
                    for (let i = 0; i < stepsBack; i++) goBack()
                  }
                }}
                className={cn(
                  "text-[11px] font-mono truncate max-w-[120px] rounded px-1 py-0.5 transition-colors",
                  isLast
                    ? "text-cyan-300 bg-cyan-500/10 font-semibold"
                    : "text-white/40 hover:text-white/80 hover:bg-white/5 cursor-pointer"
                )}
              >
                {crumb.title}
              </button>
            </React.Fragment>
          )
        })}
      </div>

      {/* Pin */}
      {currentTaskId && (
        <button
          onClick={() => isPinned ? unpin(currentTaskId) : pin(currentTaskId)}
          className={cn(
            "p-1 rounded-md transition-colors",
            isPinned ? "text-amber-400 bg-amber-500/15 hover:bg-amber-500/25" : "text-white/40 hover:text-white hover:bg-white/10"
          )}
          title={isPinned ? "Unpin" : "Pin for comparison"}
        >
          {isPinned ? <PinOff size={12} /> : <Pin size={12} />}
        </button>
      )}

      {/* Center on Graph */}
      {onCenterOnGraph && (
        <button
          onClick={onCenterOnGraph}
          className="p-1 rounded-md text-white/40 hover:text-cyan-300 hover:bg-cyan-500/10 transition-colors"
          title="Center on graph"
        >
          <MapPin size={12} />
        </button>
      )}
    </div>
  )
}
