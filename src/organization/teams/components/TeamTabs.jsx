import React from 'react'
import { Icons } from '@/shared/ui/Icons'
import { FolderIcon, ChecklistIcon, ChatIcon, InsightsIcon } from './Shared'
import { DetailTabs } from '@/shared/ui/DetailTabs'

const TABS = [
  { id: 'overview', label: 'Overview', icon: null },
  { id: 'projects', label: 'Projects', icon: FolderIcon },
  { id: 'tasks', label: 'Tasks', icon: ChecklistIcon },
  { id: 'members', label: 'Members', icon: Icons.users },
  { id: 'chat', label: 'Discussion', icon: ChatIcon },
  { id: 'insights', label: 'Analytics', icon: InsightsIcon },
]

export function TeamTabs({ activeTab, setActiveTab, tabCounts }) {
  return (
    <DetailTabs
      tabs={TABS}
      activeTab={activeTab}
      onChange={setActiveTab}
      counts={tabCounts}
    />
  )
}