import React, { useMemo, useState } from 'react'
import { motion } from 'framer-motion'
import { Users, Crown, Star, UserPlus, Mail, Briefcase, CalendarDays, ChevronRight, ShieldCheck, UserCheck } from 'lucide-react'
import { Button } from '@/shared/ui/Button'
import { EmptyState } from '@/shared/ui/EmptyState'
import { PillNav } from '@/shared/ui/PillNav'
import { Badge } from '@/shared/ui/Badge'
import { cn } from '@/shared/lib/cn'

/* ============================================================
   components/MembersTab.jsx — People grid (demo-faithful).
   Compact member cards: aura avatar, lead crown + Lead chip,
   workload bar (red at the busiest / amber from 80%), and a
   last-active footer. All / Leads / Me filter. Workload and
   stats derive from the page's real workload map + team data.
   Manage opens the page's real ManageTeamMembersModal.
   ============================================================ */

function hashHue(str = '') {
  let h = 0
  for (let i = 0; i < str.length; i++) h = str.charCodeAt(i) + ((h << 5) - h)
  return Math.abs(h) % 360
}

function timeAgo(dateInput) {
  if (!dateInput) return null
  const d = new Date(dateInput)
  if (isNaN(d.getTime())) return null
  const s = Math.floor((Date.now() - d.getTime()) / 1000)
  if (s < 60) return 'just now'
  if (s < 3600) return `${Math.floor(s / 60)}m ago`
  if (s < 86400) return `${Math.floor(s / 3600)}h ago`
  if (s < 604800) return `${Math.floor(s / 86400)}d ago`
  return d.toLocaleDateString(undefined, { month: 'short', day: 'numeric', year: 'numeric' })
}

function RoleBadge({ m, lead }) {
  if (lead) {
    return (
      <Badge variant="warning" size="xs" className="gap-1 font-mono uppercase tracking-wider">
        <Crown className="w-3 h-3" />
        Lead
      </Badge>
    );
  }
  if (m.role === 'ADMIN') {
    return (
      <Badge variant="primary" size="xs" className="gap-1 font-mono uppercase tracking-wider">
        <ShieldCheck className="w-3 h-3" />
        Admin
      </Badge>
    );
  }
  return (
    <Badge variant="outline" size="xs" className="gap-1 font-mono uppercase tracking-wider text-[var(--text-secondary)]">
      <UserCheck className="w-3 h-3" />
      Member
    </Badge>
  );
}

function PresenceChip({ away }) {
  if (away) {
    return (
      <span className="inline-flex items-center gap-1.5 text-[10px] font-medium text-[var(--warning)]">
        <span className="w-2 h-2 rounded-full bg-[var(--warning)]" />
        Away
      </span>
    );
  }
  return (
    <span className="inline-flex items-center gap-1.5 text-[10px] font-medium text-[var(--text-secondary)]">
      <span className="w-2 h-2 rounded-full bg-[var(--success)]" />
      Online
    </span>
  );
}

function getWorkloadStats(tasks, username) {
  let active = 0;
  let completed = 0;
  let total = 0;
  tasks.forEach(t => {
    if (t.assignedTo === username) {
      total++;
      if (t.status === 'Done') {
        completed++;
      } else if (!t.archived) {
        active++;
      }
    }
  });
  return { active, completed, total };
}

function getWorkloadStyle(active) {
  if (active >= 6) return { level: 'High', badgeClass: 'text-[var(--danger)] border-[var(--danger)]/30 bg-[var(--danger-soft)]', colorClass: 'bg-[var(--danger)]' };
  if (active >= 3) return { level: 'Medium', badgeClass: 'text-[var(--warning)] border-[var(--warning)]/30 bg-[var(--warning-soft)]', colorClass: 'bg-[var(--warning)]' };
  if (active > 0) return { level: 'Low', badgeClass: 'text-[var(--success)] border-[var(--success)]/30 bg-[var(--success-soft)]', colorClass: 'bg-[var(--success)]' };
  return { level: 'Idle', badgeClass: 'text-[var(--text-muted)] border-[var(--border-subtle)] bg-[var(--bg-subtle)]', colorClass: 'bg-[var(--bg-subtle)]' };
}


export function MembersTab({ team, workload = {}, teamTasks = [], hasProjectIdOnTasks, hasTaskTimestamps, canManage, user, onManageMembers }) {
  const [filter, setFilter] = useState('all')

  const members = team?.members || []
  const maxWorkload = Object.keys(workload).length ? Math.max(...Object.values(workload)) : 0

  const isLead = m => m.role === 'LEAD' || m.role === 'Lead' || m.isLead || m.username === team?.lead

  const visible = useMemo(() => {
    let list = members
    if (filter === 'leads') list = list.filter(isLead)
    else if (filter === 'me') list = list.filter(m => (m.username || m.name) === user?.username)
    return list
  }, [members, filter, user, team])

  return (
    <div className="pt-4">
      <div className="flex items-center gap-2 flex-wrap mb-4">
        <PillNav
          options={[{ value: 'all', label: 'All' }, { value: 'leads', label: 'Leads' }, { value: 'me', label: 'Me' }]}
          value={filter}
          onChange={setFilter}
        />
        <span className="ml-auto text-[12px] text-[var(--text-muted)]">{members.length} member{members.length !== 1 ? 's' : ''}</span>
        {canManage && (
          <Button variant="outline" size="sm" className="h-7 text-[11px] gap-1.5" onClick={onManageMembers}>
            <UserPlus className="w-3.5 h-3.5" /> Manage
          </Button>
        )}
      </div>

      {visible.length === 0 ? (
        <div className="bg-[var(--bg-card)] border border-[var(--border-subtle)] rounded-2xl shadow-[var(--shadow-xs)]">
          <EmptyState icon={Users} title="No members found" description="Adjust the filter or add members to the team." className="min-h-[180px]" />
        </div>
      ) : (
        <div className="grid grid-cols-1 sm:grid-cols-2 xl:grid-cols-4 gap-3.5">
          {visible.map((m, i) => {
            const name = m.username || m.name || 'Member'
            const lead = isLead(m)
            const lastActive = timeAgo(m.lastActive || m.last_active || m.activeAt || m.updatedAt)
            const away = m.away || m.status === 'away' || m.availability === 'away'
            const h = hashHue(name)
            
            const stats = getWorkloadStats(teamTasks, name)
            const style = getWorkloadStyle(stats.active)

            return (
              <motion.div key={m.id || name} initial={{ opacity: 0, y: 10 }} animate={{ opacity: 1, y: 0 }} transition={{ delay: Math.min(i * 0.03, 0.2), duration: 0.2 }}
                className="group bg-[var(--bg-card)] border border-[var(--border-subtle)] rounded-xl p-4 hover:border-[var(--accent-border)] hover:shadow-sm transition-all duration-200 cursor-pointer flex flex-col justify-between">
                <div>
                  {/* Card Header: Role Badge & Presence Status */}
                  <div className="flex items-center justify-between gap-2 mb-3">
                    <RoleBadge m={m} lead={lead} />
                    <PresenceChip away={away} />
                  </div>

                  {/* Member Identity */}
                  <div className="flex items-center gap-3 mb-3">
                    <div className="relative shrink-0">
                      <div className="w-10 h-10 rounded-xl flex items-center justify-center font-bold text-white shadow-sm border border-white/10 text-sm"
                        style={{ background: `linear-gradient(135deg, hsl(${h} 65% 48%), hsl(${(h + 35) % 360} 62% 34%))` }}>
                        {name.charAt(0).toUpperCase()}
                      </div>
                      <span className={cn('absolute -bottom-0.5 -right-0.5 rounded-full border-2 border-[var(--bg-card)] w-3 h-3', away ? 'bg-[var(--warning)]' : 'bg-[var(--success)]')} />
                    </div>
                    <div className="min-w-0 flex-1">
                      <div className="text-[14px] font-semibold text-[var(--text-primary)] tracking-tight truncate">{name}</div>
                      <div className="flex items-center gap-1 text-[11px] text-[var(--text-muted)] font-medium mt-0.5 truncate">
                        <Mail className="w-3 h-3 shrink-0" />
                        <span className="truncate">{m.email || 'No email registered'}</span>
                      </div>
                    </div>
                  </div>

                  {/* Workload Progress Bar */}
                  <div className="space-y-1.5 mb-3">
                    <div className="flex items-center justify-between">
                      <span className="text-[10px] font-mono uppercase tracking-wider text-[var(--text-muted)] font-semibold flex items-center gap-1">
                        <Briefcase className="w-3 h-3 text-[var(--accent)]" />
                        Active Workload
                      </span>
                      <Badge variant="outline" className={cn('text-[9px] px-1.5 py-0 font-semibold', style.badgeClass)}>
                        {style.level}
                      </Badge>
                    </div>
                    <div className="w-full h-1.5 bg-[var(--bg-subtle)] rounded-full overflow-hidden">
                      <div
                        className={cn('h-full rounded-full transition-all duration-500', style.colorClass)}
                        style={{ width: `${Math.min(100, Math.max(10, (stats.active / 6) * 100))}%` }}
                      />
                    </div>
                  </div>

                  {/* Workload Stat Cells */}
                  <div className="grid grid-cols-3 gap-2">
                    <div className="text-center bg-[var(--bg-subtle)] rounded-lg py-1.5">
                      <div className="text-sm font-bold text-[var(--text-primary)] tabular-nums">{stats.total}</div>
                      <div className="text-[9px] text-[var(--text-muted)] uppercase tracking-wider">Total</div>
                    </div>
                    <div className="text-center bg-[var(--bg-subtle)] rounded-lg py-1.5">
                      <div className="text-sm font-bold text-[var(--accent)] tabular-nums">{stats.active}</div>
                      <div className="text-[9px] text-[var(--text-muted)] uppercase tracking-wider">Active</div>
                    </div>
                    <div className="text-center bg-[var(--bg-subtle)] rounded-lg py-1.5">
                      <div className="text-sm font-bold text-[var(--success)] tabular-nums">{stats.completed}</div>
                      <div className="text-[9px] text-[var(--text-muted)] uppercase tracking-wider">Done</div>
                    </div>
                  </div>
                </div>

                {/* Card Footer: Metadata & Actions */}
                <div className="pt-3 mt-3 border-t border-[var(--border-subtle)] flex items-center justify-between gap-2">
                  <span className="flex items-center gap-1.5 text-[11px] text-[var(--text-muted)] font-medium">
                    <CalendarDays className="w-3 h-3" />
                    {lastActive ? (
                       m.joinedAt ? `Joined ${timeAgo(m.joinedAt)}` : `Active ${lastActive}`
                    ) : 'Joined recently'}
                  </span>

                  <div className="flex items-center gap-1">
                    <Button variant="ghost" size="sm" className="h-8 text-[12px] px-2 font-medium text-[var(--accent)] hover:bg-[var(--accent-soft)]">
                      Profile
                      <ChevronRight className="w-3 h-3 ml-0.5" />
                    </Button>
                  </div>
                </div>
              </motion.div>
            )
          })}
        </div>
      )}
    </div>
  )
}

export default MembersTab
