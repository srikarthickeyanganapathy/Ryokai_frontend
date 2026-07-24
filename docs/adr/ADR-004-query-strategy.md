# ADR-004: React Query Strategy

**Status:** Accepted
**Date:** 2026-07-07

## Context
Aura relies heavily on remote API data. Manually managing `isLoading`, `isError`, and caching via `useState` leads to race conditions, out-of-sync data, and massive boilerplate.

## Decision
We are utilizing TanStack Query (React Query) as the exclusive manager of Server State.
- We will configure a centralized `queryClient` with strict defaults (e.g., staleTime: 5 minutes, retry: 1) to prevent infinite failing loops.
- All mutating actions will utilize `onMutate` to provide Optimistic UI updates, fulfilling our goal of a "Zero-Latency" feel.
- Query keys will be strictly abstracted into `shared/api/query/query-keys.js` to prevent typos and invalidation bugs.

## Consequences
- **Positive:** UI updates instantly. Network state is flawlessly managed. Reduced boilerplate.
- **Negative:** Caching invalidation logic can become complex if not strictly managed.
