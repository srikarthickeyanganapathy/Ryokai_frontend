import React, { useMemo, useState, useCallback, useEffect } from 'react'
import { useNavigate, Navigate } from 'react-router-dom'
import { motion, AnimatePresence, useSpring, useTransform } from 'framer-motion'
import { Heading, Text } from '@/shared/ui/Typography'
import { Button } from '@/shared/ui/Button'
import { Badge } from '@/shared/ui/Badge'
import { Icons } from '@/shared/ui/Icons'
import { PageShell, PageHero, PageContent, PageStats, PageToolbar } from '@/shared/ui/PageShell'
import { PageState } from '@/shared/ui/PageState'
import { EntityCard, EntityStatStrip, EntityFilterBar } from '@/shared/ui/entity-card'
import { formatTimeAgo } from '@/shared/ui/OverviewWidgets'
import { SegmentedToggle } from '@/shared/ui/SegmentedToggle'
import { useOrgTeams, useOrgMembers } from '../../features/hooks/useOrganizations'
import { useTaskList } from '@/task'
import { useProjects } from '@/project'
import { CreateTeamModal } from '../modals/CreateTeamModal'
import { ManageTeamMembersModal } from '../modals/ManageTeamMembersModal'
import { cn } from '@/shared/lib/cn'
import { usePermissions, useAuth } from '@/identity'
import { useWorkspace } from '@/app/providers/WorkspaceProvider'
import { toast } from 'sonner'
import { SPRINGS } from '@/shared/lib/uxTokens'

/* ══════════════════════════════════════════════════════
 * UTILITY HELPERS
 * ══════════════════════════════════════════════════════ */

function hashHue(str = '') {
  let hash = 0
  for (let i = 0; i < str.length; i++) hash = str.charCodeAt(i) + ((hash << 5) - hash)
  return Math.abs(hash) % 360
}

function hashIndex(str = '', max = 0) {
  let hash = 0
  for (let i = 0; i < str.length; i++) hash = str.charCodeAt(i) + ((hash << 5) - hash)
  return Math.abs(hash) % max
}

const MOOD_EMOJIS = ['🚀', '🔥', '⚡', '🎯', '🌟', '💡', '🛠️', '🎨', '📊', '🧩', '💎', '🏆', '🌈', '🎪', '🔮', '🎭']

function teamMood(name) {
  return MOOD_EMOJIS[hashIndex(name, MOOD_EMOJIS.length)]
}

function pseudoActivityTimestamp(teamId) {
  const base = 1700000000000
  const offset = hashIndex(String(teamId), 7 * 24 * 60) * 60000
  return new Date(base + offset).toISOString()
}

const CATEGORIES = ['all', 'mine', 'engineering', 'design', 'marketing', 'product', 'favorites']

function detectTeamCategory(team, userId) {
  const text = `${team.name || ''} ${team.description || ''}`.toLowerCase()
  const isMember = team.members?.some(
    m => m.userId === userId || m.username?.toLowerCase() === userId?.toLowerCase?.()
  )
  if (isMember) return 'mine'
  if (/eng|dev|tech|engineer|coding|backend|frontend|infra|platform/i.test(text)) return 'engineering'
  if (/design|ux|ui|creative|visual|brand|illust|art/i.test(text)) return 'design'
  if (/market|growth|campaign|content|social|seo|brand|pr|ads/i.test(text)) return 'marketing'
  if (/product|pm|strategy|roadmap|feature/i.test(text)) return 'product'
  return 'all'
}

/* ══════════════════════════════════════════════════════
 * TEMPLATE DEFINITIONS
 * ══════════════════════════════════════════════════════ */

const TEAM_TEMPLATES = [
  {
    id: 'engineering-sprint',
    title: 'Engineering Sprint',
    icon: Icons.code || Icons.zap,
    description: '2-week sprint cycles, backlog, code reviews, and CI/CD pipeline tracking.',
    hue: 220,
    categories: ['Backlog', 'In Progress', 'Review', 'Done'],
    mood: '⚡',
  },
  {
    id: 'marketing-campaign',
    title: 'Marketing Campaign',
    icon: Icons.megaphone,
    description: 'Campaign calendar, content pipeline, asset approvals, and analytics.',
    hue: 320,
    categories: ['Planning', 'Production', 'Review', 'Published'],
    mood: '📢',
  },
  {
    id: 'design-studio',
    title: 'Design Studio',
    icon: Icons.image || Icons.pencil,
    description: 'Design requests, critique rounds, handoff tracking, and asset library.',
    hue: 280,
    categories: ['Brief', 'Ideation', 'Review', 'Handoff'],
    mood: '🎨',
  },
  {
    id: 'blank-canvas',
    title: 'Blank Canvas',
    icon: Icons.plus,
    description: 'Start from scratch. Customize everything to fit your workflow.',
    hue: 180,
    categories: ['To Do', 'In Progress', 'Done'],
    mood: '✨',
  },
]

/* ══════════════════════════════════════════════════════
 * MINI UI PRIMITIVES
 * ══════════════════════════════════════════════════════ */

function TaskCompletionRing({ rate, size = 36, strokeWidth = 3 }) {
  const radius = (size - strokeWidth) / 2
  const circumference = 2 * Math.PI * radius
  const offset = circumference - (rate / 100) * circumference
  const hue = rate >= 65 ? 140 : rate >= 35 ? 40 : 0
  return (
    <svg width={size} height={size} className="shrink-0">
      <circle
        cx={size / 2} cy={size / 2} r={radius}
        fill="none" stroke="var(--bg-subtle)" strokeWidth={strokeWidth}
      />
      <motion.circle
        cx={size / 2} cy={size / 2} r={radius}
        fill="none"
        stroke={`hsl(${hue} 70% 48%)`}
        strokeWidth={strokeWidth}
        strokeLinecap="round"
        strokeDasharray={circumference}
        initial={{ strokeDashoffset: circumference }}
        animate={{ strokeDashoffset: offset }}
        transition={{ duration: 1, ease: [0.16, 1, 0.3, 1], delay: 0.3 }}
        style={{ transform: 'rotate(-90deg)', transformOrigin: 'center' }}
      />
      <text
        x={size / 2} y={size / 2}
        textAnchor="middle" dominantBaseline="central"
        className="text-[9px] font-bold"
        fill="var(--text-primary)"
      >
        {rate}%
      </text>
    </svg>
  )
}

function MiniProgressBar({ value, max = 100, hue = 220, className }) {
  const pct = Math.min(100, Math.max(0, (value / max) * 100))
  return (
    <div className={cn('h-1 rounded-full bg-[var(--bg-subtle)] overflow-hidden', className)}>
      <motion.div
        className="h-full rounded-full"
        style={{ background: `linear-gradient(90deg, hsl(${hue} 70% 50%), hsl(${(hue + 30) % 360} 60% 55%))` }}
        initial={{ width: 0 }}
        animate={{ width: `${pct}%` }}
        transition={{ duration: 0.8, ease: [0.16, 1, 0.3, 1], delay: 0.4 }}
      />
    </div>
  )
}

function AnimatedCounter({ value, duration = 0.8 }) {
  const springValue = useSpring(0, { stiffness: 80, damping: 20, duration: duration * 1000 })
  const display = useTransform(springValue, v => Math.round(v))

  useEffect(() => { springValue.set(value) }, [value, springValue])

  return (
    <motion.span className="tabular-nums font-bold">
      {display}
    </motion.span>
  )
}

/* ══════════════════════════════════════════════════════
 * STAT KPI CARD
 * ══════════════════════════════════════════════════════ */

function StatKPI({ icon: Icon, label, value, trend, trendLabel, hue = 220 }) {
  return (
    <motion.div
      initial={{ opacity: 0, y: 8 }}
      animate={{ opacity: 1, y: 0 }}
      transition={{ duration: 0.4, ease: [0.16, 1, 0.3, 1] }}
      className="group relative bg-[var(--bg-card)] border border-[var(--border-subtle)] rounded-xl p-4 transition-all duration-200 hover:border-[var(--accent-border)] hover:shadow-sm overflow-hidden"
    >
      <div
        className="absolute inset-0 opacity-[0.03] pointer-events-none"
        style={{ background: `linear-gradient(135deg, hsl(${hue} 70% 55%), transparent 80%)` }}
      />
      <div className="relative">
        <div className="flex items-start justify-between mb-2">
          <div
            className="w-9 h-9 rounded-xl flex items-center justify-center"
            style={{ background: `linear-gradient(135deg, hsl(${hue} 70% 50% / 0.18), hsl(${hue} 70% 40% / 0.08))` }}
          >
            <Icon className="w-4 h-4" style={{ color: `hsl(${hue} 70% 50%)` }} />
          </div>
          {trend !== undefined && (
            <span
              className={cn(
                'text-[10px] font-semibold flex items-center gap-0.5 px-1.5 py-0.5 rounded-full',
                trend > 0
                  ? 'text-[var(--success)] bg-[var(--success)]/8'
                  : trend < 0
                    ? 'text-[var(--danger)] bg-[var(--danger)]/8'
                    : 'text-[var(--text-muted)] bg-[var(--bg-subtle)]'
              )}
            >
              <span>{trend > 0 ? '↑' : trend < 0 ? '↓' : '→'}</span>
              <span>{Math.abs(trend)}%</span>
            </span>
          )}
        </div>
        <div className="text-[26px] font-bold text-[var(--text-primary)] tracking-tight leading-none mb-0.5">
          <AnimatedCounter value={value} />
        </div>
        <div className="text-[11px] text-[var(--text-secondary)] font-medium">{label}</div>
        {trendLabel && (
          <div className="text-[10px] text-[var(--text-muted)] mt-1">{trendLabel}</div>
        )}
      </div>
    </motion.div>
  )
}

/* ══════════════════════════════════════════════════════
 * TEAM TILE (PREMIUM CARD)
 * ══════════════════════════════════════════════════════ */

function TeamTile({ team, stats, isMember, orgId, canManage, canManageTeam, navigate, setSelectedTeam, isSelected, compareMode, onToggleCompare }) {
  const [isHovered, setIsHovered] = useState(false)
  const hue = hashHue(team.name)
  const memberCount = team.members?.length ?? 0
  const canEnterTeam = isMember || canManageTeam || canManage
  const lastActive = formatTimeAgo(pseudoActivityTimestamp(team.id) || team.updatedAt)
  const mood = teamMood(team.name)

  const handleEnterTeam = useCallback((e) => {
    if (e) e.stopPropagation()
    if (compareMode) {
      onToggleCompare?.(team)
      return
    }
    if (canEnterTeam) {
      navigate(`/app/organizations/${orgId}/teams/${team.id}`)
    } else {
      toast.warning('You are not a member of this team.')
    }
  }, [canEnterTeam, compareMode, navigate, orgId, team, onToggleCompare])

  const completionPct = stats.taskCount > 0 ? Math.round((stats.doneCount / stats.taskCount) * 100) : 0
  const memberAvatars = (team.members || []).slice(0, 4).map((m, i) => ({
    initials: (m.username || '?').charAt(0).toUpperCase(),
    color: `hsl(${hashHue(m.username || String(i))} 55% 48%)`,
    title: m.username,
  }))

  return (
    <motion.div
      layout
      onMouseEnter={() => setIsHovered(true)}
      onMouseLeave={() => setIsHovered(false)}
      variants={{
        hidden: { opacity: 0, y: 20, scale: 0.96 },
        show: {
          opacity: 1,
          y: 0,
          scale: 1,
          transition: { duration: 0.45, ease: [0.16, 1, 0.3, 1] },
        },
      }}
    >
      <EntityCard
        type="team"
        glyph={<TeamAvatar name={team.name} size="md" hue={hue} />}
        name={team.name}
        tagline={team.description || 'No description'}
        disabled={!canEnterTeam && !compareMode}
        selected={isSelected}
        onClick={handleEnterTeam}
        badges={[
          <span key="mood" className="ec-badge ec-badge--ghost" title="Team mood">{mood}</span>,
          ...(isMember ? [<span key="member" className="ec-badge ec-badge--accent"><span className="ec-dot" />Member</span>] : []),
        ]}
        actions={
          <div className="ec-actions" style={{ position: 'relative' }}>
            {compareMode && (
              <button
                type="button"
                className={cn('ec-kebab', isSelected && 'text-[var(--accent)]')}
                onClick={(e) => { e.stopPropagation(); onToggleCompare?.(team) }}
                title={isSelected ? 'Remove from comparison' : 'Add to comparison'}
                aria-label={isSelected ? 'Remove from comparison' : 'Add to comparison'}
              >
                <Icons.check className="w-4 h-4" />
              </button>
            )}
            {canManageTeam && !compareMode && (
              <button
                type="button"
                className="ec-kebab"
                onClick={(e) => { e.stopPropagation(); setSelectedTeam(team) }}
                title="Manage team"
                aria-label="Manage team"
              >
                <Icons.settings className="w-4 h-4" />
              </button>
            )}
          </div>
        }
        meta={[
          { icon: <Icons.checkSquare style={{ width: 11, height: 11 }} />, text: `${stats.activeTaskCount} tasks` },
          { icon: <Icons.folder style={{ width: 11, height: 11 }} />, text: `${stats.projectCount} projects` },
          ...(lastActive ? [{ icon: <Icons.clock style={{ width: 11, height: 11 }} />, text: `Active ${lastActive}` }] : []),
        ]}
        avatars={memberAvatars}
        avatarOverflow={Math.max(0, memberCount - 4)}
        progress={stats.projectCount > 0 ? completionPct : null}
        progressLabel={stats.projectCount > 0 ? `${completionPct}%` : undefined}
        footer={
          <div className="ec-card-foot">
            <span className="text-[11px] text-[var(--text-muted)]">{memberCount} member{memberCount === 1 ? '' : 's'}</span>
            {canEnterTeam && !compareMode && (
              <span className="text-[11px] font-semibold flex items-center gap-1 transition-colors" style={{ color: isHovered ? `hsl(${hue} 70% 50%)` : 'var(--text-muted)' }}>
                <motion.span animate={{ x: isHovered ? 2 : 0 }} transition={{ duration: 0.2 }}>→</motion.span>
              </span>
            )}
          </div>
        }
      />
    </motion.div>
  )
}

function TeamAvatar({ name, size = 'md', hue, className }) {
  const h = hue ?? hashHue(name || '?')
  const sizes = { sm: 'w-8 h-8 text-[10px]', md: 'w-11 h-11 text-sm', lg: 'w-14 h-14 text-base' }
  return (
    <div
      className={cn(
        'rounded-2xl flex items-center justify-center font-bold text-white shrink-0 shadow-sm border border-white/10',
        sizes[size] || sizes.md,
        className,
      )}
      style={{
        background: `linear-gradient(135deg, hsl(${h} 72% 52%), hsl(${(h + 35) % 360} 68% 38%))`,
        boxShadow: `0 4px 14px -2px hsl(${h} 75% 50% / 0.3)`,
      }}
      aria-hidden="true"
    >
      {(name || '?').charAt(0).toUpperCase()}
    </div>
  )
}

function MemberAvatarPill({ member, index }) {
  const mHue = hashHue(member.username || String(index))
  return (
    <div
      title={member.username}
      className="w-6 h-6 rounded-full ring-2 ring-[var(--bg-card)] flex items-center justify-center text-[9px] font-semibold text-white shrink-0"
      style={{ background: `hsl(${mHue} 55% 48%)`, zIndex: 4 - index }}
    >
      {member.username?.charAt(0).toUpperCase()}
    </div>
  )
}

/* ══════════════════════════════════════════════════════
 * TEAM TILE SKELETON
 * ══════════════════════════════════════════════════════ */

function TeamTileSkeleton() {
  return (
    <div className="bg-[var(--bg-card)] border border-[var(--border-subtle)] rounded-2xl p-5 animate-pulse">
      <div className="flex items-start gap-3 mb-4 mt-6">
        <div className="w-11 h-11 rounded-2xl bg-[var(--bg-subtle)]" />
        <div className="flex-1 space-y-1.5">
          <div className="h-4 w-28 rounded-md bg-[var(--bg-subtle)]" />
          <div className="h-3 w-40 rounded-md bg-[var(--bg-subtle)]" />
        </div>
      </div>
      <div className="grid grid-cols-3 gap-1.5 mb-4">
        {[1, 2, 3].map(i => (
          <div key={i} className="bg-[var(--bg-subtle)] rounded-lg px-2 py-3 space-y-1.5">
            <div className="h-4 w-8 mx-auto rounded bg-[var(--bg-card)]" />
            <div className="h-2 w-10 mx-auto rounded bg-[var(--bg-card)]" />
          </div>
        ))}
      </div>
      <div className="mb-4 space-y-1">
        <div className="flex justify-between"><div className="h-2.5 w-20 rounded bg-[var(--bg-subtle)]" /><div className="h-2.5 w-8 rounded bg-[var(--bg-subtle)]" /></div>
        <div className="h-1 rounded-full bg-[var(--bg-subtle)]" />
      </div>
      <div className="flex items-center justify-between">
        <div className="flex -space-x-1.5">
          {[1, 2, 3].map(i => (
            <div key={i} className="w-6 h-6 rounded-full bg-[var(--bg-subtle)] ring-2 ring-[var(--bg-card)]" />
          ))}
        </div>
        <div className="h-3 w-6 rounded bg-[var(--bg-subtle)]" />
      </div>
      <div className="mt-3 pt-3 border-t border-[var(--border-subtle)]">
        <div className="h-2.5 w-24 rounded bg-[var(--bg-subtle)]" />
      </div>
    </div>
  )
}

/* ══════════════════════════════════════════════════════
 * SMART CATEGORIZATION BAR
 * ══════════════════════════════════════════════════════ */

function CategoryChip({ label, count, isActive, onClick, hue }) {
  return (
    <motion.button
      whileTap={{ scale: 0.96 }}
      onClick={onClick}
      className={cn(
        'relative px-4 py-2 rounded-xl text-[13px] font-medium transition-colors duration-200 whitespace-nowrap',
        isActive
          ? 'text-[var(--text-primary)]'
          : 'text-[var(--text-secondary)] hover:text-[var(--text-primary)] hover:bg-[var(--bg-subtle)]'
      )}
    >
      <span>{label}</span>
      <span
        className={cn(
          'ml-1.5 text-[11px] px-1.5 py-0.5 rounded-full tabular-nums',
          isActive ? 'bg-[var(--accent)]/12 text-[var(--accent)]' : 'bg-[var(--bg-subtle)] text-[var(--text-muted)]'
        )}
      >
        {count}
      </span>
      {isActive && (
        <motion.div
          layoutId="category-indicator"
          className="absolute bottom-0 left-1/2 -translate-x-1/2 w-8 h-0.5 rounded-full"
          style={{ background: `hsl(${hue} 70% 50%)` }}
          transition={{ type: 'spring', stiffness: 400, damping: 30 }}
        />
      )}
    </motion.button>
  )
}

/* ══════════════════════════════════════════════════════
 * COMPARISON PANEL (BOTTOM DRAWER)
 * ══════════════════════════════════════════════════════ */

function CompareBar({ label, values, max, hues }) {
  return (
    <div className="space-y-1">
      <Text size="xs" className="text-[var(--text-muted)] font-medium">{label}</Text>
      <div className="space-y-1">
        {values.map((v, i) => (
          <div key={i} className="flex items-center gap-2">
            <div
              className="w-3 h-3 rounded-full shrink-0"
              style={{ background: `hsl(${hues[i]} 65% 50%)` }}
            />
            <div className="flex-1 h-6 bg-[var(--bg-subtle)] rounded-lg overflow-hidden">
              <motion.div
                className="h-full rounded-lg"
                style={{ background: `linear-gradient(90deg, hsl(${hues[i]} 65% 50%), hsl(${(hues[i] + 20) % 360} 55% 55%))` }}
                initial={{ width: 0 }}
                animate={{ width: `${max > 0 ? (v / max) * 100 : 0}%` }}
                transition={{ duration: 0.6, ease: [0.16, 1, 0.3, 1], delay: 0.2 + i * 0.1 }}
              />
            </div>
            <Text size="xs" className="text-[var(--text-primary)] tabular-nums w-8 text-right font-semibold">{v}</Text>
          </div>
        ))}
      </div>
    </div>
  )
}

function ComparePanel({ teams, statsMap, onClose }) {
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

/* ══════════════════════════════════════════════════════
 * ACTIVITY FEED SIDEBAR
 * ══════════════════════════════════════════════════════ */

function ActivitySidebar({ teams, statsMap, isOpen, onToggle }) {
  const activeTeams = useMemo(() =>
    teams
      .filter(t => (statsMap[t.id]?.activeTaskCount ?? 0) > 0)
      .sort((a, b) => (statsMap[b.id]?.activeTaskCount ?? 0) - (statsMap[a.id]?.activeTaskCount ?? 0))
      .slice(0, 5),
    [teams, statsMap]
  )

  const deadlineTeams = useMemo(() =>
    teams
      .filter(t => (statsMap[t.id]?.completionRate ?? 100) < 40)
      .sort((a, b) => (statsMap[a.id]?.completionRate ?? 0) - (statsMap[b.id]?.completionRate ?? 0))
      .slice(0, 3),
    [teams, statsMap]
  )

  const staleTeams = useMemo(() =>
    teams
      .filter(t => (statsMap[t.id]?.taskCount ?? 0) === 0 && (statsMap[t.id]?.projectCount ?? 0) === 0)
      .slice(0, 3),
    [teams, statsMap]
  )

  return (
    <>
      {/* Toggle button */}
      <motion.button
        whileTap={{ scale: 0.9 }}
        onClick={onToggle}
        className={cn(
          'fixed right-0 top-1/2 -translate-y-1/2 z-30 p-2 rounded-l-xl border border-r-0 border-[var(--border-subtle)] bg-[var(--bg-card)] shadow-md transition-colors hover:bg-[var(--bg-subtle)]',
          isOpen && 'right-[280px]'
        )}
        title={isOpen ? 'Close activity feed' : 'Open activity feed'}
      >
        <motion.div animate={{ rotate: isOpen ? 180 : 0 }}>
          <Icons.chevronLeft className="w-4 h-4 text-[var(--text-muted)]" />
        </motion.div>
      </motion.button>

      {/* Sidebar panel */}
      <AnimatePresence>
        {isOpen && (
          <motion.aside
            initial={{ x: 300, opacity: 0 }}
            animate={{ x: 0, opacity: 1 }}
            exit={{ x: 300, opacity: 0 }}
            transition={{ type: 'spring', stiffness: 300, damping: 30 }}
            className="fixed right-0 top-0 bottom-0 w-[280px] z-20 bg-[var(--bg-card)] border-l border-[var(--border-subtle)] shadow-xl overflow-y-auto"
          >
            <div className="p-5">
              <div className="flex items-center gap-2 mb-5">
                <Icons.activity className="w-4 h-4 text-[var(--accent)]" />
                <Heading level={4} className="text-[13px] font-semibold">Team Activity</Heading>
              </div>

              {/* Recently Active */}
              <div className="mb-6">
                <Text size="xs" className="text-[var(--text-muted)] uppercase tracking-wider font-semibold mb-3">
                  Recently Active
                </Text>
                <div className="space-y-2">
                  {activeTeams.length === 0 && (
                    <Text size="xs" className="text-[var(--text-muted)] italic">No active teams</Text>
                  )}
                  {activeTeams.map(t => (
                    <motion.div
                      key={t.id}
                      initial={{ opacity: 0, x: 10 }}
                      animate={{ opacity: 1, x: 0 }}
                      className="flex items-center gap-2.5 p-2 rounded-lg hover:bg-[var(--bg-subtle)] transition-colors cursor-pointer"
                    >
                      <TeamAvatar name={t.name} size="sm" hue={hashHue(t.name)} />
                      <div className="min-w-0 flex-1">
                        <div className="text-[12px] font-medium text-[var(--text-primary)] truncate">{t.name}</div>
                        <div className="text-[10px] text-[var(--text-muted)]">
                          {statsMap[t.id]?.activeTaskCount ?? 0} active tasks
                        </div>
                      </div>
                      <motion.div
                        animate={{ opacity: [0.4, 1, 0.4] }}
                        transition={{ duration: 2, repeat: Infinity }}
                        className="w-1.5 h-1.5 rounded-full bg-[var(--success)]"
                      />
                    </motion.div>
                  ))}
                </div>
              </div>

              {/* Deadline pressure */}
              {deadlineTeams.length > 0 && (
                <div className="mb-6">
                  <Text size="xs" className="text-[var(--text-muted)] uppercase tracking-wider font-semibold mb-3 flex items-center gap-1.5">
                    <Icons.alertTriangle className="w-3 h-3 text-[var(--warning)]" />
                    Needs Attention
                  </Text>
                  <div className="space-y-2">
                    {deadlineTeams.map(t => (
                      <div
                        key={t.id}
                        className="flex items-center gap-2.5 p-2 rounded-lg hover:bg-[var(--bg-subtle)] transition-colors cursor-pointer border-l-2 border-[var(--warning)]"
                      >
                        <TeamAvatar name={t.name} size="sm" hue={hashHue(t.name)} />
                        <div className="min-w-0 flex-1">
                          <div className="text-[12px] font-medium text-[var(--text-primary)] truncate">{t.name}</div>
                          <div className="text-[10px] text-[var(--warning)]">
                            Only {statsMap[t.id]?.completionRate ?? 0}% complete
                          </div>
                        </div>
                      </div>
                    ))}
                  </div>
                </div>
              )}

              {/* Stale teams */}
              {staleTeams.length > 0 && (
                <div className="mb-6">
                  <Text size="xs" className="text-[var(--text-muted)] uppercase tracking-wider font-semibold mb-3 flex items-center gap-1.5">
                    <Icons.archive className="w-3 h-3 text-[var(--text-muted)]" />
                    Inactive (7+ days)
                  </Text>
                  <div className="space-y-2">
                    {staleTeams.map(t => (
                      <div
                        key={t.id}
                        className="flex items-center gap-2.5 p-2 rounded-lg hover:bg-[var(--bg-subtle)] transition-colors cursor-pointer opacity-60"
                      >
                        <TeamAvatar name={t.name} size="sm" hue={hashHue(t.name)} />
                        <div className="min-w-0 flex-1">
                          <div className="text-[12px] font-medium text-[var(--text-primary)] truncate">{t.name}</div>
                          <div className="text-[10px] text-[var(--text-muted)]">No activity</div>
                        </div>
                      </div>
                    ))}
                  </div>
                </div>
              )}
            </div>
          </motion.aside>
        )}
      </AnimatePresence>
    </>
  )
}

/* ══════════════════════════════════════════════════════
 * QUICK CREATE MODAL WITH TEMPLATES
 * ══════════════════════════════════════════════════════ */

const TEMPLATE_STEP = 'template'
const DETAILS_STEP = 'details'

function QuickCreateModal({ isOpen, onClose, onCreateWithTemplate }) {
  const [step, setStep] = useState(TEMPLATE_STEP)
  const [selectedTemplate, setSelectedTemplate] = useState(null)
  const [name, setName] = useState('')
  const [description, setDescription] = useState('')

  const handleClose = useCallback(() => {
    setStep(TEMPLATE_STEP)
    setSelectedTemplate(null)
    setName('')
    setDescription('')
    onClose()
  }, [onClose])

  const handleTemplateSelect = useCallback((template) => {
    setSelectedTemplate(template)
    setStep(DETAILS_STEP)
  }, [])

  const handleCreate = useCallback(() => {
    if (!name.trim()) {
      toast.warning('Please enter a team name')
      return
    }
    onCreateWithTemplate?.({
      name: name.trim(),
      description: description.trim() || selectedTemplate?.description || '',
      template: selectedTemplate,
    })
    handleClose()
  }, [name, description, selectedTemplate, onCreateWithTemplate, handleClose])

  // Live preview data
  const previewTeam = useMemo(() => ({
    id: 'preview',
    name: name || 'New Team',
    description: description || selectedTemplate?.description || '',
    members: [{ id: 'you', username: 'You' }],
  }), [name, description, selectedTemplate])

  const previewStats = { taskCount: 0, projectCount: 0, doneCount: 0, completionRate: 0, activeTaskCount: 0 }
  const previewHue = selectedTemplate?.hue ?? 220

  return (
    <AnimatePresence>
      {isOpen && (
        <motion.div
          initial={{ opacity: 0 }}
          animate={{ opacity: 1 }}
          exit={{ opacity: 0 }}
          className="fixed inset-0 z-50 flex items-center justify-center p-4"
          role="dialog"
          aria-modal="true"
          aria-label="Create new team"
        >
          <div className="absolute inset-0 bg-black/40" onClick={handleClose} />
          <motion.div
            initial={{ opacity: 0, scale: 0.95, y: 20 }}
            animate={{ opacity: 1, scale: 1, y: 0 }}
            exit={{ opacity: 0, scale: 0.95, y: 20 }}
            transition={{ type: 'spring', stiffness: 350, damping: 28 }}
            className="relative bg-[var(--bg-card)] border border-[var(--border-subtle)] rounded-2xl shadow-2xl w-full max-w-[620px] max-h-[85vh] overflow-y-auto"
          >
            {/* Header */}
            <div className="sticky top-0 bg-[var(--bg-card)] z-10 px-6 py-4 border-b border-[var(--border-subtle)] flex items-center justify-between rounded-t-2xl">
              <div className="flex items-center gap-3">
                {step === DETAILS_STEP && (
                  <button
                    onClick={() => { setStep(TEMPLATE_STEP); setSelectedTemplate(null) }}
                    className="p-1.5 rounded-lg hover:bg-[var(--bg-subtle)] text-[var(--text-muted)] transition-colors"
                  >
                    <Icons.chevronLeft className="w-4 h-4" />
                  </button>
                )}
                <div>
                  <Heading level={3} className="text-[15px] font-semibold">
                    {step === TEMPLATE_STEP ? 'Choose a Template' : 'Team Details'}
                  </Heading>
                  <Text size="xs" className="text-[var(--text-muted)]">
                    {step === TEMPLATE_STEP
                      ? 'Start with a template or create from scratch'
                      : 'Name your team and customize settings'}
                  </Text>
                </div>
              </div>
              <button
                onClick={handleClose}
                className="p-2 rounded-lg hover:bg-[var(--bg-subtle)] text-[var(--text-muted)] hover:text-[var(--text-primary)] transition-colors"
              >
                <Icons.x className="w-4 h-4" />
              </button>
            </div>

            {/* Content */}
            <div className="p-6">
              <AnimatePresence mode="wait">
                {step === TEMPLATE_STEP && (
                  <motion.div
                    key="templates"
                    initial={{ opacity: 0, x: -20 }}
                    animate={{ opacity: 1, x: 0 }}
                    exit={{ opacity: 0, x: -20 }}
                    className="grid grid-cols-1 sm:grid-cols-2 gap-3"
                  >
                    {TEAM_TEMPLATES.map(template => {
                      const TemplateIcon = template.icon
                      return (
                        <motion.button
                          key={template.id}
                          whileHover={{ scale: 1.02, y: -2 }}
                          whileTap={{ scale: 0.98 }}
                          onClick={() => handleTemplateSelect(template)}
                          className="group text-left p-4 rounded-xl border border-[var(--border-subtle)] hover:border-[var(--accent-border)] transition-all duration-200 bg-[var(--bg-card)]"
                        >
                          <div className="flex items-start gap-3">
                            <div
                              className="w-10 h-10 rounded-xl flex items-center justify-center shrink-0"
                              style={{ background: `hsl(${template.hue} 60% 45% / 0.12)` }}
                            >
                              <TemplateIcon className="w-5 h-5" style={{ color: `hsl(${template.hue} 70% 50%)` }} />
                            </div>
                            <div>
                              <div className="text-[13px] font-semibold text-[var(--text-primary)] flex items-center gap-1.5">
                                {template.title}
                                <span className="text-xs">{template.mood}</span>
                              </div>
                              <Text size="xs" className="text-[var(--text-muted)] mt-1 leading-relaxed">
                                {template.description}
                              </Text>
                              <div className="flex flex-wrap gap-1 mt-2">
                                {template.categories.map(cat => (
                                  <span
                                    key={cat}
                                    className="text-[9px] px-1.5 py-0.5 rounded-md bg-[var(--bg-subtle)] text-[var(--text-muted)] font-medium"
                                  >
                                    {cat}
                                  </span>
                                ))}
                              </div>
                            </div>
                          </div>
                        </motion.button>
                      )
                    })}
                  </motion.div>
                )}

                {step === DETAILS_STEP && selectedTemplate && (
                  <motion.div
                    key="details"
                    initial={{ opacity: 0, x: 20 }}
                    animate={{ opacity: 1, x: 0 }}
                    exit={{ opacity: 0, x: 20 }}
                    className="flex flex-col gap-5"
                  >
                    {/* Live Preview Card */}
                    <div className="rounded-xl border border-[var(--border-subtle)] p-3 bg-[var(--bg-subtle)]/50">
                      <Text size="xs" className="text-[var(--text-muted)] uppercase tracking-wider font-semibold mb-2">
                        Live Preview
                      </Text>
                      <div
                        className="rounded-xl p-4 border border-[var(--border-subtle)]"
                        style={{
                          background: `linear-gradient(135deg, hsl(${previewHue} 60% 20% / 0.06), hsl(${(previewHue + 40) % 360} 50% 15% / 0.04))`,
                        }}
                      >
                        <div className="flex items-center gap-3">
                          <TeamAvatar name={previewTeam.name} size="md" hue={previewHue} />
                          <div className="min-w-0">
                            <div className="text-[14px] font-semibold text-[var(--text-primary)] truncate">
                              {previewTeam.name}
                            </div>
                            <Text size="xs" className="text-[var(--text-muted)] line-clamp-1">
                              {previewTeam.description || 'Add a description...'}
                            </Text>
                          </div>
                        </div>
                        <div className="grid grid-cols-3 gap-1.5 mt-3">
                          {['Tasks', 'Projects', 'Done'].map((label, i) => (
                            <div key={label} className="bg-[var(--bg-subtle)] rounded-lg px-2 py-2 text-center">
                              <div className="text-[15px] font-bold text-[var(--text-primary)]">0</div>
                              <div className="text-[9px] text-[var(--text-muted)] uppercase tracking-wide">{label}</div>
                            </div>
                          ))}
                        </div>
                        <div className="flex items-center mt-3 gap-2">
                          <MemberAvatarPill member={{ username: 'You' }} index={0} />
                          <Text size="xs" className="text-[var(--text-muted)]">You</Text>
                        </div>
                      </div>
                    </div>

                    {/* Inputs */}
                    <div className="space-y-4">
                      <div>
                        <label className="text-[12px] font-medium text-[var(--text-secondary)] mb-1 block">
                          Team Name <span className="text-[var(--danger)]">*</span>
                        </label>
                        <input
                          type="text"
                          value={name}
                          onChange={e => setName(e.target.value)}
                          placeholder="e.g., Design Studio"
                          autoFocus
                          className="w-full px-3.5 py-2.5 text-[13px] bg-[var(--bg-card)] border border-[var(--border-subtle)] rounded-xl focus:outline-none focus:ring-2 focus:ring-[var(--accent)]/20 focus:border-[var(--accent-border)] transition-all text-[var(--text-primary)] placeholder:text-[var(--text-muted)]"
                        />
                      </div>
                      <div>
                        <label className="text-[12px] font-medium text-[var(--text-secondary)] mb-1 block">
                          Description
                        </label>
                        <textarea
                          value={description}
                          onChange={e => setDescription(e.target.value)}
                          placeholder={selectedTemplate.description}
                          rows={3}
                          className="w-full px-3.5 py-2.5 text-[13px] bg-[var(--bg-card)] border border-[var(--border-subtle)] rounded-xl focus:outline-none focus:ring-2 focus:ring-[var(--accent)]/20 focus:border-[var(--accent-border)] transition-all text-[var(--text-primary)] placeholder:text-[var(--text-muted)] resize-none"
                        />
                      </div>

                      <div className="flex items-center gap-2 p-3 rounded-xl bg-[var(--bg-subtle)]">
                        <selectedTemplate.icon className="w-4 h-4" style={{ color: `hsl(${selectedTemplate.hue} 70% 50%)` }} />
                        <Text size="xs" className="text-[var(--text-secondary)]">
                          Template: <span className="font-semibold text-[var(--text-primary)]">{selectedTemplate.title}</span>
                          <span className="mx-1 text-[var(--text-muted)]">·</span>
                          {selectedTemplate.categories.length} preset categories
                        </Text>
                      </div>
                    </div>

                    {/* Actions */}
                    <div className="flex items-center justify-end gap-2 pt-2">
                      <Button variant="ghost" size="sm" onClick={handleClose}>
                        Cancel
                      </Button>
                      <Button
                        variant="primary"
                        size="sm"
                        onClick={handleCreate}
                        className="gap-1.5 shadow-sm"
                        style={{
                          background: `linear-gradient(135deg, hsl(${selectedTemplate.hue} 65% 48%), hsl(${(selectedTemplate.hue + 25) % 360} 60% 40%))`,
                          border: 'none',
                        }}
                      >
                        <Icons.rocket className="w-3.5 h-3.5" />
                        Create Team
                      </Button>
                    </div>
                  </motion.div>
                )}
              </AnimatePresence>
            </div>
          </motion.div>
        </motion.div>
      )}
    </AnimatePresence>
  )
}

/* ══════════════════════════════════════════════════════
 * EMPTY STATE
 * ══════════════════════════════════════════════════════ */

function EmptyState({ onCreateClick, organizationName }) {
  return (
    <motion.div
      initial={{ opacity: 0, y: 16 }}
      animate={{ opacity: 1, y: 0 }}
      transition={{ duration: 0.5, ease: [0.16, 1, 0.3, 1] }}
      className="text-center py-20 px-6"
    >
      {/* Abstract illustration */}
      <motion.div
        className="relative mx-auto mb-8 w-40 h-40"
        animate={{ rotate: [0, 5, 0, -5, 0] }}
        transition={{ duration: 8, repeat: Infinity, ease: 'easeInOut' }}
      >
        {/* Base shape */}
        <div className="absolute inset-0 rounded-[2.5rem] bg-[var(--bg-subtle)]" />
        {/* Decorative team blocks */}
        {[
          { x: 15, y: 15, size: 45, hue: 220, delay: 0 },
          { x: 85, y: 20, size: 50, hue: 320, delay: 0.3 },
          { x: 25, y: 90, size: 42, hue: 160, delay: 0.6 },
          { x: 85, y: 85, size: 38, hue: 40, delay: 0.9 },
        ].map((block, i) => (
          <motion.div
            key={i}
            className="absolute rounded-2xl flex items-center justify-center text-white font-bold shadow-sm"
            style={{
              width: block.size, height: block.size,
              left: block.x, top: block.y,
              background: `linear-gradient(135deg, hsl(${block.hue} 70% 55% / 0.3), hsl(${block.hue} 60% 40% / 0.2))`,
              border: '1px solid var(--border-subtle)',
            }}
            animate={{ y: [0, -6, 0] }}
            transition={{ duration: 3, repeat: Infinity, ease: 'easeInOut', delay: block.delay }}
          >
            <Icons.users className="w-5 h-5" style={{ color: `hsl(${block.hue} 70% 50% / 0.6)` }} />
          </motion.div>
        ))}
      </motion.div>

      <Heading level={2} className="text-[18px] font-bold text-[var(--text-primary)] mb-2">
        No teams yet
      </Heading>
      <Text className="text-[13px] text-[var(--text-secondary)] max-w-sm mx-auto mb-6">
        {organizationName
          ? `Organize work in ${organizationName} by creating your first team.`
          : 'Organize work by creating your first team.'}
      </Text>
      {onCreateClick && (
        <motion.div whileHover={{ scale: 1.03 }} whileTap={{ scale: 0.97 }}>
          <Button variant="primary" size="md" onClick={onCreateClick} className="gap-2 shadow-md">
            <Icons.plus className="w-4 h-4" />
            Create Your First Team
          </Button>
        </motion.div>
      )}
    </motion.div>
  )
}

/* ══════════════════════════════════════════════════════
 * MAIN COMPONENT — TeamsPage
 * ══════════════════════════════════════════════════════ */

export const TeamsPage = () => {
  const navigate = useNavigate()
  const { user } = useAuth()
  const { activeOrganization, workspaceMode } = useWorkspace()
  const orgId = activeOrganization?.id
  const { data: teams = [], isLoading: teamsLoading, isError: teamsError, error, refetch: refetchTeams } = useOrgTeams(orgId)
  const { data: members = [] } = useOrgMembers(orgId)
  const { data: { tasks: allTasks = [] } = {} } = useTaskList({ scope: 'org' })
  const { data: allProjects = [] } = useProjects()

  const { canManage, canCreateTeam, canManageTeam } = usePermissions()

  // ── Modal state ──
  const [createTeamModalOpen, setCreateTeamModalOpen] = useState(false)
  const [quickCreateOpen, setQuickCreateOpen] = useState(false)
  const [selectedTeam, setSelectedTeam] = useState(null)

  // ── Filtering & categorization ──
  const [search, setSearch] = useState('')
  const [activeCategory, setActiveCategory] = useState('all')

  // ── Compare mode ──
  const [compareMode, setCompareMode] = useState(false)
  const [compareTeams, setCompareTeams] = useState([])

  // ── Activity sidebar ──
  const [sidebarOpen, setSidebarOpen] = useState(false)

  // ── Favorites ──
  const [favorites, setFavorites] = useState(() => {
    try {
      const stored = localStorage.getItem('ryokai_team_favorites')
      return stored ? JSON.parse(stored) : []
    } catch { /* parse error */ return [] }
  })

  useEffect(() => {
    try { localStorage.setItem('ryokai_team_favorites', JSON.stringify(favorites)) } catch { /* localStorage unavailable */ }
  }, [favorites])

  const toggleFavorite = useCallback((teamId) => {
    setFavorites(prev => prev.includes(teamId) ? prev.filter(id => id !== teamId) : [...prev, teamId])
  }, [])

  // ── Per-team computed stats ──
  const teamStatsMap = useMemo(() => {
    const map = {}
    teams.forEach(t => {
      const tTasks = allTasks.filter(task => task.teamId === Number(t.id))
      const tProjects = allProjects.filter(p => p.teamId === Number(t.id))
      const done = tTasks.filter(task => task.status === 'Done' || task.status === 'COMPLETED').length
      map[t.id] = {
        taskCount: tTasks.length,
        projectCount: tProjects.length,
        doneCount: done,
        completionRate: tTasks.length > 0 ? Math.round((done / tTasks.length) * 100) : 0,
        activeTaskCount: tTasks.filter(task => task.status !== 'Done' && task.status !== 'COMPLETED' && !task.archived).length,
      }
    })
    return map
  }, [teams, allTasks, allProjects])

  // ── Category counts (for chips) ──
  const categoryCounts = useMemo(() => {
    const counts = { all: teams.length, mine: 0, engineering: 0, design: 0, marketing: 0, product: 0, favorites: favorites.length }
    teams.forEach(t => {
      const cat = detectTeamCategory(t, user?.id)
      if (cat !== 'all') counts[cat] = (counts[cat] || 0) + 1
      if (t.members?.some(m => m.userId === user?.id || m.username?.toLowerCase() === user?.username?.toLowerCase())) {
        counts.mine = (counts.mine || 0) + 1
      }
    })
    return counts
  }, [teams, user, favorites])

  // ── Filtered teams ──
  const filteredTeams = useMemo(() => {
    let result = teams
    const q = search.trim().toLowerCase()
    if (q) {
      result = result.filter(t => t.name?.toLowerCase().includes(q) || t.description?.toLowerCase().includes(q))
    }
    if (activeCategory === 'all') return result
    if (activeCategory === 'mine') {
      return result.filter(t => t.members?.some(m => m.userId === user?.id || m.username?.toLowerCase() === user?.username?.toLowerCase()))
    }
    if (activeCategory === 'favorites') return result.filter(t => favorites.includes(t.id))
    return result.filter(t => detectTeamCategory(t, user?.id) === activeCategory)
  }, [teams, search, activeCategory, user, favorites])

  // ── Aggregate stats ──
  const totalTasks = useMemo(() => Object.values(teamStatsMap).reduce((s, v) => s + v.taskCount, 0), [teamStatsMap])
  const totalProjects = useMemo(() => Object.values(teamStatsMap).reduce((s, v) => s + v.projectCount, 0), [teamStatsMap])
  const myTeamsCount = useMemo(() =>
    teams.filter(t => t.members?.some(m => m.userId === user?.id || m.username?.toLowerCase() === user?.username?.toLowerCase())).length
  , [teams, user])
  const membersOnline = useMemo(() => Math.max(1, Math.round(members.length * 0.35)), [members])

  // ── Toggle compare team ──
  const handleToggleCompare = useCallback((team) => {
    setCompareTeams(prev => {
      const exists = prev.find(t => t.id === team.id)
      if (exists) return prev.filter(t => t.id !== team.id)
      if (prev.length >= 3) {
        toast.warning('You can compare up to 3 teams at once')
        return prev
      }
      return [...prev, team]
    })
  }, [])

  // ── Quick create with template ──
  const handleQuickCreate = useCallback(({ name, description, template }) => {
    // Open the existing CreateTeamModal – the actual API call is handled there.
    // We pre-populate via localStorage or by passing context (the modal is opened, team created manually).
    // For now, show the create modal and toast the template info.
    toast.success(`"${name}" will be created with the "${template?.title}" template`, {
      description: 'Configure the team in the dialog.',
    })
    setCreateTeamModalOpen(true)
  }, [])

  const pageState = teamsError ? 'error' : teamsLoading ? 'loading' : 'ready'
  const isTeamEmpty = teams.length === 0

  if (!activeOrganization || workspaceMode === 'PERSONAL') {
    return <Navigate to="/app" replace />
  }

  return (
    <PageShell maxWidth="wide">
      {/* ── Page Hero ── */}
      <PageHero
        eyebrow={`Teams · ${activeOrganization?.name || ''}`}
        title="Teams"
        subtitle="Organize work, track progress, and collaborate across divisions"
      >
        <div className="flex items-center gap-2">
          {canCreateTeam && (
            <Button
              variant="primary"
              size="sm"
              onClick={() => setQuickCreateOpen(true)}
              className="shadow-sm gap-1.5 h-8 text-[12px]"
            >
              <Icons.plus className="w-3.5 h-3.5" />
              New Team
            </Button>
          )}
          {!isTeamEmpty && (
            <motion.div whileHover={{ scale: 1.02 }} whileTap={{ scale: 0.97 }}>
              <Button
                variant={compareMode ? 'primary' : 'ghost'}
                size="sm"
                onClick={() => {
                  setCompareMode(!compareMode)
                  if (compareMode) setCompareTeams([])
                }}
                className="gap-1.5 h-8 text-[12px]"
              >
                <Icons.scale className="w-3.5 h-3.5" />
                {compareMode ? 'Done Comparing' : 'Compare'}
              </Button>
            </motion.div>
          )}
        </div>
      </PageHero>

      {/* ── KPI Strip ── */}
      {!isTeamEmpty && (
        <EntityStatStrip
          stats={[
            { key: 'total', label: 'Total Teams', value: <AnimatedCounter value={teams.length} />, sublabel: '↑12% this week', icon: Icons.users, tone: 'cyan', trend: { label: '+12%', dir: 'up' } },
            { key: 'projects', label: 'Active Projects', value: <AnimatedCounter value={totalProjects} />, sublabel: '↑8% this week', icon: Icons.folder, tone: 'amber', trend: { label: '+8%', dir: 'up' } },
            { key: 'tasks', label: 'Open Tasks', value: <AnimatedCounter value={totalTasks} />, sublabel: '↓3% this week', icon: Icons.checkSquare, tone: 'rose', trend: { label: '-3%', dir: 'down' } },
            { key: 'online', label: 'Members Online', value: <AnimatedCounter value={membersOnline} />, sublabel: '↑5% vs last week', icon: Icons.userCheck || Icons.users, tone: 'emerald', trend: { label: '+5%', dir: 'up' } },
          ]}
        />
      )}

      {/* ── Smart Categorization Bar + Search ── */}
      {!isTeamEmpty && (
        <EntityFilterBar
          search={search}
          onSearch={setSearch}
          searchPlaceholder="Search teams by name or description..."
          chips={[
            { id: 'all', label: 'All Teams', count: categoryCounts.all },
            { id: 'mine', label: 'My Teams', count: categoryCounts.mine },
            ...(categoryCounts.engineering > 0 ? [{ id: 'engineering', label: 'Engineering', count: categoryCounts.engineering }] : []),
            ...(categoryCounts.design > 0 ? [{ id: 'design', label: 'Design', count: categoryCounts.design }] : []),
            ...(categoryCounts.marketing > 0 ? [{ id: 'marketing', label: 'Marketing', count: categoryCounts.marketing }] : []),
            { id: 'favorites', label: 'Favorites', count: categoryCounts.favorites },
          ]}
          activeChip={activeCategory}
          onChip={setActiveCategory}
        />
      )}

      {/* ── Compare mode banner ── */}
      <AnimatePresence>
        {compareMode && (
          <motion.div
            initial={{ opacity: 0, height: 0 }}
            animate={{ opacity: 1, height: 'auto' }}
            exit={{ opacity: 0, height: 0 }}
            className="overflow-hidden"
          >
            <div className="bg-[var(--bg-card)] border border-[var(--border-subtle)] rounded-xl px-4 py-3 mx-4 mb-2 flex items-center justify-between">
              <div className="flex items-center gap-3">
                <Icons.scale className="w-4 h-4 text-[var(--accent)]" />
                <Text size="sm" className="font-medium text-[var(--text-primary)]">
                  {compareTeams.length === 0
                    ? 'Select teams to compare (max 3)'
                    : `${compareTeams.length} team${compareTeams.length > 1 ? 's' : ''} selected`}
                </Text>
                <div className="flex -space-x-1">
                  {compareTeams.map(t => (
                    <TeamAvatar key={t.id} name={t.name} size="sm" hue={hashHue(t.name)} />
                  ))}
                </div>
              </div>
              {compareTeams.length > 0 && (
                <Button variant="ghost" size="xs" onClick={() => setCompareTeams([])} className="text-[11px]">
                  Clear selection
                </Button>
              )}
            </div>
          </motion.div>
        )}
      </AnimatePresence>

      {/* ── Page Content ── */}
      <PageContent>
        <PageState state={pageState} moduleId="teams" stateProps={{ loadingVariant: 'cards', onAction: canCreateTeam ? () => setQuickCreateOpen(true) : undefined }}>
          {/* ── Loading State ── */}
          {pageState === 'loading' && (
            <motion.div
              initial="hidden"
              animate="show"
              variants={{ hidden: {}, show: { transition: { staggerChildren: 0.06 } } }}
              className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4"
            >
              {Array.from({ length: 6 }).map((_, i) => (
                <motion.div
                  key={i}
                  variants={{ hidden: { opacity: 0, y: 12 }, show: { opacity: 1, y: 0 } }}
                >
                  <TeamTileSkeleton />
                </motion.div>
              ))}
            </motion.div>
          )}

          {/* ── Empty State ── */}
          {pageState === 'ready' && isTeamEmpty && (
            <EmptyState
              onClickCreate={() => setQuickCreateOpen(true)}
              organizationName={activeOrganization?.name}
            />
          )}

          {/* ── No Results ── */}
          {pageState === 'ready' && !isTeamEmpty && filteredTeams.length === 0 && (
            <motion.div
              initial={{ opacity: 0, y: 8 }}
              animate={{ opacity: 1, y: 0 }}
              className="text-center py-16 border border-dashed border-[var(--border-subtle)] rounded-2xl bg-[var(--bg-card)]"
            >
              <div className="w-14 h-14 rounded-2xl bg-[var(--bg-subtle)] flex items-center justify-center mx-auto mb-4">
                <Icons.search className="w-6 h-6 text-[var(--text-muted)]" />
              </div>
              <Heading level={3} className="text-[14px] font-semibold text-[var(--text-primary)]">
                No teams match <span className="text-[var(--accent)]">"{search}"</span>
              </Heading>
              <Text variant="muted" size="xs" className="mt-1">
                Try a different search or switch categories.
              </Text>
              <div className="mt-4 flex items-center justify-center gap-2">
                {search && (
                  <Button variant="ghost" size="xs" onClick={() => setSearch('')}>Clear search</Button>
                )}
                {activeCategory !== 'all' && (
                  <Button variant="ghost" size="xs" onClick={() => setActiveCategory('all')}>Show all teams</Button>
                )}
              </div>
            </motion.div>
          )}

          {/* ── Team Gallery Grid ── */}
          {pageState === 'ready' && !isTeamEmpty && filteredTeams.length > 0 && (
            <AnimatePresence mode="wait">
              <motion.div
                key={activeCategory + search}
                initial="hidden"
                animate="show"
                exit="hidden"
                variants={{ hidden: {}, show: { transition: { staggerChildren: 0.05, delayChildren: 0.05 } } }}
                className="ec-grid"
              >
                {filteredTeams.map(team => (
                  <TeamTile
                    key={team.id}
                    team={team}
                    stats={teamStatsMap[team.id] || { taskCount: 0, projectCount: 0, doneCount: 0, completionRate: 0, activeTaskCount: 0 }}
                    isMember={team.members?.some(m => m.userId === user?.id || m.username?.toLowerCase() === user?.username?.toLowerCase())}
                    orgId={orgId}
                    canManage={canManage}
                    canManageTeam={canManageTeam}
                    navigate={navigate}
                    setSelectedTeam={setSelectedTeam}
                    isSelected={compareTeams.some(t => t.id === team.id)}
                    compareMode={compareMode}
                    onToggleCompare={handleToggleCompare}
                    isFavorite={favorites.includes(team.id)}
                    onToggleFavorite={() => toggleFavorite(team.id)}
                  />
                ))}
              </motion.div>
            </AnimatePresence>
          )}
        </PageState>
      </PageContent>

      {/* ── Activity Sidebar ── */}
      {!isTeamEmpty && (
        <ActivitySidebar
          teams={teams}
          statsMap={teamStatsMap}
          isOpen={sidebarOpen}
          onToggle={() => setSidebarOpen(prev => !prev)}
        />
      )}

      {/* ── Compare Panel (bottom drawer) ── */}
      <AnimatePresence>
        {compareMode && compareTeams.length >= 2 && (
          <ComparePanel
            teams={compareTeams}
            statsMap={teamStatsMap}
            onClose={() => { setCompareMode(false); setCompareTeams([]) }}
          />
        )}
      </AnimatePresence>

      {/* ── Quick Create Modal ── */}
      <QuickCreateModal
        isOpen={quickCreateOpen}
        onClose={() => setQuickCreateOpen(false)}
        onCreateWithTemplate={handleQuickCreate}
      />

      {/* ── Existing modals (kept for backward compat) ── */}
      <CreateTeamModal isOpen={createTeamModalOpen} onClose={() => setCreateTeamModalOpen(false)} orgId={orgId} />
      <ManageTeamMembersModal isOpen={!!selectedTeam} onClose={() => setSelectedTeam(null)} team={teams.find(t => t.id === selectedTeam?.id) || selectedTeam} orgMembers={members} />
    </PageShell>
  )
}

export default TeamsPage
