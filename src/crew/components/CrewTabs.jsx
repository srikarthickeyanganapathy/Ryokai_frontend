import React from 'react'
import { Icons } from '@/shared/ui/Icons'
import { FolderIcon, ChecklistIcon, ChatIcon, WhiteboardIcon } from './CrewShared'
import { DetailTabs } from '@/shared/ui/DetailTabs'

const TABS = [
  { id: 'overview', label: 'Overview', icon: null },
  { id: 'tasks', label: 'Tasks', icon: ChecklistIcon },
  { id: 'channels', label: 'Channels', icon: ChatIcon },
  { id: 'projects', label: 'Projects', icon: FolderIcon },
  { id: 'whiteboards', label: 'Whiteboards', icon: WhiteboardIcon },
  { id: 'members', label: 'Members', icon: Icons.users },
]

export function CrewTabs({ activeTab, setActiveTab, tabCounts, sticky = true }) {
  return (
    <DetailTabs
      tabs={TABS}
      activeTab={activeTab}
      onChange={setActiveTab}
      counts={tabCounts}
      sticky={sticky}
    />
  )
}
