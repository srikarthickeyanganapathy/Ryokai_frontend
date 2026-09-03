/**
 * Onboarding progress bus — tiny localStorage-backed store with a window
 * event bridge, so any surface (task create success, tour finish, help
 * center) can record "the user did a real thing" without prop drilling.
 *
 * These keys are ONLY the checklist's tick marks for actions taken on this
 * device. Whether the checklist itself should be visible is a per-user,
 * backend decision (`checklistDismissed` on the onboarding status) — never
 * decided here.
 *
 * v2: v1 keys from earlier builds could claim items were done (or all done)
 * browser-wide, silently suppressing the checklist for brand-new accounts.
 *
 * Events: window.dispatchEvent(new CustomEvent(ONBOARDING_EVENT, { detail: key }))
 */

const KEY = 'ryokai.onboardingProgress.v2';
export const ONBOARDING_EVENT = 'ryokai:progress';

const readAll = () => {
  try {
    return JSON.parse(localStorage.getItem(KEY) || '{}');
  } catch {
    return {};
  }
};

const writeAll = (all) => {
  try {
    localStorage.setItem(KEY, JSON.stringify(all));
  } catch {
    /* private mode — progress just won't persist */
  }
};

export const getProgress = () => readAll();

export const hasProgress = (key) => Boolean(readAll()[key]);

/** Record a completed action. No-op re-dispatches are safe. */
export const markProgress = (key) => {
  if (readAll()[key]) return false;
  const all = readAll();
  all[key] = Date.now();
  writeAll(all);
  window.dispatchEvent(new CustomEvent(ONBOARDING_EVENT, { detail: key }));
  return true;
};

export const resetProgress = () => {
  try {
    localStorage.removeItem(KEY);
  } catch {
    /* ignore */
  }
  window.dispatchEvent(new CustomEvent(ONBOARDING_EVENT, { detail: '__reset__' }));
};

/** React hook: subscribe to progress state. */
import { useSyncExternalStore } from 'react';

let cachedSnapshot = readAll();
window.addEventListener(ONBOARDING_EVENT, () => {
  cachedSnapshot = readAll();
});

export function useOnboardingProgress() {
  return useSyncExternalStore(
    (onChange) => {
      window.addEventListener(ONBOARDING_EVENT, onChange);
      return () => window.removeEventListener(ONBOARDING_EVENT, onChange);
    },
    () => cachedSnapshot,
    () => cachedSnapshot
  );
}

/** Well-known progress keys used across the app. */
export const PROGRESS_KEYS = {
  TOUR_DONE: 'tourDone',
  TASK_CREATED: 'taskCreated',
  TASK_COMPLETED: 'taskCompleted',
  PROJECT_CREATED: 'projectCreated',
  HELP_OPENED: 'helpOpened',
};
