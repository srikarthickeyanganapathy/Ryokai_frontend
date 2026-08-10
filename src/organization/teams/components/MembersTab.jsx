import React, { useMemo, useState } from 'react'
import { motion } from 'framer-motion'
import { Users, Crown, Star, UserPlus } from 'lucide-react'
import { Button } from '@/shared/ui/Button'
import { EmptyState } from '@/shared/ui/EmptyState'
import { SegmentedToggle } from '@/shared/ui/SegmentedToggle'
import { cn } from '@/shared/lib/cn'

/* ============================================================
   components/MembersTab.jsx â€” People grid (demo-faithful).
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
  return d.toLocaleDateString(undefined, { month: 'short', day: 'numeric' })
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
        <SegmentedToggle
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
            const load = workload[name] || 0
            const pct = maxWorkload ? Math.round(load / maxWorkload * 100) : 0
            const barCls = pct >= 100 ? 'red' : pct >= 80 ? 'amber' : ''
            const lead = isLead(m)
            const lastActive = timeAgo(m.lastActive || m.last_active || m.activeAt || m.updatedAt)
            const away = m.away || m.status === 'away' || m.availability === 'away'
            const h = hashHue(name)
            return (
              <motion.div key={m.id || name} initial={{ opacity: 0, y: 6 }} animate={{ opacity: 1, y: 0 }} transition={{ delay: Math.min(i * 0.03, 0.2) }}
                className={cn('relative overflow-hidden bg-[var(--bg-card)] border rounded-2xl shadow-[var(--shadow-xs)] p-3.5 transition-all', lead ? 'border-[var(--accent-border)]' : 'border-[var(--border-subtle)] hover:border-[var(--accent-border)]')}>
                {/* aura */}
                <span className="absolute inset-0 pointer-events-none opacity-[0.16]"
                  style={{ background: `radial-gradient(circle at 90% 0%, hsl(${h} 72% 55%) 0%, transparent 60%)` }} />

                {/* header */}
                <div className="relative flex items-center gap-2.5">
                  <span className="relative shrink-0">
                    <span className="block w-10 h-10 rounded-xl font-bold text-white flex items-center justify-center text-[14px] shadow-sm"
                      style={{ backgroundImage: `linear-gradient(135deg, hsl(${h} 65% 48%), hsl(${(h + 35) % 360} 62% 34%))` }}>
                      {name.charAt(0).toUpperCase()}
                    </span>
                    {lead && (
                      <span className="absolute -bottom-1 -right-1 w-4 h-4 rounded-full bg-[var(--accent)] text-white flex items-center justify-center border-2 border-[var(--bg-card)]">
                        <Crown className="w-2 h-2" />
                      </span>
                    )}
                  </span>
                  <span className="min-w-0">
                    <span className="block text-[13.5px] font-semibold truncate">{name.split(' ')[0]}</span>
                    <span className="block text-[11px] text-[var(--text-muted)] truncate">{name}</span>
                  </span>
                  {lead && (
                    <span className="ml-auto inline-flex items-center gap-1 text-[9.5px] font-bold uppercase tracking-wider px-2 py-0.5 rounded-md bg-[var(--accent-soft)] text-[var(--accent)] shrink-0">
                      <Star className="w-2.5 h-2.5" /> Lead
                    </span>
                  )}
                </div>

                {/* body */}
                <div className="relative mt-3 pt-2.5 border-t border-[var(--border-subtle)]">
                  <div className="flex items-center gap-2 text-[11px] text-[var(--text-secondary)]">
                    <span className="font-medium shrink-0">Workload</span>
                    <div className="flex-1 h-[5px] rounded-full bg-[var(--bg-subtle)] overflow-hidden">
                      <div className={cn('h-full rounded-full transition-all', barCls === 'red' ? 'bg-gradient-to-r from-[#f2555c] to-[#dc3d43]' : barCls === 'amber' ? 'bg-gradient-to-r from-[#f0a03a] to-[#e08a00]' : 'bg-[var(--accent)]')}
                        style={{ width: `${Math.min(pct, 100)}%` }} />
                    </div>
                    <b className="font-mono text-[11px] tabular-nums">{load}</b>
                  </div>
                  <div className="flex items-center justify-between mt-2 text-[10.5px] text-[var(--text-muted)]">
                    <span>{lastActive ? `Last active ${lastActive}` : 'No activity yet'}</span>
                    {!lead && away && <span className="opacity-60">away</span>}
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
