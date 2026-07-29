import React from 'react'
import { useNavigate } from 'react-router-dom'
import { Bookmark, X } from 'lucide-react'
import { Button } from '@/shared/ui/Button'
import { Heading, Text } from '@/shared/ui/Typography'
import { useSavedItems, useToggleSave } from '@/library/saved/features/hooks/useSaved'
import { PageHeader } from '@/shared/ui/PageHeader'
import {
  WorkspaceShell,
  ManagementLayout,
  PageStateContainer,
} from '@/shared/workspace-framework'

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

  const pageState = isLoading ? 'loading' : items.length === 0 ? 'empty' : 'ready'

  return (
    <WorkspaceShell maxWidth="default">
      <ManagementLayout
        header={
          <PageHeader
            eyebrow="Saved Archive"
            meta={`• ${items.length} Bookmarks`}
            title="Saved & Bookmarked Items"
            subtitle="Quick access reference bookmarks for tasks, projects, notes, and teams."
          />
        }
      >
        <PageStateContainer
          state={pageState}
          loadingConfig={{ variant: 'cards' }}
          emptyConfig={{
            icon: Bookmark,
            title: 'Nothing saved yet',
            description: 'Bookmark items across your workspace to access them here instantly.',
          }}
        >
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
        </PageStateContainer>
      </ManagementLayout>
    </WorkspaceShell>
  )
}
