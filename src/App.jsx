import React, { Suspense, lazy } from "react";
import { BrowserRouter as Router, Routes, Route, Navigate } from "react-router-dom";
import { AppProvider } from "@/app/providers/AppProvider";

import { AuthLayout } from "@/app/layouts/AuthLayout";
import { ProtectedRoute, PlatformRoute, TenantRoute } from "@/app/router/ProtectedRoute";
import { PublicRoute } from "@/app/router/PublicRoute";
import { RouteResolver } from "@/app/router/RouteResolver";
import { SessionExpiredListener } from "@/app/router/SessionExpiredListener";
import { MainLayout } from "@/app/layouts/MainLayout";
import { PlatformLayout } from "@/app/layouts/PlatformLayout";
import { RouteLoader } from "@/shared/ui/RouteLoader";

// Route-level code splitting
const UIDesignSystem = lazy(() => import("@/pages/ui"));
const LoginPage = lazy(() => import("@/pages/auth/LoginPage").then(m => ({ default: m.LoginPage })));
const RegisterPage = lazy(() => import("@/pages/auth/RegisterPage").then(m => ({ default: m.RegisterPage })));
const ForgotPasswordPage = lazy(() => import("@/pages/auth/ForgotPasswordPage").then(m => ({ default: m.ForgotPasswordPage })));
const ResetPasswordPage = lazy(() => import("@/pages/auth/ResetPasswordPage").then(m => ({ default: m.ResetPasswordPage })));
const VerifyEmailPage = lazy(() => import("@/pages/auth/VerifyEmailPage").then(m => ({ default: m.VerifyEmailPage })));
const SessionExpiredPage = lazy(() => import("@/pages/auth/SessionExpiredPage").then(m => ({ default: m.SessionExpiredPage })));
const DashboardPage = lazy(() => import("@/pages/workspace/DashboardPage").then(m => ({ default: m.DashboardPage })));
const TasksPage = lazy(() => import("@/pages/tasks/TasksPage").then(m => ({ default: m.TasksPage })));
const ProjectsPage = lazy(() => import("@/pages/projects/ProjectsPage").then(m => ({ default: m.ProjectsPage })));
const ProjectDetailPage = lazy(() => import("@/pages/projects/ProjectDetailPage").then(m => ({ default: m.ProjectDetailPage })));
const OrganizationsPage = lazy(() => import("@/pages/organizations/OrganizationsPage").then(m => ({ default: m.OrganizationsPage })));
const OrganizationSettingsPage = lazy(() => import("@/pages/organizations/OrganizationSettingsPage").then(m => ({ default: m.OrganizationSettingsPage })));
const DirectoryPage = lazy(() => import("@/pages/organizations/DirectoryPage").then(m => ({ default: m.DirectoryPage })));
const AnnouncementsPage = lazy(() => import("@/pages/organizations/AnnouncementsPage").then(m => ({ default: m.AnnouncementsPage })));
const CrewsPage = lazy(() => import("@/pages/crews/CrewsPage").then(m => ({ default: m.CrewsPage })));
const CrewDetailPage = lazy(() => import("@/pages/crews/CrewDetailPage").then(m => ({ default: m.CrewDetailPage })));
const CrewDiscoverPage = lazy(() => import("@/pages/crews/CrewDiscoverPage").then(m => ({ default: m.CrewDiscoverPage })));
const CrewTasksPage = lazy(() => import("@/pages/crews/CrewTasksPage").then(m => ({ default: m.CrewTasksPage })));
const TeamsPage = lazy(() => import("@/pages/teams/TeamsPage").then(m => ({ default: m.TeamsPage })));
const TeamDetailPage = lazy(() => import("@/pages/teams/TeamDetailPage").then(m => ({ default: m.TeamDetailPage })));
const CrewJoinPage = lazy(() => import("@/pages/crews/CrewJoinPage").then(m => ({ default: m.CrewJoinPage })));
const InboxPage = lazy(() => import("@/pages/inbox/InboxPage").then(m => ({ default: m.InboxPage })));
const AnalyticsPage = lazy(() => import("@/pages/analytics/AnalyticsPage").then(m => ({ default: m.AnalyticsPage })));

// Platform Pages
const PlatformDashboardPage = lazy(() => import("@/pages/platform/PlatformDashboardPage").then(m => ({ default: m.PlatformDashboardPage })));
const PlatformOrganizationsPage = lazy(() => import("@/pages/platform/PlatformOrganizationsPage").then(m => ({ default: m.PlatformOrganizationsPage })));
const PlatformUsersPage = lazy(() => import("@/pages/platform/PlatformUsersPage").then(m => ({ default: m.PlatformUsersPage })));
const PlatformMonitoringPage = lazy(() => import("@/pages/platform/PlatformMonitoringPage").then(m => ({ default: m.PlatformMonitoringPage })));
const PlatformAuditPage = lazy(() => import("@/pages/platform/PlatformAuditPage").then(m => ({ default: m.PlatformAuditPage })));
const PlatformSettingsPage = lazy(() => import("@/pages/platform/PlatformSettingsPage").then(m => ({ default: m.PlatformSettingsPage })));
const FocusPage = lazy(() => import("@/pages/focus/FocusPage").then(m => ({ default: m.FocusPage })));
const ProfilePage = lazy(() => import("@/pages/settings/ProfilePage").then(m => ({ default: m.ProfilePage })));
const SecurityPage = lazy(() => import("@/pages/settings/SecurityPage").then(m => ({ default: m.SecurityPage })));
const SessionsPage = lazy(() => import("@/pages/settings/SessionsPage").then(m => ({ default: m.SessionsPage })));
const CalendarPage = lazy(() => import("@/pages/calendar/CalendarPage").then(m => ({ default: m.CalendarPage })));
const NotesPage = lazy(() => import("@/pages/notes/NotesPage").then(m => ({ default: m.NotesPage })));
const SavedPage = lazy(() => import("@/pages/saved/SavedPage").then(m => ({ default: m.SavedPage })));
const WorkloadPage = lazy(() => import("@/pages/workload/WorkloadPage").then(m => ({ default: m.WorkloadPage })));
const GoalsPage = lazy(() => import("@/pages/goals/GoalsPage").then(m => ({ default: m.GoalsPage })));
const WhiteboardPage = lazy(() => import("@/pages/whiteboards/WhiteboardPage").then(m => ({ default: m.WhiteboardPage })));
const AcceptInvitePage = lazy(() => import("@/pages/organizations/AcceptInvitePage").then(m => ({ default: m.AcceptInvitePage })));

export default function App() {
  return (
    <Router>
      <SessionExpiredListener />
      <AppProvider>
        <Suspense fallback={<RouteLoader />}>
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
                  <Route path="organizations/:orgId" element={<OrganizationSettingsPage />} />
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
        </Suspense>
      </AppProvider>
    </Router>
  );
}