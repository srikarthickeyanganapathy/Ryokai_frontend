import React, { useEffect, useMemo, useRef, useState } from 'react'
import { motion } from 'framer-motion'
import { useNavigate } from 'react-router-dom'
import { Check, X, ChevronRight, Sparkles } from 'lucide-react'
import { ProgressRing } from '@/shared/ui/Progress'
import { cn } from '@/shared/lib/cn'
import { useOnboardingStatus, useOnboardingActions } from '../hooks/useOnboarding'
import { useOnboardingProgress, markProgress, PROGRESS_KEYS } from '../model/progressBus'
import { useHelpCenterStore } from '../model/helpCenterStore'
import { useTourStore } from '../model/tourStore'

const ITEMS = [
  {
    key: PROGRESS_KEYS.TOUR_DONE,
    label: 'Take the 30-second tour',
    action: 'tour', // launches the guided tour on the dashboard
  },
  {
    key: PROGRESS_KEYS.TASK_CREATED,
    label: 'Create your first task',
    action: { label: 'Create', to: '/app/tasks' },
  },
  {
    key: PROGRESS_KEYS.TASK_COMPLETED,
    label: 'Complete a task',
    action: { label: 'Open Tasks', to: '/app/tasks' },
  },
  {
    key: PROGRESS_KEYS.PROJECT_CREATED,
    label: 'Start a project',
    action: { label: 'New project', to: '/app/projects' },
  },
  {
    key: PROGRESS_KEYS.HELP_OPENED,
    label: 'Peek at the Help Center',
    action: 'help', // opens the Help Center in place
  },
]

/**
 * Onboarding checklist — a small, dismissible card that turns "getting set
 * up" into five real actions. Items tick themselves as the user actually
 * does them (progress bus), so it teaches by doing.
 *
 * Visibility is a per-USER, backend decision (`checklistDismissed` on the
 * onboarding status) — never localStorage, which is browser-wide and once
 * suppressed this card for every account that ever logged in on a machine.
 * The card is a first-login experience: it stays until the user dismisses it
 * or finishes every item (the auto-completion records the same terminal
 * state), and then it is gone for good on every device.
 */
export function OnboardingChecklist() {
  const progress = useOnboardingProgress()
  const { data } = useOnboardingStatus()
  const { checklistDismiss } = useOnboardingActions()
  const navigate = useNavigate()
  const openHelp = useHelpCenterStore((s) => s.open)
  const requestTour = useTourStore((s) => s.requestTour)

  // Optimistic hide while the backend dismissal lands. Hiding on completion
  // needs no state — `allDone` is derived.
  const [hiddenByUser, setHiddenByUser] = useState(false)
  const autoDismissedRef = useRef(false)

  const backendDismissed = Boolean(data?.checklistDismissed)

  const doneCount = useMemo(
    () => ITEMS.filter((i) => progress[i.key]).length,
    [progress]
  )
  const allDone = doneCount === ITEMS.length

  // Finishing every item is the second terminal state — record it per user
  // exactly like an explicit dismiss, then get out of the way.
  useEffect(() => {
    if (!allDone || autoDismissedRef.current) return
    autoDismissedRef.current = true
    checklistDismiss.mutate()
  }, [allDone, checklistDismiss])

  const dismiss = () => {
    // Fire-and-forget: on failure the checklist reappears next visit instead
    // of silently eating the user's dismissal.
    checklistDismiss.mutate()
    setHiddenByUser(true)
  }

  const runAction = (item) => {
    if (item.action === 'help') {
      markProgress(PROGRESS_KEYS.HELP_OPENED)
      openHelp()
    } else if (item.action === 'tour') {
      // PageCoach consumes the request once we're on the dashboard.
      navigate('/app')
      requestTour()
    } else if (item.action?.to) {
      navigate(item.action.to)
    }
  }

  const gone = hiddenByUser || backendDismissed || allDone
  // Terminal state hides the card instantly (no exit animation): dismissal
  // must feel final, and removal must never linger in the DOM.
  if (gone) return null

  return (
    <motion.aside
      initial={{ opacity: 0, y: 16 }}
      animate={{ opacity: 1, y: 0 }}
      transition={{ type: 'spring', stiffness: 300, damping: 28 }}
      aria-label="Getting started checklist"
      className="fixed bottom-5 right-5 z-[60] w-[292px] rounded-2xl border border-[var(--border-subtle)] bg-[var(--bg-elevated)]/95 backdrop-blur-xl shadow-2xl p-4"
    >
      <div className="flex items-center gap-2.5 mb-3">
        <ProgressRing value={(doneCount / ITEMS.length) * 100} size={34} strokeWidth={3} />
        <div className="flex-1 min-w-0">
          <div className="flex items-center gap-1.5">
            <Sparkles className="h-3.5 w-3.5 text-[var(--accent)]" strokeWidth={1.75} />
            <span className="text-[12.5px] font-semibold text-[var(--text-primary)]">
              Get set up
            </span>
          </div>
          <div className="text-[11px] text-[var(--text-tertiary)]">
            {doneCount} of {ITEMS.length} done
          </div>
        </div>
        <button
          type="button"
          onClick={dismiss}
          aria-label="Dismiss checklist"
          className="rounded-md p-1 text-[var(--text-tertiary)] hover:text-[var(--text-primary)] hover:bg-[var(--bg-hover)] transition-colors"
        >
          <X className="h-3.5 w-3.5" />
        </button>
      </div>

      <ul className="space-y-1">
        {ITEMS.map((item) => {
          const done = Boolean(progress[item.key])
          return (
            <li key={item.key}>
              <button
                type="button"
                onClick={() => !done && runAction(item)}
                disabled={done}
                className={cn(
                  'group w-full flex items-center gap-2.5 rounded-lg px-2 py-1.5 text-left transition-colors',
                  done ? 'opacity-55' : 'hover:bg-[var(--bg-hover)]'
                )}
              >
                <span
                  className={cn(
                    'shrink-0 w-4 h-4 rounded-full border flex items-center justify-center transition-colors',
                    done
                      ? 'bg-[var(--accent)] border-[var(--accent)]'
                      : 'border-[var(--border-strong)]'
                  )}
                >
                  {done && (
                    <motion.span
                      initial={{ scale: 0 }}
                      animate={{ scale: 1 }}
                      transition={{ type: 'spring', stiffness: 500, damping: 18 }}
                    >
                      <Check className="h-2.5 w-2.5 text-[var(--text-on-accent)]" strokeWidth={3} />
                    </motion.span>
                  )}
                </span>
                <span
                  className={cn(
                    'flex-1 text-[12px] leading-tight',
                    done
                      ? 'text-[var(--text-tertiary)] line-through decoration-[var(--border-strong)]'
                      : 'text-[var(--text-primary)]'
                  )}
                >
                  {item.label}
                </span>
                {!done && item.action && (
                  <ChevronRight className="h-3.5 w-3.5 text-[var(--text-tertiary)] group-hover:text-[var(--text-primary)] group-hover:translate-x-0.5 transition-all" />
                )}
              </button>
            </li>
          )
        })}
      </ul>
    </motion.aside>
  )
}
