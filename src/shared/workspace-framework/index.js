/**
 * Workspace Experience Framework (WEF)
 * ─────────────────────────────────────────────────────────
 * Ryokai's workspace-agnostic UI infrastructure.
 *
 * 🚫 WEF Architectural Boundary Rules:
 *   ✓ No API clients
 *   ✓ No React Query / fetch calls
 *   ✓ No domain feature hooks
 *   ✓ No entity imports
 *   ✓ No permission evaluation logic
 *   ✓ Pure UI Infrastructure only
 */

// ── Shell ─────────────────────────────────────────────────
export { WorkspaceShell } from './shell/WorkspaceShell'
export { useWorkspace } from '@/app/providers/WorkspaceProvider'

// ── Layout Archetypes ─────────────────────────────────────
export { CommandLayout } from './layouts/CommandLayout'
export { ManagementLayout } from './layouts/ManagementLayout'
export { EditorLayout } from './layouts/EditorLayout'
export { InsightLayout, InsightSection } from './layouts/InsightLayout'
export { ConfigurationLayout } from './layouts/ConfigurationLayout'

// ── Page States ───────────────────────────────────────────
export { PageStateContainer } from './states/PageStateContainer'
export { FrameworkLoadingState } from './states/FrameworkLoadingState'
export { FrameworkEmptyState } from './states/FrameworkEmptyState'

// ── Modular Toolbar ───────────────────────────────────────
export { ModularToolbar } from './toolbar/ModularToolbar'
export { SearchPlugin } from './toolbar/plugins/SearchPlugin'
export { FilterPlugin } from './toolbar/plugins/FilterPlugin'
export { DensityPlugin } from './toolbar/plugins/DensityPlugin'
export { ExportPlugin } from './toolbar/plugins/ExportPlugin'

// ── Drawer Manager ────────────────────────────────────────
export { DrawerProvider, useDrawerManager, DrawerOutlet } from './drawers/DrawerManager'

// ── Contextual Drawers ───────────────────────────────────
export { MemberProfileDrawer } from './drawers/MemberProfileDrawer'
export { TaskDrawer } from './drawers/TaskDrawer'
export { ProjectDrawer } from './drawers/ProjectDrawer'
export { TeamDrawer } from './drawers/TeamDrawer'

// ── Interaction Primitives ────────────────────────────────
export { Inspector } from './interactions/Inspector'
export { Wizard } from './interactions/Wizard'
export { ReviewPanel } from './interactions/ReviewPanel'
export { TimelineView, TimelineGroup } from './interactions/TimelineView'

// ── Layout Tokens ─────────────────────────────────────────
export * as layoutTokens from './tokens/layoutTokens'
