# ADR-005: State Management Architecture

**Status:** Accepted
**Date:** 2026-07-07

## Context
React applications often suffer from "Global Store Bloat," where UI state, API data, and ephemeral form state are all dumped into a single Redux or Zustand store, leading to performance issues and unmaintainable code.

## Decision
We reject the monolithic global store. State will be managed as close to its source of truth as possible:
1. **Server State:** Managed exclusively by TanStack Query.
2. **Form State:** Managed exclusively by React Hook Form (uncontrolled inputs).
3. **Global Client State:** Fragmented into isolated React Contexts based on domain (e.g., `SessionContext`, `ThemeContext`, `PreferencesContext`).
4. **Local State:** `useState` or `useReducer` for isolated UI logic (e.g., dropdown open/close).

## Consequences
- **Positive:** Massive reduction in unnecessary re-renders. Clean separation of concerns.
- **Negative:** Requires strict discipline. Developers cannot default to "just put it in Redux."
