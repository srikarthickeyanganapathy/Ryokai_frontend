# ADR-001: Feature-Sliced Design (FSD) Adoption

**Status:** Accepted
**Date:** 2026-07-07

## Context
As Aura scales to an enterprise application, traditional flat or file-type based folder structures (e.g., all components in one folder, all hooks in another) will lead to tight coupling, spaghetti imports, and reduced maintainability. We need an architectural methodology that enforces strict boundaries and groups code by domain.

## Decision
We are adopting a strict Feature-Sliced Design (FSD) architecture. The `src` directory will be divided into the following layers (from lowest to highest dependency restriction):

1. **shared**: UI primitives, config, tokens, hooks. Depends on nothing.
2. **entities**: Business entities (e.g., User, Node). Depends on `shared`.
3. **features**: User interactions and scenarios. Depends on `entities` and `shared`.
4. **widgets**: Complex, cross-feature blocks (e.g., Sidebar, Command Palette). Depends on `features`, `entities`, `shared`.
5. **pages**: Page composition. Contains no business logic. Depends on `widgets`, `features`, `entities`, `shared`.
6. **app**: Global initialization, providers, layouts. Depends on everything.

## Consequences
- **Positive:** Massive reduction in circular dependencies. High scalability. Clear domain boundaries.
- **Negative:** Steeper learning curve for new developers. Requires discipline to not bypass architectural layers.
