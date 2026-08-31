import React from 'react'

/* ===
 * TEAM TILE SKELETON (extracted from TeamsPage)
 * === */

export function TeamTileSkeleton() {
  return (
    <div className="bg-[var(--bg-card)] border border-[var(--border-subtle)] rounded-2xl p-5 animate-pulse">
      <div className="flex items-start gap-3 mb-4 mt-6">
        <div className="w-11 h-11 rounded-2xl bg-[var(--bg-subtle)]" />
        <div className="flex-1 space-y-1.5">
          <div className="h-4 w-28 rounded-md bg-[var(--bg-subtle)]" />
          <div className="h-3 w-40 rounded-md bg-[var(--bg-subtle)]" />
        </div>
      </div>
      <div className="grid grid-cols-3 gap-1.5 mb-4">
        {[1, 2, 3].map(i => (
          <div key={i} className="bg-[var(--bg-subtle)] rounded-lg px-2 py-3 space-y-1.5">
            <div className="h-4 w-8 mx-auto rounded bg-[var(--bg-card)]" />
            <div className="h-2 w-10 mx-auto rounded bg-[var(--bg-card)]" />
          </div>
        ))}
      </div>
      <div className="mb-4 space-y-1">
        <div className="flex justify-between"><div className="h-2.5 w-20 rounded bg-[var(--bg-subtle)]" /><div className="h-2.5 w-8 rounded bg-[var(--bg-subtle)]" /></div>
        <div className="h-1 rounded-full bg-[var(--bg-subtle)]" />
      </div>
      <div className="flex items-center justify-between">
        <div className="flex -space-x-1.5">
          {[1, 2, 3].map(i => (
            <div key={i} className="w-6 h-6 rounded-full bg-[var(--bg-subtle)] ring-2 ring-[var(--bg-card)]" />
          ))}
        </div>
        <div className="h-3 w-6 rounded bg-[var(--bg-subtle)]" />
      </div>
      <div className="mt-3 pt-3 border-t border-[var(--border-subtle)]">
        <div className="h-2.5 w-24 rounded bg-[var(--bg-subtle)]" />
      </div>
    </div>
  )
}
