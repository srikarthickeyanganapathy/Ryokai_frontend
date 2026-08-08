import React, { useState, useMemo, useCallback } from 'react'
import { motion, AnimatePresence } from 'framer-motion'
import { Heading, Text } from '@/shared/ui/Typography'
import { Button } from '@/shared/ui/Button'
import { Badge } from '@/shared/ui/Badge'
import { Icons } from '@/shared/ui/Icons'
import { SaveToggle } from '@/library/saved/features/components/SaveToggle'
import { ENTITY_TYPES } from '@/shared/constants/entityTypes'
import { PermissionButton, FolderIcon, ChecklistIcon, CheckIcon, ChatIcon } from './Shared'
import { useNavigate } from 'react-router-dom'
import { cn } from '@/shared/lib/cn'
import { SPRINGS } from '@/shared/lib/uxTokens'

/* ── Mood Options ── */
const MOODS = [
  { emoji: '😤', label: 'Stressed', value: 'stressed' },
  { emoji: '😐', label: 'Meh', value: 'meh' },
  { emoji: '🙂', label: 'Okay', value: 'okay' },
  { emoji: '😊', label: 'Good', value: 'good' },
  { emoji: '🤩', label: 'Amazing', value: 'amazing' },
]

/* ── Hash Hue ── */
export function hashHue(str = '') {
  let hash = 0
  for (let i = 0; i < str.length; i++) hash = str.charCodeAt(i) + ((hash << 5) - hash)
  return Math.abs(hash) % 360
}

/* ── Stat Chip ── */
function StatChip({ icon: Icon, value, sub, colorClass, bgClass }) {
  return (
    <motion.div
      whileHover={{ y: -1 }}
      className={cn(
        'flex items-center gap-1.5 px-2.5 py-1.5 rounded-lg text-xs font-medium border transition-colors',
        bgClass || 'bg-[var(--bg-subtle)]',
        'border-[var(--border-subtle)]',
      )}
    >
      {Icon && <Icon className={cn('w-3.5 h-3.5', colorClass || 'text-[var(--accent)]')} />}
      <span className="font-bold text-[var(--text-primary)] tabular-nums">{value}</span>
      {sub && <span className="text-[var(--text-muted)] font-normal">{sub}</span>}
    </motion.div>
  )
}

/* ── Mood Selector ── */
function MoodSelector({ hue, isCollapsed }) {
  const [votes, setVotes] = useState(() => {
    const counts = {}
    MOODS.forEach(m => { counts[m.value] = Math.floor(Math.random() * 4) })
    // Make one mood dominant
    const winner = MOODS[Math.floor(Math.random() * MOODS.length)].value
    counts[winner] = Math.max(3, Math.floor(Math.random() * 5) + 2)
    return counts
  })
  const [selectedMood, setSelectedMood] = useState(null)
  const [showPicker, setShowPicker] = useState(false)
  const [hasVoted, setHasVoted] = useState(false)

  const dominant = useMemo(() => {
    let best = MOODS[0]
    MOODS.forEach(m => {
      if ((votes[m.value] || 0) > (votes[best.value] || 0)) best = m
    })
    return best
  }, [votes])

  const totalVotes = Object.values(votes).reduce((a, b) => a + b, 0)

  const handleVote = useCallback((mood) => {
    if (hasVoted) return
    setVotes(prev => ({ ...prev, [mood.value]: (prev[mood.value] || 0) + 1 }))
    setSelectedMood(mood.value)
    setHasVoted(true)
    setTimeout(() => setShowPicker(false), 600)
  }, [hasVoted])

  return (
    <div className="relative">
      <button
        onClick={() => setShowPicker(!showPicker)}
        className={cn(
          'flex items-center gap-1.5 px-2.5 py-1.5 rounded-lg text-xs font-medium border transition-all duration-200',
          'bg-[var(--bg-subtle)] border-[var(--border-subtle)]',
          'hover:bg-[var(--bg-hover)] hover:border-[var(--accent-border)]',
          isCollapsed && 'scale-90',
        )}
        title="Team Mood"
      >
        <span className="text-sm">{dominant.emoji}</span>
        {!isCollapsed && (
          <>
            <span className="text-[var(--text-secondary)]">{dominant.label}</span>
            <span className="text-[10px] text-[var(--text-muted)] tabular-nums">{totalVotes}</span>
          </>
        )}
      </button>

      <AnimatePresence>
        {showPicker && (
          <motion.div
            initial={{ opacity: 0, scale: 0.92, y: -4 }}
            animate={{ opacity: 1, scale: 1, y: 0 }}
            exit={{ opacity: 0, scale: 0.92, y: -4 }}
            transition={SPRINGS.fast}
            className="absolute right-0 top-full mt-2 z-50 p-3 rounded-xl bg-[var(--bg-card)] border border-[var(--border-subtle)] shadow-xl shadow-black/5"
          >
            <Text size="xs" className="text-[var(--text-muted)] mb-2 text-center font-medium">How's the team feeling?</Text>
            <div className="flex items-center gap-1">
              {MOODS.map(mood => {
                const isSelected = selectedMood === mood.value
                const count = votes[mood.value] || 0
                return (
                  <motion.button
                    key={mood.value}
                    whileHover={{ scale: 1.15 }}
                    whileTap={{ scale: 0.9 }}
                    onClick={() => handleVote(mood)}
                    disabled={hasVoted && !isSelected}
                    className={cn(
                      'flex flex-col items-center gap-0.5 p-2 rounded-xl transition-all duration-200',
                      isSelected
                        ? 'bg-[var(--accent-soft)] ring-1 ring-[var(--accent-border)]'
                        : 'hover:bg-[var(--bg-hover)]',
                      hasVoted && !isSelected && 'opacity-40 cursor-not-allowed',
                    )}
                  >
                    <span className="text-xl leading-none">{mood.emoji}</span>
                    <span className="text-[9px] text-[var(--text-muted)] tabular-nums font-medium">{count}</span>
                  </motion.button>
                )
              })}
            </div>
            {hasVoted && (
              <motion.p
                initial={{ opacity: 0, height: 0 }}
                animate={{ opacity: 1, height: 'auto' }}
                className="text-[10px] text-[var(--accent)] text-center mt-2 font-medium"
              >
                Vote recorded ✓
              </motion.p>
            )}
          </motion.div>
        )}
      </AnimatePresence>
    </div>
  )
}

/* ── Quick Actions Menu ── */
function QuickActions({ hue, onManageMembers, onCreateProject, onOpenChat, teamId }) {
  const [showMenu, setShowMenu] = useState(false)

  return (
    <div className="relative">
      <Button
        variant="ghost"
        size="sm"
        onClick={() => setShowMenu(!showMenu)}
        className="gap-1 text-[12px] h-8 px-2"
      >
        <Icons.moreHorizontal className="w-4 h-4" />
      </Button>
      <AnimatePresence>
        {showMenu && (
          <>
            <motion.div
              initial={{ opacity: 0 }}
              animate={{ opacity: 1 }}
              exit={{ opacity: 0 }}
              className="fixed inset-0 z-40"
              onClick={() => setShowMenu(false)}
            />
            <motion.div
              initial={{ opacity: 0, scale: 0.92, y: -4 }}
              animate={{ opacity: 1, scale: 1, y: 0 }}
              exit={{ opacity: 0, scale: 0.92, y: -4 }}
              transition={SPRINGS.fast}
              className="absolute right-0 top-full mt-1 z-50 w-44 rounded-xl bg-[var(--bg-card)] border border-[var(--border-subtle)] shadow-xl shadow-black/5 overflow-hidden py-1"
            >
              <button
                onClick={() => { onManageMembers(); setShowMenu(false) }}
                className="w-full flex items-center gap-2 px-3 py-2 text-[12px] text-[var(--text-secondary)] hover:text-[var(--text-primary)] hover:bg-[var(--bg-hover)] transition-colors"
              >
                <Icons.settings className="w-3.5 h-3.5" /> Team Settings
              </button>
              <button
                onClick={() => { setShowMenu(false) }}
                className="w-full flex items-center gap-2 px-3 py-2 text-[12px] text-[var(--text-secondary)] hover:text-[var(--text-primary)] hover:bg-[var(--bg-hover)] transition-colors"
              >
                <Icons.copy className="w-3.5 h-3.5" /> Copy Invite Link
              </button>
              <button
                onClick={() => { setShowMenu(false) }}
                className="w-full flex items-center gap-2 px-3 py-2 text-[12px] text-[var(--text-secondary)] hover:text-[var(--text-primary)] hover:bg-[var(--bg-hover)] transition-colors"
              >
                <Icons.bell className="w-3.5 h-3.5" /> Notification Settings
              </button>
            </motion.div>
          </>
        )}
      </AnimatePresence>
    </div>
  )
}

/* ═══════════════════════════════════════════════
   TeamHeader - Premium Identity Header
   ═══════════════════════════════════════════════ */
export function TeamHeader({ team, orgId, insights, teamProjects, teamTasks, isReadOnly, canManage, canCreateProject, onManageMembers, onCreateProject, onOpenChat }) {
  const navigate = useNavigate()
  const hue = hashHue(team.name)
  const [isStarred, setIsStarred] = useState(false)
  const [notificationCount] = useState(() => Math.floor(Math.random() * 4))

  const onlineCount = useMemo(() => {
    if (!team.members) return 0
    return team.members.filter(m => m.online || m.status === 'online').length
  }, [team.members])

  return (
    <motion.div
      initial={{ opacity: 0, y: 8 }}
      animate={{ opacity: 1, y: 0 }}
      transition={SPRINGS.gentle}
      className="relative overflow-hidden rounded-2xl border border-[var(--border-subtle)] bg-[var(--bg-card)]"
    >
      {/* ── Gradient Banner ── */}
      <div
        className="absolute inset-0 pointer-events-none"
        style={{
          background: `
            radial-gradient(ellipse 80% 120% at 30% -20%, hsl(${hue} 75% 55% / 0.12), transparent 60%),
            radial-gradient(ellipse 50% 80% at 90% 120%, hsl(${(hue + 60) % 360} 65% 55% / 0.06), transparent 60%)
          `,
        }}
        aria-hidden="true"
      />

      {/* ── Top accent line ── */}
      <div
        className="absolute top-0 left-0 right-0 h-[3px]"
        style={{ background: `linear-gradient(90deg, hsl(${hue} 75% 55%), hsl(${(hue + 40) % 360} 70% 50%))` }}
        aria-hidden="true"
      />

      <div className="relative px-6 pt-6 pb-5">
        {/* ── Top Row: Avatar + Info + Actions ── */}
        <div className="flex flex-col lg:flex-row lg:items-start justify-between gap-5">
          <div className="flex items-start gap-5 min-w-0 flex-1">
            {/* Large Avatar with Glow Ring */}
            <motion.div
              whileHover={{ scale: 1.05 }}
              className="relative shrink-0"
            >
              {/* Glow ring */}
              <div
                className="absolute -inset-[3px] rounded-full opacity-50 blur-sm"
                style={{
                  background: `conic-gradient(from 0deg, hsl(${hue} 80% 55%), hsl(${(hue + 80) % 360} 70% 55%), hsl(${hue} 80% 55%))`,
                }}
                aria-hidden="true"
              />
              <div
                className="relative w-14 h-14 rounded-2xl text-white flex items-center justify-center font-bold text-xl shadow-lg ring-1 ring-black/10"
                style={{
                  background: `linear-gradient(135deg, hsl(${hue} 70% 52%), hsl(${(hue + 40) % 360} 70% 40%))`,
                }}
              >
                {team.name.charAt(0).toUpperCase()}
              </div>
            </motion.div>

            {/* Team Info */}
            <div className="min-w-0 flex-1">
              <div className="flex flex-wrap items-center gap-2 mb-1">
                <Heading level={2} className="tracking-tight text-[20px] font-bold mb-0">
                  {team.name}
                </Heading>
                <Badge variant="outline" className="bg-[var(--accent-soft)] text-[var(--accent)] border-[var(--accent-border)] text-[10px] font-mono uppercase tracking-wider">
                  Team
                </Badge>
                {isReadOnly && (
                  <Badge variant="outline" className="bg-[var(--warning-soft)] text-[var(--warning)] border-[var(--warning)]/20 text-[10px] font-mono uppercase">
                    Observer
                  </Badge>
                )}
                <SaveToggle entityType={ENTITY_TYPES.TEAM} entityId={team.id} className="ml-0.5" />
              </div>

              {team.description && (
                <Text variant="muted" className="text-[13px] max-w-2xl mb-3 leading-relaxed">
                  {team.description}
                </Text>
              )}

              {/* Quick Stats Row */}
              <div className="flex flex-wrap items-center gap-2">
                <StatChip
                  icon={Icons.users}
                  value={team.members?.length || 0}
                  sub="Members"
                />
                {onlineCount > 0 && (
                  <StatChip
                    icon={Icons.zap}
                    value={onlineCount}
                    sub="Online"
                    colorClass="text-emerald-500"
                    bgClass="bg-emerald-50/50"
                  />
                )}
                <StatChip
                  icon={FolderIcon}
                  value={teamProjects.length}
                  sub="Projects"
                  colorClass="text-amber-500"
                />
                <StatChip
                  icon={ChecklistIcon}
                  value={teamTasks.length}
                  sub="Tasks"
                  colorClass="text-sky-500"
                />
                <StatChip
                  icon={CheckIcon}
                  value={`${insights.completionRate}%`}
                  sub="Complete"
                  colorClass="text-emerald-500"
                />
              </div>
            </div>
          </div>

          {/* ── Right: Quick Actions ── */}
          <div className="flex items-center gap-1.5 shrink-0 lg:self-start">
            {/* Star / Bookmark */}
            <motion.button
              whileHover={{ scale: 1.1 }}
              whileTap={{ scale: 0.9 }}
              onClick={() => setIsStarred(!isStarred)}
              className={cn(
                'p-2 rounded-lg border transition-all duration-200',
                isStarred
                  ? 'bg-amber-50 border-amber-200 text-amber-500'
                  : 'bg-[var(--bg-subtle)] border-[var(--border-subtle)] text-[var(--text-muted)] hover:text-amber-500 hover:border-amber-200',
              )}
              title={isStarred ? 'Remove bookmark' : 'Bookmark team'}
            >
              <Icons.star className={cn('w-4 h-4', isStarred && 'fill-current')} />
            </motion.button>

            {/* Share */}
            <motion.button
              whileHover={{ scale: 1.1 }}
              whileTap={{ scale: 0.9 }}
              className="p-2 rounded-lg bg-[var(--bg-subtle)] border border-[var(--border-subtle)] text-[var(--text-muted)] hover:text-[var(--accent)] hover:border-[var(--accent-border)] transition-all duration-200"
              title="Share team"
            >
              <Icons.link className="w-4 h-4" />
            </motion.button>

            {/* Notification Bell */}
            <motion.button
              whileHover={{ scale: 1.1 }}
              whileTap={{ scale: 0.9 }}
              className="relative p-2 rounded-lg bg-[var(--bg-subtle)] border border-[var(--border-subtle)] text-[var(--text-muted)] hover:text-[var(--text-primary)] hover:border-[var(--accent-border)] transition-all duration-200"
              title="Notifications"
            >
              <Icons.bell className="w-4 h-4" />
              {notificationCount > 0 && (
                <motion.span
                  initial={{ scale: 0 }}
                  animate={{ scale: 1 }}
                  transition={{ type: 'spring', stiffness: 500, damping: 30 }}
                  className="absolute -top-0.5 -right-0.5 min-w-[16px] h-4 flex items-center justify-center rounded-full bg-[var(--danger)] text-white text-[9px] font-bold px-1 tabular-nums"
                >
                  {notificationCount}
                </motion.span>
              )}
            </motion.button>

            {/* Team Mood */}
            <MoodSelector hue={hue} />

            {/* More Actions */}
            <QuickActions
              hue={hue}
              onManageMembers={onManageMembers}
              onCreateProject={onCreateProject}
              onOpenChat={onOpenChat}
              teamId={team.id}
            />
          </div>
        </div>

        {/* ── Bottom Row: Primary Action Buttons ── */}
        <div className="flex flex-wrap items-center gap-2 mt-5 pt-4 border-t border-[var(--border-subtle)]">
          <PermissionButton
            allowed={canCreateProject && !isReadOnly}
            reason={isReadOnly ? 'Observers cannot create projects.' : "You don't have permission to create projects."}
            onClick={onCreateProject}
            variant="primary"
            icon={Icons.plus}
          >
            Create Project
          </PermissionButton>
          <PermissionButton
            allowed={canManage}
            reason="You don't have permission to manage this team."
            onClick={onManageMembers}
            icon={Icons.users}
          >
            Manage Team
          </PermissionButton>
          <Button
            variant="ghost"
            size="sm"
            onClick={onOpenChat}
            className="gap-1.5 text-[12px] h-8"
          >
            <ChatIcon className="w-3.5 h-3.5" /> Discussion
          </Button>
          <Button
            variant="ghost"
            size="sm"
            onClick={() => navigate(`/app/organizations/${orgId}`)}
            className="gap-1.5 text-[12px] h-8 ml-auto"
          >
            <Icons.chevronLeft className="w-4 h-4" /> Back
          </Button>
        </div>
      </div>
    </motion.div>
  )
}
