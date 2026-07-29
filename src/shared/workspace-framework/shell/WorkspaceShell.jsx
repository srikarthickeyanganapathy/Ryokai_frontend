import React from 'react'
import { cn } from '@/shared/lib/cn'
import { useWorkspace } from '@/app/providers/WorkspaceProvider'
import { layoutClasses } from '../tokens/layoutTokens'

/**
 * WorkspaceShell
 * ─────────────────────────────────────────────────────────
 * Top-level composable container for all workspace pages.
 *
 * Consumes the current workspace context from WorkspaceProvider
 * and provides consistent page composition, spacing, and
 * responsive layout rhythm.
 *
 * Responsibilities:
 *   ✓ Workspace context consumption (read-only)
 *   ✓ Page max-width enforcement
 *   ✓ Horizontal/vertical page rhythm
 *   ✓ Breadcrumb slot placement
 *   ✓ Shell composition via children
 *
 * NOT responsible for:
 *   ✗ Sidebar / Topbar rendering
 *   ✗ Authentication / Permissions
 *   ✗ Data fetching
 *   ✗ Domain-specific logic
 *
 * @param {Object} props
 * @param {'default'|'narrow'|'wide'|'full'} [props.maxWidth='default']
 * @param {React.ReactNode} [props.breadcrumb] — Optional breadcrumb slot
 * @param {string} [props.className] — Additional container classes
 * @param {React.ReactNode} props.children — Page layout content
 */
export function WorkspaceShell({
  maxWidth = 'default',
  breadcrumb,
  className,
  children,
}) {
  const { workspaceMode, activeOrganization } = useWorkspace()

  const widthClasses = {
    default: layoutClasses.pageContainerDefault,
    narrow: layoutClasses.pageContainerNarrow,
    wide: layoutClasses.pageContainerWide,
    full: 'max-w-full',
  }

  return (
    <div
      className={cn(
        layoutClasses.pageContainer,
        widthClasses[maxWidth] || widthClasses.default,
        layoutClasses.pagePadding,
        'py-0',
        className
      )}
      data-workspace={workspaceMode}
      data-org={activeOrganization?.id || undefined}
    >
      {/* ── Breadcrumb Slot ─────────────────────────────── */}
      {breadcrumb && (
        <nav
          aria-label="Breadcrumb"
          className="mb-3 text-[12px] text-[var(--text-tertiary)]"
        >
          {breadcrumb}
        </nav>
      )}

      {/* ── Page Content ────────────────────────────────── */}
      <div className={layoutClasses.sectionStack}>
        {children}
      </div>
    </div>
  )
}
