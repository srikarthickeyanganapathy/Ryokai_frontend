import React from 'react'
import { useNavigate } from 'react-router-dom'
import { Bookmark, X } from 'lucide-react'
import { Button } from '@/shared/ui/Button'
import { Heading, Text } from '@/shared/ui/Typography'
import { useSavedItems, useToggleSave } from '@/features/saved/hooks/useSaved'

const routeFor = (item) => {
  switch (item.entityType) {
    case 'PROJECT': return `/app/projects/${item.entityId}`
    case 'ORGANIZATION': return `/app/organizations/${item.entityId}`
    case 'TEAM': return `/app/organizations/teams/${item.entityId}` 
    case 'TASK': return `/app/tasks?openTaskId=${item.entityId}`
    case 'NOTE': return `/app/notes?openNoteId=${item.entityId}`
    default: return null
  }
}

export function SavedPage() {
  const { data: items = [], isLoading } = useSavedItems()
  const { unsave } = useToggleSave()
  const navigate = useNavigate()

  return (
    <div className="max-w-5xl mx-auto space-y-6" role="region" aria-label="Saved items">
      {/* 🔖 SAVED ARCHIVE HEADER */}
      <div className="pb-4 border-b border-[var(--color-border-subtle)]">
        <div className="flex items-center gap-2 mb-1">
          <span className="px-2 py-0.5 rounded-full bg-[var(--accent-soft)] text-[var(--accent)] border border-[var(--accent-border)] font-mono text-[10px] uppercase tracking-wider font-semibold">
            SAVED ARCHIVE
          </span>
          <span className="text-[11px] text-[var(--text-muted)]">• {items.length} Bookmarks</span>
        </div>
        <Heading level={1} className="tracking-tight text-[22px] font-semibold mb-0">Saved & Bookmarked Items</Heading>
        <Text variant="muted" className="text-[13px]">Quick access reference bookmarks for tasks, projects, notes, and teams.</Text>
      </div>

      {isLoading ? (
        <Text variant="muted" className="text-center py-12">Loading saved items...</Text>
      ) : items.length === 0 ? (
        <div className="text-center p-16 rounded-2xl bg-[var(--bg-elevated)] border border-dashed border-[var(--color-border-subtle)]">
          <Bookmark className="w-12 h-12 mx-auto text-[var(--accent)] mb-3 opacity-60" />
          <Heading level={3} className="text-base font-semibold mb-1">Nothing saved yet</Heading>
          <Text variant="muted" className="text-xs">Bookmark items across your workspace to access them here instantly.</Text>
        </div>
      ) : (
        <div className="grid grid-cols-1 md:grid-cols-2 gap-3">
          {items.map(item => {
            const route = routeFor(item)
            return (
              <div
                key={item.id}
                onClick={() => route && navigate(route)}
                className="group flex items-center justify-between p-4 rounded-xl bg-[var(--bg-elevated)] border border-[var(--color-border-subtle)] cursor-pointer hover:border-[var(--accent-border)] hover:shadow-lg transition-all duration-200"
              >
                <div className="flex items-center gap-3 min-w-0">
                  <div className="w-8 h-8 rounded-lg bg-[var(--accent-soft)] text-[var(--accent)] flex items-center justify-center font-bold text-xs shrink-0 font-mono">
                    {item.entityType?.charAt(0) || 'B'}
                  </div>
                  <div className="min-w-0">
                    <Text className="font-semibold text-sm group-hover:text-[var(--accent)] transition-colors truncate">{item.title}</Text>
                    <Text size="xs" variant="muted" className="text-[11px] truncate">{item.subtitle || item.entityType}</Text>
                  </div>
                </div>
                <button
                  onClick={(e) => { e.stopPropagation(); unsave.mutate({ entityType: item.entityType, entityId: item.entityId }) }}
                  className="p-1.5 rounded-lg text-[var(--text-muted)] hover:text-rose-500 hover:bg-rose-500/10 transition-colors"
                >
                  <X className="w-4 h-4" />
                </button>
              </div>
            )
          })}
        </div>
      )}
    </div>
  )
}
