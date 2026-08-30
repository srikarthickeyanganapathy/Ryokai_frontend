import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query';
import { getOnboardingStatus, completeOnboarding, skipOnboarding } from '../api/onboarding.api';

export const ONBOARDING_STATUS = {
  NOT_STARTED: 'NOT_STARTED',
  COMPLETED: 'COMPLETED',
  SKIPPED: 'SKIPPED',
};

export const onboardingKeys = {
  status: () => ['onboarding', 'status'],
};

/**
 * Backend-persisted onboarding state. The welcome experience shows once
 * (NOT_STARTED), never nags after COMPLETED/SKIPPED, and stays reopenable
 * from the Help Center regardless of state.
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

  return { complete, skip };
}
