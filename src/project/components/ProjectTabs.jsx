import React from 'react'
import { LayoutDashboard, KanbanSquare, Activity, Github } from 'lucide-react'
import { DetailTabs } from '@/shared/ui/DetailTabs'

/* ============================================================
   components/ProjectTabs.jsx — project tab bar on shared
   DetailTabs: Overview / Task Board / Repositories / Activity.
   ============================================================ */

export const PROJECT_TABS = [
  { id: 'overview', label: 'Overview', icon: LayoutDashboard },
  { id: 'tasks', label: 'Task Board', icon: KanbanSquare },
  { id: 'repos', label: 'Repositories', icon: Github },
  { id: 'activity', label: 'Activity', icon: Activity },
]

export function ProjectTabs({ activeTab, onChange, counts = {} }) {
  return (
    <DetailTabs
      tabs={PROJECT_TABS}
      activeTab={activeTab}
      onChange={onChange}
      counts={counts}
    />
  )
}

export default ProjectTabs
