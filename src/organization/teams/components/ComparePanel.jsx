import React from 'react'
import { motion } from 'framer-motion'
import { Heading } from '@/shared/ui/Typography'
import { Icons } from '@/shared/ui/Icons'
import { TeamAvatar } from './TeamAvatar'
import { CompareBar } from './CompareBar'
import { hashHue } from './utils'

/* ===
 * COMPARISON PANEL (BOTTOM DRAWER) -- extracted from TeamsPage
 * === */

export function ComparePanel({ teams, statsMap, onClose }) {
  if (teams.length === 0) return null
  const hues = teams.map(t => hashHue(t.name))

  const memberCounts = teams.map(t => t.members?.length ?? 0)
  const completionRates = teams.map(t => statsMap[t.id]?.completionRate ?? 0)
  const taskCounts = teams.map(t => statsMap[t.id]?.taskCount ?? 0)
  const projectCounts = teams.map(t => statsMap[t.id]?.projectCount ?? 0)
  const maxMembers = Math.max(...memberCounts, 1)
  const maxTasks = Math.max(...taskCounts, 1)
  const maxProjects = Math.max(...projectCounts, 1)

  return (
    <motion.div
      initial={{ y: '100%' }}
      animate={{ y: 0 }}
      exit={{ y: '100%' }}
      transition={{ type: 'spring', stiffness: 300, damping: 30 }}
      className="fixed bottom-0 left-0 right-0 z-50 bg-[var(--bg-card)] border-t border-[var(--border-subtle)] rounded-t-2xl shadow-2xl max-h-[55vh] overflow-y-auto"
    >
      <div className="sticky top-0 bg-[var(--bg-card)] z-10 px-6 py-4 border-b border-[var(--border-subtle)] flex items-center justify-between rounded-t-2xl">
        <div className="flex items-center gap-3">
          <Icons.scale className="w-5 h-5 text-[var(--accent)]" />
          <Heading level={3} className="text-[15px] font-semibold">
            Comparing {teams.length} Teams
          </Heading>
          <div className="flex -space-x-1">
            {teams.map(t => (
              <TeamAvatar key={t.id} name={t.name} size="sm" hue={hashHue(t.name)} />
            ))}
          </div>
        </div>
        <button
          onClick={onClose}
          className="p-2 rounded-lg hover:bg-[var(--bg-subtle)] text-[var(--text-muted)] hover:text-[var(--text-primary)] transition-colors"
        >
          <Icons.x className="w-4 h-4" />
        </button>
      </div>

      <div className="p-6 space-y-5">
        <CompareBar label="Members" values={memberCounts} max={maxMembers} hues={hues} />
        <CompareBar label="Task Completion %" values={completionRates} max={100} hues={hues} />
        <CompareBar label="Total Tasks" values={taskCounts} max={maxTasks} hues={hues} />
        <CompareBar label="Active Projects" values={projectCounts} max={maxProjects} hues={hues} />
      </div>
    </motion.div>
  )
}
