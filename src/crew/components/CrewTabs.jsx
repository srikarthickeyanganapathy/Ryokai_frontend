import React from 'react'
import { DetailTabs } from '@/shared/ui/DetailTabs'
import { Icons } from '@/shared/ui/Icons'
import { FolderIcon, ChecklistIcon, ChatIcon, WhiteboardIcon } from './CrewShared'

/* ============================================================
   components/CrewTabs.jsx — section navigation for crew detail.
   Thin wrapper over the shared DetailTabs so every detail page
   (Crew / Team / Project) uses the same underline tab look.
   ============================================================ */

const TABS = [
  { id: 'overview', label: 'Overview', icon: null },
  { id: 'tasks', label: 'Board', icon: ChecklistIcon },
  { id: 'channels', label: 'Channels', icon: ChatIcon },
  { id: 'projects', label: 'Projects', icon: FolderIcon },
  { id: 'whiteboards', label: 'Whiteboards', icon: WhiteboardIcon },
  { id: 'members', label: 'Roster', icon: Icons.users },
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

export default CrewTabs
