# Ryokai Frontend ↔ Backend Full-Stack Audit Report
## API Endpoints + UI Components, Pages & Workflows

> Complete audit comparing the frontend's **API services, hooks, components, pages, routes, and widgets** against the corrected backend blueprint (32 controllers, 305 Java files).

---

## Executive Summary

| Layer | Audited | Status |
|:---|:---:|:---|
| **API Services** (16 feature modules, ~90 endpoints) | ✅ | 5 critical mismatches in session controller path |
| **React Hooks** (14 hook files + 2 auth hooks) | ✅ | All hooks exist and wire to correct API functions |
| **Pages** (35 route-level pages) | ✅ | All routes in `App.jsx` resolve to real components |
| **Widgets** (30+ reusable UI widgets) | ✅ | Full task, crew, org, project, admin widget coverage |
| **Feature Components** (calendar, focus, whiteboard, analytics) | ✅ | All present with real implementations |
| **Shared UI Library** (32 component directories) | ✅ | Full design system |
| **Tri-Modal Workspace** (PERSONAL/ORG/CREWS) | ✅ | WorkspaceProvider + sidebar mode switching |
| **WebSocket (STOMP)** | ✅ | RealTimeProvider + WhiteboardCanvas |

---

## 1. Routing & Page Coverage

### All 35 Routes in [App.jsx](file:///c:/Users/SEC/OneDrive/Desktop/Project/Ryokai/Ryokai_frontend/src/App.jsx)

| Route | Page Component | Real? | Feature Coverage |
|:---|:---|:---:|:---|
| `/login` | `LoginPage` | ✅ | Full login form with validation |
| `/register` | `RegisterPage` | ✅ | Full registration form |
| `/forgot-password` | `ForgotPasswordPage` | ✅ | Email input + API call |
| `/reset-password` | `ResetPasswordPage` | ✅ | Token + new password form |
| `/verify-email` | `VerifyEmailPage` | ✅ | Token verification flow |
| `/session-expired` | `SessionExpiredPage` | ✅ | Redirect + messaging |
| `/app` | `DashboardPage` | ✅ | Stats, activity, widgets |
| `/app/tasks` | `TasksPage` (19KB) | ✅ | **Full**: list, table, kanban, create, state machine, filters |
| `/app/projects` | `ProjectsPage` | ✅ | List, create, share to crew |
| `/app/projects/:id` | `ProjectDetailPage` (18KB) | ✅ | Tasks, sharing, detail view |
| `/app/organizations` | `OrganizationsPage` | ✅ | List orgs, create org |
| `/app/organizations/:id` | `OrganizationSettingsPage` | ✅ | Members, teams, admin leave modal |
| `/app/teams` | `TeamsPage` | ✅ | List teams, create team |
| `/app/organizations/:orgId/teams/:teamId` | `TeamDetailPage` (23KB) | ✅ | **Full**: messages, tasks, projects, members, reassign |
| `/app/crews` | `CrewsPage` (10KB) | ✅ | List, create crew |
| `/app/crews/join` | `CrewJoinPage` | ✅ | Invite link acceptance |
| `/app/crews/:crewId` | `CrewDetailPage` (42KB) | ✅ | **Full**: members, channels, messages, tasks, projects, whiteboards, invite, leave, ownership transfer |
| `/app/crews/:crewId/whiteboards/:boardId` | `WhiteboardPage` | ✅ | Full-screen canvas with STOMP |
| `/app/crews/discover` | `CrewDiscoverPage` | ✅ | Search + join public crews |
| `/app/crews/tasks` | `CrewTasksPage` | ✅ | Crew-scoped task list |
| `/app/analytics` | `AnalyticsPage` (8KB) | ✅ | Stat cards, charts, trends |
| `/app/admin` | `AdminPage` (admin-only) | ✅ | Users tab, Roles & Permissions tab |
| `/app/focus` | `FocusPage` (11KB) | ✅ | Timer, task selection, history, state machine integration |
| `/app/inbox` | `InboxPage` (9KB) | ✅ | Notifications + org invite accept/decline |
| `/app/settings/profile` | `ProfilePage` | ✅ | Edit name, email, bio |
| `/app/settings/security` | `SecurityPage` | ✅ | Change password, logout-all |
| `/app/settings/sessions` | `SessionsPage` | ✅ | Active sessions, revoke |
| `/app/notes` | `NotesPage` (7KB) | ✅ | CRUD notes, color, pin |
| `/app/calendar` | `CalendarPage` | ✅ | MonthView/WeekView/MiniAgenda + event CRUD |
| `/app/saved` | `SavedPage` | ✅ | Bookmark list, unsave, navigate |
| `/app/goals` | `GoalsPage` (8KB) | ✅ | OKR list, create, update, progress tracking |
| `/app/directory` | `DirectoryPage` (13KB) | ✅ | **Full**: members tab, leave requests tab, org roles tab, invite |
| `/app/announcements` | `AnnouncementsPage` (9KB) | ✅ | Create, list, delete |
| `/app/workload` | `WorkloadPage` | ✅ | DataTable with member workload matrix |
| `/ui` | `UIDesignSystem` | ✅ | Design system showcase |

> [!NOTE]
> **Zero stub/placeholder pages found.** Every route resolves to a component with real data fetching, real hooks, and functional UI rendering.

---

## 2. Feature Module Full-Stack Traceability

Each feature needs all 4 layers: **API → Hook → Component/Widget → Page**

### ✅ Tasks (Complete Full Stack)

| Layer | File | Status |
|:---|:---|:---:|
| API | [task.api.js](file:///c:/Users/SEC/OneDrive/Desktop/Project/Ryokai/Ryokai_frontend/src/features/tasks/api/task.api.js) (219 lines) | ✅ 25 API functions |
| Hooks | [useTasks.js](file:///c:/Users/SEC/OneDrive/Desktop/Project/Ryokai/Ryokai_frontend/src/features/tasks/hooks/useTasks.js) (20KB) | ✅ All mutations + queries |
| Widgets | [TaskPanel](file:///c:/Users/SEC/OneDrive/Desktop/Project/Ryokai/Ryokai_frontend/src/widgets/tasks/TaskPanel.jsx), [TaskPanelExtras](file:///c:/Users/SEC/OneDrive/Desktop/Project/Ryokai/Ryokai_frontend/src/widgets/tasks/TaskPanelExtras.jsx), [KanbanBoard](file:///c:/Users/SEC/OneDrive/Desktop/Project/Ryokai/Ryokai_frontend/src/widgets/tasks/KanbanBoard.jsx), [TasksTable](file:///c:/Users/SEC/OneDrive/Desktop/Project/Ryokai/Ryokai_frontend/src/widgets/tasks/TasksTable.jsx), [TaskForm](file:///c:/Users/SEC/OneDrive/Desktop/Project/Ryokai/Ryokai_frontend/src/widgets/tasks/TaskForm.jsx), [TasksToolbar](file:///c:/Users/SEC/OneDrive/Desktop/Project/Ryokai/Ryokai_frontend/src/widgets/tasks/TasksToolbar.jsx), [BulkCreateTaskModal](file:///c:/Users/SEC/OneDrive/Desktop/Project/Ryokai/Ryokai_frontend/src/widgets/tasks/BulkCreateTaskModal.jsx), [ChecklistForm](file:///c:/Users/SEC/OneDrive/Desktop/Project/Ryokai/Ryokai_frontend/src/widgets/tasks/ChecklistForm.jsx), [NebulaView](file:///c:/Users/SEC/OneDrive/Desktop/Project/Ryokai/Ryokai_frontend/src/features/tasks/components/NebulaView.jsx), [TaskNebulaGraph](file:///c:/Users/SEC/OneDrive/Desktop/Project/Ryokai/Ryokai_frontend/src/features/tasks/components/TaskNebulaGraph.jsx) | ✅ 10 components |
| Pages | [TasksPage](file:///c:/Users/SEC/OneDrive/Desktop/Project/Ryokai/Ryokai_frontend/src/pages/tasks/TasksPage.jsx) (19KB) | ✅ |

**Task State Machine UI Coverage:**
| State Transition | Hook Used | Where in UI |
|:---|:---|:---|
| Complete personal | `useCompletePersonalTask` | TasksPage, FocusPage |
| Complete crew | `useCompleteCrewTask` | TasksPage, CrewDetailPage, CrewTasksPage, FocusPage, KanbanBoard |
| Submit for review | `useSubmitTask` | TasksPage, FocusPage, KanbanBoard |
| Approve | `useApproveTask` | TasksPage, KanbanBoard |
| Reject (with reason) | `useRejectTask` | TasksPage, KanbanBoard |
| Recall | `useRecallTask` | TasksPage, KanbanBoard |
| Claim | `useClaimTask` | CrewDetailPage, FocusPage |

> [!WARNING]
> **Missing from TaskPanel:** The slide-out [TaskPanel.jsx](file:///c:/Users/SEC/OneDrive/Desktop/Project/Ryokai/Ryokai_frontend/src/widgets/tasks/TaskPanel.jsx) displays task details (title, description, checklist, comments, evidence, dependencies, timeline) but has **no submit/approve/reject/recall/claim action buttons**. These state-machine transitions only exist in [TasksPage.jsx](file:///c:/Users/SEC/OneDrive/Desktop/Project/Ryokai/Ryokai_frontend/src/pages/tasks/TasksPage.jsx) (table row actions) and [KanbanBoard.jsx](file:///c:/Users/SEC/OneDrive/Desktop/Project/Ryokai/Ryokai_frontend/src/widgets/tasks/KanbanBoard.jsx) (column drop handlers). When a user opens the TaskPanel drawer, they cannot submit/approve/reject from there.

**Sub-features in TaskPanel/Extras:**
| Sub-feature | Component | Hook | API | Status |
|:---|:---|:---|:---|:---:|
| Checklist CRUD | TaskPanel | `useAddChecklistItem`, `useToggleChecklistItem`, `useDeleteChecklistItem` | POST/POST/DELETE | ✅ |
| Comments | TaskComments (TaskPanelExtras) | `useComments`, `useAddComment` | GET/POST | ✅ |
| Dependencies | TaskDependencies (TaskPanelExtras) | `useAddDependency`, `useRemoveDependency` | POST/DELETE | ✅ |
| Evidence | TaskEvidence (TaskPanelExtras) | `useEvidence`, `useAddEvidence`, `useDeleteEvidence` | GET/POST/DELETE | ✅ |
| Timeline/History | TaskTimeline (TaskPanelExtras) | `useTaskHistory` | GET | ✅ |
| Reassign | TaskPanel | `useReassignTask` | PUT | ✅ |
| Archive | TaskPanel | `useArchiveTask` | PUT | ✅ |
| Delete | TaskPanel | `useDeleteTask` | DELETE | ✅ |

---

### ✅ Crews (Complete Full Stack)

| Layer | File | Status |
|:---|:---|:---:|
| API | [crew.api.js](file:///c:/Users/SEC/OneDrive/Desktop/Project/Ryokai/Ryokai_frontend/src/features/crews/api/crew.api.js) (138 lines) | ✅ 22 API functions |
| Hooks | [useCrews.js](file:///c:/Users/SEC/OneDrive/Desktop/Project/Ryokai/Ryokai_frontend/src/features/crews/hooks/useCrews.js) (12KB) | ✅ |
| Pages | [CrewsPage](file:///c:/Users/SEC/OneDrive/Desktop/Project/Ryokai/Ryokai_frontend/src/pages/crews/CrewsPage.jsx), [CrewDetailPage](file:///c:/Users/SEC/OneDrive/Desktop/Project/Ryokai/Ryokai_frontend/src/pages/crews/CrewDetailPage.jsx) (42KB!), [CrewDiscoverPage](file:///c:/Users/SEC/OneDrive/Desktop/Project/Ryokai/Ryokai_frontend/src/pages/crews/CrewDiscoverPage.jsx), [CrewTasksPage](file:///c:/Users/SEC/OneDrive/Desktop/Project/Ryokai/Ryokai_frontend/src/pages/crews/CrewTasksPage.jsx), [CrewJoinPage](file:///c:/Users/SEC/OneDrive/Desktop/Project/Ryokai/Ryokai_frontend/src/pages/crews/CrewJoinPage.jsx) | ✅ 5 pages |

**Crew UI Feature Breakdown (all in CrewDetailPage):**
| Feature | UI Present | Hook |
|:---|:---:|:---|
| Members list | ✅ | `useCrewMembers` |
| Invite by email | ✅ | `useInviteCrewMember` |
| Create invite link | ✅ | `useCreateCrewInviteLink` |
| Accept invite | ✅ | `acceptInvite` in `crew.api.js` |
| Remove member | ✅ | `useRemoveCrewMember` |
| Leave crew | ✅ | `useLeaveCrew` |
| Transfer ownership | ✅ | `useTransferCrewOwnership` |
| Text channels CRUD | ✅ | `useCrewChannels`, `useCreateCrewChannel`, `useDeleteCrewChannel` |
| Channel messages | ✅ | `useChannelMessages`, `useSendChannelMessage` |
| Convert message → task | ✅ | `useConvertMessageToTask` |
| Create crew task | ✅ | `useCreateCrewTask` |
| Claim task | ✅ | `useClaimTask` |
| Complete crew task | ✅ | `useCompleteCrewTask` |
| Project sharing | ✅ | `useShareProjectWithCrew` |
| Project unsharing | ✅ | `useUnshareProjectFromCrew` |
| Whiteboard list | ✅ | `useWhiteboards` |
| Create whiteboard | ✅ | `useCreateWhiteboard` |
| Delete whiteboard | ✅ | `useDeleteWhiteboard` |

---

### ✅ Organizations (Complete Full Stack)

| Layer | File | Status |
|:---|:---|:---:|
| API | [organization.api.js](file:///c:/Users/SEC/OneDrive/Desktop/Project/Ryokai/Ryokai_frontend/src/features/organizations/api/organization.api.js) (183 lines), [announcement.api.js](file:///c:/Users/SEC/OneDrive/Desktop/Project/Ryokai/Ryokai_frontend/src/features/organizations/api/announcement.api.js) | ✅ 35+ API functions |
| Hooks | [useOrganizations.js](file:///c:/Users/SEC/OneDrive/Desktop/Project/Ryokai/Ryokai_frontend/src/features/organizations/hooks/useOrganizations.js) (16KB), [useAnnouncements.js](file:///c:/Users/SEC/OneDrive/Desktop/Project/Ryokai/Ryokai_frontend/src/features/organizations/hooks/useAnnouncements.js) | ✅ |
| Widgets | [InviteMemberModal](file:///c:/Users/SEC/OneDrive/Desktop/Project/Ryokai/Ryokai_frontend/src/widgets/organizations/InviteMemberModal.jsx), [CreateTeamModal](file:///c:/Users/SEC/OneDrive/Desktop/Project/Ryokai/Ryokai_frontend/src/widgets/organizations/CreateTeamModal.jsx), [ManageTeamMembersModal](file:///c:/Users/SEC/OneDrive/Desktop/Project/Ryokai/Ryokai_frontend/src/widgets/organizations/ManageTeamMembersModal.jsx), [OrgRolesTab](file:///c:/Users/SEC/OneDrive/Desktop/Project/Ryokai/Ryokai_frontend/src/widgets/organizations/OrgRolesTab.jsx), [LeaveRequestsTab](file:///c:/Users/SEC/OneDrive/Desktop/Project/Ryokai/Ryokai_frontend/src/widgets/organizations/LeaveRequestsTab.jsx), [AdminLeaveModal](file:///c:/Users/SEC/OneDrive/Desktop/Project/Ryokai/Ryokai_frontend/src/widgets/organizations/AdminLeaveModal.jsx), [OrganizationForm](file:///c:/Users/SEC/OneDrive/Desktop/Project/Ryokai/Ryokai_frontend/src/widgets/organizations/OrganizationForm.jsx) | ✅ 7 widgets |
| Pages | [OrganizationsPage](file:///c:/Users/SEC/OneDrive/Desktop/Project/Ryokai/Ryokai_frontend/src/pages/organizations/OrganizationsPage.jsx), [OrganizationSettingsPage](file:///c:/Users/SEC/OneDrive/Desktop/Project/Ryokai/Ryokai_frontend/src/pages/organizations/OrganizationSettingsPage.jsx), [DirectoryPage](file:///c:/Users/SEC/OneDrive/Desktop/Project/Ryokai/Ryokai_frontend/src/pages/organizations/DirectoryPage.jsx) (13KB), [AnnouncementsPage](file:///c:/Users/SEC/OneDrive/Desktop/Project/Ryokai/Ryokai_frontend/src/pages/organizations/AnnouncementsPage.jsx) (9KB) | ✅ 4 pages |

**Org UI Feature Breakdown:**
| Feature | Page/Widget | Status |
|:---|:---|:---:|
| Create organization | OrganizationsPage + OrganizationForm | ✅ |
| View org settings | OrganizationSettingsPage | ✅ |
| Invite members | InviteMemberModal (DirectoryPage) | ✅ |
| Create invite link | InviteMemberModal | ✅ |
| Accept/decline invites | InboxPage | ✅ |
| Accept invite by token | API only (`acceptInviteByToken`) | ✅ (API exists, no page/route) |
| Remove member | DirectoryPage | ✅ |
| Update member role | DirectoryPage (role dropdown) | ✅ |
| Create/manage roles | OrgRolesTab (DirectoryPage) | ✅ |
| Update role permissions | OrgRolesTab | ✅ |
| Create team | TeamsPage + CreateTeamModal | ✅ |
| Manage team members | ManageTeamMembersModal | ✅ |
| Team detail + messages | TeamDetailPage (23KB) | ✅ |
| Leave requests (view) | LeaveRequestsTab (DirectoryPage) | ✅ |
| Leave request approve/reject | LeaveRequestsTab | ✅ |
| Admin leave (file for employee) | AdminLeaveModal | ✅ |
| Announcements CRUD | AnnouncementsPage | ✅ |
| Workload matrix | WorkloadPage | ✅ |

> [!NOTE]
> **Team observers:** The API (`getTeamObservers`, `addTeamObserver`, `removeTeamObserver`) is fully wired in [organization.api.js](file:///c:/Users/SEC/OneDrive/Desktop/Project/Ryokai/Ryokai_frontend/src/features/organizations/api/organization.api.js#L169-L182), but **no component renders a UI for managing observers**. The ManageTeamMembersModal only manages regular team members. Observers are supported at the API layer but have no visible UI.

---

### ✅ Other Feature Modules (Complete)

| Feature | API | Hook | Component(s) | Page | Status |
|:---|:---|:---|:---|:---|:---:|
| **Goals/OKRs** | [goals.api.js](file:///c:/Users/SEC/OneDrive/Desktop/Project/Ryokai/Ryokai_frontend/src/features/goals/api/goals.api.js) | [useGoals.js](file:///c:/Users/SEC/OneDrive/Desktop/Project/Ryokai/Ryokai_frontend/src/features/goals/hooks/useGoals.js) | Inline in GoalsPage | [GoalsPage](file:///c:/Users/SEC/OneDrive/Desktop/Project/Ryokai/Ryokai_frontend/src/pages/goals/GoalsPage.jsx) (8KB) | ✅ |
| **Notes** | [notes.api.js](file:///c:/Users/SEC/OneDrive/Desktop/Project/Ryokai/Ryokai_frontend/src/features/notes/api/notes.api.js) | [useNotes.js](file:///c:/Users/SEC/OneDrive/Desktop/Project/Ryokai/Ryokai_frontend/src/features/notes/hooks/useNotes.js) | Inline in NotesPage | [NotesPage](file:///c:/Users/SEC/OneDrive/Desktop/Project/Ryokai/Ryokai_frontend/src/pages/notes/NotesPage.jsx) (7KB) | ✅ |
| **Focus/Timer** | [focus.api.js](file:///c:/Users/SEC/OneDrive/Desktop/Project/Ryokai/Ryokai_frontend/src/features/focus/api/focus.api.js) | [useFocus.js](file:///c:/Users/SEC/OneDrive/Desktop/Project/Ryokai/Ryokai_frontend/src/features/focus/hooks/useFocus.js) | [FocusTimer](file:///c:/Users/SEC/OneDrive/Desktop/Project/Ryokai/Ryokai_frontend/src/features/focus/components/FocusTimer.jsx), [FocusWidget](file:///c:/Users/SEC/OneDrive/Desktop/Project/Ryokai/Ryokai_frontend/src/features/focus/components/FocusWidget.jsx) | [FocusPage](file:///c:/Users/SEC/OneDrive/Desktop/Project/Ryokai/Ryokai_frontend/src/features/focus/pages/FocusPage.jsx) (11KB) | ✅ |
| **Calendar** | [calendar.api.js](file:///c:/Users/SEC/OneDrive/Desktop/Project/Ryokai/Ryokai_frontend/src/features/calendar/api/calendar.api.js) | [useCalendar.js](file:///c:/Users/SEC/OneDrive/Desktop/Project/Ryokai/Ryokai_frontend/src/features/calendar/hooks/useCalendar.js) | [CalendarView](file:///c:/Users/SEC/OneDrive/Desktop/Project/Ryokai/Ryokai_frontend/src/features/calendar/components/CalendarView.jsx), [MonthView](file:///c:/Users/SEC/OneDrive/Desktop/Project/Ryokai/Ryokai_frontend/src/features/calendar/components/MonthView.jsx), [WeekView](file:///c:/Users/SEC/OneDrive/Desktop/Project/Ryokai/Ryokai_frontend/src/features/calendar/components/WeekView.jsx), [EventForm](file:///c:/Users/SEC/OneDrive/Desktop/Project/Ryokai/Ryokai_frontend/src/features/calendar/components/EventForm.jsx), [MiniAgenda](file:///c:/Users/SEC/OneDrive/Desktop/Project/Ryokai/Ryokai_frontend/src/features/calendar/components/MiniAgenda.jsx) | [CalendarPage](file:///c:/Users/SEC/OneDrive/Desktop/Project/Ryokai/Ryokai_frontend/src/pages/calendar/CalendarPage.jsx) | ✅ |
| **Saved Items** | [saved.api.js](file:///c:/Users/SEC/OneDrive/Desktop/Project/Ryokai/Ryokai_frontend/src/features/saved/api/saved.api.js) | [useSaved.js](file:///c:/Users/SEC/OneDrive/Desktop/Project/Ryokai/Ryokai_frontend/src/features/saved/hooks/useSaved.js) | Inline in SavedPage | [SavedPage](file:///c:/Users/SEC/OneDrive/Desktop/Project/Ryokai/Ryokai_frontend/src/pages/saved/SavedPage.jsx) | ✅ |
| **Notifications** | [notification.api.js](file:///c:/Users/SEC/OneDrive/Desktop/Project/Ryokai/Ryokai_frontend/src/features/notifications/api/notification.api.js) | [useNotifications.js](file:///c:/Users/SEC/OneDrive/Desktop/Project/Ryokai/Ryokai_frontend/src/features/notifications/hooks/useNotifications.js) | Inline in InboxPage | [InboxPage](file:///c:/Users/SEC/OneDrive/Desktop/Project/Ryokai/Ryokai_frontend/src/pages/inbox/InboxPage.jsx) (9KB) | ✅ |
| **Whiteboards** | [whiteboard.api.js](file:///c:/Users/SEC/OneDrive/Desktop/Project/Ryokai/Ryokai_frontend/src/features/whiteboards/api/whiteboard.api.js) | [useWhiteboards.js](file:///c:/Users/SEC/OneDrive/Desktop/Project/Ryokai/Ryokai_frontend/src/features/whiteboards/hooks/useWhiteboards.js) | [WhiteboardCanvas](file:///c:/Users/SEC/OneDrive/Desktop/Project/Ryokai/Ryokai_frontend/src/features/whiteboards/components/WhiteboardCanvas.jsx) (STOMP draw + REST snapshot) | [WhiteboardPage](file:///c:/Users/SEC/OneDrive/Desktop/Project/Ryokai/Ryokai_frontend/src/pages/whiteboards/WhiteboardPage.jsx) | ✅ |
| **Dashboard** | [dashboard.api.js](file:///c:/Users/SEC/OneDrive/Desktop/Project/Ryokai/Ryokai_frontend/src/features/analytics/api/dashboard.api.js) | [useDashboard.js](file:///c:/Users/SEC/OneDrive/Desktop/Project/Ryokai/Ryokai_frontend/src/features/analytics/hooks/useDashboard.js) | [Charts](file:///c:/Users/SEC/OneDrive/Desktop/Project/Ryokai/Ryokai_frontend/src/features/analytics/components/Charts.jsx), [StatCard](file:///c:/Users/SEC/OneDrive/Desktop/Project/Ryokai/Ryokai_frontend/src/features/analytics/components/StatCard.jsx) | [AnalyticsPage](file:///c:/Users/SEC/OneDrive/Desktop/Project/Ryokai/Ryokai_frontend/src/pages/analytics/AnalyticsPage.jsx) + [DashboardPage](file:///c:/Users/SEC/OneDrive/Desktop/Project/Ryokai/Ryokai_frontend/src/pages/workspace/DashboardPage.jsx) | ✅ |
| **Workload** | [workload.api.js](file:///c:/Users/SEC/OneDrive/Desktop/Project/Ryokai/Ryokai_frontend/src/features/workload/api/workload.api.js) | [useWorkload.js](file:///c:/Users/SEC/OneDrive/Desktop/Project/Ryokai/Ryokai_frontend/src/features/workload/hooks/useWorkload.js) | DataTable (shared) | [WorkloadPage](file:///c:/Users/SEC/OneDrive/Desktop/Project/Ryokai/Ryokai_frontend/src/pages/workload/WorkloadPage.jsx) | ✅ |
| **Projects** | [projects/api/index.js](file:///c:/Users/SEC/OneDrive/Desktop/Project/Ryokai/Ryokai_frontend/src/features/projects/api/index.js) | [useProjects.js](file:///c:/Users/SEC/OneDrive/Desktop/Project/Ryokai/Ryokai_frontend/src/features/projects/hooks/useProjects.js) | [ProjectForm](file:///c:/Users/SEC/OneDrive/Desktop/Project/Ryokai/Ryokai_frontend/src/widgets/projects/ProjectForm.jsx), [ProjectCard](file:///c:/Users/SEC/OneDrive/Desktop/Project/Ryokai/Ryokai_frontend/src/widgets/projects/ProjectCard.jsx), [CrewProjectShareModal](file:///c:/Users/SEC/OneDrive/Desktop/Project/Ryokai/Ryokai_frontend/src/widgets/projects/CrewProjectShareModal.jsx) | [ProjectsPage](file:///c:/Users/SEC/OneDrive/Desktop/Project/Ryokai/Ryokai_frontend/src/pages/projects/ProjectsPage.jsx), [ProjectDetailPage](file:///c:/Users/SEC/OneDrive/Desktop/Project/Ryokai/Ryokai_frontend/src/pages/projects/ProjectDetailPage.jsx) (18KB) | ✅ |
| **Admin** | [admin.api.js](file:///c:/Users/SEC/OneDrive/Desktop/Project/Ryokai/Ryokai_frontend/src/features/admin/api/admin.api.js) | [useAdmin.js](file:///c:/Users/SEC/OneDrive/Desktop/Project/Ryokai/Ryokai_frontend/src/features/admin/hooks/useAdmin.js) | [RolesTab](file:///c:/Users/SEC/OneDrive/Desktop/Project/Ryokai/Ryokai_frontend/src/widgets/admin/RolesTab.jsx) | [AdminPage](file:///c:/Users/SEC/OneDrive/Desktop/Project/Ryokai/Ryokai_frontend/src/pages/admin/AdminPage.jsx) | ✅ |
| **User/Auth** | [auth.api.js](file:///c:/Users/SEC/OneDrive/Desktop/Project/Ryokai/Ryokai_frontend/src/features/auth/api/auth.api.js), [user.api.js](file:///c:/Users/SEC/OneDrive/Desktop/Project/Ryokai/Ryokai_frontend/src/features/auth/api/user.api.js) | useAuth, useUser, etc. | [LoginForm](file:///c:/Users/SEC/OneDrive/Desktop/Project/Ryokai/Ryokai_frontend/src/widgets/auth/LoginForm.jsx), [RegisterForm](file:///c:/Users/SEC/OneDrive/Desktop/Project/Ryokai/Ryokai_frontend/src/widgets/auth/RegisterForm.jsx), [ForgotPasswordForm](file:///c:/Users/SEC/OneDrive/Desktop/Project/Ryokai/Ryokai_frontend/src/widgets/auth/ForgotPasswordForm.jsx), [ResetPasswordForm](file:///c:/Users/SEC/OneDrive/Desktop/Project/Ryokai/Ryokai_frontend/src/widgets/auth/ResetPasswordForm.jsx) | 6 auth pages + 3 settings pages | ✅ |
| **Command Palette** | — | `useShortcuts` | [CommandMenu](file:///c:/Users/SEC/OneDrive/Desktop/Project/Ryokai/Ryokai_frontend/src/features/command-palette/CommandMenu.jsx) | Global | ✅ |

---

## 3. Tri-Modal Workspace Architecture

| Component | File | Status |
|:---|:---|:---:|
| Mode provider (PERSONAL/ORG/CREWS) | [WorkspaceProvider.jsx](file:///c:/Users/SEC/OneDrive/Desktop/Project/Ryokai/Ryokai_frontend/src/app/providers/WorkspaceProvider.jsx) | ✅ |
| Mode-aware sidebar navigation | [AppSidebar.jsx](file:///c:/Users/SEC/OneDrive/Desktop/Project/Ryokai/Ryokai_frontend/src/widgets/workspace/AppSidebar.jsx) | ✅ |
| Org switcher dropdown | AppSidebar (Select component) | ✅ |

**Sidebar Navigation per Mode:**
| Mode | Nav Items |
|:---|:---|
| **PERSONAL** | Dashboard, Inbox, Focus, Tasks, Projects, Notes, Calendar, Saved |
| **ORG** | Dashboard, Tasks, Projects, Teams, Goals & OKRs, Directory, Announcements, Workload, Analytics, Settings, Admin |
| **CREWS** | Crews, Discover & Join, All Crew Tasks, Projects |

✅ All mode-specific nav items map to real pages.

---

## 4. Shared Infrastructure

| Component | File | Status |
|:---|:---|:---:|
| STOMP WebSocket (notifications, whiteboard, force-disconnect) | [RealTimeProvider.jsx](file:///c:/Users/SEC/OneDrive/Desktop/Project/Ryokai/Ryokai_frontend/src/app/providers/RealTimeProvider.jsx) | ✅ |
| JWT token refresh (Web Locks API) | [api.js](file:///c:/Users/SEC/OneDrive/Desktop/Project/Ryokai/Ryokai_frontend/src/shared/api/api.js) | ✅ |
| RBAC permissions hook | [usePermissions.js](file:///c:/Users/SEC/OneDrive/Desktop/Project/Ryokai/Ryokai_frontend/src/shared/hooks/usePermissions.js) | ✅ |
| Protected/Admin routes | [ProtectedRoute.jsx](file:///c:/Users/SEC/OneDrive/Desktop/Project/Ryokai/Ryokai_frontend/src/app/router/ProtectedRoute.jsx) | ✅ |
| Theme provider | [ThemeProvider.jsx](file:///c:/Users/SEC/OneDrive/Desktop/Project/Ryokai/Ryokai_frontend/src/app/providers/ThemeProvider.jsx) | ✅ |
| Query keys (centralized) | [queryKeys.js](file:///c:/Users/SEC/OneDrive/Desktop/Project/Ryokai/Ryokai_frontend/src/shared/api/queryKeys.js) | ✅ |
| Session expired listener | [SessionExpiredListener.jsx](file:///c:/Users/SEC/OneDrive/Desktop/Project/Ryokai/Ryokai_frontend/src/app/router/SessionExpiredListener.jsx) | ✅ |
| Design system (32 components) | [shared/ui/](file:///c:/Users/SEC/OneDrive/Desktop/Project/Ryokai/Ryokai_frontend/src/shared/ui) | ✅ |
| Dashboard widgets (10 components) | [widgets/workspace/](file:///c:/Users/SEC/OneDrive/Desktop/Project/Ryokai/Ryokai_frontend/src/widgets/workspace) | ✅ |

---

## 5. 🔴 Issues Found

### Critical (API)
From the [previous API audit](file:///c:/Users/SEC/.gemini/antigravity-ide/brain/89d44dd7-001f-4875-8a89-97747bd5e44e/frontend_backend_audit.md):

| # | Issue | Impact |
|:---:|:---|:---|
| 1 | `POST /auth/logout` → should be `POST /session/logout` | 🔴 Token refresh loop, forced logouts |
| 2 | `POST /auth/logout-all` → should be `POST /session/logout-all` | 🔴 Security page broken |
| 3 | `GET /auth/verify-email` → should be `GET /session/verify-email` | 🔴 Email verification broken |
| 4 | `POST /auth/resend-verification` → should be `POST /session/resend-verification` | 🔴 Resend button broken |
| 5 | `POST /auth/refresh` → should be `POST /session/refresh` | 🔴 **All auth breaks** when tokens expire |

### Component Gaps

| # | Gap | Severity | Details |
|:---:|:---|:---:|:---|
| 6 | **TaskPanel** missing state-machine action buttons | 🟡 Medium | Users can only submit/approve/reject/recall/claim from the table/kanban views, not from the task detail drawer. This breaks the natural workflow for org tasks. |
| 7 | **Team Observers** — no UI to manage | 🟡 Low | API functions exist (`getTeamObservers`, `addTeamObserver`, `removeTeamObserver`) but no component renders them. Observers can only be managed via direct API calls. |
| 8 | **Project unshare** (via Project controller) — no UI | ⚪ Low | `DELETE /projects/{id}/share/crew` has no frontend function in `projectsApi`. Crew-side unshare works via `CrewDetailPage`, but the project owner can't unshare from the project detail view. |

---

## 6. Complete Component Inventory Summary

```
src/
├── app/
│   ├── layouts/          AuthLayout, MainLayout                    ✅
│   ├── providers/        AppProvider, RealTimeProvider,             ✅
│   │                     ThemeProvider, WorkspaceProvider
│   └── router/           ProtectedRoute, PublicRoute,              ✅
│                         SessionExpiredListener
├── features/
│   ├── admin/            api + hooks                               ✅
│   ├── analytics/        api + hooks + components (Charts, StatCard) ✅
│   ├── auth/             api + hooks + model (AuthContext)          ✅
│   ├── calendar/         api + hooks + components (5 components)    ✅
│   ├── command-palette/  CommandMenu                                ✅
│   ├── crews/            api + hooks                               ✅
│   ├── focus/            api + hooks + components + pages           ✅
│   ├── goals/            api + hooks                               ✅
│   ├── notes/            api + hooks                               ✅
│   ├── notifications/    api + hooks                               ✅
│   ├── organizations/    api (2 files) + hooks (2 files)           ✅
│   ├── projects/         api + hooks                               ✅
│   ├── saved/            api + hooks                               ✅
│   ├── tasks/            api + hooks + components (2 nebula views) ✅
│   ├── whiteboards/      api + hooks + components (WhiteboardCanvas) ✅
│   └── workload/         api + hooks                               ✅
├── pages/                35 page components                        ✅
├── shared/
│   ├── api/              api.js, queryClient.js, queryKeys.js      ✅
│   ├── hooks/            usePermissions, useShortcuts              ✅
│   ├── lib/              cn, status, priority                      ✅
│   └── ui/               32 design system components               ✅
└── widgets/
    ├── admin/            RolesTab                                  ✅
    ├── auth/             4 form components                         ✅
    ├── organizations/    7 modal/tab components                    ✅
    ├── projects/         3 components                              ✅
    ├── tasks/            10 components (panel, kanban, table, etc.) ✅
    └── workspace/        10 dashboard widgets + sidebar + topbar   ✅
```

**Total: 16 feature modules × (api + hooks) + 35 pages + 30+ widgets + 32 shared UI components + 5 providers + 3 router guards = fully functional frontend.**

---

## 7. Priority Action Items

| Priority | Action | Scope |
|:---:|:---|:---|
| 🔴 **P0** | Fix 5 session endpoint paths (`/auth/...` → `/session/...`) | [auth.api.js](file:///c:/Users/SEC/OneDrive/Desktop/Project/Ryokai/Ryokai_frontend/src/features/auth/api/auth.api.js), [api.js](file:///c:/Users/SEC/OneDrive/Desktop/Project/Ryokai/Ryokai_frontend/src/shared/api/api.js) |
| 🟡 **P1** | Add submit/approve/reject/recall/claim buttons to TaskPanel footer | [TaskPanel.jsx](file:///c:/Users/SEC/OneDrive/Desktop/Project/Ryokai/Ryokai_frontend/src/widgets/tasks/TaskPanel.jsx) |
| 🟡 **P2** | Add team observers UI (tab or section in ManageTeamMembersModal) | [ManageTeamMembersModal.jsx](file:///c:/Users/SEC/OneDrive/Desktop/Project/Ryokai/Ryokai_frontend/src/widgets/organizations/ManageTeamMembersModal.jsx) |
| ⚪ **P3** | Add `unshareToCrew` function in projectsApi + button in ProjectDetailPage | [projects/api/index.js](file:///c:/Users/SEC/OneDrive/Desktop/Project/Ryokai/Ryokai_frontend/src/features/projects/api/index.js), [ProjectDetailPage.jsx](file:///c:/Users/SEC/OneDrive/Desktop/Project/Ryokai/Ryokai_frontend/src/pages/projects/ProjectDetailPage.jsx) |
