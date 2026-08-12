import React, { useMemo } from 'react'
import { motion, AnimatePresence } from 'framer-motion'
import { Heading, Text } from '@/shared/ui/Typography'
import { Icons } from '@/shared/ui/Icons'
import { cn } from '@/shared/lib/cn'
import { TeamAvatar } from './TeamAvatar'
import { hashHue } from './utils'

/* ══════════════════════════════════════════════════════
 * ACTIVITY FEED SIDEBAR (extracted from TeamsPage)
 * ══════════════════════════════════════════════════════ */

export function ActivitySidebar({ teams, statsMap, isOpen, onToggle }) {
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
