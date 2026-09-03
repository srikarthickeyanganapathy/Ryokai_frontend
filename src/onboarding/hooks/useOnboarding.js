import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query';
import {
  getOnboardingStatus,
  completeOnboarding,
  skipOnboarding,
  completeTour,
  dismissChecklist,
} from '../api/onboarding.api';

export const ONBOARDING_STATUS = {
  NOT_STARTED: 'NOT_STARTED',
  COMPLETED: 'COMPLETED',
  SKIPPED: 'SKIPPED',
};

export const onboardingKeys = {
  status: () => ['onboarding', 'status'],
};

/**
 * Backend-persisted onboarding state (the ONLY source of truth for new vs
 * returning user — never localStorage). The welcome experience shows once
 * (NOT_STARTED), never nags after COMPLETED/SKIPPED, and stays reopenable
 * from the Help Center regardless of state. `tourCompleted` reports whether
 * the 30-second tour was taken on any device; `checklistDismissed` reports
 * whether the setup checklist reached its terminal state (dismissed or fully
 * completed) — both per user, on any device.
 */
export function useOnboardingStatus() {
  return useQuery({
    queryKey: onboardingKeys.status(),
    queryFn: getOnboardingStatus,
    staleTime: 60 * 1000,
    retry: 1,
  });
}

export function useOnboardingActions() {
  const queryClient = useQueryClient();

  const complete = useMutation({
    mutationFn: completeOnboarding,
    onSuccess: () => queryClient.invalidateQueries({ queryKey: onboardingKeys.status() }),
  });

  const skip = useMutation({
    mutationFn: skipOnboarding,
    onSuccess: () => queryClient.invalidateQueries({ queryKey: onboardingKeys.status() }),
  });

  const tourComplete = useMutation({
    mutationFn: completeTour,
    onSuccess: () => queryClient.invalidateQueries({ queryKey: onboardingKeys.status() }),
  });

  const checklistDismiss = useMutation({
    mutationFn: dismissChecklist,
    onSuccess: () => queryClient.invalidateQueries({ queryKey: onboardingKeys.status() }),
  });

  return { complete, skip, tourComplete, checklistDismiss };
}
