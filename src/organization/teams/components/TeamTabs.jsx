import React from 'react'
import { LayoutDashboard, KanbanSquare, Users, MessageSquare, ChartColumn, Pencil } from 'lucide-react'
import { DetailTabs } from '@/shared/ui/DetailTabs'

/* ============================================================
   components/TeamTabs.jsx -- 5-chunk tab bar (Overview / Work /
   People / Discussion / Insights) built on shared DetailTabs.
   ============================================================ */

export const TEAM_TABS = [
  { id: 'overview', label: 'Overview', icon: LayoutDashboard },
  { id: 'work', label: 'Work', icon: KanbanSquare },
  { id: 'whiteboards', label: 'Whiteboards', icon: Pencil },
  { id: 'people', label: 'People', icon: Users },
  { id: 'discussion', label: 'Discussion', icon: MessageSquare },
  { id: 'insights', label: 'Insights', icon: ChartColumn },
]

export function TeamTabs({ activeTab, onChange, counts = {} }) {
  return (
    <DetailTabs
      tabs={TEAM_TABS}
      activeTab={activeTab}
      onChange={onChange}
      counts={counts}
      sticky={false}
    />
  )
}

export default TeamTabs
