import React from 'react';
import { MissionControlPage } from './MissionControlPage';

// DashboardPage is the stable entry point for the workspace root (/app).
// Here we can eventually add global dashboard analytics, feature flags, 
// onboarding checks, or logging before delegating to the main page.
export function DashboardPage() {
  return (
    <MissionControlPage />
  );
}
