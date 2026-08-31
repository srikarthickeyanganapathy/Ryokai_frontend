/**
 * Ryokai -- UX Interaction Tokens
 * 
 * Standardizes micro-interaction parameters across the application.
 * Based on UX law research and Linear/ElevenLabs benchmark analysis.
 * 
 * +---+---+
 * | UX Law                      | Application                      |
 * +---+---+
 * | Doherty Threshold (<400ms)  | All animations capped at 300ms   |
 * | Fitts's Law                 | 44px minimum touch targets       |
 * | Hick's Law                  | Max 5 items per group            |
 * | Aesthetic-Usability Effect  | Consistent spring curves         |
 * | Von Restorff Effect         | Accent glow on important items   |
 * | Peak-End Rule               | Completing a task = celebration  |
 * +---+---+
 */

export const SPRINGS = {
  /** Fast interactions (button hover, toggle) */
  fast: { type: 'spring', stiffness: 400, damping: 25, mass: 0.5 },
  /** Standard card/panel transitions */
  normal: { type: 'spring', stiffness: 300, damping: 26, mass: 0.6 },
  /** Gentle reveals, page entries */
  gentle: { type: 'spring', stiffness: 200, damping: 22, mass: 0.7 },
  /** Snappy drag & drop */
  snappy: { type: 'spring', stiffness: 500, damping: 38, mass: 0.4 },
};

export const TIMING = {
  instant: 80,   // toggle, switch
  fast: 120,     // hover state change
  normal: 200,   // card/panel transitions (Doherty Threshold)
  slow: 300,     // drawer/modal entry
  reveal: 400,   // page load stagger delay
};

export const EASING = {
  out: [0.16, 1, 0.3, 1],          // Linear's standard ease-out
  inOut: [0.65, 0, 0.35, 1],       // Smooth symmetric
  bounce: [0.34, 1.56, 0.64, 1],   // Gentle overshoot
};

export const FADE_IN_UP = {
  initial: { opacity: 0, y: 8 },
  animate: { opacity: 1, y: 0 },
  transition: { duration: 0.2, ease: EASING.out }
};

export const FADE_IN_SCALE = {
  initial: { opacity: 0, scale: 0.96 },
  animate: { opacity: 1, scale: 1 },
  transition: { duration: 0.15, ease: EASING.out }
};

export const STAGGER_FAST = {
  container: {
    hidden: { opacity: 0 },
    show: { opacity: 1, transition: { staggerChildren: 0.04, delayChildren: 0.05 } }
  },
  item: {
    hidden: { opacity: 0, y: 8 },
    show: { opacity: 1, y: 0, transition: { duration: 0.2, ease: EASING.out } }
  }
};

export const STAGGER_SLOW = {
  container: {
    hidden: { opacity: 0 },
    show: { opacity: 1, transition: { staggerChildren: 0.08, delayChildren: 0.08 } }
  },
  item: {
    hidden: { opacity: 0, y: 12 },
    show: { opacity: 1, y: 0, transition: { duration: 0.3, ease: EASING.out } }
  }
};

/**
 * Celebration animation for task completion (Peak-End Rule).
 * A subtle confetti-like burst that marks a positive moment.
 */
export function triggerCompletionCelebration(element) {
  if (!element) return;
  element.classList.add('completion-burst');
  setTimeout(() => element.classList.remove('completion-burst'), 600);
}
