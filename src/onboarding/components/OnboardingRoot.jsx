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
 *   Setup checklist (per-user on the backend; dismissible, ticks on real
 *     actions, gone for good once dismissed or fully completed)
 *   First Success Moment (one-time celebration on first real action)
 *   Help Center (always reopenable from the sidebar)
 *
 * New-vs-returning is backend state, so nothing ever repeats for the same
 * user on any device. Nothing renders until the status request resolves —
 * guessing "new user" during the fetch would flash the welcome modal or the
 * checklist onto returning users on every login.
 */
export function OnboardingRoot() {
  const { data, isLoading } = useOnboardingStatus()
  const { complete, skip } = useOnboardingActions()
  const helpOpen = useHelpCenterStore((s) => s.isOpen)
  const closeHelp = useHelpCenterStore((s) => s.close)

  const [welcomeDismissed, setWelcomeDismissed] = useState(false)

  // Unknown status (loading or request failed) => show nothing. Failing
  // closed keeps a dismissed checklist from flashing back during outages.
  const statusKnown = !isLoading && Boolean(data)

  const showWelcome =
    statusKnown &&
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
      {statusKnown && !showWelcome && <OnboardingChecklist />}
      <FirstSuccessMoment />
      <HelpCenter open={helpOpen} onOpenChange={handleHelpOpenChange} />
    </>
  )
}
