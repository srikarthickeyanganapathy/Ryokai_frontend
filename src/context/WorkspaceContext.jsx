import React, { createContext, useContext, useState, useEffect } from 'react';
import { useAuth } from '@/features/auth/hooks/useAuth';
import { getUserOrganizations } from '@/features/organizations/api/organization.api';

const WorkspaceContext = createContext();

export const WorkspaceProvider = ({ children }) => {
  const { user } = useAuth();
  
  // 'PERSONAL' or 'ORG'
  const [workspaceMode, setWorkspaceMode] = useState('PERSONAL');
  const [activeOrganization, setActiveOrganization] = useState(null);

  // We should also fetch the user's organizations to check if they have one
  const [organizations, setOrganizations] = useState([]);
  const [loadingWorkspace, setLoadingWorkspace] = useState(true);

  useEffect(() => {
    const fetchOrgs = async () => {
      if (!user) {
        setOrganizations([]);
        setLoadingWorkspace(false);
        return;
      }
      try {
        setLoadingWorkspace(true);
        const orgs = await getUserOrganizations();
        setOrganizations(orgs);
        // Auto-select org if user has one
        if (orgs.length > 0) {
          setActiveOrganization(orgs[0]);
          // Optional: setWorkspaceMode('ORG') if we want to default to org mode
        }
      } catch (error) {
        console.error('Failed to fetch orgs', error);
      } finally {
        setLoadingWorkspace(false);
      }
    };
    
    fetchOrgs();
  }, [user]);

  const value = {
    workspaceMode,
    setWorkspaceMode,
    activeOrganization,
    setActiveOrganization,
    organizations,
    setOrganizations,
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
