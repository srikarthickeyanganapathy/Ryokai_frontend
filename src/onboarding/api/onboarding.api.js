import api from '@/shared/api/api';

/**
 * First-time onboarding state (backend-persisted per user).
 * status: 'NOT_STARTED' | 'COMPLETED' | 'SKIPPED'
 */
export const getOnboardingStatus = async () => {
  const { data } = await api.get('/workspace/onboarding');
  return data;
};

export const completeOnboarding = async () => {
  await api.post('/workspace/onboarding/complete');
};

export const skipOnboarding = async () => {
  await api.post('/workspace/onboarding/skip');
};
