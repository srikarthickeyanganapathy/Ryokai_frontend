import React, { Suspense, lazy } from "react";
import { BrowserRouter as Router, Routes, Route, Navigate } from "react-router-dom";
import { AppProvider } from "@/app/providers/AppProvider";

import { AuthLayout } from "@/app/layouts/AuthLayout";
import { ProtectedRoute, AdminRoute } from "@/app/router/ProtectedRoute";
import { PublicRoute } from "@/app/router/PublicRoute";
import { SessionExpiredListener } from "@/app/router/SessionExpiredListener";
import { MainLayout } from "@/app/layouts/MainLayout";
import { RouteLoader } from "@/shared/ui/RouteLoader";

// Route-level code splitting: each page ships as its own chunk instead of
// one ~1.5MB bundle, so first paint only pays for auth/shell + the current
// screen. Matches the "instant" feel of Linear/Vercel — nothing to do with
// visuals, purely load-time.
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
const ProjectDetailPage = lazy(() => import("@/pages/projects/projectdetailpage").then(m => ({ default: m.ProjectDetailPage })));
const OrganizationsPage = lazy(() => import("@/pages/organizations/OrganizationsPage").then(m => ({ default: m.OrganizationsPage })));
const OrganizationDetailPage = lazy(() => import("@/pages/organizations/OrganizationDetailPage").then(m => ({ default: m.OrganizationDetailPage })));
const CrewsPage = lazy(() => import("@/pages/crews/CrewsPage").then(m => ({ default: m.CrewsPage })));
const CrewDetailPage = lazy(() => import("@/pages/crews/CrewDetailPage").then(m => ({ default: m.CrewDetailPage })));
const CrewJoinPage = lazy(() => import("@/pages/crews/CrewJoinPage").then(m => ({ default: m.CrewJoinPage })));
const InboxPage = lazy(() => import("@/pages/inbox/InboxPage").then(m => ({ default: m.InboxPage })));
const AnalyticsPage = lazy(() => import("@/pages/analytics/AnalyticsPage").then(m => ({ default: m.AnalyticsPage })));
const AdminPage = lazy(() => import("@/pages/admin/AdminPage").then(m => ({ default: m.AdminPage })));
const FocusPage = lazy(() => import("@/features/focus/pages/FocusPage").then(m => ({ default: m.FocusPage })));
const ProfilePage = lazy(() => import("@/pages/settings/ProfilePage").then(m => ({ default: m.ProfilePage })));
const SecurityPage = lazy(() => import("@/pages/settings/SecurityPage").then(m => ({ default: m.SecurityPage })));
const SessionsPage = lazy(() => import("@/pages/settings/SessionsPage").then(m => ({ default: m.SessionsPage })));

export default function App() {
  return (
    <Router>
      <SessionExpiredListener />
      <AppProvider>
        <Suspense fallback={<RouteLoader />}>
          <Routes>
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

            {/* Protected App Routes */}
            <Route element={<ProtectedRoute />}>
              <Route element={<MainLayout />}>
                <Route path="/app" element={<DashboardPage />} />
                <Route path="/app/tasks" element={<TasksPage />} />
                <Route path="/app/projects" element={<ProjectsPage />} />
                <Route path="/app/projects/:projectId" element={<ProjectDetailPage />} />
                <Route path="/app/organizations" element={<OrganizationsPage />} />
                <Route path="/app/organizations/:orgId" element={<OrganizationDetailPage />} />
                <Route path="/app/crews" element={<CrewsPage />} />
                <Route path="/app/crews/join" element={<CrewJoinPage />} />
                <Route path="/app/crews/:crewId" element={<CrewDetailPage />} />
                <Route path="/app/analytics" element={<AnalyticsPage />} />
                <Route element={<AdminRoute />}>
                  <Route path="/app/admin" element={<AdminPage />} />
                </Route>
                <Route path="/app/focus" element={<FocusPage />} />

                <Route path="/app/inbox" element={<InboxPage />} />
                
                {/* Settings Routes */}
                <Route path="/app/settings/profile" element={<ProfilePage />} />
                <Route path="/app/settings/security" element={<SecurityPage />} />
                <Route path="/app/settings/sessions" element={<SessionsPage />} />
                
                {/* Keep legacy route for fallback if needed */}
                <Route path="/app/sessions" element={<Navigate to="/app/settings/sessions" replace />} />
              </Route>
            </Route>

            {/* Phase 2: Design System Showcase */}
            <Route path="/ui" element={<UIDesignSystem />} />

            {/* Fallback routing */}
            <Route path="*" element={<Navigate to="/login" replace />} />
          </Routes>
        </Suspense>
      </AppProvider>
    </Router>
  );
}