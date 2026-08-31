import React, { useState, useEffect, useRef, useCallback } from 'react'
import { motion, AnimatePresence } from 'framer-motion'
import { Heading, Text } from '@/shared/ui/Typography'
import { Button } from '@/shared/ui/Button'
import { Progress } from '@/shared/ui/Progress'
import { cn } from '@/shared/lib/cn'
import { SPRINGS, FADE_IN_UP, TIMING } from '@/shared/lib/uxTokens'
import { ProgressBar, PermissionButton, SummaryStat, AnalyticsStat } from '@/shared/ui/SharedWidgets'
import { ChecklistIcon } from '@/shared/ui/Icons/custom'
import {
  Pin,
  Copy,
  Archive,
  Download,
  Settings,
  Users,
  Zap,
  TrendingUp,
  TrendingDown,
  Minus,
  Briefcase,
  Palette,
  Megaphone,
  Code2,
  Wrench,
  MoreHorizontal,
} from 'lucide-react'

/* ===
   EXISTING COMPONENTS (preserved & enhanced)
   === */

export { ProgressBar, PermissionButton, SummaryStat, AnalyticsStat }

/* --- SVG Icons --- */
export { LockIcon, InsightsIcon, ChatIcon, FolderIcon, ChecklistIcon, AlertIcon, CheckIcon } from '@/shared/ui/Icons/custom'

/* --- Empty State (enhanced with optional illustration) --- */
/**
 * EmptyState -- placeholder for empty views.
 * @param {{ icon?: React.ElementType, illustration?: React.ReactNode, title: string, description?: string, actionLabel?: string, onAction?: () => void, actionAllowed?: boolean, actionReason?: string }} props
 */
export function EmptyState({
  icon: Icon,
  illustration,
  title,
  description,
  actionLabel,
  onAction,
  actionAllowed = true,
  actionReason,
}) {
  return (
    <motion.div
      {...FADE_IN_UP}
      className="text-center py-16 bg-[var(--bg-card)] border border-dashed border-[var(--border-subtle)] rounded-xl flex flex-col items-center justify-center gap-2"
    >
      {illustration ? (
        <div className="mb-2">{illustration}</div>
      ) : Icon ? (
        <Icon className="w-6 h-6 text-[var(--text-muted)] mb-2" />
      ) : null}
      <Heading level={4} className="text-[14px] font-semibold tracking-tight">
        {title}
      </Heading>
      {description && (
        <Text variant="muted" size="sm" className="max-w-xs text-[12px]">
          {description}
        </Text>
      )}
      {actionLabel && (
        <div className="mt-4">
          <PermissionButton
            allowed={actionAllowed}
            reason={actionReason}
            onClick={onAction}
            icon={ChecklistIcon}
          >
            {actionLabel}
          </PermissionButton>
        </div>
      )}
    </motion.div>
  )
}

/* ===
   NEW PREMIUM COMPONENTS
   === */

// --- Helpers ---

/** Smoothly animates a number from 0 -> target over `duration` ms. */
function useAnimatedNumber(target, duration = 800, enabled = true) {
  const [current, setCurrent] = useState(0)
  const raf = useRef(null)

  useEffect(() => {
    if (!enabled || target == null) {
      // eslint-disable-next-line react-hooks/set-state-in-effect -- deliberate animated counter
      setCurrent(target ?? 0)
      return
    }
    const start = performance.now()
    const from = current
    const to = Number(target) || 0

    function tick(now) {
      const elapsed = now - start
      const progress = Math.min(elapsed / duration, 1)
      // ease-out quad
      const eased = 1 - (1 - progress) * (1 - progress)
      setCurrent(Math.round(from + (to - from) * eased))
      if (progress < 1) {
        raf.current = requestAnimationFrame(tick)
      }
    }
    raf.current = requestAnimationFrame(tick)
    return () => cancelAnimationFrame(raf.current)
  }, [target, duration, enabled])

  return current
}

/** Determines trend direction and color token. */
function trendMeta(delta) {
  if (delta == null || delta === 0)
    return { arrow: <Minus className="w-3 h-3" />, color: 'var(--text-muted)', label: 'flat' }
  if (delta > 0)
    return {
      arrow: <TrendingUp className="w-3 h-3" />,
      color: 'var(--success)',
      label: 'up',
    }
  return {
    arrow: <TrendingDown className="w-3 h-3" />,
    color: 'var(--danger)',
    label: 'down',
  }
}

/** Maps a template name to color + icon. */
const TEMPLATE_CONFIG = {
  engineering: { bg: 'rgba(99,102,241,0.12)', text: '#818cf8', border: 'rgba(99,102,241,0.3)', Icon: Code2 },
  marketing: { bg: 'rgba(251,146,60,0.12)', text: '#fb923c', border: 'rgba(251,146,60,0.3)', Icon: Megaphone },
  design: { bg: 'rgba(244,114,182,0.12)', text: '#f472b6', border: 'rgba(244,114,182,0.3)', Icon: Palette },
  sales: { bg: 'rgba(52,211,153,0.12)', text: '#34d399', border: 'rgba(52,211,153,0.3)', Icon: Briefcase },
  custom: { bg: 'rgba(148,163,184,0.12)', text: '#94a3b8', border: 'rgba(148,163,184,0.3)', Icon: Wrench },
}

/** Mood scale definition. */
const MOOD_STATES = [
  { score: 1, emoji: '  ', label: 'Struggling', hint: 'Blockers piling up' },
  { score: 2, emoji: '  ', label: 'Concerned', hint: 'A bit overwhelmed' },
  { score: 3, emoji: '  ', label: 'Neutral', hint: 'Steady pace' },
  { score: 4, emoji: '  ', label: 'Positive', hint: 'Making progress' },
  { score: 5, emoji: '  ', label: 'Thriving', hint: 'Everything flows' },
]

/* --- TeamPulse --- */
/**
 * TeamPulse -- compact 7-day activity sparkline with staggered bar animation.
 * @param {{ data?: number[], className?: string }} props
 */
export function TeamPulse({ data, className }) {
  const bars = data?.length === 7 ? data : [0, 0, 0, 0, 0, 0, 0]
  const maxVal = Math.max(...bars, 1)
  const hasActivity = bars.some((v) => v > 0)

  if (!hasActivity) {
    return (
      <div
        className={cn(
          'flex items-center justify-center h-10 rounded-lg bg-[var(--bg-subtle)] border border-[var(--border-subtle)]',
          className
        )}
      >
        <Text variant="muted" size="sm" className="text-[11px] italic">
          No activity yet
        </Text>
      </div>
    )
  }

  return (
    <motion.div
      className={cn('flex items-end gap-[3px] h-10 px-1', className)}
      initial="hidden"
      animate="show"
      variants={{
        show: { transition: { staggerChildren: 0.05, delayChildren: 0.1 } },
      }}
      aria-label="Team activity sparkline - last 7 days"
    >
      {bars.map((val, i) => {
        const h = Math.max(4, Math.round((val / maxVal) * 100))
        return (
          <motion.div
            key={i}
            variants={{
              hidden: { height: 0, opacity: 0 },
              show: { height: `${h}%`, opacity: 1 },
            }}
            transition={SPRINGS.normal}
            className="flex-1 rounded-t-sm"
            style={{
              background: `linear-gradient(180deg, var(--accent) 0%, var(--accent-soft) 100%)`,
              minWidth: 6,
            }}
          />
        )
      })}
    </motion.div>
  )
}

/* --- MoodIndicator --- */
/**
 * MoodIndicator -- segmented sentiment slider for team mood.
 * @param {{ score?: number, className?: string, size?: 'sm'|'md' }} props
 */
export function MoodIndicator({ score = 3, className, size = 'md' }) {
  const clamped = Math.max(1, Math.min(5, Math.round(score)))
  const current = MOOD_STATES[clamped - 1]
  const barHeight = size === 'sm' ? 6 : 8
  const gap = size === 'sm' ? 2 : 3

  const segmentColors = [
    'var(--danger)',
    'var(--warning)',
    'var(--text-muted)',
    'var(--accent)',
    'var(--success)',
  ]

  if (score == null || score < 1) {
    return (
      <div className={cn('flex items-center gap-1', className)}>
        <div className="flex-1 h-2 rounded-full bg-[var(--bg-subtle)]" />
        <Text variant="muted" size="sm" className="text-[11px] italic">
          No data
        </Text>
      </div>
    )
  }

  return (
    <div className={cn('flex flex-col gap-1', className)}>
      {/* Segments */}
      <div className="flex items-end" style={{ gap }}>
        {MOOD_STATES.map((state, i) => {
          const isActive = i + 1 <= clamped
          return (
            <motion.div
              key={state.score}
              animate={{
                height: isActive ? barHeight : Math.round(barHeight * 0.45),
                opacity: isActive ? 1 : 0.35,
                backgroundColor: isActive ? segmentColors[i] : 'var(--bg-subtle)',
                scale: isActive ? 1 : 0.96,
              }}
              transition={SPRINGS.fast}
              className="flex-1 rounded-full"
            />
          )
        })}
      </div>
      {/* Label row */}
      <div className="flex items-center justify-between">
        <AnimatePresence mode="wait">
          <motion.span
            key={current.emoji}
            initial={{ opacity: 0, y: 6, scale: 0.7 }}
            animate={{ opacity: 1, y: 0, scale: 1 }}
            exit={{ opacity: 0, y: -6, scale: 0.7 }}
            transition={SPRINGS.fast}
            className="text-lg leading-none"
            aria-label={current.label}
          >
            {current.emoji}
          </motion.span>
        </AnimatePresence>
        <Text variant="muted" size="sm" className="text-[11px] font-medium tabular-nums">
          {clamped}/5
        </Text>
      </div>
    </div>
  )
}

/* --- QuickActionMenu --- */
const QUICK_ACTIONS = [
  { key: 'pin', label: 'Pin to top', icon: Pin },
  { key: 'duplicate', label: 'Duplicate team', icon: Copy },
  { key: 'archive', label: 'Archive team', icon: Archive, danger: true },
  { key: 'export', label: 'Export report', icon: Download },
  { key: 'settings', label: 'Team settings', icon: Settings },
]

/**
 * QuickActionMenu -- context menu with AnimatePresence for team row actions.
 * @param {{ open: boolean, onAction: (key: string) => void, onClose?: () => void, align?: 'left'|'right', trigger?: React.ReactNode }} props
 */
export function QuickActionMenu({ open, onAction, onClose, align = 'right', trigger }) {
  const ref = useRef(null)
  const [visible, setVisible] = useState(open)

  useEffect(() => {
    setVisible(open)
  }, [open])

  useEffect(() => {
    if (!visible) return
    function handleClick(e) {
      if (ref.current && !ref.current.contains(e.target)) {
        setVisible(false)
        onClose?.()
      }
    }
    document.addEventListener('mousedown', handleClick)
    return () => document.removeEventListener('mousedown', handleClick)
  }, [visible, onClose])

  const handleAction = useCallback(
    (key) => {
      onAction(key)
      setVisible(false)
      onClose?.()
    },
    [onAction, onClose]
  )

  return (
    <div className="relative inline-block" ref={ref}>
      {trigger || (
        <button
          onClick={() => setVisible((v) => !v)}
          className="p-1.5 rounded-lg hover:bg-[var(--bg-subtle)] transition-colors text-[var(--text-muted)]"
          aria-label="Team actions"
        >
          <MoreHorizontal className="w-4 h-4" />
        </button>
      )}

      <AnimatePresence>
        {visible && (
          <motion.div
            initial={{ opacity: 0, scale: 0.9, y: -4 }}
            animate={{ opacity: 1, scale: 1, y: 0 }}
            exit={{ opacity: 0, scale: 0.9, y: -4 }}
            transition={SPRINGS.fast}
            className={cn(
              'absolute z-50 mt-1 w-48 rounded-xl bg-[var(--bg-card)] border border-[var(--border-subtle)] shadow-xl shadow-black/10 py-1 overflow-hidden',
              align === 'right' ? 'right-0' : 'left-0'
            )}
          >
            {QUICK_ACTIONS.map(({ key, label, icon: QIcon, danger }) => (
              <button
                key={key}
                onClick={() => handleAction(key)}
                className={cn(
                  'w-full flex items-center gap-2.5 px-3 py-2 text-[13px] transition-colors text-left',
                  danger
                    ? 'text-[var(--danger)] hover:bg-[var(--danger)]/10'
                    : 'text-[var(--text-primary)] hover:bg-[var(--bg-subtle)]'
                )}
              >
                <QIcon className="w-3.5 h-3.5 flex-shrink-0" />
                <span className="truncate">{label}</span>
              </button>
            ))}
          </motion.div>
        )}
      </AnimatePresence>
    </div>
  )
}

/* --- TeamTemplateBadge --- */
/**
 * TeamTemplateBadge -- colored badge showing the team's template origin.
 * @param {{ template?: string, className?: string }} props
 */
export function TeamTemplateBadge({ template, className }) {
  const key = (template || '').toLowerCase()
  const config = TEMPLATE_CONFIG[key] || TEMPLATE_CONFIG.custom
  const { Icon } = config

  if (!template) {
    return (
      <span
        className={cn(
          'inline-flex items-center gap-1 px-2 py-0.5 rounded-md text-[11px] font-medium border',
          'bg-[var(--bg-subtle)] border-[var(--border-subtle)] text-[var(--text-muted)]',
          className
        )}
      >
        <Wrench className="w-3 h-3" />
        No template
      </span>
    )
  }

  return (
    <motion.span
      initial={{ opacity: 0, scale: 0.85 }}
      animate={{ opacity: 1, scale: 1 }}
      transition={SPRINGS.fast}
      className={cn(
        'inline-flex items-center gap-1.5 px-2.5 py-1 rounded-full text-[11px] font-semibold border select-none',
        className
      )}
      style={{
        backgroundColor: config.bg,
        color: config.text,
        borderColor: config.border,
      }}
    >
      <Icon className="w-3 h-3" />
      {template}
    </motion.span>
  )
}

/* --- LiveActivityDot --- */
/**
 * LiveActivityDot -- pulsing green dot for real-time activity indication.
 * @param {{ isActive?: boolean, className?: string, size?: 'sm'|'md'|'lg' }} props
 */
export function LiveActivityDot({ isActive, className, size = 'md' }) {
  const dims = { sm: 'w-2 h-2', md: 'w-2.5 h-2.5', lg: 'w-3 h-3' }

  if (!isActive) {
    return (
      <span
        className={cn('inline-block rounded-full bg-[var(--text-muted)]/40', dims[size], className)}
        title="No live activity"
      />
    )
  }

  return (
    <span className={cn('relative inline-flex', dims[size], className)} title="Live activity">
      <span className="absolute inset-0 rounded-full bg-[var(--success)] animate-ping opacity-75" />
      <span className="relative rounded-full bg-[var(--success)] w-full h-full shadow-[0_0_6px_var(--success)]" />
    </span>
  )
}

/* --- SmartStatPill --- */
/**
 * SmartStatPill -- enhanced stat pill with counter animation, trend, & sparkline.
 * @param {{ icon?: React.ElementType, label: string, value: number, trend?: number, sparkline?: number[], animate?: boolean, className?: string }} props
 */
export function SmartStatPill({
  icon: Icon,
  label,
  value,
  trend,
  sparkline,
  animate = true,
  className,
}) {
  const displayed = useAnimatedNumber(value, 800, animate)
  const { arrow, color } = trendMeta(trend)
  const hasSparkline = Array.isArray(sparkline) && sparkline.length > 1
  const sparkMax = hasSparkline ? Math.max(...sparkline, 1) : 1

  return (
    <motion.div
      whileHover={{
        scale: 1.02,
        boxShadow: `0 0 18px rgba(var(--accent-rgb, 99,102,241), 0.12)`,
      }}
      transition={SPRINGS.fast}
      className={cn(
        'relative overflow-hidden rounded-xl bg-[var(--bg-card)] border border-[var(--border-subtle)] p-3.5 group',
        className
      )}
    >
      {/* Background sparkline */}
      {hasSparkline && (
        <div className="absolute inset-0 opacity-[0.06] pointer-events-none">
          <svg width="100%" height="100%" viewBox={`0 0 ${sparkline.length - 1} 1`} preserveAspectRatio="none">
            <polyline
              fill="none"
              stroke="var(--accent)"
              strokeWidth="0.12"
              strokeLinecap="round"
              strokeLinejoin="round"
              points={sparkline
                .map((v, i) => `${i},${1 - v / sparkMax}`)
                .join(' ')}
            />
          </svg>
        </div>
      )}

      <div className="relative flex items-start justify-between">
        {/* Icon + Label */}
        <div className="flex items-center gap-1.5 min-w-0">
          {Icon && (
            <Icon className="w-3.5 h-3.5 text-[var(--text-muted)] flex-shrink-0" aria-hidden />
          )}
          <span className="text-[10px] uppercase tracking-wider text-[var(--text-muted)] font-semibold truncate">
            {label}
          </span>
        </div>

        {/* Trend arrow */}
        {trend != null && (
          <span
            className="flex items-center gap-0.5 text-[11px] font-semibold"
            style={{ color }}
          >
            {arrow}
            <span className="tabular-nums">{Math.abs(trend)}%</span>
          </span>
        )}
      </div>

      {/* Value */}
      <motion.div
        className="text-2xl font-bold tabular-nums text-[var(--text-primary)] tracking-tight mt-1"
        key={displayed}
      >
        {displayed.toLocaleString()}
      </motion.div>
    </motion.div>
  )
}

/* --- TeamIdentityBanner --- */
const TEAM_HUES = [
  220, // blue
  280, // purple
  340, // rose
  170, // teal
  30,  // amber
  140, // green
  10,  // orange
]

/**
 * TeamIdentityBanner -- full-width team header for detail pages.
 * @param {{ team: { name?: string, tagline?: string, avatarUrl?: string, initials?: string }, hue?: number, memberCount?: number, onlineCount?: number, onEdit?: (field: string, value: string) => void, quickActions?: React.ReactNode, className?: string }} props
 */
export function TeamIdentityBanner({
  team = {},
  hue,
  memberCount = 0,
  onlineCount = 0,
  onEdit,
  quickActions,
  className,
}) {
  const { name = 'Untitled Team', tagline, avatarUrl, initials } = team
  const safeHue = hue != null ? hue : TEAM_HUES[Math.abs(hashString(name)) % TEAM_HUES.length]
  const gradStart = `hsl(${safeHue}, 65%, 18%)`
  const gradEnd = `hsl(${safeHue}, 45%, 10%)`

  return (
    <motion.div
      {...FADE_IN_UP}
      className={cn(
        'relative overflow-hidden rounded-2xl border border-[var(--border-subtle)]',
        className
      )}
    >
      {/* Gradient background */}
      <div
        className="absolute inset-0"
        style={{
          background: `linear-gradient(135deg, ${gradStart} 0%, ${gradEnd} 40%, var(--bg-card) 100%)`,
        }}
      />

      {/* Subtle grid pattern overlay */}
      <div
        className="absolute inset-0 opacity-[0.04] pointer-events-none"
        style={{
          backgroundImage:
            'radial-gradient(circle, rgba(255,255,255,0.8) 1px, transparent 1px)',
          backgroundSize: '20px 20px',
        }}
      />

      <div className="relative px-6 py-5 flex flex-col sm:flex-row sm:items-center gap-4">
        {/* Avatar */}
        <div className="relative flex-shrink-0">
          <div
            className="w-14 h-14 rounded-2xl flex items-center justify-center text-xl font-bold text-white shadow-lg overflow-hidden"
            style={{
              backgroundColor: avatarUrl ? 'transparent' : gradStart,
              boxShadow: `0 0 24px ${gradStart}66`,
            }}
          >
            {avatarUrl ? (
              <img src={avatarUrl} alt={name} className="w-full h-full object-cover" />
            ) : (
              <span>{initials || name.slice(0, 2).toUpperCase()}</span>
            )}
          </div>
          {/* Online indicator -- only when real presence data is passed in */}
          {onlineCount > 0 && (
            <LiveActivityDot
              isActive
              size="sm"
              className="absolute -bottom-0.5 -right-0.5 ring-2 ring-[var(--bg-card)]"
            />
          )}
        </div>

        {/* Info */}
        <div className="flex-1 min-w-0">
          <Heading level={3} className="text-[16px] font-bold text-white tracking-tight">
            {name}
          </Heading>
          {/* Editable tagline */}
          {tagline ? (
            <Text className="text-[13px] text-white/60 mt-0.5">{tagline}</Text>
          ) : onEdit ? (
            <button
              onClick={() => onEdit('tagline', '')}
              className="text-[13px] text-white/30 italic hover:text-white/50 transition-colors mt-0.5 text-left"
            >
              Add a tagline...
            </button>
          ) : null}

          {/* Member row */}
          <div className="flex items-center gap-3 mt-2">
            <span className="inline-flex items-center gap-1 text-[12px] text-white/50">
              <Users className="w-3 h-3" />
              <span className="font-semibold tabular-nums">{memberCount}</span> members
            </span>
            {onlineCount > 0 && (
              <span className="inline-flex items-center gap-1 text-[12px] text-[var(--success)]/80">
                <Zap className="w-3 h-3" />
                <span className="font-semibold tabular-nums">{onlineCount}</span> online
              </span>
            )}
          </div>
        </div>

        {/* Quick actions slot */}
        {quickActions && (
          <div className="flex-shrink-0 flex items-center gap-2">{quickActions}</div>
        )}
      </div>
    </motion.div>
  )
}

/** Simple string hash for deterministic hue selection. */
function hashString(str) {
  let hash = 0
  for (let i = 0; i < str.length; i++) {
    hash = (hash * 31 + str.charCodeAt(i)) | 0
  }
  return Math.abs(hash)
}