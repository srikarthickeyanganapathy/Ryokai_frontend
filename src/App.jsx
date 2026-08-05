import React, { Suspense, lazy } from "react";
import { BrowserRouter as Router, Routes, Route, Navigate } from "react-router-dom";
import { AppProvider } from "@/app/providers/AppProvider";
import { ErrorBoundary } from "@/app/providers/ErrorBoundary";
import { InspectorProvider } from "@/context/InspectorContext";

import { AuthLayout } from "@/app/layouts/AuthLayout";
import { ProtectedRoute, PlatformRoute, TenantRoute } from "@/app/router/ProtectedRoute";
import { PublicRoute } from "@/app/router/PublicRoute";
import { RouteResolver } from "@/app/router/RouteResolver";
import { SessionExpiredListener } from "@/app/router/SessionExpiredListener";
import { MainLayout } from "@/app/layouts/MainLayout";
import { PlatformLayout } from "@/app/layouts/PlatformLayout";
import { RouteLoader } from "@/shared/ui/RouteLoader";

// Route-level code splitting
const Loadable = (Component) => (props) => (
  <Suspense fallback={<RouteLoader />}>
    <Component {...props} />
  </Suspense>
);

const UIDesignSystem = Loadable(lazy(() => import("@/shared/styleguide")));
const LoginPage = Loadable(lazy(() => import("@/identity/pages/LoginPage").then(m => ({ default: m.LoginPage }))));
const RegisterPage = Loadable(lazy(() => import("@/identity/pages/RegisterPage").then(m => ({ default: m.RegisterPage }))));
const ForgotPasswordPage = Loadable(lazy(() => import("@/identity/pages/ForgotPasswordPage").then(m => ({ default: m.ForgotPasswordPage }))));
const ResetPasswordPage = Loadable(lazy(() => import("@/identity/pages/ResetPasswordPage").then(m => ({ default: m.ResetPasswordPage }))));
const VerifyEmailPage = Loadable(lazy(() => import("@/identity/pages/VerifyEmailPage").then(m => ({ default: m.VerifyEmailPage }))));
const SessionExpiredPage = Loadable(lazy(() => import("@/identity/pages/SessionExpiredPage").then(m => ({ default: m.SessionExpiredPage }))));
const DashboardPage = Loadable(lazy(() => import("@/dashboard/pages/DashboardPage").then(m => ({ default: m.DashboardPage }))));
const TasksPage = Loadable(lazy(() => import("@/task/pages/TasksPage").then(m => ({ default: m.TasksPage }))));
const ProjectsPage = Loadable(lazy(() => import("@/project/pages/ProjectsPage").then(m => ({ default: m.ProjectsPage }))));
const ProjectDetailPage = Loadable(lazy(() => import("@/project/pages/ProjectDetailPage").then(m => ({ default: m.ProjectDetailPage }))));
const OrganizationsPage = Loadable(lazy(() => import("@/organization/pages/OrganizationsPage").then(m => ({ default: m.OrganizationsPage }))));
const OrganizationAdministrationPage = Loadable(lazy(() => import("@/organization/pages/OrganizationAdministrationPage").then(m => ({ default: m.OrganizationAdministrationPage }))));
const DirectoryPage = Loadable(lazy(() => import("@/organization/directory/pages/DirectoryPage").then(m => ({ default: m.DirectoryPage }))));
const LeaveRequestsPage = Loadable(lazy(() => import("@/organization/pages/LeaveRequestsPage").then(m => ({ default: m.LeaveRequestsPage }))));
const RolesPermissionsPage = Loadable(lazy(() => import("@/organization/Roles/pages/RolesPermissionsPage").then(m => ({ default: m.RolesPermissionsPage }))));
const AnnouncementsPage = Loadable(lazy(() => import("@/organization/announcements/pages/AnnouncementsPage").then(m => ({ default: m.AnnouncementsPage }))));
const CrewsPage = Loadable(lazy(() => import("@/crew/pages/CrewsPage").then(m => ({ default: m.CrewsPage }))));
const CrewDetailPage = Loadable(lazy(() => import("@/crew/pages/CrewDetailPage").then(m => ({ default: m.CrewDetailPage }))));
const CrewDiscoverPage = Loadable(lazy(() => import("@/crew/pages/CrewDiscoverPage").then(m => ({ default: m.CrewDiscoverPage }))));
const CrewTasksPage = Loadable(lazy(() => import("@/crew/pages/CrewTasksPage").then(m => ({ default: m.CrewTasksPage }))));
const TeamsPage = Loadable(lazy(() => import("@/organization/teams/pages/TeamsPage").then(m => ({ default: m.TeamsPage }))));
const TeamDetailPage = Loadable(lazy(() => import("@/organization/teams/pages/TeamDetailPage").then(m => ({ default: m.TeamDetailPage }))));
const CrewJoinPage = Loadable(lazy(() => import("@/crew/pages/CrewJoinPage").then(m => ({ default: m.CrewJoinPage }))));
const InboxPage = Loadable(lazy(() => import("@/inbox/pages/InboxPage").then(m => ({ default: m.InboxPage }))));
const AnalyticsPage = Loadable(lazy(() => import("@/analytics/pages/AnalyticsPage").then(m => ({ default: m.AnalyticsPage }))));

// Platform Pages
const PlatformDashboardPage = Loadable(lazy(() => import("@/platform/admin/pages/PlatformDashboardPage").then(m => ({ default: m.PlatformDashboardPage }))));
const PlatformOrganizationsPage = Loadable(lazy(() => import("@/platform/admin/pages/PlatformOrganizationsPage").then(m => ({ default: m.PlatformOrganizationsPage }))));
const PlatformUsersPage = Loadable(lazy(() => import("@/platform/admin/pages/PlatformUsersPage").then(m => ({ default: m.PlatformUsersPage }))));
const PlatformMonitoringPage = Loadable(lazy(() => import("@/platform/admin/pages/PlatformMonitoringPage").then(m => ({ default: m.PlatformMonitoringPage }))));
const PlatformAuditPage = Loadable(lazy(() => import("@/platform/admin/pages/PlatformAuditPage").then(m => ({ default: m.PlatformAuditPage }))));
const PlatformSettingsPage = Loadable(lazy(() => import("@/platform/admin/pages/PlatformSettingsPage").then(m => ({ default: m.PlatformSettingsPage }))));
const FocusPage = Loadable(lazy(() => import("@/focus/pages/FocusPage").then(m => ({ default: m.FocusPage }))));
const ProfilePage = Loadable(lazy(() => import("@/settings/pages/ProfilePage").then(m => ({ default: m.ProfilePage }))));
const SecurityPage = Loadable(lazy(() => import("@/settings/pages/SecurityPage").then(m => ({ default: m.SecurityPage }))));
const SessionsPage = Loadable(lazy(() => import("@/settings/pages/SessionsPage").then(m => ({ default: m.SessionsPage }))));
const CalendarPage = Loadable(lazy(() => import("@/calendar/pages/CalendarPage").then(m => ({ default: m.CalendarPage }))));
const NotesPage = Loadable(lazy(() => import("@/note/pages/NotesPage").then(m => ({ default: m.NotesPage }))));
const SavedPage = Loadable(lazy(() => import("@/library/saved/pages/SavedPage").then(m => ({ default: m.SavedPage }))));
const WorkloadPage = Loadable(lazy(() => import("@/organization/workload/pages/WorkloadPage").then(m => ({ default: m.WorkloadPage }))));
const GoalsPage = Loadable(lazy(() => import("@/organization/goals/pages/GoalsPage").then(m => ({ default: m.GoalsPage }))));
const WhiteboardPage = Loadable(lazy(() => import("@/whiteboard/pages/WhiteboardPage").then(m => ({ default: m.WhiteboardPage }))));
const AcceptInvitePage = Loadable(lazy(() => import("@/organization/pages/AcceptInvitePage").then(m => ({ default: m.AcceptInvitePage }))));

export default function App() {
  return (
    <ErrorBoundary>
      <InspectorProvider>
        <AppProvider>
          <Router>
            <Routes>
              {/* Core Resolver */}
              <Route path="/" element={<RouteResolver />} />

              {/* Public Auth Routes */}
              <Route element={<PublicRoute />}>
                <Route element={<AuthLayout />}>
                  <Route path="/login" element={<LoginPage />} />
                  <Route path="/register" element={<RegisterPage />} />
                  <Route path="/forgot-password" element={<ForgotPasswordPage />} />
                  <Route path="/reset-password" element={<ResetPasswordPage />} />
                  <Route path="/verify-email" element={<VerifyEmailPage />} />
                  <Route path="/session-expired" element={<SessionExpiredPage />} />
                </Route>
              </Route>

              {/* Protected Routes */}
              <Route element={<ProtectedRoute />}>
                <Route path="/invite/accept/:token" element={<AcceptInvitePage />} />

                {/* PLATFORM APP (Control Plane) */}
                <Route path="/platform" element={<PlatformRoute />}>
                  <Route element={<PlatformLayout />}>
                    {/* Redirect /platform to /platform/dashboard */}
                    <Route index element={<Navigate to="/platform/dashboard" replace />} />

                    <Route path="dashboard" element={<PlatformDashboardPage />} />
                    <Route path="organizations" element={<PlatformOrganizationsPage />} />
                    <Route path="users" element={<PlatformUsersPage />} />
                    <Route path="monitoring" element={<PlatformMonitoringPage />} />
                    <Route path="audit" element={<PlatformAuditPage />} />
                    <Route path="health" element={<Navigate to="/platform/monitoring" replace />} />
                    <Route path="settings" element={<PlatformSettingsPage />} />
                  </Route>
                </Route>

                {/* TENANT APP (Data Plane) */}
                <Route path="/app" element={<TenantRoute />}>
                  <Route element={<MainLayout />}>
                    {/* Note: WorkspaceResolver handles organization selection within MainLayout context */}
                    <Route index element={<DashboardPage />} />
                    <Route path="tasks" element={<TasksPage />} />
                    <Route path="projects" element={<ProjectsPage />} />
                    <Route path="projects/:projectId" element={<ProjectDetailPage />} />
                    <Route path="organizations" element={<OrganizationsPage />} />
                    <Route path="organizations/:orgId" element={<OrganizationAdministrationPage />} />
                    <Route path="teams" element={<TeamsPage />} />
                    <Route path="organizations/:orgId/teams/:teamId" element={<TeamDetailPage />} />
                    <Route path="crews" element={<CrewsPage />} />
                    <Route path="crews/discover" element={<CrewDiscoverPage />} />
                    <Route path="crews/join" element={<CrewJoinPage />} />
                    <Route path="crews/:crewId" element={<CrewDetailPage />} />
                    <Route path="crews/:crewId/whiteboards/:boardId" element={<WhiteboardPage />} />
                    <Route path="analytics" element={<AnalyticsPage />} />
                    <Route path="focus" element={<FocusPage />} />
                    <Route path="inbox" element={<InboxPage />} />

                    {/* Settings Routes */}
                    <Route path="settings/profile" element={<ProfilePage />} />
                    <Route path="settings/security" element={<SecurityPage />} />
                    <Route path="settings/sessions" element={<SessionsPage />} />

                    {/* Keep legacy route for fallback if needed */}
                    <Route path="sessions" element={<Navigate to="/app/settings/sessions" replace />} />

                    {/* Personal workspace */}
                    <Route path="notes" element={<NotesPage />} />
                    <Route path="calendar" element={<CalendarPage />} />
                    <Route path="saved" element={<SavedPage />} />

                    {/* Organization workspace */}
                    <Route path="goals" element={<GoalsPage />} />
                    <Route path="directory" element={<DirectoryPage />} />
                    <Route path="leave-requests" element={<LeaveRequestsPage />} />
                    <Route path="roles-permissions" element={<RolesPermissionsPage />} />
                    <Route path="announcements" element={<AnnouncementsPage />} />
                    <Route path="workload" element={<WorkloadPage />} />

                    {/* Crews workspace */}
                    <Route path="crews/tasks" element={<CrewTasksPage />} />
                  </Route>
                </Route>

              </Route>

              {/* Design System Showcase */}
              <Route path="/ui" element={<UIDesignSystem />} />

              {/* Fallback routing */}
              <Route path="*" element={<Navigate to="/" replace />} />
            </Routes>
            <SessionExpiredListener />
          </Router>
        </AppProvider>
      </InspectorProvider>
    </ErrorBoundary>
  );
}