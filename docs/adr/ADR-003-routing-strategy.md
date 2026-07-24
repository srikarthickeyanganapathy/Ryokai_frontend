# ADR-003: Routing Strategy

**Status:** Accepted
**Date:** 2026-07-07

## Context
Aura requires a routing system that supports layout shells (Main vs Auth), protected routes, and complex nested views without re-rendering the entire DOM tree.

## Decision
We will use React Router DOM.
- We will define route structures centrally in `app/router/`.
- Routes will be strictly separated between Public (`/auth`) and Private (`/app`) trees.
- Navigation state will not be stored in global state; we will rely purely on the URL as the source of truth for current views.

## Consequences
- **Positive:** Standardized ecosystem, powerful layout nesting.
- **Negative:** Mild bundle size increase over a raw custom router.
