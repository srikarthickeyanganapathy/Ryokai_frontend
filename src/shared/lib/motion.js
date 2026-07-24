/**
 * Centralized Design System Motion Tokens for Framer Motion.
 * Standardizes spring physics, transitions, and hover presets across the application.
 */

export const springFast = {
  type: 'spring',
  stiffness: 400,
  damping: 25,
};

export const springNormal = {
  type: 'spring',
  stiffness: 300,
  damping: 26,
};

export const springGentle = {
  type: 'spring',
  stiffness: 200,
  damping: 22,
};

export const hoverScale = {
  scale: 1.015,
  transition: springFast,
};

export const fadeIn = {
  initial: { opacity: 0 },
  animate: { opacity: 1 },
  exit: { opacity: 0 },
  transition: { duration: 0.18, ease: 'easeOut' },
};

export const drawerTransition = {
  initial: { opacity: 0, x: 24 },
  animate: { opacity: 1, x: 0 },
  exit: { opacity: 0, x: 24 },
  transition: springNormal,
};

export const modalTransition = {
  initial: { opacity: 0, scale: 0.96 },
  animate: { opacity: 1, scale: 1 },
  exit: { opacity: 0, scale: 0.96 },
  transition: springFast,
};

export const pageTransition = {
  initial: { opacity: 0, y: 6 },
  animate: { opacity: 1, y: 0 },
  exit: { opacity: 0, y: -6 },
  transition: { duration: 0.15, ease: 'easeOut' },
};

export const listTransition = {
  initial: { opacity: 0, y: 8 },
  animate: { opacity: 1, y: 0 },
  exit: { opacity: 0, y: -8 },
  transition: springFast,
};
