import React, { useEffect, useState } from 'react'
import { motion, AnimatePresence } from 'framer-motion'
import { PartyPopper } from 'lucide-react'
import { useOnboardingProgress, PROGRESS_KEYS } from '../model/progressBus'

const SEEN_KEY = 'ryokai.firstSuccess.seen.v1'

const wasSeen = () => {
  try {
    return localStorage.getItem(SEEN_KEY) === '1'
  } catch {
    return true
  }
}

const markSeen = () => {
  try {
    localStorage.setItem(SEEN_KEY, '1')
  } catch {
    /* private mode — may replay, harmless */
  }
}

/**
 * First Success Moment — fires ONCE, the first time the user completes a
 * real action (creating or completing a task). A quiet, confident
 * celebration: soft spring-in card, auto-dismisses, never blocks the app.
 */
export function FirstSuccessMoment() {
  const progress = useOnboardingProgress()
  // `show` is derived, never set inside an effect — the only state change
  // happens in the auto-dismiss timeout.
  const [seen, setSeen] = useState(wasSeen)

  const didRealThing = Boolean(
    progress[PROGRESS_KEYS.TASK_CREATED] || progress[PROGRESS_KEYS.TASK_COMPLETED]
  )
  const show = didRealThing && !seen

  useEffect(() => {
    if (!show) return
    const timer = setTimeout(() => {
      markSeen()
      setSeen(true)
    }, 3400)
    return () => clearTimeout(timer)
  }, [show])

  return (
    <AnimatePresence>
      {show && (
        <motion.div
          initial={{ opacity: 0, y: 24, scale: 0.92 }}
          animate={{ opacity: 1, y: 0, scale: 1 }}
          exit={{ opacity: 0, y: 12, scale: 0.96 }}
          transition={{ type: 'spring', stiffness: 380, damping: 26 }}
          role="status"
          aria-live="polite"
          className="fixed bottom-6 left-1/2 -translate-x-1/2 z-[10050] pointer-events-none"
        >
          <div className="flex items-center gap-3 rounded-2xl border border-[var(--border-subtle)] bg-[var(--bg-elevated)] px-5 py-3.5 shadow-2xl">
            <motion.div
              initial={{ scale: 0.5, rotate: -12 }}
              animate={{ scale: 1, rotate: 0 }}
              transition={{ type: 'spring', stiffness: 420, damping: 14, delay: 0.08 }}
              className="w-9 h-9 rounded-full bg-[var(--accent-soft)] flex items-center justify-center"
            >
              <PartyPopper className="h-4 w-4 text-[var(--accent)]" strokeWidth={1.75} />
            </motion.div>
            <div>
              <div className="text-[13.5px] font-semibold text-[var(--text-primary)]">
                That&apos;s the whole loop.
              </div>
              <div className="text-[12px] text-[var(--text-secondary)]">
                Create, work, complete — momentum looks good on you.
              </div>
            </div>
          </div>
        </motion.div>
      )}
    </AnimatePresence>
  )
}
