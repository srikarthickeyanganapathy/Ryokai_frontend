import React, { useMemo } from 'react'
import { motion } from 'framer-motion'
import { ArrowRight, Users, AlertTriangle, Activity, CalendarClock, Plus, CheckCircle2, FolderKanban, MessageSquare } from 'lucide-react'
import { Heading, Text } from '@/shared/ui/Typography'
import { Button } from '@/shared/ui/Button'
import { Badge } from '@/shared/ui/Badge'
import { Avatar, AvatarFallback } from '@/shared/ui/Avatar'
import { ProgressRing, ProgressBar } from '@/shared/ui/Progress'
import { StatusBadge } from '@/shared/ui/StatusBadge'
import { PriorityBadge } from '@/shared/ui/PriorityBadge'
import { EmptyState } from '@/shared/ui/EmptyState'
import { cn } from '@/shared/lib/cn'
import { TeamIdentity } from './TeamIdentity'

/* ============================================================
   components/OverviewTab.jsx — team command center.
   Health strip (ring + status + overdue / in progress / due this
   week) that routes into Work, open-task triage, project
   progress, a member strip and a Recents + Upcoming rail.
   All numbers derive from real team / tasks / projects / feed.
   ============================================================ */

function hashHue(str = '') {
  let h = 0
  for (let i = 0; i < str.length; i++) h = str.charCodeAt(i) + ((h << 5) - h)
  return Math.abs(h) % 360
}

function daysUntil(dateInput) {
  if (!dateInput) return null
  const d = new Date(dateInput)
  if (isNaN(d.getTime())) return null
  return Math.round((d.setHours(0, 0, 0, 0) - new Date().setHours(0, 0, 0, 0)) / 86400000)
}

function dueInfo(dateInput) {
  const d = daysUntil(dateInput)
  if (d == null) return null
  if (d < 0) return { label: d === -1 ? 'Overdue' : `${Math.abs(d)}d overdue`, tone: 'danger' }
  if (d === 0) return { label: 'Today', tone: 'warning' }
  if (d <= 7) return { label: `${d}d`, tone: 'warning' }
  return { label: new Date(dateInput).toLocaleDateString(undefined, { month: 'short', day: 'numeric' }), tone: 'muted' }
}

function timeAgo(ts) {
  if (!ts) return ''
  const d = new Date(ts)
  if (isNaN(d.getTime())) return ''
  const s = Math.floor((Date.now() - d.getTime()) / 1000)
  if (s < 60) return 'just now'
  if (s < 3600) return `${Math.floor(s / 60)}m ago`
  if (s < 86400) return `${Math.floor(s / 3600)}h ago`
  return `${Math.floor(s / 86400)}d ago`
}

const isDone = t => (t.currentStatus || t.status || '').toUpperCase() === 'DONE'
const isReview = t => /REVIEW|SUBMITTED/.test((t.currentStatus || t.status || '').toUpperCase())
const isOpen = t => !isDone(t)

function HealthStat({ icon: Icon, label, value, tone, onClick }) {
  return (
    <button onClick={onClick} className="flex items-center gap-2.5 rounded-xl px-3 py-2.5 text-left transition-colors hover:bg-[var(--bg-subtle)] cursor-pointer">
      <span className={cn('w-8 h-8 rounded-lg flex items-center justify-center shrink-0',
        tone === 'danger' ? 'bg-[var(--danger)]/10 text-[var(--danger)]' : tone === 'warning' ? 'bg-[var(--warning)]/10 text-[var(--warning)]' : 'bg-[var(--accent-soft)] text-[var(--accent)]')}>
        <Icon className="w-3.5 h-3.5" strokeWidth={2} />
      </span>
      <span>
        <span className="block text-[15px] font-bold leading-none tabular-nums">{value}</span>
        <span className="block text-[10.5px] font-semibold text-[var(--text-muted)] mt-0.5">{label}</span>
      </span>
    </button>
  )
}

export function OverviewTab({
  team,
  insights,
  teamTasks,
  teamProjects,
  members,
  activityFeed,
  observerCount,
  canManage,
  isReadOnly,
  onManageMembers,
  onCreateProject,
  onOpenTasks,
  onOpenProjects,
}) {
  const totalTasks = teamTasks.length
  const doneTasks = teamTasks.filter(isDone).length

  const healthScore = useMemo(() => {
    if (totalTasks === 0 && teamProjects.length === 0) return 100
    return Math.round((doneTasks / Math.max(totalTasks, 1)) * 60 + (insights?.balanceScore ?? 50) / 100 * 40)
  }, [totalTasks, doneTasks, teamProjects.length, insights])

  const healthStatus = healthScore >= 80 ? 'Thriving' : healthScore >= 60 ? 'On track' : healthScore >= 40 ? 'Slipping' : 'At risk'
  const healthTone = healthScore >= 80 ? 'success' : healthScore >= 60 ? 'accent' : healthScore >= 40 ? 'warning' : 'danger'

  const overdue = teamTasks.filter(t => isOpen(t) && daysUntil(t.dueDate) != null && daysUntil(t.dueDate) < 0).length
  const inProgress = teamTasks.filter(isOpen).length
  const dueThisWeek = teamTasks.filter(t => { const d = daysUntil(t.dueDate); return isOpen(t) && d != null && d >= 0 && d <= 7 }).length

  const openTasks = useMemo(() => teamTasks.filter(isOpen).sort((a, b) => (daysUntil(a.dueDate) ?? 999) - (daysUntil(b.dueDate) ?? 999)).slice(0, 5), [teamTasks])

  const upcoming = useMemo(() => teamTasks
    .filter(t => isOpen(t) && daysUntil(t.dueDate) != null && daysUntil(t.dueDate) >= 0)
    .sort((a, b) => daysUntil(a.dueDate) - daysUntil(b.dueDate))
    .slice(0, 5), [teamTasks])

  const recents = useMemo(() => [...(activityFeed || [])]
    .sort((a, b) => new Date(b.timestamp || 0) - new Date(a.timestamp || 0))
    .slice(0, 5), [activityFeed])

  return (
    <motion.div initial={{ opacity: 0, y: 8 }} animate={{ opacity: 1, y: 0 }} className="pt-4">
      {/* ---------- Health strip ---------- */}
      <div className="bg-[var(--bg-card)] border border-[var(--border-subtle)] rounded-2xl shadow-[var(--shadow-xs)] p-4 flex flex-col sm:flex-row sm:items-center gap-4">
        <div className="flex items-center gap-3 shrink-0">
          <ProgressRing value={healthScore} size={62} strokeWidth={5}>
            <span className="text-[12px] font-bold tabular-nums">{healthScore}%</span>
          </ProgressRing>
          <div>
            <p className="text-[13px] font-bold leading-none">Team health</p>
            <Badge variant={healthTone === 'success' ? 'success' : healthTone === 'warning' ? 'warning' : healthTone === 'danger' ? 'danger' : 'accent'} className="mt-1.5">{healthStatus}</Badge>
          </div>
        </div>
        <div className="grid grid-cols-1 sm:grid-cols-3 gap-1 flex-1">
          <HealthStat icon={AlertTriangle} label="Overdue" value={overdue} tone="danger" onClick={onOpenTasks} />
          <HealthStat icon={Activity} label="In progress" value={inProgress} tone="accent" onClick={onOpenTasks} />
          <HealthStat icon={CalendarClock} label="Due this week" value={dueThisWeek} tone="warning" onClick={onOpenTasks} />
        </div>
      </div>

      {/* ---------- Main grid ---------- */}
      <div className="mt-4 grid grid-cols-1 lg:grid-cols-[minmax(0,1fr)_300px] gap-4 items-start">
        <div className="space-y-4 min-w-0">
          {/* Open tasks */}
          <section className="bg-[var(--bg-card)] border border-[var(--border-subtle)] rounded-2xl shadow-[var(--shadow-xs)] overflow-hidden">
            <header className="flex items-center gap-2 px-4 py-3 border-b border-[var(--border-subtle)]">
              <Heading level={4} className="text-[13px] font-bold flex-1">Open tasks</Heading>
              <Badge variant="neutral">{teamTasks.length}</Badge>
              <Button size="xs" variant="ghost" className="gap-1 text-[11px]" onClick={onOpenTasks}>
                View all <ArrowRight className="w-3 h-3" />
              </Button>
            </header>
            <div className="divide-y divide-[var(--border-subtle)]">
              {openTasks.length === 0 ? (
                <EmptyState icon={Activity} title="All caught up" description="No open tasks right now." className="min-h-[110px]" />
              ) : openTasks.map(t => {
                const due = dueInfo(t.dueDate)
                return (
                  <div key={t.id} className="flex items-center gap-3 px-4 py-2.5">
                    <span className={cn('w-1.5 h-1.5 rounded-full shrink-0', due?.tone === 'danger' ? 'bg-[var(--danger)]' : due?.tone === 'warning' ? 'bg-[var(--warning)]' : 'bg-[var(--accent)]')} />
                    <span className="flex-1 min-w-0 truncate text-[12.5px] font-medium">{t.title}</span>
                    <PriorityBadge priority={t.priority} />
                    {due && <Badge variant={due.tone === 'danger' ? 'danger' : due.tone === 'warning' ? 'warning' : 'outline'} className="text-[10px] shrink-0">{due.label}</Badge>}
                    <AssigneeAvatar name={typeof t.assignedTo === 'string' ? t.assignedTo : t.assignee?.username || t.assignedTo?.username} />
                  </div>
                )
              })}
            </div>
          </section>

          {/* Projects */}
          <section className="bg-[var(--bg-card)] border border-[var(--border-subtle)] rounded-2xl shadow-[var(--shadow-xs)] overflow-hidden">
            <header className="flex items-center gap-2 px-4 py-3 border-b border-[var(--border-subtle)]">
              <Heading level={4} className="text-[13px] font-bold flex-1">Projects</Heading>
              {!isReadOnly && canManage && (
                <Button size="xs" variant="outline" className="gap-1 text-[11px]" onClick={onCreateProject}>
                  <Plus className="w-3 h-3" /> New
                </Button>
              )}
              <Button size="xs" variant="ghost" className="gap-1 text-[11px]" onClick={onOpenProjects}>
                View all <ArrowRight className="w-3 h-3" />
              </Button>
            </header>
            <div className="divide-y divide-[var(--border-subtle)]">
              {teamProjects.length === 0 ? (
                <EmptyState icon={Users} title="No projects yet" description="Projects this team owns will show here." className="min-h-[110px]" />
              ) : teamProjects.slice(0, 4).map(p => {
                const progress = typeof p.progress === 'number' ? p.progress : 0
                return (
                  <div key={p.id} className="px-4 py-3">
                    <div className="flex items-center gap-2 mb-1.5">
                      <span className="flex-1 min-w-0 truncate text-[12.5px] font-medium">{p.name}</span>
                      <StatusBadge status={p.status} variant="pill" />
                      <span className="text-[11px] font-bold tabular-nums text-[var(--text-muted)]">{progress}%</span>
                    </div>
                    <ProgressBar value={progress} height={4} />
                  </div>
                )
              })}
            </div>
          </section>

          {/* Member strip */}
          <section className="bg-[var(--bg-card)] border border-[var(--border-subtle)] rounded-2xl shadow-[var(--shadow-xs)] p-4">
            <header className="flex items-center gap-2 mb-3">
              <Heading level={4} className="text-[13px] font-bold flex-1">Members</Heading>
              {canManage && (
                <Button size="xs" variant="outline" className="text-[11px]" onClick={onManageMembers}>Manage</Button>
              )}
            </header>
            {members.length === 0 ? (
              <p className="text-[12px] text-[var(--text-muted)] py-1">No members yet.</p>
            ) : (
              <div className="flex items-center gap-3 flex-wrap">
                <div className="flex -space-x-2">
                  {members.slice(0, 8).map(m => (
                    <Avatar key={m.username || m.id} className="w-8 h-8 border-2 border-[var(--bg-card)]" title={m.username || m.name}>
                      <AvatarFallback className="text-[10px] font-bold" style={{ background: `hsl(${hashHue(m.username || m.name)} 65% 48%)`, color: '#fff' }}>
                        {(m.username || m.name || '?').charAt(0).toUpperCase()}
                      </AvatarFallback>
                    </Avatar>
                  ))}
                </div>
                <div className="min-w-0">
                  <p className="text-[12px] font-semibold truncate">{members.map(m => m.username || m.name).slice(0, 3).join(', ')}{members.length > 3 ? ` +${members.length - 3} more` : ''}</p>
                  <p className="text-[10.5px] text-[var(--text-muted)]">
                    {members.length} member{members.length !== 1 ? 's' : ''}
                    {observerCount > 0 && ` Â· ${observerCount} observer${observerCount !== 1 ? 's' : ''}`}
                  </p>
                </div>
              </div>
            )}
          </section>
        </div>

        {/* ---------- Rail ---------- */}
        <aside className="space-y-4">
          <section className="bg-[var(--bg-card)] border border-[var(--border-subtle)] rounded-2xl shadow-[var(--shadow-xs)] p-4">
            <Heading level={4} className="text-[13px] font-bold mb-3 flex items-center gap-2">
              <Activity className="w-3.5 h-3.5 text-[var(--accent)]" /> Recents
            </Heading>
            {recents.length === 0 ? (
              <p className="text-[11.5px] text-[var(--text-muted)] py-1">No activity yet.</p>
            ) : (
              <div className="space-y-2.5">
                {recents.map((a, i) => {
                  const who = a.user || a.actor || a.username || 'Someone'
                  const target = a.target ? ` "${a.target}"` : ''
                  const icon = a.type === 'task_completed'
                    ? <CheckCircle2 className="w-3 h-3 text-[var(--success)]" />
                    : a.type === 'project_created'
                      ? <FolderKanban className="w-3 h-3 text-[var(--accent)]" />
                      : <MessageSquare className="w-3 h-3 text-[var(--accent)]" />
                  return (
                    <div key={a.id || i} className="flex items-start gap-2">
                      <span className="w-6 h-6 rounded-lg bg-[var(--bg-subtle)] flex items-center justify-center shrink-0 mt-0.5">{icon}</span>
                      <p className="text-[11.5px] leading-snug min-w-0 flex-1">
                        <span className="font-semibold text-[var(--text-primary)]">{who}</span>{' '}
                        <span className="text-[var(--text-secondary)]">{a.action || 'did something'}{target}</span>
                      </p>
                      <span className="text-[9.5px] text-[var(--text-muted)] font-mono shrink-0">{a.time || ''}</span>
                    </div>
                  )
                })}
              </div>
            )}
          </section>

          <section className="bg-[var(--bg-card)] border border-[var(--border-subtle)] rounded-2xl shadow-[var(--shadow-xs)] p-4">
            <Heading level={4} className="text-[13px] font-bold mb-3 flex items-center gap-2">
              <CalendarClock className="w-3.5 h-3.5 text-[var(--accent)]" /> Upcoming
            </Heading>
            {upcoming.length === 0 ? (
              <p className="text-[11.5px] text-[var(--text-muted)] py-1">Nothing scheduled.</p>
            ) : (
              <div className="space-y-2">
                {upcoming.map(t => {
                  const due = dueInfo(t.dueDate)
                  return (
                    <div key={t.id} className="flex items-center gap-2">
                      <span className="flex-1 min-w-0 truncate text-[11.5px]">{t.title}</span>
                      {due && <Badge variant={due.tone === 'warning' ? 'warning' : 'outline'} className="text-[9.5px] shrink-0">{due.label}</Badge>}
                    </div>
                  )
                })}
              </div>
            )}
          </section>
        </aside>
      </div>

      <hr className="border-[var(--border-subtle)] my-8" />
      
      {/* ---------- Team Identity ---------- */}
      <section>
        <TeamIdentity team={team} />
      </section>
    </motion.div>
  )
}

export function AssigneeAvatar({ name }) {
  if (!name) return <span className="w-6 h-6 rounded-lg bg-[var(--bg-subtle)] border border-[var(--border-subtle)] shrink-0" />
  return (
    <Avatar className="w-6 h-6 shrink-0" title={name}>
      <AvatarFallback className="text-[9px] font-bold" style={{ background: `hsl(${hashHue(name)} 65% 48%)`, color: '#fff' }}>
        {name.charAt(0).toUpperCase()}
      </AvatarFallback>
    </Avatar>
  )
}

export default OverviewTab
