import React, { createContext, useContext, useState, useEffect, useMemo } from 'react';
import { useAuth } from '@/identity';
import { useOrganizations } from '@/organization';

const WorkspaceContext = createContext();

export const WorkspaceProvider = ({ children }) => {
  const { user } = useAuth();
  
  // 'PERSONAL', 'ORG', or 'CREWS'
  const [workspaceMode, setWorkspaceMode] = useState('PERSONAL');
  const [activeOrganization, setActiveOrganization] = useState(null);

  // TanStack Query handles caching, auto-fetching, and background updates!
  // We only enable the query if the user is authenticated.
  const { data: rawOrganizations, isLoading: loadingWorkspace } = useOrganizations({
    enabled: !!user
  });
  
  // Default to empty array if undefined/unauthenticated
  const organizations = useMemo(() => rawOrganizations || [], [rawOrganizations]);

  useEffect(() => {
    // If the user logs out, clean up local state
    if (!user) {
      queueMicrotask(() => {
        setWorkspaceMode('PERSONAL');
        setActiveOrganization(null);
      });
      return;
    }

    if (organizations.length > 0) {
      // Auto-select on first load if we don't have an active org
      if (!activeOrganization) {
        queueMicrotask(() => {
          setActiveOrganization(organizations[0]);
        });
      } else {
        const stillExists = organizations.find(org => org.id === activeOrganization.id);
        if (!stillExists) {
          queueMicrotask(() => {
            setWorkspaceMode('PERSONAL');
            setActiveOrganization(null);
          });
        } else {
          queueMicrotask(() => {
            setActiveOrganization(stillExists);
          });
        }
      }
    } else {
      if (activeOrganization) {
        queueMicrotask(() => {
          setWorkspaceMode('PERSONAL');
          setActiveOrganization(null);
        });
      }
    }
  }, [organizations, activeOrganization, user]);

  // If the user switches to ORG but has no org, fallback to PERSONAL
  useEffect(() => {
    if (workspaceMode === 'ORG' && organizations.length === 0) {
      queueMicrotask(() => {
        setWorkspaceMode('PERSONAL');
      });
    }
  }, [workspaceMode, organizations]);

  const value = {
    workspaceMode,
    setWorkspaceMode,
    activeOrganization,
    setActiveOrganization,
    organizations,
    loadingWorkspace
  };

  return (
    <WorkspaceContext.Provider value={value}>
      {children}
    </WorkspaceContext.Provider>
  );
};

export const useWorkspace = () => {
  const context = useContext(WorkspaceContext);
  if (context === undefined) {
    throw new Error('useWorkspace must be used within a WorkspaceProvider');
  }
  return context;
};
