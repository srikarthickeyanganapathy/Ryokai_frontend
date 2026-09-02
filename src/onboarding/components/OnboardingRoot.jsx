import React, { useState } from 'react'
import { useOnboardingStatus, useOnboardingActions, ONBOARDING_STATUS } from '../hooks/useOnboarding'
import { useHelpCenterStore } from '../model/helpCenterStore'
import { markProgress, PROGRESS_KEYS } from '../model/progressBus'
import { WelcomeOnboarding } from './WelcomeOnboarding'
import { PageCoach } from './PageCoach'
import { OnboardingChecklist } from './OnboardingChecklist'
import { FirstSuccessMoment } from './FirstSuccessMoment'
import { HelpCenter } from './HelpCenter'

/**
 * First-run experience orchestration:
 *
 *   Welcome modal (one decision)
 *     → "Let's get started"  → records completion → dashboard tour fires
 *     → "I'll explore"       → records skip → no tour, no nagging
 *   Setup checklist (persistent, dismissible, ticks on real actions)
 *   First Success Moment (one-time celebration on first real action)
 *   Help Center (always reopenable from the sidebar)
 *
 * Completion/skip persist on the backend, so nothing ever repeats for the
 * same user on any device.
 */
export function OnboardingRoot() {
  const { data, isLoading } = useOnboardingStatus()
  const { complete, skip } = useOnboardingActions()
  const helpOpen = useHelpCenterStore((s) => s.isOpen)
  const closeHelp = useHelpCenterStore((s) => s.close)

  const [welcomeDismissed, setWelcomeDismissed] = useState(false)

  const showWelcome =
    !isLoading &&
    !welcomeDismissed &&
    data?.status === ONBOARDING_STATUS.NOT_STARTED

  const isFresh = data?.status === ONBOARDING_STATUS.NOT_STARTED

  const handleGetStarted = () => {
    setWelcomeDismissed(true)
    if (isFresh) {
      // Completing onboarding flips PageCoach on, which auto-starts the
      // dashboard tour — "teach by showing the real product".
      complete.mutate()
    }
  }

  const handleExplore = () => {
    setWelcomeDismissed(true)
    if (isFresh) skip.mutate()
  }

  const handleHelpOpenChange = (open) => {
    if (open) markProgress(PROGRESS_KEYS.HELP_OPENED)
    else closeHelp()
  }

  return (
    <>
      <WelcomeOnboarding
        open={showWelcome}
        onGetStarted={handleGetStarted}
        onExplore={handleExplore}
      />
      <PageCoach />
      {!showWelcome && <OnboardingChecklist />}
      <FirstSuccessMoment />
      <HelpCenter open={helpOpen} onOpenChange={handleHelpOpenChange} />
    </>
  )
}
