import React from "react";
import { BrowserRouter as Router, Routes, Route, Navigate } from "react-router-dom";
import { AppProvider } from "@/app/providers/AppProvider";
import UIDesignSystem from "@/pages/ui";

import { AuthLayout } from "@/app/layouts/AuthLayout";
import { ProtectedRoute } from "@/app/router/ProtectedRoute";
import { PublicRoute } from "@/app/router/PublicRoute";
import { LoginPage } from "@/pages/auth/LoginPage";
import { RegisterPage } from "@/pages/auth/RegisterPage";
import { ForgotPasswordPage } from "@/pages/auth/ForgotPasswordPage";
import { ResetPasswordPage } from "@/pages/auth/ResetPasswordPage";
import { VerifyEmailPage } from "@/pages/auth/VerifyEmailPage";
import { SessionExpiredPage } from "@/pages/auth/SessionExpiredPage";

import { MainLayout } from "@/app/layouts/MainLayout";
import { DashboardPage } from "@/pages/workspace/DashboardPage";
import { TasksPage } from "@/pages/tasks/TasksPage";
import { ProjectsPage } from "@/pages/projects/ProjectsPage";
import { ProjectDetailPage } from "@/pages/projects/projectdetailpage";
import { OrganizationsPage } from "@/pages/organizations/OrganizationsPage";
import { OrganizationDetailPage } from "@/pages/organizations/OrganizationDetailPage";
import { AnalyticsPage } from "@/pages/analytics/AnalyticsPage";
import { FocusPage } from "@/features/focus/pages/FocusPage";
import { SessionsPage } from "@/pages/settings/SessionsPage";

export default function App() {
  return (
    <Router>
      <AppProvider>
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
              <Route path="/app/analytics" element={<AnalyticsPage />} />
              <Route path="/app/focus" element={<FocusPage />} />
              <Route path="/app/sessions" element={<SessionsPage />} />
            </Route>
          </Route>

          {/* Phase 2: Design System Showcase */}
          <Route path="/ui" element={<UIDesignSystem />} />
          
          {/* Fallback routing */}
          <Route path="*" element={<Navigate to="/login" replace />} />
        </Routes>
      </AppProvider>
    </Router>
  );
}
