import React from 'react'
import { LayoutDashboard, KanbanSquare, Activity, Github } from 'lucide-react'
import { DetailTabs } from '@/shared/ui/DetailTabs'
import { useWorkspace } from '@/app/providers/WorkspaceProvider'

/* ============================================================
   components/ProjectTabs.jsx — project tab bar on shared
   DetailTabs: Overview / Task Board / Repositories / Activity.
   Repositories tab is hidden in ORG mode (GitHub is not
   available for organization projects).
   ============================================================ */

const ALL_TABS = [
  { id: 'overview', label: 'Overview', icon: LayoutDashboard },
  { id: 'tasks', label: 'Task Board', icon: KanbanSquare },
  { id: 'repos', label: 'Repositories', icon: Github },
  { id: 'activity', label: 'Activity', icon: Activity },
]

export function ProjectTabs({ activeTab, onChange, counts = {} }) {
  const { workspaceMode } = useWorkspace()
  const tabs = workspaceMode === 'ORG'
    ? ALL_TABS.filter(t => t.id !== 'repos')
    : ALL_TABS

  return (
    <DetailTabs
      tabs={tabs}
      activeTab={activeTab}
      onChange={onChange}
      counts={counts}
    />
  )
}

export default ProjectTabs
