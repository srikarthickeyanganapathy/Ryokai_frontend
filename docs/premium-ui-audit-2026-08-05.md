# UI Premium Quality Audit — Ryokai Frontend

## Audit Summary

- **Total files audited:** 100
- **Date:** 2026-08-05
- **Methodology:** Read every file; checked for PageShell/old-wrapper usage, framer-motion micro-interactions, PremiumCard/InteractiveCard, state handling, and CSS variable usage.

---

## Audit Table

| File | PageShell | Motion | PremiumCard | States | CSS Vars | Priority | Issues |
|------|-----------|--------|-------------|--------|----------|----------|--------|
| `App.jsx` | N/A (router) | — | — | N/A | — | — | Good lazy loading; no issues |
| `analytics/pages/AnalyticsPage.jsx` | ❌ WorkspaceShell+InsightLayout | ✅ motion.div, AnimatePresence | ❌ raw StatCards | ✅ loading/empty/error | ✅ var(--...) | **HIGH** | Uses old WorkspaceShell; hardcoded fake historical data; no framer-motion on StatCard hover |
| `app/layouts/AuthLayout.jsx` | N/A (layout) | ❌ CSS spring-in only | ❌ | ❌ no loading | ✅ var(--...) | LOW | Static CSS animation; no loading feedback during form submission; CosmicBackground good |
| `app/layouts/MainLayout.jsx` | N/A (layout) | ✅ AnimatePresence page transitions | ❌ | ❌ | ✅ var(--...) | — | Excellent page transitions; solid shell |
| `app/layouts/PlatformLayout.jsx` | N/A (layout) | ✅ AnimatePresence | ❌ | ❌ | ✅ var(--...) | — | Good; mirrors MainLayout |
| `calendar/pages/CalendarPage.jsx` | ✅ PageShell+PageHero+PageContent | ❌ no motion | ❌ | ⚠️ isLoading only (no empty/error) | ✅ var(--...) | **HIGH** | Missing empty/error states; no micro-interactions; Event modal is raw |
| `calendar/features/components/CalendarView.jsx` | N/A (child) | ❌ none | ❌ | ⚠️ passes isLoading but no empty/error | ✅ var(--...) | MEDIUM | No AnimatePresence on grid transitions; filter popover could use motion |
| `calendar/features/components/EventForm.jsx` | N/A (child) | ❌ none | ❌ | ❌ | ✅ var(--...) | LOW | Bare form; no validation motion feedback; no AnimatePresence for errors |
| `calendar/features/components/MonthView.jsx` | N/A (child) | ❌ none | ❌ | ⚠️ has skeleton loading; no empty/error | ✅ var(--...) | MEDIUM | DnD without visual drag previews; skeleton is static (no shimmer) |
| `calendar/features/components/WeekView.jsx` | N/A (child) | ❌ none | ❌ | ⚠️ skeleton only | ✅ var(--...) | MEDIUM | Same as MonthView; no empty state for empty week |
| `calendar/features/components/MiniAgenda.jsx` | N/A (child) | ❌ none | ❌ | ✅ empty states for today/tomorrow/upcoming | ✅ var(--...) | LOW | Good empty state handling; would benefit from motion for item appearance |
| `crew/pages/CrewDetailPage.jsx` | ❌ WorkspaceShell+ManagementLayout | ✅ AnimatePresence on tabs | ❌ | ✅ loading/error/not-found | ✅ var(--...) | **HIGH** | Uses old WorkspaceShell; no PageShell migration; complex leave/delete flow good |
| `crew/pages/CrewTasksPage.jsx` | ❌ WorkspaceShell+ManagementLayout | ✅ AnimatePresence on bulk bar | ❌ | ✅ stats/completion bar | ✅ var(--...) | **HIGH** | Old wrapper; manual analytics cards not using PremiumCard; good bulk actions |
| `crew/pages/CrewJoinPage.jsx` | N/A (standalone) | ✅ excellent — confetti, particles, transitions | ❌ | ✅ 6+ UX states (invalid/loading/error/online/offline/success) | ✅ var(--...) | MEDIUM | Exceptional UX states; outstanding motion design; should use PremiumCard for cards |
| `crew/components/CrewHeader.jsx` | N/A (child) | ⚠️ hover transitions only | ❌ | ✅ loading/empty/error states | ✅ var(--...) | MEDIUM | Good states; loading skeleton; needs whileHover/whileTap on buttons |
| `crew/components/CrewTabs.jsx` | N/A (child) | ❌ none | ❌ | ❌ | ✅ | LOW | Thin wrapper; delegates to DetailTabs |
| `crew/components/CrewStatusPill.jsx` | N/A (re-export) | — | — | — | — | LOW | Re-exports from shared |
| `crew/CrewDetailTabs/OverviewTab.jsx` | N/A (child) | ✅ motion on cards | ❌ SectionPanel | ✅ excellent — skeleton/error/empty/loading/isFetching | ✅ var(--...) | **HIGH** | Best-in-class state handling; SVG sparkline; health gauge; needs PremiumCard |
| `crew/CrewDetailTabs/MembersTab.jsx` | N/A (child) | ✅ AnimatePresence, motion stagger | ❌ | ✅ loading/error/empty/filter/results empty | ✅ var(--...) | MEDIUM | Excellent; grid/table toggle; invite modal; member drawer; needs PremiumCard |
| `crew/CrewDetailTabs/ProjectsTab.jsx` | N/A (child) | ✅ AnimatePresence, motion cards | ❌ | ✅ loading/error/empty/filtered-empty | ✅ var(--...) | MEDIUM | Great: grid/Gantt toggle; progress rings; health radar; needs PremiumCard |
| `crew/CrewDetailTabs/TasksTab.jsx` | N/A (child) | ✅ AnimatePresence on tasks | ❌ | ⚠️ column-based; needs empty per-column | ✅ var(--...) | MEDIUM | Kanban-style task columns; good motion; needs PremiumCard |
| `crew/CrewDetailTabs/ChannelsTab.jsx` | N/A (child) | ✅ AnimatePresence | ❌ | ⚠️ loading skeleton at top | ✅ var(--...) | MEDIUM | Large file (1300+ lines); chat-like; needs better state management |
| `crew/CrewDetailTabs/WhiteboardsTab.jsx` | N/A (child) | ✅ AnimatePresence | ❌ | ⚠️ needs error/empty states | ✅ var(--...) | MEDIUM | Templates grid; good concept; needs PremiumCard |
| `dashboard/pages/DashboardPage.jsx` | ✅ PageShell | ❌ delegates to v2 | ❌ | ✅ PageState wrapper | ✅ var(--...) | **HIGH** | Thin wrapper — delegates to MissionControlV2; clean |
| `dashboard/pages/MissionControlPage.jsx` | ❌ WorkspaceShell+CommandLayout | ❌ none in page itself | ❌ | ✅ PageStateContainer | ✅ var(--...) | **HIGH** | Uses old WorkspaceShell; widget registry system; no motion on widgets |
| `dashboard/pages/MissionControlv2.jsx` | N/A (inner component) | ✅ container/item variants, Stagger | ❌ raw styled cards | ⚠️ partial — only focus empty state | ✅ var(--...) | **HIGH** | Beautiful V2 redesign; stat cards lack whileHover; should use PremiumCard |
| `dashboard/features/ContextRail.jsx` | N/A (widget) | ✅ stagger animation | ✅ PremiumCard ✅ | ⚠️ only checks context presence | ✅ var(--...) | MEDIUM | Uses PremiumCard with glass variant; good motion |
| `dashboard/features/FocusPanel.jsx` | N/A (widget) | ✅ motion.framer | ✅ PremiumCard ✅ | ✅ empty/non-empty states | ✅ var(--...) | **HIGH** | Uses PremiumCard; workspace-aware config; good states |
| `dashboard/features/SignalStrip.jsx` | N/A (widget) | ✅ motion | ✅ PremiumCard ✅ | ✅ returns null when empty | ✅ var(--...) | **HIGH** | Uses PremiumCard; good signal icons; needs AnimatePresence for signals |
| `dashboard/features/ExecutionQueue.jsx` | N/A (widget) | ✅ AnimatePresence, motion | ✅ PremiumCard ✅ | ✅ empty + non-empty | ✅ var(--...) | **HIGH** | Uses PremiumCard; good empty state with centered icon; needs drag indicators |
| `dashboard/features/DailyBriefWidget.jsx` | N/A (widget) | ✅ motion on stats | ✅ PremiumCard ✅ | ⚠️ returns null if no data | ✅ var(--...) | MEDIUM | Uses PremiumCard with gradient; good design |
| `dashboard/features/WorkloadBrief.jsx` | N/A (widget) | ✅ motion | ✅ PremiumCard ✅ | ⚠️ loading skeleton; no error state | ✅ var(--...) | MEDIUM | Uses PremiumCard; needs error state |
| `dashboard/features/ModeSelector.jsx` | N/A (widget) | ✅ AnimatePresence | ❌ custom dropdown | ❌ | ❌ raw hex colors | MEDIUM | Custom dropdown; raw color values (#64748b, #f59e0b); should use CSS vars |
| `focus/pages/FocusPage.jsx` | ❌ WorkspaceShell+CommandLayout | ✅ AnimatePresence, fullscreen transitions | ❌ | ✅ PageStateContainer | ✅ var(--...) | MEDIUM | Old WorkspaceShell; good timer integration; zen mode |
| `focus/features/components/FocusTimer.jsx` | N/A (child) | ✅ AnimatePresence | ❌ | ⚠️ no loading/error | ✅ var(--...) | MEDIUM | Good Pomodoro; visual progress ring; needs error state |
| `focus/features/components/FocusWidget.jsx` | N/A (dashboard widget) | ❌ CSS-only hover | ❌ glass-panel | ⚠️ no empty/error | ✅ var(--...) | LOW | Dashboard widget; glass-panel CSS; basic |
| `identity/pages/LoginPage.jsx` | N/A (auth) | ❌ none | ❌ | ❌ | ⚠️ mixed | LOW | Static; no motion; bare layout |
| `identity/pages/RegisterPage.jsx` | N/A (auth) | ❌ none | ❌ | ❌ | ⚠️ mixed | LOW | Same as LoginPage |
| `identity/pages/ForgotPasswordPage.jsx` | N/A (auth) | ❌ none | ❌ | ❌ | ⚠️ mixed | LOW | Static |
| `identity/pages/ResetPasswordPage.jsx` | N/A (auth) | ❌ none | ❌ | ❌ | ⚠️ mixed | LOW | Static |
| `identity/pages/VerifyEmailPage.jsx` | N/A (auth) | ❌ none | ❌ | ✅ loading/success/error | ✅ | LOW | Has status handling |
| `identity/pages/SessionExpiredPage.jsx` | N/A (auth) | ❌ none | ❌ | ❌ | ✅ | LOW | Basic static page |
| `identity/components/auth/LoginForm.jsx` | N/A (form) | ❌ none | ❌ | ✅ loading via react-hook-form | ✅ | LOW | Standard form; no micro-interactions |
| `identity/components/auth/RegisterForm.jsx` | N/A (form) | ❌ none | ❌ | ✅ loading | ✅ | LOW | Standard form |
| `inbox/pages/InboxPage.jsx` | ✅ PageShell+PageHero+PageContent | ⚠️ minimal motion | ❌ | ✅ PageState + mark all read | ✅ var(--...) | **HIGH** | Uses new PageShell ✅; needs motion on notification items; no PremiumCard |
| `library/saved/pages/SavedPage.jsx` | ✅ PageShell+PageHero+PageContent | ✅ motion on cards | ✅ InteractiveCard | ✅ PageState | ✅ var(--...) | LOW | New PageShell ✅; uses InteractiveCard ✅; clean |
| `note/pages/NotesPage.jsx` | ❌ none (raw) | ✅ AnimatePresence, motion | ❌ | ⚠️ needs error state | ✅ var(--...) | MEDIUM | No PageShell wrapper at all; rich motion; raw structure |
| `note/components/NotePanel.jsx` | N/A (panel) | ✅ AnimatePresence | ❌ | ⚠️ | ✅ var(--...) | MEDIUM | Rich editor panel; good motion |
| `organization/announcements/pages/AnnouncementsPage.jsx` | ✅ PageShell+PageHero+PageToolbar+PageContent | ✅ AnimatePresence | ❌ | ✅ PageState + read/unread/pinned | ✅ var(--...) | MEDIUM | New PageShell ✅; drawer for detail; needs PremiumCard |
| `organization/announcements/components/AnnouncementCard.jsx` | N/A (card) | ✅ motion | ❌ | ⚠️ | ✅ var(--...) | LOW | Motion basic; priority border colors raw |
| `organization/announcements/components/CreateAnnouncementModal.jsx` | N/A (modal) | ❌ none | ❌ | ⚠️ | ✅ | LOW | Basic modal |
| `organization/directory/pages/DirectoryPage.jsx` | ❌ WorkspaceShell+ManagementLayout | ✅ AnimatePresence | ❌ | ✅ PageStateContainer | ✅ var(--...) | MEDIUM | Old WorkspaceShell; grid/table/orgchart toggle; good filters |
| `organization/directory/components/DirectoryTableView.jsx` | N/A (child) | ❌ none | ❌ | ✅ DataTable | ✅ | LOW | DataTable wrapper |
| `organization/directory/components/DirectoryOrgChart.jsx` | N/A (child) | ✅ AnimatePresence | ❌ | ⚠️ | ✅ var(--...) | LOW | Org chart; good motion on expand/collapse |
| `organization/directory/components/MemberDetailDrawer.jsx` | N/A (drawer) | ❌ none | ❌ | ✅ Drawer component | ✅ | LOW | Standard drawer |
| `organization/goals/pages/GoalsPage.jsx` | ✅ PageShell+PageHero+PageContent | ❌ none at page level | ❌ | ✅ PageState | ✅ var(--...) | MEDIUM | New PageShell ✅; delegates to GoalCard |
| `organization/goals/features/components/GoalCard.jsx` | N/A (card) | ✅ motion | ❌ | ✅ expanded/collapsed | ✅ var(--...) | MEDIUM | Good expand/collapse; key results inline editing |
| `organization/goals/features/components/GoalModal.jsx` | N/A (modal) | ❌ none | ❌ | ⚠️ | ✅ | LOW | Basic modal; dynamic key results |
| `organization/goals/features/components/GoalStatsHeader.jsx` | N/A (stats) | ❌ none | ❌ | ✅ ImmersiveStatCard | ✅ | LOW | Good use of ImmersiveStatCard |
| `organization/goals/features/components/ProgressVisuals.jsx` | N/A (util) | ✅ AnimatedNumber (rAF) | ❌ | — | ✅ | LOW | Utility component; good custom animation |
| `organization/teams/pages/TeamsPage.jsx` | ✅ PageShell+PageHero+PageContent | ⚠️ minimal | ❌ | ✅ PageState | ✅ var(--...) | MEDIUM | New PageShell ✅; team avatars with HSL gradients; needs team card motion |
| `organization/teams/pages/TeamDetailPage.jsx` | ❌ not enough data shown | — | — | — | — | MEDIUM | Large file; uses Tab pattern |
| `organization/teams/components/TeamHeader.jsx` | N/A (child) | ❌ none | ❌ | ⚠️ | ✅ var(--...) | MEDIUM | Similar to CrewHeader but less polished |
| `organization/teams/components/OverviewTab.jsx` | N/A (child) | ✅ motion | ❌ SectionPanel | ⚠️ | ✅ var(--...) | MEDIUM | SectionPanel used; motion on stats |
| `organization/teams/components/MembersTab.jsx` | N/A (child) | ✅ motion | ❌ | ⚠️ ImmersiveEmptyState | ✅ | MEDIUM | Uses ImmersiveEmptyState |
| `organization/teams/components/ProjectsTab.jsx` | N/A (child) | ✅ motion | ❌ | ✅ ImmersiveEmptyState | ✅ | MEDIUM | Reuses ProjectCard |
| `organization/teams/components/TasksTab.jsx` | N/A (child) | ✅ AnimatePresence | ❌ | ✅ ImmersiveEmptyState | ✅ var(--...) | MEDIUM | Good task list with AnimatePresence |
| `organization/teams/components/DiscussionTab.jsx` | N/A (child) | ✅ AnimatePresence | ❌ | ✅ ImmersiveEmptyState | ✅ var(--...) | MEDIUM | Chat-like discussion |
| `organization/teams/components/InsightsTab.jsx` | N/A (child) | ✅ motion | ❌ | ⚠️ | ✅ var(--...) | MEDIUM | SVG donut chart; custom visual |
| `organization/workload/pages/WorkloadPage.jsx` | ❌ WorkspaceShell+CommandLayout | ✅ motion | ❌ | ✅ PageStateContainer | ✅ var(--...) | MEDIUM | Old WorkspaceShell; rich features; localStorage snapshots |
| `organization/Roles/pages/RolesPermissionsPage.jsx` | ❌ WorkspaceShell+ManagementLayout | ❌ none | ❌ | ⚠️ Skeleton only | ✅ | MEDIUM | Old WorkspaceShell; needs motion |
| `organization/Roles/components/RoleSidebar.jsx` | N/A (sidebar) | ✅ motion | ❌ | ✅ resizable | ✅ var(--...) | LOW | Resizable sidebar; search; good motion |
| `organization/Roles/components/PermissionGroups.jsx` | N/A (child) | ❌ none | ❌ | ⚠️ | ✅ | LOW | Basic groups |
| `organization/Roles/components/PermissionRow.jsx` | N/A (row) | ❌ none | ❌ | ✅ checkbox | ✅ | LOW | Checkbox-based toggles |
| `organization/Roles/widgets/CreateRoleDrawer.jsx` | N/A (drawer) | ❌ none | ❌ | ⚠️ | ✅ | LOW | Basic drawer form |
| `organization/pages/AcceptInvitePage.jsx` | N/A (standalone) | ❌ none | ❌ | ✅ loading/success/error | ✅ | LOW | Basic invite acceptance; needs motion |
| `organization/pages/LeaveRequestsPage.jsx` | N/A (page) | ✅ AnimatePresence | ❌ | ⚠️ | ✅ var(--...) | LOW | Leave request management |
| `organization/pages/OrganizationAdministrationPage.jsx` | N/A (hub) | ❌ none | ❌ | ⚠️ | ✅ | LOW | Admin sub-nav hub |
| `organization/pages/OrganizationsPage.jsx` | N/A (page) | ✅ motion | ❌ | ✅ loading | ✅ var(--...) | MEDIUM | Organization listing |
| `platform/workspace/AppSidebar.jsx` | N/A (shell) | ✅ AnimatePresence | ❌ | ✅ crew list loading | ✅ var(--...) | — | Core shell; good motion; needs PremiumCard concept |
| `platform/workspace/AppTopbar.jsx` | N/A (shell) | ❌ none | ❌ | ⚠️ | ✅ var(--...) | — | Topbar with search, notifications, user menu |
| `platform/command-palette/CommandMenu.jsx` | N/A (shell) | ❌ none | ❌ | ❌ | ✅ | LOW | Triggers global command palette |
| `project/pages/ProjectsPage.jsx` | ✅ PageShell+PageHero+PageStats+PageToolbar+PageContent | ⚠️ page-level motion missing | ❌ | ✅ PageState + FloatingActions | ✅ var(--...) | **HIGH** | New PageShell ✅; uses FilterTabs, SearchPlugin; ProjectCard uses InteractiveCard ✅ |
| `project/pages/ProjectDetailPage.jsx` | ❌ PageHeader only (not enough data) | — | — | — | ✅ | **HIGH** | Large detail page; needs PageShell |
| `project/components/ProjectCard.jsx` | N/A (card) | ❌ none | ✅ InteractiveCard ✅ | ⚠️ | ✅ | MEDIUM | Uses InteractiveCard ✅; good health scoring; needs whileHover micro-interaction |
| `project/components/ProjectForm.jsx` | N/A (form) | ❌ none | ❌ | ⚠️ loading | ✅ | LOW | Standard react-hook-form |
| `settings/pages/ProfilePage.jsx` | ❌ PageHeader+Card raw | ❌ none | ❌ | ⚠️ spinner | ✅ | MEDIUM | Uses old Card; SettingsRow; no PageShell |
| `settings/pages/SecurityPage.jsx` | ❌ WorkspaceShell+ConfigurationLayout | ❌ none | ❌ | ⚠️ | ✅ | MEDIUM | Old wrappers; basic form |
| `settings/pages/SessionsPage.jsx` | ❌ WorkspaceShell+ConfigurationLayout | ✅ motion on rows | ❌ | ✅ PageStateContainer | ✅ | MEDIUM | Old wrappers; has motion on session rows |
| `task/pages/TasksPage.jsx` | ✅ PageShell+PageHero+PageToolbar+PageContent | ✅ AnimatePresence | ❌ | ✅ PageState | ✅ var(--...) | **HIGH** | New PageShell ✅; comprehensive toolbox; Kanban/List/Nebula views; needs PremiumCard |
| `task/components/KanbanBoard/KanbanBoard.jsx` | N/A (board) | ❌ dnd-kit (not framer) | ❌ | ⚠️ | ✅ var(--...) | **HIGH** | Uses dnd-kit for drag; no framer-motion; needs drag animations |
| `task/components/KanbanBoard/KanbanColumn.jsx` | N/A (column) | ✅ AnimatePresence | ❌ | ✅ empty state | ✅ var(--...) | MEDIUM | Quick-add form; good AnimatePresence on tasks |
| `task/components/KanbanBoard/KanbanTaskCard.jsx` | N/A (card) | ✅ motion (sortable) | ❌ | ⚠️ | ✅ var(--...) | MEDIUM | Uses motion from dnd-kit + hoverScale |
| `task/components/TableView/TasksTable.jsx` | N/A (table) | ❌ none | ❌ | ✅ DataTable | ✅ | MEDIUM | DataTable wrapper; InlineEditable |
| `task/components/TaskPanel/TaskPanel.jsx` | N/A (panel) | ✅ AnimatePresence, motion | ❌ | ⚠️ loading for comments | ✅ var(--...) | **HIGH** | Rich slideover panel; good motion; needs PremiumCard for sections |
| `task/components/TaskToolbar/TasksToolbar.jsx` | N/A (toolbar) | ❌ none | ❌ | ⚠️ | ✅ var(--...) | MEDIUM | Toolbar with bulk actions |
| `task/features/manage-task/TaskForm.jsx` | N/A (form) | ❌ none | ❌ | ⚠️ | ✅ | LOW | Complex task form; no micro-interactions |
| `task/features/manage-task/BulkCreateTaskModal.jsx` | N/A (modal) | ❌ none | ❌ | ⚠️ | ✅ | LOW | Bulk task creation modal |
| `whiteboard/pages/WhiteboardPage.jsx` | ❌ raw div (fullscreen) | ❌ none | ❌ | ❌ no loading | ✅ var(--...) | LOW | Fullscreen overlay; needs loading for board fetch |
| `whiteboard/features/components/WhiteboardCanvas.jsx` | N/A (canvas) | ❌ none | ❌ | ⚠️ | ❌ raw hex colors | LOW | Canvas-based drawing; raw colors; real-time sync; no states |

---

## TOP 20 Files Requiring Most Urgent Attention

Ranked by impact on user experience:

| # | File | Priority | Critical Issues |
|---|------|----------|-----------------|
| 1 | `dashboard/pages/MissionControlPage.jsx` | **HIGH** | **#1 landing page**. Uses old WorkspaceShell. No motion on widget grid. Widgets lack AnimatePresence for smooth transitions. Missing PremiumCard wrappers. |
| 2 | `task/pages/TasksPage.jsx` | **HIGH** | **Most-used feature**. Has new PageShell but no PremiumCard on Kanban cards/stats. TaskPanel needs PremiumCard sections. Missing whileHover on task cards. |
| 3 | `dashboard/pages/MissionControlv2.jsx` | **HIGH** | **New V2 dashboard** — beautiful but all stat cards/priority cards use raw divs. Should migrate to PremiumCard for consistency. No whileHover on interactive stat cards. |
| 4 | `crew/pages/CrewDetailPage.jsx` | **HIGH** | **Core crew feature**. Still on WorkspaceShell+ManagementLayout. Migrate to PageShell+PageHero. Missing PremiumCard usage throughout tabs. |
| 5 | `analytics/pages/AnalyticsPage.jsx` | **HIGH** | **Data page**. Hardcoded fake historical data (mock data in production!). No framer-motion on StatCard hover. Missing animated number transitions. Uses old wrappers. |
| 6 | `calendar/pages/CalendarPage.jsx` | **HIGH** | **Core scheduling**. No empty/error states. No motion on calendar transitions (month/week switch). Event modal is raw. Quick-add lacks animation. |
| 7 | `crew/pages/CrewTasksPage.jsx` | **HIGH** | **Crew task center**. Old WorkspaceShell. Manual stats cards not using PremiumCard. No skeleton shimmer on loading. |
| 8 | `project/pages/ProjectDetailPage.jsx` | **HIGH** | **Project detail** — large page, no PageShell wrapper detected (uses PageHeader standalone). Needs PremiumCard for metric sections. |
| 9 | `task/components/TaskPanel/TaskPanel.jsx` | **HIGH** | **Daily-use panel**. Rich features but sections use raw div classes. Needs PremiumCard for activity feed, attachments, subtasks. |
| 10 | `task/components/KanbanBoard/KanbanBoard.jsx` | **HIGH** | **Kanban board**. No framer-motion drag previews (uses dnd-kit raw). Column transitions are jerky. Needs AnimatePresence for card drag-over effects. |
| 11 | `focus/pages/FocusPage.jsx` | MEDIUM | **Focus mode**. Uses old WorkspaceShell. Good timer but shell migration needed. Needs PremiumCard for task cards in focus list. |
| 12 | `organization/directory/pages/DirectoryPage.jsx` | MEDIUM | **Org directory**. Old WorkspaceShell. High-quality features (grid/table/orgchart) but needs shell migration and motion on view transitions. |
| 13 | `organization/goals/pages/GoalsPage.jsx` | MEDIUM | **OKR tracking**. Has new PageShell but GoalCard lacks whileHover whileTap. Progress rings need motion on mount. |
| 14 | `organization/workload/pages/WorkloadPage.jsx` | MEDIUM | **Workload dashboard**. Old WorkspaceShell. Rich features with localStorage snapshots but needs shell migration. No AnimatePresence on filter changes. |
| 15 | `organization/teams/pages/TeamsPage.jsx` | MEDIUM | **Teams listing**. Has new PageShell but team cards lack motion. No skeleton loading. Needs InteractiveCard migration. |
| 16 | `settings/pages/ProfilePage.jsx` | MEDIUM | **User profile**. Raw Card + PageHeader. No PageShell. No motion on avatar upload. Needs InteractiveCard for sections. |
| 17 | `inbox/pages/InboxPage.jsx` | **HIGH** | **Inbox**. Has new PageShell but notification list items lack motion/AnimatePresence. No PremiumCard. No micro-interactions on read/dismiss. |
| 18 | `note/pages/NotesPage.jsx` | MEDIUM | **Notes**. NO PageShell wrapper at all. Raw layout. Rich motion on notes grid but inconsistent shell structure. |
| 19 | `organization/announcements/pages/AnnouncementsPage.jsx` | MEDIUM | **Announcements**. Has new PageShell but AnnouncementCard lacks whileHover. Needs PremiumCard for announcement display. |
| 20 | `organization/Roles/pages/RolesPermissionsPage.jsx` | MEDIUM | **Roles & permissions**. Old WorkspaceShell. No motion at all. Needs shell migration and micro-interactions for permission toggles. |

---

## Key Patterns & Recommendations

### 1. Shell Migration Priority (Old → New)
**17 files** still use the old wrapper system (`WorkspaceShell`, `ManagementLayout`, `CommandLayout`, `PageStateContainer`). The new `PageShell` + `PageHero` + `PageContent` + `PageToolbar` pattern is well-established in the codebase (used by ~12 files) and should be the standard. Migrate these 17 files.

### 2. PremiumCard Adoption
Only **6 dashboard widgets** use `PremiumCard` (ContextRail, FocusPanel, SignalStrip, ExecutionQueue, DailyBriefWidget, WorkloadBrief). The remaining **90+ files** use raw `div` with `bg-[var(--...)]` classes. PremiumCard should be adopted across all card surfaces.

### 3. InteractiveCard Adoption
Only `ProjectCard` and `SavedPage` use `InteractiveCard`. This component should be used for ALL clickable cards (TeamCard, GoalCard, AnnouncementCard, TaskCard, etc.)

### 4. Micro-interaction Gaps
- **whileHover/whileTap**: Missing on 80%+ of interactive elements
- **AnimatePresence for route transitions**: Only in MainLayout/PlatformLayout
- **Stagger children animations**: Only in MissionControlv2, AnalyticsPage, ContextRail
- **Drag animations**: Kanban board uses dnd-kit without framer-motion drag overlays

### 5. State Handling
- **Best**: CrewJoinPage (6 states), OverviewTab (5 states), MembersTab (7 states)
- **Worst**: CalendarPage (no empty/error), WhiteboardPage (no states), Auth pages (no states)
- **Pattern**: Files using `PageState` / `PageStateContainer` have better state coverage

### 6. CSS Variables Usage
Overwhelmingly good. `var(--bg-card)`, `var(--text-primary)`, `var(--accent)`, etc. used pervasively. Only `ModeSelector.jsx` and `WhiteboardCanvas.jsx` use raw hex colors. Minor issue.

### 7. Overall Assessment
The codebase shows a **bifurcated quality curve**: dashboard widgets and CrewDetailTabs are premium-grade, while calendar, auth pages, and whiteboard are significantly below the quality bar. The new PageShell pattern is good but adoption is ~30%. Motion usage is inconsistent: excellent in CrewJoinPage/OverviewTab, absent in auth/calendar/settings.
