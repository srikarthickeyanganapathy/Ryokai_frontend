# ADR-006: Performance & Motion Standards

## Status
Accepted

## Context
As the Ryokai platform grows, maintaining high visual polish, perceived loading speed, and database scalability requires strict standards across both the frontend React design system and backend database migrations.

Without clear conventions:
- Motion transitions risk becoming fragmented across components with arbitrary hardcoded spring values.
- Database index management can drift between JPA annotations and production Flyway schema migrations.
- Skeleton loading states can cause Cumulative Layout Shift (CLS) if dimensions mismatch rendered components.

## Decision

### 1. Database Indexing & Flyway Authority
- **Flyway Source of Truth:** Flyway migration scripts (`db/migration/V*.sql`) are the sole authoritative source of truth for database DDL changes and index creation.
- **JPA Documentation Metadata:** JPA `@Index` annotations on `@Table` declarations serve strictly as JPA/Hibernate metadata documentation.
- **Evidence-Based Indexing:** Every database index must correspond to an explicit SQL query pattern (e.g. composite index on `tasks(org_id, current_status)`).

### 2. Motion Design Tokens
- **Centralized Motion System:** All Framer Motion springs, transitions, and hover presets must be imported from `@/shared/lib/motion.js`.
- **Shared Tokens:** Standard spring physics presets (`springFast`, `springNormal`, `springGentle`) and transition presets (`hoverScale`, `fadeIn`, `modalTransition`, `drawerTransition`).
- **Drag Isolation Guard:** Interactive drag components (e.g. `KanbanTaskCard` powered by dnd-kit) must disable hover scale transforms while `isDragging` is true (`whileHover={isDragging ? undefined : hoverScale}`).

### 3. Skeleton Loading Presets
- **CLS Prevention:** Semantic skeleton components (`SkeletonTaskCard`, `SkeletonTableRow`, `SkeletonSidebar`, `SkeletonDashboardCard`, `SkeletonTaskPanel`) must match the exact dimensions and padding of rendered components to eliminate Cumulative Layout Shift.

## Consequences
- Consistent visual motion language across all application screens.
- Zero cumulative layout shift during server-state data fetching.
- High database query performance under load with explicit Flyway schema evolution tracking.
