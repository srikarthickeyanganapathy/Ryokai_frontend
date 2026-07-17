import React, { createContext, useContext, useState, useEffect } from 'react';
import { useAuth } from '@/features/auth/hooks/useAuth';
import { useOrganizations } from '@/features/organizations/hooks/useOrganizations';

const WorkspaceContext = createContext();

export const WorkspaceProvider = ({ children }) => {
  const { user } = useAuth();
  
  // 'PERSONAL' or 'ORG'
  const [workspaceMode, setWorkspaceMode] = useState('PERSONAL');
  const [activeOrganization, setActiveOrganization] = useState(null);

  // TanStack Query handles caching, auto-fetching, and background updates!
  // We only enable the query if the user is authenticated.
  const { data: rawOrganizations, isLoading: loadingWorkspace } = useOrganizations({
    enabled: !!user
  });
  
  // Default to empty array if undefined/unauthenticated
  const organizations = rawOrganizations || [];

  useEffect(() => {
    // If the user logs out, clean up local state
    if (!user) {
      setWorkspaceMode('PERSONAL');
      setActiveOrganization(null);
      return;
    }

    if (organizations.length > 0) {
      // Auto-select on first load if we don't have an active org
      if (!activeOrganization) {
        // Optional: you could auto-switch to ORG mode here if desired:
        // setWorkspaceMode('ORG');
        setActiveOrganization(organizations[0]);
      } else {
        // SAFETY CHECK: Ensure the currently active organization still exists in the user's fetched list
        // This handles cases where the user leaves the org, or the org is deleted.
        const stillExists = organizations.find(org => org.id === activeOrganization.id);
        
        if (!stillExists) {
          // The org is gone! Downgrade them to personal space gracefully.
          setWorkspaceMode('PERSONAL');
          setActiveOrganization(null);
        } else {
          // The org still exists. Update the state just in case its name/details were updated.
          setActiveOrganization(stillExists);
        }
      }
    } else {
      // The user has 0 organizations. 
      // If they had one selected previously, clear it.
      if (activeOrganization) {
        setWorkspaceMode('PERSONAL');
        setActiveOrganization(null);
      }
    }
  }, [organizations, activeOrganization, user]);

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
