# Ryokai — Structural Redesign Phase 2
## From Component-Level Polish to Compositional Depth

### What Changed (vs. Phase 1)

Phase 1 fixed rendering bugs, standardized cards, and added visual polish.
Phase 2 addresses the 10 structural gaps identified in the review.

---

### 1. Page Composition System → `src/shared/ui/PageShell.jsx`

Replaces the ad-hoc per-page layout with a composable shell:

```
PageShell
├── PageHero        ← mission + context (always first)
├── PageStats       ← key metrics strip
├── PageToolbar     ← filters, search, actions
├── PageContent     ← main viewport
├── PageAside       ← context panel
├── PageGrid        ← content + aside layout
├── FloatingActions ← FAB / bulk bar
└── PageEmptyState  ← module-aware empty states
```

Every page composes only what it needs:
- Projects: Hero → Stats → Toolbar → Content
- Goals: Hero → Stats → Content
- Calendar: Hero → Toolbar → Content
- Announcements: Hero → Content (timeline)
- Teams: Hero → Stats → Toolbar → Content

The spacing rhythm is identical across all pages because `PageShell` enforces `gap-6` (relaxed), `gap-5` (balanced), or `gap-4` (compact) based on workspace mode.

---

### 2. Status Language → `src/shared/lib/statusLanguage.js`

Beyond color: every status has a semantic icon + label:

| Status | Icon | Label | Priority |
|--------|------|-------|----------|
| TODO | ○ | To Do | STANDARD |
| IN_PROGRESS | ◉ | In Progress | STANDARD |
| SUBMITTED | ◷ | In Review | IMPORTANT |
| APPROVED | ✓ | Approved | STANDARD |
| COMPLETED | ✓ | Done | CRITICAL |
| REJECTED | ✗ | Rejected | IMPORTANT |
| BLOCKED | ⚠ | Blocked | IMPORTANT |

Motion hierarchy is tied to priority:
- **CRITICAL** (300ms bounce) — task complete, notification
- **IMPORTANT** (250ms spring) — drawer open, status change
- **STANDARD** (200ms fast) — card hover, filter change
- **SUBTLE** (120ms fade) — tooltip, badge

Includes `StatusBadge` component and `getMotionForStatus()` resolver.

---

### 3. Micro-Feedback → `src/shared/lib/microFeedback.js`

One action updates multiple visual cues:

- **CountBubble** — animated number counter with scale bounce
- **ProgressPulse** — progress bar with completion flash
- **ActivityPulse** — dot indicator on new activity
- **InlineFeedback** — inline toast with status icon
- **useMicroFeedback** — hook coordinating multi-cue updates

When a task completes:
1. Card fades with completion ripple ✓
2. Column count decrements with bounce animation
3. Progress bar advances + flashes green
4. Activity feed appends new entry
5. Inline toast confirms completion

---

### 4. Workspace Awareness → `src/shared/lib/workspaceAwareness.js`

Three workspaces, three distinct feels:

| | PERSONAL | ORG | CREWS |
|---|---------|-----|-------|
| Density | Relaxed (gap-6) | Compact (gap-4) | Balanced (gap-5) |
| Accent | Cyan (#195) | Royal Blue (#230) | Violet (#270) |
| Cards | Default (elevated) | Flat (dense) | Glass (morphic) |
| Grid | 2-col | 4-col | 3-col |
| Empty tone | "You're all caught up!" | "Create a team to start." | "Join a crew!" |
| Labels | "My Tasks" | "Tasks" | "Crew Tasks" |

Module identities:
- Projects → progress-centric (radial rings)
- Goals → achievement-centric (milestones)
- Calendar → schedule-centric (timeline)
- Announcements → timeline-centric (feed)
- Teams → directory-centric (avatar grids)

---

### 5. Example: ProjectsPageV2 → `src/project/pages/ProjectsPageV2.jsx`

Demonstrates the full composition system applied to a real page:

1. **PageHero** — "Projects" with mission context, eyebrow shows org/crew context
2. **PageStats** — 4 stat tiles (Portfolio, Progress, Due This Week, At Risk) with tone coding
3. **PageToolbar** — FilterTabs + search, identical rhythm to all other pages
4. **PageContent** — responsive card grid with stagger animation
5. **FloatingActions** — Create FAB appears when portfolio > 3 projects
6. **PageEmptyState** — module-aware empty state with reassuring message
7. All error/loading/empty states handled

---

### 6. Context Preservation (Planned)

The architecture now supports:
- **Drawer** for detail views (announcement, task detail)
- **Popover** for quick actions (status change, assign)
- **Split View** for multi-pane layouts (PageGrid)
- **Inline Expansion** for list items (accordion row)

PageGrid enables content + aside layouts without losing navigation context.

---

### 7. Progressive Disclosure (Planned)

The composition system makes it natural:
1. Card shows summary (title, status, progress)
2. Hover reveals quick actions (assign, priority, date)
3. Click opens drawer with full detail
4. Advanced menu behind ⋮ for danger zone operations

---

### Files Created (Phase 2)

| File | Purpose |
|------|---------|
| `src/shared/ui/PageShell.jsx` | Page composition system (8 composable primitives) |
| `src/shared/lib/statusLanguage.js` | Status icons, labels, motion priorities |
| `src/shared/lib/microFeedback.js` | Multi-cue feedback: count bubble, progress pulse, activity toast |
| `src/shared/lib/workspaceAwareness.js` | Workspace density, tone, module identity presets |
| `src/project/pages/ProjectsPageV2.jsx` | Example page using composition system |

### Build Verification

✅ 4418 modules, zero errors
✅ All new files compile
✅ No breaking changes to existing pages
