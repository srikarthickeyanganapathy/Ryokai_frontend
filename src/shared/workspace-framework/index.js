/**
 * Workspace Experience Framework (WEF)
 * ---
 * Ryokai's workspace-agnostic UI infrastructure.
 *
 * [PROHIBITED] WEF Architectural Boundary Rules:
 *   [x] No API clients
 *   [x] No React Query / fetch calls
 *   [x] No domain feature hooks
 *   [x] No entity imports
 *   [x] No permission evaluation logic
 *   [x] Pure UI Infrastructure only
 */

// --- Shell ---
// WorkspaceShell has been superseded by PageShell in shared/ui/PageShell.jsx

// --- Layout Archetypes ---
export { CommandLayout } from './layouts/CommandLayout'
export { ManagementLayout } from './layouts/ManagementLayout'
export { EditorLayout } from './layouts/EditorLayout'
export { InsightLayout, InsightSection } from './layouts/InsightLayout'
export { ConfigurationLayout } from './layouts/ConfigurationLayout'

// --- Page States ---
export { PageStateContainer } from './states/PageStateContainer'
export { FrameworkLoadingState } from './states/FrameworkLoadingState'
export { FrameworkEmptyState } from './states/FrameworkEmptyState'

// --- Modular Toolbar ---
export { ModularToolbar } from './toolbar/ModularToolbar'
export { SearchPlugin } from './toolbar/plugins/SearchPlugin'
export { FilterPlugin } from './toolbar/plugins/FilterPlugin'
export { DensityPlugin } from './toolbar/plugins/DensityPlugin'
export { ExportPlugin } from './toolbar/plugins/ExportPlugin'

// --- Drawer Manager ---
export { DrawerProvider, useDrawerManager, DrawerOutlet } from './drawers/DrawerManager'

// --- Contextual Drawers ---
export { MemberProfileDrawer } from './drawers/MemberProfileDrawer'
export { TaskDrawer } from './drawers/TaskDrawer'
export { ProjectDrawer } from './drawers/ProjectDrawer'
export { TeamDrawer } from './drawers/TeamDrawer'

// --- Interaction Primitives ---
export { Inspector } from './interactions/Inspector'
export { Wizard } from './interactions/Wizard'
export { ReviewPanel } from './interactions/ReviewPanel'
export { TimelineView, TimelineGroup } from './interactions/TimelineView'

// --- Layout Tokens ---
export * as layoutTokens from './tokens/layoutTokens'
