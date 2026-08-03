import React, { createContext, useContext, useState, useEffect, useMemo, useCallback, useRef } from 'react';
import { useAuth } from '@/identity';
import { useOrganizations } from '@/organization';
import { useCrews } from '@/crew';
import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query';
import { queryKeys } from '@/shared/api/queryKeys';
import { getWorkspaceMode, updateWorkspaceMode } from '@/platform/workspace/api/workspace.api';

const DEFAULT_WORKSPACE = {
  // Workspace Mode (Lens): Where you're working (PERSONAL, ORG, CREWS)
  workspaceMode: 'PERSONAL',
  setWorkspaceMode: () => {},
  
  // Operating Mode: How you're working (NORMAL, FOCUS, MEETING, etc.)
  operatingMode: 'NORMAL',
  setOperatingMode: () => {},
  
  activeOrganization: null,
  setActiveOrganization: () => {},
  activeCrew: null,
  setActiveCrew: () => {},
  organizations: [],
  crews: [],
  loadingWorkspace: false,
};

const WorkspaceContext = createContext(DEFAULT_WORKSPACE);

export const WorkspaceProvider = ({ children }) => {
  const { user } = useAuth();
  const queryClient = useQueryClient();
  
  // Workspace Mode (Lens)
  const [workspaceMode, setWorkspaceMode] = useState('PERSONAL');
  const [activeOrganization, setActiveOrganization] = useState(null);
  const [activeCrew, setActiveCrew] = useState(null);
  const prevWorkspaceMode = useRef(workspaceMode);

  // TanStack Query handles caching, auto-fetching, and background updates!
  const { data: rawOrganizations, isLoading: loadingWorkspace } = useOrganizations({
    enabled: !!user
  });
  
  const organizations = useMemo(() => rawOrganizations || [], [rawOrganizations]);

  // Fetch user's crews
  const { data: rawCrews } = useCrews({
    enabled: !!user
  });
  const crews = useMemo(() => rawCrews || [], [rawCrews]);

  // Operating Mode
  const { data: operatingMode = 'NORMAL' } = useQuery({
    queryKey: queryKeys.workspace.mode(),
    queryFn: getWorkspaceMode,
    enabled: !!user,
  });

  const modeMutation = useMutation({
    mutationFn: updateWorkspaceMode,
    onMutate: async (newMode) => {
      await queryClient.cancelQueries({ queryKey: queryKeys.workspace.mode() });
      const previousMode = queryClient.getQueryData(queryKeys.workspace.mode());
      queryClient.setQueryData(queryKeys.workspace.mode(), newMode);
      return { previousMode };
    },
    onError: (err, newMode, context) => {
      queryClient.setQueryData(queryKeys.workspace.mode(), context.previousMode);
    }
  });

  const setOperatingMode = useCallback((mode) => {
    modeMutation.mutate(mode);
  }, [modeMutation]);

  // ═══ Cache isolation: invalidate workspace-scoped queries on lens switch ═══
  useEffect(() => {
    if (prevWorkspaceMode.current !== workspaceMode) {
      // Invalidate workspace-scoped data so stale data doesn't leak
      queryClient.invalidateQueries({ queryKey: queryKeys.tasks.all });
      queryClient.invalidateQueries({ queryKey: queryKeys.notifications.all });
      queryClient.invalidateQueries({ queryKey: queryKeys.projects.all });
      queryClient.invalidateQueries({ queryKey: queryKeys.dashboard.all });
      queryClient.invalidateQueries({ queryKey: ['notifications', 'signals'] });
      prevWorkspaceMode.current = workspaceMode;
    }
  }, [workspaceMode, queryClient]);

  const prevOrgId = useRef(activeOrganization?.id);
  const prevCrewId = useRef(activeCrew?.id);

  // ═══ Cache isolation: invalidate workspace-scoped queries on org/crew switch ═══
  useEffect(() => {
    if (activeOrganization?.id !== prevOrgId.current || activeCrew?.id !== prevCrewId.current) {
      queryClient.invalidateQueries({ queryKey: queryKeys.tasks.all });
      queryClient.invalidateQueries({ queryKey: queryKeys.notifications.all });
      queryClient.invalidateQueries({ queryKey: queryKeys.projects.all });
      queryClient.invalidateQueries({ queryKey: queryKeys.dashboard.all });
      queryClient.invalidateQueries({ queryKey: ['notifications', 'signals'] });
      
      prevOrgId.current = activeOrganization?.id;
      prevCrewId.current = activeCrew?.id;
    }
  }, [activeOrganization?.id, activeCrew?.id, queryClient]);

  useEffect(() => {
    // If the user logs out, clean up local state
    if (!user) {
      queueMicrotask(() => {
        setWorkspaceMode('PERSONAL');
        setActiveOrganization(null);
        setActiveCrew(null);
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
        } else if (stillExists.id !== activeOrganization.id) {
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

  // ═══ Auto-select first crew when switching to CREWS mode ═══
  useEffect(() => {
    if (workspaceMode === 'CREWS' && crews.length > 0 && !activeCrew) {
      queueMicrotask(() => {
        setActiveCrew(crews[0]);
      });
    }
    // Validate activeCrew still exists
    if (workspaceMode === 'CREWS' && activeCrew) {
      const stillExists = crews.find(c => c.id === activeCrew.id);
      if (!stillExists && crews.length > 0) {
        queueMicrotask(() => setActiveCrew(crews[0]));
      } else if (!stillExists) {
        queueMicrotask(() => setActiveCrew(null));
      }
    }
    // Clear activeCrew when leaving CREWS mode
    if (workspaceMode !== 'CREWS' && activeCrew) {
      queueMicrotask(() => setActiveCrew(null));
    }
  }, [workspaceMode, crews, activeCrew]);

  // Allow users to switch to ORG or CREWS mode even if they have no orgs or crews yet
  // so they can access the 'Discover & Join' or 'Create' pages.
  /*
  useEffect(() => {
    if (workspaceMode === 'ORG' && organizations.length === 0) {
      queueMicrotask(() => {
        setWorkspaceMode('PERSONAL');
      });
    }
  }, [workspaceMode, organizations]);

  useEffect(() => {
    if (workspaceMode === 'CREWS' && crews.length === 0) {
      queueMicrotask(() => {
        setWorkspaceMode('PERSONAL');
      });
    }
  }, [workspaceMode, crews]);
  */

  const value = useMemo(() => ({
    workspaceMode,
    setWorkspaceMode,
    operatingMode,
    setOperatingMode,
    activeOrganization,
    setActiveOrganization,
    activeCrew,
    setActiveCrew,
    organizations,
    crews,
    loadingWorkspace
  }), [
    workspaceMode,
    setWorkspaceMode,
    operatingMode,
    setOperatingMode,
    activeOrganization,
    setActiveOrganization,
    activeCrew,
    setActiveCrew,
    organizations,
    crews,
    loadingWorkspace
  ]);

  return (
    <WorkspaceContext.Provider value={value}>
      {children}
    </WorkspaceContext.Provider>
  );
};

export const useWorkspace = () => {
  const context = useContext(WorkspaceContext);
  return context || DEFAULT_WORKSPACE;
};
