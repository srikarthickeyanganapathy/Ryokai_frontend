import React from 'react'
import { cn } from '@/shared/lib/cn'
import { Icons } from '@/shared/ui/Icons'
import { FolderIcon, ChecklistIcon, ChatIcon, InsightsIcon } from './Shared'

const TABS = [
  { id: 'overview', label: 'Overview', icon: null },
  { id: 'projects', label: 'Projects', icon: FolderIcon },
  { id: 'tasks', label: 'Tasks', icon: ChecklistIcon },
  { id: 'members', label: 'Members', icon: null },
  { id: 'chat', label: 'Discussion', icon: ChatIcon },
  { id: 'insights', label: 'Analytics', icon: InsightsIcon },
]

export function TeamTabs({ activeTab, setActiveTab, tabCounts }) {
  return (
    <div className="sticky top-0 z-20 bg-[var(--bg-base)]/80 backdrop-blur-md border-b border-[var(--border-subtle)]">
      <div className="flex items-center gap-1 px-2 sm:px-4 overflow-x-auto no-scrollbar">
        {TABS.map(tab => {
          const IconEl = tab.icon
          const count = tabCounts[tab.id]
          return (
            <button
              key={tab.id}
              onClick={() => setActiveTab(tab.id)}
              className={cn(
                'relative flex items-center gap-2 px-3 py-3 text-[13px] font-medium transition-colors whitespace-nowrap border-b-2',
                activeTab === tab.id 
                  ? 'border-[var(--accent)] text-[var(--text-primary)]' 
                  : 'border-transparent text-[var(--text-muted)] hover:text-[var(--text-primary)]'
              )}
            >
              {tab.id === 'members' ? <Icons.users className="w-3.5 h-3.5" /> : IconEl && <IconEl className="w-3.5 h-3.5" />}
              {tab.label}
              {typeof count === 'number' && count > 0 && (
                <span className={cn(
                  'text-[10px] px-1.5 rounded-full tabular-nums font-semibold',
                  activeTab === tab.id ? 'bg-[var(--accent-soft)] text-[var(--accent)]' : 'bg-[var(--bg-subtle)] text-[var(--text-muted)]'
                )}>{count}</span>
              )}
            </button>
          )
        })}
      </div>
    </div>
  )
}