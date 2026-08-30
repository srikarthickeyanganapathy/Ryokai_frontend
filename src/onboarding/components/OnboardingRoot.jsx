import React from 'react'
import { useOnboardingStatus, ONBOARDING_STATUS } from '../hooks/useOnboarding'
import { useHelpCenterStore } from '../model/helpCenterStore'
import { WelcomeOnboarding } from './WelcomeOnboarding'
import { PageCoach } from './PageCoach'
import { HelpCenter } from './HelpCenter'

/**
 * Mounts the first-run and help experiences:
 *  - WelcomeOnboarding renders once, only while backend state is NOT_STARTED
 *    (loading or COMPLETED/SKIPPED render nothing — never nags).
 *  - HelpCenter renders on demand from any surface via the zustand store.
 *  - PageCoach teaches each page on first visit after the welcome flow
 *    (Dashboard -> Tasks -> Projects -> Calendar -> Analytics chain).
 *
 */
export function OnboardingRoot() {
  const { data, isLoading } = useOnboardingStatus()
  const helpOpen = useHelpCenterStore((s) => s.isOpen)
  const closeHelp = useHelpCenterStore((s) => s.close)

  const showWelcome = !isLoading && data?.status === ONBOARDING_STATUS.NOT_STARTED

  return (
    <>
      {showWelcome && <WelcomeOnboarding status={data.status} />}
      <PageCoach />
      <HelpCenter open={helpOpen} onOpenChange={(open) => !open && closeHelp()} />
    </>
  )
}

