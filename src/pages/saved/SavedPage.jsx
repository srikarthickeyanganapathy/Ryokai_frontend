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
    <div className="max-w-4xl mx-auto py-8 px-4" role="region" aria-label="Saved items">
      <Heading level={1} className="mb-6">Saved Items</Heading>

      {isLoading ? (
        <Text variant="muted">Loading…</Text>
      ) : items.length === 0 ? (
        <div className="text-center p-12 rounded-lg border border-dashed border-[var(--color-border-default)]">
          <Bookmark className="w-10 h-10 mx-auto text-[var(--text-muted)] mb-3 opacity-50" />
          <Text variant="muted">Nothing saved yet.</Text>
        </div>
      ) : (
        <div className="space-y-2">
          {items.map(item => {
            const route = routeFor(item)
            return (
              <div
                key={item.id}
                onClick={() => route && navigate(route)}
                className="flex items-center justify-between p-4 rounded-lg glass-panel border border-[var(--color-border-subtle)] cursor-pointer hover:border-[var(--accent-border)] transition-colors"
              >
                <div>
                  <Text className="font-medium">{item.title}</Text>
                  <Text size="sm" variant="muted">{item.subtitle}</Text>
                </div>
                <button
                  onClick={(e) => { e.stopPropagation(); unsave.mutate({ entityType: item.entityType, entityId: item.entityId }) }}
                  className="text-[var(--text-muted)] hover:text-[var(--danger)]"
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
