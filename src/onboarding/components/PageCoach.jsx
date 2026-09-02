import React, { useState, useEffect, useCallback, useRef } from 'react';
import { useLocation, useNavigate } from 'react-router-dom';
import { motion, AnimatePresence } from 'framer-motion';
import { createPortal } from 'react-dom';
import { X, ArrowRight, ArrowLeft, Lightbulb } from 'lucide-react';
import { useOnboardingStatus, useOnboardingActions, ONBOARDING_STATUS } from '../hooks/useOnboarding';
import { markProgress, PROGRESS_KEYS } from '../model/progressBus';
import { useTourStore } from '../model/tourStore';

const CARD_W = 320;
const CARD_H_ESTIMATE = 230; // used only to keep the card inside the viewport
const EDGE = 16;

// How long to wait for the dashboard content before giving up on the
// auto-tour (the user can still start it from the checklist / Help Center).
const WAIT_FOR_DASHBOARD_MS = 15000;
const POLL_INTERVAL_MS = 400;
const SETTLE_DELAY_MS = 800;

/**
 * THE 30-second tour. One guided pass over the dashboard, anchored to real
 * UI. It starts in exactly two ways:
 *   1. automatically, ONCE per user — but only after the dashboard content
 *      has actually loaded (the stats widget is in the DOM), never on a
 *      half-rendered page; and
 *   2. on demand, from the setup checklist or Help Center (tourStore).
 *
 * "New vs returning user" comes ONLY from the backend (tourCompleted flag);
 * localStorage is never consulted, so the tour cannot replay on another
 * device and cannot fire for existing users.
 */
const TOUR_STEPS = [
  { target: 'dashboard-stats', title: 'Your day at a glance', text: 'Active work, deadlines, and momentum — in one view.' },
  { target: 'dashboard-quick-actions', title: 'Start here', text: 'Create tasks or jump into Focus Mode in one click.' },
  { target: 'sidebar-nav', title: 'Everything has a home', text: 'Tasks, Projects, Calendar — always one click away.' },
  { target: 'sidebar-profile', title: 'Yours to tune', text: 'Profile, security, and sessions live under your avatar.' },
];

const isDashboard = (p) => p === '/app' || p === '/app/';

const dashboardReady = () =>
  Boolean(document.querySelector('[data-tour="dashboard-stats"]'));

export function PageCoach() {
  const location = useLocation();
  const navigate = useNavigate();
  const { data } = useOnboardingStatus();
  const { tourComplete } = useOnboardingActions();
  const tourPending = useTourStore((s) => s.pending);
  const consumeRequest = useTourStore((s) => s.consumeRequest);

  const status = data?.status;
  const onboarded = status === ONBOARDING_STATUS.COMPLETED || status === ONBOARDING_STATUS.SKIPPED;
  // Backend is the single source of truth for "has taken the tour".
  const tourTaken = Boolean(data?.tourCompleted);

  const [active, setActive] = useState(false);
  const [currentStepIndex, setCurrentStepIndex] = useState(0);
  const [targetRect, setTargetRect] = useState(null);
  const rafRef = useRef(null);
  const startedRef = useRef(false);

  const startTour = useCallback(() => {
    startedRef.current = true;
    setActive(true);
    setCurrentStepIndex(0);
  }, []);

  // (1) Auto-fire once per user, only after the dashboard CONTENT has loaded.
  // Polls for the stats widget (rendered only when data arrives) instead of
  // starting on a skeleton. Gives up after WAIT_FOR_DASHBOARD_MS.
  useEffect(() => {
    if (!onboarded || tourTaken || startedRef.current) return;
    if (!isDashboard(location.pathname)) return;

    const startedAt = Date.now();
    const timer = setInterval(() => {
      if (startedRef.current) {
        clearInterval(timer);
        return;
      }
      if (dashboardReady()) {
        clearInterval(timer);
        // Settle delay: let animations/layout finish so the spotlight rects
        // are measured against the final positions.
        setTimeout(() => {
          if (!startedRef.current) startTour();
        }, SETTLE_DELAY_MS);
      } else if (Date.now() - startedAt > WAIT_FOR_DASHBOARD_MS) {
        clearInterval(timer);
      }
    }, POLL_INTERVAL_MS);
    return () => clearInterval(timer);
  }, [location.pathname, onboarded, tourTaken, startTour]);

  // (2) On-demand launch from the checklist / Help Center. Also waits for
  // the dashboard content when arriving from another page.
  useEffect(() => {
    if (!tourPending || !onboarded) return;
    if (!isDashboard(location.pathname)) {
      navigate('/app', { replace: false });
      return;
    }
    if (dashboardReady()) {
      const t = setTimeout(() => {
        consumeRequest();
        startTour();
      }, SETTLE_DELAY_MS);
      return () => clearTimeout(t);
    }
    const startedAt = Date.now();
    const timer = setInterval(() => {
      if (dashboardReady()) {
        clearInterval(timer);
        consumeRequest();
        setTimeout(() => {
          if (!startedRef.current) startTour();
        }, SETTLE_DELAY_MS);
      } else if (Date.now() - startedAt > WAIT_FOR_DASHBOARD_MS) {
        clearInterval(timer);
        consumeRequest();
      }
    }, POLL_INTERVAL_MS);
    return () => clearInterval(timer);
  }, [tourPending, onboarded, location.pathname, consumeRequest, navigate, startTour]);

  /** Instantly re-measure the current target (no scrolling). */
  const measureTarget = useCallback((stepIndex) => {
    const step = TOUR_STEPS[stepIndex];
    if (!step) return;
    const el = document.querySelector(`[data-tour="${step.target}"]`);
    if (!el) { setTargetRect(null); return; }
    const rect = el.getBoundingClientRect();
    if (rect.width === 0 && rect.height === 0) { setTargetRect(null); return; }
    setTargetRect({ top: rect.top, left: rect.left, width: rect.width, height: rect.height });
  }, []);

  // On step change: scroll the target into view, then measure (deferred so
  // effects never set state synchronously; the rAF scroll listener keeps the
  // spotlight accurate while the smooth scroll runs).
  useEffect(() => {
    if (!active) return;
    const step = TOUR_STEPS[currentStepIndex];
    if (!step) return;
    const el = document.querySelector(`[data-tour="${step.target}"]`);
    const timer = setTimeout(() => {
      if (!el) { setTargetRect(null); return; }
      el.scrollIntoView({ behavior: 'smooth', block: 'center' });
      const rect = el.getBoundingClientRect();
      setTargetRect(rect.width === 0 && rect.height === 0
        ? null
        : { top: rect.top, left: rect.left, width: rect.width, height: rect.height });
    }, 350);
    return () => clearTimeout(timer);
  }, [active, currentStepIndex]);

  // Live repositioning on scroll/resize (rAF-throttled).
  useEffect(() => {
    if (!active) return;
    const onMove = () => {
      if (rafRef.current) return;
      rafRef.current = requestAnimationFrame(() => {
        rafRef.current = null;
        measureTarget(currentStepIndex);
      });
    };
    window.addEventListener('resize', onMove);
    window.addEventListener('scroll', onMove, { passive: true });
    return () => {
      window.removeEventListener('resize', onMove);
      window.removeEventListener('scroll', onMove);
      if (rafRef.current) {
        cancelAnimationFrame(rafRef.current);
        rafRef.current = null;
      }
    };
  }, [active, currentStepIndex, measureTarget]);

  if (!active) return null;

  const currentStep = TOUR_STEPS[currentStepIndex];

  const handleNext = () => {
    if (currentStepIndex < TOUR_STEPS.length - 1) {
      setCurrentStepIndex(prev => prev + 1);
    } else {
      dismiss();
    }
  };

  const handlePrev = () => {
    if (currentStepIndex > 0) {
      setCurrentStepIndex(prev => prev - 1);
    }
  };

  const dismiss = () => {
    markProgress(PROGRESS_KEYS.TOUR_DONE);
    // Persist to the backend (single source of truth, idempotent): finishing
    // OR deliberately dismissing counts — the tour must never replay for
    // this user on any device. Fire-and-forget; failure degrades to a tour
    // replay on next visit instead of blocking the UI.
    tourComplete.mutate();
    setActive(false);
    setTargetRect(null);
  };

  // Card position: anchored below (or above) the target, clamped to the
  // viewport; falls back to exact viewport center WITHOUT transforms.
  let cardStyle;
  if (targetRect) {
    const prefersAbove = targetRect.top + targetRect.height + 24 + CARD_H_ESTIMATE > window.innerHeight;
    const top = prefersAbove
      ? Math.max(EDGE, targetRect.top - CARD_H_ESTIMATE - 16)
      : Math.min(window.innerHeight - CARD_H_ESTIMATE - EDGE, targetRect.top + targetRect.height + 16);
    const left = Math.min(Math.max(EDGE, targetRect.left), window.innerWidth - CARD_W - EDGE);
    cardStyle = { top, left };
  } else {
    cardStyle = {
      top: Math.max(EDGE, window.innerHeight / 2 - CARD_H_ESTIMATE / 2),
      left: Math.max(EDGE, window.innerWidth / 2 - CARD_W / 2),
    };
  }

  return createPortal(
    <div className="fixed inset-0 z-[9999] pointer-events-none">
      <div
        className="absolute inset-0 bg-black/50 transition-all duration-300"
        style={targetRect ? {
          clipPath: `polygon(
            0% 0%, 0% 100%,
            ${targetRect.left - 8}px 100%,
            ${targetRect.left - 8}px ${targetRect.top - 8}px,
            ${targetRect.left + targetRect.width + 8}px ${targetRect.top - 8}px,
            ${targetRect.left + targetRect.width + 8}px ${targetRect.top + targetRect.height + 8}px,
            ${targetRect.left - 8}px ${targetRect.top + targetRect.height + 8}px,
            ${targetRect.left - 8}px 100%,
            100% 100%, 100% 0%
          )`
        } : { clipPath: 'none' }}
      />

      <AnimatePresence mode="wait">
        <motion.div
          key={currentStepIndex}
          initial={{ opacity: 0, y: 8 }}
          animate={{ opacity: 1, y: 0 }}
          exit={{ opacity: 0 }}
          transition={{ duration: 0.2 }}
          role="dialog"
          aria-label={`Tour step ${currentStepIndex + 1} of ${TOUR_STEPS.length}`}
          className="absolute bg-[var(--bg-elevated)] border border-[var(--border-subtle)] shadow-2xl rounded-xl w-[320px] p-4 pointer-events-auto"
          style={cardStyle}
        >
          <div className="flex items-start gap-3">
            <div className="shrink-0 w-8 h-8 rounded-lg bg-[var(--accent-soft)] flex items-center justify-center">
              <Lightbulb className="h-4 w-4 text-[var(--accent)]" strokeWidth={2} />
            </div>
            <div className="flex-1 min-w-0">
              <div className="flex items-center justify-between mb-1">
                <span className="text-[10px] uppercase font-bold text-[var(--text-muted)] tracking-wider">
                  Step {currentStepIndex + 1} of {TOUR_STEPS.length}
                </span>
                <button onClick={dismiss} aria-label="Dismiss tour" className="text-[var(--text-muted)] hover:text-[var(--text-primary)]">
                  <X className="w-3 h-3" />
                </button>
              </div>
              <h3 className="text-[14px] font-bold text-[var(--text-primary)] leading-snug">
                {currentStep.title}
              </h3>
              <p className="mt-1 text-[12px] text-[var(--text-secondary)] leading-relaxed">
                {currentStep.text}
              </p>

              <div className="mt-4 flex items-center justify-between">
                <button
                  onClick={dismiss}
                  className="text-[11px] font-medium text-[var(--text-muted)] hover:text-[var(--text-primary)]"
                >
                  Skip tour
                </button>
                <div className="flex items-center gap-2">
                  {currentStepIndex > 0 && (
                    <button
                      onClick={handlePrev}
                      className="px-2.5 py-1.5 rounded-md text-[11px] font-medium border border-[var(--border-subtle)] hover:bg-[var(--bg-subtle)] text-[var(--text-primary)] transition-colors"
                    >
                      <ArrowLeft className="w-3 h-3 inline-block mr-1" /> Back
                    </button>
                  )}
                  <button
                    onClick={handleNext}
                    className="px-3 py-1.5 rounded-md text-[11px] font-semibold bg-[var(--accent)] text-[var(--text-on-accent)] hover:bg-[var(--accent-hover)] transition-colors shadow-sm flex items-center gap-1"
                  >
                    {currentStepIndex === TOUR_STEPS.length - 1 ? 'Finish' : 'Next'}
                    {currentStepIndex < TOUR_STEPS.length - 1 && <ArrowRight className="w-3 h-3" />}
                  </button>
                </div>
              </div>
            </div>
          </div>
        </motion.div>
      </AnimatePresence>
    </div>,
    document.body
  );
}
