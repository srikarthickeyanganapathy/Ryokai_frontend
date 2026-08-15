import React from 'react'
import { Activity as ActivityIcon } from 'lucide-react'
import { Heading } from '@/shared/ui/Typography'
import { EmptyState } from '@/shared/ui/EmptyState'

/* ============================================================
   components/ActivityTab.jsx — project activity timeline.
   Renders the page's real projectActivities (up to 30).
   ============================================================ */

export function ActivityTab({ projectActivities = [] }) {
  const items = projectActivities.slice(0, 30)
  return (
    <div className="mt-4 bg-[var(--bg-card)] border border-[var(--border-subtle)] rounded-2xl shadow-[var(--shadow-xs)] overflow-hidden">
      <div className="px-5 pt-4 pb-1 border-b border-[var(--border-subtle)]">
        <Heading level={4} className="text-sm font-semibold flex items-center gap-2">
          <ActivityIcon className="w-4 h-4 text-[var(--accent)]" /> Recent Activity
        </Heading>
      </div>
      <div className="p-5">
        {items.length === 0 ? (
          <EmptyState icon={ActivityIcon} title="No activity yet" description="Actions on this project will stream in here." className="min-h-[200px]" />
        ) : (
          <div className="space-y-0.5 max-w-3xl">
            {items.map((act, idx) => (
              <div key={act.id || idx} className="flex items-start gap-3 py-2.5">
                <div className="relative mt-1.5">
                  <div className="w-2 h-2 rounded-full bg-[var(--accent)] shrink-0" />
                  {idx < items.length - 1 && <div className="absolute top-3 left-[3px] w-px h-full bg-[var(--border-subtle)]" />}
                </div>
                <div className="flex-1 min-w-0">
                  <p className="text-[13px] text-[var(--text-primary)] leading-relaxed">
                    <span className="font-semibold text-[var(--accent)]">{act.actor || act.username || 'System'}</span>{' '}
                    {act.action || act.description || 'performed an action'}
                  </p>
                  <span className="text-[11px] text-[var(--text-muted)] mt-0.5 block font-mono">
                    {act.timestamp ? new Date(act.timestamp).toLocaleString() : 'Recently'}
                  </span>
                </div>
              </div>
            ))}
          </div>
        )}
      </div>
    </div>
  )
}

export default ActivityTab
