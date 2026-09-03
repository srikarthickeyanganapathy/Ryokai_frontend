// @vitest-environment jsdom
import React from 'react';
import { describe, it, expect, vi, beforeEach, afterEach } from 'vitest';
import '@testing-library/jest-dom/vitest';
import { render, screen, cleanup, act } from '@testing-library/react';
import userEvent from '@testing-library/user-event';
import { MemoryRouter } from 'react-router-dom';
import { OnboardingChecklist } from './OnboardingChecklist';
import { markProgress, resetProgress, PROGRESS_KEYS } from '../model/progressBus';

// Backend-backed onboarding status is mocked so each test controls the
// per-user checklist state the way the server would report it.
const mockStatus = {
  data: { status: 'COMPLETED', tourCompleted: false, checklistDismissed: false },
};
const mockDismissMutate = vi.fn();
vi.mock('../hooks/useOnboarding', () => ({
  ONBOARDING_STATUS: {
    NOT_STARTED: 'NOT_STARTED',
    COMPLETED: 'COMPLETED',
    SKIPPED: 'SKIPPED',
  },
  useOnboardingStatus: () => ({ data: mockStatus.data }),
  useOnboardingActions: () => ({ checklistDismiss: { mutate: mockDismissMutate } }),
}));

function renderChecklist() {
  return render(
    <MemoryRouter>
      <OnboardingChecklist />
    </MemoryRouter>
  );
}

describe('OnboardingChecklist', () => {
  beforeEach(() => {
    vi.clearAllMocks();
    mockStatus.data = { status: 'COMPLETED', tourCompleted: false, checklistDismissed: false };
    resetProgress();
  });

  afterEach(() => {
    cleanup();
  });

  it('shows for a first-login user whose checklist is still pending', () => {
    renderChecklist();

    expect(screen.getByLabelText('Getting started checklist')).toBeInTheDocument();
    expect(screen.getByText(/0 of 5 done/)).toBeInTheDocument();
  });

  it('never renders once the backend reports the checklist dismissed', () => {
    mockStatus.data = { status: 'COMPLETED', tourCompleted: true, checklistDismissed: true };
    renderChecklist();

    // The "once and never again" rule is per user on the backend — localStorage
    // must not be able to resurrect it, nor suppress it for other accounts.
    expect(screen.queryByLabelText('Getting started checklist')).not.toBeInTheDocument();
  });

  it('dismisses via the backend and disappears immediately', async () => {
    const user = userEvent.setup();
    renderChecklist();

    await user.click(screen.getByRole('button', { name: 'Dismiss checklist' }));

    expect(mockDismissMutate).toHaveBeenCalledTimes(1);
    expect(screen.queryByLabelText('Getting started checklist')).not.toBeInTheDocument();
  });

  it('treats completing every item as a terminal dismissal (recorded once)', () => {
    renderChecklist();

    act(() => {
      Object.values(PROGRESS_KEYS).forEach((key) => markProgress(key));
    });

    expect(mockDismissMutate).toHaveBeenCalledTimes(1);
    expect(screen.queryByLabelText('Getting started checklist')).not.toBeInTheDocument();
  });

  it('stays visible while only some items are done', () => {
    renderChecklist();

    act(() => {
      markProgress(PROGRESS_KEYS.TOUR_DONE);
      markProgress(PROGRESS_KEYS.HELP_OPENED);
    });

    expect(screen.getByLabelText('Getting started checklist')).toBeInTheDocument();
    expect(screen.getByText(/2 of 5 done/)).toBeInTheDocument();
    expect(mockDismissMutate).not.toHaveBeenCalled();
  });
});
