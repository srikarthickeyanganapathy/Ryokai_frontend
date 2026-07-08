# ADR-002: Token-Based Theme Engine

**Status:** Accepted
**Date:** 2026-07-07

## Context
Aura requires a strict, premium aesthetic supporting Dark mode (canonical) and Light mode, with potential future themes. Hardcoding HEX colors or Tailwind utility values (`text-gray-900`) across the application causes inconsistency and prevents dynamic theming.

## Decision
We will build a Token-Based Theme Engine using CSS Variables defined in `shared/styles/tokens.css`.
- Tailwind CSS will be configured to map entirely to these semantic CSS variables (e.g., `bg-base` maps to `var(--bg-base)`).
- We will implement a `ThemeProvider` at the application root to manage user preferences (Light, Dark, System) and inject the appropriate data-attribute onto the HTML element.

## Consequences
- **Positive:** Total design consistency. Instant theme switching without React re-renders. Single source of truth for all spacing, colors, and elevations.
- **Negative:** Developers must memorize semantic token names rather than raw Tailwind colors.
