import { Suspense, lazy } from 'react'
import { RouteLoader } from '@/shared/ui/RouteLoader'
// Route-level code splitting
const Loadable = (Component) => (props) => (
  <Suspense fallback={<RouteLoader />}>
    <Component {...props} />
  </Suspense>
);

export const UIDesignSystem = Loadable(lazy(() => import("@/shared/styleguide")));
export const LandingPage = Loadable(lazy(() => import("@/landing/LandingPage").then(m => ({ default: m.LandingPage }))));
export const LoginPage = Loadable(lazy(() => import("@/identity/pages/LoginPage").then(m => ({ default: m.LoginPage }))));
export const RegisterPage = Loadable(lazy(() => import("@/identity/pages/RegisterPage").then(m => ({ default: m.RegisterPage }))));
export const ForgotPasswordPage = Loadable(lazy(() => import("@/identity/pages/ForgotPasswordPage").then(m => ({ default: m.ForgotPasswordPage }))));
export const ResetPasswordPage = Loadable(lazy(() => import("@/identity/pages/ResetPasswordPage").then(m => ({ default: m.ResetPasswordPage }))));
export const VerifyEmailPage = Loadable(lazy(() => import("@/identity/pages/VerifyEmailPage").then(m => ({ default: m.VerifyEmailPage }))));
export const SessionExpiredPage = Loadable(lazy(() => import("@/identity/pages/SessionExpiredPage").then(m => ({ default: m.SessionExpiredPage }))));
export const OAuthCallbackPage = Loadable(lazy(() => import("@/identity/pages/OAuthCallbackPage").then(m => ({ default: m.OAuthCallbackPage }))));
export const DashboardPage = Loadable(lazy(() => import("@/dashboard/pages/DashboardPage").then(m => ({ default: m.DashboardPage }))));
export const TasksPage = Loadable(lazy(() => import("@/task/pages/TasksPage").then(m => ({ default: m.TasksPage }))));
export const TaskDetailPage = Loadable(lazy(() => import("@/task/pages/TaskDetailPage").then(m => ({ default: m.default }))));
export const NebulaSpacePage = Loadable(lazy(() => import("@/task/pages/NebulaSpacePage").then(m => ({ default: m.NebulaSpacePage }))));
export const GithubPage = Loadable(lazy(() => import("@/github").then(m => ({ default: m.GithubPage }))));
export const ProjectsPage = Loadable(lazy(() => import("@/project/pages/ProjectsPage").then(m => ({ default: m.ProjectsPage }))));
export const ProjectDetailPage = Loadable(lazy(() => import("@/project/pages/ProjectDetailPage").then(m => ({ default: m.ProjectDetailPage }))));
export const OrganizationsPage = Loadable(lazy(() => import("@/organization/pages/OrganizationsPage").then(m => ({ default: m.OrganizationsPage }))));
export const OrganizationAdministrationPage = Loadable(lazy(() => import("@/organization/pages/OrganizationAdministrationPage").then(m => ({ default: m.OrganizationAdministrationPage }))));
export const DirectoryPage = Loadable(lazy(() => import("@/organization/directory/pages/DirectoryPage").then(m => ({ default: m.DirectoryPage }))));
export const LeaveRequestsPage = Loadable(lazy(() => import("@/organization/pages/LeaveRequestsPage").then(m => ({ default: m.LeaveRequestsPage }))));
export const RolesPermissionsPage = Loadable(lazy(() => import("@/organization/roles/pages/RolesPermissionsPage").then(m => ({ default: m.RolesPermissionsPage }))));
export const AnnouncementsPage = Loadable(lazy(() => import("@/organization/announcements/pages/AnnouncementsPage").then(m => ({ default: m.AnnouncementsPage }))));
export const CrewsPage = Loadable(lazy(() => import("@/crew/pages/CrewsPage").then(m => ({ default: m.CrewsPage }))));
export const CrewDetailPage = Loadable(lazy(() => import("@/crew/pages/CrewDetailPage").then(m => ({ default: m.CrewDetailPage }))));
export const CrewDiscoverPage = Loadable(lazy(() => import("@/crew/pages/CrewDiscoverPage").then(m => ({ default: m.CrewDiscoverPage }))));
export const CrewTasksPage = Loadable(lazy(() => import("@/crew/pages/CrewTasksPage").then(m => ({ default: m.CrewTasksPage }))));
export const TeamsPage = Loadable(lazy(() => import("@/organization/teams/pages/TeamsPage").then(m => ({ default: m.TeamsPage }))));
export const TeamDetailPage = Loadable(lazy(() => import("@/organization/teams/pages/TeamDetailPage").then(m => ({ default: m.TeamDetailPage }))));
export const CrewJoinPage = Loadable(lazy(() => import("@/crew/pages/CrewJoinPage").then(m => ({ default: m.CrewJoinPage }))));
export const InboxPage = Loadable(lazy(() => import("@/inbox/pages/InboxPage").then(m => ({ default: m.InboxPage }))));
export const AnalyticsPage = Loadable(lazy(() => import("@/analytics/pages/AnalyticsPage").then(m => ({ default: m.AnalyticsPage }))));

// Platform Pages
export const PlatformDashboardPage = Loadable(lazy(() => import("@/platform/admin/pages/PlatformDashboardPage").then(m => ({ default: m.PlatformDashboardPage }))));
export const PlatformOrganizationsPage = Loadable(lazy(() => import("@/platform/admin/pages/PlatformOrganizationsPage").then(m => ({ default: m.PlatformOrganizationsPage }))));
export const PlatformUsersPage = Loadable(lazy(() => import("@/platform/admin/pages/PlatformUsersPage").then(m => ({ default: m.PlatformUsersPage }))));
export const PlatformMonitoringPage = Loadable(lazy(() => import("@/platform/admin/pages/PlatformMonitoringPage").then(m => ({ default: m.PlatformMonitoringPage }))));
export const PlatformAuditPage = Loadable(lazy(() => import("@/platform/admin/pages/PlatformAuditPage").then(m => ({ default: m.PlatformAuditPage }))));
export const PlatformSettingsPage = Loadable(lazy(() => import("@/platform/admin/pages/PlatformSettingsPage").then(m => ({ default: m.PlatformSettingsPage }))));
export const FocusPage = Loadable(lazy(() => import("@/focus/pages/FocusPage").then(m => ({ default: m.FocusPage }))));
export const ProfilePage = Loadable(lazy(() => import("@/settings/pages/ProfilePage").then(m => ({ default: m.ProfilePage }))));
export const SecurityPage = Loadable(lazy(() => import("@/settings/pages/SecurityPage").then(m => ({ default: m.SecurityPage }))));
export const SessionsPage = Loadable(lazy(() => import("@/settings/pages/SessionsPage").then(m => ({ default: m.SessionsPage }))));
export const CalendarPage = Loadable(lazy(() => import("@/calendar/pages/CalendarPage").then(m => ({ default: m.CalendarPage }))));
export const NotesPage = Loadable(lazy(() => import("@/note/pages/NotesPage").then(m => ({ default: m.NotesPage }))));
export const SavedPage = Loadable(lazy(() => import("@/saved/pages/SavedPage").then(m => ({ default: m.SavedPage }))));
export const WorkloadPage = Loadable(lazy(() => import("@/organization/workload/pages/WorkloadPage").then(m => ({ default: m.WorkloadPage }))));
export const GoalsPage = Loadable(lazy(() => import("@/organization/goals/pages/GoalsPage").then(m => ({ default: m.GoalsPage }))));
export const WhiteboardPage = Loadable(lazy(() => import("@/whiteboard/pages/WhiteboardPage").then(m => ({ default: m.WhiteboardPage }))));
export const AcceptInvitePage = Loadable(lazy(() => import("@/organization/pages/AcceptInvitePage").then(m => ({ default: m.AcceptInvitePage }))));
