/**
 * WEF Layout Tokens
 * ─────────────────────────────────────────────────────────
 * Pure constants defining the spatial rhythm of the framework.
 * No React. No API. No domain logic. UI infrastructure only.
 *
 * Categories:
 *   Container  — max-widths for page content
 *   Spacing    — vertical & horizontal page rhythm
 *   Gaps       — grid & flex gap scales
 *   Breakpoints — responsive thresholds (mirrors Tailwind defaults)
 *   Elevation  — z-index layers
 */

// ── Container ────────────────────────────────────────────
export const container = {
  /** Default page max-width */
  default: '1280px',       // max-w-7xl equivalent
  /** Narrow for config/settings */
  narrow: '960px',         // max-w-5xl equivalent
  /** Wide for dashboards & analytics */
  wide: '1440px',
  /** Full-width (e.g. editor canvas) */
  full: '100%',
}

// ── Spacing ──────────────────────────────────────────────
export const spacing = {
  /** Horizontal page padding */
  pageX: {
    mobile: '16px',        // px-4
    tablet: '24px',        // px-6
    desktop: '32px',       // px-8
  },
  /** Vertical gap between page sections */
  sectionGap: '24px',     // space-y-6
  /** Gap between header and content */
  headerGap: '20px',      // space-y-5
  /** Inner card padding */
  cardPadding: '20px',    // p-5
}

// ── Gaps ─────────────────────────────────────────────────
export const gaps = {
  xs: '4px',
  sm: '8px',
  md: '12px',
  lg: '16px',
  xl: '24px',
  '2xl': '32px',
}

// ── Breakpoints ──────────────────────────────────────────
export const breakpoints = {
  sm: 640,
  md: 768,
  lg: 1024,
  xl: 1280,
  '2xl': 1536,
}

// ── Elevation (z-index layers) ───────────────────────────
export const elevation = {
  base: 0,
  sticky: 10,
  toolbar: 20,
  drawer: 40,
  overlay: 50,
  modal: 60,
  toast: 70,
  tooltip: 80,
}

// ── Tailwind class presets (composable strings) ──────────
export const layoutClasses = {
  /** Standard page container */
  pageContainer: 'w-full mx-auto',
  pageContainerDefault: 'max-w-7xl',
  pageContainerNarrow: 'max-w-5xl',
  pageContainerWide: 'max-w-[1440px]',

  /** Responsive horizontal padding */
  pagePadding: 'px-4 sm:px-6 lg:px-8',

  /** Section vertical rhythm */
  sectionStack: 'space-y-6',

  /** Header bottom border */
  headerBorder: 'pb-5 border-b border-[var(--border-subtle)]',

  /** Standard card */
  card: 'bg-[var(--bg-elevated)] border border-[var(--border-subtle)] rounded-[var(--radius-lg)] shadow-[var(--shadow-xs)]',

  /** Toolbar container */
  toolbar: 'flex items-center gap-2 flex-wrap',
}
