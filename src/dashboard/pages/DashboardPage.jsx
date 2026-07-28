import React from 'react';
import { DashboardRouter } from './DashboardRouter';

// DashboardPage is the stable entry point for the workspace root (/app).
// Here we can eventually add global dashboard analytics, feature flags, 
// onboarding checks, or logging before delegating to the router.
export function DashboardPage() {
  return (
    <DashboardRouter />
  );
}
