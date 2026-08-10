import React, { useMemo, useState } from 'react'
import { motion, AnimatePresence } from 'framer-motion'
import { Heading, Text } from '@/shared/ui/Typography'
import { Badge } from '@/shared/ui/Badge'
import { Icons } from '@/shared/ui/Icons'
import { cn } from '@/shared/lib/cn'
import { SPRINGS } from '@/shared/lib/uxTokens'
import { normalizePriority } from '@/shared/lib/priority'

/* ══════════════════════════════════════════════════════
   Helpers
   ══════════════════════════════════════════════════════ */


import { formatTimeAgo, hashHue, SprintProgressRing, BottleneckDetector, RiskRadar, AiWeeklyDigest, RecentWins, VelocitySparkline, HealthGauge, WorkloadDistribution, ProjectProgress, UpcomingDeadlines } from '@/shared/ui/OverviewWidgets';

export function OverviewTab({
  team, insights, teamTasks, teamProjects, observerCount, hasTaskTimestamps,
  hasProjectIdOnTasks, canCreateProject, canAssignTask, canManage, isReadOnly,
  onManageMembers, onCreateProject, onAssignTask, onOpenChat, onOpenTasks, setActiveTab
}) {
  const totalTasks = teamTasks.length
  const doneTasks = teamTasks.filter(t => t.status === 'Done' || t.status === 'COMPLETED').length
  const activeTasksList = teamTasks.filter(t => {
    const s = String(t.status || '').toUpperCase()
    return s === 'IN_PROGRESS' || s === 'REVIEW' || s === 'DOING' || s === 'IN PROGRESS'
  })
  const isTeamEmpty = totalTasks === 0 && teamProjects.length === 0

  const healthScore = useMemo(() => {
    if (isTeamEmpty) return 100
    return Math.round((doneTasks / Math.max(totalTasks, 1)) * 60 + (insights.balanceScore / 100) * 40)
  }, [totalTasks, doneTasks, insights.balanceScore, isTeamEmpty])

  // Activity feed — merged tasks + messages
  const activityFeed = useMemo(() => {
    const events = []
    teamTasks.slice(0, 10).forEach(task => {
      events.push({
        id: `t-${task.id}`, title: task.title, status: task.status || 'TODO',
        timestamp: task.updatedAt || task.createdAt || new Date().toISOString(),
        actor: task.assignedTo || 'Unassigned', type: 'task',
      })
    })
    return events.sort((a, b) => new Date(b.timestamp) - new Date(a.timestamp)).slice(0, 6)
  }, [teamTasks])

  // Workload computation from members
  const workload = useMemo(() => {
    const counts = {}
    team?.members?.forEach(m => { counts[m.username] = 0 })
    teamTasks.forEach(t => {
      if (t.assignedTo && t.status !== 'Done' && !t.archived) counts[t.assignedTo] = (counts[t.assignedTo] || 0) + 1
    })
    return counts
  }, [team, teamTasks])

  /* ── Empty State ── */
  if (isTeamEmpty) {
    return (
      <motion.div initial={{ opacity: 0, y: 8 }} animate={{ opacity: 1, y: 0 }} className="py-12">
        <div className="text-center py-16 bg-[var(--bg-card)] border border-dashed border-[var(--border-subtle)] rounded-2xl">
          <div className="w-12 h-12 rounded-2xl bg-[var(--bg-subtle)] flex items-center justify-center mx-auto mb-4">
            <Icons.target className="w-5 h-5 text-[var(--text-muted)]" />
          </div>
          <Heading level={4} className="text-[14px] font-semibold mb-1">No data yet</Heading>
          <Text variant="muted" size="sm">Create projects and assign tasks to see Pulse analytics here.</Text>
          {canCreateProject && !isReadOnly && (
            <button
              onClick={onCreateProject}
              className="inline-flex items-center gap-1.5 mt-4 px-4 py-2 bg-[var(--accent)] text-white text-[12px] font-semibold rounded-lg hover:opacity-90 transition-opacity"
            >
              <Icons.plus className="w-3.5 h-3.5" /> Create First Project
            </button>
          )}
        </div>
      </motion.div>
    )
  }

  return (
    <motion.div
      initial={{ opacity: 0, y: 8 }}
      animate={{ opacity: 1, y: 0 }}
      transition={SPRINGS.normal}
      className="py-5 space-y-4"
    >
      {/* ── AI Weekly Digest ── */}
      <AiWeeklyDigest tasks={teamTasks} doneTasks={doneTasks} />

      {/* ── Team Health Dashboard: 3-column analytical ── */}
      <div className="grid grid-cols-1 lg:grid-cols-3 gap-4">
        {/* Sprint Progress Ring */}
        <div className="bg-[var(--bg-card)] border border-[var(--border-subtle)] rounded-xl p-4 shadow-sm">
          <div className="flex items-center gap-2 mb-1">
            <Icons.zap className="w-4 h-4 text-[var(--accent)]" />
            <Heading level={4} className="text-[13px] font-semibold">Sprint Progress</Heading>
          </div>
          <SprintProgressRing tasks={teamTasks} />
        </div>

        {/* Bottleneck Detector */}
        <div className="bg-[var(--bg-card)] border border-[var(--border-subtle)] rounded-xl p-4 shadow-sm">
          <div className="flex items-center gap-2 mb-3">
            <Icons.alertTriangle className="w-4 h-4 text-amber-500" />
            <Heading level={4} className="text-[13px] font-semibold">Flow Analysis</Heading>
          </div>
          <BottleneckDetector tasks={teamTasks} />
        </div>

        {/* Risk Radar */}
        <div className="bg-[var(--bg-card)] border border-[var(--border-subtle)] rounded-xl p-4 shadow-sm">
          <div className="flex items-center gap-2 mb-3">
            <Icons.shieldAlert className="w-4 h-4 text-red-400" />
            <Heading level={4} className="text-[13px] font-semibold">Risk Radar</Heading>
          </div>
          <RiskRadar tasks={teamTasks} />
        </div>
      </div>

      {/* ── Active Task Pipeline + Deadlines ── */}
      <div className="grid grid-cols-1 lg:grid-cols-3 gap-4">
        {/* Active Tasks Pipeline (col-span-2) */}
        <div className="lg:col-span-2 bg-[var(--bg-card)] border border-[var(--border-subtle)] rounded-xl p-4 shadow-sm">
          <div className="flex items-center justify-between mb-3">
            <div className="flex items-center gap-2">
              <Icons.zap className="w-4 h-4 text-violet-500" />
              <Heading level={4} className="text-[13px] font-semibold">Active Pipeline</Heading>
              <Badge variant="primary" size="xs" className="text-[9px]">{activeTasksList.length}</Badge>
            </div>
            <button onClick={() => setActiveTab('tasks')} className="text-[11px] font-medium text-[var(--accent)] hover:underline">
              Board →
            </button>
          </div>

          {activeTasksList.length === 0 ? (
            <div className="py-6 text-center bg-[var(--bg-subtle)]/40 rounded-xl border border-dashed border-[var(--border-subtle)]">
              <Icons.checkCircle2 className="w-6 h-6 text-[var(--success)] mx-auto mb-2 opacity-60" />
              <Text size="xs" variant="muted">All tasks completed or in backlog.</Text>
            </div>
          ) : (
            <div className="space-y-1.5">
              {activeTasksList.slice(0, 6).map(task => {
                const isReview = String(task.status).toUpperCase().includes('REVIEW')
                const priority = normalizePriority(task.priority)
                const priColors = { URGENT: 'bg-red-500', HIGH: 'bg-orange-500', MEDIUM: 'bg-yellow-500', LOW: 'bg-blue-500' }
                return (
                  <div
                    key={task.id}
                    onClick={() => setActiveTab('tasks')}
                    className="flex items-center gap-3 p-2.5 rounded-lg hover:bg-[var(--bg-subtle)] transition-colors cursor-pointer group"
                  >
                    <div className={cn('w-1 h-7 rounded-full shrink-0', isReview ? 'bg-purple-400' : 'bg-[var(--accent)]')} />
                    <div className="min-w-0 flex-1">
                      <span className="text-[12px] font-medium text-[var(--text-primary)] truncate block group-hover:text-[var(--accent)] transition-colors">
                        {task.title}
                      </span>
                      <div className="flex items-center gap-2 text-[10px] text-[var(--text-muted)] mt-0.5">
                        <span>{task.assignedTo || 'Unassigned'}</span>
                        <span>·</span>
                        <span>{formatTimeAgo(task.updatedAt || task.createdAt)}</span>
                      </div>
                    </div>
                    <div className="flex items-center gap-1.5 shrink-0">
                      <span className={cn('w-1.5 h-1.5 rounded-full', priColors[priority] || 'bg-gray-400')} />
                      <Badge variant={isReview ? 'warning' : 'primary'} size="xs" className="text-[9px]">
                        {isReview ? 'Review' : 'Active'}
                      </Badge>
                    </div>
                  </div>
                )
              })}
            </div>
          )}
        </div>

        {/* Upcoming Deadlines */}
        <div className="bg-[var(--bg-card)] border border-[var(--border-subtle)] rounded-xl p-4 shadow-sm">
          <div className="flex items-center gap-2 mb-3">
            <Icons.calendar className="w-4 h-4 text-amber-500" />
            <Heading level={4} className="text-[13px] font-semibold">Deadlines</Heading>
          </div>
          <UpcomingDeadlines tasks={teamTasks} />
        </div>
      </div>

      {/* ── Health Score + Workload + Recent Wins ── */}
      <div className="grid grid-cols-1 lg:grid-cols-3 gap-4">
        {/* Team Health */}
        <div className="bg-[var(--bg-card)] border border-[var(--border-subtle)] rounded-xl p-4 shadow-sm">
          <div className="flex items-center gap-2 mb-3">
            <Icons.activity className="w-4 h-4 text-emerald-500" />
            <Heading level={4} className="text-[13px] font-semibold">Health Score</Heading>
          </div>
          <div className="flex items-center gap-4">
            <HealthGauge score={healthScore} />
            <div className="space-y-2.5 flex-1">
              <div className="flex items-center justify-between">
                <span className="text-[10px] uppercase font-semibold text-[var(--text-muted)] tracking-wider">Completion</span>
                <span className="text-[13px] font-bold text-[var(--success)] tabular-nums">{insights.completionRate}%</span>
              </div>
              <div className="flex items-center justify-between">
                <span className="text-[10px] uppercase font-semibold text-[var(--text-muted)] tracking-wider">Balance</span>
                <span className="text-[13px] font-bold text-[var(--text-primary)] tabular-nums">{insights.balanceScore}%</span>
              </div>
              <div className="flex items-center justify-between">
                <span className="text-[10px] uppercase font-semibold text-[var(--text-muted)] tracking-wider">Unassigned</span>
                <span className="text-[13px] font-bold text-[var(--warning)] tabular-nums">{insights.unassignedCount}</span>
              </div>
              {insights.highPriorityCount > 0 && (
                <div className="flex items-center justify-between">
                  <span className="text-[10px] uppercase font-semibold text-[var(--text-muted)] tracking-wider">High Pri</span>
                  <span className="text-[13px] font-bold text-[var(--danger)] tabular-nums">{insights.highPriorityCount}</span>
                </div>
              )}
            </div>
          </div>
          <div className="mt-3 pt-3 border-t border-[var(--border-subtle)]">
            <div className="h-1.5 w-full bg-[var(--bg-subtle)] rounded-full overflow-hidden">
              <motion.div
                initial={{ width: 0 }}
                animate={{ width: `${insights.completionRate}%` }}
                transition={{ duration: 0.6, ease: 'easeOut' }}
                className="h-full rounded-full bg-[var(--accent)]"
              />
            </div>
            <div className="flex items-center justify-between mt-1.5">
              <Text size="xs" variant="muted">{doneTasks} done</Text>
              <Text size="xs" variant="muted">{totalTasks - doneTasks} remaining</Text>
            </div>
          </div>
        </div>

        {/* Workload Distribution */}
        <div className="bg-[var(--bg-card)] border border-[var(--border-subtle)] rounded-xl p-4 shadow-sm">
          <div className="flex items-center justify-between mb-3">
            <div className="flex items-center gap-2">
              <Icons.barChart className="w-4 h-4 text-sky-500" />
              <Heading level={4} className="text-[13px] font-semibold">Workload</Heading>
            </div>
            <button onClick={() => setActiveTab('members')} className="text-[11px] font-medium text-[var(--accent)] hover:underline">
              Details →
            </button>
          </div>
          <WorkloadDistribution workload={workload} />
        </div>

        {/* Recent Wins */}
        <div className="bg-[var(--bg-card)] border border-[var(--border-subtle)] rounded-xl p-4 shadow-sm">
          <div className="flex items-center gap-2 mb-3">
            <Icons.award className="w-4 h-4 text-amber-500" />
            <Heading level={4} className="text-[13px] font-semibold">Recent Wins</Heading>
          </div>
          <RecentWins tasks={teamTasks} />
        </div>
      </div>

      {/* ── Team Velocity + Project Progress ── */}
      <div className="grid grid-cols-1 lg:grid-cols-2 gap-4">
        {/* Team Velocity Sparkline */}
        <div className="bg-[var(--bg-card)] border border-[var(--border-subtle)] rounded-xl p-4 shadow-sm">
          <div className="flex items-center gap-2 mb-1">
            <Icons.trendingUp className="w-4 h-4 text-blue-500" />
            <Heading level={4} className="text-[13px] font-semibold">Velocity</Heading>
          </div>
          <VelocitySparkline tasks={teamTasks} />
        </div>

        {/* Project Progress */}
        <div className="bg-[var(--bg-card)] border border-[var(--border-subtle)] rounded-xl p-4 shadow-sm">
          <div className="flex items-center justify-between mb-3">
            <div className="flex items-center gap-2">
              <Icons.folder className="w-4 h-4 text-amber-500" />
              <Heading level={4} className="text-[13px] font-semibold">Projects</Heading>
            </div>
            <button onClick={() => setActiveTab('projects')} className="text-[11px] font-medium text-[var(--accent)] hover:underline">
              All →
            </button>
          </div>
          <ProjectProgress projects={teamProjects} tasksForProject={(pid) => hasProjectIdOnTasks ? teamTasks.filter(t => t.projectId === pid) : []} />
        </div>
      </div>

      {/* ── Activity Timeline ── */}
      <div className="bg-[var(--bg-card)] border border-[var(--border-subtle)] rounded-xl p-4 shadow-sm">
        <div className="flex items-center justify-between mb-3">
          <div className="flex items-center gap-2">
            <Icons.clock className="w-4 h-4 text-[var(--accent)]" />
            <Heading level={4} className="text-[13px] font-semibold">Activity Stream</Heading>
          </div>
          <Badge variant="outline" size="xs" className="text-[10px]">Last {Math.min(activityFeed.length, 6)}</Badge>
        </div>

        {activityFeed.length === 0 ? (
          <Text size="xs" variant="muted" className="italic py-3">No recent activity.</Text>
        ) : (
          <div className="relative pl-5 space-y-3 before:absolute before:left-2 before:top-2 before:bottom-2 before:w-0.5 before:bg-[var(--border-subtle)]">
            {activityFeed.map((event) => (
              <div key={event.id} className="relative flex items-start gap-2.5">
                <div className="absolute -left-5 top-1 w-3 h-3 rounded-full bg-[var(--bg-card)] border-2 border-[var(--accent)] flex items-center justify-center shrink-0">
                  <div className="w-1 h-1 rounded-full bg-[var(--accent)]" />
                </div>
                <div className="min-w-0 flex-1">
                  <div className="flex items-center justify-between gap-2">
                    <span className="text-[12px] font-medium text-[var(--text-primary)] truncate">{event.title}</span>
                    <span className="text-[10px] text-[var(--text-muted)] font-mono shrink-0">{formatTimeAgo(event.timestamp)}</span>
                  </div>
                  <div className="flex items-center gap-2 text-[10px] text-[var(--text-secondary)] mt-0.5">
                    <span>{event.actor}</span>
                    <span>·</span>
                    <Badge variant={event.type === 'message' ? 'secondary' : 'primary'} size="xs" className="text-[9px]">{event.status}</Badge>
                  </div>
                </div>
              </div>
            ))}
          </div>
        )}
      </div>
    </motion.div>
  )
}
