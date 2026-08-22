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

// ── Persistence ──────────────────────────────────────────────────────────────
// The workspace lens (mode + active org/crew) survives reloads so the sidebar
// and page content stay in sync with the URL. Cleared on logout.
const WORKSPACE_STORAGE_KEY = 'ryokai_workspace_context';
const VALID_MODES = ['PERSONAL', 'ORG', 'CREWS'];

function readPersistedWorkspace() {
  try {
    const raw = localStorage.getItem(WORKSPACE_STORAGE_KEY);
    if (!raw) return null;
    const parsed = JSON.parse(raw);
    if (!parsed || typeof parsed !== 'object') return null;
    return {
      workspaceMode: VALID_MODES.includes(parsed.workspaceMode) ? parsed.workspaceMode : 'PERSONAL',
      activeOrganizationId: parsed.activeOrganizationId ?? null,
      activeCrewId: parsed.activeCrewId ?? null,
    };
  } catch {
    return null;
  }
}

export const WorkspaceProvider = ({ children }) => {
  const { user } = useAuth();
  const queryClient = useQueryClient();

  // Workspace Mode (Lens)
  const [initialState] = useState(readPersistedWorkspace);
  const [workspaceMode, setWorkspaceMode] = useState(initialState?.workspaceMode || 'PERSONAL');
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

  const prevUserRef = useRef(undefined);

  useEffect(() => {
    // Clean up ONLY on a real logout transition (had a user, now none).
    // During boot `user` is null while the session restores — treating that
    // as logout wiped the persisted workspace and reset the lens to PERSONAL
    // on every reload.
    const hadUser = !!prevUserRef.current;
    prevUserRef.current = user;

    if (!user) {
      if (hadUser) {
        try { localStorage.removeItem(WORKSPACE_STORAGE_KEY); } catch { /* ignore */ }
        queueMicrotask(() => {
          setWorkspaceMode('PERSONAL');
          setActiveOrganization(null);
          setActiveCrew(null);
        });
      }
      return;
    }

    if (organizations.length > 0) {
      // Restore the persisted org on load; fall back to the first org
      if (!activeOrganization) {
        queueMicrotask(() => {
          const persistedOrg = initialState?.activeOrganizationId
            ? organizations.find(org => String(org.id) === String(initialState.activeOrganizationId))
            : null;
          setActiveOrganization(persistedOrg || organizations[0]);
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
  }, [organizations, activeOrganization, user, initialState]);

  // ═══ Auto-select first crew when switching to CREWS mode ═══
  useEffect(() => {
    if (workspaceMode === 'CREWS' && crews.length > 0 && !activeCrew) {
      queueMicrotask(() => {
        const persistedCrew = initialState?.activeCrewId
          ? crews.find(c => String(c.id) === String(initialState.activeCrewId))
          : null;
        setActiveCrew(persistedCrew || crews[0]);
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
  }, [workspaceMode, crews, activeCrew, initialState]);

  // ═══ Persist the active lens so reloads land back in the same workspace ═══
  useEffect(() => {
    if (!user) return;
    try {
      // While orgs/crews are still loading, keep the last persisted ids
      // instead of overwriting them with null.
      const prev = readPersistedWorkspace() || {};
      localStorage.setItem(WORKSPACE_STORAGE_KEY, JSON.stringify({
        workspaceMode,
        activeOrganizationId: activeOrganization?.id ?? prev.activeOrganizationId ?? null,
        activeCrewId: activeCrew?.id ?? prev.activeCrewId ?? null,
      }));
    } catch { /* localStorage unavailable */ }
  }, [user, workspaceMode, activeOrganization?.id, activeCrew?.id]);


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
