import React from 'react'
import { useNavigate } from 'react-router-dom'
import { motion } from 'framer-motion'
import { Bookmark, X, ExternalLink } from '@/shared/ui/Icons'
import { Button } from '@/shared/ui/Button'
import { Heading, Text } from '@/shared/ui/Typography'
import { useSavedItems, useToggleSave } from '@/library/saved/features/hooks/useSaved'
import { PageShell, PageHero, PageContent } from '@/shared/ui/PageShell'
import { PageState } from '@/shared/ui/PageState'
import { InteractiveCard } from '@/shared/ui/InteractiveCard'
import { cn } from '@/shared/lib/cn'

const typeConfig = {
  PROJECT: { label: 'Project', accent: 'text-[var(--accent)]', bg: 'bg-[var(--accent-soft)]' },
  ORGANIZATION: { label: 'Organization', accent: 'text-purple-500', bg: 'bg-purple-500/10' },
  TEAM: { label: 'Team', accent: 'text-indigo-500', bg: 'bg-indigo-500/10' },
  TASK: { label: 'Task', accent: 'text-amber-500', bg: 'bg-amber-500/10' },
  NOTE: { label: 'Note', accent: 'text-emerald-500', bg: 'bg-emerald-500/10' },
}

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
    <PageShell maxWidth="default">
      <PageHero
        title="Saved & Bookmarked"
        subtitle="Quick access to your bookmarked tasks, projects, notes, and teams."
        eyebrow={`Archive · ${items.length} bookmarks`}
        icon={Bookmark}
      />

      <PageContent>
        <PageState
          state={pageState}
          moduleId="saved"
          stateProps={{ loadingVariant: 'cards' }}
        >
          <div className="grid grid-cols-1 md:grid-cols-2 gap-3">
            {items.map((item, i) => {
              const route = routeFor(item)
              const config = typeConfig[item.entityType] || typeConfig.NOTE

              return (
                <motion.div
                  key={item.id}
                  initial={{ opacity: 0, y: 8 }}
                  animate={{ opacity: 1, y: 0 }}
                  transition={{ delay: i * 0.04, duration: 0.25 }}
                >
                  <InteractiveCard onClick={() => route && navigate(route)}>
                    <div className="flex items-center justify-between p-4 gap-3">
                      <div className="flex items-center gap-3 min-w-0 flex-1">
                        <div className={cn('w-9 h-9 rounded-xl flex items-center justify-center text-xs font-bold shrink-0', config.bg, config.accent)}>
                          {item.entityType?.charAt(0) || 'B'}
                        </div>
                        <div className="min-w-0">
                          <Text className="font-semibold text-sm truncate group-hover:text-[var(--accent)] transition-colors">
                            {item.title}
                          </Text>
                          <Text size="xs" variant="muted" className="text-[11px] truncate flex items-center gap-1">
                            <span className={cn('w-1.5 h-1.5 rounded-full shrink-0', config.accent.replace('text', 'bg'))} />
                            {item.subtitle || config.label}
                          </Text>
                        </div>
                      </div>

                      <div className="flex items-center gap-1 shrink-0">
                        {route && (
                          <button
                            onClick={(e) => { e.stopPropagation(); navigate(route) }}
                            className="p-1.5 rounded-lg text-[var(--text-muted)] hover:text-[var(--accent)] hover:bg-[var(--accent-soft)]/50 transition-colors opacity-0 group-hover:opacity-100"
                            title="Open"
                          >
                            <ExternalLink className="w-3.5 h-3.5" />
                          </button>
                        )}
                        <button
                          onClick={(e) => { e.stopPropagation(); unsave.mutate({ entityType: item.entityType, entityId: item.entityId }) }}
                          className="p-1.5 rounded-lg text-[var(--text-muted)] hover:text-rose-500 hover:bg-rose-500/10 transition-colors"
                          title="Remove bookmark"
                        >
                          <X className="w-4 h-4" />
                        </button>
                      </div>
                    </div>
                  </InteractiveCard>
                </motion.div>
              )
            })}
          </div>
        </PageState>
      </PageContent>
    </PageShell>
  )
}
