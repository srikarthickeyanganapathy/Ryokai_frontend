// @vitest-environment jsdom
import React from 'react';
import { describe, it, expect, vi, beforeAll, beforeEach, afterEach } from 'vitest';
import '@testing-library/jest-dom/vitest';
import { render, screen, waitFor, cleanup, act } from '@testing-library/react';
import userEvent from '@testing-library/user-event';
import { MemoryRouter, Routes, Route, useNavigate } from 'react-router-dom';
import { PageCoach } from './PageCoach';
import { useTourStore } from '../model/tourStore';
import { resetProgress } from '../model/progressBus';

// Mock the backend-backed onboarding status so each test controls "new vs
// returning user" without a server.
const mockStatus = { data: { status: 'COMPLETED', tourCompleted: false } };
const mockTourMutate = vi.fn();
vi.mock('../hooks/useOnboarding', () => ({
  ONBOARDING_STATUS: {
    NOT_STARTED: 'NOT_STARTED',
    COMPLETED: 'COMPLETED',
    SKIPPED: 'SKIPPED',
  },
  useOnboardingStatus: () => ({ data: mockStatus.data }),
  useOnboardingActions: () => ({ tourComplete: { mutate: mockTourMutate } }),
}));

function NavProbe() {
  const navigate = useNavigate();
  return <button onClick={() => navigate('/app/tasks')}>go to tasks</button>;
}

// Personal-mode dashboard: quick actions + sidebar anchors exist, the stats
// grid (ORG-only widget) does not. PageCoach sits ABOVE the routes, mirroring
// its real position in MainLayout (mounted across all /app/* pages).
function CoachHarness() {
  return (
    <MemoryRouter initialEntries={['/app']}>
      <PageCoach />
      <Routes>
        <Route
          path="/app"
          element={
            <div>
              <div data-tour="dashboard-quick-actions">quick actions</div>
              <div data-tour="sidebar-nav">sidebar nav</div>
              <div data-tour="sidebar-profile">sidebar profile</div>
              <NavProbe />
            </div>
          }
        />
        <Route path="/app/tasks" element={<div>tasks page</div>} />
      </Routes>
    </MemoryRouter>
  );
}

describe('PageCoach', () => {
  beforeAll(() => {
    // jsdom does not implement scrollIntoView.
    Element.prototype.scrollIntoView = vi.fn();
  });

  beforeEach(() => {
    vi.clearAllMocks();
    mockStatus.data = { status: 'COMPLETED', tourCompleted: false };
    resetProgress();
    useTourStore.setState({ pending: false });
  });

  afterEach(() => {
    cleanup();
    document.querySelectorAll('[data-tour="dashboard-stats"]').forEach((el) => el.remove());
  });

  it('does not force the user back to the dashboard while a tour request is pending', async () => {
    const user = userEvent.setup();
    render(<CoachHarness />);

    act(() => {
      useTourStore.setState({ pending: true });
    });

    await user.click(screen.getByText('go to tasks'));
    expect(await screen.findByText('tasks page')).toBeInTheDocument();

    // Give any bounce-back effect a chance to run.
    await new Promise((resolve) => setTimeout(resolve, 600));

    expect(screen.getByText('tasks page')).toBeInTheDocument();
    // The stale request is dropped instead of holding the user hostage.
    expect(useTourStore.getState().pending).toBe(false);
  });

  it('starts the auto-tour on a personal dashboard and skips the ORG-only stats step', async () => {
    render(<CoachHarness />);

    await waitFor(() => {
      expect(screen.getByText('Start here')).toBeInTheDocument();
    }, { timeout: 5000 });

    expect(screen.queryByText('Your day at a glance')).not.toBeInTheDocument();
    expect(screen.getByText(/Step 1 of 3/)).toBeInTheDocument();
  });

  it('anchors all four steps when the stats grid is rendered (ORG dashboard)', async () => {
    const stats = document.createElement('div');
    stats.setAttribute('data-tour', 'dashboard-stats');
    document.body.appendChild(stats);

    render(<CoachHarness />);

    await waitFor(() => {
      expect(screen.getByText('Your day at a glance')).toBeInTheDocument();
    }, { timeout: 5000 });

    expect(screen.getByText(/Step 1 of 4/)).toBeInTheDocument();
  });
});
